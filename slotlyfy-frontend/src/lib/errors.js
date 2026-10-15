/**
 * Formas de error del backend:
 *   · Excepciones de negocio y validación -> texto plano con el mensaje ya
 *     legible (GlobalExceptionHandler lo normaliza).
 *   · 401 -> credenciales incorrectas en /api/auth/login, o token ausente o
 *     caducado en el resto de endpoints.
 *   · 403 -> token válido pero sin permisos para la acción.
 */
const FRIENDLY_MESSAGES = {
  'slot not available': 'Ese horario acaba de ocuparse. Elige otra hora.',
  'this schedule overlaps with existing schedule':
    'Ese tramo se solapa con un horario que ya existe.',
  'appointment status not completed': 'Solo puedes reseñar citas completadas.',
  'email already in use': 'Ya existe una cuenta con ese email.',
  'user already exists': 'Ya existe una cuenta con ese email.',
  'review already exists': 'Esta cita ya tiene una reseña.',
}

const OFFLINE_MESSAGE =
  'No hemos podido conectar con el servidor. Si el backend lleva un rato inactivo, ' +
  'puede tardar hasta un minuto en despertar: espera un momento y vuelve a intentarlo.'

function normalize(message) {
  const key = String(message || '').trim().toLowerCase()
  if (!key) return null
  for (const [needle, friendly] of Object.entries(FRIENDLY_MESSAGES)) {
    if (key.includes(needle)) return friendly
  }
  return String(message).trim()
}

/**
 * Devuelve siempre un mensaje en español y presentable para el usuario.
 * @param {unknown} error error de axios
 * @param {string} fallback texto a usar si no hay nada aprovechable
 */
export function extractApiError(error, fallback = 'Ha ocurrido un error inesperado.') {
  if (!error) return fallback

  // Sin respuesta => red caída, CORS, o timeout.
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'La petición ha tardado demasiado. El servidor puede estar despertando; vuelve a intentarlo en unos segundos.'
    }
    return OFFLINE_MESSAGE
  }

  const { status, data } = error.response

  if (status === 401) {
    return String(error.config?.url || '').includes('/api/auth/login')
      ? 'Email o contraseña incorrectos.'
      : 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
  }
  if (status === 403) {
    const fromBody = normalize(typeof data === 'string' ? data : data?.message)
    return fromBody || 'No tienes permiso para esta acción.'
  }
  if (status === 500) return 'Error interno del servidor. Vuelve a intentarlo en unos segundos.'

  const fromBody = normalize(typeof data === 'string' ? data : data?.message || data?.error)
  if (fromBody) return fromBody

  if (status === 404) return 'No hemos encontrado lo que buscabas.'
  if (status === 409) return 'Ese recurso ya existe o entra en conflicto con otro.'

  return fallback
}

/** Marcar los campos de un formulario a partir del error de axios. */
export function fieldErrorsFromApi(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const out = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}
