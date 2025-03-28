
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Sample data for the charts
const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 14000 },
  { month: 'Mar', revenue: 15500 },
  { month: 'Apr', revenue: 17000 },
  { month: 'May', revenue: 19000 },
  { month: 'Jun', revenue: 21000 },
];

const profitLossData = [
  { month: 'Jan', revenue: 12000, expenses: 10000, profit: 2000 },
  { month: 'Feb', revenue: 14000, expenses: 11000, profit: 3000 },
  { month: 'Mar', revenue: 15500, expenses: 12000, profit: 3500 },
  { month: 'Apr', revenue: 17000, expenses: 13500, profit: 3500 },
  { month: 'May', revenue: 19000, expenses: 14500, profit: 4500 },
  { month: 'Jun', revenue: 21000, expenses: 15000, profit: 6000 },
];

const expenseBreakdownData = [
  { name: 'Payroll', value: 45 },
  { name: 'Rent', value: 15 },
  { name: 'Marketing', value: 12 },
  { name: 'Utilities', value: 8 },
  { name: 'Equipment', value: 10 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BusinessDashboardPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and financial health.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$21,000</div>
              <div className="flex items-center text-xs">
                <ArrowUp className="h-3 w-3 text-navido-green-500 mr-1" />
                <span className="text-navido-green-500">10.5%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profit (MTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$6,000</div>
              <div className="flex items-center text-xs">
                <ArrowUp className="h-3 w-3 text-navido-green-500 mr-1" />
                <span className="text-navido-green-500">33.3%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.6%</div>
              <div className="flex items-center text-xs">
                <ArrowUp className="h-3 w-3 text-navido-green-500 mr-1" />
                <span className="text-navido-green-500">4.8%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,000</div>
              <div className="flex items-center text-xs">
                <ArrowUp className="h-3 w-3 text-navido-green-500 mr-1" />
                <span className="text-navido-green-500">12.5%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly revenue for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0087C3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>
                Monthly breakdown of revenue, expenses, and profit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profitLossData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#00C3AF" name="Revenue" />
                    <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
                    <Bar dataKey="profit" fill="#0087C3" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Where your money is being spent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Business Health Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Current Ratio</span>
                    <span className="text-sm font-medium">2.5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-navido-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Healthy (recommended: &gt; 2.0)
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Debt-to-Asset Ratio</span>
                    <span className="text-sm font-medium">0.35</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-navido-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Good (recommended: &lt; 0.4)
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Inventory Turnover</span>
                    <span className="text-sm font-medium">6.2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moderate (industry average: 8.0)
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Accounts Receivable Turnover</span>
                    <span className="text-sm font-medium">7.5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-navido-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Good (higher is better)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default BusinessDashboardPage;
