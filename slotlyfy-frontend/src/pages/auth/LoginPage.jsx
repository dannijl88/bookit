import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { extractApiError } from '../../lib/errors'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/FormControls'
import { Alert } from '../../components/ui/Feedback'
import { AuthAside } from './AuthAside'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = location.state?.from || '/mis-citas'

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Escribe tu email.'
    if (!form.password) next.password = 'Escribe tu contraseña.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(destination, { replace: true })
    } catch (error) {
      // 401 con cuerpo vacío en el backend -> mensaje genérico de credenciales.
      setFormError(extractApiError(error, 'No hemos podido iniciar sesión.'))
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-16">
      <div className="order-2 lg:order-1">
        <AuthAside
          title="Hola de nuevo"
          subtitle="Accede a tus citas, revisa tus reservas y gestiona tu perfil."
        />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
          />

          <Button type="submit" size="lg" full loading={submitting}>
            {submitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            ¿Todavía no tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-brand-700 hover:text-brand-800">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-8 text-white shadow-pop sm:p-10">
            <div
              className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-inset ring-white/15">
                Panel de negocio
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
                ¿Tienes un peluquería, un spa o una barbería?
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-brand-100/90">
                Crea tu ficha, publica tus servicios, define el horario de tu equipo y gestiona
                las citas desde un único panel.
              </p>

              <ul className="mt-7 space-y-3.5 text-sm">
                {[
                  ['📅', 'Disponibilidad real en tiempo real'],
                  ['👥', 'Equipo con horarios semanales'],
                  ['⭐', 'Reseñas de tus clientes'],
                ].map(([emoji, text]) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base ring-1 ring-inset ring-white/10">
                      {emoji}
                    </span>
                    <span className="text-brand-50">{text}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/registro"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Empezar ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
