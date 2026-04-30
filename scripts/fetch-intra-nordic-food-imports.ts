import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

type JsonStatDimension = {
  category: {
    index: Record<string, number> | string[]
    label?: Record<string, string>
  }
}

type JsonStatDataset = {
  id: string[]
  size: number[]
  dimension: Record<string, JsonStatDimension>
  value: number[] | Record<string, number>
}

type OutputRow = {
  country: string
  year: string
  commodity_group: string
  commodity_group_label: string
  flow: string
  metric: string
  unit: string
  total_import_value: number
  nordic_core_import_value: number
  nordic_core_share: number
  nordic_extended_import_value: number
  nordic_extended_share: number
  nordic_core_partner_codes: string
  nordic_extended_partner_codes: string
  source_name: string
  dataset_or_table_id: string
  source_raw_file: string
  status: string
  notes: string
}

const DK_ENDPOINT = 'https://api.statbank.dk/v1/data'
const FI_ENDPOINT =
  'https://statdb.luke.fi/PxWeb/api/v1/en/LUKE/maa/zzz_lak/05%20Maataloustuotteiden%20ulkomaankauppa/Luke_maa_Ukaup_kk.px'
const NO_ENDPOINT = 'https://data.ssb.no/api/v0/en/table/08801/'
const SE_ENDPOINT = 'https://api.scb.se/OV0104/v1/doris/en/ssd/HA/HA0201/HA0201B/ImpTotalKNAr'

const DK_RAW = 'research/data/nordic/trade-groups/raw-json/dk-food-group-imports-by-partner-monthly.json'
const FI_RAW = 'research/data/nordic/trade-groups/raw-json/fi-food-group-imports-by-partner-monthly.json'
const NO_TOTAL_RAW = 'research/data/nordic/trade-groups/raw-json/no-food-group-imports-annual.json'
const NO_RAW = 'research/data/nordic/trade-groups/raw-json/no-food-group-imports-by-partner-annual.json'
const SE_RAW = 'research/data/nordic/trade-groups/raw-json/se-food-group-imports-by-partner-annual.json'
const PARTIAL_OUT =
  'research/data/nordic/trade-groups/normalized/partial-intra-nordic-food-import-share-annual.csv'
const PARTIAL_META =
  'research/data/nordic/trade-groups/normalized/partial-intra-nordic-food-import-share-annual.meta.json'
const FULL_OUT = 'research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv'
const FULL_META = 'research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.meta.json'
const IS_PARTIAL =
  'research/data/nordic/trade-groups/normalized/is-intra-nordic-food-import-share-annual.csv'

const DK_TOTAL = 'W1'
const FI_TOTAL = 'AA'
const SE_TOTAL = 'TOT'

const DK_CORE = ['FI', 'IS', 'NO', 'SE']
const DK_EXTENDED = ['FI', 'FO', 'GL', 'IS', 'NO', 'SE']
const FI_CORE = ['DK', 'IS', 'NO', 'SE']
const FI_EXTENDED = ['DK', 'FO', 'GL', 'IS', 'NO', 'SE']
const NO_CORE = ['DK', 'FI', 'IS', 'SE']
const NO_EXTENDED = ['DK', 'FI', 'FO', 'GL', 'IS', 'SE']
const SE_CORE = ['DK', 'FI', 'IS', 'NO']
const SE_EXTENDED = ['DK', 'FI', 'FO', 'GL', 'IS', 'NO']

const DK_SITC_GROUPS: Record<string, [string, string]> = {
  '01': ['meat', 'Meat and meat preparations'],
  '02': ['dairy_eggs', 'Dairy products and eggs'],
  '03': ['fish_seafood', 'Fish and seafood'],
  '04': ['cereals', 'Cereals and cereal preparations'],
  '05': ['fruit_veg', 'Fruit and vegetables'],
  '41': ['fats_oils', 'Fats and oils'],
  '42': ['fats_oils', 'Fats and oils'],
  '43': ['fats_oils', 'Fats and oils'],
}

