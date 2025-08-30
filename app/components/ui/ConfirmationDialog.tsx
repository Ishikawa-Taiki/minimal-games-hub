'use client';

import React from 'react';
import { Modal, ModalProps } from './Modal';
import { PositiveButton } from './PositiveButton';
import { NegativeButton } from './NegativeButton';

type ConfirmationDialogProps = Pick<ModalProps, 'isOpen' | 'title'> & {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const styles: { [key: string]: React.CSSProperties } = {
  message: {
    margin: 0,
    color: '#374151', // text-gray-700
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem', // 12px
    paddingTop: '1rem',
  },
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel} // Set onClose to cancel by default
      title={title}
      isDismissible={false}
      showCloseButton={false}
    >
      <div>
        <p style={styles.message}>{message}</p>
        <div style={styles.footer}>
          <NegativeButton onClick={onCancel}>
            キャンセル
          </NegativeButton>
          <PositiveButton onClick={onConfirm}>
            OK
          </PositiveButton>
        </div>
      </div>
    </Modal>
  );
};
