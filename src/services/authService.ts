
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
  password?: string; // Add password field
  temporaryPassword?: string; // For new users
}

// Mock database - in a real app, this would be in your backend
let users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', plan: 'Premium', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true, password: 'hashedpassword123' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', plan: 'Basic', lastLogin: '2023-11-27', role: 'User', twoFactorEnabled: false, password: 'hashedpassword456' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', plan: 'Premium', lastLogin: '2023-11-20', role: 'User', twoFactorEnabled: false, password: 'hashedpassword789' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', plan: 'Enterprise', lastLogin: '2023-11-28', role: 'User', twoFactorEnabled: true, password: 'hashedpassword101' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', status: 'suspended', plan: 'Basic', lastLogin: '2023-11-15', role: 'User', twoFactorEnabled: false, password: 'hashedpassword202' },
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

// Hash password - in a real app, this would use a proper hashing algorithm
const hashPassword = (password: string): string => {
  return `hashed_${password}_${Date.now()}`;
};

// Generate a temporary password
const generateTemporaryPassword = (): string => {
  return Math.random().toString(36).slice(-8);
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
      twoFactorEnabled: enableTwoFactor,
      password: hashPassword(password)
    };

    // Add to our "database"
    users.push(newUser);

    // In a real app, this would be handled by your backend
    const emailSent = await sendRegistrationEmail(email, name);
    
    if (emailSent) {
      toast.success(`Registration email sent to ${email}`);
      console.log(`Registration email sent to ${name} (${email})`);
    } else {
      toast.error("Failed to send registration email");
      console.error(`Failed to send registration email to ${name} (${email})`);
    }
    
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

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();

    // Create a new user
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      role,
      plan,
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false,
      temporaryPassword: tempPassword
    };

    // Add to our "database"
    users.push(newUser);

    // Send invitation email with temporary password
    const emailSent = await sendInvitationEmail(email, name, tempPassword);
    
    if (emailSent) {
      toast.success(`Invitation email with temporary password sent to ${email}`);
      console.log(`Invitation email sent to ${name} (${email}) with temporary password: ${tempPassword}`);
    } else {
      toast.error("Failed to send invitation email");
      console.error(`Failed to send invitation email to ${name} (${email})`);
    }
    
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

    // In a real app, this would verify the password hash
    // For now, we'll just assume it's correct for demo purposes
    
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
    console.log(`Authenticating with ${provider}...`);
    toast.loading(`Connecting to ${provider}...`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll create a user email using a deterministic approach
    // so the same provider + timestamp creates the same user
    const timestamp = Math.floor(Date.now() / 10000); // Changes every 10 seconds for demo
    const email = `user.${timestamp}@${provider.toLowerCase()}.com`;
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
        twoFactorEnabled: false,
        password: hashPassword(`${provider.toLowerCase()}_auth_${timestamp}`)
      };
      
      users.push(user);
      console.log(`Created new user via ${provider} authentication:`, user);
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString().split('T')[0];
    
    toast.success(`Successfully authenticated with ${provider}`);
    return user;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    toast.error(`Failed to login with ${provider}`);
    return null;
  }
};

// Verify two-factor authentication
export const verifyTwoFactor = async (user: User, code: string): Promise<boolean> => {
  try {
    console.log(`Verifying 2FA code for user ${user.email}: ${code}`);
    
    // In a real app, you would verify the code against a service like Twilio or Google Authenticator
    // For demo purposes, we'll just accept any 6-digit code
    const isValid = code.length === 6 && /^\d+$/.test(code);
    
    if (isValid) {
      toast.success("Two-factor authentication successful");
      console.log("2FA verification successful");
    } else {
      toast.error("Invalid verification code");
      console.log("2FA verification failed");
    }
    
    return isValid;
  } catch (error) {
    console.error("2FA verification error:", error);
    toast.error("Verification process failed");
    return false;
  }
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
const sendRegistrationEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email using a service like SendGrid or Mailgun
    console.log(`SENDING REGISTRATION EMAIL to ${name} (${email})`);
    console.log(`Email Subject: Welcome to Monify - Complete Your Registration`);
    console.log(`Email Content: Hi ${name}, welcome to Monify! Please click the link below to verify your email and complete your registration.`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return false;
  }
};

const sendInvitationEmail = async (email: string, name: string, temporaryPassword?: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email
    console.log(`SENDING INVITATION EMAIL to ${name} (${email})`);
    console.log(`Email Subject: You've Been Invited to Join Monify`);
    console.log(`Email Content: Hi ${name}, you have been invited to join Monify! Please use the following temporary password to log in: ${temporaryPassword}`);
    console.log(`Login Link: https://app.monify.com/login`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return false;
  }
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
