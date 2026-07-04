import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH,
  buildLibraryAnalysisPdfExtractionProfile,
  formatLibraryAnalysisPdfExtractionProfileMarkdown,
  type LibraryAnalysisPdfExtractionProfileInput,
} from '../src/lib/library-analysis-pdf-extraction-profile'
import { LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH } from '../src/lib/library-analysis-repair-backlog'

function main() {
  const generatedAt = new Date().toISOString()
  const repairBacklog = JSON.parse(readFileSync(resolve(process.cwd(), LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH), 'utf8')) as {
    rows: LibraryAnalysisPdfExtractionProfileInput[]
  }

  const profile = buildLibraryAnalysisPdfExtractionProfile(repairBacklog.rows, row => {
    const result = spawnSync('pdftotext', ['-layout', resolve(process.cwd(), row.path), '-'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })

    return {
      exitCode: result.status ?? 1,
      stderr: result.error?.message ?? result.stderr ?? '',
      text: result.stdout ?? '',
    }
  })

  const markdown = formatLibraryAnalysisPdfExtractionProfileMarkdown(profile, {
    generatedAt,
    jsonPath: LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH,
  })

  writeArtifact(LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH, markdown)
  writeArtifact(
    LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH,
    JSON.stringify({ generatedAt, ...profile }, null, 2) + '\n',
  )

  console.log(`Library PDF extraction profile rows: ${profile.total}`)
  for (const [status, count] of Object.entries(profile.summary.byStatus)) {
    console.log(`  ${status}: ${count}`)
  }
  console.log(`Markdown: ${LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH}`)
  console.log(`JSON: ${LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH}`)
}

function writeArtifact(path: string, content: string) {
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

main()
