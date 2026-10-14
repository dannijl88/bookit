import { http } from '../lib/api'

/** POST /api/auth/login -> { token, userId, role }. */
export async function login({ email, password }) {
  const { data } = await http.post('/api/auth/login', { email, password })
  return data
}

/** POST /api/users. `role` admite CLIENT o BUSINESS_OWNER. */
export async function register(payload) {
  const { data } = await http.post('/api/users', payload)
  return data
}

/** GET /api/users/me. Perfil del usuario autenticado (incluye `role`). */
export async function getCurrentUser() {
  const { data } = await http.get('/api/users/me')
  return data
}
