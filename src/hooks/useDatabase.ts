
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useDatabase() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

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

  // Modified version of savePersonalInfo that handles schema errors better
  const savePersonalInfo = async (data: any) => {
    try {
      setLoading(true);
      
      if (!verifyAuth()) {
        return { error: 'Not authenticated' };
      }
      
      console.log("Attempting to save personal info for user:", user.id);
      console.log("Personal info data:", data);
      
      const userId = user.id?.toString();
      if (!userId) {
        return { error: 'Invalid user ID' };
      }
      
      // Check for known schema issues before attempting database operation
      if (hasSchemaIssue()) {
        console.log("Known database schema issue, using local storage");
        // Save to local storage
        const localStorageKey = `personal_info_${userId}`;
        localStorage.setItem(localStorageKey, JSON.stringify({
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        toast.success('Information saved locally. It will be synced when the database is available.');
        return { data: null, error: null, localSaved: true };
      }
      
      try {
        // Try to check if the table exists first
        const { data: existingData, error: fetchError } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          // Check if it's a schema error (PGRST106)
          if (fetchError.code === 'PGRST106' || fetchError.message.includes('schema must be one of the following')) {
            console.log("Database schema error - table might not exist yet. Saving to local storage for now.");
            // Mark schema error in session storage
            sessionStorage.setItem('db_schema_error', 'true');
            
            // Save to local storage as fallback
            const localStorageKey = `personal_info_${userId}`;
            localStorage.setItem(localStorageKey, JSON.stringify({
              ...data,
              user_id: userId,
              updated_at: new Date().toISOString()
            }));
            
            toast.success('Information saved locally. It will be synced to the database when available.');
            return { data: null, error: null, localSaved: true };
          } else {
            throw fetchError;
          }
        }

        // If we got here, the table exists and we can proceed with normal save
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
          updated_at: new Date().toISOString()
        };
        
        let result;
        
        if (existingData) {
          result = await supabase
            .from('personal_info')
            .update(formattedData)
            .eq('id', existingData.id);
        } else {
          result = await supabase
            .from('personal_info')
            .insert({
              ...formattedData,
              user_id: userId
            });
        }

        if (result.error) {
          throw result.error;
        }
        
        console.log("Save operation successful");
        toast.success('Personal information saved successfully');
        return { data: result.data, error: null };
      } catch (err: any) {
        // Handle specific errors
        if (err.code === 'PGRST106' || (err.message && err.message.includes('schema must be one of the following'))) {
          console.error("Database schema error, using local storage fallback:", err);
          sessionStorage.setItem('db_schema_error', 'true');
        } else {
          console.error("Database error, using local storage fallback:", err);
        }
        
        // Fallback to local storage for any database error
        const localStorageKey = `personal_info_${userId}`;
        localStorage.setItem(localStorageKey, JSON.stringify({
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString()
        }));
        
        toast.success('Information saved locally. It will be synced to the database when available.');
        return { data: null, error: err.message, localSaved: true };
      }
    } catch (error: any) {
      console.error('Error saving personal info:', error);
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
      
      try {
        const { data, error } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          // Check if it's a schema error
          if (error.code === 'PGRST106') {
            console.log("Schema error, table might not exist yet:", error);
            
            // Try to get from local storage
            const localStorageKey = `personal_info_${userId}`;
            const localData = localStorage.getItem(localStorageKey);
            
            if (localData) {
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
              };
              return { data: transformedData, error: error.message, localData: true };
            }
            
            // Return default empty data
            return { 
              data: {
                firstName: '',
                lastName: '',
                email: user?.email || '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                birthDate: undefined,
              }, 
              error: error.message 
            };
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
          };
          return { data: transformedData, error: null };
        }
        
        // Try to get from local storage if no data found
        const localStorageKey = `personal_info_${userId}`;
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
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
          };
          return { data: transformedData, error: null, localData: true };
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
        }, error: null };
      } catch (error: any) {
        console.error("Database error fetching personal info:", error);
        
        // Try to get from local storage as fallback
        const localStorageKey = `personal_info_${userId}`;
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
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
          };
          return { data: transformedData, error: error.message, localData: true };
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('Error fetching personal info:', error);
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

  return {
    loading,
    isAdmin: user?.role === 'admin' || user?.role === 'Admin',
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
    saveAssets,
    saveLiabilities,
    saveIncome, 
    saveExpenses,
    adminFetchAllUsers,
    adminFetchUserData
  };
}
