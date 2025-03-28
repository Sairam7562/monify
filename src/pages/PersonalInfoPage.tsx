
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PersonalInfoPage = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personal Information</h1>
          <p className="text-muted-foreground">
            Enter your personal details to generate accurate financial statements. All sensitive information is encrypted and secure.
          </p>
        </div>
        
        {user ? (
          <>
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
            
            <PersonalInfoForm />
          </>
        ) : (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to view and edit your personal information.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
