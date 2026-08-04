import assert from 'node:assert/strict'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { after, before, describe, it } from 'node:test'

import {
  RECEIPT_SCHEMA_PATH,
  ROLE_QUEUE_PATH,
  makeRoleReceipt,
  queueRowSha256,
  validateRoleReceipt,
  validateRoleReceiptLog,
  writeRoleReceiptTemplates,
  type QueueRow,
  type RoleClassificationReceipt,
} from '../../scripts/knowledge/corpus-role-classification-receipts'

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url))
let fixtureRoot = ''

function writeQueue(rows: QueueRow[]) {
  const queuePath = resolve(fixtureRoot, ROLE_QUEUE_PATH)
  mkdirSync(dirname(queuePath), { recursive: true })
  writeFileSync(queuePath, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`)
}

function row(identityKey: string, provisionalRole: QueueRow['provisionalRole'] = 'primary_evidence'): QueueRow {
  return {
    identityKey,
    canonicalPath: `research/source-${identityKey.slice(-6)}.md`,
    classificationStatus: 'machine_rule_provisional',
    decisionReceiptRequired: true,
    ownerConfirmed: false,
    provisionalRole,
    queueId: `corpus-role.${identityKey.slice(-12)}`,
    reasons: ['fixture row has a provisional role requiring a receipt'],
    requiredDecision: 'confirm or correct the provisional corpus source role and issue an owner role-classification receipt',
    resolved: false,
    ruleId: 'fixture',
    sourceKind: 'document',
    title: 'Fixture source',
  }
}

function receipt(
  queueRow: QueueRow,
  overrides: Partial<Omit<RoleClassificationReceipt, 'contentHash' | 'identityKey' | 'previousRole' | 'queueRowSha256'>> = {},
): RoleClassificationReceipt {
  return makeRoleReceipt({
    documentType: 'corpus_role_classification_receipt',
    schemaVersion: '1.0.0',
    receiptId: `role_receipt.corpus.2026-08-04.${queueRow.identityKey.replace(/[^a-z0-9]+/g, '-')}`,
    queuePath: ROLE_QUEUE_PATH,
    identityKey: queueRow.identityKey,
    previousRole: queueRow.provisionalRole,
    proposedRole: 'internal_synthesis',
    queueRowSha256: queueRowSha256(queueRow),
    decidedBy: 'ai',
    decidedByDetail: { agentId: 'fixture-agent-1' },
    decidedAt: '2026-08-04T08:00:00.000Z',
    confidence: 'high',
    reasoning: 'The source content is project synthesis rather than external primary evidence.',
    policyVersion: '2026-08-04',
    ...overrides,
  })
}

before(() => {
  fixtureRoot = mkdtempSync(resolve(tmpdir(), 'corpus-role-receipts-'))
  const schemaTarget = resolve(fixtureRoot, RECEIPT_SCHEMA_PATH)
  mkdirSync(dirname(schemaTarget), { recursive: true })
  copyFileSync(resolve(sourceRoot, RECEIPT_SCHEMA_PATH), schemaTarget)
})

after(() => rmSync(fixtureRoot, { recursive: true, force: true }))

describe('corpus role-classification receipts', () => {
  it('accepts a high-confidence AI downgrade out of primary_evidence', () => {
    const source = row('document:fixture001')
    writeQueue([source])
    assert.equal(validateRoleReceipt(fixtureRoot, receipt(source)).identityKey, source.identityKey)
  })

  it('rejects an AI move into primary_evidence', () => {
    const source = row('document:fixture002', 'internal_synthesis')
    writeQueue([source])
    assert.throws(
      () => validateRoleReceipt(fixtureRoot, receipt(source, { proposedRole: 'primary_evidence' })),
      /ROLE_ASYMMETRY_VIOLATION/,
    )
  })

  it('requires three unanimous preserved panel votes', () => {
    const source = row('document:fixture003', 'unknown')
    writeQueue([source])
    const panel = receipt(source, {
      decidedBy: 'ai_panel',
      decidedByDetail: {
        unanimous: true,
        votes: [
          { agentId: 'panel-a', proposedRole: 'primary_evidence', reasoning: 'The captured source is an external publication.' },
          { agentId: 'panel-b', proposedRole: 'internal_synthesis', reasoning: 'The captured source is an external publication.' },
          { agentId: 'panel-c', proposedRole: 'internal_synthesis', reasoning: 'The captured source is an external publication.' },
        ],
      },
      proposedRole: 'internal_synthesis',
      confidence: 'medium',
    })
    assert.throws(() => validateRoleReceipt(fixtureRoot, panel), /PANEL_DISAGREEMENT/)
  })

  it('rejects unknown identities, invalid roles, and missing reasoning', () => {
    const source = row('document:fixture004')
    writeQueue([source])
    assert.throws(() => validateRoleReceipt(fixtureRoot, receipt({ ...source, identityKey: 'document:unknown' })), /UNKNOWN_IDENTITY/)
    assert.throws(() => validateRoleReceipt(fixtureRoot, receipt(source, { proposedRole: 'not-a-role' as never })), /SCHEMA_INVALID/)
    assert.throws(() => validateRoleReceipt(fixtureRoot, receipt(source, { reasoning: 'too short' })), /SCHEMA_INVALID/)
  })

  it('rejects queue drift through the row hash', () => {
    const source = row('document:fixture005')
    writeQueue([source])
    const decision = receipt(source)
    writeQueue([{ ...source, title: 'Changed after decision' }])
    assert.throws(() => validateRoleReceipt(fixtureRoot, decision), /QUEUE_ROW_DRIFT/)
  })

  it('validates a database-free bulk batch of 268 receipts', () => {
    const rows = Array.from({ length: 268 }, (_, index) => row(`document:bulk${String(index).padStart(3, '0')}`))
    writeQueue(rows)
    const receipts = rows.map((source) => receipt(source))
    assert.equal(validateRoleReceiptLog(fixtureRoot, receipts).length, 268)
  })

  it('writes templates without writing decisions or receipts', () => {
    const source = row('document:fixture006')
    writeQueue([source])
    const written = writeRoleReceiptTemplates(fixtureRoot)
    const template = JSON.parse(readFileSync(resolve(fixtureRoot, written), 'utf8')) as { rows: unknown[] }
    assert.equal(template.rows.length, 1)
    assert.equal(existsSync(resolve(fixtureRoot, 'knowledge/corpus/corpus-role-classification-receipts.v1.jsonl')), false)
  })
})
