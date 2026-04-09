import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT = path.join(RESEARCH, 'DOWNLOAD-RESULTAT.md')

type LogEntry = {
  id: string
  priority: string
  url: string
  resolved_pdf_url: string
  status: 'downloaded' | 'skipped' | 'duplicate' | 'failed' | 'requires_manual' | 'dry_run'
  http_code: number
  bytes: number
  sha256: string
  local_path: string
  error: string
  ts: string
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

async function main(): Promise<void> {
  const { logFile } = parseArgs()
  const raw = await fs.readFile(logFile, 'utf8')
  const entries: LogEntry[] = raw.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))

  const byStatus: Record<string, LogEntry[]> = {}
  for (const e of entries) {
    ;(byStatus[e.status] ||= []).push(e)
  }

  const totalBytes = entries.filter((e) => e.status === 'downloaded').reduce((s, e) => s + e.bytes, 0)

  const lines: string[] = []
  lines.push('# Nedlastingsresultat — Fase B1')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/build-download-report.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push(`> Kilde: \`${path.relative(ROOT, logFile)}\``)
  lines.push('')
  lines.push('## Sammendrag')
  lines.push('')
  lines.push('| Status | Antall | Beskrivelse |')
  lines.push('|---|---:|---|')
  lines.push(`| \`downloaded\` | ${(byStatus.downloaded || []).length} | PDF lastet ned og lagret |`)
  lines.push(`| \`duplicate\` | ${(byStatus.duplicate || []).length} | SHA256-match mot eksisterende fil i arkiv |`)
  lines.push(`| \`skipped\` | ${(byStatus.skipped || []).length} | Allerede i seed-pdf-map eller target eksisterte |`)
  lines.push(`| \`requires_manual\` | ${(byStatus.requires_manual || []).length} | Ingen PDF-URL kunne løses automatisk |`)
  lines.push(`| \`failed\` | ${(byStatus.failed || []).length} | Nedlasting feilet (HTTP-feil, timeout, ikke-PDF) |`)
  lines.push(`| **Totalt** | **${entries.length}** | |`)
  lines.push('')
  lines.push(`**Bytes nedlastet:** ${(totalBytes / 1024 / 1024).toFixed(1)} MB`)
  lines.push('')

  // Downloaded
  if (byStatus.downloaded?.length) {
    lines.push(`## Nedlastet (${byStatus.downloaded.length})`)
    lines.push('')
    lines.push('| ID | Størrelse | Lokal fil |')
    lines.push('|---|---:|---|')
    for (const e of byStatus.downloaded) {
      lines.push(`| \`${e.id}\` | ${(e.bytes / 1024).toFixed(0)} KB | \`${e.local_path}\` |`)
    }
    lines.push('')
  }

  // Duplicates
  if (byStatus.duplicate?.length) {
    lines.push(`## Duplikater (${byStatus.duplicate.length})`)
    lines.push('')
    lines.push('| ID | Eksisterer som |')
    lines.push('|---|---|')
    for (const e of byStatus.duplicate) {
      const match = e.error.replace(/^duplicate of /, '')
      lines.push(`| \`${e.id}\` | \`${match}\` |`)
    }
    lines.push('')
  }

  // Failed
  if (byStatus.failed?.length) {
    lines.push(`## Feilet (${byStatus.failed.length})`)
    lines.push('')
    lines.push('| ID | Feil | URL |')
    lines.push('|---|---|---|')
    for (const e of byStatus.failed) {
      lines.push(`| \`${e.id}\` | ${e.error} | \`${e.url}\` |`)
    }
    lines.push('')
  }

  // Requires manual
  if (byStatus.requires_manual?.length) {
    lines.push(`## Krever manuell innhenting (${byStatus.requires_manual.length})`)
    lines.push('')
    lines.push('Disse oppføringene har en landing page eller hub-side hvor automatisk scraping ikke fant en spesifikk PDF. Mange er NHH/Brage-theses som har migrert til `nva.sikt.no` — dette arkivet krever autentisering for nedlasting og må hentes manuelt via browser.')
    lines.push('')
    lines.push('| ID | URL |')
    lines.push('|---|---|')
    for (const e of byStatus.requires_manual) {
      lines.push(`| \`${e.id}\` | \`${e.url}\` |`)
    }
    lines.push('')
  }

  lines.push('## Hvorfor mange krever manuell innhenting')
  lines.push('')
  lines.push('Hoveddelen av de 43 P1-oppføringene som flagges `requires_manual` er NHH/NMBU/UiB/NTNU-theses som har migrert fra Brage (`openaccess.nhh.no`, `brage.unit.no`) til NVA (`nva.sikt.no`). NVA er en React-SPA uten server-rendret HTML, så regex-scraping mot landing-page finner ingen `.pdf`-lenker. Det underliggende API-et (`api.nva.unit.no/publication/{uuid}`) er auth-gated — selv for `OpenFile`-typer returnerer `/download`-endpoint `403 Missing Authentication Token` uten gyldig Sikt/Feide-sesjon. Dette betyr at automatisering krever enten:')
  lines.push('')
  lines.push('1. **Feide-autentisert headless browser** (Playwright + login) — ikke implementert i Fase B')
  lines.push('2. **Alternative kilder**: Google Scholar, Cristin-API, OpenAlex for de som er indeksert der')
  lines.push('3. **Manuell nedlasting via browser** — brukeren åpner `hdl.handle.net/11250/...`, venter på NVA-redirect, klikker "Last ned" mens pålogget')
  lines.push('')
  lines.push('I tillegg står de utenlandske CBS-tesene (`research.cbs.dk/studentProjects/...`) bak Cloudflare-bot-check som avviser alle våre requests med HTTP 403. Disse kan trolig bare hentes fra en ekte browser.')
  lines.push('')
  lines.push('## Neste steg')
  lines.push('')
  lines.push('1. **Manuell innhenting** av høy-prioritet manuelt-flagged oppføringer (spesielt NVA-hostede NHH-theses via browser).')
  lines.push('2. **Retry av feilede HTTP 403/429**: disse kan muligens løses med browser-UA eller lengre throttling — evt. ny Fase B2-runde.')
  lines.push('3. **Re-kjør audit-kjeden** etter manuell innhenting: `build-seed-pdf-map → audit-platform-linkage → build-pdf-catalog → build-orphan-review → build-download-queue`.')
  lines.push('4. **Vurder å kjøre P2/P3** når P1 er ryddet — `node --experimental-strip-types scripts/fetch-download-queue.ts --priority P2`.')
  lines.push('')

  await fs.writeFile(OUT, lines.join('\n'), 'utf8')
  console.log(`[report] wrote ${path.relative(ROOT, OUT)}`)
  console.log(`[report] summary: downloaded=${(byStatus.downloaded || []).length} duplicate=${(byStatus.duplicate || []).length} skipped=${(byStatus.skipped || []).length} manual=${(byStatus.requires_manual || []).length} failed=${(byStatus.failed || []).length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
