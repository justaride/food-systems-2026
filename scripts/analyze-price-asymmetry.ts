/**
 * AP-7 — Pris-asymmetri («rockets and feathers») per verdikjede-ledd
 *
 * Dybdeanalyse-arbeidspakke 7 fra
 * docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
 *
 * Hypotese (ikke-opplagt): prisøkninger slår raskere og fullere gjennom
 * nedstrøms enn prisfall gjør. AP-7 bekreftet dette for laks→foredling
 * 2026-06-14, men koeffisientene der ble regnet av en subagent uten skript
 * (se §7 i funnnotatet: «bør re-verifiseres»). Dette skriptet gjør beregningen
 * reproduserbar og legger til det leddet som sto igjen som needs-data:
 * fôr→oppdrett.
 *
 * Ledd:
 *   laks-foredling  Oppstrøms lakseråpris (SSB 03024) → foredlings-PPI
 *                   (SSB 12462, SNN102). Reproduksjon av juni-funnet, men med
 *                   hjemme-/eksportmarked hver for seg — det er valutakontrollen
 *                   funnnotatets §4 krever før ekstern bruk.
 *   for-oppdrett    Fôrråvarepris (Verdensbankens Pink Sheet, USD/tonn) →
 *                   lakseråpris (SSB 03024). §6b slo fast at ingen månedlig
 *                   norsk fôr-PPI finnes; dette er proxy-veien §6b anbefalte,
 *                   med USDNOK som eksogen regressor slik at asymmetrien ikke
 *                   blir en ren valutaeffekt.
 *
 * DB-fri: alt hentes fra åpne API-er (SSB JSON-stat, Norges Bank SDMX,
 * Verdensbanken). Ingen DATABASE_URL nødvendig.
 *
 * Claim-disiplin: dette måler prisatferd i kjeden, ikke intensjon eller
 * marginbygging. Resultatet er et internt analysefunn og går gjennom
 * claim-lock/PCQ før ekstern bruk. Fôr-leddet er en PROXY (importert
 * råvarepris), ikke en norsk fôr-PPI — det skal alltid sies eksplisitt.
 *
 * Bruk:
 *   npx tsx scripts/analyze-price-asymmetry.ts --leg=for-oppdrett
 *   npx tsx scripts/analyze-price-asymmetry.ts --leg=alle --out=research/analyse/ap7-prisasymmetri.json
 *   npx tsx scripts/analyze-price-asymmetry.ts --leg=alle --from=2019M01 --to=2026M07
 *   npx tsx scripts/analyze-price-asymmetry.ts --dry-run   # bare seriedekning
 */

import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { inflateRawSync } from 'node:zlib'

const SSB_API = 'https://data.ssb.no/api/v0/no/table'
const NORGES_BANK_EXR = 'https://data.norges-bank.no/api/data/EXR'
const WORLD_BANK_CMO_PAGE = 'https://www.worldbank.org/en/research/commodity-markets'

const DEFAULT_FROM = '2019M01'
const MAX_LAG = 3

// ---------------------------------------------------------------------------
// Lineær algebra (holdt minimal og lokal — ingen ny avhengighet)
// ---------------------------------------------------------------------------

/** Inverterer en kvadratisk matrise med Gauss-Jordan og delvis pivotering. */
export function matInv(a: number[][]): number[][] {
  const n = a.length
  const m = a.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r
    if (Math.abs(m[pivot][col]) < 1e-12) throw new Error('matInv: singulær matrise')
    ;[m[col], m[pivot]] = [m[pivot], m[col]]
    const d = m[col][col]
    for (let j = 0; j < 2 * n; j++) m[col][j] /= d
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = m[r][col]
      if (f === 0) continue
      for (let j = 0; j < 2 * n; j++) m[r][j] -= f * m[col][j]
    }
  }
  return m.map(row => row.slice(n))
}

export type OlsResult = {
  /** Koeffisienter, i samme rekkefølge som kolonnene i X. */
  beta: number[]
  /** Klassiske OLS-standardfeil. */
  se: number[]
  /** Newey-West HAC-standardfeil (autokorrelasjonsrobuste). */
  seHac: number[]
  /** Kovariansmatrise, OLS. Brukes til kontraster (f.eks. β⁺ − β⁻). */
  vcov: number[][]
  /** Kovariansmatrise, Newey-West HAC. */
  vcovHac: number[][]
  r2: number
  n: number
  k: number
}

/**
 * OLS med både klassiske og Newey-West-standardfeil.
 * X inkluderer konstantledd som første kolonne dersom modellen skal ha det.
 */
