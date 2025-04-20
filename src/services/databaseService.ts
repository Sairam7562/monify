import { supabase } from '@/integrations/supabase/client';
import { clearAllCaches } from '@/integrations/supabase/client';
import { calculateNetWorth, calculateSavingsRate, calculateDebtToAssetRatio, calculateEmergencyFundRatio } from '@/utils/financialUtils';

// Function to get financial statement data by type
async function getFinancialStatementData(userId: string, dataType: 'personal_info' | 'assets' | 'liabilities' | 'income' | 'expenses') {
  try {
    console.log(`Fetching ${dataType} data for user: ${userId}`);
    
    const { data, error } = await supabase
      .from(dataType)
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error fetching ${dataType}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
    throw error;
  }
}

// Generate financial statement data
export async function generateFinancialStatementData(userId: string) {
  try {
    const personalInfo = await getFinancialStatementData(userId, 'personal_info');
    const assets = await getFinancialStatementData(userId, 'assets');
    const liabilities = await getFinancialStatementData(userId, 'liabilities');
    const income = await getFinancialStatementData(userId, 'income');
    const expenses = await getFinancialStatementData(userId, 'expenses');
    
    return {
      personalInfo: personalInfo[0] || {},
      assets: assets || [],
      liabilities: liabilities || [],
      income: income || [],
      expenses: expenses || []
    };
  } catch (error) {
    console.error("Error generating financial statement data:", error);
    throw error;
  }
}

// Function to get financial summary for dashboard
export async function getFinancialSummary(userId: string) {
  try {
    const data = await generateFinancialStatementData(userId);
    
    // Calculate total assets
    const totalAssets = data.assets.reduce((sum, asset) => {
      return sum + (asset.value * (asset.ownership_percentage || 100) / 100);
    }, 0);
    
    // Calculate total liabilities
    const totalLiabilities = data.liabilities.reduce((sum, liability) => {
      return sum + (liability.amount * (liability.ownership_percentage || 100) / 100);
    }, 0);
    
    // Calculate monthly income
    const monthlyIncome = data.income.reduce((sum, income) => {
      // Convert all income to monthly
      let monthlyAmount = income.amount;
      switch (income.frequency) {
        case 'annual':
          monthlyAmount = income.amount / 12;
          break;
        case 'semi_annual':
          monthlyAmount = income.amount / 6;
          break;
        case 'quarterly':
          monthlyAmount = income.amount / 3;
          break;
        case 'bi_weekly':
          monthlyAmount = income.amount * 26 / 12;
          break;
        case 'weekly':
          monthlyAmount = income.amount * 52 / 12;
          break;
        // Monthly is already correct
      }
      return sum + monthlyAmount;
    }, 0);
    
    // Calculate monthly expenses
    const monthlyExpenses = data.expenses.reduce((sum, expense) => {
      // Convert all expenses to monthly
      let monthlyAmount = expense.amount;
      switch (expense.frequency) {
        case 'annual':
          monthlyAmount = expense.amount / 12;
          break;
        case 'semi_annual':
          monthlyAmount = expense.amount / 6;
          break;
        case 'quarterly':
          monthlyAmount = expense.amount / 3;
          break;
        case 'bi_weekly':
          monthlyAmount = expense.amount * 26 / 12;
          break;
        case 'weekly':
          monthlyAmount = expense.amount * 52 / 12;
          break;
        // Monthly is already correct
      }
      return sum + monthlyAmount;
    }, 0);
    
    // Calculate net worth
    const netWorth = calculateNetWorth(totalAssets, totalLiabilities);
    
    // Calculate financial ratios
    const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
    const debtToAssetRatio = calculateDebtToAssetRatio(totalLiabilities, totalAssets);
    const emergencyFundRatio = calculateEmergencyFundRatio(
      data.assets.filter(a => a.type === 'cash' || a.type === 'savings').reduce((sum, a) => sum + a.value, 0),
      monthlyExpenses
    );
    
    // Calculate housing costs (rent/mortgage + utilities + property tax)
    const housingExpenses = data.expenses.filter(e => 
      e.category === 'housing' || 
      e.category === 'mortgage' || 
      e.category === 'rent' || 
      e.category === 'utilities' ||
      e.category === 'property_tax'
    ).reduce((sum, e) => {
      let monthlyAmount = e.amount;
      if (e.frequency === 'annual') monthlyAmount = e.amount / 12;
      return sum + monthlyAmount;
    }, 0);
    
    const housingCostRatio = monthlyIncome > 0 ? housingExpenses / monthlyIncome : 0;
    
    // This would typically be calculated with historical data
    // For now we'll use placeholder percentages
    const netWorthChange = 0.05; // 5% increase from previous period
    const cashFlowChange = 0.03; // 3% increase from previous period
    
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      debtToAssetRatio,
      emergencyFundRatio,
      housingCostRatio,
      netWorthChange,
      cashFlowChange
    };
  } catch (error) {
    console.error("Error generating financial summary:", error);
    // Return empty summary to prevent UI crashes
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      debtToAssetRatio: 0,
      emergencyFundRatio: 0,
      housingCostRatio: 0,
      netWorthChange: 0,
      cashFlowChange: 0
    };
  }
}

