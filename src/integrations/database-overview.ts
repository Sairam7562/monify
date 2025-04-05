
/**
 * DATABASE CONNECTION OVERVIEW
 * 
 * This file consolidates all the key database-related code from various files
 * to make it easier to analyze and debug database issues.
 * 
 * IMPORTANT: This is for analysis only - do not import this file in your application!
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { User } from '@/services/userService';
import { Session } from '@supabase/supabase-js';

// ==============================
// SUPABASE CLIENT CONFIGURATION
// ==============================

const SUPABASE_URL = "https://hioribtoyuxrrxmcmldi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3JpYnRveXV4cnJ4bWNtbGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzQwODAsImV4cCI6MjA1ODc1MDA4MH0.oO3Kqc2CbEqIKu4yzrH9YWNGrEipjwS8nCflNxX2YCU";

// Create a lock to prevent multiple simultaneous token refreshes
let isRefreshing = false;

export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: localStorage,
    },
    global: {
      headers: {
        'Accept-Profile': 'public',
      },
    },
    db: {
      schema: 'public' as 'public',
    },
  }
);

// Add comprehensive error handling for database schema issues
export const checkConnection = async () => {
  try {
    console.log('Checking Supabase database connection...');
    
    // Try a simple query to validate connection with explicit schema
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error.message);
      
      if (error.code === 'PGRST106' || error.message.includes('schema must be one of the following')) {
        console.error('Database schema error detected:', error.message);
        // Store a flag in session storage indicating schema issue
        sessionStorage.setItem('db_schema_error', 'true');
        
        // No need to attempt token refresh on schema issues
        return { connected: false, reason: 'schema_error', error };
      } else {
        return { connected: false, reason: 'connection_error', error };
      }
    } else {
      // Clear any previous schema error flag if connection is successful
      console.log('Database connection successful, clearing schema error flag');
      sessionStorage.removeItem('db_schema_error');
      return { connected: true, data };
    }
  } catch (err) {
    console.error('Error checking database connection:', err);
    return { connected: false, reason: 'exception', error: err };
  }
};

// ==============================
// DATABASE SERVICE
// ==============================

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
  
  // Calculate totals with appropriate type assertions
  const totalAssets = ((assetsResult.data || []) as any[]).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  const totalLiabilities = ((liabilitiesResult.data || []) as any[]).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities
  };
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

// ==============================
// DATABASE HOOK (useDatabase)
// ==============================

// This is a React hook that would normally use useState, useCallback, etc.
// Here we're showing the key functions without the React hooks for analysis

interface DatabaseHook {
  loading: boolean;
  lastError: any;
  checkDatabaseStatus: () => Promise<boolean>;
  hasSchemaIssue: () => boolean;
  savePersonalInfo: (data: any) => Promise<{success: boolean; data?: any; error?: any; localSaved?: boolean}>;
  saveAssets: (assets: any[]) => Promise<{success: boolean; data?: any; error?: any; localSaved?: boolean}>;
  saveLiabilities: (liabilities: any[]) => Promise<{success: boolean; data?: any; error?: any; localSaved?: boolean}>;
  fetchAssets: () => Promise<{success: boolean; data?: any; error?: any; localData?: boolean}>;
  fetchLiabilities: () => Promise<{success: boolean; data?: any; error?: any; localData?: boolean}>;
}

// Example implementation of checkDatabaseStatus from useDatabase hook
export const checkDatabaseStatus = async (session?: Session | null): Promise<boolean> => {
  console.log("Checking database status...");
  try {
    // Try a simple query to test the connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Database status check error:", error);
      
      // Check for schema-related errors
      if (error.code === 'PGRST106' || error.message.includes('schema must be one of the following')) {
        console.log("Checking Supabase database connection...");
        
        // If API schema is mentioned, try to refresh the session to fix
        if (error.message.includes('api')) {
          console.log("Attempting to update client configuration to use API schema");
          
          if (session) {
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
          }
          
          // Try the query again with updated session
          const retryResult = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          // Return whether the retry was successful
          return !retryResult.error;
        }
      }
      
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error checking database status:", err);
    return false;
  }
};

// Example implementation of saveAssets from useDatabase hook
export const saveAssets = async (assets: any[], session?: Session | null, userId?: string): Promise<{success: boolean; data?: any; error?: any; localSaved?: boolean}> => {
  try {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
    
    // Prepare assets with user ID
    const assetsWithUserId = assets.map(asset => ({
      ...asset,
      user_id: userId,
      value: parseFloat(asset.value) || 0,
      ownership_percentage: parseFloat(asset.ownershipPercentage) || 100,
      updated_at: new Date().toISOString()
    }));
    
    // Format assets for database storage
    const formattedAssets = assetsWithUserId.map(asset => {
      const { id, ownershipPercentage, ...rest } = asset;
      return {
        ...rest,
        ownership_percentage: parseFloat(ownershipPercentage) || 100,
      };
    });
    
    // Check if there are schema issues
    const hasSchemaIssue = sessionStorage.getItem('db_schema_error') === 'true';
    const shouldCheckDatabase = !hasSchemaIssue; 
    
    // Handle offline mode or persistent connection issues
    if (hasSchemaIssue || !(shouldCheckDatabase && await checkDatabaseStatus(session))) {
      // Save to local storage
      const backupKey = `assets_${userId}`;
      localStorage.setItem(backupKey, JSON.stringify(formattedAssets));
      
      // Return success with local flag
      return { success: true, data: formattedAssets, error: null, localSaved: true };
    }

    // Update the session
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }
    
    try {
      // Delete existing assets first
      const { error: deleteError } = await supabase
        .from('assets')
        .delete()
        .eq('user_id', userId as any);
      
      if (deleteError) {
        console.error("Error deleting existing assets:", deleteError);
        // Save locally anyway
        const backupKey = `assets_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedAssets));
        return { success: false, data: formattedAssets, error: deleteError, localSaved: true };
      }
      
      // Insert all assets
      const { error: insertError } = await supabase
        .from('assets')
        .insert(formattedAssets);
      
      if (insertError) {
        console.error("Error inserting assets:", insertError);
        // Save locally anyway
        const backupKey = `assets_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedAssets));
        return { success: false, data: formattedAssets, error: insertError, localSaved: true };
      }
      
      return { success: true, data: formattedAssets, error: null };
    } catch (dbError) {
      console.error("Database error saving assets:", dbError);
      
      // Save to local storage as backup
      const backupKey = `assets_${userId}`;
      localStorage.setItem(backupKey, JSON.stringify(formattedAssets));
      
      return { success: false, data: formattedAssets, error: dbError, localSaved: true };
    }
  } catch (error) {
    console.error("Exception saving assets:", error);
    
    // Save to local storage as backup
    if (userId) {
      const backupKey = `assets_${userId}`;
      localStorage.setItem(backupKey, JSON.stringify(assets));
    }
    
    return { success: false, data: assets, error, localSaved: true };
  }
};

// Example implementation of fetchAssets from useDatabase hook
export const fetchAssets = async (session?: Session | null, userId?: string): Promise<{success: boolean; data?: any; error?: any; localData?: boolean}> => {
  try {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
    
    // Check for local data first
    const localData = localStorage.getItem(`assets_${userId}`);
    
    // Check if there are schema issues
    const hasSchemaIssue = sessionStorage.getItem('db_schema_error') === 'true';
    const shouldCheckDatabase = !hasSchemaIssue;
    
    // Handle offline mode or persistent connection issues
    if (hasSchemaIssue || !(shouldCheckDatabase && await checkDatabaseStatus(session))) {
      if (localData) {
        console.log("Using locally stored assets data");
        return { success: true, data: JSON.parse(localData), error: null, localData: true };
      }
      return { success: false, error: "Database connection unavailable", localData: false };
    }
    
    // Update the session
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }
    
    console.log("Fetching assets for user:", userId);
    
    // Query assets
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId as any);
    
    if (error) {
      console.error("Error fetching assets:", error);
      
      // Try local data as fallback
      if (localData) {
        console.log("Using locally stored assets as fallback");
        return { success: true, data: JSON.parse(localData), error, localData: true };
      }
      
      return { success: false, error };
    }
    
    // Transform data back for the form
    const formattedData = data.map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      ownershipPercentage: asset.ownership_percentage?.toString(),
      description: asset.description,
      saved: true
    }));
    
    return { success: true, data: formattedData, error: null };
  } catch (error) {
    console.error("Exception fetching assets:", error);
    
    // Try local data as fallback
    const localData = localStorage.getItem(`assets_${userId}`);
    if (localData) {
      console.log("Using locally stored assets as fallback after exception");
      return { success: true, data: JSON.parse(localData), error, localData: true };
    }
    
    return { success: false, error };
  }
};

// ==============================
// COMMON TYPESCRIPT ERRORS FIXES
// ==============================

/**
 * COMMON ERRORS AND FIXES:
 * 
 * 1. Error: Property 'success' does not exist on type '{ error: string; data?: undefined; localSaved?: undefined; }'
 *    Fix: Ensure all return objects from database functions include the 'success' property
 * 
 * 2. Error: Cannot find name 'currentLiabilities' or 'currentAssets'
 *    Fix: These variables might be undefined or misspelled. Check for variable scope and proper initialization.
 * 
 * 3. Error: Cannot find name 'Spinner'
 *    Fix: Import the Spinner component where needed:
 *    import { Spinner } from '@/components/ui/spinner';
 * 
 * 4. Supabase type errors:
 *    Fix: Use proper type assertions with 'as any' where needed for Supabase queries that have strict typing
 * 
 * 5. Error with local storage fallbacks:
 *    Fix: Always check if localStorage.getItem returns null before parsing JSON
 */

// Sample fix for the Spinner error
export const SpinnerImportFix = `
// Add this import to PersonalFinancialStatementForm.tsx:
import { Spinner } from '@/components/ui/spinner';
`;

// Sample fix for the success property error
export const SuccessPropertyFix = `
// Ensure all database functions return objects with the success property:
return { success: true, data, error: null };
// or
return { success: false, error };
`;

// Sample fix for current variables
export const CurrentVariablesFix = `
// Use the correct variables:
// Instead of:
const result = await saveAssets(currentAssets);
// Use:
const result = await saveAssets(assets);
`;
