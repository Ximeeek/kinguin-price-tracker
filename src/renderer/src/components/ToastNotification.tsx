import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
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
        maxWidth: 380
      }}
    >
      <div style={{ color: isSuccess ? 'var(--accent-green)' : 'var(--accent-red)', flexShrink: 0 }}>
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
        {toast.text}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
