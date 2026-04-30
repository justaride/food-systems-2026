import 'dotenv/config'
import { Client } from 'pg'

const args = new Set(process.argv.slice(2))
const tableArg = process.argv.find((arg) => arg.startsWith('--table='))?.split('=')[1]
const keysOnly = args.has('--keys-only')
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL is required')

const client = new Client({ connectionString: databaseUrl })

type TableName = 'aquaculture' | 'delivery' | 'relationships'

function getTableName(): TableName {
  if (tableArg === 'aquaculture' || tableArg === 'delivery' || tableArg === 'relationships') return tableArg

  throw new Error('Usage: tsx scripts/print-visualization-drift-keys.ts --table=aquaculture|delivery|relationships [--keys-only]')
}

async function printAquaculture() {
  const result = await client.query<{
    localityNumber: string
    siteName: string | null
    orgNr: string
    companyName: string
    source: string | null
  }>(`
    select
      s."localityNumber",
      s."siteName",
      c."orgNr",
      c."name" as "companyName",
      s."source"
    from "AquacultureSite" s
    join "Company" c on c."id" = s."companyId"
    order by s."localityNumber" asc
  `)

  for (const row of result.rows) {
    const key = row.localityNumber
    if (keysOnly) {
      console.log(key)
    } else {
      console.log(formatLine([key, row.siteName ?? '', row.orgNr, row.companyName, row.source ?? '']))
    }
  }
}

async function printDelivery() {
  const result = await client.query<{
    supplierOrgNr: string
    commodity: string
    year: number
    quantity: string
    unit: string
    kommuneNr: string | null
    buyerName: string | null
    source: string
  }>(`
    select
      "supplierOrgNr",
      "commodity",
      "year",
      "quantity",
      "unit",
      "kommuneNr",
      "buyerName",
      "source"
    from "DeliveryVolume"
    order by "supplierOrgNr" asc, "commodity" asc, "year" asc
  `)

  for (const row of result.rows) {
    const key = [row.supplierOrgNr, row.commodity, row.year].join('|')
    if (keysOnly) {
      console.log(key)
    } else {
      console.log(formatLine([key, row.quantity, row.unit, row.kommuneNr ?? '', row.buyerName ?? '', row.source]))
    }
  }
}

async function printRelationships() {
  const result = await client.query<{
    fromOrgNr: string
    toOrgNr: string
    relationshipType: string
    fromName: string
    toName: string
    source: string | null
  }>(`
    select
      fc."orgNr" as "fromOrgNr",
      tc."orgNr" as "toOrgNr",
      r."relationshipType",
      fc."name" as "fromName",
      tc."name" as "toName",
      r."source"
    from "BusinessRelationship" r
    join "Company" fc on fc."id" = r."fromCompanyId"
    join "Company" tc on tc."id" = r."toCompanyId"
    order by fc."orgNr" asc, tc."orgNr" asc, r."relationshipType" asc
  `)

  const lines = result.rows
    .map((row) => {
      const key = [row.fromOrgNr, row.toOrgNr, row.relationshipType].join('|')
      if (keysOnly) return key
      return formatLine([key, row.fromName, row.toName, row.source ?? ''])
    })
    .sort()

  for (const line of lines) console.log(line)
}

async function main() {
  const table = getTableName()

  await client.connect()

  if (table === 'aquaculture') await printAquaculture()
  if (table === 'delivery') await printDelivery()
  if (table === 'relationships') await printRelationships()
}

function formatLine(values: Array<number | string>) {
  return values.map((value) => String(value).replace(/\|/g, '/')).join('|')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
