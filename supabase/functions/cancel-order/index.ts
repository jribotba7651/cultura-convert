import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelOrderRequest {
  order_id: string;
  refund: boolean;
  reason?: string;
}

interface CancelOrderResponse {
  ok: boolean;
  order_id: string;
  status: string;
  refund_applied: boolean;
  stripe_refund_id?: string;
  printify_cancel_skipped?: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // 1) Require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[cancel-order] Missing Authorization header");
      return new Response(
        JSON.stringify({ ok: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Create user-context client to verify the caller
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error("[cancel-order] Authentication failed:", userError);
      return new Response(
        JSON.stringify({ ok: false, error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cancel-order] Authenticated user: ${user.email}`);

    // 3) Check admin role using user_roles table
    const { data: adminRole, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("[cancel-order] Error checking admin role:", roleError);
      return new Response(
        JSON.stringify({ ok: false, error: "Error checking permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminRole) {
      console.warn(`[cancel-order] User ${user.email} is not an admin`);
      return new Response(
        JSON.stringify({ ok: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cancel-order] Admin access verified for ${user.email}`);

    // 4) Parse request body (after auth checks)
    const { order_id, refund, reason }: CancelOrderRequest = await req.json();
    
    console.log(`[cancel-order] Processing cancellation for order: ${order_id}, refund: ${refund}, reason: ${reason || 'none'}`);

    if (!order_id) {
      console.error("[cancel-order] Missing order_id");
      return new Response(
        JSON.stringify({ ok: false, error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5) Use service role client for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1) Fetch order by id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error(`[cancel-order] Order not found: ${order_id}`, orderError);
      return new Response(
        JSON.stringify({ ok: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cancel-order] Found order: ${order.id}, status: ${order.status}`);

    // 2) Check if order can be cancelled
    const nonCancellableStatuses = ["shipped", "delivered"];
    if (nonCancellableStatuses.includes(order.status)) {
      console.warn(`[cancel-order] Cannot cancel order with status: ${order.status}`);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Order cannot be cancelled after shipment." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already cancelled
    if (order.status === "cancelled") {
      console.warn(`[cancel-order] Order already cancelled: ${order_id}`);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Order is already cancelled." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Check for Printify items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        products!inner (
          id,
          printify_product_id
        )
      `)
      .eq("order_id", order_id);

    if (itemsError) {
      console.error(`[cancel-order] Error fetching order items:`, itemsError);
    }

    const hasPrintifyItems = orderItems?.some(
      (item: any) => item.products?.printify_product_id != null
    ) || false;

    console.log(`[cancel-order] Has Printify items: ${hasPrintifyItems}`);

    // 4) Update order status to cancelled
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        // Note: If a cancel_reason column exists in the future, store reason here
        // cancel_reason: reason || null,
      })
      .eq("id", order_id);

    if (updateError) {
      console.error(`[cancel-order] Failed to update order:`, updateError);
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to update order status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cancel-order] Order status updated to cancelled`);

    // Build response
    const response: CancelOrderResponse = {
      ok: true,
      order_id,
      status: "cancelled",
      refund_applied: false,
    };

    // Add Printify flag if applicable
    if (hasPrintifyItems) {
      response.printify_cancel_skipped = true;
      console.log(`[cancel-order] Printify cancellation skipped (manual action required)`);
    }

    // 5) Process refund if requested
    let refundId: string | undefined;
    if (refund) {
      console.log(`[cancel-order] Processing refund...`);

      if (!order.stripe_payment_intent_id) {
        console.error(`[cancel-order] No stripe_payment_intent_id for refund`);
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: "Cannot refund: No Stripe payment intent found for this order." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeSecretKey) {
        console.error(`[cancel-order] STRIPE_SECRET_KEY not configured`);
        return new Response(
          JSON.stringify({ ok: false, error: "Stripe not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });

      try {
        // Create full refund for the PaymentIntent
        const stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent_id,
          reason: "requested_by_customer",
        });

        console.log(`[cancel-order] Stripe refund created: ${stripeRefund.id}, status: ${stripeRefund.status}`);

        response.refund_applied = true;
        response.stripe_refund_id = stripeRefund.id;
        refundId = stripeRefund.id;

        // Optionally update order with refund info in notes
        await supabase
          .from("orders")
          .update({
            notes: order.notes 
              ? `${order.notes}\n[Refund] ${stripeRefund.id} - ${new Date().toISOString()}`
              : `[Refund] ${stripeRefund.id} - ${new Date().toISOString()}`,
          })
          .eq("id", order_id);

      } catch (stripeError: any) {
        console.error(`[cancel-order] Stripe refund failed:`, stripeError);
        
        // Order is already cancelled, but refund failed
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: `Order cancelled but refund failed: ${stripeError.message}`,
            order_id,
            status: "cancelled",
            refund_applied: false,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 6) Enqueue cancellation email
    try {
      const emailType = response.refund_applied ? "order_refunded" : "order_cancelled";
      
      // Store email data as JSON metadata
      const emailMetadata = {
        order_id: order.id,
        order_short_id: order.id.substring(0, 8).toUpperCase(),
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        total_amount_cents: order.total_amount_cents,
        currency: order.currency || "USD",
        refund_applied: response.refund_applied,
        stripe_refund_id: refundId,
        cancel_reason: reason,
      };

      const { error: emailQueueError } = await supabase
        .from("email_queue")
        .insert({
          email_type: emailType,
          scheduled_for: new Date().toISOString(), // Send immediately
          status: "pending",
          // Store metadata in error_message temporarily (we'll use a proper column later)
          // For now, we encode it - the email sending function will decode it
          error_message: JSON.stringify(emailMetadata),
        });

      if (emailQueueError) {
        console.error(`[cancel-order] Failed to enqueue email:`, emailQueueError);
        // Don't fail the request, just log the error
      } else {
        console.log(`[cancel-order] Enqueued ${emailType} email for ${order.customer_email}`);
      }
    } catch (emailError) {
      console.error(`[cancel-order] Error enqueueing email:`, emailError);
      // Don't fail the main request
    }

    console.log(`[cancel-order] Completed successfully:`, response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`[cancel-order] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});