const GROUP_LABELS: Record<string, string> = {
  meat: 'Meat and meat preparations',
  dairy_eggs: 'Dairy products and eggs',
  fish_seafood: 'Fish and seafood',
  cereals: 'Cereals and cereal preparations',
  fruit_veg: 'Fruit and vegetables',
  fats_oils: 'Fats and oils',
  selected_food_basket: 'Selected food basket',
}

function ensureParent(filePath: string) {
  mkdirSync(dirname(filePath), { recursive: true })
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T
}

function codesFromIndex(index: Record<string, number> | string[]): string[] {
  if (Array.isArray(index)) return index
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code)
}

function getDataset(payload: unknown): JsonStatDataset {
  const value = payload as { dataset?: JsonStatDataset }
  return normalizeDataset(value.dataset ?? (payload as JsonStatDataset))
}

function normalizeDataset(dataset: JsonStatDataset): JsonStatDataset {
  const dimension = dataset.dimension as Record<string, JsonStatDimension> & {
    id?: string[]
    size?: number[]
  }
  return {
    ...dataset,
    id: dataset.id ?? dimension.id ?? [],
    size: dataset.size ?? dimension.size ?? [],
  }
}

function getValue(dataset: JsonStatDataset, indicesByDim: Record<string, number>): number {
  const indices = dataset.id.map((dim) => indicesByDim[dim] ?? 0)
  let offset = 0
  let stride = 1
  for (let i = dataset.size.length - 1; i >= 0; i -= 1) {
    offset += indices[i] * stride
    stride *= dataset.size[i]
  }
  if (Array.isArray(dataset.value)) return dataset.value[offset] ?? 0
  return dataset.value[String(offset)] ?? 0
}

function yearFromPeriod(period: string): string {
  return period.slice(0, 4)
}

function fiProductGroup(code: string): [string, string] | null {
  if (code.startsWith('02')) return ['meat', GROUP_LABELS.meat]
  if (code.startsWith('03')) return ['fish_seafood', GROUP_LABELS.fish_seafood]
  if (code.startsWith('04')) return ['dairy_eggs', GROUP_LABELS.dairy_eggs]
  if (code.startsWith('10')) return ['cereals', GROUP_LABELS.cereals]
  if (code.startsWith('07') || code.startsWith('08')) return ['fruit_veg', GROUP_LABELS.fruit_veg]
  if (code.startsWith('15')) return ['fats_oils', GROUP_LABELS.fats_oils]
  return null
}

function cnProductGroup(code: string): [string, string] | null {
  if (code.startsWith('02')) return ['meat', GROUP_LABELS.meat]
  if (code.startsWith('03')) return ['fish_seafood', GROUP_LABELS.fish_seafood]
  if (code.startsWith('04')) return ['dairy_eggs', GROUP_LABELS.dairy_eggs]
  if (code.startsWith('10')) return ['cereals', GROUP_LABELS.cereals]
  if (code.startsWith('07') || code.startsWith('08')) return ['fruit_veg', GROUP_LABELS.fruit_veg]
  if (code.startsWith('15')) return ['fats_oils', GROUP_LABELS.fats_oils]
  return null
}

