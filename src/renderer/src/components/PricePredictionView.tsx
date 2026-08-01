import React, { useState } from 'react';
import { PriceSnapshot, TrendAnalysis } from '../../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { HelpCircle, ArrowUp, ArrowDown, Minus, ShieldCheck } from 'lucide-react';
import { CustomTooltip } from './CustomTooltip';

export type PredictionHorizon = '2w' | '1m' | '6m' | '1y';

interface PricePredictionViewProps {
  history: PriceSnapshot[];
  currentPrice: number;
  currency: string;
  trend: TrendAnalysis;
}

export const PricePredictionView: React.FC<PricePredictionViewProps> = ({
  history,
  currentPrice,
  currency,
  trend
}) => {
  const { t } = useLanguage();
  const { formatPrice, convertPrice } = useCurrency();
  const [horizon, setHorizon] = useState<PredictionHorizon>('1m');

  const daysMap: Record<PredictionHorizon, number> = {
    '2w': 14,
    '1m': 30,
    '6m': 180,
    '1y': 365
  };

  const targetDays = daysMap[horizon];

  // Mathematical Dampened Mean-Reverting Prediction Engine
  const calculatePrediction = () => {
    const baseCurrent = currentPrice || 0;

    if (!history || history.length === 0 || baseCurrent === 0) {
      return {
        projectedPriceBase: baseCurrent,
        diffValBase: 0,
        diffPct: 0,
        lowBoundBase: baseCurrent * 0.95,
        highBoundBase: baseCurrent * 1.05,
        confidence: 'low'
      };
    }

    // Process all history in raw base currency
    const basePrices = history.map((h) => h.price);
    const maxPriceBase = Math.max(...basePrices, baseCurrent);
    const minPriceBase = Math.min(...basePrices, baseCurrent);
    const avgPriceBase = basePrices.reduce((a, b) => a + b, 0) / basePrices.length;

    // Strict MSRP Ceiling & Floor bounds in base currency
    const priceCeilingBase = Math.max(maxPriceBase * 1.08, baseCurrent * 1.15);
    const priceFloorBase = Math.max(0.1, Math.min(minPriceBase, baseCurrent * 0.35));

    // Calculate short-term raw daily drift slope m (bounded to max 2% per day)
    let rawDailyDrift = 0;
    if (history.length >= 2) {
      const firstTime = new Date(history[0].checkedAt).getTime();
      const lastTime = new Date(history[history.length - 1].checkedAt).getTime();
      const daysDiff = Math.max(0.5, (lastTime - firstTime) / (1000 * 3600 * 24));

      const startPrice = history[0].price;
      const endPrice = history[history.length - 1].price;
      const unclampedDrift = (endPrice - startPrice) / daysDiff;

      const maxDailyDrift = baseCurrent * 0.02;
      rawDailyDrift = Math.max(-maxDailyDrift, Math.min(maxDailyDrift, unclampedDrift));
    }

    // 1. Short-Term Dampened Exponential Drift: m * t * exp(-lambda * t)
    const lambda = 0.04;
    const dampenedDrift = rawDailyDrift * targetDays * Math.exp(-lambda * targetDays);

    // 2. Long-Term Mean Reversion & Digital Key Price Erosion (8% annual decay baseline)
    const gamma = 0.015;
    const meanReversionWeight = 1 - Math.exp(-gamma * targetDays);
    const annualDecayRate = 0.08;
    const keyDepreciation = baseCurrent * (annualDecayRate * (targetDays / 365));
    const longTermEquilibrium = 0.55 * avgPriceBase + 0.45 * (baseCurrent - keyDepreciation);

    // 3. Combined Projection Formula
    const shortTermComponent = (1 - meanReversionWeight) * (baseCurrent + dampenedDrift);
    const longTermComponent = meanReversionWeight * longTermEquilibrium;
    const rawProjected = shortTermComponent + longTermComponent;

    // 4. Clamp strictly within MSRP Ceiling & Floor
    const projectedPriceBase = Math.max(priceFloorBase, Math.min(priceCeilingBase, rawProjected));

    const diffValBase = projectedPriceBase - baseCurrent;
    const diffPct = (diffValBase / baseCurrent) * 100;

    // Volatility Range Corridor
    const volatilityFactor = Math.min(0.2, (trend.rangePct || 5) / 100);
    const lowBoundBase = Math.max(priceFloorBase, projectedPriceBase * (1 - volatilityFactor * 0.5));
    const highBoundBase = Math.min(priceCeilingBase, projectedPriceBase * (1 + volatilityFactor * 0.5));

    let confidence: 'high' | 'med' | 'low' = 'low';
    if (history.length >= 6 && trend.volatility === 'low') {
      confidence = 'high';
    } else if (history.length >= 3) {
      confidence = 'med';
    }

    return {
      projectedPriceBase,
      diffValBase,
      diffPct,
      lowBoundBase,
      highBoundBase,
      confidence
    };
  };

  const pred = calculatePrediction();
  const isUp = pred.diffValBase > 0.001;
  const isDown = pred.diffValBase < -0.001;

  const getConfidenceBadge = () => {
    if (pred.confidence === 'high') {
      return {
        label: t('prediction.confidenceHigh'),
        style: 'badge-green'
      };
    }
    if (pred.confidence === 'med') {
      return {
        label: t('prediction.confidenceMed'),
        style: 'badge-gold'
      };
    }
    return {
      label: t('prediction.confidenceLow'),
      style: 'badge-gray'
    };
  };

  const confBadge = getConfidenceBadge();

  return (
    <div
      style={{
        marginTop: 16,
        padding: 20,
        borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.95), rgba(12, 16, 24, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Prediction Module Header (Clean, Emoji-Free) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('prediction.title')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {t('prediction.subtitle')}
            </div>
          </div>
        </div>

        {/* Timeline selector pills */}
        <div className="pill-switcher">
          {(['2w', '1m', '6m', '1y'] as PredictionHorizon[]).map((h) => (
            <button
              key={h}
              className={`pill-button ${horizon === h ? 'active' : ''}`}
              onClick={() => setHorizon(h)}
              style={{ fontSize: 12, padding: '4px 12px' }}
            >
              {t(`prediction.${h}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 16
        }}
      >
        {/* Projected Price */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('prediction.projectedPrice')} ({horizon})
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {formatPrice(pred.projectedPriceBase, currency)}
          </div>
        </div>

        {/* Expected Delta */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('prediction.expectedChange')}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: isDown ? 'var(--accent-green)' : isUp ? 'var(--accent-red)' : 'var(--accent-gold)'
            }}
          >
            {isDown && <ArrowDown size={18} />}
            {isUp && <ArrowUp size={18} />}
            {!isDown && !isUp && <Minus size={18} />}
            <span>
              {pred.diffPct > 0 ? '+' : ''}
              {pred.diffPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Projected Range Corridor */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('prediction.corridor')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 6 }}>
            {formatPrice(pred.lowBoundBase, currency)} - {formatPrice(pred.highBoundBase, currency)}
          </div>
        </div>

        {/* Model Confidence */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('prediction.confidence')}
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`badge ${confBadge.style}`}>
              <span className="dot" />
              {confBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer Note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
        <CustomTooltip text={t('prediction.disclaimer')}>
          <HelpCircle size={14} style={{ cursor: 'help', flexShrink: 0, marginTop: 1 }} />
        </CustomTooltip>
        <span>{t('prediction.disclaimer')}</span>
      </div>
    </div>
  );
};
