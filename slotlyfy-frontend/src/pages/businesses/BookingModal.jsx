import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { appointmentApi } from '../../api'
import { useToast } from '../../hooks/useToast'
import useAsync from '../../hooks/useAsync'
import { extractApiError } from '../../lib/errors'
import {
  addDays,
  buildAppointmentDateTime,
  formatDuration,
  formatLongDate,
  formatPrice,
  isSlotInPast,
  slotToShortTime,
  startOfToday,
  toDateInputValue,
} from '../../lib/format'
import Modal from '../../components/ui/Modal'
import Button, { buttonClasses } from '../../components/ui/Button'
import { Select } from '../../components/ui/FormControls'
import { Alert, LoadingBlock } from '../../components/ui/Feedback'
import { Card } from '../../components/ui/Card'

/** Días ofrecidos en el selector de fecha (hoy + 13). */
const DAYS_OFFERED = 14

const STEPS = [
  { key: 'selection', label: 'Elección' },
  { key: 'slots', label: 'Hora' },
  { key: 'confirm', label: 'Confirmar' },
]

/**
 * Flujo de reserva.
 *
 * 1) Servicio + profesional + fecha.
 * 2) Disponibilidad real (GET /api/availability) para esa terna.
 * 3) Confirmación (POST /api/appointments).
 *
 * El backend vuelve a validar el hueco al crear la cita (409 si se acaba de
 * ocupar), por eso tras un conflicto recargamos la disponibilidad.
 */
