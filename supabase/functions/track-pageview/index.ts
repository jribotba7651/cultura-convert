import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { path, sessionId, userAgent, deviceType, referrer } = await req.json();

    // Basic validation
    if (!path || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: path, sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert page view
    const { error } = await supabase
      .from('analytics_page_views')
      .insert({
        path,
        session_id: sessionId,
        user_agent: userAgent || null,
        device_type: deviceType || null,
        referrer: referrer || null,
      });

    if (error) {
      console.error('Error inserting page view:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track page view' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Analytics] Tracked: ${path} (session: ${sessionId.substring(0, 8)}...)`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-pageview:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