function aggregateDataset(options: {
  country: 'DK' | 'FI' | 'SE'
  dataset: JsonStatDataset
  commodityDim: string
  partnerDim: string
  timeDim: string
  totalPartner: string
  corePartners: string[]
  extendedPartners: string[]
  groupForCommodity: (code: string) => [string, string] | null
  unit: string
  sourceName: string
  tableId: string
  rawFile: string
  status: string
  notes: string
}): OutputRow[] {
  const commodityCodes = codesFromIndex(options.dataset.dimension[options.commodityDim].category.index)
  const partnerCodes = codesFromIndex(options.dataset.dimension[options.partnerDim].category.index)
  const timeCodes = codesFromIndex(options.dataset.dimension[options.timeDim].category.index)

  const core = new Set(options.corePartners)
  const extended = new Set(options.extendedPartners)
  const allowedPartners = new Set([options.totalPartner, ...options.corePartners, ...options.extendedPartners])

  const aggregate = new Map<string, { total: number; core: number; extended: number; label: string }>()

  for (let commodityIndex = 0; commodityIndex < commodityCodes.length; commodityIndex += 1) {
    const commodityCode = commodityCodes[commodityIndex]
    const group = options.groupForCommodity(commodityCode)
    if (!group) continue

    for (let partnerIndex = 0; partnerIndex < partnerCodes.length; partnerIndex += 1) {
      const partnerCode = partnerCodes[partnerIndex]
      if (!allowedPartners.has(partnerCode)) continue

      for (let timeIndex = 0; timeIndex < timeCodes.length; timeIndex += 1) {
        const period = timeCodes[timeIndex]
        const year = yearFromPeriod(period)
        const value = getValue(options.dataset, {
          [options.commodityDim]: commodityIndex,
          [options.partnerDim]: partnerIndex,
          [options.timeDim]: timeIndex,
        })
        if (!value) continue
        const key = `${options.country}|${year}|${group[0]}`
        const current = aggregate.get(key) ?? { total: 0, core: 0, extended: 0, label: group[1] }
        if (partnerCode === options.totalPartner) current.total += value
        if (core.has(partnerCode)) current.core += value
        if (extended.has(partnerCode)) current.extended += value
        aggregate.set(key, current)
      }
    }
  }

  const rows: OutputRow[] = []
  const basket = new Map<string, { total: number; core: number; extended: number }>()

  for (const [key, value] of aggregate.entries()) {
    const [country, year, commodityGroup] = key.split('|')
    rows.push(buildRow({
      country,
      year,
      commodityGroup,
      label: value.label,
      total: value.total,
      core: value.core,
      extended: value.extended,
      unit: options.unit,
      corePartners: options.corePartners,
      extendedPartners: options.extendedPartners,
      sourceName: options.sourceName,
      tableId: options.tableId,
      rawFile: options.rawFile,
      status: options.status,
      notes: options.notes,
    }))
    const basketKey = `${country}|${year}`
    const basketCurrent = basket.get(basketKey) ?? { total: 0, core: 0, extended: 0 }
    basketCurrent.total += value.total
    basketCurrent.core += value.core
    basketCurrent.extended += value.extended
    basket.set(basketKey, basketCurrent)
  }

  for (const [key, value] of basket.entries()) {
    const [country, year] = key.split('|')
    rows.push(buildRow({
      country,
      year,
      commodityGroup: 'selected_food_basket',
      label: GROUP_LABELS.selected_food_basket,
      total: value.total,
      core: value.core,
      extended: value.extended,
      unit: options.unit,
      corePartners: options.corePartners,
      extendedPartners: options.extendedPartners,
      sourceName: options.sourceName,
      tableId: options.tableId,
      rawFile: options.rawFile,
      status: options.status,
      notes: options.notes,
    }))
  }

  return rows.sort(
    (a, b) => a.country.localeCompare(b.country) || a.year.localeCompare(b.year) || a.commodity_group.localeCompare(b.commodity_group),
  )
}

