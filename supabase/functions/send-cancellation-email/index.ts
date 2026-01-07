import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailData {
  order_id: string;
  order_short_id: string;
  customer_email: string;
  customer_name: string;
  total_amount_cents: number;
  currency: string;
  refund_applied: boolean;
  stripe_refund_id?: string;
  cancel_reason?: string;
}

const formatAmount = (cents: number, currency: string): string => {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

const getEmailFooter = (): string => {
  const siteUrl = "https://escritorespuertorricodiaspora.com";
  const privacyUrl = `${siteUrl}/privacy-policy`;
  const contactEmail = "contact@escritorespuertorricodiaspora.com";

  return `
    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 0;">
          <p style="color: #999; font-size: 12px; margin: 16px 0 8px 0;">
            <strong>Escritores Puerto Rico Diáspora</strong><br>
            <a href="mailto:${contactEmail}" style="color: #999; text-decoration: none;">${contactEmail}</a>
          </p>
          <p style="color: #999; font-size: 11px; margin: 16px 0 0 0;">
            <a href="${privacyUrl}" style="color: #999; text-decoration: underline;">Privacy Policy / Política de privacidad</a>
          </p>
        </td>
      </tr>
    </table>
  `;
};

const getCancellationEmailHtml = (data: CancellationEmailData): string => {
  const formattedTotal = formatAmount(data.total_amount_cents, data.currency);
  
  const refundSection = data.refund_applied
    ? `
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="color: #059669; margin: 0 0 8px 0; font-size: 16px;">✓ Refund Initiated / Reembolso Iniciado</h3>
        <p style="color: #065f46; margin: 0; font-size: 14px;">
          <strong>EN:</strong> A full refund of ${formattedTotal} has been initiated. Please allow 5-10 business days for the refund to appear on your original payment method.<br><br>
          <strong>ES:</strong> Se ha iniciado un reembolso completo de ${formattedTotal}. Por favor espere de 5 a 10 días hábiles para que el reembolso aparezca en su método de pago original.
        </p>
        ${data.stripe_refund_id ? `<p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">Refund ID: ${data.stripe_refund_id}</p>` : ""}
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 20px;">
          Order Cancelled / Orden Cancelada
        </h1>
      </div>
      
      <p style="font-size: 16px;">
        <strong>EN:</strong> Hello ${data.customer_name}, your order has been cancelled.<br><br>
        <strong>ES:</strong> Hola ${data.customer_name}, tu orden ha sido cancelada.
      </p>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order ID / ID de Orden:</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 14px; text-align: right;">#${data.order_short_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total:</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 14px; text-align: right;">${formattedTotal}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status / Estado:</td>
            <td style="padding: 8px 0; font-size: 14px; text-align: right;">
              <span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                Cancelled / Cancelada
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      ${refundSection}
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>EN:</strong> If you have any questions about this cancellation, please contact us.<br><br>
        <strong>ES:</strong> Si tienes alguna pregunta sobre esta cancelación, por favor contáctanos.
      </p>
      
      ${getEmailFooter()}
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending cancellation emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("id, email_type, error_message")
      .in("email_type", ["order_cancelled", "order_refunded"])
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error("[send-cancellation-email] Error fetching pending emails:", fetchError);
      throw fetchError;
    }

    console.log(`[send-cancellation-email] Processing ${pendingEmails?.length || 0} cancellation emails`);

    let sent = 0;
    let failed = 0;

    for (const emailRecord of pendingEmails || []) {
      try {
        // Parse email metadata from error_message field (temporary storage)
        const emailData: CancellationEmailData = JSON.parse(emailRecord.error_message || "{}");

        if (!emailData.customer_email || !emailData.order_id) {
          console.error(`[send-cancellation-email] Invalid email data for record ${emailRecord.id}`);
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: "Invalid email data",
              sent_at: new Date().toISOString(),
            })
            .eq("id", emailRecord.id);
          failed++;
          continue;
        }

        const emailHtml = getCancellationEmailHtml(emailData);
        
        const subject = emailData.refund_applied
          ? `Order #${emailData.order_short_id} Cancelled & Refunded / Orden Cancelada y Reembolsada`
          : `Order #${emailData.order_short_id} Cancelled / Orden Cancelada`;

        console.log(`[send-cancellation-email] Sending to ${emailData.customer_email}`);

        const emailResponse = await resend.emails.send({
          from: "Orders <onboarding@resend.dev>",
          to: [emailData.customer_email],
          subject,
          html: emailHtml,
        });

        console.log(`[send-cancellation-email] Email sent:`, emailResponse);

        // Update status to sent and clear the metadata from error_message
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", emailRecord.id);

        sent++;

      } catch (emailError: any) {
        console.error(`[send-cancellation-email] Error sending email for record ${emailRecord.id}:`, emailError);

        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: emailError.message || "Unknown error",
            sent_at: new Date().toISOString(),
          })
          .eq("id", emailRecord.id);

        failed++;
      }
    }

    console.log(`[send-cancellation-email] Complete: sent=${sent}, failed=${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingEmails?.length || 0,
        sent,
        failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[send-cancellation-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
