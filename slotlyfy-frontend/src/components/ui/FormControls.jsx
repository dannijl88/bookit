import { useId } from 'react'

const CONTROL =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 ' +
  'shadow-xs transition placeholder:text-slate-400 ' +
  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

const INVALID = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'

/** Label + control + mensaje de error, con los atributos a11y ya conectados. */
export function Field({ label, htmlFor, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function Input({ label, error, hint, required, className = '', id, ...rest }) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <input
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        className={`${CONTROL} h-11 ${error ? INVALID : ''}`}
        {...rest}
      />
    </Field>
  )
}

export function Textarea({ label, error, hint, required, className = '', id, rows = 4, ...rest }) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={`${CONTROL} resize-y py-2.5 leading-relaxed ${error ? INVALID : ''}`}
        {...rest}
      />
    </Field>
  )
}

export function Select({
  label,
  error,
  hint,
  required,
  className = '',
  id,
  children,
  placeholder,
  ...rest
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          className={`${CONTROL} h-11 appearance-none pr-10 ${
            error ? INVALID : ''
          } ${placeholder ? 'text-slate-400' : ''}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </Field>
  )
}
