import { useState } from 'react'
import { businessApi, ownerApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import { DAYS_OF_WEEK } from '../../lib/domain'
import { slotToShortTime } from '../../lib/format'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormControls'
import { Alert, EmptyState, LoadingBlock } from '../../components/ui/Feedback'
import EmptyBusinessState from './EmptyBusinessState'
import { useOwner } from './OwnerContext'

export default function OwnerTeamPage() {
  const { business } = useOwner()
  const toast = useToast()

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const employees = useAsync(
    () => (business ? businessApi.getBusinessEmployees(business.id) : Promise.resolve([])),
    [business?.id],
    { immediate: Boolean(business) },
  )

  if (!business) return <EmptyBusinessState />

  const list = employees.data || []

  const handleCreate = async (event) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim()) {
      setNameError('Escribe el nombre del profesional.')
      return
    }
    setNameError(null)
    setSubmitting(true)
    try {
      await ownerApi.createEmployee({ businessId: business.id, name: name.trim() })
      toast.success(`${name.trim()} se ha unido al equipo.`)
      setName('')
      employees.reload()
    } catch (error) {
      setFormError(extractApiError(error, 'No hemos podido añadir al profesional.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Equipo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cada profesional necesita un horario semanal para que los clientes puedan reservar.
          </p>

          {employees.loading && <LoadingBlock label="Cargando equipo…" />}
          {employees.errorMessage && (
            <Alert tone="error" className="mt-4">
              {employees.errorMessage}
            </Alert>
          )}

          {!employees.loading && list.length === 0 && (
            <EmptyState
              className="mt-4"
              icon="👥"
              title="Aún no hay profesionales"
              description="Añade a tu equipo para poder asignarles citas."
            />
          )}

          {list.length > 0 && (
            <div className="mt-4 space-y-4">
              {list.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onChanged={employees.reload}
                />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit p-5 sm:p-6">
          <h3 className="font-bold text-slate-900">Añadir profesional</h3>

          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            {formError && <Alert tone="error">{formError}</Alert>}

            <Input
              label="Nombre"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setNameError(null)
              }}
              error={nameError}
              placeholder="Lucía Fernández"
              required
            />

            <Button type="submit" full loading={submitting}>
              {submitting ? 'Añadiendo…' : 'Añadir al equipo'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- tarjeta equipo */

function EmployeeCard({ employee, onChanged }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [shiftError, setShiftError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [shift, setShift] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '14:00',
  })

  const schedules = useAsync(
    () => ownerApi.getEmployeeSchedules(employee.id),
    [employee.id],
  )

  const grouped = new Map()
  const list = schedules.data || []
  list.forEach((item) => {
    if (!grouped.has(item.dayOfWeek)) grouped.set(item.dayOfWeek, [])
    grouped.get(item.dayOfWeek).push(item)
  })

  const totalHours = list.reduce((total, item) => {
    const [sh, sm] = item.startTime.split(':').map(Number)
    const [eh, em] = item.endTime.split(':').map(Number)
    return total + (eh * 60 + em - (sh * 60 + sm)) / 60
  }, 0)

  const addShift = async (event) => {
    event.preventDefault()
    setShiftError(null)
    if (shift.startTime >= shift.endTime) {
      setShiftError('La hora de inicio debe ser anterior a la de fin.')
      return
    }

    setSubmitting(true)
    try {
      await ownerApi.createSchedule({
        employeeId: employee.id,
        dayOfWeek: shift.dayOfWeek,
        startTime: `${shift.startTime}:00`,
        endTime: `${shift.endTime}:00`,
      })
      toast.success('Turno añadido.')
      schedules.reload()
    } catch (error) {
      setShiftError(extractApiError(error, 'No hemos podido crear el turno.'))
    } finally {
      setSubmitting(false)
    }
  }

  const removeShift = async (schedule) => {
    try {
      await ownerApi.deleteSchedule(schedule.id)
      toast.success('Turno eliminado.')
      schedules.reload()
    } catch (error) {
      toast.error(extractApiError(error, 'No hemos podido eliminar el turno.'))
    }
  }

  const toggleActive = async () => {
    setBusy(true)
    try {
      await ownerApi.setEmployeeActive(employee.id, !employee.active)
      toast.success(employee.active ? 'Profesional desactivado.' : 'Profesional activado.')
      onChanged?.()
    } catch (error) {
      toast.error(extractApiError(error, 'No hemos podido cambiar al profesional.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-base font-bold text-brand-700">
          {employee.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-900">{employee.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {list.length === 0
              ? 'Sin horario definido'
              : `${totalHours.toFixed(1).replace('.', ',')} h semanales · ${list.length} ${
                  list.length === 1 ? 'turno' : 'turnos'
                }`}
          </p>
        </div>
        <Button variant="secondary" size="xs" onClick={toggleActive} loading={busy}>
          {employee.active ? 'Desactivar' : 'Activar'}
        </Button>
      </div>

      {/* Horario semanal */}
      <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          {schedules.loading && <LoadingBlock label="Cargando horario…" />}
          {schedules.errorMessage && (
            <Alert tone="error" className="mb-3">
              {schedules.errorMessage}
            </Alert>
          )}

          {!schedules.loading && (
            <ul className="grid gap-1 sm:grid-cols-2">
              {DAYS_OF_WEEK.map((day) => {
                const shifts = grouped.get(day.value) || []
                return (
                  <li
                    key={day.value}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm"
                  >
                    <span className="font-medium text-slate-700">{day.label}</span>
                    {shifts.length === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span className="flex flex-wrap justify-end gap-1.5">
                        {shifts.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => removeShift(item)}
                            title="Eliminar turno"
                            className="group inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            {slotToShortTime(item.startTime)}–{slotToShortTime(item.endTime)}
                            <span className="opacity-0 transition group-hover:opacity-100">×</span>
                          </button>
                        ))}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <form onSubmit={addShift} className="space-y-3">
          {shiftError && <Alert tone="error">{shiftError}</Alert>}

          <Select
            label="Día"
            value={shift.dayOfWeek}
            onChange={(event) => setShift((s) => ({ ...s, dayOfWeek: event.target.value }))}
          >
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Desde"
              type="time"
              step="900"
              value={shift.startTime}
              onChange={(event) => setShift((s) => ({ ...s, startTime: event.target.value }))}
            />
            <Input
              label="Hasta"
              type="time"
              step="900"
              value={shift.endTime}
              onChange={(event) => setShift((s) => ({ ...s, endTime: event.target.value }))}
            />
          </div>

          <Button type="submit" variant="soft" size="sm" full loading={submitting}>
            Añadir turno
          </Button>
          <p className="text-xs text-slate-500">
            Los turnos no pueden solaparse en el mismo día.
          </p>
        </form>
      </div>
    </Card>
  )
}
