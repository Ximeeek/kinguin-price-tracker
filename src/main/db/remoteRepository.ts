import { PriceRepository, LocalSqliteRepository } from './repository';
import { Product, PriceSnapshot } from '../../shared/types';
import { Logger } from '../logger';

export class RemoteApiRepository implements PriceRepository {
  private baseUrl: string;
  private localRepo: LocalSqliteRepository;

  constructor(baseUrl: string, userDataPath: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.localRepo = new LocalSqliteRepository(userDataPath);
  }

  async init(): Promise<void> {
    Logger.info('RemoteRepo', `Initializing local persistence and remote connection to Backend API at: ${this.baseUrl}`);
    // 1. Initialize local SQLite first so local tracked products are loaded immediately
    await this.localRepo.init();

    // 2. Health check Remote API
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) {
        throw new Error(`Health check failed with status: ${res.status}`);
      }
      Logger.info('RemoteRepo', 'Backend API health check successful.');
    } catch (err: any) {
      Logger.error('RemoteRepo', `Failed to connect to Backend API: ${err.message}`);
      throw err;
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    const localProd = await this.localRepo.findProductById(id);
    if (localProd) return localProd;

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

    // 2. Sync to remote backend in background asynchronously
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
    const localHistory = await this.localRepo.getHistory(productId, since);

    const lastSync = this.lastHistorySyncMap.get(productId) || 0;
    const SIX_HOURS_MS = 6 * 3600 * 1000;
    const now = Date.now();

    // Trigger non-blocking background sync if cache is older than 6 hours or local history is empty
    if (now - lastSync > SIX_HOURS_MS || localHistory.length === 0) {
      this.lastHistorySyncMap.set(productId, now);
      this.syncRemoteHistory(productId, since).catch(err => {
        Logger.warn('RemoteRepo', `Background getHistory sync for ${productId} warning: ${err.message}`);
      });
    }

    // Return local history INSTANTLY (< 1ms)
    return localHistory;
  }

  private async syncRemoteHistory(productId: string, since?: Date): Promise<void> {
    try {
      let url = `${this.baseUrl}/products/${encodeURIComponent(productId)}/history`;
      if (since) {
        const sinceStr = since.toISOString().split('T')[0];
        url += `?since=${sinceStr}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
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
      Logger.warn('RemoteRepo', `Remote syncRemoteHistory fallback for ${productId}: ${err.message}`);
    }
  }

  async getLastCheckedAt(productId: string): Promise<Date | null> {
    return await this.localRepo.getLastCheckedAt(productId);
  }

  async listTrackedProducts(): Promise<Product[]> {
    // Return only products tracked locally by this user in SQLite
    return await this.localRepo.listTrackedProducts();
  }

  async deleteProduct(productId: string): Promise<void> {
    Logger.info('RemoteRepo', `Deleting product ID ${productId} from local SQLite DB.`);
    await this.localRepo.deleteProduct(productId);
  }
}
