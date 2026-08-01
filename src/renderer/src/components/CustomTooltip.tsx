import React, { useState } from 'react';

interface CustomTooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  text,
  children,
  position = 'top'
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'top'
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            background: '#0d111a',
            color: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.85)',
            animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {text}
          {/* Pointer Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              ...(position === 'top'
                ? { bottom: '-5px', borderWidth: '5px 5px 0 5px', borderColor: '#0d111a transparent transparent transparent' }
                : { top: '-5px', borderWidth: '0 5px 5px 5px', borderColor: 'transparent transparent #0d111a transparent' }),
              width: 0,
              height: 0,
              borderStyle: 'solid'
            }}
          />
        </div>
      )}
    </div>
  );
};
