/**
 * Test de contrato contra un backend simulado.
 *
 * Levanta un servidor en un puerto propio (8099 por defecto, configurable con
 * CONTRACT_PORT) que imita las respuestas del
 * backend real (mismos paths, mismos query params, mismo `Page<T>` de Spring Data
 * y los mismos cuerpos de error en texto plano) y comprueba que la capa HTTP del
 * frontend envía exactamente lo que el backend espera.
 *
 * Ejecutar con `npm run verify:contract`. No necesita que el backend real esté
 * apagado: usa un puerto aparte.
 */
import assert from 'node:assert/strict'
import http from 'node:http'

/* ------------------------------------------------------------------ stub DOM */

// El navegador no existe aquí: `tokenStore` habla directamente con localStorage.
const store = new Map()
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
}

/* ---------------------------------------------------------------- puerto */

// Puerto propio para no depender de que el backend real esté apagado.
const PORT = Number(process.env.CONTRACT_PORT || 8099)
const ORIGIN = `http://127.0.0.1:${PORT}`

/* ------------------------------------------------------------ servidor mock */

const recorded = []
let scenario = {}

const page = (content, { number = 0, size = 10, totalElements } = {}) => ({
  content,
  number,
  size,
  totalElements: totalElements ?? content.length,
  totalPages: Math.ceil((totalElements ?? content.length) / size),
  first: number === 0,
  last: number >= Math.ceil((totalElements ?? content.length) / size) - 1,
  empty: content.length === 0,
  numberOfElements: content.length,
  pageable: { pageNumber: number, pageSize: size },
  sort: { sorted: false },
})

const BUSINESS = {
  id: 1,
  name: 'Studio Bella',
  address: 'Calle Mayor 12',
  phone: '910 000 000',
  category: 'Peluquería',
  openingHours: '09:00-18:00',
  ownerId: 7,
  ownerName: 'Propietario Demo',
}

const ROUTES = {
  'POST /api/auth/login': () => (scenario.login === 'fail' ? [401, ''] : [200, { token: 'jwt.demo' }]),
  'POST /api/users': () => (scenario.emailTaken ? [409, 'Email already in use'] : [201, { ...BUSINESS, id: 42, role: 'CLIENT' }]),
  'GET /api/businesses': () => [200, page([BUSINESS])],
  'GET /api/businesses/1/services': () => [200, [{ id: 3, name: 'Corte', description: 'Corte unisex', price: 24.5, duration: 45, businessId: 1, businessName: 'Studio Bella', active: true }]],
  'GET /api/businesses/1/employees': () => [200, [{ id: 9, name: 'Lucía', active: true, businessId: 1, businessName: 'Studio Bella' }]],
  'GET /api/businesses/1/reviews': () => [200, page([{ id: 5, rating: 5, comment: 'Genial', appointmentId: 1, serviceName: 'Corte', employeeName: 'Lucía', clientName: 'Ana' }])],
  // Simula el JwtAuthenticationFilter sin try/catch: un token caducado revienta
  // con 500 en lugar de un 401 limpio.
  'GET /api/businesses/999/reviews': () => (scenario.expiredToken ? [500, ''] : [404, 'Business not found with id: 999']),
  'GET /api/businesses/1/appointments': () => (scenario.forbidden ? [403, "You don't have permission"] : [200, page([{ id: 11, appointmentDateTime: '2026-10-15T10:00:00', status: 'PENDING', userId: 42, userName: 'Ana', serviceOfferingId: 3, serviceOfferingName: 'Corte', employeeId: 9, employeeName: 'Lucía' }])]),
  'GET /api/availability': () => [200, ['09:00', '09:30:00', '10:00']],
  'GET /api/schedules/employee/9': () => [200, [{ id: 2, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '14:00', employeeId: 9, employeeName: 'Lucía' }]],
  'GET /api/appointments/me': () =>
    scenario.noTokenForbidden
      ? [403, '']
      : [200, page([{ id: 11, appointmentDateTime: '2026-10-15T10:00:00', status: 'COMPLETED', userId: 42, userName: 'Ana', serviceOfferingId: 3, serviceOfferingName: 'Corte', employeeId: 9, employeeName: 'Lucía' }])],
  'POST /api/appointments': () => (scenario.slotTaken ? [409, 'Slot not available'] : [201, { id: 12, appointmentDateTime: '2026-10-15T09:00:00', status: 'PENDING', userId: 42, userName: 'Ana', serviceOfferingId: 3, serviceOfferingName: 'Corte', employeeId: 9, employeeName: 'Lucía' }]),
  'PATCH /api/appointments/11/cancel': () => [200, { id: 11, status: 'CANCELLED' }],
  'PATCH /api/appointments/11/status': () => [200, { id: 11, status: 'CONFIRMED' }],
  'POST /api/reviews': () => (scenario.reviewExists ? [409, 'Review already exists in appointment with id: 11'] : [201, { id: 6, rating: 5, comment: 'Top', appointmentId: 11, serviceName: 'Corte', employeeName: 'Lucía', clientName: 'Ana' }]),
  'POST /api/businesses': () => {
    if (scenario.forbiddenEmpty) return [403, '']
    if (scenario.forbidden) return [403, 'Forbidden']
    return [201, { ...BUSINESS, id: 99 }]
  },
  'POST /api/employees': () => [201, { id: 10, name: 'Marta', active: true, businessId: 1, businessName: 'Studio Bella' }],
  'PATCH /api/employees/9/activate': () => [200, { id: 9, active: true }],
  'POST /api/schedules': () => (scenario.overlap ? [409, 'This schedule overlaps with existing schedule'] : [201, { id: 3, dayOfWeek: 'TUESDAY', startTime: '09:00:00', endTime: '14:00:00', employeeId: 9, employeeName: 'Lucía' }]),
  'DELETE /api/schedules/3': () => [204, ''],
  'POST /api/services': () => [201, { id: 4, name: 'Color', description: 'Color completo', price: 69, duration: 120, businessId: 1, businessName: 'Studio Bella', active: true }],
  'PATCH /api/services/4/deactivate': () => [200, { id: 4, active: false }],
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN)
  const path = url.pathname

  const body = await new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => resolve(raw))
  })

  const query = Object.fromEntries(url.searchParams)
  recorded.push({
    method: req.method,
    path,
    query,
    body: body ? JSON.parse(body) : undefined,
    auth: req.headers.authorization || null,
  })

  const handler = ROUTES[`${req.method} ${path}`]
  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end(`Sin mock para ${req.method} ${path}`)
    return
  }

  const [status, payload] = handler()
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(payload === '' ? '' : JSON.stringify(payload))
})

