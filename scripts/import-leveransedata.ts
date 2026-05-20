import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CommoditySpec = {
  dataset: string
  unit: string
  buyerOrgNr?: string
  buyerName: string
  orgNrColumn: string
  nameColumn: string
  kommuneColumn?: string
  pathTemplate: (year: number) => string
  valueGroups: Array<{ commodity: string; sumColumns: string[] }>
}

function standardPath(dataset: string) {
  return (year: number) =>
    `https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/${dataset}/${year}/dataset.csv`
}

const SPECS: CommoditySpec[] = [
  {
    dataset: 'leveransedata-melk',
    unit: 'liter',
    buyerOrgNr: '947942638',
    buyerName: 'TINE SA',
    orgNrColumn: 'orgnr',
    nameColumn: 'navn',
    kommuneColumn: 'komnr',
    pathTemplate: standardPath('leveransedata-melk'),
    valueGroups: [
      { commodity: 'melk-ku', sumColumns: ['kumelk_liter'] },
      { commodity: 'melk-geit', sumColumns: ['geitemelk_liter'] },
    ],
  },
  {
    dataset: 'leveransedata-egg',
    unit: 'kg',
    buyerName: 'Nortura SA',
    buyerOrgNr: '938752648',
    orgNrColumn: 'produsentorgnr.',
    nameColumn: 'produsentnavn',
    pathTemplate: standardPath('leveransedata-egg'),
    valueGroups: [{ commodity: 'egg', sumColumns: ['mengde egg totalt (kg)'] }],
  },
  {
    dataset: 'leveransedata-korn',
    unit: 'kg',
    buyerName: 'Felleskjøpet Agri SA',
    buyerOrgNr: '911608103',
    orgNrColumn: 'orgnr',
    nameColumn: 'orgnr',
    kommuneColumn: 'komnr',
    pathTemplate: (year: number) =>
      `https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/leveransedata-korn/${year}-${year + 1}/dataset.csv`,
    valueGroups: [
      {
        commodity: 'korn-bygg',
        sumColumns: ['bygg', 'bygg_for', 'bygg_for_kg', 'bygg_sakorn', 'bygg_sakorn_kg'],
      },
      {
        commodity: 'korn-havre',
        sumColumns: ['havre', 'havre_for', 'havre_for_kg', 'havre_sakorn', 'havre_sakorn_kg'],
      },
      {
        commodity: 'korn-hvete',
        sumColumns: ['hvete_for', 'hvete_for_kg', 'hvete_mat', 'hvete_mat_kg', 'hvete_sakorn', 'hvete_sakorn_kg'],
      },
      {
        commodity: 'korn-rug',
        sumColumns: [
          'rug_for',
          'rug_for_kg',
          'rug_mat',
          'rug_mat_kg',
          'rug_sakorn',
          'rug_sakorn_kg',
          'rughvete',
          'rughvete_for',
          'rughvete_for_kg',
          'rughvete_sakorn',
          'rughvete_sakorn_kg',
        ],
      },
      {
        commodity: 'korn-erter',
        sumColumns: ['erter', 'erter_for', 'erter_for_kg', 'erter_sakorn', 'erter_sakorn_kg'],
      },
      {
        commodity: 'oljefro',
        sumColumns: ['oljefro', 'oljefro_kg', 'oljefro_sakorn', 'oljefro_sakorn_kg'],
      },
    ],
  },
  {
    dataset: 'leveransedata-slakt',
    unit: 'kg',
    buyerName: 'Nortura SA',
    buyerOrgNr: '938752648',
    orgNrColumn: 'orgnr',
    nameColumn: 'navn',
    kommuneColumn: 'komnr',
    pathTemplate: standardPath('leveransedata-slakt'),
    valueGroups: [
      {
        commodity: 'slakt-storfe',
        sumColumns: ['ku_kg', 'kvige_kg', 'okse_kg', 'ungokse_kastrat_kg', 'ungku_kg', 'kalv_kg'],
      },
      { commodity: 'slakt-svin', sumColumns: ['gris_kg', 'purke_kg', 'råne_kg'] },
      {
        commodity: 'slakt-sau',
        sumColumns: ['lam_kg', 'lam_villsau_kg', 'sau_kg', 'ungsau_kg', 'vær_kg'],
      },
      {
        commodity: 'slakt-fjorfe',
        sumColumns: ['and_kg', 'gås_kg', 'hane_kg', 'hons_kg', 'kalkun_kg', 'kylling_kg'],
      },
      { commodity: 'ull', sumColumns: ['ull_kg'] },
    ],
  },
]

