import Link from 'next/link'

type PageFramingProps = {
  title: string
  description: string[]
  takeaways: string[]
  caveat: string
  siblingLink?: {
    prompt: string
    href: string
    label: string
  }
}

export function PageFraming({ title, description, takeaways, caveat, siblingLink }: PageFramingProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-stone-50/80 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-stone-600">
            {description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {siblingLink && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-stone-600">
              <span>{siblingLink.prompt}</span>
              <Link
                href={siblingLink.href}
                className="inline-flex items-center rounded-md border border-stone-200 bg-white px-2.5 py-1 font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                {siblingLink.label} {'->'}
              </Link>
            </div>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Tre nøkkelsvar</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-stone-700">
              {takeaways.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Forbehold</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-950">{caveat}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
