import type { Metadata } from 'next'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  PolitikkContent,
  type PolicyLandscape,
  type PolicyTimeseries,
} from './PolitikkContent'
import { getPolicyDocumentsByCountry } from '@/lib/queries/documents'
import {
  loadAllBacklogs,
  type BacklogRowWithRound,
} from '@/lib/queries/download-backlog'

export const metadata: Metadata = {
  title: 'Politikk — Food Systems 2026',
  description: 'Nordisk matpolitikk-sammenligning: sirkularitet, matsvinn, CO2-avgift, biogass og selvforsyning',
}

// Tag + theme fragments that count as "policy-related" in the backlog CSVs.
// Case-insensitive substring match against BacklogRow.theme.
const POLICY_BACKLOG_THEME_FRAGMENTS = [
  'policy',
  'regulation',
  'competition',
  'governance',
  'enforcement',
  'matsvinn',
  'food-waste',
  'sirkular',
  'circular',
  'utp',
  'biogas',
  'beredskap',
  'selvforsyn',
  'co2',
  'emballasje',
  'packaging',
  'pfas',
  'pricing-governance',
]

function filterPolicyBacklogByCountry(rows: BacklogRowWithRound[]) {
  const byCountry: Record<string, BacklogRowWithRound[]> = {}
  for (const r of rows) {
    if (r.priority !== 'P1' && r.priority !== 'P2') continue
    const theme = (r.theme ?? '').toLowerCase()
    const hit = POLICY_BACKLOG_THEME_FRAGMENTS.some((frag) => theme.includes(frag))
    if (!hit) continue
    const c = (r.country ?? '').toUpperCase()
    if (!c) continue
    byCountry[c] ??= []
    byCountry[c].push(r)
  }
  return byCountry
}

export default async function PolitikkPage() {
  const baseDir = path.join(process.cwd(), 'public', 'data', 'food-systems')
  const data = JSON.parse(
    readFileSync(path.join(baseDir, 'policy-landscape.json'), 'utf-8')
  ) as PolicyLandscape
  const timeseries = JSON.parse(
    readFileSync(path.join(baseDir, 'policy-timeseries.json'), 'utf-8')
  ) as PolicyTimeseries

  // Live document counts + samples per country.
  const docsByCountry = await getPolicyDocumentsByCountry({ samplesPerCountry: 6 })

  // Policy-related P1/P2 backlog rows, grouped by uppercased country code.
  const backlogByCountry = filterPolicyBacklogByCountry(loadAllBacklogs())

  return (
    <PolitikkContent
      data={data}
      timeseries={timeseries}
      docsByCountry={docsByCountry}
      backlogByCountry={backlogByCountry}
    />
  )
}
