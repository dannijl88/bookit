import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { appointmentApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import { APPOINTMENT_STATUSES, STATUS_META } from '../../lib/domain'
import { formatDate, formatTime, relativeDayLabel } from '../../lib/format'
import { Card, SectionHeading, StatusBadge } from '../../components/ui/Card'
import { Alert, EmptyState, LoadingBlock } from '../../components/ui/Feedback'
import Pagination from '../../components/ui/Pagination'
import Button, { buttonClasses } from '../../components/ui/Button'
import ReviewModal from './ReviewModal'

/** Citas en las que todavía se puede actuar. */
const CANCELLABLE = ['PENDING', 'CONFIRMED']

export default function MyAppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const page = Math.max(Number(searchParams.get('pagina') || 0), 0)
  const statusFilter = searchParams.get('estado') || ''

  const [reviewTarget, setReviewTarget] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  const { data, loading, errorMessage, reload } = useAsync(
    () => appointmentApi.getMyAppointments({ page, size: 10 }),
    [page],
  )

  const appointments = data?.content || []

  /**
   * El backend no permite filtrar por estado en GET /api/appointments/me, así
   * que el filtro se aplica sobre la página cargada. Los chips lo dejan
   * claro; para el histórico completo hay que paginar.
   */
  const visible = useMemo(
    () => (statusFilter ? appointments.filter((a) => a.status === statusFilter) : appointments),
    [appointments, statusFilter],
  )

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams)
    if (next.status !== undefined) {
      if (next.status) params.set('estado', next.status)
      else params.delete('estado')
    }
    if (next.page !== undefined) {
      if (next.page > 0) params.set('pagina', String(next.page))
      else params.delete('pagina')
    }
    setSearchParams(params)
  }

  const handleCancel = async (appointment) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres cancelar la cita de ${appointment.serviceOfferingName} con ${appointment.employeeName}?`,
    )
    if (!confirmed) return

    setCancellingId(appointment.id)
    try {
      await appointmentApi.cancelAppointment(appointment.id)
      toast.success('Cita cancelada.')
      reload()
    } catch (error) {
      toast.error(extractApiError(error, 'No hemos podido cancelar la cita.'))
    } finally {
      setCancellingId(null)
    }
  }

  const handleReviewSubmitted = () => reload()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <SectionHeading
        title="Mis citas"
        description="Consulta, cancela y valora tus reservas."
        action={
          <Link to="/businesses" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Reservar nueva cita
          </Link>
        }
      />

      {/* Filtro por estado (se aplica a la página cargada) */}
      <div className="no-scrollbar -mx-4 mt-6 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2" role="group" aria-label="Filtrar por estado">
          <StatusChip
            active={!statusFilter}
            onClick={() => updateParams({ status: '', page: 0 })}
            label="Todas"
          />
          {APPOINTMENT_STATUSES.map((status) => (
            <StatusChip
              key={status}
              active={statusFilter === status}
              onClick={() => updateParams({ status, page: 0 })}
              label={STATUS_META[status].label}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <Alert tone="error" className="mb-6" title="No hemos podido cargar tus citas">
          {errorMessage}
        </Alert>
      )}

      {loading && <LoadingBlock label="Cargando tus citas…" />}

      {!loading && appointments.length === 0 && (
        <EmptyState
          icon="🗓️"
          title="Todavía no tienes citas"
          description="Explora los negocios y reserva tu primer servicio en menos de un minuto."
          action={
            <Link to="/businesses" className={buttonClasses()}>
              Ver negocios
            </Link>
          }
        />
      )}

      {!loading && appointments.length > 0 && visible.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No hay citas con ese estado en esta página"
          description="Prueba con otro estado o revisa la siguiente página."
          action={
            <Button variant="secondary" onClick={() => updateParams({ status: '', page: 0 })}>
              Ver todas
            </Button>
          }
        />
      )}

      {visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              cancelling={cancellingId === appointment.id}
              onCancel={() => handleCancel(appointment)}
              onReview={() => setReviewTarget(appointment)}
            />
          ))}
        </div>
      )}

      <Pagination
        className="mt-8"
        page={data?.number ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        onChange={(next) => updateParams({ page: next })}
      />

      <ReviewModal
        open={Boolean(reviewTarget)}
        appointment={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}

function AppointmentCard({ appointment, cancelling, onCancel, onReview }) {
  const isCancellable = CANCELLABLE.includes(appointment.status)
  const isCompleted = appointment.status === 'COMPLETED'

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Bloque de fecha/hora */}
        <div className="flex w-full shrink-0 items-center gap-4 sm:w-40 sm:flex-col sm:items-start sm:gap-1">
          <div>
            <p className="text-sm font-semibold text-brand-700 capitalize">
              {relativeDayLabel(appointment.appointmentDateTime)}
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
              {formatTime(appointment.appointmentDateTime)}
            </p>
          </div>
          <p className="text-xs text-slate-500 sm:mt-1">
            {formatDate(appointment.appointmentDateTime)}
          </p>
        </div>

        <div className="min-w-0 flex-1 border-t border-slate-100 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <h3 className="truncate font-bold text-slate-900">
            {appointment.serviceOfferingName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            con {appointment.employeeName} · ficha #{appointment.id}
          </p>
          <div className="mt-3">
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isCancellable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
              loading={cancelling}
            >
              Cancelar
            </Button>
          )}
          {isCompleted && (
            <Button size="sm" onClick={onReview}>
              ⭐ Valorar
            </Button>
          )}
        </div>
      </div>

      {isCompleted && (
        <p className="border-t border-brand-100 bg-brand-50/60 px-5 py-2.5 text-xs text-brand-800 sm:px-6">
          Esta cita está completada: puedes dejar tu reseña y ayudar a otros clientes.
        </p>
      )}
    </Card>
  )
}

function StatusChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}