export function ols(y: number[], X: number[][]): OlsResult {
  const n = y.length
  const k = X[0].length
  if (n <= k) throw new Error(`ols: for få observasjoner (n=${n}, k=${k})`)

  const xtx = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0))
  )
  const xty = Array.from({ length: k }, (_, i) => X.reduce((s, row, t) => s + row[i] * y[t], 0))
  const xtxInv = matInv(xtx)
  const beta = xtxInv.map(row => row.reduce((s, v, j) => s + v * xty[j], 0))

  const resid = y.map((yi, t) => yi - X[t].reduce((s, v, j) => s + v * beta[j], 0))
  const rss = resid.reduce((s, e) => s + e * e, 0)
  const yMean = y.reduce((s, v) => s + v, 0) / n
  const tss = y.reduce((s, v) => s + (v - yMean) ** 2, 0)
  const sigma2 = rss / (n - k)

  const vcov = xtxInv.map(row => row.map(v => v * sigma2))

  // Newey-West med Bartlett-vekter; standard båndbredde floor(4*(n/100)^(2/9)).
  const L = Math.max(1, Math.floor(4 * Math.pow(n / 100, 2 / 9)))
  const S = Array.from({ length: k }, () => Array.from({ length: k }, () => 0))
  for (let t = 0; t < n; t++) {
    for (let i = 0; i < k; i++)
      for (let j = 0; j < k; j++) S[i][j] += resid[t] * resid[t] * X[t][i] * X[t][j]
  }
  for (let l = 1; l <= L; l++) {
    const w = 1 - l / (L + 1)
    for (let t = l; t < n; t++) {
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++) {
          const cross = resid[t] * resid[t - l] * (X[t][i] * X[t - l][j] + X[t - l][i] * X[t][j])
          S[i][j] += w * cross
        }
    }
  }
  const tmp = xtxInv.map(row => row.map((_, j) => row.reduce((s, v, m) => s + v * S[m][j], 0)))
  const vcovHac = tmp.map(row => row.map((_, j) => row.reduce((s, v, m) => s + v * xtxInv[m][j], 0)))

  return {
    beta,
    se: vcov.map((row, i) => Math.sqrt(Math.max(row[i], 0))),
    seHac: vcovHac.map((row, i) => Math.sqrt(Math.max(row[i], 0))),
    vcov,
    vcovHac,
    r2: tss === 0 ? 0 : 1 - rss / tss,
    n,
    k,
  }
}

/** Standardfeilen til en lineær kontrast c'β, gitt en kovariansmatrise. */
export function contrastSe(c: number[], vcov: number[][]): number {
  let v = 0
  for (let i = 0; i < c.length; i++)
    for (let j = 0; j < c.length; j++) v += c[i] * c[j] * vcov[i][j]
  return Math.sqrt(Math.max(v, 0))
}

// ---------------------------------------------------------------------------
// Asymmetri-spesifikasjoner
// ---------------------------------------------------------------------------

/** Deler en endringsserie i positiv og negativ del (Δx⁺ = max(Δx,0), Δx⁻ = min(Δx,0)). */
export function splitChanges(deltas: number[]): { up: number[]; down: number[] } {
  return {
    up: deltas.map(d => Math.max(d, 0)),
    down: deltas.map(d => Math.min(d, 0)),
  }
}

/** Kumulative delsummer av positive og negative endringer (NARDL-partialsummer). */
export function partialSums(deltas: number[]): { up: number[]; down: number[] } {
  const up: number[] = []
  const down: number[] = []
  let su = 0
  let sd = 0
  for (const d of deltas) {
    su += Math.max(d, 0)
    sd += Math.min(d, 0)
    up.push(su)
    down.push(sd)
  }
  return { up, down }
}

export function logDiff(series: number[]): number[] {
  const out: number[] = []
  for (let i = 1; i < series.length; i++) out.push(Math.log(series[i]) - Math.log(series[i - 1]))
  return out
}

export type AsymmetryFit = {
  cumulativeUp: number
  cumulativeDown: number
  asymmetry: number
  tUp: number
  tDown: number
  tAsymmetry: number
  tAsymmetryHac: number
  r2: number
  n: number
}

/**
 * Distribuert-lag i differanser, opp/ned-splittet:
 *   Δy_t = α + Σ_{i=0..L} β⁺_i Δx⁺_{t-i} + Σ_{i=0..L} β⁻_i Δx⁻_{t-i} + ε_t
 * Kumulativt gjennomslag er summen av lag-koeffisientene på hver side.
 * Dette er hovedspesifikasjonen: den er i differanser og dermed ikke
 * eksponert for spuriøs regresjon slik nivåspesifikasjonen under er.
 */
