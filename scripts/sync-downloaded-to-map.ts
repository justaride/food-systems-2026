import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OVERRIDES = path.join(RESEARCH, 'seed-pdf-map.overrides.json')

type LogEntry = {
  id: string
  status: string
  local_path: string
  priority?: string
  source?: string
}

type Overrides = {
  _comment?: string
  theses: Record<string, string>
  reports: Record<string, string>
  sources: Record<string, string>
  exclude_pdfs?: string[]
  _notes?: Record<string, unknown>
}

function parseArgs(): { logFile: string } {
  const args = process.argv.slice(2)
  let logFile = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--log') logFile = args[++i]
  }
  if (!logFile) {
    const today = new Date().toISOString().slice(0, 10)
    logFile = path.join(RESEARCH, `download-log-${today}.jsonl`)
  }
  return { logFile }
}

async function parseSeedIds(): Promise<{ theses: Set<string>; reports: Set<string>; sources: Set<string> }> {
  const parseBlock = async (file: string, varName: string): Promise<Set<string>> => {
    const src = await fs.readFile(path.join(ROOT, file), 'utf8')
    const ids = new Set<string>()
    const re = new RegExp(`\\bid\\s*:\\s*['\"\`]([^'\"\`]+)['\"\`]`, 'g')
    const arrayStart = src.search(new RegExp(`export const ${varName}\\b`))
    const scope = arrayStart >= 0 ? src.slice(arrayStart) : src
    let m: RegExpExecArray | null
    while ((m = re.exec(scope))) ids.add(m[1])
    return ids
  }

  const theses = await parseBlock('src/lib/data/theses.ts', 'theses')
  const reports = await parseBlock('src/lib/data/reports.ts', 'reports')
  const sources = await parseBlock('src/lib/data/sources.ts', 'sources')
  return { theses, reports, sources }
}

async function main(): Promise<void> {
  const { logFile } = parseArgs()
  console.log(`[sync] reading ${path.relative(ROOT, logFile)}`)

  const logRaw = await fs.readFile(logFile, 'utf8')
  const entries: LogEntry[] = logRaw
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))
  const downloaded = entries.filter((e) => e.status === 'downloaded' && e.local_path)
  console.log(`[sync] ${downloaded.length} downloaded entries to consider`)

  const seed = await parseSeedIds()
  const overrides: Overrides = JSON.parse(await fs.readFile(OVERRIDES, 'utf8'))

  const added = { theses: 0, reports: 0, sources: 0, unmatched: 0 }

  for (const e of downloaded) {
    if (seed.theses.has(e.id)) {
      if (!overrides.theses[e.id]) {
        overrides.theses[e.id] = e.local_path
        added.theses++
      }
    } else if (seed.reports.has(e.id)) {
      if (!overrides.reports[e.id]) {
        overrides.reports[e.id] = e.local_path
        added.reports++
      }
    } else if (seed.sources.has(e.id)) {
      if (!overrides.sources[e.id]) {
        overrides.sources[e.id] = e.local_path
        added.sources++
      }
    } else {
      console.log(`[sync] UNMATCHED: ${e.id} (not in any seed) → ${e.local_path}`)
      added.unmatched++
    }
  }

  await fs.writeFile(OVERRIDES, JSON.stringify(overrides, null, 2) + '\n', 'utf8')
  console.log(`[sync] wrote ${path.relative(ROOT, OVERRIDES)}`)
  console.log(`[sync] added: theses=${added.theses} reports=${added.reports} sources=${added.sources} unmatched=${added.unmatched}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
