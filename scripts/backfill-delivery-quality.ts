import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BACKFILL_DATE = '2026-04-29'

type CountMap = Record<string, number>

function countBy<T>(items: T[], keyFor: (item: T) => string): CountMap {
  return items.reduce<CountMap>((counts, item) => {
    const key = keyFor(item)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function extractKommuneNr(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null

  const record = metadata as Record<string, unknown>
  const raw = record.kommuneNr ?? record.komnr
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return raw.toString().padStart(4, '0')
  }
  if (typeof raw !== 'string') return null

  const digits = raw.replace(/\D/g, '')
  return digits.length === 4 ? digits : null
}

function mergeMetadata(metadata: unknown, patch: Record<string, unknown>) {
  const base =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {}

  return { ...base, ...patch }
}

async function backfillTineBuyer(apply: boolean) {
  const buyer = await prisma.company.findUnique({
    where: { orgNr: '947942638' },
    select: { id: true, name: true, orgNr: true },
  })

  if (!buyer) {
    throw new Error('Fant ikke TINE SA med orgNr 947942638 i Company-tabellen')
  }

  const where = {
    buyerId: null,
    commodity: { in: ['melk-ku', 'melk-geit'] },
    OR: [{ buyerName: 'Tine SA' }, { buyerName: 'TINE SA' }],
  }

  const rows = await prisma.deliveryVolume.findMany({
    where,
    select: { id: true, commodity: true, buyerName: true },
  })

  console.log(
    `[delivery-quality] TINE buyerId: planned=${rows.length} buyer=${buyer.name} (${buyer.orgNr}) byCommodity=${JSON.stringify(
      countBy(rows, row => row.commodity)
    )}`
  )

  if (!apply || rows.length === 0) return rows.length

  const result = await prisma.deliveryVolume.updateMany({
    where,
    data: {
      buyerId: buyer.id,
      buyerName: buyer.name,
    },
  })

  console.log(`[delivery-quality] TINE buyerId: updated=${result.count}`)
  return result.count
}

async function backfillKommuneFromSupplierMetadata(apply: boolean) {
  const rows = await prisma.deliveryVolume.findMany({
    where: { kommuneNr: null },
    select: {
      id: true,
      commodity: true,
      supplierOrgNr: true,
      metadata: true,
      supplier: { select: { metadata: true } },
    },
  })

  const updates = rows
    .map(row => ({
      id: row.id,
      commodity: row.commodity,
      supplierOrgNr: row.supplierOrgNr,
      kommuneNr: extractKommuneNr(row.supplier.metadata),
      metadata: row.metadata,
    }))
    .filter(row => row.kommuneNr)

  console.log(
    `[delivery-quality] kommune from supplier metadata: missing=${rows.length} planned=${updates.length} unresolved=${
      rows.length - updates.length
    } byCommodity=${JSON.stringify(countBy(updates, row => row.commodity))}`
  )

  if (!apply || updates.length === 0) return updates.length

  let updated = 0
  const batchSize = 100
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    await prisma.$transaction(
      batch.map(row =>
        prisma.deliveryVolume.update({
          where: { id: row.id },
          data: {
            kommuneNr: row.kommuneNr,
            metadata: mergeMetadata(row.metadata, {
              kommuneBackfilledFrom: 'Company.metadata.komnr',
              qualityBackfilledAt: BACKFILL_DATE,
            }) as any,
          },
        })
      )
    )
    updated += batch.length
    console.log(`[delivery-quality] kommune from supplier metadata: updated=${updated}`)
  }

  return updated
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply

  console.log(`[delivery-quality] mode=${dryRun ? 'DRY RUN' : 'APPLY'}`)

  const [buyerRows, kommuneRows] = await Promise.all([
    backfillTineBuyer(apply),
    backfillKommuneFromSupplierMetadata(apply),
  ])

  console.log(
    `[delivery-quality] done: buyerRows=${buyerRows} kommuneRows=${kommuneRows}${dryRun ? ' (no writes)' : ''}`
  )
}

main()
  .catch(err => {
    console.error('[delivery-quality] backfill failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
