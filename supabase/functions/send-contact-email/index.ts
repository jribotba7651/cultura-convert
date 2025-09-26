import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log('Sending contact email:', { name, email, subject });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Todos los campos son requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to the business
    const emailResponse = await resend.emails.send({
      from: "Jíbaro en la Luna <onboarding@resend.dev>",
      to: ["jribot@jibaroenlaluna.com"],
      subject: `Contacto: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
            Nuevo mensaje de contacto
          </h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Información del contacto</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Mensaje</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
              <strong>📧 Responder:</strong> Puedes responder directamente a este email para contactar a ${name}
            </p>
          </div>
          
          <footer style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>Este mensaje fue enviado desde el formulario de contacto de jibaroenlaluna.com</p>
          </footer>
        </div>
      `,
      reply_to: email, // This allows replying directly to the sender
    });

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "Jíbaro en la Luna <onboarding@resend.dev>",
      to: [email],
      subject: "Gracias por contactarnos - Jíbaro en la Luna",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
            ¡Gracias por contactarnos!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hola <strong>${name}</strong>,
          </p>
          
          <p style="line-height: 1.6; color: #333;">
            Hemos recibido tu mensaje y te responderemos lo antes posible. 
            Aquí tienes una copia de lo que nos enviaste:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p style="line-height: 1.6; color: #333;">
            Si tienes alguna pregunta urgente, también puedes contactarnos directamente en 
            <a href="mailto:jribot@jibaroenlaluna.com" style="color: #e74c3c;">jribot@jibaroenlaluna.com</a>
          </p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>¡Gracias por ser parte de nuestra comunidad literaria!</strong>
            </p>
          </div>
          
          <footer style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>
              Saludos cordiales,<br>
              <strong>El equipo de Jíbaro en la Luna</strong><br>
              <a href="https://jibaroenlaluna.com" style="color: #e74c3c;">jibaroenlaluna.com</a>
            </p>
          </footer>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);
    console.log("Confirmation email sent successfully:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado correctamente",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al enviar el email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);