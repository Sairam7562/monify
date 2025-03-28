
import React, { useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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

        {/* Assets */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Assets</h3>
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

        {/* Liabilities */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Liabilities</h3>
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

        {/* Income */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Income</h3>
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

        <Separator />

        {/* Expenses */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Expenses</h3>
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