function aggregateNoRows(
  totalChunks: {
    year: string
    group_totals: Record<string, string | number>
  }[],
  partnerChunks: {
    year: string
    response: unknown
  }[],
): OutputRow[] {
  const totalByYear = new Map(totalChunks.map((chunk) => [chunk.year, chunk.group_totals]))
  const core = new Set(NO_CORE)
  const extended = new Set(NO_EXTENDED)
  const rows: OutputRow[] = []

  for (const chunk of partnerChunks) {
    const dataset = getDataset(chunk.response)
    const commodityCodes = codesFromIndex(dataset.dimension.Varekoder.category.index)
    const partnerCodes = codesFromIndex(dataset.dimension.Land.category.index)
    const timeCodes = codesFromIndex(dataset.dimension.Tid.category.index)
    const aggregate = new Map<string, { core: number; extended: number; label: string }>()

    for (let commodityIndex = 0; commodityIndex < commodityCodes.length; commodityIndex += 1) {
      const commodityCode = commodityCodes[commodityIndex]
      const group = cnProductGroup(commodityCode)
      if (!group) continue

      for (let partnerIndex = 0; partnerIndex < partnerCodes.length; partnerIndex += 1) {
        const partnerCode = partnerCodes[partnerIndex]
        if (!extended.has(partnerCode)) continue

        for (let timeIndex = 0; timeIndex < timeCodes.length; timeIndex += 1) {
          const value = getValue(dataset, {
            Varekoder: commodityIndex,
            Land: partnerIndex,
            Tid: timeIndex,
          })
          if (!value) continue
          const current = aggregate.get(group[0]) ?? { core: 0, extended: 0, label: group[1] }
          if (core.has(partnerCode)) current.core += value
          current.extended += value
          aggregate.set(group[0], current)
        }
      }
    }

    const totals = totalByYear.get(chunk.year)
    if (!totals) throw new Error(`Missing NO total chunk for ${chunk.year}`)

    let basketTotal = 0
    let basketCore = 0
    let basketExtended = 0

    for (const [commodityGroup, value] of aggregate.entries()) {
      const total = Number(totals[commodityGroup] ?? 0)
      basketTotal += total
      basketCore += value.core
      basketExtended += value.extended
      rows.push(
        buildRow({
          country: 'NO',
          year: chunk.year,
          commodityGroup,
          label: value.label,
          total,
          core: value.core,
          extended: value.extended,
          unit: 'NOK',
          corePartners: NO_CORE,
          extendedPartners: NO_EXTENDED,
          sourceName: 'SSB external trade by commodity number',
          tableId: '08801',
          rawFile: NO_RAW,
          status: 'partner_refetch',
          notes:
            'Nordic partner values refetched from SSB 08801 using the existing commodity-code basket; total import values reused from the established all-country SSB 08801 extract.',
        }),
      )
    }

    rows.push(
      buildRow({
        country: 'NO',
        year: chunk.year,
        commodityGroup: 'selected_food_basket',
        label: GROUP_LABELS.selected_food_basket,
        total: basketTotal,
        core: basketCore,
        extended: basketExtended,
        unit: 'NOK',
        corePartners: NO_CORE,
        extendedPartners: NO_EXTENDED,
        sourceName: 'SSB external trade by commodity number',
        tableId: '08801',
        rawFile: NO_RAW,
        status: 'partner_refetch',
        notes:
          'Nordic partner values refetched from SSB 08801 using the existing commodity-code basket; total import values reused from the established all-country SSB 08801 extract.',
      }),
    )
  }

  return rows.sort(
    (a, b) => a.country.localeCompare(b.country) || a.year.localeCompare(b.year) || a.commodity_group.localeCompare(b.commodity_group),
  )
}

function buildRow(input: {
  country: string
  year: string
  commodityGroup: string
  label: string
  total: number
  core: number
  extended: number
  unit: string
  corePartners: string[]
  extendedPartners: string[]
  sourceName: string
  tableId: string
  rawFile: string
  status: string
  notes: string
}): OutputRow {
  return {
    country: input.country,
    year: input.year,
    commodity_group: input.commodityGroup,
    commodity_group_label: input.label,
    flow: 'imports',
    metric: 'Import value',
    unit: input.unit,
    total_import_value: Number(input.total.toFixed(3)),
    nordic_core_import_value: Number(input.core.toFixed(3)),
    nordic_core_share: input.total ? Number((input.core / input.total).toFixed(6)) : 0,
    nordic_extended_import_value: Number(input.extended.toFixed(3)),
    nordic_extended_share: input.total ? Number((input.extended / input.total).toFixed(6)) : 0,
    nordic_core_partner_codes: input.corePartners.join(';'),
    nordic_extended_partner_codes: input.extendedPartners.join(';'),
    source_name: input.sourceName,
    dataset_or_table_id: input.tableId,
    source_raw_file: input.rawFile,
    status: input.status,
    notes: input.notes,
  }
}

