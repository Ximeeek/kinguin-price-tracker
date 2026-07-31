import React from 'react';
import { TimePeriod } from '../../../shared/types';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onSelectPeriod: (period: TimePeriod) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onSelectPeriod }) => {
  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
    { key: 'six_months', label: '6 Months' },
    { key: 'year', label: 'Yearly' }
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
