/**
 * Validation utilities for client-side form validation
 */

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates an email domain
 * @param email - Email to validate
 * @param allowedDomains - Array of allowed domains
 * @returns True if the email domain is in the allowed domains list
 */
export const isValidEmailDomain = (
  email: string,
  allowedDomains: string[]
): boolean => {
  if (!isValidEmail(email)) return false;

  const domain = email.split("@")[1].toLowerCase();
  return allowedDomains.includes(domain);
};

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  message: string;
  errors?: string[];
}

/**
 * Validates a password
 * @param password - Password to validate
 * @returns Validation result with isValid flag and error messages
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Password must be at least 8 characters
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Password must contain at least one uppercase letter
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    errors.push("Password must include at least one uppercase letter");
  }

  // Password must contain at least one lowercase letter
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    errors.push("Password must include at least one lowercase letter");
  }

  // Password must contain at least one number
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    errors.push("Password must include at least one number");
  }

  // Password must contain at least one special character
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (!hasSpecial) {
    errors.push("Password must include at least one special character");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      errors,
    };
  }

  return {
    isValid: true,
    message: "Password is valid",
  };
};

/**
 * Validates a name
 * @param name - Name to validate
 * @returns Validation result with isValid flag and error message
 */
export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: "Name must be at least 2 characters long",
    };
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      message: "Name must be at most 50 characters long",
    };
  }

  return {
    isValid: true,
    message: "Name is valid",
  };
};

/**
 * Formats validation errors into a user-friendly message
 * @param errors - Array of error messages
 * @returns Formatted error message
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return "";
  
  if (errors.length === 1) return errors[0];
  
  return `Please fix the following issues:\n- ${errors.join("\n- ")}`;
};
