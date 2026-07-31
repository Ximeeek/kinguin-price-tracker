import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useCurrency } from '../currency/CurrencyContext';

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

  if (
    currentPrice === undefined ||
    previousPrice === undefined ||
    previousPrice === null
  ) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-muted)'
        }}
        title="Brak zmian / pierwsze sprawdzenie"
      >
        <Minus size={14} />
      </span>
    );
  }

  const diff = currentPrice - previousPrice;

  if (Math.abs(diff) < 0.001) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-muted)'
        }}
        title="Cena bez zmian"
      >
        <Minus size={14} />
      </span>
    );
  }

  const isUp = diff > 0;
  const absDiff = Math.abs(diff);

  return (
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
      title={isUp ? `Cena wzrosła o ${formatPrice(absDiff, currency)}` : `Cena spadła o ${formatPrice(absDiff, currency)}`}
    >
      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {showDiff && (
        <span>
          {isUp ? '+' : '-'}{formatPrice(absDiff, currency)}
        </span>
      )}
    </span>
  );
};
