import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEventRequest {
  eventName: string;
  eventData: Record<string, any>;
  sessionId?: string;
}

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
    const { eventName, eventData, sessionId }: AnalyticsEventRequest = await req.json();

    console.log('Analytics event:', { eventName, eventData, sessionId });

    // Validate event name
    const allowedEvents = [
      'buy_direct_click',
      'amazon_click',
      'waitlist_submit',
      'sample_download',
      'book_page_view',
    ];

    if (!allowedEvents.includes(eventName)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        event_data: eventData,
        session_id: sessionId,
      });

    if (error) {
      console.error('Error inserting analytics event:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in track-analytics-event:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
