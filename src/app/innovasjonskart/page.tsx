import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { FIM_COHORT_LABELS } from '@/components/fim/labels'
import { getFimProfilePage } from '@/lib/queries/fim'
import { pageUrl, parsePage } from '@/lib/pagination'

export const metadata = { title: 'Innovasjonskart — Food Systems 2026' }

type SearchParams = { q?: string; cohort?: string; kind?: string; page?: string }

export default async function InnovasjonskartPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const cohort = params.cohort === 'core' || params.cohort === 'fishery' ? params.cohort : undefined
  const kind = params.kind ? params.kind.slice(0, 100) : undefined
  const filters = { q: params.q?.trim() || undefined, cohort, kind }
  const data = await getFimProfilePage({ ...filters, page: parsePage(params.page) })
  const total = Object.values(data.cohorts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Innovasjonskart</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          Food Innovation Map Norway: kandidatprofiler for aktører i sirkulær og innovativ matproduksjon, med registerdata,
          kildefunn, regnskapstall og roller. Hver profil viser alle 18 felt med kilde og forbehold.
        </p>
      </div>

      <InternalBanner
        label="Kandidatgrunnlag"
        note={`Utgave ${data.release?.id ?? 'ukjent'}. Alt er maskinelt strukturert fra kilder og ikke menneskelig verifisert. At en aktør står her er ikke bevis for innovasjonsaktivitet: fiskerikoblingen er hentet fra godkjenningslister.`}
      />

      {!data.available || total === 0 ? (
        <Card>
          <p className="text-sm text-stone-600">Innovasjonskartet er ikke importert i denne databasen ennå.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Profiler</div>
              <div className="mt-1 text-2xl font-bold text-stone-900">{total.toLocaleString('nb-NO')}</div>
            </Card>
            {(['core', 'fishery'] as const).map(key => (
              <Card key={key}>
                <div className="text-[11px] uppercase tracking-wider text-stone-400">{FIM_COHORT_LABELS[key]}</div>
                <div className="mt-1 text-2xl font-bold text-stone-900">{(data.cohorts[key] ?? 0).toLocaleString('nb-NO')}</div>
              </Card>
            ))}
          </div>

          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-stone-500">
              Søk
              <input name="q" defaultValue={filters.q ?? ''} placeholder="Navn eller org.nr." className="w-64 max-w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-800" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-stone-500">
              Kohort
              <select name="cohort" defaultValue={cohort ?? ''} className="rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800">
                <option value="">Alle</option>
                <option value="core">{FIM_COHORT_LABELS.core}</option>
                <option value="fishery">{FIM_COHORT_LABELS.fishery}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-stone-500">
              Enhetstype
              <select name="kind" defaultValue={kind ?? ''} className="rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800">
                <option value="">Alle</option>
                {data.kinds.map(k => <option key={k.kind} value={k.kind}>{k.kind} ({k.count})</option>)}
              </select>
            </label>
            <button type="submit" className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700">Filtrer</button>
            {(filters.q || cohort || kind) && <Link href="/innovasjonskart" className="text-sm text-emerald-700 hover:underline">Nullstill</Link>}
          </form>

          <Card>
            <p className="mb-3 text-xs text-stone-500">{data.matches.toLocaleString('nb-NO')} treff · side {data.page} av {data.lastPage}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs text-stone-400">
                    <th className="py-2 pr-4 font-medium">Navn</th>
                    <th className="py-2 pr-4 font-medium">Org.nr.</th>
                    <th className="py-2 pr-4 font-medium">Enhetstype</th>
                    <th className="py-2 pr-4 font-medium">Kohort</th>
                    <th className="py-2 pr-4 font-medium">Felt med kilder</th>
                    <th className="py-2 font-medium">Konflikter</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(row => (
                    <tr key={row.id} className="border-b border-stone-100">
                      <td className="py-2 pr-4">
                        <Link href={`/innovasjonskart/${encodeURIComponent(row.id)}`} className="font-medium text-emerald-700 hover:underline">{row.name}</Link>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-stone-600">{row.orgNumber ?? '—'}</td>
                      <td className="py-2 pr-4 text-stone-600">{row.entityKind}</td>
                      <td className="py-2 pr-4 text-stone-600">{FIM_COHORT_LABELS[row.cohort] ?? row.cohort}</td>
                      <td className="py-2 pr-4 tabular-nums text-stone-600">{row.documentedFieldCount} / 18</td>
                      <td className={`py-2 tabular-nums ${row.conflictCount > 0 ? 'text-rose-700' : 'text-stone-400'}`}>{row.conflictCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              {data.page > 1 ? <Link href={pageUrl('/innovasjonskart', data.page - 1, filters)} className="text-emerald-700 hover:underline">← Forrige</Link> : <span />}
              {data.page < data.lastPage ? <Link href={pageUrl('/innovasjonskart', data.page + 1, filters)} className="text-emerald-700 hover:underline">Neste →</Link> : <span />}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