function writeCsv(filePath: string, rows: OutputRow[]) {
  ensureParent(filePath)
  const headers = Object.keys(rows[0]) as (keyof OutputRow)[]
  const text = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n')
  writeFileSync(filePath, `${text}\n`)
}

function combineRows(rows: OutputRow[]): OutputRow[] {
  const grouped = new Map<string, OutputRow>()
  for (const row of rows) {
    const key = `${row.country}|${row.year}|${row.commodity_group}`
    const current = grouped.get(key)
    if (!current) {
      grouped.set(key, { ...row })
      continue
    }
    current.total_import_value += row.total_import_value
    current.nordic_core_import_value += row.nordic_core_import_value
    current.nordic_extended_import_value += row.nordic_extended_import_value
  }

  return [...grouped.values()]
    .map((row) => ({
      ...row,
      total_import_value: Number(row.total_import_value.toFixed(3)),
      nordic_core_import_value: Number(row.nordic_core_import_value.toFixed(3)),
      nordic_core_share: row.total_import_value
        ? Number((row.nordic_core_import_value / row.total_import_value).toFixed(6))
        : 0,
      nordic_extended_import_value: Number(row.nordic_extended_import_value.toFixed(3)),
      nordic_extended_share: row.total_import_value
        ? Number((row.nordic_extended_import_value / row.total_import_value).toFixed(6))
        : 0,
    }))
    .sort(
      (a, b) =>
        a.country.localeCompare(b.country) ||
        a.year.localeCompare(b.year) ||
        a.commodity_group.localeCompare(b.commodity_group),
    )
}

function readCsv(filePath: string): OutputRow[] {
  const text = readFileSync(filePath, 'utf8').trim()
  if (!text) return []
  const lines = text.split(/\r?\n/)
  const headers = splitCsvLine(lines[0]) as (keyof OutputRow)[]
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? ''
    })
    return {
      ...row,
      total_import_value: Number(row.total_import_value),
      nordic_core_import_value: Number(row.nordic_core_import_value),
      nordic_core_share: Number(row.nordic_core_share),
      nordic_extended_import_value: Number(row.nordic_extended_import_value),
      nordic_extended_share: Number(row.nordic_extended_share),
    } as OutputRow
  })
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      out.push(current)
      current = ''
    } else {
      current += char
    }
  }
  out.push(current)
  return out
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = { text }
  }
  return { response_status_code: response.status, response_content_type: response.headers.get('content-type'), response: parsed }
}

