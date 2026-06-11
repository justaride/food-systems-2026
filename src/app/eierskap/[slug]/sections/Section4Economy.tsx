import Link from 'next/link'
import type { KonsernFinancialsAggregate } from '@/lib/queries/konsern'
import { fmtEmployees, fmtMnok, fmtMnokWithYear } from './formatters'

export function Section4Economy({ financials }: { financials: KonsernFinancialsAggregate }) {
  const { perYear, topRevenueChildren, childrenWithoutLatestFinancial } = financials

  const hasData = perYear.length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Aggregert økonomi</h2>

      {!hasData ? (
        <p className="text-sm text-stone-400 italic">Ingen aggregert finansiell data tilgjengelig</p>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">År</th>
                  <th className="text-right px-3 py-2">Omsetning</th>
                  <th className="text-right px-3 py-2">EBITDA</th>
                  <th className="text-right px-3 py-2">Ansatte</th>
                </tr>
              </thead>
              <tbody>
                {perYear.map(row => (
                  <tr key={row.year} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-3 py-2 tabular-nums font-medium text-stone-700">{row.year}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnok(row.totalRevenueNok)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnok(row.totalEbitdaNok)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtEmployees(row.totalEmployees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {topRevenueChildren.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">
                Topp 5 datterselskap (omsetning siste år)
              </h3>
              <ol className="space-y-1">
                {topRevenueChildren.map((child, i) => (
                  <li key={child.companyId} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <Link
                      href={`/selskap/${child.companyId}`}
                      className="text-emerald-700 hover:underline flex-1 truncate"
                    >
                      {child.companyName}
                    </Link>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnokWithYear(child.revenueNok, child.year)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {childrenWithoutLatestFinancial.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700 select-none list-none flex items-center gap-1">
                <span className="group-open:rotate-90 inline-block transition-transform text-xs">&#9654;</span>
                Datterselskap uten regnskap i perioden ({childrenWithoutLatestFinancial.length})
              </summary>
              <ul className="mt-2 space-y-1 pl-4">
                {childrenWithoutLatestFinancial.map(child => (
                  <li key={child.companyId} className="text-sm">
                    <Link
                      href={`/selskap/${child.companyId}`}
                      className="text-stone-600 hover:text-emerald-700 hover:underline"
                    >
                      {child.companyName}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
