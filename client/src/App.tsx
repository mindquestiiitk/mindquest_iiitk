import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import AppRoutes from "./routes";
import { Toaster } from "./components/ui/toaster";
import { NetworkStatus } from "./components/NetworkStatus";
import ErrorBoundary from "./components/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Home, RefreshCcw } from "lucide-react";

function App() {
  return (
    // Use only Firebase authentication
    <FirebaseAuthProvider>
      <ErrorBoundary
        fallback={<AppErrorFallback />}
        onError={(error, errorInfo) => {
          // Log error to your monitoring service
          console.error("Application error:", error, errorInfo);
        }}
      >
        {/* Wrap the app in the ErrorProvider for global error handling */}
        <ErrorProvider>
          <AppRoutes />
          <Toaster />
          <NetworkStatus />
        </ErrorProvider>
      </ErrorBoundary>
    </FirebaseAuthProvider>
  );
}

// Fallback UI for critical application errors
function AppErrorFallback() {
  // We can't use useNavigate here because it might not be available
  // if the router itself has crashed
  const refreshPage = () => window.location.reload();
  const goToHome = () => (window.location.href = "/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 p-4 bg-red-50 rounded-full inline-block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-8">
          We've encountered an unexpected error. Please try refreshing the page
          or returning to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={refreshPage}
            className="flex items-center justify-center"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>

          <Button
            onClick={goToHome}
            className="flex items-center justify-center bg-primary-green hover:bg-primary-green/90"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
