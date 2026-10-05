import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { businessApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import useAsync from '../../hooks/useAsync'
import { STORAGE_KEYS } from '../../lib/constants'

const OwnerContext = createContext(null)

const SELECTED_KEY = STORAGE_KEYS.selectedBusiness

/**
 * Resuelve cuál es "mi negocio".
 *
 * El backend tiene `BusinessRepository.findByOwner` pero NO lo expone por HTTP,
 * y tampoco devuelve el id de usuario en ningún endpoint de lectura. Lo único
 * disponible es `ownerId`/`ownerName` dentro de GET /api/businesses, así que
 * barremos el catálogo y comparamos por nombre del propietario.
 *
 * Si la comparación no encuentra nada (usuario registrado en otro navegador, o
 * nombre distinto al guardado en la ficha), la interfaz deja elegir a mano
 * entre los negocios detectados.
 */
export function OwnerProvider({ children }) {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState(() => {
    const raw = window.localStorage.getItem(SELECTED_KEY)
    return raw ? Number(raw) : null
  })

  const catalog = useAsync(
    () => businessApi.findMyBusinesses(user?.name),
    [user?.name],
  )

  const businesses = catalog.data?.owned || []
  const candidates = catalog.data?.all || []

  const selected =
    businesses.find((business) => business.id === selectedId) ||
    // Sin negocios propios sólo cuenta lo que elija a mano en el selector: si no,
    // preferredimos el aviso de crear la ficha antes que mostrar la de otro.
    candidates.find((business) => business.id === selectedId) ||
    businesses.find((business) => String(business.ownerName).trim().toLowerCase() ===
        String(user?.name || '').trim().toLowerCase()) ||
    businesses[0] ||
    null

  const select = useCallback((businessId) => {
    setSelectedId(businessId)
    if (businessId) window.localStorage.setItem(SELECTED_KEY, String(businessId))
    else window.localStorage.removeItem(SELECTED_KEY)
  }, [])

  const value = useMemo(
    () => ({
      business: selected,
      businesses,
      candidates,
      select,
      loading: catalog.loading,
      errorMessage: catalog.errorMessage,
      reload: catalog.reload,
      ownerName: user?.name || null,
    }),
    [selected, businesses, candidates, select, catalog.loading, catalog.errorMessage, catalog.reload, user?.name],
  )

  // Se monta como ruta (`element={<OwnerProvider />}`) sin hijos, así que el
  // Outlet es el caso normal; los hijos se aceptan por si se usa como envoltorio.
  return <OwnerContext.Provider value={value}>{children ?? <Outlet />}</OwnerContext.Provider>
}

export function useOwner() {
  const context = useContext(OwnerContext)
  if (!context) throw new Error('useOwner debe usarse dentro de <OwnerProvider>')
  return context
}
