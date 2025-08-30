'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { AlertDialog } from './AlertDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

type DialogOptions = {
  title: string;
  message: string;
};

type ConfirmOptions = DialogOptions;
type AlertOptions = DialogOptions;

type DialogContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

type DialogState = {
  type: 'alert' | 'confirm';
  options: DialogOptions;
} | null;

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const alertResolverRef = useRef<(() => void) | null>(null);

  const handleClose = () => {
    setDialogState(null);
  };

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setDialogState({ type: 'confirm', options });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      alertResolverRef.current = resolve;
      setDialogState({ type: 'alert', options });
    });
  }, []);

  const renderDialog = () => {
    if (!dialogState) return null;

    const { type, options } = dialogState;

    if (type === 'confirm') {
      return (
        <ConfirmationDialog
          isOpen={true}
          title={options.title}
          message={options.message}
          onConfirm={() => {
            if (confirmResolverRef.current) {
              confirmResolverRef.current(true);
            }
            handleClose();
          }}
          onCancel={() => {
            if (confirmResolverRef.current) {
              confirmResolverRef.current(false);
            }
            handleClose();
          }}
        />
      );
    }

    if (type === 'alert') {
      return (
        <AlertDialog
          isOpen={true}
          title={options.title}
          message={options.message}
          onConfirm={() => {
            if (alertResolverRef.current) {
              alertResolverRef.current();
            }
            handleClose();
          }}
        />
      );
    }

    return null;
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {renderDialog()}
    </DialogContext.Provider>
  );
};
