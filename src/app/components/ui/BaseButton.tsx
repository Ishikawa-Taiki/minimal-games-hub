'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import StyleSheet from '@/app/styles/StyleSheet';

// --- Start of Debounce Hook ---
// A simple debounce hook to prevent rapid clicks.
const useDebouncedCallback = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
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

// ボタンのバリアント定義
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  fixedWidth?: number;
  ariaLabel?: string;
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
  ariaLabel,
  'data-testid': dataTestId,
}: BaseButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Debounce the click handler with a 250ms delay
  const debouncedOnClick = useDebouncedCallback(onClick, 250);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  // スタイルを動的に組み合わせ
  const buttonStyle = {
    ...styles.base,
    ...getVariantStyle(variant),
    ...getSizeStyle(size),
    ...(fullWidth && styles.fullWidth),
    ...(fixedWidth && { ...styles.fixedWidth, width: `${fixedWidth}px` }),
    ...(disabled && styles.disabled),
    ...(isPressed && !disabled && styles.pressed), // Apply pressed style
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : debouncedOnClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      type="button"
    >
      <span style={styles.contentWrapper}>{children}</span>
    </button>
  );
}

// ヘルパー関数
function getVariantStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return styles.primary;
    case 'secondary':
      return styles.secondary;
    case 'danger':
      return styles.danger;
    case 'ghost':
      return styles.ghost;
    case 'success':
      return styles.success;
    default:
      return styles.primary;
  }
}

function getSizeStyle(size: ButtonSize): React.CSSProperties {
  switch (size) {
    case 'small':
      return styles.small;
    case 'medium':
      return styles.medium;
    case 'large':
      return styles.large;
    default:
      return styles.medium;
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
  primary: {
    backgroundColor: '#2563eb', // A richer blue (Tailwind blue-600)
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
  },
  danger: {
    backgroundColor: '#e11d48', // A muted, rich red (Tailwind rose-600)
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151', // text-gray-700
    border: '1px solid #d1d5db', // border-gray-300
  },
  success: {
    backgroundColor: '#16a34a', // A clear green (Tailwind green-600)
    color: '#ffffff',
  },
  small: {
    padding: '0.375rem 0.75rem', // px-3 py-1.5
    fontSize: '0.875rem', // text-sm
    minHeight: '32px',
  },
  medium: {
    padding: '0.5rem 1rem', // px-4 py-2
    fontSize: '1rem', // text-base
    minHeight: '44px', // タッチフレンドリーなサイズ
  },
  large: {
    padding: '0.75rem 1.5rem', // px-6 py-3
    fontSize: '1.125rem', // text-lg
    minHeight: '52px',
  },
  fullWidth: {
    width: '100%',
  },
  fixedWidth: {
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#9ca3af', // gray-400
    color: '#e5e7eb', // gray-200
    cursor: 'not-allowed',
  },
  pressed: {
    opacity: 0.8,
    transform: 'scale(0.98)',
  },
});