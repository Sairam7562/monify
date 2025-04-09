
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hioribtoyuxrrxmcmldi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3JpYnRveXV4cnJ4bWNtbGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzQwODAsImV4cCI6MjA1ODc1MDA4MH0.oO3Kqc2CbEqIKu4yzrH9YWNGrEipjwS8nCflNxX2YCU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  },
  db: {
    schema: 'public', // Using 'public' schema instead of 'api'
  },
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
