import { pageWindow } from '../../lib/pagination'

/**
 * Paginador. Los números de página son 0-based porque así espera el backend
 * (`?page=0&size=10`), pero se muestran 1-based porque es lo que ve la persona.
 */
export default function Pagination({ page, totalPages, totalElements, onChange, className = '' }) {
  if (totalPages <= 1) {
    if (!totalElements) return null
    return (
      <p className={`text-center text-xs text-slate-500 sm:text-left ${className}`}>
        {totalElements} {totalElements === 1 ? 'resultado' : 'resultados'}
      </p>
    )
  }

  const pages = pageWindow(page, totalPages)

  const buttonBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-semibold transition'

  const navButton = (label, target, disabled) => (
    <button
      type="button"
      onClick={() => onChange(target)}
      disabled={disabled}
      aria-label={label}
      className={`${buttonBase} ${
        disabled
          ? 'cursor-not-allowed text-slate-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  )

  return (
    <nav
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}
      aria-label="Paginación"
    >
      <p className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-700">{page + 1}</span> de{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span> ·{' '}
        {totalElements} {totalElements === 1 ? 'resultado' : 'resultados'}
      </p>

      <div className="flex items-center gap-1">
        {navButton('‹', page - 1, page <= 0)}

        {pages.map((index, position) => {
          const previous = pages[position - 1]
          const showGap = previous !== undefined && index - previous > 1
          const isActive = index === page
          return (
            <span key={index} className="flex items-center gap-1">
              {showGap && <span className="px-1 text-slate-400">…</span>}
              <button
                type="button"
                onClick={() => onChange(index)}
                aria-current={isActive ? 'page' : undefined}
                className={`${buttonBase} ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {index + 1}
              </button>
            </span>
          )
        })}

        {navButton('›', page + 1, page >= totalPages - 1)}
      </div>
    </nav>
  )
}
