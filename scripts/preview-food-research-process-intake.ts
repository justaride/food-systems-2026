import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'research/arkiv-sortert')
const OUTPUT_DIR = path.join(ROOT, 'research/intake/food-research-process-2026-04-20')
const REVIEW_CSV = path.join(OUTPUT_DIR, 'review.csv')
const MANIFEST_JSON = path.join(OUTPUT_DIR, 'manifest.json')
const SUMMARY_MD = path.join(OUTPUT_DIR, 'SUMMARY.md')

type ManualFields = {
  review_status: string
  action: string
  final_title: string
  final_year: string
  final_country: string
  final_theme: string
  final_doc_type: string
  final_url: string
  notes: string
}

type ReviewRow = ManualFields & {
  source_path: string
  source_top_folder: string
  filename: string
  ext: string
  size_bytes: string
  modified_at: string
  sha256: string
  priority: string
  project_fit: string
  candidate_model: string
  typed_layer_candidate: string
  import_file_path: string
  proposed_title: string
  proposed_year: string
  proposed_country: string
  proposed_theme: string
  proposed_doc_type: string
}

type CategoryConfig = {
  priority: 'P1' | 'P2' | 'P3'
  projectFit: 'yes' | 'maybe' | 'no'
  candidateModel: string
  typedLayerCandidate: string
  proposedTheme: string
  defaultAction: 'review' | 'hold' | 'drop'
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  '00_Working_Files': {
    priority: 'P3',
    projectFit: 'maybe',
    candidateModel: 'working-file',
    typedLayerCandidate: 'none',
    proposedTheme: 'working-files',
    defaultAction: 'hold',
  },
  '01_Data_And_Archives': {
    priority: 'P3',
    projectFit: 'maybe',
    candidateModel: 'data-archive',
    typedLayerCandidate: 'none',
    proposedTheme: 'data-archives',
    defaultAction: 'hold',
  },
  '03_Policy_Governance_And_Market': {
    priority: 'P1',
    projectFit: 'yes',
    candidateModel: 'report-candidate',
    typedLayerCandidate: 'report-or-source',
    proposedTheme: 'policy-governance-market',
    defaultAction: 'review',
  },
  '04_Food_Waste_And_Circularity': {
    priority: 'P2',
    projectFit: 'yes',
    candidateModel: 'report-candidate',
    typedLayerCandidate: 'report-or-source',
    proposedTheme: 'food-waste-circularity',
    defaultAction: 'review',
  },
  '05_Foodtech_Alt_Protein_And_Innovation': {
    priority: 'P2',
    projectFit: 'yes',
    candidateModel: 'report-candidate',
    typedLayerCandidate: 'report-or-source',
    proposedTheme: 'foodtech-alt-protein',
    defaultAction: 'review',
  },
  '06_Company_And_Annual_Reports': {
    priority: 'P1',
    projectFit: 'yes',
    candidateModel: 'report-candidate',
    typedLayerCandidate: 'report',
    proposedTheme: 'company-and-annual-reports',
    defaultAction: 'review',
  },
  '07_Academic_Research_And_Theses': {
    priority: 'P2',
    projectFit: 'yes',
    candidateModel: 'academic-candidate',
    typedLayerCandidate: 'thesis-or-report',
    proposedTheme: 'academic-research',
    defaultAction: 'review',
  },
  '08_Food_Security_Agriculture_And_Seafood': {
    priority: 'P1',
    projectFit: 'yes',
    candidateModel: 'report-candidate',
    typedLayerCandidate: 'report-or-source',
    proposedTheme: 'food-security-agriculture-seafood',
    defaultAction: 'review',
  },
}

const MANUAL_KEYS: Array<keyof ManualFields> = [
  'review_status',
  'action',
  'final_title',
  'final_year',
  'final_country',
  'final_theme',
  'final_doc_type',
  'final_url',
  'notes',
]

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((value) => value.length > 0)) rows.push(row)
  }

  return rows
}

