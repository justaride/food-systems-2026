import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const DEFAULT_BACKLOG = path.join(ROOT, 'research/evidence-pack/download-backlog-2026-04-20.csv')

type Options = {
  backlogPath: string
  logPaths: string[]
  targets: string[]
  dryRun: boolean
}

type LogEntry = {
  title: string
  url: string
  target_path: string
  result: string
  local_path: string
  ts: string
}

function parseArgs(): Options {
  const args = process.argv.slice(2)
  let backlogPath = DEFAULT_BACKLOG
  const logPaths: string[] = []
  const targets: string[] = []
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--backlog') backlogPath = resolveInputPath(args[++i] || '')
    else if (arg === '--log') logPaths.push(resolveInputPath(args[++i] || ''))
    else if (arg === '--target') targets.push(resolveInputPath(args[++i] || ''))
    else if (arg === '--dry-run') dryRun = true
  }

  if (logPaths.length === 0) {
    throw new Error('Pass at least one --log <path> argument.')
  }

  return { backlogPath, logPaths, targets, dryRun }
}

function resolveInputPath(input: string): string {
  if (!input) return input
  return path.isAbsolute(input) ? input : path.join(ROOT, input)
}

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
  return rows
    .map((row) =>
      row
        .map((field) => {
          const value = field ?? ''
          if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
          return value
        })
        .join(','),
    )
    .join('\n') + '\n'
}

async function loadLogEntries(logPath: string): Promise<LogEntry[]> {
  const raw = await fs.readFile(logPath, 'utf8')
  return raw
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as LogEntry)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function statusForResult(result: string): { status: string; currentLocalStatus: string } | null {
  if (result === 'downloaded_pdf') return { status: 'downloaded', currentLocalStatus: 'local_pdf_downloaded' }
  if (result === 'saved_snapshot') return { status: 'downloaded', currentLocalStatus: 'local_md_available' }
  return null
}

async function main(): Promise<void> {
  const opts = parseArgs()
  const csvRaw = await fs.readFile(opts.backlogPath, 'utf8')
  const rows = parseCsv(csvRaw)
  const [header, ...dataRows] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  const latestSuccessByTarget = new Map<string, LogEntry>()

  for (const logPath of opts.logPaths) {
    const entries = await loadLogEntries(logPath)
    for (const entry of entries) {
      if (!statusForResult(entry.result)) continue
      if (opts.targets.length > 0 && !opts.targets.includes(resolveInputPath(entry.target_path))) continue
      if (entry.local_path && !(await fileExists(resolveInputPath(entry.local_path)))) continue
      const current = latestSuccessByTarget.get(entry.target_path)
      if (!current || entry.ts > current.ts) {
        latestSuccessByTarget.set(entry.target_path, entry)
      }
    }
  }

  let updated = 0

  for (const row of dataRows) {
    const targetPath = row[index.target_path] ?? ''
    const entry = latestSuccessByTarget.get(targetPath)
    if (!entry) continue

    const status = statusForResult(entry.result)
    if (!status) continue

    row[index.status] = status.status
    row[index.current_local_status] = status.currentLocalStatus
    if (entry.local_path) row[index.target_path] = entry.local_path
    updated++
  }

  if (!opts.dryRun) {
    await fs.writeFile(opts.backlogPath, stringifyCsv([header, ...dataRows]), 'utf8')
  }

  console.log(
    `[sync] backlog=${path.relative(ROOT, opts.backlogPath)} updated=${updated} dryRun=${opts.dryRun} logs=${opts.logPaths
      .map((logPath) => path.relative(ROOT, logPath))
      .join(',')}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
