import React from 'react';
import { Home, LineChart, Settings } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type NavTab = 'tracker' | 'analytics' | 'settings';

interface BottomNavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const TAB_INDEXES: Record<NavTab, number> = {
  tracker: 0,
  analytics: 1,
  settings: 2
};

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useLanguage();
  const activeIndex = TAB_INDEXES[activeTab] ?? 0;

  return (
    <div className="floating-bottom-nav">
      <div
        className="nav-active-pill"
        style={{ transform: `translateX(${activeIndex * 52}px)` }}
      />

      <button
        className={`nav-item-btn ${activeTab === 'tracker' ? 'active' : ''}`}
        onClick={() => onSelectTab('tracker')}
        title={t('nav.tracker')}
      >
        <Home size={20} />
      </button>

      <button
        className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
        title={t('nav.analytics')}
      >
        <LineChart size={20} />
      </button>

      <button
        className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
        title={t('nav.settings')}
      >
        <Settings size={20} />
      </button>
    </div>
  );
};

