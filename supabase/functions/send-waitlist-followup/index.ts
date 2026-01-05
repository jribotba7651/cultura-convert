import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Book metadata for follow-up emails
const bookMetadata: Record<string, { 
  relatedBook?: string; 
  insightEs: string; 
  insightEn: string;
  titleEs: string;
  titleEn: string;
}> = {
  'las-que-siempre-estuvieron': {
    relatedBook: 'raices-en-tierra-ajena',
    insightEs: 'Escribir esta novela me llevó a explorar cómo las tradiciones religiosas han tratado a las mujeres a lo largo de la historia. Descubrí que en casi todas las tradiciones, hubo mujeres poderosas cuyas historias fueron minimizadas o borradas. María Magdalena fue llamada "apóstol de apóstoles" en textos antiguos. Khadija fue la primera persona en creer en el mensaje de Mahoma. Estas voces merecían ser escuchadas.',
    insightEn: 'Writing this novel led me to explore how religious traditions have treated women throughout history. I discovered that in almost every tradition, there were powerful women whose stories were minimized or erased. Mary Magdalene was called "apostle of apostles" in ancient texts. Khadija was the first person to believe in Muhammad\'s message. These voices deserved to be heard.',
    titleEs: 'Las Que Siempre Estuvieron',
    titleEn: 'Las Que Siempre Estuvieron',
  },
  'raices-en-tierra-ajena': {
    relatedBook: 'nietos-en-la-diaspora',
    insightEs: 'La idea de esta novela surgió observando mi propio vecindario. Vi familias viviendo lado a lado durante años sin conocerse realmente. ¿Qué pasaría si el miedo y los prejuicios cedieran ante la curiosidad de los niños? Los niños no ven fronteras—ven amigos potenciales.',
    insightEn: 'The idea for this novel came from observing my own neighborhood. I saw families living side by side for years without really knowing each other. What would happen if fear and prejudice gave way to children\'s curiosity? Children don\'t see borders—they see potential friends.',
    titleEs: 'Raíces En Tierra Ajena',
    titleEn: 'Raíces En Tierra Ajena',
  },
  'nietos-en-la-diaspora': {
    relatedBook: 'jibara-en-la-luna-espanol',
    insightEs: 'Nuestros nietos nos hicieron preguntas que no sabíamos responder. ¿Por qué nos fuimos de Puerto Rico? ¿Por qué hablamos español? ¿Qué significa ser boricua cuando nunca has vivido en la isla? Este libro nació de esas conversaciones familiares.',
    insightEn: 'Our grandchildren asked us questions we didn\'t know how to answer. Why did we leave Puerto Rico? Why do we speak Spanish? What does it mean to be Boricua when you\'ve never lived on the island? This book was born from those family conversations.',
    titleEs: 'Nietos en la Diáspora',
    titleEn: 'Nietos en la Diáspora',
  },
  'jibara-en-la-luna-english': {
    relatedBook: 'sofia-marie-paloma',
    insightEs: 'Cuando llegué a Corporate America, pensé que tenía que cambiar quién era para tener éxito. Con los años descubrí que mi esencia—mi identidad como jíbara—era precisamente mi mayor fortaleza. Este libro es para todas las mujeres que sienten que deben esconderse para pertenecer.',
    insightEn: 'When I arrived in Corporate America, I thought I had to change who I was to succeed. Over the years I discovered that my essence—my identity as a jíbara—was precisely my greatest strength. This book is for all women who feel they must hide to belong.',
    titleEs: 'JÍBARA EN LA LUNA',
    titleEn: 'JÍBARA EN LA LUNA',
  },
  'jibara-en-la-luna-espanol': {
    relatedBook: 'sofia-marie-paloma',
    insightEs: 'Cuando llegué a Corporate America, pensé que tenía que cambiar quién era para tener éxito. Con los años descubrí que mi esencia—mi identidad como jíbara—era precisamente mi mayor fortaleza. Este libro es para todas las mujeres que sienten que deben esconderse para pertenecer.',
    insightEn: 'When I arrived in Corporate America, I thought I had to change who I was to succeed. Over the years I discovered that my essence—my identity as a jíbara—was precisely my greatest strength. This book is for all women who feel they must hide to belong.',
    titleEs: 'JÍBARA EN LA LUNA',
    titleEn: 'JÍBARA EN LA LUNA',
  },
  'las-aventuras-de-luna-y-avo': {
    relatedBook: 'sofia-marie-paloma',
    insightEs: 'Luna y Avo nacieron de las historias que contaba a mis nietos antes de dormir. Quería crear personajes que les enseñaran que la valentía no es no tener miedo—es actuar a pesar del miedo.',
    insightEn: 'Luna and Avo were born from the stories I told my grandchildren before bed. I wanted to create characters that would teach them that courage isn\'t about not being afraid—it\'s about acting despite the fear.',
    titleEs: 'Las Aventuras de Luna y Avo',
    titleEn: 'Las Aventuras de Luna y Avo',
  },
  'sofia-marie-paloma': {
    relatedBook: 'jibara-en-la-luna-english',
    insightEs: 'Sofía Marie representa a tantas jóvenes latinas que crecen entre dos culturas. Su madre representa el amor que se convierte en control cuando el miedo lo domina. Escribir esta historia me ayudó a entender las dinámicas familiares que muchos no nos atrevemos a nombrar.',
    insightEn: 'Sofía Marie represents so many young Latinas who grow up between two cultures. Her mother represents love that becomes control when fear takes over. Writing this story helped me understand the family dynamics that many of us don\'t dare to name.',
    titleEs: 'Sofía Marie, "Sofí Mary" o Paloma',
    titleEn: 'Sofía Marie, "Sofí Mary" or Paloma',
  },
  'cartas-de-newark': {
    relatedBook: 'nietos-en-la-diaspora',
    insightEs: 'Las cartas de Newark son fragmentos de mi propia historia. Cada carta captura un momento de añoranza, de adaptación, de esa sensación de no pertenecer completamente a ningún lugar pero pertenecer a todos.',
    insightEn: 'The letters from Newark are fragments of my own story. Each letter captures a moment of longing, adaptation, that feeling of not fully belonging anywhere but belonging everywhere.',
    titleEs: 'Cartas de Newark',
    titleEn: 'Cartas de Newark',
  },
};

