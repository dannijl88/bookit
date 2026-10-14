import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../lib/domain'
import { Card } from '../components/ui/Card'
import { buttonClasses } from '../components/ui/Button'

/** Si ya hay sesión, no tiene sentido mostrar login/registro. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/mis-citas" replace />
  return <Outlet />
}

/** Exige sesión iniciada. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** Exige sesión y un rol concreto (por defecto, propietario). */
export function RoleRoute({ role = ROLES.BUSINESS_OWNER }) {
  const { isAuthenticated, role: currentRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (currentRole !== role) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card className="p-8 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
            🔒
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Área exclusiva de propietarios
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Tu cuenta no tiene el rol de propietario. Si gestionas un negocio, crea una cuenta
            de negocio para publicar tu ficha y gestionar tus citas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/businesses" className={buttonClasses({ variant: 'secondary' })}>
              Volver a los negocios
            </Link>
            <Link to="/mis-citas" className={buttonClasses()}>
              Ver mis citas
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return <Outlet />
}
