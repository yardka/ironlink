const nodemailer = require('nodemailer');

const ALLOWED_ORIGINS = [
  'https://ironlink.mx',
  'https://ironlink.netlify.app',
  'https://ironlink-216.netlify.app',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:8888'
];

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function getClientIP(event) {
  return event.headers['x-nf-client-connection-ip']
    || event.headers['x-forwarded-for']
    || event.headers['client-ip']
    || '0.0.0.0';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return phone === '' || /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

function validateTime(time) {
  if (!time) return false;
  const [h, m] = time.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function validateDate(date) {
  if (!date) return false;
  const d = new Date(date + 'T12:00:00Z');
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const clientIP = getClientIP(event);

  // Honeypot
  if (body.website && body.website !== '') {
    console.warn(`[SPAM] Honeypot triggered from IP ${clientIP}`);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  }

  // reCAPTCHA verification
  const recaptchaToken = body.recaptcha_token;
  if (!recaptchaToken) {
    console.warn(`[SECURITY] Missing reCAPTCHA token from IP ${clientIP}`);
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
    };
  }

  const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
  let recaptchaValid = false;
  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: recaptchaToken,
      remoteip: clientIP
    });
    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const verifyData = await verifyResp.json();
    recaptchaValid = verifyData.success && (typeof verifyData.score !== 'number' || verifyData.score >= 0.5);
    if (!recaptchaValid) {
      console.warn(`[SECURITY] reCAPTCHA failed (score: ${verifyData.score}) from IP ${clientIP}`);
    }
  } catch (err) {
    console.error(`[ERROR] reCAPTCHA error: ${err.message}`);
  }

  if (!recaptchaValid) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
    };
  }

  // Field validation
  const errors = [];
  const name = (body.name || '').trim();
  if (name.length < 2 || name.length > 100) errors.push('El nombre debe tener entre 2 y 100 caracteres');

  const email = (body.email || '').trim().toLowerCase();
  if (!validateEmail(email) || email.length > 254) errors.push('Correo electrónico no válido');

  const phone = (body.phone || '').trim();
  if (phone && !validatePhone(phone)) errors.push('Número telefónico no válido');

  const message = (body.message || '').trim();
  if (message.length < 10 || message.length > 2000) errors.push('El mensaje debe tener entre 10 y 2000 caracteres');

  const date = (body.date || '').trim();
  if (date && !validateDate(date)) errors.push('Fecha no válida');

  const time = (body.time || '').trim();
  if (time && !validateTime(time)) errors.push('Hora no válida');

  if (errors.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Validation failed', details: errors })
    };
  }

  // Nodemailer transport via Gmail SMTP
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('[ERROR] GMAIL credentials not configured');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });

  const safeData = {
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone || 'No proporcionado'),
    message: sanitize(message),
    date: sanitize(date || 'No especificada'),
    time: sanitize(time || 'No especificada'),
    ip: sanitize(clientIP)
  };

  try {
    // Email to IronLink team
    await transporter.sendMail({
      from: `"IronLink Contacto" <${GMAIL_USER}>`,
      replyTo: safeData.email,
      to: 'ironlink631@gmail.com',
      subject: `Nuevo contacto de ${safeData.name} - IronLink`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:32px;">
          <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <tr><td style="background:#19AED8;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Nuevo contacto</h1>
            </td></tr>
            <tr><td style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">Nombre</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;">${safeData.name}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">Email</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;"><a href="mailto:${safeData.email}">${safeData.email}</a></td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">Teléfono</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;">${safeData.phone}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">Fecha preferida</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;">${safeData.date}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">Hora preferida</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;">${safeData.time}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;">IP</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${safeData.ip}</td></tr>
              </table>
              <h3 style="margin:24px 0 8px;color:#333;">Mensaje</h3>
              <p style="background:#f9f9f9;padding:16px;border-radius:8px;line-height:1.6;color:#333;">${safeData.message.replace(/\n/g, '<br>')}</p>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });

    // Confirmation email to client
    await transporter.sendMail({
      from: `"IronLink" <${GMAIL_USER}>`,
      to: safeData.email,
      subject: 'Recibimos tu solicitud - IronLink',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:32px;">
          <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <tr><td style="background:#19AED8;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Gracias por contactarnos</h1>
            </td></tr>
            <tr><td style="padding:32px;">
              <p style="font-size:16px;line-height:1.6;color:#333;">Hola <strong>${safeData.name}</strong>,</p>
              <p style="font-size:16px;line-height:1.6;color:#333;">Hemos recibido tu solicitud de asesoría. Nuestro equipo te responderá en menos de <strong>24 horas hábiles</strong>.</p>
              <table style="width:100%;margin:24px 0;background:#f9f9f9;border-radius:8px;padding:16px;">
                <tr><td style="padding:6px;color:#666;">Nombre</td><td style="font-weight:700;">${safeData.name}</td></tr>
                <tr><td style="padding:6px;color:#666;">Email</td><td>${safeData.email}</td></tr>
                ${safeData.phone !== 'No proporcionado' ? `<tr><td style="padding:6px;color:#666;">Teléfono</td><td>${safeData.phone}</td></tr>` : ''}
                ${safeData.date !== 'No especificada' ? `<tr><td style="padding:6px;color:#666;">Fecha solicitada</td><td>${safeData.date}${safeData.time !== 'No especificada' ? ' a las ' + safeData.time : ''}</td></tr>` : ''}
              </table>
              <p style="font-size:14px;color:#888;line-height:1.5;">Si tienes alguna urgencia, escríbenos a <a href="mailto:contacto@ironlink.mx">contacto@ironlink.mx</a>.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
              <p style="font-size:12px;color:#aaa;text-align:center;">IronLink &middot; Infraestructura Digital para PYMES</p>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });

    console.log(`[SUCCESS] Form from ${safeData.email} IP ${clientIP}`);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Mensaje enviado con éxito' })
    };

  } catch (err) {
    console.error(`[ERROR] Email send failed: ${err.message}`);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error al enviar el mensaje. Intenta de nuevo.' })
    };
  }
};
