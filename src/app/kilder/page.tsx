import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { sources } from '@/lib/data/sources'

export default function KilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Kilder</h1>
        <p className="text-sm text-neutral-500 mt-1">{sources.length} kildedokumenter</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left py-2 pr-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Filnavn</th>
                <th className="text-left py-2 pr-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Type</th>
                <th className="text-left py-2 pr-4 text-xs text-neutral-500 uppercase tracking-wider font-medium hidden sm:table-cell">Beskrivelse</th>
                <th className="text-left py-2 text-xs text-neutral-500 uppercase tracking-wider font-medium hidden lg:table-cell">Relevans</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(src => (
                <tr
                  key={src.id}
                  className={`border-b border-neutral-800/50 last:border-0 ${
                    src.isDuplicate ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-2.5 pr-4">
                    <span className="text-neutral-300 text-xs font-mono break-all">{src.filename}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={src.type} />
                  </td>
                  <td className="py-2.5 pr-4 text-neutral-400 text-xs hidden sm:table-cell">
                    {src.description}
                  </td>
                  <td className="py-2.5 text-neutral-500 text-xs hidden lg:table-cell">
                    {src.relevance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
