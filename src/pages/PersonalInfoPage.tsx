
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, RefreshCw, DatabaseIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useDatabase } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkConnection } from '@/integrations/supabase/client';

const PersonalInfoPage = () => {
  const { user } = useAuth();
  const { fetchPersonalInfo, checkDatabaseStatus } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDatabaseError, setHasDatabaseError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  // Function to check local storage for debug purposes
  const checkLocalStorage = () => {
    if (!user) return "No user found";
    
    const userId = user.id?.toString();
    const key = `personal_info_${userId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return `Found local data: First Name: ${parsed.firstName || 'N/A'}, Last Name: ${parsed.lastName || 'N/A'}`;
      } catch (e) {
        return `Found corrupted data: ${data.substring(0, 50)}...`;
      }
    }
    
    return "No local data found";
  };

  useEffect(() => {
    // Run a comprehensive database check on initial load
    const runDiagnostics = async () => {
      try {
        console.log("Running database diagnostics...");
        // Check connection directly
        const connResult = await checkConnection();
        setConnectionStatus(connResult.connected);
        setDiagnosticInfo(
          `Connection status: ${connResult.connected ? 'Connected' : 'Not connected'}\n` +
          `Reason: ${connResult.reason || 'N/A'}\n` +
          `Local storage: ${checkLocalStorage()}`
        );
        
        if (!connResult.connected) {
          console.warn("Database connection diagnostics failed:", connResult);
        }
      } catch (err) {
        console.error("Error running diagnostics:", err);
        setDiagnosticInfo(`Error running diagnostics: ${err}`);
      }
    };
    
    runDiagnostics();
  }, [user]);

  useEffect(() => {
    // Check if there's a known schema error from session storage
    const schemaError = sessionStorage.getItem('db_schema_error') === 'true';
    if (schemaError) {
      console.log("Found schema error in session storage");
      setHasDatabaseError(true);
      setIsLoading(false);
      return;
    }

    // Only attempt database check once to avoid infinite loading
    const checkDatabase = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Checking database status by fetching personal info...");
        const { error, localData } = await fetchPersonalInfo();
        
        if (localData) {
          console.log("Data was loaded from local storage");
        }
        
        // Check for the specific schema error
        if (error && typeof error === 'string' && (
          error.includes('schema must be one of the following') || 
          error.includes('PGRST106')
        )) {
          console.log('Database schema not yet available:', error);
          setHasDatabaseError(true);
          
          // Store in session storage so we don't keep checking
          sessionStorage.setItem('db_schema_error', 'true');
        } else if (error) {
          console.error('Database error:', error);
          setHasDatabaseError(true);
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setHasDatabaseError(true);
      } finally {
        // Always set loading to false immediately to ensure form renders
        setIsLoading(false);
      }
    };

    // Only check database on first load or when manually retrying
    if (attemptCount === 0) {
      checkDatabase();
      setAttemptCount(prev => prev + 1);
    }
  }, [user, fetchPersonalInfo, attemptCount]);

  const handleManualRetry = async () => {
    // Clear the schema error flag
    sessionStorage.removeItem('db_schema_error');
    setHasDatabaseError(false);
    setIsLoading(true);
    
    try {
      // Check connection directly
      const connStatus = await checkDatabaseStatus();
      setConnectionStatus(connStatus);
      
      if (connStatus) {
        toast.success("Database connection successful!");
        // Reset attempt count to trigger the database check again
        setAttemptCount(0);
      } else {
        toast.error("Still unable to connect to the database.");
        setHasDatabaseError(true);
        setDiagnosticInfo(checkLocalStorage());
      }
    } catch (err) {
      console.error("Error during manual retry:", err);
      toast.error("Error checking database connection.");
      setHasDatabaseError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading your information...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!user) {
    return (
      <MainLayout>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to view and edit your personal information.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personal Information</h1>
          <p className="text-muted-foreground">
            Enter your personal details to generate accurate financial statements. All sensitive information is encrypted and secure.
          </p>
        </div>
        
        {connectionStatus === true && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Database Connection Active</AlertTitle>
            <AlertDescription className="text-green-600">
              Your data will be saved to the database.
            </AlertDescription>
          </Alert>
        )}
        
        {hasDatabaseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Issue</AlertTitle>
            <AlertDescription>
              <p className="mb-4">There was an error connecting to the database. This might happen if you're using the app for the first time and the database tables haven't been fully set up yet.</p>
              <p className="mb-4">Your information will be saved locally until the database is ready. You can continue filling out the form.</p>
              <div className="flex flex-col md:flex-row gap-2">
                <Button onClick={handleManualRetry} variant="outline" size="sm" className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
                <Button 
                  onClick={() => setDiagnosticInfo(checkLocalStorage())} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                >
                  <DatabaseIcon className="h-4 w-4 mr-2" />
                  Check Local Storage
                </Button>
              </div>
              
              {diagnosticInfo && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
                  {diagnosticInfo}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              Fill out your personal information to begin building your financial profile. You can optionally include spouse information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>All fields marked with * are required</li>
              <li>Your Social Security Number (SSN) is optional but may be needed for some financial documents</li>
              <li>You can toggle on spouse information if you want to include it in your statements</li>
              <li>For business owners, you can add one business for free (additional businesses are $1.99 each)</li>
              <li>All data is encrypted using AES-256 and stored securely</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Always render the form regardless of database status */}
        <PersonalInfoForm />
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
