import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABELS } from '../../lib/domain'
import Button from '../ui/Button'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Slotlyfy, ir al inicio">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect
            x="3.5"
            y="5"
            width="17"
            height="16"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3.5 10h17M9 3.5v3M15 3.5v3M8.75 14.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">Slotlyfy</span>
    </Link>
  )
}

const navLinkClasses = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Navbar() {
  const { isAuthenticated, user, role, isOwner, isDemoOwner, logout, setDemoOwnerMode } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Cerramos los menús al navegar.
  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!userMenuOpen) return undefined
    const onClickOutside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [userMenuOpen])

  const links = [
    { to: '/businesses', label: 'Negocios' },
    ...(isAuthenticated ? [{ to: '/mis-citas', label: 'Mis citas' }] : []),
    ...(isOwner ? [{ to: '/panel', label: 'Panel' }] : []),
  ]

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={() => navigate('/registro')}>
                Crear cuenta
              </Button>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pr-2 pl-1.5 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                  {initials(user)}
                </span>
                <span className="max-w-32 text-left">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {displayName(user)}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {ROLE_LABELS[role] || 'Cliente'}
                  </span>
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 text-slate-400 transition ${userMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName(user)}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDemoOwnerMode(!isDemoOwner)
                        setUserMenuOpen(false)
                      }}
                      className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="mt-0.5">
                        <Toggle on={isDemoOwner} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          Modo propietario
                        </span>
                        <span className="block text-xs text-slate-500">
                          Activa el panel de gestión para la demo
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-4 w-4 text-slate-400"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 17H5.5A1.5 1.5 0 0 1 4 15.5v-11A1.5 1.5 0 0 1 5.5 3H8m3.5 4L15 10.5 11.5 14m1-7H15.5A1.5 1.5 0 0 1 17 8.5v3a1.5 1.5 0 0 1-1.5 1.5H12.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden="true">
            {menuOpen ? (
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 border-t border-slate-100 pt-3">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate('/registro')}>
                  Crear cuenta
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName(user)}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setDemoOwnerMode(!isDemoOwner)}
                  >
                    {isDemoOwner ? 'Salir de modo propietario' : 'Modo propietario'}
                  </Button>
                  <Button variant="ghost" size="xs" onClick={handleLogout}>
                    Salir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isDemoOwner && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800 sm:px-6">
          Modo demo: el rol <strong>propietario</strong> está simulado en el navegador. El JWT
          del backend no incluye el rol y el registro siempre crea clientes.
        </div>
      )}
    </header>
  )
}

function Toggle({ on }) {
  return (
    <span
      className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
        on ? 'bg-brand-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          on ? 'translate-x-4' : ''
        }`}
      />
    </span>
  )
}

function displayName(user) {
  if (!user) return 'Cuenta'
  if (user.name && user.name !== user.email) return user.name
  return user.email?.split('@')[0] || 'Cuenta'
}

function initials(user) {
  const source = user?.name && user.name !== user.email ? user.name : user?.email || '?'
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
