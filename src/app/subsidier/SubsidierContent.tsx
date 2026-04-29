'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/Card'

const KommuneChoropleth = dynamic(
  () => import('@/components/map/KommuneChoropleth').then((m) => m.KommuneChoropleth),
  { ssr: false, loading: () => <div className="h-[560px] w-full rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-sm text-stone-400">Laster kart…</div> }
)

type KommuneRow = {
  kommuneNr: string
  recipientCount: number
  totalNok: number
}

type SchemeRow = {
  scheme: string
  recipientCount: number
  totalNok: number
}

type RecipientRow = {
  companyId: string
  name: string
  orgNr: string
  valueChainStage: string | null
  kommuneNr: string | null
  schemeCount: number
  totalNok: number
}

type TypeRow = {
  subsidyType: string
  totalNok: number
  count: number
}

type Props = {
  byKommune: KommuneRow[]
  byScheme: SchemeRow[]
  topRecipients: RecipientRow[]
  totalNok: number
  totalRows: number
  byType: TypeRow[]
}

const SCHEME_LABELS: Record<string, string> = {
  arealtilskudd: 'Arealtilskudd',
  avloesertilskudd: 'Avløsertilskudd',
  beitetilskudd: 'Beitetilskudd',
  bevaringsverdige_husdyr_tilsku: 'Bevaringsverdige husdyr',
  distriktstilskudd_frukt_groent: 'Distriktstilskudd frukt/grønt',
  distriktstilskudd_potet_gronns: 'Distriktstilskudd potet/grønnsak',
  oeko_grønt_tilskudd: 'Økologisk grønt',
  husdyrtilskudd: 'Husdyrtilskudd',
  kulturlandskapstilskudd: 'Kulturlandskapstilskudd',
  melkeproduksjon: 'Melkeproduksjon',
  oekologiskarealtilskudd: 'Økologisk areal',
  oekologiskhusdyrtilskudd: 'Økologisk husdyr',
  smaa_mellomstore_melkebruk: 'Små/mellomstore melkebruk',
  storfekjoettproduksjon: 'Storfekjøttproduksjon',
  utmarksbeitetilskudd: 'Utmarksbeite',
}

function formatNok(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} mrd`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} mill`
  if (n >= 1e3) return `${Math.round(n / 1e3).toLocaleString('no')}k`
  return Math.round(n).toLocaleString('no')
}

