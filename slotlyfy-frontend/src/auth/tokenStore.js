import { STORAGE_KEYS } from '../lib/constants'

/**
 * Acceso directo a localStorage. Vive fuera de React para que el interceptor
 * de axios pueda leer/escribir el token sin importar el contexto (evita ciclos).
 */

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* modo privado / cuota llena: la sesión durará lo que dure la pestaña */
  }
}

export function getToken() {
  return window.localStorage.getItem(STORAGE_KEYS.token) || null
}

export function setToken(token) {
  window.localStorage.setItem(STORAGE_KEYS.token, token)
}

export function clearToken() {
  window.localStorage.removeItem(STORAGE_KEYS.token)
}

/**
 * Sesión = { token, user, role }.
 *
 * Persistimos el perfil para pintar la interfaz al instante al recargar; el
 * AuthContext lo revalida contra GET /api/users/me en segundo plano.
 */
export function getSession() {
  return readJSON(STORAGE_KEYS.session, null)
}

export function setSession(session) {
  writeJSON(STORAGE_KEYS.session, session)
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEYS.session)
}
