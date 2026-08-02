import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { X } from 'lucide-react';
import { PriceSnapshot, TimePeriod } from '../../../shared/types';
import { useCurrency, SUPPORTED_CURRENCIES } from '../currency/CurrencyContext';
import { useLanguage } from '../i18n/LanguageContext';
import { parseCustomDays } from '../../../shared/timeUtils';

interface PriceChartProps {
  history: PriceSnapshot[];
  currency?: string;
  averagePrice?: number;
  selectedPeriod?: TimePeriod;
  animClass?: string;
}

function generateYAxisTicks(minY: number, maxY: number, targetCount = 5): number[] {
  if (minY >= maxY) {
    minY = Math.max(0, minY - 5);
    maxY = maxY + 5;
  }
  const range = maxY - minY;
  const rawStep = range / Math.max(1, targetCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(0.001, rawStep))));
  const residual = rawStep / magnitude;

  let niceStep: number;
  if (residual > 5) niceStep = 10 * magnitude;
  else if (residual > 2.5) niceStep = 5 * magnitude;
  else if (residual > 1.25) niceStep = 2 * magnitude;
  else niceStep = 1 * magnitude;

  if (niceStep < 1) niceStep = 1;

  const start = Math.floor(minY / niceStep) * niceStep;
  const end = Math.ceil(maxY / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = start; val <= end + niceStep * 0.001; val += niceStep) {
    ticks.push(Math.round(val));
  }
  return Array.from(new Set(ticks)).sort((a, b) => a - b);
}

