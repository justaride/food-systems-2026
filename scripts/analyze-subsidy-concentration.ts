/**
 * AP-3 — Tilskuddskonsentrasjon (Gini/Lorenz)
 *
 * Dybdeanalyse-arbeidspakke 3 fra
 * docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
 *
 * Hypotese (ikke-opplagt): Av de norske produksjonstilskuddene konsentreres
 * pengene asymmetrisk — offentlig støtte forsterker eksisterende struktur
 * framfor å utjevne den. Denne analysen tester det med Gini, Lorenz og
 * topp-andel på mottakernivå, samt fordeling per ordning og per kommune.
 *
 * Kilde: Landbruksdirektoratet åpne data (samme primærkilde som
 * scripts/import-produksjonstilskudd.ts). DB-fri: henter CSV, regner, skriver
 * JSON/oppsummering. Ingen DB-tilgang nødvendig.
 *
 * Claim-disiplin: Tilskudd != misbruk. Tall er mottaker-nivå (sum over alle
 * ordninger per orgnr per år), ikke transaksjoner. Resultatet er et internt
 * analysefunn og går gjennom claim-lock/PCQ før ekstern bruk.
 *
 * Bruk:
 *   npx tsx scripts/analyze-subsidy-concentration.ts --year=2024
 *   npx tsx scripts/analyze-subsidy-concentration.ts --year=2022,2023,2024 --out=research/analyse/ap3-tilskuddskonsentrasjon.json
 *   npx tsx scripts/analyze-subsidy-concentration.ts --year=2024 --dry-run   # bare radtelling
 */

import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const DEFAULT_YEAR = 2024

const urlForYear = (year: number) =>
  `https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/produksjon-og-avlosertilskudd/${year}/dataset.csv`

// Samme ordningskolonner som import-produksjonstilskudd.ts
const SCHEME_COLUMNS = [
  'arealtilskudd',
  'avloesertilskudd',
  'beitetilskudd',
  'bevaringsverdige_husdyr_tilsku',
  'distriktstilskudd_frukt_groent',
  'distriktstilskudd_potet_gronns',
  'oeko_grønt_tilskudd',
  'husdyrtilskudd',
  'kulturlandskapstilskudd',
  'melkeproduksjon',
  'oekologiskarealtilskudd',
  'oekologiskhusdyrtilskudd',
  'smaa_mellomstore_melkebruk',
  'storfekjoettproduksjon',
  'utmarksbeitetilskudd',
] as const

type SchemeCol = (typeof SCHEME_COLUMNS)[number]

function parseCsv(text: string, delimiter: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cells = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = (cells[idx] ?? '').trim()
    })
    return row
  })
}

function normalizeOrgNr(raw: string | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 9) return null
  return digits
}

function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) && n !== 0 ? n : null
}

