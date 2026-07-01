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

const PRODUCER_BATCH_SIZE = 1000
const UPDATE_BATCH_SIZE = 500
const LOOKUP_BATCH_SIZE = 5000

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Order-insensitive canonical JSON: Postgres jsonb re-sorts object keys on store,
// so comparing DB-read metadata against a freshly-built payload needs stable ordering
// (including nested objects like coords) to detect genuine changes.
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v)
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']'
  const keys = Object.keys(v as Record<string, unknown>).sort()
  return '{' + keys.map(k => `${JSON.stringify(k)}:${stableStringify((v as Record<string, unknown>)[k])}`).join(',') + '}'
}

function buildMetaPayload(row: ForetakRow): Record<string, unknown> {
  const matrikkel = [row.komnr, row.gardsnr, row.bruksnr, row.festenr]
    .filter(Boolean)
    .join('-')
  const coords =
    row.koordsys && row.nord && row.ost
      ? { koordsys: row.koordsys, nord: row.nord, ost: row.ost }
      : null
  return {
    matrikkel,
    komnr: row.komnr,
    gardsnr: row.gardsnr,
    bruksnr: row.bruksnr,
    festenr: row.festenr,
    source: 'Landbruksregisteret',
    ...(coords ? { coords } : {}),
    ...(row.orgnrParent ? { parentOrgNr: row.orgnrParent } : {}),
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log(`[landbruksregister] fetching foretak CSV from ${FORETAK_URL}`)
  const rows = await fetchForetakCsv()
  console.log(`[landbruksregister] parsed ${rows.length} rows`)

  const slice = limit ? rows.slice(0, limit) : rows

  // Aggregate by orgNr: a foretak can appear on several matrikkel rows. Merge their
  // metaPayloads cumulatively (last non-empty komnr wins) so the result matches the
  // old sequential create-then-merge behaviour without a per-row round-trip.
  const agg = new Map<string, { metadata: Record<string, unknown>; komnr: string }>()
  for (const row of slice) {
    const prev = agg.get(row.orgnr)
    const merged = { ...(prev?.metadata ?? {}), ...buildMetaPayload(row) }
    agg.set(row.orgnr, { metadata: merged, komnr: row.komnr || prev?.komnr || '' })
  }
  const orgNrs = [...agg.keys()]
  console.log(
    `[landbruksregister] processing ${orgNrs.length} unique foretak${dryRun ? ' (DRY RUN)' : ''}`
  )

  if (dryRun) {
    console.log(`[landbruksregister] done (dry-run): would upsert ${orgNrs.length} producers`)
    return
  }

  const citationId = await findOrCreateRegistryCitation()
  console.log(`[landbruksregister] primaryCitation: ${citationId}`)

  // Pre-load existing producers in bulk (chunked) instead of one findUnique per row.
  const existing = new Map<
    string,
    { metadata: Record<string, unknown>; municipality: string | null; primaryCitationId: string | null }
  >()
  for (const ids of chunk(orgNrs, LOOKUP_BATCH_SIZE)) {
    const found = await prisma.producer.findMany({
      where: { orgNr: { in: ids } },
      select: { orgNr: true, metadata: true, municipality: true, primaryCitationId: true },
    })
    for (const p of found) {
      existing.set(p.orgNr, {
        metadata:
          p.metadata && typeof p.metadata === 'object'
            ? (p.metadata as Record<string, unknown>)
            : {},
        municipality: p.municipality,
        primaryCitationId: p.primaryCitationId,
      })
    }
  }

  const toCreate: {
    name: string
    orgNr: string
    country: string
    municipality: string | null
    metadata: any
    primaryCitationId: string
  }[] = []
  const toUpdate: {
    orgNr: string
    metadata: Record<string, unknown>
    municipality: string | null
    primaryCitationId: string
  }[] = []
  let unchanged = 0

  for (const [orgNr, { metadata: payload, komnr }] of agg) {
    const ex = existing.get(orgNr)
    if (!ex) {
      toCreate.push({
        name: `Jordbruksforetak ${orgNr}`,
        orgNr,
        country: 'NO',
        municipality: komnr || null,
        metadata: payload as any,
        primaryCitationId: citationId,
      })
      continue
    }
    const mergedMeta = { ...ex.metadata, ...payload }
    const finalMuni = komnr || ex.municipality
    // Only set primaryCitationId if missing — preserve any manual override.
    const finalCitation = ex.primaryCitationId ?? citationId
    const changed =
      stableStringify(mergedMeta) !== stableStringify(ex.metadata) ||
      finalMuni !== ex.municipality ||
      finalCitation !== ex.primaryCitationId
    if (changed) {
      toUpdate.push({ orgNr, metadata: mergedMeta, municipality: finalMuni, primaryCitationId: finalCitation })
    } else {
      unchanged++
    }
  }

  let created = 0
  for (const batch of chunk(toCreate, PRODUCER_BATCH_SIZE)) {
    const result = await prisma.producer.createMany({ data: batch, skipDuplicates: true })
    created += result.count
  }

  // Batched update for existing rows: one UPDATE ... FROM (VALUES ...) per chunk,
  // so per-row-distinct merged metadata lands in a single round-trip per batch.
  let updated = 0
  for (const batch of chunk(toUpdate, UPDATE_BATCH_SIZE)) {
    const tuples: string[] = []
    const params: (string | null)[] = []
    let i = 1
    for (const u of batch) {
      tuples.push(`($${i}::text, $${i + 1}::jsonb, $${i + 2}::text, $${i + 3}::text)`)
      params.push(u.orgNr, JSON.stringify(u.metadata), u.municipality, u.primaryCitationId)
      i += 4
    }
    const sql =
      `UPDATE "Producer" AS p SET ` +
      `metadata = v.metadata, municipality = v.municipality, ` +
      `"primaryCitationId" = v.citation_id ` +
      `FROM (VALUES ${tuples.join(', ')}) AS v(org_nr, metadata, municipality, citation_id) ` +
      `WHERE p."orgNr" = v.org_nr`
    await prisma.$executeRawUnsafe(sql, ...params)
    updated += batch.length
    console.log(`[landbruksregister] updated ${updated}/${toUpdate.length}`)
  }

  console.log(
    `[landbruksregister] done: created=${created} updated=${updated} unchanged=${unchanged}`
  )
}

main()
  .catch(err => {
    console.error('[landbruksregister] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
