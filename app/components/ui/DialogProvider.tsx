'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
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

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogState, setDialogState] = useState<{
    type: 'alert' | 'confirm';
    options: DialogOptions;
    resolver: (result: boolean | void) => void;
  } | null>(null);

  const handleClose = () => {
    setDialogState(null);
  };

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ type: 'confirm', options, resolver: resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({ type: 'alert', options, resolver: resolve });
    });
  }, []);

  const renderDialog = () => {
    if (!dialogState) return null;

    const { type, options, resolver } = dialogState;

    if (type === 'confirm') {
      return (
        <ConfirmationDialog
          isOpen={true}
          title={options.title}
          message={options.message}
          onConfirm={() => {
            handleClose();
            resolver(true);
          }}
          onCancel={() => {
            handleClose();
            resolver(false);
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
            handleClose();
            resolver(true); // Resolves the promise
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
