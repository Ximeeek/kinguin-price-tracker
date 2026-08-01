import { ipcMain, shell, BrowserWindow } from 'electron';
import { PriceRepository } from './db/repository';
import { KinguinProductFetcher, parseKinguinUrl } from './services/kinguinFetcher';
import { TrendEngine } from './services/trendEngine';
import { AverageEngine } from './services/averageEngine';
import { generateDevMockProduct } from './services/mockDataGenerator';
import { AddProductResult, ProductDetailResponse, RefreshResult, TimePeriod, PriceSnapshot } from '../shared/types';
import { Logger } from './logger';

import { parseCustomDays } from '../shared/timeUtils';

const LOCAL_REFRESH_TTL_MS = 6 * 3600 * 1000; // 6 hours cache TTL for Phase 1 MVP
const IS_DEV = Boolean(process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === 'development');

function filterHistoryByPeriod(fullHistory: PriceSnapshot[], period: TimePeriod): PriceSnapshot[] {
  if (!fullHistory || fullHistory.length === 0) return [];
  const now = Date.now();
  const parsed = parseCustomDays(period);
  if (!isFinite(parsed.days)) {
    return fullHistory;
  }
  const periodDays = parsed.days > 0 ? parsed.days : 30;
  const cutoffTime = now - periodDays * 24 * 3600 * 1000;

  const filtered = fullHistory.filter((item) => new Date(item.checkedAt).getTime() >= cutoffTime);
  if (filtered.length === 0 && fullHistory.length > 0) {
    return [fullHistory[fullHistory.length - 1]];
  }
  return filtered;
}

export function setupIpcHandlers(repository: PriceRepository) {
  const fetcher = new KinguinProductFetcher();

  // Track / Add product by Kinguin URL
  ipcMain.handle('track-product', async (_, urlInput: string): Promise<AddProductResult> => {
    Logger.info('IPC', `[track-product] Method invoked for URL: "${urlInput}"`);

    // DEV ONLY: Support test commands (test1, test2, test3, test4, test5, test-all)
    if (IS_DEV && urlInput.trim().toLowerCase().startsWith('test')) {
      Logger.info('IPC', `[track-product] DEV MODE: Triggering test command "${urlInput}"`);
      const mockProduct = await generateDevMockProduct(urlInput, repository);
      if (mockProduct) {
        return {
          success: true,
          product: mockProduct
        };
      }
    }

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

    const fullHistory = await repository.getHistory(productId);
    const history = filterHistoryByPeriod(fullHistory, period);
    const currentPrice = fullHistory.length > 0 ? fullHistory[fullHistory.length - 1].price : (product.currentPrice || 0);
    const previousPrice = fullHistory.length > 1 ? fullHistory[fullHistory.length - 2].price : undefined;

    const trend = TrendEngine.analyze(fullHistory, product.firstTrackedAt);
    const average = AverageEngine.analyze(fullHistory, currentPrice, period);

    Logger.info('IPC', `[get-product-detail] Analysis complete. Trend: ${trend.label}, Average delta: ${average.label}`);

    return {
      product: { ...product, currentPrice, previousPrice },
      history,
      fullHistory,
      trend,
      average
    };
  });

  // Manual refresh of product price
  ipcMain.handle('refresh-product', async (_, productId: string): Promise<RefreshResult> => {
    Logger.info('IPC', `[refresh-product] Manual price refresh for ID: ${productId}`);
    const product = await repository.findProductById(productId);
    if (!product) return { success: false, error: 'Product not found' };

    let fetchError: string | null = null;

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
      fetchError = err.message || 'Could not fetch product details from Kinguin page.';
      await repository.updateProduct({
        id: product.id,
        status: 'unavailable'
      });
    }

    const history = await repository.getHistory(productId);
    const updatedProduct = await repository.findProductById(productId);
    if (!updatedProduct) return { success: false, error: fetchError || 'Product not found' };

    const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;
    const previousPrice = history.length > 1 ? history[history.length - 2].price : undefined;
    const trend = TrendEngine.analyze(history, updatedProduct.firstTrackedAt);
    const average = AverageEngine.analyze(history, currentPrice, 'month');

    const detail: ProductDetailResponse = {
      product: { ...updatedProduct, currentPrice, previousPrice },
      history,
      trend,
      average
    };

    if (fetchError) {
      return { success: false, error: fetchError, detail };
    }

    return { success: true, detail };
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

  // Window Controls
  ipcMain.handle('window-minimize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.handle('window-maximize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle('window-close', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });
}
