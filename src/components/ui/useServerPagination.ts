'use client'
import { useEffect, useState } from 'react'

export type ServerPage<T> = { rows: T[]; total: number; page: number; lastPage: number; pageSize: number }
/** Abort and key responses so rapid filter changes cannot show results from an older request. */
export function useServerPagination<P extends ServerPage<unknown>>(kind: string, initial: P, filters: Record<string, string>) {
  const filterKey = new URLSearchParams(filters).toString()
  const [position, setPosition] = useState({ key: filterKey, page: initial.page })
  const page = position.key === filterKey ? position.page : 1
  const requestKey = `${kind}?${filterKey}&page=${page}`
  const [result, setResult] = useState({ key: requestKey, data: initial })
  const [error, setError] = useState<{ key: string; message: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const pending = result.key !== requestKey
  useEffect(() => {
    if (result.key === requestKey) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/catalog?kind=${requestKey.replace('?', '&')}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Kunne ikke hente listen. Prøv igjen.')
        const data = await response.json() as P
        if (!controller.signal.aborted) { setResult({ key: requestKey, data }); setError(null) }
      } catch (e) {
        if (!controller.signal.aborted) setError({ key: requestKey, message: e instanceof Error ? e.message : 'Kunne ikke hente listen.' })
      }
    }, 200)
    return () => { clearTimeout(timer); controller.abort() }
  }, [requestKey, result.key, retry])
  return { ...result.data, rows: pending ? [] as P['rows'] : result.data.rows,
    loading: pending && error?.key !== requestKey, error: error?.key === requestKey ? error.message : null,
    retry: () => { setError(null); setRetry(v => v + 1) },
    onPage: (next: number) => setPosition({ key: filterKey, page: next }) }
}
