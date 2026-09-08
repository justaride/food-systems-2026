'use client'
export function CatalogRequestStatus({ loading, error, retry }: { loading: boolean; error: string | null; retry: () => void }) {
  if (error) return <p role="alert" className="my-3 text-sm text-rose-800">{error} <button className="underline" onClick={retry}>Prøv igjen</button></p>
  if (loading) return <p role="status" className="my-3 text-sm text-stone-600">Henter resultater …</p>
  return null
}
