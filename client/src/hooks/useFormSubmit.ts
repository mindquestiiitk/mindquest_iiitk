import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { handleError } from '../utils/error-handler';
import { handleApiErrorWithRedirect } from '../utils/error-redirect';

interface UseFormSubmitOptions<T, E> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onValidationError?: (errors: Record<string, string>) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  redirectOnError?: boolean;
  validateForm?: (formData: any) => Record<string, string> | null;
}

/**
 * Custom hook for handling form submissions with validation, loading state, and error handling
 */
export function useFormSubmit<T = any, E = any>(options: UseFormSubmitOptions<T, E> = {}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<E | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);
  const navigate = useNavigate();

  const {
    onSuccess,
    onError,
    onValidationError,
    showSuccessToast = true,
    successMessage = 'Form submitted successfully',
    showErrorToast = true,
    errorMessage,
    redirectOnError = false,
    validateForm,
  } = options;

  /**
   * Submit the form with validation and error handling
   */
  const submitForm = useCallback(
    async <D extends object>(
      submitFn: (formData: D) => Promise<T>,
      formData: D
    ): Promise<T | null> => {
      // Reset states
      setLoading(true);
      setSuccess(false);
      setError(null);
      setValidationErrors(null);

      // Validate form if validation function is provided
      if (validateForm) {
        const errors = validateForm(formData);
        if (errors && Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          setLoading(false);
          
          // Call validation error callback if provided
          if (onValidationError) {
            onValidationError(errors);
          }
          
          return null;
        }
      }

      try {
        // Submit the form
        const result = await submitFn(formData);
        
        // Set success state
        setSuccess(true);
        
        // Show success toast if enabled
        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        // Set error state
        setError(err as E);
        
        // Handle error with redirect if enabled
        if (redirectOnError) {
          handleApiErrorWithRedirect(navigate, err);
          return null;
        }
        
        // Handle error with toast if enabled
        if (showErrorToast) {
          handleError(err, {
            title: 'Form Submission Error',
            defaultMessage: errorMessage || 'An error occurred while submitting the form. Please try again.',
          });
        }
        
        // Call error callback if provided
        if (onError) {
          onError(err as E);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      navigate,
      onSuccess,
      onError,
      onValidationError,
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
      redirectOnError,
      validateForm,
    ]
  );

  /**
   * Reset the form state
   */
  const resetForm = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
    setValidationErrors(null);
  }, []);

  return {
    submitForm,
    resetForm,
    loading,
    success,
    error,
    validationErrors,
  };
}

export default useFormSubmit;
