/**
 * Beriker Document.year, Document.author og Document.country fra:
 *   1. Cross-table-relasjoner: Thesis, Report, SourceDoc (én-til-én via documentId)
 *   2. Regex-mønster i filePath/slug/title for år (2015-2026)
 *   3. Regex-mønster i filePath/slug/category for land (NO/SE/DK/FI/IS/Nordic/EU)
 *
 * Pre-fix-state (lokal DB):
 *   year:    187/1122 (17%) populated
 *   author:  197/1122 (18%) populated
 *   country: 326/1122 (29%) populated (etter PR #51 normalisering til uppercase)
 *
 * Idempotent: bare oppdater rader hvor feltet er NULL. Eksisterende verdier
 * røres ikke. Trygt å re-kjøre etter nye imports.
 *
 * Country-utvinning forkaster gamle år (<2015) som vanligvis er referanser i
 * tittel, ikke publiseringsdato. SourceDoc.year er String og parses derfor
 * forsiktig (skipper hvis ikke 4-sifret tall).
 */
import { prisma } from '@/lib/db'

const COUNTRY_PATTERNS: Array<{ code: string; regex: RegExp }> = [
  { code: 'Nordic', regex: /(nord(en|isk|ic)|nordisk|five.country|fem.land)/i },
  { code: 'NO',     regex: /(\/norge\/|\/norway\/|(^|\/)no(-|\/|$)|\/nor\/)/i },
  { code: 'SE',     regex: /(\/sverige\/|\/sweden\/|(^|\/)se(-|\/|$)|swed(en|ish))/i },
  { code: 'DK',     regex: /(\/danmark\/|\/denmark\/|(^|\/)dk(-|\/|$))/i },
  { code: 'FI',     regex: /(\/finland\/|(^|\/)fi(-|\/|$))/i },
  { code: 'IS',     regex: /(\/island\/|\/iceland\/|(^|\/)is(-|\/|$))/i },
  { code: 'EU',     regex: /(european.union|\/eu(\/|-)|(^|\/)eu(-|\/|$))/i },
]

const YEAR_PATTERN = /\b(20(1[5-9]|2[0-6]))\b/

function inferCountry(d: { slug: string; filePath: string | null; category: string | null }): string | null {
  const haystack = `${d.slug} ${d.filePath ?? ''} ${d.category ?? ''}`.toLowerCase()
  for (const { code, regex } of COUNTRY_PATTERNS) {
    if (regex.test(haystack)) return code
  }
  return null
}

function inferYear(d: { slug: string; filePath: string | null; title: string }): number | null {
  const haystack = `${d.title} ${d.slug} ${d.filePath ?? ''}`
  const match = haystack.match(YEAR_PATTERN)
  return match ? Number(match[1]) : null
}

type EnrichmentStats = {
  yearFromThesis: number
  yearFromReport: number
  yearFromSource: number
  yearFromRegex: number
  authorFromThesis: number
  authorFromReport: number
  authorFromSource: number
  countryFromRegex: number
}

