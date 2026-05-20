// Manuelt full-sync-verktøy: Prisma-skjemamigrasjoner, FTS-skjema,
// country-normalisering, okologisk-norden imports, insight-doc-curation.
// Idempotent — trygt å kjøre flere ganger.
//
// MERK: Dette skriptet er IKKE deploy-hooken. Skjemasynk på deploy gjøres av
// scripts/apply-prod-migrations.sh (ren psql, Coolify post_deployment_command),
// fordi Next.js standalone-runner-imaget ikke kan laste Prisma-klienten.
// Kjør dette skriptet manuelt fra et fullt dev-miljø (DATABASE_URL satt) når
// du også vil ta data-importene, ikke bare skjemaet.

import { execSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const REPO = process.cwd()

function runSql(file: string, description: string): void {
  const path = join(REPO, file)
  if (!existsSync(path)) {
    console.log(`[migrate] SKIP ${description}: ${file} ikke funnet`)
    return
  }
  console.log(`[migrate] ${description} — psql -f ${file}`)
  try {
    execSync(`psql "${process.env.DATABASE_URL}" -v ON_ERROR_STOP=1 -f "${path}"`, {
      stdio: 'inherit',
    })
    console.log(`[migrate] OK ${description}`)
  } catch (e) {
    console.error(`[migrate] FAIL ${description}: ${(e as Error).message}`)
    throw e
  }
}

// Applies every prisma/migrations/*/migration.sql in lexical order. The
// project does not run `prisma migrate deploy` / `prisma db push` on deploy
// (db push is incompatible with the STORED GENERATED search_vector columns),
// so without this step schema changes never reach production. Every committed
// migration is authored idempotently (IF NOT EXISTS / guarded DO-blocks), so
// re-applying the full set on each deploy is safe.
function runPrismaMigrations(): void {
  const migrationsDir = join(REPO, 'prisma', 'migrations')
  if (!existsSync(migrationsDir)) {
    console.log('[migrate] SKIP Prisma migrations: prisma/migrations ikke funnet')
    return
  }
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  for (const dir of dirs) {
    const rel = join('prisma', 'migrations', dir, 'migration.sql')
    if (!existsSync(join(REPO, rel))) {
      console.log(`[migrate] SKIP ${dir}: migration.sql mangler`)
      continue
    }
    runSql(rel, `Prisma-migrasjon ${dir}`)
  }
}

async function checkAlreadyImported(filename: string): Promise<boolean> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT count(*) as count FROM "Document" WHERE "filePath" LIKE $1`,
      `%${filename}%`,
    )
    return Number(result[0]?.count ?? 0n) > 0
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[migrate] DATABASE_URL not set — skipping migrations')
    return
  }

  console.log('[migrate] Starting prod migrations…')

  // 1. Prisma-skjemamigrasjoner (idempotente — bringer prod-DB i sync med
  //    schema.prisma; uten dette mangler nye tabeller/kolonner i prod)
  runPrismaMigrations()

  // 2. FTS-skjema (idempotent via IF NOT EXISTS)
  runSql('scripts/add-postgres-fts.sql', 'FTS schema (tsvector + GIN)')

  // 3. Country/documentType normalisering (idempotent — UPDATE-statements
  //    som ikke gjør noe hvis allerede normalisert)
  runSql('scripts/normalize-document-categories.sql', 'Country/documentType normalisering')

  // 4. Okologisk-norden imports (idempotent via slug+filePath UNIQUE constraints)
  const alreadyImported = await checkAlreadyImported('okologisk-norden-2026-04-29')
  if (alreadyImported) {
    console.log('[migrate] SKIP okologisk-norden import (allerede importert)')
  } else {
    console.log('[migrate] Importerer okologisk-norden evidence-pack…')
    try {
      execSync('npx tsx scripts/import-okologisk-norden-evidence.ts', {
        stdio: 'inherit',
        cwd: REPO,
      })
    } catch (e) {
      console.error('[migrate] FAIL okologisk-norden:', (e as Error).message)
      // Ikke fail bygget — fortsett til neste migrasjon
    }
  }

  // 5. Insight-doc-koblinger (apply curated CSV)
  const csvPath = join(REPO, 'research/_status/insight-link-candidates-v3-2026-05-11.csv')
  if (existsSync(csvPath)) {
    console.log('[migrate] Applying insight-doc-koblinger…')
    try {
      execSync('npx tsx scripts/apply-insight-links-v3.ts', {
        stdio: 'inherit',
        cwd: REPO,
      })
    } catch (e) {
      console.error('[migrate] FAIL insight-links:', (e as Error).message)
    }
  } else {
    console.log('[migrate] SKIP insight-doc-koblinger (CSV mangler)')
  }

  console.log('[migrate] Done.')
}

main().catch((e) => {
  console.error('[migrate] FATAL:', e)
  // Returner exit 0 så Docker build ikke faller — log advarsel
  process.exit(0)
})
