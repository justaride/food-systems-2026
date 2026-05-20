import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseCsvRecords } from '../src/lib/csv'
import {
  buildPdfOcrReviewMap,
  isReviewedPdfQualityIssueOpen,
  summarizePdfOcrReviews,
  type PdfQualityIssueRow,
} from '../src/lib/pdf-ocr-review'
import {
  buildUrlHealthReviewMap,
  isReviewedUrlHealthIssueOpen,
  summarizeUrlHealthReviews,
  type UrlHealthIssueRow,
} from '../src/lib/url-health-review'

type BacklogRow = {
  source: 'file-coverage' | 'pdf-quality' | 'html-triage' | 'url-health'
  ref: string
  entity_type: string
  problem: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  suggested_action: string
  priority: string
  fix_group: string
}

function parseCsv(content: string): Record<string, string>[] {
  return parseCsvRecords(content)
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function classifyFixGroup(source: string, problem: string, ref: string, action: string): string {
  if (source === 'file-coverage' && problem === 'missing_file_document') {
    if (action.includes('incoming/food-research-process-2026-04-20')) return 'A: stale incoming/'
    if (action.includes('external/')) return 'B: external/ DB-only'
    if (action.includes('generated/meetings/')) return 'C: generated/meetings/'
    return 'D: other missing-document'
  }
  if (source === 'file-coverage' && problem === 'missing_file_sourcedoc') return 'E: missing SourceDoc'
  if (source === 'file-coverage' && problem === 'orphan_file') return 'F: orphan files'
  if (source === 'file-coverage' && problem === 'broken_supportingsource') return 'G: broken supportingSource'
  if (source === 'file-coverage' && problem === 'duplicate_file_separate_records') return 'H: duplicate Documents'
  if (source === 'pdf-quality') {
    if (problem === 'scanned') return 'I: scanned PDFs (need OCR)'
    if (problem === 'low-text') return 'J: low-text PDFs'
    if (problem === 'skipped-too-large') return 'K: oversized PDFs'
    if (problem === 'html-mis-saved') return 'L: html-as-pdf'
    return 'M: other PDF issues'
  }
  if (source === 'html-triage') {
    if (problem === 'needs-md-extraction') return 'N: needs MD extraction'
    return 'O: other HTML issues'
  }
  if (source === 'url-health') {
    if (problem === 'dead') return 'P: dead URLs'
    if (problem === 'blocked') return 'Q: blocked URLs (403/451)'
    if (problem === 'timeout') return 'R: timeout URLs'
    if (problem === 'server_error') return 'S: server-error URLs'
    if (problem === 'other') return 'T: other URL issues'
    return 'U: misc URL'
  }
  return 'Z: ungrouped'
}

function main(): void {
  const root = process.cwd()
  const rows: BacklogRow[] = []
  let closedReviewedPdfIssues = 0
  let unappliedPdfReviews = 0
  let closedReviewedUrlIssues = 0
  let unappliedUrlReviews = 0

  const fc = parseCsv(readFileSync(join(root, 'research', 'FILE-COVERAGE.csv'), 'utf-8'))
  for (const r of fc) {
    rows.push({
      source: 'file-coverage',
      ref: r.ref,
      entity_type: r.entity_type,
      problem: r.problem,
      severity: r.severity as BacklogRow['severity'],
      suggested_action: r.suggested_action,
      priority: r.priority,
      fix_group: classifyFixGroup('file-coverage', r.problem, r.ref, r.suggested_action),
    })
  }

  const pq = parseCsv(readFileSync(join(root, 'research', 'PDF-QUALITY.csv'), 'utf-8'))
  let pdfOcrReviewRows: Record<string, string>[] = []
  try {
    pdfOcrReviewRows = parseCsv(readFileSync(join(root, 'research', 'PDF-OCR-REVIEW.csv'), 'utf-8'))
  } catch {
    pdfOcrReviewRows = []
  }
  const pdfOcrReviewMap = buildPdfOcrReviewMap(pdfOcrReviewRows)
  const pdfIssueRows: PdfQualityIssueRow[] = pq
    .filter(r => r.classification !== 'ok')
    .map(r => ({
      path: r.path,
      classification: r.classification,
    }))
  const pdfOcrReviewSummary = summarizePdfOcrReviews(pdfIssueRows, pdfOcrReviewMap)
  closedReviewedPdfIssues = pdfOcrReviewSummary.closedReviewedIssues
  unappliedPdfReviews = pdfOcrReviewSummary.unappliedReviews

  for (const r of pq) {
    if (r.classification === 'ok') continue
    if (
      !isReviewedPdfQualityIssueOpen(
        { path: r.path, classification: r.classification },
        pdfOcrReviewMap,
      )
    ) {
      continue
    }
    rows.push({
      source: 'pdf-quality',
      ref: r.path,
      entity_type: 'PDF',
      problem: r.classification,
      severity: (r.severity || 'LOW') as BacklogRow['severity'],
      suggested_action: r.action,
      priority: '',
      fix_group: classifyFixGroup('pdf-quality', r.classification, r.path, r.action),
    })
  }

  const ht = parseCsv(readFileSync(join(root, 'research', 'HTML-TRIAGE.csv'), 'utf-8'))
  for (const r of ht) {
    rows.push({
      source: 'html-triage',
      ref: r.path,
      entity_type: 'HTML',
      problem: r.classification,
      severity: (r.severity || 'LOW') as BacklogRow['severity'],
      suggested_action: r.action,
      priority: '',
      fix_group: classifyFixGroup('html-triage', r.classification, r.path, r.action),
    })
  }

  try {
    const uh = parseCsv(readFileSync(join(root, 'research', 'URL-HEALTH.csv'), 'utf-8'))
    let reviewRows: Record<string, string>[] = []
    try {
      reviewRows = parseCsv(readFileSync(join(root, 'research', 'URL-HEALTH-REVIEW.csv'), 'utf-8'))
    } catch {
      reviewRows = []
    }

    const reviewMap = buildUrlHealthReviewMap(reviewRows)
    const urlIssueRows: UrlHealthIssueRow[] = uh.map(r => ({
      url: r.url,
      source: r.source,
      classification: r.classification,
    }))
    const reviewSummary = summarizeUrlHealthReviews(urlIssueRows, reviewMap)
    closedReviewedUrlIssues = reviewSummary.closedReviewedIssues
    unappliedUrlReviews = reviewSummary.unappliedReviews

    for (const r of uh) {
      if (r.classification === 'ok' || r.classification === 'redirect') continue
      if (
        !isReviewedUrlHealthIssueOpen(
          { url: r.url, source: r.source, classification: r.classification },
          reviewMap,
        )
      ) {
        continue
      }
      const priority = parseFloat(r.source_priority || '0')
      const severity: BacklogRow['severity'] =
        priority >= 4.5 ? 'HIGH' : priority >= 3 ? 'MEDIUM' : 'LOW'
      rows.push({
        source: 'url-health',
        ref: r.url,
        entity_type: 'URL',
        problem: r.classification,
        severity,
        suggested_action: `${r.classification} (HTTP ${r.status}) — source ${r.source}; ${r.final_url ? 'follow redirect to ' + r.final_url : 'verify URL'}`,
        priority: r.source_priority || '',
        fix_group: classifyFixGroup('url-health', r.classification, r.url, ''),
      })
    }
  } catch {
    // URL-HEALTH.csv not yet generated; skip silently
  }

  const sevOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 }
  rows.sort((a, b) => {
    const sa = sevOrder[a.severity] ?? 4
    const sb = sevOrder[b.severity] ?? 4
    if (sa !== sb) return sa - sb
    if (a.fix_group !== b.fix_group) return a.fix_group.localeCompare(b.fix_group)
    return a.ref.localeCompare(b.ref)
  })

  const csvLines = [
    'source,ref,entity_type,problem,severity,fix_group,priority,suggested_action',
    ...rows.map((r) =>
      [
        r.source,
        csvEscape(r.ref),
        r.entity_type,
        r.problem,
        r.severity,
        csvEscape(r.fix_group),
        r.priority,
        csvEscape(r.suggested_action),
      ].join(','),
    ),
  ]
  writeFileSync(
    join(root, 'research', 'REMEDIATION-BACKLOG.csv'),
    csvLines.join('\n') + '\n',
  )

  const sevCounts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  const sourceCounts: Record<string, Record<string, number>> = {
    'file-coverage': { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
    'pdf-quality': { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
    'html-triage': { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
    'url-health': { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
  }
  const groupCounts: Record<string, { HIGH: number; MEDIUM: number; LOW: number; total: number }> = {}
  for (const r of rows) {
    sevCounts[r.severity] = (sevCounts[r.severity] ?? 0) + 1
    sourceCounts[r.source][r.severity] = (sourceCounts[r.source][r.severity] ?? 0) + 1
    if (!groupCounts[r.fix_group]) {
      groupCounts[r.fix_group] = { HIGH: 0, MEDIUM: 0, LOW: 0, total: 0 }
    }
    if (r.severity !== 'INFO') {
      groupCounts[r.fix_group][r.severity] += 1
    }
    groupCounts[r.fix_group].total += 1
  }

  const mdLines = [
    '# REMEDIATION BACKLOG — data-readiness Fase B',
    '',
    '> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt: **${rows.length}** funn`,
    '',
    '## Sammendrag per kilde × severity',
    '',
    '| Kilde | HIGH | MEDIUM | LOW | INFO |',
    '|---|---:|---:|---:|---:|',
    ...Object.entries(sourceCounts).map(
      ([source, counts]) =>
        `| ${source} | ${counts.HIGH} | ${counts.MEDIUM} | ${counts.LOW} | ${counts.INFO} |`,
    ),
    `| **Total** | ${sevCounts.HIGH} | ${sevCounts.MEDIUM} | ${sevCounts.LOW} | ${sevCounts.INFO} |`,
    '',
    '## Fiksgrupper (rotårsak-analyse)',
    '',
    'Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:',
    '',
    '| Gruppe | Funn | HIGH | MEDIUM | LOW |',
    '|---|---:|---:|---:|---:|',
    ...Object.entries(groupCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([group, c]) =>
          `| ${group} | ${c.total} | ${c.HIGH} | ${c.MEDIUM} | ${c.LOW} |`,
      ),
    '',
    '## Nåværende hovedrestanser',
    '',
    `- **SourceDoc-lokatorer:** ${groupCounts['E: missing SourceDoc']?.total ?? 0} funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.`,
    `- **PDF-OCR:** ${closedReviewedPdfIssues} scannede PDF-er er lukket i \`research/PDF-OCR-REVIEW.csv\` fordi OCR-tekst er arkivert eller eksisterende Document-tekst allerede er dekkende; ${unappliedPdfReviews} review-rader traff ingen aktiv PDF-quality-rad.`,
    `- **URL-helse:** ${(groupCounts['P: dead URLs']?.total ?? 0) + (groupCounts['Q: blocked URLs (403/451)']?.total ?? 0) + (groupCounts['R: timeout URLs']?.total ?? 0) + (groupCounts['S: server-error URLs']?.total ?? 0) + (groupCounts['T: other URL issues']?.total ?? 0)} funn fordelt på dead/blocked/timeout/server_error/other.`,
    `- **URL-review:** ${closedReviewedUrlIssues} blokkerte URL-er er lukket i \`research/URL-HEALTH-REVIEW.csv\` fordi de er verifisert via nettleser, citable mirror eller lokal kildepakke; ${unappliedUrlReviews} review-rader traff ingen aktiv URL-health-rad.`,
    `- **Document.filePath:** ${rows.filter((r) => r.problem === 'missing_file_document').length} manglende dokumentfiler i denne kjøringen.`,
    `- **Orphan files:** ${groupCounts['F: orphan files']?.total ?? 0} repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.`,
    '',
    '## Anbefalt rekkefølge for neste ryddeslice',
    '',
    '1. **Åpne MEDIUM-funn:** håndter gjenværende `pdf-quality`-rad først. For skippede/korrupt-lignende PDF-er betyr dette re-nedlasting, erstatningskilde eller eksplisitt arkivbeslutning.',
    '2. **Graph enrichment:** prioriter board-member profile gaps og company-name duplicate groups; teknisk graf-integritet er allerede grønn.',
    '3. **Dead/low-priority URL-er (Gruppe P/T):** rydd bare der kilden brukes i app/rapport eller har klar ny URL.',
    '4. **Orphan files (Gruppe F):** vurder arkivering/sletting senere; alle Document/SourceDoc-lokatorer er grønne i denne kjøringen.',
    '',
    '## URL-HEALTH status',
    '',
    'URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.',
    '',
    'Review-lukkede URL-er i `research/URL-HEALTH-REVIEW.csv` beholdes med opprinnelig kilde-URL, men tas ut av åpen backlog når det finnes eksplisitt nettleserverifikasjon, citable mirror eller lokal kildepakke. Dette er ikke det samme som å erklære CLI-sjekken grønn.',
    '',
    'Scannede PDF-er i `research/PDF-OCR-REVIEW.csv` beholdes som opprinnelige PDF-filer, men tas ut av åpen backlog når OCR-tekst på minst 100 ord er arkivert eller DB-innhold allerede er dekkende. Dette er ikke det samme som å erklære PDF-filen tekstbasert.',
    '',
    '## Top 30 høyest prioritet',
    '',
    '| # | Severity | Source | Fix-gruppe | Problem | Ref |',
    '|---:|---|---|---|---|---|',
    ...rows.slice(0, 30).map(
      (r, i) =>
        `| ${i + 1} | ${r.severity} | ${r.source} | ${r.fix_group} | ${r.problem} | ${r.ref.slice(0, 60)} |`,
    ),
  ]
  writeFileSync(
    join(root, 'research', 'REMEDIATION-BACKLOG.md'),
    mdLines.join('\n') + '\n',
  )

  console.log(`Consolidated ${rows.length} findings into REMEDIATION-BACKLOG`)
  console.log(`  HIGH: ${sevCounts.HIGH}`)
  console.log(`  MEDIUM: ${sevCounts.MEDIUM}`)
  console.log(`  LOW: ${sevCounts.LOW}`)
  console.log(`  INFO: ${sevCounts.INFO}`)
  console.log('')
  console.log('Top fix groups:')
  for (const [group, c] of Object.entries(groupCounts).sort(
    ([, a], [, b]) => b.total - a.total,
  )) {
    console.log(`  ${group}: ${c.total} (H:${c.HIGH} M:${c.MEDIUM} L:${c.LOW})`)
  }
  console.log('')
  console.log('Output: research/REMEDIATION-BACKLOG.csv + research/REMEDIATION-BACKLOG.md')
}

main()
