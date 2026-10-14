import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { businessApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { STORAGE_KEYS } from '../../lib/constants'

const OwnerContext = createContext(null)

const SELECTED_KEY = STORAGE_KEYS.selectedBusiness

/**
 * Resuelve "mi negocio" con GET /api/businesses/mine, que devuelve los negocios
 * del propietario autenticado (el backend toma el owner del token). Si tiene
 * varios, recordamos el elegido en localStorage.
 */
export function OwnerProvider({ children }) {
  const [selectedId, setSelectedId] = useState(() => {
    const raw = window.localStorage.getItem(SELECTED_KEY)
    return raw ? Number(raw) : null
  })

  const mine = useAsync(() => businessApi.getMyBusinesses(), [])

  const businesses = mine.data || []
  const selected = businesses.find((business) => business.id === selectedId) || businesses[0] || null

  const select = (id) => {
    setSelectedId(id)
    if (id) window.localStorage.setItem(SELECTED_KEY, String(id))
    else window.localStorage.removeItem(SELECTED_KEY)
  }

  const value = useMemo(
    () => ({
      business: selected,
      businesses,
      select,
      loading: mine.loading,
      errorMessage: mine.errorMessage,
      reload: mine.reload,
    }),
    [selected, businesses, mine.loading, mine.errorMessage, mine.reload],
  )

  return (
    <OwnerContext.Provider value={value}>
      {children ?? <Outlet context={{ business: selected }} />}
    </OwnerContext.Provider>
  )
}

export function useOwner() {
  const context = useContext(OwnerContext)
  if (!context) throw new Error('useOwner debe usarse dentro de <OwnerProvider>')
  return context
}
