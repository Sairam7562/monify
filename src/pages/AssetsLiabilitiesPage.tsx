
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssetLiabilityForm from '@/components/finance/AssetLiabilityForm';

const AssetsLiabilitiesPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assets & Liabilities</h1>
          <p className="text-muted-foreground">
            Track your assets and liabilities to calculate your net worth.
          </p>
        </div>
        
        <AssetLiabilityForm />
      </div>
    </MainLayout>
  );
};

export default AssetsLiabilitiesPage;
