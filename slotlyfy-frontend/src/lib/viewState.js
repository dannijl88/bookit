/**
 * Estado de una vista con datos asíncronos.
 *
 * El error manda sobre el vacío: si la petición falló no sabemos si hay datos o
 * no, así que nunca se debe pintar el estado "vacío" mientras haya un error (es
 * lo que hacía que se vieran a la vez el aviso de error y el "todavía no hay
 * nada"). `loading` tiene prioridad sobre todo lo demás.
 */

/** Devuelve 'loading' | 'error' | 'empty' | 'data' para una lista paginada. */
export function resolveListState({ loading, error, count }) {
  if (loading) return 'loading'
  if (error) return 'error'
  return count > 0 ? 'data' : 'empty'
}

/** Devuelve 'loading' | 'error' | 'ready' para el panel del propietario. */
export function resolvePanelState({ loading, error }) {
  if (loading) return 'loading'
  if (error) return 'error'
  return 'ready'
}
