import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useCurrency } from '../currency/CurrencyContext';
import { useLanguage } from '../i18n/LanguageContext';
import { CustomTooltip } from './CustomTooltip';

interface PriceChangeIndicatorProps {
  currentPrice?: number;
  previousPrice?: number;
  currency?: string;
  showDiff?: boolean;
}

export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  currentPrice,
  previousPrice,
  currency = 'EUR',
  showDiff = true
}) => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  if (
    currentPrice === undefined ||
    previousPrice === undefined ||
    previousPrice === null
  ) {
    return (
      <CustomTooltip text={t('indicator.noChange')}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}
        >
          <Minus size={14} />
        </span>
      </CustomTooltip>
    );
  }

  const diff = currentPrice - previousPrice;

  if (Math.abs(diff) < 0.001) {
    return (
      <CustomTooltip text={t('indicator.noChange')}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}
        >
          <Minus size={14} />
        </span>
      </CustomTooltip>
    );
  }

  const isUp = diff > 0;
  const absDiff = Math.abs(diff);
  const formattedDiff = formatPrice(absDiff, currency);
  const tooltipMsg = isUp
    ? t('indicator.increased', { amount: formattedDiff })
    : t('indicator.decreased', { amount: formattedDiff });

  return (
    <CustomTooltip text={tooltipMsg}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 7px',
          borderRadius: '6px',
          fontSize: 12,
          fontWeight: 800,
          background: isUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          color: isUp ? 'var(--accent-red)' : 'var(--accent-green)',
          border: isUp ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
        }}
      >
        {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {showDiff && (
          <span>
            {isUp ? '+' : '-'}{formattedDiff}
          </span>
        )}
      </span>
    </CustomTooltip>
  );
};
