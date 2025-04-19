
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ArrowLeft, 
  Shield, 
  AlertTriangle,
  Search,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { checkConnection, initializeConnection } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminOverride = localStorage.getItem('adminCodeOverride') === 'true';
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionErrorReason, setConnectionErrorReason] = useState<string | null>(null);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Check if there's a database connection issue that might be causing the 404
    const verifyConnection = async () => {
      const result = await checkConnection();
      setHasConnectionError(!result.connected);
      setConnectionChecked(true);
      
      if (!result.connected && result.reason) {
        // Set a more user-friendly error message based on the reason
        switch (result.reason) {
          case 'auth_error':
            setConnectionErrorReason("Authentication error. Your session may have expired.");
            break;
          case 'schema_error':
            setConnectionErrorReason("Database schema configuration issue.");
            break;
          case 'rate_limit_error':
            setConnectionErrorReason("Rate limit reached. Please wait a moment and try again.");
            break;
          default:
            setConnectionErrorReason("General connection issue. Please check your internet connection.");
        }
      }
    };
    
    verifyConnection();
  }, [location.pathname]);

  const handleGoToAdmin = () => {
    if (isAdminOverride) {
      navigate('/admin');
    } else {
      navigate('/admin-access');
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);
    
    toast.info("Checking database connection...");
    const result = await checkConnection();
    
    if (result.connected) {
      toast.success("Database connection restored!");
      setHasConnectionError(false);
      // Try going back to the previous page or dashboard
      navigate(-1);
    } else {
      toast.error(`Connection issue persists: ${connectionErrorReason || 'Unknown error'}`);
    }
    
    setIsRetrying(false);
  };
  
  const handleFullReset = async () => {
    setIsRetrying(true);
    try {
      toast.info("Performing full connection reset...");
      
      // Clear any session data that might be causing issues
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
      sessionStorage.removeItem('db_schema_error');
      
      // Initialize a completely fresh connection
      const success = await initializeConnection();
      
      if (success) {
        toast.success("Connection successfully reset!");
        // Redirect to login page
        navigate('/login');
      } else {
        toast.error("Unable to restore connection. Please try logging out and back in.");
      }
    } catch (error) {
      console.error("Error during full reset:", error);
      toast.error("Reset failed. Please try refreshing the page manually.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Extract the previous meaningful page from the referrer or history
  const getPreviousPageName = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.length >= 2 && pathSegments[1]) {
      return pathSegments[1].replace(/-/g, ' ');
    }
    return null;
  };

  const previousPage = getPreviousPageName();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
        {hasConnectionError ? (
          <>
            <div className="flex justify-center mb-4">
              <AlertTriangle size={64} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-amber-500">Connection Error</h1>
            <p className="text-gray-600 mb-6">
              {connectionErrorReason || "We're having trouble connecting to the database. This might be why you're seeing this page."}
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                variant="default"
                className="w-full"
                onClick={handleRetryConnection}
                disabled={isRetrying}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
              </Button>
              
              {retryAttempts >= 2 && (
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={handleFullReset}
                  disabled={isRetrying}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Connection & Go to Login
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to Login Page
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <Search size={64} className="text-red-500" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-red-500">404</h1>
            <p className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</p>
            <p className="text-gray-600 mb-6">
              We couldn't find the page you were looking for: 
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-2 block">
                {location.pathname}
              </span>
            </p>
          </>
        )}
        
        <div className="flex flex-col space-y-3 mt-4">
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          {previousPage && previousPage.includes('asset') && (
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/assets-liabilities')}
            >
              Go to Assets & Liabilities
            </Button>
          )}

          {location.pathname.includes('admin') && (
            <Button 
              variant="secondary"
              className="w-full"
              onClick={handleGoToAdmin}
            >
              <Shield className="mr-2 h-4 w-4" />
              {isAdminOverride ? 'Go to Admin Dashboard' : 'Enter Admin Access Code'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
