/**
 * Bygger presentasjonsutgavene av hvitbok v3 og de tre artikkelpilotene:
 * web-HTML, A4-PDF og LinkedIn-kort (PNG) i exports/hvitbok-v3/.
 *
 * Kilder (endres ikke av skriptet):
 *   research/whitepaper/v3/hvitbok-v3-utkast.md
 *   research/whitepaper/v3/pastandsregister.md
 *   research/whitepaper/v3/artikler/*.md
 * Figurdata leses fra kontrollfilene som registeret viser til.
 *
 * Kjør: npx tsx scripts/build-hvitbok-v3-produksjon.ts [--no-pdf]
 * PDF og PNG krever Google Chrome (CHROME_PATH kan overstyre stien) og pdftotext.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { Marked } from 'marked'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'research/whitepaper/v3')
const OUT = path.join(ROOT, 'exports/hvitbok-v3')
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const NO_PDF = process.argv.includes('--no-pdf')
const DATE_LABEL = '18. september 2026'
const md = new Marked({ gfm: true })

// ─── Hjelpere ────────────────────────────────────────────────────────────────

function read(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function stripFrontmatter(src: string): { meta: Record<string, string>; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return { meta: {}, body: src }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].replace(/^"|"$/g, '')
  }
  return { meta, body: src.slice(m[0].length) }
}

function mdToHtml(src: string) {
  return md.parse(src, { async: false }) as string
}

function mdInline(src: string) {
  return md.parseInline(src, { async: false }) as string
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const nf1 = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })
const nfd1 = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Harde mellomrom i tusentall, prosent og indeksbaser, så tall ikke brytes over to linjer.
function typo(src: string) {
  let s = src
  for (let i = 0; i < 2; i++) s = s.replace(/(\d) (\d{3})(?!\d)/g, '$1\u00a0$2')
  return s
    .replace(/(\d{4}) = (\d+)/g, '$1\u00a0=\u00a0$2')
    .replace(/(\d) (%|kr\b|tonn\b|prosent\b|millioner\b|milliarder\b)/g, '$1\u00a0$2')
}

function replaceOnce(src: string, from: string, to: string) {
  if (!src.includes(from)) throw new Error(`Fant ikke teksten som skal tilpasses: ${from.slice(0, 80)}`)
  return src.replace(from, to)
}

// ─── Kildestatus: glyfer og klassifisering ──────────────────────────────────

type Status = 'kilde' | 'kontrollert' | 'hypotese' | 'datagap' | 'ramme'

const STATUS_ORDER: Status[] = ['kilde', 'kontrollert', 'hypotese', 'datagap', 'ramme']

const STATUS_LABEL: Record<Status, string> = {
  kilde: 'Kildebelagt',
  kontrollert: 'Kontrollert internt',
  hypotese: 'Hypotese eller spørsmål',
  datagap: 'Kunnskapshull',
  ramme: 'Ramme eller vedtak',
}

const STATUS_HELP: Record<Status, string> = {
  kilde: 'Godkjent i prosjektets siteringskjede eller kontrollert i hovedmanuset. Forbeholdet står i teksten.',
  kontrollert: 'Sjekket mot kilde, men ikke godkjent for ekstern bruk. Stikkprøves mot primærkilde før presentasjon.',
  hypotese: 'Prosjektets egen tolkning. Står uten tall og er ikke et funn.',
  datagap: 'Mangler data, en dataeier eller en beslutning.',
  ramme: 'Vedtak, metoderegel eller arbeidsramme i prosjektet. Ikke en faktapåstand.',
}

function classify(status: string): Status {
  const s = status.trim()
  if (/^(Vedtak|Metoderegel|Prinsipp|Arbeidsavklaring)|^\[K\]\/\[F\] i v2 \(metoderegel\)/.test(s)) return 'ramme'
  if (/^Siterbar/.test(s)) return 'kilde'
  if (/^\[(K|F)( som metode)?\]/.test(s) || /^\[F\/I\].*F-delen/.test(s)) return 'kilde'
  if (/^Kontrollert internt/.test(s)) return 'kontrollert'
  if (/^(Blokkert|\[H)/.test(s)) return 'datagap'
  if (/kunnskapshull|datagap|beslutning som mangler/.test(s)) return 'datagap'
  if (/^(Intern syntese|\[I|Uklar|Intern faglig analyse)/.test(s)) return 'hypotese'
  throw new Error(`Ukjent status i registeret: ${s}`)
}

function glyph(s: Status, cls = 'g') {
  const ring = '<circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.25"/>'
  const inner: Record<Status, string> = {
    kilde: '<circle cx="6" cy="6" r="5" fill="currentColor"/>',
    kontrollert: `${ring}<path d="M6 1.6a4.4 4.4 0 0 0 0 8.8z" fill="currentColor"/>`,
    hypotese: ring,
    datagap: '<circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="1.75 1.45"/>',
    ramme: `${ring}<circle cx="6" cy="6" r="1.55" fill="currentColor"/>`,
  }
  return `<svg class="${cls} g-${s}" viewBox="0 0 12 12" aria-hidden="true" focusable="false">${inner[s]}</svg>`
}

// Natural State-symbolet: én ytre sirkel med tre sirkler som tangerer hverandre og den ytre.
function nsSymbol(cls = 'ns-sym', stroke = 'currentColor') {
  return `<svg class="${cls}" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><g fill="none" stroke="${stroke}" stroke-width="2.6"><circle r="48.4"/><circle cy="-25.9" r="22.3"/><circle cx="-22.25" cy="12.55" r="22.3"/><circle cx="22.25" cy="12.55" r="22.3"/></g></svg>`
}

function nsLockup() {
  return `<span class="ns-lockup">${nsSymbol()}<span>Natural State</span></span>`
}

const NS_SYMBOL_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="-50 -50 100 100"><g fill="none" stroke="#141414" stroke-width="4"><circle r="47.5"/><circle cy="-25.9" r="22.3"/><circle cx="-22.25" cy="12.55" r="22.3"/><circle cx="22.25" cy="12.55" r="22.3"/></g></svg>',
)}`

// ─── Påstandsregisteret ──────────────────────────────────────────────────────

type Claim = {
  id: string
  n: number
  text: string
  catalog: string
  status: string
  cls: Status
  source: string
  caveat: string
  recheck: string
}

function readRegister(): Map<string, Claim> {
  const claims = new Map<string, Claim>()
  for (const line of read('research/whitepaper/v3/pastandsregister.md').split('\n')) {
    if (!/^\|\s*P-\d{3}\s*\|/.test(line)) continue
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
    if (cells.length !== 8) throw new Error(`Registerrad har ${cells.length} celler: ${cells[0]}`)
    const [id, text, catalog, status, source, caveat, recheck] = cells
    claims.set(id, { id, n: Number(id.slice(2)), text, catalog, status, cls: classify(status), source, caveat, recheck })
  }
  return claims
}

// ─── Figurer ─────────────────────────────────────────────────────────────────

type Figure = { id: string; html: string }

function figureShell(num: number, title: string, body: string, caption: string, source: string, status: Status, dataTable = '') {
  const table = dataTable
    ? `<details class="fig-data"><summary>Vis tallene</summary>${dataTable}</details>`
    : ''
  return `<figure class="fig" id="figur-${num}">
<figcaption class="fig-head"><span class="fig-num">Figur ${num}</span><span class="fig-title">${title}</span></figcaption>
<div class="fig-body">${body}</div>
<p class="fig-note">${caption}</p>
<p class="fig-source">${glyph(status)}<span><strong>${STATUS_LABEL[status]}.</strong> ${source}</span></p>
${table}
</figure>`
}

function simpleTable(head: string[], rows: string[][]) {
  return `<table class="data"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`
}

// Figur: konsentrasjonsprofilen langs kjeden (P-019, P-020, P-053, P-054, P-033, P-025).
function figConcentration(num: number): string {
  const rows: { label: string; note: string; lo: number; hi: number; samvirke?: boolean }[] = [
    { label: 'Sjøbasert havbruk', note: 'tillatt biomasse og slaktevolum', lo: 929, hi: 950 },
    { label: 'Meieri', note: 'anvendt melk, 2021', lo: 6000, hi: 6000, samvirke: true },
    { label: 'Egg', note: '2014–2024', lo: 5500, hi: 6800, samvirke: true },
    { label: 'Rødt kjøtt', note: 'slaktemengde, 2024', lo: 4600, hi: 4800, samvirke: true },
    { label: 'Grossist og logistikk', note: 'Menon 2023, beregnet av prosjektet', lo: 3697, hi: 3697 },
    { label: 'Dagligvare', note: 'omsetning, 2024', lo: 3327, hi: 3327 },
  ]
  const W = 680, left = 196, right = 26, top = 30, rowH = 40
  const H = top + rows.length * rowH + 34
  const max = 7000
  const x = (v: number) => left + (v / max) * (W - left - right)
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Markeds-HHI per ledd i norsk mat">`
  for (let t = 0; t <= max; t += 1000) {
    s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 8}" y2="${H - 30}"/>`
    s += `<text class="ax" x="${x(t)}" y="${H - 12}" text-anchor="middle">${nf0.format(t)}</text>`
  }
  s += `<line class="ref" x1="${x(2500)}" x2="${x(2500)}" y1="${top - 14}" y2="${H - 30}"/>`
  s += `<text class="ax ax-strong" x="${x(2500) + 6}" y="${top - 16}">Høy konsentrasjon fra 2 500</text>`
  rows.forEach((r, i) => {
    const cy = top + i * rowH + rowH / 2
    s += `<text class="lab" x="0" y="${cy - 2}">${r.label}${r.samvirke ? ' <tspan class="lab-tag">samvirke</tspan>' : ''}</text>`
    s += `<text class="lab-sub" x="0" y="${cy + 13}">${r.note}</text>`
    const tip = `${r.label}: HHI ${r.lo === r.hi ? nf0.format(r.lo) : `${nf0.format(r.lo)}–${nf0.format(r.hi)}`} (${r.note})`
    if (r.hi - r.lo > 60) {
      s += `<line class="range c1" x1="${x(r.lo)}" x2="${x(r.hi)}" y1="${cy}" y2="${cy}" data-tip="${esc(tip)}"/>`
    } else {
      s += `<circle class="dot c1" cx="${x((r.lo + r.hi) / 2)}" cy="${cy}" r="5.5" data-tip="${esc(tip)}"/>`
    }
    const valueLabel = r.lo === r.hi ? nf0.format(r.lo) : `${nf0.format(r.lo)}–${nf0.format(r.hi)}`
    s += r.hi > 6200
      ? `<text class="val" x="${x(r.lo) - 12}" y="${cy + 4}" text-anchor="end">${valueLabel}</text>`
      : `<text class="val" x="${x(r.hi) + 12}" y="${cy + 4}">${valueLabel}</text>`
  })
  s += '</svg>'
  const table = simpleTable(['Ledd', 'HHI', 'Grunnlag'], rows.map(r => [r.label, r.lo === r.hi ? nf0.format(r.lo) : `${nf0.format(r.lo)}–${nf0.format(r.hi)}`, r.note]))
  return figureShell(
    num,
    'Konsentrasjonen topper i foredling, ikke i butikk',
    s,
    'Markeds-HHI per ledd. HHI er en indeks fra 0 til 10 000, ikke en prosent. Rekkefølgen er robust, mens punktverdiene bygger på ulike år og baser og bærer forbehold. Fôr ligger også over 2 500, men mangler en åpen punktverdi og er derfor ikke tegnet.',
    'Konkurransetilsynet (dagligvare 2024), Menon (logistikk 2023), prosjektets kryssnodeanalyse og havbruksanalyse. Påstand P-019, P-020, P-025, P-033 og P-053.',
    'kilde',
    table,
  )
}

// Figur: kostnads- og prisskvisen, BFJ Tabell 2.15 (gjengitt i R6). P-010, P-011.
function figSqueeze(num: number, compact = false): string {
  const src = read('research/external/r6/deep-research-r6-n11-bondemargin-2026-06-18.md')
  const block = src.split('### Tabell 2.15 utdrag')[1]?.split('*Skvis-ratio')[0]
  if (!block) throw new Error('Fant ikke Tabell 2.15-utdraget i R6-filen')
  type Row = { year: number; flag: string; inn: number; kost: number; gjod: number }
  const data: Row[] = []
  for (const line of block.split('\n')) {
    const cells = line.replace(/\*\*([^*|]+)\*\*/g, '$1').split('|').map(c => c.trim()).filter(Boolean)
    if (!/^\d{4}/.test(cells[0] ?? '')) continue
    const num = (v: string) => Number(v.replace(',', '.'))
    data.push({ year: Number(cells[0].slice(0, 4)), flag: cells[0].slice(4), inn: num(cells[1]), kost: num(cells[2]), gjod: num(cells[3]) })
  }
  if (data.length !== 10) throw new Error(`Forventet 10 år i Tabell 2.15, fant ${data.length}`)
  const W = 680, H = compact ? 300 : 320, left = 44, right = 20, top = 34, bottom = 40
  const x = (yr: number) => left + ((yr - 2017) / 9) * (W - left - right)
  const y = (v: number) => top + (1 - (v - 50) / 100) * (H - top - bottom)
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Prisindekser for inntekter, kostnader og handelsgjødsel 2017–2026">`
  s += `<rect class="band" x="${x(2021.5)}" y="${top - 6}" width="${x(2023.5) - x(2021.5)}" height="${H - top - bottom + 6}"/>`
  s += `<text class="ax" x="${(x(2021.5) + x(2023.5)) / 2}" y="${top - 12}" text-anchor="middle">Gjødselsjokket</text>`
  for (let v = 50; v <= 150; v += 25) {
    s += `<line class="grid" x1="${left}" x2="${W - right}" y1="${y(v)}" y2="${y(v)}"/>`
    s += `<text class="ax" x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`
  }
  data.forEach(d => {
    s += `<text class="ax" x="${x(d.year)}" y="${H - bottom + 20}" text-anchor="middle">${d.year}${d.flag}</text>`
  })
  const series: { key: 'inn' | 'kost' | 'gjod'; cls: string; name: string }[] = [
    { key: 'inn', cls: 'c1', name: 'Inntekter inkl. tilskudd' },
    { key: 'kost', cls: 'c2', name: 'Samlede kostnader' },
    { key: 'gjod', cls: 'c3', name: 'Handelsgjødsel' },
  ]
  for (const ser of series) {
    const firm = data.filter(d => !d.flag)
    const prov = data.filter(d => d.year >= 2024)
    s += `<polyline class="line ${ser.cls}" points="${firm.map(d => `${x(d.year)},${y(d[ser.key])}`).join(' ')}"/>`
    s += `<polyline class="line line-prov ${ser.cls}" points="${prov.map(d => `${x(d.year)},${y(d[ser.key])}`).join(' ')}"/>`
    for (const d of data) {
      s += `<circle class="pt ${ser.cls}" cx="${x(d.year)}" cy="${y(d[ser.key])}" r="3.4" data-tip="${esc(`${ser.name} ${d.year}${d.flag}: ${nf1.format(d[ser.key])}`)}"/>`
    }
  }
  const peak = data.find(d => d.year === 2023)
  if (peak) s += `<text class="val" x="${x(2023) + 8}" y="${y(peak.gjod) - 6}">${nf1.format(peak.gjod)}</text>`
  s += '</svg>'
  const legend = `<ul class="legend">${series.map(se => `<li><span class="swatch ${se.cls}"></span>${se.name}</li>`).join('')}</ul>`
  const table = simpleTable(
    ['År', 'Inntekter inkl. tilskudd', 'Samlede kostnader', 'Handelsgjødsel', 'Kostnad/inntekt'],
    data.map(d => [`${d.year}${d.flag}`, nf1.format(d.inn), nf1.format(d.kost), nf1.format(d.gjod), (d.kost / d.inn).toFixed(3).replace('.', ',')]),
  )
  return figureShell(
    num,
    'Inntektene med tilskudd holdt følge med kostnadene, mens gjødselprisen mer enn doblet seg',
    legend + s,
    'Prisindekser fra Budsjettnemnda for jordbruket, 2024 = 100. Kostnadsindeksen lå 4–7 prosent over inntektsindeksen hvert år 2017–2023, altså et svakere bytteforhold enn i 2024. Normalisert kalkyle for hele sektoren, ikke driftsregnskap. * foreløpig, ** budsjett.',
    'BFJ/NIBIO, Totalkalkylen UT-1-2026, Tabell 2.15. Påstand P-010 og P-011.',
    'kilde',
    table,
  )
}

