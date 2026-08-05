import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import { sources } from '../prisma/seed-data/sources'
import { externalHttpUrl } from '../src/lib/citations/external-citation-policy'

const APPLY_ACK = 'APPLY_VERIFIED_ACADEMIC_LOCATORS'
const VERIFIED_ACCESS_DATE = '2026-07-19'

type LocatorRepair = {
  kind: 'Report' | 'SourceDoc'
  id: string
  expected: string
  alternateExpected?: string[]
  replacement: string
  reviewedCitationLocators?: string[]
  expectedTitle?: string
  replacementTitle?: string
  verifiedAccessDate: string
}

const PINNED_LOCATOR_REPAIRS: readonly LocatorRepair[] = [
  {
    kind: 'Report',
    id: 'dagligvaretilsynet-aarsrapport-2021',
    expected: 'https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/dagligvaretilsynet-arsrapport-for-2022.pdf',
    replacement: 'https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/arsrapport-2021-for-dagligvaretilsynet-l3728148.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'Report',
    id: 'dagligvaretilsynet-aarsrapport-2022',
    expected: 'https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/arsrapport_dagligvaretilsynet-2023.pdf',
    replacement: 'https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/dagligvaretilsynet-arsrapport-for-2022.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'Report',
    id: 'dagligvaretilsynet-aarsrapport-2023',
    expected: 'https://www.regjeringen.no/contentassets/036ffda0c81e4b3f99456a78ec31df0e/arsrapport-dagligvaretilsynet-2024.pdf',
    replacement: 'https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/arsrapport_dagligvaretilsynet-2023.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'Report',
    id: 'dagligvaretilsynet-aarsrapport-2024',
    expected: 'https://www.regjeringen.no/contentassets/41847427caa14feb8b8578af3d6d45bc/r15-2023-kartlegging-av-egne-merkevarer-og-vertikal-integrasjon-i-dagligvaremarkedet.pdf',
    replacement: 'https://www.regjeringen.no/contentassets/036ffda0c81e4b3f99456a78ec31df0e/arsrapport-dagligvaretilsynet-2024.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'Report',
    id: 'konkurrensverket-summary-2024',
    expected: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5.pdf',
    replacement: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-19',
    expected: 'https://openaccess.nhh.no/',
    alternateExpected: ['https://openaccess.nhh.no/nhh-xmlui/bitstream/handle/11250/3051794/masterthesis.pdf?isAllowed=y&sequence=1'],
    replacement: 'https://hdl.handle.net/11250/3051794',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-22',
    expected: 'https://openaccess.nhh.no/',
    alternateExpected: ['https://openaccess.nhh.no/nhh-xmlui/bitstream/handle/11250/3158950/no.nhh%3Awiseflow%3A7041862%3A57768510.pdf?isAllowed=y&sequence=6'],
    replacement: 'https://hdl.handle.net/11250/3158950',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-25',
    expected: 'https://www.konkurrensverket.se/publikationer/',
    replacement: 'https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-27',
    expected: 'regjeringen.no',
    replacement: 'https://www.regjeringen.no/no/dokumenter/meld.-st.-4-20242025/id3056808/?ch=15',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-28',
    expected: 'regjeringen.no',
    replacement: 'https://www.regjeringen.no/no/dokumenter/kartlegging-av-egne-merkevarer-og-verti-kal-integrasjon-i-dagligvaremarkedet/id2997407/',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-36',
    expected: 'konkurransetilsynet.no',
    replacement: 'https://konkurransetilsynet.no/markedsetterforskningsverktoyet-trer-i-kraft-i-dag/',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-42',
    expected: 'konkurransetilsynet.no',
    replacement: 'https://konkurransetilsynet.no/49-milliarder-i-gebyr-til-coop-norgesgruppen-og-rema/',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-44',
    expected: 'konkurransetilsynet.no',
    replacement: 'https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-47',
    expected: 'regjeringen.no',
    replacement: 'https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/grunnlagsmaterialet-til-jordbruks-forhandlingene-2024',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-78',
    expected: 'https://www.konkurrensverket.se/publikationer/',
    replacement: 'https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-88',
    expected: 'https://pub.epsilon.slu.se/12756/',
    replacement: 'https://res.slu.se/id/publ/68633',
    expectedTitle: 'Supermarket food waste: Prevention and management at the retail stage',
    replacementTitle: 'Supermarket food waste: prevention and management with the focus on reduced waste for reduced carbon footprint',
    reviewedCitationLocators: [
      'https://pub.epsilon.slu.se/12756/1/Eriksson_m_151029.pdf',
    ],
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-89',
    expected: 'https://pub.epsilon.slu.se/34408/',
    replacement: 'https://res.slu.se/id/publ/128772',
    expectedTitle: 'Sustainability of food waste prevention',
    replacementTitle: 'Sustainability of food waste prevention through food consumption',
    reviewedCitationLocators: [
      'https://doi.org/10.54612/a.2fjqatdg6h',
      'https://pub.epsilon.slu.se/34408/1/sundin-n-20240612.pdf',
    ],
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-141',
    expected: 'https://www.konkurrensverket.se/publikationer/',
    replacement: 'https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/',
    expectedTitle: 'Konkurrensverket rapport 2025:5 - livsmedelsutredningen',
    replacementTitle: 'Konkurrensverket rapport 2025:5 — Utvärdering av lagen om förbud mot otillbörliga handelsmetoder',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-29',
    expected: 'virke.no',
    replacement: 'https://www.virke.no/analyse/statistikk-rapporter/dagligvarehandelen/',
    expectedTitle: 'Dagligvarerapporten 2025 (Basert på 2024-tall)',
    replacementTitle: 'Dagligvarehandelen 2025',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-30',
    expected: 'asko.no',
    replacement: 'https://asko.no/nyhetsarkiv/barekraft-i-asko-2024/',
    expectedTitle: 'ASKO Års- og bærekraftsrapport / NorgesGruppen Logistikk',
    replacementTitle: 'Bærekraft i ASKO 2024',
    reviewedCitationLocators: [
      'https://asko.no/globalassets/om-asko/miljo/barekraft-i-asko-2024.pdf',
    ],
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-31',
    expected: 'nibio.no',
    replacement: 'https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk',
    expectedTitle: 'Beregning av sjølvforsyningsgrad',
    replacementTitle: 'Selvforsyningsgrad og engrosforbruk',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-32',
    expected: 'matvett.no',
    replacement: 'https://norsus.no/publikasjon/faktaark-om-matsvinn-i-norge-2024/',
    expectedTitle: 'Matsvinn i Norge 2024 — Status og utvikling',
    replacementTitle: 'Faktaark om matsvinn i Norge 2024',
    reviewedCitationLocators: [
      'https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf',
    ],
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-33',
    expected: 'ec.europa.eu/eurostat',
    replacement: 'https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250619-1',
    expectedTitle: 'Purchasing Power Parities (PPP) survey results 2024',
    replacementTitle: 'Household consumption: price levels in 2024',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-35',
    expected: 'framtiden.no',
    replacement: 'https://www.framtiden.no/tema/matsvinn',
    expectedTitle: 'Bærekraftsstatus i dagligvarekjeden og effekten av Matsvinnloven',
    replacementTitle: 'Framtiden i våre hender — Matsvinn',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-37',
    expected: 'menon.no',
    replacement: 'https://menon.no/prosjekter/egne-merkevarer-emv-og-innovasjon-i-dagligvare',
    expectedTitle: 'Egne merkevarer (EMV) og innovasjon',
    replacementTitle: 'Egne merkevarer (EMV) og innovasjon i dagligvare',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-38',
    expected: 'uib.no/econ',
    replacement: 'https://doi.org/10.1016/j.ijindorg.2014.11.001',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-39',
    expected: 'nesafinland.fi',
    replacement: 'https://www.huoltovarmuuskeskus.fi/en/organisation/the-national-emergency-supply-agency',
    expectedTitle: 'National Emergency Supply Agency (NESA) / Huoltovarmuuskeskus (HVK)',
    replacementTitle: 'The National Emergency Supply Agency',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-40',
    expected: 'smabrukarlaget.no',
    replacement: 'https://www.smabrukarlaget.no/politikk/jordbruksoppgjoeret/tidligere-oppgjoer/jordbruksoppgjoeret-2025/',
    expectedTitle: 'Plan for reell selvforsyning og jordbruksoppgjøret 2025',
    replacementTitle: 'Jordbruksoppgjøret 2025',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-43',
    expected: 'ssb.no/grensehandel',
    replacement: 'https://www.ssb.no/varehandel-og-tjenesteyting/varehandel/statistikk/grensehandel',
    expectedTitle: 'Grensehandel — Statistikk over dagsturer til utlandet',
    replacementTitle: 'Grensehandel',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-45',
    expected: 'osloeconomics.no',
    replacement: 'https://osloeconomics.no/publication/konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte/',
    reviewedCitationLocators: [
      'https://osloeconomics.no/wp-content/uploads/2024/06/Oslo-Economics-Konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte.pdf',
    ],
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-48',
    expected: 'dlf.no',
    replacement: 'https://www.dlf.no/ingen-forbud-mot-ulike-innkjopspriser/',
    expectedTitle: 'Dagligvareleverandørenes Forening (DLF) — Bransjeanalyse 2025',
    replacementTitle: 'Ingen forbud mot ulike innkjøpspriser',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
  {
    kind: 'SourceDoc',
    id: 'src-49',
    expected: 'miljodirektoratet.no',
    replacement: 'https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/avskogingsforordningen-eudr/',
    expectedTitle: 'EUs forordning om avskogingsfrie produkter (EUDR)',
    replacementTitle: 'Avskogingsforordningen (EUDR)',
    verifiedAccessDate: VERIFIED_ACCESS_DATE,
  },
]

export function buildAcademicLocatorRepairs(
  seedReports = reports,
  seedSources = sources,
): LocatorRepair[] {
  const reportById = new Map(seedReports.map(report => [report.id, report]))
  const sourceById = new Map(seedSources.map(source => [source.id, source]))

  for (const repair of PINNED_LOCATOR_REPAIRS) {
    if (!externalHttpUrl(repair.replacement) || repair.replacement === repair.expected) {
      throw new Error(`Invalid pinned ${repair.kind} locator repair contract: ${repair.id}`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(repair.verifiedAccessDate)) {
      throw new Error(`Invalid pinned ${repair.kind} access date contract: ${repair.id}`)
    }

    const seedRow = repair.kind === 'Report'
      ? reportById.get(repair.id)
      : sourceById.get(repair.id)
    const seedLocator = repair.kind === 'Report'
      ? seedRow && 'sourceUrl' in seedRow ? seedRow.sourceUrl : undefined
      : seedRow && 'url' in seedRow ? seedRow.url : undefined
    if (seedLocator?.trim() !== repair.replacement) {
      throw new Error(`Seed locator drifted from pinned ${repair.kind} repair contract: ${repair.id}`)
    }
    const seedAccessedAt = seedRow && 'accessedAt' in seedRow
      ? seedRow.accessedAt
      : undefined
    if (seedAccessedAt !== repair.verifiedAccessDate) {
      throw new Error(`Seed access date drifted from pinned ${repair.kind} repair contract: ${repair.id}`)
    }
    if (
      repair.replacementTitle &&
      (!seedRow || !('title' in seedRow) || seedRow.title !== repair.replacementTitle)
    ) {
      throw new Error(`Seed title drifted from pinned ${repair.kind} repair contract: ${repair.id}`)
    }
  }

  return PINNED_LOCATOR_REPAIRS
    .map(repair => ({
      ...repair,
      alternateExpected: repair.alternateExpected
        ? [...repair.alternateExpected]
        : undefined,
    }))
    .sort((left, right) => `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`))
}

export function classifyAcademicLocatorRepair(
  repair: LocatorRepair,
  current: string | null | undefined,
): 'pending' | 'applied' | 'conflict' {
  if (current === repair.replacement) return 'applied'
  if (current === repair.expected || repair.alternateExpected?.includes(current ?? '')) return 'pending'
  return 'conflict'
}

function normalizedAccessDate(value: Date | string | null | undefined): string | null {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10)
}

