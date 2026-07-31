import React from 'react';
import { useLanguage, SupportedLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--bg-input)',
        border: '1px solid var(--border-card)',
        borderRadius: '9999px',
        padding: '4px 10px'
      }}
    >
      <Globe size={14} color="var(--text-muted)" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: 12,
          fontWeight: 700,
          outline: 'none',
          cursor: 'pointer',
          paddingRight: 4
        }}
      >
        <option value="en" style={{ background: '#0e121a', color: '#fff' }}>
          EN
        </option>
        <option value="pl" style={{ background: '#0e121a', color: '#fff' }}>
          PL
        </option>
      </select>
    </div>
  );
};
