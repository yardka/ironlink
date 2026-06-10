# IronLink

Landing page de IronLink — departamento de TI externo y amigable para PYMES mexicanas.

## Stack

- HTML5, CSS3, Vanilla JS (ES6)
- Google Fonts: Outfit + JetBrains Mono
- Iconos: SVG inline
- Sin dependencias externas

## Desarrollo

Abre `index.html` en tu navegador o sirve con cualquier servidor estático:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

## Configuración del formulario de contacto

El formulario usa [Formspree](https://formspree.io). Para activarlo:

1. Crea una cuenta en formspree.io
2. Crea un nuevo formulario y copia tu ID (`https://formspree.io/f/XXXXX`)
3. Reemplaza `YOUR_FORM_ID` en la línea del `fetch` dentro de `index.html`

## Estructura

```
ironlink/
  index.html          # Toda la página (HTML + CSS + JS)
  hero_bg.png         # Fondo del hero
  hero_bg_tech.png    # Overlay técnico
  ironlink.png.jpeg   # Logo
```

## Contacto

- Email: contacto@ironlink.mx
- Web: https://ironlink.mx
