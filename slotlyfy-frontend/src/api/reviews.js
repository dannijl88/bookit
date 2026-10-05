import { http } from '../lib/api'

/**
 * POST /api/reviews?appointmentId=
 * Reglas del backend: sólo CLIENT, la cita debe ser suya y estar COMPLETED,
 * y no puede haber ya una reseña para esa cita (409).
 */
export async function createReview({ appointmentId, rating, comment }) {
  const { data } = await http.post(
    '/api/reviews',
    { rating, comment: comment?.trim() ? comment.trim() : null },
    { params: { appointmentId } },
  )
  return data
}
