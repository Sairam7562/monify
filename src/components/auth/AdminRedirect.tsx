
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

const AdminRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check for admin role in a case-insensitive way
      const isAdmin = 
        typeof user.role === 'string' && 
        (user.role.toLowerCase() === 'admin');
      
      if (isAdmin) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin');
        toast.success('Welcome to the admin dashboard!');
      } else {
        console.log('Non-admin user detected, redirecting to dashboard', user);
        toast.error('You do not have permission to access the admin dashboard.');
        navigate('/dashboard');
      }
    } else {
      console.log('No user detected, redirecting to login');
      toast.error('You must be logged in to access this page.');
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Checking administrative privileges...</h2>
        <p className="text-muted-foreground mb-4">Please wait while we verify your access.</p>
        <Spinner size="lg" />
      </div>
    </div>
  );
};

export default AdminRedirect;
