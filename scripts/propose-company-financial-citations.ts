import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildCompanyFinancialCitationProposalRows,
  formatCompanyFinancialCitationProposalCsv,
  type CompanyFinancialCitationCandidate,
} from './lib/company-financial-citation-proposals'

const DEFAULT_OUTPUT = 'research/company-financial-citation-proposals-2026-05-18.csv'

const CANDIDATES: CompanyFinancialCitationCandidate[] = [
  {
    companyName: 'ASKO Norge AS',
    years: [2024],
    documentPath: 'evidence-pack/arsrapporter/asko-barekraft-2024.pdf',
    note: 'Candidate document is a sustainability report; verify it contains exact financial values before citation.',
  },
  { companyName: 'Axfood AB', years: [2024], documentPath: 'evidence-pack/arsrapporter/axfood-annual-report-2024.pdf' },
  { companyName: 'Coop Danmark A/S', years: [2024], documentPath: 'evidence-pack/arsrapporter/coop-danmark-2024.pdf' },
  { companyName: 'Coop Norge SA', years: [2024], documentPath: 'evidence-pack/arsrapporter/coop-norge-2024.pdf' },
  {
    companyName: 'Hagar hf',
    years: [2020, 2021, 2022, 2023, 2024],
    documentPath: 'evidence-pack/arsrapporter/hagar-2024-25.pdf',
    note: 'Candidate annual report may contain multi-year tables; verify exact fiscal-year mapping and exchange-rate conversion.',
  },
  { companyName: 'ICA Gruppen AB', years: [2024], documentPath: 'evidence-pack/arsrapporter/ica-gruppen-annual-report-2024.pdf' },
  { companyName: 'Kesko Oyj', years: [2024], documentPath: 'evidence-pack/arsrapporter/kesko-annual-report-2024.pdf' },
  { companyName: 'NorgesGruppen ASA', years: [2024], documentPath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf' },
  { companyName: 'Reitan Retail AS', years: [2024], documentPath: 'evidence-pack/arsrapporter/reitan-retail-2024.pdf' },
  { companyName: 'Salling Group A/S', years: [2024], documentPath: 'evidence-pack/arsrapporter/salling-group-2024.pdf' },
]

type CliOptions = {
  write: boolean
  output: string
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    write: false,
    output: DEFAULT_OUTPUT,
  }

  for (const arg of argv) {
    if (arg === '--write') {
      options.write = true
      continue
    }
    if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length)
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  console.log(`CompanyFinancial citation proposals: ${options.write ? 'WRITE' : 'DRY RUN'}`)

  try {
    const candidatePaths = [...new Set(CANDIDATES.map(candidate => candidate.documentPath))]
    const candidateCompanies = [...new Set(CANDIDATES.map(candidate => candidate.companyName))]
    const candidateYears = [...new Set(CANDIDATES.flatMap(candidate => candidate.years))]

    const [documents, financials] = await Promise.all([
      prisma.document.findMany({
        where: { filePath: { in: candidatePaths } },
        select: { id: true, title: true, filePath: true, url: true },
        orderBy: { filePath: 'asc' },
      }),
      prisma.companyFinancial.findMany({
        where: {
          year: { in: candidateYears },
          company: { name: { in: candidateCompanies } },
        },
        select: {
          id: true,
          year: true,
          revenueNok: true,
          operatingResult: true,
          ebitda: true,
          source: true,
          company: {
            select: { name: true, orgNr: true },
          },
        },
        orderBy: [{ company: { name: 'asc' } }, { year: 'asc' }],
      }),
    ])

    const rows = buildCompanyFinancialCitationProposalRows({
      candidates: CANDIDATES,
      documents,
      financials: financials.map(row => ({
        id: row.id,
        companyName: row.company.name,
        orgNr: row.company.orgNr,
        year: row.year,
        revenueNok: row.revenueNok?.toString() ?? null,
        operatingResult: row.operatingResult?.toString() ?? null,
        ebitda: row.ebitda?.toString() ?? null,
        source: row.source,
      })),
    })
    const ready = rows.filter(row => row.status === 'proposal_requires_human_value_check').length
    const skipped = rows.length - ready
    const csv = formatCompanyFinancialCitationProposalCsv(rows)

    if (options.write) {
      const outputPath = join(process.cwd(), options.output)
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, `${csv}\n`)
      console.log(`Wrote ${rows.length} proposal row(s) to ${options.output}`)
    } else {
      console.log(csv)
    }

    console.log(`Proposal rows requiring human value check: ${ready}`)
    console.log(`Skipped rows: ${skipped}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('CompanyFinancial citation proposal failed:', error)
  process.exit(1)
})
