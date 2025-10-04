import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, status, trackingNumber, trackingUrl } = await req.json();

    // Validate admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Simple admin check - only allow jribot@gmail.com
    if (user.email !== 'jribot@gmail.com') {
      throw new Error('Unauthorized - Admin access required');
    }

    // Update order
    const updateData: any = { status };
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (trackingUrl) updateData.tracking_url = trackingUrl;

    const { data: order, error: updateError } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    // If status is "shipped" and we have tracking info, send email to customer
    if (status === 'shipped' && trackingNumber && order) {
      const trackingEmailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu pedido ha sido enviado</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10b981; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📦 ¡Tu pedido está en camino!</h1>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 20px;">
              <p>Hola ${order.customer_name},</p>
              <p>¡Buenas noticias! Tu pedido ha sido enviado y está en camino.</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Número de orden:</strong> ${order.id}</p>
                <p style="margin: 0 0 10px 0;"><strong>Número de tracking:</strong> ${trackingNumber}</p>
                ${trackingUrl ? `
                  <div style="margin-top: 20px;">
                    <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Rastrear mi pedido
                    </a>
                  </div>
                ` : ''}
              </div>
              
              <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
              
              <p style="margin-top: 30px;">¡Gracias por tu compra!<br>
              <strong>Juan C. Ribot Guzmán</strong></p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </body>
        </html>
      `;

      const { error: emailError } = await supabaseClient.functions.invoke(
        'send-auth-email',
        {
          body: {
            type: 'tracking_update',
            to: order.customer_email,
            subject: '📦 Tu pedido ha sido enviado',
            html: trackingEmailHTML
          }
        }
      );

      if (emailError) {
        console.error('Error sending tracking email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in update-order-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
