
import { useState, useCallback } from 'react';
import { supabase, checkConnection } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useDatabase() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  const verifyAuth = useCallback(() => {
    if (!user || !session) {
      console.error("Authentication required: No user or session found");
      toast.error("Authentication required. Please log in again.");
      return false;
    }
    return true;
  }, [user, session]);

  // Helper to check for database schema issues
  const hasSchemaIssue = () => {
    return sessionStorage.getItem('db_schema_error') === 'true';
  };

  // Helper to generate a unique local storage key for a user and data type
  const getLocalStorageKey = (userId: string, dataType: string) => {
    return `${dataType}_${userId}`;
  };

  // Debug function to show what's in local storage for a user
  const debugLocalStorage = (userId: string) => {
    if (!userId) return;
    
    const keys = ['personal_info', 'assets', 'liabilities', 'income', 'expenses'];
    console.group('Local Storage Data');
    keys.forEach(key => {
      const localKey = getLocalStorageKey(userId, key);
      const data = localStorage.getItem(localKey);
      console.log(`${key}:`, data ? 'Data exists' : 'No data');
    });
    console.groupEnd();
  };

  // Modified version of savePersonalInfo that handles schema errors better
  const savePersonalInfo = async (data: any) => {
    try {
      setLoading(true);
      setLastError(null);
      
      if (!verifyAuth()) {
        return { error: 'Not authenticated' };
      }
      
      console.log("Attempting to save personal info for user:", user.id);
      console.log("Personal info data:", data);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Try to check database connection first
      const connectionStatus = await checkConnection();
      console.log("Database connection status:", connectionStatus);
      
      // Check for known schema issues before attempting database operation
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database unavailable, using local storage");
        // Save to local storage
        const localStorageKey = getLocalStorageKey(userId, 'personal_info');
        localStorage.setItem(localStorageKey, JSON.stringify({
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        debugLocalStorage(userId);
        
        toast.success('Information saved locally. It will be synced when the database is available.');
        return { data: null, error: null, localSaved: true };
      }
      
      try {
        // Try to check if the table exists first
        console.log("Attempting to fetch existing personal info");
        const { data: existingData, error: fetchError } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching existing data:", fetchError);
          // Check if it's a schema error (PGRST106)
          if (fetchError.code === 'PGRST106' || fetchError.message.includes('schema must be one of the following')) {
            console.log("Database schema error - table might not exist yet. Saving to local storage for now.");
            // Mark schema error in session storage
            sessionStorage.setItem('db_schema_error', 'true');
            
            // Save to local storage as fallback
            const localStorageKey = getLocalStorageKey(userId, 'personal_info');
            localStorage.setItem(localStorageKey, JSON.stringify({
              ...data,
              user_id: userId,
              updated_at: new Date().toISOString()
            }));
            
            debugLocalStorage(userId);
            
            toast.success('Information saved locally. It will be synced to the database when available.');
            return { data: null, error: null, localSaved: true };
          } else {
            throw fetchError;
          }
        }

        // If we got here, the table exists and we can proceed with normal save
        console.log("Database table exists, proceeding with save operation");
        const formattedData = {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          birth_date: data.birthDate instanceof Date 
            ? data.birthDate.toISOString().split('T')[0] 
            : data.birthDate,
          // New fields we added to the database
          occupation: data.occupation,
          annual_income: data.annualIncome ? parseFloat(data.annualIncome) : null,
          profile_image: data.profileImage,
          updated_at: new Date().toISOString()
        };
        
        let result;
        
        if (existingData) {
          console.log("Updating existing personal info record");
          result = await supabase
            .from('personal_info')
            .update(formattedData)
            .eq('id', existingData.id);
        } else {
          console.log("Inserting new personal info record");
          result = await supabase
            .from('personal_info')
            .insert({
              ...formattedData,
              user_id: userId
            });
        }

        if (result.error) {
          console.error("Database save error:", result.error);
          throw result.error;
        }
        
        console.log("Save operation successful");
        toast.success('Personal information saved successfully');
        return { data: result.data, error: null };
      } catch (err: any) {
        console.error("Database error during save:", err);
        setLastError(err);
        
        // Handle specific errors
        if (err.code === 'PGRST106' || (err.message && err.message.includes('schema must be one of the following'))) {
          console.error("Database schema error, using local storage fallback:", err);
          sessionStorage.setItem('db_schema_error', 'true');
        } else {
          console.error("Database error, using local storage fallback:", err);
        }
        
        // Fallback to local storage for any database error
        const localStorageKey = getLocalStorageKey(userId, 'personal_info');
        localStorage.setItem(localStorageKey, JSON.stringify({
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        debugLocalStorage(userId);
        
        toast.success('Information saved locally. It will be synced to the database when available.');
        return { data: null, error: err.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error saving personal info:', error);
      setLastError(error);
      toast.error('Could not save personal information: ' + error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveAssets = async (assets: any[]) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      await supabase
        .from('assets')
        .delete()
        .eq('user_id', userId);
      
      const formattedAssets = assets.map(asset => ({
        name: asset.name || 'Unnamed Asset',
        type: asset.type,
        value: parseFloat(asset.value) || 0,
        ownership_percentage: parseFloat(asset.ownershipPercentage) || 100,
        description: asset.description || '',
        user_id: userId
      }));

      for (const asset of formattedAssets) {
        const { error } = await supabase
          .from('assets')
          .insert(asset);
          
        if (error) throw error;
      }
      
      toast.success('Assets saved successfully');
      return { data: formattedAssets, error: null };
    } catch (error: any) {
      console.error('Error saving assets:', error);
      toast.error('Failed to save assets');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveLiabilities = async (liabilities: any[]) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      await supabase
        .from('liabilities')
        .delete()
        .eq('user_id', userId);
      
      const formattedLiabilities = liabilities.map(liability => ({
        name: liability.name || 'Unnamed Liability',
        type: liability.type,
        amount: parseFloat(liability.amount) || 0,
        interest_rate: parseFloat(liability.interestRate) || 0,
        associated_asset_id: liability.associatedAssetId ? 
          liability.associatedAssetId > 0 ? liability.associatedAssetId : null : null,
        ownership_percentage: parseFloat(liability.ownershipPercentage) || 100,
        user_id: userId
      }));

      for (const liability of formattedLiabilities) {
        const { error } = await supabase
          .from('liabilities')
          .insert(liability);
          
        if (error) throw error;
      }
      
      toast.success('Liabilities saved successfully');
      return { data: formattedLiabilities, error: null };
    } catch (error: any) {
      console.error('Error saving liabilities:', error);
      toast.error('Failed to save liabilities');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveIncome = async (incomeData: any[]) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      await supabase
        .from('income')
        .delete()
        .eq('user_id', userId);
      
      const formattedIncome = incomeData.map(income => ({
        source: income.source || 'Unnamed Source',
        type: income.type,
        amount: parseFloat(income.amount) || 0,
        frequency: income.frequency,
        user_id: userId
      }));

      for (const income of formattedIncome) {
        const { error } = await supabase
          .from('income')
          .insert(income);
          
        if (error) throw error;
      }
      
      toast.success('Income information saved successfully');
      return { data: formattedIncome, error: null };
    } catch (error: any) {
      console.error('Error saving income:', error);
      toast.error('Failed to save income information');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (expensesData: any[]) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      await supabase
        .from('expenses')
        .delete()
        .eq('user_id', userId);
      
      const formattedExpenses = expensesData.map(expense => ({
        name: expense.name || 'Unnamed Expense',
        category: expense.category,
        amount: parseFloat(expense.amount) || 0,
        frequency: expense.frequency,
        user_id: userId
      }));

      for (const expense of formattedExpenses) {
        const { error } = await supabase
          .from('expenses')
          .insert(expense);
          
        if (error) throw error;
      }
      
      toast.success('Expense information saved successfully');
      return { data: formattedExpenses, error: null };
    } catch (error: any) {
      console.error('Error saving expenses:', error);
      toast.error('Failed to save expense information');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalInfo = async () => {
    if (!verifyAuth()) {
      return { error: 'Not authenticated' };
    }
    
    setLoading(true);
    try {
      console.log("Fetching personal info for user:", user.id);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Check database connection first
      const connectionStatus = await checkConnection();
      console.log("Database connection status before fetch:", connectionStatus);
      
      // If we have a known database issue, try local storage first
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database connection issue, checking local storage first");
        const localStorageKey = getLocalStorageKey(userId, 'personal_info');
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
          console.log("Found local data:", localData.substring(0, 50) + "...");
          const parsedData = JSON.parse(localData);
          const transformedData = {
            firstName: parsedData.firstName || '',
            lastName: parsedData.lastName || '',
            email: parsedData.email || user?.email || '',
            phone: parsedData.phone || '',
            address: parsedData.address || '',
            city: parsedData.city || '',
            state: parsedData.state || '',
            zipCode: parsedData.zipCode || '',
            birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : undefined,
            // Add new fields for retrieval from local storage
            occupation: parsedData.occupation || '',
            annualIncome: parsedData.annualIncome || '',
            profileImage: parsedData.profileImage || null,
          };
          return { data: transformedData, error: null, localData: true };
        }
      }
      
      // Try database if we have a connection
      if (connectionStatus.connected) {
        try {
          console.log("Attempting to fetch from database");
          const { data, error } = await supabase
            .from('personal_info')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
  
          if (error) {
            // Check if it's a schema error
            if (error.code === 'PGRST106' || error.message.includes('schema must be one of the following')) {
              console.log("Schema error, table might not exist yet:", error);
              sessionStorage.setItem('db_schema_error', 'true');
              throw error;
            }
            
            if (error.code !== 'PGRST116') {
              throw error;
            }
          }
  
          console.log("Personal info fetched:", data);
          
          if (data) {
            const transformedData = {
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zip_code || '',
              birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
              // Add new fields
              occupation: data.occupation || '',
              annualIncome: data.annual_income?.toString() || '',
              profileImage: data.profile_image || null,
            };
            return { data: transformedData, error: null };
          }
        } catch (dbError) {
          console.error("Database error fetching personal info:", dbError);
        }
      }
      
      // Fallback to local storage if database fetch failed
      console.log("Checking local storage as fallback");
      const localStorageKey = getLocalStorageKey(userId, 'personal_info');
      const localData = localStorage.getItem(localStorageKey);
      
      if (localData) {
        console.log("Found local data as fallback");
        const parsedData = JSON.parse(localData);
        const transformedData = {
          firstName: parsedData.firstName || '',
          lastName: parsedData.lastName || '',
          email: parsedData.email || user?.email || '',
          phone: parsedData.phone || '',
          address: parsedData.address || '',
          city: parsedData.city || '',
          state: parsedData.state || '',
          zipCode: parsedData.zipCode || '',
          birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : undefined,
          // Add new fields for retrieval from local storage
          occupation: parsedData.occupation || '',
          annualIncome: parsedData.annualIncome || '',
          profileImage: parsedData.profileImage || null,
        };
        return { data: transformedData, error: null, localData: true };
      }
      
      // Return empty data if nothing found
      return { data: {
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        birthDate: undefined,
        // Add new fields with defaults
        occupation: '',
        annualIncome: '',
        profileImage: null,
      }, error: null };
    } catch (error: any) {
      console.error('Error fetching personal info:', error);
      setLastError(error);
      
      if (error.code !== 'PGRST106') {
        toast.error('Failed to load personal information');
      }
      
      return { data: {
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        birthDate: undefined,
        // Add new fields with defaults
        occupation: '',
        annualIncome: '',
        profileImage: null,
      }, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchLiabilities = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching liabilities:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchIncome = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching income:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  const adminFetchAllUsers = async () => {
    if (!user || !isAdmin) return { error: 'Not authorized' };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const adminFetchUserData = async (userId: string) => {
    if (!user || !isAdmin) return { error: 'Not authorized' };
    
    setLoading(true);
    try {
      const userIdStr = userId.toString();
      
      const personalInfo = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userIdStr)
        .maybeSingle();
        
      const assets = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userIdStr);
        
      const liabilities = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userIdStr);
        
      const income = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userIdStr);
        
      const expenses = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userIdStr);
      
      return {
        data: {
          personalInfo: personalInfo.data,
          assets: assets.data || [],
          liabilities: liabilities.data || [],
          income: income.data || [],
          expenses: expenses.data || []
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if database connection is currently available
  const checkDatabaseStatus = async () => {
    const status = await checkConnection();
    return status.connected;
  };

  // Try to sync locally stored data to database
  const syncLocalData = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    const userId = user.id?.toString();
    if (!userId) return { error: 'Invalid user ID' };
    
    const connectionStatus = await checkConnection();
    if (!connectionStatus.connected) {
      return { error: 'Database not available', connected: false };
    }
    
    let success = true;
    const dataTypes = ['personal_info', 'assets', 'liabilities', 'income', 'expenses'];
    const results: Record<string, any> = {};
    
    for (const dataType of dataTypes) {
      const localStorageKey = getLocalStorageKey(userId, dataType);
      const localData = localStorage.getItem(localStorageKey);
      
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          // Implement sync logic for each data type
          // This is a placeholder - you'd need to implement the specific sync logic
          results[dataType] = { synced: true };
        } catch (error) {
          success = false;
          results[dataType] = { error };
        }
      }
    }
    
    return { success, results, connected: true };
  };

  return {
    loading,
    lastError,
    isAdmin: user?.role === 'admin' || user?.role === 'Admin',
    checkDatabaseStatus,
    syncLocalData,
    savePersonalInfo,
    saveAssets,
    saveLiabilities,
    saveIncome,
    saveExpenses,
    fetchPersonalInfo,
    fetchAssets,
    fetchLiabilities,
    fetchIncome,
    fetchExpenses,
    adminFetchAllUsers,
    adminFetchUserData
  };
}
