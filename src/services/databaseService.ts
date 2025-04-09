import { supabase, clearAllCaches } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * A service to handle common database operations with proper error handling
 * and type safety. Includes optimized caching mechanisms.
 */

// Cache expiration time (15 minutes in milliseconds)
const CACHE_EXPIRY_TIME = 15 * 60 * 1000;

// Improved generic type for the safeQuery function with better flexibility for different return types
export async function safeQuery<T>(
  queryFn: () => Promise<PostgrestSingleResponse<T>>,
  errorMessage: string,
  fallbackData?: T,
  cacheKey?: string // Optional cache key for storing data
): Promise<{ data: T | null; error: any; success: boolean; localData?: T | null }> {
  try {
    // Try to find data in localStorage first if this is a common query that might be cached
    let localStorageKey = null;
    const userId = localStorage.getItem('currentUserId');
    
    if (cacheKey && userId) {
      localStorageKey = `${cacheKey}_${userId}`;
    } else if (errorMessage.includes('personal info') && userId) {
      localStorageKey = `personal_info_${userId}`;
    }
    
    let cachedLocalData: T | null = null;
    let cacheTimestamp = 0;
    
    if (localStorageKey) {
      try {
        const storedData = localStorage.getItem(localStorageKey);
        const cacheMetaString = localStorage.getItem(`${localStorageKey}_meta`);
        
        if (storedData && cacheMetaString) {
          const cacheMeta = JSON.parse(cacheMetaString);
          cacheTimestamp = cacheMeta.timestamp || 0;
          
          // Check if cache is still valid
          const now = Date.now();
          if (now - cacheTimestamp < CACHE_EXPIRY_TIME) {
            console.info(`Using cached data from ${localStorageKey}, age: ${(now - cacheTimestamp) / 1000}s`);
            cachedLocalData = JSON.parse(storedData);
          } else {
            console.info(`Cache expired for ${localStorageKey}, fetching fresh data`);
          }
        } else if (storedData) {
          console.info('Using locally stored data without timestamp');
          cachedLocalData = JSON.parse(storedData);
        }
      } catch (err) {
        console.warn('Error parsing local data:', err);
        // Reset cached data if parsing fails
        cachedLocalData = null;
      }
    }
    
    // If we have fresh enough local data, return it immediately without network request
    if (cachedLocalData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_EXPIRY_TIME)) {
      return { data: cachedLocalData, error: null, success: true, localData: cachedLocalData };
    }
    
    // No valid cache, proceed with the database query
    const result = await queryFn();
    
    if (result.error) {
      console.error(`${errorMessage}:`, result.error);
      
      // Check for specific error types to provide more helpful diagnostics
      if (result.error.code === 'PGRST106' || result.error.message?.includes('schema')) {
        console.error('Database schema issue detected:', result.error.message);
        sessionStorage.setItem('db_schema_error', 'true');
        
        // Return local data if available as a fallback
        if (cachedLocalData) {
          console.info("Database query failed but returning cached data as fallback");
          return { data: cachedLocalData, error: result.error, success: false, localData: cachedLocalData };
        }
      } else if (result.error.code?.includes('auth')) {
        console.error('Authentication issue detected:', result.error.message);
        sessionStorage.setItem('db_auth_error', 'true');
      } else if (result.error.message?.includes('Failed to fetch')) {
        console.error('Network issue detected:', result.error.message);
        sessionStorage.setItem('db_network_error', 'true');
        
        // Use cached data if available during network issues
        if (cachedLocalData) {
          console.info("Network error, using cached data");
          return { data: cachedLocalData, error: result.error, success: false, localData: cachedLocalData };
        }
      }
      
      // Return local data if available as a fallback
      if (cachedLocalData) {
        return { data: cachedLocalData, error: result.error, success: false, localData: cachedLocalData };
      }
      
      return { data: fallbackData || null, error: result.error, success: false };
    }
    
    // If we have data and a local storage key, update the local cache
    if (localStorageKey && result.data) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(result.data));
        
        // Store cache metadata with timestamp
        const metadata = {
          timestamp: Date.now(),
          source: 'database'
        };
        localStorage.setItem(`${localStorageKey}_meta`, JSON.stringify(metadata));
        
      } catch (err) {
        console.warn('Error saving data to localStorage:', err);
      }
    }
    
    return { data: result.data as T, error: null, success: true, localData: cachedLocalData };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Additional error diagnostics for troubleshooting
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network connectivity issue detected');
      sessionStorage.setItem('db_network_error', 'true');
      
      // Define a scope-accessible variable for cached data
      let fallbackCachedData: T | null = null;
      
      // Try to get cached data for network outages
      try {
        const userId = localStorage.getItem('currentUserId');
        let localStorageKey = null;
        
        if (cacheKey && userId) {
          localStorageKey = `${cacheKey}_${userId}`;
        } else if (errorMessage.includes('personal info') && userId) {
          localStorageKey = `personal_info_${userId}`;
        }
        
        if (localStorageKey) {
          const storedData = localStorage.getItem(localStorageKey);
          if (storedData) {
            fallbackCachedData = JSON.parse(storedData);
            console.info("Network error caught, using cached data");
            return { data: fallbackCachedData, error, success: false, localData: fallbackCachedData };
          }
        }
      } catch (cacheError) {
        console.warn('Error retrieving cached data during network error:', cacheError);
      }
    }
    
    return { data: fallbackData || null, error, success: false };
  }
}

