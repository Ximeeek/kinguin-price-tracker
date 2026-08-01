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
            background: 'rgba(12, 16, 24, 0.95)',
            color: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 999,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {text}
          {/* Arrow hint */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              ...(position === 'top'
                ? { bottom: '-5px', borderWidth: '5px 5px 0 5px', borderColor: 'rgba(12, 16, 24, 0.95) transparent transparent transparent' }
                : { top: '-5px', borderWidth: '0 5px 5px 5px', borderColor: 'transparent transparent rgba(12, 16, 24, 0.95) transparent' }),
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
