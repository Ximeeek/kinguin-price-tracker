import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { TimePeriod } from '../../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';
import { CustomTooltip } from './CustomTooltip';
import { parseCustomDays } from '../../../shared/timeUtils';
import { Info, X } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onSelectPeriod: (period: TimePeriod) => void;
  totalDays?: number;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  totalDays
}) => {
  const { t } = useLanguage();
  const [customText, setCustomText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  useLockBodyScroll(showInfoModal);

  const standardPeriods: { key: TimePeriod; label: string; minDaysNeeded: number }[] = [
    { key: 'week', label: t('period.week'), minDaysNeeded: 7 },
    { key: 'month', label: t('period.month'), minDaysNeeded: 30 },
    { key: 'six_months', label: t('period.six_months'), minDaysNeeded: 180 },
    { key: 'year', label: t('period.year'), minDaysNeeded: 365 }
  ];

  const allItem = { key: 'all' as TimePeriod, label: t('period.all') };

  const getVisiblePeriods = () => {
    if (totalDays === undefined || totalDays === null) {
      return [...standardPeriods, allItem];
    }

    const visible: { key: TimePeriod; label: string }[] = [];
    for (const p of standardPeriods) {
      if (totalDays >= p.minDaysNeeded) {
        visible.push(p);
      }
    }
    visible.push(allItem);
    return visible;
  };

  const visiblePeriods = getVisiblePeriods();
  const isCustomActive = selectedPeriod.startsWith('custom_') || (!visiblePeriods.some(p => p.key === selectedPeriod) && selectedPeriod !== 'all');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const parsed = parseCustomDays(customText.trim());
    if (parsed.isValid) {
      setErrorMsg(null);
      onSelectPeriod(`custom_${parsed.days}`);
    } else {
      setErrorMsg(t('period.customFormatError'));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div className="pill-switcher">
          {visiblePeriods.map(({ key, label }) => (
            <button
              key={key}
              className={`pill-button ${selectedPeriod === key ? 'active' : ''}`}
              onClick={() => {
                setCustomText('');
                setErrorMsg(null);
                onSelectPeriod(key);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <CustomTooltip text={t('period.customTooltip')} position="bottom">
            <form onSubmit={handleCustomSubmit} style={{ display: 'inline-flex' }}>
              <input
                type="text"
                className="track-input"
                placeholder={t('period.customPlaceholder')}
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  height: '30px',
                  width: '95px',
                  borderRadius: '9999px',
                  background: errorMsg
                    ? 'rgba(239, 68, 68, 0.15)'
                    : isCustomActive
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: errorMsg
                    ? '1px solid var(--accent-red)'
                    : isCustomActive
                    ? '1px solid var(--accent-green)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  color: errorMsg
                    ? 'var(--accent-red)'
                    : isCustomActive
                    ? 'var(--accent-green)'
                    : 'var(--text-primary)',
                  fontWeight: 600,
                  outline: 'none',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              />
            </form>
          </CustomTooltip>

          {/* Small Info (i) Icon Button */}
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title={t('period.infoTitle')}
          >
            <Info size={13} />
          </button>

          {/* Red Error Message Floating Badge */}
          {errorMsg && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: 'rgba(36, 14, 18, 0.95)',
                border: '1px solid var(--accent-red)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: 'var(--accent-red)',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                zIndex: 99,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Info Help Modal Popup (Fixed Viewport Centered via Portal) */}
      {showInfoModal &&
        createPortal(
          <div
            onClick={() => setShowInfoModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: 20
            }}
          >
            <div
              className="glass-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 440,
                padding: '24px 28px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.98), rgba(12, 16, 24, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(6, 182, 212, 0.15)',
                animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {t('period.infoTitle')}
                    </h3>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t('period.infoSubtitle')}
                    </div>
                  </div>
                </div>

                <button
                  className="close-btn"
                  onClick={() => setShowInfoModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: 'var(--text-muted)',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Units Grid Cards (2x2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span className="badge badge-green" style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', width: 28, textAlign: 'center' }}>d</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t('period.unitDays')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('period.example')} 5d, 14d</div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span className="badge badge-cyan" style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', width: 28, textAlign: 'center' }}>w</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t('period.unitWeeks')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('period.example')} 2w, 3w</div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span className="badge badge-gold" style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', width: 28, textAlign: 'center' }}>m</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t('period.unitMonths')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('period.example')} 1m, 3m</div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span className="badge badge-red" style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', width: 28, textAlign: 'center' }}>y</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t('period.unitYears')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('period.example')} 1y, 2y</div>
                  </div>
                </div>
              </div>

              {/* Gold Note Callout Box */}
              <div
                style={{
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: 'var(--accent-gold)',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}
              >
                ℹ️ {t('period.infoNote')}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
