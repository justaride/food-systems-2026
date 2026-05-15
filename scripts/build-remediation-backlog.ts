import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseCsvRecords } from '../src/lib/csv'

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
  for (const r of pq) {
    if (r.classification === 'ok') continue
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
    for (const r of uh) {
      if (r.classification === 'ok' || r.classification === 'redirect') continue
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
    '### Gruppe A: stale `incoming/food-research-process-2026-04-20/` paths',
    '',
    'Document.filePath peker til `incoming/food-research-process-2026-04-20/...` som ikke finnes — filene er flyttet til `research/arkiv-sortert/Food Research Process 20.04.26/...` i intake-omorganiseringen.',
    '',
    '**Fiks:** skript som mapper `incoming/foo-bar-baz` → `research/arkiv-sortert/Food Research Process 20.04.26/foo_bar_baz` og oppdaterer `Document.filePath` in-place. Verifiser hver mapping mot `research/pdf-katalog.json` SHA256 før commit. Lav risiko, høyt antall fikser — bør gjøres først.',
    '',
    '### Gruppe B: `external/` paths',
    '',
    'Document.filePath peker til `external/...` som ikke finnes på disk noe sted. Innhold er sannsynligvis bare i `Document.content` (DB-only). Filer er enten slettet eller aldri lagret lokalt.',
    '',
    '**Fiks:** policy-beslutning trengs:',
    '- Beholde som DB-only? Da bør `Document.filePath` settes til null + provenance-flagg "db-only".',
    '- Eller laste ned/regenerere PDF-er fra Document.url-feltet?',
    '',
    '### Gruppe C: `generated/meetings/meeting-N.md`',
    '',
    'Auto-genererte møtenotater som ikke lenger er i repoet (verken filer eller katalog). Cleanup som ikke ble fulgt opp i DB.',
    '',
    '**Fiks:** enten gjenskape via samme generator, eller slette de Document-radene fra DB.',
    '',
    '## Anbefalt rekkefølge for Fase C',
    '',
    '1. **Gruppe A** (~191 Documents, MEDIUM): script-basert path-remap. Lavt risikokvalitet, høyt antall fikser — høyest ROI.',
    '2. **HIGH severity** (totalt få): manuell behandling av matsvinnutvalget-2024 + 3 HTML-snapshots.',
    '3. **Gruppe I — scanned PDFs**: vurder OCR (Tesseract) for de 2-3 viktigste.',
    '4. **Gruppe C** (8 generated/meetings): beslutning gjenskape vs slette.',
    '5. **Gruppe B** (~60 external/): policy-beslutning før handling.',
    '6. **Gruppe N — needs-md-extraction (HTML)**: 5 saker, kan automatiseres med readability/turndown-pipeline.',
    '7. **Gruppe J — low-text PDFs (44)**: lav prioritet — Document.content har sannsynligvis allerede tekst.',
    '8. **Gruppe F — orphan files (199)**: lav prioritet — mest arkiv-sortert/ rå-arkiv, kan beholdes.',
    '',
    '## URL-INVENTORY status',
    '',
    'URL-helse er **ikke** klassifisert ennå — kun inventarisert (173 unike, 98 % høy-prioritet). Faktisk HTTP-sjekk er en egen Fase B-utvidelse (kan kjøres som batch nattjobb før Fase C).',
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
