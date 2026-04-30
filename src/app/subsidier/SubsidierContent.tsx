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
  kommuneName: string | null
  recipientCount: number
  rowCount: number
  totalNok: number
  population: number | null
  areaKm2: number | null
  nokPerRecipient: number | null
  nokPerInhabitant: number | null
  nokPerKm2: number | null
}

type SchemeRow = {
  scheme: string
  recipientCount: number
  totalNok: number
}

type SchemeStageCell = {
  scheme: string
  stage: string
  totalNok: number
  recipientCount: number
  rowCount: number
}

type SchemeStageHeatmapData = {
  schemes: string[]
  stages: string[]
  cells: SchemeStageCell[]
  maxNok: number
}

type StageCoverageRow = {
  stage: string
  recipientCount: number
  rowCount: number
  totalNok: number
}

type StageCoverageData = {
  subsidyType: string
  totalRecipients: number
  totalRows: number
  totalNok: number
  stages: StageCoverageRow[]
}

type RecipientRow = {
  companyId: string
  name: string
  orgNr: string
  legalForm: string | null
  valueChainStage: string | null
  kommuneNr: string | null
  landbruksregisterSource: boolean
  matrikkel: string | null
  parentOrgNr: string | null
  parentOrgNrCompanyLinked: boolean
  hasCoordinates: boolean
  deliveryRowCount: number
  deliveryCommodityCount: number
  ownershipLinkCount: number
  boardMemberCount: number
  schemeCount: number
  totalNok: number
}

type TypeRow = {
  subsidyType: string
  totalNok: number
  count: number
}

type DistributionPoint = {
  populationPct: number
  amountPct: number
}

type Distribution = {
  subsidyType: string
  recipientCount: number
  totalNok: number
  meanNok: number
  medianNok: number
  gini: number
  top1Count: number
  top1Nok: number
  top1Pct: number
  top10Count: number
  top10Nok: number
  top10Pct: number
  lorenz: DistributionPoint[]
}

type Props = {
  byKommune: KommuneRow[]
  byScheme: SchemeRow[]
  schemeStageHeatmap: SchemeStageHeatmapData
  stageCoverage: StageCoverageData
  topRecipients: RecipientRow[]
  totalNok: number
  totalRows: number
  byType: TypeRow[]
  distribution: Distribution
}

type KommuneMetric = 'totalNok' | 'nokPerRecipient' | 'nokPerInhabitant' | 'nokPerKm2'

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

const STAGE_LABELS: Record<string, string> = {
  production: 'Primærproduksjon',
  processing: 'Foredling',
  retail: 'Handel',
  seafood: 'Sjømat',
  inputs: 'Innsatsfaktorer',
  logistics: 'Logistikk',
  unknown: 'Uklassifisert',
}

const KOMMUNE_METRICS: Array<{
  key: KommuneMetric
  label: string
  shortLabel: string
  valueLabel: string
  title: string
  footer: string
}> = [
  {
    key: 'totalNok',
    label: 'Total NOK',
    shortLabel: 'Total',
    valueLabel: 'Totalt tilskudd',
    title: 'Produksjonstilskudd per kommune (2025)',
    footer: 'Viser samlet utbetaling per kommune.',
  },
  {
    key: 'nokPerRecipient',
    label: 'NOK per mottaker',
    shortLabel: 'Per mottaker',
    valueLabel: 'NOK per mottaker',
    title: 'Produksjonstilskudd per mottaker per kommune (2025)',
    footer: 'Total utbetaling delt på unike companyId-mottakere i kommunen.',
  },
  {
    key: 'nokPerInhabitant',
    label: 'NOK per innbygger',
    shortLabel: 'Per innbygger',
    valueLabel: 'NOK per innbygger',
    title: 'Produksjonstilskudd per innbygger per kommune (2025)',
    footer: 'Total utbetaling delt på innbyggertall fra kommune-metadatafilen.',
  },
  {
    key: 'nokPerKm2',
    label: 'NOK per km2',
    shortLabel: 'Per km2',
    valueLabel: 'NOK per km2',
    title: 'Produksjonstilskudd per km2 per kommune (2025)',
    footer: 'Total utbetaling delt på kommunens areal i km2 fra kommune-metadatafilen.',
  },
]

function formatNok(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} mrd`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} mill`
  if (n >= 1e3) return `${Math.round(n / 1e3).toLocaleString('no')}k`
  return Math.round(n).toLocaleString('no')
}

