export interface Product {
  id: string; // Kinguin's numeric product ID
  url: string;
  title: string;
  imageUrl: string | null;
  currency: string;
  firstTrackedAt: string; // ISO date string
  lastCheckedAt: string | null; // ISO date string
  currentPrice?: number;
  previousPrice?: number;
  status?: 'active' | 'unavailable';
}

export interface PriceSnapshot {
  id?: number;
  productId: string;
  price: number;
  checkedAt: string; // ISO date string
}

export type TimePeriod = 'week' | 'month' | 'six_months' | 'year';

export type TrendDirection = 'up' | 'down' | 'flat';
export type VolatilityLevel = 'low' | 'high';

export type TrendLabel =
  | 'Stable'
  | 'Fluctuating'
  | 'Steady increase'
  | 'Increasing (volatile)'
  | 'Steady decrease'
  | 'Decreasing (volatile)'
  | 'Not enough data yet';

export interface TrendAnalysis {
  direction: TrendDirection;
  volatility: VolatilityLevel;
  label: TrendLabel;
  explanation: string;
  totalDriftPct: number;
  rangePct: number;
  hasSufficientData: boolean;
}

export interface AverageAnalysis {
  period: TimePeriod;
  averagePrice: number;
  currentPrice: number;
  deltaPct: number;
  label: string;
  dataPointCount: number;
  dataAgeDays: number;
  note?: string;
}

export interface ProductDetailResponse {
  product: Product;
  history: PriceSnapshot[];
  trend: TrendAnalysis;
  average: AverageAnalysis;
}

export interface RefreshResult {
  success: boolean;
  error?: string;
  detail?: ProductDetailResponse;
}

export interface AddProductResult {
  success: boolean;
  product?: Product;
  error?: string;
}

export interface ElectronAPI {
  trackProduct: (url: string) => Promise<AddProductResult>;
  getProducts: () => Promise<Product[]>;
  getProductDetail: (id: string, period?: TimePeriod) => Promise<ProductDetailResponse | null>;
  refreshProduct: (id: string) => Promise<RefreshResult>;
  deleteProduct: (id: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
