
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // The hash will be processed automatically by Supabase's client
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Verification error:", error);
          toast.error("Email verification failed: " + error.message);
        } else if (data?.session) {
          console.log("Email verified successfully");
          setSuccess(true);
          toast.success("Email verified successfully!");
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          console.log("No session found after verification");
        }
      } catch (error) {
        console.error("Verification processing error:", error);
      } finally {
        setVerifying(false);
      }
    };

    handleVerification();
  }, [navigate]);

  if (verifying) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <h1 className="mt-4 text-2xl font-bold">Verifying your email...</h1>
        <p className="mt-2 text-gray-600">Please wait while we confirm your email address.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="p-4 bg-green-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Email Verified Successfully!</h1>
        <p className="mt-2 text-gray-600">You will be redirected to your dashboard shortly.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="p-4 bg-red-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold">Verification Failed</h1>
      <p className="mt-2 text-center text-gray-600 max-w-md mx-auto">
        We couldn't verify your email. The link might have expired or already been used.
      </p>
      <button 
        onClick={() => navigate('/login')}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Go to Login
      </button>
    </div>
  );
};

export default VerifyEmailPage;
