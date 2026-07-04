import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { parseCsvRecords } from '../../src/lib/csv'

const SCRIPT_PATH = resolve('scripts/build-remediation-backlog.ts')
const TSX_BIN = resolve('node_modules/.bin/tsx')

function writeResearchCsvs(root: string): void {
  const researchDir = join(root, 'research')
  mkdirSync(researchDir, { recursive: true })
  writeFileSync(
    join(researchDir, 'FILE-COVERAGE.csv'),
    'ref,entity_type,problem,severity,suggested_action,priority\n',
  )
  writeFileSync(
    join(researchDir, 'PDF-QUALITY.csv'),
    'path,severity,classification,size_kb,pages,word_count,action\n',
  )
  writeFileSync(
    join(researchDir, 'HTML-TRIAGE.csv'),
    [
      'path,classification,word_count,has_md_companion,has_text_companion,referenced_in_seed,severity,action',
      '"ok-with-md.html",ok-snapshot,500,yes,no,no,LOW,"OK - Markdown companion present"',
      '"ok-with-text.html",ok-snapshot,500,no,yes,no,LOW,"OK - extracted text companion present"',
      '"bad-error.html",error-page,12,no,no,no,LOW,"Investigate fetch failure; remove HTML or replace with valid snapshot"',
    ].join('\n') + '\n',
  )
  writeFileSync(
    join(researchDir, 'URL-HEALTH.csv'),
    'url,source,classification,status,final_url,source_priority\n',
  )
}

test('remediation backlog excludes ok HTML snapshots with markdown companions', () => {
  const root = mkdtempSync(join(tmpdir(), 'remediation-backlog-'))
  writeResearchCsvs(root)

  execFileSync(TSX_BIN, [SCRIPT_PATH], {
    cwd: root,
    stdio: 'pipe',
  })

  const rows = parseCsvRecords(readFileSync(join(root, 'research', 'REMEDIATION-BACKLOG.csv'), 'utf8'))
  assert.deepEqual(rows.map(row => row.ref), ['bad-error.html'])
  assert.equal(rows[0]?.source, 'html-triage')
  assert.equal(rows[0]?.problem, 'error-page')
})
