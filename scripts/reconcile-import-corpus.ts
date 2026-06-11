import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { KONSERN_REGISTRY } from '../src/lib/queries/ownership'
import {
  buildKonsernTreeSizeExpectations,
  extractOrgNrsFromImportSource,
  reconcileImportCorpus,
  type ImportCorpusException,
} from './lib/import-corpus-reconciliation'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function loadExceptions(path: string): ImportCorpusException[] {
  if (!existsSync(path)) return []

  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as ImportCorpusException[] | { exceptions?: ImportCorpusException[] }
  return Array.isArray(parsed) ? parsed : parsed.exceptions ?? []
}

function readImportCorpus(rootDir: string) {
  const scriptsDir = join(rootDir, 'scripts')
  return readdirSync(scriptsDir)
    .filter(file => /^import-.+\.ts$/.test(file))
    .sort()
    .map(file => {
      const absolutePath = join(scriptsDir, file)
      const script = relative(rootDir, absolutePath)
      return extractOrgNrsFromImportSource(script, readFileSync(absolutePath, 'utf-8'))
    })
}

async function main() {
  const rootDir = process.cwd()
  const corpus = readImportCorpus(rootDir)
  const companies = await prisma.company.findMany({ select: { orgNr: true } })
  const exceptions = loadExceptions(join(rootDir, 'data/import-reconciliation-exceptions.json'))
  const report = reconcileImportCorpus(
    corpus,
    companies.map(company => company.orgNr).filter((orgNr): orgNr is string => orgNr != null),
    exceptions,
  )

  const outputPath = join(rootDir, 'data/import-reconciliation.json')
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)

  const treeExpectations = buildKonsernTreeSizeExpectations(
    corpus,
    Object.entries(KONSERN_REGISTRY).map(([rootOrgNr, cfg]) => ({ rootOrgNr, slug: cfg.slug })),
  )
  const treeExpectationPath = join(rootDir, 'data/konsern-tree-size-expectations.json')
  writeFileSync(treeExpectationPath, `${JSON.stringify(treeExpectations, null, 2)}\n`)

  console.log(`Wrote ${relative(rootDir, outputPath)}`)
  console.log(`Wrote ${relative(rootDir, treeExpectationPath)}`)
  console.log(
    `  ${report.totals.uniqueDefined} unique org.nr. in ${report.totals.scripts} import scripts; ` +
    `${report.totals.uniqueFound} found in Company; ` +
    `${report.totals.uniqueUnexplainedMissing} unexplained missing`,
  )
  console.log(
    `  ${treeExpectations.roots.length} konsern tree-size expectations from static ownership links`,
  )

  const scriptsWithMissing = report.scripts.filter(script => script.unexplainedMissing.length > 0)
  for (const script of scriptsWithMissing) {
    console.log(`  ${script.script}: ${script.unexplainedMissing.length} missing (${script.unexplainedMissing.join(', ')})`)
  }

  if (process.argv.includes('--strict') && report.totals.uniqueUnexplainedMissing > 0) {
    process.exitCode = 1
  }
}

main()
  .catch(error => {
    console.error('Import corpus reconciliation failed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
