
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  userId: string;
  email: string;
  name: string;
  tempPassword: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, name, tempPassword }: InvitationRequest = await req.json();
    
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Sending invitation to ${name} (${email}) with temporary password`);
    
    // Send a password reset email to the user
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (error) {
      console.error("Error generating password reset link:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // In a real application, you would use an email service like Resend or SendGrid
    // to send a custom email with the temporary password and instructions
    // For now, just log that we would send an email
    console.log(`
      INVITATION EMAIL WOULD BE SENT:
      
      To: ${name} <${email}>
      Subject: Welcome to Monify - Your Account Details
      
      Dear ${name},
      
      An account has been created for you on Monify.
      
      Your temporary password is: ${tempPassword}
      
      Please click the reset link we sent to your email to set your password.
      
      Once logged in, you can update your profile and explore the platform.
      
      Best regards,
      The Monify Team
    `);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
