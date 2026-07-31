import React from 'react';
import { Home, LineChart, Settings } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type NavTab = 'tracker' | 'analytics' | 'settings';

interface BottomNavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useLanguage();

  return (
    <div className="floating-bottom-nav">
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
