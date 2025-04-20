
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { purgeAllCaches, getCacheStats } from '@/services/databaseService';
import { toast } from 'sonner';
import PersonalInfoTabs from '@/components/finance/PersonalInfoTabs';
import SystemStatusCard from '@/components/finance/SystemStatusCard';
import ProfileCompletionCard from '@/components/finance/ProfileCompletionCard';

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
    const updateCacheStats = () => {
      const stats = getCacheStats();
      setCacheStats({
        entries: stats.count || 0,
        size: stats.size || 0,
        oldestEntry: stats.lastPurged ? new Date(stats.lastPurged).getTime() : 0
      });
    };
    
    updateCacheStats();
  }, [checkDatabaseStatus]);

  const handlePurgeCache = () => {
    try {
      purgeAllCaches(); // This is a void function, doesn't return a value
      
      toast.success('All application caches have been purged');
      
      // Update cache stats after purge
      const stats = getCacheStats();
      setCacheStats({
        entries: stats.count || 0,
        size: stats.size || 0,
        oldestEntry: stats.lastPurged ? new Date(stats.lastPurged).getTime() : 0
      });
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
            <PersonalInfoTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          
          <div className="space-y-6">
            <SystemStatusCard 
              isDbHealthy={isDbHealthy} 
              cacheStats={cacheStats} 
              onPurgeCache={handlePurgeCache} 
            />
            
            <ProfileCompletionCard 
              user={user} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
