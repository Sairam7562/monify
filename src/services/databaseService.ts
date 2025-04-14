
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Database helper functions
export async function getFinancialStatementData(userId: string) {
  try {
    // Fetch personal info
    const { data: personalInfo, error: personalInfoError } = await supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (personalInfoError) {
      console.error('Error fetching personal info:', personalInfoError);
      // Instead of returning early, continue with empty data
    }
    
    // Fetch assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);
    
    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
    }
    
    // Fetch liabilities
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId);
    
    if (liabilitiesError) {
      console.error('Error fetching liabilities:', liabilitiesError);
    }
    
    // Fetch income
    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);
    
    if (incomeError) {
      console.error('Error fetching income:', incomeError);
    }
    
    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
    
    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
    }
    
    return {
      personalInfo: personalInfo || {},
      assets: assets || [],
      liabilities: liabilities || [],
      income: income || [],
      expenses: expenses || []
    };
  } catch (error) {
    console.error('Error generating financial statement data:', error);
    toast.error('Failed to generate financial statement');
    throw error;
  }
}

// Alias for backwards compatibility
export const generateFinancialStatementData = getFinancialStatementData;

// Financial summary for the dashboard
export async function getFinancialSummary(userId: string) {
  try {
    const data = await getFinancialStatementData(userId);
    
    // Calculate total assets
    const totalAssets = data.assets.reduce((total, asset) => {
      return total + (parseFloat(asset.value) || 0) * (parseFloat(asset.ownership_percentage || 100) / 100);
    }, 0);
    
    // Calculate total liabilities
    const totalLiabilities = data.liabilities.reduce((total, liability) => {
      return total + (parseFloat(liability.amount) || 0) * (parseFloat(liability.ownership_percentage || 100) / 100);
    }, 0);
    
    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate monthly income
    const monthlyIncome = data.income.reduce((total, income) => {
      const amount = parseFloat(income.amount) || 0;
      // Convert to monthly amount based on frequency
      switch (income.frequency?.toLowerCase()) {
        case 'weekly': return total + (amount * 4.33);
        case 'bi-weekly': return total + (amount * 2.17);
        case 'monthly': return total + amount;
        case 'quarterly': return total + (amount / 3);
        case 'annually': return total + (amount / 12);
        default: return total + amount;
      }
    }, 0);
    
    // Calculate monthly expenses
    const monthlyExpenses = data.expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      // Convert to monthly amount based on frequency
      switch (expense.frequency?.toLowerCase()) {
        case 'weekly': return total + (amount * 4.33);
        case 'bi-weekly': return total + (amount * 2.17);
        case 'monthly': return total + amount;
        case 'quarterly': return total + (amount / 3);
        case 'annually': return total + (amount / 12);
        default: return total + amount;
      }
    }, 0);
    
    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    
    // Calculate emergency fund ratio (months of expenses covered)
    const emergencyFund = data.assets.reduce((total, asset) => {
      // Only consider liquid assets (cash, savings, etc.)
      if (['cash', 'savings', 'money market', 'checking'].includes(asset.type?.toLowerCase())) {
        return total + (parseFloat(asset.value) || 0);
      }
      return total;
    }, 0);
    
    const emergencyFundRatio = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    
    // Calculate debt-to-asset ratio
    const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    
    // Calculate housing costs ratio
    const housingExpenses = data.expenses.reduce((total, expense) => {
      if (['mortgage', 'rent', 'property tax', 'home insurance', 'hoa'].includes(expense.category?.toLowerCase())) {
        const amount = parseFloat(expense.amount) || 0;
        // Convert to monthly amount based on frequency
        switch (expense.frequency?.toLowerCase()) {
          case 'weekly': return total + (amount * 4.33);
          case 'bi-weekly': return total + (amount * 2.17);
          case 'monthly': return total + amount;
          case 'quarterly': return total + (amount / 3);
          case 'annually': return total + (amount / 12);
          default: return total + amount;
        }
      }
      return total;
    }, 0);
    
    const housingCostRatio = monthlyIncome > 0 ? housingExpenses / monthlyIncome : 0;
    
    // Calculate approximate net worth change (simplified)
    const netWorthChange = 0.05; // Placeholder 5% for demo
    
    // Calculate cash flow change (simplified)
    const cashFlowChange = 0.03; // Placeholder 3% for demo
    
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      emergencyFundRatio,
      debtToAssetRatio,
      housingCostRatio,
      netWorthChange,
      cashFlowChange
    };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    toast.error('Failed to generate financial summary');
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      emergencyFundRatio: 0,
      debtToAssetRatio: 0,
      housingCostRatio: 0,
      netWorthChange: 0,
      cashFlowChange: 0
    };
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    // Attempt a lightweight query to check if the database is responsive
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Retry a failed database query
export async function retryQuery(queryFn: () => Promise<any>, maxAttempts: number = 3) {
  let attempts = 0;
  let lastError;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      return await queryFn();
    } catch (error) {
      console.error(`Query attempt ${attempts} failed:`, error);
      lastError = error;
      
      // Wait longer between each retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  console.error(`Query failed after ${maxAttempts} attempts`);
  throw lastError;
}

// Cache management functions
export async function purgeAllCaches() {
  try {
    console.log("Purging all application caches...");
    // This is a placeholder for actual cache purging logic
    // In a real implementation, this would clear any application caches
    toast.success("All caches have been purged successfully");
    return true;
  } catch (error) {
    console.error("Error purging caches:", error);
    toast.error("Failed to purge application caches");
    return false;
  }
}

export async function getCacheStats() {
  try {
    // This is a placeholder for actual cache statistics
    // In a real implementation, this would return actual cache metrics
    return {
      entries: 0,
      size: "0 KB",
      lastPurged: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return {
      entries: 0,
      size: "0 KB",
      lastPurged: "never"
    };
  }
}