export function distributedLagAsymmetry(
  dx: number[],
  dy: number[],
  maxLag = MAX_LAG,
  exog: number[][] = []
): AsymmetryFit {
  const { up, down } = splitChanges(dx)
  const rows: number[][] = []
  const ys: number[] = []
  for (let t = maxLag; t < dy.length; t++) {
    const row = [1]
    for (let i = 0; i <= maxLag; i++) row.push(up[t - i])
    for (let i = 0; i <= maxLag; i++) row.push(down[t - i])
    for (const e of exog) row.push(e[t])
    rows.push(row)
    ys.push(dy[t])
  }
  const fit = ols(ys, rows)
  const k = fit.beta.length
  const cUp = Array.from({ length: k }, (_, i) => (i >= 1 && i <= maxLag + 1 ? 1 : 0))
  const cDown = Array.from({ length: k }, (_, i) => (i >= maxLag + 2 && i <= 2 * maxLag + 2 ? 1 : 0))
  const cDiff = cUp.map((v, i) => v - cDown[i])

  const sumUp = fit.beta.reduce((s, b, i) => s + cUp[i] * b, 0)
  const sumDown = fit.beta.reduce((s, b, i) => s + cDown[i] * b, 0)
  const asym = sumUp - sumDown

  return {
    cumulativeUp: round4(sumUp),
    cumulativeDown: round4(sumDown),
    asymmetry: round4(asym),
    tUp: round2(sumUp / contrastSe(cUp, fit.vcov)),
    tDown: round2(sumDown / contrastSe(cDown, fit.vcov)),
    tAsymmetry: round2(asym / contrastSe(cDiff, fit.vcov)),
    tAsymmetryHac: round2(asym / contrastSe(cDiff, fit.vcovHac)),
    r2: round4(fit.r2),
    n: fit.n,
  }
}

/**
 * Nivåregresjon på NARDL-partialsummer:
 *   log y_t = c + β⁺ x⁺_t + β⁻ x⁻_t (+ eksogene) + ε_t
 * Dette er spesifikasjonen som gir de høye R²-verdiene, og som juni-kjøringen
 * rapporterte som «NARDL kumulativ». Den er tatt med for sammenlignbarhet,
 * men er en NIVÅ-regresjon på trendende serier — les t-verdiene her med
 * forsiktighet, og bruk HAC-varianten.
 */
export function cumulativeLevelAsymmetry(
  dx: number[],
  yLevels: number[],
  exog: number[][] = []
): AsymmetryFit {
  const { up, down } = partialSums(dx)
  const rows: number[][] = []
  const ys: number[] = []
  for (let t = 0; t < up.length; t++) {
    const row = [1, up[t], down[t]]
    for (const e of exog) row.push(e[t])
    rows.push(row)
    ys.push(Math.log(yLevels[t + 1]))
  }
  const fit = ols(ys, rows)
  const k = fit.beta.length
  const cUp = Array.from({ length: k }, (_, i) => (i === 1 ? 1 : 0))
  const cDown = Array.from({ length: k }, (_, i) => (i === 2 ? 1 : 0))
  const cDiff = cUp.map((v, i) => v - cDown[i])
  const asym = fit.beta[1] - fit.beta[2]

  return {
    cumulativeUp: round4(fit.beta[1]),
    cumulativeDown: round4(fit.beta[2]),
    asymmetry: round4(asym),
    tUp: round2(fit.beta[1] / fit.se[1]),
    tDown: round2(fit.beta[2] / fit.se[2]),
    tAsymmetry: round2(asym / contrastSe(cDiff, fit.vcov)),
    tAsymmetryHac: round2(asym / contrastSe(cDiff, fit.vcovHac)),
    r2: round4(fit.r2),
    n: fit.n,
  }
}

/** Fortegnstest: hvor ofte stiger nedstrøms når oppstrøms stiger, og når den faller? */
export function signTest(dx: number[], dy: number[]) {
  let upMonths = 0
  let upFollow = 0
  let downMonths = 0
  let downFollow = 0
  for (let t = 0; t < dx.length; t++) {
    if (dx[t] > 0) {
      upMonths++
      if (dy[t] > 0) upFollow++
    } else if (dx[t] < 0) {
      downMonths++
      if (dy[t] > 0) downFollow++
    }
  }
  return {
    upMonths,
    downMonths,
    shareDownstreamUpWhenUpstreamUp: upMonths ? round4(upFollow / upMonths) : null,
    shareDownstreamUpWhenUpstreamDown: downMonths ? round4(downFollow / downMonths) : null,
  }
}

