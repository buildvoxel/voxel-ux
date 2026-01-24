import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface SnackbarMessage {
  id: number;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const showMessage = useCallback((message: string, severity: AlertColor) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, message, severity }]);
  }, []);

  const showSuccess = useCallback((message: string) => showMessage(message, 'success'), [showMessage]);
  const showError = useCallback((message: string) => showMessage(message, 'error'), [showMessage]);
  const showWarning = useCallback((message: string) => showMessage(message, 'warning'), [showMessage]);
  const showInfo = useCallback((message: string) => showMessage(message, 'info'), [showMessage]);

  const handleClose = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const currentMessage = messages[0];

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {currentMessage && (
        <Snackbar
          open={true}
          autoHideDuration={4000}
          onClose={() => handleClose(currentMessage.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => handleClose(currentMessage.id)}
            severity={currentMessage.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {currentMessage.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
}
