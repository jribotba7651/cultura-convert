import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultingLeadRequest {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize?: string;
  industry?: string;
  mainChallenge?: string;
  resourceDownloaded?: string;
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

    const {
      name,
      email,
      company,
      role,
      companySize,
      industry,
      mainChallenge,
      resourceDownloaded,
    }: ConsultingLeadRequest = await req.json();

    // Validate required fields
    if (!name || !email || !company || !role) {
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

    // Insert lead into database
    const { data: lead, error: dbError } = await supabaseClient
      .from("consulting_leads")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        role,
        company_size: companySize,
        industry,
        main_challenge: mainChallenge,
        resource_downloaded: resourceDownloaded,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead information" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email with download link
    const downloadResource = resourceDownloaded || "Purchasing Controls Guide";
    
    const emailResponse = await resend.emails.send({
      from: "Jíbaro en la Luna <onboarding@resend.dev>",
      to: [email],
      subject: `Tu recurso: ${downloadResource}`,
      html: `
        <h1>¡Gracias por tu interés, ${name}!</h1>
        <p>Aquí está tu acceso al recurso: <strong>${downloadResource}</strong></p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6;">
          <h2 style="margin-top: 0;">📥 Descarga tu recurso</h2>
          <p><a href="https://jibaroenlaluna.com/resources/${resourceDownloaded?.toLowerCase().replace(/\s+/g, '-')}.pdf" 
                style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Descargar ahora
          </a></p>
        </div>

        <h3>Lo que incluye:</h3>
        <ul>
          <li>✓ 40+ páginas de experiencia práctica</li>
          <li>✓ Templates de evaluación de proveedores</li>
          <li>✓ Guías de configuración SAP</li>
          <li>✓ Checklists de compliance</li>
        </ul>

        <p style="margin-top: 30px;">En los próximos días recibirás:</p>
        <ul>
          <li>📧 Tips exclusivos sobre implementación</li>
          <li>📊 Casos de estudio reales</li>
          <li>💡 Invitación a consulta gratuita de 30 minutos</li>
        </ul>

        <p style="margin-top: 30px;">¿Tienes preguntas? Responde directamente a este email.</p>
        
        <p>Saludos,<br><strong>Juan C. Ribot</strong><br>Jíbaro en la Luna Consulting</p>
      `,
    });

    console.log("Lead saved and email sent:", { leadId: lead.id, emailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: "Resource access sent to your email" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-consulting-lead function:", error);
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
