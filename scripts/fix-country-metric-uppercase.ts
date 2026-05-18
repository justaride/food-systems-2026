/**
 * CountryMetric.country må følge samme DB-konvensjon som Document/Company/
 * AquacultureSite: uppercase ISO ('NO', 'SE', 'DK', 'FI', 'IS', 'Nordic').
 *
 * Pre-fix-state: lokal DB hadde 11 ulike case-varianter blandet sammen for
 * samme metric-kategori (140 'no', 15 'NO', 48 'FI', 25 'fi', 27 'se', 43 'SE',
 * osv.). Sannsynlig årsak: tre forskjellige import-script bruker hver sin
 * konvensjon:
 *   - import-market-metrics.ts: lowercase ('no')
 *   - import-ts-data.ts countryChartData: lowercase keys
 *   - import-ts-data.ts sustainability: uppercase ('NO')
 *
 * Verifisert at det er 0 duplikater på (UPPER(country), metricType, category, year)
 * — så normalisering er trygg uten merge-håndtering. Unique constraint
 * @@unique([country, metricType, category, year]) er case-sensitive i Postgres,
 * så lowercase og uppercase rader for samme metric kan eksistere parallelt.
 *
 * Dette skriptet:
 *   1. Mapper alle lowercase til uppercase ISO ('no'→'NO', 'nordic'→'Nordic' etc.)
 *   2. Idempotent — kan re-kjøres trygt
 *   3. Validerer at ingen ukjente case-varianter er igjen
 *
 * Import-skriptene patches separat (toUpperCase() på country-felt) så
 * re-import ikke re-introduserer bugen.
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
  const before = await prisma.$queryRaw<{ country: string; n: number }[]>`
    SELECT country, COUNT(*)::int AS n FROM "CountryMetric"
    GROUP BY country ORDER BY n DESC`
  console.log('Før:')
  for (const r of before) console.log(`  ${String(r.n).padStart(4)}  '${r.country}'`)

  // Sjekker først at det ikke vil oppstå unique-constraint-konflikter
  const conflicts = await prisma.$queryRaw<{ country_upper: string; metricType: string; category: string; year: string; n: bigint }[]>`
    SELECT UPPER(country) AS country_upper, "metricType", category, year, COUNT(*)::bigint AS n
    FROM "CountryMetric"
    GROUP BY UPPER(country), "metricType", category, year
    HAVING COUNT(*) > 1`
  if (conflicts.length > 0) {
    console.error(`\n⚠ Fant ${conflicts.length} potensielle unique-constraint-konflikter:`)
    for (const c of conflicts.slice(0, 10)) {
      console.error(`  ${c.country_upper} | ${c.metricType} | ${c.category} | ${c.year}: ${c.n} rader`)
    }
    console.error('\nKan ikke trygt normalisere — merge-håndtering trengs.')
    process.exit(1)
  }
  console.log('\n✓ Ingen unique-constraint-konflikter — trygt å normalisere\n')

  let totalUpdated = 0
  for (const [lower, upper] of Object.entries(MAPPING)) {
    const updated = await prisma.countryMetric.updateMany({
      where: { country: lower },
      data: { country: upper },
    })
    if (updated.count > 0) {
      console.log(`  '${lower}' -> '${upper}': ${updated.count} rader`)
      totalUpdated += updated.count
    }
  }

  const after = await prisma.$queryRaw<{ country: string; n: number }[]>`
    SELECT country, COUNT(*)::int AS n FROM "CountryMetric"
    GROUP BY country ORDER BY n DESC`
  console.log(`\nEtter (${totalUpdated} oppdatert):`)
  for (const r of after) console.log(`  ${String(r.n).padStart(4)}  '${r.country}'`)

  const stragglers = await prisma.$queryRaw<{ country: string }[]>`
    SELECT DISTINCT country FROM "CountryMetric"
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
