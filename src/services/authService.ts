
import { toast } from "sonner";
import { User, getUserByEmail, updateUser } from "./userService";
import { hashPassword, verifyPassword } from "./securityService";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailService";

// Current user management (client-side)
let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  return null;
};

// Authentication functions
export const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = getUserByEmail(email);
    
    if (!user) {
      toast.error("User not found");
      return null;
    }
    
    const isPasswordValid = await verifyPassword(password, user.password || "");
    
    if (!isPasswordValid) {
      toast.error("Invalid password");
      return null;
    }
    
    // Update last login time
    updateUser(user.id, {
      lastLogin: new Date().toISOString().split('T')[0]
    });
    
    toast.success("Login successful");
    return user;
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Login failed");
    return null;
  }
};

export const registerUser = async (
  name: string, 
  email: string, 
  password: string, 
  enableTwoFactor: boolean
): Promise<User | null> => {
  try {
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      toast.error("User already exists");
      return null;
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const newUserId = Date.now().toString();
    const newUser: User = {
      id: newUserId,
      name,
      email,
      role: "User",
      plan: "Basic",
      status: "active",
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: enableTwoFactor,
      password: hashedPassword
    };
    
    // Store user (this would be done by userService in a real app)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Send verification email
    await sendVerificationEmail(email, name);
    
    // Send welcome email
    await sendWelcomeEmail(email, name);
    
    toast.success("Registration successful");
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Registration failed");
    return null;
  }
};

export const loginWithSocial = async (provider: 'Google' | 'Microsoft' | 'Apple'): Promise<User | null> => {
  try {
    // This would normally connect to the OAuth provider
    // For demo purposes, we'll create a mock user
    const mockUser: User = {
      id: Date.now().toString(),
      name: `${provider} User`,
      email: `user_${Date.now()}@${provider.toLowerCase()}.example.com`,
      role: "User",
      plan: "Basic",
      status: "active",
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false
    };
    
    // Store the mock user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(mockUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    toast.success(`Login with ${provider} successful`);
    return mockUser;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    toast.error(`${provider} login failed`);
    return null;
  }
};

// Admin functions
export const addUserByAdmin = async (
  name: string, 
  email: string, 
  role: string, 
  plan: string
): Promise<User | null> => {
  try {
    // Check if user exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      toast.error("User with this email already exists");
      return null;
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);
    
    // Create new user
    const newUserId = Date.now().toString();
    const newUser: User = {
      id: newUserId,
      name,
      email,
      role,
      plan,
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false,
      password: hashedPassword,
      temporaryPassword: tempPassword
    };
    
    // Store user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Simulate sending invitation email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(`User ${name} added successfully`);
    return newUser;
  } catch (error) {
    console.error("Add user error:", error);
    toast.error("Failed to add user");
    return null;
  }
};
