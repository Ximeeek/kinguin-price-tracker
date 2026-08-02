import { PriceRepository, LocalSqliteRepository } from './repository';
import { Product, PriceSnapshot } from '../../shared/types';
import { Logger } from '../logger';

export class RemoteApiRepository implements PriceRepository {
  private baseUrl: string;
  private localRepo: LocalSqliteRepository;
  private isBackendOnline: boolean = false;
  private retryIntervalTimer: NodeJS.Timeout | null = null;

  constructor(baseUrl: string, userDataPath: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.localRepo = new LocalSqliteRepository(userDataPath);
  }

  public isOnline(): boolean {
    return this.isBackendOnline;
  }

  async init(): Promise<void> {
    Logger.info('RemoteRepo', `Initializing local persistence and remote connection to Backend API at: ${this.baseUrl}`);
    // 1. Initialize local SQLite first so local tracked products are loaded immediately
    await this.localRepo.init();

    // 2. Initial health check Remote API (give 6s for quick check)
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        this.isBackendOnline = true;
        Logger.info('RemoteRepo', 'Backend API health check successful. Connected to remote server.');
        // Initial background sync for tracked products
        this.syncAllProductsRemoteHistory().catch(() => {});
        return;
      }
      throw new Error(`Health check returned HTTP ${res.status}`);
    } catch (err: any) {
      this.isBackendOnline = false;
      Logger.warn(
        'RemoteRepo',
        `Backend API not available immediately (${err.message}). Starting background retry loop to await server cold-start.`
      );
      // Start non-blocking background retry loop (Render free tier cold start takes 30-40s)
      this.startBackgroundHealthRetry();
    }
  }

  private startBackgroundHealthRetry(): void {
    if (this.retryIntervalTimer) return;

    let attempts = 0;
    const maxAttempts = 20; // 20 * 4s = 80 seconds max retry window for cold start

    this.retryIntervalTimer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${this.baseUrl}/health`, {
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          this.isBackendOnline = true;
          Logger.info('RemoteRepo', `Backend API is now ONLINE after ${attempts} background retries! Syncing data...`);
          if (this.retryIntervalTimer) {
            clearInterval(this.retryIntervalTimer);
            this.retryIntervalTimer = null;
          }
          await this.syncAllProductsRemoteHistory();
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          Logger.warn('RemoteRepo', `Background retry loop exhausted after ${maxAttempts} attempts.`);
          if (this.retryIntervalTimer) {
            clearInterval(this.retryIntervalTimer);
            this.retryIntervalTimer = null;
          }
        }
      }
    }, 4000);
  }

  private async syncAllProductsRemoteHistory(): Promise<void> {
    try {
      const products = await this.localRepo.listTrackedProducts();
      for (const prod of products) {
        await this.syncRemoteHistory(prod.id);
      }
    } catch (err: any) {
      Logger.warn('RemoteRepo', `syncAllProductsRemoteHistory warning: ${err.message}`);
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    const localProd = await this.localRepo.findProductById(id);
    if (localProd) return localProd;

    if (!this.isBackendOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/products/${encodeURIComponent(id)}/history`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.status === 404 || !res.ok) return null;

      const data = await res.json();
      return data.product || null;
    } catch (err: any) {
      Logger.warn('RemoteRepo', `findProductById failed for ${id}: ${err.message}`);
      return null;
    }
  }

  async createProduct(
    product: Omit<Product, 'currentPrice'> & { currentPrice?: number },
    force: boolean = false
  ): Promise<Product> {
    // 1. Save locally to SQLite so it persists across app restarts for this user
    const created = await this.localRepo.createProduct(product);

    // 2. Sync to remote backend in background asynchronously if online
    this.syncProductToRemote(product, force).catch(err => {
      Logger.warn('RemoteRepo', `Async background sync warning for product ${product.id}: ${err.message}`);
    });

    return created;
  }

  private async syncProductToRemote(
    product: Omit<Product, 'currentPrice'> & { currentPrice?: number },
    force: boolean = false
  ): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: product.url,
          title: product.title,
          imageUrl: product.imageUrl,
          currency: product.currency,
          price: product.currentPrice,
          force
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          await this.localRepo.updateProduct({
            id: product.id,
            title: data.product.title,
            imageUrl: data.product.imageUrl || product.imageUrl
          });
        }
      }
    } catch (err: any) {
      Logger.warn('RemoteRepo', `syncProductToRemote failed for ${product.id}: ${err.message}`);
    }
  }

  async updateProduct(product: Partial<Product> & { id: string }): Promise<void> {
    await this.localRepo.updateProduct(product);
    const updated = await this.localRepo.findProductById(product.id);
    if (updated && updated.url) {
      this.syncProductToRemote(updated, true).catch(() => {});
    }
  }

  async addPriceSnapshot(productId: string, price: number, checkedAt: string): Promise<PriceSnapshot> {
    const snapshot = await this.localRepo.addPriceSnapshot(productId, price, checkedAt);
    const prod = await this.localRepo.findProductById(productId);
    if (prod && prod.url) {
      this.syncProductToRemote({ ...prod, currentPrice: price }, true).catch(() => {});
    }
    return snapshot;
  }

  private lastHistorySyncMap = new Map<string, number>();

  async getHistory(productId: string, since?: Date): Promise<PriceSnapshot[]> {
    // 1. Trigger background or synchronous remote history sync if online
    const lastSync = this.lastHistorySyncMap.get(productId) || 0;
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const now = Date.now();

    if (now - lastSync > FIVE_MINUTES_MS) {
      this.lastHistorySyncMap.set(productId, now);
      await this.syncRemoteHistory(productId, since);
    }

    // 2. Always return merged history from local SQLite backup!
    return await this.localRepo.getHistory(productId, since);
  }

  private async syncRemoteHistory(productId: string, since?: Date): Promise<void> {
    try {
      let url = `${this.baseUrl}/products/${encodeURIComponent(productId)}/history`;
      if (since) {
        const sinceStr = since.toISOString().split('T')[0];
        url += `?since=${sinceStr}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const remoteHistoryRows = data.history || [];
        if (Array.isArray(remoteHistoryRows) && remoteHistoryRows.length > 0) {
          const currentLocal = await this.localRepo.getHistory(productId);
          for (const row of remoteHistoryRows) {
            const price = Number(row.avgPrice);
            const checkedAt = row.lastCheckedAt || row.day;
            if (price > 0 && checkedAt) {
              const dateKey = checkedAt.substring(0, 10);
              const exists = currentLocal.some(
                s => s.checkedAt.substring(0, 10) === dateKey
              );
              if (!exists) {
                await this.localRepo.addPriceSnapshot(productId, price, checkedAt);
              }
            }
          }
        }
      }
    } catch (err: any) {
      Logger.warn('RemoteRepo', `syncRemoteHistory warning for ${productId}: ${err.message}`);
    }
  }

  async getLastCheckedAt(productId: string): Promise<Date | null> {
    return await this.localRepo.getLastCheckedAt(productId);
  }

  async listTrackedProducts(): Promise<Product[]> {
    // Return products tracked locally by this user in SQLite
    return await this.localRepo.listTrackedProducts();
  }

  async deleteProduct(productId: string): Promise<void> {
    Logger.info('RemoteRepo', `Deleting product ID ${productId} from local SQLite DB only.`);
    // Delete ONLY from local SQLite DB. Online backend database retains historical data.
    await this.localRepo.deleteProduct(productId);
  }
}
