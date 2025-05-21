import { NavigateFunction } from 'react-router-dom';

/**
 * Redirects to the appropriate error page based on the error status code
 * 
 * @param navigate - React Router's navigate function
 * @param statusCode - HTTP status code (e.g., 404, 500)
 * @param errorId - Optional error ID for tracking
 * @param message - Optional error message to display
 */
export const redirectToErrorPage = (
  navigate: NavigateFunction,
  statusCode: number,
  errorId?: string,
  message?: string
): void => {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (errorId) {
    params.append('errorId', errorId);
  }
  
  if (message) {
    params.append('message', message);
  }
  
  const queryString = params.toString();
  const queryPart = queryString ? `?${queryString}` : '';
  
  // For 404 errors, use the NotFound page
  if (statusCode === 404) {
    navigate(`/not-found${queryPart}`, { replace: true });
    return;
  }
  
  // For server errors (5xx), use the ServerError page
  if (statusCode >= 500) {
    navigate(`/error/${statusCode}${queryPart}`, { replace: true });
    return;
  }
  
  // For other error codes, use the generic error page
  navigate(`/error${queryPart}`, { replace: true });
};

/**
 * Handles API errors by extracting status code and redirecting to the appropriate error page
 * 
 * @param navigate - React Router's navigate function
 * @param error - The error object from the API call
 */
export const handleApiErrorWithRedirect = (
  navigate: NavigateFunction,
  error: any
): void => {
  // Default values
  let statusCode = 500;
  let errorId: string | undefined;
  let message: string | undefined;
  
  // Extract error details from Axios error
  if (error && typeof error === 'object') {
    // Check if it's an Axios error
    if ('isAxiosError' in error && error.isAxiosError) {
      // Get status code from response
      statusCode = error.response?.status || 500;
      
      // Get error ID from headers or response data
      errorId = error.response?.headers?.['x-error-id'] || 
                error.response?.data?.errorId ||
                error.response?.data?.error?.errorId;
      
      // Get error message from response data
      message = error.response?.data?.error?.message || 
                error.response?.data?.message ||
                error.message;
    } 
    // Check if it's a Firebase error
    else if ('code' in error && typeof error.code === 'string') {
      // Map Firebase error codes to HTTP status codes
      if (error.code.includes('permission-denied')) {
        statusCode = 403;
      } else if (error.code.includes('not-found')) {
        statusCode = 404;
      } else if (error.code.includes('unavailable')) {
        statusCode = 503;
      }
      
      message = error.message;
    }
    // Handle standard Error objects
    else if (error instanceof Error) {
      message = error.message;
    }
  }
  
  // Redirect to the appropriate error page
  redirectToErrorPage(navigate, statusCode, errorId, message);
};

export default handleApiErrorWithRedirect;
