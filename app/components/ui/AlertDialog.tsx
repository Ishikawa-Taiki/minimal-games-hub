'use client';

import React from 'react';
import { Modal, ModalProps } from './Modal';
import { PositiveButton } from './PositiveButton';

type AlertDialogProps = Pick<ModalProps, 'isOpen' | 'title'> & {
  message: string;
  onConfirm: () => void;
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
    paddingTop: '1rem',
  },
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onConfirm} // Although not dismissible, onClose needs a function.
      title={title}
      isDismissible={false} // This is the key change
      showCloseButton={false}
    >
      <div>
        <p style={styles.message}>{message}</p>
        <div style={styles.footer}>
          <PositiveButton onClick={onConfirm}>
            OK
          </PositiveButton>
        </div>
      </div>
    </Modal>
  );
};
