
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

  const savePersonalInfo = async (data: any) => {
    try {
      setLoading(true);
      
      if (!verifyAuth()) {
        return { error: 'Not authenticated' };
      }
      
      console.log("Attempting to save personal info for user:", user.id);
      console.log("Personal info data:", data);
      
      // Use strongly typed filter
      const { data: existingData, error: fetchError } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id as string)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error checking existing personal info:", fetchError);
        throw fetchError;
      }

      let result;
      
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
      
      if (existingData) {
        // Update existing record - adding a type check
        console.log("Updating existing record:", existingData.id);
        result = await supabase
          .from('personal_info')
          .update(formattedData)
          .eq('id', existingData.id);
      } else {
        // Insert new record - ensuring we use the right format for Supabase
        console.log("Creating new record for user:", user.id);
        result = await supabase
          .from('personal_info')
          .insert({
            ...formattedData,
            user_id: user.id as string
          });
      }

      if (result.error) {
        console.error("Database operation failed:", result.error);
        throw result.error;
      }
      
      console.log("Save operation successful");
      toast.success('Personal information saved successfully');
      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('Error saving personal info:', error);
      toast.error('Failed to save personal information');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveAssets = async (assets: any[]) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      await supabase
        .from('assets')
        .delete()
        .eq('user_id', user.id as string);
      
      // Format assets for insertion ensuring each property matches the DB schema
      const formattedAssets = assets.map(asset => ({
        name: asset.name || 'Unnamed Asset',
        type: asset.type,
        value: parseFloat(asset.value) || 0,
        ownership_percentage: parseFloat(asset.ownershipPercentage) || 100,
        description: asset.description || '',
        user_id: user.id as string
      }));

      const { data, error } = await supabase
        .from('assets')
        .insert(formattedAssets);

      if (error) throw error;
      
      toast.success('Assets saved successfully');
      return { data, error: null };
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
      await supabase
        .from('liabilities')
        .delete()
        .eq('user_id', user.id as string);
      
      // Format liabilities for insertion ensuring each property matches the DB schema
      const formattedLiabilities = liabilities.map(liability => ({
        name: liability.name || 'Unnamed Liability',
        type: liability.type,
        amount: parseFloat(liability.amount) || 0,
        interest_rate: parseFloat(liability.interestRate) || 0,
        associated_asset_id: liability.associatedAssetId ? 
          liability.associatedAssetId > 0 ? liability.associatedAssetId : null : null,
        ownership_percentage: parseFloat(liability.ownershipPercentage) || 100,
        user_id: user.id as string
      }));

      const { data, error } = await supabase
        .from('liabilities')
        .insert(formattedLiabilities);

      if (error) throw error;
      
      toast.success('Liabilities saved successfully');
      return { data, error: null };
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
      await supabase
        .from('income')
        .delete()
        .eq('user_id', user.id as string);
      
      // Format income for insertion ensuring each property matches the DB schema
      const formattedIncome = incomeData.map(income => ({
        source: income.source || 'Unnamed Source',
        type: income.type,
        amount: parseFloat(income.amount) || 0,
        frequency: income.frequency,
        user_id: user.id as string
      }));

      const { data, error } = await supabase
        .from('income')
        .insert(formattedIncome);

      if (error) throw error;
      
      toast.success('Income information saved successfully');
      return { data, error: null };
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
      await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id as string);
      
      // Format expenses for insertion ensuring each property matches the DB schema
      const formattedExpenses = expensesData.map(expense => ({
        name: expense.name || 'Unnamed Expense',
        category: expense.category,
        amount: parseFloat(expense.amount) || 0,
        frequency: expense.frequency,
        user_id: user.id as string
      }));

      const { data, error } = await supabase
        .from('expenses')
        .insert(formattedExpenses);

      if (error) throw error;
      
      toast.success('Expense information saved successfully');
      return { data, error: null };
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
      
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id as string)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching personal info:", error);
        throw error;
      }

      console.log("Personal info fetched:", data);
      
      if (data) {
        // Properly handle the data with type safety
        const transformedData = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          birthDate: data.birth_date,
        };
        return { data: transformedData, error: null };
      }
      
      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error fetching personal info:', error);
      toast.error('Failed to load personal information');
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id as string);

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
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id as string);

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
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id as string);

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
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id as string);

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
      const personalInfo = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId as string)
        .maybeSingle();
        
      const assets = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId as string);
        
      const liabilities = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId as string);
        
      const income = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId as string);
        
      const expenses = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId as string);
      
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
    isAdmin,
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
