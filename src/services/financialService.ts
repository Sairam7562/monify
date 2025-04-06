
import { supabase } from "@/integrations/supabase/client";
import { safeQuery } from "@/services/databaseService";
import { 
  convertToMonthly, 
  calculateTotal, 
  calculateMonthlyTotal,
  calculateCategoryExpenses,
  safeParseFloat
} from "@/utils/financialUtils";
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Define more specific types for better type safety
type BaseItem = {
  id: string;
  [key: string]: any;
};

// Define types for database tables
type AssetItem = BaseItem & {
  name: string;
  value: number | string;
  type: string;
};

type LiabilityItem = BaseItem & {
  name: string;
  amount: number | string;
  type: string;
};

type IncomeItem = BaseItem & {
  source: string; // Note: using source instead of name
  amount: number | string;
  frequency: string;
  type: string;
};

type ExpenseItem = BaseItem & {
  name: string;
  amount: number | string;
  frequency: string;
  category: string;
};

type BusinessInfoItem = BaseItem & {
  business_name: string; // Note: using business_name instead of name
  business_type: string;
};

// Generic financial item type that accommodates all table structures
type FinancialItem = {
  id: string;
  name?: string;    // Made optional to fix TypeScript errors
  source?: string;  // For income items
  business_name?: string; // For business items
  amount?: number | string;
  value?: number | string;
  frequency?: string;
  category?: string;
  type?: string;
  [key: string]: any;
};

type FinancialSummary = {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  debtToAssetRatio: number | null;
  savingsRate: number | null;
  emergencyFundRatio: number;
  housingCostRatio: number;
  netWorthChange: number;
  cashFlowChange: number;
};

// Get all assets for a user
export async function getAssets(userId: string) {
  return await safeQuery<AssetItem[]>(
    async () => {
      // Use type assertion to help TypeScript understand the return type
      return await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId) as PostgrestSingleResponse<AssetItem[]>;
    },
    "Error fetching assets"
  );
}

// Get all liabilities for a user
export async function getLiabilities(userId: string) {
  return await safeQuery<LiabilityItem[]>(
    async () => {
      return await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId) as PostgrestSingleResponse<LiabilityItem[]>;
    },
    "Error fetching liabilities"
  );
}

// Get all income sources for a user
export async function getIncome(userId: string) {
  return await safeQuery<IncomeItem[]>(
    async () => {
      return await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId) as PostgrestSingleResponse<IncomeItem[]>;
    },
    "Error fetching income"
  );
}

// Get all expenses for a user
export async function getExpenses(userId: string) {
  return await safeQuery<ExpenseItem[]>(
    async () => {
      return await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId) as PostgrestSingleResponse<ExpenseItem[]>;
    },
    "Error fetching expenses"
  );
}

// Get personal info for statements
export async function getPersonalInfo(userId: string) {
  return await safeQuery<any>(
    async () => {
      return await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() as PostgrestSingleResponse<any>;
    },
    "Error fetching personal info"
  );
}

// Get business info for statements
export async function getBusinessInfo(userId: string) {
  return await safeQuery<BusinessInfoItem[]>(
    async () => {
      return await supabase
        .from('business_info')
        .select('*')
        .eq('user_id', userId) as PostgrestSingleResponse<BusinessInfoItem[]>;
    },
    "Error fetching business info"
  );
}

// Getting total assets and liabilities for the dashboard
export async function getFinancialSummary(userId: string): Promise<FinancialSummary> {
  const assetsResult = await getAssets(userId);
  const liabilitiesResult = await getLiabilities(userId);
  const incomeResult = await getIncome(userId);
  const expensesResult = await getExpenses(userId);
  
  // Use utility functions for consistent calculations
  const totalAssets = calculateTotal(assetsResult.data, 'value');
  const totalLiabilities = calculateTotal(liabilitiesResult.data, 'amount');
  const monthlyIncome = calculateMonthlyTotal(incomeResult.data);
  const monthlyExpenses = calculateMonthlyTotal(expensesResult.data);
  
  // Calculate housing expenses using utility function
  const housingExpenses = calculateCategoryExpenses(expensesResult.data, 'housing');
  
  // Calculate emergency fund ratio (assuming 10% of assets are in cash)
  const cashAssets = totalAssets * 0.1; // Assumption: 10% of assets are in cash
  const emergencyFundRatio = monthlyExpenses > 0 ? cashAssets / monthlyExpenses : 0;
  
  // Calculate housing cost ratio
  const housingCostRatio = monthlyIncome > 0 ? housingExpenses / monthlyIncome : 0;
  
  // Calculate percentage changes (placeholder values for now)
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

// Define more specific type for financial statement data
type FinancialStatementData = {
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
  assets: Array<{
    id: string;
    name: string;
    value: string;
    includeInReport: boolean;
  }>;
  liabilities: Array<{
    id: string;
    name: string;
    value: string;
    includeInReport: boolean;
  }>;
  incomes: Array<{
    id: string;
    name: string;
    value: string;
    includeInReport: boolean;
  }>;
  expenses: Array<{
    id: string;
    name: string;
    value: string;
    includeInReport: boolean;
  }>;
  statementDate: string;
};

// Generate full financial statement data
export async function generateFinancialStatementData(userId: string): Promise<FinancialStatementData> {
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
    assets: ((assetsResult.data || []) as AssetItem[]).map((asset) => ({
      id: asset.id,
      name: asset.name,
      value: String(asset.value || '0'),
      includeInReport: true
    })),
    liabilities: ((liabilitiesResult.data || []) as LiabilityItem[]).map((liability) => ({
      id: liability.id,
      name: liability.name,
      value: String(liability.amount || '0'),
      includeInReport: true
    })),
    incomes: ((incomeResult.data || []) as IncomeItem[]).map((income) => ({
      id: income.id,
      name: income.source, // Note: mapping source to name
      value: String(income.amount || '0'),
      includeInReport: true
    })),
    expenses: ((expensesResult.data || []) as ExpenseItem[]).map((expense) => ({
      id: expense.id,
      name: expense.name,
      value: String(expense.amount || '0'),
      includeInReport: true
    })),
    statementDate: new Date().toISOString().slice(0, 10)
  };
}
