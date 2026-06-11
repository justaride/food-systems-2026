import Link from 'next/link'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav
      aria-label="Brødsmuler"
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white/85 px-3 py-2 text-xs text-stone-500 ${className}`}
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1

        return (
          <span key={`${item.href ?? item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <span className="text-stone-300">/</span>}
            {item.href && !isCurrent ? (
              <Link href={item.href} className="shrink-0 font-medium text-stone-500 hover:text-emerald-700">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isCurrent ? 'page' : undefined}
                className="truncate font-medium text-stone-700"
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
