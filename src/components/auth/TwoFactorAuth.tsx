
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { User, verifyTwoFactor } from "@/services/authService";

interface TwoFactorAuthProps {
  user: User;
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorAuth = ({ user, onVerified, onCancel }: TwoFactorAuthProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<"app" | "sms">("app");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const success = await verifyTwoFactor(user, otp);
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

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    
    toast.success(`A new code has been sent to your ${method === "sms" ? "phone" : "email"}`);
    console.log(`Resending verification code via ${method}`);
    
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
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code from your {method === "app" ? "authenticator app" : "SMS"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-2 mb-4">
          <Button
            variant={method === "app" ? "default" : "outline"}
            onClick={() => setMethod("app")}
          >
            Authenticator App
          </Button>
          <Button
            variant={method === "sms" ? "default" : "outline"}
            onClick={() => setMethod("sms")}
          >
            SMS Code
          </Button>
        </div>

        <div className="mx-auto">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          {method === "app"
            ? "Open your authenticator app and enter the 6-digit code"
            : "We've sent a code to your registered phone number"}
        </p>
        
        <div className="text-center">
          <Button 
            variant="link" 
            size="sm" 
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : `Resend code via ${method === "app" ? "email" : "SMS"}`}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleVerify} disabled={otp.length !== 6 || isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorAuth;
