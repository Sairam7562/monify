
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabaseUserToUser } from '@/hooks/useAuth';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  twoFactorEnabled: boolean;
  password?: string;
  temporaryPassword?: string;
}

// Mock database for fallback - in a real app, we'd use Supabase exclusively
let cachedUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', plan: 'Premium', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true, password: 'hashedpassword123' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', plan: 'Basic', lastLogin: '2023-11-27', role: 'User', twoFactorEnabled: false, password: 'hashedpassword456' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', plan: 'Premium', lastLogin: '2023-11-20', role: 'User', twoFactorEnabled: false, password: 'hashedpassword789' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', plan: 'Enterprise', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true, password: 'hashedpassword101' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', status: 'suspended', plan: 'Basic', lastLogin: '2023-11-15', role: 'User', twoFactorEnabled: false, password: 'hashedpassword202' },
];

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      return cachedUsers; // Fallback to mock data
    }

    if (data && data.length > 0) {
      // Type-safe mapping from database records to User type
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        plan: item.plan,
        status: item.status as 'active' | 'inactive' | 'suspended',
        lastLogin: item.last_login ? new Date(item.last_login).toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0],
        twoFactorEnabled: item.two_factor_enabled || false,
      }));
    }
    
    return cachedUsers; // Fallback to mock data
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return cachedUsers; // Fallback to mock data
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    // Ensure id is a string for type safety
    const userId = id.toString();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user by ID:", error);
      return cachedUsers.find(user => user.id === id); // Fallback
    }

    if (data) {
      // Type-safe mapping with proper null checks
      return {
        id: data?.id || '',
        name: data?.name || '',
        email: data?.email || '',
        role: data?.role || '',
        plan: data?.plan || '',
        status: (data?.status as 'active' | 'inactive' | 'suspended') || 'active',
        lastLogin: data?.last_login ? new Date(data?.last_login).toISOString().split('T')[0] : 
                   new Date().toISOString().split('T')[0],
        twoFactorEnabled: data?.two_factor_enabled || false,
      };
    }
    
    return undefined;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return cachedUsers.find(user => user.id === id); // Fallback
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    // Ensure email is a string for type safety
    const emailStr = email.toString();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', emailStr)
      .single();
    
    if (error) {
      console.error("Error fetching user by email:", error);
      return cachedUsers.find(user => user.email === email); // Fallback
    }

    if (data) {
      // Type-safe mapping with proper null checks
      return {
        id: data?.id || '',
        name: data?.name || '',
        email: data?.email || '',
        role: data?.role || '',
        plan: data?.plan || '',
        status: (data?.status as 'active' | 'inactive' | 'suspended') || 'active',
        lastLogin: data?.last_login ? new Date(data?.last_login).toISOString().split('T')[0] : 
                   new Date().toISOString().split('T')[0],
        twoFactorEnabled: data?.two_factor_enabled || false,
      };
    }
    
    return undefined;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return cachedUsers.find(user => user.email === email); // Fallback
  }
};

// Delete a user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    // Use Supabase Auth Admin API to delete the user
    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: id }
    });

    if (error) {
      console.error("Error deleting user:", error);
      // Fallback to mock data for development
      const initialLength = cachedUsers.length;
      cachedUsers = cachedUsers.filter(user => user.id !== id);
      return cachedUsers.length < initialLength;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    // Fallback to mock data for development
    const initialLength = cachedUsers.length;
    cachedUsers = cachedUsers.filter(user => user.id !== id);
    return cachedUsers.length < initialLength;
  }
};

// Toggle user status
export const toggleUserStatus = async (id: string): Promise<User | null> => {
  try {
    // First get the current user to check their status
    const user = await getUserById(id);
    
    if (!user) return null;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const userId = id.toString();
    
    // Create update data object with strongly typed status
    const updateData = { 
      status: newStatus 
    };
    
    // Update the user profile with status change
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user status:", error);
      // Fallback to mock data
      const mockUser = cachedUsers.find(user => user.id === id);
      if (mockUser) {
        mockUser.status = mockUser.status === 'active' ? 'inactive' : 'active';
        return mockUser;
      }
      return null;
    }

    // Return the updated user
    return {
      ...user,
      status: newStatus
    };
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    // Fallback to mock data
    const mockUser = cachedUsers.find(user => user.id === id);
    if (mockUser) {
      mockUser.status = mockUser.status === 'active' ? 'inactive' : 'active';
      return mockUser;
    }
    return null;
  }
};

// Update user data
export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    // Map the userData to match the database schema
    const dbData: any = {};
    
    if (userData.name) dbData.name = userData.name;
    if (userData.email) dbData.email = userData.email;
    if (userData.role) dbData.role = userData.role;
    if (userData.plan) dbData.plan = userData.plan;
    if (userData.status) dbData.status = userData.status;
    if (userData.lastLogin) dbData.last_login = userData.lastLogin;
    if ('twoFactorEnabled' in userData) dbData.two_factor_enabled = userData.twoFactorEnabled;
    dbData.updated_at = new Date();
    
    const userId = id.toString();
    
    // Update the user in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update(dbData)
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user:", error);
      // Fallback to mock data
      const mockUser = cachedUsers.find(user => user.id === id);
      if (mockUser) {
        Object.assign(mockUser, userData);
        return mockUser;
      }
      return null;
    }

    // Get the updated user
    return getUserById(id) || null;
  } catch (error) {
    console.error("Error in updateUser:", error);
    // Fallback to mock data
    const mockUser = cachedUsers.find(user => user.id === id);
    if (mockUser) {
      Object.assign(mockUser, userData);
      return mockUser;
    }
    return null;
  }
};
