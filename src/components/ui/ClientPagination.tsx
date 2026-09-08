'use client'
import { useState } from 'react'

export function useClientPagination<T>(rows: T[], filterKey: string, pageSize = 50) {
  const [position, setPosition] = useState({ key: filterKey, page: 1 })
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = position.key === filterKey ? Math.min(position.page, lastPage) : 1
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), page, lastPage,
    total: rows.length, pageSize, onPage: (next: number) => setPosition({ key: filterKey, page: Math.max(1, Math.min(next, lastPage)) }) }
}

export function ClientPagination({ page, lastPage, total, pageSize, onPage }: {
  page: number; lastPage: number; total: number; pageSize: number; onPage: (page: number) => void
}) {
  return <nav aria-label="Resultatsider" className="my-3 flex flex-wrap items-center justify-between gap-2 text-sm">
    <span role="status">{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}` : '0'} av {total.toLocaleString('nb-NO')} · Side {page} av {lastPage}</span>
    <div className="flex gap-2"><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Forrige</button><button disabled={page >= lastPage} onClick={() => onPage(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Neste</button></div>
  </nav>
}
