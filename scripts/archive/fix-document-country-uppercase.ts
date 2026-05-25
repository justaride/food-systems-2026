/**
 * Document.country må følge DB-canonical uppercase ISO ('NO', 'SE', 'DK', 'FI',
 * 'IS', 'Nordic', 'EU') — samme konvensjon som Company, AquacultureSite og
 * mappingen i src/lib/queries/documents.ts (DOC_COUNTRY_DB_VALUE).
 *
 * Pre-fix-state hadde alle 326 Document.country-rader i lowercase, så
 * getPolicyDocumentsByCountry returnerte 0 dokumenter per land. Dette skriptet
 * er idempotent og kan re-kjøres trygt.
 */
import { prisma } from '@/lib/db'

const MAPPING: Record<string, string> = {
  no: 'NO',
  se: 'SE',
  dk: 'DK',
  fi: 'FI',
  is: 'IS',
  eu: 'EU',
  nordic: 'Nordic',
}

async function main() {
  const before = await prisma.$queryRaw<{ country: string | null; n: number }[]>`
    SELECT country, COUNT(*)::int AS n FROM "Document"
    WHERE country IS NOT NULL GROUP BY country ORDER BY n DESC`
  console.log('Før:')
  for (const r of before) console.log(`  ${String(r.n).padStart(4)}  '${r.country}'`)

  let totalUpdated = 0
  for (const [lower, upper] of Object.entries(MAPPING)) {
    const updated = await prisma.document.updateMany({
      where: { country: lower },
      data: { country: upper },
    })
    if (updated.count > 0) {
      console.log(`  '${lower}' -> '${upper}': ${updated.count} rader`)
      totalUpdated += updated.count
    }
  }

  const after = await prisma.$queryRaw<{ country: string | null; n: number }[]>`
    SELECT country, COUNT(*)::int AS n FROM "Document"
    WHERE country IS NOT NULL GROUP BY country ORDER BY n DESC`
  console.log(`\nEtter (${totalUpdated} oppdatert):`)
  for (const r of after) console.log(`  ${String(r.n).padStart(4)}  '${r.country}'`)

  const stragglers = await prisma.$queryRaw<{ country: string }[]>`
    SELECT DISTINCT country FROM "Document"
    WHERE country IS NOT NULL AND country !~ '^[A-Z]'`
  if (stragglers.length > 0) {
    console.warn('\nFANT UKJENTE LOWERCASE-VERDIER (ikke i mapping):')
    for (const r of stragglers) console.warn(`  '${r.country}'`)
    process.exit(1)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
