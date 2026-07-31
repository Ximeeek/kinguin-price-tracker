import { PriceSnapshot, AverageAnalysis, TimePeriod } from '../../shared/types';

export class AverageEngine {
  static analyze(
    snapshots: PriceSnapshot[],
    currentPrice: number,
    period: TimePeriod = 'month'
  ): AverageAnalysis {
    if (!snapshots || snapshots.length === 0) {
      return {
        period,
        averagePrice: currentPrice,
        currentPrice,
        deltaPct: 0,
        label: 'About average',
        dataPointCount: 1,
        dataAgeDays: 0,
        note: 'No prior historical data.'
      };
    }

    const now = new Date();
    const periodDays = this.getPeriodDays(period);
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 3600 * 1000);

    const filteredSnapshots = snapshots.filter(s => new Date(s.checkedAt) >= cutoffDate);
    const targetSnapshots = filteredSnapshots.length > 0 ? filteredSnapshots : snapshots;

    const prices = targetSnapshots.map(s => s.price);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const averagePrice = sum / prices.length;

    const oldestDate = new Date(targetSnapshots[0].checkedAt);
    const actualDaysCount = Math.max(1, Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24)));

    let deltaPct = 0;
    if (averagePrice > 0) {
      deltaPct = ((currentPrice - averagePrice) / averagePrice) * 100;
    }

    const absDelta = Math.abs(deltaPct);
    let label = 'About average';

    if (absDelta < 1.5) {
      label = 'About average';
    } else if (deltaPct <= -1.5) {
      label = `${Math.abs(Math.round(deltaPct * 10) / 10)}% below average`;
    } else {
      label = `${Math.round(deltaPct * 10) / 10}% above average`;
    }

    let note: string | undefined = undefined;
    if (actualDaysCount < periodDays) {
      note = `Based on ${actualDaysCount} days of collected data`;
    }

    return {
      period,
      averagePrice: Math.round(averagePrice * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      deltaPct: Math.round(deltaPct * 10) / 10,
      label,
      dataPointCount: targetSnapshots.length,
      dataAgeDays: actualDaysCount,
      note
    };
  }

  private static getPeriodDays(period: TimePeriod): number {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'six_months':
        return 180;
      case 'year':
        return 365;
      default:
        return 30;
    }
  }
}
