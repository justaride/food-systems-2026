/** Replay the migration on temporary tables from a read-only production export. Always rolls back. */
import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { Pool } from 'pg'
import { financialAmountToNok } from '../src/lib/queries/financial-units'
async function main() {
const snapshot = process.argv[2], output = process.argv[3]
if (!snapshot || !output) throw new Error('Usage: tsx scripts/verify-financial-storage-migration.ts snapshot.json report.json')
const raw = readFileSync(snapshot), data = JSON.parse(raw.toString())
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('CREATE TEMP TABLE "Company" (id text, "orgNr" text) ON COMMIT DROP')
  await client.query('CREATE TEMP TABLE "CompanyFinancial" (LIKE public."CompanyFinancial") ON COMMIT DROP')
  await client.query('ALTER TABLE pg_temp."CompanyFinancial" DROP COLUMN IF EXISTS "amountCurrency"')
  const columns = (await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='CompanyFinancial' AND column_name <> 'amountCurrency' ORDER BY ordinal_position")).rows.map(r => `"${r.column_name}"`).join(', ')
  await client.query('INSERT INTO pg_temp."Company" SELECT DISTINCT x."companyId", x."orgNr" FROM jsonb_to_recordset($1::jsonb) x("companyId" text, "orgNr" text)', [JSON.stringify(data.rows)])
  await client.query(`INSERT INTO pg_temp."CompanyFinancial" (${columns}) SELECT ${columns} FROM jsonb_populate_recordset(NULL::pg_temp."CompanyFinancial", $1::jsonb)`, [JSON.stringify(data.rows)])
  const amountsHash = async () => (await client.query(`SELECT md5(string_agg((to_jsonb(f) - 'amountCurrency' - 'unitScale')::text, '' ORDER BY id)) AS hash FROM pg_temp."CompanyFinancial" f`)).rows[0].hash
  const before = await amountsHash()
  await client.query(readFileSync('prisma/migrations/20260908183000_explicit_financial_storage/migration.sql', 'utf8'))
  const after = await amountsHash()
  if (before !== after) throw new Error('Source amounts or authority changed')
  const rows = (await client.query('SELECT c."orgNr", f.* FROM pg_temp."CompanyFinancial" f JOIN pg_temp."Company" c ON c.id = f."companyId" ORDER BY c."orgNr", f.year')).rows
  const probes = ['SE-556542-5353', '815664582', '989278835'].map(orgNr => {
    const f = rows.filter(r => r.orgNr === orgNr).at(-1)!
    return { orgNr, year: f.year, scale: f.unitScale, amountCurrency: f.amountCurrency, revenueNok: financialAmountToNok(f.revenueNok, f) }
  })
  if (probes[0].revenueNok !== 94397690000 || probes[1].revenueNok !== 579000000 || probes[2].revenueNok !== 736000000) throw new Error('Regression probe mismatch')
  const mixed = rows.find(r => r.orgNr === '929975200' && r.year === 2024)
  if (mixed && financialAmountToNok(mixed.operatingResult, mixed) !== null) throw new Error('Mixed storage row was guessed')
  const report = { snapshotSha256: createHash('sha256').update(raw).digest('hex'), mode: 'temporary-tables-rollback', sourceAndAuthorityHashBefore: before, sourceAndAuthorityHashAfter: after,
    rowCount: rows.length, annotated: rows.filter(r => r.amountCurrency === 'NOK').length,
    unknown: rows.filter(r => !r.amountCurrency).map(r => ({ orgNr: r.orgNr, year: r.year, revenue: r.revenueNok, operatingResult: r.operatingResult, source: r.source })), probes }
  writeFileSync(output, JSON.stringify(report, null, 2)+'\n')
  console.log(JSON.stringify({ rows: rows.length, annotated: report.annotated, unknown: report.unknown.length, amountsAndAuthorityUnchanged: true, probes }))
} finally { await client.query('ROLLBACK'); client.release(); await pool.end() }

}
main().catch(error => { console.error(error); process.exitCode = 1 })
