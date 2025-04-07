
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
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { checkConnection } from '@/integrations/supabase/client';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbCheckFailed, setDbCheckFailed] = useState(false);
  const { toast } = useToast();
  const { loginWithEmail, registerUser, loginWithSocial, session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';
  const from = location.state?.from || '/dashboard';
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Check for database connection issues on component mount
  useEffect(() => {
    const checkDbConnection = async () => {
      // Check if we've already detected a schema error
      const hasSchemaError = sessionStorage.getItem('db_schema_error') === 'true';
      
      if (hasSchemaError) {
        setDbCheckFailed(true);
      }
    };
    
    checkDbConnection();
  }, []);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !isLoading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, navigate, isLoading]);

  useEffect(() => {
    // Clear any previous error messages when switching between login/register
    setErrorMessage(null);
    // Reset form fields when switching between login/register
    setEmail('');
    setPassword('');
    setName('');
  }, [location.pathname]);

  const handleRetryConnection = async () => {
    setIsCheckingDb(true);
    setDbCheckFailed(false);
    setErrorMessage(null);
    
    try {
      sonnerToast.info("Checking database connection...");
      const result = await checkConnection();
      
      if (result.connected) {
        sonnerToast.success("Database connection restored!");
        sessionStorage.removeItem('db_schema_error');
      } else {
        sonnerToast.error("Still having database connection issues.");
        setDbCheckFailed(true);
        
        if (result.reason === 'schema_error') {
          setErrorMessage("Database schema mismatch detected. Please contact support.");
        } else {
          setErrorMessage("Could not connect to the database. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error checking database connection:", error);
      sonnerToast.error("Connection check failed");
      setDbCheckFailed(true);
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    // If database check failed, don't attempt login
    if (dbCheckFailed) {
      setErrorMessage("Cannot login: Database connection issues. Please retry the connection first.");
      setIsLoading(false);
      return;
    }

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

        // Increment login attempts
        setLoginAttempts(prev => prev + 1);
        
        console.log(`Login attempt ${loginAttempts + 1} for ${email}`);
        const user = await loginWithEmail(email, password);
        if (user) {
          toast({
            title: "Login Successful",
            description: "You have successfully logged in.",
          });
          
          // Add a small delay before navigation to ensure auth state is updated
          setTimeout(() => {
            navigate(from);
          }, 500);
        } else {
          // If login failed, increment attempts counter
          if (loginAttempts >= 3) {
            console.log("Too many failed login attempts. Suggesting password reset.");
            setErrorMessage("Too many failed login attempts. You may need to reset your password.");
          }
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
      console.log(`Attempting login with ${provider}`);
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
          {dbCheckFailed && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Connection Issue</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">We're experiencing issues connecting to our database.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 mt-1"
                  onClick={handleRetryConnection}
                  disabled={isCheckingDb}
                >
                  {isCheckingDb ? (
                    <>
                      <Spinner className="mr-1 h-3 w-3" /> Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3" /> Retry Connection
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && !dbCheckFailed && (
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
                    disabled={isLoading || dbCheckFailed}
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
                  disabled={isLoading || dbCheckFailed}
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
                  disabled={isLoading || dbCheckFailed}
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
                    disabled={isLoading || dbCheckFailed}
                  />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              )}
            </div>
            <CardFooter className="flex justify-between mt-6 px-0">
              <Button type="submit" disabled={isLoading || dbCheckFailed}>
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
                onClick={() => loginWithSocial("google")}
                disabled={isLoading || dbCheckFailed}
                className="w-full"
              >
                <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loginWithSocial("microsoft")}
                disabled={isLoading || dbCheckFailed}
                className="w-full"
              >
                <img src="/microsoft-logo.png" alt="Microsoft" className="w-5 h-5 mr-2" />
                Continue with Microsoft
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loginWithSocial("apple")}
                disabled={isLoading || dbCheckFailed}
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
