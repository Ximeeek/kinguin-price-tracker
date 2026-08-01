import { PriceSnapshot, AverageAnalysis, TimePeriod } from '../../shared/types';
import { parseCustomDays } from '../../shared/timeUtils';

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
        labelKey: 'average.about',
        dataPointCount: 1,
        dataAgeDays: 0,
        note: 'No prior historical data.',
        noteKey: 'average.noteNoData'
      };
    }

    const now = new Date();
    const periodDays = this.getPeriodDays(period);
    const cutoffDate = isFinite(periodDays)
      ? new Date(now.getTime() - periodDays * 24 * 3600 * 1000)
      : new Date(0);

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
    const roundedAbsDelta = Math.abs(Math.round(deltaPct * 10) / 10);
    const roundedDelta = Math.round(deltaPct * 10) / 10;

    let label = 'About average';
    let labelKey = 'average.about';
    let labelParams: Record<string, string | number> | undefined = undefined;

    if (absDelta < 1.5) {
      label = 'About average';
      labelKey = 'average.about';
    } else if (deltaPct <= -1.5) {
      label = `${roundedAbsDelta}% below average`;
      labelKey = 'average.below';
      labelParams = { pct: roundedAbsDelta };
    } else {
      label = `${roundedDelta}% above average`;
      labelKey = 'average.above';
      labelParams = { pct: roundedDelta };
    }

    let note: string | undefined = undefined;
    let noteKey: string | undefined = undefined;
    let noteParams: Record<string, string | number> | undefined = undefined;

    if (period === 'all') {
      note = `Based on ${actualDaysCount} days of total tracking data`;
      noteKey = 'average.noteAllDays';
      noteParams = { days: actualDaysCount };
    } else if (actualDaysCount < periodDays && isFinite(periodDays)) {
      note = `Based on ${actualDaysCount} days of collected data`;
      noteKey = 'average.noteCollectedDays';
      noteParams = { days: actualDaysCount };
    }

    return {
      period,
      averagePrice: Math.round(averagePrice * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      deltaPct: Math.round(deltaPct * 10) / 10,
      label,
      labelKey,
      labelParams,
      dataPointCount: targetSnapshots.length,
      dataAgeDays: actualDaysCount,
      note,
      noteKey,
      noteParams
    };
  }

  private static getPeriodDays(period: TimePeriod): number {
    return parseCustomDays(period).days;
  }
}
