import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const operatorLogPath = 'docs/project/status/jt-uke25-operatorlogg-2026-06-15.md'

function readOperatorLog() {
  assert.ok(existsSync(operatorLogPath), `${operatorLogPath} must exist`)
  return readFileSync(operatorLogPath, 'utf8')
}

describe('Food TG Week 25 operator log', () => {
  it('bridges the send package to executable booking, DASK, and decision logging without claiming execution', () => {
    const log = readOperatorLog()

    for (const term of [
      'JT/Einar/Thea',
      'møtebooking',
      'DASK-0906-001',
      'DASK-0906-002',
      'RESP-0906-001',
      'RESP-0906-002',
      'Port E',
      'Thea-aktivering',
      'decision-log-food-tg.md',
      'MØTEOVERSIKT',
      'innen 48 timer',
      'ikke sendt',
      'ikke vedtatt',
      'ikke ekstern outreach',
    ]) {
      assert.ok(log.includes(term), `${term} missing from ${operatorLogPath}`)
    }
  })

  it('keeps platform PR #159 and external-use gates separate from the Week 25 operator flow', () => {
    const log = readOperatorLog()

    for (const term of [
      'PR #159 holdes draft',
      'G-06/G-10/G-11',
      'operatorsekvens',
      'prod-data',
      'deploy',
      'claim-lock',
      'citable_external',
      'Port F',
    ]) {
      assert.ok(log.includes(term), `${term} missing from ${operatorLogPath}`)
    }
  })

  it('is linked from the current Week 25 reader and sender surfaces', () => {
    readOperatorLog()

    for (const path of [
      'docs/project/status/jt-uke25-sendepakke-2026-06-15.md',
      'docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md',
      'docs/project/status/food-tg-start-her-2026-06-15.md',
      'docs/project/mandates/decision-log-food-tg.md',
      'docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md',
    ]) {
      const doc = readFileSync(path, 'utf8')
      assert.ok(doc.includes(operatorLogPath), `${operatorLogPath} missing from ${path}`)
    }
  })
})