// Figur: fra reserve til leverbar mat (P-077, P-079, P-082). Bare beholdningen er kjent.
function figChain(num: number): string {
  const steps: { label: string; known?: string }[] = [
    { label: 'Beholdning', known: '30 000 tonn mathvete, utgangen av 2025' },
    { label: 'Råvarekvalitet' },
    { label: 'Uttak og allokering' },
    { label: 'Disponibel møllekapasitet' },
    { label: 'Produktutbytte' },
    { label: 'Pakking' },
    { label: 'Transport' },
    { label: 'Mottak' },
    { label: 'Leverbart mel innen 72 timer' },
  ]
  const W = 900, H = 190, left = 44, right = 44
  const step = (W - left - right) / (steps.length - 1)
  const cy = 70
  let s = `<svg class="chart chart-wide" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kornkjeden fra beholdning til leverbart mel, der bare beholdningen er kjent">`
  s += `<line class="chain" x1="${left}" x2="${W - right}" y1="${cy}" y2="${cy}"/>`
  steps.forEach((st, i) => {
    const cx = left + i * step
    const last = i === steps.length - 1
    const r = last ? 26 : 17
    if (st.known) {
      s += `<circle class="node node-known" cx="${cx}" cy="${cy}" r="${r}" data-tip="${esc(`${st.label}: ${st.known}`)}"/>`
    } else {
      s += `<circle class="node node-gap" cx="${cx}" cy="${cy}" r="${r}" data-tip="${esc(`${st.label}: ukjent`)}"/>`
      s += `<text class="node-q" x="${cx}" y="${cy + 5}" text-anchor="middle">?</text>`
    }
    const words = st.label.split(' ')
    const lines: string[] = []
    for (const w of words) {
      const cur = lines[lines.length - 1]
      if (cur && (cur + ' ' + w).length <= 13) lines[lines.length - 1] = `${cur} ${w}`
      else lines.push(w)
    }
    lines.forEach((ln, j) => {
      s += `<text class="lab lab-c" x="${cx}" y="${cy + r + 22 + j * 15}" text-anchor="middle">${ln}</text>`
    })
    if (st.known) s += `<text class="lab-sub lab-c" x="${cx}" y="${cy - r - 12}" text-anchor="start" dx="-12">30 000 tonn</text>`
  })
  s += '</svg>'
  return figureShell(
    num,
    'Lagret råvare er ikke leverbar mat',
    `<div class="scroll-x">${s}</div>`,
    'Referansekjeden prosjektet har spesifisert: fra kornlager til bakerihvetemel levert til ett bakeri i Oslo innen 72 timer. Bare beholdningen er kjent. Mengdefeltene i resten av kjeden er tomme, og ingen dataeier er kontaktet.',
    'Landbruksdirektoratet (beholdning), prosjektets måleprotokoll for kornkjeden. Påstand P-077, P-079 og P-082.',
    'datagap',
  )
}

// Figur: kornproduksjon 2018 mot snitt 2015–2017 (P-081), fra round-004/analysis.json.
function figHarvest(num: number): string {
  const json = JSON.parse(read('docs/project/analysis/source-review-beredskap-2026-09-09/round-004/analysis.json')) as {
    contrasts: { country: string; country_name: string; crop: string; year: number; production_kt_change_pct: number }[]
  }
  const countries = ['NO', 'SE', 'DK', 'FI']
  const val = (c: string, crop: string) => {
    const hit = json.contrasts.find(r => r.country === c && r.crop === crop && r.year === 2018)
    if (!hit) throw new Error(`Mangler 2018-verdi for ${c} ${crop}`)
    return { v: hit.production_kt_change_pct, name: hit.country_name }
  }
  const W = 680, left = 96, right = 24, top = 16, group = 58, barH = 14
  const H = top + countries.length * group + 36
  const min = -70
  const x = (v: number) => left + ((v - min) / (0 - min)) * (W - left - right)
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Endring i hvete- og byggproduksjon 2018 mot snitt 2015–2017">`
  for (let t = -70; t <= 0; t += 10) {
    s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H - 30}"/>`
    s += `<text class="ax" x="${x(t)}" y="${H - 12}" text-anchor="middle">${t === 0 ? '0' : `${nf0.format(t)} %`}</text>`
  }
  countries.forEach((c, i) => {
    const gy = top + i * group
    const wheat = val(c, 'wheat')
    const barley = val(c, 'barley')
    s += `<text class="lab" x="0" y="${gy + barH + 6}">${wheat.name}</text>`
    const bars: [number, string, string][] = [[wheat.v, 'c1', 'Hvete'], [barley.v, 'c2', 'Bygg']]
    bars.forEach(([v, cls, name], j) => {
      const by = gy + j * (barH + 3)
      const bx = x(v)
      const w = x(0) - bx
      s += `<path class="bar ${cls}" d="M${x(0)} ${by} H${bx + 3} a3 3 0 0 0 -3 3 V${by + barH - 3} a3 3 0 0 0 3 3 H${x(0)} Z" data-tip="${esc(`${wheat.name}, ${name.toLowerCase()} 2018: ${nfd1.format(v)} %`)}"/>`
      if (w > 0) s += `<text class="val" x="${bx - 6}" y="${by + barH - 3}" text-anchor="end">${nfd1.format(v)}</text>`
    })
  })
  s += `<line class="axis0" x1="${x(0)}" x2="${x(0)}" y1="${top - 4}" y2="${H - 30}"/>`
  s += '</svg>'
  const legend = '<ul class="legend"><li><span class="swatch c1"></span>Hvete og spelt</li><li><span class="swatch c2"></span>Bygg</li></ul>'
  const table = simpleTable(
    ['Land', 'Hvete og spelt', 'Bygg'],
    countries.map(c => [val(c, 'wheat').name, `${nfd1.format(val(c, 'wheat').v)} %`, `${nfd1.format(val(c, 'barley').v)} %`]),
  )
  return figureShell(
    num,
    'I 2018 falt kornproduksjonen i alle fire land samtidig',
    legend + s,
    'Prosentvis endring i produksjon 2018 mot landets eget snitt for 2015–2017. Prosjektets egne beregninger fra Eurostat ved 14 prosent vanninnhold. Norge bruker varekode C1110, de andre C1100. Ikke et mål på klimaets bidrag, og Finland er ikke fullt avstemt mot nasjonal statistikk.',
    'Eurostat APRO_CPSH1, beregnet i prosjektets beredskapsanalyse (runde 004). Påstand P-081.',
    'kontrollert',
    table,
  )
}

// Figur: marint restråstoff (P-055). To størrelser som ikke skal blandes.
function figResidual(num: number): string {
  const body = `<div class="tiles">
<div class="tile"><p class="tile-label">Restråstoff utnyttet, 2024</p><p class="tile-value">89 %</p><p class="tile-sub">av råstoffet ble brukt til noe, mest fôr og deretter energi</p><div class="meter" aria-hidden="true"><span style="width:89%"></span></div><p class="tile-axis">Målt i råstoffvekt</p></div>
<div class="tile"><p class="tile-label">Til humant konsum</p><p class="tile-value">≈ 15 %</p><p class="tile-sub">av produktvolumet, om lag 70 000 av 476 000 tonn</p><div class="meter" aria-hidden="true"><span style="width:14.7%"></span></div><p class="tile-axis">Målt i produktvekt</p></div>
</div>`
  return figureShell(
    num,
    'Utnyttet er ikke det samme som verdi',
    body,
    'Norge bruker nesten alt marint restråstoff, men lite av det blir mat. De to tallene måles i ulike enheter, råstoffvekt og produktvekt, og kan ikke trekkes fra hverandre.',
    'SINTEF/FHF-rapport 2025:00517, s. 5. Påstand P-055.',
    'kontrollert',
  )
}

