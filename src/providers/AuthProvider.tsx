import React, { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, checkConnection } from '@/integrations/supabase/client';
import AuthContext, { supabaseUserToUser } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User } from '@/services/userService';
import { loginWithEmail, loginWithSocial, registerUser } from '@/services/authService';

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConnectionChecked, setDbConnectionChecked] = useState(false);
  const [dbConnectionError, setDbConnectionError] = useState<boolean | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
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

  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    
    const checkSessionInterval = setInterval(async () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      if (lastActivity > fiveMinutesAgo) {
        try {
          console.log("Refreshing session due to recent activity...");
          const { data } = await supabase.auth.refreshSession();
          if (data.session) {
            console.log("Session refreshed successfully");
          }
        } catch (err) {
          console.error("Failed to refresh session:", err);
        }
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(checkSessionInterval);
  }, [session, lastActivity]);

  useEffect(() => {
    const verifyDatabaseConnection = async () => {
      try {
        console.info("Checking Supabase database connection...");
        const result = await checkConnection();
        
        if (!result.connected) {
          console.warn("Initial database check: Connection failed - " + result.reason);
          console.error("Error details:", result.error);
          
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

    if (session) {
      verifyDatabaseConnection();
    }
  }, [session]);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
      } else {
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        setUser(supabaseUserToUser(newSession?.user ?? null));
      }
      
      if (newSession) {
        setDbConnectionChecked(false);
        setLastActivity(Date.now());
      }
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession ? "Session found" : "No session");
      setSession(initialSession);
      setSupabaseUser(initialSession?.user ?? null);
      setUser(supabaseUserToUser(initialSession?.user ?? null));
      setLoading(false);
      
      if (initialSession) {
        supabase.auth.refreshSession().then(({ data, error }) => {
          if (error) {
            console.error("Error refreshing session on startup:", error);
          } else if (data.session) {
            console.log("Session refreshed on startup");
          }
        });
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleLoginWithSocial = async (provider: 'google' | 'github' | 'apple' | 'microsoft') => {
    try {
      if (provider === 'microsoft') {
        await supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            redirectTo: window.location.origin
          }
        });
      } else {
        await loginWithSocial(provider as 'google' | 'github' | 'apple');
      }
    } catch (error: any) {
      const errorMessage = error.message || `Failed to login with ${provider}. Please try again.`;
      toast.error(errorMessage);
    }
  };

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
