'use client';

import React, { useEffect } from 'react';
import StyleSheet from '@/app/styles/StyleSheet';
import { Button } from './Button';

export type ModalSize = 'small' | 'medium' | 'large';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  isDismissible?: boolean; // New prop
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  isDismissible = true, // Default to true
}: ModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && isDismissible) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル表示中はbodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isDismissible]);

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  // オーバーレイクリックでモーダルを閉じる
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && isDismissible) {
      onClose();
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={{...styles.modal, ...getSizeStyle(size)}}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <h2 id="modal-title" style={styles.title}>
            {title}
          </h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="small"
              onClick={onClose}
              ariaLabel="モーダルを閉じる"
            >
              ✕
            </Button>
          )}
        </div>

        {/* コンテンツ */}
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // bg-black/50
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem', // p-4
  },
  modal: {
    backgroundColor: '#ffffff', // bg-white
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  small: {
    width: '100%',
    maxWidth: '400px',
  },
  medium: {
    width: '100%',
    maxWidth: '500px',
  },
  large: {
    width: '100%',
    maxWidth: '700px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 1.5rem 1rem 1.5rem', // px-6 pt-6 pb-4
    borderBottom: '1px solid #e5e7eb', // border-gray-200
  },
  title: {
    fontSize: '1.25rem', // text-xl
    fontWeight: '600', // font-semibold
    color: '#111827', // text-gray-900
    margin: 0,
  },
  content: {
    padding: '1rem 1.5rem 1.5rem 1.5rem', // px-6 pb-6 pt-4
    overflowY: 'auto',
    flexGrow: 1,
  },
});

// ヘルパー関数
function getSizeStyle(size: ModalSize): React.CSSProperties {
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