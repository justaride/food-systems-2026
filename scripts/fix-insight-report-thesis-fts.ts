/**
 * Insight/Report/Thesis search_vector har samme bug som Document hadde
 * (fikset i fix-document-fts-generated.ts): kolonnen er en regulær nullable
 * tsvector istedenfor GENERATED ALWAYS AS ... STORED. Resultat: FTS-spørringer
 * i ftsInsightSearch/ftsThesisSearch returnerer 0 treff på /sok-siden.
 *
 * Dette skriptet dropper og re-skaper search_vector som GENERATED for hver
 * av de tre tabellene. Generation-uttrykkene matcher de i scripts/add-postgres-fts.sql.
 * Idempotent — sjekker is_generated før det dropper.
 *
 * IMMUTABLE-wrappers (immutable_to_tsvector_no, immutable_array_to_string)
 * antas allerede å finnes via fix-document-fts-generated.ts. Kjør den først
 * hvis ikke. Dette skriptet sikrer dem også for trygghet.
 */
import { prisma } from '@/lib/db'

type FtsTableConfig = {
  table: 'Insight' | 'Report' | 'Thesis'
  expression: string
}

const TABLES: FtsTableConfig[] = [
  {
    table: 'Insight',
    expression: `
      setweight(immutable_to_tsvector_no(title), 'A') ||
      setweight(immutable_to_tsvector_no(description), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
    `,
  },
  {
    table: 'Report',
    expression: `
      setweight(immutable_to_tsvector_no(title), 'A') ||
      setweight(immutable_to_tsvector_no("fullTitle"), 'A') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string(recommendations)), 'B') ||
      setweight(immutable_to_tsvector_no(relevance), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
    `,
  },
  {
    table: 'Thesis',
    expression: `
      setweight(immutable_to_tsvector_no(title), 'A') ||
      setweight(immutable_to_tsvector_no("titleNo"), 'A') ||
      setweight(immutable_to_tsvector_no(synthesis), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string("keyFindings")), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string(takeaways)), 'B') ||
      setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B')
    `,
  },
]

async function getColumnStatus(table: string, column: string): Promise<{ has_col: boolean; is_generated: string | null }> {
  const rows = await prisma.$queryRawUnsafe<{ is_generated: string }[]>(
    `SELECT is_generated FROM information_schema.columns
     WHERE table_name = '${table}' AND column_name = '${column}'`,
  )
  if (rows.length === 0) return { has_col: false, is_generated: null }
  return { has_col: true, is_generated: rows[0].is_generated }
}

async function ensureWrappers() {
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
}

async function fixTable(cfg: FtsTableConfig): Promise<void> {
  const status = await getColumnStatus(cfg.table, 'search_vector')
  console.log(`\n[${cfg.table}] search_vector: ${status.has_col ? `finnes (is_generated=${status.is_generated})` : 'mangler'}`)

  if (status.has_col && status.is_generated === 'NEVER') {
    console.log(`  → dropper regulær kolonne og re-skaper som GENERATED`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "${cfg.table}" DROP COLUMN search_vector`)
  }

  if (!status.has_col || status.is_generated !== 'ALWAYS') {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "${cfg.table}"
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          ${cfg.expression}
        ) STORED
    `)
    console.log(`  ✓ search_vector lagt til som GENERATED ALWAYS AS ... STORED`)
  } else {
    console.log(`  ✓ allerede GENERATED — ingen endring`)
  }

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "${cfg.table}_search_vector_idx" ON "${cfg.table}" USING GIN (search_vector)`,
  )
  console.log(`  ✓ GIN-indeks på plass`)

  const stats = await prisma.$queryRawUnsafe<{ populated: bigint; total: bigint }[]>(
    `SELECT COUNT(*) FILTER (WHERE search_vector IS NOT NULL)::bigint AS populated,
            COUNT(*)::bigint AS total
     FROM "${cfg.table}"`,
  )
  console.log(`  search_vector populated: ${stats[0].populated}/${stats[0].total}`)
}

async function main() {
  await ensureWrappers()
  console.log('✓ IMMUTABLE-wrappers på plass')

  for (const cfg of TABLES) {
    await fixTable(cfg)
  }

  console.log('\n=== Verifisering med sample-spørringer ===')
  for (const term of ['matsvinn', 'soya', 'EUDR']) {
    const ins = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT COUNT(*)::bigint AS n FROM "Insight" WHERE search_vector @@ websearch_to_tsquery('norwegian', $1)`,
      term,
    )
    const rep = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT COUNT(*)::bigint AS n FROM "Report" WHERE search_vector @@ websearch_to_tsquery('norwegian', $1)`,
      term,
    )
    const the = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT COUNT(*)::bigint AS n FROM "Thesis" WHERE search_vector @@ websearch_to_tsquery('norwegian', $1)`,
      term,
    )
    console.log(`  '${term}': Insight=${ins[0].n}  Report=${rep[0].n}  Thesis=${the[0].n}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