// Figur: fra krav til effekt i nordisk matberedskap, R9-tabellen «Fra krav til effekt».
function figRequirement(num: number): string {
  const src = read('research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md')
  const block = src.split('### Fra krav til effekt')[1]?.split('Kilder:')[0]
  if (!block) throw new Error('Fant ikke tabellen «Fra krav til effekt» i R9')
  const rows = block
    .split('\n')
    .filter(l => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Tema'))
    .map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
  if (rows.length < 8) throw new Error('For få rader i R9-tabellen')
  const head = ['Krav eller lov', 'Forslag eller plan', 'Gjennomført', 'Evaluert', 'Effekt målt']
  const cell = (t: string) => {
    if (t === '–' || t === '-' || t === '') return '<td class="m-empty"><span class="sr">Ikke aktuelt</span></td>'
    const missing = /^Nei\b|ikke målt/.test(t)
    const g = missing ? glyph('datagap', 'g m-g') : '<span class="m-dot" aria-hidden="true"></span>'
    return `<td class="${missing ? 'm-miss' : 'm-have'}">${g}<span>${mdInline(t)}</span></td>`
  }
  const table = `<div class="scroll-x"><table class="matrix"><thead><tr><th>Tema</th>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(r => `<tr><th scope="row">${r[0]}</th>${r.slice(1, 6).map(cell).join('')}</tr>`)
    .join('')}</tbody></table></div>`
  return figureShell(
    num,
    'Krav og aktivitet finnes. Evaluering og målt effekt mangler nesten overalt',
    table,
    'Hvor langt hvert tema i nordisk matberedskap er dokumentert. Stiplet sirkel betyr ikke funnet i et avgrenset søk, ikke at det ikke finnes. Mye av beredskapen er ny i 2024–2026 og kan ennå ikke evalueres.',
    'Prosjektets kompetanse- og beredskapsresearch (R9), tabellen «Fra krav til effekt». Påstand P-085 og P-092.',
    'kontrollert',
  )
}

// Figur for V6: tidslinjen for EUDR i EU og Norge (per 15.09.2026).
function figEudrTimeline(num: number): string {
  const W = 760, H = 210, left = 92, right = 30
  const t0 = 2025.4, t1 = 2027.75
  const x = (t: number) => left + ((t - t0) / (t1 - t0)) * (W - left - right)
  const lanes = [
    { name: 'EU', y: 70, events: [
      { t: 2025.95, label: 'Des. 2025', sub: 'Siste utsettelse', kind: 'kilde' as Status },
      { t: 2026.34, label: '4. mai 2026', sub: 'Datoene gjentatt', kind: 'kilde' as Status },
      { t: 2026.995, label: '30.12.2026', sub: 'Store og mellomstore', kind: 'kilde' as Status },
      { t: 2027.495, label: '30.06.2027', sub: 'Mikro og små', kind: 'kilde' as Status },
    ] },
    { name: 'Norge', y: 150, events: [
      { t: 2025.6, label: 'Aug. 2025', sub: 'Høringsforslag', kind: 'kilde' as Status },
      { t: 2026.35, label: '8. mai 2026', sub: 'Til vurdering i EØS/EFTA', kind: 'kilde' as Status },
      { t: 2027.2, label: 'Ingen dato', sub: 'EØS-komiteen og Stortinget', kind: 'datagap' as Status },
    ] },
  ]
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tidslinje for EUDR i EU og Norge per 15. september 2026">`
  for (const yr of [2026, 2027]) {
    s += `<line class="grid" x1="${x(yr)}" x2="${x(yr)}" y1="24" y2="${H - 22}"/>`
    s += `<text class="ax" x="${x(yr)}" y="${H - 6}" text-anchor="middle">${yr}</text>`
  }
  for (const lane of lanes) {
    s += `<text class="lab" x="0" y="${lane.y + 4}">${lane.name}</text>`
    s += `<line class="chain" x1="${left}" x2="${W - right}" y1="${lane.y}" y2="${lane.y}"/>`
    lane.events.forEach((e, i) => {
      const cx = x(e.t)
      const tip = `${lane.name}: ${e.label}, ${e.sub.toLowerCase()}`
      if (e.kind === 'datagap') s += `<circle class="node node-gap" cx="${cx}" cy="${lane.y}" r="9" data-tip="${esc(tip)}"/>`
      else s += `<circle class="dot ink" cx="${cx}" cy="${lane.y}" r="6.5" data-tip="${esc(tip)}"/>`
      const above = i % 2 === 0
      s += `<text class="val" x="${cx}" y="${lane.y + (above ? -26 : 26)}" text-anchor="middle">${e.label}</text>`
      s += `<text class="lab-sub" x="${cx}" y="${lane.y + (above ? -12 : 40)}" text-anchor="middle">${e.sub}</text>`
    })
  }
  s += '</svg>'
  return figureShell(
    num,
    'EU har datoer. Norge har ikke',
    `<div class="scroll-x">${s}</div>`,
    'Status per 15. september 2026. Norsk ikrafttredelse krever beslutning i EØS-komiteen og samtykke fra Stortinget. Må fersksjekkes samme uke som artikkelen publiseres.',
    'Forordning (EU) 2025/2650, Kommisjonens rapport 4. mai 2026, Landbruksdirektoratet, Stortingets EU/EØS-nytt 8. mai 2026, Miljødirektoratets høring 2025.',
    'kontrollert',
  )
}

// Figur for V10: registerhendelser 2019–2026 (hva-feilet-syntesen del 2, lest 15.09.2026).
function figBankruptcies(num: number): string {
  type Ev = { d: string; kind: 'konkurs' | 'rekon' | 'oppgitt'; text: string }
  const rows: { name: string; land: string; events: Ev[] }[] = [
    { name: 'Plantagon', land: 'SE', events: [{ d: '2019-02-15', kind: 'oppgitt', text: 'konkurs februar 2019 ifølge selskap og presse; avsluttet 29.05.2020' }] },
    { name: 'Simple Feast', land: 'DK', events: [{ d: '2022-08-29', kind: 'rekon', text: 'rekonstruksjon 29.08.2022' }, { d: '2022-09-07', kind: 'konkurs', text: 'konkursdekret 07.09.2022' }] },
    { name: 'Infarm Danmark', land: 'DK', events: [{ d: '2023-12-21', kind: 'konkurs', text: 'konkursdekret 21.12.2023' }] },
    { name: 'Mycorena', land: 'SE', events: [{ d: '2024-07-10', kind: 'oppgitt', text: 'konkurs 10.07.2024 ifølge registeraggregatorer; avsluttet 10.08.2026' }] },
    { name: 'Billund Aquaculture', land: 'DK', events: [{ d: '2024-07-25', kind: 'konkurs', text: 'konkursdekret 25.07.2024' }] },
    { name: 'Restaurant Rest', land: 'NO', events: [{ d: '2024-09-05', kind: 'konkurs', text: 'konkursåpning 05.09.2024' }] },
    { name: 'ENORM BioFactory', land: 'DK', events: [{ d: '2025-04-25', kind: 'rekon', text: 'rekonstruksjon 25.04.2025' }, { d: '2025-10-30', kind: 'konkurs', text: 'konkursdekret 30.10.2025' }] },
    { name: 'DUG Foodtech', land: 'SE', events: [{ d: '2025-12-19', kind: 'konkurs', text: 'konkurs innledet 19.12.2025' }] },
    { name: 'Hooked Foods', land: 'SE', events: [{ d: '2026-01-13', kind: 'konkurs', text: 'konkurs innledet 13.01.2026' }] },
    { name: 'Grønt fra Nord', land: 'NO', events: [{ d: '2026-02-05', kind: 'rekon', text: 'rekonstruksjon 05.02.2026, ikke konkurs' }] },
  ]
  const W = 720, left = 178, right = 24, top = 18, rowH = 26
  const H = top + rows.length * rowH + 34
  const t = (d: string) => {
    const [y, m, day] = d.split('-').map(Number)
    return y + (m - 1) / 12 + (day - 1) / 365
  }
  const x = (v: number) => left + ((v - 2019) / (2026.5 - 2019)) * (W - left - right)
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Konkurser og rekonstruksjoner i nordisk sirkulær mat 2019–2026">`
  for (let yr = 2019; yr <= 2026; yr++) {
    s += `<line class="grid" x1="${x(yr)}" x2="${x(yr)}" y1="${top - 6}" y2="${H - 28}"/>`
    s += `<text class="ax" x="${x(yr)}" y="${H - 10}" text-anchor="middle">${yr}</text>`
  }
  rows.forEach((r, i) => {
    const cy = top + i * rowH + rowH / 2
    s += `<text class="lab" x="0" y="${cy + 4}">${r.name} <tspan class="lab-tag">${r.land}</tspan></text>`
    if (r.events.length > 1) s += `<line class="link" x1="${x(t(r.events[0].d))}" x2="${x(t(r.events[1].d))}" y1="${cy}" y2="${cy}"/>`
    for (const e of r.events) {
      const tip = `${r.name}: ${e.text}`
      const cx = x(t(e.d))
      if (e.kind === 'konkurs') s += `<circle class="dot ink" cx="${cx}" cy="${cy}" r="6" data-tip="${esc(tip)}"/>`
      else if (e.kind === 'rekon') s += `<circle class="node node-open" cx="${cx}" cy="${cy}" r="5.5" data-tip="${esc(tip)}"/>`
      else s += `<circle class="node node-gap" cx="${cx}" cy="${cy}" r="5.5" data-tip="${esc(tip)}"/>`
    }
  })
  s += '</svg>'
  const legend = `<ul class="legend"><li>${glyph('kilde')}Konkurs åpnet, registerdato</li><li>${glyph('hypotese')}Rekonstruksjon</li><li>${glyph('datagap')}Dato oppgitt av selskap eller aggregator</li></ul>`
  return figureShell(
    num,
    'Ni konkurser og én rekonstruksjon, 2019–2026',
    legend + s,
    'Registerhendelser lest 15. september 2026 i Brønnøysundregistrene, Bolagsverket, CVR og YTJ. Plantagon og Mycorena har startdatoer som ikke er lest i primærregister.',
    'Registrene i kildelisten, samlet i prosjektets syntese om sirkulære konkurser.',
    'kontrollert',
  )
}

// ─── Stil ────────────────────────────────────────────────────────────────────

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" media="screen" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&display=swap">'

const BASE_CSS = `
:root {
  color-scheme: light dark;
  --ink: #141414; --ink-2: #3a3d37; --muted: #676b63; --line: #dcded8; --rule: #141414;
  --paper: #ffffff; --panel: #f1f3ee; --sage: #9db692; --sage-soft: #e3eadf; --tag: #d95c5c;
  --c1: #3f7f3a; --c2: #2e78b7; --c3: #c0463b;
  --font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, monospace;
  --rail: 196px; --text: 660px;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ink: #eceee8; --ink-2: #c9ccc4; --muted: #9da197; --line: #30342e; --rule: #eceee8;
    --paper: #0f110f; --panel: #1a1e19; --sage: #334130; --sage-soft: #1e261c; --tag: #ef8a8a;
  }
}
:root[data-theme="dark"] {
  --ink: #eceee8; --ink-2: #c9ccc4; --muted: #9da197; --line: #30342e; --rule: #eceee8;
  --paper: #0f110f; --panel: #1a1e19; --sage: #334130; --sage-soft: #1e261c; --tag: #ef8a8a;
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font); font-size: 18px; line-height: 1.62; font-optical-sizing: auto; text-rendering: optimizeLegibility; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.18em; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--c2); outline-offset: 3px; border-radius: 2px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.g { width: 0.66em; height: 0.66em; flex: none; }
.ns-lockup { display: inline-flex; align-items: center; gap: 0.5em; font-weight: 500; letter-spacing: -0.005em; white-space: nowrap; }
.ns-sym { width: 1.35em; height: 1.35em; }
.tag { display: inline-block; color: var(--tag); font-weight: 400; letter-spacing: 0.02em; }
.label { font-size: 11.5px; font-weight: 650; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); }

/* Toppstripe (bare skjerm) */
.topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 18px; padding: 12px clamp(16px, 4vw, 40px); background: color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); font-size: 14px; }
.topbar .doc-title { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.topbar .spacer { flex: 1; }
.topbar .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1px solid var(--rule); border-radius: 999px; background: none; color: var(--ink); font: inherit; font-weight: 500; text-decoration: none; cursor: pointer; white-space: nowrap; }
.topbar .btn:hover { background: var(--ink); color: var(--paper); }
.toc-menu { position: relative; }
.toc-menu summary { list-style: none; }
.toc-menu summary::-webkit-details-marker { display: none; }
.toc-menu[open] .toc-pop { display: block; }
.toc-pop { display: none; position: absolute; left: 0; top: calc(100% + 10px); width: min(440px, 86vw); max-height: 70vh; overflow: auto; padding: 14px 18px; background: var(--paper); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,.14); }
.toc-pop ol { list-style: none; margin: 0; padding: 0; }
.toc-pop a { display: flex; gap: 12px; padding: 6px 0; text-decoration: none; }
.toc-pop a:hover span:last-child { text-decoration: underline; }
.toc-pop .n { width: 1.6em; color: var(--muted); font-variant-numeric: tabular-nums; }
@media screen and (max-width: 720px) { .topbar .doc-title, .topbar .hide-sm { display: none; } .topbar { gap: 10px; } .topbar .btn { padding: 6px 11px; } }

/* Figurer */
.fig { margin: 2.2em 0 2.4em; padding: 0; }
.fig-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 14px; padding-top: 12px; border-top: 1.5px solid var(--rule); }
.fig-num { font-size: 12px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.fig-title { font-weight: 650; font-size: 1.02em; letter-spacing: -0.01em; }
.fig-note { margin: 12px 0 6px; font-size: 14px; line-height: 1.5; color: var(--ink-2); max-width: 70ch; }
.fig-source { display: flex; gap: 8px; align-items: baseline; margin: 0; font-size: 12.5px; line-height: 1.45; color: var(--muted); }
.fig-source .g { width: 10px; height: 10px; transform: translateY(1px); color: var(--ink-2); }
.fig-data { margin-top: 10px; font-size: 13px; }
.fig-data summary { cursor: pointer; color: var(--muted); }
.scroll-x { overflow-x: auto; }
.chart { display: block; width: 100%; height: auto; overflow: visible; font-family: var(--font); }
.chart-wide { min-width: 640px; }
.chart .grid { stroke: var(--line); stroke-width: 1; }
.chart .ref { stroke: var(--ink); stroke-width: 1.5; }
.chart .axis0 { stroke: var(--ink); stroke-width: 1.2; }
.chart .ax { fill: var(--muted); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.chart .ax-strong { fill: var(--ink-2); font-weight: 550; }
.chart .lab { fill: var(--ink); font-size: 13px; font-weight: 550; }
.chart .lab-c { font-weight: 500; font-size: 12px; }
.chart .lab-sub { fill: var(--muted); font-size: 11px; }
.chart .lab-tag { fill: var(--muted); font-size: 10.5px; font-weight: 500; }
.chart .val { fill: var(--ink); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.chart .band { fill: var(--sage-soft); }
.chart .line { fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.chart .line-prov { opacity: .45; }
.chart .line.c1 { stroke: var(--c1); } .chart .line.c2 { stroke: var(--c2); } .chart .line.c3 { stroke: var(--c3); }
.chart .pt { stroke: var(--paper); stroke-width: 2; }
.chart .pt.c1, .chart .dot.c1 { fill: var(--c1); } .chart .pt.c2 { fill: var(--c2); } .chart .pt.c3 { fill: var(--c3); }
.chart .dot { stroke: var(--paper); stroke-width: 2; }
.chart .dot.ink { fill: var(--ink); }
.chart .range { stroke-width: 11; stroke-linecap: round; }
.chart .range.c1 { stroke: var(--c1); }
.chart .bar.c1 { fill: var(--c1); } .chart .bar.c2 { fill: var(--c2); }
.chart .chain, .chart .link { stroke: var(--ink-2); stroke-width: 1.2; }
.chart .node-known { fill: var(--ink); }
.chart .node-gap { fill: var(--paper); stroke: var(--ink); stroke-width: 1.4; stroke-dasharray: 3 2.6; }
.chart .node-open { fill: var(--paper); stroke: var(--ink); stroke-width: 1.6; }
.chart .node-q { fill: var(--muted); font-size: 14px; font-weight: 500; }
.chart [data-tip] { cursor: default; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 20px; list-style: none; margin: 0 0 10px; padding: 0; font-size: 13px; color: var(--ink-2); }
.legend li { display: inline-flex; align-items: center; gap: 8px; }
.legend .g { width: 11px; height: 11px; color: var(--ink); }
.swatch { width: 18px; height: 3px; border-radius: 2px; background: currentColor; }
.swatch.c1 { color: var(--c1); } .swatch.c2 { color: var(--c2); } .swatch.c3 { color: var(--c3); }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.tile { padding: 18px 20px 16px; background: var(--panel); border-radius: 14px; }
.tile p { margin: 0; }
.tile-label { font-size: 13px; font-weight: 600; color: var(--ink-2); }
.tile-value { font-size: 52px; font-weight: 650; letter-spacing: -0.03em; line-height: 1.05; margin: 6px 0 4px !important; }
.tile-sub { font-size: 14px; line-height: 1.45; color: var(--ink-2); min-height: 2.9em; }
.meter { height: 8px; margin: 14px 0 6px; border-radius: 4px; background: color-mix(in srgb, var(--c1) 16%, transparent); overflow: hidden; }
.meter span { display: block; height: 100%; background: var(--c1); border-radius: 4px; }
.tile-axis { font-size: 12px; color: var(--muted); }
table.data, table.matrix, .prose table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.45; font-variant-numeric: tabular-nums; }
table.data th, table.data td, .prose th, .prose td { text-align: left; vertical-align: top; padding: 7px 10px 7px 0; border-bottom: 1px solid var(--line); }
table.data thead th, .prose thead th { font-weight: 650; border-bottom: 1.5px solid var(--rule); }
table.matrix { font-size: 13px; min-width: 720px; }
table.matrix th, table.matrix td { text-align: left; vertical-align: top; padding: 8px 10px 8px 0; border-bottom: 1px solid var(--line); }
table.matrix thead th { font-weight: 650; border-bottom: 1.5px solid var(--rule); font-size: 12px; }
table.matrix tbody th { font-weight: 600; width: 16%; }
table.matrix td { width: 16.8%; }
.m-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--ink); margin-right: 7px; transform: translateY(-1px); }
.m-g { width: 11px; height: 11px; margin-right: 6px; vertical-align: -1px; color: var(--ink); }
.m-miss { color: var(--muted); }

/* Kildemerker */
.ev { display: inline-flex; align-items: center; gap: 1px; margin-left: 0.16em; color: var(--ink-2); text-decoration: none; vertical-align: 0.02em; white-space: nowrap; }
.ev .g { width: 0.6em; height: 0.6em; }
.ev-n { font-size: 0.58em; font-weight: 500; color: var(--muted); font-variant-numeric: tabular-nums; transform: translateY(-0.5em); }
.ev:hover .g, .ev:focus-visible .g { color: var(--c2); }
body.hide-ev .ev { display: none; }
.ev-pop { position: absolute; z-index: 40; width: min(380px, calc(100vw - 32px)); padding: 14px 16px; background: var(--paper); color: var(--ink); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,.16); font-size: 14px; line-height: 1.5; }
.ev-pop[hidden] { display: none; }
.ev-pop .row { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 6px; }
.ev-pop .row .g { width: 13px; height: 13px; }
.ev-pop .id { margin-left: auto; font-weight: 500; color: var(--muted); font-variant-numeric: tabular-nums; }
.ev-pop p { margin: 0 0 6px; }
.ev-pop .src { font-family: var(--mono); font-size: 11.5px; color: var(--muted); word-break: break-word; }
.ev-pop .cav { color: var(--ink-2); }
.tip { position: absolute; z-index: 45; pointer-events: none; padding: 6px 10px; border-radius: 8px; background: var(--ink); color: var(--paper); font-size: 13px; line-height: 1.35; max-width: 280px; }
.tip[hidden] { display: none; }
`

const INTERACTION_JS = `
(function () {
  var tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
  function place(el, box, dx, dy) {
    var r = el.getBoundingClientRect();
    var left = Math.min(window.scrollX + r.left + (dx || 0), window.scrollX + document.documentElement.clientWidth - box.offsetWidth - 16);
    box.style.left = Math.max(16, left) + 'px';
    box.style.top = (window.scrollY + r.bottom + (dy || 8)) + 'px';
  }
  document.querySelectorAll('[data-tip]').forEach(function (m) {
    m.setAttribute('tabindex', '0');
    function show() { tip.textContent = m.getAttribute('data-tip'); tip.hidden = false; place(m, tip, -10, 8); }
    function hide() { tip.hidden = true; }
    m.addEventListener('mouseenter', show); m.addEventListener('focus', show);
    m.addEventListener('mouseleave', hide); m.addEventListener('blur', hide);
  });
  var dataEl = document.getElementById('claims-data');
  if (!dataEl) return;
  var claims = JSON.parse(dataEl.textContent);
  var pop = document.createElement('div'); pop.className = 'ev-pop'; pop.hidden = true; pop.setAttribute('role', 'tooltip'); document.body.appendChild(pop);
  var hideTimer;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function open(a) {
    clearTimeout(hideTimer);
    var c = claims[a.getAttribute('data-p')]; if (!c) return;
    pop.innerHTML = '<div class="row">' + c.glyph + '<span>' + esc(c.label) + '</span><span class="id">' + esc(c.id) + ' · ' + esc(c.catalog) + '</span></div>' +
      '<p>' + esc(c.text) + '</p>' + (c.caveat && c.caveat !== '–' ? '<p class="cav">Forbehold: ' + esc(c.caveat) + '</p>' : '') +
      '<p class="src">' + esc(c.source) + '</p>';
    pop.hidden = false; place(a, pop, -20, 10);
  }
  function close() { hideTimer = setTimeout(function () { pop.hidden = true; }, 120); }
  document.querySelectorAll('a.ev').forEach(function (a) {
    a.addEventListener('mouseenter', function () { open(a); });
    a.addEventListener('focus', function () { open(a); });
    a.addEventListener('mouseleave', close); a.addEventListener('blur', close);
  });
  pop.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
  pop.addEventListener('mouseleave', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { pop.hidden = true; tip.hidden = true; } });
  var toggle = document.getElementById('toggle-ev');
  if (toggle) {
    var key = 'hvitbok-v3-hide-ev';
    function apply(hidden) { document.body.classList.toggle('hide-ev', hidden); toggle.setAttribute('aria-pressed', hidden ? 'false' : 'true'); toggle.querySelector('span').textContent = hidden ? 'Vis kildemerker' : 'Skjul kildemerker'; }
    var stored = false; try { stored = localStorage.getItem(key) === '1'; } catch (e) {}
    apply(stored);
    toggle.addEventListener('click', function () { var h = !document.body.classList.contains('hide-ev'); apply(h); try { localStorage.setItem(key, h ? '1' : '0'); } catch (e) {} });
  }
})();
`

// ─── Hvitboka ────────────────────────────────────────────────────────────────

const CHAPTER_QUESTIONS: Record<string, string> = {
  '1': 'Hva skal hvitboka svare på, og for hvem?',
  '2': 'Hvor står matsystemet sterkt, og hvor er det sårbart?',
  '3': 'Hvor ligger makten, ledd for ledd?',
  '4': 'Hva skal til før lagret råvare blir mat på bordet?',
  '5': 'Når gjør gjenbruk matsystemet mer robust?',
  '6': 'Hva kan landene lære av hverandre, og hva må løses sammen?',
  '7': 'Hva vet vi ikke, og hvorfor betyr det noe?',
  '8': 'Hvor bør vi begynne?',
  '9': 'Hva må skje før hvitboka kan publiseres?',
}

type Section = { kind: 'summary' | 'chapter' | 'appendix'; num: string; title: string; id: string; body: string }

function splitSections(body: string): Section[] {
  const parts = body.split(/^## /m).slice(1)
  return parts.map(part => {
    const nl = part.indexOf('\n')
    const heading = part.slice(0, nl).trim()
    const text = part.slice(nl + 1).replace(/^---\s*$/gm, '').trim()
    const ch = heading.match(/^(\d+)\.\s+(.*)$/)
    if (ch) return { kind: 'chapter', num: ch[1], title: ch[2], id: `kapittel-${ch[1]}`, body: text }
    const app = heading.match(/^Vedlegg ([A-Z]):\s*(.*)$/)
    if (app) return { kind: 'appendix', num: app[1], title: app[2], id: `vedlegg-${app[1].toLowerCase()}`, body: text }
    return { kind: 'summary', num: '', title: heading, id: slug(heading), body: text }
  })
}

function markersToSpans(src: string) {
  return src.replace(/\[(P-\d{3})\]/g, '<span class="evm" data-p="$1"></span>')
}

function renderMarkers(html: string, claims: Map<string, Claim>, seen: Set<string>) {
  return html.replace(/\s*<span class="evm" data-p="(P-\d{3})"><\/span>/g, (_m, id: string) => {
    const c = claims.get(id)
    if (!c) throw new Error(`Markør uten registerrad: ${id}`)
    const anchor = seen.has(id) ? '' : ` id="ev-${id.toLowerCase()}"`
    seen.add(id)
    return `<a class="ev ev-${c.cls}"${anchor} href="#${id.toLowerCase()}" data-p="${id}" aria-label="${esc(`${id}: ${STATUS_LABEL[c.cls]}`)}">${glyph(c.cls)}<span class="ev-n">${c.n}</span></a>`
  })
}

// «**Etikett.** tekst» → etikett i margen; nummererte overskrifter får tallet i margen.
function structure(html: string) {
  html = html.replace(/<p><strong>([^<]{2,42}?)\.<\/strong>\s*/g, (m, label: string) => {
    if (/^\d/.test(label)) return m
    return `<p class="has-lead"><span class="lead">${label}</span>`
  })
  html = html.replace(/<h3>(\d+\.\d+|[A-E]\.)\s+([^<]*)<\/h3>/g, (_m, num: string, title: string) => {
    const id = `${num.replace(/\.$/, '')}-${slug(title)}`.toLowerCase()
    return `<h3 id="${id}"><span class="hn">${num.replace(/\.$/, '')}</span>${title}</h3>`
  })
  html = html.replace(/<p><strong>(\d)\.\s+([^<]*)<\/strong>\s*/g, '<p class="key"><span class="hn">$1</span><strong>$2</strong> ')
  html = html.replace(/<table>[\s\S]*?<\/table>/g, tbl => `<div class="scroll-x">${tbl}</div>`)
  return html
}

function insertFigures(html: string, figs: { after: string; html: string }[]) {
  for (const f of figs) {
    const marker = `data-p="${f.after}"`
    const at = html.indexOf(marker)
    if (at < 0) continue
    const end = html.indexOf('</p>', at)
    if (end < 0) throw new Error(`Fant ikke avsnittsslutt etter ${f.after}`)
    html = `${html.slice(0, end + 4)}\n${f.html}\n${html.slice(end + 4)}`
  }
  return html
}

function fingerprint(claims: Map<string, Claim>, withLinks: boolean) {
  const items = [...claims.values()]
    .map(c => {
      const inner = glyph(c.cls, 'fp-g')
      return withLinks
        ? `<a class="fp-i" href="#ev-${c.id.toLowerCase()}" title="${esc(`${c.id} · ${STATUS_LABEL[c.cls]}`)}">${inner}</a>`
        : `<span class="fp-i">${inner}</span>`
    })
    .join('')
  return `<div class="fp" aria-hidden="${withLinks ? 'false' : 'true'}">${items}</div>`
}

function statusCounts(claims: Map<string, Claim>) {
  const counts = Object.fromEntries(STATUS_ORDER.map(s => [s, 0])) as Record<Status, number>
  for (const c of claims.values()) counts[c.cls]++
  return counts
}

function legendList(counts: Record<Status, number>, withHelp: boolean) {
  return `<ul class="status-legend">${STATUS_ORDER.map(
    s => `<li>${glyph(s)}<span class="sl-name">${STATUS_LABEL[s]}</span><span class="sl-n">${counts[s]}</span>${withHelp ? `<span class="sl-help">${STATUS_HELP[s]}</span>` : ''}</li>`,
  ).join('')}</ul>`
}

const WP_CSS = `
.page-cover { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); min-height: calc(100svh - 58px); }
.cover-main { display: flex; flex-direction: column; justify-content: space-between; gap: 48px; padding: clamp(28px, 6vw, 80px) clamp(16px, 5vw, 72px); }
.cover-main .label { margin: 0 0 18px; }
.cover-title { margin: 0; font-size: clamp(44px, 6.6vw, 92px); line-height: 0.98; font-weight: 700; letter-spacing: -0.035em; }
.cover-sub { margin: 18px 0 0; max-width: 18em; font-size: clamp(22px, 2.6vw, 34px); line-height: 1.18; font-weight: 300; font-style: italic; letter-spacing: -0.015em; color: var(--ink-2); }
.cover-meta { display: grid; gap: 4px; font-size: 14px; color: var(--ink-2); }
.cover-meta strong { color: var(--ink); font-weight: 600; }
.cover-print { display: none; }
.cover-fp { display: flex; flex-direction: column; justify-content: center; gap: 26px; padding: clamp(28px, 5vw, 64px); background: var(--sage); }
.cover-fp .label { color: var(--ink); opacity: .78; margin: 0; }
.fp { display: grid; grid-template-columns: repeat(12, 1fr); gap: clamp(6px, 0.9vw, 12px); max-width: 520px; }
.fp-i { display: block; color: var(--ink); line-height: 0; aspect-ratio: 1; }
.fp-g { width: 100%; height: 100%; }
a.fp-i:hover .fp-g, a.fp-i:focus-visible .fp-g { color: var(--c2); transform: scale(1.2); transition: transform .15s; }
.fp-cap { margin: 0; max-width: 34em; font-size: 15px; line-height: 1.5; color: var(--ink); }
.status-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; font-size: 14px; }
.status-legend li { display: grid; grid-template-columns: 16px 1fr auto; column-gap: 10px; align-items: baseline; }
.status-legend .g { width: 12px; height: 12px; transform: translateY(1px); }
.status-legend .sl-n { font-variant-numeric: tabular-nums; font-weight: 600; }
.status-legend .sl-help { grid-column: 2 / 4; font-size: 13px; line-height: 1.45; color: var(--ink-2); }
@media screen and (max-width: 900px) { .page-cover { grid-template-columns: 1fr; min-height: 0; } .fp { grid-template-columns: repeat(12, 1fr); } }

.wrap { width: min(100% - 32px, calc(var(--rail) + var(--text) + 40px)); margin-inline: auto; }
.front { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); gap: clamp(28px, 5vw, 72px); padding: clamp(40px, 7vw, 96px) 0 clamp(24px, 4vw, 48px); }
.front h2 { margin: 0 0 18px; font-size: 30px; letter-spacing: -0.02em; }
.toc { list-style: none; margin: 0; padding: 0; border-top: 1.5px solid var(--rule); }
.toc li { border-bottom: 1px solid var(--line); }
.toc a { display: grid; grid-template-columns: 2.2em 1fr auto; gap: 10px; padding: 10px 0; text-decoration: none; }
.toc a:hover .t { text-decoration: underline; }
.toc .n { color: var(--muted); font-variant-numeric: tabular-nums; }
.toc .t { font-weight: 600; }
.toc .q { display: block; font-weight: 300; font-style: italic; color: var(--ink-2); font-size: 15px; }
.toc .p { color: var(--muted); font-variant-numeric: tabular-nums; }
.readbox { padding: 22px 24px; background: var(--panel); border-radius: 16px; align-self: start; }
.readbox h2 { font-size: 20px; margin-bottom: 8px; }
.readbox p { margin: 0 0 16px; font-size: 15px; line-height: 1.5; color: var(--ink-2); }
.colophon { margin-top: 22px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 12.5px; line-height: 1.5; color: var(--muted); overflow-wrap: anywhere; }
@media screen and (max-width: 900px) { .front { grid-template-columns: minmax(0, 1fr); } }

.opener { background: var(--sage); color: var(--ink); }
.opener-in { width: min(100% - 32px, calc(var(--rail) + var(--text) + 40px)); margin-inline: auto; padding: clamp(48px, 8vw, 110px) 0 clamp(36px, 5vw, 64px); display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 28px 48px; align-items: end; }
.opener .kicker { margin: 0 0 10px; }
.opener .kicker .label { color: var(--ink); opacity: .7; }
.opener-num { display: block; font-size: clamp(34px, 4.4vw, 58px); font-weight: 700; line-height: 1; letter-spacing: -0.03em; }
.opener h2 { margin: 6px 0 0; font-size: clamp(34px, 4.4vw, 58px); line-height: 1.02; font-weight: 700; letter-spacing: -0.03em; }
.opener-q { margin: 14px 0 0; font-size: clamp(22px, 2.5vw, 32px); line-height: 1.2; font-weight: 300; font-style: italic; letter-spacing: -0.015em; }
.opener-sub { list-style: none; margin: 0; padding: 0; font-size: 15px; line-height: 1.55; }
.opener-sub li::before { content: "•"; margin-right: 10px; }
.opener-sub a { text-decoration: none; }
.opener-sub a:hover { text-decoration: underline; }
@media screen and (max-width: 900px) { .opener-in { grid-template-columns: 1fr; } }

.prose { padding: clamp(36px, 5vw, 64px) 0 clamp(48px, 6vw, 88px); padding-left: calc(var(--rail) + 40px); }
.prose > * { max-width: var(--text); }
.prose .fig { max-width: calc(var(--rail) + 40px + var(--text)); margin-left: calc(-1 * (var(--rail) + 40px)); }
.prose p { margin: 0 0 1.05em; }
.prose h3 { position: relative; margin: 2.1em 0 0.7em; font-size: 23px; line-height: 1.25; font-weight: 650; letter-spacing: -0.015em; }
.prose h3 .hn, .prose .key .hn { position: absolute; left: calc(-1 * (var(--rail) + 40px)); width: var(--rail); font-weight: 650; color: var(--muted); font-variant-numeric: tabular-nums; }
.prose .has-lead, .prose .key { position: relative; }
.prose .lead { position: absolute; left: calc(-1 * (var(--rail) + 40px)); width: var(--rail); top: 0.42em; font-size: 11.5px; line-height: 1.35; font-weight: 650; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-2); border-top: 1.5px solid var(--rule); padding-top: 7px; }
.prose .key { padding-top: 12px; border-top: 1px solid var(--line); }
.prose .key .hn { top: 12px; font-size: 26px; line-height: 1.1; color: var(--ink); }
.prose .key strong { display: block; font-size: 21px; line-height: 1.3; letter-spacing: -0.01em; margin-bottom: 6px; }
.prose ul, .prose ol { padding-left: 1.2em; margin: 0 0 1.1em; }
.prose li { margin-bottom: 0.45em; }
.prose table { margin: 1.4em 0 1.8em; font-size: 15px; }
.prose blockquote { margin: 1.4em 0; padding: 0 0 0 18px; border-left: 2px solid var(--rule); color: var(--ink-2); }
@media screen and (max-width: 900px) {
  .prose { padding-left: 0; }
  .prose .fig { margin-left: 0; }
  .prose h3 .hn, .prose .key .hn { position: static; display: inline-block; width: auto; margin-right: 10px; }
  .prose .lead { position: static; display: block; width: auto; margin-bottom: 6px; border-top: 0; padding-top: 0; }
}

.register { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.45; }
.register th, .register td { text-align: left; vertical-align: top; padding: 8px 12px 8px 0; border-bottom: 1px solid var(--line); }
.register thead th { font-weight: 650; border-bottom: 1.5px solid var(--rule); }
.register td.r-id { white-space: nowrap; font-variant-numeric: tabular-nums; font-weight: 600; }
.register td.r-st { white-space: nowrap; }
.register td.r-st .g { width: 11px; height: 11px; margin-right: 6px; vertical-align: -1px; }
.register td.r-src { font-family: var(--mono); font-size: 11.5px; color: var(--muted); word-break: break-word; }
.register tr:target { background: var(--sage-soft); }
.register-wrap { padding-left: 0 !important; }
.register-wrap > * { max-width: none !important; }
.sitefoot { border-top: 1px solid var(--line); padding: 28px 0 48px; font-size: 13px; color: var(--muted); }
.sitefoot .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
`

const WP_PRINT_CSS = `
@page {
  size: A4; margin: 17mm 17mm 20mm 17mm;
  @top-right { content: "UTKAST"; color: #d95c5c; font: 400 12pt Inter, sans-serif; vertical-align: bottom; padding-bottom: 3mm; }
  @bottom-left { content: url("${NS_SYMBOL_DATA_URI}") "  Natural State     " counter(page); white-space: pre; font: 400 7pt Inter, sans-serif; color: #141414; vertical-align: top; padding-top: 5mm; }
  @bottom-center { content: "© 2026"; font: 400 6pt Inter, sans-serif; color: #676b63; vertical-align: top; padding-top: 5.5mm; }
  @bottom-right { content: "The natural state of place\\A naturalstate.no"; white-space: pre; text-align: right; font: 600 6pt Inter, sans-serif; color: #141414; vertical-align: top; padding-top: 4.5mm; }
}
@page full { margin: 0; @top-right { content: none; } @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }
@media print {
  :root { --rail: 40mm; --text: 125mm; color-scheme: light; }
  html, body { background: #fff; color: #141414; }
  body { font-size: 9.3pt; line-height: 1.52; }
  .topbar, .fig-data, .toggle, .screen-only, .ev-pop, .tip { display: none !important; }
  a { text-decoration: none; }
  .page-cover { page: full; display: block; height: 297mm; min-height: 0; position: relative; break-after: page; }
  .cover-main { position: absolute; inset: 0 0 118mm 0; padding: 16mm 17mm 0; display: block; }
  .cover-print { display: flex; justify-content: space-between; align-items: center; font-size: 10pt; margin-bottom: 40mm; }
  .cover-print .tag { font-size: 12pt; }
  .cover-main .label { font-size: 7.5pt; margin-bottom: 5mm; }
  .cover-title { font-size: 42pt; }
  .cover-sub { font-size: 19pt; max-width: 15em; margin-top: 5mm; }
  .cover-meta { position: absolute; left: 17mm; bottom: 8mm; font-size: 8.5pt; }
  .cover-fp { position: absolute; left: 0; right: 0; bottom: 0; height: 118mm; padding: 13mm 17mm 12mm; display: grid; grid-template-columns: 1fr 58mm; grid-template-rows: auto 1fr; column-gap: 12mm; row-gap: 6mm; align-content: start; }
  .cover-fp .label { grid-column: 1 / 3; font-size: 7.5pt; }
  .cover-fp .fp { grid-template-columns: repeat(18, 1fr); gap: 2.4mm; max-width: none; align-self: start; }
  .cover-fp .fp-side { display: grid; gap: 5mm; align-content: start; }
  .fp-cap { font-size: 8pt; }
  .status-legend { font-size: 7.6pt; gap: 1.6mm; }
  .status-legend .g { width: 2.7mm; height: 2.7mm; }
  .status-legend .sl-help { font-size: 6.8pt; }
  .front { display: block; padding: 0; break-after: page; }
  .front h2 { font-size: 20pt; margin-bottom: 5mm; }
  .toc a { padding: 1.5mm 0; grid-template-columns: 9mm 1fr 10mm; line-height: 1.3; }
  .toc .t { font-size: 9.6pt; }
  .toc .q { font-size: 7.8pt; }
  .toc .p { text-align: right; }
  .readbox { margin-top: 6mm; padding: 4.5mm 6mm; border-radius: 3mm; break-inside: avoid; }
  .readbox .status-legend { grid-template-columns: 1fr 1fr; column-gap: 8mm; }
  .readbox h2 { font-size: 11pt; }
  .readbox p { font-size: 8pt; margin-bottom: 3mm; }
  .readbox .status-legend .sl-help { font-size: 7pt; }
  .colophon { font-size: 7pt; margin-top: 5mm; padding-top: 3mm; }
  .wrap { width: auto; margin: 0; }
  .label { font-size: 7pt; }
  .opener { page: full; height: 297mm; break-before: page; break-after: page; position: relative; background: #9db692; }
  .opener-in { position: absolute; inset: 0; width: auto; margin: 0; padding: 17mm 17mm 22mm; display: block; }
  .opener-in > div:first-child { position: absolute; left: 17mm; right: 17mm; top: 17mm; }
  .opener .kicker { margin-bottom: 3mm; }
  .opener .kicker .label { font-size: 7.5pt; }
  .opener-num, .opener h2 { font-size: 30pt; }
  .opener-q { font-size: 20pt; max-width: 15em; margin-top: 4mm; }
  .opener-sub { position: absolute; left: 17mm; bottom: 22mm; font-size: 10.5pt; line-height: 1.6; }
  .opener-tag { position: absolute; right: 17mm; top: 11mm; color: #d95c5c; font-size: 12pt; }
  .opener-foot { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 7pt; }
  .prose { padding: 0 0 0 calc(var(--rail) + 7mm); }
  .prose > * { max-width: none; }
  .prose .fig { max-width: none; margin-left: calc(-1 * (var(--rail) + 7mm)); }
  .prose h3 { font-size: 12.5pt; margin: 7mm 0 2.5mm; break-after: avoid; }
  .prose h3 .hn, .prose .key .hn { left: calc(-1 * (var(--rail) + 7mm)); width: var(--rail); }
  .prose .lead { left: calc(-1 * (var(--rail) + 7mm)); width: var(--rail); font-size: 6.6pt; top: 0.3em; padding-top: 1.6mm; }
  .prose p { orphans: 3; widows: 3; }
  .prose .key strong { font-size: 11pt; }
  .prose .key .hn { font-size: 14pt; }
  .prose table { font-size: 8pt; }
  .summary-head { break-before: page; }
  .fig { break-inside: avoid; margin: 6mm 0 7mm; }
  .fig:has(table.matrix) { break-inside: auto; }
  table.matrix tr { break-inside: avoid; }
  .fig-head { padding-top: 2.5mm; margin-bottom: 3mm; }
  .fig-num { font-size: 6.6pt; }
  .fig-title { font-size: 10pt; }
  .fig-note { font-size: 7.6pt; margin: 3mm 0 1.5mm; }
  .fig-source { font-size: 6.8pt; }
  .chart .ax, .chart .lab-sub, .chart .lab-tag { font-size: 10px; }
  .chart-wide { min-width: 0; }
  .scroll-x { overflow: visible; }
  .tile { padding: 4mm 5mm; border-radius: 3mm; }
  .tile-value { font-size: 26pt; }
  .tile-sub { font-size: 8pt; }
  table.matrix { font-size: 6.6pt; min-width: 0; }
  table.matrix thead th { font-size: 6.4pt; }
  .legend { font-size: 7.6pt; }
  .ev .g { width: 0.62em; height: 0.62em; }
  .appendix-head { break-before: page; }
  .register { font-size: 6.4pt; line-height: 1.35; }
  .register td.r-src { font-size: 5.8pt; }
  .register th, .register td { padding: 1.3mm 2.5mm 1.3mm 0; }
  .register tr { break-inside: avoid; }
  .sitefoot { display: none; }
}
`

function renderWhitepaper(claims: Map<string, Claim>, pageNumbers: Record<string, number>) {
  const { meta, body } = stripFrontmatter(read('research/whitepaper/v3/hvitbok-v3-utkast.md'))
  let src = body.split(/^## Figurforslag/m)[0]
  src = src.replace(/^# .*\n+## .*\n+> \*\*Bruksregel[^\n]*\n/m, '')
  if (src.includes('> **Bruksregel')) throw new Error('Bruksregelen i utkastet ble ikke fjernet')
  src = replaceOnce(src, 'Hver faktasetning har en markør som `[P-012]` som peker til et påstandsregister.', 'Hver faktasetning har et lite statusmerke som peker til påstandsregisteret i vedlegg B.')
  src = replaceOnce(src, 'har en markør som peker til `pastandsregister.md`.', 'har et statusmerke som peker til påstandsregisteret i vedlegg B.')
  src = typo(markersToSpans(src))
  const sections = splitSections(src)
  const seen = new Set<string>()
  let fig = 0
  const nextFig = (fn: (n: number) => string) => fn(++fig)
  const figureOrder: { chapter: string; after: string; make: (n: number) => string }[] = [
    { chapter: '2', after: 'P-013', make: n => figSqueeze(n) },
    { chapter: '2', after: 'P-055', make: figResidual },
    { chapter: '3', after: 'P-019', make: figConcentration },
    { chapter: '4', after: 'P-081', make: figHarvest },
    { chapter: '4', after: 'P-082', make: figChain },
    { chapter: '4', after: 'P-085', make: figRequirement },
  ]
  const counts = statusCounts(claims)
  const title = 'Et robust og sirkulært matsystem'
  const subtitle = 'Hva vi vet, hva vi ikke vet, og hvor vi bør begynne'

  const chapterHtml: string[] = []
  for (const sec of sections) {
    let html = structure(mdToHtml(sec.body))
    if (sec.kind === 'chapter') {
      const figs = figureOrder.filter(f => f.chapter === sec.num).map(f => ({ after: f.after, html: nextFig(f.make) }))
      html = insertFigures(html, figs)
    }
    html = renderMarkers(html, claims, seen)
    if (sec.kind === 'chapter') {
      const subs = [...html.matchAll(/<h3 id="([^"]+)"><span class="hn">([^<]+)<\/span>([^<]*)<\/h3>/g)]
      chapterHtml.push(`<section class="chapter" id="${sec.id}" aria-labelledby="${sec.id}-t">
<header class="opener"><div class="opener-in"><div>
<p class="kicker"><span class="label">Kapittel ${sec.num}</span></p>
<span class="opener-num" aria-hidden="true">${sec.num}.</span>
<h2 id="${sec.id}-t">${sec.title}</h2>
<p class="opener-q">${CHAPTER_QUESTIONS[sec.num] ?? ''}</p>
</div>
<ul class="opener-sub">${subs.map(m => `<li><a href="#${m[1]}">${m[3]}</a></li>`).join('')}</ul>
<span class="opener-tag print-only">UTKAST</span>
<div class="opener-foot print-only">${nsLockup()}<span>${DATE_LABEL}</span></div>
</div></header>
<div class="wrap prose">${html}</div>
</section>`)
    } else if (sec.kind === 'summary') {
      chapterHtml.push(`<section class="summary" id="${sec.id}">
<div class="wrap prose summary-head"><p class="label">Sammendrag</p><h2 class="sum-title">Sju hovedbudskap og fem satsingsområder</h2>${html}</div>
</section>`)
    } else {
      chapterHtml.push(`<section class="appendix" id="${sec.id}">
<div class="wrap prose appendix-head"><p class="label">Vedlegg ${sec.num}</p><h2 class="sum-title">${sec.title}</h2>${html}</div>
</section>`)
    }
  }
  const unused = [...claims.keys()].filter(id => !seen.has(id))
  if (unused.length) throw new Error(`Registerrader uten markør i teksten: ${unused.join(', ')}`)

  const registerRows = [...claims.values()]
    .map(c => `<tr id="${c.id.toLowerCase()}"><td class="r-id"><a href="#ev-${c.id.toLowerCase()}">${c.id}</a></td><td class="r-st">${glyph(c.cls)}${STATUS_LABEL[c.cls]}</td><td>${esc(c.text)}${c.caveat && c.caveat !== '–' ? `<br><span class="muted">Forbehold: ${esc(c.caveat)}</span>` : ''}</td><td class="r-src">${esc(c.catalog)}<br>${esc(c.source)}</td></tr>`)
    .join('')
  chapterHtml.push(`<section class="appendix" id="vedlegg-b">
<div class="wrap prose appendix-head register-wrap"><p class="label">Vedlegg B</p><h2 class="sum-title">Påstandsregister</h2>
<p>Alle ${claims.size} påstander i hvitboka, med status, forbehold og kilde. Kildene er oppgitt som stier i prosjektets kunnskapsbase. En utgave for offentlig publisering skal vise til de offentlige primærkildene direkte.</p>
<table class="register"><thead><tr><th>Nr.</th><th>Status</th><th>Påstand</th><th>Katalog og kilde</th></tr></thead><tbody>${registerRows}</tbody></table></div>
</section>`)

  const tocItems = sections
    .map(s => {
      const n = s.kind === 'chapter' ? s.num : s.kind === 'appendix' ? s.num : ''
      const q = s.kind === 'chapter' ? `<span class="q">${CHAPTER_QUESTIONS[s.num]}</span>` : ''
      const p = pageNumbers[s.id] ? String(pageNumbers[s.id]) : ''
      return `<li><a href="#${s.id}"><span class="n">${n}</span><span class="t">${s.kind === 'appendix' ? `Vedlegg ${s.num}: ` : ''}${s.title}${q}</span><span class="p">${p}</span></a></li>`
    })
    .concat(`<li><a href="#vedlegg-b"><span class="n">B</span><span class="t">Vedlegg B: Påstandsregister</span><span class="p">${pageNumbers['vedlegg-b'] ?? ''}</span></a></li>`)
    .join('')

  const claimsJson = JSON.stringify(
    Object.fromEntries([...claims.values()].map(c => [c.id, { id: c.id, catalog: c.catalog, label: STATUS_LABEL[c.cls], glyph: glyph(c.cls), text: c.text, caveat: c.caveat, source: c.source }])),
  ).replace(/</g, '\\u003c')

  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} – hvitbok v3 (utkast)</title>
<meta name="description" content="${esc(subtitle)}. Utkast v3 fra Food Transition Group, Natural State og Nordic Circular Hotspot.">
${FONT_LINK}
<style>${BASE_CSS}${WP_CSS}
.print-only { display: none; }
.muted { color: var(--muted); }
.sum-title { margin: 6px 0 28px; font-size: clamp(30px, 3.6vw, 44px); line-height: 1.08; letter-spacing: -0.025em; }
.summary .prose, .appendix .prose { padding-top: clamp(40px, 6vw, 80px); }
@media print { .print-only { display: block; } .opener-foot.print-only { display: flex; } .sum-title { font-size: 22pt; margin-bottom: 7mm; } }
${WP_PRINT_CSS}</style>
</head>
<body>
<header class="topbar">
${nsLockup()}
<span class="doc-title">${title}</span>
<span class="tag">UTKAST</span>
<span class="spacer"></span>
<details class="toc-menu"><summary class="btn">Innhold</summary><div class="toc-pop"><ol>${sections
    .map(s => `<li><a href="#${s.id}"><span class="n">${s.kind === 'summary' ? '' : s.num}</span><span>${s.title}</span></a></li>`)
    .join('')}<li><a href="#vedlegg-b"><span class="n">B</span><span>Påstandsregister</span></a></li></ol></div></details>
<button class="btn toggle hide-sm" id="toggle-ev" type="button" aria-pressed="true"><span>Skjul kildemerker</span></button>
<a class="btn" href="hvitbok-v3.pdf" download><span class="hide-sm">Last ned</span>PDF</a>
</header>
<main id="innhold">
<section class="page-cover" aria-labelledby="doc-title">
<div class="cover-main">
<div>
<div class="cover-print">${nsLockup()}<span class="tag">UTKAST</span></div>
<p class="label">Hvitbok · Food Transition Group</p>
<h1 class="cover-title" id="doc-title">${title}</h1>
<p class="cover-sub">${subtitle}</p>
</div>
<div class="cover-meta"><strong>Natural State · Nordic Circular Hotspot</strong><span>Utkast v3, ${DATE_LABEL}. Ikke for sitering.</span></div>
</div>
<div class="cover-fp">
<p class="label">Kunnskapsgrunnlaget i ett bilde</p>
${fingerprint(claims, true)}
<div class="fp-side">
<p class="fp-cap">Hvert merke er én av de ${claims.size} påstandene i hvitboka, i registerets rekkefølge. Fylt sirkel er kildebelagt. Stiplet sirkel er et kunnskapshull.</p>
${legendList(counts, false)}
</div>
</div>
</section>
<section class="front wrap" aria-label="Innhold og lesehjelp">
<div>
<h2>Innhold</h2>
<ol class="toc">${tocItems}</ol>
</div>
<aside class="readbox">
<h2>Slik leser du statusmerkene</h2>
<p>Bak hver faktasetning står et lite sirkelmerke med nummer. Merket viser hvor godt påstanden er belagt, og nummeret peker til påstandsregisteret i vedlegg B.</p>
${legendList(counts, true)}
<p class="colophon">Utgitt av Food Transition Group i Natural State og Nordic Circular Hotspot. Utkast v3, ${DATE_LABEL}. Utkastet er ikke presentasjonsklart og ikke for sitering før påstandene er kontrollert mot primærkilde og versjonen er signert. Kilde: ${esc(meta.grunnlag ?? '')}.</p>
</aside>
</section>
${chapterHtml.join('\n')}
</main>
<footer class="sitefoot"><div class="wrap">${nsLockup()}<span>Utkast v3 · ${DATE_LABEL} · The natural state of place · naturalstate.no</span></div></footer>
<script id="claims-data" type="application/json">${claimsJson}</script>
<script>${INTERACTION_JS}</script>
</body>
</html>`
}

// ─── Artiklene ───────────────────────────────────────────────────────────────

type ArticleSpec = {
  file: string
  code: string
  figure?: (n: number) => string
  card: { value: string; unit: string; label: string; source: string; status: Status }
}

const ARTICLES: ArticleSpec[] = [
  {
    file: 'V9-hvor-sjokket-lander',
    code: 'V9',
    figure: n => figSqueeze(n, true),
    card: { value: '+5,3', unit: 'mrd. kr', label: 'økning i tilskudd til jordbruket 2021–2023, mot +4,1 mrd. kr fra markedet og +7,0 mrd. kr i kostnader', source: 'Budsjettnemnda for jordbruket, Totalkalkylen UT-1-2026, tabell 1.1', status: 'kontrollert' },
  },
  {
    file: 'V6-eudr-treffkartet',
    code: 'V6',
    figure: figEudrTimeline,
    card: { value: '30.12.2026', unit: '', label: 'EUDR gjelder for store og mellomstore virksomheter i EU. Norge har ingen dato.', source: 'Forordning (EU) 2025/2650 og Landbruksdirektoratet, status per 15.09.2026', status: 'kontrollert' },
  },
  {
    file: 'V10-hva-som-feilet',
    code: 'V10',
    figure: figBankruptcies,
    card: { value: '9', unit: 'konkurser', label: 'i nordisk sirkulær mat og alternativt protein, 2019–2026', source: 'Brønnøysund, Bolagsverket, CVR og YTJ, lest 15.09.2026', status: 'kontrollert' },
  },
]

function articleSections(body: string) {
  const out: Record<string, string> = {}
  for (const part of body.split(/^## /m).slice(1)) {
    const nl = part.indexOf('\n')
    out[part.slice(0, nl).trim()] = part.slice(nl + 1).trim()
  }
  return out
}

const ART_CSS = `
.art { width: min(100% - 32px, 720px); margin-inline: auto; padding: clamp(36px, 6vw, 80px) 0 clamp(48px, 6vw, 88px); }
.art-kicker { margin: 0 0 18px; }
.art h1 { margin: 0; font-size: clamp(36px, 5.2vw, 60px); line-height: 1.02; font-weight: 700; letter-spacing: -0.032em; }
.art-byline { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: center; margin: 22px 0 0; padding: 12px 0; border-top: 1.5px solid var(--rule); border-bottom: 1px solid var(--line); font-size: 14px; color: var(--ink-2); }
.art-byline .tag { margin-left: auto; }
.art-ingress { margin: 28px 0 8px; font-size: clamp(21px, 2.2vw, 25px); line-height: 1.42; font-weight: 400; letter-spacing: -0.01em; }
.art-body h3 { margin: 1.9em 0 0.5em; font-size: 22px; line-height: 1.25; letter-spacing: -0.015em; }
.art-body p { margin: 0 0 1em; }
.art-body ul { padding-left: 1.2em; }
.art-body .unknown { list-style: none; padding: 0; margin: 0 0 1.2em; }
.art-body .unknown li { position: relative; padding-left: 26px; margin-bottom: 0.55em; }
.art-body .unknown li .g { position: absolute; left: 0; top: 0.42em; width: 13px; height: 13px; color: var(--ink); }
.factbox { margin: 2.2em 0; padding: 22px 24px 18px; background: var(--panel); border-radius: 16px; }
.factbox > .label { margin: 0 0 10px; color: var(--ink-2); }
.factbox h2 { margin: 0 0 14px; font-size: 20px; letter-spacing: -0.01em; }
.factbox table { width: 100%; border-collapse: collapse; font-size: 14.5px; line-height: 1.45; font-variant-numeric: tabular-nums; }
.factbox th, .factbox td { text-align: left; vertical-align: top; padding: 8px 12px 8px 0; border-bottom: 1px solid color-mix(in srgb, var(--rule) 18%, transparent); }
.factbox thead th { border-bottom: 1.5px solid var(--rule); }
.factbox p { margin: 10px 0 0; font-size: 13px; color: var(--ink-2); }
.sources { margin-top: 2.6em; padding-top: 14px; border-top: 1.5px solid var(--rule); font-size: 14px; line-height: 1.5; }
.sources h2 { margin: 0 0 10px; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.sources ul { padding-left: 1.1em; }
.sources li { margin-bottom: 0.5em; word-break: break-word; }
.art-foot { margin-top: 3em; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--muted); }
@page { size: A4; margin: 17mm 20mm 20mm 20mm;
  @top-right { content: "UTKAST"; color: #d95c5c; font: 400 12pt Inter, sans-serif; vertical-align: bottom; padding-bottom: 3mm; }
  @bottom-left { content: url("${NS_SYMBOL_DATA_URI}") "  Natural State     " counter(page); white-space: pre; font: 400 7pt Inter, sans-serif; color: #141414; vertical-align: top; padding-top: 5mm; }
  @bottom-right { content: "The natural state of place\\A naturalstate.no"; white-space: pre; text-align: right; font: 600 6pt Inter, sans-serif; color: #141414; vertical-align: top; padding-top: 4.5mm; }
}
@media print {
  :root { color-scheme: light; }
  html, body { background: #fff; color: #141414; }
  body { font-size: 9.6pt; line-height: 1.55; }
  .topbar, .fig-data, .tip { display: none !important; }
  a { text-decoration: none; }
  .art { width: auto; padding: 4mm 0 0; }
  .art h1 { font-size: 27pt; }
  .art-byline { font-size: 8pt; margin-top: 6mm; }
  .art-ingress { font-size: 12.5pt; margin-top: 7mm; }
  .art-body h3 { font-size: 12pt; break-after: avoid; }
  .factbox { break-inside: avoid; padding: 5mm 6mm; border-radius: 3mm; }
  .factbox table { font-size: 8pt; }
  .factbox h2 { font-size: 11pt; }
  .fig { break-inside: avoid; }
  .fig-note { font-size: 7.6pt; } .fig-source { font-size: 6.8pt; } .fig-title { font-size: 10pt; } .legend { font-size: 7.6pt; }
  .chart-wide { min-width: 0; } .scroll-x { overflow: visible; }
  .sources { font-size: 7.6pt; break-before: auto; }
  .sources li { margin-bottom: 1mm; }
  .art-foot { font-size: 7pt; }
}
`

function renderArticle(spec: ArticleSpec) {
  const { meta, body } = stripFrontmatter(read(`research/whitepaper/v3/artikler/${spec.file}.md`))
  const secs = articleSections(body)
  const title = meta.tittel ?? spec.file
  const strip = (s: string) => typo(s.replace(/\s*\[V\d+-\d+\]/g, ''))
  const ingress = strip(secs['Ingress'] ?? '')
  let bodyHtml = mdToHtml(strip(secs['Brødtekst'] ?? ''))
  bodyHtml = bodyHtml.replace(/(<h3>Hva vi ikke vet ennå<\/h3>\s*)<ul>([\s\S]*?)<\/ul>/, (_m, h: string, items: string) =>
    `${h}<ul class="unknown">${items.replace(/<li>/g, `<li>${glyph('datagap')}`)}</ul>`,
  )
  // Faktaboksen: tabellen og overskriften fra forslagsdelen, uten figurforslagene.
  const factSrc = secs['Forslag til faktaboks og figur'] ?? ''
  const factMatch = factSrc.match(/\*\*Faktaboks[^*]*?\*\*\s*\n\n((?:\|.*\n?)+)(?:\n([^\n*][^\n]*))?/)
  let factbox = ''
  if (factMatch) {
    const heading = factSrc.match(/\*\*Faktaboks\s*[–-]\s*([^*]+)\*\*/)?.[1] ?? 'Faktaboks'
    const note = factMatch[2] && !factMatch[2].startsWith('**') ? `<p>${mdInline(factMatch[2].replace(/^Boksen må ha fotnote:\s*/, '').replace(/^«|»$/g, ''))}</p>` : ''
    factbox = `<aside class="factbox"><p class="label">Faktaboks</p><h2>${heading.trim()}</h2>${mdToHtml(factMatch[1])}${note}</aside>`
  }
  const figure = spec.figure ? spec.figure(1) : ''
  // Plasser figuren etter første mellomtittel-avsnitt, faktaboksen før «Hva betyr dette?».
  const firstH3End = bodyHtml.indexOf('</p>', bodyHtml.indexOf('<h3>', bodyHtml.indexOf('<h3>') + 4))
  if (figure && firstH3End > 0) bodyHtml = `${bodyHtml.slice(0, firstH3End + 4)}\n${figure}\n${bodyHtml.slice(firstH3End + 4)}`
  if (factbox) bodyHtml = bodyHtml.replace('<h3>Hva betyr dette?</h3>', `${factbox}\n<h3>Hva betyr dette?</h3>`)
  const sourcesKey = Object.keys(secs).find(k => k.startsWith('Kilder'))
  const sources = sourcesKey
    ? mdToHtml(secs[sourcesKey]).replace(/>(https?:\/\/[^<]{64,})<\/a>/g, (_m, u: string) => `>${u.slice(0, 60)}…</a>`)
    : ''
  const linkedIn = (secs[Object.keys(secs).find(k => k.startsWith('LinkedIn')) ?? ''] ?? '').trim()
  const html = `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} (utkast)</title>
<meta name="description" content="${esc(ingress.slice(0, 180))}">
${FONT_LINK}
<style>${BASE_CSS}${ART_CSS}</style>
</head>
<body>
<header class="topbar">${nsLockup()}<span class="doc-title">Innsikt fra Food Transition Group</span><span class="tag">UTKAST</span><span class="spacer"></span><a class="btn hide-sm" href="../index.html">Alle utgaver</a><a class="btn" href="${spec.file}.pdf" download><span class="hide-sm">Last ned</span>PDF</a></header>
<main class="art">
<p class="art-kicker label">Innsikt · Food Transition Group</p>
<h1>${esc(title)}</h1>
<div class="art-byline"><span>Natural State · Nordic Circular Hotspot</span><span>${DATE_LABEL}</span><span class="tag">Utkast, ikke for publisering</span></div>
<p class="art-ingress">${mdInline(ingress)}</p>
<div class="art-body">${bodyHtml}</div>
<section class="sources"><h2>Kilder</h2>${sources}</section>
<div class="art-foot">${nsLockup()}<span>The natural state of place · naturalstate.no</span></div>
</main>
<script>${INTERACTION_JS}</script>
</body>
</html>`
  return { html, title, linkedIn }
}

function renderCard(spec: ArticleSpec, title: string) {
  const short = title.split(':')[0]
  const restRaw = title.includes(':') ? title.slice(title.indexOf(':') + 1).trim() : ''
  const rest = restRaw ? restRaw[0].toUpperCase() + restRaw.slice(1) : ''
  const len = spec.card.value.length
  const valueSize = len <= 3 ? 280 : len <= 8 ? 200 : 150
  return `<!doctype html><html lang="nb"><head><meta charset="utf-8">${FONT_LINK}<style>
html, body { margin: 0; width: 1080px; height: 1350px; background: #fff; color: #141414; font-family: Inter, sans-serif; }
.card { position: relative; width: 1080px; height: 1350px; overflow: hidden; }
.top { position: absolute; left: 72px; right: 72px; top: 64px; display: flex; justify-content: space-between; align-items: center; font-size: 26px; }
.ns-lockup { display: inline-flex; align-items: center; gap: 14px; font-weight: 500; }
.ns-sym { width: 40px; height: 40px; }
.tag { color: #d95c5c; font-size: 26px; }
.kicker { position: absolute; left: 72px; top: 240px; font-size: 22px; font-weight: 650; letter-spacing: .14em; text-transform: uppercase; color: #3a3d37; }
.value { position: absolute; left: 66px; top: 290px; font-size: ${valueSize}px; line-height: 1; font-weight: 700; letter-spacing: ${len > 8 ? '-0.03em' : '-0.05em'}; }
.src { position: absolute; left: 72px; right: 72px; top: 790px; display: flex; gap: 14px; align-items: baseline; padding-top: 18px; border-top: 2px solid #141414; font-size: 24px; line-height: 1.35; color: #3a3d37; }
.src .g { width: 18px; height: 18px; flex: none; transform: translateY(2px); color: #141414; }
.src strong { color: #141414; font-weight: 600; }
.value small { font-size: 64px; font-weight: 600; letter-spacing: -0.02em; margin-left: 14px; }
.vlabel { position: absolute; left: 72px; right: 120px; top: ${290 + valueSize + 34}px; font-size: 34px; line-height: 1.3; color: #3a3d37; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 470px; background: #9db692; padding: 64px 72px; box-sizing: border-box; }
.band h1 { margin: 0; font-size: 62px; line-height: 1.04; font-weight: 700; letter-spacing: -0.03em; }
.band p { margin: 18px 0 0; font-size: 32px; line-height: 1.25; font-weight: 300; font-style: italic; }
.band .foot { position: absolute; left: 72px; right: 72px; bottom: 52px; display: flex; justify-content: space-between; font-size: 22px; }
</style></head><body><div class="card">
<div class="top">${nsLockup()}<span class="tag">UTKAST</span></div>
<div class="kicker">Innsikt · Food Transition Group</div>
<div class="value">${spec.card.value}${spec.card.unit ? `<small>${spec.card.unit}</small>` : ''}</div>
<div class="vlabel">${spec.card.label}</div>
<div class="src">${glyph(spec.card.status)}<span><strong>${STATUS_LABEL[spec.card.status]}.</strong> ${esc(spec.card.source)}</span></div>
<div class="band"><h1>${esc(short)}</h1>${rest ? `<p>${esc(rest)}</p>` : ''}<div class="foot"><span>Natural State · Nordic Circular Hotspot</span><span>naturalstate.no</span></div></div>
</div></body></html>`
}

// ─── Oversikt ────────────────────────────────────────────────────────────────

function renderIndex(articles: { spec: ArticleSpec; title: string }[], counts: Record<Status, number>, total: number) {
  const art = articles
    .map(a => `<li class="item"><div><p class="label">Artikkel ${a.spec.code}</p><h3>${esc(a.title)}</h3></div><div class="links"><a href="artikler/${a.spec.file}.html">Les på nett</a><a href="artikler/${a.spec.file}.pdf">PDF</a><a href="linkedin/${a.spec.file}.png">LinkedIn-kort</a><a href="linkedin/${a.spec.file}.txt">LinkedIn-tekst</a></div></li>`)
    .join('')
  return `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hvitbok v3 og artikler – utgaver</title>${FONT_LINK}<style>${BASE_CSS}
.idx { width: min(100% - 32px, 920px); margin-inline: auto; padding: clamp(40px, 7vw, 96px) 0; }
.idx h1 { margin: 0 0 10px; font-size: clamp(36px, 5vw, 58px); line-height: 1.02; letter-spacing: -0.032em; }
.idx .lede { margin: 0 0 40px; max-width: 34em; font-size: 20px; color: var(--ink-2); }
.list { list-style: none; margin: 0 0 48px; padding: 0; border-top: 1.5px solid var(--rule); }
.item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px 32px; align-items: end; padding: 22px 0; border-bottom: 1px solid var(--line); }
.item h3 { margin: 4px 0 0; font-size: 22px; line-height: 1.25; letter-spacing: -0.015em; }
.item .label { margin: 0; }
.links { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.links a { padding: 6px 13px; border: 1px solid var(--rule); border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500; white-space: nowrap; }
.links a:hover { background: var(--ink); color: var(--paper); }
.feature { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 32px; padding: 28px; background: var(--sage); border-radius: 20px; margin-bottom: 48px; }
.feature h2 { margin: 6px 0 12px; font-size: 32px; line-height: 1.08; letter-spacing: -0.025em; }
.feature p { margin: 0 0 18px; }
.feature .links { justify-content: flex-start; }
.feature .links a { border-color: var(--ink); }
.status-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 14px; }
.status-legend li { display: grid; grid-template-columns: 16px 1fr auto; gap: 10px; align-items: baseline; }
.status-legend .g { width: 12px; height: 12px; }
.note { font-size: 14px; color: var(--muted); max-width: 44em; }
@media screen and (max-width: 760px) { .item, .feature { grid-template-columns: 1fr; } .links { justify-content: flex-start; } }
</style></head><body>
<header class="topbar">${nsLockup()}<span class="doc-title">Food Transition Group</span><span class="tag">UTKAST</span></header>
<main class="idx">
<p class="label">Utgaver · ${DATE_LABEL}</p>
<h1>Hvitbok v3 og tre artikler</h1>
<p class="lede">Presentasjonsutgaver av utkastet til hvitbok og de tre første artiklene for Natural State og Nordic Circular Hotspot.</p>
<section class="feature"><div><p class="label">Hvitbok</p><h2>Et robust og sirkulært matsystem</h2><p>Hva vi vet, hva vi ikke vet, og hvor vi bør begynne. ${total} påstander, hver med statusmerke og kilde.</p><div class="links"><a href="hvitbok-v3.html">Les på nett</a><a href="hvitbok-v3.pdf">PDF (A4)</a></div></div><div>${legendList(counts, false)}</div></section>
<ul class="list">${art}</ul>
<p class="note">Alle utgavene er utkast. De er ikke presentasjonsklare eller for publisering før påstandene er kontrollert mot primærkilde, tidskritiske fakta er fersksjekket, og Gabriel og Jan Thomas har signert. Utgavene bygges fra research/whitepaper/v3/ med scripts/build-hvitbok-v3-produksjon.ts.</p>
</main>
</body></html>`
}

// ─── Chrome ──────────────────────────────────────────────────────────────────

function chrome(args: string[]) {
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--virtual-time-budget=6000', ...args], { stdio: 'ignore' })
}

function printPdf(htmlPath: string, pdfPath: string) {
  chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href])
}

function screenshot(htmlPath: string, pngPath: string, w: number, h: number) {
  chrome([`--window-size=${w},${h}`, '--force-device-scale-factor=1', `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href])
}

function findPages(pdfPath: string, markers: Record<string, string>) {
  const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const pages = text.split('\f')
  const found: Record<string, number> = {}
  for (const [id, marker] of Object.entries(markers)) {
    const idx = pages.findIndex((p, i) => i > 1 && p.includes(marker))
    if (idx >= 0) found[id] = idx + 1
  }
  return found
}

// ─── Kjøring ─────────────────────────────────────────────────────────────────

function main() {
  const claims = readRegister()
  for (const dir of [OUT, path.join(OUT, 'artikler'), path.join(OUT, 'linkedin')]) mkdirSync(dir, { recursive: true })

  const wpHtmlPath = path.join(OUT, 'hvitbok-v3.html')
  writeFileSync(wpHtmlPath, renderWhitepaper(claims, {}))
  if (!NO_PDF) {
    const wpPdf = path.join(OUT, 'hvitbok-v3.pdf')
    printPdf(wpHtmlPath, wpPdf)
    const sections = splitSections(stripFrontmatter(read('research/whitepaper/v3/hvitbok-v3-utkast.md')).body.split(/^## Figurforslag/m)[0])
    const markers: Record<string, string> = { 'vedlegg-b': 'VEDLEGG B' }
    for (const s of sections) {
      markers[s.id] = s.kind === 'chapter' ? `KAPITTEL ${s.num}` : s.kind === 'appendix' ? `VEDLEGG ${s.num}` : 'SAMMENDRAG'
    }
    const pages = findPages(wpPdf, markers)
    writeFileSync(wpHtmlPath, renderWhitepaper(claims, pages))
    printPdf(wpHtmlPath, wpPdf)
  }

  const articles: { spec: ArticleSpec; title: string }[] = []
  for (const spec of ARTICLES) {
    const { html, title, linkedIn } = renderArticle(spec)
    const htmlPath = path.join(OUT, 'artikler', `${spec.file}.html`)
    writeFileSync(htmlPath, html)
    writeFileSync(path.join(OUT, 'linkedin', `${spec.file}.txt`), `${linkedIn}\n`)
    const cardPath = path.join(OUT, 'linkedin', `${spec.file}.card.html`)
    writeFileSync(cardPath, renderCard(spec, title))
    if (!NO_PDF) {
      printPdf(htmlPath, path.join(OUT, 'artikler', `${spec.file}.pdf`))
      screenshot(cardPath, path.join(OUT, 'linkedin', `${spec.file}.png`), 1080, 1350)
    }
    articles.push({ spec, title })
  }
  writeFileSync(path.join(OUT, 'index.html'), renderIndex(articles, statusCounts(claims), claims.size))
  if (!existsSync(path.join(OUT, 'hvitbok-v3.pdf')) && !NO_PDF) throw new Error('PDF-en ble ikke laget')
  console.log(`Bygget ${claims.size} påstander, ${ARTICLES.length} artikler i ${path.relative(ROOT, OUT)}`)
}

main()