export function SubsidierContent({
  byKommune,
  byScheme,
  topRecipients,
  totalNok,
  totalRows,
  byType,
}: Props) {
  const [tab, setTab] = useState<'kart' | 'kommuner' | 'ordninger' | 'mottakere'>('kart')

  const hasProduksjonstilskudd =
    byKommune.length > 0 || byScheme.length > 0 || topRecipients.length > 0

  const kommuneData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const k of byKommune) map[k.kommuneNr] = k.totalNok
    return map
  }, [byKommune])

  const top10Kommuner = useMemo(
    () => byKommune.slice(0, 50),
    [byKommune]
  )
  const kommuneMax = byKommune[0]?.totalNok ?? 1

  const topSchemeMax = byScheme[0]?.totalNok ?? 1

  const { top10RecipientsTotal, nonFarmRecipients } = useMemo(() => {
    const top10 = topRecipients.slice(0, 10).reduce((acc, r) => acc + r.totalNok, 0)
    const nonFarm = topRecipients.filter(r => r.valueChainStage !== 'production')
    return { top10RecipientsTotal: top10, nonFarmRecipients: nonFarm }
  }, [topRecipients])

  const top10Pct = totalNok > 0 ? (top10RecipientsTotal / totalNok) * 100 : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Subsidier</h1>
          <p className="text-stone-500 mt-2 max-w-3xl">
            Produksjons- og avløsertilskudd per jordbruksforetak, hentet fra
            Landbruksdirektoratets åpne data (NLOD). Brutt ned på ordning,
            kommune og mottaker. Følg pengene fra statskassen til bondegårdene.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">
            Totalt utbetalt
          </div>
          <div className="text-2xl font-bold text-stone-900">{formatNok(totalNok)} NOK</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Tilskuddsrader</div>
          <div className="text-2xl font-bold text-stone-900">
            {totalRows.toLocaleString('no')}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Mottakere (topp 100)</div>
          <div className="text-2xl font-bold text-stone-900">
            {topRecipients.length}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Topp 10-andel</div>
          <div className="text-2xl font-bold text-stone-900">{top10Pct.toFixed(1)}%</div>
        </div>
      </div>

      {nonFarmRecipients.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Merk:</strong> {nonFarmRecipients.length} av topp-100 mottakere er ikke
          klassifisert som jordbruksforetak (`valueChainStage ≠ production`). Dette
          kan indikere samvirkeforetak, foredlingsbedrifter eller mangelfull orgnr-metadata
          som bør følges opp manuelt.
        </div>
      )}

      {!hasProduksjonstilskudd && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900 space-y-2">
          <div className="font-semibold">Produksjonstilskudd-data ikke importert</div>
          <p>
            Tabellen <code className="px-1.5 py-0.5 rounded bg-white/70 text-xs font-mono">Subsidy</code> mangler rader med
            <code className="px-1.5 py-0.5 rounded bg-white/70 text-xs font-mono">subsidyType=&apos;produksjonstilskudd&apos;</code>.
            Det forklarer hvorfor kommune-, ordnings- og mottakeraggregatene er tomme.
            Beløpet «Totalt utbetalt» over inneholder kun øvrige subsidier ({byType.length} type
            {byType.length === 1 ? '' : 'r'}).
          </p>
          <p className="text-xs text-orange-800">
            Kjør i prod-container: <code className="px-1.5 py-0.5 rounded bg-white/70 font-mono">npm run db:import:produksjonstilskudd</code>{' '}
            (henter ~180k rader fra Landbruksdirektoratet, NLOD).
          </p>
        </div>
      )}

      <Card>
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 flex-wrap">
          {(['kart', 'kommuner', 'ordninger', 'mottakere'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium ${
                tab === t
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t === 'kart'
                ? 'Kommunekart'
                : t === 'kommuner'
                  ? `Kommuner (${byKommune.length})`
                  : t === 'ordninger'
                    ? `Ordninger (${byScheme.length})`
                    : `Topp mottakere (${topRecipients.length})`}
            </button>
          ))}
        </div>
      </Card>

      {tab === 'kart' && (
        <Card title="Produksjonstilskudd per kommune (2025)">
          <KommuneChoropleth
            data={kommuneData}
            valueLabel="Totalt tilskudd"
            formatValue={(v) => `${formatNok(v)} NOK`}
          />
          <div className="mt-3 text-xs text-stone-400">
            Kilde: Landbruksdirektoratet, produksjons- og avløsertilskudd 2025 (NLOD).
            Kommuner uten data vises i grått. Kvintilgradient — mørkere grønn =
            høyere totalsum.
          </div>
        </Card>
      )}

      {tab === 'kommuner' && (
        <Card title="Tilskudd per kommune (topp 50)">
          <div className="space-y-1.5">
            {top10Kommuner.map(k => {
              const pct = (k.totalNok / kommuneMax) * 100
              return (
                <div key={k.kommuneNr} className="flex items-center gap-3 text-sm">
                  <div className="w-16 text-[11px] text-stone-400 font-mono">
                    {k.kommuneNr}
                  </div>
                  <div className="flex-1 relative h-6 bg-stone-50 rounded border border-stone-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-100 border-r border-emerald-400 rounded"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 text-xs text-stone-700">
                      <span className="tabular-nums">{formatNok(k.totalNok)} NOK</span>
                      <span className="text-stone-400 ml-2">
                        · {k.recipientCount} foretak
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
            Kommunenummer vises kun; navneoppslag og Leaflet-choropleth kommer i
            neste iterasjon. Data: Landbruksdirektoratet, produksjons- og
            avløsertilskudd 2025.
          </div>
        </Card>
      )}

      {tab === 'ordninger' && (
        <Card title="Tilskudd per ordning (produksjonstilskudd 2025)">
          <div className="space-y-1.5">
            {byScheme.map(s => {
              const pct = (s.totalNok / topSchemeMax) * 100
              return (
                <div key={s.scheme} className="flex items-center gap-3 text-sm">
                  <div className="w-48 text-stone-700 text-xs truncate">
                    {SCHEME_LABELS[s.scheme] ?? s.scheme}
                  </div>
                  <div className="flex-1 relative h-6 bg-stone-50 rounded border border-stone-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-sky-100 border-r border-sky-400 rounded"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 text-xs text-stone-700">
                      <span className="tabular-nums">{formatNok(s.totalNok)} NOK</span>
                      <span className="text-stone-400 ml-2">
                        · {s.recipientCount.toLocaleString('no')} foretak
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {tab === 'mottakere' && (
        <Card title="Topp 100 subsidiemottakere">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    #
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Mottaker
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Orgnr
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Kommune
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Ordninger
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Totalt
                  </th>
                </tr>
              </thead>
              <tbody>
                {topRecipients.map((r, i) => (
                  <tr
                    key={r.companyId}
                    className="border-b border-stone-100 hover:bg-stone-50/60"
                  >
                    <td className="py-2.5 pr-4 text-stone-400 text-xs tabular-nums">
                      {i + 1}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/selskap/${r.companyId}`}
                        className="font-medium text-stone-800 hover:text-emerald-700"
                      >
                        {r.name}
                      </Link>
                      {r.valueChainStage && r.valueChainStage !== 'production' && (
                        <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {r.valueChainStage}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-500 text-xs font-mono">
                      {r.orgNr}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-500 text-xs font-mono">
                      {r.kommuneNr ?? '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-600">
                      {r.schemeCount}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-900 font-medium">
                      {formatNok(r.totalNok)} NOK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Andre tilskuddstyper i databasen">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {byType.map(t => (
            <div key={t.subsidyType} className="px-3 py-2 rounded bg-stone-50 border border-stone-100">
              <div className="text-stone-500">{t.subsidyType}</div>
              <div className="text-stone-800 font-medium">
                {formatNok(t.totalNok)} NOK · {t.count.toLocaleString('no')} rader
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
