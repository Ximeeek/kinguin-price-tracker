import { PriceSnapshot, TrendAnalysis, TrendLabel, TrendDirection, VolatilityLevel } from '../../shared/types';

export const TREND_CONFIG = {
  TREND_WINDOW_DAYS: 14,
  TREND_THRESHOLD_PCT: 5.0,
  STABILITY_BAND_PCT: 6.0,
};

export class TrendEngine {
  static analyze(snapshots: PriceSnapshot[], firstTrackedAtStr: string): TrendAnalysis {
    if (!snapshots || snapshots.length === 0) {
      return this.insufficientData('Brak historii cen dla tego produktu.');
    }

    const firstTrackedAt = new Date(firstTrackedAtStr);
    const now = new Date();
    const totalHistoryDays = (now.getTime() - firstTrackedAt.getTime()) / (1000 * 3600 * 24);

    // Rule §8.1: Must have at least 14 days of tracked history since first_tracked_at
    if (totalHistoryDays < TREND_CONFIG.TREND_WINDOW_DAYS) {
      const remainingDays = Math.ceil(TREND_CONFIG.TREND_WINDOW_DAYS - totalHistoryDays);
      return this.insufficientData(
        `Wymagane minimum 14 dni historii cen (obecnie: ${Math.max(1, Math.floor(totalHistoryDays))} dni). Brakuje jeszcze ${remainingDays} dni.`
      );
    }

    // Filter snapshots within the recent TREND_WINDOW_DAYS
    const cutoffDate = new Date(now.getTime() - TREND_CONFIG.TREND_WINDOW_DAYS * 24 * 3600 * 1000);
    const windowSnapshots = snapshots.filter(s => new Date(s.checkedAt) >= cutoffDate);

    if (windowSnapshots.length < 2) {
      return this.insufficientData('Za mało punktów pomiarowych w ostatnich 14 dniach.');
    }

    // Calculate mean price & min/max
    const prices = windowSnapshots.map(s => s.price);
    const meanPrice = prices.reduce((acc, p) => acc + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (meanPrice <= 0) {
      return this.insufficientData('Nieprawidłowe dane cenowe.');
    }

    // Fit linear regression: price vs days_elapsed (from start of window)
    const windowStartTime = new Date(windowSnapshots[0].checkedAt).getTime();
    const dataPoints = windowSnapshots.map(s => ({
      x: (new Date(s.checkedAt).getTime() - windowStartTime) / (1000 * 3600 * 24),
      y: s.price
    }));

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((acc, p) => acc + p.x * p.x, 0);

    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;

    // Total drift percentage over the window
    const totalDriftPct = ((slope * TREND_CONFIG.TREND_WINDOW_DAYS) / meanPrice) * 100;

    // Range percentage for volatility check
    const rangePct = ((maxPrice - minPrice) / meanPrice) * 100;

    // Classify Direction
    let direction: TrendDirection = 'flat';
    if (totalDriftPct <= -TREND_CONFIG.TREND_THRESHOLD_PCT) {
      direction = 'down';
    } else if (totalDriftPct >= TREND_CONFIG.TREND_THRESHOLD_PCT) {
      direction = 'up';
    }

    // Classify Volatility
    const volatility: VolatilityLevel = rangePct <= TREND_CONFIG.STABILITY_BAND_PCT ? 'low' : 'high';

    // Map to Combined Label & Explanation
    const { label, explanation } = this.getLabelAndExplanation(direction, volatility, totalDriftPct, rangePct);

    return {
      direction,
      volatility,
      label,
      explanation,
      totalDriftPct: Math.round(totalDriftPct * 10) / 10,
      rangePct: Math.round(rangePct * 10) / 10,
      hasSufficientData: true
    };
  }

  private static getLabelAndExplanation(
    direction: TrendDirection,
    volatility: VolatilityLevel,
    driftPct: number,
    rangePct: number
  ): { label: TrendLabel; explanation: string } {
    if (direction === 'flat' && volatility === 'low') {
      return {
        label: 'Stable',
        explanation: 'Cena utrzymuje się w bardzo stabilnym przedziale w ciągu ostatnich 14 dni.'
      };
    }
    if (direction === 'flat' && volatility === 'high') {
      return {
        label: 'Fluctuating',
        explanation: `Cena waha się w przedziale ${Math.round(rangePct)}% bez wyraźnego stałego trendu.`
      };
    }
    if (direction === 'up' && volatility === 'low') {
      return {
        label: 'Steady increase',
        explanation: `Cena wykazuje stabilny wzrost o ok. ${Math.round(driftPct)}% w ciągu ostatnich 2 tygodni.`
      };
    }
    if (direction === 'up' && volatility === 'high') {
      return {
        label: 'Increasing (volatile)',
        explanation: `Cena rośnie, ale z wyrazistymi skokami (zmienność ok. ${Math.round(rangePct)}%).`
      };
    }
    if (direction === 'down' && volatility === 'low') {
      return {
        label: 'Steady decrease',
        explanation: `Cena konsekwentnie spada (spadek o ok. ${Math.abs(Math.round(driftPct))}%). Okazja do zakupu!`
      };
    }
    // down + high
    return {
      label: 'Decreasing (volatile)',
      explanation: `Cena wykazuje ogólny spadek z towarzyszącymi wahań cenowych.`
    };
  }

  private static insufficientData(reason: string): TrendAnalysis {
    return {
      direction: 'flat',
      volatility: 'low',
      label: 'Not enough data yet',
      explanation: reason,
      totalDriftPct: 0,
      rangePct: 0,
      hasSufficientData: false
    };
  }
}
