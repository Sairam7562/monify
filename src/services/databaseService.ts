
import { supabase } from '@/integrations/supabase/client';

// Function to test database health with a lightweight query
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    console.log("Performing lightweight database health check...");
    
    // First try to check auth status as a quick test
    const { data: { session } } = await supabase.auth.getSession();
    
    // Now try a simple query on the profiles table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.warn("Database health check failed:", error.message);
      
      // Check if this is a schema error
      if (error.message?.includes('schema') || 
          error.message?.includes('relation') || 
          error.code === 'PGRST106' || 
          error.code === '42P01') {
        console.error("Schema error detected during health check");
        localStorage.setItem('db_schema_error', 'true');
      }
      
      return false;
    }
    
    console.log("Database health check passed");
    return true;
  } catch (error) {
    console.error("Error during database health check:", error);
    return false;
  }
}

// Function to retry a failed query with automatic backoff
export async function retryQuery<T>(
  queryFn: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 500
): Promise<T> {
  let attempts = 0;
  let delay = initialDelay;
  
  while (attempts < maxRetries) {
    try {
      return await queryFn();
    } catch (error: any) {
      attempts++;
      
      // If we've exhausted retries, throw the error
      if (attempts >= maxRetries) {
        throw error;
      }
      
      console.warn(`Query failed (attempt ${attempts}/${maxRetries}), retrying in ${delay}ms:`, error.message);
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 5000); // Max 5 second delay
      
      // Try refreshing auth session before next attempt
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await supabase.auth.refreshSession();
        }
      } catch (e) {
        console.warn("Could not refresh session before retry:", e);
      }
    }
  }
  
  // This should never happen due to the throw in the catch block
  throw new Error("Max retries exceeded");
}

// Create a function to fix schema issues
export async function attemptSchemaRepair(): Promise<boolean> {
  console.log("Attempting to repair schema configuration...");
  
  try {
    // First, try signing out and back in to refresh tokens
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Store credentials temporarily
      const email = sessionData.session.user.email;
      
      // Sign out
      await supabase.auth.signOut();
      
      // Reload the client to reset internal state
      Object.assign(supabase.options, {
        db: {
          schema: 'public'
        }
      });
      
      // Test if we can now access the database
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log("Schema repair successful through client reset");
        return true;
      }
      
      console.log("Schema issues persist after client reset, trying other methods...");
    }
    
    // Try explicit RPC command to set schema
    const { error: rpcError } = await supabase.rpc('set_schema', { schema_name: 'public' });
    
    if (!rpcError) {
      // Test if schema is now accessible
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!testError) {
        console.log("Schema repair successful through RPC command");
        return true;
      }
    }
    
    // If all else fails, return false
    console.error("All schema repair attempts failed");
    return false;
  } catch (error) {
    console.error("Error during schema repair attempt:", error);
    return false;
  }
}
