'use client';

import React, { useEffect } from 'react';
import StyleSheet from '@/core/styles/StyleSheet';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxHeight = '70vh',
}: BottomSheetProps) {
  // ESCキーでボトムシートを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // ボトムシート表示中はbodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // ボトムシートが閉じている場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  // オーバーレイクリックでボトムシートを閉じる
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "bottom-sheet-title" : undefined}
    >
      <div 
        style={{
          ...styles.bottomSheet,
          maxHeight,
          // アニメーション用のスタイル
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* ドラッグハンドル */}
        <div style={styles.dragHandle} />

        {/* ヘッダー（タイトルがある場合） */}
        {title && (
          <div style={styles.header}>
            <h3 id="bottom-sheet-title" style={styles.title}>
              {title}
            </h3>
            {showCloseButton && (
              <button
                style={styles.closeButton}
                onClick={onClose}
                aria-label="ボトムシートを閉じる"
                type="button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

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
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bottomSheet: {
    backgroundColor: '#ffffff', // bg-white
    borderTopLeftRadius: '1rem', // rounded-t-2xl
    borderTopRightRadius: '1rem',
    width: '100%',
    maxWidth: '100%',
    boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg (上向き)
    transition: 'transform 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  dragHandle: {
    width: '40px',
    height: '4px',
    backgroundColor: '#d1d5db', // bg-gray-300
    borderRadius: '2px',
    margin: '0.75rem auto 0.5rem auto', // mx-auto mt-3 mb-2
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem', // px-6 py-3
    borderBottom: '1px solid #e5e7eb', // border-gray-200
    flexShrink: 0,
  },
  title: {
    fontSize: '1.125rem', // text-lg
    fontWeight: '600', // font-semibold
    color: '#111827', // text-gray-900
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem', // text-xl
    color: '#6b7280', // text-gray-500
    cursor: 'pointer',
    padding: '0.25rem', // p-1
    borderRadius: '0.25rem', // rounded
    transition: 'color 0.2s ease-in-out',
  },
  content: {
    padding: '1rem 1.5rem 1.5rem 1.5rem', // px-6 pt-4 pb-6
    overflowY: 'auto',
    flexGrow: 1,
    // iOS Safariでのスクロール改善
    WebkitOverflowScrolling: 'touch',
  },
});