const round4 = (v: number) => Math.round(v * 1e4) / 1e4
const round2 = (v: number) => Math.round(v * 100) / 100

// ---------------------------------------------------------------------------
// Perioder
// ---------------------------------------------------------------------------

/** «2019M03» → 2019*12 + 2, for sortering og sammenligning. */
export function monthIndex(period: string): number {
  const m = /^(\d{4})M(\d{2})$/.exec(period)
  if (!m) throw new Error(`ugyldig månedsperiode: ${period}`)
  return parseInt(m[1], 10) * 12 + (parseInt(m[2], 10) - 1)
}

/**
 * ISO-uke → måned, via ukens torsdag (ISO-8601s egen regel for hvilket år/
 * hvilken periode en uke «tilhører»). SSBs ukeserier bruker ISO-uker, og en uke
 * kan spenne to måneder — torsdagsregelen gir en entydig og etterprøvbar
 * tilordning istedenfor en vilkårlig avrunding.
 */
export function isoWeekToMonth(period: string): string {
  const m = /^(\d{4})U(\d{2})$/.exec(period)
  if (!m) throw new Error(`ugyldig ukeperiode: ${period}`)
  const year = parseInt(m[1], 10)
  const week = parseInt(m[2], 10)
  // 4. januar ligger alltid i ISO-uke 1.
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Dow = jan4.getUTCDay() || 7 // mandag=1 … søndag=7
  const week1Monday = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000)
  const thursday = new Date(week1Monday.getTime() + ((week - 1) * 7 + 3) * 86400000)
  const mm = String(thursday.getUTCMonth() + 1).padStart(2, '0')
  return `${thursday.getUTCFullYear()}M${mm}`
}

// ---------------------------------------------------------------------------
// Minimal xlsx-leser (Verdensbankens Pink Sheet finnes kun som xlsx)
// ---------------------------------------------------------------------------