// Helper to retry failed queries with exponential backoff
export async function retryQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any; success: boolean }>,
  maxRetries: number = 3,
  initialDelay: number = 300
): Promise<{ data: T | null; error: any; success: boolean }> {
  let retries = 0;
  let currentDelay = initialDelay;
  
  while (retries < maxRetries) {
    const result = await queryFn();
    
    if (result.success) {
      return result;
    }
    
    retries++;
    if (retries >= maxRetries) {
      return result;
    }
    
    // Wait with exponential backoff before retrying
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    currentDelay *= 2; // Exponential backoff
  }
  
  return { data: null, error: new Error("Max retries exceeded"), success: false };
}

// Check database connectivity with minimal impact
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Try a simple health check query with minimal column selection
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      // Log schema errors for debugging
      if (error.code === 'PGRST106' || error.message?.includes('schema')) {
        console.error('Schema issue in health check:', error.message);
        sessionStorage.setItem('db_schema_error', 'true');
      }
      return false;
    }
    
    // Clear schema error flag if health check passes
    sessionStorage.removeItem('db_schema_error');
    return true;
  } catch (err) {
    console.error("Database health check failed:", err);
    return false;
  }
}

// Clear cached data for the current user
export function clearUserCache(userId?: string): void {
  const currentUserId = userId || localStorage.getItem('currentUserId');
  if (!currentUserId) return;
  
  console.log(`Clearing cache for user: ${currentUserId}`);
  
  // List of cache keys to clear for this user
  const cachePatterns = [
    `personal_info_${currentUserId}`,
    `business_info_${currentUserId}`,
    `assets_${currentUserId}`,
    `liabilities_${currentUserId}`,
    `income_${currentUserId}`,
    `expenses_${currentUserId}`
  ];
  
  // Find and remove all matching keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Check if any pattern matches this key
    if (cachePatterns.some(pattern => key.startsWith(pattern))) {
      localStorage.removeItem(key);
      // Also remove any associated metadata
      localStorage.removeItem(`${key}_meta`);
      console.log(`Cleared cache: ${key}`);
    }
  }
}

// Clear all caches and database error flags
export function purgeAllCaches(): void {
  clearAllCaches(); // This is imported from client.ts
  
  // Also clear any error indicators
  sessionStorage.removeItem('db_schema_error');
  sessionStorage.removeItem('db_auth_error');
  sessionStorage.removeItem('db_network_error');
  
  // Show feedback to the user
  toast.info("All app caches have been cleared");
}

// Cache health check - returns stats about the cache
export function getCacheStats(): { size: number, entries: number, oldestEntry: number } {
  let totalSize = 0;
  let entries = 0;
  let oldestTimestamp = Date.now();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Only count app data
    if (key.includes('_info_') || key.includes('assets_') || 
        key.includes('liabilities_') || key.includes('income_') || 
        key.includes('expenses_')) {
      
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        entries++;
        
        // Check for metadata to find oldest entry
        const metaKey = `${key}_meta`;
        const metaData = localStorage.getItem(metaKey);
        if (metaData) {
          try {
            const meta = JSON.parse(metaData);
            if (meta.timestamp && meta.timestamp < oldestTimestamp) {
              oldestTimestamp = meta.timestamp;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
  
  return {
    size: Math.round(totalSize / 1024), // size in KB
    entries,
    oldestEntry: Date.now() - oldestTimestamp // age in ms
  };
}

// Generate financial statement data for a user
export async function generateFinancialStatementData(userId: string) {
  try {
    const personalInfoResult = await safeQuery<any>(
      () => supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      "Error fetching personal info"
    );
    
    const assetsResult = await safeQuery<any[]>(
      () => supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId),
      "Error fetching assets"
    );
    
    const liabilitiesResult = await safeQuery<any[]>(
      () => supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId),
      "Error fetching liabilities"
    );
    
    const incomeResult = await safeQuery<any[]>(
      () => supabase
        .from('income')
        .select('*')
        .eq('user_id', userId),
      "Error fetching income"
    );
    
    const expensesResult = await safeQuery<any[]>(
      () => supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId),
      "Error fetching expenses"
    );
    
    const personalInfo = personalInfoResult.data || {} as any;
    
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
      assets: ((assetsResult.data || []) as any[]).map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        value: asset.value?.toString() || '0',
        includeInReport: true
      })),
      liabilities: ((liabilitiesResult.data || []) as any[]).map((liability: any) => ({
        id: liability.id,
        name: liability.name,
        value: liability.amount?.toString() || '0',
        includeInReport: true
      })),
      incomes: ((incomeResult.data || []) as any[]).map((income: any) => ({
        id: income.id,
        name: income.source,
        value: income.amount?.toString() || '0',
        includeInReport: true
      })),
      expenses: ((expensesResult.data || []) as any[]).map((expense: any) => ({
        id: expense.id,
        name: expense.name,
        value: expense.amount?.toString() || '0',
        includeInReport: true
      })),
      statementDate: new Date().toISOString().slice(0, 10)
    };
  } catch (error) {
    console.error("Error generating financial statement data:", error);
    toast.error("Could not generate financial statement");
    return null;
  }
}

