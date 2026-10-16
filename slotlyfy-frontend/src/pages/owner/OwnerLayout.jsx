import { NavLink, Outlet } from 'react-router-dom'
import { useOwner } from './OwnerContext'
import { useAuth } from '../../auth/AuthContext'
import { resolvePanelState } from '../../lib/viewState'
import { Alert, LoadingBlock } from '../../components/ui/Feedback'

const TABS = [
  { to: '/panel', label: 'Negocio', end: true },
  { to: '/panel/servicios', label: 'Servicios' },
  { to: '/panel/equipo', label: 'Equipo' },
  { to: '/panel/citas', label: 'Citas' },
]

export default function OwnerLayout() {
  const { business, businesses, select, loading, errorMessage, reload } = useOwner()
  const { user } = useAuth()
  const panelState = resolvePanelState({ loading, error: Boolean(errorMessage) })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <header className="mb-6">
        <p className="text-sm font-semibold text-brand-700">Panel de gestión</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          {business ? business.name : `Hola, ${user?.name?.split(' ')[0] || 'hola'}`}
        </h1>
      </header>

      {panelState === 'loading' && <LoadingBlock label="Buscando tu negocio…" className="py-8" />}

      {panelState === 'error' && (
        <Alert
          tone="error"
          className="mb-6"
          title="No hemos podido cargar tus negocios"
          onDismiss={reload}
        >
          {errorMessage}
        </Alert>
      )}

      {panelState === 'ready' && (
        <>
          {/* Selector de negocio: sólo necesario si el propietario tiene varios. */}
          {businesses.length > 1 && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="business-select">
                Negocio seleccionado
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Gestionas más de un negocio: elige sobre cuál quieres trabajar.
              </p>
              <select
                id="business-select"
                value={business?.id || ''}
                onChange={(event) => select(Number(event.target.value))}
                className="mt-2.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
              >
                <option value="" disabled>
                  Selecciona un negocio
                </option>
                {businesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav
            className="no-scrollbar -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0"
            aria-label="Secciones del panel"
          >
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <Outlet context={{ business }} />

          {!business && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Crea tu ficha en la pestaña <strong>Negocio</strong> para empezar a gestionarlo.
            </p>
          )}
        </>
      )}
    </div>
  )
}
