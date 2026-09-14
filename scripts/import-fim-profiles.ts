/**
 * Import the Food Innovation Map Norway (FIM) candidate release into FimRelease/FimProfile.
 *
 * Inputs come from the private data repository (FIM_DATA_DIR, default .private-data/fim).
 * Dry run by default; --apply replaces both FIM tables in one transaction.
 *
 * The production workflow runs in a public repository with public logs, so this
 * script prints counts only — never names, ids, or organisation numbers.
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  FIM_PILOT_SEAL_SHA256,
  FIM_RELEASE_ID,
  FIM_SEAL_SHA256,
  buildFimProfileRows,
  validateFimInputs,
  type FimInputs,
  type FimProfileRow,
} from '../src/lib/fim/profile-rows'

const apply = process.argv.includes('--apply')
const dataDir = path.resolve(process.env.FIM_DATA_DIR ?? '.private-data/fim')
const read = (file: string) => readFileSync(path.join(dataDir, file))
const readJson = (file: string) => JSON.parse(read(file).toString('utf8'))
const sha256 = (file: string) => createHash('sha256').update(read(file)).digest('hex')

function fail(message: string): never {
  console.error(`FIM import stopped: ${message}`)
  process.exit(1)
}

const json = (value: unknown) => (value === null || value === undefined ? Prisma.DbNull : (value as Prisma.InputJsonValue))

function toData(row: FimProfileRow, companyId: string | null): Prisma.FimProfileCreateManyInput {
  return {
    ...row,
    companyId,
    fields: row.fields as Prisma.InputJsonValue,
    findings: row.findings as Prisma.InputJsonValue,
    numericObservations: row.numericObservations as Prisma.InputJsonValue,
    narrative: json(row.narrative),
    openQuestions: json(row.openQuestions),
    assessment: json(row.assessment),
    pilotReview: json(row.pilotReview),
  }
}

async function main() {
  if (sha256('enrichment-v009/SEALED.json') !== FIM_SEAL_SHA256) fail('enrichment-v009 seal hash mismatch')
  if (sha256('pilot-v001/SEALED.json') !== FIM_PILOT_SEAL_SHA256) fail('pilot-v001 seal hash mismatch')

  const inputs: FimInputs = {
    profiles: readJson('enrichment-v009/enriched-profiles.json').actors,
    findings: readJson('enrichment-v009/findings.json'),
    observations: readJson('enrichment-v009/numeric-observations.json'),
    summary: readJson('enrichment-v009/summary.json'),
    pilotRecords: readJson('pilot-v001/REVIEWED-CANDIDATES.json').records,
  }
  const errors = validateFimInputs(inputs)
  if (errors.length > 0) fail(errors.join('; '))
  const rows = buildFimProfileRows(inputs)

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
  try {
    const orgNumbers = rows.flatMap(row => (row.orgNumber ? [row.orgNumber] : []))
    const companies = await prisma.company.findMany({ where: { orgNr: { in: orgNumbers } }, select: { id: true, orgNr: true } })
    const companyByOrg = new Map(companies.map(company => [company.orgNr, company.id]))
    const companyId = (row: FimProfileRow) => (row.orgNumber ? companyByOrg.get(row.orgNumber) ?? null : null)
    const existing = new Set((await prisma.fimProfile.findMany({ select: { id: true } })).map(profile => profile.id))
    const incoming = new Set(rows.map(row => row.id))

    console.log(JSON.stringify({
      release: FIM_RELEASE_ID,
      mode: apply ? 'apply' : 'dry-run',
      planned: rows.length,
      creates: rows.filter(row => !existing.has(row.id)).length,
      updates: rows.filter(row => existing.has(row.id)).length,
      removals: [...existing].filter(id => !incoming.has(id)).length,
      core: rows.filter(row => row.cohort === 'core').length,
      fishery: rows.filter(row => row.cohort === 'fishery').length,
      companyLinks: rows.filter(row => companyId(row)).length,
      pilotOverlays: rows.filter(row => row.pilotReview).length,
      findings: inputs.findings.length,
      numericObservations: inputs.observations.length,
    }, null, 2))
    if (!apply) return

    await prisma.$transaction(async tx => {
      await tx.fimProfile.deleteMany({})
      await tx.fimRelease.deleteMany({})
      await tx.fimRelease.create({
        data: {
          id: FIM_RELEASE_ID,
          sealSha256: FIM_SEAL_SHA256,
          pilotSealSha256: FIM_PILOT_SEAL_SHA256,
          profileCount: rows.length,
          findingCount: inputs.findings.length,
          observationCount: inputs.observations.length,
        },
      })
      for (let i = 0; i < rows.length; i += 50) {
        await tx.fimProfile.createMany({ data: rows.slice(i, i + 50).map(row => toData(row, companyId(row))) })
      }
    }, { maxWait: 60_000, timeout: 600_000 })

    const persisted = await prisma.fimProfile.count({ where: { releaseId: FIM_RELEASE_ID } })
    if (persisted !== rows.length) fail(`persisted ${persisted} of ${rows.length} profiles`)
    console.log(JSON.stringify({ persistedRowsVerified: persisted }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
