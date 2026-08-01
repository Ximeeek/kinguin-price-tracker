/**
 * Result structure for parsed period
 */
export interface ParsedPeriod {
  days: number;
  isValid: boolean;
}

/**
 * Parses a period string (e.g. 'week', 'month', 'six_months', 'year', 'all', '14d', '2w', '3m', '1y', 'custom_14')
 * into the number of days and validation status.
 */
export function parseCustomDays(period: string): ParsedPeriod {
  if (!period) return { days: 30, isValid: false };
  if (period === 'week') return { days: 7, isValid: true };
  if (period === 'month') return { days: 30, isValid: true };
  if (period === 'six_months') return { days: 180, isValid: true };
  if (period === 'year') return { days: 365, isValid: true };
  if (period === 'all') return { days: Infinity, isValid: true };

  const raw = period.replace(/^custom_/, '').trim().toLowerCase();

  // Support number with optional unit suffix (d, w, m, y). Default unit is 'd' if omitted.
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*([dwmy])?$/);
  if (!match) {
    return { days: 0, isValid: false };
  }

  const val = parseFloat(match[1]);
  const unit = match[2] || 'd';

  let days = val;
  if (unit === 'd') days = val;
  else if (unit === 'w') days = val * 7;
  else if (unit === 'm') days = val * 30;
  else if (unit === 'y') days = val * 365;

  const finalDays = Math.round(days);
  const isValid = finalDays >= 1;

  return { days: isValid ? finalDays : 0, isValid };
}
