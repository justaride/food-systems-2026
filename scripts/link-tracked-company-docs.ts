import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { isCompanyDocumentEvidenceCandidate } from '../src/lib/company-document-linking'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DRY_RUN = process.argv.includes('--dry-run')
const DETERMINISTIC_ONLY = process.argv.includes('--deterministic-only')

const DEPRECATED_ORGNRS = new Set([
  '911856655', // NorgesGruppen ASA
  '879469062', // Coop Norge SA
  '935174627', // Reitan Retail AS
  '874560552', // TINE SA
  '956866266', // SalMar ASA
  '975320637', // Leroy Seafood Group ASA
  '919998919', // Yara International ASA
  '980358088',
  '929094636', // ASKO Norge AS
  'SE-556448-4498', // City Gross Sverige AB
])

const COMPANY_SUFFIX_RE =
  /\b(?:as|asa|sa|ba|ans|da|nuf|ab|kb|hb|a\/s|aps|oyj|oy|ky|hf|ehf|ltd|limited|inc|corp|corporation|gmbh|ag|plc|llc|bv|nv)\.?$/i

const ALIASES: Record<string, string[]> = {
  'NorgesGruppen ASA': ['NorgesGruppen', 'Norgesgruppen'],
  'Coop Norge SA': ['Coop Norge'],
  'Coop Danmark A/S': ['Coop Danmark'],
  'Reitan Retail AS': ['Reitan Retail', 'REMA 1000', 'Rema 1000', 'Rema1000'],
  'REMA 1000 AS': ['REMA 1000', 'Rema 1000', 'Rema1000'],
  'Orkla ASA': ['Orkla'],
  'Nortura SA': ['Nortura', 'Gilde', 'Prior'],
  'TINE SA': ['TINE'],
  'Felleskjopet Agri SA': ['Felleskjopet', 'Felleskjopet Agri'],
  'Felleskjøpet Agri SA': ['Felleskjøpet', 'Felleskjøpet Agri'],
  'BAMA Gruppen AS': ['BAMA', 'Bama Gruppen'],
  'Mowi ASA': ['Mowi', 'Marine Harvest'],
  'SalMar ASA': ['SalMar', 'Salmar'],
  'Leroy Seafood Group ASA': ['Leroy', 'Leroy Seafood'],
  'Lerøy Seafood Group ASA': ['Lerøy', 'Lerøy Seafood'],
  'Yara International ASA': ['Yara', 'Yara International'],
  'Skretting AS': ['Skretting'],
  'ASKO Norge AS': ['ASKO Norge'],
  'I K Lykke AS': ['I.K. Lykke', 'I K Lykke', 'Bunnpris', 'Bunnpris AS'],
  'Too Good To Go Norge AS': ['Too Good To Go', 'TGTG'],
  'Matvett AS': ['Matvett'],
  'Matsentralen Norge': ['Matsentralen Norge', 'Matsentralen'],
  'Oda': ['Oda'],
  'HOFF SA': ['HOFF'],
}

type TrackedCompany = {
  id: string
  name: string
  orgNr: string
}

type DocumentRow = {
  id: string
  title: string
  content: string
  documentType: string | null
  filePath: string | null
}

type PreparedDocument = DocumentRow & {
  titleSearch: string
  bodySearch: string
}

type RefCandidate = {
  companyId: string
  documentId: string
  context: string
  companyName: string
  documentTitle: string
  reason: string
}

function normalizeText(value: string): string {
  return value
    .replace(/[ÆÄ]/g, 'A')
    .replace(/[æä]/g, 'a')
    .replace(/[ØÖ]/g, 'O')
    .replace(/[øö]/g, 'o')
    .replace(/[Å]/g, 'A')
    .replace(/[å]/g, 'a')
    .replace(/[Ü]/g, 'U')
    .replace(/[ü]/g, 'u')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
}