/** Leser en ZIP-buffer til en map fra filnavn til utpakket innhold. */
export function unzipEntries(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>()
  let eocd = -1
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('unzipEntries: fant ingen EOCD (ikke en zip?)')
  const entries = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  if (p === 0xffffffff) throw new Error('unzipEntries: zip64 støttes ikke')

  for (let e = 0; e < entries; e++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('unzipEntries: ødelagt sentralkatalog')
    const method = buf.readUInt16LE(p + 10)
    const compSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localOffset = buf.readUInt32LE(p + 42)
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8')

    if (buf.readUInt32LE(localOffset) !== 0x04034b50)
      throw new Error(`unzipEntries: ødelagt lokal header for ${name}`)
    const lNameLen = buf.readUInt16LE(localOffset + 26)
    const lExtraLen = buf.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + lNameLen + lExtraLen
    const raw = buf.subarray(dataStart, dataStart + compSize)
    if (method === 0) out.set(name, Buffer.from(raw))
    else if (method === 8) out.set(name, inflateRawSync(raw))
    else throw new Error(`unzipEntries: ukjent komprimering ${method} for ${name}`)

    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

/** «AB» → 27 (0-indeksert kolonnenummer). */
export function colToIndex(col: string): number {
  let n = 0
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

const unescapeXml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

/** Leser et regneark til en rad-indeksert tabell (rad → kolonneindeks → celletekst). */
export function readSheet(sheetXml: string, sharedStrings: string[]): Map<number, string[]> {
  const rows = new Map<number, string[]>()
  // [\s\S] i stedet for dotAll-flagget: tsconfig sikter på ES2017, der /s ikke finnes.
  for (const r of sheetXml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowNum = parseInt(r[1], 10)
    const cells: string[] = []
    for (const c of r[2].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const idx = colToIndex(c[1])
      const attrs = c[2] || ''
      const body = c[3] || ''
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)
      const inline = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(body)
      let text: string | undefined
      if (v) text = /t="s"/.test(attrs) ? sharedStrings[parseInt(v[1], 10)] : v[1]
      else if (inline) text = unescapeXml(inline[1])
      if (text !== undefined) cells[idx] = text
    }
    rows.set(rowNum, cells)
  }
  return rows
}

export function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(si =>
    unescapeXml([...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join(''))
  )
}

// ---------------------------------------------------------------------------
// Datahenting
// ---------------------------------------------------------------------------

type Series = Map<string, number>

async function fetchSsb(table: string, query: Record<string, string[]>): Promise<
  { dims: Record<string, string>; value: number }[]
> {
  const body = {
    query: Object.entries(query).map(([code, values]) => ({
      code,
      selection: { filter: 'item', values },
    })),
    response: { format: 'json-stat2' },
  }
  const res = await fetch(`${SSB_API}/${table}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`SSB ${table}: HTTP ${res.status}`)
  const ds = (await res.json()) as {
    id: string[]
    size: number[]
    value: (number | null)[]
    dimension: Record<string, { category: { index: Record<string, number> } }>
  }

  const codes = ds.id
  const labels = codes.map(code => {
    const idx = ds.dimension[code].category.index
    const arr: string[] = []
    for (const [key, pos] of Object.entries(idx)) arr[pos] = key
    return arr
  })

  const out: { dims: Record<string, string>; value: number }[] = []
  const total = ds.size.reduce((a, b) => a * b, 1)
  for (let flat = 0; flat < total; flat++) {
    const v = ds.value[flat]
    if (v === null || v === undefined) continue
    let rem = flat
    const dims: Record<string, string> = {}
    for (let d = codes.length - 1; d >= 0; d--) {
      const s = ds.size[d]
      dims[codes[d]] = labels[d][rem % s]
      rem = Math.floor(rem / s)
    }
    out.push({ dims, value: v })
  }
  return out
}

/**
 * Lakseråpris per måned, volumvektet fra ukesserien.
 * Volumvekting (ikke enkelt snitt) fordi ukene har svært ulikt eksportvolum —
 * et uvektet snitt gir en pris ingen faktisk handlet til.
 */
export async function fetchSalmonPrice(): Promise<Series> {
  const cells = await fetchSsb('03024', {
    VareGrupper2: ['01'],
    ContentsCode: ['Kilopris', 'Vekt'],
  })
  const price = new Map<string, number>()
  const weight = new Map<string, number>()
  for (const c of cells) {
    if (c.dims.ContentsCode === 'Kilopris') price.set(c.dims.Tid, c.value)
    else weight.set(c.dims.Tid, c.value)
  }
  const num = new Map<string, number>()
  const den = new Map<string, number>()
  for (const [week, p] of price) {
    const w = weight.get(week)
    if (!w || w <= 0 || !Number.isFinite(p)) continue
    const month = isoWeekToMonth(week)
    num.set(month, (num.get(month) ?? 0) + p * w)
    den.set(month, (den.get(month) ?? 0) + w)
  }
  const out: Series = new Map()
  for (const [month, n] of num) out.set(month, n / (den.get(month) as number))
  return out
}

/** Produsentprisindeks for fiskeforedling (SNN102), per marked. */
export async function fetchProcessingPpi(marked: '00' | '01' | '02'): Promise<Series> {
  const cells = await fetchSsb('12462', {
    Marked: [marked],
    NaringUtenriks: ['SNN102'],
    ContentsCode: ['Indeksnivo'],
  })
  const out: Series = new Map()
  for (const c of cells) out.set(c.dims.Tid, c.value)
  return out
}

/** Månedlig USDNOK fra Norges Bank (SDMX-JSON). */
export async function fetchUsdNok(from: string, to: string): Promise<Series> {
  const start = `${from.slice(0, 4)}-${from.slice(5, 7)}`
  const end = `${to.slice(0, 4)}-${to.slice(5, 7)}`
  const url = `${NORGES_BANK_EXR}/M.USD.NOK.SP?format=sdmx-json&startPeriod=${start}&endPeriod=${end}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Norges Bank EXR: HTTP ${res.status}`)
  const j = (await res.json()) as {
    data: {
      dataSets: { series: Record<string, { observations: Record<string, (number | string | null)[]> }> }[]
      structure: { dimensions: { observation: { values: { id: string }[] }[] } }
    }
  }
  const periods = j.data.structure.dimensions.observation[0].values.map(v => v.id)
  const series = Object.values(j.data.dataSets[0].series)[0]
  const out: Series = new Map()
  for (const [pos, obs] of Object.entries(series.observations)) {
    // Norges Bank leverer observasjonsverdiene som strenger, ikke tall.
    const v = Number(obs[0])
    const p = periods[parseInt(pos, 10)]
    if (!Number.isFinite(v) || !p) continue
    out.set(`${p.slice(0, 4)}M${p.slice(5, 7)}`, v)
  }
  return out
}

/**
 * Månedlige fôrråvarepriser fra Verdensbankens Pink Sheet.
 * URL-en roterer, så den oppdages fra den stabile landingssiden framfor å
 * hardkodes — en hardkodet lenke ville stille låst analysen til et gammelt
 * øyeblikksbilde (den forrige pekte på data som stoppet 2024M12).
 */
export async function fetchPinkSheet(): Promise<{
  updated: string
  series: Record<string, Series>
  sourceUrl: string
}> {
  const page = await fetch(WORLD_BANK_CMO_PAGE)
  if (!page.ok) throw new Error(`Verdensbanken CMO-side: HTTP ${page.status}`)
  const html = await page.text()
  const match = /https:\/\/thedocs\.worldbank\.org[^"']*CMO-Historical-Data-Monthly\.xlsx/.exec(html)
  if (!match) throw new Error('fant ingen CMO-Historical-Data-Monthly.xlsx-lenke på landingssiden')
  const sourceUrl = match[0]

  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Pink Sheet: HTTP ${res.status}`)
  const zip = unzipEntries(Buffer.from(await res.arrayBuffer()))

  const shared = parseSharedStrings(zip.get('xl/sharedStrings.xml')!.toString('utf8'))
  // «Monthly Prices» er ark 2 i arbeidsboka.
  const rows = readSheet(zip.get('xl/worksheets/sheet2.xml')!.toString('utf8'), shared)

  const updated = (rows.get(4)?.[0] ?? '').replace(/^Updated on\s*/i, '').trim()
  const header = rows.get(5) ?? []
  const wanted: Record<string, RegExp> = {
    fishmeal: /^fish meal$/i,
    soybeanMeal: /^soybean meal$/i,
    soybeanOil: /^soybean oil$/i,
  }
  const cols: Record<string, number> = {}
  header.forEach((name, i) => {
    if (!name) return
    for (const [key, re] of Object.entries(wanted)) if (re.test(name.trim())) cols[key] = i
  })
  for (const key of Object.keys(wanted))
    if (cols[key] === undefined) throw new Error(`Pink Sheet: fant ikke kolonnen «${key}»`)

  const series: Record<string, Series> = { fishmeal: new Map(), soybeanMeal: new Map(), soybeanOil: new Map() }
  for (const [rowNum, cells] of rows) {
    if (rowNum < 7) continue
    const period = (cells[0] ?? '').trim()
    if (!/^\d{4}M\d{2}$/.test(period)) continue
    for (const [key, col] of Object.entries(cols)) {
      const raw = cells[col]
      const v = raw === undefined ? NaN : Number(raw)
      if (Number.isFinite(v) && v > 0) series[key].set(period, v)
    }
  }
  return { updated, series, sourceUrl }
}

// ---------------------------------------------------------------------------
// Analyse
// ---------------------------------------------------------------------------

/** Klipper flere serier til deres felles, sammenhengende månedsvindu. */
export function alignSeries(
  series: Series[],
  from: string,
  to: string | null
): { periods: string[]; columns: number[][] } {
  const lo = monthIndex(from)
  const hi = to ? monthIndex(to) : Number.POSITIVE_INFINITY
  const common = [...series[0].keys()]
    .filter(p => /^\d{4}M\d{2}$/.test(p))
    .filter(p => monthIndex(p) >= lo && monthIndex(p) <= hi)
    .filter(p => series.every(s => Number.isFinite(s.get(p) as number)))
    .sort((a, b) => monthIndex(a) - monthIndex(b))
  return { periods: common, columns: series.map(s => common.map(p => s.get(p) as number)) }
}

export type LegResult = ReturnType<typeof analyseLeg>

export function analyseLeg(opts: {
  id: string
  label: string
  upstream: { name: string; series: Series }
  downstream: { name: string; series: Series }
  fx?: { name: string; series: Series }
  from: string
  to: string | null
  maxLag?: number
  caveats: string[]
}) {
  const maxLag = opts.maxLag ?? MAX_LAG
  const inputs = [opts.upstream.series, opts.downstream.series]
  if (opts.fx) inputs.push(opts.fx.series)
  const { periods, columns } = alignSeries(inputs, opts.from, opts.to)
  if (periods.length < 24)
    throw new Error(`${opts.id}: for kort felles vindu (${periods.length} måneder)`)

  const [x, y, fx] = columns
  const dx = logDiff(x)
  const dy = logDiff(y)
  const dfx = fx ? logDiff(fx) : null

  const distributed = distributedLagAsymmetry(dx, dy, maxLag)
  const distributedFx = dfx ? distributedLagAsymmetry(dx, dy, maxLag, [dfx]) : null
  const levels = cumulativeLevelAsymmetry(dx, y)
  // Eksogen for nivåspesifikasjonen er log(valutakurs) på samme t som y_{t+1}.
  const levelsFx = fx ? cumulativeLevelAsymmetry(dx, y, [fx.slice(1).map(v => Math.log(v))]) : null

  return {
    id: opts.id,
    label: opts.label,
    upstream: opts.upstream.name,
    downstream: opts.downstream.name,
    fxControl: opts.fx?.name ?? null,
    window: { from: periods[0], to: periods[periods.length - 1], months: periods.length, maxLag },
    distributedLag: distributed,
    distributedLagFxControlled: distributedFx,
    cumulativeLevels: levels,
    cumulativeLevelsFxControlled: levelsFx,
    signTest: signTest(dx, dy),
    endpoints: {
      upstreamFirst: round4(x[0]),
      upstreamLast: round4(x[x.length - 1]),
      downstreamFirst: round4(y[0]),
      downstreamLast: round4(y[y.length - 1]),
    },
    caveats: opts.caveats,
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function arg(name: string): string | null {
  const a = process.argv.find(v => v.startsWith(`--${name}=`))
  return a ? a.split('=').slice(1).join('=') : null
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const leg = arg('leg') ?? 'alle'
  const from = arg('from') ?? DEFAULT_FROM
  const to = arg('to')
  const out = arg('out')
  const maxLagArg = arg('max-lag')
  const maxLag = maxLagArg ? parseInt(maxLagArg, 10) : undefined
  if (maxLagArg && (!Number.isInteger(maxLag) || (maxLag as number) < 0))
    throw new Error(`ugyldig --max-lag=${maxLagArg}`)

  console.log('[ap7] henter SSB 03024 (lakseråpris, uke→måned volumvektet) …')
  const salmon = await fetchSalmonPrice()
  console.log(`[ap7]   ${salmon.size} måneder`)

  console.log('[ap7] henter SSB 12462 (foredlings-PPI SNN102, per marked) …')
  const ppiTotal = await fetchProcessingPpi('00')
  const ppiHome = await fetchProcessingPpi('01')
  const ppiExport = await fetchProcessingPpi('02')
  console.log(`[ap7]   i alt=${ppiTotal.size} hjemme=${ppiHome.size} eksport=${ppiExport.size} måneder`)

  console.log('[ap7] henter Verdensbankens Pink Sheet (fôrråvarer) …')
  const pink = await fetchPinkSheet()
  console.log(
    `[ap7]   oppdatert «${pink.updated}»; fiskemel=${pink.series.fishmeal.size} soyamel=${pink.series.soybeanMeal.size} måneder`
  )

  const lastPeriod = to ?? [...salmon.keys()].sort((a, b) => monthIndex(a) - monthIndex(b)).at(-1)!
  console.log('[ap7] henter Norges Bank USDNOK …')
  const usdnok = await fetchUsdNok(from, lastPeriod)
  console.log(`[ap7]   ${usdnok.size} måneder`)

  if (dryRun) {
    console.log('[ap7] --dry-run: stopper etter seriedekning.')
    return
  }

  const legs: LegResult[] = []

  if (leg === 'alle' || leg === 'laks-foredling') {
    for (const [marked, series, name] of [
      ['00', ppiTotal, 'PPI SNN102, hjemme- og eksportmarked'],
      ['01', ppiHome, 'PPI SNN102, hjemmemarked'],
      ['02', ppiExport, 'PPI SNN102, eksportmarked'],
    ] as const) {
      legs.push(
        analyseLeg({
          id: `laks-foredling-marked-${marked}`,
          label: `Lakseråpris → foredlings-PPI (${name})`,
          upstream: { name: 'SSB 03024 fersk oppalen laks, kilopris (NOK/kg, volumvektet uke→måned)', series: salmon },
          downstream: { name: `SSB 12462 ${name} (2021=100)`, series },
          fx: { name: 'Norges Bank USDNOK', series: usdnok },
          from,
          to,
          maxLag,
          caveats: [
            'SNN102 dekker all fisk/skalldyr/bløtdyr, ikke bare laks — nedstrøms er kategori-bredere enn oppstrøms.',
            'Hjemmemarkedsvarianten (Marked=01) er den som er minst eksponert for valutaeffekt; sammenlign den med eksportvarianten før noe sies om marginer.',
          ],
        })
      )
    }
  }

  if (leg === 'alle' || leg === 'for-oppdrett') {
    for (const [key, label] of [
      ['fishmeal', 'fiskemel'],
      ['soybeanMeal', 'soyamel'],
    ] as const) {
      legs.push(
        analyseLeg({
          id: `for-oppdrett-${key}`,
          label: `Fôrråvare (${label}) → lakseråpris`,
          upstream: { name: `Verdensbanken Pink Sheet ${label} (USD/tonn)`, series: pink.series[key] },
          downstream: { name: 'SSB 03024 fersk oppalen laks, kilopris (NOK/kg)', series: salmon },
          fx: { name: 'Norges Bank USDNOK', series: usdnok },
          from,
          to,
          maxLag,
          caveats: [
            'PROXY: importert råvarepris i USD, ikke en norsk fôr-PPI. En native månedlig norsk fôr-PPI finnes ikke (verifisert mot SSB 12462 — kun sammenblandet SNN108).',
            'Fôrråvarer prises i USD mens lakseprisen er i NOK; les alltid den valutakontrollerte varianten sammen med den ukontrollerte.',
            'Råvarepris er ikke fôrpris: fôrprodusentenes marginer, resept-endringer og kontraktsstruktur ligger mellom.',
          ],
        })
      )
    }
  }

  if (legs.length === 0) throw new Error(`ukjent --leg=${leg}`)

  if (out) {
    writeFileSync(
      out,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sources: {
            salmon: 'SSB tabell 03024 (eksport av oppalen laks, fersk, kilopris + vekt, ukentlig)',
            ppi: 'SSB tabell 12462 (produsentprisindeks, SNN102, per marked, månedlig)',
            fx: 'Norges Bank EXR M.USD.NOK.SP (månedlig)',
            feed: `Verdensbanken Pink Sheet, «${pink.updated}» (${pink.sourceUrl})`,
          },
          method:
            'Distribuert lag 0–3 i log-differanser med opp/ned-splittet oppstrøms (hovedspesifikasjon), ' +
            'samt nivåregresjon på NARDL-partialsummer (sammenlignbarhet med juni-kjøringen). ' +
            't-verdier oppgis både klassisk og Newey-West HAC.',
          legs,
        },
        null,
        2
      )
    )
    console.log(`[ap7] skrev ${out}`)
  }

  console.log('\n--- AP-7 oppsummering (intern; prisatferd, ikke intensjon eller margin) ---')
  for (const l of legs) {
    const d = l.distributedLag
    const dfx = l.distributedLagFxControlled
    console.log(`\n${l.label}`)
    console.log(`  vindu ${l.window.from}–${l.window.to} (n=${l.window.months})`)
    console.log(
      `  distribuert lag: opp ${d.cumulativeUp} (t=${d.tUp}) | ned ${d.cumulativeDown} (t=${d.tDown}) | ` +
        `asymmetri ${d.asymmetry} (t=${d.tAsymmetry}, HAC t=${d.tAsymmetryHac}) | R²=${d.r2}`
    )
    if (dfx)
      console.log(
        `  + valutakontroll:  opp ${dfx.cumulativeUp} | ned ${dfx.cumulativeDown} | ` +
          `asymmetri ${dfx.asymmetry} (t=${dfx.tAsymmetry}, HAC t=${dfx.tAsymmetryHac})`
      )
    console.log(
      `  nivå/partialsum: opp ${l.cumulativeLevels.cumulativeUp} | ned ${l.cumulativeLevels.cumulativeDown} | ` +
        `asymmetri ${l.cumulativeLevels.asymmetry} (t=${l.cumulativeLevels.tAsymmetry}, HAC t=${l.cumulativeLevels.tAsymmetryHac}) | R²=${l.cumulativeLevels.r2}`
    )
    const s = l.signTest
    console.log(
      `  fortegnstest: nedstrøms opp i ${pct(s.shareDownstreamUpWhenUpstreamUp)} av ${s.upMonths} oppgangsmåneder, ` +
        `og i ${pct(s.shareDownstreamUpWhenUpstreamDown)} av ${s.downMonths} nedgangsmåneder`
    )
  }
  console.log(
    '\nForbehold: nivåspesifikasjonen er en regresjon på trendende serier — bruk distribuert lag som hovedtall. ' +
      'Fôr-leddet er en proxy på importert råvarepris, ikke en norsk fôr-PPI. ' +
      'Går gjennom claim-lock/PCQ før ekstern bruk.'
  )
}

const pct = (v: number | null) => (v === null ? 'n/a' : `${Math.round(v * 100)} %`)

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
