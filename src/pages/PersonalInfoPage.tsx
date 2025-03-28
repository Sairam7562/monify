
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';

const PersonalInfoPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personal Information</h1>
          <p className="text-muted-foreground">
            Let's get to know you better so we can make your financial journey more fun!
          </p>
        </div>
        
        <PersonalInfoForm />
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;
