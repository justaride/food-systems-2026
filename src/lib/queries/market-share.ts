import { promises as fs } from 'node:fs'
import path from 'node:path'
import { parseCsvRecords } from '@/lib/csv'
import type { VisualizationDataContract } from '@/lib/visualization/types'

const NORDIC_DATA_ROOT = path.join(process.cwd(), 'research', 'data', 'nordic')
const NO_MARKET_SHARE_PATH = ['market-share', 'no-grocery-market-share-2020-2024.csv']

export type NoMarketShareRow = {
  year: number
  norgesgruppen: number
  coop: number
  rema: number
  bunnpris: number
  cr3: number
  hhi: number
  sourceMethod: string
  sourceNote: string
  sourceUrl: string
}

export type NoMarketShareTimeSeries = {
  rows: NoMarketShareRow[]
  contract: VisualizationDataContract
}

async function readMarketShareCsv(): Promise<NoMarketShareRow[]> {
  let text: string
  try {
    text = await fs.readFile(path.join(NORDIC_DATA_ROOT, ...NO_MARKET_SHARE_PATH), 'utf8')
  } catch {
    return []
  }
  return parseCsvRecords(text).flatMap(record => {
    const year = Number(record.year)
    if (!Number.isFinite(year)) return []
    return [{
      year,
      norgesgruppen: Number(record.norgesgruppen_pct),
      coop: Number(record.coop_pct),
      rema: Number(record.rema_pct),
      bunnpris: Number(record.bunnpris_pct),
      cr3: Number(record.cr3_pct),
      hhi: Number(record.hhi_revenue_share),
      sourceMethod: record.source_method ?? '',
      sourceNote: record.source_note ?? '',
      sourceUrl: record.source_url ?? '',
    }]
  })
}

export async function getNorwayMarketShareTimeSeries(): Promise<NoMarketShareTimeSeries> {
  const rows = await readMarketShareCsv()
  const sourceUrl = rows[0]?.sourceUrl ?? 'https://konkurransetilsynet.no/'
  const periodStart = rows[0]?.year
  const periodEnd = rows[rows.length - 1]?.year
  const period = periodStart && periodEnd ? `${periodStart}–${periodEnd} (årlig)` : 'årlig'

  const contract: VisualizationDataContract = {
    question: 'Hvordan har konsentrasjonen i norsk dagligvarehandel utviklet seg?',
    unit: '% omsetningsandel',
    period,
    evidenceStatus: 'observed',
    sourceRefs: [
      {
        label: 'Konkurransetilsynet — Dagligvarerapport 2024/25',
        href: sourceUrl,
        path: 'research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv',
      },
    ],
    coverageNote:
      '2020–2021 er NielsenIQ-tall; 2022–2024 er Konkurransetilsynets beregning fra kjederapportert omsetning. Skift av metode kan gi mindre brudd i tidsserien.',
  }

  return { rows, contract }
}
