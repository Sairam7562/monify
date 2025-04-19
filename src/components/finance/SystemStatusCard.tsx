
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { retryConnection } from '@/integrations/supabase/client';

interface SystemStatusCardProps {
  isDbHealthy: boolean | null;
  cacheStats: {
    size: number;
    entries: number;
    oldestEntry: number;
  };
  onPurgeCache: () => Promise<void>;
}

const SystemStatusCard = ({ isDbHealthy, cacheStats, onPurgeCache }: SystemStatusCardProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      toast.info("Attempting to reconnect to database...");
      const success = await retryConnection(3);
      
      if (success) {
        toast.success("Database connection restored!");
        // We'll let the parent component update isDbHealthy through its normal checks
      } else {
        toast.error("Still unable to connect to database. Please try again later.");
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      toast.error("Connection attempt failed. Please try refreshing the page.");
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Database and cache information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Database Connection</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isDbHealthy === null ? 'bg-gray-300' : isDbHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isDbHealthy === null ? 'Checking...' : isDbHealthy ? 'Connected' : 'Disconnected'}</span>
            </div>
            {isDbHealthy === false && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs h-7 px-2"
                onClick={handleRetryConnection}
                disabled={isRetrying}
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Cache Status</h3>
          <div className="text-sm space-y-1">
            <p>Entries: {cacheStats.entries}</p>
            <p>Size: {cacheStats.size} KB</p>
            <p>Last Purged: {cacheStats.oldestEntry ? new Date(cacheStats.oldestEntry).toLocaleString() : 'Never'}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2 w-full"
            onClick={onPurgeCache}
          >
            Purge All Caches
          </Button>
        </div>
        
        {!isDbHealthy && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <p className="text-amber-800 font-medium text-sm">Offline Mode Active</p>
            </div>
            <p className="text-amber-800 text-sm">
              Your data will be saved locally until database connection is restored. You can continue working without interruption.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