function stringifyCsv(rows: string[][]): string {
  return (
    rows
      .map((row) =>
        row
          .map((value) => {
            const field = value ?? ''
            if (/[",\n\r]/.test(field)) return `"${field.replace(/"/g, '""')}"`
            return field
          })
          .join(','),
      )
      .join('\n') + '\n'
  )
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function sha256(filePath: string): Promise<string> {
  const hash = createHash('sha256')
  hash.update(await fs.readFile(filePath))
  return hash.digest('hex')
}

function humanizeFilename(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[._]+/g, ' ')
    .replace(/[-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractYear(value: string): string {
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? match[0] : ''
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function inferCountry(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('nordic') || lower.includes('norden') || lower.includes('nordisk') || lower.includes('scandinavia')) return 'nordic'
  if (lower.includes('norway') || lower.includes('norge') || lower.includes('norwegian')) return 'no'
  if (lower.includes('sweden') || lower.includes('sverige') || lower.includes('swedish')) return 'se'
  if (lower.includes('denmark') || lower.includes('danmark') || lower.includes('danish')) return 'dk'
  if (lower.includes('finland') || lower.includes('finnish')) return 'fi'
  if (lower.includes('iceland') || lower.includes('island')) return 'is'
  if (lower.includes('european commission') || lower.includes('europe')) return 'eu'
  return ''
}

function inferDocType(topFolder: string, filename: string, title: string): string {
  const lower = `${filename} ${title}`.toLowerCase()

  if (topFolder === '06_Company_And_Annual_Reports') return 'annual_report'
  if (topFolder === '03_Policy_Governance_And_Market') {
    if (lower.includes('decision') || lower.includes('vedtak') || lower.includes('opphor')) return 'decision'
    return 'policy_report'
  }
  if (topFolder === '07_Academic_Research_And_Theses') {
    if (
      lower.includes('thesis') ||
      lower.includes('master') ||
      lower.includes('masteroppgave') ||
      lower.includes('doctoral') ||
      lower.includes('phd') ||
      lower.includes('dissertation')
    ) return 'thesis'
    return 'report'
  }
  if (topFolder === '00_Working_Files') return 'report'
  if (topFolder === '01_Data_And_Archives') return ''
  return 'report'
}

function importPathFor(relPath: string, hash: string): string {
  const topFolder = relPath.split(path.sep)[1] ?? 'misc'
  const ext = path.extname(relPath).toLowerCase()
  const shortHash = hash.slice(0, 10)
  const base = slugify(path.basename(relPath, ext)) || 'file'
  return `incoming/food-research-process-2026-04-20/${slugify(topFolder)}/${shortHash}-${base}${ext}`
}

function readPdfTitle(filePath: string): string {
  try {
    const output = execFileSync('pdfinfo', [filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const titleLine = output.split('\n').find((line) => line.toLowerCase().startsWith('title:'))
    if (!titleLine) return ''
    const value = titleLine.split(':').slice(1).join(':').trim()
    if (!value) return ''
    if (/^[A-Z0-9_. -]+$/.test(value) && !/[a-z]/.test(value)) return ''
    return value
  } catch {
    return ''
  }
}

function loadExistingManualRows(content: string): Map<string, ManualFields> {
  const rows = parseCsv(content)
  if (rows.length === 0) return new Map()
  const [header, ...dataRows] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))
  const manual = new Map<string, ManualFields>()

  for (const row of dataRows) {
    const sourcePath = (row[index.source_path] ?? '').trim()
    if (!sourcePath) continue

    const values = {} as ManualFields
    for (const key of MANUAL_KEYS) {
      values[key] = row[index[key]] ?? ''
    }
    manual.set(sourcePath, values)
  }

  return manual
}

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const existingManual = (await fileExists(REVIEW_CSV))
    ? loadExistingManualRows(await fs.readFile(REVIEW_CSV, 'utf8'))
    : new Map<string, ManualFields>()

  const topEntries = await fs.readdir(SOURCE_DIR, { withFileTypes: true })
  const reviewRows: ReviewRow[] = []
  const exactDuplicates: string[] = []

  for (const entry of topEntries) {
    if (!entry.isDirectory()) continue
    if (entry.name === '99_Exact_Duplicates') {
      const dupEntries = await fs.readdir(path.join(SOURCE_DIR, entry.name))
      exactDuplicates.push(...dupEntries.map((name) => path.join('research/arkiv-sortert', entry.name, name)))
      continue
    }

    const config = CATEGORY_CONFIG[entry.name]
    if (!config) continue

    const folderPath = path.join(SOURCE_DIR, entry.name)
    const files = await fs.readdir(folderPath, { withFileTypes: true })

    for (const file of files) {
      if (!file.isFile()) continue
      if (file.name === 'README-ORGANISERING.md') continue

      const fullPath = path.join(folderPath, file.name)
      const stat = await fs.stat(fullPath)
      const relPath = path.relative(ROOT, fullPath)
      const hash = await sha256(fullPath)
      const ext = path.extname(file.name).toLowerCase()
      const pdfTitle = ext === '.pdf' ? readPdfTitle(fullPath) : ''
      const proposedTitle = pdfTitle || humanizeFilename(file.name)
      const proposedYear = extractYear(`${file.name} ${proposedTitle}`)
      const proposedCountry = inferCountry(`${relPath} ${proposedTitle}`)
      const proposedDocType = inferDocType(entry.name, file.name, proposedTitle)
      const importFilePath = importPathFor(relPath, hash)
      const manual = existingManual.get(relPath)

      reviewRows.push({
        source_path: relPath,
        source_top_folder: entry.name,
        filename: file.name,
        ext,
        size_bytes: String(stat.size),
        modified_at: stat.mtime.toISOString(),
        sha256: hash,
        priority: config.priority,
        project_fit: config.projectFit,
        candidate_model: config.candidateModel,
        typed_layer_candidate: config.typedLayerCandidate,
        import_file_path: importFilePath,
        proposed_title: proposedTitle,
        proposed_year: proposedYear,
        proposed_country: proposedCountry,
        proposed_theme: config.proposedTheme,
        proposed_doc_type: proposedDocType,
        review_status: manual?.review_status || 'pending',
        action: manual?.action || config.defaultAction,
        final_title: manual?.final_title || '',
        final_year: manual?.final_year || '',
        final_country: manual?.final_country || '',
        final_theme: manual?.final_theme || '',
        final_doc_type: manual?.final_doc_type || '',
        final_url: manual?.final_url || '',
        notes: manual?.notes || '',
      })
    }
  }

  reviewRows.sort((a, b) => {
    if (a.source_top_folder !== b.source_top_folder) return a.source_top_folder.localeCompare(b.source_top_folder)
    return a.filename.localeCompare(b.filename)
  })

  const header = [
    'source_path',
    'source_top_folder',
    'filename',
    'ext',
    'size_bytes',
    'modified_at',
    'sha256',
    'priority',
    'project_fit',
    'candidate_model',
    'typed_layer_candidate',
    'import_file_path',
    'proposed_title',
    'proposed_year',
    'proposed_country',
    'proposed_theme',
    'proposed_doc_type',
    'review_status',
    'action',
    'final_title',
    'final_year',
    'final_country',
    'final_theme',
    'final_doc_type',
    'final_url',
    'notes',
  ]

  await fs.writeFile(
    REVIEW_CSV,
    stringifyCsv([
      header,
      ...reviewRows.map((row) => header.map((key) => row[key as keyof ReviewRow] ?? '')),
    ]),
    'utf8',
  )

  const countsByFolder = reviewRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.source_top_folder] = (acc[row.source_top_folder] ?? 0) + 1
    return acc
  }, {})
  const countsByAction = reviewRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.action] = (acc[row.action] ?? 0) + 1
    return acc
  }, {})
  const countsByExt = reviewRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.ext] = (acc[row.ext] ?? 0) + 1
    return acc
  }, {})

  await fs.writeFile(
    MANIFEST_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceDir: path.relative(ROOT, SOURCE_DIR),
        reviewCsv: path.relative(ROOT, REVIEW_CSV),
        totalReviewRows: reviewRows.length,
        exactDuplicateCount: exactDuplicates.length,
        countsByFolder,
        countsByAction,
        countsByExt,
        exactDuplicates,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  const summaryLines = [
    '# Food Research Process Intake',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- Source folder: \`${path.relative(ROOT, SOURCE_DIR)}\``,
    `- Review CSV: \`${path.relative(ROOT, REVIEW_CSV)}\``,
    `- Manifest JSON: \`${path.relative(ROOT, MANIFEST_JSON)}\``,
    `- Review rows: ${reviewRows.length}`,
    `- Exact duplicates excluded from review: ${exactDuplicates.length}`,
    '',
    '## Review workflow',
    '',
    '1. Open `review.csv`.',
    '2. Keep `action=review` until the row is assessed.',
    '3. Set `action=import` only for rows that should become staging `Document` records in the database.',
    '4. Optionally fill `final_*` columns to override proposed metadata before import.',
    '5. Run `npm run db:import:food-process-intake` after review.',
    '',
    '## Counts by folder',
    '',
    ...Object.entries(countsByFolder).map(([folder, count]) => `- ${folder}: ${count}`),
    '',
    '## Counts by action',
    '',
    ...Object.entries(countsByAction).map(([action, count]) => `- ${action}: ${count}`),
    '',
  ]

  await fs.writeFile(SUMMARY_MD, summaryLines.join('\n') + '\n', 'utf8')

  console.log(`[food-process-preview] wrote ${path.relative(ROOT, REVIEW_CSV)}`)
  console.log(`[food-process-preview] ${reviewRows.length} rows ready for review (${exactDuplicates.length} exact duplicates excluded)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
