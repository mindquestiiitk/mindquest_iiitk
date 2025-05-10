import { useState, useEffect } from "react";
import { api } from "../lib/api";

const ConnectionStatus = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [message, setMessage] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isDebug] = useState(() => {
    // Check if we're in development mode
    return import.meta.env.DEV || import.meta.env.MODE === "development";
  });

  const checkConnection = async () => {
    try {
      setStatus("checking");
      const response = await api.health.check();
      setStatus("connected");
      setMessage(response.message);
      setTimestamp(response.timestamp);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to backend");
      console.error("Connection error:", error);

      // Implement exponential backoff for retries
      if (retryCount < 5) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      }
    }
  };

  useEffect(() => {
    if (isDebug) {
      checkConnection();
    }
  }, [isDebug, retryCount]);

  // Don't render anything if not in debug mode
  if (!isDebug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200">
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "checking"
              ? "bg-yellow-500 animate-pulse"
              : status === "connected"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
        <div className="text-sm font-medium">
          {status === "checking" && "Checking connection..."}
          {status === "connected" && "Backend connected"}
          {status === "error" && "Backend connection failed"}
        </div>
      </div>
      {message && (
        <div className="mt-2 text-xs text-gray-600">
          <p>{message}</p>
          {timestamp && (
            <p className="text-gray-500">
              Last checked: {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
      {status === "error" && (
        <button
          onClick={() => setRetryCount((prev) => prev + 1)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Retry connection
        </button>
      )}
      {/* Debug information */}
      <div className="mt-2 text-xs text-gray-500">
        <p>Environment: {import.meta.env.MODE}</p>
        <p>
          API URL: {import.meta.env.VITE_API_URL || "http://localhost:3000"}
        </p>
        {retryCount > 0 && <p>Retry attempt: {retryCount}/5</p>}
      </div>
    </div>
  );
};

export default ConnectionStatus;
