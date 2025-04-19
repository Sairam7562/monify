
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Database and cache information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Database Connection</h3>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isDbHealthy === null ? 'bg-gray-300' : isDbHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isDbHealthy === null ? 'Checking...' : isDbHealthy ? 'Connected' : 'Disconnected'}</span>
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
            <p className="text-amber-800 text-sm">
              Your data will be saved locally until database connection is restored.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
