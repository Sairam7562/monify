
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
  const assetsResult = await safeQuery(
    () => supabase
      .from('assets')
      .select('value')
      .eq('user_id', userId as any),
    "Error fetching assets"
  );
  
  const liabilitiesResult = await safeQuery(
    () => supabase
      .from('liabilities')
      .select('amount')
      .eq('user_id', userId as any),
    "Error fetching liabilities"
  );
  
  const incomeResult = await safeQuery(
    () => supabase
      .from('income')
      .select('amount, frequency')
      .eq('user_id', userId as any),
    "Error fetching income"
  );
  
  const expensesResult = await safeQuery(
    () => supabase
      .from('expenses')
      .select('amount, frequency')
      .eq('user_id', userId as any),
    "Error fetching expenses"
  );
  
  // Calculate totals
  const totalAssets = (assetsResult.data || []).reduce((sum, item: any) => sum + (parseFloat(item.value) || 0), 0);
  const totalLiabilities = (liabilitiesResult.data || []).reduce((sum, item: any) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Convert all income and expenses to monthly values for proper comparison
  const monthlyIncome = (incomeResult.data || []).reduce((sum, item: any) => {
    const amount = parseFloat(item.amount) || 0;
    const frequency = item.frequency;
    
    // Convert to monthly values
    if (frequency === 'weekly') return sum + (amount * 4.33);
    if (frequency === 'bi-weekly') return sum + (amount * 2.17);
    if (frequency === 'annually') return sum + (amount / 12);
    return sum + amount; // monthly is default
  }, 0);
  
  const monthlyExpenses = (expensesResult.data || []).reduce((sum, item: any) => {
    const amount = parseFloat(item.amount) || 0;
    const frequency = item.frequency;
    
    // Convert to monthly values
    if (frequency === 'weekly') return sum + (amount * 4.33);
    if (frequency === 'bi-weekly') return sum + (amount * 2.17);
    if (frequency === 'annually') return sum + (amount / 12);
    return sum + amount; // monthly is default
  }, 0);
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow: monthlyIncome - monthlyExpenses,
    // Calculate financial ratios
    debtToAssetRatio: totalAssets > 0 ? totalLiabilities / totalAssets : null,
    savingsRate: monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : null,
  };
}

// Get personal info for statements
export async function getPersonalInfo(userId: string) {
  return safeQuery(
    () => supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', userId as any)
      .maybeSingle(),
    "Error fetching personal info"
  );
}

// Get business info for statements
export async function getBusinessInfo(userId: string) {
  return safeQuery(
    () => supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId as any),
    "Error fetching business info"
  );
}

// Get all assets for a user
export async function getAssets(userId: string) {
  return safeQuery(
    () => supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId as any),
    "Error fetching assets"
  );
}

// Get all liabilities for a user
export async function getLiabilities(userId: string) {
  return safeQuery(
    () => supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId as any),
    "Error fetching liabilities"
  );
}

// Get all income sources for a user
export async function getIncome(userId: string) {
  return safeQuery(
    () => supabase
      .from('income')
      .select('*')
      .eq('user_id', userId as any),
    "Error fetching income"
  );
}

// Get all expenses for a user
export async function getExpenses(userId: string) {
  return safeQuery(
    () => supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId as any),
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
  
  const personalInfo = personalInfoResult.data || {};
  
  // Format data for financial statement component
  return {
    profileImage: personalInfo.profile_image || null,
    fullName: `${personalInfo.first_name || ''} ${personalInfo.last_name || ''}`.trim() || 'Anonymous User',
    email: personalInfo.email || '',
    phone: personalInfo.phone || '',
    address: {
      street: personalInfo.address || '',
      city: personalInfo.city || '',
      state: personalInfo.state || '',
      zipCode: personalInfo.zip_code || '',
      country: 'United States', // Default
      includeInReport: true
    },
    assets: (assetsResult.data || []).map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      value: asset.value.toString(),
      includeInReport: true
    })),
    liabilities: (liabilitiesResult.data || []).map((liability: any) => ({
      id: liability.id,
      name: liability.name,
      value: liability.amount.toString(),
      includeInReport: true
    })),
    incomes: (incomeResult.data || []).map((income: any) => ({
      id: income.id,
      name: income.source,
      value: income.amount.toString(),
      includeInReport: true
    })),
    expenses: (expensesResult.data || []).map((expense: any) => ({
      id: expense.id,
      name: expense.name,
      value: expense.amount.toString(),
      includeInReport: true
    })),
    statementDate: new Date().toISOString().slice(0, 10)
  };
}
