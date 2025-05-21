import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertTriangle, Home, ArrowLeft, RefreshCcw } from 'lucide-react';

interface ServerErrorProps {
  statusCode?: number;
  errorId?: string;
}

const ServerError: React.FC<ServerErrorProps> = ({ 
  statusCode = 500,
  errorId 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from query params if not provided as props
  const searchParams = new URLSearchParams(location.search);
  const queryStatusCode = searchParams.get('statusCode');
  const queryErrorId = searchParams.get('errorId');
  const queryMessage = searchParams.get('message');
  
  // Use props or query params
  const displayStatusCode = statusCode || parseInt(queryStatusCode || '500');
  const displayErrorId = errorId || queryErrorId;
  
  // Determine error title and message based on status code
  const getErrorDetails = () => {
    switch (displayStatusCode) {
      case 500:
        return {
          title: 'Server Error',
          message: queryMessage || 'Our server encountered an unexpected error. Our team has been notified.'
        };
      case 502:
        return {
          title: 'Bad Gateway',
          message: queryMessage || 'We\'re having trouble connecting to our servers. Please try again later.'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: queryMessage || 'Our service is temporarily unavailable. We\'re working to restore it as quickly as possible.'
        };
      case 504:
        return {
          title: 'Gateway Timeout',
          message: queryMessage || 'The server took too long to respond. Please try again later.'
        };
      default:
        return {
          title: 'Server Error',
          message: queryMessage || 'Something went wrong on our end. Please try again later.'
        };
    }
  };
  
  const { title, message } = getErrorDetails();

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <AlertTriangle className="h-24 w-24 text-amber-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground-primary mb-2">{displayStatusCode}</h1>
        <h2 className="text-2xl font-medium text-foreground-primary mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground mb-8">
          {message}
        </p>
        
        {displayErrorId && (
          <div className="mb-8 p-4 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              If you contact support, please provide this error reference:
            </p>
            <code className="mt-2 px-2 py-1 bg-muted rounded text-sm font-mono">
              {displayErrorId}
            </code>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-primary-green hover:bg-primary-green/90"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            Need help? Contact{' '}
            <a 
              href={`mailto:support@mindquest.iiitkottayam.ac.in${displayErrorId ? `?subject=Error Reference: ${displayErrorId}` : ''}`}
              className="text-primary-green hover:underline"
            >
              support@mindquest.iiitkottayam.ac.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
