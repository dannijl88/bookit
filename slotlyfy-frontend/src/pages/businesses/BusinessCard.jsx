import { Link } from 'react-router-dom'
import { Card, CategoryBadge } from '../../components/ui/Card'
import { getCategoryMeta } from '../../lib/domain'
import { buttonClasses } from '../../components/ui/Button'

export default function BusinessCard({ business }) {
  const meta = getCategoryMeta(business.category)

  return (
    <Card hover className="flex flex-col overflow-hidden">
      {/* Cabecera con la categoría: sustituye a la imagen (no hay subida de fotos). */}
      <div
        className={`relative flex h-28 items-end bg-gradient-to-br ${meta?.tint} px-5 pb-4`}
      >
        <span className="text-4xl" aria-hidden="true">
          {meta?.emoji}
        </span>
        <span className="absolute top-4 right-4">
          <CategoryBadge category={business.category} className="bg-white/85" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold tracking-tight text-slate-900">{business.name}</h3>
        <p className="mt-0.5 text-xs text-slate-500">por {business.ownerName}</p>

        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2.5">
            <Icon path="M12 21s7-5.34 7-11a7 7 0 1 0-14 0c0 5.66 7 11 7 11Z" />
            <span className="min-w-0 flex-1 break-words">{business.address}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon path="M12 6.5v3M9.5 8.25h5M12 3.5c-.66 0-1.2.54-1.2 1.2V6H7.5A1.5 1.5 0 0 0 6 7.5v10A1.5 1.5 0 0 0 7.5 19h9a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 16.5 6h-3.3V4.7c0-.66-.54-1.2-1.2-1.2Z" />
            <span>{business.openingHours}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon path="M4.5 5.5c0-.83.67-1.5 1.5-1.5h2l1.5 2h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5v-10Z" />
            <span>{business.phone}</span>
          </div>
        </dl>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <Link
            to={`/businesses/${business.id}`}
            className={buttonClasses({ variant: 'soft', size: 'sm', full: true })}
          >
            Ver ficha y reservar
          </Link>
        </div>
      </div>
    </Card>
  )
}

function Icon({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px h-4 w-4 shrink-0 text-slate-400"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}
