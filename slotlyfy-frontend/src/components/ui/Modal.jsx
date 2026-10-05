import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
}

/**
 * Diálogo modal con cierre por Escape / clic en el fondo, bloqueo de scroll y
 * foco en el primer control. Se monta en un portal para no quedar atrapado
 * dentro de contenedores con `overflow` de las tarjetas.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)

    const focusTarget = panelRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusTarget?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Diálogo'}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-pop sm:rounded-2xl ${SIZES[size]}`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-m-1.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
