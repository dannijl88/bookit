const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ' +
  'disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-brand-500 whitespace-nowrap'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:bg-brand-800',
  secondary:
    'bg-white text-slate-800 ring-1 ring-slate-300 ring-inset hover:bg-slate-50 hover:ring-slate-400',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50',
}

const SIZES = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClasses({ variant = 'primary', size = 'md', full = false } = {}) {
  return [BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, full && 'w-full']
    .filter(Boolean)
    .join(' ')
}

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${buttonClasses({ variant, size, full })} ${className}`}
      {...rest}
    >
      {loading && <Spinner small />}
      {children}
    </button>
  )
}

export function Spinner({ small = false, className = '' }) {
  return (
    <svg
      className={`animate-spin ${small ? 'h-4 w-4' : 'h-6 w-6'} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
