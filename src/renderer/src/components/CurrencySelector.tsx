import React from 'react';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '../currency/CurrencyContext';
import { DollarSign } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'var(--bg-input)',
        border: '1px solid var(--border-card)',
        borderRadius: '9999px',
        padding: '4px 10px'
      }}
    >
      <DollarSign size={14} color="var(--accent-green)" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: 12,
          fontWeight: 700,
          outline: 'none',
          cursor: 'pointer',
          paddingRight: 2
        }}
      >
        {Object.values(SUPPORTED_CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} style={{ background: '#0e121a', color: '#fff' }}>
            {c.code} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};
