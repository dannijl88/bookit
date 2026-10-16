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

/**
 * GET /api/businesses/{id}. Público: devuelve una única ficha sin barrer el
 * catálogo. Responde 404 si el negocio no existe o está desactivado.
 */
export async function getBusiness(businessId) {
  const { data } = await http.get(`/api/businesses/${businessId}`)
  return data
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
 * GET /api/businesses/mine. Sólo BUSINESS_OWNER: el backend resuelve el
 * propietario desde el token, así que no hace falta filtrar por nombre.
 */
export async function getMyBusinesses() {
  const { data } = await http.get('/api/businesses/mine')
  return Array.isArray(data) ? data : []
}
