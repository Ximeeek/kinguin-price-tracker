import React from 'react';
import { Sparkles, Minus, Square, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const TitleBar: React.FC = () => {
  const { t } = useLanguage();

  const handleMinimize = () => {
    window.api?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.api?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.api?.closeWindow?.();
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 36,
        background: 'rgba(10, 13, 18, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        paddingLeft: 14,
        paddingRight: 6,
        userSelect: 'none',
        WebkitAppRegion: 'drag'
      } as React.CSSProperties}
    >
      {/* App Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/icon-32x32.png" alt="App Icon" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
          {t('header.title')}
        </span>
      </div>

      {/* Window Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="titlebar-btn"
          title="Minimize"
          style={btnStyle}
        >
          <Minus size={13} />
        </button>
        <button
          onClick={handleMaximize}
          className="titlebar-btn"
          title="Maximize / Restore"
          style={btnStyle}
        >
          <Square size={11} />
        </button>
        <button
          onClick={handleClose}
          className="titlebar-btn close-titlebar-btn"
          title="Close"
          style={btnStyle}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  width: 38,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s ease, color 0.15s ease'
};
