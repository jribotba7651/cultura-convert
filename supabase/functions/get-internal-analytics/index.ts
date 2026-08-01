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
    // Create client with user's auth token
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Check admin access
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query params
    const url = new URL(req.url);
    const startdate = url.searchParams.get('startdate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const enddate = url.searchParams.get('enddate') || new Date().toISOString().split('T')[0];
    const granularity = url.searchParams.get('granularity') || 'daily';

    console.log(`[Analytics] Fetching data from ${startdate} to ${enddate} (${granularity})`);

    // Create service role client for analytics queries
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch raw data
    const { data: rawData, error: dataError } = await supabaseService
      .from('analytics_page_views')
      .select('*')
      .gte('created_at', `${startdate}T00:00:00Z`)
      .lte('created_at', `${enddate}T23:59:59Z`)
      .order('created_at', { ascending: true });

    if (dataError) {
      console.error('Error fetching analytics:', dataError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch analytics data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process data
    const dailyMap = new Map<string, { visitors: Set<string>, pageViews: number }>();
    const pageMap = new Map<string, { views: number, visitors: Set<string> }>();
    const deviceMap = new Map<string, number>();

    // --- Traffic source normalization (additive, does not affect existing counts) ---
    const hostOf = (ref: string): string => {
      try {
        return new URL(ref).hostname.toLowerCase();
      } catch {
        return ref.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
      }
    };

    const DEV_SOURCE = '__dev__';

    const normalizeSource = (ref: string | null): string => {
      if (!ref || !ref.trim()) return 'Directo';
      const h = hostOf(ref);
      if (!h) return 'Directo';
      if (/(^|\.)lovable\.dev$|(^|\.)lovableproject\.com$|(^|\.)lovable\.app$/.test(h)) return DEV_SOURCE;
      if (/(^|\.)facebook\.com$|(^|\.)fb\.me$/.test(h)) return 'Facebook';
      if (/(^|\.)instagram\.com$/.test(h)) return 'Instagram';
      if (/(^|\.)google\.[a-z.]+$/.test(h)) return 'Google';
      if (/(^|\.)bing\.com$/.test(h)) return 'Bing';
      if (/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/.test(h)) return 'LinkedIn';
      if (/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/.test(h)) return 'Twitter/X';
      if (/(^|\.)jibaroenlaluna\.com$/.test(h)) return 'Interno (navegación)';
      if (/(^|\.)duckduckgo\.com$/.test(h)) return 'DuckDuckGo';
      if (/(^|\.)yahoo\.[a-z.]+$/.test(h)) return 'Yahoo';
      return h;
    };

    type SourceAgg = { views: number; visitors: Set<string> };
    const sourceAll = new Map<string, SourceAgg>();
    const sourceBooks = new Map<string, SourceAgg>();
    let devPageViews = 0;
    let internalPageViews = 0;

    const bump = (map: Map<string, SourceAgg>, key: string, session: string) => {
      if (!map.has(key)) map.set(key, { views: 0, visitors: new Set() });
      const agg = map.get(key)!;
      agg.views += 1;
      agg.visitors.add(session);
    };

    rawData.forEach((row) => {
      const date = new Date(row.created_at).toISOString().split('T')[0];
      
      // Daily aggregation
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { visitors: new Set(), pageViews: 0 });
      }
      const dayData = dailyMap.get(date)!;
      dayData.visitors.add(row.session_id);
      dayData.pageViews += 1;

      // Page aggregation
      if (!pageMap.has(row.path)) {
        pageMap.set(row.path, { views: 0, visitors: new Set() });
      }
      const pageData = pageMap.get(row.path)!;
      pageData.views += 1;
      pageData.visitors.add(row.session_id);

      // Device aggregation
      const device = row.device_type || 'unknown';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

      // Source aggregation
      const source = normalizeSource(row.referrer);
      if (source === DEV_SOURCE) {
        devPageViews += 1;
      } else {
        if (source === 'Interno (navegación)') internalPageViews += 1;
        bump(sourceAll, source, row.session_id);
        if (typeof row.path === 'string' && row.path.startsWith('/libro')) {
          bump(sourceBooks, source, row.session_id);
        }
      }
    });

    // Format response
    const series = Array.from(dailyMap.entries()).map(([date, data]) => ({
      period: date,
      visits: data.visitors.size,
      pageviews: data.pageViews,
    }));

    const topPages = Array.from(pageMap.entries())
      .map(([page, data]) => ({
        page,
        views: data.views,
        visitors: data.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const devices = Array.from(deviceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const totalVisitors = new Set(rawData.map(r => r.session_id)).size;
    const totalPageViews = rawData.length;

    const toSourceList = (map: Map<string, SourceAgg>) =>
      Array.from(map.entries())
        .map(([source, agg]) => ({ source, views: agg.views, visitors: agg.visitors.size }))
        .sort((a, b) => b.views - a.views);

    console.log(`[Analytics] Returning: ${totalVisitors} visitors, ${totalPageViews} pageviews`);

    return new Response(
      JSON.stringify({
        series,
        topPages,
        devices,
        totalVisitors,
        totalPageViews,
        sources: toSourceList(sourceAll),
        sourcesBooks: toSourceList(sourceBooks),
        devPageViews,
        internalPageViews,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-internal-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
