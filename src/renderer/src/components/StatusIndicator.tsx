import React, { useState, useRef, useEffect } from 'react';
import { Wifi, WifiOff, Database, RotateCw, ChevronRight, Activity, Zap } from 'lucide-react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useLanguage } from '../i18n/LanguageContext';

interface StatusIndicatorProps {
  onOpenNerdModal?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ onOpenNerdModal }) => {
  const { t } = useLanguage();
  const { isOnline, status, isLoading, refreshStatus } = useSystemStatus();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDbOk = status?.localDb?.connected ?? true;
  const isHealthy = isOnline && isDbOk;
  
  let statusColor = 'var(--accent-green)';
  let badgeBg = 'rgba(34, 197, 94, 0.12)';
  let badgeBorder = 'rgba(34, 197, 94, 0.3)';
  let labelText = '';

  if (!isOnline) {
    statusColor = '#f59e0b'; // Amber / Warning
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeBorder = 'rgba(245, 158, 11, 0.35)';
    labelText = t('systemStatus.offline');
  } else if (!isDbOk) {
    statusColor = '#ef4444'; // Red / Error
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeBorder = 'rgba(239, 68, 68, 0.35)';
    labelText = 'DB Error';
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Minimalist Status Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={!isOnline ? t('systemStatus.tooltipOffline') : !isDbOk ? t('systemStatus.tooltipDbError') : t('systemStatus.tooltipOk')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isHealthy ? 5 : 6,
          padding: isHealthy ? '5px 9px' : '5px 12px',
          borderRadius: '9999px',
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          color: 'var(--text-primary)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          backdropFilter: 'blur(8px)'
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
            animation: isHealthy ? 'pulseGlow 2s infinite' : 'none',
            flexShrink: 0
          }}
        />
        {isOnline ? (
          <Wifi size={13} style={{ color: statusColor, flexShrink: 0 }} />
        ) : (
          <WifiOff size={13} style={{ color: statusColor, flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: 11,
            color: statusColor,
            fontWeight: 700,
            maxWidth: isHealthy ? 0 : 120,
            opacity: isHealthy ? 0 : 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'inline-block',
            lineHeight: 1
          }}
        >
          {!isHealthy && labelText}
        </span>
      </button>

      {/* Sleek Popover Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 280,
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.96), rgba(8, 12, 18, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 14,
            padding: 14,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 197, 94, 0.1)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            animation: 'modalContentPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              <Activity size={15} color="var(--accent-green)" />
              {t('systemStatus.title')}
            </div>
            <button
              type="button"
              onClick={refreshStatus}
              disabled={isLoading}
              title={t('systemStatus.refresh')}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: 6,
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCw size={13} className={isLoading ? 'spin' : ''} />
            </button>
          </div>

          {/* Status Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {/* Internet Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                {isOnline ? <Wifi size={13} color="var(--accent-green)" /> : <WifiOff size={13} color="#f59e0b" />}
                <span>{t('systemStatus.internet')}</span>
              </div>
              <span style={{ fontWeight: 700, color: isOnline ? 'var(--accent-green)' : '#f59e0b' }}>
                {isOnline ? t('systemStatus.online') : t('systemStatus.offline')}
              </span>
            </div>

            {/* Local DB Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                <Database size={13} color="var(--accent-green)" />
                <span>{t('systemStatus.localDb')}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: status?.localDb?.connected ? 'var(--accent-green)' : '#ef4444' }}>
                  {status?.localDb?.connected ? t('systemStatus.connected') : t('systemStatus.disconnected')}
                </div>
                {status?.localDb?.connected && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {status.localDb.productCount} {t('systemStatus.productCount')} ({status.localDb.latencyMs}ms)
                  </div>
                )}
              </div>
            </div>

            {/* Remote DB Status */}
            {status?.remoteDb?.enabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <Zap size={13} color="var(--accent-cyan)" />
                  <span>{t('systemStatus.remoteDb')}</span>
                </div>
                <span style={{ fontWeight: 700, color: status.remoteDb.connected ? 'var(--accent-green)' : '#f59e0b' }}>
                  {status.remoteDb.connected ? `${t('systemStatus.connected')} (${status.remoteDb.latencyMs}ms)` : status.remoteDb.error || t('systemStatus.disconnected')}
                </span>
              </div>
            )}
          </div>

          {/* Zero-Cost Optimization Notice */}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(34, 197, 94, 0.05)', border: '1px dashed rgba(34, 197, 94, 0.2)', padding: '6px 8px', borderRadius: 6, lineHeight: 1.3 }}>
            ⚡ {t('systemStatus.optimizedNote')}
          </div>

          {/* Link to Full Specs */}
          {onOpenNerdModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNerdModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '7px 10px',
                color: 'var(--text-primary)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 2
              }}
            >
              <span>{t('systemStatus.openSpecs')}</span>
              <ChevronRight size={13} color="var(--accent-green)" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
