import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CompanySearchProfile = {
  id: string
  name: string
  orgNr: string
  patterns: string[]
}

const NAME_VARIANTS: Record<string, string[]> = {
  'NorgesGruppen ASA': ['NorgesGruppen', 'Norgesgruppen'],
  'Coop Norge SA': ['Coop Norge', 'Coop Extra', 'Coop Prix', 'Coop Obs', 'Coop Mega', 'Samvirkelagene'],
  'Reitan Retail AS': ['Reitan Retail', 'Reitan', 'REMA 1000', 'Rema1000', 'Rema 1000'],
  'Orkla ASA': ['Orkla'],
  'Nortura SA': ['Nortura', 'Gilde', 'Prior'],
  'TINE SA': ['TINE', 'Tine SA'],
  'Felleskjøpet Agri SA': ['Felleskjøpet', 'Felleskjopet'],
  'BAMA Gruppen AS': ['BAMA', 'Bama Gruppen'],
  'Mowi ASA': ['Mowi', 'Marine Harvest'],
  'SalMar ASA': ['SalMar', 'Salmar'],
  'Lerøy Seafood Group ASA': ['Lerøy', 'Leroy', 'Lerøy Seafood', 'Leroy Seafood'],
  'Yara International ASA': ['Yara', 'Yara International'],
  'Skretting Norge AS': ['Skretting'],
  'ASKO Norge AS': ['ASKO', 'Asko Norge'],
}

function buildSearchProfiles(
  companies: { id: string; name: string; orgNr: string }[]
): CompanySearchProfile[] {
  return companies.map((c) => {
    const variants = NAME_VARIANTS[c.name] ?? [c.name.replace(/\s+(ASA|AS|SA)$/, '')]
    const patterns = [...new Set([c.name, ...variants])]
    return { id: c.id, name: c.name, orgNr: c.orgNr, patterns }
  })
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

function buildPatternRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (pattern.length <= 5) {
    return new RegExp(`\\b${escaped}\\b`, 'gi')
  }
  return new RegExp(escaped, 'gi')
}

function countOccurrences(text: string, pattern: string): number {
  const regex = buildPatternRegex(pattern)
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

function patternMatchesTitle(title: string, pattern: string): boolean {
  const regex = buildPatternRegex(pattern)
  return regex.test(title)
}

type RefCandidate = {
  companyId: string
  documentId: string
  context: string
}

async function main() {
  console.log('Linking companies to documents...\n')

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, orgNr: true },
  })
  console.log(`Loaded ${companies.length} companies`)

  const documents = await prisma.document.findMany({
    select: { id: true, title: true, content: true, documentType: true, tags: true },
  })
  console.log(`Loaded ${documents.length} documents\n`)

  const profiles = buildSearchProfiles(companies)
  const refs: RefCandidate[] = []
  const perCompany: Record<string, { name: string; titleMatches: number; contentMatches: number }> = {}

  for (const profile of profiles) {
    const seen = new Set<string>()
    let titleMatches = 0
    let contentMatches = 0

    for (const doc of documents) {
      if (seen.has(doc.id)) continue

      const context = categorizeContext(doc.documentType)

      const titleMatch = profile.patterns.some(
        (p) => patternMatchesTitle(doc.title, p)
      ) || doc.title.includes(profile.orgNr)

      if (titleMatch) {
        seen.add(doc.id)
        refs.push({ companyId: profile.id, documentId: doc.id, context })
        titleMatches++
        continue
      }

      let totalOccurrences = 0
      for (const pattern of profile.patterns) {
        totalOccurrences += countOccurrences(doc.content, pattern)
        if (totalOccurrences >= 2) break
      }

      if (totalOccurrences < 2) {
        totalOccurrences += countOccurrences(doc.content, profile.orgNr)
      }

      if (totalOccurrences >= 2) {
        seen.add(doc.id)
        refs.push({ companyId: profile.id, documentId: doc.id, context })
        contentMatches++
      }
    }

    perCompany[profile.id] = {
      name: profile.name,
      titleMatches,
      contentMatches,
    }
  }

  const reports = await prisma.report.findMany({
    where: { documentId: { not: null } },
    select: { id: true, documentId: true, keyFindings: true, recommendations: true },
  })

  for (const profile of profiles) {
    for (const report of reports) {
      const docId = report.documentId!
      const key = `${profile.id}:${docId}`
      if (refs.some(r => r.companyId === profile.id && r.documentId === docId)) continue

      const combined = [...report.keyFindings, ...report.recommendations].join(' ')
      let found = false
      for (const pattern of profile.patterns) {
        if (countOccurrences(combined, pattern) > 0) {
          found = true
          break
        }
      }
      if (found) {
        refs.push({ companyId: profile.id, documentId: docId, context: 'rapport' })
        const stats = perCompany[profile.id]
        if (stats) stats.contentMatches++
      }
    }
  }

  const deduped = new Map<string, RefCandidate>()
  for (const ref of refs) {
    const key = `${ref.companyId}:${ref.documentId}`
    if (!deduped.has(key)) {
      deduped.set(key, ref)
    }
  }

  const refsToCreate = [...deduped.values()]

  if (refsToCreate.length === 0) {
    console.log('No company-document links found.')
    return
  }

  const result = await prisma.companyDocumentRef.createMany({
    data: refsToCreate,
    skipDuplicates: true,
  })

  console.log(`Created ${result.count} CompanyDocumentRef records (${refsToCreate.length} candidates, duplicates skipped)\n`)

  console.log('Breakdown per company:')
  console.log('─'.repeat(70))
  for (const profile of profiles) {
    const stats = perCompany[profile.id]
    const total = stats.titleMatches + stats.contentMatches
    if (total > 0) {
      console.log(
        `  ${stats.name.padEnd(30)} ${String(total).padStart(3)} refs  (title: ${stats.titleMatches}, content: ${stats.contentMatches})`
      )
    } else {
      console.log(`  ${stats.name.padEnd(30)}   0 refs`)
    }
  }

  console.log('─'.repeat(70))
  console.log(`Total: ${companies.length} companies, ${result.count} refs created`)
}

main()
  .catch((e) => {
    console.error('Link failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
