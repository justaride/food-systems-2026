import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  evidenceDigest, compilePilot, questionAnswer, planImpact,
  writeRelease, readCurrent, type PilotInput,
} from '../../scripts/knowledge/source-linked-pilot'

const day = '2026-09-15'
const compilerHash = 'a'.repeat(64)
function fixture(): PilotInput {
  const input: PilotInput = {
    version: 1, status: 'internal_candidate', humanVerified: false,
    canonicalPromoted: false, publicationApproved: false, coveragePromoted: false,
    sources: [{ id: 's1', title: 'Synthetic test source', publisher: 'Test',
      url: 'https://example.org/test', publishedAt: '2025-01-01',
      sourceClass: 'primary', verificationStatus: 'unverified', citationText: 'Test fixture (2025).',
      accessedAt: day, recheckAfter: '2026-10-01', access: 'opened',
      rawContentSha256: null, archiveStatus: 'not_captured',
      note: 'Synthetic fixture, not empirical evidence.' }],
    evidence: [{ id: 'e1', sourceId: 's1', kind: 'observation', geography: 'NO',
      period: '2024', unit: 'percent_revenue_share', locator: 'test paragraph',
      values: { A: 43.5, B: 29.2, C: 23.9, D: 3.3 },
      note: 'Rounded shares; do not normalise.' }],
    claims: [{ id: 'c1', status: 'candidate', kind: 'calculation',
      text: 'HHI {{hhi}}; CR3 {{cr3}}%.', evidence: [], dependsOn: [],
      calculation: { kind: 'concentration', evidenceId: 'e1' },
      limits: 'Structure, not causal attribution.' },
      { id: 'c2', status: 'candidate', kind: 'inference', text: 'Bounded interpretation.',
        evidence: [], dependsOn: ['c1'], limits: 'No causal inference.' }],
    gaps: [{ id: 'g1', question: 'What is current stock?', missing: 'Dated inventory.',
      route: 'source_lookup', nextEvidence: 'A current inventory observation.',
      owner: null, searchBoundary: 'Synthetic fixture only.', checkedAt: day }],
    topics: [{ id: 'test', title: 'Test topic', scope: 'Synthetic test.',
      claimIds: ['c1', 'c2'], gapIds: ['g1'] }],
    questions: [{ id: 'q1', question: 'What does the test show?', topicId: 'test',
      claimIds: ['c1'], gapIds: [], requirements: [] }],
  }
  input.claims[0].evidence = [{ id: 'e1', digest: evidenceDigest(input, 'e1') }]
  return input
}
const build = (i = fixture(), date = day) => compilePilot(i, date, compilerHash)

