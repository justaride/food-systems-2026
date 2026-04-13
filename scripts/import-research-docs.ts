import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'
import { theses } from '../src/lib/data/theses'
import { reports } from '../src/lib/data/reports'
import { sources } from '../src/lib/data/sources'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const RESEARCH_DIR = path.resolve(__dirname, '../research')
const EVIDENCE_BACKLOG_PATH = path.join(RESEARCH_DIR, 'evidence-pack/download-backlog-2026-03-18.csv')

type ResearchFile = {
  fullPath: string
  relPath: string
  extension: 'md' | 'pdf'
}

type EvidenceBacklogRow = {
  priority: string
  status: string
  country: string
  theme: string
  docType: string
  institution: string
  title: string
  year: string
  url: string
  urlType: string
  currentLocalStatus: string
  targetPath: string
  nextAction: string
  sourceBasis: string
}

type SupplementalPdfMatch = {
  thesisId?: string
  reportId?: string
  sourceDocId?: string
  title?: string
  author?: string
  year?: number
  url?: string
  country?: string
  documentType?: string
  tags?: string[]
  note?: string
}

type SupplementalPdfMetadata = {
  thesisId?: string
  reportId?: string
  sourceDocId?: string
  title: string | null
  author: string | null
  year: number | null
  url: string | null
  country: string | null
  documentType: string | null
  tags: string[]
  note: string | null
}

const thesisById = new Map(theses.map(thesis => [thesis.id, thesis]))
const reportById = new Map(reports.map(report => [report.id, report]))
const sourceById = new Map(sources.map(source => [source.id, source]))