/* ------------------------------------------------------------------ arranque */

await new Promise((resolve, reject) => {
  server.on('error', reject)
  server.listen(PORT, resolve)
})

/* --------------------------------------------------------------- los módulos */

// Importación dinámica para que el stub de `window` esté listo antes.
const { http: client } = await import('../src/lib/api.js')
// Todos los módulos de src/api comparten esta instancia, así que redirigir aquí
// basta para apuntarlos al servidor simulado.
client.defaults.baseURL = ORIGIN

const { authApi, businessApi, appointmentApi, ownerApi, reviewApi } = await import(
  '../src/api/index.js'
)
const { extractApiError } = await import('../src/lib/errors.js')
const { getToken, setToken, clearToken, getSession, setSession } = await import('../src/auth/tokenStore.js')
const { UNAUTHORIZED_EVENT } = await import('../src/lib/constants.js')

let checks = 0
const last = () => recorded[recorded.length - 1]
const check = async (label, fn) => {
  await fn()
  checks += 1
  console.log(`  ok  ${label}`)
}

console.log('contrato HTTP\n')

await check('login devuelve sólo el token', async () => {
  const token = await authApi.login({ email: 'a@b.com', password: 'x' })
  assert.equal(token, 'jwt.demo')
  assert.deepEqual(last().body, { email: 'a@b.com', password: 'x' })
  assert.equal(last().auth, null, 'login no debe llevar Authorization')
})

await check('register envía name/email/password/phone y devuelve el rol', async () => {
  const user = await authApi.register({
    name: 'Ana',
    email: 'a@b.com',
    password: 'x',
    phone: '600',
  })
  assert.equal(user.role, 'CLIENT')
  assert.deepEqual(Object.keys(last().body).sort(), ['email', 'name', 'password', 'phone'])
})

await check('el interceptor añade Authorization: Bearer <token>', async () => {
  setToken('jwt.demo')
  assert.equal(getToken(), 'jwt.demo')
  await businessApi.getBusinessServices(1)
  assert.equal(last().auth, 'Bearer jwt.demo')
})

