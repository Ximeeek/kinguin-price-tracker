import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface FailedProductInfo {
  id: string;
  title: string;
  error?: string;
  errorKey?: string;
  errorParams?: Record<string, string | number>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
  failedProducts?: FailedProductInfo[];
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expand state when toast changes
  useEffect(() => {
    setIsExpanded(false);
  }, [toast?.id]);

  // Handle auto-dismiss timer (paused when expanded)
  useEffect(() => {
    if (!toast) return;

    if (isExpanded) {
      // Pause auto-dismiss when user expands details to read failed items
      return;
    }

    const duration = toast.failedProducts && toast.failedProducts.length > 0 ? 6000 : 3500;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, isExpanded, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const hasFailedProducts = Boolean(toast.failedProducts && toast.failedProducts.length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        background: isSuccess
          ? 'linear-gradient(135deg, rgba(22, 36, 26, 0.95), rgba(14, 26, 20, 0.98))'
          : 'linear-gradient(135deg, rgba(36, 22, 26, 0.95), rgba(26, 14, 18, 0.98))',
        border: isSuccess ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: isSuccess
          ? '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(34, 197, 94, 0.2)'
          : '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(239, 68, 68, 0.2)',
        color: 'var(--text-primary)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
        width: 'calc(100vw - 48px)',
        maxWidth: 400,
        overflow: 'hidden'
      }}
    >
      {/* Toast Header */}
      <div
        onClick={() => {
          if (hasFailedProducts) {
            setIsExpanded((prev) => !prev);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          cursor: hasFailedProducts ? 'pointer' : 'default',
          userSelect: 'none'
        }}
      >
        <div style={{ color: isSuccess ? 'var(--accent-green)' : 'var(--accent-red)', flexShrink: 0 }}>
          {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
          {toast.text}
        </div>

        {hasFailedProducts && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--accent-red)',
              fontSize: 12,
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      {/* Expanded Failed Products List */}
      {hasFailedProducts && isExpanded && (
        <div
          style={{
            borderTop: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '8px 16px 14px 16px',
            maxHeight: 220,
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {toast.failedProducts!.map((item, idx) => (
            <div
              key={item.id + '_' + idx}
              style={{
                padding: '8px 0',
                borderBottom:
                  idx < toast.failedProducts!.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  wordBreak: 'break-word',
                  lineHeight: 1.3
                }}
              >
                {item.title}
              </div>
              {(item.errorKey || item.error) && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(239, 68, 68, 0.9)',
                    marginTop: 3,
                    wordBreak: 'break-word',
                    lineHeight: 1.3
                  }}
                >
                  {item.errorKey ? t(item.errorKey as any, item.errorParams) : item.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
