import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { apiService } from '../services/api.service';
import { handleError } from '../utils/error-handler';
import { handleApiErrorWithRedirect } from '../utils/error-redirect';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  redirectOnError?: boolean;
}

/**
 * Custom hook for making API calls with loading state, error handling, and toast notifications
 */
export function useApi<T = any>(options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
    errorMessage,
    redirectOnError = false,
  } = options;

  /**
   * Execute an API call with error handling
   */
  const execute = useCallback(
    async <A extends any[]>(
      apiMethod: (...args: A) => Promise<T>,
      ...args: A
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiMethod(...args);
        setData(result);

        // Show success toast if enabled
        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        // Handle error with redirect if enabled
        if (redirectOnError) {
          handleApiErrorWithRedirect(navigate, err);
          return null;
        }

        // Handle error with toast if enabled
        if (showErrorToast) {
          handleError(err, {
            title: 'Error',
            defaultMessage: errorMessage || 'An error occurred. Please try again.',
          });
        }

        // Call onError callback if provided
        if (onError) {
          onError(err);
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
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
      redirectOnError,
    ]
  );

  /**
   * Make a GET request with error handling
   */
  const get = useCallback(
    async (url: string, config?: any) => {
      return execute(apiService.get.bind(apiService), url, config);
    },
    [execute]
  );

  /**
   * Make a POST request with error handling
   */
  const post = useCallback(
    async (url: string, data?: any, config?: any) => {
      return execute(apiService.post.bind(apiService), url, data, config);
    },
    [execute]
  );

  /**
   * Make a PUT request with error handling
   */
  const put = useCallback(
    async (url: string, data?: any, config?: any) => {
      return execute(apiService.put.bind(apiService), url, data, config);
    },
    [execute]
  );

  /**
   * Make a DELETE request with error handling
   */
  const del = useCallback(
    async (url: string, config?: any) => {
      return execute(apiService.delete.bind(apiService), url, config);
    },
    [execute]
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    get,
    post,
    put,
    delete: del,
    reset,
  };
}

export default useApi;