await check('listBusinesses manda category, page y size', async () => {
  await businessApi.listBusinesses({ category: 'Peluquería', page: 0, size: 10 })
  assert.equal(last().path, '/api/businesses')
  assert.deepEqual(last().query, { category: 'Peluquería', page: '0', size: '10' })
})

await check('listBusinesses devuelve una Page normalizada', async () => {
  const result = await businessApi.listBusinesses({ category: 'Peluquería', page: 0, size: 10 })
  assert.equal(result.content[0].name, 'Studio Bella')
  assert.equal(result.totalElements, 1)
  assert.equal(result.first, true)
})

await check('listAllBusinesses barre las 10 categorías y deduplica', async () => {
  const before = recorded.length
  const result = await businessApi.listAllBusinesses({ page: 0, size: 10 })
  assert.equal(recorded.length - before, 10, 'una petición por categoría')
  assert.equal(result.content.length, 1, 'deduplica el mismo negocio 10 veces')
})

await check('findMyBusinesses filtra por ownerName', async () => {
  const { owned, all } = await businessApi.findMyBusinesses('Propietario Demo')
  assert.equal(owned.length, 1)
  assert.equal(all.length, 1)
  const empty = await businessApi.findMyBusinesses('Nadie')
  assert.equal(empty.owned.length, 0)
})

await check('getAvailability usa employeeId, serviceOfferingId y date ISO', async () => {
  const slots = await appointmentApi.getAvailability({
    employeeId: 9,
    serviceOfferingId: 3,
    date: '2026-10-15',
  })
  assert.deepEqual(last().query, {
    employeeId: '9',
    serviceOfferingId: '3',
    date: '2026-10-15',
  })
  assert.deepEqual(slots, ['09:00', '09:30:00', '10:00'])
})

await check('createAppointment usa serviceId + appointmentDateTime con segundos', async () => {
  await appointmentApi.createAppointment({
    serviceId: 3,
    employeeId: 9,
    appointmentDateTime: '2026-10-15T09:00:00',
  })
  assert.deepEqual(last().body, {
    serviceId: 3,
    employeeId: 9,
    appointmentDateTime: '2026-10-15T09:00:00',
  })
})

await check('createAppointment propaga 409 "Slot not available" en español', async () => {
  scenario.slotTaken = true
  await assert.rejects(
    () =>
      appointmentApi.createAppointment({
        serviceId: 3,
        employeeId: 9,
        appointmentDateTime: '2026-10-15T09:00:00',
      }),
    (error) => {
      assert.equal(error.response.status, 409)
      assert.equal(extractApiError(error), 'Ese horario acaba de ocuparse. Elige otra hora.')
      return true
    },
  )
  scenario.slotTaken = false
})

await check('getMyAppointments pagina y cancel no manda cuerpo', async () => {
  await appointmentApi.getMyAppointments({ page: 0, size: 10 })
  assert.deepEqual(last().query, { page: '0', size: '10' })
  await appointmentApi.cancelAppointment(11)
  assert.equal(last().method, 'PATCH')
  assert.equal(last().body, undefined)
})

await check('updateAppointmentStatus manda { status } en el body', async () => {
  await appointmentApi.updateAppointmentStatus(11, 'CONFIRMED')
  assert.deepEqual(last().body, { status: 'CONFIRMED' })
})

await check('createReview manda appointmentId por query y normaliza el comentario', async () => {
  await reviewApi.createReview({ appointmentId: 11, rating: 5, comment: '  Top  ' })
  assert.deepEqual(last().query, { appointmentId: '11' })
  assert.deepEqual(last().body, { rating: 5, comment: 'Top' })
})

await check('createReview con comentario vacío lo manda como null', async () => {
  await reviewApi.createReview({ appointmentId: 11, rating: 4, comment: '   ' })
  assert.deepEqual(last().body, { rating: 4, comment: null })
})

await check('los endpoints de propietario mandan los ids por query param', async () => {
  await ownerApi.createService({
    businessId: 1,
    name: 'Color',
    description: 'Color completo',
    price: 69,
    duration: 120,
  })
  assert.deepEqual(last().query, { businessId: '1' })

  await ownerApi.createEmployee({ businessId: 1, name: 'Marta' })
  assert.deepEqual(last().query, { businessId: '1' })
  assert.deepEqual(last().body, { name: 'Marta' })

  await ownerApi.createSchedule({
    employeeId: 9,
    dayOfWeek: 'TUESDAY',
    startTime: '09:00:00',
    endTime: '14:00:00',
  })
  assert.deepEqual(last().query, { employeeId: '9' })
  assert.deepEqual(last().body, {
    dayOfWeek: 'TUESDAY',
    startTime: '09:00:00',
    endTime: '14:00:00',
  })
})

