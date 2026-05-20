import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

function modelBlock(schema: string, modelName: string): string {
  const match = schema.match(new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(match, `Missing ${modelName} model`)
  return match[1]
}

function enumBlock(schema: string, enumName: string): string {
  const match = schema.match(new RegExp(`enum ${enumName} \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(match, `Missing ${enumName} enum`)
  return match[1]
}

describe('provenance schema coverage', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')

  for (const modelName of ['Shareholder', 'BoardMember']) {
    it(`${modelName} has row-level source and verification fields`, () => {
      const block = modelBlock(schema, modelName)

      assert.match(block, /\n\s+source\s+String\?/)
      assert.match(block, /\n\s+sourceUrl\s+String\?/)
      assert.match(block, /\n\s+verifiedAt\s+DateTime\?/)
    })
  }

  it('defines citation readiness enums for source citations', () => {
    assert.match(enumBlock(schema, 'SourceClass'), /\bprimary\b/)
    assert.match(enumBlock(schema, 'SourceClass'), /\bsecondary\b/)
    assert.match(enumBlock(schema, 'SourceClass'), /\bdataset\b/)
    assert.match(enumBlock(schema, 'SourceClass'), /\binternal_synthesis\b/)
    assert.match(enumBlock(schema, 'SourceClass'), /\bmedia\b/)
    assert.match(enumBlock(schema, 'SourceClass'), /\bunknown\b/)

    assert.match(enumBlock(schema, 'VerificationStatus'), /\bverified\b/)
    assert.match(enumBlock(schema, 'VerificationStatus'), /\bpartially_verified\b/)
    assert.match(enumBlock(schema, 'VerificationStatus'), /\bneeds_review\b/)
    assert.match(enumBlock(schema, 'VerificationStatus'), /\bfailed\b/)

    assert.match(enumBlock(schema, 'CitationReadiness'), /\bcitable_external\b/)
    assert.match(enumBlock(schema, 'CitationReadiness'), /\bcitable_with_note\b/)
    assert.match(enumBlock(schema, 'CitationReadiness'), /\binternal_context\b/)
    assert.match(enumBlock(schema, 'CitationReadiness'), /\bblocked_unsourced\b/)
  })

  it('defines SourceCitation with locators, readiness, verification, and indexes', () => {
    const block = modelBlock(schema, 'SourceCitation')

    assert.match(block, /\n\s+id\s+String\s+@id\s+@default\(cuid\(\)\)/)
    assert.match(block, /\n\s+sourceClass\s+SourceClass\s+@default\(unknown\)/)
    assert.match(block, /\n\s+citationReadiness\s+CitationReadiness\s+@default\(blocked_unsourced\)/)
    assert.match(block, /\n\s+verificationStatus\s+VerificationStatus\s+@default\(needs_review\)/)
    assert.match(block, /\n\s+citationText\s+String/)
    for (const field of ['url', 'archivedUrl', 'localPath', 'fileHash', 'pageRef', 'quote']) {
      assert.match(block, new RegExp(`\\n\\s+${field}\\s+String\\?`))
    }
    assert.match(block, /\n\s+hashAlgorithm\s+String\s+@default\("sha256"\)/)
    assert.match(block, /\n\s+accessedAt\s+DateTime\?/)
    assert.match(block, /\n\s+verifiedAt\s+DateTime\?/)
    assert.match(block, /\n\s+document\s+Document\?\s+@relation\(fields: \[documentId\], references: \[id\], onDelete: SetNull\)/)
    assert.match(block, /\n\s+sourceDoc\s+SourceDoc\?\s+@relation\(fields: \[sourceDocId\], references: \[id\], onDelete: SetNull\)/)
    assert.match(block, /\n\s+fieldCitations\s+FieldCitation\[\]/)
    for (const index of ['citationReadiness', 'verificationStatus', 'documentId', 'sourceDocId', 'url', 'localPath']) {
      assert.match(block, new RegExp(`@@index\\(\\[${index}\\]\\)`))
    }
  })

  it('defines FieldCitation with field-level uniqueness and indexes', () => {
    const block = modelBlock(schema, 'FieldCitation')

    assert.match(block, /\n\s+id\s+String\s+@id\s+@default\(cuid\(\)\)/)
    assert.match(block, /\n\s+citationId\s+String/)
    assert.match(block, /\n\s+entityType\s+String/)
    assert.match(block, /\n\s+entityId\s+String/)
    assert.match(block, /\n\s+fieldPath\s+String\?/)
    assert.match(block, /\n\s+claimText\s+String\?/)
    assert.match(block, /\n\s+confidence\s+Float\?/)
    assert.match(block, /\n\s+citation\s+SourceCitation\s+@relation\(fields: \[citationId\], references: \[id\], onDelete: Cascade\)/)
    assert.match(block, /@@unique\(\[citationId, entityType, entityId, fieldPath\]\)/)
    assert.match(block, /@@index\(\[entityType, entityId\]\)/)
    assert.match(block, /@@index\(\[fieldPath\]\)/)
  })

  it('exposes sourceCitations from Document and SourceDoc', () => {
    assert.match(modelBlock(schema, 'Document'), /\n\s+sourceCitations\s+SourceCitation\[\]/)
    assert.match(modelBlock(schema, 'SourceDoc'), /\n\s+sourceCitations\s+SourceCitation\[\]/)
  })
})
