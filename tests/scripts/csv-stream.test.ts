import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import { readCsvRecords } from '../../scripts/lib/csv-stream'

const dir = mkdtempSync(join(tmpdir(), 'csv-stream-'))
after(() => rmSync(dir, { recursive: true, force: true }))

async function readAll(content: string, options: { delimiter?: string; highWaterMark?: number } = {}) {
  const path = join(dir, `f${Math.random().toString(36).slice(2)}.csv`)
  writeFileSync(path, content)
  const rows: Record<string, string>[] = []
  for await (const row of readCsvRecords(path, options)) rows.push(row)
  return rows
}

describe('readCsvRecords', () => {
  const content =
    '﻿"orgnr","navn","aktivitet"\r\n' +
    '"999999991","Testfisk, avd ""Nord""","Linje en\nlinje to"\r\n' +
    '999999992,Prøveslakt,\r\n' +
    '\r\n' +
    '999999993,Uten linjeskift,siste'

  it('handles quoted delimiters, doubled quotes, embedded line breaks, CRLF and a missing final newline', async () => {
    const rows = await readAll(content)
    assert.deepEqual(rows, [
      { orgnr: '999999991', navn: 'Testfisk, avd "Nord"', aktivitet: 'Linje en\nlinje to' },
      { orgnr: '999999992', navn: 'Prøveslakt', aktivitet: '' },
      { orgnr: '999999993', navn: 'Uten linjeskift', aktivitet: 'siste' },
    ])
  })

  it('gives the same records when quotes and line breaks straddle tiny read chunks', async () => {
    assert.deepEqual(await readAll(content, { highWaterMark: 3 }), await readAll(content))
  })

  it('reads a semicolon-separated file', async () => {
    assert.deepEqual(await readAll('a;b\n1;"2;3"\n', { delimiter: ';' }), [{ a: '1', b: '2;3' }])
  })
})
