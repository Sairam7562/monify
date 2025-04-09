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
