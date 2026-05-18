/**
 * `Document.search_vector` ble lagt til som GENERATED ALWAYS AS ... STORED via
 * scripts/add-postgres-fts.sql (2026-05-11), men en senere `prisma db push`
 * droppet kolonnen og re-skapte den som en regulær nullable tsvector — uten
 * GENERATED-uttrykk. Resultat: alle 1122 rader har search_vector = NULL, så
 * Postgres-FTS-spørringene i src/lib/queries/search.ts returnerer 0 treff og
 * /bibliotek FTS-modus virker uten å vise noen dokumenter.
 *
 * Dette skriptet:
 *  1. Sikrer at IMMUTABLE-wrapper-funksjonene finnes (idempotent)
 *  2. Dropper Document.search_vector hvis den finnes som ikke-generated
 *  3. Legger til kolonnen på nytt som GENERATED ALWAYS AS ... STORED
 *  4. Gjenoppretter GIN-indeksen
 *
 * Idempotent — kan re-kjøres trygt. Sjekker is_generated før det dropper.
 *
 * Sjekker også Insight/Report/Thesis og advarer hvis samme bug har rammet dem.
 */
import { prisma } from '@/lib/db'

type GenInfo = { is_generated: 'ALWAYS' | 'NEVER' | null; has_col: boolean }

async function getColumnStatus(table: string, column: string): Promise<GenInfo> {
  const rows = await prisma.$queryRawUnsafe<{ is_generated: string }[]>(
    `SELECT is_generated FROM information_schema.columns
     WHERE table_name = '${table}' AND column_name = '${column}'`,
  )
  if (rows.length === 0) return { is_generated: null, has_col: false }
  return { is_generated: rows[0].is_generated as 'ALWAYS' | 'NEVER', has_col: true }
}

async function main() {
  // Steg 1: immutable wrappers (samme som i add-postgres-fts.sql)
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION immutable_to_tsvector_no(text)
    RETURNS tsvector AS $$
      SELECT to_tsvector('norwegian'::regconfig, COALESCE($1, ''));
    $$ LANGUAGE SQL IMMUTABLE
  `)
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION immutable_array_to_string(text[])
    RETURNS text AS $$
      SELECT COALESCE(array_to_string($1, ' '), '');
    $$ LANGUAGE SQL IMMUTABLE
  `)
  console.log('✓ IMMUTABLE-wrappers på plass')

  // Steg 2: sjekk og fiks Document.search_vector
  const docStatus = await getColumnStatus('Document', 'search_vector')
  console.log(`Document.search_vector: ${docStatus.has_col ? `finnes (is_generated=${docStatus.is_generated})` : 'mangler'}`)

  if (docStatus.has_col && docStatus.is_generated === 'NEVER') {
    console.log('  → dropper regulær kolonne og re-skaper som GENERATED')
    await prisma.$executeRawUnsafe(`ALTER TABLE "Document" DROP COLUMN search_vector`)
  }

  if (!docStatus.has_col || docStatus.is_generated !== 'ALWAYS') {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Document"
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(immutable_to_tsvector_no(title), 'A') ||
          setweight(immutable_to_tsvector_no(summary), 'B') ||
          setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B') ||
          setweight(immutable_to_tsvector_no(content), 'C')
        ) STORED
    `)
    console.log('  ✓ Document.search_vector lagt til som GENERATED ALWAYS AS ... STORED')
  } else {
    console.log('  ✓ allerede GENERATED — ingen endring')
  }

  // Steg 3: gjenopprett indeks
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Document_search_vector_idx" ON "Document" USING GIN (search_vector)`,
  )
  console.log('✓ GIN-indeks på plass')

  // Verifisering
  const populated = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "Document" WHERE search_vector IS NOT NULL`
  const total = await prisma.document.count()
  console.log(`\nVerifisering: search_vector populated for ${populated[0].n}/${total} Document-rader`)

  const r = await prisma.$queryRaw<{ title: string }[]>`
    SELECT title FROM "Document" WHERE search_vector @@ websearch_to_tsquery('norwegian', 'soya') LIMIT 5`
  console.log(`FTS-treff for "soya": ${r.length}`)
  for (const d of r) console.log(`  - ${d.title.slice(0, 80)}`)

  // Sjekker også de andre tabellene — bare advarsel, ikke fix her
  for (const table of ['Insight', 'Report', 'Thesis']) {
    const s = await getColumnStatus(table, 'search_vector')
    if (!s.has_col) {
      console.warn(`\n⚠ ${table}.search_vector mangler helt — kjør scripts/add-postgres-fts.sql`)
    } else if (s.is_generated === 'NEVER') {
      console.warn(`\n⚠ ${table}.search_vector er ikke GENERATED — samme bug. Trenger egen fix.`)
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
