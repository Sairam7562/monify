
import { supabase } from '@/integrations/supabase/client';
import { User } from './userService';

export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return data.user ? {
      id: data.user.id,
      name: data.user.user_metadata?.name || '',
      email: data.user.email || '',
      role: data.user.user_metadata?.role || 'User',
      plan: data.user.user_metadata?.plan || 'Basic',
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: data.user.user_metadata?.twoFactorEnabled || false
    } : null;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function loginWithSocial(provider: 'google' | 'github' | 'apple'): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error logging in with ${provider}:`, error);
    throw error;
  }
}

export async function registerUser(
  name: string, 
  email: string, 
  password: string, 
  enableTwoFactor: boolean
): Promise<User | null> {
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
    
    if (error) throw error;
    
    return data.user ? {
      id: data.user.id,
      name: data.user.user_metadata?.name || '',
      email: data.user.email || '',
      role: data.user.user_metadata?.role || 'User',
      plan: data.user.user_metadata?.plan || 'Basic',
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: data.user.user_metadata?.twoFactorEnabled || false
    } : null;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Add the missing function for creating a user by admin
export async function addUserByAdmin(
  name: string,
  email: string,
  role: string,
  plan: string,
  enableTwoFactor: boolean
): Promise<User | null> {
  try {
    // In a real implementation, this would use the admin API to create a user
    // For this example, we're just creating a basic structure
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        plan,
        twoFactorEnabled: enableTwoFactor,
        status: 'active'
      }
    });
    
    if (error) throw error;
    
    return data.user ? {
      id: data.user.id,
      name: data.user.user_metadata?.name || '',
      email: data.user.email || '',
      role: data.user.user_metadata?.role || role,
      plan: data.user.user_metadata?.plan || plan,
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: data.user.user_metadata?.twoFactorEnabled || enableTwoFactor
    } : null;
  } catch (error) {
    console.error('Error adding user by admin:', error);
    throw error;
  }
}
