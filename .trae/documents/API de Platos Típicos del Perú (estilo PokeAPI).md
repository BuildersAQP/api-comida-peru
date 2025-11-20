## Objetivo
- Publicar una API sencilla y gratuita con rutas `GET /api/<region>` que lean datos JSON existentes y soporten filtros (`limit`, `offset`, `tipo`, `ingrediente`, `q`, `sort`).
- Proveer un sitio web en español con documentación clara, ejemplos y una apariencia atractiva.
- Desplegar gratis: datos y sitio en GitHub Pages; lógica de API en Cloudflare Workers con Hono.

## Arquitectura
- **Datos**: conservar `platostipicos/*.json` como fuente de verdad en este repositorio.
- **API**: Cloudflare Workers + Hono. La API obtiene los JSON directamente desde GitHub Pages (o GitHub raw) y aplica filtros en el Worker. Sin gasto en bases de datos.
- **CDN/Caché**: usar `Cache API` en Cloudflare para respuestas del Worker con TTL ajustable y ETags.
- **Documentación/Sitio**: SPA estática (`site/` con Vite) alojada en GitHub Pages. Todo en español.
- **Normalización de regiones**: usar slugs ASCII en rutas (`/api/apurimac`, `/api/la-libertad`) mapeando a archivos con acentos (p. ej. `apurímac.json`).

## Endpoints API
- `GET /api`: lista de regiones disponibles con su slug y nombre.
- `GET /api/:region`: platos de la región.
- `GET /api/:region/:id`: plato por identificador.

## Parámetros de consulta
- `limit`: número de resultados (por defecto `20`, máx `100`).
- `offset`: desplazamiento para paginado.
- `tipo`: filtra por categoría (`Fondo`, `Entrada`, `Sopa`, `Postre`, `Bebida`, etc.).
- `ingrediente`: incluye platos que contengan el ingrediente (búsqueda por texto, case-insensitive).
- `q`: búsqueda libre en `nombre` y `preparacion`.
- `sort`: `nombre`, `tipo` o `id` (por defecto `id`).

## Esquema de datos y validación
- Validar entrada con esquemas ligeros (zod o validación manual) para `query params`.
- Validar la respuesta JSON para asegurar consistencia del esquema (`id`, `nombre`, `tipo`, `ingredientes`, `preparacion`, `imagen_url`).
- Manejo de acentos y UTF-8 garantizado; normalizar comparaciones (`toLowerCase`, `normalize('NFD')`).

## Seguridad y buenas prácticas
- CORS: permitir `GET` desde cualquier origen o restringir al dominio del sitio.
- Rate limit básico por IP (token bucket en memoria del Worker, p. ej. 60 req/min). Responder `429` si excede.
- Sanitización de `query params` y tamaños máximos.
- Headers: `Cache-Control`, `ETag`, `Content-Type: application/json; charset=utf-8`.
- Observabilidad: logs de métricas simples (conteo de hits por endpoint y por región). Sin datos personales.

## Hosting gratuito
- **GitHub Pages**: sirve `/site` y los archivos JSON desde `/platostipicos`. URL pública estable.
- **Cloudflare Workers**: ejecuta Hono, lee JSON desde GitHub Pages y responde a `/api/*`. Dominio `https://<worker-subdomain>.workers.dev` o subdominio propio con Cloudflare.

## Configuración GitHub Pages
- Crear rama `gh-pages` gestionada por Action.
- En Settings → Pages: Source `GitHub Actions`.
- Estructura de proyecto:
  - `site/` (SPA): documentación y ejemplos.
  - `platostipicos/` (JSON): expuestos públicamente.

## Configuración Cloudflare Workers
- Crear cuenta gratuita, obtener `Account ID` y `API Token` (scopes: `Workers Scripts:Edit`, `Workers KV:Edit` si se usa KV; aquí opcional).
- Instalar `wrangler` localmente (solo para desarrollo). En CI se usará acción oficial.
- `wrangler.toml` (ejemplo):
  - `name = "platos-api"`
  - `main = "apps/api/src/index.ts"` (archivo del Worker con Hono)
  - `compatibility_date = "2025-01-01"`
  - `routes = ["https://<tu-dominio>/api/*"]` (opcional)

## GitHub Actions (CI/CD)
- Workflow único que:
  - Ejecuta `npm ci && npm run build` para `site/`.
  - Publica `site/dist` a GitHub Pages.
  - Despliega el Worker con `cloudflare/wrangler-action` usando secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
- YAML (resumen):
```
name: deploy
on:
  push:
    branches: [ main ]
jobs:
  site-and-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: site
      - run: npm run build
        working-directory: site
      - uses: actions/upload-pages-artifact@v3
        with: { path: site/dist }
      - uses: actions/deploy-pages@v4
      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: wrangler deploy
```

## Documentación y apariencia
- SPA en español con secciones: Introducción, Endpoints, Parámetros, Ejemplos (curl, JS, Python), Preguntas frecuentes.
- Paleta inspirada en el Perú: rojos (#B00020), blancos, acentos cálidos (amarillo maíz #FFC107, tierra #8D6E63).
- Componentes: barra de navegación, buscador de regiones, tarjetas de platos, consola de ejemplos (copiar y probar).
- Resaltar uso con URLs reales: `https://<worker>/api/lima?limit=10`, y mostrar respuesta truncada.

## Ejemplos de uso
- `GET /api/lima?limit=5`
- `GET /api/cusco?tipo=Fondo&ingrediente=ají`
- `GET /api/arequipa?q=rocoto&sort=nombre&limit=10`
- `GET /api/la-libertad/12`

## Licencias
- **Código**: MIT License (libre uso, modificación y distribución con aviso de copyright).
- **Datos (JSON)**: Creative Commons Attribution 4.0 (CC BY 4.0) para facilitar reutilización con atribución.
- Añadir dos archivos de licencia en la raíz del repo: `LICENSE` (MIT) y `DATA-LICENSE` (CC BY 4.0).

## Plan de implementación
1. Crear `apps/api` con Hono para el Worker y rutas `/api`, `/api/:region`, `/api/:region/:id`.
2. Implementar fetch a GitHub Pages para `platostipicos/<archivo>.json` con mapeo de slug→archivo y caché (`Cache API`).
3. Añadir filtros y validación de parámetros.
4. Añadir rate limiting y CORS.
5. Crear `site` (Vite) con documentación en español y diseño propuesto.
6. Configurar `wrangler.toml` y secretos en GitHub.
7. Agregar workflow de Actions para Pages y Workers.
8. Añadir `LICENSE` y `DATA-LICENSE`.
9. Pruebas: solicitudes básicas y validación del esquema de respuesta.

## Recomendaciones
- Mantener slugs de regiones en ASCII y documentarlos claramente.
- Usar nombres de campos consistentes y evitar cambios de esquema sin versionado.
- Publicar changelog en el sitio cuando se actualicen datos o filtros.
- Considerar endpoint `/api/search` a futuro para búsqueda global (opcional).