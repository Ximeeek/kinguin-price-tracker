import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { PriceSnapshot } from '../../../shared/types';
import { useCurrency, SUPPORTED_CURRENCIES } from '../currency/CurrencyContext';
import { useLanguage } from '../i18n/LanguageContext';

interface PriceChartProps {
  history: PriceSnapshot[];
  currency?: string;
  averagePrice?: number;
  animClass?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  history,
  currency = 'EUR',
  averagePrice,
  animClass = ''
}) => {
  const { currency: activeCurrency, convertPrice, formatPrice } = useCurrency();
  const { t } = useLanguage();

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}
      >
        {t('modal.noChartData')}
      </div>
    );
  }

  const details = SUPPORTED_CURRENCIES[activeCurrency] || SUPPORTED_CURRENCIES.EUR;
  const symbol = details.symbol;

  const data = history.map((item) => {
    const d = new Date(item.checkedAt);
    const converted = convertPrice(item.price, currency);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: d.toLocaleString(),
      price: Math.round(converted * 100) / 100
    };
  });

  const convertedAverage = averagePrice !== undefined ? convertPrice(averagePrice, currency) : undefined;

  const prices = data.map((d) => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.9);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.1);

  return (
    <div
      className={animClass}
      style={{
        width: '100%',
        height: 280,
        position: 'relative',
        marginTop: 12,
        overflow: 'hidden',
        borderRadius: '12px'
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => details.symbolPosition === 'after' ? `${val} ${symbol}` : `${symbol}${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div
                    style={{
                      background: 'rgba(14, 18, 26, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.fullDate}</div>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 800, fontSize: '16px', marginTop: 2 }}>
                      {details.symbolPosition === 'after' ? `${item.price.toFixed(2)} ${symbol}` : `${symbol}${item.price.toFixed(2)}`}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {convertedAverage !== undefined && (
            <ReferenceLine
              y={convertedAverage}
              stroke="var(--accent-gold)"
              strokeDasharray="4 4"
              label={{
                value: t('modal.averageLineLabel', { amount: details.symbolPosition === 'after' ? `${convertedAverage.toFixed(2)} ${symbol}` : `${symbol}${convertedAverage.toFixed(2)}` }),
                fill: 'var(--accent-gold)',
                fontSize: 11,
                position: 'top'
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