// Function to test database health with a lightweight query
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    console.log("Performing lightweight database health check...");
    
    // First try to check auth status as a quick test
    const { data: { session } } = await supabase.auth.getSession();
    
    // Now try a simple query on the profiles table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.warn("Database health check failed:", error.message);
      
      // Check if this is a schema error
      if (error.message?.includes('schema') || 
          error.message?.includes('relation') || 
          error.code === 'PGRST106' || 
          error.code === '42P01') {
        console.error("Schema error detected during health check");
        localStorage.setItem('db_schema_error', 'true');
      }
      
      return false;
    }
    
    console.log("Database health check passed");
    return true;
  } catch (error) {
    console.error("Error during database health check:", error);
    return false;
  }
}

// Function to retry a failed query with automatic backoff
export async function retryQuery<T>(
  queryFn: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 500
): Promise<T> {
  let attempts = 0;
  let delay = initialDelay;
  
  while (attempts < maxRetries) {
    try {
      return await queryFn();
    } catch (error: any) {
      attempts++;
      
      // If we've exhausted retries, throw the error
      if (attempts >= maxRetries) {
        throw error;
      }
      
      console.warn(`Query failed (attempt ${attempts}/${maxRetries}), retrying in ${delay}ms:`, error.message);
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 5000); // Max 5 second delay
      
      // Try refreshing auth session before next attempt
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await supabase.auth.refreshSession();
        }
      } catch (e) {
        console.warn("Could not refresh session before retry:", e);
      }
    }
  }
  
  // This should never happen due to the throw in the catch block
  throw new Error("Max retries exceeded");
}

// Create a function to fix schema issues
export async function attemptSchemaRepair(): Promise<boolean> {
  console.log("Attempting to repair schema configuration...");
  
  try {
    // First, try signing out and back in to refresh tokens
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Store credentials temporarily
      const email = sessionData.session.user.email;
      
      // Sign out
      await supabase.auth.signOut();
      
      // Reload the client to reset internal state
      // Note: We need to handle the type issue with supabase.options
      const options = (supabase as any).options || {};
      if (options && options.db) {
        options.db.schema = 'public';
      }
      
      // Test if we can now access the database
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log("Schema repair successful through client reset");
        return true;
      }
      
      console.log("Schema issues persist after client reset, trying other methods...");
    }
    
    // Try explicit RPC command to set schema
    const { error: rpcError } = await supabase.rpc('set_schema', { schema_name: 'public' });
    
    if (!rpcError) {
      // Test if schema is now accessible
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!testError) {
        console.log("Schema repair successful through RPC command");
        return true;
      }
    }
    
    // If all else fails, return false
    console.error("All schema repair attempts failed");
    return false;
  } catch (error) {
    console.error("Error during schema repair attempt:", error);
    return false;
  }
}

// Function to purge all caches
export function purgeAllCaches(): void {
  console.log("Purging all application caches");
  clearAllCaches();
  localStorage.removeItem('db_schema_error');
  
  // Clear any cached financial data
  const cacheKeys = [
    'financial_summary_',
    'assets_',
    'liabilities_',
    'income_',
    'expenses_',
    'personal_info_'
  ];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    if (cacheKeys.some(prefix => key.startsWith(prefix))) {
      localStorage.removeItem(key);
      console.log(`Removed cache: ${key}`);
    }
  }
  
  // Set last purged timestamp
  localStorage.setItem('cache_last_purged', new Date().toISOString());
}

// Function to get cache statistics
export function getCacheStats(): { count: number, size: number, items: string[], lastPurged?: string } {
  let count = 0;
  let size = 0;
  const items: string[] = [];
  const lastPurged = localStorage.getItem('cache_last_purged');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Only count application-specific cache items
    if (key.includes('_') && 
        !key.startsWith('supabase.auth') && 
        !key.startsWith('ally-supports-cache')) {
      const value = localStorage.getItem(key);
      if (value) {
        count++;
        size += value.length * 2; // Approximate size in bytes (2 bytes per character)
        items.push(key);
      }
    }
  }
  
  return {
    count,
    size: Math.round(size / 1024), // Convert to KB
    items,
    lastPurged: lastPurged || undefined
  };
}
