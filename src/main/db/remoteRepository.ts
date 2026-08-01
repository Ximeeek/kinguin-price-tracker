import { PriceRepository } from './repository';
import { Product, PriceSnapshot } from '../../shared/types';
import { Logger } from '../logger';

export class RemoteApiRepository implements PriceRepository {
  private baseUrl: string;
  private localProductsCache = new Map<string, Product>();
  private localHistoryCache = new Map<string, PriceSnapshot[]>();
  private removedProductIds = new Set<string>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async init(): Promise<void> {
    Logger.info('RemoteRepo', `Initializing connection to Backend API at: ${this.baseUrl}`);
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) {
        throw new Error(`Health check failed with status: ${res.status}`);
      }
      Logger.info('RemoteRepo', 'Backend API health check successful.');

      // Warm up local cache asynchronously
      this.refreshProductsFromRemote().catch(err => {
        Logger.warn('RemoteRepo', `Initial cache warm-up failed: ${err.message}`);
      });
    } catch (err: any) {
      Logger.error('RemoteRepo', `Failed to connect to Backend API: ${err.message}`);
      throw err;
    }
  }

  private async refreshProductsFromRemote(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/products`, {
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return;

    const data = await res.json();
    const remoteProducts: Product[] = data.products || [];

    for (const prod of remoteProducts) {
      if (!this.removedProductIds.has(prod.id)) {
        this.localProductsCache.set(prod.id, prod);
      }
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    if (this.removedProductIds.has(id)) return null;

    if (this.localProductsCache.has(id)) {
      return this.localProductsCache.get(id)!;
    }

    try {
      const res = await fetch(`${this.baseUrl}/products/${encodeURIComponent(id)}/history`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.product) {
        this.localProductsCache.set(id, data.product);
        if (data.history && Array.isArray(data.history)) {
          this.localHistoryCache.set(
            id,
            data.history.map((row: any) => ({
              productId: id,
              price: Number(row.avgPrice),
              checkedAt: row.lastCheckedAt || row.day
            }))
          );
        }
        return data.product;
      }
      return null;
    } catch (err: any) {
      Logger.warn('RemoteRepo', `findProductById failed for ${id}: ${err.message}`);
      return null;
    }
  }

  async createProduct(
    product: Omit<Product, 'currentPrice'> & { currentPrice?: number },
    force: boolean = false
  ): Promise<Product> {
    const nowIso = new Date().toISOString();
    const fullProduct: Product = {
      id: product.id,
      url: product.url,
      title: product.title,
      imageUrl: product.imageUrl || null,
      currency: product.currency || 'EUR',
      firstTrackedAt: product.firstTrackedAt || nowIso,
      lastCheckedAt: product.lastCheckedAt || nowIso,
      status: 'active',
      currentPrice: product.currentPrice
    };

    // 1. Instantly update local memory cache for sub-second UI rendering
    this.removedProductIds.delete(product.id);
    this.localProductsCache.set(product.id, fullProduct);

    if (product.currentPrice !== undefined) {
      const history = this.localHistoryCache.get(product.id) || [];
      const newSnapshot: PriceSnapshot = {
        productId: product.id,
        price: product.currentPrice,
        checkedAt: nowIso
      };
      history.push(newSnapshot);
      this.localHistoryCache.set(product.id, history);
    }

    // 2. Sync with remote backend in background asynchronously (non-blocking)
    this.syncProductToRemote(product, force).catch(err => {
      Logger.warn('RemoteRepo', `Async background sync warning for product ${product.id}: ${err.message}`);
    });

    // 3. Return product INSTANTLY (<0.01s)
    return fullProduct;
  }

  private async syncProductToRemote(
    product: Omit<Product, 'currentPrice'> & { currentPrice?: number },
    force: boolean = false
  ): Promise<void> {
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
        this.localProductsCache.set(product.id, data.product);
      }
    }
  }

  async updateProduct(product: Partial<Product> & { id: string }): Promise<void> {
    const existing = this.localProductsCache.get(product.id);
    if (existing) {
      const updated: Product = {
        ...existing,
        ...product
      };
      this.localProductsCache.set(product.id, updated);
      if (updated.url) {
        this.syncProductToRemote(updated, true).catch(() => {});
      }
    }
  }

  async addPriceSnapshot(productId: string, price: number, checkedAt: string): Promise<PriceSnapshot> {
    const snapshot: PriceSnapshot = {
      productId,
      price,
      checkedAt
    };

    const history = this.localHistoryCache.get(productId) || [];
    history.push(snapshot);
    this.localHistoryCache.set(productId, history);

    const existing = this.localProductsCache.get(productId);
    if (existing) {
      existing.currentPrice = price;
      existing.lastCheckedAt = checkedAt;
      this.localProductsCache.set(productId, existing);

      if (existing.url) {
        this.syncProductToRemote({ ...existing, currentPrice: price }, true).catch(() => {});
      }
    }

    return snapshot;
  }

  async getHistory(productId: string, since?: Date): Promise<PriceSnapshot[]> {
    if (this.localHistoryCache.has(productId)) {
      const cached = this.localHistoryCache.get(productId)!;
      if (!since) return cached;
      const cutoff = since.getTime();
      return cached.filter(s => new Date(s.checkedAt).getTime() >= cutoff);
    }

    try {
      let url = `${this.baseUrl}/products/${encodeURIComponent(productId)}/history`;
      if (since) {
        const sinceStr = since.toISOString().split('T')[0];
        url += `?since=${sinceStr}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return [];

      const data = await res.json();
      const historyRows = data.history || [];

      const snapshots = historyRows.map((row: any) => ({
        productId,
        price: Number(row.avgPrice),
        checkedAt: row.lastCheckedAt || row.day
      }));

      this.localHistoryCache.set(productId, snapshots);
      return snapshots;
    } catch {
      return [];
    }
  }

  async getLastCheckedAt(productId: string): Promise<Date | null> {
    const prod = this.localProductsCache.get(productId);
    if (prod && prod.lastCheckedAt) return new Date(prod.lastCheckedAt);
    return null;
  }

  async listTrackedProducts(): Promise<Product[]> {
    const list: Product[] = [];
    for (const [id, prod] of this.localProductsCache.entries()) {
      if (!this.removedProductIds.has(id)) {
        list.push(prod);
      }
    }

    // Refresh cache in background if empty
    if (list.length === 0) {
      this.refreshProductsFromRemote().catch(() => {});
    }

    return list;
  }

  async deleteProduct(productId: string): Promise<void> {
    Logger.info('RemoteRepo', `Removing product ID ${productId} from local UI view. (Data remains in Neon DB forever).`);
    this.removedProductIds.add(productId);
    this.localProductsCache.delete(productId);
    this.localHistoryCache.delete(productId);
    // DO NOT SEND DELETE REQUEST TO BACKEND. Product and history stay in Neon DB forever!
  }
}
