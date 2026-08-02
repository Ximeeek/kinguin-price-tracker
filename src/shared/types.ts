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

export type TimePeriod = 'week' | 'month' | 'six_months' | 'year' | 'all' | string;

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
  explanationKey?: string;
  explanationParams?: Record<string, string | number>;
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
  labelKey?: string;
  labelParams?: Record<string, string | number>;
  dataPointCount: number;
  dataAgeDays: number;
  note?: string;
  noteKey?: string;
  noteParams?: Record<string, string | number>;
}

export interface ProductDetailResponse {
  product: Product;
  history: PriceSnapshot[];
  fullHistory?: PriceSnapshot[];
  trend: TrendAnalysis;
  average: AverageAnalysis;
}

export interface RefreshResult {
  success: boolean;
  error?: string;
  errorKey?: string;
  errorParams?: Record<string, string | number>;
  detail?: ProductDetailResponse;
}

export interface AddProductResult {
  success: boolean;
  product?: Product;
  error?: string;
  errorKey?: string;
  errorParams?: Record<string, string | number>;
}

export interface SystemStatus {
  online: boolean;
  localDb: {
    connected: boolean;
    type: string;
    productCount: number;
    latencyMs: number;
    error?: string;
  };
  remoteDb: {
    enabled: boolean;
    connected: boolean;
    type?: string;
    latencyMs?: number;
    error?: string;
  };
  checkedAt: string;
}

export interface ElectronAPI {
  trackProduct: (url: string) => Promise<AddProductResult>;
  getProducts: () => Promise<Product[]>;
  getProductDetail: (id: string, period?: TimePeriod) => Promise<ProductDetailResponse | null>;
  refreshProduct: (id: string) => Promise<RefreshResult>;
  deleteProduct: (id: string) => Promise<boolean>;
  checkSystemStatus: () => Promise<SystemStatus>;
  onBackendStatusChanged?: (callback: (data: { online: boolean }) => void) => () => void;
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
