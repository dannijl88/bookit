import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { appointmentApi, businessApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import { APPOINTMENT_STATUSES, STATUS_META, statusMeta } from '../../lib/domain'
import { Card, StatusBadge } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Alert, EmptyState, LoadingBlock } from '../../components/ui/Feedback'
import Pagination from '../../components/ui/Pagination'
import EmptyBusinessState from './EmptyBusinessState'
import { useOwner } from './OwnerContext'

/**
 * Transiciones que ofrecemos en cada estado. El enum del backend es
 * PENDING / CONFIRMED / COMPLETED / CANCELLED (ojo: "CANCELLED" con doble L).
 */
const TRANSITIONS = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Confirmar', variant: 'primary' },
    { status: 'CANCELLED', label: 'Rechazar', variant: 'danger-ghost' },
  ],
  CONFIRMED: [
    { status: 'COMPLETED', label: 'Completar', variant: 'primary' },
    { status: 'CANCELLED', label: 'Cancelar', variant: 'danger-ghost' },
  ],
  COMPLETED: [],
  CANCELLED: [],
}

export default function OwnerAppointmentsPage() {
  const { business } = useOwner()
  const toast = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(Number(searchParams.get('pagina') || 0), 0)
  const status = searchParams.get('estado') || ''

  const [busyId, setBusyId] = useState(null)

  const { data, loading, errorMessage, reload } = useAsync(
    () =>
      business
        ? businessApi.getBusinessAppointments({ businessId: business.id, page, size: 10 })
        : Promise.resolve(null),
    [business?.id, page],
    { immediate: Boolean(business) },
  )

  if (!business) return <EmptyBusinessState />

  const appointments = data?.content || []

  // El backend pagina sin filtro de estado; el chip filtra la página actual.
  const visible = status
    ? appointments.filter((appointment) => appointment.status === status)
    : appointments

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

  const changeStatus = async (appointment, nextStatus) => {
    setBusyId(appointment.id)
    try {
      await appointmentApi.updateAppointmentStatus(appointment.id, nextStatus)
      toast.success(`Cita marcada como ${statusMeta(nextStatus).label.toLowerCase()}.`)
      reload()
    } catch (error) {
      toast.error(extractApiError(error, 'No hemos podido cambiar el estado de la cita.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-slate-900">Citas del negocio</h2>
      <p className="mt-1 text-sm text-slate-500">
        Confirma las citas que recibes, complétalas al terminar el servicio y cancela las que no
        puedan mantenerse.
      </p>

      <div className="no-scrollbar -mx-4 mt-5 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2" role="group" aria-label="Filtrar por estado">
          <Chip
            active={!status}
            onClick={() => updateParams({ status: '', page: 0 })}
            label="Todas"
          />
          {APPOINTMENT_STATUSES.map((item) => (
            <Chip
              key={item}
              active={status === item}
              onClick={() => updateParams({ status: item, page: 0 })}
              label={STATUS_META[item].label}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <Alert tone="error" title="No hemos podido cargar las citas">
          {errorMessage}
        </Alert>
      )}

      {loading && <LoadingBlock label="Cargando citas…" />}

      {!loading && appointments.length === 0 && (
        <EmptyState
          icon="📅"
          title="Todavía no hay citas"
          description="Cuando un cliente reserve desde la ficha de tu negocio, aparecerá aquí."
          action={
            <Link
              to={`/businesses/${business.id}`}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Ver la ficha pública →
            </Link>
          }
        />
      )}

      {!loading && appointments.length > 0 && visible.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Sin citas con ese estado en esta página"
          action={
            <Button variant="secondary" onClick={() => updateParams({ status: '', page: 0 })}>
              Ver todas
            </Button>
          }
        />
      )}

      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((appointment) => (
            <Card key={appointment.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(appointment.appointmentDateTime).toLocaleString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {appointment.userName} · {appointment.serviceOfferingName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    con {appointment.employeeName} · ficha #{appointment.id}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  {(TRANSITIONS[appointment.status] || []).map((transition) => (
                    <Button
                      key={transition.status}
                      variant={transition.variant}
                      size="xs"
                      onClick={() => changeStatus(appointment, transition.status)}
                      loading={busyId === appointment.id}
                    >
                      {transition.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        className="mt-6"
        page={data?.number ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        onChange={(next) => updateParams({ page: next })}
      />

      <p className="mt-6 text-xs text-slate-500">
        Cuando marcas una cita como completada, el cliente puede dejar su reseña desde "Mis citas".
      </p>
    </div>
  )
}

function Chip({ active, label, onClick }) {
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
