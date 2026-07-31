import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'EUR' | 'USD' | 'PLN' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyDetails {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromEur: number; // 1 EUR = rateFromEur units of target currency
  symbolPosition: 'before' | 'after';
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromEur: 1.0, symbolPosition: 'before' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromEur: 1.09, symbolPosition: 'before' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polski Złoty', rateFromEur: 4.30, symbolPosition: 'after' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromEur: 0.85, symbolPosition: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromEur: 162.0, symbolPosition: 'before' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromEur: 1.48, symbolPosition: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromEur: 1.65, symbolPosition: 'before' }
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  convertPrice: (amount: number, fromCurrency?: string) => number;
}

const STORAGE_KEY = 'kinguin_tracker_currency';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    return saved && SUPPORTED_CURRENCIES[saved] ? saved : 'EUR';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const convertPrice = (amount: number, fromCurrency: string = 'EUR'): number => {
    if (amount === undefined || amount === null || isNaN(amount)) return 0;

    // Normalize from source currency to EUR base
    const sourceDetails = SUPPORTED_CURRENCIES[fromCurrency as CurrencyCode] || SUPPORTED_CURRENCIES.EUR;
    const amountInEur = amount / sourceDetails.rateFromEur;

    // Convert EUR base to target currency
    const targetDetails = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.EUR;
    return amountInEur * targetDetails.rateFromEur;
  };

  const formatPrice = (amount: number, fromCurrency: string = 'EUR'): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '—';

    const converted = convertPrice(amount, fromCurrency);
    const targetDetails = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.EUR;
    const decimals = currency === 'JPY' ? 0 : 2;

    const formattedAmount = converted.toFixed(decimals);

    if (targetDetails.symbolPosition === 'after') {
      return `${formattedAmount} ${targetDetails.symbol}`;
    }
    return `${targetDetails.symbol}${formattedAmount}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
