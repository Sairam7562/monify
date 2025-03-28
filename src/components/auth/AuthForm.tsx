
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Apple, Github, Mail, MessageSquare } from "lucide-react";
import { registerUser, loginWithEmail, loginWithSocial, setCurrentUser, User } from "@/services/authService";
import TwoFactorAuth from "./TwoFactorAuth";

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState<boolean>(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Two-factor auth state
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await loginWithEmail(loginEmail, loginPassword);
      
      if (user) {
        if (user.twoFactorEnabled) {
          // Show 2FA verification
          setPendingUser(user);
          setShowTwoFactor(true);
        } else {
          // Set current user and redirect
          setCurrentUser(user);
          toast.success("Login successful!");
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await registerUser(registerName, registerEmail, registerPassword, enableTwoFactor);
      
      if (user) {
        toast.success("Registration successful! Check your email to complete the process.");
        // In a real app, you would ask them to verify their email before allowing login
        // For demo purposes, we'll just redirect
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Microsoft' | 'Apple') => {
    setIsLoading(true);
    
    try {
      const user = await loginWithSocial(provider);
      
      if (user) {
        setCurrentUser(user);
        toast.success(`Logged in with ${provider}!`);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(`${provider} login failed.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerified = () => {
    if (pendingUser) {
      setCurrentUser(pendingUser);
      toast.success("Login successful!");
      window.location.href = "/dashboard";
    }
    setShowTwoFactor(false);
  };

  const handleTwoFactorCancel = () => {
    setPendingUser(null);
    setShowTwoFactor(false);
  };

  // If two-factor authentication is active, show the verification form
  if (showTwoFactor && pendingUser) {
    return (
      <TwoFactorAuth 
        user={pendingUser}
        onVerified={handleTwoFactorVerified}
        onCancel={handleTwoFactorCancel}
      />
    );
  }

  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="/forgot-password" 
                    className="text-xs text-monify-purple-500 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use2fa" 
                  checked={enableTwoFactor}
                  onCheckedChange={(checked) => setEnableTwoFactor(checked as boolean)}
                />
                <label
                  htmlFor="use2fa"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use two-factor authentication
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-monify-purple-500 hover:bg-monify-purple-600" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Google")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0353 3.12C17.9503 1.89 15.2353 1 12.0003 1C7.31028 1 3.25527 3.55499 1.30029 7.36502L5.43023 10.5399C6.33021 7.18506 8.94022 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.4152 10.73 23.2802 10H12V14.51H18.47C18.13 15.99 17.24 17.25 15.9 18.09L19.97 21.2C22.1899 19.16 23.49 15.99 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.43995 13.46C5.19995 12.71 5.05997 11.9199 5.05997 11.0999C5.05997 10.2799 5.18995 9.48991 5.43995 8.73991L1.30994 5.56494C0.470207 7.21127 3.25578e-05 9.07125 0 10.9999C0 12.94 0.470029 14.81 1.31006 16.46L5.43995 13.46Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 22C15.2404 22 17.9654 21.01 19.9704 18.99L15.9004 15.88C14.8504 16.58 13.5405 17.01 12.0004 17.01C8.9404 17.01 6.33038 14.5849 5.43042 11.23L1.31042 14.39C3.25541 18.2 7.31042 22 12.0004 22Z"
                      fill="#34A853"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Microsoft")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="#f3f3f3"
                      d="M0 0h24v24H0z"
                    />
                    <path
                      fill="#f35325"
                      d="M1 1h10v10H1V1z"
                    />
                    <path
                      fill="#81bc06"
                      d="M13 1h10v10H13V1z"
                    />
                    <path
                      fill="#05a6f0"
                      d="M1 13h10v10H1V13z"
                    />
                    <path
                      fill="#ffba08"
                      d="M13 13h10v10H13V13z"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Apple")}
                >
                  <Apple className="h-5 w-5" />
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Enter your information to create a new account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enable2fa" 
                  checked={enableTwoFactor}
                  onCheckedChange={(checked) => setEnableTwoFactor(checked as boolean)}
                />
                <label
                  htmlFor="enable2fa"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable two-factor authentication
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <a href="/terms" className="text-monify-purple-500 hover:underline">
                    terms of service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-monify-purple-500 hover:underline">
                    privacy policy
                  </a>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-monify-purple-500 hover:bg-monify-purple-600" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or register with
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Google")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0353 3.12C17.9503 1.89 15.2353 1 12.0003 1C7.31028 1 3.25527 3.55499 1.30029 7.36502L5.43023 10.5399C6.33021 7.18506 8.94022 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.4152 10.73 23.2802 10H12V14.51H18.47C18.13 15.99 17.24 17.25 15.9 18.09L19.97 21.2C22.1899 19.16 23.49 15.99 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.43995 13.46C5.19995 12.71 5.05997 11.9199 5.05997 11.0999C5.05997 10.2799 5.18995 9.48991 5.43995 8.73991L1.30994 5.56494C0.470207 7.21127 3.25578e-05 9.07125 0 10.9999C0 12.94 0.470029 14.81 1.31006 16.46L5.43995 13.46Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 22C15.2404 22 17.9654 21.01 19.9704 18.99L15.9004 15.88C14.8504 16.58 13.5405 17.01 12.0004 17.01C8.9404 17.01 6.33038 14.5849 5.43042 11.23L1.31042 14.39C3.25541 18.2 7.31042 22 12.0004 22Z"
                      fill="#34A853"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Microsoft")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="#f3f3f3"
                      d="M0 0h24v24H0z"
                    />
                    <path
                      fill="#f35325"
                      d="M1 1h10v10H1V1z"
                    />
                    <path
                      fill="#81bc06"
                      d="M13 1h10v10H13V1z"
                    />
                    <path
                      fill="#05a6f0"
                      d="M1 13h10v10H1V13z"
                    />
                    <path
                      fill="#ffba08"
                      d="M13 13h10v10H13V13z"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("Apple")}
                >
                  <Apple className="h-5 w-5" />
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
