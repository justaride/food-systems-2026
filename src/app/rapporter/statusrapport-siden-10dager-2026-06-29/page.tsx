import Link from 'next/link'

export const metadata = {
  title: 'Statusrapport 10-dagers (oppdatert 1. juli 2026)',
  description:
    'Statisk rapportvisning av 10-dagers status- og funnrapporten (periode 18.–29. juni 2026, oppdatert 1. juli).',
}

export default function StatusrapportTiDagerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-4">
        <Link
          href="/rapporter"
          className="inline-flex text-sm text-stone-500 hover:text-stone-700 underline underline-offset-2"
        >
          ← Tilbake til rapportoversikt
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-stone-900">
          Statusrapport 10-dagers · oppdatert 1. juli 2026
        </h1>
        <p className="text-sm text-stone-500 max-w-4xl">
          Egen statisk side for denne rapporten — ikke koblet mot database/API eller
          øvrig rapport-underlagslogikk. Periode 18.–29. juni, med en oppdateringsseksjon
          per 1. juli.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-stone-200 overflow-hidden bg-white">
        <iframe
          src="/reports/statusrapport-siden-10dager-2026-06-29.html"
          title="Statusrapport 10-dagers (oppdatert 1. juli 2026)"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 180px)', minHeight: '720px' }}
        />
      </div>
    </div>
  )
}
