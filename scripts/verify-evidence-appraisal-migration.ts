import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { Client } from 'pg'

const MIGRATION_PATHS = [
  'prisma/migrations/20260719_zz_evidence_appraisal/migration.sql',
  'prisma/migrations/20260719_zzz_evidence_appraisal_quality_contract/migration.sql',
] as const

function migrationBody(path: string) {
  const source = readFileSync(path, 'utf8')
  const transactionStatements = [...source.matchAll(/^\s*(BEGIN|COMMIT);\s*$/gmu)]
  if (
    transactionStatements.length !== 2
    || transactionStatements[0]?.[1] !== 'BEGIN'
    || transactionStatements[1]?.[1] !== 'COMMIT'
  ) {
    throw new Error('EvidenceAppraisal migration transaction wrapper was not recognized')
  }
  const beginEnd = (transactionStatements[0]?.index ?? 0) + transactionStatements[0]![0].length
  const commitStart = transactionStatements[1]?.index ?? source.length
  return source.slice(beginEnd, commitStart)
}

async function expectConstraintFailure(
  client: Client,
  label: string,
  sql: string,
  values: unknown[] = [],
) {
  await client.query('SAVEPOINT expected_constraint_failure')
  try {
    await client.query(sql, values)
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT expected_constraint_failure')
    await client.query('RELEASE SAVEPOINT expected_constraint_failure')
    return
  }
  await client.query('ROLLBACK TO SAVEPOINT expected_constraint_failure')
  await client.query('RELEASE SAVEPOINT expected_constraint_failure')
  throw new Error(`Expected constraint failure was accepted: ${label}`)
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const schema = `evidence_appraisal_verify_${randomBytes(8).toString('hex')}`
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET LOCAL search_path TO "${schema}", pg_catalog`)
    await client.query(`
      CREATE TABLE "Report" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Thesis" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "SourceDoc" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "SourceCitation" ("id" TEXT PRIMARY KEY);
      INSERT INTO "Report" ("id") VALUES ('report-1');
      INSERT INTO "Thesis" ("id") VALUES ('thesis-1');
      INSERT INTO "SourceDoc" ("id") VALUES ('source-1');
      INSERT INTO "SourceCitation" ("id") VALUES ('citation-1');
    `)
    for (const path of MIGRATION_PATHS) await client.query(migrationBody(path))

    const now = new Date('2026-07-19T20:00:00.000Z')
    const hash = 'a'.repeat(64)
    await client.query(`
      INSERT INTO "EvidenceAppraisal" (
        "id", "sourceDocId", "status", "basis", "studyDesign",
        "methodologySummary", "sampleOrCoverage", "applicability",
        "applicabilityContext", "limitationsStatus", "limitations", "riskOfBias",
        "riskOfBiasNotes",
        "framework", "frameworkVersion", "reviewMethod",
        "reviewBasisCitationId", "reviewedSourceHash", "hashAlgorithm",
        "reviewedBy", "reviewedAt", "updatedAt"
      ) VALUES (
        $1, $2, 'reviewed', 'peer_reviewed', 'observational',
        'Reviewed method and data-collection approach', 'Six supermarkets',
        'direct', 'Nordic retail food waste', 'identified', ARRAY['limited geography'], 'low',
        'Low risk after review of sampling, measurement, and reporting choices',
        'FS2026 evidence appraisal', '1', 'full_text',
        $3, $4, 'sha256', $5, $6, $6
      )
    `, ['valid-source-appraisal', 'source-1', 'citation-1', hash, 'Named reviewer', now])

    await expectConstraintFailure(client, 'zero targets', `
      INSERT INTO "EvidenceAppraisal" ("id", "status", "updatedAt")
      VALUES ('zero-targets', 'draft', $1)
    `, [now])
    await expectConstraintFailure(client, 'multiple targets', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "reportId", "thesisId", "status", "updatedAt"
      ) VALUES ('multiple-targets', 'report-1', 'thesis-1', 'draft', $1)
    `, [now])
    await expectConstraintFailure(client, 'reviewed without structured fields', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "reportId", "status", "reviewedAt", "updatedAt"
      ) VALUES ('incomplete-review', 'report-1', 'reviewed', $1, $1)
    `, [now])
    await expectConstraintFailure(client, 'draft with reviewed timestamp', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "reportId", "status", "reviewedAt", "updatedAt"
      ) VALUES ('reviewed-draft', 'report-1', 'draft', $1, $1)
    `, [now])
    await expectConstraintFailure(client, 'reviewed without methodology summary', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "reportId", "status", "basis", "studyDesign",
        "sampleOrCoverage", "applicability", "applicabilityContext",
        "limitationsStatus", "limitations", "riskOfBias", "riskOfBiasNotes",
        "framework", "frameworkVersion", "reviewMethod",
        "reviewBasisCitationId", "reviewedSourceHash", "hashAlgorithm",
        "reviewedBy", "reviewedAt", "updatedAt"
      ) VALUES (
        'missing-method-summary', 'report-1', 'reviewed', 'official_primary',
        'descriptive_document', 'Complete publication', 'direct', 'Norwegian policy',
        'identified', ARRAY['Source-specific limitation'], 'low',
        'Low risk after review of source role and reporting choices',
        'FS2026 evidence appraisal', '1', 'full_text', 'citation-1', $1,
        'sha256', 'Named reviewer', $2, $2
      )
    `, [hash, now])
    await expectConstraintFailure(client, 'reviewed without risk-of-bias reasoning', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "reportId", "status", "basis", "studyDesign",
        "methodologySummary", "sampleOrCoverage", "applicability", "applicabilityContext",
        "limitationsStatus", "limitations", "riskOfBias",
        "framework", "frameworkVersion", "reviewMethod",
        "reviewBasisCitationId", "reviewedSourceHash", "hashAlgorithm",
        "reviewedBy", "reviewedAt", "updatedAt"
      ) VALUES (
        'missing-bias-reasoning', 'report-1', 'reviewed', 'official_primary',
        'descriptive_document', 'Reviewed method', 'Complete publication',
        'direct', 'Norwegian policy', 'identified', ARRAY['Source-specific limitation'], 'low',
        'FS2026 evidence appraisal', '1', 'full_text', 'citation-1', $1,
        'sha256', 'Named reviewer', $2, $2
      )
    `, [hash, now])
    await expectConstraintFailure(client, 'reviewed identified limitations without item', `
      INSERT INTO "EvidenceAppraisal" (
        "id", "thesisId", "status", "basis", "studyDesign",
        "methodologySummary", "sampleOrCoverage", "applicability",
        "applicabilityContext", "limitationsStatus", "limitations", "riskOfBias",
        "riskOfBiasNotes",
        "framework", "frameworkVersion", "reviewMethod",
        "reviewBasisCitationId", "reviewedSourceHash", "hashAlgorithm",
        "reviewedBy", "reviewedAt", "updatedAt"
      ) VALUES (
        'empty-limitations', 'thesis-1', 'reviewed', 'formally_examined_thesis',
        'qualitative', 'Reviewed method', 'Complete thesis', 'direct', 'Norwegian context',
        'identified', ARRAY[]::TEXT[], 'low', 'Low risk after full-text review',
        'FS2026 evidence appraisal', '1', 'full_text', 'citation-1', $1,
        'sha256', 'Named reviewer', $2, $2
      )
    `, [hash, now])
    await expectConstraintFailure(client, 'restricted target delete', `
      DELETE FROM "SourceDoc" WHERE "id" = 'source-1'
    `)

    const result = await client.query<{ count: string }>(`
      SELECT COUNT(*)::TEXT AS count FROM "EvidenceAppraisal"
    `)
    if (result.rows[0]?.count !== '1') {
      throw new Error('EvidenceAppraisal migration verification did not preserve the valid row')
    }

    await client.query('ROLLBACK')
    console.log('EvidenceAppraisal migration transaction drill: PASS (1 valid row, 8 rejected invalid operations, rollback complete)')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'EvidenceAppraisal migration verification failed')
  process.exitCode = 1
})
