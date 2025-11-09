import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactInquiryRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { name, email, message }: ContactInquiryRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert inquiry into database
    const { error: dbError } = await supabaseClient
      .from("contact_inquiries")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save inquiry" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: "Jíbaro en la Luna <onboarding@resend.dev>",
      to: [email],
      subject: "Recibimos tu consulta - Jíbaro en la Luna Consulting",
      html: `
        <h1>¡Gracias por contactarnos, ${name}!</h1>
        <p>Hemos recibido tu consulta y te responderemos en breve.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p><strong>Tu mensaje:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>

        <p>Normalmente respondemos dentro de 24-48 horas hábiles.</p>
        
        <p>Saludos,<br><strong>Juan C. Ribot</strong><br>Jíbaro en la Luna Consulting</p>
      `,
    });

    // Send notification email to admin
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (adminEmail) {
      await resend.emails.send({
        from: "Jíbaro en la Luna <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Nueva consulta de ${name}`,
        html: `
          <h2>Nueva consulta de consulting</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">${message}</p>
        `,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry submitted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-contact-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
