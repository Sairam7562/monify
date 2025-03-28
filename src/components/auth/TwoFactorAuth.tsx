
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { User } from "@/services/userService";
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth";

interface TwoFactorAuthProps {
  user: User;
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorAuth = ({ user, onVerified, onCancel }: TwoFactorAuthProps) => {
  const {
    otp,
    setOtp,
    isLoading,
    method,
    setMethod,
    resendCooldown,
    handleVerify,
    handleResendCode
  } = useTwoFactorAuth(user, onVerified, onCancel);

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
            disabled={resendCooldown > 0 || isLoading}
          >
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : `Resend code via ${method === "app" ? "email" : "SMS"}`}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
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
