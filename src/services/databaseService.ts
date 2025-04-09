
import { supabase } from '@/integrations/supabase/client';
import { clearAllCaches } from '@/integrations/supabase/client';

// Check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple lightweight check - just query a system table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error("Database health check failed:", err);
    return false;
  }
}

// Retry a query with refreshed session
export async function retryQuery(queryFn: () => Promise<any>): Promise<any> {
  try {
    // Try to refresh the session first
    await supabase.auth.refreshSession();
    
    // Then retry the query
    return await queryFn();
  } catch (error) {
    console.error("Retry query failed:", error);
    throw error;
  }
}

// Get financial summary for dashboard
export async function getFinancialSummary(userId: string) {
  try {
    console.log("Fetching financial summary for user:", userId);
    
    // Get personal info
    const { data: personalInfo, error: personalInfoError } = await supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (personalInfoError) {
      console.error("Error fetching personal info:", personalInfoError);
    }
    
    // Get assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);
    
    if (assetsError) {
      console.error("Error fetching assets:", assetsError);
    }
    
    // Get liabilities
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId);
    
    if (liabilitiesError) {
      console.error("Error fetching liabilities:", liabilitiesError);
    }
    
    // Get income
    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);
    
    if (incomeError) {
      console.error("Error fetching income:", incomeError);
    }
    
    // Get expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
    
    if (expensesError) {
      console.error("Error fetching expenses:", expensesError);
    }
    
    // Calculate totals
    const totalAssets = calculateTotalAssets(assets || []);
    const totalLiabilities = calculateTotalLiabilities(liabilities || []);
    const monthlyIncome = calculateMonthlyIncome(income || []);
    const monthlyExpenses = calculateMonthlyExpenses(expenses || []);
    
    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate monthly cash flow
    const monthlyCashFlow = monthlyIncome - monthlyExpenses;
    
    // Calculate ratios
    const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    
    // Calculate emergency fund ratio
    const emergencyFundAssets = assets ? assets.filter(asset => asset.type === 'Cash' || asset.type === 'Savings') : [];
    const emergencyFund = emergencyFundAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const emergencyFundRatio = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    
    // Calculate housing cost ratio
    const housingExpenses = expenses ? expenses.filter(expense => 
      expense.category === 'Housing' || 
      expense.category === 'Mortgage' || 
      expense.category === 'Rent'
    ) : [];
    const monthlyHousingCost = calculateMonthlyExpenses(housingExpenses);
    const housingCostRatio = monthlyIncome > 0 ? monthlyHousingCost / monthlyIncome : 0;
    
    // Sample changes for dashboard comparisons
    // In a real app, these would come from historical data
    const netWorthChange = 0.05; // 5% increase
    const cashFlowChange = 0.02; // 2% increase
    
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      netWorthChange,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
      cashFlowChange,
      debtToAssetRatio,
      savingsRate,
      emergencyFundRatio,
      housingCostRatio
    };
  } catch (error) {
    console.error("Error getting financial summary:", error);
    return {};
  }
}

// Get user's financial statement data
export async function getFinancialStatementData(userId: string) {
  try {
    console.log("Fetching financial statement data for user:", userId);
    
    // Get personal info
    const { data: personalInfo, error: personalInfoError } = await supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (personalInfoError) {
      console.error("Error fetching personal info:", personalInfoError);
    }
    
    // Get assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);
    
    if (assetsError) {
      console.error("Error fetching assets:", assetsError);
    }
    
    // Get liabilities
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId);
    
    if (liabilitiesError) {
      console.error("Error fetching liabilities:", liabilitiesError);
    }
    
    // Get income
    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);
    
    if (incomeError) {
      console.error("Error fetching income:", incomeError);
    }
    
    // Get expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
    
    if (expensesError) {
      console.error("Error fetching expenses:", expensesError);
    }
    
    return {
      personalInfo: personalInfo || {},
      assets: assets || [],
      liabilities: liabilities || [],
      income: income || [],
      expenses: expenses || []
    };
  } catch (error) {
    console.error("Error getting financial statement data:", error);
    return {
      personalInfo: {},
      assets: [],
      liabilities: [],
      income: [],
      expenses: []
    };
  }
}

// Helper functions for calculations
function calculateTotalAssets(assets: any[]) {
  return assets.reduce((total, asset) => {
    // Apply ownership percentage
    const value = asset.value * (asset.ownership_percentage || 100) / 100;
    return total + value;
  }, 0);
}

function calculateTotalLiabilities(liabilities: any[]) {
  return liabilities.reduce((total, liability) => {
    // Apply ownership percentage
    const amount = liability.amount * (liability.ownership_percentage || 100) / 100;
    return total + amount;
  }, 0);
}

function calculateMonthlyIncome(incomeItems: any[]) {
  return incomeItems.reduce((total, income) => {
    let monthlyAmount = 0;
    
    switch (income.frequency?.toLowerCase()) {
      case 'weekly':
        monthlyAmount = income.amount * 4.333; // Average weeks in a month
        break;
      case 'biweekly':
        monthlyAmount = income.amount * 2.167; // Average biweekly periods in a month
        break;
      case 'monthly':
        monthlyAmount = income.amount;
        break;
      case 'quarterly':
        monthlyAmount = income.amount / 3;
        break;
      case 'annually':
        monthlyAmount = income.amount / 12;
        break;
      default:
        monthlyAmount = income.amount; // Default to monthly if frequency not specified
    }
    
    return total + monthlyAmount;
  }, 0);
}

function calculateMonthlyExpenses(expenseItems: any[]) {
  return expenseItems.reduce((total, expense) => {
    let monthlyAmount = 0;
    
    switch (expense.frequency?.toLowerCase()) {
      case 'daily':
        monthlyAmount = expense.amount * 30.417; // Average days in a month
        break;
      case 'weekly':
        monthlyAmount = expense.amount * 4.333; // Average weeks in a month
        break;
      case 'biweekly':
        monthlyAmount = expense.amount * 2.167; // Average biweekly periods in a month
        break;
      case 'monthly':
        monthlyAmount = expense.amount;
        break;
      case 'quarterly':
        monthlyAmount = expense.amount / 3;
        break;
      case 'annually':
        monthlyAmount = expense.amount / 12;
        break;
      default:
        monthlyAmount = expense.amount; // Default to monthly if frequency not specified
    }
    
    return total + monthlyAmount;
  }, 0);
}
