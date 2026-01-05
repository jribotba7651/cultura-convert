import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Support both GET (from email link) and POST requests
    let email: string | null = null;
    let token: string | null = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      email = url.searchParams.get('email');
      token = url.searchParams.get('token');
    } else {
      const body = await req.json();
      email = body.email;
      token = body.token;
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Update all book_waitlist entries for this email
    const { data: updated, error: updateError } = await supabase
      .from('book_waitlist')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', normalizedEmail)
      .is('unsubscribed_at', null)
      .select('id');

    if (updateError) {
      console.error('Error unsubscribing:', updateError);
      throw updateError;
    }

    console.log(`Unsubscribed ${normalizedEmail}, updated ${updated?.length || 0} entries`);

    // For GET requests (from email links), return a nice HTML page
    if (req.method === 'GET') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
              text-align: center;
            }
            h1 { color: #1a1a1a; margin-bottom: 16px; }
            p { color: #666; }
            .check { font-size: 48px; margin-bottom: 24px; }
            a { color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="check">✓</div>
          <h1>You've been unsubscribed</h1>
          <p>You will no longer receive emails about our books at <strong>${normalizedEmail}</strong>.</p>
          <p style="margin-top: 24px;">
            <a href="https://escritorespuertorricodiaspora.com">Return to website</a>
          </p>
        </body>
        </html>
      `;
      return new Response(html, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully unsubscribed',
        unsubscribedCount: updated?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in unsubscribe-email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
