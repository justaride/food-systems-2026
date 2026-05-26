import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const FORETAK_URL =
  'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/foretak/dataset_extended.csv'

// Stable text used to find-or-create the SourceCitation. Must match the one
// in scripts/backfill-producer-primary-citation.ts.
const REGISTRY_CITATION_TEXT =
  'Landbruksdirektoratet. (2026). Foretak — produsentregister åpen datasett.'

async function findOrCreateRegistryCitation(): Promise<string> {
  const existing = await prisma.sourceCitation.findFirst({
    where: { citationText: REGISTRY_CITATION_TEXT },
    select: { id: true },
  })
  if (existing) return existing.id
  const created = await prisma.sourceCitation.create({
    data: {
      citationText: REGISTRY_CITATION_TEXT,
      title: 'Landbruksdirektoratet produsentregister (foretak)',
      publisher: 'Landbruksdirektoratet',
      year: 2026,
      url: FORETAK_URL,
      sourceClass: 'registry_snapshot',
      citationReadiness: 'citable_external',
      verificationStatus: 'verified',
      accessedAt: new Date(),
      captureMethod: 'manual',
    },
    select: { id: true },
  })
  return created.id
}

type ForetakRow = {
  orgnr: string
  komnr: string
  gardsnr: string
  bruksnr: string
  festenr: string
  id: string | null
  koordsys: string | null
  nord: string | null
  ost: string | null
  orgnrParent: string | null
}

function parseCsv(text: string, delimiter: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cells = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = (cells[idx] ?? '').trim()
    })
    return row
  })
}

function normalizeOrgNr(raw: string | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 9) return null
  return digits
}

async function fetchForetakCsv(): Promise<ForetakRow[]> {
  const res = await fetch(FORETAK_URL)
  if (!res.ok) throw new Error(`Failed to fetch foretak CSV: ${res.status}`)
  const text = await res.text()
  const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ','
  const parsed = parseCsv(text, delimiter)
  return parsed
    .map(raw => ({
      orgnr: normalizeOrgNr(raw.orgnr?.replace(/"/g, '')) ?? '',
      komnr: (raw.komnr ?? '').replace(/"/g, ''),
      gardsnr: raw.gardsnr ?? '',
      bruksnr: raw.bruksnr ?? '',
      festenr: raw.festenr ?? '',
      id: raw.id || null,
      koordsys: raw.koordsys || null,
      nord: raw.nord || null,
      ost: raw.ost || null,
      orgnrParent: normalizeOrgNr(raw.orgnr_1?.replace(/"/g, '')),
    }))
    .filter(row => row.orgnr)
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log(`[landbruksregister] fetching foretak CSV from ${FORETAK_URL}`)
  const rows = await fetchForetakCsv()
  console.log(`[landbruksregister] parsed ${rows.length} rows`)

  const slice = limit ? rows.slice(0, limit) : rows
  console.log(
    `[landbruksregister] processing ${slice.length} rows${dryRun ? ' (DRY RUN)' : ''}`
  )

  const citationId = dryRun ? '(dry-run)' : await findOrCreateRegistryCitation()
  console.log(`[landbruksregister] primaryCitation: ${citationId}`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const row of slice) {
    const matrikkel = [row.komnr, row.gardsnr, row.bruksnr, row.festenr]
      .filter(Boolean)
      .join('-')
    const coords =
      row.koordsys && row.nord && row.ost
        ? { koordsys: row.koordsys, nord: row.nord, ost: row.ost }
        : null
    const metaPayload = {
      matrikkel,
      komnr: row.komnr,
      gardsnr: row.gardsnr,
      bruksnr: row.bruksnr,
      festenr: row.festenr,
      source: 'Landbruksregisteret',
      ...(coords ? { coords } : {}),
      ...(row.orgnrParent ? { parentOrgNr: row.orgnrParent } : {}),
    }

    if (dryRun) {
      skipped++
      continue
    }

    const existing = await prisma.producer.findUnique({ where: { orgNr: row.orgnr } })
    if (existing) {
      const existingMeta =
        existing.metadata && typeof existing.metadata === 'object'
          ? (existing.metadata as Record<string, unknown>)
          : {}
      await prisma.producer.update({
        where: { orgNr: row.orgnr },
        data: {
          metadata: { ...existingMeta, ...metaPayload } as any,
          municipality: row.komnr || existing.municipality,
          // Only set primaryCitationId if missing — preserve any manual override.
          ...(existing.primaryCitationId ? {} : { primaryCitationId: citationId }),
        },
      })
      updated++
    } else {
      await prisma.producer.create({
        data: {
          name: `Jordbruksforetak ${row.orgnr}`,
          orgNr: row.orgnr,
          country: 'NO',
          municipality: row.komnr || null,
          metadata: metaPayload as any,
          primaryCitationId: citationId,
        },
      })
      created++
    }

    if ((created + updated) % 500 === 0) {
      console.log(`[landbruksregister] processed ${created + updated} so far`)
    }
  }

  console.log(
    `[landbruksregister] done: created=${created} updated=${updated} skipped=${skipped}`
  )
}

main()
  .catch(err => {
    console.error('[landbruksregister] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
