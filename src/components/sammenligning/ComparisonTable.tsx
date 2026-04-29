import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'

type Row = {
  label: string
  values: Partial<Record<CountryCode, string | number | null>>
}

type ComparisonTableProps = { rows: Row[]; caption?: string }

export function ComparisonTable({ rows, caption }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      {caption && <p className="text-xs text-stone-500 mb-2">{caption}</p>}
      <table className="w-full text-xs border-collapse">
        <thead className="bg-stone-50">
          <tr>
            <th className="text-left p-2 font-medium text-stone-600 sticky left-0 bg-stone-50"></th>
            {COUNTRY_LIST.map(c => (
              <th key={c.code} className="p-2 font-medium text-stone-600">
                <span className="mr-1">{c.flag}</span>{c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-stone-100">
              <th className="text-left p-2 font-normal text-stone-700 sticky left-0 bg-white">{row.label}</th>
              {COUNTRY_LIST.map(c => {
                const v = row.values[c.code]
                return (
                  <td key={c.code} className="p-2 text-stone-700 text-right tabular-nums">
                    {v === null || v === undefined ? <span className="text-stone-300">—</span> : v}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
