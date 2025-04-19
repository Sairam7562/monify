
import { ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkConnection, supabase } from '@/integrations/supabase/client';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const RouteGuard = ({ children, requireAuth = true, requireAdmin = false }: RouteGuardProps) => {
  const { user, loading, session, dbConnectionChecked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [dbConnectionError, setDbConnectionError] = useState(false);
  const redirectAttempts = useRef(0);
  const lastRedirectTime = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showError, setShowError] = useState(false);

  // Override admin check for demonstration purposes - comment this out in production
  const isAdminOverride = localStorage.getItem('adminCodeOverride') === 'true';

  useEffect(() => {
    // Clear any existing timeout when component unmounts or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Try to refresh the session on route changes
  useEffect(() => {
    if (requireAuth && session) {
      // Silently refresh the token on navigation
      supabase.auth.refreshSession().catch(err => {
        console.error("Error refreshing session on navigation:", err);
      });
    }
  }, [location.pathname, session, requireAuth]);

  // Check database connection status after a short delay to allow auth to load first
  useEffect(() => {
    if (!requireAuth) {
      setDbConnectionError(false);
      return;
    }

    // Wait a bit for auth to settle before checking DB connection
    // This prevents race conditions between auth and DB checks
    const timer = setTimeout(() => {
      const verifyDbConnection = async () => {
        try {
          const result = await checkConnection();
          setDbConnectionError(!result.connected);
          
          if (!result.connected) {
            console.warn("Database connection issue in RouteGuard:", result.reason);
            // Show error after a delay if we're still on the same page
            setTimeout(() => {
              setShowError(true);
            }, 1000);
          }
        } catch (err) {
          console.error("Error checking DB connection in RouteGuard:", err);
          setDbConnectionError(true);
        }
      };

      if (dbConnectionChecked) {
        verifyDbConnection();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dbConnectionChecked, requireAuth]);

  const handleRetryConnection = async () => {
    try {
      setShowError(false);
      toast.info("Checking database connection...");
      const result = await checkConnection();
      
      if (result.connected) {
        toast.success("Database connection restored!");
        setDbConnectionError(false);
      } else {
        toast.error("Connection issue persists. Please try again later.");
        console.error("Connection retry failed:", result.reason);
        setShowError(true);
      }
    } catch (err) {
      console.error("Error during connection retry:", err);
      toast.error("Failed to check database connection");
      setShowError(true);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth loading to finish
      if (loading) return;
      
      console.log("Route guard checking auth:", { 
        requireAuth, 
        requireAdmin, 
        userExists: !!user,
        sessionExists: !!session,
        userRole: user?.role,
        currentPath: location.pathname,
        adminOverride: isAdminOverride,
        dbConnectionError
      });

      // For special routes
      if (location.pathname === '/admin-access') {
        setIsChecking(false);
        return;
      }

      // Always allow access to 404 page
      if (location.pathname === '/404') {
        setIsChecking(false);
        return;
      }

      // For demo purposes - always allow access to admin section with valid admin code
      if (requireAdmin && isAdminOverride) {
        console.log("Admin override is active - allowing access");
        setIsChecking(false);
        return;
      }

      // Check if the current route is the verification route
      if (location.pathname === '/verify-email') {
        setIsChecking(false);
        return;
      }

      // Check if this is a Supabase auth callback URL
      const isAuthCallback = 
        window.location.hash.includes('#access_token=') || 
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('type=signup') ||
        window.location.hash.includes('type=magiclink');
        
      if (isAuthCallback) {
        console.log("Processing authentication callback...");
        // Let Supabase auth handle this on its own
        setIsChecking(false);
        return;
      }
      
      // Public routes - always allow access regardless of auth state
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      // For login/register pages, if user is already logged in, redirect to dashboard
      if ((location.pathname === '/login' || location.pathname === '/register') && user) {
        navigate('/dashboard');
        return;
      }
      
      // Stop redirect loops by tracking attempts
      const now = Date.now();
      if (now - lastRedirectTime.current < 2000) { // Less than 2 seconds since last redirect
        redirectAttempts.current++;
        
        if (redirectAttempts.current > 3) {
          console.error("Detected potential redirect loop, stopping redirection");
          setIsChecking(false);
          toast.error("Authentication error detected. Please try refreshing the page.");
          return;
        }
      } else {
        // Reset counter if it's been more than 2 seconds
        redirectAttempts.current = 0;
      }
      
      // If page requires authentication and user is not logged in, redirect to login
      if (requireAuth && !user) {
        lastRedirectTime.current = now;
        console.log("User not authenticated, redirecting to login");
        
        // Add a small delay before redirecting to avoid potential race conditions
        timeoutRef.current = setTimeout(() => {
          navigate('/login', { state: { from: location.pathname } });
        }, 100);
        return;
      }
      
      // If page requires admin and user is not an admin, redirect to admin-access
      if (requireAdmin && user?.role?.toLowerCase() !== 'admin' && !isAdminOverride) {
        lastRedirectTime.current = now;
        console.log("User not admin, redirecting to admin access page");
        
        // Add a small delay before redirecting to avoid potential race conditions
        timeoutRef.current = setTimeout(() => {
          navigate('/admin-access');
        }, 100);
        return;
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, requireAuth, requireAdmin, navigate, location, session, isAdminOverride, dbConnectionError]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  // Show database connection error
  if (dbConnectionError && requireAuth && showError) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                There was an error connecting to the database. This may cause issues with loading your data.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={handleRetryConnection}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
          {children}
        </div>
      </div>
    );
  }

  // For demo purposes - allow access with admin override
  if (requireAdmin && isAdminOverride) {
    return <>{children}</>;
  }

  // If page doesn't require auth or user is logged in correctly, render the children
  if (!requireAuth || (user && (!requireAdmin || (requireAdmin && user.role?.toLowerCase() === 'admin')))) {
    return <>{children}</>;
  }

  // If we reach here without redirecting, check if we should go to admin-access instead of 404
  if (requireAdmin) {
    return <Navigate to="/admin-access" />;
  }

  // If all else fails, go to 404
  return <Navigate to="/404" />;
};

export default RouteGuard;
