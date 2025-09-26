import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  csrfToken?: string;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS = 3; // Max submissions per window
const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked?: boolean }>();

// Simple rate limiter
function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  // Reset if window has passed
  if (now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  // Check if blocked
  if (record.blocked && now < record.resetTime) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  // Increment counter
  record.count++;
  
  // Block if over limit
  if (record.count > MAX_SUBMISSIONS) {
    record.blocked = true;
    record.resetTime = now + (60 * 60 * 1000); // Block for 1 hour
    return { allowed: false, resetTime: record.resetTime };
  }
  
  return { allowed: true };
}

// Validate and sanitize input
function validateContactForm(data: ContactFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  } else if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]+$/.test(data.name)) {
    errors.push('Name contains invalid characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  } else if (data.email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }
  
  // Subject validation
  if (!data.subject || data.subject.trim().length < 5) {
    errors.push('Subject must be at least 5 characters');
  } else if (data.subject.length > 200) {
    errors.push('Subject must be less than 200 characters');
  }
  
  // Message validation
  if (!data.message || data.message.trim().length < 20) {
    errors.push('Message must be at least 20 characters');
  } else if (data.message.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }
  
  // Check for suspicious content
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /<iframe[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi
  ];
  
  const allText = `${data.name} ${data.email} ${data.subject} ${data.message}`;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(allText)) {
      errors.push('Suspicious content detected');
      break;
    }
  }
  
  // Check for multiple URLs (spam indicator)
  const urlCount = (data.message.match(/https?:\/\/|www\./gi) || []).length;
  if (urlCount > 2) {
    errors.push('Too many links in message');
  }
  
  return { valid: errors.length === 0, errors };
}

// Sanitize text input
function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[<>'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return char;
      }
    });
}

// Get client IP for rate limiting
function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60) : 60;
      return new Response(
        JSON.stringify({ 
          error: `Too many submissions. Try again in ${resetTime} minutes.`,
          rateLimited: true
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const formData: ContactFormData = await req.json();
    
    // Validate form data
    const validation = validateContactForm(formData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.errors.join(', ') }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeText(formData.name),
      email: formData.email.toLowerCase().trim(),
      subject: sanitizeText(formData.subject),
      message: sanitizeText(formData.message)
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the contact attempt (for monitoring)
    console.log('Contact form submission from:', {
      ip: clientIP,
      email: sanitizedData.email.replace(/(.{2}).*@/, '$1***@'), // Mask email
      timestamp: new Date().toISOString()
    });

    // Send email using Resend (calling existing function)
    const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: sanitizedData
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send message. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);