const getFollowUpEmailHtml = (
  language: 'en' | 'es', 
  bookSlug: string,
  relatedBookSlug?: string
) => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://ifctpzrmqcpqtgwepvoq.supabase.co';
  const meta = bookMetadata[bookSlug] || {
    insightEs: 'Escribir este libro fue un viaje de descubrimiento personal.',
    insightEn: 'Writing this book was a journey of personal discovery.',
    titleEs: 'el libro',
    titleEn: 'the book',
  };
  
  const bookUrl = `${baseUrl}/libro/${bookSlug}`;
  const relatedUrl = relatedBookSlug ? `${baseUrl}/libro/${relatedBookSlug}` : null;
  const relatedMeta = relatedBookSlug ? bookMetadata[relatedBookSlug] : null;
  
  if (language === 'es') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; margin-bottom: 24px;">Una historia detrás de ${meta.titleEs}</h1>
        
        <p style="font-style: italic; background: #f9f9f9; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
          "${meta.insightEs}"
        </p>
        
        <p>
          <a href="${bookUrl}" style="color: #2563eb;">Volver a la página del libro →</a>
        </p>
        
        ${relatedUrl && relatedMeta ? `
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
        
        <h2 style="color: #1a1a1a; font-size: 18px;">También te puede interesar:</h2>
        
        <p><strong>${relatedMeta.titleEs}</strong></p>
        
        <p>
          <a href="${relatedUrl}" style="display: inline-block; background: #f5f5f5; color: #333; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Ver libro →</a>
        </p>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
        
        <p style="color: #666; font-size: 14px;">
          Con cariño,<br>
          Juan C. Ribot Guzmán & Rosnelma García Amalbert
        </p>
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
      <h1 style="color: #1a1a1a; margin-bottom: 24px;">A story behind ${meta.titleEn}</h1>
      
      <p style="font-style: italic; background: #f9f9f9; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
        "${meta.insightEn}"
      </p>
      
      <p>
        <a href="${bookUrl}" style="color: #2563eb;">Back to book page →</a>
      </p>
      
      ${relatedUrl && relatedMeta ? `
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      
      <h2 style="color: #1a1a1a; font-size: 18px;">You might also like:</h2>
      
      <p><strong>${relatedMeta.titleEn}</strong></p>
      
      <p>
        <a href="${relatedUrl}" style="display: inline-block; background: #f5f5f5; color: #333; padding: 12px 24px; border-radius: 6px; text-decoration: none;">View book →</a>
      </p>
      ` : ''}
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      
      <p style="color: #666; font-size: 14px;">
        With love,<br>
        Juan C. Ribot Guzmán & Rosnelma García Amalbert
      </p>
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

    // Get pending follow-up emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select(`
        id,
        waitlist_id,
        book_waitlist (
          email,
          language,
          book_slug
        )
      `)
      .eq('email_type', 'followup')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      throw fetchError;
    }

    console.log(`Processing ${pendingEmails?.length || 0} follow-up emails`);

    let sent = 0;
    let failed = 0;

    for (const emailRecord of pendingEmails || []) {
      const waitlist = emailRecord.book_waitlist as any;
      if (!waitlist) continue;

      const meta = bookMetadata[waitlist.book_slug];
      const relatedBook = meta?.relatedBook;

      try {
        const emailHtml = getFollowUpEmailHtml(
          waitlist.language,
          waitlist.book_slug,
          relatedBook
        );

        const subject = waitlist.language === 'es'
          ? `Una historia detrás de ${meta?.titleEs || 'tu libro'}`
          : `A story behind ${meta?.titleEn || 'your book'}`;

        await resend.emails.send({
          from: 'Libros <onboarding@resend.dev>',
          to: [waitlist.email],
          subject,
          html: emailHtml,
        });

        await supabase
          .from('email_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', emailRecord.id);

        sent++;
        console.log(`Follow-up email sent to ${waitlist.email}`);

      } catch (emailError: any) {
        console.error(`Error sending to ${waitlist.email}:`, emailError);
        
        await supabase
          .from('email_queue')
          .update({ status: 'failed', error_message: emailError.message })
          .eq('id', emailRecord.id);

        failed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: pendingEmails?.length || 0,
        sent,
        failed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-waitlist-followup:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
