import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const FORMAT_2016_FOOD_WASTE_REPORT_URL =
  'https://www.matvett.no/uploads/documents/ForMat-rapport-2016.-Sluttrapport.pdf'
const MATVETT_2018_FOOD_WASTE_REPORT_URL =
  'https://www.matvett.no/uploads/documents/OR.28.18-Edible-food-waste-in-Norway-Report-on-key-figures-2015-2017.pdf'

type CheckedCountryMetric = {
  country: string
  metricType: string
  category: string
  value: number
  unit: string
  year: string
  source: string
}

const checkedRows: CheckedCountryMetric[] = [
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Husholdninger',
    value: 217480,
    unit: 'tonn',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Dagligvare',
    value: 60177,
    unit: 'tonn',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Matindustri',
    value: 74404,
    unit: 'tonn',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Grossist',
    value: 3067,
    unit: 'tonn',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Totalt',
    value: 355000,
    unit: 'tonn',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWastePerCapita',
    category: 'Totalt',
    value: 68.7,
    unit: 'kg/capita',
    year: '2015',
    source: FORMAT_2016_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Husholdninger',
    value: 224004,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Dagligvare',
    value: 51212,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Matindustri',
    value: 93897,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Grossist',
    value: 5953,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Servering',
    value: 9578,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Totalt',
    value: 385000,
    unit: 'tonn',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
  {
    country: 'NO',
    metricType: 'foodWastePerCapita',
    category: 'Totalt',
    value: 73,
    unit: 'kg/capita',
    year: '2017',
    source: MATVETT_2018_FOOD_WASTE_REPORT_URL,
  },
]

const obsoleteRows = [
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Jordbruk',
    year: '2015',
  },
  {
    country: 'NO',
    metricType: 'foodWaste',
    category: 'Jordbruk',
    year: '2017',
  },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`Correcting checked historical food-waste source data${dryRun ? ' (dry run)' : ''}`)

  const obsoleteCount = await prisma.countryMetric.count({
    where: {
      OR: obsoleteRows,
    },
  })

  if (dryRun) {
    console.log(
      `  Would upsert ${checkedRows.length} checked row(s) and delete ${obsoleteCount} obsolete row(s)`,
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.countryMetric.deleteMany({
      where: {
        OR: obsoleteRows,
      },
    })

    for (const row of checkedRows) {
      await tx.countryMetric.upsert({
        where: {
          country_metricType_category_year: {
            country: row.country,
            metricType: row.metricType,
            category: row.category,
            year: row.year,
          },
        },
        update: {
          value: row.value,
          unit: row.unit,
          source: row.source,
          subtitle: null,
          metadata: undefined,
        },
        create: row,
      })
    }
  })

  console.log(
    `Food-waste data correction complete: ${checkedRows.length} upserted, ${obsoleteCount} deleted`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
