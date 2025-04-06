import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import BusinessInfoForm from '@/components/finance/BusinessInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, RefreshCw, DatabaseIcon, CheckCircle, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useDatabase } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkConnection } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PersonalInfoPage = () => {
  const { user } = useAuth();
  const { fetchPersonalInfo, checkDatabaseStatus } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDatabaseError, setHasDatabaseError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [reconnectAttempting, setReconnectAttempting] = useState(false);

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

  const runConnectionDiagnostics = async () => {
    if (!user) return;
    
    try {
      const hasSchemaError = sessionStorage.getItem('db_schema_error') === 'true';
      const hasAuthError = sessionStorage.getItem('db_auth_error') === 'true';
      const hasNetworkError = sessionStorage.getItem('db_network_error') === 'true';
      
      let diagnosticText = `User: ${user.email || 'Unknown'}\n`;
      diagnosticText += `Schema Error Flag: ${hasSchemaError ? 'Yes' : 'No'}\n`;
      diagnosticText += `Auth Error Flag: ${hasAuthError ? 'Yes' : 'No'}\n`;
      diagnosticText += `Network Error Flag: ${hasNetworkError ? 'Yes' : 'No'}\n`;
      
      const online = navigator.onLine;
      diagnosticText += `Browser Online: ${online ? 'Yes' : 'No'}\n`;
      
      const connResult = await checkConnection();
      diagnosticText += `Connection Check: ${connResult.connected ? 'Success' : 'Failed'}\n`;
      
      if (!connResult.connected) {
        diagnosticText += `Failure Reason: ${connResult.reason || 'Unknown'}\n`;
        if (connResult.error) {
          diagnosticText += `Error: ${connResult.error.message || JSON.stringify(connResult.error)}\n`;
        }
      }
      
      diagnosticText += `Local Storage: ${checkLocalStorage()}\n`;
      
      setDiagnosticInfo(diagnosticText);
      return connResult.connected;
    } catch (err) {
      console.error('Diagnostic error:', err);
      setDiagnosticInfo(`Error running diagnostics: ${err}`);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const schemaError = sessionStorage.getItem('db_schema_error') === 'true';
      
      try {
        console.log("Running database diagnostics...");
        const isConnected = await runConnectionDiagnostics();
        setConnectionStatus(isConnected);
        
        if (!isConnected) {
          console.warn("Database connection diagnostics failed");
          setHasDatabaseError(true);
        }
        
        if (schemaError) {
          console.log("Found schema error in session storage");
          setHasDatabaseError(true);
          setIsLoading(false);
          return;
        }

        if (user && !schemaError) {
          setIsLoading(true);
          console.log("Checking database status by fetching personal info...");
          const { error, localData } = await fetchPersonalInfo();
          
          if (localData) {
            console.log("Data was loaded from local storage");
          }
          
          if (error && typeof error === 'object' && (
            error.code === 'PGRST106' || 
            (error.message && error.message.includes('schema must be one of the following'))
          )) {
            console.log('Database schema not yet available:', error);
            setHasDatabaseError(true);
            
            sessionStorage.setItem('db_schema_error', 'true');
          } else if (error) {
            console.error('Database error:', error);
            setHasDatabaseError(true);
          }
        }
      } catch (err) {
        console.error('Error during initialization:', err);
        setHasDatabaseError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user, fetchPersonalInfo, attemptCount]);

  const handleManualRetry = async () => {
    sessionStorage.removeItem('db_schema_error');
    sessionStorage.removeItem('db_auth_error');
    sessionStorage.removeItem('db_network_error');
    
    setHasDatabaseError(false);
    setIsLoading(true);
    setReconnectAttempting(true);
    
    try {
      if (user) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await supabase.auth.refreshSession();
          toast.info("Authentication session refreshed");
        }
      }
      
      const connStatus = await checkDatabaseStatus();
      setConnectionStatus(connStatus);
      
      if (connStatus) {
        toast.success("Database connection successful!");
        setAttemptCount(prev => prev + 1);
      } else {
        toast.error("Still unable to connect to the database.");
        setHasDatabaseError(true);
        
        await runConnectionDiagnostics();
      }
    } catch (err) {
      console.error("Error during manual retry:", err);
      toast.error("Error checking database connection.");
      setHasDatabaseError(true);
      setDiagnosticInfo(`Error: ${err}`);
    } finally {
      setIsLoading(false);
      setReconnectAttempting(false);
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
          <h1 className="text-2xl font-bold">Personal & Business Information</h1>
          <p className="text-muted-foreground">
            Enter your personal and business details to generate accurate financial statements. All sensitive information is encrypted and secure.
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
                <Button 
                  onClick={handleManualRetry} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  disabled={reconnectAttempting}
                >
                  {reconnectAttempting ? (
                    <>
                      <Spinner className="h-3 w-3 mr-2" /> Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
                    </>
                  )}
                </Button>
                <Button 
                  onClick={runConnectionDiagnostics} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                >
                  <DatabaseIcon className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
                {navigator.onLine === false && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center text-amber-600"
                    disabled
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Offline Mode
                  </Button>
                )}
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
              Fill out your personal and business information to begin building your financial profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>All fields marked with * are required</li>
              <li>Your Social Security Number (SSN) is optional but may be needed for some financial documents</li>
              <li>You can toggle between Personal and Business Information using the tabs below</li>
              <li>For business owners, add your business information to include in financial statements</li>
              <li>All data is encrypted using AES-256 and stored securely</li>
            </ul>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="business">Business Information</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <PersonalInfoForm onSave={() => setActiveTab("business")} />
          </TabsContent>
          <TabsContent value="business">
            <BusinessInfoForm />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
