
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import PersonalFinancialStatementForm from '@/components/finance/PersonalFinancialStatementForm';
import PersonalFinancialStatementDisplay from '@/components/finance/PersonalFinancialStatementDisplay';

interface FinancialItem {
  id: string;
  name: string;
  value: string;
  includeInReport: boolean;
}

interface PersonalFinancialStatementData {
  profileImage: string | null;
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    includeInReport: boolean;
  };
  assets: FinancialItem[];
  liabilities: FinancialItem[];
  incomes: FinancialItem[];
  expenses: FinancialItem[];
  statementDate: string;
}

const defaultStatementData: PersonalFinancialStatementData = {
  profileImage: null,
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(123) 456-7890',
  address: {
    street: '123 Financial Street',
    city: 'Money City',
    state: 'Wealth State',
    zipCode: '12345',
    country: 'United States',
    includeInReport: true
  },
  assets: [
    { id: 'cash', name: 'Cash & Bank Accounts', value: '45000', includeInReport: true },
    { id: 'investments', name: 'Investments', value: '80000', includeInReport: true },
    { id: 'realestate', name: 'Real Estate', value: '350000', includeInReport: true },
    { id: 'vehicles', name: 'Vehicles', value: '25000', includeInReport: true },
    { id: 'personal', name: 'Personal Property', value: '15000', includeInReport: true }
  ],
  liabilities: [
    { id: 'mortgage', name: 'Mortgage', value: '280000', includeInReport: true },
    { id: 'autoloan', name: 'Auto Loan', value: '18000', includeInReport: true },
    { id: 'creditcards', name: 'Credit Cards', value: '5000', includeInReport: true },
    { id: 'studentloans', name: 'Student Loans', value: '35000', includeInReport: true },
    { id: 'otherloans', name: 'Other Loans', value: '2000', includeInReport: true }
  ],
  incomes: [
    { id: 'salary', name: 'Salary & Wages', value: '6500', includeInReport: true },
    { id: 'business', name: 'Business Income', value: '2000', includeInReport: true },
    { id: 'investment', name: 'Investment Income', value: '375', includeInReport: true },
    { id: 'rental', name: 'Rental Income', value: '1000', includeInReport: true }
  ],
  expenses: [
    { id: 'housing', name: 'Housing', value: '2000', includeInReport: true },
    { id: 'transportation', name: 'Transportation', value: '700', includeInReport: true },
    { id: 'food', name: 'Food & Dining', value: '800', includeInReport: true },
    { id: 'utilities', name: 'Utilities', value: '400', includeInReport: true },
    { id: 'insurance', name: 'Insurance', value: '500', includeInReport: true },
    { id: 'healthcare', name: 'Healthcare', value: '300', includeInReport: true },
    { id: 'taxes', name: 'Taxes', value: '2300', includeInReport: true }
  ],
  statementDate: new Date().toISOString().slice(0, 10)
};

