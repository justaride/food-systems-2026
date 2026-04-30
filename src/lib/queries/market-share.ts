import { promises as fs } from 'node:fs'
import path from 'node:path'
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

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

async function readMarketShareCsv(): Promise<NoMarketShareRow[]> {
  let text: string
  try {
    text = await fs.readFile(path.join(NORDIC_DATA_ROOT, ...NO_MARKET_SHARE_PATH), 'utf8')
  } catch {
    return []
  }
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = parseCsvLine(lines[0])
  const idx = (key: string) => header.indexOf(key)

  return lines.slice(1).flatMap(line => {
    const values = parseCsvLine(line)
    if (values.length < header.length) return []
    const year = Number(values[idx('year')])
    if (!Number.isFinite(year)) return []
    return [{
      year,
      norgesgruppen: Number(values[idx('norgesgruppen_pct')]),
      coop: Number(values[idx('coop_pct')]),
      rema: Number(values[idx('rema_pct')]),
      bunnpris: Number(values[idx('bunnpris_pct')]),
      cr3: Number(values[idx('cr3_pct')]),
      hhi: Number(values[idx('hhi_revenue_share')]),
      sourceMethod: values[idx('source_method')] ?? '',
      sourceNote: values[idx('source_note')] ?? '',
      sourceUrl: values[idx('source_url')] ?? '',
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
