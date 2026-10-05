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

/** Sesión = { token, user, role, isDemoOwner } */
export function getSession() {
  return readJSON(STORAGE_KEYS.session, null)
}

export function setSession(session) {
  writeJSON(STORAGE_KEYS.session, session)
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEYS.session)
}

/**
 * Caché de perfiles por email.
 *
 * El JWT del backend sólo contiene `sub` (el email) + iat/exp: no lleva rol ni
 * id de usuario, y no existe ningún endpoint "usuario actual" contra el que
 * revalidar. Guardamos aquí lo que devuelve POST /api/users al registrarse
 * para poder reconstruir la identidad al hacer login más tarde.
 */
export function getProfiles() {
  return readJSON(STORAGE_KEYS.profiles, {})
}

export function saveProfile(user) {
  const profiles = getProfiles()
  profiles[user.email.toLowerCase()] = user
  writeJSON(STORAGE_KEYS.profiles, profiles)
  return user
}

export function findProfileByEmail(email) {
  if (!email) return null
  return getProfiles()[String(email).trim().toLowerCase()] || null
}

/**
 * Escape para la demo: el backend no ofrece ninguna forma de crear un
 * BUSINESS_OWNER (POST /api/users siempre fuerza el rol CLIENT), así que sin
 * este interruptor el panel de propietario sería inalcanzable desde el front.
 */
export function getRoleOverride() {
  return window.localStorage.getItem(STORAGE_KEYS.roleOverride) || null
}

export function setRoleOverride(role) {
  if (role) window.localStorage.setItem(STORAGE_KEYS.roleOverride, role)
  else window.localStorage.removeItem(STORAGE_KEYS.roleOverride)
}

export function isAuthenticated() {
  return Boolean(getToken() && getSession())
}