async function main() {
  const stats: EnrichmentStats = {
    yearFromThesis: 0,
    yearFromReport: 0,
    yearFromSource: 0,
    yearFromRegex: 0,
    authorFromThesis: 0,
    authorFromReport: 0,
    authorFromSource: 0,
    countryFromRegex: 0,
  }

  // ─── Cross-table fra Thesis ─────────────────────────────────────────
  const thesisRows = await prisma.$queryRaw<
    Array<{ docId: string; authors: string; year: number; docAuthor: string | null; docYear: number | null }>
  >`
    SELECT d.id AS "docId", t.authors AS authors, t.year AS year,
           d.author AS "docAuthor", d.year AS "docYear"
    FROM "Document" d
    JOIN "Thesis" t ON t."documentId" = d.id
    WHERE d.author IS NULL OR d.year IS NULL`

  for (const row of thesisRows) {
    const updates: { author?: string; year?: number } = {}
    if (row.docAuthor === null && row.authors) {
      updates.author = row.authors
      stats.authorFromThesis++
    }
    if (row.docYear === null && row.year) {
      updates.year = row.year
      stats.yearFromThesis++
    }
    if (Object.keys(updates).length > 0) {
      await prisma.document.update({ where: { id: row.docId }, data: updates })
    }
  }

  // ─── Cross-table fra Report ────────────────────────────────────────
  const reportRows = await prisma.$queryRaw<
    Array<{ docId: string; author: string | null; year: number | null; docAuthor: string | null; docYear: number | null }>
  >`
    SELECT d.id AS "docId", r.author AS author, r.year AS year,
           d.author AS "docAuthor", d.year AS "docYear"
    FROM "Document" d
    JOIN "Report" r ON r."documentId" = d.id
    WHERE d.author IS NULL OR d.year IS NULL`

  for (const row of reportRows) {
    const updates: { author?: string; year?: number } = {}
    if (row.docAuthor === null && row.author) {
      updates.author = row.author
      stats.authorFromReport++
    }
    if (row.docYear === null && row.year) {
      updates.year = row.year
      stats.yearFromReport++
    }
    if (Object.keys(updates).length > 0) {
      await prisma.document.update({ where: { id: row.docId }, data: updates })
    }
  }

  // ─── Cross-table fra SourceDoc (year er String, må parses) ─────────
  const sourceRows = await prisma.$queryRaw<
    Array<{ docId: string; author: string | null; year: string | null; docAuthor: string | null; docYear: number | null }>
  >`
    SELECT d.id AS "docId", s.author AS author, s.year AS year,
           d.author AS "docAuthor", d.year AS "docYear"
    FROM "Document" d
    JOIN "SourceDoc" s ON s."documentId" = d.id
    WHERE d.author IS NULL OR d.year IS NULL`

  for (const row of sourceRows) {
    const updates: { author?: string; year?: number } = {}
    if (row.docAuthor === null && row.author) {
      updates.author = row.author
      stats.authorFromSource++
    }
    if (row.docYear === null && row.year) {
      // SourceDoc.year er String, ofte 4-sifret men kan ha andre formater
      const parsed = Number(row.year)
      if (Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2030) {
        updates.year = parsed
        stats.yearFromSource++
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.document.update({ where: { id: row.docId }, data: updates })
    }
  }

  // ─── Regex fra filePath/slug/title for year + country ──────────────
  const remaining = await prisma.document.findMany({
    where: {
      OR: [{ year: null }, { country: null }],
    },
    select: {
      id: true,
      slug: true,
      filePath: true,
      title: true,
      category: true,
      year: true,
      country: true,
    },
  })

  for (const d of remaining) {
    const updates: { year?: number; country?: string } = {}

    if (d.year === null) {
      const y = inferYear({ slug: d.slug, filePath: d.filePath, title: d.title })
      if (y !== null) {
        updates.year = y
        stats.yearFromRegex++
      }
    }

    if (d.country === null) {
      const c = inferCountry({ slug: d.slug, filePath: d.filePath, category: d.category })
      if (c !== null) {
        updates.country = c
        stats.countryFromRegex++
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.document.update({ where: { id: d.id }, data: updates })
    }
  }

  // ─── Rapport ───────────────────────────────────────────────────────
  console.log('Berikelse-stats:')
  console.log(`  year fra Thesis:    ${stats.yearFromThesis}`)
  console.log(`  year fra Report:    ${stats.yearFromReport}`)
  console.log(`  year fra SourceDoc: ${stats.yearFromSource}`)
  console.log(`  year fra regex:     ${stats.yearFromRegex}`)
  console.log(`  author fra Thesis:    ${stats.authorFromThesis}`)
  console.log(`  author fra Report:    ${stats.authorFromReport}`)
  console.log(`  author fra SourceDoc: ${stats.authorFromSource}`)
  console.log(`  country fra regex:    ${stats.countryFromRegex}`)

  const totalDocs = await prisma.document.count()
  const withYear = await prisma.document.count({ where: { year: { not: null } } })
  const withAuthor = await prisma.document.count({ where: { author: { not: null } } })
  const withCountry = await prisma.document.count({ where: { country: { not: null } } })
  console.log(`\nEtter berikelse (totalt ${totalDocs} dokumenter):`)
  console.log(`  year:    ${withYear}/${totalDocs} (${(100 * withYear / totalDocs).toFixed(0)}%)`)
  console.log(`  author:  ${withAuthor}/${totalDocs} (${(100 * withAuthor / totalDocs).toFixed(0)}%)`)
  console.log(`  country: ${withCountry}/${totalDocs} (${(100 * withCountry / totalDocs).toFixed(0)}%)`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
