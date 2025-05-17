import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { handleApiErrorWithRedirect } from '../utils/error-redirect';
import ErrorDisplay, { ErrorSeverity } from '../components/ErrorDisplay';

interface ErrorContextType {
  // Error state
  hasError: boolean;
  errorMessage: string | null;
  errorCode: string | null;
  errorSeverity: ErrorSeverity;
  errorSuggestions: string[] | null;
  errorSupportEmail: string | null;
  errorId: string | null;
  
  // Error actions
  setError: (options: {
    message: string;
    code?: string;
    severity?: ErrorSeverity;
    suggestions?: string[];
    supportEmail?: string;
    errorId?: string;
  }) => void;
  clearError: () => void;
  handleApiError: (error: any, redirectOnError?: boolean) => void;
  
  // UI components
  ErrorAlert: React.FC<{ className?: string; onRetry?: () => void; onDismiss?: () => void }>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  defaultSupportEmail?: string;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children,
  defaultSupportEmail = 'support@mindquest.iiitkottayam.ac.in'
}) => {
  const navigate = useNavigate();
  
  // Error state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorSeverity, setErrorSeverity] = useState<ErrorSeverity>('error');
  const [errorSuggestions, setErrorSuggestions] = useState<string[] | null>(null);
  const [errorSupportEmail, setErrorSupportEmail] = useState<string | null>(defaultSupportEmail);
  const [errorId, setErrorId] = useState<string | null>(null);
  
  // Set error with all details
  const setError = useCallback(({ 
    message, 
    code, 
    severity = 'error',
    suggestions,
    supportEmail,
    errorId: id
  }: {
    message: string;
    code?: string;
    severity?: ErrorSeverity;
    suggestions?: string[];
    supportEmail?: string;
    errorId?: string;
  }) => {
    setHasError(true);
    setErrorMessage(message);
    setErrorCode(code || null);
    setErrorSeverity(severity);
    setErrorSuggestions(suggestions || null);
    setErrorSupportEmail(supportEmail || defaultSupportEmail);
    setErrorId(id || null);
    
    // Show toast for non-critical errors
    if (severity !== 'error') {
      toast({
        title: severity === 'warning' ? 'Warning' : 'Information',
        description: message,
        variant: severity === 'warning' ? 'destructive' : 'default',
      });
    }
  }, [defaultSupportEmail]);
  
  // Clear error state
  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    setErrorCode(null);
    setErrorSeverity('error');
    setErrorSuggestions(null);
    setErrorSupportEmail(defaultSupportEmail);
    setErrorId(null);
  }, [defaultSupportEmail]);
  
  // Handle API errors
  const handleApiError = useCallback((error: any, redirectOnError = false) => {
    if (redirectOnError) {
      // Redirect to error page for critical errors
      handleApiErrorWithRedirect(navigate, error);
    } else {
      // Extract error details
      const message = error?.response?.data?.error?.message || 
                      error?.message || 
                      'An unexpected error occurred';
      
      const code = error?.response?.data?.error?.code || 
                   error?.code || 
                   null;
      
      const suggestions = error?.response?.data?.error?.suggestions || null;
      
      const supportEmail = error?.response?.data?.error?.support?.email || 
                           defaultSupportEmail;
      
      const errorId = error?.response?.data?.error?.support?.errorId || 
                      error?.response?.headers?.['x-error-id'] || 
                      null;
      
      // Set error state
      setError({
        message,
        code,
        severity: 'error',
        suggestions,
        supportEmail,
        errorId
      });
    }
  }, [navigate, setError, defaultSupportEmail]);
  
  // Error alert component
  const ErrorAlert: React.FC<{ 
    className?: string; 
    onRetry?: () => void; 
    onDismiss?: () => void 
  }> = useCallback(({ 
    className, 
    onRetry, 
    onDismiss = clearError 
  }) => {
    if (!hasError) return null;
    
    return (
      <ErrorDisplay
        title={errorSeverity === 'error' ? 'Error' : 
               errorSeverity === 'warning' ? 'Warning' : 'Information'}
        message={errorMessage || 'An error occurred'}
        code={errorCode || undefined}
        severity={errorSeverity}
        suggestions={errorSuggestions || undefined}
        supportEmail={errorSupportEmail || undefined}
        errorId={errorId || undefined}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
      />
    );
  }, [
    hasError, 
    errorMessage, 
    errorCode, 
    errorSeverity, 
    errorSuggestions, 
    errorSupportEmail, 
    errorId, 
    clearError
  ]);
  
  const value = {
    // Error state
    hasError,
    errorMessage,
    errorCode,
    errorSeverity,
    errorSuggestions,
    errorSupportEmail,
    errorId,
    
    // Error actions
    setError,
    clearError,
    handleApiError,
    
    // UI components
    ErrorAlert,
  };
  
  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  return context;
};

export default ErrorContext;
