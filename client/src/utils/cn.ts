/**
 * Utility for conditionally joining class names together
 * 
 * This is a re-export of the cn function from lib/utils.ts to maintain
 * compatibility with components that import it from this location.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param inputs Class names to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
