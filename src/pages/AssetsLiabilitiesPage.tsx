
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssetLiabilityForm from '@/components/finance/AssetLiabilityForm';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Database, RefreshCw } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase, checkConnection } from '@/integrations/supabase/client';

const AssetsLiabilitiesPage = () => {
  const { checkDatabaseStatus } = useDatabase();
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkDb = async () => {
    setIsChecking(true);
    try {
      // First try direct connection check
      const connectionResult = await checkConnection();
      const isConnected = connectionResult.connected;
      
      // Then check database status through the hook
      const hookStatus = await checkDatabaseStatus();
      
      // Use a combination of both results
      setDbConnected(isConnected && hookStatus);
      
      if (isConnected && hookStatus) {
        // Clear any previous schema error
        sessionStorage.removeItem('db_schema_error');
      }
      
      return isConnected && hookStatus;
    } catch (error) {
      console.error("Error checking database status:", error);
      setDbConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsChecking(true);
    toast.info("Checking database connection...");
    
    try {
      // Update headers directly instead of using setSession
      supabase.headers.set('Accept-Profile', 'public,api');
      
      const isConnected = await checkDb();
      
      if (isConnected) {
        toast.success("Database connection restored!");
      } else {
        toast.error("Still having connection issues. Your data will be saved locally.");
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      toast.error("Connection retry failed. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkDb();
  }, [checkDatabaseStatus]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assets & Liabilities</h1>
          <p className="text-muted-foreground">
            Track your assets and liabilities to calculate your net worth.
          </p>
        </div>
        
        {dbConnected === false && (
          <Alert className="bg-amber-50 border-amber-200">
            <Database className="h-4 w-4 text-amber-500" />
            <AlertTitle className="flex items-center justify-between">
              <span>Database Connection Notice</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1 text-xs"
                onClick={handleRetryConnection}
                disabled={isChecking}
              >
                <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                Retry Connection
              </Button>
            </AlertTitle>
            <AlertDescription>
              We're experiencing temporary database connection issues. Your data will be saved locally and synced when the connection is restored.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="bg-monify-purple-50 border-monify-purple-200">
          <Info className="h-4 w-4 text-monify-purple-500" />
          <AlertTitle>Understanding Your Net Worth</AlertTitle>
          <AlertDescription>
            Your net worth is calculated by subtracting your total liabilities from your total assets. 
            Monitoring this value over time helps you track your financial progress.
            Use the save buttons to save each item individually or use the "Save All" button at the bottom.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border bg-background">
            <h2 className="text-xl font-semibold mb-4">Assets Include:</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Cash & bank accounts</li>
              <li>Investment accounts</li>
              <li>Real estate property</li>
              <li>Vehicles</li>
              <li>Business ownership</li>
              <li>Personal property of value</li>
              <li>Retirement accounts</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border bg-background">
            <h2 className="text-xl font-semibold mb-4">Liabilities Include:</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Mortgage loans</li>
              <li>Auto loans</li>
              <li>Student loans</li>
              <li>Credit card debt</li>
              <li>Personal loans</li>
              <li>Business loans</li>
              <li>Tax debt</li>
            </ul>
          </div>
        </div>
        
        <Separator />
        
        <AssetLiabilityForm />
      </div>
    </MainLayout>
  );
};

export default AssetsLiabilitiesPage;
