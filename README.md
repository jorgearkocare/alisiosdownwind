# Alisios Downwind · web

Landing de la comunidad de downwind foil de Gran Canaria. Hecha con **Astro + Tailwind CSS v4**, usando **bun** como gestor de paquetes, y siguiendo la skill `landing-page-design` (estructura de conversión + sistema visual).

## Arrancar

```bash
bun install
bun dev          # http://localhost:4321
bun run build    # genera la web estática en dist/
bun run preview  # sirve dist/ en local
```

Si no tienes bun: `curl -fsSL https://bun.sh/install | bash`.

## Publicar

Es una web 100 % estática. Cualquiera de estas opciones sirve, gratis:

- **Cloudflare Pages / Netlify / Vercel**: conecta el repo, comando de build `bun run build`, carpeta de salida `dist`.
- Antes de publicar, cambia `site` en `astro.config.mjs` y `url` en `src/config.ts` por el dominio definitivo.

## Lo que falta rellenar (todo en `src/config.ts`)

| Campo | Qué poner |
|---|---|
| `url` | Dominio definitivo (y el mismo en `astro.config.mjs`) |
| `email` | Email de contacto real |
| `whatsappGroup` | Enlace de invitación al grupo (`https://chat.whatsapp.com/...`). Vacío = se muestra Instagram |
| `formEndpoint` | URL del servicio de formulario (ver abajo). Vacío = el formulario abre el correo del usuario con los datos |
| `legal` | Titular, NIF y domicilio cuando exista el club o asociación |

### Conectar el formulario (5 minutos)

1. Crea una cuenta gratis en [Formspree](https://formspree.io) (o Web3Forms / Basin).
2. Crea un formulario y copia su endpoint, algo como `https://formspree.io/f/abcdwxyz`.
3. Pégalo en `formEndpoint`. Los envíos llegan a tu email y puedes exportarlos a CSV para montar la lista.

El formulario ya trae validación en el navegador, estados de carga, error y éxito, y un campo trampa (`_gotcha`) contra bots.

## Estructura

```
src/
  config.ts            Enlaces, email, formulario y datos legales
  faqs.ts              Preguntas frecuentes (también alimentan el schema FAQPage)
  icons.ts             Iconos Phosphor usados (SVG inline, sin dependencias)
  ui.ts                Clases compartidas de botones y títulos
  layouts/Layout.astro Head, SEO, Open Graph, nav y footer
  components/          Una sección por archivo (Hero, WhyGroup, Tagline, Modes...)
  pages/               index, privacidad, aviso-legal, 404
  scripts/main.ts      Menú, apariciones con IntersectionObserver, frase palabra a palabra, formulario
  styles/global.css    Tema de Tailwind (colores, fuente Geist, curva de movimiento)
public/                favicon, og.png (imagen al compartir), robots.txt
```

## Siguientes mejoras recomendadas

- **Fotos reales**: la ilustración del hero es provisional. Una foto o un vídeo corto de una bajada (GoPro o dron) convierte mucho mejor. Pon la imagen en `src/assets/` y usa el componente `<Image />` de Astro en `Hero.astro`.
- **Testimonios reales**: cuando tengáis frases de riders (con su permiso), añadid una sección de testimonios junto a `Community.astro`.
- **Riders invitados**: confirmad con Iballa Ruano y Foil Only que os parece bien nombrarlos (aparecen en el hero y en la sección de comunidad).
- **Versión en inglés** para riders de paso por la isla.
- **Sitemap**: `bunx astro add sitemap`.

## Reglas de diseño que sigue (de la skill)

Una sola acción principal (apuntarse), tipografía única Geist sin cursivas, tamaños solo de la escala de Tailwind, espaciados solo de la escala permitida, radios anidados (`interior = exterior − separación`), fondos planos sin degradados (el degradado solo va en el texto del título), iconos Phosphor, todas las transiciones con `cubic-bezier(0.32, 0.72, 0, 1)` y apariciones con IntersectionObserver (nunca listeners de scroll).