function normalizeSearch(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLegalSuffix(value: string): string {
  let s = value.trim()
  for (let i = 0; i < 3; i++) {
    const next = s.replace(COMPANY_SUFFIX_RE, '').trim()
    if (next === s) break
    s = next
  }
  return s
}

function regexForNormalizedPattern(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, String.raw`\s+`)
  return new RegExp(String.raw`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'g')
}

function countMatches(haystack: string, pattern: string): number {
  return [...haystack.matchAll(regexForNormalizedPattern(pattern))].length
}

function isSpecificPattern(pattern: string): boolean {
  const words = pattern.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return pattern.length >= 6
  if (pattern.length >= 5) return true
  return ['tine', 'bama', 'mowi', 'yara', 'hoff', 'oda'].includes(pattern)
}

function buildPatterns(company: TrackedCompany): string[] {
  const raw = [
    company.name,
    stripLegalSuffix(company.name),
    ...(ALIASES[company.name] ?? []),
    company.orgNr,
  ]

  return [...new Set(raw.map(normalizeSearch).filter(Boolean))]
    .filter((pattern) => /^\d+$/.test(pattern) || isSpecificPattern(pattern))
}

function categorizeContext(documentType: string | null): string {
  switch (documentType) {
    case 'annual-report':
      return 'arsrapport'
    case 'regulatory':
      return 'tilsynssak'
    case 'academic':
    case 'thesis':
      return 'forskning'
    case 'policy':
      return 'politikk'
    case 'consulting-report':
    case 'report':
    case 'industry':
      return 'rapport'
    default:
      return 'omtale'
  }
}

async function getTrackedCompanies(): Promise<TrackedCompany[]> {
  return prisma.$queryRaw<TrackedCompany[]>`
    select c.id, c.name, c."orgNr"
    from "Company" c
    where exists (select 1 from "CompanyFinancial" f where f."companyId" = c.id)
       or exists (select 1 from "BoardMember" b where b."companyId" = c.id)
       or exists (select 1 from "Shareholder" s where s."companyId" = c.id)
       or exists (select 1 from "CompanyDocumentRef" d where d."companyId" = c.id)
       or exists (select 1 from "CompanyProperty" p where p."companyId" = c.id or p."tenantCompanyId" = c.id)
       or exists (select 1 from "BusinessRelationship" r where r."fromCompanyId" = c.id or r."toCompanyId" = c.id)
       or exists (select 1 from "CompanyOwnership" o where o."parentCompanyId" = c.id or o."childCompanyId" = c.id)
       or exists (select 1 from "AquacultureSite" a where a."companyId" = c.id)
       or exists (select 1 from "Actor" ac where ac."companyId" = c.id)
    order by c.name asc
  `
}

function evaluateMatch(company: TrackedCompany, doc: PreparedDocument): { reason: string; strength: number } | null {
  const patterns = buildPatterns(company)

  for (const pattern of patterns) {
    if (/^\d+$/.test(pattern) && pattern.length >= 8) {
      if (doc.titleSearch.includes(pattern) || doc.bodySearch.includes(pattern)) return { reason: `orgnr:${pattern}`, strength: 3 }
      continue
    }

    if (countMatches(doc.titleSearch, pattern) > 0) return { reason: `title:${pattern}`, strength: 3 }
  }

  let bestContentPattern = ''
  let bestOccurrences = 0
  for (const pattern of patterns.filter((p) => !/^\d+$/.test(p))) {
    const occurrences = countMatches(doc.bodySearch, pattern)
    if (occurrences > bestOccurrences) {
      bestOccurrences = occurrences
      bestContentPattern = pattern
    }
  }

  const isSingleWord = bestContentPattern.split(/\s+/).filter(Boolean).length === 1
  const requiredOccurrences = isSingleWord ? 3 : 2
  if (bestOccurrences >= requiredOccurrences) return { reason: `content:${bestContentPattern}:${bestOccurrences}`, strength: 2 }

  return null
}

async function main() {
  console.log(
    `Linking tracked companies to documents${DRY_RUN ? ' (dry run)' : ''}` +
      `${DETERMINISTIC_ONLY ? ' (deterministic only)' : ''}...\n`,
  )

  const [companies, documentRows] = await Promise.all([
    getTrackedCompanies().then((rows) => rows.filter((company) => !DEPRECATED_ORGNRS.has(company.orgNr))),
    prisma.document.findMany({
      select: { id: true, title: true, content: true, documentType: true, filePath: true },
    }) as Promise<DocumentRow[]>,
  ])

  const documents: PreparedDocument[] = documentRows.map((doc) => ({
    ...doc,
    titleSearch: normalizeSearch(`${doc.title} ${doc.filePath ?? ''}`),
    bodySearch: normalizeSearch(doc.content),
  })).filter(isCompanyDocumentEvidenceCandidate)

  const existing = await prisma.companyDocumentRef.findMany({
    select: { companyId: true, documentId: true },
  })
  const existingKeys = new Set(existing.map((ref) => `${ref.companyId}:${ref.documentId}`))

  const candidates: RefCandidate[] = []
  const perCompany = new Map<string, { name: string; candidates: number }>()

  for (const company of companies) {
    let companyCandidateCount = 0
    for (const doc of documents) {
      const key = `${company.id}:${doc.id}`
      if (existingKeys.has(key)) continue

      const match = evaluateMatch(company, doc)
      if (!match) continue
      if (DETERMINISTIC_ONLY && match.strength < 3) continue

      candidates.push({
        companyId: company.id,
        documentId: doc.id,
        context: `audit:${categorizeContext(doc.documentType)}`,
        companyName: company.name,
        documentTitle: doc.title,
        reason: match.reason,
      })
      companyCandidateCount++
    }

    perCompany.set(company.id, { name: company.name, candidates: companyCandidateCount })
  }

  const deduped = new Map<string, RefCandidate>()
  for (const candidate of candidates) {
    const key = `${candidate.companyId}:${candidate.documentId}`
    if (!deduped.has(key)) deduped.set(key, candidate)
  }
  const refsToCreate = [...deduped.values()]

  if (!DRY_RUN && refsToCreate.length > 0) {
    await prisma.companyDocumentRef.createMany({
      data: refsToCreate.map((ref) => ({
        companyId: ref.companyId,
        documentId: ref.documentId,
        context: ref.context,
      })),
      skipDuplicates: true,
    })
  }

  console.log(`Tracked companies: ${companies.length}`)
  console.log(`Documents scanned: ${documents.length}`)
  console.log(`Existing CompanyDocumentRef rows: ${existing.length}`)
  console.log(`${DRY_RUN ? 'Would create' : 'Created'} ${refsToCreate.length} new refs\n`)

  console.log('Top companies by new refs:')
  for (const row of [...perCompany.values()]
    .filter((row) => row.candidates > 0)
    .sort((a, b) => b.candidates - a.candidates || a.name.localeCompare(b.name, 'nb'))
    .slice(0, 30)) {
    console.log(`  ${row.name.padEnd(38)} ${String(row.candidates).padStart(4)}`)
  }

  console.log('\nSample refs:')
  for (const ref of refsToCreate.slice(0, 20)) {
    console.log(`  ${ref.companyName} -> ${ref.documentTitle.slice(0, 90)} (${ref.reason})`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
