import Link from 'next/link'
import type { KonsernSubsidies } from '@/lib/queries/konsern'
import { fmtMnokSubsidy } from './formatters'

export function Section6Subsidies({ subsidies, slug }: { subsidies: KonsernSubsidies; slug: string }) {
  if (subsidies.rowCount === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Tilskudd inn</h2>
        <p className="text-sm text-stone-400 italic">Ingen tilskudd registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Tilskudd inn</h2>
      <div className="space-y-5">
        {subsidies.perYear.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">År</th>
                  <th className="text-right px-3 py-2">Total tilskudd</th>
                </tr>
              </thead>
              <tbody>
                {subsidies.perYear.map(row => (
                  <tr key={row.year} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-3 py-2 tabular-nums font-medium text-stone-700">{row.year}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnokSubsidy(row.totalNok)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {subsidies.topSchemes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Topp 5 ordninger</h3>
              <ol className="space-y-1">
                {subsidies.topSchemes.map((s, i) => (
                  <li key={s.scheme} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <span className="flex-1 truncate text-stone-700">{s.scheme}</span>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnokSubsidy(s.totalNok)} ({s.count})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {subsidies.topRecipients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Topp 5 mottakerselskap</h3>
              <ol className="space-y-1">
                {subsidies.topRecipients.map((r, i) => (
                  <li key={r.companyId} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <Link
                      href={`/selskap/${r.companyId}`}
                      className="text-emerald-700 hover:underline flex-1 truncate"
                    >
                      {r.companyName}
                    </Link>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnokSubsidy(r.totalNok)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Total registrert: {fmtMnokSubsidy(subsidies.totalNok)}</span>
          <Link
            href={`/subsidier?konsern=${slug}`}
            className="text-xs text-emerald-700 hover:underline ml-auto"
          >
            Se alle tilskudd &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
