import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML template for admin new order notification
const getAdminNewOrderHTML = (data: any) => {
  const { customerName, customerEmail, customerPhone, orderId, amount, items, orderDate, shippingAddress, billingAddress } = data;
  
  const itemsList = items?.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.product_name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px; vertical-align: middle;">` : ''}
        <strong>${item.product_name || 'Producto'}</strong><br>
        <small>Cantidad: ${item.quantity}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        $${((item.unit_price_cents || 0) / 100).toFixed(2)}
      </td>
    </tr>
  `).join('') || '';

  const formatAddress = (addr: any) => {
    if (!addr) return 'No proporcionada';
    return `
      ${addr.name || ''}<br>
      ${addr.line1 || ''}<br>
      ${addr.line2 ? `${addr.line2}<br>` : ''}
      ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}<br>
      ${addr.country || ''}
    `;
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Orden Recibida</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .alert { background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎉 Nueva Orden Recibida</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Orden #${orderId}</p>
        </div>
        <div class="content">
            <div class="info-box">
                <h2 style="margin-top: 0; color: #1f2937;">Información del Cliente</h2>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 150px;">Nombre:</td>
                        <td style="padding: 8px 0;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                        <td style="padding: 8px 0;">${customerEmail}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Teléfono:</td>
                        <td style="padding: 8px 0;">${customerPhone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Fecha:</td>
                        <td style="padding: 8px 0;">${orderDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #10b981;">Total:</td>
                        <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #10b981;">$${amount}</td>
                    </tr>
                </table>
            </div>

            <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Productos Ordenados</h2>
            <table class="products-table">
              ${itemsList}
            </table>

            <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">📦 Dirección de Envío</h3>
                <div style="line-height: 1.8;">
                    ${formatAddress(shippingAddress)}
                </div>
            </div>

            <div class="alert">
                <h4 style="margin-top: 0; color: #1976d2;">📋 Próximos Pasos</h4>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Preparar el libro autografiado personalizado</li>
                    <li>Entrar al panel de admin para actualizar el status</li>
                    <li>Marcar como "processing" mientras se prepara</li>
                    <li>Agregar número de tracking cuando se envíe</li>
                    <li>Marcar como "shipped" (se enviará email automático al cliente)</li>
                </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://cultura-convert.lovable.app/admin/orders" style="display: inline-block; background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Ver en Panel de Admin
                </a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Sistema de Órdenes - Jíbaro en la Luna</strong></p>
            <p style="margin-top: 10px;">
                Este es un email automático de notificación.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// HTML template for confirmation email
const getConfirmationEmailHTML = (token: string, supabaseUrl: string, redirectTo: string, tokenHash: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu cuenta - Jíbaro en la Luna</title>
    <style>
        body { font-family: Georgia, serif; background-color: #f5f5dc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .moon { font-size: 40px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Jíbaro en la Luna</div>
            <div class="subtitle">Editorial de Libros Puertorriqueños</div>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <div class="moon">🌙</div>
                <h2 style="color: #2d5a87;">¡Bienvenido a nuestra comunidad!</h2>
                <p>Hola y gracias por unirte a Jíbaro en la Luna. Para completar tu registro, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo.</p>
                
                <a href="${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=signup&redirect_to=${redirectTo}" class="button">
                    Confirmar mi cuenta
                </a>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                    <span style="word-break: break-all; color: #2d5a87;">${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=signup&redirect_to=${redirectTo}</span>
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                    Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Jíbaro en la Luna</strong><br>
            Llevando la literatura puertorriqueña a nuevas alturas</p>
            <p style="margin-top: 10px;">
                Este correo fue enviado porque solicitaste crear una cuenta en nuestro sitio web.
            </p>
        </div>
    </div>
</body>
</html>
`;

