import Link from 'next/link'
import { pageUrl } from '@/lib/pagination'

export function Pagination({ path, page, pageSize, total, filters = {} }: {
  path: string; page: number; pageSize: number; total: number; filters?: Record<string, string | undefined>
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  return <nav aria-label="Resultatsider" className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <span role="status" className="text-stone-600">{total > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} av ${total.toLocaleString('nb-NO')}` : '0 treff'} · Side {page} av {lastPage}</span>
    <div className="flex gap-3">
      {page > 1 && <Link className="rounded-lg border px-3 py-2 hover:bg-stone-100" href={pageUrl(path, page - 1, filters)}>Forrige</Link>}
      {page < lastPage && <Link className="rounded-lg border px-3 py-2 hover:bg-stone-100" href={pageUrl(path, page + 1, filters)}>Neste</Link>}
    </div>
  </nav>
}
