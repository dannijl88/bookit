import { http } from '../lib/api'

/* ----------------------------- empleados --------------------------------- */

export async function createEmployee({ businessId, name }) {
  const { data } = await http.post('/api/employees', { name }, { params: { businessId } })
  return data
}

export async function setEmployeeActive(employeeId, active) {
  const suffix = active ? 'activate' : 'deactivate'
  const { data } = await http.patch(`/api/employees/${employeeId}/${suffix}`)
  return data
}

/* ------------------------------ horarios --------------------------------- */

/**
 * GET /api/schedules/employee/{employeeId} -> lista de turnos semanales.
 * Ojo: el endpoint de creación es /api/schedules (no anidado) y el id del
 * empleado va como query param, no en el body.
 */
export async function getEmployeeSchedules(employeeId) {
  const { data } = await http.get(`/api/schedules/employee/${employeeId}`)
  return Array.isArray(data) ? data : []
}

export async function createSchedule({ employeeId, dayOfWeek, startTime, endTime }) {
  const { data } = await http.post(
    '/api/schedules',
    { dayOfWeek, startTime, endTime },
    { params: { employeeId } },
  )
  return data
}

export async function deleteSchedule(scheduleId) {
  await http.delete(`/api/schedules/${scheduleId}`)
}

/* ------------------------------ servicios -------------------------------- */

/** POST /api/services?businessId= (id por query param). */
export async function createService({ businessId, name, description, price, duration }) {
  const { data } = await http.post(
    '/api/services',
    { name, description, price, duration },
    { params: { businessId } },
  )
  return data
}

export async function setServiceActive(serviceId, active) {
  const suffix = active ? 'activate' : 'deactivate'
  const { data } = await http.patch(`/api/services/${serviceId}/${suffix}`)
  return data
}
