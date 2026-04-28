import 'dotenv/config'
import { promises as fs } from 'fs'
import path from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ROOT = process.cwd()
const OUT_MD = path.join(ROOT, 'research', 'COMPANY-EXTRACTION-AUDIT.md')
const OUT_JSON = path.join(ROOT, 'research', 'company-extraction-audit.json')
const OUT_CSV = path.join(ROOT, 'research', 'company-extraction-candidates.csv')
const GENERATED_OUTPUTS = new Set([
  OUT_MD,
  OUT_JSON,
  OUT_CSV,
  path.join(ROOT, 'docs', 'project', 'mandates', 'personer-underlagskontroll-food-tg-2026-04-28.md'),
  path.join(ROOT, 'docs', 'project', 'mandates', 'personer-rakorpus-pass-food-tg-2026-04-28.md'),
  path.join(ROOT, 'docs', 'project', 'mandates', 'personer-high-priority-review-2026-04-28.md'),
  path.join(ROOT, 'docs', 'project', 'mandates', 'personer-high-priority-decision-preflight-2026-04-28.md'),
].map((file) => path.resolve(file)))

const SOURCE_DIRS = ['docs', 'research', 'src/lib/data']
const SOURCE_EXTENSIONS = new Set(['.md', '.txt', '.csv', '.json', '.ts'])
const MAX_TEXT_FILE_BYTES = 3_000_000

const COMPANY_SUFFIX_PATTERN =
  String.raw`(?:AS|ASA|SA|BA|ANS|DA|NUF|AB|KB|HB|A\/S|ApS|Oyj|Oy|Ky|hf|ehf|Ltd|Limited|Inc|Corp|Corporation|GmbH|AG|plc|PLC|LLC|BV|NV)`

const COMPANY_NAME_RE = new RegExp(
  String.raw`\b(?:[A-ZÆØÅÄÖÜÉ][\p{L}\p{M}0-9&'.:-]*(?:\s+|$)){1,9}${COMPANY_SUFFIX_PATTERN}\b\.?`,
  'gu',
)

const NOISE_PREFIX_RE =
  /^(?:og|eller|fra|til|for|med|uten|av|i|pa|paa|the|a|an|case|source|kilde|rapport|annual report|arsrapport|pdf|markdown)\s+/i

const LEGAL_SUFFIX_RE =
  /\b(?:as|asa|sa|ba|ans|da|nuf|ab|kb|hb|a\/s|aps|oyj|oy|ky|hf|ehf|ltd|limited|inc|corp|corporation|gmbh|ag|plc|llc|bv|nv)\.?$/i

const KNOWN_ALIASES: Record<string, string[]> = {
  'NorgesGruppen ASA': ['NorgesGruppen', 'Norgesgruppen'],
  'Coop Norge SA': ['Coop Norge', 'Coop Extra', 'Coop Prix', 'Coop Obs', 'Coop Mega'],
  'Reitan Retail AS': ['Reitan Retail', 'Reitan', 'Rema 1000', 'REMA 1000', 'Rema1000'],
  'Nortura SA': ['Nortura', 'Gilde', 'Prior'],
  'TINE SA': ['TINE', 'Tine SA'],
  'Felleskjopet Agri SA': ['Felleskjopet', 'Felleskjopet Agri'],
  'Felleskjøpet Agri SA': ['Felleskjøpet', 'Felleskjøpet Agri'],
  'BAMA Gruppen AS': ['BAMA', 'Bama Gruppen'],
  'Mowi ASA': ['Mowi', 'Marine Harvest'],
  'SalMar ASA': ['SalMar', 'Salmar'],
  'Leroy Seafood Group ASA': ['Leroy', 'Leroy Seafood'],
  'Lerøy Seafood Group ASA': ['Lerøy', 'Lerøy Seafood'],
  'Yara International ASA': ['Yara', 'Yara International'],
  'Skretting AS': ['Skretting'],
  'ASKO Norge AS': ['ASKO', 'Asko Norge'],
  'I K Lykke AS': ['I.K. Lykke', 'I K Lykke', 'Bunnpris', 'Bunnpris AS'],
  'Too Good To Go Norge AS': ['Too Good To Go', 'TGTG'],
}

type DbCompany = {
  id: string
  name: string
  orgNr: string
  legalForm: string | null
  naceDescription: string | null
  country: string
  hqCity: string | null
  ownershipType: string | null
  valueChainStage: string | null
  _count: {
    financials: number
    shareholders: number
    boardMembers: number
    subsidies: number
    documentRefs: number
    parentOf: number
    childOf: number
    ownedProperties: number
    tenantProperties: number
    relationshipsFrom: number
    relationshipsTo: number
    aquacultureSites: number
    aquacultureApps: number
    deliveriesFrom: number
    deliveriesTo: number
  }
}

