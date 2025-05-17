import { useEffect, useState } from "react";
import {
  addNetworkStatusListener,
  isNetworkOnline,
  getQueuedOperationsCount,
  initOfflineManager,
} from "../utils/offline-manager";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "../utils/cn";

/**
 * NetworkStatus component
 *
 * Production-ready component that displays a notification when the user is offline
 * and shows pending operations that will be synced when connection is restored
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(isNetworkOnline);
  const [queuedOps, setQueuedOps] = useState(getQueuedOperationsCount());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initialize the offline manager
    initOfflineManager();

    // Add listener for network status changes
    const removeListener = addNetworkStatusListener((online) => {
      setIsOnline(online);

      // Show notification when status changes
      setVisible(true);

      // Hide notification after 5 seconds if online and no queued operations
      if (online && getQueuedOperationsCount() === 0) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    });

    // Check queued operations periodically
    const interval = setInterval(() => {
      const count = getQueuedOperationsCount();
      setQueuedOps(count);

      // Hide notification if online and no queued operations for more than 5 seconds
      if (isOnline && count === 0 && visible) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }, 1000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if online, no queued operations, and no notification
  if (isOnline && queuedOps === 0 && !visible) {
    return null;
  }

  // Show "back online" notification if online, no queued operations, and notification is visible
  if (isOnline && queuedOps === 0 && visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 ease-in-out">
        <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertTitle>Back online</AlertTitle>
          <AlertDescription>
            Your connection has been restored.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show offline or syncing notification
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 ease-in-out">
      <Alert
        className={cn(
          "shadow-lg",
          isOnline
            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
            : "bg-red-50 border-red-200 text-red-800"
        )}
      >
        {isOnline ? (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <AlertTitle>{isOnline ? "Syncing data" : "You're offline"}</AlertTitle>
        <AlertDescription>
          {isOnline
            ? `Syncing ${queuedOps} pending ${
                queuedOps === 1 ? "operation" : "operations"
              }...`
            : "Changes you make will be saved and synced when your connection is restored."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
