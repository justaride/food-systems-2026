import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export type EntityNeighborhoodItem = {
  label: string
  href?: string
  meta?: string
  badge?: string
  detailHref?: string
  detailLabel?: string
}

export type EntityNeighborhoodGroup = {
  label: string
  items: EntityNeighborhoodItem[]
  emptyText?: string
  limit?: number
}

export function EntityNeighborhood({
  groups,
  title = 'Relasjonsnabolag',
}: {
  groups: EntityNeighborhoodGroup[]
  title?: string
}) {
  const visibleGroups = groups.filter(group => group.items.length > 0 || group.emptyText)
  if (visibleGroups.length === 0) return null

  return (
    <Card title={title}>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {visibleGroups.map(group => {
          const limit = group.limit ?? 6
          const visibleItems = group.items.slice(0, limit)
          const hiddenCount = Math.max(0, group.items.length - visibleItems.length)

          return (
            <div key={group.label} className="min-w-0 rounded-md border border-stone-200 bg-stone-50/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {group.label}
                </h3>
                <span className="text-[11px] tabular-nums text-stone-400">
                  {group.items.length.toLocaleString('no')}
                </span>
              </div>

              {visibleItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {visibleItems.map((item, index) => (
                    <div
                      key={`${group.label}-${item.href ?? item.label}-${index}`}
                      className="min-w-0 rounded border border-stone-200 bg-white p-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="block truncate text-sm font-medium text-stone-800 hover:text-emerald-700"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-medium text-stone-800">{item.label}</p>
                          )}
                          {item.meta && (
                            <p className="mt-0.5 truncate text-xs text-stone-500">{item.meta}</p>
                          )}
                        </div>
                        {item.badge && (
                          <span className="shrink-0 rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.detailHref && item.detailLabel && (
                        <Link
                          href={item.detailHref}
                          className="mt-1 inline-block text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          {item.detailLabel}
                        </Link>
                      )}
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <p className="text-[11px] text-stone-400">
                      ... og {hiddenCount.toLocaleString('no')} til
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-500">{group.emptyText}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
