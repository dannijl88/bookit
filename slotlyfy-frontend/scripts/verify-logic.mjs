/**
 * Comprobaciones rápidas de la lógica pura (fechas, slots y paginación).
 * Se ejecuta con `npm run verify:logic` y no necesita el backend.
 */
import assert from 'node:assert/strict'
import {
  buildAppointmentDateTime,
  formatDate,
  formatDuration,
  formatPrice,
  isSlotInPast,
  normalizeSlot,
  slotToShortTime,
  toDateInputValue,
} from '../src/lib/format.js'
import { buildPage, dedupeAndSort, toPage, pageWindow } from '../src/lib/pagination.js'

let checks = 0
const check = (label, fn) => {
  fn()
  checks += 1
  console.log(`  ok  ${label}`)
}

console.log('format.js')

check('normalizeSlot añade los segundos que Jackson omite', () => {
  // LocalTime se serializa como "09:00" (sin segundos) cuando son cero.
  assert.equal(normalizeSlot('09:00'), '09:00:00')
  assert.equal(normalizeSlot('09:30:00'), '09:30:00')
  assert.equal(normalizeSlot('18:05'), '18:05:00')
  assert.equal(normalizeSlot(null), null)
})

check('buildAppointmentDateTime produce el LocalDateTime que exige el backend', () => {
  assert.equal(buildAppointmentDateTime('2026-10-15', '09:00'), '2026-10-15T09:00:00')
  assert.equal(buildAppointmentDateTime('2026-10-15', '09:30:00'), '2026-10-15T09:30:00')
})

check('slotToShortTime quita los segundos para la UI', () => {
  assert.equal(slotToShortTime('09:00:00'), '09:00')
})

check('toDateInputValue usa la fecha local (no UTC)', () => {
  // Medianoche local: con toISOString() esta fecha "retrocedería" un día.
  const date = new Date(2026, 0, 1, 0, 0, 0)
  assert.equal(toDateInputValue(date), '2026-01-01')
})

check('isSlotInPast detecta horas ya pasadas de hoy', () => {
  const today = toDateInputValue(new Date())
  const past = new Date(Date.now() - 60 * 60 * 1000)
  const pastSlot = `${String(past.getHours()).padStart(2, '0')}:${String(
    past.getMinutes(),
  ).padStart(2, '0')}`
  assert.equal(isSlotInPast(today, pastSlot), true)

  const future = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const futureSlot = `${String(future.getHours()).padStart(2, '0')}:${String(
    future.getMinutes(),
  ).padStart(2, '0')}`
  assert.equal(isSlotInPast(today, futureSlot), false)
  assert.equal(isSlotInPast('2020-01-01', '10:00'), true)
})

check('formatDate parsea sin corrimiento de zona horaria', () => {
  // El backend manda "2026-10-15T10:00:00" sin offset.
  assert.match(formatDate('2026-10-15T10:00:00', { day: '2-digit' }), /15/)
  assert.equal(formatPrice(24.5).includes('24'), true)
  assert.equal(formatDuration(45), '45 min')
  assert.equal(formatDuration(90), '1 h 30 min')
  assert.equal(formatDuration(120), '2 h')
})

console.log('pagination.js')

check('toPage lee el Page de Spring Data', () => {
  const page = toPage({
    content: [{ id: 1 }],
    number: 1,
    size: 10,
    totalElements: 25,
    totalPages: 3,
    first: false,
    last: false,
    empty: false,
    numberOfElements: 10,
  })
  assert.equal(page.totalElements, 25)
  assert.equal(page.content.length, 1)
})

check('toPage tolera respuestas sin Page', () => {
  const page = toPage(undefined)
  assert.deepEqual(page.content, [])
  assert.equal(page.totalPages, 0)
})

check('buildPage pagina en memoria la vista "Todos"', () => {
  const items = Array.from({ length: 25 }, (_, index) => ({ id: index }))
  const first = buildPage(items, 0, 10)
  assert.equal(first.content.length, 10)
  assert.equal(first.totalPages, 3)
  assert.equal(first.first, true)
  assert.equal(first.last, false)

  const last = buildPage(items, 2, 10)
  assert.equal(last.content.length, 5)
  assert.equal(last.last, true)
})

check('buildPage no deja páginas fuera de rango', () => {
  const page = buildPage([{ id: 1 }], 9, 10)
  assert.equal(page.number, 0)
  assert.equal(page.content.length, 1)
})

check('dedupeAndSort elimina ids repetidos y ordena por nombre', () => {
  const merged = dedupeAndSort([
    { id: 2, name: 'Zen' },
    { id: 1, name: 'Aura' },
    { id: 2, name: 'Zen duplicado' },
  ])
  assert.equal(merged.length, 2)
  assert.equal(merged[0].name, 'Aura')
})

check('pageWindow colapsa páginas lejanas con guiones', () => {
  assert.deepEqual(pageWindow(0, 10), [0, 1, 9])
  assert.deepEqual(pageWindow(5, 10), [0, 4, 5, 6, 9])
})

console.log(`\n${checks} comprobaciones correctas.`)