// HTML template for password recovery email
const getRecoveryEmailHTML = (token: string, supabaseUrl: string, redirectTo: string, tokenHash: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña - Jíbaro en la Luna</title>
    <style>
        body { font-family: Georgia, serif; background-color: #f5f5dc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .moon { font-size: 40px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Jíbaro en la Luna</div>
            <div class="subtitle">Editorial de Libros Puertorriqueños</div>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <div class="moon">🌙</div>
                <h2 style="color: #2d5a87;">Recuperar tu contraseña</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.</p>
                
                <a href="${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=recovery&redirect_to=${redirectTo}" class="button">
                    Restablecer contraseña
                </a>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                    <span style="word-break: break-all; color: #2d5a87;">${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=recovery&redirect_to=${redirectTo}</span>
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña no será cambiada.
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Jíbaro en la Luna</strong><br>
            Llevando la literatura puertorriqueña a nuevas alturas</p>
            <p style="margin-top: 10px;">
                Este correo fue enviado porque solicitaste restablecer tu contraseña.
            </p>
        </div>
    </div>
</body>
</html>
`;

// HTML template for order confirmation email
const getOrderConfirmationHTML = (data: any) => {
  const { customerName, orderId, amount, items, orderDate } = data;
  
  const itemsList = items?.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.product_name || 'Producto'}</strong><br>
        <small>Cantidad: ${item.quantity}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        $${((item.unit_price_cents || 0) / 100).toFixed(2)}
      </td>
    </tr>
  `).join('') || '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Compra - Jíbaro en la Luna</title>
    <style>
        body { font-family: Georgia, serif; background-color: #f5f5dc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .moon { font-size: 40px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #2d5a87, #1e3a5f); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .order-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Jíbaro en la Luna</div>
            <div class="subtitle">Editorial de Libros Puertorriqueños</div>
        </div>
        <div class="content">
            <div style="text-align: center;">
                <div class="moon">🌙</div>
                <h2 style="color: #2d5a87;">¡Gracias por tu compra!</h2>
                <p>¡Hola ${customerName}! Tu pedido ha sido confirmado y está siendo procesado.</p>
            </div>
            
            <div class="order-box">
                <h3 style="margin-top: 0; color: #2d5a87;">Detalles del Pedido</h3>
                <p><strong>Número de Orden:</strong> #${orderId}</p>
                <p><strong>Fecha:</strong> ${orderDate}</p>
                <p><strong>Total:</strong> $${amount}</p>
            </div>

            ${items && items.length > 0 ? `
            <h3 style="color: #2d5a87; border-bottom: 2px solid #2d5a87; padding-bottom: 10px;">Productos Comprados</h3>
            <table class="products-table">
              ${itemsList}
            </table>
            ` : ''}

            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #1976d2;">📦 ¿Qué sigue?</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Procesaremos tu pedido en 1-2 días hábiles</li>
                    <li>Te enviaremos un email con el tracking cuando sea enviado</li>
                    <li>Los productos personalizados pueden tomar 3-5 días adicionales</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://jibaroenlaluna.com" class="button">
                    Visitar Nuestra Tienda
                </a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Jíbaro en la Luna</strong><br>
            Llevando la literatura puertorriqueña a nuevas alturas</p>
            <p style="margin-top: 10px;">
                ¿Preguntas? Contáctanos respondiendo a este email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Auth email function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log('Received webhook payload');

    const data = JSON.parse(payload);

    // Check if this is an order confirmation request (direct call, not webhook)
    if (data.type === 'order_confirmation') {
      console.log('Processing order confirmation email');
      
      const { email, data: orderData } = data;
      const emailHtml = getOrderConfirmationHTML(orderData);
      
      const emailResponse = await resend.emails.send({
        from: 'Jíbaro en la Luna <noreply@resend.dev>',
        to: [email],
        subject: `🌙 ¡Gracias por tu compra! - Orden #${orderData.orderId}`,
        html: emailHtml,
      });

      console.log('Order confirmation email sent:', emailResponse);

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Check if this is an admin new order notification (direct call)
    if (data.type === 'admin_new_order') {
      console.log('Processing admin new order notification email');
      
      const { email, data: orderData } = data;
      const emailHtml = getAdminNewOrderHTML(orderData);
      
      const emailResponse = await resend.emails.send({
        from: 'Sistema de Órdenes <noreply@resend.dev>',
        to: [email],
        subject: `🎉 Nueva Orden - ${orderData.customerName} ($${orderData.amount})`,
        html: emailHtml,
      });

      console.log('Admin notification email sent:', emailResponse);

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Original webhook handling for auth emails
    // Verify webhook signature if secret is provided
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (error) {
        console.error('Webhook verification failed:', error);
        return new Response('Unauthorized', { 
          status: 401, 
          headers: corsHeaders 
        });
      }
    }

    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = data;

    console.log('Processing email for user:', user.email, 'Action:', email_action_type);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ifctpzrmqcpqtgwepvoq.supabase.co';
    const redirectUrl = redirect_to || site_url || 'https://cultura-convert.lovable.app';

    let emailHtml = '';
    let subject = '';

    switch (email_action_type) {
      case 'signup':
        emailHtml = getConfirmationEmailHTML(token, supabaseUrl, redirectUrl, token_hash);
        subject = '🌙 Confirma tu cuenta en Jíbaro en la Luna';
        break;
      case 'recovery':
        emailHtml = getRecoveryEmailHTML(token, supabaseUrl, redirectUrl, token_hash);
        subject = '🔑 Restablecer contraseña - Jíbaro en la Luna';
        break;
      default:
        console.log('Unhandled email action type:', email_action_type);
        return new Response('Email action type not supported', { 
          status: 400, 
          headers: corsHeaders 
        });
    }

    const emailResponse = await resend.emails.send({
      from: 'Jíbaro en la Luna <noreply@resend.dev>',
      to: [user.email],
      subject: subject,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send authentication email'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);