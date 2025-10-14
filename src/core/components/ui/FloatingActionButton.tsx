'use client';

import React from 'react';
import StyleSheet from '@/core/styles/StyleSheet';

export interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  ariaLabel: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'medium' | 'large';
}

export function FloatingActionButton({
  onClick,
  icon = '⚙️', // デフォルトアイコン（設定）
  ariaLabel,
  position = 'bottom-right',
  size = 'medium',
}: FABProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const fabStyle = {
    ...styles.base,
    ...getPositionStyle(position),
    ...getSizeStyle(size),
    // ホバー効果
    ...(isHovered && {
      backgroundColor: '#2563eb', // hover:bg-blue-600
      transform: 'scale(1.05)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // hover:shadow-xl
    }),
    // アクティブ効果
    ...(isPressed && {
      transform: 'scale(0.95)',
    }),
  };

  return (
    <button
      style={fabStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {icon}
    </button>
  );
}

// ヘルパー関数
function getPositionStyle(position: FABProps['position']): React.CSSProperties {
  switch (position) {
    case 'bottom-right':
      return styles.bottomRight;
    case 'bottom-left':
      return styles.bottomLeft;
    case 'top-right':
      return styles.topRight;
    case 'top-left':
      return styles.topLeft;
    default:
      return styles.bottomRight;
  }
}

function getSizeStyle(size: FABProps['size']): React.CSSProperties {
  switch (size) {
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
    position: 'fixed',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#3b82f6', // bg-blue-500
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // 位置スタイル
  bottomRight: {
    bottom: '1.5rem', // bottom-6
    right: '1.5rem', // right-6
  },
  bottomLeft: {
    bottom: '1.5rem', // bottom-6
    left: '1.5rem', // left-6
  },
  topRight: {
    top: '1.5rem', // top-6
    right: '1.5rem', // right-6
  },
  topLeft: {
    top: '1.5rem', // top-6
    left: '1.5rem', // left-6
  },
  // サイズスタイル
  medium: {
    width: '56px', // w-14
    height: '56px', // h-14
    fontSize: '1.25rem', // text-xl
  },
  large: {
    width: '64px', // w-16
    height: '64px', // h-16
    fontSize: '1.5rem', // text-2xl
  },
});