import React from 'react';
import { TimePeriod } from '../../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onSelectPeriod: (period: TimePeriod) => void;
  totalDays?: number;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  totalDays
}) => {
  const { t } = useLanguage();

  const standardPeriods: { key: TimePeriod; label: string; minDaysNeeded: number }[] = [
    { key: 'week', label: t('period.week'), minDaysNeeded: 0 },
    { key: 'month', label: t('period.month'), minDaysNeeded: 7 },
    { key: 'six_months', label: t('period.six_months'), minDaysNeeded: 30 },
    { key: 'year', label: t('period.year'), minDaysNeeded: 180 }
  ];

  const allItem = { key: 'all' as TimePeriod, label: t('period.all'), minDaysNeeded: 0 };

  const getVisiblePeriods = () => {
    if (totalDays === undefined || totalDays === null) {
      return [...standardPeriods, allItem];
    }

    const visible: { key: TimePeriod; label: string; minDaysNeeded: number }[] = [];
    let addedAll = false;

    for (const p of standardPeriods) {
      if (totalDays > p.minDaysNeeded) {
        visible.push(p);
      } else {
        visible.push(allItem);
        addedAll = true;
        break;
      }
    }

    if (!addedAll) {
      visible.push(allItem);
    }

    return visible;
  };

  const visiblePeriods = getVisiblePeriods();

  return (
    <div className="pill-switcher">
      {visiblePeriods.map(({ key, label }) => (
        <button
          key={key}
          className={`pill-button ${selectedPeriod === key ? 'active' : ''}`}
          onClick={() => onSelectPeriod(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
