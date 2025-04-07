
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const AdminRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdminOverride = localStorage.getItem('adminCodeOverride') === 'true';
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Check if there's a schema error
  const schemaError = sessionStorage.getItem('db_schema_error') === 'true';

  useEffect(() => {
    if (loading) return;

    console.log("Admin redirect checking:", { 
      user, 
      isAdmin: user?.role?.toLowerCase() === 'admin',
      adminOverride: isAdminOverride,
      schemaError
    });

    // If admin override is active, redirect to admin page
    if (isAdminOverride) {
      console.log("Using admin override code to access admin section");
      navigate('/admin');
      return;
    }
    
    // If there's a schema error, we might not be able to check admin status properly
    if (schemaError && !isAdminOverride) {
      console.log("Schema error detected, redirecting to admin access page");
      setHasError(true);
      // Don't redirect immediately to allow for retry
      return;
    }

    // If user is admin, redirect to admin page
    if (user && user.role?.toLowerCase() === 'admin') {
      navigate('/admin');
    } else {
      // Otherwise redirect to admin access page
      navigate('/admin-access');
    }
  }, [user, loading, navigate, isAdminOverride, schemaError]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);

    try {
      // Try to refresh the auth session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.refreshSession();
      }

      // Clear schema error and try again
      sessionStorage.removeItem('db_schema_error');
      
      // Display toast
      toast.info("Retrying admin access check...");
      
      // Small delay to allow session refresh to complete
      setTimeout(() => {
        // Force a reload of the component
        if (user && user.role?.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/admin-access');
        }
        setIsRetrying(false);
      }, 1000);
    } catch (error) {
      console.error("Error retrying admin check:", error);
      toast.error("Failed to check admin access");
      setIsRetrying(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {hasError ? (
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Database Connection Issue</h2>
          <p className="text-gray-600 max-w-md">
            There was an issue connecting to the database to verify your admin status.
            You can retry or use an admin access code if you have one.
          </p>
          <div className="flex space-x-4 justify-center mt-4">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              {isRetrying ? (
                <>
                  <Spinner size="sm" /> Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Retry Connection
                </>
              )}
            </Button>
            <Button 
              onClick={() => navigate('/admin-access')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" /> Enter Admin Code
            </Button>
          </div>
          {retryAttempts > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Retry attempts: {retryAttempts}
            </p>
          )}
        </div>
      ) : (
        <>
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </>
      )}
    </div>
  );
};

export default AdminRedirect;
