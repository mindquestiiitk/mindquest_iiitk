/**
 * Offline Manager
 *
 * Production-ready implementation for handling offline scenarios:
 * - Detecting network status
 * - Queueing operations for when online
 * - Syncing data when connection is restored
 * - Providing offline UI indicators
 */

import { logAnalyticsEvent } from "../config/firebase";

// Types
type QueuedOperation = {
  id: string;
  operation: () => Promise<any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number; // Higher number = higher priority
};

// State
let isOnline = navigator.onLine;
const operationQueue: QueuedOperation[] = [];
const listeners: Array<(online: boolean) => void> = [];
let isProcessingQueue = false;
let isInitialized = false;

/**
 * Initialize the offline manager
 */
export const initOfflineManager = (): void => {
  if (isInitialized) return;

  // Set up event listeners for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initial status
  isOnline = navigator.onLine;

  // Log initial status
  logAnalyticsEvent("network_status_change", {
    status: isOnline ? "online" : "offline",
    timestamp: new Date().toISOString(),
  });

  isInitialized = true;

  // If we're online at initialization and have queued operations, process them
  if (isOnline && operationQueue.length > 0) {
    processQueue();
  }
};

/**
 * Handle online event
 */
const handleOnline = (): void => {
  if (isOnline) return; // Already online, no change

  isOnline = true;

  // Notify listeners
  notifyListeners();

  // Process queued operations
  processQueue();

  // Log event
  logAnalyticsEvent("network_status_change", {
    status: "online",
    timestamp: new Date().toISOString(),
    queued_operations: operationQueue.length,
  });
};

/**
 * Handle offline event
 */
const handleOffline = (): void => {
  if (!isOnline) return; // Already offline, no change

  isOnline = false;

  // Notify listeners
  notifyListeners();

  // Log event
  logAnalyticsEvent("network_status_change", {
    status: "offline",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify all listeners of network status change
 */
const notifyListeners = (): void => {
  listeners.forEach((listener) => {
    try {
      listener(isOnline);
    } catch (error) {
      console.error("Error in network status listener:", error);
    }
  });
};

/**
 * Process the operation queue
 */
const processQueue = async (): Promise<void> => {
  if (!isOnline || operationQueue.length === 0 || isProcessingQueue) {
    return;
  }

  isProcessingQueue = true;

  try {
    // Sort queue by priority (higher first)
    operationQueue.sort((a, b) => b.priority - a.priority);

    // Process operations in order
    while (operationQueue.length > 0 && isOnline) {
      const operation = operationQueue.shift();
      if (!operation) continue;

      try {
        await operation.operation();

        // Log success
        logAnalyticsEvent("queued_operation_processed", {
          operation_id: operation.id,
          success: true,
          retry_count: operation.retryCount,
          queue_time: Date.now() - operation.timestamp,
        });
      } catch (error) {
        console.error(
          `Error processing queued operation ${operation.id}:`,
          error
        );

        // Increment retry count
        operation.retryCount++;

        // If under max retries, add back to queue
        if (operation.retryCount < operation.maxRetries) {
          operationQueue.push(operation);
        } else {
          // Log failure
          logAnalyticsEvent("queued_operation_processed", {
            operation_id: operation.id,
            success: false,
            retry_count: operation.retryCount,
            queue_time: Date.now() - operation.timestamp,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Small delay between operations to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    isProcessingQueue = false;
  }
};

/**
 * Check if the device is online
 */
export const isNetworkOnline = (): boolean => {
  // Ensure we're initialized
  if (!isInitialized) {
    initOfflineManager();
  }
  return isOnline;
};

/**
 * Add a listener for network status changes
 * @param listener Function to call when network status changes
 * @returns Function to remove the listener
 */
export const addNetworkStatusListener = (
  listener: (online: boolean) => void
): (() => void) => {
  // Ensure we're initialized
  if (!isInitialized) {
    initOfflineManager();
  }

  listeners.push(listener);

  // Call immediately with current status
  try {
    listener(isOnline);
  } catch (error) {
    console.error("Error in network status listener:", error);
  }

  // Return function to remove listener
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Queue an operation to be executed when online
 * @param operation Function to execute when online
 * @param options Options for the operation
 * @returns Promise that resolves when the operation is executed
 */
export const queueOperation = (
  operation: () => Promise<any>,
  options: { id?: string; maxRetries?: number; priority?: number } = {}
): Promise<any> => {
  // Ensure we're initialized
  if (!isInitialized) {
    initOfflineManager();
  }

  return new Promise((resolve, reject) => {
    const id =
      options.id ||
      `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const maxRetries = options.maxRetries || 3;
    const priority = options.priority || 0;

    // If online, execute immediately
    if (isOnline) {
      operation()
        .then(resolve)
        .catch((error) => {
          console.error(`Error executing operation ${id}:`, error);

          // If network error, queue for later
          if (
            error &&
            ((typeof error === "object" &&
              "code" in error &&
              (error.code === "network-error" ||
                error.code === "NETWORK_ERROR")) ||
              (error instanceof Error && error.message.includes("network")))
          ) {
            queueOperationInternal(operation, id, maxRetries, priority);
            resolve(null); // Resolve with null to indicate queued
          } else {
            reject(error);
          }
        });
    } else {
      // Queue for later
      queueOperationInternal(operation, id, maxRetries, priority);
      resolve(null); // Resolve with null to indicate queued
    }
  });
};

/**
 * Internal function to queue an operation
 */
const queueOperationInternal = (
  operation: () => Promise<any>,
  id: string,
  maxRetries: number,
  priority: number
): void => {
  operationQueue.push({
    id,
    operation,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries,
    priority,
  });

  // Log queued operation
  logAnalyticsEvent("operation_queued", {
    operation_id: id,
    timestamp: new Date().toISOString(),
    queue_length: operationQueue.length,
    priority,
  });
};

/**
 * Get the number of queued operations
 */
export const getQueuedOperationsCount = (): number => {
  return operationQueue.length;
};

/**
 * Clean up the offline manager
 */
export const cleanupOfflineManager = (): void => {
  if (!isInitialized) return;

  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);

  // Clear listeners
  listeners.length = 0;

  // Clear queue
  operationQueue.length = 0;

  isInitialized = false;
};
