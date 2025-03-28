import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { Spinner } from '@/components/ui/spinner';

interface Income {
  id: number;
  source: string;
  type: string;
  amount: string;
  frequency: string;
}

interface Expense {
  id: number;
  name: string;
  category: string;
  amount: string;
  frequency: string;
}

const IncomeExpenseForm = () => {
  const { user } = useAuth();
  const { 
    saveIncome, 
    saveExpenses, 
    fetchIncome, 
    fetchExpenses,
    loading 
  } = useDatabase();
  
  const [incomes, setIncomes] = useState<Income[]>([
    { id: 1, source: '', type: 'salary', amount: '', frequency: 'monthly' },
  ]);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, name: '', category: 'housing', amount: '', frequency: 'monthly' },
  ]);
  
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    loadExistingData();
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;
    
    setFormLoading(true);
    try {
      const incomeResult = await fetchIncome();
      if (incomeResult.data && incomeResult.data.length > 0) {
        const formattedIncome = incomeResult.data.map((income: any, index: number) => ({
          id: index + 1,
          source: income.source,
          type: income.type,
          amount: income.amount.toString(),
          frequency: income.frequency
        }));
        setIncomes(formattedIncome);
      }

      const expensesResult = await fetchExpenses();
      if (expensesResult.data && expensesResult.data.length > 0) {
        const formattedExpenses = expensesResult.data.map((expense: any, index: number) => ({
          id: index + 1,
          name: expense.name,
          category: expense.category,
          amount: expense.amount.toString(),
          frequency: expense.frequency
        }));
        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const addIncome = () => {
    const newId = incomes.length > 0 ? Math.max(...incomes.map(i => i.id)) + 1 : 1;
    setIncomes([...incomes, { id: newId, source: '', type: 'salary', amount: '', frequency: 'monthly' }]);
  };

  const removeIncome = (id: number) => {
    if (incomes.length > 1) {
      setIncomes(incomes.filter(income => income.id !== id));
    }
  };

  const updateIncome = (id: number, field: keyof Income, value: string) => {
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const addExpense = () => {
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    setExpenses([...expenses, { id: newId, name: '', category: 'housing', amount: '', frequency: 'monthly' }]);
  };

  const removeExpense = (id: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const updateExpense = (id: number, field: keyof Expense, value: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }
    
    try {
      await saveIncome(incomes);
      await saveExpenses(expenses);
    } catch (error) {
      console.error("Error saving income and expenses:", error);
    }
  };

  if (formLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading your income and expenses data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="space-y-4 mt-4">
          <div className="space-y-4">
            {incomes.map((income, index) => (
              <div key={income.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Income Source #{index + 1}</h4>
                  {incomes.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeIncome(income.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`income-source-${income.id}`}>Income Source</Label>
                      <Input
                        id={`income-source-${income.id}`}
                        value={income.source}
                        onChange={(e) => updateIncome(income.id, 'source', e.target.value)}
                        placeholder="e.g., ABC Company"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`income-type-${income.id}`}>Income Type</Label>
                      <Select 
                        value={income.type} 
                        onValueChange={(value) => updateIncome(income.id, 'type', value)}
                      >
                        <SelectTrigger id={`income-type-${income.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="business">Business Income</SelectItem>
                          <SelectItem value="investment">Investment Income</SelectItem>
                          <SelectItem value="rental">Rental Income</SelectItem>
                          <SelectItem value="freelance">Freelance/Contract Work</SelectItem>
                          <SelectItem value="other">Other Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`income-amount-${income.id}`}>Amount ($)</Label>
                      <Input
                        id={`income-amount-${income.id}`}
                        type="number"
                        value={income.amount}
                        onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`income-frequency-${income.id}`}>Frequency</Label>
                      <Select 
                        value={income.frequency} 
                        onValueChange={(value) => updateIncome(income.id, 'frequency', value)}
                      >
                        <SelectTrigger id={`income-frequency-${income.id}`}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addIncome} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Income Source
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4 mt-4">
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div key={expense.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Expense #{index + 1}</h4>
                  {expenses.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`expense-name-${expense.id}`}>Expense Name</Label>
                      <Input
                        id={`expense-name-${expense.id}`}
                        value={expense.name}
                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                        placeholder="e.g., Rent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`expense-category-${expense.id}`}>Category</Label>
                      <Select 
                        value={expense.category} 
                        onValueChange={(value) => updateExpense(expense.id, 'category', value)}
                      >
                        <SelectTrigger id={`expense-category-${expense.id}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="housing">Housing</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="debt">Debt Payments</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`expense-amount-${expense.id}`}>Amount ($)</Label>
                      <Input
                        id={`expense-amount-${expense.id}`}
                        type="number"
                        value={expense.amount}
                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`expense-frequency-${expense.id}`}>Frequency</Label>
                      <Select 
                        value={expense.frequency} 
                        onValueChange={(value) => updateExpense(expense.id, 'frequency', value)}
                      >
                        <SelectTrigger id={`expense-frequency-${expense.id}`}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addExpense} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Expense
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button 
          type="submit" 
          className="w-full bg-navido-blue-500 hover:bg-navido-blue-600"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Income & Expenses"}
        </Button>
      </div>
    </form>
  );
};

export default IncomeExpenseForm;
