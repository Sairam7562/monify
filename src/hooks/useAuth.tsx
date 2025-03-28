
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/services/userService';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User | null>;
  registerUser: (name: string, email: string, password: string, enableTwoFactor: boolean) => Promise<User | null>;
  loginWithSocial: (provider: 'google' | 'github' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert Supabase user to our User type
export const supabaseUserToUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
    email: supabaseUser.email || '',
    role: supabaseUser.user_metadata?.role || 'User',
    plan: supabaseUser.user_metadata?.plan || 'Basic',
    status: (supabaseUser.user_metadata?.status as 'active' | 'inactive' | 'suspended') || 'active',
    lastLogin: new Date().toISOString().split('T')[0],
    twoFactorEnabled: supabaseUser.user_metadata?.twoFactorEnabled || false
  };
};

export default AuthContext;
