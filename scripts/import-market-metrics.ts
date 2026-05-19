import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NO_RETAILER_SHARE_2020_2024_SOURCE_URL =
  'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25-1.pdf'

const noRetailerShareMetadata = {
  sourceUrl: NO_RETAILER_SHARE_2020_2024_SOURCE_URL,
  sourceNote: 'Figure 2 / direct KT time series used in research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv',
}

const FI_RETAILER_SHARE_2024_SOURCE_URL = 'https://www.pty.fi/en/finnish-grocery-trade/'

const fiRetailerShare2024Metadata = {
  sourceUrl: FI_RETAILER_SHARE_2024_SOURCE_URL,
  sourceNote: 'Direct PTY market-share page; grocery sales include VAT, source NielsenIQ Grocery Shop Directory / Finnish Grocery Trade Association',
}

type MarketMetric = {
  country: string
  metricType: string
  category: string
  value: number
  unit: string
  year: string
  source: string
  subtitle?: string
  metadata?: Record<string, unknown>
}

const metrics: MarketMetric[] = [
  // Retailer market shares 2020-2024 (Konkurransetilsynet / Dagligvarehandelen)
  { country: 'no', metricType: 'retailerShare', category: 'NorgesGruppen', value: 44.1, unit: '%', year: '2020', source: 'Konkurransetilsynet 2021', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Coop', value: 29.3, unit: '%', year: '2020', source: 'Konkurransetilsynet 2021', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'REMA 1000', value: 23.2, unit: '%', year: '2020', source: 'Konkurransetilsynet 2021', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Andre', value: 3.4, unit: '%', year: '2020', source: 'Konkurransetilsynet 2021', metadata: noRetailerShareMetadata },

  { country: 'no', metricType: 'retailerShare', category: 'NorgesGruppen', value: 44.0, unit: '%', year: '2021', source: 'Konkurransetilsynet 2022', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Coop', value: 29.7, unit: '%', year: '2021', source: 'Konkurransetilsynet 2022', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'REMA 1000', value: 22.9, unit: '%', year: '2021', source: 'Konkurransetilsynet 2022', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Andre', value: 3.4, unit: '%', year: '2021', source: 'Konkurransetilsynet 2022', metadata: noRetailerShareMetadata },

  { country: 'no', metricType: 'retailerShare', category: 'NorgesGruppen', value: 43.3, unit: '%', year: '2022', source: 'Konkurransetilsynet 2023', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Coop', value: 29.6, unit: '%', year: '2022', source: 'Konkurransetilsynet 2023', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'REMA 1000', value: 23.6, unit: '%', year: '2022', source: 'Konkurransetilsynet 2023', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Andre', value: 3.5, unit: '%', year: '2022', source: 'Konkurransetilsynet 2023', metadata: noRetailerShareMetadata },

  { country: 'no', metricType: 'retailerShare', category: 'NorgesGruppen', value: 43.7, unit: '%', year: '2023', source: 'Konkurransetilsynet 2024', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Coop', value: 29.1, unit: '%', year: '2023', source: 'Konkurransetilsynet 2024', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'REMA 1000', value: 23.9, unit: '%', year: '2023', source: 'Konkurransetilsynet 2024', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Andre', value: 3.4, unit: '%', year: '2023', source: 'Konkurransetilsynet 2024', metadata: noRetailerShareMetadata },

  { country: 'no', metricType: 'retailerShare', category: 'NorgesGruppen', value: 43.5, unit: '%', year: '2024', source: 'Konkurransetilsynet 2025', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Coop', value: 29.2, unit: '%', year: '2024', source: 'Konkurransetilsynet 2025', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'REMA 1000', value: 23.9, unit: '%', year: '2024', source: 'Konkurransetilsynet 2025', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'retailerShare', category: 'Andre', value: 3.3, unit: '%', year: '2024', source: 'Konkurransetilsynet 2025', metadata: noRetailerShareMetadata },

  // HHI (Herfindahl-Hirschman Index) 2020-2024
  { country: 'no', metricType: 'hhi', category: 'dagligvare', value: 3353, unit: 'index', year: '2020', source: 'Beregnet fra markedsandeler', subtitle: '44.1² + 29.3² + 23.2² + 3.4²', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'hhi', category: 'dagligvare', value: 3354, unit: 'index', year: '2021', source: 'Beregnet fra markedsandeler', subtitle: '44.0² + 29.7² + 22.9² + 3.4²', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'hhi', category: 'dagligvare', value: 3320, unit: 'index', year: '2022', source: 'Beregnet fra markedsandeler', subtitle: '43.3² + 29.6² + 23.6² + 3.5²', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'hhi', category: 'dagligvare', value: 3339, unit: 'index', year: '2023', source: 'Beregnet fra markedsandeler', subtitle: '43.7² + 29.1² + 23.9² + 3.4²', metadata: noRetailerShareMetadata },
  { country: 'no', metricType: 'hhi', category: 'dagligvare', value: 3327, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '43.5² + 29.2² + 23.9² + 3.3²', metadata: noRetailerShareMetadata },

  // Segment shares 2020-2024 (Lavpris, Supermarked, Nærbutikk)
  { country: 'no', metricType: 'segmentShare', category: 'Lavpris', value: 59.5, unit: '%', year: '2020', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Supermarked', value: 31.5, unit: '%', year: '2020', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Nærbutikk', value: 9.0, unit: '%', year: '2020', source: 'Nielsen/Dagligvarehandelen' },

  { country: 'no', metricType: 'segmentShare', category: 'Lavpris', value: 60.0, unit: '%', year: '2021', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Supermarked', value: 31.2, unit: '%', year: '2021', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Nærbutikk', value: 8.8, unit: '%', year: '2021', source: 'Nielsen/Dagligvarehandelen' },

  { country: 'no', metricType: 'segmentShare', category: 'Lavpris', value: 60.5, unit: '%', year: '2022', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Supermarked', value: 30.8, unit: '%', year: '2022', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Nærbutikk', value: 8.7, unit: '%', year: '2022', source: 'Nielsen/Dagligvarehandelen' },

  { country: 'no', metricType: 'segmentShare', category: 'Lavpris', value: 61.0, unit: '%', year: '2023', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Supermarked', value: 30.5, unit: '%', year: '2023', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Nærbutikk', value: 8.5, unit: '%', year: '2023', source: 'Nielsen/Dagligvarehandelen' },

  { country: 'no', metricType: 'segmentShare', category: 'Lavpris', value: 61.5, unit: '%', year: '2024', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Supermarked', value: 30.2, unit: '%', year: '2024', source: 'Nielsen/Dagligvarehandelen' },
  { country: 'no', metricType: 'segmentShare', category: 'Nærbutikk', value: 8.3, unit: '%', year: '2024', source: 'Nielsen/Dagligvarehandelen' },

  // --- Food waste by sector (tonnes), Norway (Matvett/ForMat/SSB) ---
  { country: 'no', metricType: 'foodWaste', category: 'Husholdninger', value: 350000, unit: 'tonn', year: '2015', source: 'ForMat 2016' },
  { country: 'no', metricType: 'foodWaste', category: 'Dagligvare', value: 90000, unit: 'tonn', year: '2015', source: 'ForMat 2016' },
  { country: 'no', metricType: 'foodWaste', category: 'Matindustri', value: 120000, unit: 'tonn', year: '2015', source: 'ForMat 2016' },
  { country: 'no', metricType: 'foodWaste', category: 'Jordbruk', value: 15000, unit: 'tonn', year: '2015', source: 'ForMat 2016' },
  { country: 'no', metricType: 'foodWaste', category: 'Totalt', value: 575000, unit: 'tonn', year: '2015', source: 'ForMat 2016' },

  { country: 'no', metricType: 'foodWaste', category: 'Husholdninger', value: 330000, unit: 'tonn', year: '2017', source: 'Matvett/SSB 2018' },
  { country: 'no', metricType: 'foodWaste', category: 'Dagligvare', value: 85000, unit: 'tonn', year: '2017', source: 'Matvett/SSB 2018' },
  { country: 'no', metricType: 'foodWaste', category: 'Matindustri', value: 115000, unit: 'tonn', year: '2017', source: 'Matvett/SSB 2018' },
  { country: 'no', metricType: 'foodWaste', category: 'Jordbruk', value: 14000, unit: 'tonn', year: '2017', source: 'Matvett/SSB 2018' },
  { country: 'no', metricType: 'foodWaste', category: 'Totalt', value: 544000, unit: 'tonn', year: '2017', source: 'Matvett/SSB 2018' },

  { country: 'no', metricType: 'foodWaste', category: 'Husholdninger', value: 307000, unit: 'tonn', year: '2020', source: 'Matvett/SSB 2021' },
  { country: 'no', metricType: 'foodWaste', category: 'Dagligvare', value: 82000, unit: 'tonn', year: '2020', source: 'Matvett/SSB 2021' },
  { country: 'no', metricType: 'foodWaste', category: 'Matindustri', value: 106000, unit: 'tonn', year: '2020', source: 'Matvett/SSB 2021' },
  { country: 'no', metricType: 'foodWaste', category: 'Jordbruk', value: 13000, unit: 'tonn', year: '2020', source: 'Matvett/SSB 2021' },
  { country: 'no', metricType: 'foodWaste', category: 'Totalt', value: 508000, unit: 'tonn', year: '2020', source: 'Matvett/SSB 2021' },

  { country: 'no', metricType: 'foodWaste', category: 'Husholdninger', value: 290000, unit: 'tonn', year: '2022', source: 'Matvett/SSB 2023' },
  { country: 'no', metricType: 'foodWaste', category: 'Dagligvare', value: 78000, unit: 'tonn', year: '2022', source: 'Matvett/SSB 2023' },
  { country: 'no', metricType: 'foodWaste', category: 'Matindustri', value: 99000, unit: 'tonn', year: '2022', source: 'Matvett/SSB 2023' },
  { country: 'no', metricType: 'foodWaste', category: 'Jordbruk', value: 12000, unit: 'tonn', year: '2022', source: 'Matvett/SSB 2023' },
  { country: 'no', metricType: 'foodWaste', category: 'Totalt', value: 479000, unit: 'tonn', year: '2022', source: 'Matvett/SSB 2023' },

  { country: 'no', metricType: 'foodWaste', category: 'Husholdninger', value: 275000, unit: 'tonn', year: '2024', source: 'Matvett/SSB 2025 est.' },
  { country: 'no', metricType: 'foodWaste', category: 'Dagligvare', value: 73000, unit: 'tonn', year: '2024', source: 'Matvett/SSB 2025 est.' },
  { country: 'no', metricType: 'foodWaste', category: 'Matindustri', value: 92000, unit: 'tonn', year: '2024', source: 'Matvett/SSB 2025 est.' },
  { country: 'no', metricType: 'foodWaste', category: 'Jordbruk', value: 11000, unit: 'tonn', year: '2024', source: 'Matvett/SSB 2025 est.' },
  { country: 'no', metricType: 'foodWaste', category: 'Totalt', value: 451000, unit: 'tonn', year: '2024', source: 'Matvett/SSB 2025 est.' },

  // --- Food waste per capita (kg/capita), Nordic comparison ---
  { country: 'no', metricType: 'foodWastePerCapita', category: 'Totalt', value: 109, unit: 'kg/capita', year: '2015', source: 'ForMat/Eurostat 2016' },
  { country: 'no', metricType: 'foodWastePerCapita', category: 'Totalt', value: 102, unit: 'kg/capita', year: '2017', source: 'Matvett/Eurostat 2018' },
  { country: 'no', metricType: 'foodWastePerCapita', category: 'Totalt', value: 93, unit: 'kg/capita', year: '2020', source: 'Matvett/Eurostat 2021' },
  { country: 'no', metricType: 'foodWastePerCapita', category: 'Totalt', value: 87, unit: 'kg/capita', year: '2022', source: 'Matvett/Eurostat 2023' },
  { country: 'no', metricType: 'foodWastePerCapita', category: 'Totalt', value: 82, unit: 'kg/capita', year: '2024', source: 'Matvett 2025 est.' },

  { country: 'se', metricType: 'foodWastePerCapita', category: 'Totalt', value: 133, unit: 'kg/capita', year: '2020', source: 'Naturvårdsverket 2021' },
  { country: 'se', metricType: 'foodWastePerCapita', category: 'Totalt', value: 127, unit: 'kg/capita', year: '2022', source: 'Naturvårdsverket 2023' },
  { country: 'dk', metricType: 'foodWastePerCapita', category: 'Totalt', value: 79, unit: 'kg/capita', year: '2020', source: 'Miljøstyrelsen 2021' },
  { country: 'dk', metricType: 'foodWastePerCapita', category: 'Totalt', value: 73, unit: 'kg/capita', year: '2022', source: 'Miljøstyrelsen 2023' },
  { country: 'fi', metricType: 'foodWastePerCapita', category: 'Totalt', value: 107, unit: 'kg/capita', year: '2020', source: 'LUKE/Eurostat 2021' },
  { country: 'fi', metricType: 'foodWastePerCapita', category: 'Totalt', value: 101, unit: 'kg/capita', year: '2022', source: 'LUKE/Eurostat 2023' },

  // --- GHG emissions by food system sector (Mt CO2e), Norway ---
  { country: 'no', metricType: 'ghgEmissions', category: 'Jordbruk', value: 4.7, unit: 'Mt CO2e', year: '2019', source: 'Miljødirektoratet 2020' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Matindustri', value: 1.3, unit: 'Mt CO2e', year: '2019', source: 'Miljødirektoratet 2020' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Transport mat', value: 2.1, unit: 'Mt CO2e', year: '2019', source: 'Miljødirektoratet 2020' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Jordbruk', value: 4.5, unit: 'Mt CO2e', year: '2022', source: 'Miljødirektoratet 2023' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Matindustri', value: 1.2, unit: 'Mt CO2e', year: '2022', source: 'Miljødirektoratet 2023' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Transport mat', value: 2.0, unit: 'Mt CO2e', year: '2022', source: 'Miljødirektoratet 2023' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Jordbruk', value: 4.4, unit: 'Mt CO2e', year: '2024', source: 'Miljødirektoratet 2025 est.' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Matindustri', value: 1.1, unit: 'Mt CO2e', year: '2024', source: 'Miljødirektoratet 2025 est.' },
  { country: 'no', metricType: 'ghgEmissions', category: 'Transport mat', value: 1.9, unit: 'Mt CO2e', year: '2024', source: 'Miljødirektoratet 2025 est.' },

  // --- GHG emissions, Nordic comparison (Mt CO2e, Jordbruk) ---
  { country: 'se', metricType: 'ghgEmissions', category: 'Jordbruk', value: 6.8, unit: 'Mt CO2e', year: '2022', source: 'Naturvårdsverket 2023' },
  { country: 'dk', metricType: 'ghgEmissions', category: 'Jordbruk', value: 10.3, unit: 'Mt CO2e', year: '2022', source: 'Energistyrelsen 2023' },
  { country: 'fi', metricType: 'ghgEmissions', category: 'Jordbruk', value: 6.5, unit: 'Mt CO2e', year: '2022', source: 'Tilastokeskus 2023' },

  // --- Land use (1000 dekar), Norway ---
  { country: 'no', metricType: 'landUse', category: 'Fulldyrket', value: 8100, unit: '1000 daa', year: '2020', source: 'SSB Arealstatistikk' },
  { country: 'no', metricType: 'landUse', category: 'Overflatedyrket og beite', value: 1900, unit: '1000 daa', year: '2020', source: 'SSB Arealstatistikk' },
  { country: 'no', metricType: 'landUse', category: 'Skog', value: 121900, unit: '1000 daa', year: '2020', source: 'SSB/NIBIO Landskogtakseringen' },
  { country: 'no', metricType: 'landUse', category: 'Fulldyrket', value: 7980, unit: '1000 daa', year: '2023', source: 'SSB Arealstatistikk' },
  { country: 'no', metricType: 'landUse', category: 'Overflatedyrket og beite', value: 1870, unit: '1000 daa', year: '2023', source: 'SSB Arealstatistikk' },
  { country: 'no', metricType: 'landUse', category: 'Skog', value: 121500, unit: '1000 daa', year: '2023', source: 'SSB/NIBIO Landskogtakseringen' },

  // --- Self-sufficiency (%), Norway by product ---
  { country: 'no', metricType: 'selfSufficiency', category: 'Melk', value: 99, unit: '%', year: '2020', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Kjøtt', value: 80, unit: '%', year: '2020', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Korn', value: 60, unit: '%', year: '2020', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Fisk', value: 300, unit: '%', year: '2020', source: 'SSB/Sjømatrådet', subtitle: 'Netto eksportør, produksjon > 3x innenlands forbruk' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Frukt og grønt', value: 8, unit: '%', year: '2020', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Totalt', value: 46, unit: '%', year: '2020', source: 'Totalkalkylen/SSB' },

  { country: 'no', metricType: 'selfSufficiency', category: 'Melk', value: 98, unit: '%', year: '2022', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Kjøtt', value: 78, unit: '%', year: '2022', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Korn', value: 65, unit: '%', year: '2022', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Fisk', value: 310, unit: '%', year: '2022', source: 'SSB/Sjømatrådet' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Frukt og grønt', value: 7, unit: '%', year: '2022', source: 'Totalkalkylen/SSB' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Totalt', value: 45, unit: '%', year: '2022', source: 'Totalkalkylen/SSB' },

  { country: 'no', metricType: 'selfSufficiency', category: 'Melk', value: 97, unit: '%', year: '2024', source: 'Totalkalkylen/SSB est.' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Kjøtt', value: 76, unit: '%', year: '2024', source: 'Totalkalkylen/SSB est.' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Korn', value: 62, unit: '%', year: '2024', source: 'Totalkalkylen/SSB est.' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Fisk', value: 320, unit: '%', year: '2024', source: 'SSB/Sjømatrådet est.' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Frukt og grønt', value: 7, unit: '%', year: '2024', source: 'Totalkalkylen/SSB est.' },
  { country: 'no', metricType: 'selfSufficiency', category: 'Totalt', value: 44, unit: '%', year: '2024', source: 'Totalkalkylen/SSB est.' },

  // --- Self-sufficiency, Nordic comparison (%) ---
  { country: 'se', metricType: 'selfSufficiency', category: 'Totalt', value: 50, unit: '%', year: '2022', source: 'Jordbruksverket 2023' },
  { country: 'dk', metricType: 'selfSufficiency', category: 'Totalt', value: 300, unit: '%', year: '2022', source: 'Landbrug & Fødevarer 2023', subtitle: 'Netto eksportør, sterk animalsk eksport' },
  { country: 'fi', metricType: 'selfSufficiency', category: 'Totalt', value: 80, unit: '%', year: '2022', source: 'LUKE 2023' },

  // ═══ Nordic retailer market shares 2024 (for cross-country comparison) ═══

  // Sweden 2024 (Konkurrensverket / DagligVaruKartan)
  { country: 'se', metricType: 'retailerShare', category: 'ICA Gruppen', value: 49.9, unit: '%', year: '2024', source: 'Konkurrensverket 2025' },
  { country: 'se', metricType: 'retailerShare', category: 'Axfood', value: 24.0, unit: '%', year: '2024', source: 'Konkurrensverket 2025', subtitle: 'Inkl. City Gross fra nov 2024' },
  { country: 'se', metricType: 'retailerShare', category: 'Coop Sverige', value: 14.2, unit: '%', year: '2024', source: 'Konkurrensverket 2025' },
  { country: 'se', metricType: 'retailerShare', category: 'Lidl', value: 6.4, unit: '%', year: '2024', source: 'Konkurrensverket 2025' },
  { country: 'se', metricType: 'retailerShare', category: 'Andre', value: 5.5, unit: '%', year: '2024', source: 'Konkurrensverket 2025' },

  // Denmark 2024 (Konkurrence- og Forbrugerstyrelsen)
  { country: 'dk', metricType: 'retailerShare', category: 'Salling Group', value: 35.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025' },
  { country: 'dk', metricType: 'retailerShare', category: 'Coop Danmark', value: 28.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025' },
  { country: 'dk', metricType: 'retailerShare', category: 'REMA 1000 DK', value: 24.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025', subtitle: 'Inkl. ex-Aldi butikker fra jan 2024' },
  { country: 'dk', metricType: 'retailerShare', category: 'Lidl DK', value: 5.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025' },
  { country: 'dk', metricType: 'retailerShare', category: 'Dagrofa', value: 4.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025' },
  { country: 'dk', metricType: 'retailerShare', category: 'Andre', value: 4.0, unit: '%', year: '2024', source: 'Konkurrence- og Forbrugerstyrelsen 2025' },

  // Finland 2024 (PTY / NielsenIQ)
  { country: 'fi', metricType: 'retailerShare', category: 'S Group', value: 48.8, unit: '%', year: '2024', source: 'PTY/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata },
  { country: 'fi', metricType: 'retailerShare', category: 'K Group (Kesko)', value: 33.7, unit: '%', year: '2024', source: 'PTY/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata },
  { country: 'fi', metricType: 'retailerShare', category: 'Lidl FI', value: 9.4, unit: '%', year: '2024', source: 'PTY/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata },
  { country: 'fi', metricType: 'retailerShare', category: 'Andre', value: 8.1, unit: '%', year: '2024', source: 'PTY/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata },

  // ═══ Nordic HHI values 2024 (for cross-country comparison) ═══

  { country: 'se', metricType: 'hhi', category: 'dagligvare', value: 3339, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '49.9² + 24.0² + 14.2² + 6.4² + 5.5²' },
  { country: 'dk', metricType: 'hhi', category: 'dagligvare', value: 2642, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '35.0² + 28.0² + 24.0² + 5.0² + 4.0² + 4.0²' },
  { country: 'fi', metricType: 'hhi', category: 'dagligvare', value: 3671, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '48.8² + 33.7² + 9.4² + 8.1²', metadata: fiRetailerShare2024Metadata },

  // ═══ HHI by product category, Norway 2024 ═══

  { country: 'no', metricType: 'hhiCategory', category: 'Meieri', value: 8100, unit: 'index', year: '2024', source: 'Konkurransetilsynet/bransjeanalyse', subtitle: 'TINE ~90% råmelk mottak → ~90² = 8100' },
  { country: 'no', metricType: 'hhiCategory', category: 'Kjøtt (slakt)', value: 5000, unit: 'index', year: '2024', source: 'Konkurransetilsynet/bransjeanalyse', subtitle: 'Nortura ~70.5% slakt → ~70² + resten' },
  { country: 'no', metricType: 'hhiCategory', category: 'Sjømat (laks)', value: 800, unit: 'index', year: '2024', source: 'Bransjeanalyse/Sjømatrådet', subtitle: 'Mowi ~15%, SalMar ~12%, Lerøy ~10%, mange mindre' },
  { country: 'no', metricType: 'hhiCategory', category: 'Korn og fôr', value: 3200, unit: 'index', year: '2024', source: 'Konkurransetilsynet/bransjeanalyse', subtitle: 'Felleskjøpet ~55% korn/fôr' },

  // ═══ Private label (EMV) shares, Norway 2020-2024 ═══

  // Samlet EMV-andel alle kjeder
  { country: 'no', metricType: 'privateLabel', category: 'Alle kjeder', value: 17.0, unit: '%', year: '2020', source: 'NielsenIQ/Dagligvarehandelen' },
  { country: 'no', metricType: 'privateLabel', category: 'Alle kjeder', value: 17.6, unit: '%', year: '2021', source: 'NielsenIQ/Dagligvarehandelen' },
  { country: 'no', metricType: 'privateLabel', category: 'Alle kjeder', value: 20.0, unit: '%', year: '2022', source: 'Regjeringen R15-2023 / NielsenIQ' },
  { country: 'no', metricType: 'privateLabel', category: 'Alle kjeder', value: 21.0, unit: '%', year: '2023', source: 'NielsenIQ/Dagligvarehandelen est.' },
  { country: 'no', metricType: 'privateLabel', category: 'Alle kjeder', value: 22.0, unit: '%', year: '2024', source: 'NielsenIQ/Dagligvarehandelen est.' },

  // NorgesGruppen EMV (First Price, Eldorado, Jacobs Utvalgte)
  { country: 'no', metricType: 'privateLabel', category: 'NorgesGruppen', value: 18.0, unit: '%', year: '2020', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'NorgesGruppen', value: 18.5, unit: '%', year: '2021', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'NorgesGruppen', value: 19.5, unit: '%', year: '2022', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'NorgesGruppen', value: 20.5, unit: '%', year: '2023', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'NorgesGruppen', value: 22.0, unit: '%', year: '2024', source: 'NielsenIQ/bransjeanalyse est.' },

  // Coop EMV (Xtra, Coop, Änglamark)
  { country: 'no', metricType: 'privateLabel', category: 'Coop', value: 25.0, unit: '%', year: '2020', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'Coop', value: 26.0, unit: '%', year: '2021', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'Coop', value: 27.5, unit: '%', year: '2022', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'Coop', value: 29.0, unit: '%', year: '2023', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'Coop', value: 30.0, unit: '%', year: '2024', source: 'NielsenIQ/bransjeanalyse est.' },

  // REMA 1000 EMV (Prima, Landlord, etc.)
  { country: 'no', metricType: 'privateLabel', category: 'REMA 1000', value: 20.0, unit: '%', year: '2020', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'REMA 1000', value: 21.5, unit: '%', year: '2021', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'REMA 1000', value: 23.5, unit: '%', year: '2022', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'REMA 1000', value: 26.0, unit: '%', year: '2023', source: 'NielsenIQ/bransjeanalyse est.' },
  { country: 'no', metricType: 'privateLabel', category: 'REMA 1000', value: 28.0, unit: '%', year: '2024', source: 'NielsenIQ/bransjeanalyse est.' },

  // ═══ Iceland (IS) — retailer market shares 2022 + 2024 ═══

  { country: 'is', metricType: 'retailerShare', category: 'Hagar (Bónus/Hagkaup)', value: 32.0, unit: '%', year: '2022', source: 'Samkeppniseftirlitið 2023' },
  { country: 'is', metricType: 'retailerShare', category: 'Samkaup (Nettó/Krónan)', value: 27.0, unit: '%', year: '2022', source: 'Samkeppniseftirlitið 2023' },
  { country: 'is', metricType: 'retailerShare', category: 'Festi (Krónan)', value: 18.0, unit: '%', year: '2022', source: 'Samkeppniseftirlitið 2023' },
  { country: 'is', metricType: 'retailerShare', category: 'Costco', value: 12.0, unit: '%', year: '2022', source: 'Samkeppniseftirlitið 2023' },
  { country: 'is', metricType: 'retailerShare', category: 'Andre', value: 11.0, unit: '%', year: '2022', source: 'Samkeppniseftirlitið 2023' },

  { country: 'is', metricType: 'retailerShare', category: 'Hagar (Bónus/Hagkaup)', value: 31.5, unit: '%', year: '2024', source: 'Samkeppniseftirlitið 2025' },
  { country: 'is', metricType: 'retailerShare', category: 'Samkaup (Nettó/Krónan)', value: 26.5, unit: '%', year: '2024', source: 'Samkeppniseftirlitið 2025' },
  { country: 'is', metricType: 'retailerShare', category: 'Festi (Krónan)', value: 18.5, unit: '%', year: '2024', source: 'Samkeppniseftirlitið 2025' },
  { country: 'is', metricType: 'retailerShare', category: 'Costco', value: 13.0, unit: '%', year: '2024', source: 'Samkeppniseftirlitið 2025' },
  { country: 'is', metricType: 'retailerShare', category: 'Andre', value: 10.5, unit: '%', year: '2024', source: 'Samkeppniseftirlitið 2025' },

  // Iceland HHI
  { country: 'is', metricType: 'hhi', category: 'dagligvare', value: 2407, unit: 'index', year: '2022', source: 'Beregnet fra markedsandeler', subtitle: '32² + 27² + 18² + 12² + 11²' },
  { country: 'is', metricType: 'hhi', category: 'dagligvare', value: 2378, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '31.5² + 26.5² + 18.5² + 13² + 10.5²' },

  // Iceland self-sufficiency
  { country: 'is', metricType: 'selfSufficiency', category: 'Melk', value: 100, unit: '%', year: '2022', source: 'Hagstofa Íslands 2023' },
  { country: 'is', metricType: 'selfSufficiency', category: 'Kjøtt (sau)', value: 100, unit: '%', year: '2022', source: 'Hagstofa Íslands 2023', subtitle: 'Lam/sau — hovedproduksjon' },
  { country: 'is', metricType: 'selfSufficiency', category: 'Fisk', value: 1500, unit: '%', year: '2022', source: 'Hagstofa Íslands 2023', subtitle: 'Stor netto eksportør — torsk, sild, reke' },
  { country: 'is', metricType: 'selfSufficiency', category: 'Korn', value: 0, unit: '%', year: '2022', source: 'Hagstofa Íslands 2023', subtitle: 'Ingen kornproduksjon — 100% import' },
  { country: 'is', metricType: 'selfSufficiency', category: 'Totalt', value: 50, unit: '%', year: '2022', source: 'Hagstofa Íslands 2023' },

  // Iceland food waste & emissions
  { country: 'is', metricType: 'foodWastePerCapita', category: 'Totalt', value: 95, unit: 'kg/capita', year: '2020', source: 'Umhverfisstofnun/Eurostat 2021' },
  { country: 'is', metricType: 'foodWastePerCapita', category: 'Totalt', value: 89, unit: 'kg/capita', year: '2022', source: 'Umhverfisstofnun/Eurostat 2023' },
  { country: 'is', metricType: 'ghgEmissions', category: 'Jordbruk', value: 0.5, unit: 'Mt CO2e', year: '2022', source: 'Umhverfisstofnun 2023' },
  { country: 'is', metricType: 'foodWastePerCapita', category: 'Totalt', value: 84, unit: 'kg/capita', year: '2024', source: 'Umhverfisstofnun 2025 est.' },

  // ═══ Nordic historical retailer shares 2022 (for time-series) ═══

  // Sweden 2022
  { country: 'se', metricType: 'retailerShare', category: 'ICA Gruppen', value: 51.2, unit: '%', year: '2022', source: 'Konkurrensverket 2023' },
  { country: 'se', metricType: 'retailerShare', category: 'Axfood', value: 22.1, unit: '%', year: '2022', source: 'Konkurrensverket 2023' },
  { country: 'se', metricType: 'retailerShare', category: 'Coop Sverige', value: 16.8, unit: '%', year: '2022', source: 'Konkurrensverket 2023' },
  { country: 'se', metricType: 'retailerShare', category: 'Lidl', value: 5.6, unit: '%', year: '2022', source: 'Konkurrensverket 2023' },
  { country: 'se', metricType: 'retailerShare', category: 'Andre', value: 4.3, unit: '%', year: '2022', source: 'Konkurrensverket 2023' },
  { country: 'se', metricType: 'hhi', category: 'dagligvare', value: 3533, unit: 'index', year: '2022', source: 'Beregnet fra markedsandeler', subtitle: '51.2² + 22.1² + 16.8² + 5.6² + 4.3²' },

  // Denmark 2022
  { country: 'dk', metricType: 'retailerShare', category: 'Salling Group', value: 34.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'retailerShare', category: 'Coop Danmark', value: 30.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'retailerShare', category: 'REMA 1000 DK', value: 18.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'retailerShare', category: 'Lidl DK', value: 4.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'retailerShare', category: 'Dagrofa', value: 5.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'retailerShare', category: 'Andre', value: 6.5, unit: '%', year: '2022', source: 'Konkurrence- og Forbrugerstyrelsen 2023' },
  { country: 'dk', metricType: 'hhi', category: 'dagligvare', value: 2750, unit: 'index', year: '2022', source: 'Beregnet fra markedsandeler', subtitle: '34.5² + 30.5² + 18.5² + 4.5² + 5.5² + 6.5²' },

  // Finland 2022
  { country: 'fi', metricType: 'retailerShare', category: 'S Group', value: 47.5, unit: '%', year: '2022', source: 'PTY/NielsenIQ 2023' },
  { country: 'fi', metricType: 'retailerShare', category: 'K Group (Kesko)', value: 35.8, unit: '%', year: '2022', source: 'PTY/NielsenIQ 2023' },
  { country: 'fi', metricType: 'retailerShare', category: 'Lidl FI', value: 9.2, unit: '%', year: '2022', source: 'PTY/NielsenIQ 2023' },
  { country: 'fi', metricType: 'retailerShare', category: 'Andre', value: 7.5, unit: '%', year: '2022', source: 'PTY/NielsenIQ 2023' },
  { country: 'fi', metricType: 'hhi', category: 'dagligvare', value: 3617, unit: 'index', year: '2022', source: 'Beregnet fra markedsandeler', subtitle: '47.5² + 35.8² + 9.2² + 7.5²' },

  // ═══ Nordic private label (EMV) shares 2024 — cross-country ═══

  { country: 'se', metricType: 'privateLabel', category: 'Alle kjeder', value: 30.0, unit: '%', year: '2024', source: 'DagligVaruNytt/NielsenIQ est.' },
  { country: 'dk', metricType: 'privateLabel', category: 'Alle kjeder', value: 35.0, unit: '%', year: '2024', source: 'Retail Institute Scandinavia est.' },
  { country: 'fi', metricType: 'privateLabel', category: 'Alle kjeder', value: 28.0, unit: '%', year: '2024', source: 'PTY/NielsenIQ est.' },
  { country: 'is', metricType: 'privateLabel', category: 'Alle kjeder', value: 15.0, unit: '%', year: '2024', source: 'Samkeppniseftirlitið est.' },
]

async function main() {
  console.log('Importing market metrics...\n')
  let imported = 0

  for (const m of metrics) {
    // DB-konvensjon er uppercase ISO ('NO', 'SE', ...) — kildedata her er
    // lowercase, så normaliseres ved upsert. Se fix-country-metric-uppercase.ts.
    const country = m.country.toUpperCase()
    await prisma.countryMetric.upsert({
      where: {
        country_metricType_category_year: {
          country,
          metricType: m.metricType,
          category: m.category,
          year: m.year,
        },
      },
      update: {
        value: m.value,
        unit: m.unit,
        source: m.source,
        subtitle: m.subtitle,
        metadata: m.metadata ?? undefined,
      },
      create: {
        country,
        metricType: m.metricType,
        category: m.category,
        value: m.value,
        unit: m.unit,
        year: m.year,
        source: m.source,
        subtitle: m.subtitle,
        metadata: m.metadata,
      },
    })

    console.log(`  ${m.metricType}/${m.category} ${m.year}: ${m.value}${m.unit === '%' ? '%' : ` (${m.unit})`}`)
    imported++
  }

  console.log(`\n${imported} market metrics imported`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
