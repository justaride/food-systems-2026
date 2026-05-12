// Kjører prod-side migrasjoner: FTS-skjema, country-normalisering,
// okologisk-norden imports, insight-doc-curation. Idempotent — trygt å
// kjøre flere ganger.
//
// Designet for å kjøre fra Docker build-stage som siste ledd etter
// `prisma db push`, så prod-DB blir konsistent med kode-forventningene.
//
// Krever DATABASE_URL og at psql + tsx er tilgjengelig (vi installerer
// postgresql-client i alpine via Dockerfile-endring).

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
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

  // 1. FTS-skjema (idempotent via IF NOT EXISTS)
  runSql('scripts/add-postgres-fts.sql', 'FTS schema (tsvector + GIN)')

  // 2. Country/documentType normalisering (idempotent — UPDATE-statements
  //    som ikke gjør noe hvis allerede normalisert)
  runSql('scripts/normalize-document-categories.sql', 'Country/documentType normalisering')

  // 3. Okologisk-norden imports (idempotent via slug+filePath UNIQUE constraints)
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

  // 4. Insight-doc-koblinger (apply curated CSV)
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
