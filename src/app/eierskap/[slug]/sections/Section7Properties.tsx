import Link from 'next/link'
import type { KonsernProperties } from '@/lib/queries/konsern'
import { fmtArea } from './formatters'

export function Section7Properties({ properties, slug }: { properties: KonsernProperties; slug: string }) {
  if (properties.totalCount === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Eiendommer</h2>
        <p className="text-sm text-stone-400 italic">Ingen eiendommer registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Eiendommer</h2>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
              <tr>
                <th className="text-left px-3 py-2">Kommune</th>
                <th className="text-right px-3 py-2">Antall</th>
                <th className="text-right px-3 py-2">m²</th>
                <th className="text-left px-3 py-2">Typer</th>
              </tr>
            </thead>
            <tbody>
              {properties.perMunicipality.map(row => (
                <tr key={row.municipality} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2 text-stone-700">{row.municipality}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-stone-700">{row.count}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-stone-500">{fmtArea(row.areaSqm)}</td>
                  <td className="px-3 py-2 text-stone-400 text-xs">{row.types.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-stone-500">
            Totalt {properties.totalCount} eiendommer
            {properties.totalAreaSqm != null && ` · ${fmtArea(properties.totalAreaSqm)}`}
          </span>
          <Link
            href={`/eiendommer?konsern=${slug}`}
            className="text-xs text-emerald-700 hover:underline ml-auto"
          >
            Se på kart &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
