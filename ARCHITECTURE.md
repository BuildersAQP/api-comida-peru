# 🎯 Configuración del Dominio Custom - Resumen Visual

## 📊 Arquitectura del Sistema

```
                    🌐 api-comida-peru.luisgagocasas.com
                                    │
                                    ↓
                            ┌───────────────┐
                            │  Cloudflare   │
                            │   DNS + CDN   │
                            └───────┬───────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              Ruta: /api/*                  Ruta: /* (resto)
                    │                               │
                    ↓                               ↓
        ┌──────────────────────┐      ┌──────────────────────┐
        │  Cloudflare Worker   │      │   GitHub Pages       │
        │  (API Endpoints)     │      │  (Landing/Docs)      │
        │                      │      │                      │
        │  • /api              │      │  • /                 │
        │  • /api/lima         │      │  • /docs             │
        │  • /api/arequipa     │      │  • /about            │
        │  • /api/lima/101     │      │  • etc...            │
        └──────────────────────┘      └──────────────────────┘
                    │                               │
                    ↓                               ↓
        ┌──────────────────────┐      ┌──────────────────────┐
        │  GitHub Raw Content  │      │  site/dist/          │
        │  (JSON Data)         │      │  (HTML/CSS/JS)       │
        └──────────────────────┘      └──────────────────────┘
```

---

## 🔧 Configuración Requerida

### 1️⃣ Cloudflare DNS

```
┌─────────────────────────────────────────────────────────┐
│ Cloudflare DNS Records                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Type:   CNAME                                          │
│  Name:   api-comida-peru                                │
│  Target: buildersaqp.github.io                          │
│  Proxy:  ☁️ Proxied (DEBE estar activado)              │
│  TTL:    Auto                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2️⃣ GitHub Pages

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository Settings > Pages                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Source:        Deploy from a branch                    │
│  Branch:        gh-pages / root                         │
│  Custom domain: api-comida-peru.luisgagocasas.com       │
│  ✓ Enforce HTTPS                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3️⃣ Cloudflare Worker Routes

```
┌─────────────────────────────────────────────────────────┐
│ Cloudflare Workers & Pages > api-comida-peru > Routes  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Route:  api-comida-peru.luisgagocasas.com/api*         │
│  Zone:   luisgagocasas.com                              │
│  Worker: api-comida-peru                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚦 Flujo de una Petición

### Ejemplo 1: Landing Page

```
Usuario:  https://api-comida-peru.luisgagocasas.com
              │
              ↓
       Cloudflare DNS
              │
              ↓
       Worker Routes? ❌ (no match con /api*)
              │
              ↓
       GitHub Pages ✅
              │
              ↓
       site/dist/index.html
              │
              ↓
       Usuario recibe: HTML del landing
```

### Ejemplo 2: API Request

```
Usuario:  https://api-comida-peru.luisgagocasas.com/api/lima?limit=5
              │
              ↓
       Cloudflare DNS
              │
              ↓
       Worker Routes? ✅ (match con /api*)
              │
              ↓
       Cloudflare Worker
              │
              ├─→ Verifica rate limit (IP)
              ├─→ Parsea parámetros (region, limit, offset, etc)
              ├─→ Fetch de GitHub Raw (lima.json)
              ├─→ Filtra y pagina resultados
              └─→ Cache en Cloudflare
              │
              ↓
       Usuario recibe: JSON con platos
```

---

## 📦 Archivos Clave

```
api-comida-peru/
│
├── apps/api/
│   ├── wrangler.toml          ← Configuración del Worker + Routes
│   └── src/index.ts           ← Lógica del API
│
├── site/
│   ├── public/
│   │   └── CNAME              ← Dominio custom para GitHub Pages
│   ├── vite.config.ts         ← Base path: '/' para custom domain
│   └── src/main.ts            ← Usa VITE_API_BASE_URL
│
├── .github/workflows/
│   └── deploy.yml             ← Automatiza deploy de site + worker
│
├── CUSTOM-DOMAIN-SETUP.md     ← Guía detallada de configuración
├── DEPLOYMENT.md              ← Guía de despliegue
└── update-to-custom-domain.sh ← Script para actualizar URLs
```

---

## ⚡ Comandos Rápidos

### Verificar DNS
```bash
dig api-comida-peru.luisgagocasas.com
nslookup api-comida-peru.luisgagocasas.com
```

### Verificar Landing
```bash
curl -I https://api-comida-peru.luisgagocasas.com
```

### Verificar API
```bash
# Listar regiones
curl https://api-comida-peru.luisgagocasas.com/api | jq

# Platos de Lima
curl "https://api-comida-peru.luisgagocasas.com/api/lima?limit=2" | jq

# Plato específico
curl https://api-comida-peru.luisgagocasas.com/api/lima/101 | jq
```

### Actualizar URLs en el código
```bash
./update-to-custom-domain.sh
```

### Desplegar Worker
```bash
cd apps/api && npm run deploy
```

### Desplegar Todo (GitHub Actions)
```bash
git add .
git commit -m "Configure custom domain"
git push origin main
# Luego ejecuta el workflow manualmente en GitHub
```

---

## ✅ Checklist Rápido

### Primera Configuración
- [ ] 1. Configurar CNAME en Cloudflare (proxied ✓)
- [ ] 2. Configurar Custom Domain en GitHub Pages
- [ ] 3. Esperar validación (~5 min)
- [ ] 4. Configurar Worker Route en Cloudflare Dashboard
- [ ] 5. Actualizar API_BASE_URL secret en GitHub
- [ ] 6. Ejecutar: `./update-to-custom-domain.sh`
- [ ] 7. Commit + push
- [ ] 8. Ejecutar workflow en GitHub Actions

### Verificación
- [ ] `curl https://api-comida-peru.luisgagocasas.com` → HTML
- [ ] `curl https://api-comida-peru.luisgagocasas.com/api` → JSON

---

## 🎯 Ventajas de Esta Configuración

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Landing URL** | buildersaqp.github.io/api-comida-peru | api-comida-peru.luisgagocasas.com |
| **API URL** | platos-api.green-fog-d5ba.workers.dev/api | api-comida-peru.luisgagocasas.com/api |
| **Profesionalidad** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **SEO** | Subdominios separados | Todo en un dominio |
| **Flexibilidad** | URLs fijas | Puedes cambiar backend |
| **Seguridad** | Básica | Cloudflare full protection |
| **HTTPS** | GitHub/Cloudflare separados | Certificado único |

---

## 🔗 Links de Referencia

- **Cloudflare Workers Routes:** https://developers.cloudflare.com/workers/configuration/routing/routes/
- **GitHub Pages Custom Domain:** https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Cloudflare DNS:** https://developers.cloudflare.com/dns/

---

## 💡 Notas Importantes

1. **El orden importa:**
   - Primero DNS
   - Luego GitHub Pages
   - Finalmente Worker Routes

2. **El proxy DEBE estar activado:**
   - Si la nube está gris en Cloudflare DNS, las Worker Routes NO funcionarán

3. **Propagación:**
   - DNS: 5-10 minutos
   - GitHub Pages validation: 5-10 minutos
   - Total: ~15-20 minutos para estar 100% operativo

4. **Cache:**
   - Cloudflare cachea respuestas automáticamente
   - Si haces cambios, purga el cache en Dashboard

5. **CNAME file:**
   - Vite copia `site/public/CNAME` automáticamente al build
   - GitHub Pages lee este archivo para el custom domain
