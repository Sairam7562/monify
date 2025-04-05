
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import IncomeExpenseCard from '@/components/dashboard/IncomeExpenseCard';
import FinancialRatioCard from '@/components/dashboard/FinancialRatioCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { getFinancialSummary } from '@/services/databaseService';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample historical data - this would typically come from your database
  // In a real implementation, you'd fetch historical net worth data
  const [netWorthData, setNetWorthData] = useState([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const summary = await getFinancialSummary(user.id);
        setFinancialData(summary);
        
        // Generate some sample historical data based on the current values
        // In a real app, this would come from your database
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        
        // Create sample net worth history based on current net worth
        const netWorthHistory = months.map((month, index) => {
          // Start with 80% of current net worth and gradually increase
          const factor = 0.8 + (index * 0.029);
          return {
            month,
            netWorth: Math.round(summary.netWorth * factor)
          };
        });
        
        // Create sample income/expense history
        const incomeExpenseHistory = months.map((month, index) => {
          // Slightly vary the income and expenses each month
          const incomeFactor = 0.9 + (Math.random() * 0.2);
          const expenseFactor = 0.9 + (Math.random() * 0.2);
          
          return {
            month,
            income: Math.round(summary.monthlyIncome * incomeFactor),
            expenses: Math.round(summary.monthlyExpenses * expenseFactor)
          };
        });
        
        setNetWorthData(netWorthHistory);
        setIncomeExpenseData(incomeExpenseHistory);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast.error("Failed to load financial data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's a summary of your financial situation.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NetWorthCard 
            totalAssets={financialData?.totalAssets || 0} 
            totalLiabilities={financialData?.totalLiabilities || 0} 
            percentChange={financialData?.netWorthChange || 0} 
          />
          <IncomeExpenseCard 
            totalIncome={financialData?.monthlyIncome || 0} 
            totalExpenses={financialData?.monthlyExpenses || 0} 
            percentChange={financialData?.cashFlowChange || 0} 
          />
          <FinancialRatioCard
            title="Debt-to-Income Ratio"
            value={financialData?.debtToAssetRatio || 0}
            targetValue={0.36}
            description={financialData?.debtToAssetRatio <= 0.36 ? 
              "Your ratio is healthy (below 36%)" : 
              "Your ratio is above the recommended 36%"}
            goodDirection="lower"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
              <CardDescription>
                {netWorthData.length > 0 ? 
                  `Your net worth has grown by $${(netWorthData[netWorthData.length-1].netWorth - netWorthData[0].netWorth).toLocaleString()} recently.` : 
                  "Add assets and liabilities to see your net worth trend."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Net Worth']} />
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
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
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
            value={financialData?.savingsRate || 0}
            targetValue={0.20}
            description={`You're saving ${Math.round((financialData?.savingsRate || 0) * 100)}% of your income`}
            goodDirection="higher"
          />
          <FinancialRatioCard
            title="Emergency Fund Ratio"
            value={financialData?.emergencyFundRatio || 0}
            targetValue={6.0}
            description={`You have ${financialData?.emergencyFundRatio?.toFixed(1) || 0} months of expenses saved`}
            goodDirection="higher"
          />
          <FinancialRatioCard
            title="Housing Cost Ratio"
            value={financialData?.housingCostRatio || 0}
            targetValue={0.28}
            description={`Housing is ${Math.round((financialData?.housingCostRatio || 0) * 100)}% of your income`}
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
              {financialData?.emergencyFundRatio < 6 && (
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium">Build your emergency fund</p>
                    <p className="text-sm text-muted-foreground">
                      Increase your emergency fund to cover 6 months of expenses. 
                      You're currently at {financialData?.emergencyFundRatio?.toFixed(1) || 0} months.
                    </p>
                  </div>
                </li>
              )}
              
              {financialData?.debtToAssetRatio <= 0.36 && (
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Great job with debt management</p>
                    <p className="text-sm text-muted-foreground">Your debt-to-income ratio is below the recommended 36%.</p>
                  </div>
                </li>
              )}
              
              {financialData?.savingsRate < 0.15 && (
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="font-medium">Consider increasing retirement contributions</p>
                    <p className="text-sm text-muted-foreground">
                      You're currently saving {Math.round((financialData?.savingsRate || 0) * 100)}% of your income. 
                      Consider increasing to 15% to meet long-term goals.
                    </p>
                  </div>
                </li>
              )}
              
              {(!financialData || Object.keys(financialData).length === 0) && (
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="font-medium">Get started by adding your financial information</p>
                    <p className="text-sm text-muted-foreground">
                      Visit the Assets & Liabilities and Income & Expenses pages to add your financial data.
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
