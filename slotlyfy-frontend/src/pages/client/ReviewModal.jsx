import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { reviewApi } from '../../api'
import { useToast } from '../../hooks/useToast'
import { extractApiError } from '../../lib/errors'
import Modal from '../../components/ui/Modal'
import Button, { buttonClasses } from '../../components/ui/Button'
import { Card, StarPicker } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/FormControls'
import { Alert } from '../../components/ui/Feedback'

const MAX_COMMENT = 500

/**
 * Reseña de una cita completada.
 *
 * Reglas del backend: sólo CLIENT, la cita debe ser suya, tiene que estar en
 * COMPLETED y no puede existir ya una reseña para esa cita (409).
 */
export default function ReviewModal({ open, appointment, onClose, onSubmitted }) {
  const toast = useToast()
  const { isClient } = useAuth()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setRating(0)
    setComment('')
    setError(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (rating < 1) {
      setError('Selecciona una puntuación de 1 a 5 estrellas.')
      return
    }

    setSubmitting(true)
    try {
      await reviewApi.createReview({
        appointmentId: appointment.id,
        rating,
        comment,
      })
      toast.success('¡Gracias! Tu reseña ya está publicada.')
      reset()
      onSubmitted?.()
      onClose()
    } catch (caught) {
      const message = extractApiError(caught, 'No hemos podido publicar tu reseña.')
      setError(message)
      if (caught?.response?.status === 403) toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title="Valorar la cita"
      description={
        appointment
          ? `${appointment.serviceOfferingName} · ${appointment.employeeName}`
          : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            ¿Qué te ha parecido? <span className="text-rose-500">*</span>
          </p>
          <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        </div>

        <Textarea
          label="Comentario"
          placeholder="Cuéntanos cómo ha ido tu experiencia…"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={MAX_COMMENT}
          hint={`${comment.length}/${MAX_COMMENT} caracteres. Opcional.`}
        />

        {appointment && (
          <Card className="bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Cita valorada</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {appointment.serviceOfferingName}
            </p>
            <p className="text-xs text-slate-500">Con {appointment.employeeName}</p>
          </Card>
        )}

        {!isClient && (
          <Alert tone="warning">
            Tu sesión no tiene rol CLIENT, así que el backend rechazará la reseña (sólo los
            clientes pueden opinar).{' '}
            <Link to="/panel" className="font-semibold underline">
              Ir al panel
            </Link>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Ahora no
          </Button>
          <Button type="submit" loading={submitting} className={buttonClasses()}>
            Publicar reseña
          </Button>
        </div>
      </form>
    </Modal>
  )
}
