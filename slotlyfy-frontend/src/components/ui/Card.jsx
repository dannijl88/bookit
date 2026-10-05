import { useState } from 'react'
import { getCategoryMeta, statusMeta } from '../../lib/domain'

export function Card({ as: Tag = 'div', className = '', hover = false, children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-slate-200 bg-white shadow-card ${
        hover
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status, className = '' }) {
  const meta = statusMeta(status)
  return (
    <Badge className={`${meta.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </Badge>
  )
}

export function CategoryBadge({ category, className = '' }) {
  const meta = getCategoryMeta(category)
  return (
    <Badge className={`bg-slate-100 text-slate-700 ring-slate-500/15 ${className}`}>
      <span aria-hidden="true">{meta?.emoji}</span>
      {category}
    </Badge>
  )
}

export function SectionHeading({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* --------------------------------------------------------------- estrellas */

function Star({ filled }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M10 1.8l2.35 4.76 5.25.77-3.8 3.7.9 5.23L10 13.79l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77L10 1.8Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth="1.4"
        className={filled ? 'text-amber-400' : 'text-slate-300'}
      />
    </svg>
  )
}

export function Stars({ value = 0, showValue = false, className = '' }) {
  const numeric = Number(value) || 0
  const rounded = Math.round(numeric)
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} filled={star <= rounded} />
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm font-semibold text-slate-700">{numeric.toFixed(1)}</span>
      )}
      <span className="sr-only">{numeric.toFixed(1)} de 5 estrellas</span>
    </span>
  )
}

const STAR_LABELS = ['Muy mal', 'Malo', 'Regular', 'Bueno', 'Excelente']

/** Selector de estrellas para dejar reseña (controlado). */
export function StarPicker({ value, onChange, disabled = false, className = '' }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'} — ${STAR_LABELS[star - 1]}`}
            aria-pressed={value === star}
            className="rounded-lg p-1 transition enabled:hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star filled={star <= active} />
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="mt-1 text-xs font-medium text-slate-500">{STAR_LABELS[value - 1]}</p>
      )}
    </div>
  )
}
