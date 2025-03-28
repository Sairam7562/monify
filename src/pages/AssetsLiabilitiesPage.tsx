
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssetLiabilityForm from '@/components/finance/AssetLiabilityForm';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
        
        <Alert className="bg-monify-purple-50 border-monify-purple-200">
          <Info className="h-4 w-4 text-monify-purple-500" />
          <AlertTitle>Understanding Your Net Worth</AlertTitle>
          <AlertDescription>
            Your net worth is calculated by subtracting your total liabilities from your total assets. 
            Monitoring this value over time helps you track your financial progress.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border bg-background">
            <h2 className="text-xl font-semibold mb-4">Assets Include:</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Cash & bank accounts</li>
              <li>Investment accounts</li>
              <li>Real estate property</li>
              <li>Vehicles</li>
              <li>Business ownership</li>
              <li>Personal property of value</li>
              <li>Retirement accounts</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border bg-background">
            <h2 className="text-xl font-semibold mb-4">Liabilities Include:</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Mortgage loans</li>
              <li>Auto loans</li>
              <li>Student loans</li>
              <li>Credit card debt</li>
              <li>Personal loans</li>
              <li>Business loans</li>
              <li>Tax debt</li>
            </ul>
          </div>
        </div>
        
        <Separator />
        
        <AssetLiabilityForm />
      </div>
    </MainLayout>
  );
};

export default AssetsLiabilitiesPage;
