
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Shield } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminOverride = localStorage.getItem('adminCodeOverride') === 'true';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoToAdmin = () => {
    if (isAdminOverride) {
      navigate('/admin');
    } else {
      navigate('/admin-access');
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
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-6">
          We couldn't find the page you were looking for: 
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-2 block">
            {location.pathname}
          </span>
        </p>
        
        <div className="flex flex-col space-y-3">
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
