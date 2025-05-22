import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useError } from '../contexts/ErrorContext';
import { redirectToErrorPage } from '../utils/error-redirect';

const ErrorDemo: React.FC = () => {
  const navigate = useNavigate();
  const { setError, clearError, ErrorAlert } = useError();
  
  // State for error display demo
  const [errorMessage, setErrorMessage] = useState('Something went wrong with your request');
  const [errorCode, setErrorCode] = useState('validation_error');
  const [errorSeverity, setErrorSeverity] = useState<'error' | 'warning' | 'info'>('error');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showSupport, setShowSupport] = useState(true);
  
  // State for error page demo
  const [statusCode, setStatusCode] = useState('404');
  const [errorId, setErrorId] = useState('ERR-12345-ABCDE');
  const [pageMessage, setPageMessage] = useState('');
  
  // Generate suggestions based on error type
  const getSuggestions = () => {
    if (!showSuggestions) return undefined;
    
    switch (errorCode) {
      case 'validation_error':
        return [
          'Check your input for any mistakes',
          'Make sure all required fields are filled',
          'Ensure your data is in the correct format'
        ];
      case 'permission_denied':
        return [
          'You may not have the necessary permissions',
          'Try logging out and logging back in',
          'Contact an administrator if you need access'
        ];
      case 'network_error':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'The server might be temporarily unavailable'
        ];
      default:
        return [
          'Try again later',
          'Refresh the page',
          'Contact support if the problem persists'
        ];
    }
  };
  
  // Show error component
  const showError = () => {
    setError({
      message: errorMessage,
      code: errorCode,
      severity: errorSeverity,
      suggestions: getSuggestions(),
      supportEmail: showSupport ? 'support@mindquest.iiitkottayam.ac.in' : undefined,
      errorId: showSupport ? 'ERR-12345-ABCDE' : undefined
    });
  };
  
  // Redirect to error page
  const goToErrorPage = () => {
    redirectToErrorPage(
      navigate,
      parseInt(statusCode),
      errorId || undefined,
      pageMessage || undefined
    );
  };
  
  // Simulate a runtime error
  const causeRuntimeError = () => {
    // This will cause a runtime error that will be caught by the ErrorBoundary
    const obj: any = null;
    obj.nonExistentMethod();
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Error Handling Demo</h1>
      
      <Tabs defaultValue="component" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="component">Error Components</TabsTrigger>
          <TabsTrigger value="pages">Error Pages</TabsTrigger>
          <TabsTrigger value="boundary">Error Boundary</TabsTrigger>
        </TabsList>
        
        {/* Error Component Demo */}
        <TabsContent value="component">
          <Card>
            <CardHeader>
              <CardTitle>Error Display Components</CardTitle>
              <CardDescription>
                Test different error display components with various configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current error display */}
              <div className="mb-6">
                <ErrorAlert />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="errorMessage">Error Message</Label>
                    <Input 
                      id="errorMessage" 
                      value={errorMessage} 
                      onChange={(e) => setErrorMessage(e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="errorCode">Error Code</Label>
                    <Select value={errorCode} onValueChange={setErrorCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select error code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="validation_error">validation_error</SelectItem>
                        <SelectItem value="permission_denied">permission_denied</SelectItem>
                        <SelectItem value="network_error">network_error</SelectItem>
                        <SelectItem value="not_found">not_found</SelectItem>
                        <SelectItem value="server_error">server_error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={errorSeverity} onValueChange={(value: any) => setErrorSeverity(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showSuggestions"
                        checked={showSuggestions}
                        onChange={(e) => setShowSuggestions(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="showSuggestions">Show Suggestions</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showSupport"
                        checked={showSupport}
                        onChange={(e) => setShowSupport(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="showSupport">Show Support Info</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={clearError}>Clear Error</Button>
              <Button onClick={showError}>Show Error</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Error Pages Demo */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Error Pages</CardTitle>
              <CardDescription>
                Test redirecting to different error pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="statusCode">Status Code</Label>
                  <Select value={statusCode} onValueChange={setStatusCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="404">404 - Not Found</SelectItem>
                      <SelectItem value="403">403 - Forbidden</SelectItem>
                      <SelectItem value="401">401 - Unauthorized</SelectItem>
                      <SelectItem value="500">500 - Server Error</SelectItem>
                      <SelectItem value="503">503 - Service Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="errorId">Error ID (optional)</Label>
                  <Input 
                    id="errorId" 
                    value={errorId} 
                    onChange={(e) => setErrorId(e.target.value)} 
                    placeholder="Error reference ID"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="pageMessage">Custom Message (optional)</Label>
                  <Input 
                    id="pageMessage" 
                    value={pageMessage} 
                    onChange={(e) => setPageMessage(e.target.value)} 
                    placeholder="Custom error message"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={goToErrorPage}>
                Go to Error Page
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Error Boundary Demo */}
        <TabsContent value="boundary">
          <Card>
            <CardHeader>
              <CardTitle>Error Boundary</CardTitle>
              <CardDescription>
                Test the application's error boundary by causing a runtime error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Clicking the button below will cause a JavaScript runtime error. 
                This will be caught by the ErrorBoundary component, which will display 
                a fallback UI instead of crashing the entire application.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800">
                <p className="font-medium">Warning</p>
                <p className="text-sm">
                  This will intentionally cause an error. The error boundary will prevent 
                  the app from crashing, but you'll need to refresh the page to return to normal.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={causeRuntimeError}
              >
                Cause Runtime Error
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorDemo;
