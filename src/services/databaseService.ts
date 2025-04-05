import { supabase } from "@/integrations/supabase/client";
import { User } from '@/services/userService';
import { toast } from "sonner";

/**
 * A service to handle common database operations with proper error handling
 * and type safety
 */

// Helper function to safely perform a query with fallback
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string,
  fallbackData?: T
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error(`${errorMessage}:`, result.error);
      return { data: fallbackData || null, error: result.error };
    }
    
    return result;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { data: fallbackData || null, error };
  }
}

// Getting total assets and liabilities for the dashboard
export async function getFinancialSummary(userId: string) {
  const assetsResult = await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('assets')
        .select('value')
        .eq('user_id', userId as any);
    },
    "Error fetching assets"
  );
  
  const liabilitiesResult = await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('liabilities')
        .select('amount')
        .eq('user_id', userId as any);
    },
    "Error fetching liabilities"
  );
  
  const incomeResult = await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('income')
        .select('amount, frequency')
        .eq('user_id', userId as any);
    },
    "Error fetching income"
  );
  
  const expensesResult = await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('expenses')
        .select('amount, frequency, category')
        .eq('user_id', userId as any);
    },
    "Error fetching expenses"
  );
  
  // Calculate totals with appropriate type assertions
  const totalAssets = ((assetsResult.data || []) as any[]).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  const totalLiabilities = ((liabilitiesResult.data || []) as any[]).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Convert all income and expenses to monthly values for proper comparison
  const monthlyIncome = ((incomeResult.data || []) as any[]).reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    const frequency = item.frequency;
    
    // Convert to monthly values
    if (frequency === 'weekly') return sum + (amount * 4.33);
    if (frequency === 'bi-weekly') return sum + (amount * 2.17);
    if (frequency === 'annually') return sum + (amount / 12);
    return sum + amount; // monthly is default
  }, 0);
  
  const monthlyExpenses = ((expensesResult.data || []) as any[]).reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    const frequency = item.frequency;
    
    // Convert to monthly values
    if (frequency === 'weekly') return sum + (amount * 4.33);
    if (frequency === 'bi-weekly') return sum + (amount * 2.17);
    if (frequency === 'annually') return sum + (amount / 12);
    return sum + amount; // monthly is default
  }, 0);
  
  // Calculate housing expenses (assuming housing category is used in expenses)
  const housingExpenses = ((expensesResult.data || []) as any[]).reduce((sum, item) => {
    if (item.category?.toLowerCase() === 'housing') {
      const amount = parseFloat(item.amount) || 0;
      const frequency = item.frequency;
      
      // Convert to monthly values
      if (frequency === 'weekly') return sum + (amount * 4.33);
      if (frequency === 'bi-weekly') return sum + (amount * 2.17);
      if (frequency === 'annually') return sum + (amount / 12);
      return sum + amount; // monthly is default
    }
    return sum;
  }, 0);
  
  // Calculate emergency fund ratio (assuming 3 months of expenses are saved as cash)
  // This is a placeholder calculation - in a real app, you'd have a way to track emergency funds
  const cashAssets = totalAssets * 0.1; // Assuming 10% of assets are in cash
  const emergencyFundRatio = monthlyExpenses > 0 ? cashAssets / monthlyExpenses : 0;
  
  // Calculate housing cost ratio
  const housingCostRatio = monthlyIncome > 0 ? housingExpenses / monthlyIncome : 0;
  
  // Calculate percentage changes (placeholder for now - in a real app, you'd compare to previous period)
  const netWorthChange = totalAssets > 0 ? 5.2 : 0; // Placeholder 5.2% change
  const cashFlowChange = monthlyIncome > 0 ? 3.8 : 0; // Placeholder 3.8% change
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow: monthlyIncome - monthlyExpenses,
    // Financial ratios
    debtToAssetRatio: totalAssets > 0 ? totalLiabilities / totalAssets : null,
    savingsRate: monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : null,
    emergencyFundRatio,
    housingCostRatio,
    // Percentage changes
    netWorthChange,
    cashFlowChange
  };
}

// Get personal info for statements
export async function getPersonalInfo(userId: string) {
  return await safeQuery<any>(
    async () => {
      return await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId as any)
        .maybeSingle();
    },
    "Error fetching personal info"
  );
}

// Get business info for statements
export async function getBusinessInfo(userId: string) {
  return await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('business_info')
        .select('*')
        .eq('user_id', userId as any);
    },
    "Error fetching business info"
  );
}

// Get all assets for a user
export async function getAssets(userId: string) {
  return await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId as any);
    },
    "Error fetching assets"
  );
}

// Get all liabilities for a user
export async function getLiabilities(userId: string) {
  return await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId as any);
    },
    "Error fetching liabilities"
  );
}

// Get all income sources for a user
export async function getIncome(userId: string) {
  return await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId as any);
    },
    "Error fetching income"
  );
}

// Get all expenses for a user
export async function getExpenses(userId: string) {
  return await safeQuery<any[]>(
    async () => {
      return await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId as any);
    },
    "Error fetching expenses"
  );
}

// Generate full financial statement data
export async function generateFinancialStatementData(userId: string) {
  const personalInfoResult = await getPersonalInfo(userId);
  const assetsResult = await getAssets(userId);
  const liabilitiesResult = await getLiabilities(userId);
  const incomeResult = await getIncome(userId);
  const expensesResult = await getExpenses(userId);
  
  const personalInfo = personalInfoResult.data || {} as any;
  
  // Format data for financial statement component with explicit type safety
  return {
    profileImage: personalInfo.profile_image as string || null,
    fullName: `${personalInfo.first_name as string || ''} ${personalInfo.last_name as string || ''}`.trim() || 'Anonymous User',
    email: personalInfo.email as string || '',
    phone: personalInfo.phone as string || '',
    address: {
      street: personalInfo.address as string || '',
      city: personalInfo.city as string || '',
      state: personalInfo.state as string || '',
      zipCode: personalInfo.zip_code as string || '',
      country: 'United States', // Default
      includeInReport: true
    },
    assets: ((assetsResult.data || []) as any[]).map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      value: asset.value.toString(),
      includeInReport: true
    })),
    liabilities: ((liabilitiesResult.data || []) as any[]).map((liability: any) => ({
      id: liability.id,
      name: liability.name,
      value: liability.amount.toString(),
      includeInReport: true
    })),
    incomes: ((incomeResult.data || []) as any[]).map((income: any) => ({
      id: income.id,
      name: income.source,
      value: income.amount.toString(),
      includeInReport: true
    })),
    expenses: ((expensesResult.data || []) as any[]).map((expense: any) => ({
      id: expense.id,
      name: expense.name,
      value: expense.amount.toString(),
      includeInReport: true
    })),
    statementDate: new Date().toISOString().slice(0, 10)
  };
}
