import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { buildNotebookLmExport } from '../../src/lib/notebooklm-export'

async function writeFixture(root: string) {
  await mkdir(path.join(root, 'Food Systems Obsidian', '0 Kart'), { recursive: true })
  await mkdir(path.join(root, 'Food Systems Obsidian', '10 Innsiktskart', 'Innsikter'), { recursive: true })
  await mkdir(path.join(root, 'research', '_status', 'food-tg-r13'), { recursive: true })
  await mkdir(path.join(root, 'research', 'external', 'r13'), { recursive: true })
  await mkdir(path.join(root, 'research', 'rammeverk'), { recursive: true })
  await mkdir(path.join(root, 'docs', 'project', 'mandates'), { recursive: true })
  await mkdir(path.join(root, 'content', 'hvitbok'), { recursive: true })

  await writeFile(
    path.join(root, 'Food Systems Obsidian', '0 Kart', 'HUB - Kunnskapsdatabasen.md'),
    '# HUB\n\n8 klynger. Prisma-database. Forskningsarkiv. Kilder.\n',
  )
  await writeFile(
    path.join(root, 'Food Systems Obsidian', '10 Innsiktskart', 'Innsikter', 'I24 Syntesen.md'),
    '# I24 Syntesen\n\nSystemkritikken må treffe prisgulv og superprofitt samtidig.\n',
  )
  await writeFile(
    path.join(root, 'research', 'CITABLE-KNOWLEDGE-BASE-STATUS.md'),
    '# Citable Knowledge Base Status\n\nSourceCitation=2699. readiness queue P2 1.\n',
  )
  await writeFile(
    path.join(root, 'research', 'CITABLE-ACCEPTANCE-TESTS.md'),
    '# Citable Acceptance Tests\n\n7 of 12 cite-ready and 5 fail-closed.\n',
  )
  await writeFile(
    path.join(root, 'research', '_status', 'food-tg-r13', 'r13-intake-index-2026-06-25.md'),
    '# R13\n\nPCQ-ready 14. source-shortlist 24. actor-gate 8. må ikke visualiseres ennå 46.\n',
  )
  await writeFile(
    path.join(root, 'research', 'external', 'r13', 'R13-WASTE-001-marint-restrastoff-rstige.md'),
    '# Marine R-stige\n\nUtnyttet er ikke det samme som høyverdi.\n',
  )
  await writeFile(
    path.join(root, 'research', 'rammeverk', 'narrativ-struktur.md'),
    '# Narrativ\n\nTriopol, importavhengighet og fem overgangsmekanismer.\n',
  )
  await writeFile(
    path.join(root, 'docs', 'project', 'mandates', 'R13-LAND-006-figurkandidater.md'),
    '# Figurkandidater\n\nFigur-klar betyr ikke publiseringsklar.\n',
  )
  await writeFile(
    path.join(root, 'content', 'hvitbok', '01-kort-til-jan-thomas.md'),
    '# Hvitbok\n\nRoadmap og transition levers.\n',
  )
  await writeFile(path.join(root, 'research', 'raw.pdf'), '%PDF-1.4 raw binary placeholder\n')
}

test('builds a NotebookLM-ready export pack with control docs, labels and no raw PDFs', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'notebooklm-source-'))
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'notebooklm-output-'))

  try {
    await writeFixture(sourceRoot)

    const result = await buildNotebookLmExport({
      sourceRoot,
      outputRoot,
      date: '2026-07-02',
    })

    assert.ok(result.files.length <= 50)
    assert.equal(result.files[0]?.filename, '00_START_HERE.md')
    assert.ok(result.files.some((file) => file.filename === '01_DECK_BRIEFING_INSTRUCTIONS.md'))
    assert.ok(result.files.some((file) => file.filename === '02_CLAIM_BOUNDARIES.md'))
    assert.ok(result.files.every((file) => file.wordCount < 500_000))
    assert.ok(result.files.every((file) => file.bytes < 200 * 1024 * 1024))

    const generatedNames = await readdir(result.exportDir)
    assert.ok(!generatedNames.some((name) => name.endsWith('.pdf')))

    const startHere = await readFile(path.join(result.exportDir, '00_START_HERE.md'), 'utf8')
    assert.match(startHere, /source-shortlist/)
    assert.match(startHere, /actor-gated/)
    assert.match(startHere, /do-not-visualize-yet/)
    assert.match(startHere, /capacity is not realized volume/i)

    const index = await readFile(path.join(result.exportDir, 'SOURCE_INDEX.csv'), 'utf8')
    assert.match(index, /00_START_HERE.md/)
    assert.match(index, /recommended_notebooklm_prompt/)
  } finally {
    await rm(sourceRoot, { recursive: true, force: true })
    await rm(outputRoot, { recursive: true, force: true })
  }
})
