
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Navigate to the landing page instead of just '/'
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner size="lg" />
      <span className="ml-2 text-gray-600">Redirecting to homepage...</span>
    </div>
  );
};

export default Index;
