import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { ROLES } from '../lib/domain'
import { UNAUTHORIZED_EVENT } from '../lib/constants'
import {
  clearSession,
  clearToken,
  findProfileByEmail,
  getRoleOverride,
  getSession,
  getToken,
  saveProfile,
  setRoleOverride,
  setSession,
  setToken,
} from './tokenStore'

const AuthContext = createContext(null)

/**
 * Identidad y rol.
 *
 * El backend tiene dos huecos que condicionan este provider:
 *   1. El JWT sólo lleva `sub` (email), `iat` y `exp`: no incluye el rol.
 *   2. No existe GET /api/users/me, así que no hay forma de recuperar el
 *      perfil desde el token al recargar la página.
 * Por eso persistimos la sesión completa (token + usuario + rol) y guardamos un
 * perfil por email al registrarse, que es la única respuesta del API que
 * contiene el `role` real.
 */
export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => {
    const stored = getSession()
    const token = getToken()
    if (!stored || !token) return null
    // Sesión a medio guardar (p. ej. el usuario borró la pestaña) -> limpio.
    if (stored.token !== token) {
      clearSession()
      clearToken()
      return null
    }
    return stored
  })

  // Si el interceptor detecta token caducado, vaciamos el estado en React.
  useEffect(() => {
    const onUnauthorized = () => setSessionState(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  // El rol "demo" puede cambiarse desde otra pestaña; lo sincronizamos.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== 'slotlyfy.roleOverride') return
      setSessionState((current) => {
        if (!current) return current
        const override = getRoleOverride()
        const role = override || current.user?.role || ROLES.CLIENT
        const next = { ...current, role, isDemoOwner: Boolean(override) }
        setSession(next)
        return next
      })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next) => {
    setSession(next)
    setSessionState(next)
    return next
  }, [])

  const logout = useCallback(() => {
    clearToken()
    clearSession()
    setSessionState(null)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const token = await authApi.login({ email, password })
      setToken(token)

      const profile = findProfileByEmail(email)
      const override = getRoleOverride()
      const role = override || profile?.role || ROLES.CLIENT

      return persist({
        token,
        user: profile || {
          id: null,
          name: email,
          email,
          phone: null,
          role: ROLES.CLIENT,
        },
        role,
        // Marcamos como "demo" sólo si el rol no viene del propio backend.
        isDemoOwner: Boolean(override) && override !== profile?.role,
      })
    },
    [persist],
  )

  /**
   * Registra y entra automáticamente. Guardamos el perfil devuelto por el
   * backend porque es la única fuente del `role` real (siempre CLIENT aquí).
   */
  const register = useCallback(
    async (payload) => {
      const user = await authApi.register(payload)
      saveProfile(user)
      const token = await authApi.login({ email: payload.email, password: payload.password })
      setToken(token)
      const override = getRoleOverride()
      const role = override || user.role || ROLES.CLIENT
      return persist({
        token,
        user,
        role,
        isDemoOwner: Boolean(override) && override !== user.role,
      })
    },
    [persist],
  )

  /** Interruptor para poder enseñar el panel de propietario en una demo. */
  const setDemoOwnerMode = useCallback(
    (enabled) => {
      const current = getSession()
      if (!current) return
      setRoleOverride(enabled ? ROLES.BUSINESS_OWNER : null)
      const role = enabled ? ROLES.BUSINESS_OWNER : current.user?.role || ROLES.CLIENT
      persist({
        ...current,
        role,
        isDemoOwner: Boolean(enabled) && role !== current.user?.role,
      })
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      role: session?.role || null,
      isAuthenticated: Boolean(session),
      isClient: session?.role === ROLES.CLIENT,
      isOwner: session?.role === ROLES.BUSINESS_OWNER,
      isDemoOwner: Boolean(session?.isDemoOwner),
      login,
      register,
      logout,
      setDemoOwnerMode,
    }),
    [session, login, register, logout, setDemoOwnerMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
