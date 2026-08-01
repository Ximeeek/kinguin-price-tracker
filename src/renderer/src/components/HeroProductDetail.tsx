import React, { useEffect, useState } from 'react';
import { ProductDetailResponse, TimePeriod } from '../../../shared/types';
import { PeriodSelector } from './PeriodSelector';
import { PriceChart } from './PriceChart';
import { PriceChangeIndicator } from './PriceChangeIndicator';
import { TrendBanner } from './TrendBanner';
import { ExternalLink, RefreshCw, Star, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';

import { ProductImage } from './ProductImage';

interface HeroProductDetailProps {
  productId: string;
  onRefresh?: (id: string) => void;
  onUnsetDefault?: () => void;
  isRefreshing?: boolean;
}

export const HeroProductDetail: React.FC<HeroProductDetailProps> = ({
  productId,
  onRefresh,
  onUnsetDefault,
  isRefreshing = false
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [loading, setLoading] = useState(true);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
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
    if (productId) {
      loadData(period);
    }
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
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: 28 }}>
        <div style={{ color: 'var(--text-muted)' }}>{t('modal.loading')}</div>
      </div>
    );
  }

  if (!detail) return null;

  const { product, history, trend, average } = detail;

  const totalDays = product.firstTrackedAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(product.firstTrackedAt).getTime()) / (1000 * 3600 * 24)))
    : undefined;

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        marginBottom: 32,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(18, 22, 32, 0.8), rgba(12, 15, 22, 0.9))',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Featured Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <ProductImage
            src={product.imageUrl}
            alt={product.title}
            width={64}
            height={64}
            borderRadius="14px"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--accent-gold)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Star size={12} fill="var(--accent-gold)" />
                {t('productList.isDefaultBadge')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ID: {product.id}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {product.title}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {t('modal.firstTracked', { date: new Date(product.firstTrackedAt).toLocaleDateString() })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {onUnsetDefault && (
            <button
              className="nav-item-btn"
              onClick={onUnsetDefault}
              title={t('productList.unsetDefaultTooltip')}
              style={{
                padding: '6px 12px',
                width: 'auto',
                height: 38,
                borderRadius: '9999px',
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <X size={14} />
              <span>{t('productList.clearDefaultBtn')}</span>
            </button>
          )}
          {onRefresh && (
            <button
              className="card-action-btn card-action-refresh"
              onClick={() => onRefresh(product.id)}
              disabled={isRefreshing}
              title={t('productList.refreshTooltip')}
              style={{ width: 38, height: 38, borderRadius: '50%' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            </button>
          )}
          <button
            className="track-btn"
            style={{ padding: '8px 16px', fontSize: 13, height: 38 }}
            onClick={() => window.api.openExternal(product.url)}
          >
            <ExternalLink size={15} />
            {t('modal.visitStore')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
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
            background: 'rgba(14, 18, 26, 0.7)',
            padding: 16,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('modal.currentPrice')}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
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
            background: 'rgba(14, 18, 26, 0.7)',
            padding: '16px 16px 20px 16px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('modal.averagePrice')}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
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
            background: 'rgba(14, 18, 26, 0.7)',
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

      {/* Period Selector & Chart */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{t('modal.chartTitle')}</h3>
        <PeriodSelector
          selectedPeriod={period}
          onSelectPeriod={handlePeriodChange}
          totalDays={totalDays}
        />
      </div>

      <PriceChart
        key={productId}
        history={history}
        currency={product.currency}
        averagePrice={average.averagePrice}
      />

      {/* Trend Analysis & Prediction Section */}
      <TrendBanner
        trend={trend}
        history={history}
        currentPrice={product.currentPrice}
        currency={product.currency}
      />
    </div>
  );
};