async function main() {
  const dkSeed = readJson<{ request: { variables: { code: string; values: string[] }[] } }>(
    'research/data/nordic/trade-groups/raw-json/dk-food-group-imports-monthly.json',
  )
  const fiSeed = readJson<{ request: { query: { code: string; selection: { filter: string; values: string[] } }[] } }>(
    'research/data/nordic/trade-groups/raw-json/fi-food-group-imports-monthly.json',
  )
  const noSeed = readJson<{
    chunks: {
      year: string
      group_totals: Record<string, string | number>
      request: { query: { code: string; selection: { filter: string; values: string[] } }[] }
    }[]
  }>(NO_TOTAL_RAW)

  const dkRequest = structuredClone(dkSeed.request)
  dkRequest.variables = dkRequest.variables.map((variable) =>
    variable.code === 'LAND' ? { ...variable, values: [DK_TOTAL, ...DK_EXTENDED] } : variable,
  )

  const fiPartners = [FI_TOTAL, ...FI_EXTENDED]
  const seYears = noSeed.chunks.map((chunk) => chunk.year)
  const seRequest = {
    query: [
      {
        code: 'VarugruppKN',
        selection: { filter: 'item', values: ['02', '03', '04', '07', '08', '10', '15'] },
      },
      {
        code: 'Handelspartner',
        selection: { filter: 'item', values: [SE_TOTAL, ...SE_EXTENDED] },
      },
      {
        code: 'ContentsCode',
        selection: { filter: 'item', values: ['HA0201D8'] },
      },
      {
        code: 'Tid',
        selection: { filter: 'item', values: seYears },
      },
    ],
    response: { format: 'json-stat2' },
  }

  const dkFetched = await postJson(DK_ENDPOINT, dkRequest)
  const seFetched = await postJson(SE_ENDPOINT, seRequest)
  const fiChunks = []
  for (const partner of fiPartners) {
    const partnerRequest = structuredClone(fiSeed.request)
    partnerRequest.query = partnerRequest.query.map((query) =>
      query.code === 'maa' ? { ...query, selection: { filter: 'item', values: [partner] } } : query,
    )
    const fetched = await postJson(FI_ENDPOINT, partnerRequest)
    fiChunks.push({ partner, request: partnerRequest, ...fetched })
  }

  const noChunks = []
  for (const seedChunk of noSeed.chunks) {
    const partnerRequest = structuredClone(seedChunk.request)
    partnerRequest.query = partnerRequest.query.map((query) =>
      query.code === 'Land' ? { ...query, selection: { filter: 'item', values: NO_EXTENDED } } : query,
    )
    const fetched = await postJson(NO_ENDPOINT, partnerRequest)
    noChunks.push({ year: seedChunk.year, request: partnerRequest, ...fetched })
  }

  ensureParent(DK_RAW)
  ensureParent(FI_RAW)
  ensureParent(NO_RAW)
  ensureParent(SE_RAW)
  writeFileSync(DK_RAW, JSON.stringify({ request: dkRequest, ...dkFetched }, null, 2))
  writeFileSync(FI_RAW, JSON.stringify({ chunks: fiChunks }, null, 2))
  writeFileSync(
    NO_RAW,
    JSON.stringify({ total_source_file: NO_TOTAL_RAW, source_endpoint: NO_ENDPOINT, chunks: noChunks }, null, 2),
  )
  writeFileSync(SE_RAW, JSON.stringify({ request: seRequest, ...seFetched }, null, 2))

  if (dkFetched.response_status_code >= 400) throw new Error(`DK fetch failed: HTTP ${dkFetched.response_status_code}`)
  if (seFetched.response_status_code >= 400) throw new Error(`SE fetch failed: HTTP ${seFetched.response_status_code}`)
  for (const chunk of fiChunks) {
    if (chunk.response_status_code >= 400) {
      throw new Error(`FI fetch failed for ${chunk.partner}: HTTP ${chunk.response_status_code}`)
    }
  }
  for (const chunk of noChunks) {
    if (chunk.response_status_code >= 400) {
      throw new Error(`NO fetch failed for ${chunk.year}: HTTP ${chunk.response_status_code}`)
    }
  }

  const dkDataset = getDataset(dkFetched.response)
  const seDataset = getDataset(seFetched.response)

  const dkRows = aggregateDataset({
    country: 'DK',
    dataset: dkDataset,
    commodityDim: 'SITC',
    partnerDim: 'LAND',
    timeDim: 'Tid',
    totalPartner: DK_TOTAL,
    corePartners: DK_CORE,
    extendedPartners: DK_EXTENDED,
    groupForCommodity: (code) => DK_SITC_GROUPS[code] ?? null,
    unit: 'DKK 1,000',
    sourceName: 'StatBank imports and exports SITC',
    tableId: 'SITC2R4',
    rawFile: DK_RAW,
    status: 'partner_refetch',
    notes: 'Refetched from StatBank SITC2R4 with Nordic partner countries and W1 total; use shares, not cross-country values.',
  })

  const seRows = aggregateDataset({
    country: 'SE',
    dataset: seDataset,
    commodityDim: 'VarugruppKN',
    partnerDim: 'Handelspartner',
    timeDim: 'Tid',
    totalPartner: SE_TOTAL,
    corePartners: SE_CORE,
    extendedPartners: SE_EXTENDED,
    groupForCommodity: cnProductGroup,
    unit: 'SEK 1,000',
    sourceName: 'SCB imports by CN and trading partner',
    tableId: 'ImpTotalKNAr',
    rawFile: SE_RAW,
    status: 'partner_refetch',
    notes:
      'Fetched from SCB ImpTotalKNAr with CN two-digit food groups, Nordic partner countries and TOT total; use shares, not cross-country values.',
  })

  const fiRows = combineRows(
    fiChunks.flatMap((chunk) =>
      aggregateDataset({
        country: 'FI',
        dataset: getDataset(chunk.response),
        commodityDim: 'tuoteryhmä',
        partnerDim: 'maa',
        timeDim: 'kuukausi',
        totalPartner: FI_TOTAL,
        corePartners: FI_CORE,
        extendedPartners: FI_EXTENDED,
        groupForCommodity: fiProductGroup,
        unit: '1000 EUR',
        sourceName: 'Luke agri-food foreign trade',
        tableId: 'Luke_maa_Ukaup_kk.px',
        rawFile: FI_RAW,
        status: 'partner_refetch',
        notes: 'Refetched from Luke agri-food foreign trade with Nordic partner countries and AA total in per-partner chunks; use shares, not cross-country values.',
      }),
    ),
  )

  const noRows = aggregateNoRows(noSeed.chunks, noChunks)
  const isRows = readCsv(IS_PARTIAL).filter((row) => Number(row.year) <= 2025)
  const partialRows = [...dkRows, ...fiRows, ...isRows, ...noRows, ...seRows].sort(
    (a, b) => a.country.localeCompare(b.country) || a.year.localeCompare(b.year) || a.commodity_group.localeCompare(b.commodity_group),
  )
  writeCsv(PARTIAL_OUT, partialRows)
  writeCsv(FULL_OUT, partialRows)
  const panelMeta = (outputFile: string) => ({
    generated_at: new Date().toISOString(),
    owner: 'Food Systems 2026',
    output_file: outputFile,
    status: 'all_five_countries_partner_panel',
    countries: ['DK', 'FI', 'IS', 'NO', 'SE'],
    missing_countries: [],
    source_raw_files: [DK_RAW, FI_RAW, IS_PARTIAL, NO_RAW, SE_RAW],
    compatibility_note:
      outputFile === PARTIAL_OUT
        ? 'Legacy partial filename retained for existing references; content now covers all five Nordic countries.'
        : 'Canonical all-country panel for Nordic Vision 2030 indicator 2.5.2 proxy work.',
    notes: [
      'DK and FI are partner-specific refetches from official API endpoints.',
      'FI endpoint was updated from the old local registry path to the current Luke PXWeb discontinued-statistics path under maa/zzz_lak.',
      'NO Nordic partner values are refetched from SSB 08801; NO total import values are reused from the existing all-country SSB 08801 annual extract.',
      'SE is fetched from SCB ImpTotalKNAr using CN two-digit groups and the explicit TOT trading-partner total.',
      'IS is derived from existing Statistics Iceland raw JSON-stat response and limited to complete years through 2025 in the merged all-country file.',
      'Use shares within each reporting country; source units and classifications differ across countries.',
    ],
  })
  writeFileSync(PARTIAL_META, `${JSON.stringify(panelMeta(PARTIAL_OUT), null, 2)}\n`)
  writeFileSync(FULL_META, `${JSON.stringify(panelMeta(FULL_OUT), null, 2)}\n`)

  const selected = partialRows.filter((row) => row.commodity_group === 'selected_food_basket')
  console.log(
    JSON.stringify(
      {
        raw: [DK_RAW, FI_RAW, NO_RAW, SE_RAW],
        output: [PARTIAL_OUT, FULL_OUT],
        rows: partialRows.length,
        selectedLatestByCountry: Object.fromEntries(
          ['DK', 'FI', 'IS', 'NO', 'SE'].map((country) => {
            const rows = selected.filter((row) => row.country === country)
            const latest = rows.at(-1)
            return [country, latest]
          }),
        ),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
