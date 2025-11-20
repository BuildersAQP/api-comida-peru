# 🍽️ API de Platos Típicos del Perú

Una API RESTful moderna y gratuita para consultar platos típicos del Perú organizados por región. Inspirada en el estilo de PokeAPI, ofrece información detallada sobre más de 625 platos tradicionales peruanos.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data License: CC BY 4.0](https://img.shields.io/badge/Data%20License-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

## 🌟 Características

- **25 regiones del Perú**: Accede a platos típicos de todas las regiones peruanas
- **Búsqueda y filtrado avanzado**: Filtra por tipo de plato, ingredientes y búsqueda libre
- **Paginación eficiente**: Controla la cantidad de resultados con `limit` y `offset`
- **Datos ricos**: Incluye ingredientes, preparación e imágenes para cada plato
- **API rápida y gratuita**: Sin límites de cuota para uso normal
- **CORS habilitado**: Úsala desde cualquier dominio

## 🚀 URL Base

```
https://api-comida-peru.luisgagocasas.com/api
```

## 📖 Documentación

Visita la [documentación completa](https://buildersaqp.github.io/api-comida-peru/) para ejemplos detallados y guías de uso.

## 🎯 Endpoints Principales

### Listar regiones
```http
GET /api
```

**Respuesta:**
```json
{
  "regiones": [
    { "slug": "arequipa", "nombre": "Arequipa" },
    { "slug": "lima", "nombre": "Lima" },
    ...
  ]
}
```

### Obtener platos de una región
```http
GET /api/{region}?limit=20&offset=0
```

**Parámetros de consulta:**
- `limit` (opcional): Número de resultados (1-100, por defecto 20)
- `offset` (opcional): Desplazamiento para paginación
- `tipo` (opcional): Filtra por tipo de plato
- `ingrediente` (opcional): Filtra por ingrediente
- `q` (opcional): Búsqueda libre en nombre y preparación
- `sort` (opcional): Ordena por `id`, `nombre` o `tipo`

**Ejemplo:**
```bash
curl "https://api-comida-peru.luisgagocasas.com/api/arequipa?tipo=Fondo&limit=5"
```

### Obtener un plato específico
```http
GET /api/{region}/{id}
```

**Ejemplo:**
```bash
curl "https://api-comida-peru.luisgagocasas.com/api/lima/101"
```

## 💻 Ejemplos de Uso

### JavaScript / TypeScript
```javascript
fetch('https://api-comida-peru.luisgagocasas.com/api/arequipa?ingrediente=rocoto')
  .then(response => response.json())
  .then(data => {
    console.log(`Platos encontrados: ${data.total}`);
    data.platos.forEach(plato => {
      console.log(`- ${plato.nombre}`);
    });
  });
```

### Python
```python
import requests

response = requests.get(
    'https://api-comida-peru.luisgagocasas.com/api/lima',
    params={'q': 'ceviche', 'limit': 5}
)
platos = response.json()['platos']
for plato in platos:
    print(f"{plato['nombre']} - {plato['tipo']}")
```

## 🛠️ Tecnologías Utilizadas

### Backend (API)
- **[Hono](https://hono.dev/)**: Framework web ultrarrápido y ligero para Edge Computing
- **[Cloudflare Workers](https://workers.cloudflare.com/)**: Plataforma serverless para despliegue global
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **Rate Limiting**: Control de tráfico para prevenir abuso

### Frontend (Sitio de Documentación)
- **[Vite](https://vitejs.dev/)**: Build tool moderno y rápido
- **TypeScript**: Para el código del sitio
- **CSS moderno**: Diseño responsive con variables CSS y gradientes
- **GitHub Pages**: Hosting estático gratuito

### Datos
- **JSON estructurado**: 25 archivos JSON con datos de cada región
- **Licencia CC BY 4.0**: Datos abiertos para uso libre con atribución

## 📦 Estructura del Proyecto

```
api-comida-peru/
├── apps/
│   └── api/                    # API de Cloudflare Workers
│       ├── src/
│       │   └── index.ts        # Lógica principal de la API
│       ├── package.json
│       ├── tsconfig.json
│       └── wrangler.toml       # Configuración de Cloudflare
├── platostipicos/              # Datos JSON por región
│   ├── lima.json
│   ├── arequipa.json
│   └── ...
├── site/                       # Sitio web de documentación
│   ├── src/
│   │   ├── main.ts
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── LICENSE                     # Licencia MIT (código)
├── DATA-LICENSE               # Licencia CC BY 4.0 (datos)
└── README.md
```

## 🚢 Deploy

### API (Cloudflare Workers)

1. **Instalar dependencias:**
```bash
cd apps/api
npm install
```

2. **Autenticarse en Cloudflare:**
```bash
npx wrangler login
```

3. **Configurar `wrangler.toml`:**
```toml
name = "api-comida-peru"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DATA_BASE_URL = "https://raw.githubusercontent.com/BuildersAQP/api-comida-peru/main/platostipicos"
```

4. **Desplegar:**
```bash
npm run deploy
```

### Sitio Web (GitHub Pages)

1. **Instalar dependencias:**
```bash
cd site
npm install
```

2. **Construir para producción:**
```bash
npm run build
```

3. **Configurar GitHub Pages:**
   - Ve a Settings → Pages en tu repositorio
   - Selecciona la rama y carpeta donde está el build
   - GitHub Pages generará automáticamente la URL

4. **Deploy automático con GitHub Actions:**
   - Crea un workflow en `.github/workflows/deploy.yml`
   - Configura para construir y desplegar en cada push a `main`

## 🧪 Desarrollo Local

### API
```bash
cd apps/api
npm install
npm run dev
```

La API estará disponible en `http://localhost:8787`

### Sitio Web
```bash
cd site
npm install
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 📊 Regiones Disponibles

Amazonas, Áncash, Apurímac, Arequipa, Ayacucho, Cajamarca, Callao, Cusco, Huancavelica, Huánuco, Ica, Junín, La Libertad, Lambayeque, Lima, Loreto, Madre de Dios, Moquegua, Pasco, Piura, Puno, San Martín, Tacna, Tumbes, Ucayali.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Si deseas agregar más platos, corregir información o mejorar la API:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencias

- **Código fuente**: [MIT License](LICENSE)
- **Datos JSON**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](DATA-LICENSE)

Al usar los datos, por favor proporciona la atribución adecuada:
```
Datos de "API de Platos Típicos del Perú" por BuildersAQP, disponible bajo CC BY 4.0
```

## 👥 Equipo

### BuildersAQP

Comunidad de desarrolladores de Arequipa, Perú, dedicada a crear proyectos de código abierto que promuevan la cultura y tecnología peruana.

**Desarrollado por:**
- **Luis Gago Casas** - [LinkedIn](https://www.linkedin.com/in/luisgagocasas/)

## 🌐 Enlaces

- **Documentación**: https://buildersaqp.github.io/api-comida-peru/
- **Repositorio**: https://github.com/BuildersAQP/api-comida-peru
- **API Base URL**: https://api-comida-peru.luisgagocasas.com/api

## 📧 Contacto

¿Preguntas o sugerencias? Abre un issue en GitHub o contacta al equipo de BuildersAQP.

---

Hecho con ❤️ en Arequipa 🇵🇪
