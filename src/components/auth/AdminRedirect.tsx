
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { ShieldCheck } from 'lucide-react';

const AdminRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const checkAdminPermissions = async () => {
      setCheckingPermissions(true);
      
      try {
        // Add a small delay to show the loading animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!user) {
          console.log('No user detected, redirecting to login');
          toast.error('You must be logged in to access this page.');
          navigate('/login');
          return;
        }
        
        // Check for admin role in a case-insensitive way
        const isAdmin = 
          user && 
          typeof user.role === 'string' && 
          user.role.toLowerCase() === 'admin';
        
        console.log('Admin check:', user.role, isAdmin);
        
        if (isAdmin) {
          console.log('Admin user detected, redirecting to admin dashboard');
          toast.success('Welcome to the admin dashboard!');
          navigate('/admin');
        } else {
          console.log('Non-admin user detected, redirecting to dashboard', user);
          toast.error('You do not have permission to access the admin dashboard.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin permissions:', error);
        toast.error('An error occurred while checking your permissions.');
        navigate('/dashboard');
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    checkAdminPermissions();
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-monify-purple-100 flex items-center justify-center rounded-full">
            <ShieldCheck className="h-8 w-8 text-monify-purple-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Checking administrative privileges...</h2>
        <p className="text-muted-foreground mb-6">Please wait while we verify your access to the admin dashboard.</p>
        {checkingPermissions && <Spinner size="lg" className="mx-auto" />}
      </div>
    </div>
  );
};

export default AdminRedirect;
