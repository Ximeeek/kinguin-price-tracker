import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '../currency/CurrencyContext';
import { DollarSign, ChevronDown, Check } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrencyInfo = SUPPORTED_CURRENCIES[currency] || { code: currency, symbol: '$' };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Change Currency"
      >
        <DollarSign size={14} color="var(--accent-green)" />
        <span>{currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})</span>
        <ChevronDown
          size={13}
          color="var(--text-muted)"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {Object.values(SUPPORTED_CURRENCIES).map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                className={`custom-dropdown-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  setIsOpen(false);
                }}
              >
                <span>{c.code} ({c.symbol})</span>
                {isSelected && <Check size={12} color="var(--accent-green)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
