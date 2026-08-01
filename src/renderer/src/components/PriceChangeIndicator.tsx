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
  tooltipPosition?: 'top' | 'bottom';
}

export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  currentPrice,
  previousPrice,
  currency = 'EUR',
  showDiff = true,
  tooltipPosition = 'top'
}) => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  if (
    currentPrice === undefined ||
    previousPrice === undefined ||
    previousPrice === null
  ) {
    return (
      <CustomTooltip text={t('indicator.noChange')} position={tooltipPosition}>
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
      <CustomTooltip text={t('indicator.noChange')} position={tooltipPosition}>
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
    <CustomTooltip text={tooltipMsg} position={tooltipPosition}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          fontSize: 12,
          fontWeight: 800,
          background: 'transparent',
          color: isUp ? 'var(--accent-red)' : 'var(--accent-green)',
          border: 'none',
          padding: 0,
          marginLeft: 2
        }}
      >
        {isUp ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
        {showDiff && (
          <span>
            {isUp ? '+' : '-'}{formattedDiff}
          </span>
        )}
      </span>
    </CustomTooltip>
  );
};
