import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProductDetailResponse, TimePeriod } from '../../../shared/types';
import { PeriodSelector } from './PeriodSelector';
import { PriceChart } from './PriceChart';
import { PriceChangeIndicator } from './PriceChangeIndicator';
import { TrendBanner } from './TrendBanner';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { ProductImage } from './ProductImage';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, onClose }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [loading, setLoading] = useState(true);

  useLockBodyScroll(!!productId);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
  };

  const loadData = async (selectedPeriod: TimePeriod) => {
    if (!detail) {
      setLoading(true);
    }
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

  const getTranslatedTrendLabel = (label: string) => {
    const key = `trend.${label}` as any;
    return t(key) || label;
  };

  if (loading && !detail) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            {t('modal.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { product, history, trend, average } = detail;

  const totalDays = product.firstTrackedAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(product.firstTrackedAt).getTime()) / (1000 * 3600 * 24)))
    : undefined;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 999999 }}>
      <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ProductImage
              src={product.imageUrl}
              alt={product.title}
              width={56}
              height={56}
              borderRadius="12px"
            />
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {product.title}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Kinguin ID: {product.id} • {t('modal.firstTracked', { date: new Date(product.firstTrackedAt).toLocaleDateString() })}
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
              {t('modal.visitStore')}
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
            alignItems: 'start',
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
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('modal.currentPrice')}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{formatPrice(product.currentPrice || 0, product.currency)}</span>
              <PriceChangeIndicator
                currentPrice={product.currentPrice}
                previousPrice={product.previousPrice}
                currency={product.currency}
              />
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              background: 'rgba(14, 18, 26, 0.6)',
              padding: '16px 16px 20px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('modal.averagePrice')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {formatPrice(average.averagePrice, product.currency)}
            </div>
            {average.note && (
              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 3,
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'var(--accent-gold)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                ℹ️ {average.note}
              </div>
            )}
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('modal.relationToAverage')}</div>
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
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('modal.chartTitle')}</h3>
          <PeriodSelector
            selectedPeriod={period}
            onSelectPeriod={handlePeriodChange}
            totalDays={totalDays}
          />
        </div>

        <PriceChart
          key={productId}
          history={detail.fullHistory || history}
          currency={product.currency}
          averagePrice={average.averagePrice}
          selectedPeriod={period}
        />

        {/* Trend Analysis & Prediction Section */}
        <TrendBanner
          trend={trend}
          history={history}
          currentPrice={product.currentPrice}
          currency={product.currency}
        />
      </div>
    </div>,
    document.body
  );
};
