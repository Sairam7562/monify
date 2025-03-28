
import { toast } from "sonner";
import { sendInvitationEmail } from "./emailService";

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
  password?: string;
  temporaryPassword?: string;
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

// Generate a temporary password
export const generateTemporaryPassword = (): string => {
  return Math.random().toString(36).slice(-8);
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

// Update user data
export const updateUser = (id: string, userData: Partial<User>): User | null => {
  const user = getUserById(id);
  
  if (!user) return null;
  
  // Update user properties
  Object.assign(user, userData);
  
  return user;
};