function parseCsv(text: string, delimiter: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cells = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? '').trim()
    })
    return row
  })
}

function normalizeOrgNr(raw: string | undefined): string | null {
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  return d.length === 9 ? d : null
}

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null
  const n = parseFloat(raw.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) && n !== 0 ? n : null
}

async function fetchCsv(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`[leveransedata] ${url}: ${res.status}`)
    return null
  }
  const text = await res.text()
  const delim = text.split(/\r?\n/)[0].includes(';') ? ';' : ','
  return parseCsv(text, delim)
}

async function ensureProducer(orgNr: string, name: string, kommuneNr: string | null) {
  return prisma.producer.upsert({
    where: { orgNr },
    create: {
      name,
      orgNr,
      country: 'NO',
      municipality: kommuneNr,
      metadata: { kommuneNr, source: 'Leveransedata' } as any,
    },
    update: {}, // no-op: landbruksregister owns producer fields; this only anchors an id
  })
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

type Aggregate = {
  name: string
  kommuneNr: string | null
  byCommodity: Record<string, number>
}

async function importDataset(spec: CommoditySpec, year: number, dryRun: boolean, limit?: number) {
  const rows = await fetchCsv(spec.pathTemplate(year))
  if (!rows) return { rowCount: 0, written: 0 }

  const aggregates = new Map<string, Aggregate>()
  for (const row of rows) {
    const supplierOrgNr = normalizeOrgNr(row[spec.orgNrColumn])
    if (!supplierOrgNr) continue
    let agg = aggregates.get(supplierOrgNr)
    if (!agg) {
      agg = {
        name: row[spec.nameColumn] || `Foretak ${supplierOrgNr}`,
        kommuneNr: spec.kommuneColumn ? row[spec.kommuneColumn] || null : null,
        byCommodity: {},
      }
      aggregates.set(supplierOrgNr, agg)
    }
    for (const group of spec.valueGroups) {
      const sum = group.sumColumns.reduce(
        (acc, col) => acc + (parseNumber(row[col]) ?? 0),
        0
      )
      if (sum > 0) {
        agg.byCommodity[group.commodity] = (agg.byCommodity[group.commodity] ?? 0) + sum
      }
    }
  }

  const entries = Array.from(aggregates.entries())
  const slice = limit ? entries.slice(0, limit) : entries
  const buyer = spec.buyerOrgNr
    ? await prisma.company.findUnique({ where: { orgNr: spec.buyerOrgNr } })
    : null

  let written = 0

  for (const [supplierOrgNr, agg] of slice) {
    const commodities = Object.entries(agg.byCommodity)
    if (commodities.length === 0) continue

    if (dryRun) {
      written += commodities.length
      continue
    }

    const supplier = await ensureProducer(supplierOrgNr, agg.name, agg.kommuneNr)
    const kommuneNr = agg.kommuneNr ?? extractKommuneNr(supplier.metadata)

    for (const [commodity, qty] of commodities) {
      await prisma.deliveryVolume.upsert({
        where: {
          supplierOrgNr_commodity_year: {
            supplierOrgNr,
            commodity,
            year,
          },
        },
        create: {
          supplierProducerId: supplier.id,
          supplierOrgNr,
          buyerId: buyer?.id,
          buyerName: spec.buyerName,
          commodity,
          year,
          quantity: qty,
          unit: spec.unit,
          kommuneNr,
          source: 'Landbruksdirektoratet',
        },
        update: {
          quantity: qty,
          kommuneNr,
          buyerId: buyer?.id,
          buyerName: spec.buyerName,
        },
      })
      written++
    }
  }

  return { rowCount: rows.length, written, suppliers: entries.length }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const yearArg = process.argv.find(a => a.startsWith('--year='))
  const year = yearArg ? parseInt(yearArg.split('=')[1], 10) : 2024
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const datasetFilter = process.argv.find(a => a.startsWith('--dataset='))
  const onlyDataset = datasetFilter ? datasetFilter.split('=')[1] : null

  const specs = onlyDataset ? SPECS.filter(s => s.dataset === onlyDataset) : SPECS
  console.log(
    `[leveransedata] year=${year} specs=${specs.length}${dryRun ? ' (DRY RUN)' : ''}`
  )

  for (const spec of specs) {
    const result = await importDataset(spec, year, dryRun, limit)
    console.log(
      `[leveransedata] ${spec.dataset}: rows=${result.rowCount} written=${result.written}`
    )
  }
}

main()
  .catch(err => {
    console.error('[leveransedata] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
