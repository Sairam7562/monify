
import { toast } from "sonner";

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
}

// Mock database - in a real app, this would be in your backend
let users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', plan: 'Premium', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', plan: 'Basic', lastLogin: '2023-11-27', role: 'User', twoFactorEnabled: false },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', plan: 'Premium', lastLogin: '2023-11-20', role: 'User', twoFactorEnabled: false },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', plan: 'Enterprise', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', status: 'suspended', plan: 'Basic', lastLogin: '2023-11-15', role: 'User', twoFactorEnabled: false },
];

// Get all users
export const getAllUsers = (): User[] => {
  return users;
};

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// Register a new user
export const registerUser = async (name: string, email: string, password: string, enableTwoFactor: boolean = false): Promise<User | null> => {
  try {
    // Check if user already exists
    if (getUserByEmail(email)) {
      toast.error("User with this email already exists");
      return null;
    }

    // Create a new user
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      role: 'User',
      plan: 'Basic',
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: enableTwoFactor
    };

    // Add to our "database"
    users.push(newUser);

    // In a real app, this would be handled by your backend
    await sendRegistrationEmail(email, name);
    
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Failed to register user");
    return null;
  }
};

// Add a user by admin
export const addUserByAdmin = async (name: string, email: string, role: string, plan: string): Promise<User | null> => {
  try {
    // Check if user already exists
    if (getUserByEmail(email)) {
      toast.error("User with this email already exists");
      return null;
    }

    // Create a new user
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      role,
      plan,
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false
    };

    // Add to our "database"
    users.push(newUser);

    // Send invitation email
    await sendInvitationEmail(email, name);
    
    return newUser;
  } catch (error) {
    console.error("Add user error:", error);
    toast.error("Failed to add user");
    return null;
  }
};

// Login with email and password
export const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = getUserByEmail(email);
    
    if (!user) {
      toast.error("Invalid email or password");
      return null;
    }

    if (user.status !== 'active') {
      toast.error("Your account is not active");
      return null;
    }

    // Update last login
    user.lastLogin = new Date().toISOString().split('T')[0];
    
    return user;
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Failed to login");
    return null;
  }
};

// Login with social provider
export const loginWithSocial = async (provider: 'Google' | 'Microsoft' | 'Apple'): Promise<User | null> => {
  try {
    // Simulate social login - in a real app, this would integrate with the provider's SDK
    console.log(`Logging in with ${provider}`);

    // For demo purposes, we'll just create/return a mock user
    const email = `user.${Date.now()}@${provider.toLowerCase()}.com`;
    const name = `${provider} User`;
    
    let user = getUserByEmail(email);
    
    if (!user) {
      // Create a new user if one doesn't exist
      user = {
        id: String(users.length + 1),
        name,
        email,
        role: 'User',
        plan: 'Basic',
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0],
        twoFactorEnabled: false
      };
      
      users.push(user);
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString().split('T')[0];
    
    return user;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    toast.error(`Failed to login with ${provider}`);
    return null;
  }
};

// Verify two-factor authentication
export const verifyTwoFactor = async (user: User, code: string): Promise<boolean> => {
  // In a real app, you would verify the code against a service like Twilio or Google Authenticator
  // For demo purposes, we'll just accept any 6-digit code
  return code.length === 6 && /^\d+$/.test(code);
};

// Delete a user
export const deleteUser = (id: string): boolean => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length < initialLength;
};

// Toggle user status
export const toggleUserStatus = (id: string): User | null => {
  const user = getUserById(id);
  
  if (!user) return null;
  
  user.status = user.status === 'active' ? 'inactive' : 'active';
  return user;
};

// Helper functions for sending emails
const sendRegistrationEmail = async (email: string, name: string): Promise<void> => {
  // In a real app, this would send an actual email
  console.log(`Sending registration email to ${name} (${email})`);
  toast.success(`Registration email sent to ${email}`);
};

const sendInvitationEmail = async (email: string, name: string): Promise<void> => {
  // In a real app, this would send an actual email
  console.log(`Sending invitation email to ${name} (${email})`);
  toast.success(`Invitation email sent to ${email}`);
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Set current user in localStorage
export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// Logout the current user
export const logout = (): void => {
  localStorage.removeItem('currentUser');
};
