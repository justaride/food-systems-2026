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
