import React, { useEffect, useState } from 'react';
import { ProductDetailResponse, TimePeriod } from '../../../shared/types';
import { PeriodSelector } from './PeriodSelector';
import { PriceChart } from './PriceChart';
import { X, ExternalLink, RefreshCw, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, onClose }) => {
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (selectedPeriod: TimePeriod) => {
    setLoading(true);
    try {
      const res = await window.api.getProductDetail(productId, selectedPeriod);
      setDetail(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [productId, period]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await window.api.refreshProduct(productId);
      if (res) setDetail(res);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendBadgeStyle = (label: string) => {
    switch (label) {
      case 'Stable':
        return 'badge-gold';
      case 'Steady decrease':
        return 'badge-green';
      case 'Steady increase':
        return 'badge-red';
      case 'Fluctuating':
      case 'Increasing (volatile)':
      case 'Decreasing (volatile)':
        return 'badge-cyan';
      default:
        return 'badge-gray';
    }
  };

  if (loading && !detail) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Ładowanie analizy cenowej...
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { product, history, trend, average } = detail;
  const symbol = product.currency === 'EUR' ? '€' : product.currency === 'USD' ? '$' : `${product.currency} `;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: 56, height: 56, borderRadius: '12px', objectFit: 'cover' }}
              />
            )}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {product.title}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Kinguin ID: {product.id} • Pierwsza rejestracja:{' '}
                {new Date(product.firstTrackedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="track-btn"
              style={{ padding: '8px 14px', fontSize: 12 }}
              onClick={() => window.api.openExternal(product.url)}
            >
              <ExternalLink size={14} />
              Kinguin.net
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Current Price vs Average Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 20
          }}
        >
          <div
            style={{
              background: 'rgba(14, 18, 26, 0.6)',
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Obecna cena</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {symbol}
              {(product.currentPrice || 0).toFixed(2)}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(14, 18, 26, 0.6)',
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              Średnia cena w wybranym okresie
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {symbol}
              {average.averagePrice.toFixed(2)}
            </div>
            {average.note && (
              <div style={{ fontSize: 11, color: 'var(--accent-gold)', marginTop: 4 }}>
                ℹ️ {average.note}
              </div>
            )}
          </div>

          <div
            style={{
              background: 'rgba(14, 18, 26, 0.6)',
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Stosunek do średniej</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginTop: 6,
                color:
                  average.deltaPct <= -1.5
                    ? 'var(--accent-green)'
                    : average.deltaPct >= 1.5
                    ? 'var(--accent-red)'
                    : 'var(--accent-gold)'
              }}
            >
              {average.label}
            </div>
          </div>
        </div>

        {/* Period Selector & Chart Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Wykres historii cen</h3>
          <PeriodSelector
            selectedPeriod={period}
            onSelectPeriod={(p) => {
              setPeriod(p);
              loadData(p);
            }}
          />
        </div>

        <PriceChart history={history} currency={product.currency} averagePrice={average.averagePrice} />

        {/* Trend Analysis Section (§8) */}
        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(22, 26, 36, 0.9), rgba(14, 18, 26, 0.9))',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Analiza trendu i stabilności (ostatnie 14 dni)
            </div>
            <span className={`badge ${getTrendBadgeStyle(trend.label)}`}>
              <span className="dot" />
              {trend.label}
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {trend.explanation}
          </div>

          {trend.hasSufficientData && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <div>
                Dryf liniowy: <strong style={{ color: 'var(--text-primary)' }}>{trend.totalDriftPct}%</strong>
              </div>
              <div>
                Zmienność (zakres): <strong style={{ color: 'var(--text-primary)' }}>{trend.rangePct}%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
