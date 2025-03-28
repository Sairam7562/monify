
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useDatabase } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PersonalInfoPage = () => {
  const { user } = useAuth();
  const { fetchPersonalInfo } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDatabaseError, setHasDatabaseError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    // Only attempt database check once to avoid infinite loading
    const checkDatabase = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { error } = await fetchPersonalInfo();
        
        // Check for the specific schema error
        if (error && typeof error === 'string' && error.includes('schema must be one of the following')) {
          console.log('Database schema not yet available:', error);
          setHasDatabaseError(true);
        } else if (error) {
          console.error('Database error:', error);
          setHasDatabaseError(true);
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setHasDatabaseError(true);
      } finally {
        // Always set loading to false after a short timeout to ensure UI renders
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    // Only check database once
    if (attemptCount < 1) {
      checkDatabase();
      setAttemptCount(1);
    } else if (isLoading) {
      // Ensure we exit loading state if something went wrong
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [user, fetchPersonalInfo, attemptCount]);

  const handleManualRetry = () => {
    setHasDatabaseError(false);
    setIsLoading(true);
    setAttemptCount(0);
    toast.info("Retrying database connection...");
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
        
        {hasDatabaseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Issue</AlertTitle>
            <AlertDescription>
              <p className="mb-4">There was an error connecting to the database. This might happen if you're using the app for the first time and the database tables haven't been fully set up yet.</p>
              <p className="mb-4">You can still fill out your information below, and it will be saved once the database is ready.</p>
              <Button onClick={handleManualRetry} variant="outline" size="sm">
                Retry Connection
              </Button>
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