export function classifyAcademicLocatorRepairState(
  repair: LocatorRepair,
  currentLocator: string | null | undefined,
  currentTitle: string | null | undefined,
  currentAccessedAt: Date | string | null | undefined,
): 'pending' | 'applied' | 'conflict' {
  const locatorStatus = classifyAcademicLocatorRepair(repair, currentLocator)
  if (locatorStatus === 'conflict') return 'conflict'
  const accessDate = normalizedAccessDate(currentAccessedAt)
  if (accessDate !== null && accessDate !== repair.verifiedAccessDate) return 'conflict'

  let titleStatus: 'pending' | 'applied' = 'applied'
  if (repair.expectedTitle && repair.replacementTitle) {
    if (currentTitle !== repair.expectedTitle && currentTitle !== repair.replacementTitle) return 'conflict'
    titleStatus = currentTitle === repair.replacementTitle ? 'applied' : 'pending'
  }

  if (
    locatorStatus === 'applied' &&
    titleStatus === 'applied' &&
    accessDate === repair.verifiedAccessDate
  ) return 'applied'
  return 'pending'
}

async function main() {
  const apply = process.argv.includes('--apply')
  const ack = process.argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length)
  if (apply && ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const repairs = buildAcademicLocatorRepairs()
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  try {
    const reportIds = repairs.filter(repair => repair.kind === 'Report').map(repair => repair.id)
    const sourceDocIds = repairs.filter(repair => repair.kind === 'SourceDoc').map(repair => repair.id)
    const [databaseReports, databaseSourceDocs] = await Promise.all([
      prisma.report.findMany({ where: { id: { in: reportIds } }, select: { id: true, sourceUrl: true, title: true, accessedAt: true } }),
      prisma.sourceDoc.findMany({ where: { id: { in: sourceDocIds } }, select: { id: true, url: true, title: true, accessedAt: true } }),
    ])
    const current = new Map<string, { locator: string | null; title: string | null; accessedAt: Date | null }>([
      ...databaseReports.map(row => [`Report:${row.id}`, { locator: row.sourceUrl, title: row.title, accessedAt: row.accessedAt }] as const),
      ...databaseSourceDocs.map(row => [`SourceDoc:${row.id}`, { locator: row.url, title: row.title, accessedAt: row.accessedAt }] as const),
    ])
    const classified = repairs.map(repair => {
      const databaseRow = current.get(`${repair.kind}:${repair.id}`)
      return {
        repair,
        status: classifyAcademicLocatorRepairState(
          repair,
          databaseRow?.locator,
          databaseRow?.title,
          databaseRow?.accessedAt,
        ),
      }
    })
    const conflicts = classified.filter(row => row.status === 'conflict')
    if (conflicts.length > 0) {
      throw new Error(`Locator repair conflict; refusing mutation: ${conflicts.map(row => `${row.repair.kind}:${row.repair.id}`).join(', ')}`)
    }
    const pending = classified.filter(row => row.status === 'pending').map(row => row.repair)
    console.log(`Academic locator repair: ${pending.length} pending, ${repairs.length - pending.length} already applied, ${conflicts.length} conflicts`)
    if (!apply) {
      console.log(`Dry run only. Re-run with --apply --ack=${APPLY_ACK}`)
      return
    }

    await prisma.$transaction(async transaction => {
      for (const repair of pending) {
        const verifiedAccessDate = new Date(`${repair.verifiedAccessDate}T00:00:00.000Z`)
        const result = repair.kind === 'Report'
          ? await transaction.report.updateMany({
              where: {
                id: repair.id,
                sourceUrl: { in: [repair.expected, repair.replacement] },
                OR: [{ accessedAt: null }, { accessedAt: verifiedAccessDate }],
              },
              data: { sourceUrl: repair.replacement, accessedAt: verifiedAccessDate },
            })
          : await transaction.sourceDoc.updateMany({
              where: {
                id: repair.id,
                url: {
                  in: [repair.expected, ...(repair.alternateExpected ?? []), repair.replacement],
                },
                ...(repair.expectedTitle && repair.replacementTitle
                  ? { title: { in: [repair.expectedTitle, repair.replacementTitle] } }
                  : {}),
                OR: [{ accessedAt: null }, { accessedAt: verifiedAccessDate }],
              },
              data: {
                url: repair.replacement,
                ...(repair.replacementTitle ? { title: repair.replacementTitle } : {}),
                accessedAt: verifiedAccessDate,
              },
            })
        if (result.count !== 1) throw new Error(`Concurrent locator change detected: ${repair.kind}:${repair.id}`)
      }
    }, { isolationLevel: 'Serializable' })

    console.log(`Academic locator repair applied: ${pending.length} row(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Academic locator repair failed')
    process.exitCode = 1
  })
}
