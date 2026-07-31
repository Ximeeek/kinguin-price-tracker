import React from 'react';
import { Product } from '../../../shared/types';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();

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
              : t('productList.neverChecked')}
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
            title={t('productList.refreshTooltip')}
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
              if (window.confirm(t('productList.deleteConfirm', { title: product.title }))) {
                onDelete(product.id);
              }
            }}
            title={t('productList.deleteTooltip')}
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
