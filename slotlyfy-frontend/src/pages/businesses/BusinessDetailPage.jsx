import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { businessApi, ownerApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { DAYS_OF_WEEK, getCategoryMeta } from '../../lib/domain'
import { formatDuration, formatPrice, slotToShortTime } from '../../lib/format'
import { Card, CategoryBadge, SectionHeading, Stars } from '../../components/ui/Card'
import { Alert, EmptyState, LoadingBlock, PageLoader } from '../../components/ui/Feedback'
import Pagination from '../../components/ui/Pagination'
import Button, { buttonClasses } from '../../components/ui/Button'
import BookingModal from './BookingModal'

const TABS = [
  { key: 'services', label: 'Servicios' },
  { key: 'team', label: 'Equipo' },
  { key: 'reviews', label: 'Reseñas' },
]

const REVIEW_PAGE_SIZE = 5

export default function BusinessDetailPage() {
  const { businessId } = useParams()
  const [tab, setTab] = useState('services')
  // `null` = modal cerrado. Objeto = modal abierto con un servicio preseleccionado.
  const [booking, setBooking] = useState(null)

  /**
   * El listado de negocios es paginado y no hay GET /api/businesses/{id}, así que
   * recuperamos la ficha barriendo el catálogo (misma llamada que usa el listado
   * con "Todos") y localizamos el id.
   */
  const businesses = useAsync(
    () => businessApi.listAllBusinesses({ page: 0, size: 50 }),
    [businessId],
  )

  const business =
    businesses.data?.content?.find((item) => String(item.id) === String(businessId)) || null

  const services = useAsync(() => businessApi.getBusinessServices(businessId), [businessId])
  const employees = useAsync(() => businessApi.getBusinessEmployees(businessId), [businessId])

  // Horario del primer profesional, sólo informativo en la pestaña Equipo.
  const firstEmployeeId = employees.data?.[0]?.id
  const schedules = useAsync(
    () =>
      firstEmployeeId
        ? ownerApi.getEmployeeSchedules(firstEmployeeId)
        : Promise.resolve([]),
    [firstEmployeeId],
    { immediate: Boolean(firstEmployeeId) },
  )

  if (businesses.loading) return <PageLoader label="Cargando negocio…" />

  if (businesses.errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Alert tone="error" title="No hemos podido cargar el negocio">
          {businesses.errorMessage}
        </Alert>
        <Link to="/businesses" className={`${buttonClasses({ variant: 'secondary' })} mt-6`}>
          Volver al listado
        </Link>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon="🏪"
          title="No hemos encontrado este negocio"
          description="Puede que el enlace no sea correcto o que el negocio ya no esté disponible."
          action={
            <Link to="/businesses" className={buttonClasses()}>
              Ver todos los negocios
            </Link>
          }
        />
      </div>
    )
  }

  const meta = getCategoryMeta(business.category)
  const serviceList = services.data || []
  const employeeList = employees.data || []
  const canBook = serviceList.length > 0 && employeeList.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <nav className="mb-5 text-sm text-slate-500" aria-label="Migas de pan">
        <Link to="/businesses" className="font-medium transition hover:text-slate-900">
          Negocios
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{business.name}</span>
      </nav>

      <Card className="overflow-hidden">
        <div className={`relative bg-gradient-to-br ${meta?.tint} px-6 py-8 sm:px-8 sm:py-10`}>
          <div className="flex items-start gap-4">
            <span className="text-5xl" aria-hidden="true">
              {meta?.emoji}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {business.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <CategoryBadge category={business.category} className="bg-white/85" />
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <span aria-hidden="true">🕘</span> {business.openingHours}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Dirección
              </dt>
              <dd className="mt-1 font-medium text-slate-900">{business.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Teléfono
              </dt>
              <dd className="mt-1 font-medium text-slate-900">{business.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Gestionado por
              </dt>
              <dd className="mt-1 font-medium text-slate-900">{business.ownerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Equipo
              </dt>
              <dd className="mt-1 font-medium text-slate-900">
                {employeeList.length}{' '}
                {employeeList.length === 1 ? 'profesional' : 'profesionales'}
              </dd>
            </div>
          </dl>

          <div className="lg:text-right">
            <Button size="lg" disabled={!canBook} onClick={() => setBooking({})}>
              Reservar cita
            </Button>
            {!canBook && (
              <p className="mt-2 max-w-56 text-xs text-slate-500 lg:ml-auto">
                {services.loading || employees.loading
                  ? 'Comprobando disponibilidad…'
                  : 'Este negocio aún no tiene servicios o equipo.'}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8 flex gap-1 border-b border-slate-200" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === item.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {item.label}
            {item.key === 'services' && serviceList.length > 0 && (
              <span className="ml-1.5 text-xs text-slate-400">{serviceList.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'services' && (
          <ServicesTab
            services={serviceList}
            loading={services.loading}
            errorMessage={services.errorMessage}
            onBook={(serviceId) => setBooking({ serviceId })}
            canBook={canBook}
          />
        )}

        {tab === 'team' && (
          <TeamTab
            employees={employeeList}
            schedules={schedules.data}
            firstEmployeeName={employeeList[0]?.name}
            loading={employees.loading}
          />
        )}

        {tab === 'reviews' && <ReviewsTab businessId={businessId} />}
      </div>

      <BookingModal
        open={booking !== null}
        onClose={() => setBooking(null)}
        business={business}
        services={serviceList}
        employees={employeeList}
        initialServiceId={booking?.serviceId}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- servicios */

function ServicesTab({ services, loading, errorMessage, onBook, canBook }) {
  if (loading) return <LoadingBlock label="Cargando servicios…" />
  if (errorMessage) return <Alert tone="error">{errorMessage}</Alert>

  if (services.length === 0) {
    return (
      <EmptyState
        icon="💇"
        title="Sin servicios publicados"
        description="Cuando el negocio añada sus servicios aparecerán aquí con su precio y duración."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {services.map((service) => (
        <Card key={service.id} className="flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{service.description}</p>
            </div>
            <p className="shrink-0 text-lg font-extrabold tracking-tight text-brand-700">
              {formatPrice(service.price)}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span aria-hidden="true">⏱</span> {formatDuration(service.duration)}
            </span>
            <Button size="sm" onClick={() => onBook(service.id)} disabled={!canBook}>
              Reservar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------- equipo */

function TeamTab({ employees, schedules, firstEmployeeName, loading }) {
  if (loading) return <LoadingBlock label="Cargando equipo…" />

  if (employees.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="Sin profesionales"
        description="El negocio todavía no ha dado de alta a su equipo."
      />
    )
  }

  const grouped = new Map()
  const hasSchedules = Array.isArray(schedules) && schedules.length > 0
  schedules?.forEach((shift) => {
    if (!grouped.has(shift.dayOfWeek)) grouped.set(shift.dayOfWeek, [])
    grouped.get(shift.dayOfWeek).push(shift)
  })

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-base font-bold text-brand-700">
            {employee.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-slate-900">{employee.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {employee.active ? 'Profesional activo' : 'Profesional inactivo'}
            </p>
          </div>
        </Card>
      ))}

      {hasSchedules && (
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={`Horario de ${firstEmployeeName}`}
            description="Horario semanal de referencia del primer profesional del equipo."
          />
          <ul className="mt-4 divide-y divide-slate-100">
            {DAYS_OF_WEEK.map((day) => {
              const shifts = grouped.get(day.value) || []
              return (
                <li key={day.value} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-sm font-medium text-slate-700">{day.label}</span>
                  <span className="text-sm text-slate-500">
                    {shifts.length === 0
                      ? 'Cerrado'
                      : shifts
                          .map(
                            (shift) =>
                              `${slotToShortTime(shift.startTime)} – ${slotToShortTime(shift.endTime)}`,
                          )
                          .join(' · ')}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ reseñas */

function ReviewsTab({ businessId }) {
  const [page, setPage] = useState(0)

  const { data, loading, errorMessage, reload } = useAsync(
    () => businessApi.getBusinessReviews({ businessId, page, size: REVIEW_PAGE_SIZE }),
    [businessId, page],
  )

  const reviews = data?.content || []
  const average = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : 0

  if (loading) return <LoadingBlock label="Cargando reseñas…" />
  if (errorMessage) return <Alert tone="error">{errorMessage}</Alert>

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon="⭐"
        title="Todavía no hay reseñas"
        description="Las reseñas se pueden dejar cuando una cita pasa a estado Completada."
        action={
          <Button variant="secondary" onClick={reload}>
            Actualizar
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {average.toFixed(1)}
            <span className="text-base font-semibold text-slate-400">/5</span>
          </p>
          <Stars value={average} className="mt-1" />
          <p className="mt-1.5 text-xs text-slate-500">
            Media de esta página · {data.totalElements}{' '}
            {data.totalElements === 1 ? 'reseña' : 'reseñas'} en total
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {(review.clientName || '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {review.serviceName} · con {review.employeeName}
                  </p>
                </div>
              </div>
              <Stars value={review.rating} />
            </div>
            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
            )}
          </Card>
        ))}
      </div>

      <Pagination
        page={data.number}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        onChange={setPage}
      />
    </div>
  )
}
