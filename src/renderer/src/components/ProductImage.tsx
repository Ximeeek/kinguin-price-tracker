import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Product',
  className = '',
  style = {},
  width = 64,
  height = 64,
  borderRadius = '14px'
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`product-thumb-no-image ${className}`}
        style={{
          width,
          height,
          borderRadius,
          background: 'rgba(14, 18, 26, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'var(--text-muted)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.3px',
          flexShrink: 0,
          userSelect: 'none',
          ...style
        }}
      >
        <ImageOff size={Math.min(typeof width === 'number' ? width : 64, 20)} opacity={0.6} />
        <span>No Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      style={{
        width,
        height,
        borderRadius,
        objectFit: 'cover',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
        ...style
      }}
    />
  );
};
