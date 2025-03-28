
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
import { PlusCircle, Trash2, Save, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';

interface Income {
  id: number;
  source: string;
  type: string;
  amount: string;
  frequency: string;
  saved?: boolean;
  saving?: boolean;
}

interface Expense {
  id: number;
  name: string;
  category: string;
  amount: string;
  frequency: string;
  saved?: boolean;
  saving?: boolean;
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
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);

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
          frequency: income.frequency,
          saved: true
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
          frequency: expense.frequency,
          saved: true
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
    setAllSaved(false);
  };

  const removeIncome = (id: number) => {
    if (incomes.length > 1) {
      setIncomes(incomes.filter(income => income.id !== id));
      setAllSaved(false);
    }
  };

  const updateIncome = (id: number, field: keyof Income, value: string) => {
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, [field]: value, saved: false } : income
    ));
    setAllSaved(false);
  };

  const addExpense = () => {
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    setExpenses([...expenses, { id: newId, name: '', category: 'housing', amount: '', frequency: 'monthly' }]);
    setAllSaved(false);
  };

  const removeExpense = (id: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id));
      setAllSaved(false);
    }
  };

  const updateExpense = (id: number, field: keyof Expense, value: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value, saved: false } : expense
    ));
    setAllSaved(false);
  };

  const saveIndividualIncome = async (id: number) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your data",
        variant: "destructive"
      });
      return;
    }
    
    const incomeToSave = incomes.find(income => income.id === id);
    if (!incomeToSave) return;
    
    if (!incomeToSave.source.trim()) {
      toast({
        title: "Missing information",
        description: "Income source is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!incomeToSave.amount.trim() || isNaN(Number(incomeToSave.amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    // Mark this income as saving
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, saving: true } : income
    ));
    
    try {
      // Save just this income with the current state of others
      await saveIncome(incomes);
      
      // Mark as saved
      setIncomes(incomes.map(income => 
        income.id === id ? { ...income, saving: false, saved: true } : income
      ));
      
      toast({
        title: "Income saved",
        description: "Income source has been saved successfully",
      });
      
      // Check if all incomes and expenses are now saved
      checkIfAllSaved();
    } catch (error) {
      console.error("Error saving income:", error);
      setIncomes(incomes.map(income => 
        income.id === id ? { ...income, saving: false } : income
      ));
      
      toast({
        title: "Error saving income",
        description: "There was an error saving your income",
        variant: "destructive"
      });
    }
  };

  const saveIndividualExpense = async (id: number) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your data",
        variant: "destructive"
      });
      return;
    }
    
    const expenseToSave = expenses.find(expense => expense.id === id);
    if (!expenseToSave) return;
    
    if (!expenseToSave.name.trim()) {
      toast({
        title: "Missing information",
        description: "Expense name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!expenseToSave.amount.trim() || isNaN(Number(expenseToSave.amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    // Mark this expense as saving
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, saving: true } : expense
    ));
    
    try {
      // Save just this expense with the current state of others
      await saveExpenses(expenses);
      
      // Mark as saved
      setExpenses(expenses.map(expense => 
        expense.id === id ? { ...expense, saving: false, saved: true } : expense
      ));
      
      toast({
        title: "Expense saved",
        description: "Expense has been saved successfully",
      });
      
      // Check if all incomes and expenses are now saved
      checkIfAllSaved();
    } catch (error) {
      console.error("Error saving expense:", error);
      setExpenses(expenses.map(expense => 
        expense.id === id ? { ...expense, saving: false } : expense
      ));
      
      toast({
        title: "Error saving expense",
        description: "There was an error saving your expense",
        variant: "destructive"
      });
    }
  };

  const checkIfAllSaved = () => {
    const allIncomesSaved = incomes.every(income => income.saved);
    const allExpensesSaved = expenses.every(expense => expense.saved);
    setAllSaved(allIncomesSaved && allExpensesSaved);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your data",
        variant: "destructive"
      });
      return;
    }
    
    // Validate inputs
    const hasEmptyIncome = incomes.some(income => !income.source.trim() || !income.amount.trim());
    const hasEmptyExpense = expenses.some(expense => !expense.name.trim() || !expense.amount.trim());
    
    if (hasEmptyIncome || hasEmptyExpense) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setSavingAll(true);
    
    try {
      await saveIncome(incomes);
      await saveExpenses(expenses);
      
      // Mark all as saved
      setIncomes(incomes.map(income => ({ ...income, saved: true })));
      setExpenses(expenses.map(expense => ({ ...expense, saved: true })));
      
      setAllSaved(true);
      
      toast({
        title: "Data saved",
        description: "Income and expense information saved successfully",
      });
    } catch (error) {
      console.error("Error saving income and expenses:", error);
      toast({
        title: "Error saving data",
        description: "There was an error saving your information",
        variant: "destructive"
      });
    } finally {
      setSavingAll(false);
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
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => saveIndividualIncome(income.id)}
                      disabled={income.saving || (income.saved && !!income.source.trim())}
                      className={income.saved ? "bg-green-50 text-green-700 border-green-300" : ""}
                    >
                      {income.saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                        </>
                      ) : income.saved ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </Button>
                    
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
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => saveIndividualExpense(expense.id)}
                      disabled={expense.saving || (expense.saved && !!expense.name.trim())}
                      className={expense.saved ? "bg-green-50 text-green-700 border-green-300" : ""}
                    >
                      {expense.saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                        </>
                      ) : expense.saved ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </Button>
                    
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
          className={`w-full ${allSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-navido-blue-500 hover:bg-navido-blue-600'}`}
          disabled={loading || savingAll}
        >
          {savingAll ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving All...
            </>
          ) : allSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" /> All Income & Expenses Saved
            </>
          ) : (
            <>Save All Income & Expenses</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default IncomeExpenseForm;
