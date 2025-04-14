
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { purgeAllCaches, getCacheStats } from '@/services/databaseService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessInfoForm from '@/components/finance/BusinessInfoForm';

const PersonalInfoPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const { checkDatabaseStatus } = useDatabase();
  const [isDbHealthy, setIsDbHealthy] = useState<boolean | null>(null);
  const [cacheStats, setCacheStats] = useState<{
    size: number;
    entries: number;
    oldestEntry: number;
  }>({
    size: 0,
    entries: 0,
    oldestEntry: 0
  });

  useEffect(() => {
    const checkDb = async () => {
      const healthy = await checkDatabaseStatus();
      setIsDbHealthy(healthy);
    };
    
    checkDb();
    
    // Update cache stats
    const updateCacheStats = async () => {
      const stats = await getCacheStats();
      setCacheStats({
        entries: stats.entries || 0,
        size: parseInt(stats.size) || 0,
        oldestEntry: new Date(stats.lastPurged).getTime() || 0
      });
    };
    
    updateCacheStats();
  }, [checkDatabaseStatus]);

  const handlePurgeCache = async () => {
    try {
      const success = await purgeAllCaches();
      
      if (success) {
        toast.success('All application caches have been purged');
        
        // Update cache stats after purge
        const stats = await getCacheStats();
        setCacheStats({
          entries: stats.entries || 0,
          size: parseInt(stats.size) || 0,
          oldestEntry: new Date(stats.lastPurged).getTime() || 0
        });
      } else {
        toast.error('Failed to purge application caches');
      }
    } catch (error) {
      console.error('Error purging caches:', error);
      toast.error('An error occurred while purging caches');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personal Information</h1>
          <p className="text-muted-foreground">
            Manage your personal and business information
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="business">Business Info</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="personal" className={activeTab === 'personal' ? 'block' : 'hidden'}>
                  <PersonalInfoForm />
                </TabsContent>
                <TabsContent value="business" className={activeTab === 'business' ? 'block' : 'hidden'}>
                  <BusinessInfoForm />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          
          <div>
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
                    onClick={handlePurgeCache}
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
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Your profile information status</CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm">Complete your profile to get the most out of your financial statements.</p>
                    <div className="space-y-2">
                      <div className="bg-gray-100 h-2 rounded-full">
                        <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-right text-muted-foreground">75% Complete</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">Please log in to track your profile completion.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
