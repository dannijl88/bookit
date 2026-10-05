import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

const TONES = {
  success: {
    ring: 'ring-emerald-600/15 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    path: 'm4.5 10.5 3.5 3.5 7.5-7.5',
  },
  error: {
    ring: 'ring-rose-600/15 bg-rose-50 text-rose-900',
    icon: 'text-rose-600',
    path: 'M10 6.5v4m0 3h.01',
  },
  info: {
    ring: 'ring-brand-600/15 bg-brand-50 text-brand-900',
    icon: 'text-brand-600',
    path: 'M10 9v5m0-8h.01',
  },
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message, tone = 'info', duration = 4000) => {
      nextId += 1
      const id = nextId
      setToasts((current) => [...current, { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error', 5000),
      info: (message) => push(message, 'info'),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast) => {
            const config = TONES[toast.tone] || TONES.info
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lift ring-1 ring-inset ${config.ring}`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`mt-0.5 h-4 w-4 shrink-0 ${config.icon}`}
                  aria-hidden="true"
                >
                  <path d={config.path} />
                </svg>
                <span className="min-w-0 flex-1">{toast.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="-m-1 rounded-lg p-1 opacity-50 transition hover:opacity-100"
                  aria-label="Cerrar aviso"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      d="m5 5 10 10M15 5 5 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return context
}
