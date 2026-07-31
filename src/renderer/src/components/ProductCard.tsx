import React from 'react';
import { Product, TrendLabel } from '../../../shared/types';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onRefresh,
  onDelete
}) => {
  const formatCurrency = (amount?: number, currencyCode = 'EUR') => {
    if (amount === undefined || amount === null) return '—';
    const symbol = currencyCode === 'EUR' ? '€' : currencyCode === 'USD' ? '$' : `${currencyCode} `;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="glass-card product-item-card" onClick={() => onSelect(product)}>
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-thumb"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="product-thumb-placeholder">
          {product.title.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="product-info">
        <div className="product-name" title={product.title}>
          {product.title}
        </div>
        <div className="product-meta">
          <span>ID: {product.id}</span>
          <span>•</span>
          <span>
            {product.lastCheckedAt
              ? new Date(product.lastCheckedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Nie sprawdzano'}
          </span>
        </div>
      </div>

      <div className="product-price-section">
        <div className="product-current-price">
          {formatCurrency(product.currentPrice, product.currency)}
        </div>

        <div style={{ marginTop: 6, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh(product.id);
            }}
            title="Odśwież cenę"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 2
            }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Czy na pewno chcesz usunąć "${product.title}"?`)) {
                onDelete(product.id);
              }
            }}
            title="Usuń śledzenie"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 2
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
