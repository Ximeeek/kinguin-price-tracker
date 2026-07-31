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
    Logger.info('IPC', `[track-product] Wywołanie metody dla URL: "${urlInput}"`);

    try {
      const parsed = parseKinguinUrl(urlInput);
      if (!parsed) {
        Logger.warn('IPC', `[track-product] Nieprawidłowy format URL: "${urlInput}"`);
        return {
          success: false,
          error: 'Wprowadzony link nie jest prawidłowym linkiem do produktu Kinguin.'
        };
      }

      // Check if product exists in local DB
      let product = await repository.findProductById(parsed.id);
      const nowIso = new Date().toISOString();

      if (!product) {
        Logger.info('IPC', `[track-product] Nowy produkt (ID: ${parsed.id}). Pobieranie szczegółów z Kinguin...`);
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
        Logger.info('IPC', `[track-product] Dodano nowy produkt do bazy danych! Title: "${fetched.title}"`);
      } else {
        Logger.info('IPC', `[track-product] Produkt istnieje już w bazie (ID: ${parsed.id}). Sprawdzanie cache TTL...`);
        const lastChecked = product.lastCheckedAt ? new Date(product.lastCheckedAt).getTime() : 0;
        const now = Date.now();

        if (now - lastChecked > LOCAL_REFRESH_TTL_MS) {
          Logger.info('IPC', `[track-product] Cache wygasł (> 6h). Odświeżanie ceny dla ID: ${parsed.id}...`);
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
            Logger.warn('IPC', `[track-product] Odświeżenie w tle nie powiodło się: ${err.message}`);
          }
        } else {
          Logger.info('IPC', `[track-product] Dane w bazie są aktualne (odświeżono mniej niż 6h temu).`);
        }
      }

      const updatedProduct = await repository.findProductById(parsed.id);
      return {
        success: true,
        product: updatedProduct || undefined
      };
    } catch (err: any) {
      Logger.error('IPC', `[track-product] Błąd operacji: ${err.message}`, err);
      return {
        success: false,
        error: err.message || 'Wystąpił nieoczekiwany błąd podczas dodawania produktu.'
      };
    }
  });

  // Get list of all tracked products
  ipcMain.handle('get-products', async () => {
    Logger.info('IPC', '[get-products] Pobieranie listy śledzonych produktów z bazy danych');
    const products = await repository.listTrackedProducts();
    Logger.info('IPC', `[get-products] Znaleziono ${products.length} produktów w bazie`);
    return products;
  });

  // Get detail analysis for a single product
  ipcMain.handle('get-product-detail', async (_, productId: string, period: TimePeriod = 'month'): Promise<ProductDetailResponse | null> => {
    Logger.info('IPC', `[get-product-detail] Pobieranie analizy dla produktu ID: ${productId}, Okres: ${period}`);
    const product = await repository.findProductById(productId);
    if (!product) {
      Logger.warn('IPC', `[get-product-detail] Produkt ID: ${productId} nie istnieje`);
      return null;
    }

    const history = await repository.getHistory(productId);
    const currentPrice = history.length > 0 ? history[history.length - 1].price : (product.currentPrice || 0);

    const trend = TrendEngine.analyze(history, product.firstTrackedAt);
    const average = AverageEngine.analyze(history, currentPrice, period);

    Logger.info('IPC', `[get-product-detail] Analiza gotowa. Trend: ${trend.label}, Średnia delta: ${average.label}`);

    return {
      product: { ...product, currentPrice },
      history,
      trend,
      average
    };
  });

  // Manual refresh of product price
  ipcMain.handle('refresh-product', async (_, productId: string): Promise<ProductDetailResponse | null> => {
    Logger.info('IPC', `[refresh-product] Ręczne odświeżenie ceny dla ID: ${productId}`);
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
      Logger.info('IPC', `[refresh-product] Zaktualizowano cenę w bazie: ${fetched.price} ${fetched.currency}`);
    } catch (err: any) {
      Logger.error('IPC', `[refresh-product] Błąd odświeżania: ${err.message}`);
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
    Logger.info('IPC', `[delete-product] Usuwanie produktu ID: ${productId}`);
    await repository.deleteProduct(productId);
    Logger.info('IPC', `[delete-product] Usunięto produkt ID: ${productId}`);
    return true;
  });

  // Safe external URL opening
  ipcMain.handle('open-external', async (_, url: string) => {
    Logger.info('IPC', `[open-external] Otwieranie linku w zewnętrznej przeglądarce: ${url}`);
    if (url.startsWith('https://') || url.startsWith('http://')) {
      await shell.openExternal(url);
    }
  });
}
