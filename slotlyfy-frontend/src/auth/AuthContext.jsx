import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { ROLES } from '../lib/domain'
import { UNAUTHORIZED_EVENT } from '../lib/constants'
import { clearSession, clearToken, getSession, getToken, setSession, setToken } from './tokenStore'

const AuthContext = createContext(null)

/**
 * Identidad y rol.
 *
 * `POST /api/auth/login` devuelve `{ token, userId, role }` y el perfil completo
 * se recupera con `GET /api/users/me`. Persistimos la sesión para pintar la
 * interfaz al instante al recargar y la revalidamos contra `/me` en segundo
 * plano; si el token ya no vale, el interceptor limpia la sesión.
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

  const persist = useCallback((next) => {
    setToken(next.token)
    setSession(next)
    setSessionState(next)
    return next
  }, [])

  // Si el interceptor detecta token caducado, vaciamos el estado en React.
  useEffect(() => {
    const onUnauthorized = () => setSessionState(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  // Revalidamos el perfil guardado contra el backend al montar.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    authApi
      .getCurrentUser()
      .then((user) => persist({ token, user, role: user.role }))
      .catch(() => {
        /* un 401 aquí lo resuelve el interceptor vaciando la sesión */
      })
  }, [persist])

  const login = useCallback(
    async ({ email, password }) => {
      const { token, userId, role } = await authApi.login({ email, password })
      setToken(token)

      let user
      try {
        user = await authApi.getCurrentUser()
      } catch {
        // Si /me falla, seguimos con lo que ya trae el login.
        user = { id: userId, name: email, email, phone: null, role }
      }
      return persist({ token, user, role: user.role || role || ROLES.CLIENT })
    },
    [persist],
  )

  const register = useCallback(
    async (payload) => {
      await authApi.register(payload)
      return login({ email: payload.email, password: payload.password })
    },
    [login],
  )

  const logout = useCallback(() => {
    clearToken()
    clearSession()
    setSessionState(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      user: session?.user || null,
      role: session?.role || null,
      isClient: session?.role === ROLES.CLIENT,
      isOwner: session?.role === ROLES.BUSINESS_OWNER,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
