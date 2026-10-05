import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-tight text-slate-900">Slotlyfy</p>
          <p className="mt-1 text-xs text-slate-500">
            Reserva online en peluquerías, barberías y spas.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Enlaces del pie">
          <Link to="/businesses" className="text-slate-500 transition hover:text-slate-900">
            Explorar negocios
          </Link>
          <Link to="/mis-citas" className="text-slate-500 transition hover:text-slate-900">
            Mis citas
          </Link>
          <Link to="/panel" className="text-slate-500 transition hover:text-slate-900">
            Panel de negocio
          </Link>
        </nav>
      </div>
    </footer>
  )
}
