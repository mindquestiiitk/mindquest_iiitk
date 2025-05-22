import { toast } from "../components/ui/use-toast";
import { getErrorMessage } from "../components/ErrorDisplay";
import { ToastAction } from "../components/ui/toast";

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: string;
  details?: Record<string, any>;
  suggestions?: string[];
  support?: {
    email?: string;
    errorId?: string;
  };
}

/**
 * API Error Response interface
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  errorId?: string;
  timestamp?: string;
}

/**
 * Checks if an object is an API error response
 */
export const isApiErrorResponse = (obj: any): obj is ApiErrorResponse => {
  return (
    obj &&
    obj.success === false &&
    obj.error &&
    typeof obj.error.message === "string"
  );
};

/**
 * Extracts error details from various error types
 */
export const extractErrorDetails = (
  error: unknown
): {
  message: string;
  code?: string;
  status?: number;
  suggestions?: string[];
  supportEmail?: string;
  errorId?: string;
} => {
  // Handle Axios errors
  if (
    error &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    error.isAxiosError
  ) {
    const axiosError = error as any;

    // Check if the response contains our API error format
    if (isApiErrorResponse(axiosError.response?.data)) {
      const apiError = axiosError.response.data.error;
      return {
        message: apiError.message,
        code: apiError.code,
        status: axiosError.response.status,
        suggestions: apiError.suggestions,
        supportEmail: apiError.support?.email,
        errorId:
          apiError.support?.errorId ||
          axiosError.response.headers["x-error-id"],
      };
    }

    // Handle other Axios errors
    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error occurred",
      code: axiosError.code || "network_error",
      status: axiosError.response?.status,
    };
  }

  // Handle Firebase errors
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    (error.code.startsWith("auth/") || error.code.startsWith("firestore/"))
  ) {
    // Safely access message property
    const errorMessage = 
      error && typeof error === "object" && "message" in error && typeof error.message === "string" 
        ? error.message 
        : "Authentication error";
    
    return {
      message: errorMessage,
      code: error.code as string,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "unknown_error",
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      code: "unknown_error",
    };
  }

  // Default fallback
  return {
    message: "An unknown error occurred",
    code: "unknown_error",
  };
};

/**
 * Handles errors by showing appropriate toast notifications
 */
export const handleError = (
  error: unknown,
  options: {
    title?: string;
    defaultMessage?: string;
    showToast?: boolean;
    logError?: boolean;
  } = {}
): {
  message: string;
  code?: string;
  status?: number;
  suggestions?: string[];
  supportEmail?: string;
  errorId?: string;
} => {
  const {
    title = "Error",
    defaultMessage = "Something went wrong. Please try again.",
    showToast = true,
    logError = true,
  } = options;

  // Extract error details
  const errorDetails = extractErrorDetails(error);

  // Get user-friendly message
  const userMessage = errorDetails.code
    ? getErrorMessage(errorDetails.code, errorDetails.message)
    : errorDetails.message || defaultMessage;

  // Log error in development - using import.meta directly for Vite environment
  if (logError && import.meta && (import.meta as any).env?.DEV) {
    console.error("Error handled:", {
      original: error,
      extracted: errorDetails,
      userMessage,
    });
  }

  // Show toast notification
  if (showToast) {
    // Create a custom toast component with ErrorDisplay
    toast({
      title,
      description: userMessage,
      variant: "destructive",
      // If we have suggestions, show them in the toast
      action:
        errorDetails.suggestions && errorDetails.suggestions.length > 0
          ? (
              <ToastAction
                altText="View Suggestions"
                onClick={() => {
                  // Show a more detailed error with suggestions in a modal or another toast
                  toast({
                    title: "Suggestions",
                    description: (
                      <div className="space-y-2">
                        <p>{userMessage}</p>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {errorDetails.suggestions?.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                        {errorDetails.supportEmail && (
                          <p className="text-sm mt-2">
                            Need help? Contact{" "}
                            <a
                              href={`mailto:${errorDetails.supportEmail}`}
                              className="underline font-medium"
                            >
                              {errorDetails.supportEmail}
                            </a>
                          </p>
                        )}
                      </div>
                    ),
                    duration: 10000, // Show for longer
                  });
                }}
              >
                View Suggestions
              </ToastAction>
            )
          : undefined,
    });
  }

  return {
    message: userMessage,
    code: errorDetails.code,
    status: errorDetails.status,
    suggestions: errorDetails.suggestions,
    supportEmail: errorDetails.supportEmail,
    errorId: errorDetails.errorId,
  };
};

/**
 * Wraps an async function with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    title?: string;
    defaultMessage?: string;
    showToast?: boolean;
    logError?: boolean;
    onError?: (error: {
      message: string;
      code?: string;
      status?: number;
    }) => void;
  } = {}
): ((...args: T) => Promise<R | null>) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorDetails = handleError(error, options);

      if (options.onError) {
        options.onError(errorDetails);
      }

      return null;
    }
  };
};

export default handleError;
