import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export type RelatedLinkItem = {
  label: string
  href: string
  meta?: string | null
  badge?: string | null
}

export function RelatedLinks({
  title = 'Relatert',
  items,
}: {
  title?: string
  items: RelatedLinkItem[]
}) {
  const visibleItems = items.filter(item => item.href && item.label).slice(0, 8)
  if (visibleItems.length === 0) return null

  return (
    <Card title={title}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="group min-w-0 rounded-md border border-stone-200 bg-stone-50/70 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-sm font-medium text-stone-800 group-hover:text-emerald-800">
                {item.label}
              </span>
              {item.badge && (
                <span className="shrink-0 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-500">
                  {item.badge}
                </span>
              )}
            </div>
            {item.meta && <p className="mt-1 truncate text-xs text-stone-500">{item.meta}</p>}
          </Link>
        ))}
      </div>
    </Card>
  )
}
