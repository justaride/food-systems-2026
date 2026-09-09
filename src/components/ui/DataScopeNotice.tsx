import { Card } from '@/components/ui/Card'
import type { DataScopeNotice as DataScopeNoticeModel } from '@/lib/data-scope'
import { describeFreshness } from '@/lib/data-scope'

export function DataScopeNotice({
  notice,
  generatedAt,
  requiresCurrentCheck = false,
}: {
  notice: DataScopeNoticeModel
  generatedAt?: string | null
  requiresCurrentCheck?: boolean
}) {
  const rows = [
    ['Univers', notice.universe],
    ['Utvalg', notice.selection],
    ['Dekning', notice.coverage],
    ['Periode', notice.period],
    ['Metode', notice.method],
  ]

  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <h2 className="text-sm font-semibold text-amber-950">Hva tallene dekker</h2>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-amber-800/70">{label}</dt>
            <dd className="mt-0.5 text-stone-700">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t border-amber-200 pt-3 text-sm text-stone-700">
        <strong>Ferskhet:</strong>{' '}
        {describeFreshness(notice.checkedAt, { generatedAt, requiresCurrentCheck })}
      </p>
      <p className="mt-2 text-sm text-stone-700"><strong>Neste steg:</strong> {notice.nextStep}</p>
    </Card>
  )
}
