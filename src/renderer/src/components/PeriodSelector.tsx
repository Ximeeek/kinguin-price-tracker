import React from 'react';
import { TimePeriod } from '../../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onSelectPeriod: (period: TimePeriod) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onSelectPeriod }) => {
  const { t } = useLanguage();

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: t('period.week') },
    { key: 'month', label: t('period.month') },
    { key: 'six_months', label: t('period.six_months') },
    { key: 'year', label: t('period.year') }
  ];

  return (
    <div className="pill-switcher">
      {periods.map(({ key, label }) => (
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
