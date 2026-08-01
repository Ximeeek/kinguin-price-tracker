import React, { useState, useRef, useEffect } from 'react';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AddProductBarProps {
  onAddProduct: (url: string, setAsDefault: boolean) => Promise<{ success: boolean; error?: string }>;
  onAutoPasted?: () => void;
}

export const AddProductBar: React.FC<AddProductBarProps> = ({ onAddProduct, onAutoPasted }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAutoPastedRef = useRef<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await onAddProduct(url, setAsDefault);
      if (result.success) {
        setUrl('');
      } else {
        setError(result.error || t('addProduct.defaultError'));
      }
    } catch (err: any) {
      setError(err.message || t('addProduct.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const checkAutoPaste = async () => {
    const isEnabled = localStorage.getItem('kinguin_auto_paste_enabled') !== 'false';
    if (!isEnabled) return;

    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text ? text.trim() : '';

      if (trimmed && trimmed.includes('kinguin.net') && trimmed !== lastAutoPastedRef.current) {
        lastAutoPastedRef.current = trimmed;
        setUrl(trimmed);
        if (error) setError(null);
        if (onAutoPasted) {
          onAutoPasted();
        }
      }
    } catch {
      // Clipboard access might be disabled or denied
    }
  };

  useEffect(() => {
    const handleWindowFocus = () => {
      checkAutoPaste();
    };
    // Check initial window focus
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit} className="track-input-container">
        <LinkIcon size={18} color="var(--text-muted)" style={{ marginLeft: 4, flexShrink: 0, display: 'block' }} />
        <input
          type="text"
          className="track-input"
          placeholder={t('addProduct.placeholder')}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          disabled={loading}
        />
        <button type="submit" className="track-btn" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('addProduct.fetchingBtn')}
            </>
          ) : (
            <>
              <Plus size={16} />
              {t('addProduct.trackBtn')}
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6 }}>
        <input
          type="checkbox"
          id="setAsDefaultCheckbox"
          checked={setAsDefault}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          style={{
            accentColor: 'var(--accent-green)',
            width: 16,
            height: 16,
            cursor: 'pointer'
          }}
        />
        <label
          htmlFor="setAsDefaultCheckbox"
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: 500
          }}
        >
          {t('addProduct.setAsDefault')}
        </label>
      </div>

      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginTop: 8, marginLeft: 16, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