const SUPPLEMENTAL_PDF_MATCHES: Record<string, SupplementalPdfMatch> = {
  'evidence-pack/akademia/agrianalyse-bondens-andel-2025.pdf': {
    title: 'AgriAnalyse 2025 placeholder for missing publication',
    author: 'AgriAnalyse',
    year: 2025,
    country: 'no',
    documentType: 'academic',
    tags: ['agrianalyse', 'jordbruk', 'matpriser'],
    note: 'Lokal fil er en HTML-placeholder fra en stale getfile-lenke. AgriAnalyse sitt 2025-arkiv viser Notat 1-3, men ingen offentlig PDF for "Bondens andel av matkronen".',
  },
  'evidence-pack/akademia/drager-vagene-2017.pdf': { thesisId: 'drager-vagene-2017' },
  'evidence-pack/akademia/fretheim-rodnova-2020.pdf': { thesisId: 'fretheim-rodnova-2020' },
  'evidence-pack/akademia/gangstoe-2019-uib.pdf': { thesisId: 'gangstoe-2019' },
  'evidence-pack/akademia/huynh-mortensen-2025.pdf': { thesisId: 'huynh-mortensen-2025' },
  'evidence-pack/akademia/jacobsen-jansson-2022-black-sheep.pdf': {
    thesisId: 'jacobsen-jansson-2022',
    sourceDocId: 'src-19',
  },
  'evidence-pack/akademia/martens-norum-2020.pdf': { thesisId: 'martens-norum-2020' },
  'evidence-pack/akademia/meile-2020.pdf': { thesisId: 'meile-2020' },
  'evidence-pack/akademia/nilsen-paulsen-2025.pdf': { thesisId: 'nilsen-paulsen-2025' },
  'evidence-pack/akademia/rey-verge-2005.pdf': {
    title: 'Rey & Verge 2005',
    author: 'Rey & Verge',
    year: 2005,
    documentType: 'academic',
    tags: ['competition', 'grocery', 'theory'],
  },
  'evidence-pack/akademia/selmani-forre-2023.pdf': { thesisId: 'selmani-forre-2023' },
  'evidence-pack/akademia/sifo-kundeprogram-2026.pdf': {
    reportId: 'akademia-sifo-kundeprogram-2026',
    sourceDocId: 'src-21',
    note: 'Lokal fil ser ut til aa vaere en HTML-placeholder og boer erstattes med en faktisk PDF.',
  },
  'evidence-pack/akademia/skjervheim-flo-2016.pdf': { thesisId: 'skjervheim-flo-2016' },
  'evidence-pack/akademia/skulstad-svensson-2024.pdf': { thesisId: 'skulstad-svensson-2024' },
  'evidence-pack/akademia/sorensen-phd-2016-danish-public-kitchens.pdf': { thesisId: 'sorensen-phd-2016' },
  'evidence-pack/akademia/ulsaker-phd-thesis.pdf': { thesisId: 'ulsaker-phd-2016' },
  'evidence-pack/nordisk/finland-food2030.pdf': {
    title: 'Ruoka2030: Maukasta, kotimaista, kilpailukykyista',
    author: 'Finnish Government',
    year: 2017,
    country: 'fi',
    documentType: 'policy',
    tags: ['finland', 'food-policy', '2030'],
  },
  'evidence-pack/nordisk/karlstad-declaration-2024.pdf': {
    title: 'Karlstad Declaration 2024',
    author: 'Nordisk Ministerraad',
    year: 2024,
    country: 'nordic',
    documentType: 'policy',
    tags: ['nordic', 'declaration', 'food-systems'],
  },
  'evidence-pack/nordisk/konkurrensverket-summary-2024.pdf': {
    title: 'Summary of the Swedish Competition Authority inquiry into the food industry 2023-2024',
    author: 'Konkurrensverket',
    year: 2024,
    country: 'se',
    documentType: 'report',
    tags: ['sweden', 'competition', 'food-industry'],
  },
  'evidence-pack/nordisk/nordic-food-alert-2025.pdf': {
    title: 'Nordic Food Alert 2025',
    year: 2025,
    country: 'nordic',
    documentType: 'report',
    tags: ['nordic', 'food-systems'],
    note: 'Tittel er avledet fra filnavn og boer verifiseres manuelt.',
  },
  'evidence-pack/nordisk/nordic-food-markets-2005.pdf': {
    title: 'Nordic Food Markets - a taste for competition',
    author: 'Nordic competition authorities',
    year: 2005,
    country: 'nordic',
    documentType: 'report',
    tags: ['nordic', 'competition', 'food-markets'],
  },
  'evidence-pack/nordisk/salling-coop-danmark-2025.pdf': {
    title: 'Salling Coop Danmark 2025',
    year: 2025,
    country: 'dk',
    documentType: 'report',
    tags: ['denmark', 'competition', 'grocery'],
    note: 'Lokal fil er ikke mapet til en strukturert kildepost enda.',
  },
  'evidence-pack/nordisk/sou-2024-8-livsmedelsberedskap.pdf': { reportId: 'sou-2024-8-svensk-beredskap' },
  'evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2024.pdf': {
    title: 'Dagligvaretilsynet arsrapport 2024',
    author: 'Dagligvaretilsynet',
    year: 2024,
    country: 'no',
    documentType: 'regulatory',
    url: 'https://www.dagligvaretilsynet.no/rapporter-og-strategi',
    tags: ['dagligvaretilsynet', 'arsrapport'],
    note: 'Lokal fil ser ut til aa vaere en HTML-placeholder og boer erstattes med en faktisk PDF.',
  },
  'evidence-pack/offentlig/emv-kartlegging-2023.pdf': { reportId: 'soa-emv-2023' },
  'evidence-pack/offentlig/eu-utp-report-2024.pdf': {
    title: 'EU UTP Report 2024',
    author: 'European Commission',
    year: 2024,
    country: 'eu',
    documentType: 'policy',
    tags: ['eu', 'utp', 'food-supply-chain'],
  },
  'evidence-pack/offentlig/eu-utp-staff-working-doc-2024.pdf': {
    title: 'EU UTP Staff Working Document 2024',
    author: 'European Commission',
    year: 2024,
    country: 'eu',
    documentType: 'policy',
    tags: ['eu', 'utp', 'staff-working-document'],
  },
  'evidence-pack/offentlig/meld-st-11-selvforsyning-2024.pdf': { reportId: 'meld-st-11-selvforsyning' },
  'evidence-pack/offentlig/menon-funksjonelt-skille-2026.pdf': {
    reportId: 'menon-funksjonelt-skille-2026',
    note: 'Lokal fil ser ut til aa vaere en HTML-placeholder og boer erstattes med en faktisk PDF.',
  },
  'evidence-pack/offentlig/nibio-selvforsyning-2026.pdf': {
    reportId: 'beredskap-nibio-selvforsyning-2026',
    note: 'Lokal fil ser ut til aa vaere en HTML-placeholder og boer erstattes med en faktisk PDF.',
  },
  'evidence-pack/offentlig/nou-2011-4-mat-makt-avmakt.pdf': { reportId: 'nou-2011-4' },
  'evidence-pack/offentlig/riksrevisjonen-matsikkerhet-2023.pdf': { reportId: 'riksrevisjonen-matsikkerhet-2023' },
  'evidence-pack/tilsyn/dagligvarerapport-2024.pdf': { reportId: 'kt-dagligvarerapport-2024' },
  'evidence-pack/tilsyn/dagligvarerapport-2025.pdf': {
    reportId: 'kt-dagligvarerapport-2024',
    sourceDocId: 'src-14',
  },
  'evidence-pack/tilsyn/dagligvaretilsynet-samarbeidsklima-2025.pdf': { reportId: 'dt-samarbeidsklima-2025' },
  'evidence-pack/tilsyn/innkjopspriser-2017-2023.pdf': { reportId: 'kt-innkjopspriser-2017-2023' },
  'evidence-pack/tilsyn/marginstudie-2024-del1-offisiell.pdf': { reportId: 'kt-marginstudie-2024-del1' },
  'evidence-pack/tilsyn/marginstudie-2024-del1.pdf': { reportId: 'kt-marginstudie-2024-del1' },
  'evidence-pack/tilsyn/marginstudie-2025-del2-offisiell.pdf': { reportId: 'kt-marginstudie-2025-del2' },
  'evidence-pack/tilsyn/marginstudie-2025-del2.pdf': { reportId: 'kt-marginstudie-2025-del2' },
  'evidence-pack/tilsyn/prisjeger-saken-2024-offentlig-versjon.pdf': { reportId: 'kt-prisjeger-saken-2024' },
  'evidence-pack/tilsyn/prisjusteringsvinduer-2023.pdf': { reportId: 'kt-prisjusteringsvinduer-2023' },

  // ── Akademia: theses (wave 2) ──
  'evidence-pack/akademia/adlers-2022.pdf': { thesisId: 'adlers-2022' },
  'evidence-pack/akademia/brancoli-phd-2021.pdf': { thesisId: 'brancoli-phd-2021' },
  'evidence-pack/akademia/duong-2025.pdf': { thesisId: 'duong-2025' },
  'evidence-pack/akademia/hasle-tjostheim-2024.pdf': { thesisId: 'hasle-tjostheim-2024' },
  'evidence-pack/akademia/jorgensen-ahmadi-2024.pdf': { thesisId: 'jorgensen-ahmadi-2024' },
  'evidence-pack/akademia/kayhan-ronnback-2019.pdf': { thesisId: 'kayhan-ronnback-2019' },
  'evidence-pack/akademia/khandaker-2021.pdf': { thesisId: 'khandaker-2021' },
  'evidence-pack/akademia/lehtokunnas-phd-2023.pdf': { thesisId: 'lehtokunnas-phd-2023' },
  'evidence-pack/akademia/lindstrom-phd-2021.pdf': { thesisId: 'lindstrom-phd-2021' },
  'evidence-pack/akademia/makela-2023.pdf': { thesisId: 'makela-2023' },
  'evidence-pack/akademia/mattila-2024.pdf': { thesisId: 'mattila-2024' },
  'evidence-pack/akademia/nikolaev-2023.pdf': { thesisId: 'nikolaev-2023' },
  'evidence-pack/akademia/ortiz-cuadra-2023.pdf': { thesisId: 'ortiz-cuadra-2023' },
  'evidence-pack/akademia/stahl-2024.pdf': { thesisId: 'stahl-2024' },
  'evidence-pack/akademia/sturen-2023.pdf': { thesisId: 'sturen-2023' },
  'evidence-pack/akademia/tanderup-rasmussen-hansen-2023.pdf': { thesisId: 'tanderup-rasmussen-hansen-2023' },
  'evidence-pack/akademia/zakeri-lei-2024.pdf': { thesisId: 'zakeri-lei-2024' },

  // ── Akademia: reports (wave 2) ──
  'evidence-pack/akademia/akademia-nhh-foros-media-2025.pdf': { reportId: 'akademia-nhh-foros-media-2025' },
  'evidence-pack/akademia/akademia-sifo-kundeprogram-2026.pdf': { reportId: 'akademia-sifo-kundeprogram-2026' },

  // ── PubMed articles ──
  'evidence-pack/akademia/pubmed/hiis-eg-2024-unlocking-bacterial-potential-to-reduce.pdf': {
    title: 'Unlocking bacterial potential to reduce farmland N2O emissions',
    author: 'Hiis EG et al.',
    year: 2024,
    documentType: 'pubmed',
    tags: ['climate', 'agriculture', 'N2O', 'bacteria', 'NMBU'],
  },
  'evidence-pack/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.pdf': {
    title: 'Waste-to-nutrition: a review of current and emerging conversion pathways',
    author: 'Javourez U, O\'Donohue M & Hamelin L',
    year: 2021,
    documentType: 'pubmed',
    tags: ['circular-economy', 'waste-to-nutrition', 'food-waste'],
  },
  'evidence-pack/akademia/pubmed/recanati-f-2019-assessing-the-role-of-cap.pdf': {
    title: 'Assessing the role of CAP for more sustainable and healthier food systems in Europe',
    author: 'Recanati F et al.',
    year: 2019,
    country: 'eu',
    documentType: 'pubmed',
    tags: ['eu', 'CAP', 'food-policy', 'sustainability'],
  },
  'evidence-pack/akademia/pubmed/sigala-eg-2025-reducing-food-waste-in-the.pdf': {
    title: 'Reducing food waste in the HORECA sector using AI-based waste-tracking devices',
    author: 'Sigala EG et al.',
    year: 2025,
    documentType: 'pubmed',
    tags: ['food-waste', 'HORECA', 'AI', 'waste-tracking'],
  },
  'evidence-pack/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.pdf': {
    title: 'Food Waste Governance Architectures in Europe',
    author: 'Szulecka J, Bradshaw C & Principato L',
    year: 2024,
    country: 'eu',
    documentType: 'pubmed',
    tags: ['food-waste', 'governance', 'europe', 'policy'],
  },
  'evidence-pack/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.pdf': {
    title: 'Framework for evaluation of food safety in the circular food system',
    author: 'van der Fels-Klerx HJ et al.',
    year: 2024,
    documentType: 'pubmed',
    tags: ['food-safety', 'circular-economy', 'framework'],
  },
  'evidence-pack/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.pdf': {
    title: 'A novel approach to identify critical knowledge gaps for food safety in circular food systems',
    author: 'van Leeuwen SPJ et al.',
    year: 2024,
    documentType: 'pubmed',
    tags: ['food-safety', 'circular-economy', 'knowledge-gaps'],
  },
  'evidence-pack/akademia/pubmed/wohner-b-2020-environmental-and-economic-assessment-of.pdf': {
    title: 'Environmental and economic assessment of food-packaging systems',
    author: 'Wohner B et al.',
    year: 2020,
    documentType: 'pubmed',
    tags: ['packaging', 'LCA', 'food-waste', 'circular-economy'],
  },
  'evidence-pack/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.pdf': {
    title: 'Biogas production from food waste via co-digestion and digestion',
    author: 'Zamanzadeh M et al.',
    year: 2017,
    country: 'no',
    documentType: 'pubmed',
    tags: ['biogas', 'food-waste', 'co-digestion', 'norway'],
  },

  // ── Arsrapporter ──
  'evidence-pack/arsrapporter/asko-barekraft-2024.pdf': { reportId: 'asko-barekraft-2024' },
  'evidence-pack/arsrapporter/axfood-annual-report-2024.pdf': { reportId: 'axfood-annual-report-2024' },
  'evidence-pack/arsrapporter/coop-danmark-2024.pdf': {
    title: 'Coop Danmark Arsberetning 2024',
    author: 'Coop Danmark',
    year: 2024,
    country: 'dk',
    documentType: 'annual-report',
    tags: ['coop', 'denmark', 'annual-report'],
  },
  'evidence-pack/arsrapporter/coop-norge-2024.pdf': { reportId: 'coop-2024' },
  'evidence-pack/arsrapporter/hagar-2024-25.pdf': { reportId: 'hagar-2024-25' },
  'evidence-pack/arsrapporter/ica-gruppen-annual-report-2024.pdf': { reportId: 'ica-gruppen-annual-report-2024' },
  'evidence-pack/arsrapporter/kesko-annual-report-2024.pdf': { reportId: 'kesko-annual-report-2024' },
  'evidence-pack/arsrapporter/norgesgruppen-2024.pdf': { reportId: 'norgesgruppen-2024-25' },
  'evidence-pack/arsrapporter/norgesgruppen-halvarsrapport-2025.pdf': {
    title: 'NorgesGruppen Halvarsrapport 2025',
    author: 'NorgesGruppen',
    year: 2025,
    country: 'no',
    documentType: 'annual-report',
    tags: ['norgesgruppen', 'halvarsrapport', 'norway'],
  },
  'evidence-pack/arsrapporter/reitan-retail-2024.pdf': { reportId: 'reitan-2024-25' },
  'evidence-pack/arsrapporter/salling-group-2024.pdf': { reportId: 'salling-group-2024' },

  // ── Konsulentrapport ──
  'evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf': { reportId: 'oslo-economics-forsvar-2024' },

  // ── Nordisk ──
  'evidence-pack/nordisk/dk-salling-coop-decision-2025.pdf': { reportId: 'dk-salling-coop-decision-2025' },
  'evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf': { reportId: 'finland-food-market-ombudsman-2023' },
  'evidence-pack/nordisk/is-samkeppni-annual-report-2024.pdf': { reportId: 'is-samkeppni-annual-report-2024' },
  'evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf': { reportId: 'kfst-salling-coop-2025' },
  'evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf': {
    title: 'Dagligvaruhandelns etablering - rapport 2024:4',
    author: 'Konkurrensverket',
    year: 2024,
    country: 'se',
    documentType: 'regulatory',
    tags: ['sweden', 'competition', 'establishment', 'grocery'],
  },
  'evidence-pack/nordisk/pty-finnish-grocery-trade-statistics-2024.pdf': {
    title: 'Finnish Grocery Trade Statistics 2024',
    author: 'PTY ry (Finnish Grocery Trade Association)',
    year: 2024,
    country: 'fi',
    documentType: 'report',
    tags: ['finland', 'grocery', 'statistics', 'market-share'],
  },

  // ── Offentlig ──
  'evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2021.pdf': { reportId: 'dagligvaretilsynet-aarsrapport-2021' },
  'evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2022.pdf': { reportId: 'dagligvaretilsynet-aarsrapport-2022' },
  'evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2023.pdf': { reportId: 'dagligvaretilsynet-aarsrapport-2023' },
  'evidence-pack/offentlig/matsvinnutvalget-2024.pdf': {
    title: 'Matsvinnutvalgets rapport 2024',
    author: 'Matsvinnutvalget',
    year: 2024,
    country: 'no',
    documentType: 'policy',
    tags: ['food-waste', 'norway', 'committee', 'policy'],
  },
  'evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf': { reportId: 'meld-st-4-dagligvare' },
  'evidence-pack/offentlig/nou-2013-6-god-handelsskikk.pdf': { reportId: 'nou-2013-6-god-handelsskikk' },
  'evidence-pack/offentlig/nou-2022-14.pdf': { reportId: 'nou-2022-14' },
  'evidence-pack/offentlig/src-73.pdf': {
    sourceDocId: 'src-73',
    title: 'Konkurransetilsynets rapport (src-73)',
    author: 'Konkurransetilsynet',
    country: 'no',
    documentType: 'regulatory',
    tags: ['competition', 'norway', 'analysis'],
  },

  // ── Tenketank ──
  'evidence-pack/tenketank/fivh-etikk-2025.pdf': { reportId: 'fivh-etikk-2025' },
  'evidence-pack/tenketank/stockholm-resilience-2019.pdf': { reportId: 'stockholm-resilience-2019' },
}

