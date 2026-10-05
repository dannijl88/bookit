import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/layout/Layout'
import { GuestRoute, ProtectedRoute, RoleRoute } from './routes/guards'
import { ToastProvider } from './hooks/useToast'
import { ROLES } from './lib/domain'
import { OwnerProvider } from './pages/owner/OwnerContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

/* Catálogo y panel se cargan bajo demanda para aligerar el primer render. */
const BusinessListPage = lazy(() => import('./pages/businesses/BusinessListPage'))
const BusinessDetailPage = lazy(() => import('./pages/businesses/BusinessDetailPage'))
const MyAppointmentsPage = lazy(() => import('./pages/client/MyAppointmentsPage'))
const OwnerLayout = lazy(() => import('./pages/owner/OwnerLayout'))
const OwnerBusinessPage = lazy(() => import('./pages/owner/OwnerBusinessPage'))
const OwnerServicesPage = lazy(() => import('./pages/owner/OwnerServicesPage'))
const OwnerTeamPage = lazy(() => import('./pages/owner/OwnerTeamPage'))
const OwnerAppointmentsPage = lazy(() => import('./pages/owner/OwnerAppointmentsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="businesses" element={<BusinessListPage />} />
              <Route path="businesses/:businessId" element={<BusinessDetailPage />} />

              <Route element={<GuestRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="mis-citas" element={<MyAppointmentsPage />} />

                {/*
                  El panel exige el rol BUSINESS_OWNER y comparte un Provider
                  porque las cuatro pestañas necesitan resolver "mi negocio"
                  con una única llamada al catálogo.

                  RoleRoute y OwnerProvider van como rutas sin path: los guards
                  sólo renderizan su <Outlet />, así que hay que componerlos
                  con `element` y no pasarles hijos.
                */}
                <Route element={<RoleRoute role={ROLES.BUSINESS_OWNER} />}>
                  <Route element={<OwnerProvider />}>
                    <Route path="panel" element={<OwnerLayout />}>
                      <Route index element={<OwnerBusinessPage />} />
                      <Route path="servicios" element={<OwnerServicesPage />} />
                      <Route path="equipo" element={<OwnerTeamPage />} />
                      <Route path="citas" element={<OwnerAppointmentsPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
