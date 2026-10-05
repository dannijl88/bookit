import axios from 'axios'
import { API_URL, UNAUTHORIZED_EVENT } from './constants'
import { clearSession, clearToken, getToken } from '../auth/tokenStore'

export const http = axios.create({
  baseURL: API_URL,
  // El backend es stateless con Bearer token y además tiene
  // allowCredentials(true) con origen específico: enviar cookies no aporta nada
  // y sólo añade riesgo de CORS, así que lo dejamos desactivado.
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/** Rutas que nunca deben disparar un "logout" automático por error de auth. */
const AUTH_FREE_PATHS = ['/api/auth/login', '/api/users']

function isAuthFree(url = '') {
  return AUTH_FREE_PATHS.some((path) => url.includes(path))
}

/** Marca la petición como hecha por un usuario que ya tenía token en memoria. */
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config.hadToken = true
  }
  return config
})

/**
 * Normalización de errores de sesión.
 *
 * El backend es inconsistente a propósito (o por descuido), así que hay que
 * cubrir tres casos distintos para el mismo resultado "tu sesión no vale":
 *   · 401 -> credenciales incorrectas en /api/auth/login (no hay token aún).
 *   · 403 con cuerpo vacío -> falta el token (Spring responde 403, no 401,
 *     porque no hay entry point de autenticación configurado).
 *   · 500 -> JwtAuthenticationFilter lanza ExpiredJwtException sin capturar.
 *
 * Pero Spring devuelve EXACTAMENTE ese mismo 403 vacío cuando el token es
 * válido y lo que falta son permisos (por ejemplo, un cliente que usa un
 * endpoint de propietario). Por eso sólo damos la sesión por perdida cuando
 * NO enviamos token: `hadToken` lo marca el interceptor de petición y así
 * separa "no me autenticaron" de "no me autorizaron". En el segundo caso se
 * muestra el error y se respeta la sesión, porque expulsar al usuario por
 * pulsar un botón que no puede usar sería peor que el propio error.
 */
function looksLikeSessionLoss(error) {
  const { status, config } = error
  if (!config?.hadToken) return status === 403
  if (status === 401) return true
  // Con token, un 500 es el filtro JWT sin capturar: token caducado o inválido.
  if (status === 500) return true
  return false
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (looksLikeSessionLoss(error) && !isAuthFree(error.config?.url)) {
      clearToken()
      clearSession()
      // Avisamos al AuthContext para que limpie su estado y redirija a /login.
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)
