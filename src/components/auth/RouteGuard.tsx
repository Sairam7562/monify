
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const RouteGuard = ({ children, requireAuth = true, requireAdmin = false }: RouteGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth loading to finish
      if (loading) return;
      
      console.log("Route guard checking auth:", { 
        requireAuth, 
        requireAdmin, 
        userExists: !!user, 
        userRole: user?.role 
      });

      const isEmailVerificationLink = 
        window.location.href.includes('#access_token=') || 
        window.location.href.includes('type=recovery') ||
        window.location.href.includes('type=signup');
        
      if (isEmailVerificationLink) {
        console.log("Processing email verification link...");
        // Let Supabase auth handle this on its own
        setIsChecking(false);
        return;
      }
      
      // If page requires authentication and user is not logged in, redirect to login
      if (requireAuth && !user) {
        toast.error("Please log in to access this page");
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      // If page requires admin and user is not an admin, redirect to dashboard
      if (requireAdmin && user?.role !== 'admin' && user?.role !== 'Admin') {
        toast.error("You don't have permission to access this page");
        navigate('/dashboard');
        return;
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, requireAuth, requireAdmin, navigate, location]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  // If page doesn't require auth or user is logged in correctly, render the children
  if (!requireAuth || (user && (!requireAdmin || (requireAdmin && (user.role === 'admin' || user.role === 'Admin'))))) {
    return <>{children}</>;
  }

  // If we reach here without redirecting, show 404 or unauthorized page
  return <Navigate to="/404" />;
};

export default RouteGuard;
