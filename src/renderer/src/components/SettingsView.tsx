import React from 'react';
import { ShieldCheck, Clock, Database, Eye } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type SearchScrollMode = 'translucent' | 'hidden';

interface SettingsViewProps {
  searchScrollMode?: SearchScrollMode;
  onSearchScrollModeChange?: (mode: SearchScrollMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  searchScrollMode = 'translucent',
  onSearchScrollModeChange
}) => {
  const { t } = useLanguage();

  const handleSelectMode = (mode: SearchScrollMode) => {
    localStorage.setItem('kinguin_search_bar_scroll_mode', mode);
    if (onSearchScrollModeChange) {
      onSearchScrollModeChange(mode);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>{t('settings.title')}</h2>

      {/* Search Bar Scroll Behavior Setting */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 260 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)',
                flexShrink: 0
              }}
            >
              <Eye size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('settings.searchModeTitle')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('settings.searchModeDesc')}
              </div>
            </div>
          </div>

          <div className="pill-switcher" style={{ marginTop: 4 }}>
            <button
              type="button"
              className={`pill-button ${searchScrollMode === 'translucent' ? 'active' : ''}`}
              onClick={() => handleSelectMode('translucent')}
            >
              {t('settings.searchModeTranslucent')}
            </button>
            <button
              type="button"
              className={`pill-button ${searchScrollMode === 'hidden' ? 'active' : ''}`}
              onClick={() => handleSelectMode('hidden')}
            >
              {t('settings.searchModeHidden')}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-green-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t('settings.sqliteTitle')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('settings.sqliteDesc')}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-cyan-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t('settings.ttlTitle')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('settings.ttlDesc')}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-gold-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}
          >
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t('settings.repoTitle')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('settings.repoDesc')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