const FinancialStatementsPage = () => {
  const [activeView, setActiveView] = useState<'form' | 'preview'>('form');
  const [statementData, setStatementData] = useState<PersonalFinancialStatementData>(defaultStatementData);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            View and download your personalized financial statements.
          </p>
        </div>
        
        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Statement</TabsTrigger>
            <TabsTrigger value="networth">Net Worth Statement</TabsTrigger>
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow Statement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="pt-4">
            <div className="mb-4 flex justify-end space-x-4">
              <Button 
                variant={activeView === 'form' ? 'default' : 'outline'} 
                onClick={() => setActiveView('form')}
                className={activeView === 'form' ? 'bg-monify-purple-500 hover:bg-monify-purple-600' : ''}
              >
                Edit Statement
              </Button>
              <Button 
                variant={activeView === 'preview' ? 'default' : 'outline'} 
                onClick={() => setActiveView('preview')}
                className={activeView === 'preview' ? 'bg-monify-purple-500 hover:bg-monify-purple-600' : ''}
              >
                Preview Statement
              </Button>
            </div>
            
            {activeView === 'form' && <PersonalFinancialStatementForm />}
            {activeView === 'preview' && <PersonalFinancialStatementDisplay data={statementData} />}
          </TabsContent>
          
          <TabsContent value="networth" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Net Worth Statement</CardTitle>
                <CardDescription>
                  As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Assets</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cash & Bank Accounts</span>
                        <span className="font-medium">$45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investments</span>
                        <span className="font-medium">$80,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Real Estate</span>
                        <span className="font-medium">$350,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicles</span>
                        <span className="font-medium">$25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal Property</span>
                        <span className="font-medium">$15,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Assets</span>
                        <span className="font-medium">$10,000</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Assets</span>
                        <span>$525,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Liabilities</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mortgage</span>
                        <span className="font-medium">$280,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto Loan</span>
                        <span className="font-medium">$18,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student Loans</span>
                        <span className="font-medium">$35,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Cards</span>
                        <span className="font-medium">$5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Debts</span>
                        <span className="font-medium">$2,000</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Liabilities</span>
                        <span>$340,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Worth</span>
                      <span>$185,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline">View Detailed Report</Button>
                <Button className="bg-navido-blue-500 hover:bg-navido-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="income" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>
                  For the period: January 1, 2023 - December 31, 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Income</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Salary & Wages</span>
                        <span className="font-medium">$85,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Income</span>
                        <span className="font-medium">$25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investment Income</span>
                        <span className="font-medium">$4,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rental Income</span>
                        <span className="font-medium">$12,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Income</span>
                        <span className="font-medium">$2,500</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Income</span>
                        <span>$129,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Expenses</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Housing</span>
                        <span className="font-medium">$24,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transportation</span>
                        <span className="font-medium">$8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Food & Dining</span>
                        <span className="font-medium">$9,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilities</span>
                        <span className="font-medium">$4,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span className="font-medium">$6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Healthcare</span>
                        <span className="font-medium">$3,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entertainment</span>
                        <span className="font-medium">$3,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Education</span>
                        <span className="font-medium">$2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travel</span>
                        <span className="font-medium">$4,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal Care</span>
                        <span className="font-medium">$1,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gifts & Donations</span>
                        <span className="font-medium">$2,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes</span>
                        <span className="font-medium">$28,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Expenses</span>
                        <span className="font-medium">$3,500</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Expenses</span>
                        <span>$102,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Income</span>
                      <span>$27,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline">View Detailed Report</Button>
                <Button className="bg-navido-blue-500 hover:bg-navido-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="cashflow" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>
                  For the period: January 1, 2023 - December 31, 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Cash Inflows</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Salary & Wages (After Tax)</span>
                        <span className="font-medium">$62,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Income (After Tax)</span>
                        <span className="font-medium">$18,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investment Income</span>
                        <span className="font-medium">$4,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rental Income</span>
                        <span className="font-medium">$12,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Income</span>
                        <span className="font-medium">$2,500</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Cash Inflows</span>
                        <span>$99,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Cash Outflows</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Housing</span>
                        <span className="font-medium">$24,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transportation</span>
                        <span className="font-medium">$8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Food & Dining</span>
                        <span className="font-medium">$9,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilities</span>
                        <span className="font-medium">$4,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span className="font-medium">$6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Healthcare</span>
                        <span className="font-medium">$3,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Living Expenses</span>
                        <span className="font-medium">$15,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Payments</span>
                        <span className="font-medium">$12,000</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total Cash Outflows</span>
                        <span>$84,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Cash Flow</span>
                      <span className="text-navido-green-600">$15,000</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Allocation of Surplus</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Emergency Fund</span>
                        <span className="font-medium">$3,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retirement Savings</span>
                        <span className="font-medium">$6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Investments</span>
                        <span className="font-medium">$4,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discretionary Spending</span>
                        <span className="font-medium">$2,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline">View Detailed Report</Button>
                <Button className="bg-navido-blue-500 hover:bg-navido-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FinancialStatementsPage;
