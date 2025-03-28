
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';

const FinancialStatementsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            View and download your personalized financial statements.
          </p>
        </div>
        
        <Tabs defaultValue="networth">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="networth">Net Worth Statement</TabsTrigger>
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow Statement</TabsTrigger>
          </TabsList>
          
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
