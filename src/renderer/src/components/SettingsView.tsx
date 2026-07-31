import React from 'react';
import { ShieldCheck, Clock, Database } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const SettingsView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>{t('settings.title')}</h2>

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
