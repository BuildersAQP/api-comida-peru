const regions = [
  { slug: 'amazonas', nombre: 'Amazonas' },
  { slug: 'ancash', nombre: 'Áncash' },
  { slug: 'apurimac', nombre: 'Apurímac' },
  { slug: 'arequipa', nombre: 'Arequipa' },
  { slug: 'ayacucho', nombre: 'Ayacucho' },
  { slug: 'cajamarca', nombre: 'Cajamarca' },
  { slug: 'callao', nombre: 'Callao' },
  { slug: 'cusco', nombre: 'Cusco' },
  { slug: 'huancavelica', nombre: 'Huancavelica' },
  { slug: 'huanuco', nombre: 'Huánuco' },
  { slug: 'ica', nombre: 'Ica' },
  { slug: 'junin', nombre: 'Junín' },
  { slug: 'la-libertad', nombre: 'La Libertad' },
  { slug: 'lambayeque', nombre: 'Lambayeque' },
  { slug: 'lima', nombre: 'Lima' },
  { slug: 'loreto', nombre: 'Loreto' },
  { slug: 'madre-de-dios', nombre: 'Madre de Dios' },
  { slug: 'moquegua', nombre: 'Moquegua' },
  { slug: 'pasco', nombre: 'Pasco' },
  { slug: 'piura', nombre: 'Piura' },
  { slug: 'puno', nombre: 'Puno' },
  { slug: 'san-martin', nombre: 'San Martín' },
  { slug: 'tacna', nombre: 'Tacna' },
  { slug: 'tumbes', nombre: 'Tumbes' },
  { slug: 'ucayali', nombre: 'Ucayali' }
]

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api-comida-peru.luisgagocasas.com/api'

const el = document.getElementById('regions')
if (el) {
  for (const r of regions) {
    const a = document.createElement('a')
    a.className = 'region-pill'
    a.href = `${API_BASE}/${r.slug}?limit=10`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.textContent = r.nombre
    el.appendChild(a)
  }
}
