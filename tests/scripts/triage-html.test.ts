import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { parseCsvRecords } from '../../src/lib/csv'

const SCRIPT_PATH = resolve('scripts/triage-html.ts')
const TSX_BIN = resolve('node_modules/.bin/tsx')

test('HTML triage uses extracted text sidecar when HTML prefix is not representative', () => {
  const root = mkdtempSync(join(tmpdir(), 'html-triage-'))
  const downloadsDir = join(root, 'research', 'evidence-pack', 'organic', 'downloads')
  const textDir = join(root, 'research', 'evidence-pack', 'organic', 'text')
  mkdirSync(downloadsDir, { recursive: true })
  mkdirSync(textDir, { recursive: true })

  writeFileSync(
    join(downloadsDir, 'organic-register.html'),
    '<html><head><title>404 shell</title></head><body>404</body></html>',
  )
  writeFileSync(
    join(textDir, 'organic-register.txt'),
    Array.from({ length: 240 }, (_, i) => `certified organic operator ${i}`).join(' '),
  )

  execFileSync(TSX_BIN, [SCRIPT_PATH], {
    cwd: root,
    stdio: 'pipe',
  })

  const rows = parseCsvRecords(readFileSync(join(root, 'research', 'HTML-TRIAGE.csv'), 'utf8'))
  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.path, 'evidence-pack/organic/downloads/organic-register.html')
  assert.equal(rows[0]?.classification, 'ok-snapshot')
  assert.equal(rows[0]?.has_text_companion, 'yes')
  assert.equal(rows[0]?.severity, 'LOW')
  assert.match(rows[0]?.action ?? '', /extracted text companion/i)
})
