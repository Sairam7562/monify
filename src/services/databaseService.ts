
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
): Promise<{ data: T | null; error: any; success: boolean }> {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error(`${errorMessage}:`, result.error);
      return { data: fallbackData || null, error: result.error, success: false };
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { data: fallbackData || null, error, success: false };
  }
}

// Forward exports from financialService
export * from '@/services/financialService';
