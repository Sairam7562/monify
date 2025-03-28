
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { toast as sonnerToast } from 'sonner';
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { loginWithEmail, registerUser, loginWithSocial, session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';
  const from = location.state?.from || '/dashboard';

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, navigate, isLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterPage) {
        // Registration logic
        if (!name) {
          setErrorMessage("Please enter your name.");
          setIsLoading(false);
          return;
        }

        if (!email || !password) {
          setErrorMessage("Please enter both email and password.");
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }

        const user = await registerUser(name, email, password, enableTwoFactor);
        if (user) {
          setIsSuccess(true);
          toast({
            title: "Registration Successful",
            description: "Please check your email to verify your account.",
          });
          // Don't navigate yet - show success message first
        }
      } else {
        // Login logic
        if (!email || !password) {
          setErrorMessage("Please enter both email and password.");
          setIsLoading(false);
          return;
        }

        const user = await loginWithEmail(email, password);
        if (user) {
          toast({
            title: "Login Successful",
            description: "You have successfully logged in.",
          });
          navigate(from);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple" | "microsoft") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithSocial(provider);
      // Redirect will be handled by the auth state change listener
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setErrorMessage(error instanceof Error ? error.message : `${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  // If registration was successful, show success message
  if (isSuccess && isRegisterPage) {
    return (
      <div className="container grid h-screen place-items-center">
        <Card className="w-[350px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2" />
              Registration Successful
            </CardTitle>
            <CardDescription>
              We've sent you an email with a verification link. Please check your inbox to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-gray-600">
              After verifying your email, you'll be able to log in to your account.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container grid h-screen place-items-center">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle>{isRegisterPage ? "Create an account" : "Login"}</CardTitle>
          <CardDescription>
            {isRegisterPage ? "Enter your information to create an account" : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              {isRegisterPage && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete={isRegisterPage ? "email" : "username"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete={isRegisterPage ? "new-password" : "current-password"}
                />
              </div>
              {isRegisterPage && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="two-factor"
                    className="h-4 w-4"
                    checked={enableTwoFactor}
                    onChange={(e) => setEnableTwoFactor(e.target.checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              )}
            </div>
            <CardFooter className="flex justify-between mt-6 px-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> 
                    {isRegisterPage ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  isRegisterPage ? "Create Account" : "Sign In"
                )}
              </Button>
              {isRegisterPage ? (
                <Link to="/login" className="text-sm underline">
                  Already have an account?
                </Link>
              ) : (
                <Link to="/register" className="text-sm underline">
                  Create an account
                </Link>
              )}
            </CardFooter>
          </form>
        </CardContent>
        <CardContent>
          <div className="grid gap-2 mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="flex flex-col space-y-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full"
              >
                <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("microsoft")}
                disabled={isLoading} 
                className="w-full"
              >
                <img src="/microsoft-logo.png" alt="Microsoft" className="w-5 h-5 mr-2" />
                Continue with Microsoft
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin("apple")}
                disabled={isLoading}
                className="w-full"
              >
                <img src="/apple-logo.png" alt="Apple" className="w-5 h-5 mr-2" />
                Continue with Apple
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
