import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterSubscriptionRequest {
  name: string;
  email: string;
  interests: string[];
  language: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    const { name, email, interests, language }: NewsletterSubscriptionRequest = await req.json();

    console.log('Newsletter subscription request:', { email, name, interests, language });

    // Validate input
    if (!name || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Name must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!interests || interests.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one interest must be selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('email', email)
      .maybeSingle();

    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return new Response(
          JSON.stringify({ error: 'Email already subscribed' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({
            name: name.trim(),
            interests,
            language,
            is_active: true,
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          throw updateError;
        }

        console.log('Subscription reactivated:', email);
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          interests,
          language,
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        throw insertError;
      }

      console.log('New subscription created:', email);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to newsletter'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in subscribe-newsletter function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
