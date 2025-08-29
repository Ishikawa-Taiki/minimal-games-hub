'use client';

import React from 'react';
import StyleSheet from '../../styles/StyleSheet';

// ボタンのバリアント定義
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  ariaLabel,
}: ButtonProps) {
  // スタイルを動的に組み合わせ
  const buttonStyle = {
    ...styles.base,
    ...getVariantStyle(variant),
    ...getSizeStyle(size),
    ...(fullWidth && styles.fullWidth),
    ...(disabled && styles.disabled),
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
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
    borderRadius: '0.375rem', // rounded-md
    fontWeight: '500', // font-medium
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    textDecoration: 'none',
    outline: 'none',
  },
  primary: {
    backgroundColor: '#3b82f6', // bg-blue-500
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#6b7280', // bg-gray-500
    color: '#ffffff',
  },
  danger: {
    backgroundColor: '#ef4444', // bg-red-500
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151', // text-gray-700
    border: '1px solid #d1d5db', // border-gray-300
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
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});