function formatPercent(part: number, total: number) {
  if (total <= 0) return '0%'
  return `${((part / total) * 100).toFixed(0)}%`
}

function getKommuneMetricValue(row: KommuneRow, metric: KommuneMetric): number | null {
  return row[metric]
}

function formatKommuneMetric(value: number, metric: KommuneMetric) {
  if (metric === 'nokPerRecipient') return `${formatNok(value)} NOK/mottaker`
  if (metric === 'nokPerInhabitant') return `${formatNok(value)} NOK/innb.`
  if (metric === 'nokPerKm2') return `${formatNok(value)} NOK/km2`
  return `${formatNok(value)} NOK`
}

function labelScheme(scheme: string) {
  return SCHEME_LABELS[scheme] ?? scheme
}

function labelStage(stage: string) {
  return STAGE_LABELS[stage] ?? stage
}

export function SubsidierContent({
  byKommune,
  byScheme,
  schemeStageHeatmap,
  stageCoverage,
  topRecipients,
  totalNok,
  totalRows,
  byType,
  distribution,
}: Props) {
  const [tab, setTab] = useState<'kart' | 'kommuner' | 'ordninger' | 'mottakere'>('kart')
  const [kommuneMetric, setKommuneMetric] = useState<KommuneMetric>('totalNok')

  const hasProduksjonstilskudd =
    byKommune.length > 0 || byScheme.length > 0 || topRecipients.length > 0

  const kommuneData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const k of byKommune) {
      const value = getKommuneMetricValue(k, kommuneMetric)
      if (value != null && Number.isFinite(value) && value > 0) map[k.kommuneNr] = value
    }
    return map
  }, [byKommune, kommuneMetric])

  const selectedKommuneMetric = KOMMUNE_METRICS.find(option => option.key === kommuneMetric) ?? KOMMUNE_METRICS[0]

  const displayedKommuner = useMemo(
    () => byKommune
      .map(row => ({ ...row, metricValue: getKommuneMetricValue(row, kommuneMetric) }))
      .filter((row): row is KommuneRow & { metricValue: number } =>
        row.metricValue != null && Number.isFinite(row.metricValue) && row.metricValue > 0
      )
      .sort((a, b) => b.metricValue - a.metricValue)
      .slice(0, 50),
    [byKommune, kommuneMetric]
  )
  const kommuneMax = displayedKommuner[0]?.metricValue ?? 1

  const topSchemeMax = byScheme[0]?.totalNok ?? 1

  const stageCoverageSummary = useMemo(() => {
    const unknown = stageCoverage.stages.find(row => row.stage === 'unknown')
    const production = stageCoverage.stages.find(row => row.stage === 'production')
    const dominant = stageCoverage.stages[0] ?? null
    const withKnownStage = stageCoverage.totalRecipients - (unknown?.recipientCount ?? 0)

    return {
      unknown,
      production,
      dominant,
      withKnownStage,
    }
  }, [stageCoverage])

  const nonFarmRecipients = useMemo(() => {
    const nonFarm = topRecipients.filter(r => r.valueChainStage !== 'production')
    return nonFarm
  }, [topRecipients])

  const topRecipientCoverage = useMemo(() => {
    const total = topRecipients.length
    const withOwnership = topRecipients.filter(r => r.ownershipLinkCount > 0).length
    const withBoard = topRecipients.filter(r => r.boardMemberCount > 0).length
    const withOwnershipOrBoard = topRecipients.filter(
      r => r.ownershipLinkCount > 0 || r.boardMemberCount > 0
    ).length
    const withStage = topRecipients.filter(r => r.valueChainStage != null).length
    const production = topRecipients.filter(r => r.valueChainStage === 'production').length
    const jordbruksforetakName = topRecipients.filter(r => r.name.startsWith('Jordbruksforetak ')).length
    const withLegalForm = topRecipients.filter(r => r.legalForm != null).length
    const withLandbruksregisterSource = topRecipients.filter(r => r.landbruksregisterSource).length
    const withMatrikkel = topRecipients.filter(r => r.matrikkel != null).length
    const withParentOrgNr = topRecipients.filter(r => r.parentOrgNr != null).length
    const withParentOrgNrCompanyLink = topRecipients.filter(r => r.parentOrgNrCompanyLinked).length
    const withCoordinates = topRecipients.filter(r => r.hasCoordinates).length
    const withDeliveryFootprint = topRecipients.filter(r => r.deliveryRowCount > 0).length
    const deliveryFootprintTotalNok = topRecipients
      .filter(r => r.deliveryRowCount > 0)
      .reduce((sum, r) => sum + r.totalNok, 0)
    const unlinkedTotalNok = topRecipients
      .filter(r => r.ownershipLinkCount === 0 && r.boardMemberCount === 0)
      .reduce((sum, r) => sum + r.totalNok, 0)

    return {
      total,
      withOwnership,
      withBoard,
      withOwnershipOrBoard,
      withStage,
      production,
      jordbruksforetakName,
      withLegalForm,
      withLandbruksregisterSource,
      withMatrikkel,
      withParentOrgNr,
      withParentOrgNrCompanyLink,
      withCoordinates,
      withDeliveryFootprint,
      deliveryFootprintTotalNok,
      unlinkedTotalNok,
    }
  }, [topRecipients])

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
          <div className="text-xs uppercase tracking-wider text-stone-400">Mottakere</div>
          <div className="text-2xl font-bold text-stone-900">
            {distribution.recipientCount.toLocaleString('no')}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Topp 10 %</div>
          <div className="text-2xl font-bold text-stone-900">
            {distribution.top10Pct.toFixed(1)}%
          </div>
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

      {hasProduksjonstilskudd && (
        <Card title="Fordelingsanalyse per mottaker">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <DistributionStat
                  label="Gini"
                  value={distribution.gini.toFixed(2)}
                  sub="0 = likt fordelt, 1 = maksimalt konsentrert"
                />
                <DistributionStat
                  label="Median"
                  value={`${formatNok(distribution.medianNok)} NOK`}
                  sub={`Snitt ${formatNok(distribution.meanNok)} NOK`}
                />
                <DistributionStat
                  label="Topp 1 %"
                  value={`${distribution.top1Pct.toFixed(1)}%`}
                  sub={`${distribution.top1Count.toLocaleString('no')} mottakere · ${formatNok(distribution.top1Nok)} NOK`}
                />
                <DistributionStat
                  label="Topp 10 %"
                  value={`${distribution.top10Pct.toFixed(1)}%`}
                  sub={`${distribution.top10Count.toLocaleString('no')} mottakere · ${formatNok(distribution.top10Nok)} NOK`}
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-500">
                Metode: hver mottaker er én{' '}
                <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">companyId</code>
                , og alle rader med{' '}
                <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">
                  subsidyType=produksjonstilskudd
                </code>{' '}
                summeres før fordelingen beregnes. Gini og Lorenz-kurve er derfor
                mottakerfordeling, ikke kommune-, areal- eller innbyggernormalisering.
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Lorenz-kurve
              </p>
              <LorenzChart points={distribution.lorenz} />
              <div className="mt-2 flex justify-between text-[10px] text-stone-400">
                <span>0% mottakere</span>
                <span>100% mottakere</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {hasProduksjonstilskudd && (
        <Card title="Dekning for maktanalyse i topp 100">
          <div className="grid gap-3 md:grid-cols-5">
            <CoverageStat
              label="Eier/styre"
              value={`${topRecipientCoverage.withOwnershipOrBoard}/${topRecipientCoverage.total}`}
              sub={`${formatPercent(topRecipientCoverage.withOwnershipOrBoard, topRecipientCoverage.total)} har minst én kobling`}
            />
            <CoverageStat
              label="Eierskap"
              value={`${topRecipientCoverage.withOwnership}/${topRecipientCoverage.total}`}
              sub="Aksjonærer eller konsernrelasjoner"
            />
            <CoverageStat
              label="Styre"
              value={`${topRecipientCoverage.withBoard}/${topRecipientCoverage.total}`}
              sub="Registrerte styrepersoner"
            />
            <CoverageStat
              label="Verdikjedeledd"
              value={`${topRecipientCoverage.withStage}/${topRecipientCoverage.total}`}
              sub={`${topRecipientCoverage.production} klassifisert som primærproduksjon`}
            />
            <CoverageStat
              label="Foretaksmodell"
              value={`${topRecipientCoverage.jordbruksforetakName}/${topRecipientCoverage.total}`}
              sub={`${topRecipientCoverage.withLegalForm}/${topRecipientCoverage.total} har legalForm`}
            />
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Toppmottakerlisten er beslutningsklar som fordelingsliste, men ikke som
            makt-/styringsanalyse. I lokal snapshot mangler {topRecipientCoverage.total - topRecipientCoverage.withOwnershipOrBoard}{' '}
            av {topRecipientCoverage.total} toppmottakere eier- eller styrekobling, og{' '}
            {topRecipientCoverage.jordbruksforetakName} av {topRecipientCoverage.total} er syntetiske
            jordbruksforetak-navn uten ordinær foretaksmodell. Det tilsvarer{' '}
            {formatNok(topRecipientCoverage.unlinkedTotalNok)} NOK i topp-100-beløp uten styringsspor.
            Neste datasteg er produsent- og personoppløsning: parent-orgnr finnes for{' '}
            {topRecipientCoverage.withParentOrgNr}/{topRecipientCoverage.total}, men bare{' '}
            {topRecipientCoverage.withParentOrgNrCompanyLink}/{topRecipientCoverage.total} matcher et
            eksisterende selskap i Company-tabellen.
          </div>
        </Card>
      )}

      {hasProduksjonstilskudd && (
        <Card title="Driftsenhet-spor i topp 100">
          <div className="grid gap-3 md:grid-cols-5">
            <CoverageStat
              label="Landbruksreg."
              value={`${topRecipientCoverage.withLandbruksregisterSource}/${topRecipientCoverage.total}`}
              sub="Metadata merket Landbruksregisteret"
            />
            <CoverageStat
              label="Matrikkel"
              value={`${topRecipientCoverage.withMatrikkel}/${topRecipientCoverage.total}`}
              sub="Gards-/bruksnummer på mottaker"
            />
            <CoverageStat
              label="Parent-orgnr"
              value={`${topRecipientCoverage.withParentOrgNr}/${topRecipientCoverage.total}`}
              sub={`${topRecipientCoverage.withParentOrgNrCompanyLink}/${topRecipientCoverage.total} matcher Company`}
            />
            <CoverageStat
              label="Koordinater"
              value={`${topRecipientCoverage.withCoordinates}/${topRecipientCoverage.total}`}
              sub="Geografisk punkt i metadata"
            />
            <CoverageStat
              label="Leveranser"
              value={`${topRecipientCoverage.withDeliveryFootprint}/${topRecipientCoverage.total}`}
              sub={`${formatNok(topRecipientCoverage.deliveryFootprintTotalNok)} NOK har leveransespor`}
            />
          </div>
          <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-600">
            Dette er driftsenhetsspor, ikke validert eierskap. Matrikkel, koordinater og
            leveransefotavtrykk gjør toppmottakerne mer analyserbare geografisk og
            produksjonsmessig, mens parent-orgnr må kobles videre til produsentaktør,
            person eller juridisk enhet før det kan brukes som styringsspor.
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex w-fit flex-wrap rounded-lg border border-stone-200 bg-white p-0.5">
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

          <div className="min-w-0">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Normalisering i kommunevisning
            </div>
            <div className="inline-flex max-w-full flex-wrap rounded-lg border border-stone-200 bg-white p-0.5">
              {KOMMUNE_METRICS.map(option => (
                <button
                  key={option.key}
                  onClick={() => setKommuneMetric(option.key)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium ${
                    kommuneMetric === option.key
                      ? 'bg-emerald-700 text-white'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={option.label}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {tab === 'kart' && (
        <Card title={selectedKommuneMetric.title}>
          <KommuneChoropleth
            data={kommuneData}
            valueLabel={selectedKommuneMetric.valueLabel}
            formatValue={(v) => formatKommuneMetric(v, kommuneMetric)}
          />
          <div className="mt-3 text-xs text-stone-400">
            Kilde: Landbruksdirektoratet, produksjons- og avløsertilskudd 2025 (NLOD).
            Kommuner uten data eller normaliseringsgrunnlag vises i grått. Kvintilgradient:
            mørkere grønn = høyere verdi. {selectedKommuneMetric.footer}
          </div>
        </Card>
      )}

      {tab === 'kommuner' && (
        <Card title={`${selectedKommuneMetric.valueLabel} per kommune (topp 50)`}>
          <div className="space-y-1.5">
            {displayedKommuner.map(k => {
              const pct = (k.metricValue / kommuneMax) * 100
              return (
                <div key={k.kommuneNr} className="flex items-center gap-3 text-sm">
                  <div className="w-28 shrink-0 text-[11px] text-stone-500">
                    <div className="truncate font-medium text-stone-700">
                      {k.kommuneName ?? k.kommuneNr}
                    </div>
                    <div className="font-mono text-stone-400">{k.kommuneNr}</div>
                  </div>
                  <div className="flex-1 relative h-6 bg-stone-50 rounded border border-stone-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-100 border-r border-emerald-400 rounded"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 text-xs text-stone-700">
                      <span className="tabular-nums">
                        {formatKommuneMetric(k.metricValue, kommuneMetric)}
                      </span>
                      <span className="ml-2 truncate text-stone-400">
                        · {k.recipientCount.toLocaleString('no')} mottakere
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
            Data: Landbruksdirektoratet, produksjons- og avløsertilskudd 2025.
            Kommune-navn, innbyggertall og areal kommer fra statisk kommune-metadata i
            <code className="mx-1 rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">
              public/data/food-systems/no/municipalities.json
            </code>
            . {selectedKommuneMetric.footer}
          </div>
        </Card>
      )}

      {tab === 'ordninger' && (
        <>
          <Card title="Verdikjede-dekning i produksjonstilskudd">
            <div className="grid gap-3 md:grid-cols-4">
              <CoverageStat
                label="Med stage"
                value={`${stageCoverageSummary.withKnownStage}/${stageCoverage.totalRecipients}`}
                sub={`${formatPercent(stageCoverageSummary.withKnownStage, stageCoverage.totalRecipients)} av unike mottakere`}
              />
              <CoverageStat
                label="Primærproduksjon"
                value={`${stageCoverageSummary.production?.recipientCount ?? 0}/${stageCoverage.totalRecipients}`}
                sub={`${formatNok(stageCoverageSummary.production?.totalNok ?? 0)} NOK`}
              />
              <CoverageStat
                label="Uklassifisert"
                value={`${stageCoverageSummary.unknown?.recipientCount ?? 0}/${stageCoverage.totalRecipients}`}
                sub={`${stageCoverageSummary.unknown?.rowCount ?? 0} tilskuddsrader`}
              />
              <CoverageStat
                label="Dominerende"
                value={stageCoverageSummary.dominant ? labelStage(stageCoverageSummary.dominant.stage) : '—'}
                sub={`${stageCoverageSummary.dominant?.recipientCount.toLocaleString('no') ?? 0} mottakere`}
              />
            </div>
            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-600">
              Ordning x verdikjedeledd-heatmapet under er derfor ikke en full
              verdikjedesammenligning. I lokal snapshot ligger alle unike
              produksjonstilskuddsmottakere i primærproduksjon, så heatmapet viser
              først og fremst hvordan ordningene fordeler seg innen jordbruksforetakene.
            </div>
          </Card>

          <Card title="Tilskudd per ordning (produksjonstilskudd 2025)">
            <div className="space-y-1.5">
              {byScheme.map(s => {
                const pct = (s.totalNok / topSchemeMax) * 100
                return (
                  <div key={s.scheme} className="flex items-center gap-3 text-sm">
                    <div className="w-48 text-stone-700 text-xs truncate">
                      {labelScheme(s.scheme)}
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

          <Card title="Ordning x verdikjedeledd">
            <SchemeStageHeatmapView heatmap={schemeStageHeatmap} />
            <div className="mt-4 border-t border-stone-100 pt-3 text-xs leading-5 text-stone-400">
              Metode: hver celle summerer produksjonstilskudd per ordning og
              <code className="mx-1 rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">
                Company.valueChainStage
              </code>
              etter at mottakere er gruppert per <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">companyId</code>.
              <code className="mx-1 rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">
                Uklassifisert
              </code>
              betyr manglende verdikjedeledd på selskapet, ikke egen næringskategori.
            </div>
          </Card>
        </>
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
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Driftsenhet
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Ordninger
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Koblinger
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
                    <td className="py-2.5 pr-4 text-xs text-stone-500">
                      <div className="min-w-44 space-y-1">
                        <div className="font-mono text-stone-600">{r.matrikkel ?? '—'}</div>
                        <div className="flex flex-wrap gap-1">
                          {r.parentOrgNr && (
                            <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-600">
                              Parent {r.parentOrgNr}
                            </span>
                          )}
                          {r.hasCoordinates && (
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-800">
                              Koord
                            </span>
                          )}
                          {r.deliveryRowCount > 0 && (
                            <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-800">
                              {r.deliveryCommodityCount} varer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-600">
                      {r.schemeCount}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Link
                          href={`/selskap/${r.companyId}#subsidier`}
                          className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100"
                        >
                          Selskap
                        </Link>
                        {r.ownershipLinkCount > 0 && (
                          <Link
                            href={`/selskap/${r.companyId}#eierskap`}
                            className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-600 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            Eierskap {r.ownershipLinkCount}
                          </Link>
                        )}
                        {r.boardMemberCount > 0 && (
                          <>
                            <Link
                              href={`/selskap/${r.companyId}#styre`}
                              className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-600 hover:border-emerald-300 hover:text-emerald-700"
                            >
                              Styre {r.boardMemberCount}
                            </Link>
                            <Link
                              href={`/styremedlemmer?company=${r.companyId}`}
                              className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 hover:bg-amber-100"
                            >
                              Kryssgraf
                            </Link>
                          </>
                        )}
                        {r.ownershipLinkCount === 0 && r.boardMemberCount === 0 && (
                          <span className="text-[10px] text-stone-300">Ingen eier/styre</span>
                        )}
                      </div>
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

function DistributionStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-stone-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-stone-500">{sub}</p>
    </div>
  )
}

function CoverageStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-stone-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-stone-500">{sub}</p>
    </div>
  )
}

function LorenzChart({ points }: { points: DistributionPoint[] }) {
  const chartPoints = points
    .map(point => `${point.populationPct},${100 - point.amountPct}`)
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Lorenz-kurve for produksjonstilskudd" className="h-56 w-full overflow-visible">
      <line x1="0" y1="100" x2="100" y2="0" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="3 3" />
      <polyline points={chartPoints} fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1="100" x2="100" y2="100" stroke="#a8a29e" strokeWidth="0.75" />
      <line x1="0" y1="0" x2="0" y2="100" stroke="#a8a29e" strokeWidth="0.75" />
      <text x="2" y="8" className="fill-stone-400 text-[5px]">100% beløp</text>
      <text x="70" y="96" className="fill-stone-400 text-[5px]">lik fordeling</text>
    </svg>
  )
}

function SchemeStageHeatmapView({ heatmap }: { heatmap: SchemeStageHeatmapData }) {
  const cellByKey = useMemo(() => {
    const map = new Map<string, SchemeStageCell>()
    for (const cell of heatmap.cells) map.set(`${cell.scheme}::${cell.stage}`, cell)
    return map
  }, [heatmap.cells])

  if (heatmap.cells.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
        Ingen ordning x verdikjedeledd-data for valgt subsidietype.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-medium text-stone-400">
              Ordning
            </th>
            {heatmap.stages.map(stage => (
              <th key={stage} className="px-2 py-2 text-right font-medium text-stone-400">
                {labelStage(stage)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmap.schemes.map(scheme => (
            <tr key={scheme}>
              <th className="sticky left-0 z-10 max-w-48 bg-white px-2 py-2 text-left font-medium text-stone-700">
                <span className="block truncate">{labelScheme(scheme)}</span>
              </th>
              {heatmap.stages.map(stage => {
                const cell = cellByKey.get(`${scheme}::${stage}`)
                const value = cell?.totalNok ?? 0
                const intensity = heatmap.maxNok > 0 ? Math.sqrt(value / heatmap.maxNok) : 0
                const opacity = value > 0 ? 0.08 + intensity * 0.82 : 0
                const dark = opacity > 0.48

                return (
                  <td key={`${scheme}-${stage}`} className="p-0 align-middle">
                    <div
                      className={`min-h-12 rounded-md border px-2 py-1.5 text-right ${
                        value > 0 ? 'border-emerald-100' : 'border-stone-100 bg-stone-50 text-stone-300'
                      }`}
                      style={
                        value > 0
                          ? {
                              backgroundColor: `rgba(4, 120, 87, ${opacity})`,
                              color: dark ? '#ffffff' : '#1c1917',
                            }
                          : undefined
                      }
                      title={`${labelScheme(scheme)} / ${labelStage(stage)}: ${formatNok(value)} NOK`}
                    >
                      {value > 0 ? (
                        <>
                          <div className="font-semibold tabular-nums">{formatNok(value)}</div>
                          <div className={dark ? 'text-white/75' : 'text-stone-500'}>
                            {cell?.recipientCount.toLocaleString('no')} mott.
                          </div>
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
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
