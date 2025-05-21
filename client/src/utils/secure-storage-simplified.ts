/**
 * Simplified Secure Storage Utility
 * 
 * This utility provides a simple interface for storing non-sensitive data in the browser.
 * For sensitive data, use Firebase Authentication and Firestore with proper security rules.
 */

// Constants
const STORAGE_PREFIX = "mindquest_";
const STORAGE_VERSION = "v1";

class SecureStorage {
  /**
   * Get an item from localStorage
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      return localStorage.getItem(prefixedKey);
    } catch (error) {
      console.error("Error getting item from storage:", error);
      return null;
    }
  }

  /**
   * Set an item in localStorage
   * @param key Storage key
   * @param value Value to store
   * @returns Whether the operation was successful
   */
  setItem(key: string, value: string): boolean {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      localStorage.setItem(prefixedKey, value);
      return true;
    } catch (error) {
      console.error("Error setting item in storage:", error);
      
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(prefixedKey, value);
        return true;
      } catch (fallbackError) {
        console.error("Error setting item in fallback storage:", fallbackError);
        return false;
      }
    }
  }

  /**
   * Remove an item from storage
   * @param key Storage key
   * @returns Whether the operation was successful
   */
  removeItem(key: string): boolean {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      localStorage.removeItem(prefixedKey);
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error("Error removing item from storage:", error);
      return false;
    }
  }

  /**
   * Clear all items with our prefix from storage
   * @returns Whether the operation was successful
   */
  clear(): boolean {
    try {
      this.clearStorageWithPrefix(localStorage);
      this.clearStorageWithPrefix(sessionStorage);
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }

  /**
   * Get a prefixed key to avoid collisions
   * @param key Original key
   * @returns Prefixed key
   */
  private getPrefixedKey(key: string): string {
    return `${STORAGE_PREFIX}${STORAGE_VERSION}_${key}`;
  }

  /**
   * Clear all items with our prefix from web storage
   * @param storage Storage object (localStorage or sessionStorage)
   */
  private clearStorageWithPrefix(storage: Storage): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  }
}

export const secureStorage = new SecureStorage();
