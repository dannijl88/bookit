import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homePathForRole, ROLES } from '../lib/domain'

/** Si ya hay sesión, no tiene sentido mostrar login/registro. */
export function GuestRoute() {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated) return <Navigate to={homePathForRole(role)} replace />
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

/**
 * Exige sesión y un rol concreto (por defecto, propietario). Si el rol no
 * coincide llevamos al usuario a SU área (el propietario al panel, el cliente a
 * "Mis citas"): así nadie aterriza en una pantalla que el backend le va a
 * responder con 403.
 */
export function RoleRoute({ role = ROLES.BUSINESS_OWNER }) {
  const { isAuthenticated, role: currentRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (currentRole !== role) {
    return <Navigate to={homePathForRole(currentRole)} replace />
  }

  return <Outlet />
}
