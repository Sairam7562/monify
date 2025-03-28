
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { toast as sonnerToast } from 'sonner';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loginWithEmail, registerUser, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (isRegisterPage) {
      // Registration logic
      if (!name) {
        toast({
          title: "Registration Failed",
          description: "Please enter your name.",
        });
        setIsLoading(false);
        return;
      }

      const user = await registerUser(name, email, password, enableTwoFactor);
      if (user) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered.",
        });
        navigate('/dashboard');
      }
    } else {
      // Login logic
      const user = await loginWithEmail(email, password);
      if (user) {
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });
        navigate('/dashboard');
      }
    }

    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple") => {
    setIsLoading(true);
    try {
      await loginWithSocial(provider);
      // Redirect will be handled by the auth state change listener
    } catch (error) {
      console.error(`${provider} login error:`, error);
      // Replace toast.error with toast({ variant: "destructive" })
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                />
              </div>
              {isRegisterPage && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="two-factor"
                    className="h-4 w-4"
                    checked={enableTwoFactor}
                    onChange={(e) => setEnableTwoFactor(e.target.checked)}
                  />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              )}
            </div>
            <CardFooter className="flex justify-between mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading" : isRegisterPage ? "Create Account" : "Sign In"}
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
          <div className="grid gap-2">
            <div className="flex flex-col space-y-3">
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
                onClick={() => handleSocialLogin("github")}
                disabled={isLoading} 
                className="w-full"
              >
                <img src="/github-logo.png" alt="GitHub" className="w-5 h-5 mr-2" />
                Continue with GitHub
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
