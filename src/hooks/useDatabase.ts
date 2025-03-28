import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useDatabase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const savePersonalInfo = async (data: any) => {
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      // Check if personal info already exists for this user
      const { data: existingData, error: fetchError } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('personal_info')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            birth_date: data.birthDate,
            updated_at: new Date().toISOString() // Convert Date to ISO string
          })
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('personal_info')
          .insert({
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            birth_date: data.birthDate
          });
      }

      if (result.error) throw result.error;
      
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
      // Delete existing assets for this user
      await supabase
        .from('assets')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new assets
      const formattedAssets = assets.map(asset => ({
        user_id: user.id,
        name: asset.name || 'Unnamed Asset',
        type: asset.type,
        value: parseFloat(asset.value) || 0,
        ownership_percentage: parseFloat(asset.ownershipPercentage) || 100,
        description: asset.description || ''
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
      // Delete existing liabilities for this user
      await supabase
        .from('liabilities')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new liabilities
      const formattedLiabilities = liabilities.map(liability => ({
        user_id: user.id,
        name: liability.name || 'Unnamed Liability',
        type: liability.type,
        amount: parseFloat(liability.amount) || 0,
        interest_rate: parseFloat(liability.interestRate) || 0,
        associated_asset_id: liability.associatedAssetId ? 
          liability.associatedAssetId > 0 ? liability.associatedAssetId : null : null,
        ownership_percentage: parseFloat(liability.ownershipPercentage) || 100
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
      // Delete existing income records for this user
      await supabase
        .from('income')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new income records
      const formattedIncome = incomeData.map(income => ({
        user_id: user.id,
        source: income.source || 'Unnamed Source',
        type: income.type,
        amount: parseFloat(income.amount) || 0,
        frequency: income.frequency
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
      // Delete existing expense records for this user
      await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new expense records
      const formattedExpenses = expensesData.map(expense => ({
        user_id: user.id,
        name: expense.name || 'Unnamed Expense',
        category: expense.category,
        amount: parseFloat(expense.amount) || 0,
        frequency: expense.frequency
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
    if (!user) return { error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching personal info:', error);
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
        .eq('user_id', user.id);

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
        .eq('user_id', user.id);

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
        .eq('user_id', user.id);

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
        .eq('user_id', user.id);

      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      return { data: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
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

  // Function to fetch user data by user ID (for admin)
  const adminFetchUserData = async (userId: string) => {
    if (!user || !isAdmin) return { error: 'Not authorized' };
    
    setLoading(true);
    try {
      const personalInfo = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const assets = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId);
        
      const liabilities = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', userId);
        
      const income = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId);
        
      const expenses = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);
      
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
    // User data operations
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
    // Admin operations
    adminFetchAllUsers,
    adminFetchUserData
  };
}
