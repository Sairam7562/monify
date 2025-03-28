
import { ReactNode, useEffect, useState } from 'react';
import { User as SupabaseUser, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/services/userService';
import AuthContext, { supabaseUserToUser } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setUser(session?.user ? supabaseUserToUser(session.user) : null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setUser(session?.user ? supabaseUserToUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login with email and password
  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        toast.success("Login successful");
        return supabaseUserToUser(data.user);
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return null;
    }
  };

  // Register a new user
  const registerUser = async (
    name: string, 
    email: string, 
    password: string, 
    enableTwoFactor: boolean
  ): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            twoFactorEnabled: enableTwoFactor,
            role: 'User',
            plan: 'Basic',
            status: 'active'
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        toast.success("Registration successful");
        return supabaseUserToUser(data.user);
      }
      return null;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
      return null;
    }
  };

  // Login with social provider
  const loginWithSocial = async (provider: 'google' | 'github' | 'apple'): Promise<void> => {
    try {
      const validProvider: Provider = provider === 'google' ? 'google' : 
                                       provider === 'github' ? 'github' : 'apple';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: validProvider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed`);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    supabaseUser,
    session,
    loading,
    loginWithEmail,
    registerUser,
    loginWithSocial,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
