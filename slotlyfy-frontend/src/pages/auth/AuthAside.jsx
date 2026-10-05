/** Columna izquierda compartida por login y registro. */
export function AuthAside({ title, subtitle, children }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      {children}
    </div>
  )
}