async function fetchCsv(year: number) {
  const url = urlForYear(year)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch tilskudd CSV ${year}: ${res.status}`)
  const text = await res.text()
  const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ','
  return parseCsv(text, delimiter)
}

/**
 * Gini-koeffisient på et sett ikke-negative verdier.
 * 0 = perfekt likhet, ~1 = all støtte hos én mottaker.
 * Bruker sortert-rangformel: G = (2*sum(i*x_i) / (n*sum(x))) - (n+1)/n.
 */
export function gini(values: number[]): number {
  const x = values.filter(v => v > 0).sort((a, b) => a - b)
  const n = x.length
  if (n === 0) return 0
  let cum = 0
  let weighted = 0
  for (let i = 0; i < n; i++) {
    weighted += (i + 1) * x[i]
    cum += x[i]
  }
  if (cum === 0) return 0
  return (2 * weighted) / (n * cum) - (n + 1) / n
}

/** Lorenz-deciler: kumulativ andel av total støtte holdt av de fattigste 10..100 %. */
export function lorenzDeciles(values: number[]): number[] {
  const x = values.filter(v => v > 0).sort((a, b) => a - b)
  const n = x.length
  const total = x.reduce((s, v) => s + v, 0)
  if (n === 0 || total === 0) return Array(10).fill(0)
  const out: number[] = []
  for (let d = 1; d <= 10; d++) {
    const cutoff = Math.floor((d / 10) * n)
    let cum = 0
    for (let i = 0; i < cutoff; i++) cum += x[i]
    out.push(+(cum / total).toFixed(4))
  }
  return out
}

/** Andel av total holdt av topp p-prosent av mottakerne. */
export function topShare(values: number[], pct: number): number {
  const x = values.filter(v => v > 0).sort((a, b) => b - a) // synkende
  const n = x.length
  const total = x.reduce((s, v) => s + v, 0)
  if (n === 0 || total === 0) return 0
  const k = Math.max(1, Math.ceil((pct / 100) * n))
  let top = 0
  for (let i = 0; i < k; i++) top += x[i]
  return +(top / total).toFixed(4)
}

function summarize(year: number, rows: Record<string, string>[]) {
  const perRecipient = new Map<string, number>()
  const perKommune = new Map<string, number>()
  const perScheme = new Map<string, number>()

  for (const row of rows) {
    const orgNr = normalizeOrgNr(row.orgnr)
    if (!orgNr) continue
    const kommune = row.kommunenr || 'ukjent'
    let recipientYearTotal = 0
    for (const scheme of SCHEME_COLUMNS) {
      const amount = parseAmount(row[scheme])
      if (!amount) continue
      recipientYearTotal += amount
      perScheme.set(scheme, (perScheme.get(scheme) ?? 0) + amount)
    }
    if (recipientYearTotal <= 0) continue
    perRecipient.set(orgNr, (perRecipient.get(orgNr) ?? 0) + recipientYearTotal)
    perKommune.set(kommune, (perKommune.get(kommune) ?? 0) + recipientYearTotal)
  }

  const recipientTotals = [...perRecipient.values()]
  const kommuneTotals = [...perKommune.values()]
  const totalNok = recipientTotals.reduce((s, v) => s + v, 0)
  const n = recipientTotals.length
  const sorted = [...recipientTotals].sort((a, b) => a - b)
  const median = n ? sorted[Math.floor(n / 2)] : 0

  const schemeBreakdown = [...perScheme.entries()]
    .map(([scheme, amount]) => ({ scheme, amount, share: +(amount / totalNok).toFixed(4) }))
    .sort((a, b) => b.amount - a.amount)

  return {
    year,
    recipients: n,
    totalNok: Math.round(totalNok),
    meanNok: n ? Math.round(totalNok / n) : 0,
    medianNok: Math.round(median),
    giniRecipient: +gini(recipientTotals).toFixed(4),
    giniKommune: +gini(kommuneTotals).toFixed(4),
    top1pctShare: topShare(recipientTotals, 1),
    top5pctShare: topShare(recipientTotals, 5),
    top10pctShare: topShare(recipientTotals, 10),
    lorenzDeciles: lorenzDeciles(recipientTotals),
    schemeBreakdown,
    kommuner: kommuneTotals.length,
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const yearArg = process.argv.find(a => a.startsWith('--year='))
  const years = yearArg
    ? yearArg.split('=')[1].split(',').map(y => parseInt(y.trim(), 10))
    : [DEFAULT_YEAR]
  const outArg = process.argv.find(a => a.startsWith('--out='))

  const results = []
  for (const year of years) {
    console.log(`[ap3] henter ${year} …`)
    const rows = await fetchCsv(year)
    console.log(`[ap3] ${year}: ${rows.length} CSV-rader`)
    if (dryRun) continue
    const summary = summarize(year, rows)
    results.push(summary)
    console.log(
      `[ap3] ${year}: mottakere=${summary.recipients} total=${(summary.totalNok / 1e9).toFixed(2)} mrd NOK ` +
        `Gini=${summary.giniRecipient} topp1%=${(summary.top1pctShare * 100).toFixed(1)}% ` +
        `topp10%=${(summary.top10pctShare * 100).toFixed(1)}%`
    )
  }

  if (dryRun || results.length === 0) return

  if (outArg) {
    const out = outArg.split('=')[1]
    writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'Landbruksdirektoratet opendata', results }, null, 2))
    console.log(`[ap3] skrev ${out}`)
  }

  console.log('\n--- AP-3 oppsummering (intern; tilskudd != misbruk; mottaker-nivå) ---')
  for (const r of results) {
    console.log(
      `${r.year}: Gini ${r.giniRecipient} | topp 1% av ${r.recipients} mottakere får ` +
        `${(r.top1pctShare * 100).toFixed(1)}% | topp 10% får ${(r.top10pctShare * 100).toFixed(1)}% | ` +
        `median ${Math.round(r.medianNok / 1000)}k NOK`
    )
  }
  console.log(
    'Forbehold: mottaker-nivå (sum av alle ordninger per orgnr/år), ikke transaksjon; ' +
      'kun rader med gyldig 9-sifret orgnr og beløp > 0; går gjennom claim-lock/PCQ før ekstern bruk.'
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('[ap3] feilet:', err)
    process.exit(1)
  })
}
