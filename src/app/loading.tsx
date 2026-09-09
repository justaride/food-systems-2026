export default function Loading() {
  return (
    <section className="space-y-5" aria-busy="true" aria-live="polite" aria-label="Laster arbeidsflaten">
      <div className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded bg-stone-200" />
        <div className="h-4 max-w-2xl animate-pulse rounded bg-stone-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl border border-stone-200 bg-white" />)}
      </div>
      <p className="text-sm text-stone-500">Laster arbeidsflaten …</p>
    </section>
  )
}
