import { Spinner } from './Button'

const ALERT_TONES = {
  error: 'bg-rose-50 text-rose-800 ring-rose-600/15',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
  info: 'bg-brand-50 text-brand-800 ring-brand-600/15',
  warning: 'bg-amber-50 text-amber-900 ring-amber-600/15',
}

const ALERT_ICONS = {
  error: (
    <path d="M10 6.5v4m0 3h.01M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" />
  ),
  success: <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />,
  info: (
    <path d="M10 9v5m0-8h.01M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" />
  ),
  warning: (
    <path d="M10 6.5v4m0 3h.01M8.7 3.3 2.6 14a1.5 1.5 0 0 0 1.3 2.3h12.2a1.5 1.5 0 0 0 1.3-2.3L11.3 3.3a1.5 1.5 0 0 0-2.6 0Z" />
  ),
}

export function Alert({ tone = 'info', title, children, className = '', onDismiss }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-inset ${
        ALERT_TONES[tone] || ALERT_TONES.info
      } ${className}`}
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {ALERT_ICONS[tone] || ALERT_ICONS.info}
      </svg>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : 'font-medium'}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 rounded-lg p-1 opacity-60 transition hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" fill="none" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function LoadingBlock({ label = 'Cargando…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <Spinner className="text-brand-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingBlock label={label} />
    </div>
  )
}

export function EmptyState({ icon = '📭', title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center ${className}`}
    >
      <span className="mb-3 text-3xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />
}
