# IronLink

Landing page profesional de IronLink — departamento de TI externo para PYMES mexicanas.

## Stack

- HTML5, CSS3, Vanilla JS (ES6)
- Google Fonts: Outfit + JetBrains Mono
- **Formspree** (form backend, 50 envíos/mes gratis)
- **GitHub Pages** (hosting gratuito)

## Estructura

```
ironlink/
├── index.html                       # Landing page (HTML+CSS+JS)
├── .nojekyll                        # Necesario para GitHub Pages
├── robots.txt                       # SEO
├── sitemap.xml                      # SEO
├── hero_bg_tech.jpg                 # Hero background optimizado
├── ironlink.png.jpeg                # Logo
└── .gitignore
```

## Desarrollo local

Solo abre `index.html` en tu navegador o usa cualquier servidor local:

```bash
npx serve .
```

## Despliegue en GitHub Pages

1. En GitHub, ve a Settings → Pages
2. Source: **Deploy from branch**
3. Branch: `main`, folder: `/ (root)`
4. Guarda

El sitio quedará en `https://yardka.github.io/ironlink/`

## Formspree

Los datos del formulario llegan al correo asociado a tu cuenta de Formspree.
Para cambiar el destino, edita el `action` del `<form>` en `index.html`.

## Contacto

- Email: contacto@ironlink.mx
- GitHub: https://github.com/yardka/ironlink
