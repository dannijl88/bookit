import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/domain'
import { buttonClasses } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const STEPS = [
  {
    emoji: '🔎',
    title: 'Encuentra tu negocio',
    text: 'Filtra por categoría y compara servicios, precios y reseñas.',
  },
  {
    emoji: '🕒',
    title: 'Elige hora real',
    text: 'Vemos la disponibilidad real del equipo en el momento, sin llamadas ni esperas.',
  },
  {
    emoji: '✅',
    title: 'Reserva en un clic',
    text: 'Confirmas el servicio y el profesional. Después puedes cancelarlo o valorarlo.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-100 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Disponibilidad en tiempo real
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu próxima cita,
              <br />
              <span className="bg-gradient-to-r from-brand-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
                sin llamadas.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-100/90 sm:text-lg">
              Reserva en peluquerías, barberías, spas y negocios de servicios. Elige servicio,
              profesional y hora; nosotros nos encargamos del resto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/businesses"
                className={buttonClasses({ size: 'lg' })}
              >
                Explorar negocios
              </Link>
              <Link
                to="/registro"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Explora por categoría
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Diez categorías para cubrir todo lo que te cuidas.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.value}
              to={`/businesses?categoria=${encodeURIComponent(category.value)}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="text-2xl" aria-hidden="true">
                {category.emoji}
              </span>
              <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">
                {category.value}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Cómo funciona</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title} className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {step.emoji}
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA para negocios */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-950 px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              ¿Tienes un negocio de servicios?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100/90">
              Publica tus servicios, define el horario de tu equipo y gestiona todas las citas
              desde un único panel. Sin coste de instalación.
            </p>
            <Link
              to="/registro"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-base font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
