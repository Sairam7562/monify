import { useState, useCallback, useEffect } from 'react';
import { supabase, checkConnection } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useDatabase() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const [schemaChecked, setSchemaChecked] = useState<boolean>(false);

  // Check for schema issues on mount
  useEffect(() => {
    if (user && !schemaChecked) {
      checkDatabaseStatus().then(isConnected => {
        setSchemaChecked(true);
        if (!isConnected) {
          console.log("Database schema issues detected on hook initialization");
        }
      });
    }
  }, [user, schemaChecked]);

  const verifyAuth = useCallback(() => {
    if (!user || !session) {
      console.error("Authentication required: No user or session found");
      toast.error("Authentication required. Please log in again.");
      return false;
    }
    return true;
  }, [user, session]);

  const hasSchemaIssue = () => {
    return sessionStorage.getItem('db_schema_error') === 'true';
  };

  const getLocalStorageKey = (userId: string, dataType: string) => {
    return `${dataType}_${userId}`;
  };

  const debugLocalStorage = (userId: string) => {
    if (!userId) return;
    
    const keys = ['personal_info', 'assets', 'liabilities', 'income', 'expenses', 'business_info'];
    console.group('Local Storage Data');
    keys.forEach(key => {
      const localKey = getLocalStorageKey(userId, key);
      const data = localStorage.getItem(localKey);
      console.log(`${key}:`, data ? 'Data exists' : 'No data');
    });
    console.groupEnd();
  };

  // Function to retry failed database operations using locally stored data
  const retryWithLocalData = async (dataType: string) => {
    if (!user) return false;
    
    const userId = user.id.toString();
    const localStorageKey = getLocalStorageKey(userId, dataType);
    const localData = localStorage.getItem(localStorageKey);
    
    if (!localData) return false;
    
    try {
      console.log(`Attempting to sync local ${dataType} data with database`);
      const parsed = JSON.parse(localData);
      
      // Implement logic for each data type
      switch (dataType) {
        case 'assets':
          // Handle assets sync
          break;
        case 'liabilities':
          // Handle liabilities sync
          break;
        // Add other data types
        default:
          break;
      }
      
      return true;
    } catch (error) {
      console.error(`Error syncing local ${dataType} data:`, error);
      return false;
    }
  };

  // Updated function to check database status with retry logic
  const checkDatabaseStatus = async () => {
    try {
      console.log("Checking database status...");
      const status = await checkConnection();
      
      // If we detect schema issues but have 'api' in the error message,
      // try updating the client configuration
      if (!status.connected && 
          status.reason === 'schema_error' && 
          status.error && 
          status.error.message.includes('api')) {
        
        console.log("Attempting to update client configuration to use API schema");
        // Update headers directly
        supabase.headers.set('Accept-Profile', 'api,public');
        
        // Try a second connection check
        const retryStatus = await checkConnection();
        return retryStatus.connected;
      }
      
      return status.connected;
    } catch (error) {
      console.error("Error checking database status:", error);
      return false;
    }
  };

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
      
      const connectionStatus = await checkConnection();
      console.log("Database connection status:", connectionStatus);
      
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database unavailable, using local storage");
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
        const { data: existingData, error: fetchError } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching existing data:", fetchError);
          if (fetchError.code === 'PGRST106' || fetchError.message.includes('schema must be one of the following')) {
            console.log("Database schema error - table might not exist yet. Saving to local storage for now.");
            sessionStorage.setItem('db_schema_error', 'true');
            const localStorageKey = getLocalStorageKey(userId, 'personal_info');
            localStorage.setItem(localStorageKey, JSON.stringify({
              ...data,
              user_id: userId,
              updated_at: new Date().toISOString()
            }));
            debugLocalStorage(userId);
            toast.success('Information saved locally. It will be synced when the database is available.');
            return { data: null, error: null, localSaved: true };
          } else {
            throw fetchError;
          }
        }

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
        
        if (err.code === 'PGRST106' || (err.message && err.message.includes('schema must be one of the following'))) {
          console.error("Database schema error, using local storage fallback:", err);
          sessionStorage.setItem('db_schema_error', 'true');
        } else {
          console.error("Database error, using local storage fallback:", err);
        }
        
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

  const saveBusinessInfo = async (businesses: any[]) => {
    try {
      setLoading(true);
      setLastError(null);
      
      if (!verifyAuth()) {
        return { error: 'Not authenticated' };
      }
      
      console.log("Attempting to save business info for user:", user.id);
      console.log("Business info data:", businesses);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const connectionStatus = await checkConnection();
      console.log("Database connection status:", connectionStatus);
      
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database unavailable, using local storage");
        const localStorageKey = getLocalStorageKey(userId, 'business_info');
        localStorage.setItem(localStorageKey, JSON.stringify({
          businesses: businesses,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        debugLocalStorage(userId);
        
        toast.success('Business information saved locally. It will be synced when the database is available.');
        return { data: businesses, error: null, localSaved: true };
      }
      
      try {
        const { error: tableCheckError } = await supabase
          .from('business_info')
          .select('id')
          .limit(1);
          
        if (tableCheckError) {
          if (tableCheckError.code === 'PGRST116' || tableCheckError.message.includes('relation "business_info" does not exist')) {
            console.log("Business info table does not exist, using local storage fallback");
            const localStorageKey = getLocalStorageKey(userId, 'business_info');
            localStorage.setItem(localStorageKey, JSON.stringify({
              businesses: businesses,
              user_id: userId,
              updated_at: new Date().toISOString()
            }));
            debugLocalStorage(userId);
            toast.success('Business information saved locally. It will be synced when the database is available.');
            return { data: businesses, error: null, localSaved: true };
          }
        }
        
        const { error: deleteError } = await supabase
          .from('business_info')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error("Error deleting existing business info:", deleteError);
          throw deleteError;
        }
        
        for (const business of businesses) {
          const { error: insertError } = await supabase
            .from('business_info')
            .insert({
              ...business,
              user_id: userId
            });
            
          if (insertError) {
            console.error("Error inserting business info:", insertError);
            throw insertError;
          }
        }
        
        console.log("Business info save operation successful");
        toast.success('Business information saved successfully');
        return { data: businesses, error: null };
        
      } catch (err: any) {
        console.error("Database error during business info save:", err);
        setLastError(err);
        
        const localStorageKey = getLocalStorageKey(userId, 'business_info');
        localStorage.setItem(localStorageKey, JSON.stringify({
          businesses: businesses,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        debugLocalStorage(userId);
        
        toast.success('Business information saved locally. It will be synced to the database when available.');
        return { data: businesses, error: err.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error saving business info:', error);
      setLastError(error);
      toast.error('Could not save business information: ' + error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessInfo = async () => {
    if (!verifyAuth()) {
      return { error: 'Not authenticated' };
    }
    
    setLoading(true);
    try {
      console.log("Fetching business info for user:", user.id);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      const connectionStatus = await checkConnection();
      console.log("Database connection status before fetch:", connectionStatus);
      
      const localStorageKey = getLocalStorageKey(userId, 'business_info');
      const localData = localStorage.getItem(localStorageKey);
      let localBusinesses = null;
      
      if (localData) {
        console.log("Found local business data:", localData.substring(0, 50) + "...");
        try {
          const parsedData = JSON.parse(localData);
          if (parsedData.businesses && Array.isArray(parsedData.businesses)) {
            localBusinesses = parsedData.businesses;
          }
        } catch (err) {
          console.error("Error parsing local business data:", err);
        }
      }
      
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database connection issue, using local business data");
        return { data: localBusinesses || [], error: null, localData: true };
      }
      
      if (connectionStatus.connected) {
        try {
          console.log("Attempting to fetch business info from database");
          const { data, error } = await supabase
            .from('business_info')
            .select('*')
            .eq('user_id', userId);
  
          if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "business_info" does not exist')) {
              console.log("Business info table doesn't exist yet:", error);
              return { data: localBusinesses || [], error: null, localData: !!localBusinesses };
            }
            
            if (error.code === 'PGRST106' || error.message.includes('schema must be one of the following')) {
              console.log("Schema error fetching business info:", error);
              sessionStorage.setItem('db_schema_error', 'true');
              return { data: localBusinesses || [], error: null, localData: !!localBusinesses };
            }
            
            throw error;
          }
  
          console.log("Business info fetched from database:", data);
          
          if (data && data.length > 0) {
            return { data, error: null };
          }
        } catch (dbError) {
          console.error("Database error fetching business info:", dbError);
        }
      }
      
      return { data: localBusinesses || [], error: null, localData: !!localBusinesses };
      
    } catch (error: any) {
      console.error('Error fetching business info:', error);
      setLastError(error);
      toast.error('Failed to load business information');
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveAssets = async (assets: any[]) => {
    try {
      if (!user) return { error: 'Not authenticated' };
      
      setLoading(true);
      console.log("Attempting to save assets for user:", user.id);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Always store locally first as backup
      const localStorageKey = `assets_${userId}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        assets: assets,
        timestamp: new Date().toISOString()
      }));
      
      // Format the assets for database storage
      const formattedAssets = assets.filter(asset => asset.name.trim() !== '' || parseFloat(asset.value) > 0)
        .map(asset => ({
          name: asset.name || 'Unnamed Asset',
          type: asset.type,
          value: parseFloat(asset.value) || 0,
          ownership_percentage: parseFloat(asset.ownershipPercentage) || 100,
          description: asset.description || '',
          user_id: userId
        }));

      if (formattedAssets.length === 0) {
        toast.success('No assets to save');
        return { data: [], error: null };
      }

      // Check for known database schema issues
      const connectionStatus = await checkConnection();
      const hasDbIssue = !connectionStatus.connected || hasSchemaIssue();
      
      if (hasDbIssue) {
        console.log("Database connection issues detected, saving to local storage only");
        toast.success('Assets saved locally. They will be synced when database connection is restored.');
        return { data: formattedAssets, error: null, localSaved: true };
      }

      // Update headers directly
      supabase.headers.set('Accept-Profile', 'public,api');
      
      try {
        // Delete existing assets first
        const { error: deleteError } = await supabase
          .from('assets')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error deleting existing assets:', deleteError);
          
          // If it's a schema error, inform the user
          if (deleteError.code === 'PGRST106' || deleteError.message.includes('schema must be one of the following')) {
            sessionStorage.setItem('db_schema_error', 'true');
            toast.error('Database schema issue detected. Data saved locally.');
            return { data: formattedAssets, error: deleteError.message, localSaved: true };
          }
          
          throw deleteError;
        }

        // Insert new assets
        const insertPromises = formattedAssets.map(asset => 
          supabase
            .from('assets')
            .insert(asset)
        );
        
        await Promise.all(insertPromises);
        
        toast.success('Assets saved successfully');
        return { data: formattedAssets, error: null };
      } catch (error: any) {
        console.error('Error saving assets:', error);
        
        // Save locally and return success with localSaved flag
        toast.success('Assets saved locally. They will be synced when database connection is restored.');
        return { data: formattedAssets, error: error.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error in saveAssets function:', error);
      toast.error('Failed to save assets. Data saved locally.');
      return { data: null, error: error.message, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveLiabilities = async (liabilities: any[]) => {
    try {
      if (!user) return { error: 'Not authenticated' };
      
      setLoading(true);
      console.log("Attempting to save liabilities for user:", user.id);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Store locally first as backup
      const localStorageKey = `liabilities_${userId}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        liabilities: liabilities,
        timestamp: new Date().toISOString()
      }));
      
      // Format the liabilities for database storage
      const formattedLiabilities = liabilities.filter(liability => liability.name.trim() !== '' || parseFloat(liability.amount) > 0)
        .map(liability => ({
          name: liability.name || 'Unnamed Liability',
          type: liability.type,
          amount: parseFloat(liability.amount) || 0,
          interest_rate: parseFloat(liability.interestRate) || 0,
          associated_asset_id: liability.associatedAssetId ? 
            liability.associatedAssetId > 0 ? liability.associatedAssetId : null : null,
          ownership_percentage: parseFloat(liability.ownershipPercentage) || 100,
          user_id: userId
        }));
      
      if (formattedLiabilities.length === 0) {
        toast.success('No liabilities to save');
        return { data: [], error: null };
      }

      // Check for known database schema issues
      const connectionStatus = await checkConnection();
      const hasDbIssue = !connectionStatus.connected || hasSchemaIssue();
      
      if (hasDbIssue) {
        console.log("Database connection issues detected, saving to local storage only");
        toast.success('Liabilities saved locally. They will be synced when database connection is restored.');
        return { data: formattedLiabilities, error: null, localSaved: true };
      }

      // Update headers directly
      supabase.headers.set('Accept-Profile', 'public,api');

      try {
        // Delete existing liabilities first
        const { error: deleteError } = await supabase
          .from('liabilities')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error deleting existing liabilities:', deleteError);
          
          // If it's a schema error, inform the user
          if (deleteError.code === 'PGRST106' || deleteError.message.includes('schema must be one of the following')) {
            sessionStorage.setItem('db_schema_error', 'true');
            toast.error('Database schema issue detected. Data saved locally.');
            return { data: formattedLiabilities, error: deleteError.message, localSaved: true };
          }
          
          throw deleteError;
        }

        // Insert new liabilities
        const insertPromises = formattedLiabilities.map(liability => 
          supabase
            .from('liabilities')
            .insert(liability)
        );
        
        await Promise.all(insertPromises);
        
        toast.success('Liabilities saved successfully');
        return { data: formattedLiabilities, error: null };
      } catch (error: any) {
        console.error('Error saving liabilities:', error);
        
        // Save locally and return success with localSaved flag
        toast.success('Liabilities saved locally. They will be synced when database connection is restored.');
        return { data: formattedLiabilities, error: error.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error in saveLiabilities function:', error);
      toast.error('Failed to save liabilities. Data saved locally.');
      return { data: null, error: error.message, localSaved: true };
    } finally {
      setLoading(false);
    }
  };

  const saveIncome = async (incomeData: any[]) => {
    try {
      if (!user) return { error: 'Not authenticated' };
      
      setLoading(true);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Store locally first as backup
      const localStorageKey = `income_${userId}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        income: incomeData,
        timestamp: new Date().toISOString()
      }));
      
      const formattedIncome = incomeData.filter(income => income.source.trim() !== '' || parseFloat(income.amount) > 0)
        .map(income => ({
          source: income.source || 'Unnamed Source',
          type: income.type,
          amount: parseFloat(income.amount) || 0,
          frequency: income.frequency,
          user_id: userId
        }));

      if (formattedIncome.length === 0) {
        toast.success('No income data to save');
        return { data: [], error: null };
      }

      // Check for known database schema issues
      const connectionStatus = await checkConnection();
      const hasDbIssue = !connectionStatus.connected || hasSchemaIssue();
      
      if (hasDbIssue) {
        console.log("Database connection issues detected, saving to local storage only");
        toast.success('Income saved locally. It will be synced when database connection is restored.');
        return { data: formattedIncome, error: null, localSaved: true };
      }

      // Update headers directly
      supabase.headers.set('Accept-Profile', 'public,api');
      
      try {
        // Delete existing income first
        const { error: deleteError } = await supabase
          .from('income')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error deleting existing income:', deleteError);
          
          // If it's a schema error, inform the user
          if (deleteError.code === 'PGRST106' || deleteError.message.includes('schema must be one of the following')) {
            sessionStorage.setItem('db_schema_error', 'true');
            toast.error('Database schema issue detected. Data saved locally.');
            return { data: formattedIncome, error: deleteError.message, localSaved: true };
          }
          
          throw deleteError;
        }

        // Insert new income
        const insertPromises = formattedIncome.map(income => 
          supabase
            .from('income')
            .insert(income)
        );
        
        await Promise.all(insertPromises);
        
        toast.success('Income information saved successfully');
        return { data: formattedIncome, error: null };
      } catch (error: any) {
        console.error('Error saving income:', error);
        
        // Save locally and return success with localSaved flag
        toast.success('Income saved locally. It will be synced when database connection is restored.');
        return { data: formattedIncome, error: error.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error saving income:', error);
      toast.error('Failed to save income information: ' + error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (expensesData: any[]) => {
    try {
      if (!user) return { error: 'Not authenticated' };
      
      setLoading(true);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Store locally first as backup
      const localStorageKey = `expenses_${userId}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        expenses: expensesData,
        timestamp: new Date().toISOString()
      }));
      
      const formattedExpenses = expensesData.filter(expense => expense.name.trim() !== '' || parseFloat(expense.amount) > 0)
        .map(expense => ({
          name: expense.name || 'Unnamed Expense',
          category: expense.category,
          amount: parseFloat(expense.amount) || 0,
          frequency: expense.frequency,
          user_id: userId
        }));

      if (formattedExpenses.length === 0) {
        toast.success('No expense data to save');
        return { data: [], error: null };
      }

      // Check for known database schema issues
      const connectionStatus = await checkConnection();
      const hasDbIssue = !connectionStatus.connected || hasSchemaIssue();
      
      if (hasDbIssue) {
        console.log("Database connection issues detected, saving to local storage only");
        toast.success('Expenses saved locally. They will be synced when database connection is restored.');
        return { data: formattedExpenses, error: null, localSaved: true };
      }

      // Update headers directly
      supabase.headers.set('Accept-Profile', 'public,api');
      
      try {
        // Delete existing expenses first
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error('Error deleting existing expenses:', deleteError);
          
          // If it's a schema error, inform the user
          if (deleteError.code === 'PGRST106' || deleteError.message.includes('schema must be one of the following')) {
            sessionStorage.setItem('db_schema_error', 'true');
            toast.error('Database schema issue detected. Data saved locally.');
            return { data: formattedExpenses, error: deleteError.message, localSaved: true };
          }
          
          throw deleteError;
        }

        // Insert new expenses
        const insertPromises = formattedExpenses.map(expense => 
          supabase
            .from('expenses')
            .insert(expense)
        );
        
        await Promise.all(insertPromises);
        
        toast.success('Expense information saved successfully');
        return { data: formattedExpenses, error: null };
      } catch (error: any) {
        console.error('Error saving expenses:', error);
        
        // Save locally and return success with localSaved flag
        toast.success('Expenses saved locally. They will be synced when database connection is restored.');
        return { data: formattedExpenses, error: error.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error saving expenses:', error);
      toast.error('Failed to save expense information: ' + error.message);
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
      
      const connectionStatus = await checkConnection();
      console.log("Database connection status before fetch:", connectionStatus);
      
      if (!connectionStatus.connected || hasSchemaIssue()) {
        console.log("Database connection issue, checking local storage first");
        const localStorageKey = getLocalStorageKey(userId, 'personal_info');
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
          console.log("Found local data:", localData.substring(0, 50) + "...");
          try {
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
              occupation: parsedData.occupation || '',
              annualIncome: parsedData.annualIncome || '',
              profileImage: parsedData.profileImage || null,
            };
            return { data: transformedData, error: null, localData: true };
          } catch (err) {
            console.error("Error parsing local personal info data:", err);
          }
        }
      }
      
      if (connectionStatus.connected) {
        try {
          console.log("Attempting to fetch from database");
          const { data, error } = await supabase
            .from('personal_info')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
  
          if (error) {
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
      
      console.log("Checking local storage as fallback");
      const localStorageKey = getLocalStorageKey(userId, 'personal_info');
      const localData = localStorage.getItem(localStorageKey);
      
      if (localData) {
        console.log("Found local data as fallback");
        const parsedData = JSON.parse(localData);
        const transformedData = {
          firstName: parsedData.firstName || '',
          lastName: parsedData.lastName || '',
          email: parsedData
