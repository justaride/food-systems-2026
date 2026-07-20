import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { sources } from '../../prisma/seed-data/sources'
import { theses } from '../../prisma/seed-data/theses'
import { accessMetadataUpdateGuardReason } from '../../src/lib/citations/import-access-metadata-preservation'
import { REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS } from '../../src/lib/citations/reviewed-source-doc-identity-repair'
import { REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS } from '../../scripts/repair-reviewed-source-doc-access-dates'

describe('bulk TypeScript import metadata preservation', () => {
  const source = readFileSync('scripts/import-ts-data.ts', 'utf8')

  it('keeps reviewed seed pairs out of the existing-row locator update path', () => {
    assert.equal(
      accessMetadataUpdateGuardReason({ seedAccessDate: '2026-07-20' }),
      'seed_reviewed_locator_access_pair',
    )
    assert.equal(
      accessMetadataUpdateGuardReason({ seedAccessDate: undefined }),
      null,
    )
    assert.equal(
      accessMetadataUpdateGuardReason({ seedAccessDate: '  ' }),
      null,
    )
  })

  it('does not overwrite curated SourceDoc provenance or access dates on update', () => {
    const sourceDocBlock = source
      .split('async function importSources()')[1]
      ?.split('async function importInsights()')[0]
    assert.ok(sourceDocBlock)
    const updateBlock = sourceDocBlock
      .split('update: {')[1]
      ?.split('create: {')[0]
    assert.ok(updateBlock)
    assert.doesNotMatch(updateBlock, /provenanceType:/)
    assert.doesNotMatch(updateBlock, /accessedAt:/)
    assert.doesNotMatch(updateBlock, /\burl:/)
    assert.doesNotMatch(updateBlock, /archivedUrl:/)
    assert.match(source, /provenanceType: s\.provenanceType \?\? 'unknown'/)
    assert.match(source, /accessedAt: optionalSeedDate\(s\.accessedAt\)/)
  })

  it('keeps reviewed SourceDoc locator/access pairs behind the pinned runners on update', () => {
    const reviewedIds = sources
      .filter((row) => row.accessedAt === '2026-07-20')
      .map((row) => row.id)
      .sort()
    const expectedIds = [
      ...REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.map((row) => row.id),
      ...REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
    ].sort()

    assert.equal(REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.length, 48)
    assert.equal(REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length, 3)
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS
        .map((row) => row.id)
        .filter((id) => REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
          id as (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number],
        )),
      [],
    )
    assert.deepEqual(reviewedIds, expectedIds)
    assert.doesNotMatch(source, /prisma\.sourceDoc\.findUnique\(/)
    assert.match(source, /guardedSeedAccessMetadata[\s\S]*seedAccessDate: s\.accessedAt/)
    assert.match(source, /prisma\.sourceDoc\.updateMany\(\{[\s\S]*where: \{ id: s\.id, accessedAt: null \}[\s\S]*url: s\.url \?\? null/)
    assert.match(
      source,
      /url: s\.url \?\? null,[\s\S]*accessedAt: optionalSeedDate\(s\.accessedAt\)/,
    )
  })

  it('preserves all 78 reviewed Thesis locator/access pairs on update while keeping create values', () => {
    assert.equal(theses.filter((row) => row.accessDate != null).length, 78)
    assert.equal(
      theses.filter((row) => row.accessDate === '2026-07-19').length,
      2,
    )
    assert.equal(
      theses.filter((row) => row.accessDate === '2026-07-20').length,
      76,
    )
    assert.doesNotMatch(source, /prisma\.thesis\.findUnique\(/)
    assert.match(source, /guardedSeedAccessMetadata[\s\S]*seedAccessDate: t\.accessDate/)
    assert.match(source, /prisma\.thesis\.updateMany\(\{[\s\S]*where: \{ id: t\.id, accessDate: null \}[\s\S]*data: \{ url: t\.url \}/)
    assert.match(
      source,
      /url: t\.url,[\s\S]*accessDate: t\.accessDate \?\? null/,
    )
    assert.doesNotMatch(source, /thesis\.(?:delete|deleteMany)\(/)
  })

  it('does not erase curated Report provenance or access dates when omitted from seed', () => {
    const reportImport = source.slice(
      source.indexOf('async function importReports()'),
      source.indexOf('async function importCountryMetrics()'),
    )
    const reportUpdate = reportImport.slice(
      reportImport.indexOf('update: {'),
      reportImport.indexOf('create: {'),
    )
    assert.doesNotMatch(reportUpdate, /provenanceType:/)
    assert.doesNotMatch(reportUpdate, /accessedAt:/)
    assert.doesNotMatch(source, /prisma\.report\.findUnique\(/)
    assert.match(source, /guardedSeedAccessMetadata[\s\S]*seedAccessDate: r\.accessedAt/)
    assert.match(source, /prisma\.report\.updateMany\(\{[\s\S]*where: \{ id: r\.id, accessedAt: null \}[\s\S]*data: \{ sourceUrl: r\.sourceUrl \?\? null \}/)
    assert.match(source, /provenanceType: r\.provenanceType \?\? null/)
    assert.match(source, /accessedAt: optionalSeedDate\(r\.accessedAt\)/)
  })
})
