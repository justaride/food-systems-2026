/** Read-only production/local follow-up inventory. Run with DATABASE_URL; prints no credentials or source text. */
import { createHash } from 'node:crypto'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
const hash = value => createHash('sha256').update(value).digest('hex')
const rows = async sql => (await client.query(sql)).rows
try {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const financials = await rows('SELECT c."orgNr", c.name, f.* FROM "CompanyFinancial" f JOIN "Company" c ON c.id=f."companyId" ORDER BY f.id')
  const financialProtectedHash = hash(JSON.stringify(financials.map(({ unitScale, amountCurrency, ...protectedFields }) => protectedFields)))
  const classifications = await rows('SELECT r.*, d.content AS "inputContent", d.summary AS "inputSummary" FROM "LibraryAnalysisRecord" r LEFT JOIN "Document" d ON d.id=r."documentId" ORDER BY r.id')
  const classificationProtectedHash = hash(JSON.stringify(classifications.map(({ inputContent, inputSummary, ...record }) => record)))
  const populationInputs = classifications.map(r => {
    const content = r.inputContent ?? ''
    const sourceVersion = [r.inputSummary, content].filter(Boolean).join('\n\n')
    const readable = content.length > 0
    const valid = r.contentHash === null || r.contentHash === hash(sourceVersion)
    return { sourceKind: r.sourceKind, sourceKey: r.sourceKey, title: r.title,
      status: r.status, reviewStatus: r.reviewStatus, usageRule: r.usageRule, riskFlags: r.riskFlags,
      sourceVersionHash: readable && valid ? hash(sourceVersion) : null,
      contentHash: readable && valid ? hash(content) : null,
      inputKind: readable ? 'database_record' : 'none',
      locator: r.documentId ? `database:Document:${r.documentId}:content` : null,
      readableInput: readable, storedHashMatches: valid,
      identityConfidence: r.sourceKind === 'document' && r.sourceKey === `document:${r.documentId}` ? 'exact' : r.documentId ? 'provisional' : 'unresolved',
      superseded: r.status.toLowerCase() === 'superseded' }
  })
  const candidateCounts = {}
  for (const table of ['CandidateContentUnit', 'CandidateAnalysisRun', 'CandidateAnalysisArtifact', 'CandidateAssertion', 'CandidateHumanReviewDecision', 'CandidatePromotionDecision']) {
    candidateCounts[table] = (await rows(`SELECT COUNT(*)::int total FROM "${table}"`))[0].total
  }
  const output = { checkedAt: new Date().toISOString(), readOnly: true, financialProtectedHash, classificationProtectedHash, financials, populationInputs, candidateCounts,
    semantic: { hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()), ...(await rows('SELECT COUNT(*)::int total, COUNT(embedding)::int embedded FROM "Document"'))[0] },
    deliveries: await rows('SELECT commodity, year, "buyerVerification", COUNT(*)::int total, COUNT("buyerId")::int "withBuyer", COUNT("buyerSourceUrl")::int "withBuyerSource" FROM "DeliveryVolume" GROUP BY commodity, year, "buyerVerification" ORDER BY commodity, year'),
    nordic: await rows('SELECT * FROM "NordicIndicatorRow" ORDER BY "cellId", country, "indicatorId", year'),
    flows: await rows('SELECT * FROM "FlowCell" ORDER BY "cellId", country, year, "fromNode", "toNode"'),
    actorFollowups: await rows(`SELECT id, slug, name, "priorityTier", owner, "nextStep", "specificAsk", "lastVerifiedAt" FROM "Actor" WHERE "priorityTier"='p1' OR NULLIF(trim("specificAsk"),'') IS NOT NULL ORDER BY id`),
    migrations: await rows('SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at'),
  }
  await client.query('ROLLBACK')
  process.stdout.write(JSON.stringify(output, null, 2) + '\n')
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('Follow-up inventory failed:', error.code ?? error.name)
  process.exitCode = 1
} finally { client.release(); await pool.end() }
