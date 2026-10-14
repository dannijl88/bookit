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
  return AUTH_FREE_PATHS.some((path) => url.endsWith(path))
}

/** Adjunta el Bearer token si existe. */
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Normalización de errores de sesión.
 *
 * Tras el endurecimiento del backend, `401` es la única señal de "sesión no
 * válida" (falta el token o ha caducado lo captura el JwtAuthenticationFilter).
 * Un `403` significa que el token es válido pero faltan permisos, así que la
 * sesión se respeta y el error se muestra al usuario. `POST /api/auth/login`
 * también responde 401 con credenciales incorrectas, de ahí AUTH_FREE_PATHS.
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !isAuthFree(error.config?.url)) {
      clearToken()
      clearSession()
      // Avisamos al AuthContext para que limpie su estado y redirija a /login.
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)