function normalizeResearchRelativePath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (path.isAbsolute(trimmed)) {
    return path.relative(RESEARCH_DIR, trimmed).replaceAll('\\', '/')
  }

  const normalized = trimmed.replaceAll('\\', '/').replace(/^\.?\//, '')
  return normalized.startsWith('research/') ? normalized.slice('research/'.length) : normalized
}

function walkResearchFiles(dir: string, baseDir = dir): ResearchFile[] {
  const results: ResearchFile[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkResearchFiles(fullPath, baseDir))
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.pdf')) {
      const relPath = path.relative(baseDir, fullPath)
      if (entry.name.endsWith('.pdf') && !relPath.startsWith(`evidence-pack${path.sep}`)) {
        continue
      }

      results.push({
        fullPath,
        relPath,
        extension: entry.name.endsWith('.pdf') ? 'pdf' : 'md',
      })
    }
  }
  return results
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled'
}

function extractMarkdownSummary(content: string): string | null {
  const lines = content.split('\n')
  const bodyLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('**') || trimmed.startsWith('>')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith(':---')) continue
    bodyLines.push(trimmed)
    if (bodyLines.length >= 10) break
  }

  if (bodyLines.length === 0) return null

  const joined = bodyLines.join(' ')
  const sentences = joined.match(/[^.!?]+[.!?]+/g)
  if (sentences && sentences.length > 0) {
    let summary = ''
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const next = summary + sentences[i]
      if (next.split(/\s+/).length > 200) break
      summary = next
    }
    return summary.trim() || null
  }

  const words = joined.split(/\s+/)
  return words.slice(0, 200).join(' ').trim() || null
}

