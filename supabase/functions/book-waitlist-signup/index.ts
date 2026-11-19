import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistSignupRequest {
  email: string;
  language: 'en' | 'es';
  bookSlug: string;
  sourceComponent: 'hero' | 'featured' | 'grid' | 'author' | 'product' | 'sample';
  bookTitle: string;
}

// HMAC-signed unsubscribe token so only the real recipient's link can unsubscribe them.
const unsubTokens = new Map<string, string>();
const prepareUnsubToken = async (email: string): Promise<string> => {
  const normalized = email.toLowerCase().trim();
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`unsubscribe:${normalized}`));
  const token = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  unsubTokens.set(email, token);
  return token;
};

const getEmailFooter = (language: 'en' | 'es', email: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ifctpzrmqcpqtgwepvoq.supabase.co';
  const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-email?email=${encodeURIComponent(email)}&token=${unsubTokens.get(email) ?? ''}`;
  const siteUrl = 'https://escritorespuertorricodiaspora.com';
  const privacyUrl = `${siteUrl}/privacy-policy`;
  const contactEmail = 'contact@escritorespuertorricodiaspora.com';

  if (language === 'es') {
    return `
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0;">
            <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">
              Con cariño,<br>
              Juan C. Ribot Guzmán & Rosnelma García Amalbert
            </p>
            <p style="color: #999; font-size: 12px; margin: 16px 0 8px 0;">
              <strong>Escritores Puerto Rico Diáspora</strong><br>
              <a href="mailto:${contactEmail}" style="color: #999; text-decoration: none;">${contactEmail}</a>
            </p>
            <p style="color: #999; font-size: 11px; margin: 16px 0 0 0;">
              <a href="${privacyUrl}" style="color: #999; text-decoration: underline;">Política de privacidad</a>
              &nbsp;•&nbsp;
              <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Cancelar suscripción</a>
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 0;">
          <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">
            With love,<br>
            Juan C. Ribot Guzmán & Rosnelma García Amalbert
          </p>
          <p style="color: #999; font-size: 12px; margin: 16px 0 8px 0;">
            <strong>Escritores Puerto Rico Diáspora</strong><br>
            <a href="mailto:${contactEmail}" style="color: #999; text-decoration: none;">${contactEmail}</a>
          </p>
          <p style="color: #999; font-size: 11px; margin: 16px 0 0 0;">
            <a href="${privacyUrl}" style="color: #999; text-decoration: underline;">Privacy Policy</a>
            &nbsp;•&nbsp;
            <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  `;
};

const getWelcomeEmailHtml = (language: 'en' | 'es', bookTitle: string, bookSlug: string, sampleToken: string, email: string) => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://escritorespuertorricodiaspora.com';
  const bookUrl = `${baseUrl}/libro/${bookSlug}`;
  const sampleUrl = `${baseUrl}/libro/${bookSlug}?sample=${sampleToken}`;
  
  if (language === 'es') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; margin-bottom: 24px;">¡Gracias por unirte a la lista!</h1>
        
        <p>Has confirmado tu interés en <strong>${bookTitle}</strong>.</p>
        
        <p>Serás de las primeras personas en saber cuando la compra directa esté disponible.</p>
        
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px 0; font-weight: bold;">🎁 Tu regalo:</p>
          <a href="${sampleUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Descargar capítulo de muestra</a>
        </div>
        
        <p>
          <a href="${bookUrl}" style="color: #2563eb;">Ver página del libro →</a>
        </p>
        
        ${getEmailFooter('es', email)}
      </body>
      </html>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a1a1a; margin-bottom: 24px;">Thanks for joining the list!</h1>
      
      <p>You've confirmed your interest in <strong>${bookTitle}</strong>.</p>
      
      <p>You'll be among the first to know when direct checkout is available.</p>
      
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 12px 0; font-weight: bold;">🎁 Your gift:</p>
        <a href="${sampleUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Download sample chapter</a>
      </div>
      
      <p>
        <a href="${bookUrl}" style="color: #2563eb;">View book page →</a>
      </p>
      
      ${getEmailFooter('en', email)}
    </body>
    </html>
  `;
};

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
    const { email, language, bookSlug, sourceComponent, bookTitle: rawBookTitle }: WaitlistSignupRequest = await req.json();
    const bookTitle = String(rawBookTitle ?? '').slice(0, 200)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/[\r\n]/g, ' ');

    console.log('Book waitlist signup:', { email, language, bookSlug, sourceComponent });

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(
        JSON.stringify({ error: language === 'es' ? 'Email inválido' : 'Invalid email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing signup (duplicate check)
    const { data: existing } = await supabase
      .from('book_waitlist')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('book_slug', bookSlug)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: language === 'es' 
            ? 'Ya estás en la lista para este libro' 
            : "You're already on the list for this book",
          alreadySubscribed: true
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert waitlist entry
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('book_waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        language,
        book_slug: bookSlug,
        source_component: sourceComponent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      throw insertError;
    }

    // Create sample download entry
    const { data: sampleEntry, error: sampleError } = await supabase
      .from('sample_downloads')
      .insert({
        email: email.toLowerCase().trim(),
        book_slug: bookSlug,
        language,
      })
      .select('download_token')
      .single();

    if (sampleError) {
      console.error('Error creating sample download:', sampleError);
    }

    const sampleToken = sampleEntry?.download_token || '';

    // Schedule welcome email (immediate)
    const { error: emailQueueError } = await supabase
      .from('email_queue')
      .insert({
        waitlist_id: waitlistEntry.id,
        email_type: 'welcome',
        scheduled_for: new Date().toISOString(),
      });

    if (emailQueueError) {
      console.error('Error scheduling welcome email:', emailQueueError);
    }

    // Schedule follow-up email (48 hours later)
    const followUpDate = new Date();
    followUpDate.setHours(followUpDate.getHours() + 48);
    
    const { error: followUpQueueError } = await supabase
      .from('email_queue')
      .insert({
        waitlist_id: waitlistEntry.id,
        email_type: 'followup',
        scheduled_for: followUpDate.toISOString(),
      });

    if (followUpQueueError) {
      console.error('Error scheduling follow-up email:', followUpQueueError);
    }

    // Send welcome email immediately
    try {
      await prepareUnsubToken(email);
      const emailHtml = getWelcomeEmailHtml(language, bookTitle, bookSlug, sampleToken, email);
      
      const emailResponse = await resend.emails.send({
        from: 'Libros <onboarding@resend.dev>',
        to: [email],
        subject: language === 'es' 
          ? `¡Bienvenido! Tu muestra de "${bookTitle}" está lista`
          : `Welcome! Your sample of "${bookTitle}" is ready`,
        html: emailHtml,
      });

      console.log('Welcome email sent:', emailResponse);

      // Update email queue status
      await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('waitlist_id', waitlistEntry.id)
        .eq('email_type', 'welcome');

    } catch (emailError: any) {
      console.error('Error sending welcome email:', emailError);
      
      await supabase
        .from('email_queue')
        .update({ status: 'failed', error_message: emailError.message })
        .eq('waitlist_id', waitlistEntry.id)
        .eq('email_type', 'welcome');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sampleToken,
        message: language === 'es' 
          ? '¡Te has unido a la lista!' 
          : 'You joined the list!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in book-waitlist-signup:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
