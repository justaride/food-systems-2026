import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  buildSourceDocProvenanceRepairs,
  classifySourceDocProvenanceRepair,
  sourceDocProvenanceSnapshotMatches,
} from '../../scripts/apply-source-doc-provenance'

describe('reviewed SourceDoc provenance repairs', () => {
  it('pins the reviewed 44-row batch without duplicate ids', () => {
    const repairs = buildSourceDocProvenanceRepairs()
    assert.equal(repairs.length, 44)
    assert.equal(new Set(repairs.map(repair => repair.id)).size, 44)
    assert.equal(repairs.filter(repair => repair.provenanceType === 'internal_primary').length, 12)
    assert.equal(repairs.filter(repair => repair.provenanceType === 'official_primary').length, 13)
    assert.equal(repairs.filter(repair => repair.provenanceType === 'commissioned_report').length, 5)
    assert.equal(repairs.find(repair => repair.id === 'src-28')?.provenanceType, 'commissioned_report')
    assert.deepEqual(repairs.find(repair => repair.id === 'src-28')?.acceptedPriorProvenanceTypes, ['official_primary'])
    assert.equal(repairs.find(repair => repair.id === 'src-45')?.provenanceType, 'commissioned_report')
    assert.equal(repairs.find(repair => repair.id === 'src-88')?.provenanceType, 'external_publication')
    assert.equal(repairs.find(repair => repair.id === 'src-89')?.provenanceType, 'external_publication')
    assert.equal(repairs.find(repair => repair.id === 'src-6')?.provenanceType, 'duplicate')
  })

  it('pins the reviewed SourceDoc identity and rejects drifted bindings', () => {
    const repair = buildSourceDocProvenanceRepairs().find(row => row.id === 'src-38')!
    assert.equal(sourceDocProvenanceSnapshotMatches(repair, {
      filename: repair.filename,
      title: repair.title,
      sourceType: repair.sourceType,
      isDuplicate: repair.isDuplicate,
    }), true)
    assert.equal(sourceDocProvenanceSnapshotMatches(repair, {
      filename: repair.filename,
      title: repair.title,
      sourceType: 'analyse',
      isDuplicate: repair.isDuplicate,
    }), false)
  })

  it('classifies unknown, applied, and conflicting database states', () => {
    const repair = buildSourceDocProvenanceRepairs()[0]!
    assert.equal(classifySourceDocProvenanceRepair(repair, 'unknown'), 'pending')
    assert.equal(classifySourceDocProvenanceRepair(repair, null), 'pending')
    assert.equal(classifySourceDocProvenanceRepair(repair, repair.provenanceType), 'applied')
    assert.equal(classifySourceDocProvenanceRepair(repair, 'official_primary'), repair.provenanceType === 'official_primary' ? 'applied' : 'conflict')
  })

  it('requires acknowledgement, compare-and-swap, and Serializable isolation', () => {
    const source = readFileSync('scripts/apply-source-doc-provenance.ts', 'utf8')
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /sourceDocProvenanceSnapshotMatches/)
    assert.match(source, /acceptedPriorProvenanceTypes/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.doesNotMatch(source, /deleteMany|createMany/)
  })
})
