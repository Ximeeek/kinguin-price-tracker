import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AddProductBarProps {
  onAddProduct: (url: string) => Promise<{ success: boolean; error?: string }>;
}

export const AddProductBar: React.FC<AddProductBarProps> = ({ onAddProduct }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await onAddProduct(url);
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes('kinguin.net')) {
        setUrl(text);
      }
    } catch {
      // Clipboard access might be disabled or empty
    }
  };

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
        {!url && (
          <button
            type="button"
            onClick={handlePaste}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              paddingRight: 8
            }}
          >
            {t('addProduct.pasteBtn')}
          </button>
        )}
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
      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginTop: 8, marginLeft: 16, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
