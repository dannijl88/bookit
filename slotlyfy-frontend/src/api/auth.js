import { http } from '../lib/api'

/** POST /api/auth/login -> { token }. El email es el "usuario" del backend. */
export async function login({ email, password }) {
  const { data } = await http.post('/api/auth/login', { email, password })
  return data.token
}

/** POST /api/users -> 201 + usuario. El backend siempre asigna rol CLIENT. */
export async function register(payload) {
  const { data } = await http.post('/api/users', payload)
  return data
}
