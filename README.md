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

## Estructura

```
ironlink/
  index.html            # Toda la página (HTML + CSS + JS)
  hero_bg_tech.jpg      # Fondo del hero (comprimido)
  ironlink.png.jpeg     # Logo
```

## Formulario de contacto

Usa [FormSubmit](https://formsubmit.co) (gratuito, sin registro).
Los mensajes llegan a `contacto@ironlink.mx`. Para cambiar el destino,
edita la URL en `index.html`:
```js
fetch('https://formsubmit.co/ajax/tu@email.com', ...)
```

## Secciones

- Hero con dashboard animado
- Servicios interactivos (consultoría, infraestructura, mantenimiento)
- Problema vs. Solución
- Testimonios
- FAQ
- Formulario de contacto + llamada telefónica
- Footer con navegación y copyright dinámico

## Contacto

- Email: contacto@ironlink.mx
- Web: https://ironlink.mx
