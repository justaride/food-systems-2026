import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

describe('library analysis Prisma schema', () => {
  it('adds LibraryAnalysisRecord as the platform truth layer', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')

    assert.match(schema, /model LibraryAnalysisRecord \{/)
    assert.match(schema, /sourceKind\s+String/)
    assert.match(schema, /sourceKey\s+String/)
    assert.match(schema, /documentId\s+String\?/)
    assert.match(schema, /sourceDocId\s+String\?/)
    assert.match(schema, /canonicalPath\s+String\?/)
    assert.match(schema, /status\s+String\s+@default\("not_started"\)/)
    assert.match(schema, /usageRule\s+String\s+@default\("internal_background"\)/)
    assert.match(schema, /aiCard\s+Json\?/)
    assert.match(schema, /document\s+Document\?\s+@relation\(fields: \[documentId\], references: \[id\], onDelete: SetNull\)/)
    assert.match(schema, /sourceDoc\s+SourceDoc\?\s+@relation\(fields: \[sourceDocId\], references: \[id\], onDelete: SetNull\)/)
    assert.match(schema, /@@unique\(\[sourceKind, sourceKey\]\)/)
  })

  it('links Document and SourceDoc back to library analysis records', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')

    assert.match(schema, /libraryAnalysisRecords\s+LibraryAnalysisRecord\[\]/)
  })

  it('ships a migration for the library analysis table', () => {
    assert.ok(
      existsSync(join(process.cwd(), 'prisma/migrations/20260618_library_analysis_record/migration.sql')),
      'missing LibraryAnalysisRecord migration',
    )
  })
})

function readLibraryAnalysisRunModel(): string {
  const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
  const match = schema.match(/model LibraryAnalysisRun \{[\s\S]*?\n\}/)
  assert.ok(match, 'missing model LibraryAnalysisRun')
  return match[0]
}

function readLibraryAnalysisRunMigration(): string {
  const path = join(process.cwd(), 'prisma/migrations/20260819_library_analysis_run/migration.sql')
  assert.ok(existsSync(path), 'missing LibraryAnalysisRun migration')
  return readFileSync(path, 'utf8')
}

describe('library analysis run history', () => {
  it('keeps machine output separate from the authority axes', () => {
    const model = readLibraryAnalysisRunModel()

    assert.match(model, /runId\s+String/)
    assert.match(model, /aiModel\s+String/)
    assert.match(model, /promptVersion\s+String/)
    assert.match(model, /payloadHash\s+String/)
    assert.match(model, /aiCard\s+Json\?/)
    assert.match(model, /claimCandidates\s+Json\?/)

    // Review and publication status belong to LibraryAnalysisRecord. A run row
    // is machine output and must never carry its own authority.
    for (const authorityField of ['reviewStatus', 'reviewer', 'reviewedAt', 'usageRule', 'citationReadiness']) {
      assert.doesNotMatch(
        model,
        new RegExp(`\\b${authorityField}\\b`),
        `LibraryAnalysisRun must not carry the authority field ${authorityField}`,
      )
    }
  })

  it('allows many runs per source and rejects a duplicate source within one run', () => {
    const model = readLibraryAnalysisRunModel()

    // The whole point of the table: one analysis per source was the old limit.
    assert.doesNotMatch(
      model,
      /@@unique\(\[sourceKind, sourceKey\]\)/,
      'LibraryAnalysisRun must not be unique on (sourceKind, sourceKey) — many runs per source is the point',
    )
    assert.match(model, /@@unique\(\[sourceKind, sourceKey, runId\]\)/)
  })

  it('lets the current-view record point at the run it reflects', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')

    assert.match(schema, /currentRunId\s+String\?/)
    assert.match(schema, /currentRun\s+LibraryAnalysisRun\?\s+@relation\(fields: \[currentRunId\], references: \[id\], onDelete: SetNull\)/)
    assert.match(schema, /libraryAnalysisRuns\s+LibraryAnalysisRun\[\]/)
  })

  it('enforces append-only history in the migration', () => {
    const migration = readLibraryAnalysisRunMigration()

    assert.match(migration, /CREATE OR REPLACE FUNCTION public\.reject_library_analysis_run_change\(\)/)
    assert.match(migration, /REVOKE ALL ON FUNCTION public\.reject_library_analysis_run_change\(\) FROM PUBLIC/)
    assert.match(
      migration,
      /CREATE TRIGGER "LibraryAnalysisRun_reject_update_delete"\s*\nBEFORE UPDATE OR DELETE ON "LibraryAnalysisRun"/,
    )
    assert.match(
      migration,
      /CREATE TRIGGER "LibraryAnalysisRun_reject_truncate"\s*\nBEFORE TRUNCATE ON "LibraryAnalysisRun"/,
    )
  })

  it('does not reintroduce the one-analysis-per-source index in SQL', () => {
    const migration = readLibraryAnalysisRunMigration()

    assert.doesNotMatch(
      migration,
      /CREATE UNIQUE INDEX[^;]*ON "LibraryAnalysisRun"\("sourceKind", "sourceKey"\)/,
      'a unique index on (sourceKind, sourceKey) would restore the overwrite behaviour this table exists to remove',
    )
    assert.match(
      migration,
      /CREATE UNIQUE INDEX IF NOT EXISTS "LibraryAnalysisRun_sourceKind_sourceKey_runId_key"/,
    )
  })
})
