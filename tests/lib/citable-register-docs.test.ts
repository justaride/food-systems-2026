import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const claimRegister = readFileSync('docs/project/mandates/claim-register-food-tg.md', 'utf8')
const evidenceMatrix = readFileSync('docs/project/mandates/evidence-matrix-food-tg.md', 'utf8')
const nordicCoreSources = readFileSync(
  'docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md',
  'utf8',
)

function claimIdsFromRegister() {
  const claimTablePart = claimRegister.split('## Claim-kategorier')[1] ?? ''
  return Array.from(claimTablePart.matchAll(/^\| (CL-[ABC]-\d{3}) \|/gm), match => match[1])
}

function ledgerRows() {
  const ledgerSection = (claimRegister.split('## External-use decision ledger')[1] ?? '').split(
    '## Claim-kategorier',
  )[0]
  return Array.from(ledgerSection.matchAll(/^\| (CL-[ABC]-\d{3}) \|(.+)$/gm), match => {
    const cells = match[0]
      .split('|')
      .map(cell => cell.trim())
      .filter(Boolean)
    return {
      id: match[1],
      cells,
    }
  })
}

describe('citable register documentation', () => {
  it('gives every formal claim an explicit external-use decision', () => {
    const claimIds = Array.from(new Set(claimIdsFromRegister())).sort()
    const ledger = ledgerRows()
    const ledgerIds = Array.from(new Set(ledger.map(row => row.id))).sort()

    assert.deepEqual(ledgerIds, claimIds)

    for (const row of ledger) {
      assert.equal(row.cells.length, 6)
      assert.match(row.cells[1], /^(citable_external|citable_with_note|internal_context|blocked_unsourced)$/)
      assert.ok(row.cells[2])
      assert.ok(row.cells[3])
      assert.match(row.cells[4], /^(allowed|allowed_with_caveat|internal_only|blocked)$/)
      assert.ok(row.cells[5])
    }
  })

  it('documents evidence-matrix and Nordic-core readiness mappings', () => {
    assert.match(evidenceMatrix, /## External-use normalization/)
    assert.match(evidenceMatrix, /internal synthesis is separated from source evidence/i)
    assert.match(nordicCoreSources, /## External-use normalization/)
    assert.match(nordicCoreSources, /NORDIC-CORE-017.*blocked_unsourced/)
  })
})
