import { ReactNode, useEffect, useState, useRef } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/services/userService';
import AuthContext, { supabaseUserToUser } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthProviderProps {
  children: ReactNode;
}

// Define a type that includes all possible Supabase auth events, including custom ones
type AuthChangeEvent = 
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'USER_DELETED'  // Add this for explicit type safety
  | 'MFA_CHALLENGE_VERIFIED';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initializingAuth = useRef(true);
  
  // Prevent excessive toast notifications
  const toastTimestamps = useRef<Record<string, number>>({});
  
  const showThrottledToast = (id: string, type: 'success' | 'error' | 'info', message: string) => {
    const now = Date.now();
    const lastShown = toastTimestamps.current[id] || 0;
    
    // Only show toast if it hasn't been shown in the last 5 seconds
    if (now - lastShown > 5000) {
      toastTimestamps.current[id] = now;
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else toast.info(message);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Check for hash params from email verification
    const hasHashParams = window.location.hash && window.location.hash.includes('type=recovery');
    if (hasHashParams) {
      console.log("Hash parameters detected, handling authentication...");
    }
    
    // Prevent multiple subscriptions
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // First set up the listener before checking for an existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change event:", event);
        
        if (initializingAuth.current) {
          // Skip toast notifications during initial auth setup
          console.log("Initializing auth, skipping notifications");
          setSession(newSession);
          setSupabaseUser(newSession?.user ?? null);
          setUser(newSession?.user ? supabaseUserToUser(newSession.user) : null);
          initializingAuth.current = false;
          return;
        }
        
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        setUser(newSession?.user ? supabaseUserToUser(newSession.user) : null);
        
        // Use a type assertion to treat the event as our extended AuthChangeEvent type
        const authEvent = event as AuthChangeEvent;
        
        // Only show notifications for major events (not TOKEN_REFRESHED)
        if (authEvent === 'SIGNED_IN') {
          showThrottledToast('signed-in', 'success', "Signed in successfully!");
        } else if (authEvent === 'SIGNED_OUT') {
          showThrottledToast('signed-out', 'success', "Signed out successfully");
        } else if (authEvent === 'USER_UPDATED') {
          showThrottledToast('user-updated', 'success', "User profile updated");
        } else if (authEvent === 'PASSWORD_RECOVERY') {
          showThrottledToast('password-recovery', 'info', "Password recovery initiated");
        } else if (authEvent === 'USER_DELETED') {
          showThrottledToast('user-deleted', 'info', "Account deleted");
        }
      }
    );
    
    subscriptionRef.current = subscription;

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved session:", currentSession ? "Session exists" : "No session");
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      setUser(currentSession?.user ? supabaseUserToUser(currentSession.user) : null);
      setLoading(false);
      initializingAuth.current = false;
    });

    return () => {
      console.log("Cleaning up auth subscription");
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      console.log("Attempting to login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id);
        return supabaseUserToUser(data.user);
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (
    name: string, 
    email: string, 
    password: string, 
    enableTwoFactor: boolean
  ): Promise<User | null> => {
    try {
      setLoading(true);
      console.log("Attempting to register user:", email);
      
      // Set the redirect URL to the current domain for proper verification
      const redirectTo = `${window.location.origin}/verify-email`;
      
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
          },
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error("Registration error:", error);
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        console.log("Registration successful for user:", data.user.id);
        
        if (data.session) {
          toast.success("Registration successful! You are now logged in.");
        } else {
          toast.success("Registration successful! Please check your email to verify your account.");
          console.log("Verification email sent to:", email);
          console.log("Email redirect URL set to:", redirectTo);
          
          // Add additional toast with more details
          toast.info("If you don't see the verification email, please check your spam/junk folder or try again later.", {
            duration: 8000,
          });
        }
        
        return supabaseUserToUser(data.user);
      }
      return null;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithSocial = async (provider: 'google' | 'github' | 'apple' | 'microsoft'): Promise<void> => {
    try {
      setLoading(true);
      console.log(`Attempting to login with ${provider}`);
      
      const validProvider = provider === 'google' ? 'google' : 
                          provider === 'github' ? 'github' : 
                          provider === 'microsoft' ? 'azure' : 'apple';
      
      const redirectTo = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: validProvider,
        options: {
          redirectTo: redirectTo,
          scopes: provider === 'google' ? 'profile email' : undefined
        }
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("Attempting to log out");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(error.message);
        return;
      }
      
      // We don't need to manually update state here since onAuthStateChange will handle it
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    } finally {
      setLoading(false);
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
