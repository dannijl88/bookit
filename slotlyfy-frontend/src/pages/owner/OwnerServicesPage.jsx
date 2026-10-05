import { useState } from 'react'
import { businessApi, ownerApi } from '../../api'
import useAsync from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import { formatDuration, formatPrice } from '../../lib/format'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/FormControls'
import { Alert, EmptyState, LoadingBlock } from '../../components/ui/Feedback'
import EmptyBusinessState from './EmptyBusinessState'
import { useOwner } from './OwnerContext'

const EMPTY = { name: '', description: '', price: '', duration: '45' }

const PRESETS = [
  { label: 'Corte + lavado', price: '24.50', duration: '45' },
  { label: 'Color completo', price: '69.00', duration: '120' },
  { label: 'Manicura', price: '18.00', duration: '45' },
  { label: 'Masaje 30 min', price: '32.00', duration: '30' },
]

export default function OwnerServicesPage() {
  const { business } = useOwner()
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const services = useAsync(
    () => (business ? businessApi.getBusinessServices(business.id) : Promise.resolve([])),
    [business?.id],
    { immediate: Boolean(business) },
  )

  if (!business) return <EmptyBusinessState />

  const list = services.data || []

  /**
   * Validación local obligatoria: el backend no devuelve los mensajes de Bean
   * Validation, y exige price >= 0.1 y duration >= 30 minutos.
   */
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Escribe el nombre del servicio.'
    if (!form.description.trim()) next.description = 'Describe el servicio.'

    const price = Number(form.price)
    if (!form.price.trim()) next.price = 'Indica el precio.'
    else if (!Number.isFinite(price) || price < 0.1) next.price = 'El precio mínimo es 0,10 €.'

    const duration = Number(form.duration)
    if (!form.duration.trim()) next.duration = 'Indica la duración.'
    else if (!Number.isInteger(duration) || duration < 30) {
      next.duration = 'La duración mínima es de 30 minutos.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await ownerApi.createService({
        businessId: business.id,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
      })
      toast.success(`Servicio "${form.name.trim()}" añadido.`)
      setForm(EMPTY)
      services.reload()
    } catch (error) {
      setFormError(extractApiError(error, 'No hemos podido crear el servicio.'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (service) => {
    setBusyId(service.id)
    try {
      await ownerApi.setServiceActive(service.id, !service.active)
      toast.success(service.active ? 'Servicio desactivado.' : 'Servicio activado.')
      services.reload()
    } catch (error) {
      toast.error(extractApiError(error, 'No hemos podido cambiar el servicio.'))
    } finally {
      setBusyId(null)
    }
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Servicios publicados</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sólo los servicios activos aparecen en la ficha pública y admiten reservas.
        </p>

        {services.loading && <LoadingBlock label="Cargando servicios…" />}

        {services.errorMessage && (
          <Alert tone="error" className="mt-4">
            {services.errorMessage}
          </Alert>
        )}

        {!services.loading && list.length === 0 && (
          <EmptyState
            className="mt-4"
            icon="💇"
            title="Todavía no tienes servicios"
            description="Añade al menos un servicio para que los clientes puedan reservar."
          />
        )}

        {list.length > 0 && (
          <div className="mt-4 space-y-3">
            {list.map((service) => (
              <Card key={service.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-600">
                    {formatPrice(service.price)} · {formatDuration(service.duration)}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => toggleActive(service)}
                  loading={busyId === service.id}
                >
                  Desactivar
                </Button>
              </Card>
            ))}
          </div>
        )}

        <Alert tone="info" className="mt-5">
          <code className="text-xs">GET /api/businesses/{'{id}'}/services</code> sólo devuelve los
          servicios activos, así que un servicio desactivado deja de listarse aquí. Para volver a
          ofrecerlo hay que reactivarlo desde la base de datos o volver a crearlo.
        </Alert>
      </div>

      <Card className="h-fit p-5 sm:p-6">
        <h3 className="font-bold text-slate-900">Nuevo servicio</h3>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}

          <Input
            label="Nombre"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            placeholder="Corte de pelo"
            required
          />

          <Textarea
            label="Descripción"
            rows={3}
            value={form.description}
            onChange={update('description')}
            error={errors.description}
            placeholder="Corte unisex, lavado y peinado."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio (€)"
              type="number"
              step="0.01"
              min="0.1"
              inputMode="decimal"
              value={form.price}
              onChange={update('price')}
              error={errors.price}
              placeholder="24.50"
              required
            />
            <Input
              label="Duración (min)"
              type="number"
              step="30"
              min="30"
              inputMode="numeric"
              value={form.duration}
              onChange={update('duration')}
              error={errors.duration}
              required
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">Plantillas rápidas</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setForm({
                      name: preset.label,
                      description: '',
                      price: preset.price,
                      duration: preset.duration,
                    })
                    setErrors({})
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" full loading={submitting}>
            {submitting ? 'Añadiendo…' : 'Añadir servicio'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
