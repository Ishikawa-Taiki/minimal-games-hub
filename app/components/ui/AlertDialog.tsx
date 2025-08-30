'use client';

import React from 'react';
import StyleSheet from '@/app/styles/StyleSheet';
import { PositiveButton } from './buttons';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  body,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>{title}</div>
        <div style={styles.body}>{body}</div>
        <div style={styles.footer}>
          <PositiveButton labelText="OK" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};
