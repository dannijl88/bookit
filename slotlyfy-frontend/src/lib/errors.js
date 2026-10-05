/**
 * El backend devuelve los errores de tres formas distintas:
 *   · Excepciones de negocio (404/409/403 de servicio) -> cuerpo de texto plano.
 *   · Validación de Bean Validation -> objeto JSON de Spring Boot SIN `message`
 *     (no hay handler de MethodArgumentNotValidException), así que no podemos
 *     mostrar el detalle del campo: validamos nosotros en el formulario.
 *   · Sin token / token caducado -> cuerpo vacío (403) o error 500.
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

const OFFLINE_MESSAGE = 'No hemos podido conectar con el servidor. ¿Sigue el backend activo?'

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
    if (error.code === 'ECONNABORTED') return 'La petición ha tardado demasiado. Inténtalo de nuevo.'
    return OFFLINE_MESSAGE
  }

  const { status, data } = error.response

  if (status === 401) return 'Email o contraseña incorrectos.'
  if (status === 403) {
    const fromBody = normalize(typeof data === 'string' ? data : data?.message)
    if (fromBody) return fromBody
    // Spring devuelve el mismo 403 vacío en ambos casos: si no había token,
    // la sesión está caducada; si lo había, faltan permisos.
    return error.config?.hadToken
      ? 'No tienes permiso para esta acción.'
      : 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
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
