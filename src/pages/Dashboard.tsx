
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import IncomeExpenseCard from '@/components/dashboard/IncomeExpenseCard';
import FinancialRatioCard from '@/components/dashboard/FinancialRatioCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data for the charts
const netWorthData = [
  { month: 'Jan', netWorth: 50000 },
  { month: 'Feb', netWorth: 52000 },
  { month: 'Mar', netWorth: 53500 },
  { month: 'Apr', netWorth: 54000 },
  { month: 'May', netWorth: 57000 },
  { month: 'Jun', netWorth: 59000 },
  { month: 'Jul', netWorth: 61000 },
  { month: 'Aug', netWorth: 63000 },
];

const incomeExpenseData = [
  { month: 'Jan', income: 6000, expenses: 4500 },
  { month: 'Feb', income: 6500, expenses: 4800 },
  { month: 'Mar', income: 6200, expenses: 4600 },
  { month: 'Apr', income: 7000, expenses: 5000 },
  { month: 'May', income: 7200, expenses: 5100 },
  { month: 'Jun', income: 7500, expenses: 5300 },
  { month: 'Jul', income: 7400, expenses: 5200 },
  { month: 'Aug', income: 7800, expenses: 5400 },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's a summary of your financial situation.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NetWorthCard totalAssets={175000} totalLiabilities={112000} percentChange={5.2} />
          <IncomeExpenseCard totalIncome={7800} totalExpenses={5400} percentChange={3.8} />
          <FinancialRatioCard
            title="Debt-to-Income Ratio"
            value={0.35}
            targetValue={0.36}
            description="Your ratio is healthy (below 36%)"
            goodDirection="lower"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
              <CardDescription>Your net worth has grown by $13,000 this year.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Net Worth']} />
                    <Legend />
                    <Line type="monotone" dataKey="netWorth" stroke="#0087C3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Monthly breakdown of your cash flow.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="#00C3AF" name="Income" />
                    <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinancialRatioCard
            title="Savings Rate"
            value={0.21}
            targetValue={0.20}
            description="You're saving 21% of your income"
            goodDirection="higher"
          />
          <FinancialRatioCard
            title="Emergency Fund Ratio"
            value={3.2}
            targetValue={6.0}
            description="You have 3.2 months of expenses saved"
            goodDirection="higher"
          />
          <FinancialRatioCard
            title="Housing Cost Ratio"
            value={0.25}
            targetValue={0.28}
            description="Housing is 25% of your income"
            goodDirection="lower"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Action Items</CardTitle>
            <CardDescription>Recommendations to improve your financial health.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="font-medium">Build your emergency fund</p>
                  <p className="text-sm text-muted-foreground">Increase your emergency fund to cover 6 months of expenses. You're currently at 3.2 months.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <div className="mt-1 h-5 w-5 rounded-full bg-navido-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium">Great job with debt management</p>
                  <p className="text-sm text-muted-foreground">Your debt-to-income ratio is below the recommended 36%.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <div className="mt-1 h-5 w-5 rounded-full bg-navido-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="font-medium">Consider increasing retirement contributions</p>
                  <p className="text-sm text-muted-foreground">You're currently saving 10% for retirement. Consider increasing to 15% to meet long-term goals.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
