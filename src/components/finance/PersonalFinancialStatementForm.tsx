
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import ProfileImageUploader from './ProfileImageUploader';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { generateFinancialStatementData } from '@/services/databaseService';
import { Spinner } from '@/components/ui/spinner';

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

const defaultData: PersonalFinancialStatementData = {
  profileImage: null,
  fullName: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    includeInReport: true
  },
  assets: [
    { id: 'cash', name: 'Cash & Bank Accounts', value: '', includeInReport: true },
    { id: 'investments', name: 'Investments', value: '', includeInReport: true },
    { id: 'realestate', name: 'Real Estate', value: '', includeInReport: true },
    { id: 'vehicles', name: 'Vehicles', value: '', includeInReport: true },
    { id: 'personal', name: 'Personal Property', value: '', includeInReport: true }
  ],
  liabilities: [
    { id: 'mortgage', name: 'Mortgage', value: '', includeInReport: true },
    { id: 'autoloan', name: 'Auto Loan', value: '', includeInReport: true },
    { id: 'creditcards', name: 'Credit Cards', value: '', includeInReport: true },
    { id: 'studentloans', name: 'Student Loans', value: '', includeInReport: true },
    { id: 'otherloans', name: 'Other Loans', value: '', includeInReport: true }
  ],
  incomes: [
    { id: 'salary', name: 'Salary & Wages', value: '', includeInReport: true },
    { id: 'business', name: 'Business Income', value: '', includeInReport: true },
    { id: 'investment', name: 'Investment Income', value: '', includeInReport: true },
    { id: 'rental', name: 'Rental Income', value: '', includeInReport: true }
  ],
  expenses: [
    { id: 'housing', name: 'Housing', value: '', includeInReport: true },
    { id: 'transportation', name: 'Transportation', value: '', includeInReport: true },
    { id: 'food', name: 'Food & Dining', value: '', includeInReport: true },
    { id: 'utilities', name: 'Utilities', value: '', includeInReport: true },
    { id: 'insurance', name: 'Insurance', value: '', includeInReport: true },
    { id: 'healthcare', name: 'Healthcare', value: '', includeInReport: true },
    { id: 'taxes', name: 'Taxes', value: '', includeInReport: true }
  ],
  statementDate: new Date().toISOString().slice(0, 10)
};

const PersonalFinancialStatementForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PersonalFinancialStatementData>(defaultData);
  const [includeSpouse, setIncludeSpouse] = useState(false);
  const [spouseData, setSpouseData] = useState({
    fullName: '',
    email: '',
    phone: '',
    includeInReport: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFinancialData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const statementData = await generateFinancialStatementData(user.id);
        
        if (statementData) {
          // Map the data structure returned from the API to our form's expected shape
          const personalInfo = statementData.personalInfo || {};
          
          const formattedData = {
            profileImage: personalInfo.profile_image || null,
            fullName: personalInfo.first_name && personalInfo.last_name 
              ? `${personalInfo.first_name} ${personalInfo.last_name}` 
              : '',
            email: personalInfo.email || user.email || '',
            phone: personalInfo.phone || '',
            address: {
              street: personalInfo.address || '',
              city: personalInfo.city || '',
              state: personalInfo.state || '',
              zipCode: personalInfo.zip_code || '',
              country: 'United States', // Default value
              includeInReport: true
            },
            statementDate: new Date().toISOString().slice(0, 10),
            assets: statementData.assets.map((asset: any) => ({
              id: asset.id || `asset-${Math.random().toString(36).substring(2, 9)}`,
              name: asset.name || '',
              value: asset.value ? asset.value.toString() : '',
              includeInReport: true
            })),
            liabilities: statementData.liabilities.map((liability: any) => ({
              id: liability.id || `liability-${Math.random().toString(36).substring(2, 9)}`,
              name: liability.name || '',
              value: liability.amount ? liability.amount.toString() : '',
              includeInReport: true
            })),
            incomes: statementData.income.map((inc: any) => ({
              id: inc.id || `income-${Math.random().toString(36).substring(2, 9)}`,
              name: inc.source || '',
              value: inc.amount ? inc.amount.toString() : '',
              includeInReport: true
            })),
            expenses: statementData.expenses.map((expense: any) => ({
              id: expense.id || `expense-${Math.random().toString(36).substring(2, 9)}`,
              name: expense.name || '',
              value: expense.amount ? expense.amount.toString() : '',
              includeInReport: true
            }))
          };
          
          setFormData(prevData => ({
            ...prevData,
            ...formattedData
          }));
        }
      } catch (error) {
        console.error("Error loading financial statement data:", error);
        toast.error("Could not load your financial data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFinancialData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Personal Financial Statement</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="mb-4">Loading your financial data...</div>
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleProfileImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as object),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpouseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpouseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpouseIncludeChange = (checked: boolean) => {
    setSpouseData(prev => ({ ...prev, includeInReport: checked }));
  };

  const handleItemChange = (type: 'assets' | 'liabilities' | 'incomes' | 'expenses', id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, value } : item
      )
    }));
  };

  const handleIncludeChange = (type: 'assets' | 'liabilities' | 'incomes' | 'expenses', id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, includeInReport: checked } : item
      )
    }));
  };

  const handleAddressIncludeChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        includeInReport: checked
      }
    }));
  };

  const handleGenerateReport = () => {
    console.log('Generating report with data:', formData);
    // Here you would typically process the data and generate a report
    toast.success("Personal Financial Statement generated successfully!");
  };

  const calculateTotal = (items: FinancialItem[]) => {
    return items
      .filter(item => item.includeInReport && item.value)
      .reduce((sum, item) => sum + parseFloat(item.value || '0'), 0);
  };

  const totalAssets = calculateTotal(formData.assets);
  const totalLiabilities = calculateTotal(formData.liabilities);
  const netWorth = totalAssets - totalLiabilities;

  const totalIncome = calculateTotal(formData.incomes);
  const totalExpenses = calculateTotal(formData.expenses);
  const cashFlow = totalIncome - totalExpenses;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personal Financial Statement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileImageUploader 
              defaultImage={formData.profileImage || undefined}
              onImageChange={handleProfileImageChange}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statement-date">Statement Date</Label>
              <Input
                id="statement-date"
                name="statementDate"
                type="date"
                value={formData.statementDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="flex items-center space-x-2 ml-auto">
              <Checkbox 
                id="include-address" 
                checked={formData.address.includeInReport}
                onCheckedChange={handleAddressIncludeChange}
              />
              <Label htmlFor="include-address" className="text-sm">Include in report</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address-street">Street Address</Label>
              <Input
                id="address-street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address-city">City</Label>
                <Input
                  id="address-city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-state">State</Label>
                <Input
                  id="address-state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-zipCode">ZIP Code</Label>
              <Input
                id="address-zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                placeholder="10001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-country">Country</Label>
              <Input
                id="address-country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Spouse Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Spouse Information</h3>
            <div className="flex items-center space-x-2 ml-auto">
              <Checkbox 
                id="include-spouse" 
                checked={includeSpouse}
                onCheckedChange={(checked) => setIncludeSpouse(!!checked)}
              />
              <Label htmlFor="include-spouse" className="text-sm">Include spouse</Label>
            </div>
          </div>
          
          {includeSpouse && (
            <div className="border p-4 rounded-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spouse-full-name">Spouse Full Name</Label>
                <Input
                  id="spouse-full-name"
                  name="fullName"
                  value={spouseData.fullName}
                  onChange={handleSpouseInputChange}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse-email">Email</Label>
                  <Input
                    id="spouse-email"
                    name="email"
                    type="email"
                    value={spouseData.email}
                    onChange={handleSpouseInputChange}
                    placeholder="jane.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse-phone">Phone</Label>
                  <Input
                    id="spouse-phone"
                    name="phone"
                    value={spouseData.phone}
                    onChange={handleSpouseInputChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-spouse-in-report" 
                  checked={spouseData.includeInReport}
                  onCheckedChange={(checked) => handleSpouseIncludeChange(!!checked)}
                />
                <Label htmlFor="include-spouse-in-report" className="text-sm">Include spouse in financial statement</Label>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Assets</h3>
          {formData.assets.map((asset) => (
            <div key={asset.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor={`asset-${asset.id}`}>{asset.name}</Label>
              </div>
              <div className="w-32">
                <Input
                  id={`asset-${asset.id}`}
                  type="number"
                  value={asset.value}
                  onChange={(e) => handleItemChange('assets', asset.id, e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="text-right"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`include-asset-${asset.id}`} 
                  checked={asset.includeInReport}
                  onCheckedChange={(checked) => handleIncludeChange('assets', asset.id, !!checked)}
                />
                <Label htmlFor={`include-asset-${asset.id}`} className="text-sm">Include</Label>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total Assets</span>
            <span className="text-monify-purple-600">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Liabilities</h3>
          {formData.liabilities.map((liability) => (
            <div key={liability.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor={`liability-${liability.id}`}>{liability.name}</Label>
              </div>
              <div className="w-32">
                <Input
                  id={`liability-${liability.id}`}
                  type="number"
                  value={liability.value}
                  onChange={(e) => handleItemChange('liabilities', liability.id, e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="text-right"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`include-liability-${liability.id}`} 
                  checked={liability.includeInReport}
                  onCheckedChange={(checked) => handleIncludeChange('liabilities', liability.id, !!checked)}
                />
                <Label htmlFor={`include-liability-${liability.id}`} className="text-sm">Include</Label>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total Liabilities</span>
            <span className="text-red-600">${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-monify-purple-50 p-4 rounded-lg">
          <div className="flex justify-between font-bold text-xl">
            <span>Net Worth</span>
            <span className={netWorth >= 0 ? "text-monify-green-600" : "text-red-600"}>
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Income</h3>
          {formData.incomes.map((income) => (
            <div key={income.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor={`income-${income.id}`}>{income.name}</Label>
              </div>
              <div className="w-32">
                <Input
                  id={`income-${income.id}`}
                  type="number"
                  value={income.value}
                  onChange={(e) => handleItemChange('incomes', income.id, e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="text-right"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`include-income-${income.id}`} 
                  checked={income.includeInReport}
                  onCheckedChange={(checked) => handleIncludeChange('incomes', income.id, !!checked)}
                />
                <Label htmlFor={`include-income-${income.id}`} className="text-sm">Include</Label>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total Income</span>
            <span className="text-monify-green-600">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Expenses</h3>
          {formData.expenses.map((expense) => (
            <div key={expense.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor={`expense-${expense.id}`}>{expense.name}</Label>
              </div>
              <div className="w-32">
                <Input
                  id={`expense-${expense.id}`}
                  type="number"
                  value={expense.value}
                  onChange={(e) => handleItemChange('expenses', expense.id, e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="text-right"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`include-expense-${expense.id}`} 
                  checked={expense.includeInReport}
                  onCheckedChange={(checked) => handleIncludeChange('expenses', expense.id, !!checked)}
                />
                <Label htmlFor={`include-expense-${expense.id}`} className="text-sm">Include</Label>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total Expenses</span>
            <span className="text-red-600">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-monify-purple-50 p-4 rounded-lg">
          <div className="flex justify-between font-bold text-xl">
            <span>Monthly Cash Flow</span>
            <span className={cashFlow >= 0 ? "text-monify-green-600" : "text-red-600"}>
              ${cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Financial Ratios Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Financial Ratios</h3>
            <div className="flex items-center space-x-2">
              <Checkbox id="include-ratios" defaultChecked />
              <Label htmlFor="include-ratios">Include in report</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Debt-to-Asset Ratio</h4>
              <p className="text-lg font-semibold">
                {totalAssets > 0 ? (totalLiabilities / totalAssets).toFixed(2) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Lower is better. Target: less than 0.5</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Savings Rate</h4>
              <p className="text-lg font-semibold">
                {totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0) + '%' : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Higher is better. Target: at least 20%</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateReport}
          className="w-full bg-monify-purple-500 hover:bg-monify-purple-600"
        >
          Generate Personal Financial Statement
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalFinancialStatementForm;
