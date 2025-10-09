import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const startdate = url.searchParams.get('startdate');
    const enddate = url.searchParams.get('enddate');
    const granularity = url.searchParams.get('granularity') || 'daily';

    if (!startdate || !enddate) {
      throw new Error('startdate and enddate are required');
    }

    // Call Lovable Analytics API
    const analyticsUrl = `https://lovable.app/api/projects/analytics/page-analytics?` +
      `projectId=2b0eec6d-0491-4219-a6e7-e1a0e05dadf3&` +
      `startDate=${startdate}&` +
      `endDate=${enddate}&` +
      `granularity=${granularity}`;

    console.log('Fetching analytics from:', analyticsUrl);

    const response = await fetch(analyticsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics API error:', errorText);
      throw new Error(`Analytics API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Analytics data received:', JSON.stringify(data).substring(0, 200));

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in get-analytics function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch analytics data'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
