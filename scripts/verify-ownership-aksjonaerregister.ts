/**
 * AP-5 eierandel-primærsjekk — Skatteetaten Aksjonærregisteret (§8 steg 1, eierlag)
 *
 * Brønnøysund-stikkprøven (`...maktkart-bronnoysund-stikkprove-2026-06-14.md`)
 * bekreftet maktkartets kontroll-STRUKTUR (form + styre), men IKKE eierandel-%.
 * Dette skriptet lukker eierandel-laget mot primærkilden: Skatteetatens
 * Aksjonærregister.
 *
 * Viktig: Aksjonærregisteret er IKKE en direkte nedlasting. Du bestiller et
 * uttrekk (alle selskap eller spesifikke orgnr) fra
 *   https://www.skatteetaten.no/en/deling/aksjonarregisteret/
 * og får en e-postlenke som er gyldig i én uke. Last ned CSV-en lokalt og kjør:
 *   npx tsx scripts/verify-ownership-aksjonaerregister.ts --file=<sti til csv>
 *
 * Registeret dekker AKSJESELSKAP (AS/ASA). Samvirkeforetak (SA: Coop, TINE,
 * Nortura, Felleskjøpet) har ingen aksjer og står IKKE i registeret — deres
 * eierform (medlemseid, ingen kontrollerende aksjonær) er allerede bekreftet av
 * SA-formen i Brønnøysund-stikkprøven. Skriptet flagger SA-mål som «N/A samvirke».
 *
 * Claim-disiplin: bekrefter eierandel-% mot primærkilde; «kontroll» = aksjepost,
 * ikke nødvendigvis operativ styring. Går gjennom claim-lock før ekstern bruk.
 *
 * DB-fritt (leser CSV). Ren kjerne er eksportert og enhetstestet.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export type ShareRow = {
  companyOrgNr: string
  companyName: string
  shareClass: string
  holderName: string
  holderId: string // fødselsår eller orgnr
  holderShares: number
  companyTotalShares: number
}

export type HolderAgg = { name: string; id: string; shares: number; pct: number; isCompany: boolean }
export type CompanyAgg = { orgNr: string; name: string; totalShares: number; holders: HolderAgg[] }

export type ExpectedOwner = {
  orgNr: string
  company: string
  form: 'AS' | 'ASA' | 'SA'
  expectedOwner: string
  expectedPct: number | null // null = 100 % medlemseid/ikke aksjeselskap
  note?: string
}

const SPLIT = /;|\t/

/** Finn kolonneindeks ut fra header-nøkkelord (robust mot årsvariasjon). */
export function resolveColumns(header: string[]): {
  orgNr: number; selskap: number; aksjeklasse: number; navn: number; id: number; holderShares: number; totalShares: number
} {
  const norm = header.map(h => h.toLowerCase().replace(/"/g, '').trim())
  const find = (...keys: string[]) => norm.findIndex(h => keys.every(k => h.includes(k)))
  return {
    orgNr: find('orgnr') >= 0 ? find('orgnr') : 0,
    selskap: find('selskap') >= 0 && !norm[find('selskap')].includes('aksjer') ? find('selskap') : 1,
    aksjeklasse: find('aksjeklasse'),
    navn: find('navn', 'aksjon') >= 0 ? find('navn', 'aksjon') : find('aksjon'),
    id: find('fødselsår') >= 0 ? find('fødselsår') : find('orgnr', 'aksjon'),
    holderShares: norm.findIndex(h => h.includes('antall aksjer') && !h.includes('selskap')),
    totalShares: norm.findIndex(h => h.includes('antall aksjer') && h.includes('selskap')),
  }
}

function num(s: string): number {
  const n = Number((s ?? '').replace(/\s/g, '').replace(/"/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Parser Aksjonærregister-CSV (semikolon, header-styrt). */
export function parseAksjonaerCsv(text: string): ShareRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(SPLIT)
  const c = resolveColumns(header)
  const rows: ShareRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const f = lines[i].split(SPLIT).map(x => x.replace(/^"|"$/g, '').trim())
    const companyOrgNr = f[c.orgNr]
    if (!companyOrgNr || !/^\d{9}$/.test(companyOrgNr)) continue
    rows.push({
      companyOrgNr,
      companyName: f[c.selskap] ?? '',
      shareClass: c.aksjeklasse >= 0 ? f[c.aksjeklasse] ?? '' : '',
      holderName: f[c.navn] ?? '',
      holderId: c.id >= 0 ? f[c.id] ?? '' : '',
      holderShares: num(f[c.holderShares]),
      companyTotalShares: num(f[c.totalShares]),
    })
  }
  return rows
}

/** Aggreger eierandel per selskap: summer aksjer per (selskap, eier) over aksjeklasser. */
export function aggregateOwnership(rows: ShareRow[]): Map<string, CompanyAgg> {
  const byCompany = new Map<string, { name: string; total: number; holders: Map<string, { name: string; id: string; shares: number }> }>()
  for (const r of rows) {
    if (!byCompany.has(r.companyOrgNr)) byCompany.set(r.companyOrgNr, { name: r.companyName, total: r.companyTotalShares, holders: new Map() })
    const co = byCompany.get(r.companyOrgNr)!
    if (r.companyTotalShares > co.total) co.total = r.companyTotalShares // robust mot blanke felt
    const key = r.holderId || r.holderName
    const h = co.holders.get(key) ?? { name: r.holderName, id: r.holderId, shares: 0 }
    h.shares += r.holderShares
    co.holders.set(key, h)
  }
  const out = new Map<string, CompanyAgg>()
  for (const [orgNr, co] of byCompany) {
    const total = co.total || [...co.holders.values()].reduce((a, h) => a + h.shares, 0)
    const holders = [...co.holders.values()]
      .map(h => ({ name: h.name, id: h.id, shares: h.shares, pct: total > 0 ? +((h.shares / total) * 100).toFixed(2) : 0, isCompany: /^\d{9}$/.test(h.id) }))
      .sort((a, b) => b.shares - a.shares)
    out.set(orgNr, { orgNr, name: co.name, totalShares: total, holders })
  }
  return out
}

function namesCompatible(a: string, b: string): boolean {
  const t = (s: string) => s.toLowerCase().replace(/[øöó]/g, 'o').replace(/[åá]/g, 'a').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
  const A = t(a), B = t(b)
  if (A.length === 0 || B.length === 0) return false
  const [s, l] = A.length <= B.length ? [A, B] : [B, A]
  const L = new Set(l)
  return s.some(w => L.has(w)) // delvis match holder (familienavn/selskapsnavn)
}

export type OwnershipVerdict = {
  orgNr: string; company: string; form: string; applicable: boolean
  expectedOwner: string; expectedPct: number | null
  actualTopOwner: string | null; actualTopPct: number | null
  ownerMatch: boolean | null; pctWithinTolerance: boolean | null; verdict: string
}

/** Sammenlign aggregert eierskap mot forventede AP-5-eiere. */
export function compareToExpected(agg: Map<string, CompanyAgg>, expected: ExpectedOwner[], pctTolerance = 3): OwnershipVerdict[] {
  return expected.map(e => {
    if (e.form === 'SA') {
      return { orgNr: e.orgNr, company: e.company, form: e.form, applicable: false, expectedOwner: e.expectedOwner, expectedPct: e.expectedPct,
        actualTopOwner: null, actualTopPct: null, ownerMatch: null, pctWithinTolerance: null, verdict: 'N/A samvirke — bekreftet av SA-form i Brønnøysund-stikkprøven (medlemseid, ingen aksjer)' }
    }
    const co = agg.get(e.orgNr)
    if (!co || co.holders.length === 0) {
      return { orgNr: e.orgNr, company: e.company, form: e.form, applicable: true, expectedOwner: e.expectedOwner, expectedPct: e.expectedPct,
        actualTopOwner: null, actualTopPct: null, ownerMatch: null, pctWithinTolerance: null, verdict: 'mangler i uttrekket — bestill orgnr i registeret' }
    }
    const top = co.holders[0]
    const ownerMatch = namesCompatible(top.name, e.expectedOwner)
    const pctOk = e.expectedPct == null ? null : Math.abs(top.pct - e.expectedPct) <= pctTolerance
    const verdict = ownerMatch && (pctOk ?? true) ? 'bekreftet' : ownerMatch ? `eier OK, % avvik (forventet ${e.expectedPct}, funnet ${top.pct})` : 'avvik — topp-eier matcher ikke forventet'
    return { orgNr: e.orgNr, company: e.company, form: e.form, applicable: true, expectedOwner: e.expectedOwner, expectedPct: e.expectedPct,
      actualTopOwner: top.name, actualTopPct: top.pct, ownerMatch, pctWithinTolerance: pctOk, verdict }
  })
}

// AP-5 / konsern-coverage forventede eiere (kilde: data/konsern-coverage.json + årsrapport 2024).
export const EXPECTED_OWNERS: ExpectedOwner[] = [
  { orgNr: '819731322', company: 'NorgesGruppen ASA', form: 'ASA', expectedOwner: 'Joh. Johannson / Johannson-familien', expectedPct: 74.4 },
  { orgNr: '914526647', company: 'Reitan Retail AS', form: 'AS', expectedOwner: 'Reitan-familien (Odd Reitan)', expectedPct: 100 },
  { orgNr: '914224314', company: 'BAMA Gruppen AS', form: 'AS', expectedOwner: 'NorgesGruppen ASA', expectedPct: 46, note: 'delt NG/Reitan — forvent NG ~46 %, Reitan ~46 %' },
  { orgNr: '929228723', company: 'ASKO Norge AS', form: 'AS', expectedOwner: 'NorgesGruppen', expectedPct: 100 },
  { orgNr: '975350940', company: 'Lerøy Seafood Group ASA', form: 'ASA', expectedOwner: 'Austevoll Seafood ASA', expectedPct: 52.7 },
  { orgNr: '929975200', company: 'Austevoll Seafood ASA', form: 'ASA', expectedOwner: 'Laco AS', expectedPct: 52.7 },
  { orgNr: '960514718', company: 'SalMar ASA', form: 'ASA', expectedOwner: 'Kverva / Gustav Witzøe', expectedPct: 41.3 },
  { orgNr: '964118191', company: 'Mowi ASA', form: 'ASA', expectedOwner: 'Geveran / John Fredriksen', expectedPct: 14.4 },
  { orgNr: '910747711', company: 'Orkla ASA', form: 'ASA', expectedOwner: 'Canica / Stein Erik Hagen', expectedPct: 25.1 },
  // Samvirke (SA) — register N/A, bekreftet av form:
  { orgNr: '936560288', company: 'Coop Norge SA', form: 'SA', expectedOwner: 'Samvirkelagene (medlemmer)', expectedPct: 100 },
  { orgNr: '947942638', company: 'TINE SA', form: 'SA', expectedOwner: 'Melkebønder (medlemmer)', expectedPct: 100 },
  { orgNr: '938752648', company: 'Nortura SA', form: 'SA', expectedOwner: 'Bønder (medlemmer)', expectedPct: 100 },
  { orgNr: '911608103', company: 'Felleskjøpet Agri SA', form: 'SA', expectedOwner: 'Bondemedlemmer', expectedPct: 100 },
]

function parseArgs(argv: string[]) {
  const opts: { file: string | null; orgnr: string[] | null; out: string | null } = { file: null, orgnr: null, out: null }
  for (const a of argv) {
    if (a.startsWith('--file=')) opts.file = a.slice('--file='.length)
    else if (a.startsWith('--orgnr=')) opts.orgnr = a.slice('--orgnr='.length).split(',').map(s => s.trim()).filter(Boolean)
    else if (a.startsWith('--out=')) opts.out = a.slice('--out='.length)
    else throw new Error(`Ukjent argument: ${a}`)
  }
  return opts
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (!opts.file) {
    console.log('Bruk: npx tsx scripts/verify-ownership-aksjonaerregister.ts --file=<aksjonaerregister.csv> [--orgnr=a,b] [--out=rapport.json]')
    console.log('Bestill uttrekk: https://www.skatteetaten.no/en/deling/aksjonarregisteret/  (e-postlenke gyldig 1 uke; AS/ASA — SA står ikke i registeret)')
    process.exit(1)
  }
  const text = readFileSync(opts.file, 'latin1')
  const rows = parseAksjonaerCsv(text)
  const agg = aggregateOwnership(rows)
  const expected = opts.orgnr ? EXPECTED_OWNERS.filter(e => opts.orgnr!.includes(e.orgNr)) : EXPECTED_OWNERS
  const verdicts = compareToExpected(agg, expected)

  console.log(`[aksjonaer] ${rows.length} rader, ${agg.size} selskaper i uttrekket\n`)
  for (const v of verdicts) {
    const tag = !v.applicable ? '–' : v.verdict.startsWith('bekreftet') ? '✓' : '⚠'
    console.log(`  ${tag} ${v.company} (${v.orgNr}) [${v.form}]`)
    if (v.applicable) console.log(`      forventet: ${v.expectedOwner} ${v.expectedPct ?? '?'}%  |  funnet: ${v.actualTopOwner ?? '—'} ${v.actualTopPct ?? '—'}%  → ${v.verdict}`)
    else console.log(`      ${v.verdict}`)
  }
  const confirmed = verdicts.filter(v => v.applicable && v.verdict.startsWith('bekreftet')).length
  const applicable = verdicts.filter(v => v.applicable).length
  console.log(`\n[aksjonaer] bekreftet ${confirmed}/${applicable} aksjeselskap; ${verdicts.length - applicable} samvirke (N/A, bekreftet av form).`)

  if (opts.out) {
    writeFileSync(opts.out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'Skatteetaten Aksjonærregisteret', verdicts }, null, 2))
    console.log(`[aksjonaer] skrev ${opts.out}`)
  }
  console.log('\nForbehold: eierandel = aksjepost, ikke nødvendigvis operativ kontroll. Personopplysninger i registeret behandles internt. Intern baseline → claim-lock før ekstern bruk.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
