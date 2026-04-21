import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Expectation = {
  label: string
  count: () => Promise<number>
  baseline: number
  seedEmpty?: boolean
}

const expectations: Expectation[] = [
  { label: 'Document', count: () => prisma.document.count(), baseline: 900 },
  { label: 'SourceDoc', count: () => prisma.sourceDoc.count(), baseline: 150 },
  { label: 'Report', count: () => prisma.report.count(), baseline: 100 },
  { label: 'Insight', count: () => prisma.insight.count(), baseline: 100 },
  { label: 'Thesis', count: () => prisma.thesis.count(), baseline: 60 },
  { label: 'Company', count: () => prisma.company.count(), baseline: 50 },
  { label: 'BoardMember', count: () => prisma.boardMember.count(), baseline: 300 },
  { label: 'PersonProfile', count: () => prisma.personProfile.count(), baseline: 30 },
  { label: 'CompanyOwnership', count: () => prisma.companyOwnership.count(), baseline: 10 },
  { label: 'BusinessRelationship', count: () => prisma.businessRelationship.count(), baseline: 40 },
  { label: 'CompanyProperty', count: () => prisma.companyProperty.count(), baseline: 80 },
  { label: 'Meeting', count: () => prisma.meeting.count(), baseline: 5 },
  { label: 'Communication', count: () => prisma.communication.count(), baseline: 0, seedEmpty: true },
  { label: 'MediaTheme', count: () => prisma.mediaTheme.count(), baseline: 6 },
  { label: 'MediaOutlet', count: () => prisma.mediaOutlet.count(), baseline: 8 },
  { label: 'MediaEntry', count: () => prisma.mediaEntry.count(), baseline: 10 },
  { label: 'TeamMember', count: () => prisma.teamMember.count(), baseline: 5 },
  { label: 'Deliverable', count: () => prisma.deliverable.count(), baseline: 5 },
  { label: 'Actor', count: () => prisma.actor.count(), baseline: 150 },
]

type Severity = 'ok' | 'warn' | 'fail'

function evaluate(actual: number, baseline: number, seedEmpty: boolean): Severity {
  if (seedEmpty) return actual >= 0 ? 'ok' : 'fail'
  if (baseline === 0) return 'ok'
  if (actual === 0) return 'fail'
  if (actual < baseline * 0.8) return 'warn'
  return 'ok'
}

function icon(sev: Severity): string {
  if (sev === 'ok') return '  OK  '
  if (sev === 'warn') return ' WARN '
  return ' FAIL '
}

async function main() {
  console.log('\nFood Systems 2026 — prod count verification')
  console.log('Baselines reflect values after 2026-04-21 resync.\n')

  const results: Array<{ label: string; actual: number; baseline: number; sev: Severity; note?: string }> = []

  for (const exp of expectations) {
    try {
      const actual = await exp.count()
      const sev = evaluate(actual, exp.baseline, exp.seedEmpty ?? false)
      const note = exp.seedEmpty ? 'tom i seed per design' : undefined
      results.push({ label: exp.label, actual, baseline: exp.baseline, sev, note })
    } catch (err) {
      results.push({
        label: exp.label,
        actual: -1,
        baseline: exp.baseline,
        sev: 'fail',
        note: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const pad = (s: string, n: number) => s.padEnd(n)
  const rpad = (s: string, n: number) => s.padStart(n)

  console.log(`${pad('Status', 7)}${pad('Tabell', 22)}${rpad('Actual', 10)}${rpad('Baseline', 12)}  Merknad`)
  console.log('-'.repeat(80))

  for (const r of results) {
    const line = `[${icon(r.sev)}]${pad('', 1)}${pad(r.label, 22)}${rpad(String(r.actual), 10)}${rpad(String(r.baseline), 12)}  ${r.note ?? ''}`
    console.log(line)
  }

  const failures = results.filter((r) => r.sev === 'fail').length
  const warnings = results.filter((r) => r.sev === 'warn').length

  console.log('')
  if (failures > 0) {
    console.log(`Result: ${failures} FAIL, ${warnings} WARN`)
    process.exitCode = 1
  } else if (warnings > 0) {
    console.log(`Result: OK with ${warnings} warnings (tabeller under 80% av baseline)`)
  } else {
    console.log('Result: OK — alle tabeller over baseline')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
