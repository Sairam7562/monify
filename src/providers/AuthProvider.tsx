
import React, { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, checkConnection } from '@/integrations/supabase/client';
import AuthContext, { supabaseUserToUser } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User } from '@/services/userService';
import { loginWithEmail, loginWithSocial, registerUser, logout } from '@/services/authService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConnectionChecked, setDbConnectionChecked] = useState(false);
  const [dbConnectionError, setDbConnectionError] = useState<boolean | null>(null);
  
  // Function to retry database connection
  const retryDatabaseConnection = useCallback(async () => {
    try {
      const result = await checkConnection();
      setDbConnectionError(!result.connected);
      return result.connected;
    } catch (error) {
      console.error("Error retrying database connection:", error);
      setDbConnectionError(true);
      return false;
    }
  }, []);

  // Check database connection
  useEffect(() => {
    const verifyDatabaseConnection = async () => {
      try {
        console.info("Checking Supabase database connection...");
        const result = await checkConnection();
        
        if (!result.connected) {
          console.warn("Initial database check: Connection failed - " + result.reason);
          console.error("Error details:", result.error);
          
          // Store the error in session storage to persist across page reloads
          if (result.reason === 'schema_error') {
            sessionStorage.setItem('db_schema_error', 'true');
          }
          
          setDbConnectionError(true);
        } else {
          sessionStorage.removeItem('db_schema_error');
          setDbConnectionError(false);
        }
        
        setDbConnectionChecked(true);
      } catch (error) {
        console.error("Failed to check database connection:", error);
        setDbConnectionError(true);
        setDbConnectionChecked(true);
      }
    };

    // Only check database connection if we have a session
    if (session) {
      verifyDatabaseConnection();
    }
  }, [session]);

  // Initialize auth and watch for changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event);
      setSession(newSession);
      setSupabaseUser(newSession?.user ?? null);
      setUser(supabaseUserToUser(newSession?.user ?? null));
      
      // When auth state changes, we should check database connection again
      if (newSession) {
        setDbConnectionChecked(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setSupabaseUser(initialSession?.user ?? null);
      setUser(supabaseUserToUser(initialSession?.user ?? null));
      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email/password
  const handleLoginWithEmail = async (email: string, password: string) => {
    try {
      const user = await loginWithEmail(email, password);
      return user;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login. Please try again.";
      toast.error(errorMessage);
      return null;
    }
  };

  // Register new user
  const handleRegisterUser = async (name: string, email: string, password: string, enableTwoFactor: boolean) => {
    try {
      const user = await registerUser(name, email, password, enableTwoFactor);
      return user;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to register. Please try again.";
      toast.error(errorMessage);
      return null;
    }
  };

  // Login with social provider
  const handleLoginWithSocial = async (provider: 'google' | 'github' | 'apple' | 'microsoft') => {
    try {
      await loginWithSocial(provider);
    } catch (error: any) {
      const errorMessage = error.message || `Failed to login with ${provider}. Please try again.`;
      toast.error(errorMessage);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to logout. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      session,
      loading,
      dbConnectionChecked,
      dbConnectionError,
      loginWithEmail: handleLoginWithEmail,
      registerUser: handleRegisterUser,
      loginWithSocial: handleLoginWithSocial,
      logout: handleLogout,
      retryDatabaseConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
};
