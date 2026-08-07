import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  ACADEMIC_CLAIM_ANCHOR_PILOT,
  classifyAcademicClaimAnchorState,
  fieldCitationMatchesAcademicClaimAnchor,
  sourceCitationMatchesAcademicClaimAnchor,
  sourceSnapshotMatchesAcademicClaimAnchor,
  validateAcademicClaimAnchorPilot,
  type AcademicClaimAnchorExistingCitation,
  type AcademicClaimAnchorExistingFieldCitation,
} from '../../src/lib/citations/academic-claim-anchor-pilot'

describe('academic claim-anchor pilot', () => {
  it('pins four page-level anchors for the three reviewed SourceDocs', () => {
    const anchors = validateAcademicClaimAnchorPilot()
    assert.equal(anchors.length, 4)
    assert.deepEqual([...new Set(anchors.map(anchor => anchor.source.id))].sort(), ['src-30', 'src-32', 'src-45'])
    assert.equal(new Set(anchors.map(anchor => anchor.citation.id)).size, 4)
    assert.equal(new Set(anchors.map(anchor => anchor.fieldCitation.id)).size, 4)

    const asko = anchors.find(anchor => anchor.source.id === 'src-30')!
    assert.equal(asko.citation.pageRef, 'PDF p. 25')
    assert.equal(asko.citation.fileHash, '94b68068c89e9713e968f3c5ef17ed0f4e74fa57206ea5dd383aac6b44529108')
    assert.match(asko.citation.quote, /95 GWh.*96 prosent/)

    const norsus = anchors.find(anchor => anchor.source.id === 'src-32')!
    assert.equal(norsus.citation.pageRef, 'PDF p. 2')
    assert.equal(norsus.auditArtifactPath, 'tmp/pdfs/norsus-matsvinn-2024.pdf')
    assert.equal(norsus.citation.fileHash, '39523279d3afff6f0f41b5baea04590f2ce6499f2a2518a04fa82b29395c7fcf')
    assert.match(norsus.fieldCitation.claimText, /agriculture is excluded/i)

    const oslo = anchors.filter(anchor => anchor.source.id === 'src-45')
    assert.deepEqual(oslo.map(anchor => anchor.citation.pageRef).sort(), ['PDF p. 2', 'PDF p. 4'])
    assert.ok(oslo.every(anchor => anchor.citation.fileHash === '6155c0f06fea09224f3ec235453af91641aa99302493d97faad0f0c772ccc8de'))
    assert.match(oslo.find(anchor => anchor.citation.pageRef === 'PDF p. 2')!.citation.quote, /Oppdragsgiver: NorgesGruppen/)
  })

  it('keeps the verification and source-role boundary conservative', () => {
    for (const anchor of ACADEMIC_CLAIM_ANCHOR_PILOT) {
      assert.equal(anchor.citation.citationReadiness, 'citable_with_note')
      assert.equal(anchor.citation.verificationStatus, 'machine_verified')
      assert.equal(anchor.citation.verifiedBy, 'codex-visual-pdf-audit-2026-07-19')
      assert.match(anchor.citation.notes, /no human review asserted/)
      assert.ok(anchor.citation.quote.trim().split(/\s+/).length <= 25)
      assert.equal(anchor.source.provenanceType === 'commissioned_report' ? anchor.citation.sourceClass : 'primary', anchor.citation.sourceClass)
    }

    const osloArgument = ACADEMIC_CLAIM_ANCHOR_PILOT.find(
      anchor => anchor.citation.id === 'academic_anchor_src45_argument_p4_v1',
    )!
    assert.match(osloArgument.fieldCitation.claimText, /^Oslo Economics argues/)
    assert.match(osloArgument.citation.notes, /not as an independently established fact/)
  })

  it('classifies absent, partial, exact, and drifted citation states', () => {
    const anchor = ACADEMIC_CLAIM_ANCHOR_PILOT[0]!
    const currentCitation: AcademicClaimAnchorExistingCitation = {
      ...anchor.citation,
      accessedAt: new Date(anchor.citation.accessedAt),
      verifiedAt: new Date(anchor.citation.verifiedAt),
    }
    const currentFieldCitation: AcademicClaimAnchorExistingFieldCitation = {
      ...anchor.fieldCitation,
    }

    assert.equal(classifyAcademicClaimAnchorState(anchor), 'pending')
    assert.equal(classifyAcademicClaimAnchorState(anchor, currentCitation), 'pending')
    assert.equal(classifyAcademicClaimAnchorState(anchor, currentCitation, currentFieldCitation), 'applied')
    assert.equal(classifyAcademicClaimAnchorState(anchor, undefined, currentFieldCitation), 'conflict')
    assert.equal(sourceCitationMatchesAcademicClaimAnchor(anchor, currentCitation), true)
    assert.equal(fieldCitationMatchesAcademicClaimAnchor(anchor, currentFieldCitation), true)

    assert.equal(
      classifyAcademicClaimAnchorState(anchor, { ...currentCitation, quote: 'operator changed quote' }, currentFieldCitation),
      'conflict',
    )
    assert.equal(
      classifyAcademicClaimAnchorState(anchor, currentCitation, { ...currentFieldCitation, claimText: 'operator changed claim' }),
      'conflict',
    )
  })

  it('fails closed when a source snapshot or reviewed policy drifts', () => {
    const anchor = ACADEMIC_CLAIM_ANCHOR_PILOT[0]!
    assert.equal(sourceSnapshotMatchesAcademicClaimAnchor(anchor.source, {
      ...anchor.source,
      accessedAt: new Date(anchor.source.accessedAt),
    }), true)
    assert.equal(sourceSnapshotMatchesAcademicClaimAnchor(anchor.source, {
      ...anchor.source,
      url: 'https://example.test/operator-change',
    }), false)

    const drifted = structuredClone(ACADEMIC_CLAIM_ANCHOR_PILOT)
    ;(drifted[0]!.citation as { citationReadiness: string }).citationReadiness = 'citable_external'
    assert.throws(
      () => validateAcademicClaimAnchorPilot(drifted as typeof ACADEMIC_CLAIM_ANCHOR_PILOT),
      /must remain citable_with_note/,
    )
  })

  it('requires acknowledgement, locked CAS recheck, and Serializable apply', () => {
    const source = readFileSync('scripts/apply-academic-claim-anchor-pilot.ts', 'utf8')
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceDoc" WHERE "id" = \$\{sourceId\} FOR SHARE/)
    assert.match(source, /FROM "SourceCitation" WHERE "id" = \$\{anchor\.citation\.id\} FOR UPDATE/)
    assert.match(source, /FROM "FieldCitation" WHERE "id" = \$\{anchor\.fieldCitation\.id\} FOR UPDATE/)
    assert.match(source, /inspectAcademicClaimAnchorPilot\(transaction, anchors\)/)
    assert.match(source, /Pinned PDF audit artifact SHA-256 mismatch/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /transaction\.sourceCitation\.create/)
    assert.match(source, /transaction\.fieldCitation\.create/)
    assert.doesNotMatch(source, /upsert|updateMany|createMany|deleteMany/)
  })
})
