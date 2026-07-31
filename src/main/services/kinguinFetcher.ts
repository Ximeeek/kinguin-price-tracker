import * as cheerio from 'cheerio';
import { Logger } from '../logger';

export interface FetchedKinguinProduct {
  id: string;
  canonicalUrl: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export function parseKinguinUrl(input: string): { id: string; canonicalUrl: string } | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    
    // Validate host
    if (!url.hostname.includes('kinguin.net')) {
      return null;
    }

    // Match /category/{id}/{slug} or /c/{id}/{slug} or /category/{id} or /c/{id}
    const match = url.pathname.match(/\/(category|c)\/(\d+)(\/([^\/]+))?/i);
    if (!match || !match[2]) {
      return null;
    }

    const id = match[2];
    const slug = match[4] || '';
    const canonicalUrl = `https://www.kinguin.net/category/${id}${slug ? `/${slug}` : ''}`;

    return { id, canonicalUrl };
  } catch {
    return null;
  }
}

export class KinguinProductFetcher {
  private static DEFAULT_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  async fetchProduct(inputUrl: string): Promise<FetchedKinguinProduct> {
    Logger.info('FETCHER', `Starting product fetch for URL: ${inputUrl}`);

    const parsed = parseKinguinUrl(inputUrl);
    if (!parsed) {
      Logger.error('FETCHER', `Invalid Kinguin URL: ${inputUrl}`);
      throw new Error('URL does not appear to be a valid Kinguin product link.');
    }

    Logger.info('FETCHER', `Parsed URL -> ID: ${parsed.id}, Canonical: ${parsed.canonicalUrl}`);

    // Append currency query param to pin request to EUR for historical consistency
    const targetUrl = new URL(parsed.canonicalUrl);
    targetUrl.searchParams.set('currency', 'EUR');

    const headers: Record<string, string> = {
      'User-Agent': KinguinProductFetcher.DEFAULT_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cookie': 'kinguin_currency=EUR'
    };

    Logger.info('FETCHER', `Sending HTTP GET to ${targetUrl.toString()}...`);

    let responseHtml = '';
    let responseStatus = 0;

    // Use Electron net.fetch if available (Chromium TLS stack avoids Cloudflare 403)
    let fetchFn = globalThis.fetch;
    try {
      const electron = require('electron');
      if (electron && electron.net && typeof electron.net.fetch === 'function') {
        fetchFn = electron.net.fetch;
        Logger.info('FETCHER', 'Using native Electron network stack (Chromium net.fetch)');
      }
    } catch {
      Logger.info('FETCHER', 'Using standard global fetch');
    }

    try {
      const res = await fetchFn(targetUrl.toString(), {
        headers,
        signal: AbortSignal.timeout(15000)
      });
      responseStatus = res.status;
      Logger.info('FETCHER', `HTTP Response Status: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        if (res.status === 403) {
          Logger.warn('FETCHER', `Received HTTP 403 Forbidden from Kinguin. Page blocked request.`);
          throw new Error(`Kinguin server returned HTTP 403 error (Access Denied / WAF Protection).`);
        }
        if (res.status === 404) {
          Logger.warn('FETCHER', `Received HTTP 404 Not Found.`);
          throw new Error('Product not found on Kinguin (Error 404).');
        }
        throw new Error(`Kinguin server returned HTTP ${res.status} error.`);
      }

      responseHtml = await res.text();
    } catch (err: any) {
      Logger.error('FETCHER', `Error during HTTP request: ${err.message}`);
      throw err;
    }

    Logger.info('FETCHER', `Fetched HTML (${responseHtml.length} bytes). Parsing meta tags with Cheerio...`);
    const $ = cheerio.load(responseHtml);

    // Extract price from meta tag or JSON-LD script
    let priceAmountStr =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content') ||
      $('meta[name="twitter:data1"]').attr('content');

    let currency =
      $('meta[property="product:price:currency"]').attr('content') ||
      $('meta[property="og:price:currency"]').attr('content') ||
      'EUR';

    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      '';

    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null;

    // Fallback: Check JSON-LD embedded data if meta tags are missing
    if (!priceAmountStr || !title) {
      Logger.info('FETCHER', 'Price missing in meta tags, scanning JSON-LD scripts...');
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonText = $(el).html();
          if (jsonText) {
            const data = JSON.parse(jsonText);
            const productData = Array.isArray(data) ? data.find(item => item['@type'] === 'Product') : data;
            
            if (productData && productData['@type'] === 'Product') {
              if (!title && productData.name) title = productData.name;
              if (!imageUrl && productData.image) {
                imageUrl = Array.isArray(productData.image) ? productData.image[0] : productData.image;
              }

              if (productData.offers) {
                const offer = Array.isArray(productData.offers) ? productData.offers[0] : productData.offers;
                if (offer.price) priceAmountStr = String(offer.price);
                if (offer.priceCurrency) currency = offer.priceCurrency;
              }
            }
          }
        } catch {
          // ignore JSON parse errors
        }
      });
    }

    // Clean title (remove Kinguin suffix if present)
    title = title.replace(/\s*\|\s*Kinguin\.net.*$/i, '').trim();

    if (!priceAmountStr) {
      Logger.error('FETCHER', 'Price not found in meta tags or JSON-LD!');
      throw new Error('Could not parse product price from Kinguin page.');
    }

    const price = parseFloat(priceAmountStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Logger.error('FETCHER', `Price parsing failed: ${priceAmountStr}`);
      throw new Error(`Invalid price format: ${priceAmountStr}`);
    }

    Logger.info('FETCHER', `Success! Product: "${title}", Price: ${price} ${currency.toUpperCase()}`);

    return {
      id: parsed.id,
      canonicalUrl: parsed.canonicalUrl,
      title: title || `Product #${parsed.id}`,
      price,
      currency: currency.toUpperCase(),
      imageUrl
    };
  }
}
