/* Helpers de formato. Todo en es-ES y usando la zona horaria local. */

const LOCALE = 'es-ES'

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

export function formatPrice(value) {
  const number = Number(value)
  return money.format(Number.isFinite(number) ? number : 0)
}

export function formatDuration(minutes) {
  const total = Number(minutes)
  if (!Number.isFinite(total) || total <= 0) return '—'
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours && rest) return `${hours} h ${rest} min`
  if (hours) return `${hours} h`
  return `${rest} min`
}

/* ------------------------------------------------------------------ fechas */

/**
 * `toISOString()` convierte a UTC y puede desplazar el día/hora, así que
 * construimos las cadenas `YYYY-MM-DD` con las partes locales.
 */
export function toDateInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
  return next
}

/** Parseo seguro de `YYYY-MM-DDTHH:mm:ss` (el backend no manda offset). */
export function parseLocalDateTime(value) {
  if (!value) return null
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  )
  if (!match) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  const [, y, m, d, hh, mm, ss = '0'] = match
  return new Date(+y, +m - 1, +d, +hh, +mm, +ss)
}

export function formatDate(value, options) {
  const date = parseLocalDateTime(value)
  if (!date) return '—'
  return date.toLocaleDateString(LOCALE, options || { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatLongDate(value) {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTime(value) {
  const date = parseLocalDateTime(value)
  if (!date) return '—'
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(value) {
  const date = parseLocalDateTime(value)
  if (!date) return '—'
  return date.toLocaleString(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "Hoy", "Mañana", "Ayer" o la fecha corta. */
export function relativeDayLabel(value) {
  const date = parseLocalDateTime(value)
  if (!date) return ''
  const today = startOfToday()
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((target - today) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays === -1) return 'Ayer'
  return formatDate(date)
}

/* ------------------------------------------------------------------- horas */

/**
 * El backend devuelve `LocalTime` como "09:00" (omite los segundos cuando son
 * cero) o "09:30:00". `AppointmentRequestDto` es un `LocalDateTime` y exige
 * segundos, así que normalizamos siempre a HH:mm:ss.
 */
export function normalizeSlot(value) {
  if (!value) return null
  const [h, m = '00', s = '00'] = String(value).split(':')
  if (Number.isNaN(Number(h))) return null
  return `${h.padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function slotToShortTime(value) {
  const normalized = normalizeSlot(value)
  return normalized ? normalized.slice(0, 5) : '—'
}

/** Combina fecha `YYYY-MM-DD` + hora `HH:mm:ss` en el payload de cita. */
export function buildAppointmentDateTime(dateValue, slot) {
  const normalized = normalizeSlot(slot)
  if (!dateValue || !normalized) return null
  return `${dateValue}T${normalized}`
}

export function isSlotInPast(dateValue, slot) {
  const normalized = normalizeSlot(slot)
  if (!dateValue || !normalized) return false
  const [h, m, s] = normalized.split(':').map(Number)
  const target = new Date(
    +dateValue.slice(0, 4),
    +dateValue.slice(5, 7) - 1,
    +dateValue.slice(8, 10),
    h,
    m,
    s,
  )
  return target.getTime() <= Date.now()
}
