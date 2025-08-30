'use client';

import React, { useState, useCallback, useContext, createContext, ReactNode } from 'react';
import { ConfirmationDialog } from '../components/ui/dialogs';
import { AlertDialog } from '../components/ui/AlertDialog';

interface DialogOptions {
  title: string;
  body: string;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<ReactNode | null>(null);

  const confirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      const handleClose = () => {
        setDialog(null);
        resolve(false);
      };
      const handleConfirm = () => {
        setDialog(null);
        resolve(true);
      };
      setDialog(
        <ConfirmationDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={options.title}
          body={options.body}
        />
      );
    });
  }, []);

  const alert = useCallback((options: DialogOptions) => {
    return new Promise<void>((resolve) => {
      const handleClose = () => {
        setDialog(null);
        resolve();
      };
      setDialog(
        <AlertDialog
          isOpen={true}
          onClose={handleClose}
          title={options.title}
          body={options.body}
        />
      );
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog}
    </DialogContext.Provider>
  );
};
