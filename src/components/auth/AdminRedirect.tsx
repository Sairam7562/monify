
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AdminRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'Admin';
      
      if (isAdmin) {
        navigate('/admin');
        toast.success('Welcome to the admin dashboard!');
      } else {
        toast.error('You do not have permission to access the admin dashboard.');
        navigate('/dashboard');
      }
    } else {
      toast.error('You must be logged in to access this page.');
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Checking administrative privileges...</h2>
        <p className="text-muted-foreground">Please wait while we verify your access.</p>
      </div>
    </div>
  );
};

export default AdminRedirect;
