/**
 * Categorías del marketplace.
 *
 * El backend guarda `category` como texto libre y filtra por
 * `findByCategoryIgnoreCase` (coincidencia exacta, solo ignora mayúsculas).
 * No hay enum ni endpoint que las liste, por lo que esta lista es la única
 * fuente de verdad: se usa tanto para filtrar en el listado de clientes como
 * para el selector del formulario de alta de negocio del propietario.
 * Si añades una categoría aquí, aparecerá en ambos sitios.
 */
export const CATEGORIES = [
  { value: 'Peluquería', emoji: '✂️', tint: 'from-rose-100 to-orange-100', emojiClass: 'text-rose-500' },
  { value: 'Barbería', emoji: '💈', tint: 'from-slate-200 to-slate-100', emojiClass: 'text-slate-700' },
  { value: 'Spa', emoji: '🧖', tint: 'from-teal-100 to-emerald-100', emojiClass: 'text-teal-600' },
  { value: 'Estética', emoji: '✨', tint: 'from-pink-100 to-fuchsia-100', emojiClass: 'text-pink-500' },
  { value: 'Masajes', emoji: '💆', tint: 'from-sky-100 to-indigo-100', emojiClass: 'text-sky-600' },
  { value: 'Manicura y pedicura', emoji: '💅', tint: 'from-fuchsia-100 to-purple-100', emojiClass: 'text-fuchsia-500' },
  { value: 'Depilación', emoji: '🪒', tint: 'from-amber-100 to-yellow-100', emojiClass: 'text-amber-600' },
  { value: 'Fisioterapia', emoji: '🏃', tint: 'from-lime-100 to-emerald-100', emojiClass: 'text-lime-600' },
  { value: 'Tatuajes y piercing', emoji: '🖋️', tint: 'from-zinc-200 to-stone-100', emojiClass: 'text-zinc-600' },
  { value: 'Pods', emoji: '🎧', tint: 'from-violet-100 to-purple-100', emojiClass: 'text-violet-600' },
]

/** Índice por valor normalizado para resolver metadata de una categoría. */
const CATEGORY_INDEX = new Map(
  CATEGORIES.map((c) => [c.value.toLowerCase(), c]),
)

export function getCategoryMeta(category) {
  if (!category) return null
  return (
    CATEGORY_INDEX.get(String(category).trim().toLowerCase()) || {
      value: category,
      emoji: '🏷️',
      tint: 'from-slate-100 to-slate-50',
      emojiClass: 'text-slate-500',
    }
  )
}

/** ================= Estados de cita (enum `Status` del backend) ============ */
export const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export const STATUS_META = {
  PENDING: {
    label: 'Pendiente',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Confirmada',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completada',
    badge: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    dot: 'bg-brand-500',
  },
  CANCELLED: {
    label: 'Cancelada',
    badge: 'bg-slate-100 text-slate-500 ring-slate-500/20',
    dot: 'bg-slate-400',
  },
}

export const statusMeta = (status) =>
  STATUS_META[status] || {
    label: status,
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    dot: 'bg-slate-400',
  }

/** ================= Días de la semana (java.time.DayOfWeek) ================ */
export const DAYS_OF_WEEK = [
  { value: 'MONDAY', short: 'Lun', label: 'Lunes' },
  { value: 'TUESDAY', short: 'Mar', label: 'Martes' },
  { value: 'WEDNESDAY', short: 'Mié', label: 'Miércoles' },
  { value: 'THURSDAY', short: 'Jue', label: 'Jueves' },
  { value: 'FRIDAY', short: 'Vie', label: 'Viernes' },
  { value: 'SATURDAY', short: 'Sáb', label: 'Sábado' },
  { value: 'SUNDAY', short: 'Dom', label: 'Domingo' },
]

/** ================= Roles (enum `Role` del backend) ======================== */
export const ROLES = { CLIENT: 'CLIENT', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' }

export const ROLE_LABELS = {
  CLIENT: 'Cliente',
  BUSINESS_OWNER: 'Propietario',
  ADMIN: 'Administrador',
}
