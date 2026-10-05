import { useCallback, useEffect, useRef, useState } from 'react'
import { extractApiError } from '../lib/errors'

/**
 * Carga asíncrona con estado de loading/error y recarga manual.
 * `deps` funciona como en useEffect; el resultado se ignora si la petición
 * cambia mientras está en vuelo (evita "carreras" al filtrar rápido).
 */
export default function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const requestId = useRef(0)
  const mounted = useRef(true)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    const id = requestId.current + 1
    requestId.current = id
    setLoading(true)
    setError(null)
    try {
      const result = await fnRef.current()
      if (!mounted.current || id !== requestId.current) return undefined
      setData(result)
      return result
    } catch (caught) {
      if (!mounted.current || id !== requestId.current) return undefined
      setError(caught)
      return undefined
    } finally {
      if (mounted.current && id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (immediate) run()
  }, [run, immediate, ...deps])

  return {
    data,
    loading,
    error,
    errorMessage: error ? extractApiError(error) : null,
    reload: run,
    setData,
  }
}
