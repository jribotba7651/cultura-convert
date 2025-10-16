import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('[Sales Analytics] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('[Sales Analytics] User is not admin:', user.email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Sales Analytics] Admin access granted for user:', user.email);

    // Get request parameters
    const { startdate, enddate, granularity } = await req.json();

    console.log(`[Sales Analytics] Fetching sales data from ${startdate} to ${enddate} (${granularity})`);

    // Fetch all orders in the date range
    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        status,
        total_amount_cents,
        created_at
      `)
      .gte('created_at', startdate)
      .lte('created_at', enddate)
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('[Sales Analytics] Error fetching orders:', ordersError);
      throw ordersError;
    }

    // Fetch order items with product details for top products
    const { data: orderItems, error: itemsError } = await supabaseClient
      .from('order_items')
      .select(`
        order_id,
        product_id,
        quantity,
        total_price_cents,
        products (
          id,
          title
        )
      `)
      .in('order_id', orders?.map(o => o.id) || []);

    if (itemsError) {
      console.error('[Sales Analytics] Error fetching order items:', itemsError);
    }

    // Calculate metrics
    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter(o => o.status === 'paid') || [];
    const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
    const failedOrders = orders?.filter(o => o.status === 'failed') || [];
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled') || [];

    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total_amount_cents || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

    // Group by date for time series
    const seriesMap = new Map();
    
    orders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!seriesMap.has(date)) {
        seriesMap.set(date, {
          period: date,
          orders: 0,
          revenue: 0,
          paidOrders: 0,
          pendingOrders: 0,
        });
      }
      
      const entry = seriesMap.get(date);
      entry.orders++;
      
      if (order.status === 'paid') {
        entry.paidOrders++;
        entry.revenue += order.total_amount_cents || 0;
      } else if (order.status === 'pending') {
        entry.pendingOrders++;
      }
    });

    const series = Array.from(seriesMap.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    // Calculate top products
    const productMap = new Map();
    
    orderItems?.forEach((item: any) => {
      if (!item.products || !item.product_id) return;
      
      const productTitle = typeof item.products.title === 'object' 
        ? (item.products.title.es || item.products.title.en || 'Sin título')
        : (item.products.title || 'Sin título');
      
      if (!productMap.has(item.product_id)) {
        productMap.set(item.product_id, {
          product: productTitle,
          quantity: 0,
          revenue: 0,
        });
      }
      
      const product = productMap.get(item.product_id);
      product.quantity += item.quantity || 0;
      product.revenue += item.total_price_cents || 0;
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Order status distribution
    const orderStatusData = [
      { name: 'Pagadas', value: paidOrders.length, color: '#10b981' },
      { name: 'Pendientes', value: pendingOrders.length, color: '#f59e0b' },
      { name: 'Fallidas', value: failedOrders.length, color: '#ef4444' },
      { name: 'Canceladas', value: cancelledOrders.length, color: '#6b7280' },
    ].filter(item => item.value > 0);

    const result = {
      series,
      totalOrders,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      failedOrders: failedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      avgOrderValue,
      conversionRate,
      topProducts,
      orderStatusData,
    };

    console.log(`[Sales Analytics] Returning: ${totalOrders} orders, $${(totalRevenue / 100).toFixed(2)} revenue`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Sales Analytics] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
