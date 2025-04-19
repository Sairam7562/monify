
import { supabase } from '@/integrations/supabase/client';
import { User } from './userService';

// Fetch assets for a user
export async function fetchAssets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
}

// Fetch liabilities for a user
export async function fetchLiabilities(userId: string) {
  try {
    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching liabilities:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching liabilities:", error);
    throw error;
  }
}

// Fetch income for a user
export async function fetchIncome(userId: string) {
  try {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching income:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching income:", error);
    throw error;
  }
}

// Fetch expenses for a user
export async function fetchExpenses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
}
