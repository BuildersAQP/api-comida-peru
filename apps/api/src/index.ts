import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Plato = {
  id: number
  nombre: string
  tipo: string
  ingredientes: string[]
  preparacion: string[]
  imagen_url: string
}

type RegionData = {
  id_region: string
  nombre_region: string
  dato_curioso: string
  platos: Plato[]
}

type Env = {
  DATA_BASE_URL?: string
}

const regions = [
  { slug: 'amazonas', file: 'amazonas.json', nombre: 'Amazonas' },
  { slug: 'ancash', file: 'ancash.json', nombre: 'Áncash' },
  { slug: 'apurimac', file: 'apurímac.json', nombre: 'Apurímac' },
  { slug: 'arequipa', file: 'arequipa.json', nombre: 'Arequipa' },
  { slug: 'ayacucho', file: 'ayacucho.json', nombre: 'Ayacucho' },
  { slug: 'cajamarca', file: 'cajamarca.json', nombre: 'Cajamarca' },
  { slug: 'callao', file: 'callao.json', nombre: 'Callao' },
  { slug: 'cusco', file: 'cusco.json', nombre: 'Cusco' },
  { slug: 'huancavelica', file: 'huancavelica.json', nombre: 'Huancavelica' },
  { slug: 'huanuco', file: 'huanuco.json', nombre: 'Huánuco' },
  { slug: 'ica', file: 'ica.json', nombre: 'Ica' },
  { slug: 'junin', file: 'junin.json', nombre: 'Junín' },
  { slug: 'la-libertad', file: 'lalibertad.json', nombre: 'La Libertad' },
  { slug: 'lambayeque', file: 'lambayeque.json', nombre: 'Lambayeque' },
  { slug: 'lima', file: 'lima.json', nombre: 'Lima' },
  { slug: 'loreto', file: 'loreto.json', nombre: 'Loreto' },
  { slug: 'madre-de-dios', file: 'madrededios.json', nombre: 'Madre de Dios' },
  { slug: 'moquegua', file: 'moquegua.json', nombre: 'Moquegua' },
  { slug: 'pasco', file: 'pasco.json', nombre: 'Pasco' },
  { slug: 'piura', file: 'piura.json', nombre: 'Piura' },
  { slug: 'puno', file: 'puno.json', nombre: 'Puno' },
  { slug: 'san-martin', file: 'sanmartin.json', nombre: 'San Martín' },
  { slug: 'tacna', file: 'tacna.json', nombre: 'Tacna' },
  { slug: 'tumbes', file: 'tumbes.json', nombre: 'Tumbes' },
  { slug: 'ucayali', file: 'ucayali.json', nombre: 'Ucayali' }
]

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

const rateBuckets = new Map<string, { tokens: number; ts: number }>()

function rateLimit(ip: string, limit = 60) {
  const now = Date.now()
  const bucket = rateBuckets.get(ip) || { tokens: limit, ts: now }
  const elapsed = now - bucket.ts
  const refill = Math.floor(elapsed / 1000) // 1 token por segundo
  bucket.tokens = Math.min(limit, bucket.tokens + refill)
  bucket.ts = now
  if (bucket.tokens <= 0) return false
  bucket.tokens -= 1
  rateBuckets.set(ip, bucket)
  return true
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function buildDataUrl(c: Env, file: string) {
  const base = c.DATA_BASE_URL || ''
  if (base) return `${base}/${encodeURIComponent(file)}`
  return ''
}

async function fetchRegion(c: any, file: string) {
  const cache = caches.default
  const url = buildDataUrl(c.env, file)
  if (!url) return null
  const cached = await cache.match(url)
  if (cached) return await cached.json<RegionData>()
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) return null
  const data = (await res.json()) as RegionData
  const cacheRes = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  })
  await cache.put(url, cacheRes)
  return data
}

app.get('/api', (c) => {
  const out = regions.map((r) => ({ slug: r.slug, nombre: r.nombre }))
  return c.json({ regiones: out })
})

app.get('/api/:region', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown'
  if (!rateLimit(ip)) return c.text('Demasiadas solicitudes', 429)
  const slug = c.req.param('region')
  const info = regions.find((r) => r.slug === slug)
  if (!info) return c.text('Región no encontrada', 404)
  const data = await fetchRegion(c, info.file)
  if (!data) return c.text('Datos no disponibles', 503)
  const url = new URL(c.req.url)
  const qp = url.searchParams
  const limit = Math.max(1, Math.min(100, parseInt(qp.get('limit') || '20')))
  const offset = Math.max(0, parseInt(qp.get('offset') || '0'))
  const tipo = qp.get('tipo')
  const ingrediente = qp.get('ingrediente')
  const q = qp.get('q')
  const sort = qp.get('sort') || 'id'
  let platos = data.platos.slice()
  if (tipo) {
    const t = normalize(tipo)
    platos = platos.filter((p) => normalize(p.tipo).includes(t))
  }
  if (ingrediente) {
    const ing = normalize(ingrediente)
    platos = platos.filter((p) => p.ingredientes.some((i) => normalize(i).includes(ing)))
  }
  if (q) {
    const needle = normalize(q)
    platos = platos.filter((p) => {
      const hayNombre = normalize(p.nombre).includes(needle)
      const hayPrep = normalize(p.preparacion.join(' ')).includes(needle)
      return hayNombre || hayPrep
    })
  }
  if (sort === 'nombre') platos.sort((a, b) => a.nombre.localeCompare(b.nombre))
  else if (sort === 'tipo') platos.sort((a, b) => a.tipo.localeCompare(b.tipo))
  else platos.sort((a, b) => a.id - b.id)
  const total = platos.length
  const sliced = platos.slice(offset, offset + limit)
  return c.json({ id_region: data.id_region, nombre_region: data.nombre_region, total, offset, limit, platos: sliced })
})

app.get('/api/:region/:id', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown'
  if (!rateLimit(ip)) return c.text('Demasiadas solicitudes', 429)
  const slug = c.req.param('region')
  const id = parseInt(c.req.param('id'))
  const info = regions.find((r) => r.slug === slug)
  if (!info) return c.text('Región no encontrada', 404)
  const data = await fetchRegion(c, info.file)
  if (!data) return c.text('Datos no disponibles', 503)
  const plato = data.platos.find((p) => p.id === id)
  if (!plato) return c.text('Plato no encontrado', 404)
  return c.json(plato)
})

export default app