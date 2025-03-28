
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import IncomeExpenseForm from '@/components/finance/IncomeExpenseForm';

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
        
        <IncomeExpenseForm />
      </div>
    </MainLayout>
  );
};

export default IncomeExpensesPage;
