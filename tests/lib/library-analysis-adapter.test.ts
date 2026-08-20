import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  acceptLibraryAnalysisCard,
  toLibraryAnalysisRunFromCard,
  type LibraryAnalysisRequest,
} from '../../src/lib/library-analysis-adapter'
import type { LibraryAiCard } from '../../src/lib/library-analysis'

const request: LibraryAnalysisRequest = {
  sourceKind: 'document',
  sourceKey: 'document:doc-melk-1',
  title: 'Melkeverdikjeden 2026',
  canonicalPath: 'research/bibliotek/melk.md',
  documentId: 'doc-melk-1',
  sourceDocId: 'src-42',
  contentHash: 'a'.repeat(64),
  wordCount: 1200,
  text: 'Norsk melkeproduksjon falt 3 prosent i 2025.',
}

function card(overrides: Partial<LibraryAiCard> = {}): LibraryAiCard {
  return {
    shortSummary: 'Rapporten beskriver fall i norsk melkeproduksjon.',
    keyFindings: ['Melkeproduksjonen falt i 2025'],
    claimCandidates: [{
      text: 'Norsk melkeproduksjon falt 3 prosent i 2025',
      evidence: 'Norsk melkeproduksjon falt 3 prosent i 2025.',
      sourcePath: 'research/bibliotek/melk.md',
      pageRef: 's. 12',
    }],
    projectImplication: 'Underlag for volumanalysen i melkekjeden.',
    gaps: [],
    citationStatus: 'citable_internal',
    recommendedUsageRule: 'safe_for_ai_context',
    status: 'ai_draft',
    controlLinks: [{ label: 'Kilde', href: 'research/bibliotek/melk.md' }],
    riskFlags: [],
    ...overrides,
  }
}

const runOptions = {
  runId: '2026-08-19T19:00:00.000Z-aaaabbbb',
  aiModel: 'claude-opus-5',
  promptVersion: 'library-analysis-v1',
}

describe('library analysis adapter gate', () => {
  it('accepts a grounded model card', () => {
    const result = acceptLibraryAnalysisCard(request, card())
    assert.equal(result.accepted, true, JSON.stringify(result))
  })

  it('rejects a claim that states evidence but gives no locator', () => {
    const result = acceptLibraryAnalysisCard(request, card({
      claimCandidates: [{
        text: 'Melkeproduksjonen falt',
        evidence: 'Rapporten sier det.',
      }],
    }))

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('claim_0_missing_locator'))
  })

  it('rejects a claim with a locator but no stated evidence', () => {
    const result = acceptLibraryAnalysisCard(request, card({
      claimCandidates: [{
        text: 'Melkeproduksjonen falt',
        pageRef: 's. 12',
      }],
    }))

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('claim_0_missing_evidence'))
  })

  it('rejects a locator that points at a different source', () => {
    const result = acceptLibraryAnalysisCard(request, card({
      claimCandidates: [{
        text: 'Melkeproduksjonen falt',
        evidence: 'Norsk melkeproduksjon falt 3 prosent i 2025.',
        sourcePath: 'research/bibliotek/en-helt-annen-fil.md',
      }],
    }))

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('claim_0_locator_points_outside_source'))
  })

  it('rejects claims on a source with no database link', () => {
    const unlinked = { ...request, documentId: null, sourceDocId: null }
    const result = acceptLibraryAnalysisCard(unlinked, card())

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('claims_require_a_linked_source'))
  })

  it('accepts an unlinked source that makes no claims', () => {
    const unlinked = { ...request, documentId: null, sourceDocId: null }
    const result = acceptLibraryAnalysisCard(unlinked, card({ claimCandidates: [] }))

    assert.equal(result.accepted, true, JSON.stringify(result))
  })

  it('refuses to let a model award itself external claim authority', () => {
    const result = acceptLibraryAnalysisCard(request, card({
      recommendedUsageRule: 'safe_for_external_claims',
    }))

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('external_usage_requires_human_approval'))
  })

  it('still applies the shared card contract', () => {
    const result = acceptLibraryAnalysisCard(request, card({ controlLinks: [] }))

    assert.equal(result.accepted, false)
    assert.ok(result.accepted === false && result.issues.includes('missing_control_links'))
  })

  it('rejects anything that is not a card object', () => {
    for (const notACard of [null, 'analysis', 42, ['a']]) {
      const result = acceptLibraryAnalysisCard(request, notACard)
      assert.equal(result.accepted, false)
      assert.ok(result.accepted === false && result.issues.includes('card_not_an_object'))
    }
  })
})

describe('library analysis adapter run payload', () => {
  it('records the model identity and the analysed bytes', () => {
    const run = toLibraryAnalysisRunFromCard(request, card(), runOptions)

    assert.equal(run.sourceKey, request.sourceKey)
    assert.equal(run.sourceDocId, request.sourceDocId)
    assert.equal(run.contentHash, request.contentHash)
    assert.equal(run.aiModel, 'claude-opus-5')
    assert.equal(run.promptVersion, 'library-analysis-v1')
    assert.equal(run.analysisTier, 'model_analysis')
    assert.match(run.payloadHash, /^[0-9a-f]{64}$/)
  })

  it('never carries review or publication authority', () => {
    const run = toLibraryAnalysisRunFromCard(request, card(), runOptions)

    for (const authorityField of ['usageRule', 'reviewStatus', 'reviewer', 'reviewedAt', 'citationReadiness']) {
      assert.equal(Object.hasOwn(run, authorityField), false, `a run row must not carry ${authorityField}`)
    }
  })

  it('gives two different analyses different payload hashes', () => {
    const first = toLibraryAnalysisRunFromCard(request, card(), runOptions)
    const second = toLibraryAnalysisRunFromCard(
      request,
      card({ shortSummary: 'En annen konklusjon.' }),
      runOptions,
    )

    assert.notEqual(first.payloadHash, second.payloadHash)
  })
})