function extractMarkdownUrl(content: string): string | null {
  const lines = content.split('\n').slice(0, 20)
  for (const line of lines) {
    const match = line.match(/https?:\/\/[^\s"'<>)]+/)
    if (match) return match[0]
  }
  return null
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some(value => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some(value => value.length > 0)) rows.push(row)
  }

  return rows
}

function loadEvidenceBacklog(): Map<string, EvidenceBacklogRow> {
  const byPath = new Map<string, EvidenceBacklogRow>()
  if (!fs.existsSync(EVIDENCE_BACKLOG_PATH)) return byPath

  const csv = fs.readFileSync(EVIDENCE_BACKLOG_PATH, 'utf-8')
  const [header, ...rows] = parseCsv(csv)
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  for (const values of rows) {
    const row: EvidenceBacklogRow = {
      priority: values[index.priority] ?? '',
      status: values[index.status] ?? '',
      country: values[index.country] ?? '',
      theme: values[index.theme] ?? '',
      docType: values[index.doc_type] ?? '',
      institution: values[index.institution] ?? '',
      title: values[index.title] ?? '',
      year: values[index.year] ?? '',
      url: values[index.url] ?? '',
      urlType: values[index.url_type] ?? '',
      currentLocalStatus: values[index.current_local_status] ?? '',
      targetPath: values[index.target_path] ?? '',
      nextAction: values[index.next_action] ?? '',
      sourceBasis: values[index.source_basis] ?? '',
    }

    for (const target of row.targetPath.split('|').map(part => part.trim()).filter(Boolean)) {
      byPath.set(normalizeResearchRelativePath(target), row)
    }
  }

  return byPath
}

function extractCategory(relPath: string): { category: string; subcategory: string | null } {
  const parts = relPath.split(path.sep)
  if (parts[0] === 'evidence-pack' && parts.length > 2) {
    return { category: 'evidence-pack', subcategory: parts[1] }
  }
  if (parts[0] === 'evidence-pack') {
    return { category: 'evidence-pack', subcategory: null }
  }
  if (parts[0] === 'bibliotek' && parts.length > 2) {
    return { category: 'bibliotek', subcategory: parts.slice(1, -1).join('/') }
  }
  if (parts[0] === 'bibliotek' && parts.length > 1) {
    return { category: 'bibliotek', subcategory: parts[1] }
  }
  if (parts[0] === 'data' || parts[0] === 'brocode-kart') {
    return { category: 'data', subcategory: parts[1] ?? null }
  }
  return { category: parts[0] ?? 'research', subcategory: parts[1] ?? null }
}

function extractCountry(relPath: string): string | null {
  const lower = relPath.toLowerCase()
  if (lower.includes('norden') || lower.includes('nordisk')) return 'nordic'
  if (lower.includes('/no/') || lower.includes('norge')) return 'no'
  if (lower.includes('/se/') || lower.includes('sverige')) return 'se'
  if (lower.includes('/dk/') || lower.includes('danmark')) return 'dk'
  if (lower.includes('/fi/') || lower.includes('finland')) return 'fi'
  if (lower.includes('/is/') || lower.includes('island')) return 'is'
  return null
}

function slugify(filePath: string): string {
  return filePath
    .replace(/\.(md|pdf)$/, '')
    .replace(/[^a-zA-Z0-9-_/]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function extractDocumentType(relPath: string): string {
  const lower = relPath.toLowerCase()
  if (lower.startsWith('meetings/')) return 'meeting-note'
  if (lower.includes('masteroppgaver')) return 'thesis'
  if (lower.includes('nou') || lower.includes('stortingsdok')) return 'policy'
  if (lower.includes('arsrapporter')) return 'annual-report'
  if (lower.includes('konkurransetilsynet') || lower.includes('dagligvaretilsynet')) return 'regulatory'
  if (lower.includes('konsulentrapporter')) return 'consulting-report'
  if (lower.includes('akademia') || lower.includes('nhh-food') || lower.includes('sifo')) return 'academic'
  if (lower.includes('tenketanker')) return 'think-tank'
  if (lower.includes('juridisk')) return 'legal'
  if (lower.includes('bransje')) return 'industry'
  if (lower.includes('sirkularitet')) return 'circular-economy'
  if (lower.includes('verdikjede')) return 'value-chain'
  if (lower.includes('data') || lower.includes('brocode')) return 'dataset'
  return 'research'
}

function mapBacklogCountry(country: string): string | null {
  const normalized = country.trim().toLowerCase()
  if (normalized === 'no') return 'no'
  if (normalized === 'se') return 'se'
  if (normalized === 'dk') return 'dk'
  if (normalized === 'fi') return 'fi'
  if (normalized === 'is') return 'is'
  return null
}

function mapBacklogDocumentType(docType: string): string | null {
  switch (docType) {
    case 'annual_report':
      return 'annual-report'
    case 'policy_report':
      return 'policy'
    case 'industry_report':
      return 'industry'
    case 'phd_thesis':
    case 'thesis':
      return 'thesis'
    case 'decision':
      return 'decision'
    case 'report':
      return 'report'
    default:
      return null
  }
}

function extractYearFromValue(value: string): number | null {
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

function humanizeFilename(relPath: string): string {
  return path.basename(relPath, path.extname(relPath))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function derivePdfTitle(
  relPath: string,
  backlogRow: EvidenceBacklogRow | undefined,
  pdfTitle: string | null
): string {
  const baseTitle = backlogRow?.title || pdfTitle || humanizeFilename(relPath)

  if (!backlogRow?.targetPath.includes('|')) return baseTitle

  const fileYear = extractYearFromValue(path.basename(relPath))
  if (!fileYear) return baseTitle

  return baseTitle.replace(/\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b/, String(fileYear))
}

function detectPdfAvailabilityStatus(filePath: string): 'fulltext-pdf' | 'metadata-only' {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(5)
    fs.readSync(fd, buffer, 0, 5, 0)
    fs.closeSync(fd)
    return buffer.toString('utf-8') === '%PDF-' ? 'fulltext-pdf' : 'metadata-only'
  } catch {
    return 'metadata-only'
  }
}

function getSupplementalPdfMetadata(relPath: string): SupplementalPdfMetadata | null {
  const match = SUPPLEMENTAL_PDF_MATCHES[relPath]
  if (!match) return null

  const thesis = match.thesisId ? thesisById.get(match.thesisId) : undefined
  const report = match.reportId ? reportById.get(match.reportId) : undefined
  const source = match.sourceDocId ? sourceById.get(match.sourceDocId) : undefined

  const title = match.title
    ?? report?.fullTitle
    ?? report?.title
    ?? thesis?.title
    ?? source?.title
    ?? null

  const author = match.author
    ?? report?.author
    ?? report?.institution
    ?? thesis?.authors
    ?? source?.author
    ?? null

  const sourceYear = source?.year ? extractYearFromValue(String(source.year)) : null
  const year = match.year ?? report?.year ?? thesis?.year ?? sourceYear ?? null

  const thesisUrl = thesis?.url?.trim() ? thesis.url : null
  const sourceUrl = source?.url?.trim() ? source.url : null
  const url = match.url ?? report?.sourceUrl ?? thesisUrl ?? sourceUrl ?? null

  const country = match.country ?? report?.country?.toLowerCase() ?? null
  const documentType = match.documentType ?? (thesis ? 'thesis' : null)

  const tags = Array.from(new Set([
    ...(match.tags ?? []),
    ...(thesis?.tags ?? []),
    ...(report?.tags ?? []),
    source?.type,
  ].filter(Boolean) as string[]))

  return {
    thesisId: match.thesisId,
    reportId: match.reportId,
    sourceDocId: match.sourceDocId,
    title,
    author,
    year,
    url,
    country,
    documentType,
    tags,
    note: match.note ?? null,
  }
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const normalized = new URL(trimmed)
    normalized.hash = ''
    normalized.pathname = normalized.pathname.replace(/\/+$/, '') || '/'
    return normalized.toString()
  } catch {
    return trimmed.replace(/#.*$/, '').replace(/\/+$/, '')
  }
}

function normalizeTitle(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function reportMatchesTitle(
  report: { title: string; fullTitle: string | null | undefined },
  normalizedDocumentTitle: string
): boolean {
  if (!normalizedDocumentTitle) return false

  const reportTitle = normalizeTitle(report.title)
  const reportFullTitle = normalizeTitle(report.fullTitle)
  const documentTokens = normalizedDocumentTitle.split(/\s+/).filter(Boolean)

  if (documentTokens.length < 2) {
    return normalizedDocumentTitle === reportTitle || normalizedDocumentTitle === reportFullTitle
  }

  return Boolean(
    (reportTitle && (
      normalizedDocumentTitle === reportTitle ||
      normalizedDocumentTitle.includes(reportTitle) ||
      reportTitle.includes(normalizedDocumentTitle)
    )) ||
    (reportFullTitle && (
      normalizedDocumentTitle === reportFullTitle ||
      normalizedDocumentTitle.includes(reportFullTitle) ||
      reportFullTitle.includes(normalizedDocumentTitle)
    ))
  )
}

function extractPdfMetadata(filePath: string): { title: string | null; pages: number | null } {
  try {
    const output = execFileSync('pdfinfo', [filePath], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const lines = Object.fromEntries(
      output
        .split('\n')
        .map(line => line.split(/:\s+/, 2))
        .filter(parts => parts.length === 2)
        .map(([key, value]) => [key.trim(), value.trim()])
    )

    return {
      title: lines.Title || null,
      pages: lines.Pages ? Number(lines.Pages) : null,
    }
  } catch {
    return { title: null, pages: null }
  }
}

async function ensureDocumentRelation(fromId: string, toId: string, refType: string) {
  if (fromId === toId) return

  await prisma.documentRef.createMany({
    data: [{ fromId, toId, refType }],
    skipDuplicates: true,
  })
}

function buildPdfRecord(
  relPath: string,
  backlogRow: EvidenceBacklogRow | undefined
): {
  title: string
  author: string | null
  year: number | null
  category: string
  subcategory: string | null
  country: string | null
  content: string
  summary: string
  wordCount: number
  documentType: string
  tags: string[]
  url: string | null
  metadata: Record<string, unknown>
} {
  const fullPath = path.join(RESEARCH_DIR, relPath)
  const pdfMeta = extractPdfMetadata(fullPath)
  const supplemental = getSupplementalPdfMetadata(relPath)
  const availabilityStatus = detectPdfAvailabilityStatus(fullPath)
  const { category, subcategory } = extractCategory(relPath)
  const title = derivePdfTitle(relPath, backlogRow, supplemental?.title || pdfMeta.title)
  const author = backlogRow?.institution || supplemental?.author || null
  const year = backlogRow?.year
    ? extractYearFromValue(backlogRow.year)
    : (supplemental?.year ?? null)
  const country = mapBacklogCountry(backlogRow?.country ?? '')
    ?? supplemental?.country
    ?? extractCountry(relPath)
  const documentType = mapBacklogDocumentType(backlogRow?.docType ?? '')
    ?? supplemental?.documentType
    ?? extractDocumentType(relPath)
  const url = backlogRow?.url || supplemental?.url || null
  const pageCount = pdfMeta.pages

  const summary = [
    'Metadata-import av lokal PDF fra evidence-pack.',
    pageCount ? `${pageCount} sider.` : null,
    author ? `Kilde: ${author}.` : null,
    url ? 'Offentlig kilde-URL registrert.' : 'Ingen offentlig kilde-URL registrert.',
    backlogRow?.currentLocalStatus
      ? `Lokal status: ${backlogRow.currentLocalStatus}.`
      : (availabilityStatus === 'metadata-only' ? 'Lokal kopi ser ikke ut til aa vaere en gyldig PDF.' : null),
    supplemental?.note || null,
  ].filter(Boolean).join(' ')

  const contentLines = [
    `# ${title}`,
    '',
    '- Importtype: metadata-only PDF record',
    `- Lokal fil: ${relPath}`,
    pageCount ? `- Sider: ${pageCount}` : null,
    author ? `- Institusjon/kilde: ${author}` : null,
    year ? `- Aar: ${year}` : null,
    country ? `- Land: ${country}` : null,
    documentType ? `- Dokumenttype: ${documentType}` : null,
    url ? `- Kilde-URL: ${url}` : null,
    backlogRow?.status ? `- Backlog-status: ${backlogRow.status}` : null,
    `- Lokal tilgjengelighet: ${backlogRow?.currentLocalStatus || availabilityStatus}`,
    supplemental?.thesisId ? `- Strukturert kobling: Thesis ${supplemental.thesisId}` : null,
    supplemental?.reportId ? `- Strukturert kobling: Report ${supplemental.reportId}` : null,
    supplemental?.sourceDocId ? `- Strukturert kobling: SourceDoc ${supplemental.sourceDocId}` : null,
    '',
    '## Importnotat',
    'Dette dokumentet er importert som metadata fra en lokal PDF i `research/evidence-pack/`.',
    'Fulltekst er forelopig ikke ekstrahert til databasen, men dokumentet er gjort sokbart og synlig i biblioteklaget.',
    availabilityStatus === 'metadata-only'
      ? 'Den lokale filen ser ikke ut til aa vaere en gyldig PDF, og boer erstattes eller lastes ned pa nytt.'
      : null,
    supplemental?.note || null,
    backlogRow?.nextAction ? '' : null,
    backlogRow?.nextAction ? '## Neste steg' : null,
    backlogRow?.nextAction || null,
  ].filter(Boolean) as string[]

  const content = contentLines.join('\n')
  const tags = Array.from(new Set([
    'pdf',
    category,
    subcategory,
    country,
    documentType,
    backlogRow?.theme,
    ...((supplemental?.tags ?? [])),
    backlogRow?.institution?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  ].filter(Boolean) as string[]))

  return {
    title,
    author,
    year,
    category,
    subcategory,
    country,
    content,
    summary,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    documentType,
    tags,
    url,
    metadata: {
      canonicalFileType: 'pdf',
      availabilityStatus,
      localPath: relPath,
      pageCount,
      backlog: backlogRow ?? null,
      structuredSource: supplemental
        ? {
            thesisId: supplemental.thesisId ?? null,
            reportId: supplemental.reportId ?? null,
            sourceDocId: supplemental.sourceDocId ?? null,
          }
        : null,
      note: supplemental?.note ?? null,
    },
  }
}

async function linkStructuredRecords(opts: {
  documentId: string
  relPath: string
  extension: 'md' | 'pdf'
  title: string
  url: string | null
}) {
  const filename = path.basename(opts.relPath, path.extname(opts.relPath))
  const normalizedUrl = normalizeUrl(opts.url)
  const normalizedTitle = normalizeTitle(opts.title)
  const supplemental = opts.extension === 'pdf' ? getSupplementalPdfMetadata(opts.relPath) : null

  if (supplemental?.sourceDocId) {
    const sourceDoc = await prisma.sourceDoc.findUnique({
      where: { id: supplemental.sourceDocId },
      select: { id: true, documentId: true },
    })
    if (sourceDoc) {
      if (!sourceDoc.documentId) {
        await prisma.sourceDoc.update({
          where: { id: sourceDoc.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → SourceDoc ${sourceDoc.id} (exact)`)
      } else if (sourceDoc.documentId !== opts.documentId) {
        await ensureDocumentRelation(sourceDoc.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ SourceDoc ${sourceDoc.id} via existing document`)
      }
    }
  }

  if (supplemental?.thesisId) {
    const thesis = await prisma.thesis.findUnique({
      where: { id: supplemental.thesisId },
      select: { id: true, documentId: true },
    })
    if (thesis) {
      if (!thesis.documentId) {
        await prisma.thesis.update({
          where: { id: thesis.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → Thesis ${thesis.id} (exact)`)
      } else if (thesis.documentId !== opts.documentId) {
        await ensureDocumentRelation(thesis.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ Thesis ${thesis.id} via existing document`)
      }
    }
  }

  if (supplemental?.reportId) {
    const report = await prisma.report.findUnique({
      where: { id: supplemental.reportId },
      select: {
        id: true,
        title: true,
        fullTitle: true,
        documentId: true,
        document: { select: { title: true } },
      },
    })
    if (report) {
      if (!report.documentId) {
        await prisma.report.update({
          where: { id: report.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → Report ${report.id} (exact)`)
      } else if (report.documentId !== opts.documentId && !reportMatchesTitle(report, normalizeTitle(report.document?.title))) {
        await prisma.report.update({
          where: { id: report.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Re-linked ${opts.relPath} → Report ${report.id} (exact-repair)`)
      } else if (report.documentId !== opts.documentId) {
        await ensureDocumentRelation(report.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ Report ${report.id} via existing document`)
      }
      return
    }
  }

  if (supplemental?.sourceDocId || supplemental?.thesisId || supplemental?.reportId) {
    return
  }

  if (normalizedUrl) {
    const sourceCandidates = await prisma.sourceDoc.findMany({
      where: { url: { not: null } },
      select: { id: true, url: true, documentId: true },
    })
    const sourceByUrl = sourceCandidates.find(source => normalizeUrl(source.url) === normalizedUrl)
    if (sourceByUrl) {
      if (!sourceByUrl.documentId) {
        await prisma.sourceDoc.update({
          where: { id: sourceByUrl.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → SourceDoc ${sourceByUrl.id} (url)`)
      } else if (sourceByUrl.documentId !== opts.documentId) {
        await ensureDocumentRelation(sourceByUrl.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ SourceDoc ${sourceByUrl.id} via existing document`)
      }
    }

    const thesisCandidates = await prisma.thesis.findMany({
      where: { url: { not: '' } },
      select: { id: true, url: true, documentId: true },
    })
    const thesisByUrl = thesisCandidates.find(thesis => normalizeUrl(thesis.url) === normalizedUrl)
    if (thesisByUrl) {
      if (!thesisByUrl.documentId) {
        await prisma.thesis.update({
          where: { id: thesisByUrl.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → Thesis ${thesisByUrl.id} (url)`)
      } else if (thesisByUrl.documentId !== opts.documentId) {
        await ensureDocumentRelation(thesisByUrl.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ Thesis ${thesisByUrl.id} via existing document`)
      }
    }

    const reportCandidates = await prisma.report.findMany({
      where: { sourceUrl: { not: null } },
      select: {
        id: true,
        title: true,
        fullTitle: true,
        sourceUrl: true,
        documentId: true,
        document: { select: { title: true } },
      },
    })
    const reportByUrl = reportCandidates.find(report =>
      normalizeUrl(report.sourceUrl) === normalizedUrl &&
      reportMatchesTitle(report, normalizedTitle)
    )
    if (reportByUrl) {
      if (!reportByUrl.documentId) {
        await prisma.report.update({
          where: { id: reportByUrl.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → Report ${reportByUrl.id} (url)`)
      } else if (reportByUrl.documentId !== opts.documentId && !reportMatchesTitle(reportByUrl, normalizeTitle(reportByUrl.document?.title))) {
        await prisma.report.update({
          where: { id: reportByUrl.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Re-linked ${opts.relPath} → Report ${reportByUrl.id} (title-repair)`)
      } else if (reportByUrl.documentId !== opts.documentId) {
        await ensureDocumentRelation(reportByUrl.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ Report ${reportByUrl.id} via existing document`)
      }
      return
    }
  }

  if (opts.extension === 'pdf' && normalizedTitle) {
    const reportCandidates = await prisma.report.findMany({
      select: {
        id: true,
        title: true,
        fullTitle: true,
        documentId: true,
        document: { select: { title: true } },
      },
    })
    const reportByTitle = reportCandidates.find(report => reportMatchesTitle(report, normalizedTitle))

    if (reportByTitle) {
      if (!reportByTitle.documentId) {
        await prisma.report.update({
          where: { id: reportByTitle.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Linked ${opts.relPath} → Report ${reportByTitle.id} (title)`)
      } else if (reportByTitle.documentId !== opts.documentId && !reportMatchesTitle(reportByTitle, normalizeTitle(reportByTitle.document?.title))) {
        await prisma.report.update({
          where: { id: reportByTitle.id },
          data: { documentId: opts.documentId },
        })
        console.log(`  Re-linked ${opts.relPath} → Report ${reportByTitle.id} (title-repair)`)
      } else if (reportByTitle.documentId !== opts.documentId) {
        await ensureDocumentRelation(reportByTitle.documentId, opts.documentId, 'source-file')
        console.log(`  Related ${opts.relPath} ↔ Report ${reportByTitle.id} via existing document`)
      }
    }
  }

  if (opts.extension === 'md') {
    const matchingSource = await prisma.sourceDoc.findFirst({
      where: {
        filename: { contains: filename },
        documentId: null,
      },
    })
    if (matchingSource) {
      await prisma.sourceDoc.update({
        where: { id: matchingSource.id },
        data: { documentId: opts.documentId },
      })
      console.log(`  Linked ${filename} → SourceDoc ${matchingSource.id}`)
    }

    const matchingThesis = await prisma.thesis.findFirst({
      where: {
        id: { contains: filename },
        documentId: null,
      },
    })
    if (matchingThesis) {
      await prisma.thesis.update({
        where: { id: matchingThesis.id },
        data: { documentId: opts.documentId },
      })
      console.log(`  Linked ${filename} → Thesis ${matchingThesis.id}`)
    }
  }
}

async function main() {
  console.log('Importing research documents...\n')

  const files = walkResearchFiles(RESEARCH_DIR)
  const evidenceBacklog = loadEvidenceBacklog()
  console.log(`Found ${files.length} importable research files (${files.filter(f => f.extension === 'md').length} markdown, ${files.filter(f => f.extension === 'pdf').length} pdf)\n`)

  let imported = 0
  let skipped = 0

  for (const file of files) {
    const slug = slugify(file.relPath)

    try {
      let title: string
      let author: string | null = null
      let year: number | null = null
      let category: string
      let subcategory: string | null
      let country: string | null
      let content: string
      let summary: string | null = null
      let wordCount: number
      let documentType: string
      let tags: string[]
      let url: string | null = null
      let metadata: Record<string, unknown> | null = null

      if (file.extension === 'md') {
        content = fs.readFileSync(file.fullPath, 'utf-8')
        title = extractTitle(content)
        ;({ category, subcategory } = extractCategory(file.relPath))
        country = extractCountry(file.relPath)
        wordCount = content.split(/\s+/).filter(Boolean).length
        documentType = extractDocumentType(file.relPath)
        tags = [category, subcategory, country, documentType].filter(Boolean) as string[]
        summary = extractMarkdownSummary(content)
        url = extractMarkdownUrl(content)
        metadata = {
          canonicalFileType: 'md',
          availabilityStatus: 'fulltext',
          localPath: file.relPath,
        }
      } else {
        const pdfRecord = buildPdfRecord(file.relPath, evidenceBacklog.get(file.relPath.replaceAll('\\', '/')))
        title = pdfRecord.title
        author = pdfRecord.author
        year = pdfRecord.year
        category = pdfRecord.category
        subcategory = pdfRecord.subcategory
        country = pdfRecord.country
        content = pdfRecord.content
        summary = pdfRecord.summary
        wordCount = pdfRecord.wordCount
        documentType = pdfRecord.documentType
        tags = pdfRecord.tags
        url = pdfRecord.url
        metadata = pdfRecord.metadata
      }

      await prisma.document.upsert({
        where: { filePath: file.relPath },
        update: {
          title,
          author,
          year,
          category,
          subcategory,
          country,
          content,
          summary,
          url,
          wordCount,
          documentType,
          slug,
          tags,
          metadata,
        },
        create: {
          slug,
          filePath: file.relPath,
          title,
          author,
          year,
          category,
          subcategory,
          country,
          content,
          summary,
          url,
          wordCount,
          documentType,
          tags,
          metadata,
        },
      })

      const importedDocument = await prisma.document.findUnique({
        where: { filePath: file.relPath },
        select: { id: true },
      })
      if (importedDocument) {
        await linkStructuredRecords({
          documentId: importedDocument.id,
          relPath: file.relPath,
          extension: file.extension,
          title,
          url,
        })
      }

      imported++
    } catch (err) {
      console.error(`  Failed: ${file.relPath}`, err)
      skipped++
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
