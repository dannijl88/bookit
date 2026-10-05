import { http } from '../lib/api'
import { DEFAULT_PAGE_SIZE, FANOUT_PAGE_SIZE } from '../lib/constants'
import { CATEGORIES } from '../lib/domain'
import { buildPage, dedupeAndSort, toPage } from '../lib/pagination'

/**
 * GET /api/businesses
 * `category` es OBLIGATORIO (no tiene @RequestParam required=false, así que
 * omitirlo devuelve 400) y el backend filtra por coincidencia exacta
 * ignorando mayúsculas. No existe consulta "sin categoría".
 */
export async function listBusinesses({ category, page = 0, size = DEFAULT_PAGE_SIZE }) {
  const { data } = await http.get('/api/businesses', {
    params: { category, page, size },
  })
  return toPage(data, size)
}

/**
 * Vista "Todos": pedimos la primera página de cada categoría en paralelo y
 * paginamos en cliente sobre la unión deduplicada.
 *
 * Es la única forma de mostrar "todos los negocios" con este backend. Es una
 *Instantánea de la primera página de cada categoría (limitado a
 * FANOUT_PAGE_SIZE por categoría), así que no es una paginación exhaustiva
 * del universo completo.
 */
export async function listAllBusinesses({ page = 0, size = DEFAULT_PAGE_SIZE }) {
  const results = await Promise.allSettled(
    CATEGORIES.map((category) =>
      http.get('/api/businesses', {
        params: { category: category.value, page: 0, size: FANOUT_PAGE_SIZE },
      }),
    ),
  )

  const merged = []
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return
    const content = result.value?.data?.content
    if (Array.isArray(content)) merged.push(...content)
  })

  return buildPage(dedupeAndSort(merged), page, size)
}

export async function getBusinessServices(businessId) {
  const { data } = await http.get(`/api/businesses/${businessId}/services`)
  return Array.isArray(data) ? data : []
}

export async function getBusinessEmployees(businessId) {
  const { data } = await http.get(`/api/businesses/${businessId}/employees`)
  return Array.isArray(data) ? data : []
}

export async function getBusinessReviews({ businessId, page = 0, size = 5 }) {
  const { data } = await http.get(`/api/businesses/${businessId}/reviews`, {
    params: { page, size },
  })
  return toPage(data, size)
}

/** Sólo el propietario del negocio (403 en caso contrario). */
export async function getBusinessAppointments({
  businessId,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
}) {
  const { data } = await http.get(`/api/businesses/${businessId}/appointments`, {
    params: { page, size },
  })
  return toPage(data, size)
}

/** POST /api/businesses. Sólo BUSINESS_OWNER. El owner sale del token. */
export async function createBusiness(payload) {
  const { data } = await http.post('/api/businesses', payload)
  return data
}

/**
 * Busca los negocios propiedad del usuario actual.
 *
 * El backend tiene `findByOwner` en el repositorio pero NO lo expone por
 * HTTP, así que replicamos el filtro aquí: recogemos negocios de todas las
 * categorías y nos quedamos con los que coinciden con `ownerName`.
 * Si el nombre no coincide (p. ej. el usuario se registró en otro navegador y
 * no tenemos su nombre real), la interfaz deja elegir manualmente.
 */
export async function findMyBusinesses(ownerName) {
  const results = await Promise.allSettled(
    CATEGORIES.map((category) =>
      http.get('/api/businesses', {
        params: { category: category.value, page: 0, size: FANOUT_PAGE_SIZE },
      }),
    ),
  )

  const merged = []
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return
    const content = result.value?.data?.content
    if (Array.isArray(content)) merged.push(...content)
  })

  const all = dedupeAndSort(merged)
  if (!ownerName) return { all, owned: all }

  const needle = String(ownerName).trim().toLowerCase()
  const owned = all.filter(
    (business) => String(business.ownerName || '').trim().toLowerCase() === needle,
  )
  return { all, owned }
}
