import React, { useState } from 'react';
import { TrendAnalysis, PriceSnapshot } from '../../../shared/types';
import { TrendingDown, TrendingUp, Minus, Activity, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PricePredictionView } from './PricePredictionView';

interface TrendBannerProps {
  trend: TrendAnalysis;
  history?: PriceSnapshot[];
  currentPrice?: number;
  currency?: string;
}

export const TrendBanner: React.FC<TrendBannerProps> = ({
  trend,
  history,
  currentPrice,
  currency = 'EUR'
}) => {
  const { t } = useLanguage();
  const [showPrediction, setShowPrediction] = useState(true);

  const getTheme = () => {
    if (trend.label === 'Steady decrease' || trend.label === 'Decreasing (volatile)') {
      return {
        bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(16, 185, 129, 0.07))',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        titleColor: 'var(--accent-green)',
        badgeClass: 'badge-green',
        headerText: t('trendHeader.decreasing'),
        icon: <TrendingDown size={22} color="var(--accent-green)" />
      };
    }
    if (trend.label === 'Steady increase' || trend.label === 'Increasing (volatile)') {
      return {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(225, 29, 72, 0.07))',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        titleColor: 'var(--accent-red)',
        badgeClass: 'badge-red',
        headerText: t('trendHeader.increasing'),
        icon: <TrendingUp size={22} color="var(--accent-red)" />
      };
    }
    if (trend.label === 'Stable') {
      return {
        bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.16), rgba(217, 119, 6, 0.07))',
        border: '1px solid rgba(234, 179, 8, 0.4)',
        titleColor: 'var(--accent-gold)',
        badgeClass: 'badge-gold',
        headerText: t('trendHeader.stable'),
        icon: <Minus size={22} color="var(--accent-gold)" />
      };
    }
    if (trend.label === 'Fluctuating') {
      return {
        bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16), rgba(14, 165, 233, 0.07))',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        titleColor: 'var(--accent-cyan)',
        badgeClass: 'badge-cyan',
        headerText: t('trendHeader.fluctuating'),
        icon: <Activity size={22} color="var(--accent-cyan)" />
      };
    }

    return {
      bg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(75, 85, 99, 0.07))',
      border: '1px solid rgba(107, 114, 128, 0.3)',
      titleColor: 'var(--text-muted)',
      badgeClass: 'badge-gray',
      headerText: t('trendHeader.insufficient'),
      icon: <Minus size={22} color="var(--text-muted)" />
    };
  };

  const theme = getTheme();
  const translatedLabel = t(`trend.${trend.label}` as any) || trend.label;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 18,
        background: theme.bg,
        border: theme.border,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Prominent Direction Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {theme.icon}
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.titleColor, letterSpacing: '-0.2px' }}>
              {theme.headerText}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {t('modal.trendTitle')}
            </div>
          </div>
        </div>

        <span className={`badge ${theme.badgeClass}`} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 800 }}>
          <span className="dot" />
          {translatedLabel}
        </span>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 10 }}>
        {trend.explanation}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
        {trend.hasSufficientData ? (
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('modal.linearDrift')}:</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{trend.totalDriftPct}%</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('modal.volatilityRange')}:</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{trend.rangePct}%</strong>
            </div>
          </div>
        ) : <div />}

        <button
          onClick={() => setShowPrediction(!showPrediction)}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            background: showPrediction ? 'rgba(234, 179, 8, 0.22)' : 'rgba(234, 179, 8, 0.1)',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={14} />
          <span>{t('prediction.toggleBtn')}</span>
        </button>
      </div>

      {showPrediction && history && currentPrice !== undefined && (
        <PricePredictionView
          history={history}
          currentPrice={currentPrice}
          currency={currency}
          trend={trend}
        />
      )}
    </div>
  );
};
