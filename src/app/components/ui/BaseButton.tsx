'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import StyleSheet from '@/app/styles/StyleSheet';

// --- Start of Debounce Hook ---
const useDebouncedCallback = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};
// --- End of Debounce Hook ---

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

// Reactの標準的なボタン属性を継承し、rest propsを渡せるようにする
export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick: () => void;
  fullWidth?: boolean;
  fixedWidth?: number;
  'data-testid'?: string;
}

export function BaseButton({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  fixedWidth,
  'data-testid': dataTestId,
  ...rest //残りのprops（aria-pressedなど）を受け取る
}: BaseButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const debouncedOnClick = useDebouncedCallback(onClick, 250);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const buttonStyle = {
    ...styles.base,
    ...getVariantStyle(variant),
    ...getSizeStyle(size),
    ...(fullWidth && styles.fullWidth),
    ...(fixedWidth && { ...styles.fixedWidth, width: `${fixedWidth}px` }),
    ...(disabled && styles.disabled),
    ...(isPressed && !disabled && styles.pressed),
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : debouncedOnClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      data-testid={dataTestId}
      type="button"
      {...rest} // ここで残りのpropsを展開
    >
      <span style={styles.contentWrapper}>{children}</span>
    </button>
  );
}

// Helper functions (getVariantStyle, getSizeStyle) and styles remain the same
function getVariantStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary': return styles.primary;
    case 'secondary': return styles.secondary;
    case 'danger': return styles.danger;
    case 'ghost': return styles.ghost;
    case 'success': return styles.success;
    default: return styles.primary;
  }
}

function getSizeStyle(size: ButtonSize): React.CSSProperties {
  switch (size) {
    case 'small': return styles.small;
    case 'medium': return styles.medium;
    case 'large': return styles.large;
    default: return styles.medium;
  }
}

const styles = StyleSheet.create({
  base: {
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.1s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    textDecoration: 'none',
    outline: 'none',
    userSelect: 'none',
  },
  contentWrapper: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  primary: { backgroundColor: '#2563eb', color: '#ffffff' },
  secondary: { backgroundColor: '#6b7280', color: '#ffffff' },
  danger: { backgroundColor: '#e11d48', color: '#ffffff' },
  ghost: { backgroundColor: 'transparent', color: '#374151', border: '1px solid #d1d5db' },
  success: { backgroundColor: '#16a34a', color: '#ffffff' },
  small: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', minHeight: '32px' },
  medium: { padding: '0.5rem 1rem', fontSize: '1rem', minHeight: '44px' },
  large: { padding: '0.75rem 1.5rem', fontSize: '1.125rem', minHeight: '52px' },
  fullWidth: { width: '100%' },
  fixedWidth: { justifyContent: 'center' },
  disabled: { backgroundColor: '#9ca3af', color: '#e5e7eb', cursor: 'not-allowed' },
  pressed: { opacity: 0.8, transform: 'scale(0.98)' },
});