// Get financial summary for the dashboard
export async function getFinancialSummary(userId: string) {
  try {
    const assetsResult = await safeQuery<any[]>(
      () => supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId),
      "Error fetching assets"
    );
    
    const liabilitiesResult = await safeQuery<any[]>(
      () => supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId),
      "Error fetching liabilities"
    );
    
    const incomeResult = await safeQuery<any[]>(
      () => supabase
        .from('income')
        .select('*')
        .eq('user_id', userId),
      "Error fetching income"
    );
    
    const expensesResult = await safeQuery<any[]>(
      () => supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId),
      "Error fetching expenses"
    );
    
    // Calculate totals
    const totalAssets = ((assetsResult.data || []) as any[]).reduce((sum, item) => 
      sum + (parseFloat(item.value) || 0), 0);
      
    const totalLiabilities = ((liabilitiesResult.data || []) as any[]).reduce((sum, item) => 
      sum + (parseFloat(item.amount) || 0), 0);
      
    const monthlyIncome = ((incomeResult.data || []) as any[]).reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      // Convert to monthly equivalent based on frequency
      if (item.frequency === 'annual') return sum + (amount / 12);
      if (item.frequency === 'quarterly') return sum + (amount / 3);
      if (item.frequency === 'weekly') return sum + (amount * 4.33);
      if (item.frequency === 'bi-weekly') return sum + (amount * 2.17);
      return sum + amount; // monthly
    }, 0);
    
    const monthlyExpenses = ((expensesResult.data || []) as any[]).reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      // Convert to monthly equivalent based on frequency
      if (item.frequency === 'annual') return sum + (amount / 12);
      if (item.frequency === 'quarterly') return sum + (amount / 3);
      if (item.frequency === 'weekly') return sum + (amount * 4.33);
      if (item.frequency === 'bi-weekly') return sum + (amount * 2.17);
      return sum + amount; // monthly
    }, 0);
    
    const netWorth = totalAssets - totalLiabilities;
    const cashFlow = monthlyIncome - monthlyExpenses;
    
    // Calculate various financial ratios
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) : 0;
    
    // Estimate emergency fund ratio (assume 25% of assets are liquid)
    const liquidAssets = totalAssets * 0.25;
    const emergencyFundRatio = monthlyExpenses > 0 ? (liquidAssets / monthlyExpenses) : 0;
    
    // Housing cost ratio (assume 30% of expenses are housing)
    const housingCosts = monthlyExpenses * 0.3;
    const housingCostRatio = monthlyIncome > 0 ? (housingCosts / monthlyIncome) : 0;
    
    // Calculate percentage changes (mock data for demo)
    const netWorthChange = 5.2; // 5.2% increase from previous period
    const cashFlowChange = 3.8; // 3.8% increase from previous period
    
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      cashFlow,
      debtToAssetRatio,
      savingsRate,
      emergencyFundRatio,
      housingCostRatio,
      netWorthChange,
      cashFlowChange
    };
  } catch (error) {
    console.error("Error getting financial summary:", error);
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      cashFlow: 0,
      debtToAssetRatio: 0,
      savingsRate: 0,
      emergencyFundRatio: 0,
      housingCostRatio: 0,
      netWorthChange: 0,
      cashFlowChange: 0
    };
  }
}

// Forward exports from financialService but NOT importing from here
// to avoid circular dependencies
export * from '@/services/financialService';
