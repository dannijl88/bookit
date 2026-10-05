import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useOwner } from './OwnerContext'
import { useAuth } from '../../auth/AuthContext'
import { Alert, LoadingBlock } from '../../components/ui/Feedback'

const TABS = [
  { to: '/panel', label: 'Negocio', end: true },
  { to: '/panel/servicios', label: 'Servicios' },
  { to: '/panel/equipo', label: 'Equipo' },
  { to: '/panel/citas', label: 'Citas' },
]

export default function OwnerLayout() {
  const { business, businesses, candidates, select, loading, errorMessage, ownerName } = useOwner()
  const { user, isDemoOwner } = useAuth()
  const [showAll, setShowAll] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-6">
        <p className="text-sm font-semibold text-brand-700">Panel de negocio</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Hola{user?.name ? `, ${String(user.name).split(' ')[0]}` : ''}
        </h1>
      </header>

      {errorMessage && (
        <Alert tone="error" className="mb-6" title="No hemos podido cargar tus negocios">
          {errorMessage}
        </Alert>
      )}

      {/* Selector de negocio */}
      {loading ? (
        <LoadingBlock label="Buscando tu negocio…" className="py-8" />
      ) : businesses.length > 1 || (businesses.length === 0 && candidates.length > 0) ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="business-select">
            Negocio seleccionado
          </label>
          <p className="mt-1 text-xs text-slate-500">
            El backend no expone "mis negocios", así que comparamos por el nombre del
            propietario ({ownerName || 'desconocido'}) en las fichas del catálogo.
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
            {(showAll ? candidates : businesses).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.category}
                {showAll ? ` · (${item.ownerName})` : ''}
              </option>
            ))}
          </select>
          {businesses.length === 0 && candidates.length > 0 && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              No aparece mi negocio: ver todas las fichas del catálogo
            </button>
          )}
        </div>
      ) : null}

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

      {isDemoOwner && (
        <Alert tone="warning" className="mb-6">
          Estás viendo el panel con el rol propietario simulado en el navegador. Las acciones sí
          se envían al backend, pero responders con un <strong>403</strong> si tu cuenta real es
          CLIENT.
        </Alert>
      )}

      <Outlet context={{ business }} />

      {!loading && !business && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Crea tu ficha en la pestaña <strong>Negocio</strong> para empezar a gestionarlo.
        </p>
      )}
    </div>
  )
}
