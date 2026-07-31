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

interface PriceChartProps {
  history: PriceSnapshot[];
  currency?: string;
  averagePrice?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  history,
  currency = 'EUR',
  averagePrice
}) => {
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
        Brak historii cen do wyświetlenia
      </div>
    );
  }

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : `${currency} `;

  const data = history.map((item) => {
    const d = new Date(item.checkedAt);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: d.toLocaleString(),
      price: item.price
    };
  });

  const prices = data.map((d) => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.9);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.1);

  return (
    <div style={{ width: '100%', height: 280, position: 'relative', marginTop: 12 }}>
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
            tickFormatter={(val) => `${symbol}${val}`}
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
                      {symbol}{item.price.toFixed(2)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {averagePrice && (
            <ReferenceLine
              y={averagePrice}
              stroke="var(--accent-gold)"
              strokeDasharray="4 4"
              label={{
                value: `Średnia: ${symbol}${averagePrice.toFixed(2)}`,
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
