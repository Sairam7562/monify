import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

const AdminRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdminOverride = localStorage.getItem('adminCodeOverride') === 'true';

  useEffect(() => {
    if (loading) return;

    console.log("Admin redirect checking:", { 
      user, 
      isAdmin: user?.role?.toLowerCase() === 'admin',
      adminOverride: isAdminOverride
    });

    // If admin override is active or user is admin, redirect to admin page
    if (isAdminOverride || (user && user.role?.toLowerCase() === 'admin')) {
      navigate('/admin');
    } else {
      // Otherwise redirect to admin access page
      navigate('/admin-access');
    }
  }, [user, loading, navigate, isAdminOverride]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Checking admin access...</p>
    </div>
  );
};

export default AdminRedirect;
