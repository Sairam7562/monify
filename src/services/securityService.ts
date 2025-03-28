
import { toast } from "sonner";
import { User } from "./userService";

// Hash password - in a real app, this would use a proper hashing algorithm
export const hashPassword = async (password: string): Promise<string> => {
  // Simulate hashing with a delay to mimic a real hashing algorithm
  await new Promise(resolve => setTimeout(resolve, 100));
  return `hashed_${password}_${Date.now()}`;
};

// Verify password - in a real app, this would compare hash properly
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  // This is just a mock implementation
  return hashedPassword.includes(plainPassword);
};

// Verify two-factor authentication
export const verifyTwoFactor = async (user: User, code: string, method: "app" | "sms"): Promise<boolean> => {
  try {
    console.log(`Verifying 2FA code via ${method} for user ${user.email}: ${code}`);
    
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

// Generate 2FA verification code (for app or SMS)
export const generateTwoFactorCode = async (user: User, method: "app" | "sms"): Promise<boolean> => {
  try {
    // In a real app, this would generate a code and send it via the appropriate channel
    console.log(`Generating 2FA code for user ${user.email} via ${method}`);
    
    // Simulate code generation and sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error(`Failed to generate 2FA code via ${method}:`, error);
    return false;
  }
};

// Enable 2FA for a user
export const enableTwoFactor = (user: User): boolean => {
  try {
    user.twoFactorEnabled = true;
    return true;
  } catch (error) {
    console.error("Failed to enable 2FA:", error);
    return false;
  }
};

// Disable 2FA for a user
export const disableTwoFactor = (user: User): boolean => {
  try {
    user.twoFactorEnabled = false;
    return true;
  } catch (error) {
    console.error("Failed to disable 2FA:", error);
    return false;
  }
};
