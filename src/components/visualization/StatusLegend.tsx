type StatusLegendItem = {
  label: string
  description: string
  className: string
}

const DEFAULT_STATUS_LEGEND_ITEMS: StatusLegendItem[] = [
  {
    label: 'Utført internt',
    description: 'Arbeidet er gjort i prosjektet og kan brukes som intern styring, ikke ekstern validering.',
    className: 'border-stone-200 bg-stone-50 text-stone-700',
  },
  {
    label: 'Siterbar med forbehold',
    description: 'Kildegrunnlaget finnes, men trenger note om metode, dekning eller avgrensing.',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  {
    label: 'Blokkert',
    description: 'Mangler kilde, locator eller beslutningsgrunnlag og skal ikke løftes videre.',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  {
    label: 'Validert eksternt',
    description: 'Reservert for bekreftede eksterne claims; ingen Food TG-claims har denne statusen nå.',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  {
    label: 'Proxy',
    description: 'Indirekte indikator eller modell som kan støtte analyse, men ikke stå som observert fakta.',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    label: 'Illustrativ',
    description: 'Pedagogisk forklaring eller visualisering, ikke beslutningsdata alene.',
    className: 'border-violet-200 bg-violet-50 text-violet-800',
  },
]

type StatusLegendProps = {
  title?: string
  description?: string
  items?: StatusLegendItem[]
  className?: string
}

export function StatusLegend({
  title = 'Statuslegend',
  description = 'Les status som en sperre for språkstyrke: intern analyse, forbehold og proxy skal ikke omtales som ekstern validering.',
  items = DEFAULT_STATUS_LEGEND_ITEMS,
  className = '',
}: StatusLegendProps) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-900/[0.03] ${className}`}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone-500">{description}</p>
      </div>
      <dl className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg border px-3 py-2 ${item.className}`}>
            <dt className="text-xs font-semibold">{item.label}</dt>
            <dd className="mt-1 text-[11px] leading-relaxed opacity-80">{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
