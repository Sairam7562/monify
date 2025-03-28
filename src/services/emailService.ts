
// Helper functions for sending emails
export const sendRegistrationEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email using a service like SendGrid or Mailgun
    console.log(`SENDING REGISTRATION EMAIL to ${name} (${email})`);
    console.log(`Email Subject: Welcome to Monify - Complete Your Registration`);
    console.log(`Email Content: Hi ${name}, welcome to Monify! Please click the link below to verify your email and complete your registration.`);
    
    // Log the email details for debugging
    console.log(`Verification Link: https://app.monify.com/verify-email?token=mock-token-${Date.now()}`);
    
    // In a real implementation, you'd return the result from your email service
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email
    console.log(`SENDING VERIFICATION EMAIL to ${name} (${email})`);
    console.log(`Email Subject: Verify Your Monify Account`);
    console.log(`Email Content: Hi ${name}, please click the link below to verify your email address.`);
    console.log(`Verification Link: https://app.monify.com/verify-email?token=mock-token-${Date.now()}`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual welcome email
    console.log(`SENDING WELCOME EMAIL to ${name} (${email})`);
    console.log(`Email Subject: Welcome to Monify!`);
    console.log(`Email Content: Hi ${name}, welcome to Monify! We're excited to have you on board.`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};

export const sendInvitationEmail = async (email: string, name: string, temporaryPassword?: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email
    console.log(`SENDING INVITATION EMAIL to ${name} (${email})`);
    console.log(`Email Subject: You've Been Invited to Join Monify`);
    console.log(`Email Content: Hi ${name}, you have been invited to join Monify! Please use the following temporary password to log in: ${temporaryPassword}`);
    console.log(`Login Link: https://app.monify.com/login`);
    
    // Log additional details for debugging
    console.log(`Invitation sent at: ${new Date().toISOString()}`);
    console.log(`Temporary password will expire in 24 hours.`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    // In a real app, this would send an actual password reset email
    console.log(`SENDING PASSWORD RESET EMAIL to ${name} (${email})`);
    console.log(`Email Subject: Reset Your Monify Password`);
    console.log(`Email Content: Hi ${name}, we received a request to reset your password. Click the link below to reset your password.`);
    console.log(`Reset Link: https://app.monify.com/reset-password?token=mock-token-${Date.now()}`);
    
    // Simulate email sending success
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
};

export const sendTwoFactorCode = async (email: string, name: string, method: "app" | "sms"): Promise<boolean> => {
  try {
    // Generate a fake code for demo purposes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (method === "sms") {
      console.log(`SENDING 2FA SMS CODE to ${name} (${email})`);
      console.log(`SMS Content: Your Monify verification code is: ${code}`);
    } else {
      console.log(`SENDING 2FA EMAIL CODE to ${name} (${email})`);
      console.log(`Email Subject: Your Monify Verification Code`);
      console.log(`Email Content: Hi ${name}, your verification code is: ${code}`);
    }
    
    // Simulate sending success
    return true;
  } catch (error) {
    console.error(`Failed to send 2FA code via ${method}:`, error);
    return false;
  }
};
