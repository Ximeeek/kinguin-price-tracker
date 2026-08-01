import React, { useState } from 'react';
import { Eye, Globe, DollarSign, Star, Trash2, Clipboard } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../i18n/LanguageContext';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '../currency/CurrencyContext';

export type SearchScrollMode = 'translucent' | 'hidden';

interface SettingsViewProps {
  searchScrollMode?: SearchScrollMode;
  onSearchScrollModeChange?: (mode: SearchScrollMode) => void;
  defaultProductId?: string | null;
  onUnsetDefaultProduct?: () => void;
  autoPasteEnabled?: boolean;
  onAutoPasteChange?: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  searchScrollMode = 'translucent',
  onSearchScrollModeChange,
  defaultProductId,
  onUnsetDefaultProduct,
  autoPasteEnabled,
  onAutoPasteChange
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const [autoPaste, setAutoPaste] = useState<boolean>(() => {
    if (autoPasteEnabled !== undefined) return autoPasteEnabled;
    return localStorage.getItem('kinguin_auto_paste_enabled') !== 'false';
  });

  const handleToggleAutoPaste = (enabled: boolean) => {
    setAutoPaste(enabled);
    localStorage.setItem('kinguin_auto_paste_enabled', enabled ? 'true' : 'false');
    if (onAutoPasteChange) {
      onAutoPasteChange(enabled);
    }
  };

  const handleSelectMode = (mode: SearchScrollMode) => {
    localStorage.setItem('kinguin_search_bar_scroll_mode', mode);
    if (onSearchScrollModeChange) {
      onSearchScrollModeChange(mode);
    }
  };

  const hasDefaultProduct = defaultProductId && defaultProductId !== 'none';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>{t('settings.title')}</h2>

      {/* 1. Search Bar Scroll Behavior Setting */}
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

      {/* 2. Clipboard Auto-Paste Setting */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 260 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                flexShrink: 0
              }}
            >
              <Clipboard size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('settings.autoPasteTitle')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('settings.autoPasteDesc')}
              </div>
            </div>
          </div>

          <div className="pill-switcher" style={{ marginTop: 4 }}>
            <button
              type="button"
              className={`pill-button ${autoPaste ? 'active' : ''}`}
              onClick={() => handleToggleAutoPaste(true)}
            >
              {t('settings.autoPasteEnabled')}
            </button>
            <button
              type="button"
              className={`pill-button ${!autoPaste ? 'active' : ''}`}
              onClick={() => handleToggleAutoPaste(false)}
            >
              {t('settings.autoPasteDisabled')}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Language Setting */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 260 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                flexShrink: 0
              }}
            >
              <Globe size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('settings.languageTitle')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('settings.languageDesc')}
              </div>
            </div>
          </div>

          <div className="pill-switcher" style={{ marginTop: 4 }}>
            <button
              type="button"
              className={`pill-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English (EN)
            </button>
            <button
              type="button"
              className={`pill-button ${language === 'pl' ? 'active' : ''}`}
              onClick={() => setLanguage('pl')}
            >
              Polski (PL)
            </button>
          </div>
        </div>
      </div>

      {/* 4. Display Currency Setting */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 260 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                flexShrink: 0
              }}
            >
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('settings.currencyTitle')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('settings.currencyDesc')}
              </div>
            </div>
          </div>

          <div className="pill-switcher" style={{ marginTop: 4, flexWrap: 'wrap' }}>
            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
              <button
                key={c.code}
                type="button"
                className={`pill-button ${currency === c.code ? 'active' : ''}`}
                onClick={() => setCurrency(c.code as CurrencyCode)}
              >
                {c.code} ({c.symbol})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Pinned Default Game Preference */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 260 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-red)',
                flexShrink: 0
              }}
            >
              <Star size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('settings.defaultProductTitle')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {hasDefaultProduct
                  ? `${t('settings.defaultProductDesc')} (ID: ${defaultProductId})`
                  : t('settings.noDefaultSet')}
              </div>
            </div>
          </div>

          {hasDefaultProduct && onUnsetDefaultProduct && (
            <button
              type="button"
              className="pill-button"
              onClick={onUnsetDefaultProduct}
              style={{
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <Trash2 size={14} />
              {t('settings.clearDefaultBtn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
