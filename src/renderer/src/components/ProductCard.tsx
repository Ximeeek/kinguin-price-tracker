import React, { useState } from 'react';
import { Product } from '../../../shared/types';
import { RefreshCw, Trash2, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { ConfirmModal } from './ConfirmModal';
import { PriceChangeIndicator } from './PriceChangeIndicator';

import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isDefault?: boolean;
  isRefreshing?: boolean;
  onSelect: (product: Product) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isDefault = false,
  isRefreshing = false,
  onSelect,
  onRefresh,
  onDelete,
  onSetDefault
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className={`glass-card product-item-card ${isDefault ? 'is-default-card' : ''}`} onClick={() => onSelect(product)}>
        <ProductImage
          src={product.imageUrl}
          alt={product.title}
          width={64}
          height={64}
          borderRadius="var(--radius-md)"
        />

        <div className="product-info">
          <div className="product-name" title={product.title} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{product.title}</span>
            {isDefault && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                {t('productList.isDefaultBadge')}
              </span>
            )}
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
          <div className="product-current-price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <span>{formatPrice(product.currentPrice || 0, product.currency)}</span>
            <PriceChangeIndicator
              currentPrice={product.currentPrice}
              previousPrice={product.previousPrice}
              currency={product.currency}
              showDiff={false}
              tooltipPosition="bottom"
            />
          </div>

          <div style={{ marginTop: 6, display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isRefreshing) onRefresh(product.id);
              }}
              disabled={isRefreshing}
              title={t('productList.refreshTooltip')}
              className="card-action-btn card-action-refresh"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spinning' : ''} />
            </button>

            {onSetDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDefault) {
                    onSetDefault('none');
                  } else {
                    onSetDefault(product.id);
                  }
                }}
                title={isDefault ? t('productList.unsetDefaultTooltip') : t('productList.setDefaultTooltip')}
                className={`card-action-btn card-action-star ${isDefault ? 'is-starred' : ''}`}
              >
                <Star size={14} className="star-icon" fill={isDefault ? 'var(--accent-gold)' : 'none'} />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title={t('productList.deleteTooltip')}
              className="card-action-btn card-action-trash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        itemTitle={product.title}
        onConfirm={() => onDelete(product.id)}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
