import React, { useState } from 'react';
import { Product } from '../../../shared/types';
import { RefreshCw, Trash2, Star, Clock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { ConfirmModal } from './ConfirmModal';
import { PriceChangeIndicator } from './PriceChangeIndicator';
import { CustomTooltip } from './CustomTooltip';

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

const ScrollableTitle: React.FC<{
  title: string;
  isDefault?: boolean;
  defaultBadgeText?: string;
}> = ({ title, isDefault, defaultBadgeText }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const [transitionDuration, setTransitionDuration] = React.useState(0);

  const handleMouseEnter = () => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      const diff = textWidth - containerWidth;
      if (diff > 3) {
        setScrollOffset(diff);
        const duration = Math.max(1.2, diff / 35);
        setTransitionDuration(duration);
        setIsHovered(true);
        return;
      }
    }
    setIsHovered(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrollOffset(0);
    setTransitionDuration(0.35);
  };

  return (
    <div className="product-title-row">
      <div
        ref={containerRef}
        className="product-title-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          ref={textRef}
          className={`product-title-text ${isHovered && scrollOffset > 0 ? 'is-scrolling' : ''}`}
          style={{
            transform: isHovered && scrollOffset > 0 ? `translateX(-${scrollOffset}px)` : 'translateX(0px)',
            transition: isHovered && scrollOffset > 0
              ? `transform ${transitionDuration}s linear`
              : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          title={title}
        >
          {title}
        </span>
      </div>

      {isDefault && (
        <span className="product-default-badge">
          {defaultBadgeText}
        </span>
      )}
    </div>
  );
};

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
          <ScrollableTitle
            title={product.title}
            isDefault={isDefault}
            defaultBadgeText={t('productList.isDefaultBadge')}
          />
          <div className="product-meta">
            <CustomTooltip text={t('productList.idTooltip')} position="bottom">
              <span className="product-meta-item product-meta-id">ID: {product.id}</span>
            </CustomTooltip>
            <CustomTooltip text={t('productList.lastCheckedTooltip')} position="bottom">
              <span className="product-meta-item product-meta-date">
                <Clock size={11} className="product-meta-icon" />
                <span>
                  {product.lastCheckedAt
                    ? new Date(product.lastCheckedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : t('productList.neverChecked')}
                </span>
              </span>
            </CustomTooltip>
          </div>
        </div>

        <div className="product-price-section">
          <div className="product-current-price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
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
