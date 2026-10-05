import { http } from '../lib/api'
import { DEFAULT_PAGE_SIZE } from '../lib/constants'
import { toPage } from '../lib/pagination'

/**
 * GET /api/availability?employeeId&serviceOfferingId&date
 *
 * Devuelve un array plano de `LocalTime` ("09:00", "09:30:00", ...): sólo las
 * horas de INICIO libres, ya descontadas las citas que solapan. La duración
 * del servicio la usa el backend para generar los pasos.
 */
export async function getAvailability({ employeeId, serviceOfferingId, date }) {
  const { data } = await http.get('/api/availability', {
    params: { employeeId, serviceOfferingId, date },
  })
  return Array.isArray(data) ? data : []
}

/** POST /api/appointments. Sólo CLIENT. Empieza en PENDING. */
export async function createAppointment({ serviceId, employeeId, appointmentDateTime }) {
  const { data } = await http.post('/api/appointments', {
    serviceId,
    employeeId,
    appointmentDateTime,
  })
  return data
}

/** GET /api/appointments/me -> citas del cliente autenticado. */
export async function getMyAppointments({ page = 0, size = DEFAULT_PAGE_SIZE }) {
  const { data } = await http.get('/api/appointments/me', {
    params: { page, size },
  })
  return toPage(data, size)
}

export async function cancelAppointment(appointmentId) {
  const { data } = await http.patch(`/api/appointments/${appointmentId}/cancel`)
  return data
}

/**
 * PATCH /api/appointments/{id}/status
 * Sólo el dueño del negocio (el service vuelve a comprobar la propiedad).
 * `CANCELED` no existe: el enum es CANCELLED.
 */
export async function updateAppointmentStatus(appointmentId, status) {
  const { data } = await http.patch(`/api/appointments/${appointmentId}/status`, { status })
  return data
}
