import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { checkDatabaseHealth, retryQuery } from '@/services/databaseService';

export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const { session } = useAuth();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  const checkDatabaseStatus = useCallback(async (): Promise<boolean> => {
    console.log("Checking database status...");
    try {
      // First try our lightweight health check
      const isHealthy = await checkDatabaseHealth();
      if (isHealthy) {
        return true;
      }
      
      // If health check fails, try a more comprehensive check
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("Database status check error:", error);
        
        // Check for schema-related errors
        if (error.code === 'PGRST106' || error.message.includes('schema must be one of the following')) {
          console.log("Schema-related error detected");
          
          // If API schema is mentioned, try to refresh the session to fix
          if (error.message.includes('api') && session) {
            console.log("Attempting to update client configuration to use API schema");
            
            await supabase.auth.refreshSession();
            
            // Try the query again with updated session
            const retryResult = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
            
            // Return whether the retry was successful
            return !retryResult.error;
          }
        }
        
        // If we're under the max attempts, try reconnecting
        if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
          setConnectionAttempts(prev => prev + 1);
          console.log(`Reconnection attempt ${connectionAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
          
          // Wait a bit and try again with a refreshed session
          if (session) {
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            
            // Try a basic query after refresh
            const reconnectResult = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
              
            return !reconnectResult.error;
          }
        }
        
        return false;
      }
      
      // Reset connection attempts on success
      setConnectionAttempts(0);
      return true;
    } catch (err) {
      console.error("Error checking database status:", err);
      return false;
    }
  }, [session, connectionAttempts]);

  const hasSchemaIssue = useCallback((): boolean => {
    return sessionStorage.getItem('db_schema_error') === 'true';
  }, []);

  const savePersonalInfo = async (data: any) => {
    setLoading(true);
    setLastError(null);
    
    try {
      // First, check if there's an existing record for this user
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        // Save to local storage
        const backupKey = `personal_info_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        // Return success with local flag
        return { success: true, data, error: null, localSaved: true };
      }
      
      // Update the session to ensure proper authorization
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      
      // Check for existing record
      const { data: existingData, error: checkError } = await supabase
        .from('personal_info')
        .select('id')
        .eq('user_id', userId as any)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking for existing personal info:", checkError);
        
        // Save to local storage as backup
        const backupKey = `personal_info_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        return { success: false, data, error: checkError, localSaved: true };
      }
      
      // Prepare data for insert/update
      const personalData = {
        ...data,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      // Improve type checking to safely access id property
      if (existingData && 
          typeof existingData === 'object' && 
          'id' in existingData && 
          existingData.id) {
        // Update existing record
        result = await supabase
          .from('personal_info')
          .update(personalData)
          .eq('user_id', userId as any);
      } else {
        // Insert new record
        result = await supabase
          .from('personal_info')
          .insert([personalData]);
      }
      
      if (result.error) {
        console.error("Error saving personal info:", result.error);
        
        // Save to local storage as backup
        const backupKey = `personal_info_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        return { success: false, data, error: result.error, localSaved: true };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Exception saving personal info:", error);
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `personal_info_${session.user.id}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
      }
      
      return { success: false, data, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessInfo = async (data: any) => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        // Save to local storage
        const backupKey = `business_info_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        // Return success with local flag
        return { success: true, data, error: null, localSaved: true };
      }
      
      // Update the session to ensure proper authorization
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      
      // Check for existing record
      const { data: existingData, error: checkError } = await supabase
        .from('business_info')
        .select('id')
        .eq('user_id', userId as any)
        .eq('business_name', data.business_name)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking for existing business info:", checkError);
        
        // Save to local storage as backup
        const backupKey = `business_info_${userId}_${data.business_name}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        return { success: false, data, error: checkError, localSaved: true };
      }
      
      // Prepare data for insert/update
      const businessData = {
        ...data,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      // Improve type checking to safely access id property
      if (existingData && 
          typeof existingData === 'object' && 
          'id' in existingData && 
          existingData.id) {
        // Update existing record
        result = await supabase
          .from('business_info')
          .update(businessData)
          .eq('id', existingData.id as any);
      } else {
        // Insert new record
        result = await supabase
          .from('business_info')
          .insert([businessData]);
      }
      
      if (result.error) {
        console.error("Error saving business info:", result.error);
        
        // Save to local storage as backup
        const backupKey = `business_info_${userId}_${data.business_name}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        return { success: false, data, error: result.error, localSaved: true };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Exception saving business info:", error);
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `business_info_${session.user.id}_${data.business_name}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
      }
      
      return { success: false, data, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveAssets = async (assets: any[]) => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
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
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
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
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `assets_${session.user.id}`;
        localStorage.setItem(backupKey, JSON.stringify(assets));
      }
      
      return { success: false, data: assets, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveLiabilities = async (liabilities: any[]) => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Prepare liabilities with user ID
      const liabilitiesWithUserId = liabilities.map(liability => ({
        ...liability,
        user_id: userId,
        amount: parseFloat(liability.amount) || 0,
        interest_rate: parseFloat(liability.interestRate) || 0,
        ownership_percentage: parseFloat(liability.ownershipPercentage) || 100,
        updated_at: new Date().toISOString()
      }));
      
      // Format liabilities for database storage
      const formattedLiabilities = liabilitiesWithUserId.map(liability => {
        const { id, interestRate, ownershipPercentage, ...rest } = liability;
        return {
          ...rest,
          interest_rate: parseFloat(interestRate) || 0,
          ownership_percentage: parseFloat(ownershipPercentage) || 100,
        };
      });
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        // Save to local storage
        const backupKey = `liabilities_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedLiabilities));
        
        // Return success with local flag
        return { success: true, data: formattedLiabilities, error: null, localSaved: true };
      }

      // Update the session
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      
      try {
        // Delete existing liabilities first
        const { error: deleteError } = await supabase
          .from('liabilities')
          .delete()
          .eq('user_id', userId as any);
        
        if (deleteError) {
          console.error("Error deleting existing liabilities:", deleteError);
          // Save locally anyway
          const backupKey = `liabilities_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedLiabilities));
          return { success: false, data: formattedLiabilities, error: deleteError, localSaved: true };
        }
        
        // Insert all liabilities
        const { error: insertError } = await supabase
          .from('liabilities')
          .insert(formattedLiabilities);
        
        if (insertError) {
          console.error("Error inserting liabilities:", insertError);
          // Save locally anyway
          const backupKey = `liabilities_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedLiabilities));
          return { success: false, data: formattedLiabilities, error: insertError, localSaved: true };
        }
        
        return { success: true, data: formattedLiabilities, error: null };
      } catch (dbError) {
        console.error("Database error saving liabilities:", dbError);
        
        // Save to local storage as backup
        const backupKey = `liabilities_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedLiabilities));
        
        return { success: false, data: formattedLiabilities, error: dbError, localSaved: true };
      }
    } catch (error) {
      console.error("Exception saving liabilities:", error);
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `liabilities_${session.user.id}`;
        localStorage.setItem(backupKey, JSON.stringify(liabilities));
      }
      
      return { success: false, data: liabilities, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveIncome = async (incomeItems: any[]) => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Prepare income with user ID
      const incomeWithUserId = incomeItems.map(income => ({
        ...income,
        user_id: userId,
        amount: parseFloat(income.amount) || 0,
        updated_at: new Date().toISOString()
      }));
      
      // Format income for database storage
      const formattedIncome = incomeWithUserId.map(income => {
        const { id, ...rest } = income;
        return rest;
      });
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        // Save to local storage
        const backupKey = `income_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedIncome));
        
        // Return success with local flag
        return { success: true, data: formattedIncome, error: null, localSaved: true };
      }

      // Update the session
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      
      try {
        // Delete existing income first
        const { error: deleteError } = await supabase
          .from('income')
          .delete()
          .eq('user_id', userId as any);
        
        if (deleteError) {
          console.error("Error deleting existing income:", deleteError);
          // Save locally anyway
          const backupKey = `income_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedIncome));
          return { success: false, data: formattedIncome, error: deleteError, localSaved: true };
        }
        
        // Insert all income
        const { error: insertError } = await supabase
          .from('income')
          .insert(formattedIncome);
        
        if (insertError) {
          console.error("Error inserting income:", insertError);
          // Save locally anyway
          const backupKey = `income_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedIncome));
          return { success: false, data: formattedIncome, error: insertError, localSaved: true };
        }
        
        return { success: true, data: formattedIncome, error: null };
      } catch (dbError) {
        console.error("Database error saving income:", dbError);
        
        // Save to local storage as backup
        const backupKey = `income_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedIncome));
        
        return { success: false, data: formattedIncome, error: dbError, localSaved: true };
      }
    } catch (error) {
      console.error("Exception saving income:", error);
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `income_${session.user.id}`;
        localStorage.setItem(backupKey, JSON.stringify(incomeItems));
      }
      
      return { success: false, data: incomeItems, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (expenseItems: any[]) => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Prepare expenses with user ID
      const expensesWithUserId = expenseItems.map(expense => ({
        ...expense,
        user_id: userId,
        amount: parseFloat(expense.amount) || 0,
        updated_at: new Date().toISOString()
      }));
      
      // Format expenses for database storage
      const formattedExpenses = expensesWithUserId.map(expense => {
        const { id, ...rest } = expense;
        return rest;
      });
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        // Save to local storage
        const backupKey = `expenses_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedExpenses));
        
        // Return success with local flag
        return { success: true, data: formattedExpenses, error: null, localSaved: true };
      }

      // Update the session
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      
      try {
        // Delete existing expenses first
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('user_id', userId as any);
        
        if (deleteError) {
          console.error("Error deleting existing expenses:", deleteError);
          // Save locally anyway
          const backupKey = `expenses_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedExpenses));
          return { success: false, data: formattedExpenses, error: deleteError, localSaved: true };
        }
        
        // Insert all expenses
        const { error: insertError } = await supabase
          .from('expenses')
          .insert(formattedExpenses);
        
        if (insertError) {
          console.error("Error inserting expenses:", insertError);
          // Save locally anyway
          const backupKey = `expenses_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(formattedExpenses));
          return { success: false, data: formattedExpenses, error: insertError, localSaved: true };
        }
        
        return { success: true, data: formattedExpenses, error: null };
      } catch (dbError) {
        console.error("Database error saving expenses:", dbError);
        
        // Save to local storage as backup
        const backupKey = `expenses_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(formattedExpenses));
        
        return { success: false, data: formattedExpenses, error: dbError, localSaved: true };
      }
    } catch (error) {
      console.error("Exception saving expenses:", error);
      setLastError(error);
      
      // Save to local storage as backup
      if (session?.user?.id) {
        const backupKey = `expenses_${session.user.id}`;
        localStorage.setItem(backupKey, JSON.stringify(expenseItems));
      }
      
      return { success: false, data: expenseItems, error, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalInfo = async () => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Check for local data first
      const localData = localStorage.getItem(`personal_info_${userId}`);
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        if (localData) {
          console.log("Using locally stored personal info data");
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
      
      // Query personal info
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId as any)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching personal info:", error);
        
        // Try local data as fallback
        if (localData) {
          console.log("Using locally stored personal info as fallback");
          return { success: true, data: JSON.parse(localData), error, localData: true };
        }
        
        return { success: false, error };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Exception fetching personal info:", error);
      setLastError(error);
      
      // Try local data as fallback
      const localData = localStorage.getItem(`personal_info_${session?.user?.id}`);
      if (localData) {
        console.log("Using locally stored personal info as fallback after exception");
        return { success: true, data: JSON.parse(localData), error, localData: true };
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessInfo = async () => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Check for local data first
      const localData = localStorage.getItem(`business_info_${userId}`);
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        if (localData) {
          console.log("Using locally stored business info data");
          try {
            return { success: true, data: JSON.parse(localData), error: null, localData: true };
          } catch (e) {
            console.error("Error parsing local business data:", e);
            return { success: false, data: [], error: null, localData: false };
          }
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
      
      // Query business info
      const { data, error } = await supabase
        .from('business_info')
        .select('*')
        .eq('user_id', userId as any);
      
      if (error) {
        console.error("Error fetching business info:", error);
        
        // Try local data as fallback
        if (localData) {
          console.log("Using locally stored business info as fallback");
          try {
            return { success: true, data: JSON.parse(localData), error, localData: true };
          } catch (e) {
            console.error("Error parsing local business data:", e);
            return { success: false, data: [], error, localData: false };
          }
        }
        
        return { success: false, error };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Exception fetching business info:", error);
      setLastError(error);
      
      // Try local data as fallback
      const localData = localStorage.getItem(`business_info_${session?.user?.id}`);
      if (localData) {
        console.log("Using locally stored business info as fallback after exception");
        try {
          return { success: true, data: JSON.parse(localData), error, localData: true };
        } catch (e) {
          console.error("Error parsing local business data:", e);
          return { success: false, data: [], error, localData: false };
        }
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Check for local data first
      const localData = localStorage.getItem(`assets_${userId}`);
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
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
      setLastError(error);
      
      // Try local data as fallback
      const localData = localStorage.getItem(`assets_${session?.user?.id}`);
      if (localData) {
        console.log("Using locally stored assets as fallback after exception");
        return { success: true, data: JSON.parse(localData), error, localData: true };
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchLiabilities = async () => {
    setLoading(true);
    setLastError(null);
    
    try {
      const userId = session?.user?.id;
      
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }
      
      // Check for local data first
      const localData = localStorage.getItem(`liabilities_${userId}`);
      
      // Handle offline mode or persistent connection issues
      if (hasSchemaIssue() || !(await checkDatabaseStatus())) {
        if (localData) {
          console.log("Using locally stored liabilities data");
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
      
      // Query liabilities
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId as any);
      
      if (error) {
        console.error("Error fetching liabilities:", error);
        
        // Try local data as fallback
        if (localData) {
          console.log("Using locally stored liabilities as fallback");
          return { success: true, data: JSON.parse(localData), error, localData: true };
        }
        
        return { success: false, error };
      }
      
      // Transform data back for the form
      const formattedData = data.map((liability: any) => ({
        id: liability.id,
        name: liability.name,
        type: liability.type,
        amount: liability.amount.toString(),
        interestRate: liability.interest_rate?.toString() || '0',
        ownershipPercentage: liability.ownership_percentage?.toString(),
        associatedAssetId: liability.associated_asset_id,
        saved: true
      }));
      
      return { success: true, data:
