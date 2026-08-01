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

    const body = await req.json();
    const {
      path,
      sessionId,
      userAgent,
      deviceType,
      referrer,
      landingReferrer,
    } = body;

    const str = (v: unknown, max = 200): string | null =>
      typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

    // Basic validation
    if (!path || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: path, sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fire-and-forget the insert so the client gets an immediate response
    // and the edge function does not hit the 150s idle timeout.
    const insertPromise = supabase
      .from('analytics_page_views')
      .insert({
        path,
        session_id: sessionId,
        user_agent: userAgent || null,
        device_type: deviceType || null,
        referrer: referrer || null,
        landing_referrer: str(landingReferrer, 500),
        utm_source: str(body.utm_source),
        utm_medium: str(body.utm_medium),
        utm_campaign: str(body.utm_campaign),
        utm_content: str(body.utm_content),
        utm_term: str(body.utm_term),
      })
      .then(({ error }) => {
        if (error) console.error('Error inserting page view:', error);
        else console.log(`[Analytics] Tracked: ${path} (session: ${sessionId.substring(0, 8)}...)`);
      });

    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(insertPromise);
    }

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
