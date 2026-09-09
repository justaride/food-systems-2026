import Link from 'next/link'
import { chapters, whitepaperProjection } from '@/lib/hvitbok/chapters'

export const metadata = {
  title: 'Hvitbok — Food Systems',
  description: 'Intern, kildebundet lesevisning av Food Systems synthesis v2.',
}

export default function HvitbokPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <header className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Intern forhåndsvisning</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Hvitbok — Food Systems 2026</h1>
        <p className="mt-1 text-sm text-stone-500">
          Les hele den interne syntesen, fra hovedfunn og metode til forslag og videre arbeid.
        </p>
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <strong>Internt arbeidsutkast.</strong> Innholdet avventer faglig og redaksjonell
          godkjenning før ekstern sitering eller deling.
        </div>
        <details className="mt-4 text-xs text-stone-600">
        <summary className="cursor-pointer font-medium">Versjon og kildegrunnlag</summary>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div><dt className="font-medium text-stone-700">Mastermanus</dt><dd className="break-words">{whitepaperProjection.sourcePath}</dd></div>
          <div><dt className="font-medium text-stone-700">Kildedato / projeksjon</dt><dd>{whitepaperProjection.sourceDate} / {whitepaperProjection.generatedOn}</dd></div>
          <div><dt className="font-medium text-stone-700">Kildestatus</dt><dd>{whitepaperProjection.sourceStatus}</dd></div>
          <div><dt className="font-medium text-stone-700">Kildehash</dt><dd className="break-all font-mono">sha256:{whitepaperProjection.sourceHash}</dd></div>
        </dl>
        </details>
      </header>

      <nav className="grid gap-3 sm:grid-cols-3" aria-label="Snarveier i hvitboken">
        <Link className="rounded-lg border border-stone-200 bg-white p-3 text-sm font-medium hover:border-emerald-300" href="/hvitbok/leserveiledning-og-evidensstatus">Status og bruk</Link>
        <Link className="rounded-lg border border-stone-200 bg-white p-3 text-sm font-medium hover:border-emerald-300" href="/hvitbok/13-begrensninger-og-redaksjonelle-stoppregler">Begrensninger</Link>
        <Link className="rounded-lg border border-stone-200 bg-white p-3 text-sm font-medium hover:border-emerald-300" href="/hvitbok/14-kildekart-og-videre-lesning">Kilder</Link>
      </nav>

      <ol className="space-y-3">
        {chapters.map((ch) => (
          <li key={ch.slug}>
            <Link
              href={`/hvitbok/${ch.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="min-w-8 text-lg font-bold text-emerald-600">
                {ch.number === '0' ? 'L' : ch.number}
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
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