function generateXAxisTicks(minX: number, maxX: number, targetCount = 6): number[] {
  if (minX >= maxX) return [minX];
  const step = (maxX - minX) / Math.max(1, targetCount - 1);
  const ticks: number[] = [];
  for (let i = 0; i < targetCount; i++) {
    ticks.push(Math.round(minX + i * step));
  }
  return ticks;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  history,
  currency = 'EUR',
  averagePrice,
  selectedPeriod,
  animClass = ''
}) => {
  const { currency: activeCurrency, convertPrice } = useCurrency();
  const { t } = useLanguage();

  const details = SUPPORTED_CURRENCIES[activeCurrency] || SUPPORTED_CURRENCIES.EUR;
  const symbol = details.symbol;

  const data = useMemo(() => {
    if (!history || history.length === 0) return [];
    return history
      .map((item) => {
        let d: Date;
        if (typeof item.checkedAt === 'string') {
          const dateOnly = item.checkedAt.substring(0, 10);
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            const [y, m, day] = dateOnly.split('-').map(Number);
            d = new Date(y, m - 1, day, 12, 0, 0);
          } else {
            d = new Date(item.checkedAt);
          }
        } else {
          d = new Date(item.checkedAt);
        }

        const timestamp = d.getTime();
        const converted = convertPrice(item.price, currency);
        return {
          timestamp,
          fullDate: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
          price: Math.round(converted * 100) / 100
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [history, currency, convertPrice]);

  const [zoomDomain, setZoomDomain] = useState<{ minX: number; maxX: number } | null>(null);
  const [renderedDomain, setRenderedDomain] = useState<{ minX: number; maxX: number; minY: number; maxY: number } | null>(null);

  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const prevDataLengthRef = useRef<number>(data.length);

  const computeTargetDomain = (
    period?: TimePeriod,
    customZoom?: { minX: number; maxX: number } | null
  ) => {
    if (data.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };

    const oldestTime = data[0].timestamp;
    const newestTime = data[data.length - 1].timestamp;

    let targetMinX = oldestTime;
    let targetMaxX = newestTime;

    if (customZoom) {
      targetMinX = Math.max(oldestTime, Math.min(customZoom.minX, customZoom.maxX));
      targetMaxX = Math.min(newestTime, Math.max(customZoom.minX, customZoom.maxX));
    } else if (period) {
      const parsed = parseCustomDays(period);
      if (isFinite(parsed.days) && parsed.days > 0) {
        const cutoff = newestTime - parsed.days * 24 * 3600 * 1000;
        targetMinX = Math.max(oldestTime, cutoff);
      }
    }

    if (targetMaxX - targetMinX < 3600 * 1000) {
      targetMinX = targetMaxX - 3600 * 1000;
    }

    const visiblePoints = data.filter((d) => d.timestamp >= targetMinX && d.timestamp <= targetMaxX);
    const relevantPoints = visiblePoints.length > 0 ? visiblePoints : data;
    const prices = relevantPoints.map((d) => d.price);

    let rawMinY = Math.min(...prices);
    let rawMaxY = Math.max(...prices);

    if (rawMinY === rawMaxY) {
      rawMinY = Math.max(0, rawMinY - 5);
      rawMaxY = rawMaxY + 5;
    } else {
      const pad = (rawMaxY - rawMinY) * 0.08;
      rawMinY = Math.max(0, rawMinY - pad);
      rawMaxY = rawMaxY + pad;
    }

    const yTicks = generateYAxisTicks(rawMinY, rawMaxY, 5);
    const targetMinY = yTicks[0];
    const targetMaxY = yTicks[yTicks.length - 1];

    return { minX: targetMinX, maxX: targetMaxX, minY: targetMinY, maxY: targetMaxY };
  };

  // Reset zoom when period changes
  useEffect(() => {
    setZoomDomain(null);
  }, [selectedPeriod]);

  // Global click outside listener to exit zoom mode
  useEffect(() => {
    if (!zoomDomain) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setZoomDomain(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleGlobalClick);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleGlobalClick);
    };
  }, [zoomDomain]);

  // Animated domain transition
  useEffect(() => {
    if (data.length === 0) return;
    const target = computeTargetDomain(selectedPeriod, zoomDomain);

    if (!renderedDomain || Math.abs(data.length - prevDataLengthRef.current) > 2) {
      setRenderedDomain(target);
      prevDataLengthRef.current = data.length;
      return;
    }

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const start = { ...renderedDomain };
    const duration = 400; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      const currentMinX = start.minX + (target.minX - start.minX) * ease;
      const currentMaxX = start.maxX + (target.maxX - start.maxX) * ease;
      const currentMinY = start.minY + (target.minY - start.minY) * ease;
      const currentMaxY = start.maxY + (target.maxY - start.maxY) * ease;

      setRenderedDomain({
        minX: currentMinX,
        maxX: currentMaxX,
        minY: currentMinY,
        maxY: currentMaxY
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
    prevDataLengthRef.current = data.length;

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [data, selectedPeriod, zoomDomain]);

  if (!history || history.length === 0 || data.length === 0) {
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

  const currentTarget = computeTargetDomain(selectedPeriod, zoomDomain);
  const activeDomain = renderedDomain || currentTarget;

  const yTicks = generateYAxisTicks(activeDomain.minY, activeDomain.maxY, 5);
  const xTicks = generateXAxisTicks(activeDomain.minX, activeDomain.maxX, 6);

  const convertedAverage = averagePrice !== undefined ? convertPrice(averagePrice, currency) : undefined;

  const formatXAxisTick = (val: number) => {
    const d = new Date(val);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatYAxisTick = (val: number) => {
    const rounded = Math.round(val);
    return details.symbolPosition === 'after' ? `${rounded} ${symbol}` : `${symbol}${rounded}`;
  };

  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight(e.activeLabel);
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isSelecting && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && refAreaLeft !== null && refAreaRight !== null) {
      const min = Math.min(refAreaLeft, refAreaRight);
      const max = Math.max(refAreaLeft, refAreaRight);
      // Zoom if selected span is greater than 10 minutes
      if (max - min > 10 * 60 * 1000) {
        setZoomDomain({ minX: min, maxX: max });
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  };

  return (
    <div
      ref={containerRef}
      className={animClass}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
        height: 280,
        position: 'relative',
        marginTop: 12,
        overflow: 'hidden',
        borderRadius: '12px',
        userSelect: 'none'
      }}
    >
      {/* Active Zoom Mode Indicator Banner */}
      {zoomDomain && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
            color: '#ffffff',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8'
              }}
            />
            <span>{t('chart.customRangeActive')}:</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {new Date(zoomDomain.minX).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
              {new Date(zoomDomain.maxX).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div style={{ width: 1, height: 12, background: 'rgba(255, 255, 255, 0.2)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.55)' }}>
            {t('chart.clickToReset')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomDomain(null);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          >
            <X size={12} />
            {t('chart.resetBtn')}
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 24, right: 14, left: -10, bottom: 0 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            type="number"
            dataKey="timestamp"
            domain={[activeDomain.minX, activeDomain.maxX]}
            ticks={xTicks}
            allowDataOverflow={true}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickFormatter={formatXAxisTick}
          />
          <YAxis
            type="number"
            domain={[activeDomain.minY, activeDomain.maxY]}
            ticks={yTicks}
            allowDataOverflow={true}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisTick}
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

          {/* White Drag-Selection Overlay */}
          {refAreaLeft !== null && refAreaRight !== null && refAreaLeft !== refAreaRight && (
            <ReferenceArea
              x1={Math.min(refAreaLeft, refAreaRight)}
              x2={Math.max(refAreaLeft, refAreaRight)}
              stroke="#ffffff"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="rgba(255, 255, 255, 0.18)"
              isFront={true}
            />
          )}

          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#priceGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