type SourceHit = {
  sourceId: string
  title: string
  kind: string
}

type Candidate = {
  key: string
  displayName: string
  mentions: number
  sourceHits: Map<string, SourceHit>
  matchedCompanyId: string | null
  matchedCompanyName: string | null
  matchedOrgNr: string | null
  status: 'tracked' | 'in_company_untracked' | 'missing_company_record'
}

type DetailGap = {
  companyId: string
  name: string
  orgNr: string
  missing: string[]
  documentRefs: number
  relationScore: number
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

function stripLegalSuffix(value: string): string {
  let s = value.trim()
  for (let i = 0; i < 3; i++) {
    const next = s.replace(LEGAL_SUFFIX_RE, '').trim()
    if (next === s) break
    s = next
  }
  return s
}

function normalizeCompanyName(value: string): string {
  let s = normalizeText(value)
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'([{]+|[\s"')\]}.,;:]+$/g, '')
    .trim()

  s = s.replace(NOISE_PREFIX_RE, '')
  s = stripLegalSuffix(s)
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanCandidateName(value: string): string | null {
  const cleaned = value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'([{]+|[\s"')\]}.,;:]+$/g, '')
    .replace(NOISE_PREFIX_RE, '')
    .trim()

  if (cleaned.length < 4 || cleaned.length > 120) return null
  if (!LEGAL_SUFFIX_RE.test(cleaned)) return null
  if (/^(?:AS|ASA|SA|AB|A\/S|ApS|Oy|Oyj|hf|ehf)$/i.test(cleaned)) return null
  if (/^[0-9\s.-]+$/.test(cleaned)) return null

  return cleaned
}

function csvEscape(value: unknown): string {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function addCandidate(
  candidates: Map<string, Candidate>,
  displayName: string,
  sourceHit: SourceHit,
  count = 1,
) {
  const key = normalizeCompanyName(displayName)
  if (!key) return

  const existing = candidates.get(key)
  if (existing) {
    existing.mentions += count
    existing.sourceHits.set(sourceHit.sourceId, sourceHit)
    if (displayName.length > existing.displayName.length) existing.displayName = displayName
    return
  }

  candidates.set(key, {
    key,
    displayName,
    mentions: count,
    sourceHits: new Map([[sourceHit.sourceId, sourceHit]]),
    matchedCompanyId: null,
    matchedCompanyName: null,
    matchedOrgNr: null,
    status: 'missing_company_record',
  })
}

function extractFromText(text: string, sourceHit: SourceHit, candidates: Map<string, Candidate>) {
  const names = text.match(COMPANY_NAME_RE) ?? []
  for (const rawName of names) {
    const cleaned = cleanCandidateName(rawName)
    if (cleaned) addCandidate(candidates, cleaned, sourceHit)
  }
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if ([
        'node_modules',
        '.next',
        'tmp',
        '_status',
        '_plans',
        'data',
        '__pycache__',
        'pdf-downloads-20-04-26',
      ].includes(entry.name)) continue
      files.push(...await walkFiles(full))
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      if (!GENERATED_OUTPUTS.has(path.resolve(full))) files.push(full)
    }
  }

  return files
}

async function readLocalCorpus(candidates: Map<string, Candidate>) {
  let scanned = 0
  let skippedLarge = 0

  for (const dir of SOURCE_DIRS.map((d) => path.join(ROOT, d))) {
    const files = await walkFiles(dir)
    for (const file of files) {
      const stat = await fs.stat(file)
      if (stat.size > MAX_TEXT_FILE_BYTES) {
        skippedLarge++
        continue
      }

      const rel = path.relative(ROOT, file)
      const text = await fs.readFile(file, 'utf8').catch(() => '')
      if (!text.trim()) continue
      extractFromText(text, { sourceId: `file:${rel}`, title: rel, kind: 'file' }, candidates)
      scanned++
    }
  }

  return { scanned, skippedLarge }
}

async function readDocumentCorpus(candidates: Map<string, Candidate>) {
  const docs = await prisma.document.findMany({
    select: { id: true, title: true, filePath: true, content: true, documentType: true },
  })

  for (const doc of docs) {
    const sourceId = `document:${doc.id}`
    const title = doc.filePath ? `${doc.title} (${doc.filePath})` : doc.title
    extractFromText(`${doc.title}\n${doc.content}`, {
      sourceId,
      title,
      kind: doc.documentType ?? 'document',
    }, candidates)
  }

  return { scanned: docs.length }
}

