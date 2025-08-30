'use client';

import React from 'react';
import StyleSheet from '@/app/styles/StyleSheet';
import { PositiveButton, NegativeButton } from './buttons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  body: {
    marginBottom: '20px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>{title}</div>
        <div style={styles.body}>{body}</div>
        <div style={styles.footer}>
          <NegativeButton labelText="やめる" onClick={onClose} />
          <PositiveButton labelText="はい" onClick={handleConfirm} style={{ marginLeft: '10px' }} />
        </div>
      </div>
    </div>
  );
};
