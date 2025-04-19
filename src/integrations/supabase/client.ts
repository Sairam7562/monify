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
  },
  global: {
    headers: {
      'x-application-name': 'Monify'
    }
  },
  realtime: {
    timeout: 60000
  }
});

// Function to check database connection
export async function checkConnection(): Promise<{ 
  connected: boolean; 
  reason?: 'auth_error' | 'connection_error' | 'schema_error' | 'rate_limit_error';
  error?: any;
}> {
  try {
    console.log("Checking database connection...");
    
    // Test auth session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      // Refresh token if we have a session
      await supabase.auth.refreshSession();
    }
    
    // Attempt to query the database to check connection
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error("Database connection error:", error.message);
      
      // Check for rate limiting errors
      if (error.message?.includes('rate limit') || error.code === '429') {
        console.warn("Rate limit reached. Waiting before retrying...");
        return { 
          connected: false, 
          reason: 'rate_limit_error', 
          error 
        };
      }
      
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
    
    console.log("Database connection check successful");
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

// Enhanced function to retry connecting with exponential backoff
export async function retryConnection(maxAttempts = 3, initialDelay = 1000): Promise<boolean> {
  let attempts = 0;
  let currentDelay = initialDelay;
  
  while (attempts < maxAttempts) {
    console.log(`Connection attempt ${attempts + 1}/${maxAttempts}`);
    
    // Try to refresh the auth session first
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.refreshSession();
      }
    } catch (e) {
      console.warn("Could not refresh session:", e);
      // Continue anyway, we still want to try the connection
    }
    
    // Check connection
    const { connected, reason } = await checkConnection();
    
    if (connected) {
      console.log(`Connection established after ${attempts + 1} attempts`);
      return true;
    }
    
    // If rate limited, use a longer delay
    if (reason === 'rate_limit_error') {
      currentDelay = Math.min(currentDelay * 3, 30000); // Max 30 seconds for rate limits
    } else {
      currentDelay = Math.min(currentDelay * 2, 10000); // Normal exponential backoff, max 10 seconds
    }
    
    attempts++;
    
    if (attempts < maxAttempts) {
      console.log(`Connection failed (${reason}), retrying in ${currentDelay}ms (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  
  console.error(`Failed to connect after ${maxAttempts} attempts`);
  return false;
}

// Function to test and initialize connection
export async function initializeConnection(): Promise<boolean> {
  console.log("Initializing database connection...");
  
  // Clear any stale sessions that might be causing issues
  const storedSession = localStorage.getItem('supabase.auth.token');
  if (storedSession) {
    try {
      // Parse the stored session to check if it's expired
      const parsedSession = JSON.parse(storedSession);
      const expiresAt = parsedSession?.expiresAt;
      const now = Math.floor(Date.now() / 1000);
      
      if (expiresAt && expiresAt < now) {
        console.log("Found expired session, clearing it");
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (e) {
      console.warn("Error parsing stored session:", e);
    }
  }
  
  return await retryConnection(3);
}
