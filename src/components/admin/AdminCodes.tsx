
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminCodes = () => {
  const { user, session } = useAuth();
  const [accessCodes, setAccessCodes] = useState<{code: string, expiry: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate a random access code
  const generateAccessCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Function to generate a new admin access code
  const generateNewCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo purposes, generate a code that expires in 24 hours
      const newCode = generateAccessCode();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      // Add the new code to the list
      setAccessCodes(prev => [
        { code: newCode, expiry: expiryDate.toISOString() },
        ...prev
      ]);
      
      toast.success('New admin access code generated');
    } catch (err) {
      console.error('Error generating access code:', err);
      setError('Failed to generate access code. Please try again.');
      toast.error('Failed to generate access code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Code copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy code');
    });
  };

  // Initialize with a demo code on component mount
  useEffect(() => {
    const demoCode = generateAccessCode();
    const demoExpiry = new Date();
    demoExpiry.setHours(demoExpiry.getHours() + 24);
    
    setAccessCodes([
      { code: demoCode, expiry: demoExpiry.toISOString() },
      { code: 'ADMIN2023', expiry: '2025-12-31T23:59:59Z' }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-monify-purple-600" />
              <CardTitle className="text-xl">Admin Access Codes</CardTitle>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={generateNewCode} 
              disabled={isLoading}
              className="bg-monify-purple-600 hover:bg-monify-purple-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Code'
              )}
            </Button>
          </div>
          <CardDescription>
            Use these codes to grant admin access to other users. Codes expire after their set validity period.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {accessCodes.length > 0 ? (
              accessCodes.map((accessCode, index) => {
                const expiry = new Date(accessCode.expiry);
                const isExpired = expiry < new Date();
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-md border flex justify-between items-center ${
                      isExpired ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div>
                      <p className={`font-mono text-lg font-bold ${isExpired ? 'text-gray-400' : 'text-green-700'}`}>
                        {accessCode.code}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isExpired ? (
                          'Expired'
                        ) : (
                          `Valid until ${expiry.toLocaleDateString()} ${expiry.toLocaleTimeString()}`
                        )}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(accessCode.code)}
                      disabled={isExpired}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No access codes available. Generate a new code.</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 border-t border-slate-200 flex justify-between">
          <div className="text-sm text-gray-500">
            <p>Current user: {user?.email || 'Not logged in'}</p>
            <p>User role: {user?.role || 'None'}</p>
          </div>
          {session && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (user?.role !== 'Admin') {
                  supabase.functions.invoke('admin-grant-role', {
                    body: { userId: user?.id, targetRole: 'Admin' }
                  }).then(() => {
                    toast.success('Admin role granted!');
                  }).catch(err => {
                    console.error('Error granting admin role:', err);
                    toast.error('Failed to grant admin role');
                  });
                } else {
                  toast.info('You already have admin privileges');
                }
              }}
            >
              {user?.role === 'Admin' ? 'Already Admin' : 'Grant Admin Access'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminCodes;
