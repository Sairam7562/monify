
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/services/userService';
import { supabase, retryConnection } from '@/integrations/supabase/client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfileCompletionCardProps {
  user: User | null;
}

const ProfileCompletionCard = ({ user }: ProfileCompletionCardProps) => {
  const [completionPercentage, setCompletionPercentage] = useState(75); // Default value
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const fetchProfileData = async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    
    try {
      setLoadingProfile(true);
      // Try to fetch personal info to calculate completion
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .single();
          
      if (error) {
        console.error("Error fetching profile info:", error);
        setConnectionError(true);
        // Use default value
        setLoadingProfile(false);
        return;
      }
      
      // Calculate completion percentage based on filled fields
      if (data) {
        const totalFields = Object.keys(data).length - 3; // Exclude id, user_id, created_at
        const filledFields = Object.entries(data).filter(([key, value]) => 
          value !== null && 
          value !== '' && 
          key !== 'id' && 
          key !== 'user_id' && 
          key !== 'created_at' &&
          key !== 'updated_at'
        ).length;
        
        const percentage = Math.round((filledFields / totalFields) * 100);
        setCompletionPercentage(percentage);
      }
      
      setConnectionError(false);
    } catch (err) {
      console.error("Error calculating profile completion:", err);
      setConnectionError(true);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      toast.info("Retrying connection...");
      
      // First refresh the auth session
      await supabase.auth.refreshSession();
      
      // Then retry the database connection
      const success = await retryConnection(3);
      
      if (success) {
        toast.success("Connection restored successfully!");
        setConnectionError(false);
        fetchProfileData();
      } else {
        toast.error("Still having connection issues. Please try again later.");
      }
    } catch (error) {
      console.error("Error during retry:", error);
      toast.error("Failed to reconnect. Please try refreshing the page.");
    } finally {
      setIsRetrying(false);
    }
  };
  
  useEffect(() => {
    fetchProfileData();
    
    // Set up periodic refresh for profile data
    const refreshInterval = setInterval(() => {
      if (!connectionError) {
        fetchProfileData();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user, connectionError]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
        <CardDescription>Your profile information status</CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <div className="space-y-3">
            <p className="text-sm">
              {connectionError 
                ? "Unable to fetch your current profile. Using estimated completion."
                : "Complete your profile to get the most out of your financial statements."}
            </p>
            <div className="space-y-2">
              <div className="bg-gray-100 h-2 rounded-full">
                <div 
                  className={`h-2 rounded-full ${connectionError ? 'bg-amber-500' : 'bg-blue-500'}`} 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {connectionError && (
                    <div className="flex items-center text-amber-600 gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Estimated</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 p-0 ml-1" 
                        onClick={handleRetryConnection}
                        disabled={isRetrying}
                      >
                        <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  )}
                </p>
                <p className="text-xs text-right text-muted-foreground">{completionPercentage}% Complete</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm">Please log in to track your profile completion.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
