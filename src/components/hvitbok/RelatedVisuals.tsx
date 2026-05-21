import Link from 'next/link'

export type RelatedVisualLink = {
  href: string
  label: string
  description: string
}

export function RelatedVisuals({
  links,
  title = 'Relaterte visualiseringer',
}: {
  links: RelatedVisualLink[]
  title?: string
}) {
  if (links.length === 0) return null
  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm font-semibold text-stone-800">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex items-start gap-2 text-sm"
            >
              <span className="text-stone-400 group-hover:text-emerald-600">
                →
              </span>
              <span>
                <span className="font-medium text-emerald-700 group-hover:underline">
                  {l.label}
                </span>
                <span className="block text-xs text-stone-500">
                  {l.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
