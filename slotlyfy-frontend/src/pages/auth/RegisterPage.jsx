import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { extractApiError } from '../../lib/errors'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/FormControls'
import { Alert } from '../../components/ui/Feedback'
import { AuthAside } from './AuthAside'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { name: '', email: '', phone: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * El backend no devuelve los mensajes de Bean Validation (no hay handler de
   * MethodArgumentNotValidException y `server.error.include-message=never`),
   * así que toda la validación útil tiene que ocurrir aquí.
   */
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Escribe tu nombre.'
    if (!form.email.trim()) next.email = 'Escribe tu email.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'El email no tiene un formato válido.'
    if (!form.phone.trim()) next.phone = 'Escribe un teléfono de contacto.'
    if (!form.password) next.password = 'Elige una contraseña.'
    else if (form.password.length < 6) next.password = 'Debe tener al menos 6 caracteres.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Las contraseñas no coinciden.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      navigate('/businesses', { replace: true })
    } catch (error) {
      setFormError(extractApiError(error, 'No hemos podido crear tu cuenta.'))
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
      <AuthAside
        title="Crea tu cuenta"
        subtitle="Reserva en segundos en los mejores negocios de servicios de tu ciudad."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <Input
          label="Nombre"
          name="name"
          autoComplete="name"
          placeholder="Ana García"
          value={form.name}
          onChange={update('name')}
          error={errors.name}
          required
        />

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
          label="Teléfono"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="600 123 456"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
          />
          <Input
            label="Repite la contraseña"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
        </div>

        <p className="text-xs text-slate-500">
          Al crear la cuenta se registra como <strong className="font-semibold">cliente</strong>.
          Si además gestionas un negocio, activa el modo propietario desde tu menú para ver el
          panel de gestión.
        </p>

        <Button type="submit" size="lg" full loading={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
