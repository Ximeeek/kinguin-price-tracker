import { PriceRepository } from '../db/repository';
import { Product } from '../../shared/types';
import { Logger } from '../logger';

interface MockGameDefinition {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  currency: string;
  startPrice: number;
  endPrice: number;
  daysHistory: number;
  pattern: 'steady_down' | 'fluctuating' | 'steady_up' | 'stable' | 'volatile';
}

const MOCK_GAMES: Record<string, MockGameDefinition> = {
  test1: {
    id: 'mock-101',
    title: 'Cyberpunk 2077: Phantom Liberty (PC Steam Key)',
    url: 'https://www.kinguin.net/category/101/cyberpunk-2077-phantom-liberty',
    imageUrl: 'https://cdn.kinguin.net/media/category/c/y/cyberpunk_2077_phantom_liberty.jpg',
    currency: 'EUR',
    startPrice: 39.99,
    endPrice: 24.99,
    daysHistory: 60,
    pattern: 'steady_down'
  },
  test2: {
    id: 'mock-102',
    title: 'The Witcher 3: Wild Hunt - Complete Edition (GOG)',
    url: 'https://www.kinguin.net/category/102/the-witcher-3-complete-edition',
    imageUrl: 'https://cdn.kinguin.net/media/category/w/i/witcher_3_complete.jpg',
    currency: 'EUR',
    startPrice: 19.99,
    endPrice: 12.49,
    daysHistory: 90,
    pattern: 'fluctuating'
  },
  test3: {
    id: 'mock-103',
    title: 'Grand Theft Auto VI Pre-Order (Rockstar Key)',
    url: 'https://www.kinguin.net/category/103/gta-vi-preorder',
    imageUrl: 'https://cdn.kinguin.net/media/category/g/t/gta_6.jpg',
    currency: 'EUR',
    startPrice: 64.99,
    endPrice: 79.99,
    daysHistory: 45,
    pattern: 'steady_up'
  },
  test4: {
    id: 'mock-104',
    title: 'Elden Ring: Shadow of the Erdtree DLC (Steam)',
    url: 'https://www.kinguin.net/category/104/elden-ring-shadow-erdtree',
    imageUrl: 'https://cdn.kinguin.net/media/category/e/l/elden_ring_erdtree.jpg',
    currency: 'EUR',
    startPrice: 39.99,
    endPrice: 39.50,
    daysHistory: 75,
    pattern: 'stable'
  },
  test5: {
    id: 'mock-105',
    title: 'Red Dead Redemption 2 - Ultimate Edition',
    url: 'https://www.kinguin.net/category/105/red-dead-redemption-2',
    imageUrl: 'https://cdn.kinguin.net/media/category/r/d/rdr2.jpg',
    currency: 'EUR',
    startPrice: 29.99,
    endPrice: 14.99,
    daysHistory: 90,
    pattern: 'volatile'
  }
};

export async function generateDevMockProduct(
  command: string,
  repository: PriceRepository
): Promise<Product | null> {
  const normalizedKey = command.trim().toLowerCase();

  if (normalizedKey === 'test-all') {
    let lastProduct: Product | null = null;
    for (const key of Object.keys(MOCK_GAMES)) {
      lastProduct = await createSingleMockGame(MOCK_GAMES[key], repository);
    }
    return lastProduct;
  }

  const def = MOCK_GAMES[normalizedKey];
  if (!def) return null;

  return await createSingleMockGame(def, repository);
}

async function createSingleMockGame(
  def: MockGameDefinition,
  repository: PriceRepository
): Promise<Product> {
  Logger.info('DEV_MOCK', `Generating mock test data for "${def.title}" (${def.daysHistory} days of history)`);

  const now = new Date();
  const startTime = new Date(now.getTime() - def.daysHistory * 24 * 3600 * 1000);
  const firstTrackedIso = startTime.toISOString();
  const nowIso = now.toISOString();

  // If product already exists, delete it first for fresh generation
  const existing = await repository.findProductById(def.id);
  if (existing) {
    await repository.deleteProduct(def.id);
  }

  // Create product record
  const product = await repository.createProduct({
    id: def.id,
    url: def.url,
    title: def.title,
    imageUrl: def.imageUrl,
    currency: def.currency,
    firstTrackedAt: firstTrackedIso,
    lastCheckedAt: nowIso,
    status: 'active'
  });

  // Generate historical snapshots day by day
  const totalDays = def.daysHistory;
  for (let day = 0; day <= totalDays; day++) {
    const snapshotDate = new Date(startTime.getTime() + day * 24 * 3600 * 1000);
    const progress = day / totalDays;

    let price = def.startPrice;

    switch (def.pattern) {
      case 'steady_down':
        price = def.startPrice + progress * (def.endPrice - def.startPrice);
        price += (Math.random() - 0.5) * 0.8;
        break;
      case 'steady_up':
        price = def.startPrice + progress * (def.endPrice - def.startPrice);
        price += (Math.random() - 0.5) * 1.0;
        break;
      case 'stable':
        price = def.startPrice + Math.sin(day * 0.5) * 0.4;
        break;
      case 'fluctuating':
        price = def.startPrice + Math.sin(day * 0.3) * 3.5 + Math.cos(day * 0.7) * 1.5;
        break;
      case 'volatile':
        if (day % 14 < 3) {
          price = def.endPrice; // Flash sale!
        } else {
          price = def.startPrice + (Math.random() - 0.5) * 6.0;
        }
        break;
    }

    price = Math.max(4.99, Math.round(price * 100) / 100);
    await repository.addPriceSnapshot(def.id, price, snapshotDate.toISOString());
  }

  Logger.info('DEV_MOCK', `Successfully generated ${totalDays + 1} snapshots for ID: ${def.id}`);
  return (await repository.findProductById(def.id))!;
}
