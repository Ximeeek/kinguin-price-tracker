import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { Product, PriceSnapshot } from '../../shared/types';
import { Logger } from '../logger';
import { cleanProductTitle } from '../services/kinguinFetcher';

export interface PriceRepository {
  init(): Promise<void>;
  findProductById(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'currentPrice'>): Promise<Product>;
  updateProduct(product: Partial<Product> & { id: string }): Promise<void>;
  addPriceSnapshot(productId: string, price: number, checkedAt: string): Promise<PriceSnapshot>;
  getHistory(productId: string, since?: Date): Promise<PriceSnapshot[]>;
  getLastCheckedAt(productId: string): Promise<Date | null>;
  listTrackedProducts(): Promise<Product[]>;
  deleteProduct(productId: string): Promise<void>;
}

export class LocalSqliteRepository implements PriceRepository {
  private db: Database | null = null;
  private dbPath: string;

  constructor(userDataPath: string) {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.dbPath = path.join(userDataPath, 'kinguin_tracker.sqlite');
  }

  async init(): Promise<void> {
    Logger.info('DB', `Initializing SQLite database at: ${this.dbPath}`);
    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
      Logger.info('DB', 'Loaded existing SQLite database file.');
    } else {
      this.db = new SQL.Database();
      this.saveToDisk();
      Logger.info('DB', 'Created new SQLite database file.');
    }

    this.runSchema();
  }

  private saveToDisk(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  private runSchema(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        image_url TEXT,
        currency TEXT NOT NULL,
        first_tracked_at TEXT NOT NULL,
        last_checked_at TEXT,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        price REAL NOT NULL,
        checked_at TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_price_history_product_time ON price_history(product_id, checked_at);
    `);

    this.saveToDisk();
  }

  async findProductById(id: string): Promise<Product | null> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = :id');
    stmt.bind({ ':id': id });
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapProductRow(row);
    }
    stmt.free();
    return null;
  }

  async createProduct(product: Omit<Product, 'currentPrice'>): Promise<Product> {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.run(
      `INSERT INTO products (id, url, title, image_url, currency, first_tracked_at, last_checked_at, status)
       VALUES (:id, :url, :title, :image_url, :currency, :first_tracked_at, :last_checked_at, :status)`,
      {
        ':id': product.id,
        ':url': product.url,
        ':title': product.title,
        ':image_url': product.imageUrl || null,
        ':currency': product.currency,
        ':first_tracked_at': product.firstTrackedAt,
        ':last_checked_at': product.lastCheckedAt || null,
        ':status': product.status || 'active'
      }
    );

    this.saveToDisk();
    return (await this.findProductById(product.id))!;
  }

  async updateProduct(product: Partial<Product> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const fields: string[] = [];
    const params: Record<string, any> = { ':id': product.id };

    if (product.title !== undefined) {
      fields.push('title = :title');
      params[':title'] = product.title;
    }
    if (product.url !== undefined) {
      fields.push('url = :url');
      params[':url'] = product.url;
    }
    if (product.imageUrl !== undefined) {
      fields.push('image_url = :image_url');
      params[':image_url'] = product.imageUrl;
    }
    if (product.lastCheckedAt !== undefined) {
      fields.push('last_checked_at = :last_checked_at');
      params[':last_checked_at'] = product.lastCheckedAt;
    }
    if (product.status !== undefined) {
      fields.push('status = :status');
      params[':status'] = product.status;
    }

    if (fields.length > 0) {
      this.db.run(
        `UPDATE products SET ${fields.join(', ')} WHERE id = :id`,
        params
      );
      this.saveToDisk();
    }
  }

  async addPriceSnapshot(productId: string, price: number, checkedAt: string): Promise<PriceSnapshot> {
    if (!this.db) throw new Error('Database not initialized');

    const dayKey = checkedAt.substring(0, 10);

    // Check if snapshot exists for this day
    const checkStmt = this.db.prepare(
      `SELECT id FROM price_history WHERE product_id = :product_id AND SUBSTR(checked_at, 1, 10) = :day_key LIMIT 1`
    );
    checkStmt.bind({ ':product_id': productId, ':day_key': dayKey });

    let existingId: number | null = null;
    if (checkStmt.step()) {
      const row = checkStmt.getAsObject();
      existingId = Number(row.id);
    }
    checkStmt.free();

    if (existingId !== null) {
      this.db.run(
        `UPDATE price_history SET price = :price, checked_at = :checked_at WHERE id = :id`,
        { ':price': price, ':checked_at': checkedAt, ':id': existingId }
      );
    } else {
      this.db.run(
        `INSERT INTO price_history (product_id, price, checked_at) VALUES (:product_id, :price, :checked_at)`,
        {
          ':product_id': productId,
          ':price': price,
          ':checked_at': checkedAt
        }
      );
    }

    // Update product last_checked_at
    this.db.run(
      `UPDATE products SET last_checked_at = :last_checked_at WHERE id = :id`,
      { ':last_checked_at': checkedAt, ':id': productId }
    );

    this.saveToDisk();

    return {
      productId,
      price,
      checkedAt
    };
  }

  async getHistory(productId: string, since?: Date): Promise<PriceSnapshot[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = `
      SELECT 
        MIN(id) as id,
        product_id,
        ROUND(AVG(price), 2) as price,
        MAX(checked_at) as checked_at,
        SUBSTR(checked_at, 1, 10) as day_key
      FROM price_history 
      WHERE product_id = :product_id
    `;
    const params: Record<string, any> = { ':product_id': productId };

    if (since) {
      query += ' AND checked_at >= :since';
      params[':since'] = since.toISOString();
    }

    query += ' GROUP BY day_key ORDER BY day_key ASC';

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const snapshots: PriceSnapshot[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      snapshots.push({
        id: Number(row.id),
        productId: String(row.product_id),
        price: Number(row.price),
        checkedAt: String(row.checked_at)
      });
    }
    stmt.free();

    return snapshots;
  }

  async getLastCheckedAt(productId: string): Promise<Date | null> {
    const product = await this.findProductById(productId);
    if (!product || !product.lastCheckedAt) return null;
    return new Date(product.lastCheckedAt);
  }

  async listTrackedProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY last_checked_at DESC');
    const products: Product[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      const product = this.mapProductRow(row);

      // Get latest prices
      const priceStmt = this.db.prepare(
        'SELECT price FROM price_history WHERE product_id = :product_id ORDER BY checked_at DESC LIMIT 2'
      );
      priceStmt.bind({ ':product_id': product.id });
      const prices: number[] = [];
      while (priceStmt.step()) {
        prices.push(Number(priceStmt.getAsObject().price));
      }
      priceStmt.free();

      if (prices.length > 0) {
        product.currentPrice = prices[0];
      }
      if (prices.length > 1) {
        product.previousPrice = prices[1];
      }

      products.push(product);
    }
    stmt.free();

    return products;
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM price_history WHERE product_id = :id', { ':id': productId });
    this.db.run('DELETE FROM products WHERE id = :id', { ':id': productId });
    this.saveToDisk();
  }

  private mapProductRow(row: Record<string, any>): Product {
    return {
      id: String(row.id),
      url: String(row.url),
      title: cleanProductTitle(String(row.title)),
      imageUrl: row.image_url ? String(row.image_url) : null,
      currency: String(row.currency || 'EUR'),
      firstTrackedAt: String(row.first_tracked_at),
      lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : null,
      status: (row.status as 'active' | 'unavailable') || 'active'
    };
  }
}
