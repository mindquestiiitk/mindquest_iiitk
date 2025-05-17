import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DataItem = {
  id: number;
  date: string; // Format: DD/MM/YYYY
};

// Helper to convert DD/MM/YYYY to Date
export const parseDate = (str: string): Date => {
  const [day, month, year] = str.split('/').map(Number);
  return new Date(year, month - 1, day); // JS months are 0-indexed
};
