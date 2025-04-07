
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, ChevronLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VALID_ADMIN_CODES = [
  'ADMIN2023',
  'MONIFY24',
  'FINANCEPRO',
  'MASTERADM',
  'FINTECH01'
];

const AdminAccessPage = () => {
  const [adminCode, setAdminCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSchemaError, setHasSchemaError] = useState(false);
  const [isRefreshingConnection, setIsRefreshingConnection] = useState(false);
  const navigate = useNavigate();

  // Check for schema errors on load
  useEffect(() => {
    const schemaError = sessionStorage.getItem('db_schema_error') === 'true';
    setHasSchemaError(schemaError);
  }, []);

  const handleRefreshConnection = async () => {
    setIsRefreshingConnection(true);
    
    try {
      // Try to refresh the session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.refreshSession();
        toast.info("Session refreshed");
      }
      
      // Clear schema error flag
      sessionStorage.removeItem('db_schema_error');
      
      // Test connection
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("Connection test failed:", error);
        toast.error("Database connection still has issues");
        
        if (error.code === 'PGRST106' || error.message?.includes('schema')) {
          setHasSchemaError(true);
        }
      } else {
        toast.success("Database connection restored");
        setHasSchemaError(false);
      }
    } catch (error) {
      console.error("Error refreshing connection:", error);
      toast.error("Failed to refresh connection");
    } finally {
      setIsRefreshingConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (!adminCode.trim()) {
      toast.error('Please enter an admin code');
      setIsSubmitting(false);
      return;
    }

    // Check if the code is valid
    setTimeout(() => {
      if (VALID_ADMIN_CODES.includes(adminCode.trim().toUpperCase())) {
        console.log('Admin code accepted:', adminCode);
        // Store the admin override in localStorage
        localStorage.setItem('adminCodeOverride', 'true');
        toast.success('Admin access granted!');
        
        // Redirect to admin page
        navigate('/admin');
      } else {
        console.log('Invalid admin code attempted:', adminCode);
        toast.error('Invalid admin code');
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-monify-purple-600" />
            <CardTitle className="text-2xl">Admin Access</CardTitle>
          </div>
          <CardDescription>
            Enter your admin code to access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        {hasSchemaError && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Connection Issue</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>There is an issue connecting to the database schema. Use an admin code to override.</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1 mt-2"
                  onClick={handleRefreshConnection}
                  disabled={isRefreshingConnection}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshingConnection ? 'animate-spin' : ''}`} />
                  {isRefreshingConnection ? 'Refreshing...' : 'Refresh Connection'}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="adminCode"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="font-mono text-lg tracking-wider"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                Admin codes are provided to authorized users only. For demo purposes, try using "ADMIN2023".
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-monify-purple-600 hover:bg-monify-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Shield className="animate-pulse mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                'Access Admin Dashboard'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminAccessPage;