test('derives HHI and CR3 from rounded shares without renormalising', () => {
  const b = build()
  assert.match(b.claims[0].text ?? '', /3327/)
  assert.match(b.claims[0].text ?? '', /96\.6%/)
  assert.equal(b.claims[0].state, 'candidate_linked')
})
test('same inputs create byte-identical content-addressed releases', () => {
  assert.deepEqual(build(), build())
})
test('changed evidence invalidates the claim AND its dependent interpretation', () => {
  const i = fixture(); i.evidence[0].values.A = 40
  const b = build(i)
  assert.equal(b.claims[0].state, 'blocked')
  assert.equal(b.claims[1].state, 'blocked')
  assert.doesNotMatch(b.pages['test.md'], /HHI 3327/)
  assert.equal(questionAnswer(b, 'q1', 'internal').status, 'blocked')
})
test('changed source metadata also invalidates bound evidence', () => {
  const i = fixture(); i.sources[0].url = 'https://example.org/revised'
  assert.equal(build(i).claims[0].state, 'blocked')
})
test('explicitly rebound candidate recomputes instead of reusing stale numbers', () => {
  const i = fixture(); i.evidence[0].values = { A: 40, B: 30, C: 25, D: 5 }
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  const b = build(i)
  assert.match(b.claims[0].text ?? '', /3150/)
  assert.match(b.claims[0].text ?? '', /95%/)
  assert.equal(b.status, 'internal_candidate')
})
test('withdrawn sources block output even if a new binding is supplied', () => {
  const i = fixture(); i.sources[0].access = 'withdrawn'
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  assert.equal(build(i).claims[0].state, 'blocked')
})
test('missing values remain unknown, not zero', () => {
  const i = fixture(); i.evidence[0].values.A = null
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  assert.equal(build(i).claims[0].state, 'blocked')
})
test('store counts cannot feed a revenue-share calculation', () => {
  const i = fixture(); i.evidence[0].unit = 'stores'
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  assert.equal(build(i).claims[0].state, 'blocked')
})
test('impossible shares are blocked', () => {
  const i = fixture(); i.evidence[0].values.A = 70
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  assert.equal(build(i).claims[0].state, 'blocked')
})
test('a review deadline produces a visible stale status, not a new validation date', () => {
  const b = build(fixture(), '2026-10-02')
  assert.equal(b.claims[0].state, 'stale')
  assert.equal(b.claims[1].state, 'stale')
  assert.equal(questionAnswer(b, 'q1', 'internal').status, 'blocked')
})
test('targets cannot answer observation questions', () => {
  const i = fixture(); i.evidence[0].kind = 'target'
  i.claims[0].kind = 'source_report'; delete i.claims[0].calculation
  i.claims[0].text = 'Target: {{e1.A}}.'
  i.claims[0].evidence[0].digest = evidenceDigest(i, 'e1')
  i.questions[0].requirements = [{ evidenceId: 'e1', kind: 'observation', period: '2024' }]
  assert.equal(questionAnswer(build(i), 'q1', 'internal').status, 'unknown')
})
test('a historical observation cannot silently become a current inventory', () => {
  const i = fixture()
  i.questions[0].requirements = [{ evidenceId: 'e1', kind: 'observation', period: day }]
  const q = questionAnswer(build(i), 'q1', 'internal')
  assert.equal(q.status, 'unknown')
  assert.match(q.reasons.join(' '), /period/)
})
test('all external answers are blocked, even when the arithmetic is correct', () => {
  const q = questionAnswer(build(), 'q1', 'external')
  assert.equal(q.status, 'blocked')
  assert.deepEqual(q.claims, [])
})
test('unsupported question returns unknown instead of guessing', () => {
  assert.equal(questionAnswer(build(), 'not-a-question', 'internal').status, 'unknown')
})
test('cycles, duplicates and missing dependencies fail validation', () => {
  let i = fixture(); i.claims[0].dependsOn = ['c2']; assert.throws(() => build(i), /cycle/)
  i = fixture(); i.claims.push(i.claims[0]); assert.throws(() => build(i), /duplicate/)
  i = fixture(); i.claims[1].dependsOn = ['absent']; assert.throws(() => build(i), /missing/)
})
test('unbound placeholders and unverifiable source claims are rejected', () => {
  let i = fixture(); i.claims[0].text = '{{other.number}}'; assert.throws(() => build(i), /placeholder/)
  i = fixture(); i.claims[0].evidence = []; assert.throws(() => build(i), /evidence/)
})
test('authority upgrades, bad dates, traversal and unsafe URLs fail closed', () => {
  let i = fixture(); (i as unknown as Record<string, unknown>).humanVerified = true
  assert.throws(() => build(i), /authority/)
  i = fixture(); i.topics[0].id = '../escape'; assert.throws(() => build(i), /identifier/)
  i = fixture(); i.sources[0].url = 'javascript:alert(1)'; assert.throws(() => build(i), /URL/)
  i = fixture(); i.sources[0].accessedAt = '2026-02-31'; assert.throws(() => build(i), /date/)
  assert.throws(() => build(fixture(), '2026-09-14'), /future/)
})
test('impact plan follows transitive dependencies to topic AND question', () => {
  const before = fixture(), after = fixture(); after.evidence[0].values.A = 41
  const p = planImpact(before, after)
  assert.deepEqual(p.claimIds, ['c1', 'c2'])
  assert.deepEqual(p.topicIds, ['test'])
  assert.deepEqual(p.questionIds, ['q1'])
})
test('release writer is idempotent, retains history, and detects tampering and stale inputs', () => {
  const root = mkdtempSync(join(tmpdir(), 'fs-wiki-test-'))
  try {
    const i = fixture(), b = build(i)
    writeRelease(root, b); writeRelease(root, b)
    assert.equal(readCurrent(root, i, day, compilerHash).releaseId, b.releaseId)
    const old = readFileSync(join(root, 'releases', b.releaseId, 'test.md'), 'utf8')
    const next = fixture(); next.claims[1].text = 'Changed interpretation.'
    assert.throws(() => readCurrent(root, next, day, compilerHash), /stale/)
    const b2 = build(next); writeRelease(root, b2)
    assert.equal(readFileSync(join(root, 'releases', b.releaseId, 'test.md'), 'utf8'), old)
    writeFileSync(join(root, 'releases', b2.releaseId, 'test.md'), 'tampered')
    assert.throws(() => readCurrent(root, next, day, compilerHash), /integrity/)
    assert.throws(() => writeRelease(root, b2), /integrity/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
test('notes outside the generated release are never overwritten', () => {
  const root = mkdtempSync(join(tmpdir(), 'fs-wiki-notes-'))
  try {
    writeFileSync(join(root, 'notes.md'), 'Human-owned\r\nKeep these bytes.\n')
    writeRelease(root, build())
    assert.equal(readFileSync(join(root, 'notes.md'), 'utf8'), 'Human-owned\r\nKeep these bytes.\n')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('historical and disputed claims never answer a current question', () => {
  for (const status of ['historical', 'disputed'] as const) {
    const i = fixture(); i.claims[0].status = status
    const b = build(i)
    assert.equal(questionAnswer(b, 'q1', 'internal').status, 'blocked')
    assert.equal(b.claims[1].state, 'blocked')
    assert.doesNotMatch(b.pages['test.md'], /HHI 3327/)
  }
})
test('an unrelated observation cannot satisfy a question boundary', () => {
  const i = fixture()
  i.evidence.push({ ...i.evidence[0], id: 'unrelated' })
  i.questions[0].requirements = [{ evidenceId: 'unrelated', kind: 'observation', period: '2024' }]
  assert.throws(() => build(i), /unrelated/)
})
test('an inferred answer inherits the scope of its transitive evidence', () => {
  const i = fixture()
  i.questions[0].claimIds = ['c2']
  i.questions[0].requirements = [{ evidenceId: 'e1', kind: 'observation', period: '2024' }]
  assert.equal(questionAnswer(build(i), 'q1', 'internal').status, 'candidate_linked')
})
test('compiler and evaluation-date changes invalidate cached releases', () => {
  const root = mkdtempSync(join(tmpdir(), 'fs-wiki-version-'))
  try {
    writeRelease(root, build())
    assert.throws(() => readCurrent(root, fixture(), day, 'b'.repeat(64)), /stale/)
    assert.throws(() => readCurrent(root, fixture(), '2026-09-16', compilerHash), /stale/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
test('real pilot routes every registered question to its explicit answer boundary', () => {
  const i = JSON.parse(readFileSync(join(process.cwd(), 'knowledge/pilots/source-linked-v1/input.v1.json'), 'utf8')) as PilotInput
  const b = build(i)
  const expected: Record<string, string> = {
    'retail-hhi': 'candidate_linked', 'retail-scope': 'candidate_linked',
    'retail-causality': 'candidate_linked', 'retail-2026': 'unknown',
    'grain-target': 'candidate_linked', 'grain-contracts': 'candidate_linked',
    'grain-stock-2024': 'candidate_linked', 'grain-stock-2025': 'blocked',
    'grain-current-stock': 'unknown', 'grain-target-as-stock': 'unknown',
    'grain-governance': 'candidate_linked', 'grain-chain': 'partial',
    'grain-people': 'partial', 'grain-days': 'unknown',
    'grain-release': 'unknown', 'grain-countercase': 'partial',
  }
  assert.equal(i.questions.length, Object.keys(expected).length)
  for (const [id, status] of Object.entries(expected)) {
    assert.equal(questionAnswer(b, id, 'internal').status, status, id)
    assert.equal(questionAnswer(b, id, 'external').status, 'blocked', id)
  }
  assert.match(questionAnswer(b, 'retail-hhi', 'internal').claims[0].text ?? '', /3327.*96\.6/)
  assert.match(questionAnswer(b, 'grain-target', 'internal').claims[0].text ?? '', /82500.*2029/)
  assert.equal(b.claims.find(c => c.id === 'grain-2025-pending')?.text, null)
})
test('a real target revision affects chain interpretation, not the unrelated retail topic', () => {
  const i = JSON.parse(readFileSync(join(process.cwd(), 'knowledge/pilots/source-linked-v1/input.v1.json'), 'utf8')) as PilotInput
  const after = structuredClone(i)
  after.evidence.find(e => e.id === 'grain-target')!.values.tonnes = 99999
  const p = planImpact(i, after), b = build(after)
  assert.ok(p.topicIds.includes('grain-to-meals'))
  assert.ok(!p.topicIds.includes('norway-retail-2024'))
  assert.equal(questionAnswer(b, 'grain-target', 'internal').status, 'blocked')
  assert.equal(questionAnswer(b, 'retail-hhi', 'internal').status, 'candidate_linked')
})
