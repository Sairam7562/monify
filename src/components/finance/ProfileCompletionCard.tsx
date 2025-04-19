
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

interface ProfileCompletionCardProps {
  user: User | null;
}

const ProfileCompletionCard = ({ user }: ProfileCompletionCardProps) => {
  const [completionPercentage, setCompletionPercentage] = useState(75); // Default value
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  useEffect(() => {
    const calculateProfileCompletion = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      try {
        // Try to fetch personal info to calculate completion
        const { data, error } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', user.id)
          .schema('api') // Use api schema explicitly
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
    
    calculateProfileCompletion();
  }, [user]);
  
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
                    <span className="flex items-center text-amber-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Estimated
                    </span>
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
