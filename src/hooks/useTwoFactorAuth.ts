
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/services/userService";
import { verifyTwoFactor, generateTwoFactorCode } from "@/services/securityService";
import { sendTwoFactorCode } from "@/services/emailService";

export const useTwoFactorAuth = (user: User, onVerified: () => void, onCancel: () => void) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<"app" | "sms">("app");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const success = await verifyTwoFactor(user, otp, method);
      if (success) {
        toast.success("Two-factor authentication verified");
        onVerified();
      } else {
        toast.error("Invalid verification code");
        setOtp("");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      // Generate a new 2FA code
      const generated = await generateTwoFactorCode(user, method);
      
      if (generated) {
        // Send the code to the user
        const sent = await sendTwoFactorCode(user.email, user.name, method);
        
        if (sent) {
          toast.success(`A new code has been sent to your ${method === "sms" ? "phone" : "email"}`);
          
          // Start cooldown timer
          setResendCooldown(60);
          const timer = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          toast.error(`Failed to send code via ${method === "sms" ? "SMS" : "email"}`);
        }
      } else {
        toast.error("Failed to generate verification code");
      }
    } catch (error) {
      toast.error("Error sending verification code");
      console.error("Error sending code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    otp,
    setOtp,
    isLoading,
    method,
    setMethod,
    resendCooldown,
    handleVerify,
    handleResendCode
  };
};

export default useTwoFactorAuth;