export default function BookingModal({
  open,
  onClose,
  business,
  services = [],
  employees = [],
  initialServiceId,
  onBooked,
}) {
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState('selection')
  const [serviceId, setServiceId] = useState(initialServiceId || '')
  const [employeeId, setEmployeeId] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const [created, setCreated] = useState(null)

  // Al reabrir el modal se reinicia todo el flujo.
  useEffect(() => {
    if (!open) return
    setStep('selection')
    setServiceId(initialServiceId || '')
    setEmployeeId('')
    setDate('')
    setSlot('')
    setSubmitting(false)
    setConfirmError(null)
    setCreated(null)
  }, [open, initialServiceId])

  const service = useMemo(
    () => services.find((item) => String(item.id) === String(serviceId)) || null,
    [services, serviceId],
  )
  const employee = useMemo(
    () => employees.find((item) => String(item.id) === String(employeeId)) || null,
    [employees, employeeId],
  )

  const dayOptions = useMemo(() => {
    const today = startOfToday()
    return Array.from({ length: DAYS_OFFERED }, (_, index) => {
      const value = toDateInputValue(addDays(today, index))
      const dateObject = addDays(today, index)
      return {
        value,
        label: dateObject.toLocaleDateString('es-ES', { weekday: 'short' }),
        day: String(dateObject.getDate()),
        month: dateObject.toLocaleDateString('es-ES', { month: 'short' }),
      }
    })
  }, [])

  const { data: rawSlots, loading: slotsLoading, errorMessage: slotsError, reload } = useAsync(
    () => appointmentApi.getAvailability({ employeeId, serviceOfferingId: serviceId, date }),
    [serviceId, employeeId, date],
    { immediate: open && step === 'slots' && Boolean(serviceId && employeeId && date) },
  )

  // Hoy sólo se muestran horas que todavía no han pasado.
  const slots = useMemo(() => {
    const list = Array.isArray(rawSlots) ? rawSlots : []
    return date === toDateInputValue(new Date()) ? list.filter((s) => !isSlotInPast(date, s)) : list
  }, [rawSlots, date])

  const goToSlots = useCallback(() => {
    if (!serviceId || !employeeId || !date) return
    setSlot('')
    setConfirmError(null)
    setStep('slots')
  }, [serviceId, employeeId, date])

  const handleConfirm = async () => {
    setSubmitting(true)
    setConfirmError(null)
    try {
      const appointmentDateTime = buildAppointmentDateTime(date, slot)
      const appointment = await appointmentApi.createAppointment({
        serviceId: Number(serviceId),
        employeeId: Number(employeeId),
        appointmentDateTime,
      })
      setCreated(appointment)
      setStep('done')
      toast.success('¡Reserva confirmada! Te la hemos guardado en "Mis citas".')
      onBooked?.(appointment)
    } catch (error) {
      setConfirmError(extractApiError(error, 'No hemos podido confirmar la reserva.'))
      // 409 = el hueco se acaba de ocupar: refrescamos los horarios libres.
      if (error?.response?.status === 409) {
        setStep('slots')
        reload()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={step === 'done' ? 'Reserva confirmada' : `Reservar en ${business?.name || ''}`}
      description={
        step === 'done'
          ? undefined
          : 'Elige servicio, profesional y la hora que te venga mejor.'
      }
    >
      {step === 'done' ? (
        <SuccessStep appointment={created} business={business} onClose={onClose} />
      ) : (
        <>
          <Stepper current={stepIndex} />

          {step === 'selection' && (
            <div className="space-y-5">
              <Select
                label="Servicio"
                value={serviceId}
                onChange={(event) => {
                  setServiceId(event.target.value)
                  setSlot('')
                }}
                placeholder="Selecciona un servicio"
                required
              >
                {services.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {formatPrice(item.price)} · {formatDuration(item.duration)}
                  </option>
                ))}
              </Select>

              {services.length === 0 && (
                <Alert tone="warning">
                  Este negocio todavía no ha publicado servicios, así que no hay nada que
                  reservar por ahora.
                </Alert>
              )}

              <Select
                label="Profesional"
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value)
                  setSlot('')
                }}
                placeholder="Selecciona un profesional"
                required
              >
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>

              {employees.length === 0 && (
                <Alert tone="warning">
                  Este negocio aún no tiene profesionales con los que reservar.
                </Alert>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Día <span className="text-rose-500">*</span>
                </p>
                <div
                  className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                  role="group"
                  aria-label="Seleccionar día"
                >
                  {dayOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setDate(option.value)
                        setSlot('')
                      }}
                      aria-pressed={date === option.value}
                      className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 transition ${
                        date === option.value
                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-medium capitalize opacity-80">
                        {option.label}
                      </span>
                      <span className="text-base font-bold leading-tight">{option.day}</span>
                      <span className="text-[11px] font-medium capitalize opacity-80">
                        {option.month}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={goToSlots} disabled={!serviceId || !employeeId || !date}>
                  Ver horas libres
                </Button>
              </div>
            </div>
          )}

          {step === 'slots' && (
            <div className="space-y-5">
              <SummaryStrip service={service} employee={employee} date={date} onEdit={() => setStep('selection')} />

              {slotsLoading && <LoadingBlock label="Consultando disponibilidad…" />}

              {!slotsLoading && slotsError && (
                <Alert tone="error" title="No hemos podido consultar la disponibilidad">
                  {slotsError}
                </Alert>
              )}

              {!slotsLoading && !slotsError && slots.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
                  <span className="mb-2 block text-2xl" aria-hidden="true">
                    🕒
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    No hay horas libres para esta combinación
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    Puede que el día esté completo o que este profesional tenga un horario
                    distinto. Prueba con otra fecha o con otro profesional.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setStep('selection')}
                  >
                    Cambiar selección
                  </Button>
                </div>
              )}

              {!slotsLoading && !slotsError && slots.length > 0 && (
                <>
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-800">{slots.length}</span> horas
                    disponibles el {formatLongDate(date)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSlot(item)
                          setConfirmError(null)
                          setStep('confirm')
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                      >
                        {slotToShortTime(item)}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('selection')}
                    className="w-full"
                  >
                    Cambiar día o profesional
                  </Button>
                </>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-5">
              {confirmError && <Alert tone="error">{confirmError}</Alert>}

              <SummaryStrip service={service} employee={employee} date={date} onEdit={() => setStep('selection')} />

              <Card className="bg-slate-50/70 p-5 ring-1 ring-slate-200">
                <dl className="space-y-3 text-sm">
                  <Row label="Negocio" value={business?.name} />
                  <Row label="Dirección" value={business?.address} />
                  <Row label="Servicio" value={service ? service.name : '—'} />
                  <Row
                    label="Duración"
                    value={service ? formatDuration(service.duration) : '—'}
                  />
                  <Row label="Precio" value={service ? formatPrice(service.price) : '—'} />
                  <Row label="Profesional" value={employee ? employee.name : '—'} />
                  <Row
                    label="Fecha y hora"
                    value={`${formatLongDate(date)} · ${slotToShortTime(slot)}`}
                  />
                </dl>
              </Card>

              <p className="text-xs leading-relaxed text-slate-500">
                Al confirmar, el negocio recibirá la solicitud y podrás cancelarla desde "Mis
                citas" si cambias de planes.
              </p>

              {isAuthenticated ? (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={() => setStep('slots')}>
                    Volver a las horas
                  </Button>
                  <Button onClick={handleConfirm} loading={submitting} size="lg">
                    {submitting ? 'Confirmando…' : 'Confirmar reserva'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-center ring-1 ring-slate-200">
                  <p className="text-sm text-slate-600">
                    Inicia sesión o crea una cuenta para confirmar la reserva.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onClose()
                        navigate('/login', { state: { from: `/businesses/${business?.id}` } })
                      }}
                    >
                      Iniciar sesión
                    </Button>
                    <Button
                      onClick={() => {
                        onClose()
                        navigate('/registro')
                      }}
                    >
                      Crear cuenta
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------- auxiliares */

function Stepper({ current }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Progreso de la reserva">
      {STEPS.map((item, index) => {
        const isDone = index < current
        const isActive = index === current
        return (
          <li key={item.key} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                isDone
                  ? 'bg-brand-600 text-white'
                  : isActive
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {isDone ? '✓' : index + 1}
            </span>
            <span
              className={`hidden text-xs font-semibold sm:block ${
                isActive ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${isDone ? 'bg-brand-300' : 'bg-slate-200'}`}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function SummaryStrip({ service, employee, date, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-brand-50/70 px-4 py-3 ring-1 ring-brand-100">
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-brand-900">{service?.name || 'Sin servicio'}</p>
        <p className="mt-0.5 truncate text-brand-700">
          {employee?.name || 'Sin profesional'} ·{' '}
          {date ? `${formatLongDate(date)}` : 'sin fecha'}
        </p>
      </div>
      <Button variant="ghost" size="xs" onClick={onEdit}>
        Cambiar
      </Button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

function SuccessStep({ appointment, business, onClose }) {
  return (
    <div className="py-2 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">¡Cita reservada!</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
        Te esperamos en <strong className="text-slate-700">{business?.name}</strong>. Puedes
        revisarla o cancelarla desde "Mis citas".
      </p>

      {appointment && (
        <Card className="mx-auto mt-5 max-w-sm p-4 text-left">
          <p className="text-sm font-bold text-slate-900">{appointment.serviceOfferingName}</p>
          <p className="mt-1 text-sm text-slate-600">con {appointment.employeeName}</p>
          <p className="mt-2 text-sm font-semibold text-brand-700">
            {new Date(appointment.appointmentDateTime).toLocaleString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/mis-citas" className={buttonClasses()}>
          Ver mis citas
        </Link>
        <Button variant="secondary" onClick={onClose}>
          Seguir explorando
        </Button>
      </div>
    </div>
  )
}
