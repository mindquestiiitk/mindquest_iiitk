import React from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type ErrorSeverity = "error" | "warning" | "info" | "success";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  code?: string;
  severity?: ErrorSeverity;
  suggestions?: string[];
  supportEmail?: string;
  errorId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * A component for displaying error messages with consistent styling
 *
 * Features:
 * - Different styles based on error severity
 * - Optional retry button
 * - Optional dismiss button
 * - Error code display for debugging
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  code,
  severity = "error",
  suggestions,
  supportEmail,
  errorId,
  onRetry,
  onDismiss,
  className,
}) => {
  // Determine icon based on severity
  const Icon = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    success: Info,
  }[severity];

  // Determine color scheme based on severity
  const colorClasses = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
  }[severity];

  // Determine icon color based on severity
  const iconColorClass = {
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    success: "text-green-500",
  }[severity];

  // Default titles based on severity if not provided
  const defaultTitle = {
    error: "Error",
    warning: "Warning",
    info: "Information",
    success: "Success",
  }[severity];

  return (
    <Alert className={cn(colorClasses, "relative", className)}>
      <Icon className={cn("h-5 w-5", iconColorClass)} />
      <AlertTitle className="font-medium">{title || defaultTitle}</AlertTitle>
      <AlertDescription className="mt-1">
        <p>{message}</p>

        {/* Show suggestions if available */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Suggestions:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Show support information if available */}
        {supportEmail && (
          <div className="mt-2 text-sm">
            <p>
              Need help? Contact{" "}
              <a
                href={`mailto:${supportEmail}${
                  errorId ? `?subject=Error Reference: ${errorId}` : ""
                }`}
                className="underline font-medium hover:text-current"
              >
                {supportEmail}
              </a>
              {errorId && (
                <span className="block mt-1">
                  Reference:{" "}
                  <code className="bg-white bg-opacity-50 px-1 py-0.5 rounded text-xs">
                    {errorId}
                  </code>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Show error code if available */}
        {code && !errorId && (
          <div className="mt-1 text-xs opacity-80">Error code: {code}</div>
        )}

        {/* Action buttons */}
        {(onRetry || onDismiss) && (
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className={cn(
                  "border-current bg-white bg-opacity-50 hover:bg-opacity-100",
                  severity === "error" && "text-red-600 hover:text-red-700",
                  severity === "warning" &&
                    "text-yellow-600 hover:text-yellow-700",
                  severity === "info" && "text-blue-600 hover:text-blue-700",
                  severity === "success" &&
                    "text-green-600 hover:text-green-700"
                )}
              >
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

/**
 * Maps API error codes to user-friendly messages
 */
export const getErrorMessage = (
  code: string,
  defaultMessage: string = "An error occurred"
): string => {
  const errorMessages: Record<string, string> = {
    // Authentication errors
    auth_required: "You need to be logged in to access this feature.",
    invalid_token: "Your login session is invalid. Please log in again.",
    token_expired: "Your login session has expired. Please log in again.",
    session_expired:
      "Your session has expired for security reasons. Please log in again.",
    invalid_credentials: "The email or password you entered is incorrect.",
    email_not_verified: "Please verify your email address before continuing.",
    account_disabled: "Your account has been disabled. Please contact support.",

    // Permission errors
    permission_denied: "You don't have permission to perform this action.",
    admin_required: "This action requires administrator privileges.",
    forbidden: "You don't have access to this resource.",

    // Resource errors
    not_found: "The requested resource could not be found.",
    already_exists: "This resource already exists.",
    resource_exhausted: "You've reached the limit for this resource.",

    // Validation errors
    validation_error: "Please check your input and try again.",
    invalid_input: "The information you provided is invalid.",
    missing_fields: "Please fill in all required fields.",
    invalid_email: "Please enter a valid email address.",
    invalid_password:
      "Password must be at least 8 characters with letters, numbers, and symbols.",

    // Rate limiting
    rate_limit_exceeded: "Too many requests. Please try again later.",
    too_many_requests: "You've made too many attempts. Please try again later.",

    // Network errors
    network_error:
      "Unable to connect to the server. Please check your internet connection.",
    timeout: "The request timed out. Please try again.",
    server_error: "Something went wrong on our end. We're working to fix it.",

    // Default
    unknown_error: "Something went wrong. Please try again or contact support.",
  };

  return errorMessages[code] || defaultMessage;
};

export default ErrorDisplay;
