
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hioribtoyuxrrxmcmldi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3JpYnRveXV4cnJ4bWNtbGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzQwODAsImV4cCI6MjA1ODc1MDA4MH0.oO3Kqc2CbEqIKu4yzrH9YWNGrEipjwS8nCflNxX2YCU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Function to check database connection
export async function checkConnection(): Promise<{ 
  connected: boolean; 
  reason?: 'auth_error' | 'connection_error' | 'schema_error';
  error?: any;
}> {
  try {
    // Attempt to query the database to check connection
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error("Database connection error:", error.message);
      
      // Check if this is a schema-related error
      if (error.message?.includes('schema') || error.code === 'PGRST106') {
        return { 
          connected: false, 
          reason: 'schema_error', 
          error 
        };
      }
      
      // Check if this is an auth-related error
      if (error.message?.includes('JWT') || error.message?.includes('auth') || error.code === '42501') {
        return { 
          connected: false, 
          reason: 'auth_error', 
          error 
        };
      }
      
      return { 
        connected: false, 
        reason: 'connection_error', 
        error 
      };
    }
    
    return { connected: true };
  } catch (err) {
    console.error("Error checking DB connection:", err);
    return { 
      connected: false, 
      reason: 'connection_error',
      error: err 
    };
  }
}

// Function to clear all caches
export function clearAllCaches(): void {
  // Clear any cached data in localStorage with app-specific prefixes
  const cachePatterns = [
    'personal_info_',
    'business_info_',
    'assets_',
    'liabilities_',
    'income_',
    'expenses_'
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

// Function to retry connecting with exponential backoff
export async function retryConnection(maxAttempts = 3): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const { connected } = await checkConnection();
    
    if (connected) {
      console.log(`Connection established after ${attempts + 1} attempts`);
      return true;
    }
    
    attempts++;
    
    if (attempts < maxAttempts) {
      // Exponential backoff - wait longer between each retry
      const delay = Math.pow(2, attempts) * 1000;
      console.log(`Connection failed, retrying in ${delay}ms (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`Failed to connect after ${maxAttempts} attempts`);
  return false;
}
