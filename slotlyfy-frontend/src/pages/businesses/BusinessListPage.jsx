import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { businessApi } from '../../api'
import { CATEGORIES } from '../../lib/domain'
import { DEFAULT_PAGE_SIZE } from '../../lib/constants'
import useAsync from '../../hooks/useAsync'
import { Card } from '../../components/ui/Card'
import { Alert, EmptyState, Skeleton } from '../../components/ui/Feedback'
import Pagination from '../../components/ui/Pagination'
import Button, { buttonClasses } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import BusinessCard from './BusinessCard'

/**
 * Listado de negocios.
 *
 * El backend exige `category` en GET /api/businesses y sólo acepta
 * coincidencia exacta (ignorando mayúsculas), así que el filtro por
 * categoría es la única búsqueda disponible. "Todos" se resuelve pidiendo la
 * primera página de cada categoría en paralelo y paginando en cliente.
 *
 * El estado vive en la URL (?categoria=&pagina=) para que se pueda compartir,
 * usar el botón "atrás" y recargar sin perder la posición.
 */
export default function BusinessListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('categoria') || ''
  const page = Math.max(Number(searchParams.get('pagina') || 0), 0)

  const { data, loading, errorMessage, reload } = useAsync(
    () =>
      category
        ? businessApi.listBusinesses({ category, page, size: DEFAULT_PAGE_SIZE })
        : businessApi.listAllBusinesses({ page, size: DEFAULT_PAGE_SIZE }),
    [category, page],
  )

  const businesses = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.value === category) || null,
    [category],
  )

  const updateParams = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams)
      if (next.category !== undefined) {
        if (next.category) params.set('categoria', next.category)
        else params.delete('categoria')
      }
      if (next.page !== undefined) {
        if (next.page > 0) params.set('pagina', String(next.page))
        else params.delete('pagina')
      }
      setSearchParams(params, { replace: false })
    },
    [searchParams, setSearchParams],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-7">
        <p className="text-sm font-semibold text-brand-700">
          {activeCategory ? `${activeCategory.emoji} ${activeCategory.value}` : 'Todo el catálogo'}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Encuentra tu próximo servicio
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          {activeCategory
            ? `Negocios de ${activeCategory.value.toLowerCase()} con cita online. Elige servicio, profesional y hora.`
            : 'Peluquerías, barberías, spas y negocios de servicios con reserva online.'}
        </p>
      </header>

      {/* Filtro por categoría */}
      <div className="-mx-4 mb-7 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="no-scrollbar flex min-w-max gap-2" role="group" aria-label="Filtrar por categoría">
          <CategoryChip
            active={!category}
            onClick={() => updateParams({ category: '', page: 0 })}
            label="Todos"
            emoji="✨"
          />
          {CATEGORIES.map((item) => (
            <CategoryChip
              key={item.value}
              active={category === item.value}
              onClick={() => updateParams({ category: item.value, page: 0 })}
              label={item.value}
              emoji={item.emoji}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <Alert
          tone="error"
          className="mb-6"
          title="No hemos podido cargar los negocios"
          onDismiss={reload}
        >
          {errorMessage}
        </Alert>
      )}

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-28 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-5 h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="mt-5 h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !errorMessage && businesses.length === 0 && (
        <EmptyState
          icon={activeCategory ? '🔍' : '🏪'}
          title={activeCategory ? `Aún no hay negocios de ${activeCategory.value.toLowerCase()}` : 'Todavía no hay negocios'}
          description={
            activeCategory
              ? 'Prueba con otra categoría: los negocios se registran eligiendo su categoría al darse de alta.'
              : 'Sé el primero: crea la ficha de tu negocio desde el panel de propietario.'
          }
          action={
            category ? (
              <Button variant="secondary" onClick={() => updateParams({ category: '', page: 0 })}>
                Ver todas las categorías
              </Button>
            ) : (
              <Link to="/panel" className={buttonClasses()}>
                Crear mi negocio
              </Link>
            )
          }
        />
      )}

      {!loading && businesses.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          <Pagination
            className="mt-8"
            page={data.number}
            totalPages={totalPages}
            totalElements={totalElements}
            onChange={(next) => updateParams({ page: next })}
          />
        </>
      )}
    </div>
  )
}

function CategoryChip({ active, label, emoji, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  )
}
