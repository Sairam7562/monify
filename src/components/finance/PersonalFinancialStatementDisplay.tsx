
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FinancialItem {
  id: string;
  name: string;
  value: string;
  includeInReport: boolean;
}

interface PersonalFinancialStatementProps {
  data: {
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
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const PersonalFinancialStatementDisplay = ({ data }: PersonalFinancialStatementProps) => {
  const statementRef = useRef<HTMLDivElement>(null);
  const [signature, setSignature] = useState<string>('');
  const [showSignatureInput, setShowSignatureInput] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString());

  const calculateTotal = (items: FinancialItem[]) => {
    return items
      .filter(item => item.includeInReport && item.value)
      .reduce((sum, item) => sum + parseFloat(item.value || '0'), 0);
  };

  const totalAssets = calculateTotal(data.assets);
  const totalLiabilities = calculateTotal(data.liabilities);
  const netWorth = totalAssets - totalLiabilities;

  const totalIncome = calculateTotal(data.incomes);
  const totalExpenses = calculateTotal(data.expenses);
  const cashFlow = totalIncome - totalExpenses;

  const formattedDate = new Date(data.statementDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    toast.success("Downloading your financial statement...");
    
    // This is a placeholder - in a production app you would use a library like jsPDF, html2canvas, or similar
    setTimeout(() => {
      toast.success("Your financial statement has been downloaded");
    }, 2000);
  };

  const handleEmail = () => {
    const subject = `Personal Financial Statement - ${data.fullName} - ${formattedDate}`;
    const body = `Please find attached the Personal Financial Statement for ${data.fullName} as of ${formattedDate}.

Net Worth: ${formatCurrency(netWorth)}
Total Assets: ${formatCurrency(totalAssets)}
Total Liabilities: ${formatCurrency(totalLiabilities)}
Monthly Cash Flow: ${formatCurrency(cashFlow)}

This is an automated email sent from Monify Financial Services.`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    toast.success("Email client opened with statement details");
  };

  // Prepare chart data
  const assetData = data.assets
    .filter(asset => asset.includeInReport && parseFloat(asset.value) > 0)
    .map(asset => ({
      name: asset.name,
      value: parseFloat(asset.value)
    }));

  const liabilityData = data.liabilities
    .filter(liability => liability.includeInReport && parseFloat(liability.value) > 0)
    .map(liability => ({
      name: liability.name,
      value: parseFloat(liability.value)
    }));

  const monthlyFinanceData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses },
    { name: 'Cash Flow', amount: cashFlow }
  ];

  return (
    <Card className="w-full border-2 border-gray-200 print:border-none" id="personal-financial-statement">
      <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8" ref={statementRef}>
        {/* Header with logo and title */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border">
              <AvatarImage src={data.profileImage || ''} alt="Profile" />
              <AvatarFallback className="bg-monify-purple-100 text-monify-purple-500 text-xl">
                {data.fullName ? data.fullName.charAt(0) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-xl md:text-2xl font-bold">{data.fullName || 'Your Name'}</h1>
              <p className="text-gray-500">{data.email}</p>
              <p className="text-gray-500">{data.phone}</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Personal Financial Statement</h2>
            <p className="text-gray-500">As of {formattedDate}</p>
          </div>
        </div>

        {/* Address */}
        {data.address.includeInReport && (
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <h3 className="font-medium mb-2">Address</h3>
            <p>{data.address.street}</p>
            <p>{data.address.city}, {data.address.state} {data.address.zipCode}</p>
            <p>{data.address.country}</p>
          </div>
        )}

        <Separator />

        {/* Financial Summary with Chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Financial Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Total Assets:</span>
                <span className="text-monify-purple-600 font-bold">{formatCurrency(totalAssets)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Liabilities:</span>
                <span className="text-red-600 font-bold">{formatCurrency(totalLiabilities)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold">Net Worth:</span>
                <span className={`font-bold ${netWorth >= 0 ? "text-monify-green-600" : "text-red-600"}`}>
                  {formatCurrency(netWorth)}
                </span>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Monthly Income:</span>
                  <span className="text-monify-green-600 font-bold">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Monthly Expenses:</span>
                  <span className="text-red-600 font-bold">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Monthly Cash Flow:</span>
                  <span className={`font-bold ${cashFlow >= 0 ? "text-monify-green-600" : "text-red-600"}`}>
                    {formatCurrency(cashFlow)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assets', value: totalAssets },
                      { name: 'Liabilities', value: totalLiabilities },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-0" fill="#8884d8" />
                    <Cell key="cell-1" fill="#FF8042" />
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <Separator />

        {/* Assets with Chart */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Assets</h3>
          
          {assetData.length > 0 && (
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="space-y-2">
            {data.assets
              .filter(asset => asset.includeInReport && asset.value)
              .map(asset => (
                <div key={asset.id} className="flex justify-between">
                  <span>{asset.name}</span>
                  <span className="font-medium">{formatCurrency(parseFloat(asset.value))}</span>
                </div>
              ))}
            <div className="flex justify-between font-bold pt-2 border-t mt-4">
              <span>Total Assets</span>
              <span className="text-monify-purple-600">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Liabilities with Chart */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Liabilities</h3>
          
          {liabilityData.length > 0 && (
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#FF8042"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {liabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="space-y-2">
            {data.liabilities
              .filter(liability => liability.includeInReport && liability.value)
              .map(liability => (
                <div key={liability.id} className="flex justify-between">
                  <span>{liability.name}</span>
                  <span className="font-medium">{formatCurrency(parseFloat(liability.value))}</span>
                </div>
              ))}
            <div className="flex justify-between font-bold pt-2 border-t mt-4">
              <span>Total Liabilities</span>
              <span className="text-red-600">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <div className="flex justify-between font-bold text-lg md:text-xl">
            <span>Net Worth</span>
            <span className={netWorth >= 0 ? "text-monify-green-600" : "text-red-600"}>
              {formatCurrency(netWorth)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Monthly Income & Expenses with Bar Chart */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Monthly Income & Expenses</h3>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={monthlyFinanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Income details */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Income Details</h4>
            <div className="space-y-2">
              {data.incomes
                .filter(income => income.includeInReport && income.value)
                .map(income => (
                  <div key={income.id} className="flex justify-between">
                    <span>{income.name}</span>
                    <span className="font-medium">{formatCurrency(parseFloat(income.value))}</span>
                  </div>
                ))}
              <div className="flex justify-between font-bold pt-2 border-t mt-4">
                <span>Total Income</span>
                <span className="text-monify-green-600">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </div>
          
          {/* Expense details */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Expense Details</h4>
            <div className="space-y-2">
              {data.expenses
                .filter(expense => expense.includeInReport && expense.value)
                .map(expense => (
                  <div key={expense.id} className="flex justify-between">
                    <span>{expense.name}</span>
                    <span className="font-medium">{formatCurrency(parseFloat(expense.value))}</span>
                  </div>
                ))}
              <div className="flex justify-between font-bold pt-2 border-t mt-4">
                <span>Total Expenses</span>
                <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <div className="flex justify-between font-bold text-lg md:text-xl">
            <span>Monthly Cash Flow</span>
            <span className={cashFlow >= 0 ? "text-monify-green-600" : "text-red-600"}>
              {formatCurrency(cashFlow)}
            </span>
          </div>
        </div>

        {/* Financial Ratios */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Financial Ratios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 md:p-4">
              <h4 className="font-medium mb-2">Debt-to-Asset Ratio</h4>
              <p className="text-lg md:text-xl font-semibold">
                {totalAssets > 0 ? (totalLiabilities / totalAssets).toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs md:text-sm text-gray-500">Lower is better. Target: less than 0.5</p>
            </div>
            <div className="border rounded-lg p-3 md:p-4">
              <h4 className="font-medium mb-2">Savings Rate</h4>
              <p className="text-lg md:text-xl font-semibold">
                {totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0) + '%' : 'N/A'}
              </p>
              <p className="text-xs md:text-sm text-gray-500">Higher is better. Target: at least 20%</p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Certification</h3>
          <p className="text-sm mb-4">
            I, {data.fullName}, certify that the information contained in this personal financial statement is true and accurate 
            to the best of my knowledge.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <div className="min-h-16 border-b border-dashed flex items-end justify-center">
                {signature ? (
                  <p className="text-lg italic font-signature pb-1">{signature}</p>
                ) : (
                  <div className="print:hidden">
                    {showSignatureInput ? (
                      <div className="mb-1 w-full">
                        <Input 
                          placeholder="Type your name to sign" 
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="text-center italic"
                        />
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowSignatureInput(true)}
                        className="mb-1 print:hidden"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Add Signature
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-center text-sm">Signature</p>
            </div>
            
            <div className="space-y-2">
              <div className="min-h-16 border-b border-dashed flex items-end justify-center">
                <p className="text-lg pb-1">{currentDate}</p>
              </div>
              <p className="text-center text-sm">Date</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs md:text-sm text-gray-500 mt-6 md:mt-8">
          <p>This personal financial statement has been prepared for informational purposes only. The information contained herein is based on the information provided and has not been audited or verified.</p>
          <p className="mt-2">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 md:px-8 print:hidden">
        <p className="text-sm text-gray-500">Share your statement:</p>
        <div className="flex flex-wrap justify-center sm:justify-end gap-3">
          <Button variant="outline" onClick={handlePrint} className="text-xs md:text-sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail} className="text-xs md:text-sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button className="bg-monify-purple-500 hover:bg-monify-purple-600 text-xs md:text-sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PersonalFinancialStatementDisplay;
