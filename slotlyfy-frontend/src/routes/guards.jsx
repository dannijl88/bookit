import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../lib/domain'
import { Card } from '../components/ui/Card'
import Button, { buttonClasses } from '../components/ui/Button'

/** Requiere sesión. Guarda el destino para volver a él tras el login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** Requiere sesión + un rol concreto (sólo el panel de propietario). */
export function RoleRoute({ role = ROLES.BUSINESS_OWNER }) {
  const { isAuthenticated, role: currentRole, isDemoOwner, setDemoOwnerMode } = useAuth()
  const navigate = useNavigate()
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
            Esta cuenta está registrada como cliente, así que no puede gestionar negocios,
            empleados ni citas.
          </p>

          {isDemoOwner ? null : (
            <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-left">
              <p className="text-sm font-semibold text-amber-900">Nota para la demo</p>
              <p className="mt-1 text-sm text-amber-800">
                El backend no permite crear cuentas de propietario (el registro siempre asigna
                el rol <code className="font-semibold">CLIENT</code>), y el JWT no incluye el
                rol. Puedes activar el modo propietario para enseñar el panel.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setDemoOwnerMode(true)
                  navigate('/panel')
                }}
              >
                Activar modo propietario
              </Button>
            </div>
          )}

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

/** Si ya hay sesión, no tiene sentido mostrar login/registro. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/mis-citas" replace />
  return <Outlet />
}
