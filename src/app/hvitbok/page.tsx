import Link from 'next/link'
import { chapters } from '@/lib/hvitbok/chapters'

export const metadata = {
  title: 'Hvitbok — Food Systems',
  description: 'Food Systems sitt leveransedokument, delt i kapitler.',
}

export default function HvitbokPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <header className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-6">
        <h1 className="text-2xl font-bold text-stone-900">Hvitbok</h1>
        <p className="mt-1 text-sm text-stone-500">
          Food Systems sitt leveransedokument — notater og rapporter til
          transition group, delt i kapitler.
        </p>
      </header>

      <ol className="space-y-3">
        {chapters.map((ch) => (
          <li key={ch.slug}>
            <Link
              href={`/hvitbok/${ch.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-lg font-bold text-emerald-600">
                {ch.number}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-stone-800 group-hover:text-emerald-700">
                  {ch.title}
                </span>
                {ch.subtitle && (
                  <span className="block text-xs text-stone-500">
                    {ch.subtitle}
                  </span>
                )}
                <span className="mt-1 flex flex-wrap gap-3 text-[11px] text-stone-400">
                  {ch.audience && <span>Målgruppe: {ch.audience}</span>}
                  {ch.status && <span>Status: {ch.status}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