async function readPdfCatalog(candidates: Map<string, Candidate>) {
  const catalogPath = path.join(ROOT, 'research', 'pdf-katalog.json')
  const raw = await fs.readFile(catalogPath, 'utf8').catch(() => '')
  if (!raw) return { scanned: 0 }

  const rows = JSON.parse(raw) as Array<{
    rel?: string
    title?: string
    author?: string
    textHead?: string
  }>

  for (const row of rows) {
    const rel = row.rel ?? 'unknown-pdf'
    const title = row.title || rel
    const text = [row.rel, row.title, row.author, row.textHead].filter(Boolean).join('\n')
    extractFromText(text, { sourceId: `pdf:${rel}`, title, kind: 'pdf-catalog' }, candidates)
  }

  return { scanned: rows.length }
}

function buildCompanyIndexes(companies: Array<{ id: string; name: string; orgNr: string }>) {
  const byName = new Map<string, { id: string; name: string; orgNr: string }>()

  for (const company of companies) {
    byName.set(normalizeCompanyName(company.name), company)

    const aliases = KNOWN_ALIASES[company.name] ?? []
    for (const alias of aliases) byName.set(normalizeCompanyName(alias), company)
  }

  return { byName }
}

async function getTrackedIds(): Promise<Set<string>> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    select c.id
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
  `
  return new Set(rows.map((row) => row.id))
}

function relationScore(company: DbCompany): number {
  const c = company._count
  return (
    c.financials +
    c.shareholders +
    c.boardMembers +
    c.documentRefs +
    c.parentOf +
    c.childOf +
    c.ownedProperties +
    c.tenantProperties +
    c.relationshipsFrom +
    c.relationshipsTo +
    c.aquacultureSites +
    c.aquacultureApps +
    c.deliveriesFrom +
    c.deliveriesTo
  )
}

function detailGaps(company: DbCompany): string[] {
  const gaps: string[] = []
  if (!company.legalForm) gaps.push('legalForm')
  if (!company.naceDescription) gaps.push('naceDescription')
  if (!company.hqCity) gaps.push('hqCity')
  if (!company.ownershipType) gaps.push('ownershipType')
  if (!company.valueChainStage) gaps.push('valueChainStage')
  if (company._count.financials === 0) gaps.push('financials')
  if (company._count.shareholders === 0) gaps.push('shareholders')
  if (company._count.boardMembers === 0) gaps.push('boardMembers')
  if (company._count.documentRefs === 0) gaps.push('documentRefs')
  return gaps
}

function sourcePreview(candidate: Candidate): string {
  return [...candidate.sourceHits.values()]
    .slice(0, 4)
    .map((source) => source.title.replace(/\|/g, '/').slice(0, 90))
    .join('; ')
}

function priority(candidate: Candidate): 'HIGH' | 'MEDIUM' | 'LOW' {
  const sources = [...candidate.sourceHits.values()]
  const sourceCount = sources.length
  const inKeySource = sources.some((source) =>
    /arsrapport|annual|selskaps|company|actor|aktorkart|evidence-pack\/arsrapporter|06_Company_And_Annual_Reports/i.test(source.title),
  )

  if (candidate.status === 'missing_company_record' && (sourceCount >= 3 || inKeySource)) return 'HIGH'
  if (candidate.status === 'in_company_untracked' && (sourceCount >= 3 || inKeySource)) return 'HIGH'
  if (sourceCount >= 2 || candidate.mentions >= 3) return 'MEDIUM'
  return 'LOW'
}

function priorityRank(candidate: Candidate): number {
  const value = priority(candidate)
  if (value === 'HIGH') return 0
  if (value === 'MEDIUM') return 1
  return 2
}

function topCandidates(candidates: Candidate[], status: Candidate['status'], limit: number) {
  return candidates
    .filter((candidate) => candidate.status === status)
    .sort((a, b) =>
      priorityRank(a) - priorityRank(b) ||
      b.sourceHits.size - a.sourceHits.size ||
      b.mentions - a.mentions ||
      a.displayName.localeCompare(b.displayName, 'nb'),
    )
    .slice(0, limit)
}

async function main() {
  const startedAt = new Date()
  const candidates = new Map<string, Candidate>()

  const [documentCorpus, localCorpus, pdfCorpus] = await Promise.all([
    readDocumentCorpus(candidates),
    readLocalCorpus(candidates),
    readPdfCatalog(candidates),
  ])

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, orgNr: true },
  })
  const trackedIds = await getTrackedIds()
  const { byName } = buildCompanyIndexes(companies)

  for (const candidate of candidates.values()) {
    const match = byName.get(candidate.key) ?? null

    if (match) {
      candidate.matchedCompanyId = match.id
      candidate.matchedCompanyName = match.name
      candidate.matchedOrgNr = match.orgNr
      candidate.status = trackedIds.has(match.id) ? 'tracked' : 'in_company_untracked'
    }
  }

  const trackedCompanies = await prisma.company.findMany({
    where: { id: { in: [...trackedIds] } },
    select: {
      id: true,
      name: true,
      orgNr: true,
      legalForm: true,
      naceDescription: true,
      country: true,
      hqCity: true,
      ownershipType: true,
      valueChainStage: true,
      _count: {
        select: {
          financials: true,
          shareholders: true,
          boardMembers: true,
          subsidies: true,
          documentRefs: true,
          parentOf: true,
          childOf: true,
          ownedProperties: true,
          tenantProperties: true,
          relationshipsFrom: true,
          relationshipsTo: true,
          aquacultureSites: true,
          aquacultureApps: true,
          deliveriesFrom: true,
          deliveriesTo: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  }) as DbCompany[]

  const detailGapRows: DetailGap[] = trackedCompanies
    .map((company) => ({
      companyId: company.id,
      name: company.name,
      orgNr: company.orgNr,
      missing: detailGaps(company),
      documentRefs: company._count.documentRefs,
      relationScore: relationScore(company),
    }))
    .filter((row) => row.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length || a.name.localeCompare(b.name, 'nb'))

  const allCandidates = [...candidates.values()]
  const statusCounts = allCandidates.reduce<Record<Candidate['status'], number>>((acc, candidate) => {
    acc[candidate.status]++
    return acc
  }, { tracked: 0, in_company_untracked: 0, missing_company_record: 0 })

  const lines: string[] = []
  lines.push('# Company extraction audit')
  lines.push('')
  lines.push('> Auto-generated by `scripts/audit-company-extraction.ts`. Re-run after imports or source updates.')
  lines.push(`> Generated: ${startedAt.toISOString()}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total Company rows in DB: ${companies.length.toLocaleString('en-US')}`)
  lines.push(`- Tracked companies using /selskap logic: ${trackedIds.size.toLocaleString('en-US')}`)
  lines.push(`- Candidate company names found in source corpus: ${allCandidates.length.toLocaleString('en-US')}`)
  lines.push(`- Candidates already tracked: ${statusCounts.tracked.toLocaleString('en-US')}`)
  lines.push(`- Candidates present in Company table but not tracked: ${statusCounts.in_company_untracked.toLocaleString('en-US')}`)
  lines.push(`- Candidates not matched to Company table: ${statusCounts.missing_company_record.toLocaleString('en-US')}`)
  lines.push(`- Tracked companies with one or more detail gaps: ${detailGapRows.length.toLocaleString('en-US')}`)
  lines.push('')
  lines.push('## Corpus scanned')
  lines.push('')
  lines.push('| Corpus | Count |')
  lines.push('|---|---:|')
  lines.push(`| DB Document rows | ${documentCorpus.scanned} |`)
  lines.push(`| Local text/source files | ${localCorpus.scanned} |`)
  lines.push(`| Local files skipped over ${MAX_TEXT_FILE_BYTES} bytes | ${localCorpus.skippedLarge} |`)
  lines.push(`| PDF catalog rows | ${pdfCorpus.scanned} |`)
  lines.push('')
  lines.push(`## Detail coverage for ${trackedIds.size.toLocaleString('en-US')} tracked companies`)
  lines.push('')
  lines.push('| Gap | Count |')
  lines.push('|---|---:|')

  const gapCounts = new Map<string, number>()
  for (const row of detailGapRows) {
    for (const gap of row.missing) gapCounts.set(gap, (gapCounts.get(gap) ?? 0) + 1)
  }
  for (const [gap, count] of [...gapCounts.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${gap} | ${count} |`)
  }
  lines.push('')
  lines.push('## Highest-priority unmatched candidates')
  lines.push('')
  lines.push('| Priority | Candidate | Mentions | Sources | Example sources |')
  lines.push('|---|---|---:|---:|---|')
  for (const candidate of topCandidates(allCandidates, 'missing_company_record', 40)) {
    lines.push(`| ${priority(candidate)} | ${candidate.displayName.replace(/\|/g, '/')} | ${candidate.mentions} | ${candidate.sourceHits.size} | ${sourcePreview(candidate)} |`)
  }
  lines.push('')
  lines.push('## Highest-priority candidates present in Company but not tracked')
  lines.push('')
  lines.push('| Priority | Candidate | Matched Company | OrgNr | Mentions | Sources | Example sources |')
  lines.push('|---|---|---|---|---:|---:|---|')
  for (const candidate of topCandidates(allCandidates, 'in_company_untracked', 40)) {
    lines.push(`| ${priority(candidate)} | ${candidate.displayName.replace(/\|/g, '/')} | ${candidate.matchedCompanyName ?? ''} | ${candidate.matchedOrgNr ?? ''} | ${candidate.mentions} | ${candidate.sourceHits.size} | ${sourcePreview(candidate)} |`)
  }
  lines.push('')
  lines.push('## Tracked companies with most detail gaps')
  lines.push('')
  lines.push('| Company | OrgNr | Missing fields/relations | Document refs | Relation score |')
  lines.push('|---|---|---|---:|---:|')
  for (const row of detailGapRows.slice(0, 80)) {
    lines.push(`| ${row.name.replace(/\|/g, '/')} | ${row.orgNr} | ${row.missing.join(', ')} | ${row.documentRefs} | ${row.relationScore} |`)
  }
  lines.push('')
  lines.push('## Workflow recommendation')
  lines.push('')
  lines.push('Treat this as a durable, idempotent workflow:')
  lines.push('')
  lines.push('1. Extract company candidates from DB documents, local text files and PDF catalog.')
  lines.push('2. Resolve candidates to Company rows by normalized name, aliases and org number.')
  lines.push('3. Promote missing or untracked candidates only after source review.')
  lines.push('4. Enrich promoted companies with registry fields, ownership, board, financials and source document links.')
  lines.push('5. Re-run this audit and `npx tsx scripts/verify-data-integrity.ts` until gaps are either filled or explicitly waived.')
  lines.push('')
  lines.push('Acceptance criteria for the 231 tracked set:')
  lines.push('')
  lines.push('- Every tracked company has at least one explicit source link in `CompanyDocumentRef`, unless it is registry-only and marked as such in metadata.')
  lines.push('- Every tracked company has value-chain stage, ownership type, NACE/category, HQ/country and at least one provenance-bearing detail relation.')
  lines.push('- Every high-priority unmatched candidate is either imported, linked to an existing Company row, or waived with reason.')

  const json = {
    generatedAt: startedAt.toISOString(),
    counts: {
      companies: companies.length,
      trackedCompanies: trackedIds.size,
      candidates: allCandidates.length,
      ...statusCounts,
      trackedWithDetailGaps: detailGapRows.length,
    },
    corpus: {
      documentRows: documentCorpus.scanned,
      localFiles: localCorpus.scanned,
      localFilesSkippedLarge: localCorpus.skippedLarge,
      pdfCatalogRows: pdfCorpus.scanned,
    },
    detailGaps: detailGapRows,
    candidates: allCandidates
      .sort((a, b) => b.sourceHits.size - a.sourceHits.size || b.mentions - a.mentions)
      .map((candidate) => ({
        key: candidate.key,
        displayName: candidate.displayName,
        mentions: candidate.mentions,
        sourceCount: candidate.sourceHits.size,
        status: candidate.status,
        priority: priority(candidate),
        matchedCompanyId: candidate.matchedCompanyId,
        matchedCompanyName: candidate.matchedCompanyName,
        matchedOrgNr: candidate.matchedOrgNr,
        sources: [...candidate.sourceHits.values()],
      })),
  }

  const csvLines = [
    ['priority', 'status', 'candidate', 'matchedCompanyName', 'matchedOrgNr', 'mentions', 'sourceCount', 'exampleSources'].join(','),
    ...json.candidates.map((candidate) => [
      candidate.priority,
      candidate.status,
      csvEscape(candidate.displayName),
      csvEscape(candidate.matchedCompanyName ?? ''),
      csvEscape(candidate.matchedOrgNr ?? ''),
      candidate.mentions,
      candidate.sourceCount,
      csvEscape(candidate.sources.slice(0, 5).map((source) => source.title).join('; ')),
    ].join(',')),
  ]

  await fs.writeFile(OUT_MD, `${lines.join('\n')}\n`, 'utf8')
  await fs.writeFile(OUT_JSON, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
  await fs.writeFile(OUT_CSV, `${csvLines.join('\n')}\n`, 'utf8')

  console.log(`[company-audit] wrote ${path.relative(ROOT, OUT_MD)}`)
  console.log(`[company-audit] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[company-audit] wrote ${path.relative(ROOT, OUT_CSV)}`)
  console.log(`[company-audit] ${trackedIds.size} tracked companies, ${allCandidates.length} candidates`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
