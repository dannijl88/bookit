import { useState } from 'react'
import { Link } from 'react-router-dom'
import { businessApi } from '../../api'
import { useOwner } from './OwnerContext'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import { CATEGORIES, getCategoryMeta } from '../../lib/domain'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormControls'
import { Alert } from '../../components/ui/Feedback'

const EMPTY = { name: '', address: '', phone: '', category: '', openingHours: '' }

/**
 * Alta y resumen de la ficha del negocio.
 *
 * POST /api/businesses sólo admite BUSINESS_OWNER (el owner se toma del token,
 * nunca del body) y el backend no ofrece ningún endpoint de actualización de
 * negocio, así que una vez creada la ficha es de sólo lectura aquí.
 */
export default function OwnerBusinessPage() {
  const { business, reload, ownerName } = useOwner()

  if (business) return <BusinessSummary business={business} />

  return <CreateBusinessForm onCreated={reload} ownerName={ownerName} />
}

function BusinessSummary({ business }) {
  const meta = getCategoryMeta(business.category)

  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-br ${meta?.tint} px-6 py-7`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl" aria-hidden="true">
            {meta?.emoji}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              {business.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{business.category}</p>
          </div>
        </div>
      </div>

      <dl className="grid gap-5 p-6 sm:grid-cols-2">
        <Detail label="Dirección" value={business.address} />
        <Detail label="Teléfono" value={business.phone} />
        <Detail label="Horario de apertura" value={business.openingHours} />
        <Detail label="Propietario" value={business.ownerName} />
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
        <Link
          to={`/businesses/${business.id}`}
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Ver la ficha pública →
        </Link>
        <span className="text-sm text-slate-400">·</span>
        <span className="text-xs text-slate-500">
          El backend no permite editar el negocio una vez creado.
        </span>
      </div>
    </Card>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function CreateBusinessForm({ onCreated, ownerName }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Escribe el nombre del negocio.'
    if (!form.address.trim()) next.address = 'Escribe la dirección.'
    if (!form.phone.trim()) next.phone = 'Escribe un teléfono de contacto.'
    if (!form.category) next.category = 'Elige la categoría del negocio.'
    if (!form.openingHours.trim()) next.openingHours = 'Indica el horario (ej. 09:00-18:00).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const created = await businessApi.createBusiness({
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        category: form.category,
        openingHours: form.openingHours.trim(),
      })
      toast.success('¡Negocio creado! Ya puedes añadir servicios y equipo.')
      setForm(EMPTY)
      onCreated?.()
      return created
    } catch (error) {
      setFormError(extractApiError(error, 'No hemos podido crear el negocio.'))
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Crea la ficha de tu negocio</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          La categoría determina cómo aparecerán tus negocios en el listado de clientes, así que
          elige con cuidado.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}

          <Input
            label="Nombre del negocio"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            placeholder="Studio Bella"
            required
          />

          <Input
            label="Dirección"
            value={form.address}
            onChange={update('address')}
            error={errors.address}
            placeholder="Calle Mayor 12, Madrid"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Teléfono"
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
              placeholder="910 000 000"
              required
            />
            <Input
              label="Horario de apertura"
              value={form.openingHours}
              onChange={update('openingHours')}
              error={errors.openingHours}
              placeholder="09:00-18:00"
              required
            />
          </div>

          <Select
            label="Categoría"
            value={form.category}
            onChange={update('category')}
            error={errors.category}
            placeholder="Selecciona una categoría"
            required
            hint="Las mismas categorías del filtro de clientes."
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.emoji} {category.value}
              </option>
            ))}
          </Select>

          <Button type="submit" loading={submitting} size="lg">
            {submitting ? 'Creando…' : 'Crear negocio'}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Alert tone="info" title="Cómo encaja con el backend">
          <ul className="mt-1 list-disc space-y-1.5 pl-4">
            <li>El propietario se toma del token: no se puede suplantar.</li>
            <li>Sin endpoint de alta de propietarios, el registro siempre crea CLIENT.</li>
            <li>No hay actualización de negocio: los datos son de sólo lectura.</li>
          </ul>
        </Alert>

        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900">Siguientes pasos</h3>
          <ol className="mt-3 space-y-2.5 text-sm text-slate-600">
            {[
              'Añade tus servicios con precio y duración.',
              'Registra a tu equipo y su horario semanal.',
              'Gestiona las citas que lleguen desde la web.',
            ].map((text, index) => (
              <li key={text} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          {ownerName && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Tu ficha quedará asociada a <strong>{ownerName}</strong>.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
