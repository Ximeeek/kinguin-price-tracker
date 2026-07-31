import React, { useEffect, useState } from 'react';
import { ProductDetailResponse, TimePeriod } from '../../../shared/types';
import { PeriodSelector } from './PeriodSelector';
import { PriceChart } from './PriceChart';
import { PriceChangeIndicator } from './PriceChangeIndicator';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';

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
  const [animClass, setAnimClass] = useState('');
  const [animKey, setAnimKey] = useState(0);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    if (newPeriod === period) return;
    const periodOrder: TimePeriod[] = ['week', 'month', 'six_months', 'year'];
    const oldIdx = periodOrder.indexOf(period);
    const newIdx = periodOrder.indexOf(newPeriod);

    if (newIdx < oldIdx) {
      setAnimClass('anim-scale-down');
    } else {
      setAnimClass('anim-scale-up');
    }
    setAnimKey((prev) => prev + 1);
    setPeriod(newPeriod);
    loadData(newPeriod);
  };

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
              background: 'rgba(14, 18, 26, 0.6)',
              padding: 16,
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
          />
        </div>

        <PriceChart
          key={`${period}-${animKey}`}
          history={history}
          currency={product.currency}
          averagePrice={average.averagePrice}
          animClass={animClass}
        />

        {/* Trend Analysis Section */}
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
              {t('modal.trendTitle')}
            </div>
            <span className={`badge ${getTrendBadgeStyle(trend.label)}`}>
              <span className="dot" />
              {getTranslatedTrendLabel(trend.label)}
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {trend.explanation}
          </div>

          {trend.hasSufficientData && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <div>
                {t('modal.linearDrift')}: <strong style={{ color: 'var(--text-primary)' }}>{trend.totalDriftPct}%</strong>
              </div>
              <div>
                {t('modal.volatilityRange')}: <strong style={{ color: 'var(--text-primary)' }}>{trend.rangePct}%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
