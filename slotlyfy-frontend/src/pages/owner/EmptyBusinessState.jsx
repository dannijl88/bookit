import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/Feedback'
import { buttonClasses } from '../../components/ui/Button'

/** Placeholder para las secciones que necesitan un negocio seleccionado. */
export default function EmptyBusinessState() {
  return (
    <EmptyState
      icon="🏪"
      title="Primero necesitas un negocio"
      description="Crea la ficha de tu negocio para poder añadir servicios, equipo y gestionar citas."
      action={
        <Link to="/panel" className={buttonClasses()}>
          Crear mi negocio
        </Link>
      }
    />
  )
}
