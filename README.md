# IronLink

Landing page profesional de IronLink — departamento de TI externo para PYMES mexicanas.

## Stack

- HTML5, CSS3, Vanilla JS (ES6)
- Google Fonts: Outfit + JetBrains Mono
- **Netlify Functions** (Node.js)
- **Nodemailer** + Gmail SMTP
- **Google reCAPTCHA v3**
- **Google Analytics 4**

## Estructura

```
ironlink/
├── index.html                       # Landing page (HTML+CSS+JS)
├── netlify/
│   └── functions/
│       └── contact.js               # Netlify Function: formulario + reCAPTCHA + email
├── package.json                     # Dependencias Node.js (Nodemailer)
├── netlify.toml                     # Configuración de despliegue Netlify
├── .env.example                     # Variables de entorno (ejemplo)
├── robots.txt                       # SEO
├── sitemap.xml                      # SEO
├── hero_bg_tech.jpg                 # Hero background optimizado
├── ironlink.png.jpeg                # Logo
└── .gitignore
```

## Configuración

### 1. Variables de entorno en Netlify

Copia `.env.example` y configura estas variables en Netlify → Site settings → Environment variables:

| Variable | Descripción |
|---|---|
| `GMAIL_USER` | ironlink631@gmail.com |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail (16 caracteres) |
| `RECAPTCHA_SITE_KEY` | Clave pública de reCAPTCHA v3 |
| `RECAPTCHA_SECRET_KEY` | Clave secreta de reCAPTCHA v3 |
| `TO_EMAIL` | ironlink631@gmail.com |
| `FROM_EMAIL` | ironlink631@gmail.com |

### 2. Google reCAPTCHA v3

1. Ve a https://www.google.com/recaptcha/admin
2. Crea un sitio v3 con tu dominio (ironlink.mx, ironlink.netlify.app, localhost)
3. Copia las claves a las variables de entorno

### 3. Gmail App Password

1. Activa 2FA en tu cuenta de Google
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una contraseña para "Correo" y úsala como `GMAIL_APP_PASSWORD`

### 4. Google Analytics 4

1. Crea una propiedad GA4 en https://analytics.google.com
2. Copia el ID de medición (G-XXXXXXXXXX)
3. Reemplázalo en los `<script>` de `index.html` y en `.env.example`

### 5. Reemplazar placeholders en index.html

Busca `G-XXXXXXXXXX` y `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` (esto último es la key de prueba de Google; cámbiala por tu key real en producción).

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor local con Netlify Dev
npx netlify dev
```

Esto levanta el frontend en `http://localhost:8888` y las funciones en `/.netlify/functions/`.

## Despliegue en Netlify

1. Conecta tu repositorio de GitHub en https://app.netlify.com
2. Netlify detecta automáticamente `netlify.toml`
3. Configura las variables de entorno en Netlify UI
4. Despliega

Netlify se encarga de:
- Hostear el sitio estático
- Ejecutar las funciones serverless
- Añadir los headers de seguridad
- Forzar HTTPS

## Contacto

- Email: contacto@ironlink.mx
- GitHub: https://github.com/yardka/ironlink
