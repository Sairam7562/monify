
import { createContext, useContext } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/services/userService';

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: any;
  loading: boolean;
  dbConnectionChecked: boolean;
  dbConnectionError: boolean | null;
  loginWithEmail: (email: string, password: string) => Promise<User | null>;
  registerUser: (name: string, email: string, password: string, enableTwoFactor: boolean) => Promise<User | null>;
  loginWithSocial: (provider: 'google' | 'github' | 'apple' | 'microsoft') => Promise<void>;
  logout: () => Promise<void>;
  retryDatabaseConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  dbConnectionChecked: false,
  dbConnectionError: null,
  loginWithEmail: async () => null,
  registerUser: async () => null,
  loginWithSocial: async () => {},
  logout: async () => {},
  retryDatabaseConnection: async () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function supabaseUserToUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || '',
    role: supabaseUser.user_metadata?.role || 'User',
    plan: supabaseUser.user_metadata?.plan || 'Basic',
    status: supabaseUser.user_metadata?.status || 'active',
    lastLogin: new Date().toISOString().split('T')[0],
    twoFactorEnabled: supabaseUser.user_metadata?.twoFactorEnabled || false
  };
}

export default AuthContext;
