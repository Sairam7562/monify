
import { supabase } from "@/integrations/supabase/client";
import { User } from '@/services/userService';
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * A service to handle common database operations with proper error handling
 * and type safety
 */

// Improved generic type for the safeQuery function with better flexibility for different return types
export async function safeQuery<T>(
  queryFn: () => Promise<PostgrestSingleResponse<T>>,
  errorMessage: string,
  fallbackData?: T
): Promise<{ data: T | null; error: any; success: boolean; localData?: T | null }> {
  try {
    // Try to find data in localStorage first if this is a common query that might be cached
    const localStorageKey = errorMessage.includes('personal info') 
      ? `personal_info_${localStorage.getItem('currentUserId') || 'unknown'}`
      : null;
    
    let localData = null;
    if (localStorageKey) {
      try {
        const storedData = localStorage.getItem(localStorageKey);
        if (storedData) {
          console.info('Using locally stored personal info data');
          localData = JSON.parse(storedData);
        }
      } catch (err) {
        console.warn('Error parsing local data:', err);
      }
    }
    
    const result = await queryFn();
    
    if (result.error) {
      console.error(`${errorMessage}:`, result.error);
      
      // Check for specific error types to provide more helpful diagnostics
      if (result.error.code === 'PGRST106' || result.error.message?.includes('schema')) {
        console.error('Database schema issue detected:', result.error.message);
        sessionStorage.setItem('db_schema_error', 'true');
      } else if (result.error.code?.includes('auth')) {
        console.error('Authentication issue detected:', result.error.message);
        sessionStorage.setItem('db_auth_error', 'true');
      }
      
      // Return local data if available as a fallback
      if (localData) {
        return { data: localData, error: result.error, success: false, localData };
      }
      
      return { data: fallbackData || null, error: result.error, success: false };
    }
    
    // If we have data and a local storage key, update the local cache
    if (localStorageKey && result.data) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(result.data));
      } catch (err) {
        console.warn('Error saving data to localStorage:', err);
      }
    }
    
    return { data: result.data as T, error: null, success: true, localData };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Additional error diagnostics for troubleshooting
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network connectivity issue detected');
      sessionStorage.setItem('db_network_error', 'true');
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
    // Try a simple health check query instead of using ping RPC
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

// Forward exports from financialService but NOT importing from here
// to avoid circular dependencies
export * from '@/services/financialService';
