import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildSourceCitationId,
  ensureFieldCitation,
  normalizeRequiredCitation,
  upsertWithCitation,
  validateRequiredCitation,
  type RequiredCitation,
} from '../../scripts/lib/import-helpers'

const baseCitation: RequiredCitation = {
  sourceClass: 'primary',
  citationText: 'Brønnøysundregistrene. Enhetsregisteret API for 987565922.',
  accessedAt: '2026-05-18',
  url: 'https://data.brreg.no/enhetsregisteret/api/enheter/987565922',
  confidence: 95,
}

describe('import citation helpers', () => {
  it('requires a locator for non-internal source classes', () => {
    assert.throws(
      () => validateRequiredCitation({
        sourceClass: 'primary',
        citationText: 'A source without a locator',
        accessedAt: '2026-05-18',
      }),
      /requires at least one locator/,
    )
  })

  it('allows internal constructs without external locators', () => {
    assert.doesNotThrow(() => validateRequiredCitation({
      sourceClass: 'internal_construct',
      citationText: 'Internal research construct for modelling one property branch.',
      accessedAt: '2026-05-18',
    }))
  })

  it('rejects invalid confidence values', () => {
    assert.throws(
      () => validateRequiredCitation({ ...baseCitation, confidence: 101 }),
      /confidence must be an integer from 0 to 100/,
    )
  })

  it('builds stable deterministic citation ids from normalized citation content', () => {
    const first = buildSourceCitationId(baseCitation)
    const second = buildSourceCitationId({
      ...baseCitation,
      citationText: `  ${baseCitation.citationText}  `,
    })
    const differentLocator = buildSourceCitationId({
      ...baseCitation,
      url: 'https://data.brreg.no/enhetsregisteret/api/enheter/999999999',
    })

    assert.equal(first, second)
    assert.notEqual(first, differentLocator)
    assert.match(first, /^cit_[a-f0-9]{32}$/)
  })

  it('normalizes date and optional fields before Prisma writes', () => {
    const normalized = normalizeRequiredCitation({
      ...baseCitation,
      localPath: '  research/evidence-pack/bronnoysund/987565922.json  ',
      verifiedAt: '2026-05-18T10:15:00.000Z',
    })

    assert.equal(normalized.localPath, 'research/evidence-pack/bronnoysund/987565922.json')
    assert.equal(normalized.accessedAt.toISOString(), '2026-05-18T00:00:00.000Z')
    assert.equal(normalized.verifiedAt?.toISOString(), '2026-05-18T10:15:00.000Z')
    assert.equal(normalized.captureMethod, 'manual')
    assert.equal(normalized.verificationStatus, 'unverified')
  })

  it('upserts the entity citation and avoids duplicate field links', async () => {
    const client = makeMemoryCitationClient()
    const entity = { id: 'doc-1', title: 'Imported document' }

    const first = await upsertWithCitation(client, 'Document', async () => entity, baseCitation, 'content')
    const second = await upsertWithCitation(client, 'Document', async () => entity, baseCitation, 'content')

    assert.equal(first, entity)
    assert.equal(second, entity)
    assert.equal(client.sourceCitations.length, 1)
    assert.equal(client.fieldCitations.length, 1)
    assert.equal(client.fieldCitations[0]?.entityType, 'Document')
    assert.equal(client.fieldCitations[0]?.entityId, 'doc-1')
    assert.equal(client.fieldCitations[0]?.fieldPath, 'content')
  })

  it('ensures one field citation for repeated field links', async () => {
    const client = makeMemoryCitationClient()

    await ensureFieldCitation(client, 'cit-1', 'Company', 'company-1', 'registryVerifiedAt')
    await ensureFieldCitation(client, 'cit-1', 'Company', 'company-1', 'registryVerifiedAt')

    assert.equal(client.fieldCitations.length, 1)
    assert.deepEqual(client.fieldCitations[0], {
      id: 'field-1',
      citationId: 'cit-1',
      entityType: 'Company',
      entityId: 'company-1',
      fieldPath: 'registryVerifiedAt',
    })
  })
})

function makeMemoryCitationClient() {
  const sourceCitations: Array<Record<string, unknown>> = []
  const fieldCitations: Array<Record<string, unknown>> = []

  return {
    sourceCitations,
    fieldCitations,
    sourceCitation: {
      async upsert(args: {
        where: { id: string }
        update: Record<string, unknown>
        create: Record<string, unknown>
      }) {
        const existing = sourceCitations.find(row => row.id === args.where.id)
        if (existing) {
          Object.assign(existing, args.update)
          return existing
        }
        const created = { ...args.create }
        sourceCitations.push(created)
        return created
      },
    },
    fieldCitation: {
      async findFirst(args: { where: Record<string, unknown> }) {
        return fieldCitations.find(row => Object.entries(args.where).every(([key, value]) => row[key] === value)) ?? null
      },
      async create(args: { data: Record<string, unknown> }) {
        const created = { id: `field-${fieldCitations.length + 1}`, ...args.data }
        fieldCitations.push(created)
        return created
      },
    },
  }
}