await check('los ids de activación van en la URL, no en el body', async () => {
  await ownerApi.setEmployeeActive(9, true)
  assert.equal(last().path, '/api/employees/9/activate')
  assert.equal(last().body, undefined)

  await ownerApi.setServiceActive(4, false)
  assert.equal(last().path, '/api/services/4/deactivate')
})

await check('DELETE de turno acepta 204 sin cuerpo', async () => {
  await ownerApi.deleteSchedule(3)
  assert.equal(last().method, 'DELETE')
})

await check('extractApiError traduce los mensajes del backend', () => {
  const plain = (status, data) => ({ response: { status, data } })
  assert.equal(extractApiError(plain(401, '')), 'Email o contraseña incorrectos.')
  assert.equal(
    extractApiError(plain(409, 'Email already in use')),
    'Ya existe una cuenta con ese email.',
  )
  assert.equal(
    extractApiError(plain(409, 'This schedule overlaps with existing schedule')),
    'Ese tramo se solapa con un horario que ya existe.',
  )
  assert.equal(
    extractApiError(plain(400, 'Appointment status not completed')),
    'Solo puedes reseñar citas completadas.',
  )
  assert.equal(
    extractApiError(plain(403, '')),
    'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  )
  assert.match(extractApiError({ request: {} }), /conectar con el servidor/)
  // Sin cuerpo y sin red tampoco debe romperse.
  assert.equal(typeof extractApiError(null), 'string')
})

await check('un 403 con cuerpo de negocio NO cierra sesión', async () => {
  scenario.forbidden = true
  setToken('jwt.demo')
  await assert.rejects(() => businessApi.getBusinessAppointments({ businessId: 1, page: 0, size: 10 }))
  assert.equal(getToken(), 'jwt.demo', 'el token sigue en su sitio')
  scenario.forbidden = false
})

await check('un 403 vacio CON token no expulsa (es falta de permisos)', async () => {
  scenario.forbiddenEmpty = true
  setToken('jwt.demo')
  setSession({ token: 'jwt.demo', user: { id: 1, role: 'CLIENT' }, role: 'CLIENT' })
  let caught
  try {
    await businessApi.createBusiness({ name: 'Negocio QA' })
  } catch (error) {
    caught = error
  }
  assert.ok(caught, 'la peticion debe fallar')
  assert.equal(getToken(), 'jwt.demo', 'el token debe sobrevivir')
  assert.ok(getSession(), 'la sesion debe sobrevivir')
  assert.equal(extractApiError(caught), 'No tienes permiso para esta acci\u00F3n.')
  scenario.forbiddenEmpty = false
})

await check('un 403 vacio SIN token si limpia la sesion', async () => {
  clearToken()
  setSession({ token: null, user: { id: 1, role: 'CLIENT' }, role: 'CLIENT' })
  scenario.noTokenForbidden = true
  await assert.rejects(() => appointmentApi.getMyAppointments({ page: 0, size: 10 }))
  assert.equal(getToken(), null, 'no habia token')
  assert.equal(getSession(), null, 'sin token, el 403 vacio significa sesion perdida')
  scenario.noTokenForbidden = false
})

await check('un 500 con token sí limpia el token (filtro JWT sin capturar)', async () => {
  const { http } = await import('../src/lib/api.js')
  scenario.expiredToken = true
  setToken('jwt.demo')
  await assert.rejects(() => http.get('/api/businesses/999/reviews'))
  assert.equal(getToken(), null, 'el interceptor limpia el token')
  assert.ok(UNAUTHORIZED_EVENT.length > 0)
  scenario.expiredToken = false
})

await check('sin token no se intenta limpiar nada', async () => {
  const { http } = await import('../src/lib/api.js')
  scenario.expiredToken = true
  clearToken()
  await assert.rejects(() => http.get('/api/businesses/999/reviews'))
  assert.equal(getToken(), null)
  scenario.expiredToken = false
})

server.close()
console.log(`\n${checks} comprobaciones de contrato correctas.`)
