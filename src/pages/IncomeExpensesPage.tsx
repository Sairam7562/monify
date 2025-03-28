
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import IncomeExpenseForm from '@/components/finance/IncomeExpenseForm';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const IncomeExpensesPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Income & Expenses</h1>
          <p className="text-muted-foreground">
            Track your money flow with our colorful and fun tracking tools!
          </p>
        </div>
        
        <Alert className="bg-monify-purple-50 border-monify-purple-200">
          <Info className="h-4 w-4 text-monify-purple-500" />
          <AlertTitle>Financial Insights</AlertTitle>
          <AlertDescription>
            Recording all your income sources and expenses helps create accurate financial statements and provides valuable insights for future financial planning. Use the save buttons to save each item individually or use the "Save All" button at the bottom.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Why Track Income?</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Understand all your revenue sources</li>
              <li>Track growth in different income streams</li>
              <li>Identify income patterns and trends</li>
              <li>Plan for taxes more effectively</li>
              <li>Make informed financial decisions</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Why Track Expenses?</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Identify spending patterns and habits</li>
              <li>Find opportunities to reduce costs</li>
              <li>Create realistic budgets</li>
              <li>Save for future goals</li>
              <li>Improve your financial health</li>
            </ul>
          </div>
        </div>
        
        <Separator />
        
        <IncomeExpenseForm />
      </div>
    </MainLayout>
  );
};

export default IncomeExpensesPage;
