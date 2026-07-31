import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';

interface AddProductBarProps {
  onAddProduct: (url: string) => Promise<{ success: boolean; error?: string }>;
}

export const AddProductBar: React.FC<AddProductBarProps> = ({ onAddProduct }) => {
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
        setError(result.error || 'Nie udało się dodać produktu.');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas dodawania.');
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
        <LinkIcon size={18} color="var(--text-muted)" style={{ marginLeft: 4 }} />
        <input
          type="text"
          className="track-input"
          placeholder="Wklej link do produktu Kinguin (np. https://www.kinguin.net/category/123456/...)"
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
            Wklej
          </button>
        )}
        <button type="submit" className="track-btn" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Pobieranie...
            </>
          ) : (
            <>
              <Plus size={16} />
              Śledź produkt
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
