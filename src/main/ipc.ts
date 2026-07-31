import { ipcMain, shell } from 'electron';
import { PriceRepository } from './db/repository';
import { KinguinProductFetcher, parseKinguinUrl } from './services/kinguinFetcher';
import { TrendEngine } from './services/trendEngine';
import { AverageEngine } from './services/averageEngine';
import { AddProductResult, ProductDetailResponse, TimePeriod } from '../shared/types';
import { Logger } from './logger';

const LOCAL_REFRESH_TTL_MS = 6 * 3600 * 1000; // 6 hours cache TTL for Phase 1 MVP

export function setupIpcHandlers(repository: PriceRepository) {
  const fetcher = new KinguinProductFetcher();

  // Track / Add product by Kinguin URL
  ipcMain.handle('track-product', async (_, urlInput: string): Promise<AddProductResult> => {
    Logger.info('IPC', `[track-product] Method invoked for URL: "${urlInput}"`);

    try {
      const parsed = parseKinguinUrl(urlInput);
      if (!parsed) {
        Logger.warn('IPC', `[track-product] Invalid URL format: "${urlInput}"`);
        return {
          success: false,
          error: 'Provided link is not a valid Kinguin product URL.'
        };
      }

      // Check if product exists in local DB
      let product = await repository.findProductById(parsed.id);
      const nowIso = new Date().toISOString();

      if (!product) {
        Logger.info('IPC', `[track-product] New product (ID: ${parsed.id}). Fetching details from Kinguin...`);
        const fetched = await fetcher.fetchProduct(parsed.canonicalUrl);

        // Save new product record
        product = await repository.createProduct({
          id: fetched.id,
          url: fetched.canonicalUrl,
          title: fetched.title,
          imageUrl: fetched.imageUrl,
          currency: fetched.currency,
          firstTrackedAt: nowIso,
          lastCheckedAt: nowIso,
          status: 'active'
        });

        // Add initial price snapshot
        await repository.addPriceSnapshot(fetched.id, fetched.price, nowIso);
        Logger.info('IPC', `[track-product] Added new product to database! Title: "${fetched.title}"`);
      } else {
        Logger.info('IPC', `[track-product] Product already exists in database (ID: ${parsed.id}). Checking cache TTL...`);
        const lastChecked = product.lastCheckedAt ? new Date(product.lastCheckedAt).getTime() : 0;
        const now = Date.now();

        if (now - lastChecked > LOCAL_REFRESH_TTL_MS) {
          Logger.info('IPC', `[track-product] Cache expired (> 6h). Refreshing price for ID: ${parsed.id}...`);
          try {
            const fetched = await fetcher.fetchProduct(product.url);
            await repository.updateProduct({
              id: product.id,
              title: fetched.title,
              imageUrl: fetched.imageUrl || product.imageUrl,
              lastCheckedAt: nowIso,
              status: 'active'
            });
            await repository.addPriceSnapshot(product.id, fetched.price, nowIso);
          } catch (err: any) {
            Logger.warn('IPC', `[track-product] Background refresh failed: ${err.message}`);
          }
        } else {
          Logger.info('IPC', `[track-product] Database data is up-to-date (refreshed less than 6h ago).`);
        }
      }

      const updatedProduct = await repository.findProductById(parsed.id);
      return {
        success: true,
        product: updatedProduct || undefined
      };
    } catch (err: any) {
      Logger.error('IPC', `[track-product] Operation error: ${err.message}`, err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while adding the product.'
      };
    }
  });

  // Get list of all tracked products
  ipcMain.handle('get-products', async () => {
    Logger.info('IPC', '[get-products] Fetching tracked product list from database');
    const products = await repository.listTrackedProducts();
    Logger.info('IPC', `[get-products] Found ${products.length} products in database`);
    return products;
  });

  // Get detail analysis for a single product
  ipcMain.handle('get-product-detail', async (_, productId: string, period: TimePeriod = 'month'): Promise<ProductDetailResponse | null> => {
    Logger.info('IPC', `[get-product-detail] Fetching analysis for product ID: ${productId}, Period: ${period}`);
    const product = await repository.findProductById(productId);
    if (!product) {
      Logger.warn('IPC', `[get-product-detail] Product ID: ${productId} does not exist`);
      return null;
    }

    const history = await repository.getHistory(productId);
    const currentPrice = history.length > 0 ? history[history.length - 1].price : (product.currentPrice || 0);

    const trend = TrendEngine.analyze(history, product.firstTrackedAt);
    const average = AverageEngine.analyze(history, currentPrice, period);

    Logger.info('IPC', `[get-product-detail] Analysis complete. Trend: ${trend.label}, Average delta: ${average.label}`);

    return {
      product: { ...product, currentPrice },
      history,
      trend,
      average
    };
  });

  // Manual refresh of product price
  ipcMain.handle('refresh-product', async (_, productId: string): Promise<ProductDetailResponse | null> => {
    Logger.info('IPC', `[refresh-product] Manual price refresh for ID: ${productId}`);
    const product = await repository.findProductById(productId);
    if (!product) return null;

    try {
      const fetched = await fetcher.fetchProduct(product.url);
      const nowIso = new Date().toISOString();

      await repository.updateProduct({
        id: product.id,
        title: fetched.title,
        imageUrl: fetched.imageUrl || product.imageUrl,
        lastCheckedAt: nowIso,
        status: 'active'
      });

      await repository.addPriceSnapshot(product.id, fetched.price, nowIso);
      Logger.info('IPC', `[refresh-product] Price updated in database: ${fetched.price} ${fetched.currency}`);
    } catch (err: any) {
      Logger.error('IPC', `[refresh-product] Refresh error: ${err.message}`);
      await repository.updateProduct({
        id: product.id,
        status: 'unavailable'
      });
    }

    const history = await repository.getHistory(productId);
    const updatedProduct = await repository.findProductById(productId);
    if (!updatedProduct) return null;

    const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;
    const trend = TrendEngine.analyze(history, updatedProduct.firstTrackedAt);
    const average = AverageEngine.analyze(history, currentPrice, 'month');

    return {
      product: { ...updatedProduct, currentPrice },
      history,
      trend,
      average
    };
  });

  // Delete tracked product
  ipcMain.handle('delete-product', async (_, productId: string) => {
    Logger.info('IPC', `[delete-product] Deleting product ID: ${productId}`);
    await repository.deleteProduct(productId);
    Logger.info('IPC', `[delete-product] Deleted product ID: ${productId}`);
    return true;
  });

  // Safe external URL opening
  ipcMain.handle('open-external', async (_, url: string) => {
    Logger.info('IPC', `[open-external] Opening link in external browser: ${url}`);
    if (url.startsWith('https://') || url.startsWith('http://')) {
      await shell.openExternal(url);
    }
  });
}
