
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/services/userService';

interface ProfileCompletionCardProps {
  user: User | null;
}

const ProfileCompletionCard = ({ user }: ProfileCompletionCardProps) => {
  return (
    <Card>
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
  );
};

export default ProfileCompletionCard;
