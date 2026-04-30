import Link from 'next/link'

export const metadata = {
  title: 'Nordisk sirkularitetsrapport 2026-05',
  description: 'Statisk rapportvisning av den grafiske nordiske sirkularitetsrapporten.',
}

export default function NordiskSirkularitetsrapportPage() {
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
          Nordisk sirkularitetsrapport 2026-05
        </h1>
        <p className="text-sm text-stone-500 max-w-4xl">
          Egen statisk side for denne rapporten — ikke koblet mot database/API eller
          øvrig rapport-underlagslogikk.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href="/reports/nordisk-sirkularitetsrapport-2026-05.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-md border border-stone-200 px-3 py-2 text-stone-700 hover:bg-stone-50"
          >
            Last ned PDF
          </a>
          <span className="inline-flex items-center text-xs text-stone-400">
            (Samme rapport i PDF-format, for utskrift/arkiv)
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-stone-200 overflow-hidden bg-white">
        <iframe
          src="/reports/nordisk-sirkularitetsrapport-2026-05.html"
          title="Nordisk sirkularitetsrapport 2026-05"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 180px)', minHeight: '720px' }}
        />
      </div>
    </div>
  )
}
