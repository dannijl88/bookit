/**
 * Vite sustituye `import.meta.env` en tiempo de compilación. El `typeof` lo hace
 * seguro también fuera del bundler (scripts de verificación en Node).
 */
const viteEnv = typeof import.meta.env !== 'undefined' ? import.meta.env : {}

export const API_URL = (
  viteEnv.VITE_API_URL || 'http://localhost:8080'
).replace(/\/+$/, '')

export const STORAGE_KEYS = {
  token: 'slotlyfy.token',
  session: 'slotlyfy.session',
  profiles: 'slotlyfy.profiles',
  roleOverride: 'slotlyfy.roleOverride',
  selectedBusiness: 'slotlyfy.selectedBusiness',
}

export const UNAUTHORIZED_EVENT = 'slotlyfy:unauthorized'

export const DEFAULT_PAGE_SIZE = 10

/**
 * Tamaño de página que usamos al "ventilar" todas las categorías para la
 * vista "Todos". El backend exige `category` en GET /api/businesses, así que
 * no existe un endpoint que devuelva el catálogo completo.
 */
export const FANOUT_PAGE_SIZE = 50
