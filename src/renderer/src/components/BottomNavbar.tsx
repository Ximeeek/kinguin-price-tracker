import React from 'react';
import { Home, LineChart, Settings } from 'lucide-react';

export type NavTab = 'tracker' | 'analytics' | 'settings';

interface BottomNavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="floating-bottom-nav">
      <button
        className={`nav-item-btn ${activeTab === 'tracker' ? 'active' : ''}`}
        onClick={() => onSelectTab('tracker')}
        title="Śledzenie produktów"
      >
        <Home size={20} />
      </button>

      <button
        className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
        title="Statystyki i analizy"
      >
        <LineChart size={20} />
      </button>

      <button
        className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
        title="Ustawienia aplikacji"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};
