import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CandidateCompany = {
  name: string
  orgNr: string
  legalForm: string
  founded: number
  naceCode: string
  naceDescription: string
  hqAddress: string
  hqCity: string
  employees?: number
  ownershipType: string
  valueChainStage: string
  aliases: string[]
  sourceTerms: string[]
  brreg: {
    lastFinancialStatement?: string
    activity?: string
    purpose?: string
    sourceFetchedAt: string
  }
}

const candidates: CandidateCompany[] = [
  {
    name: 'Natural State AS',
    orgNr: '919645636',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '70.200',
    naceDescription: 'Bedriftsrådgivning og annen administrativ rådgivning',
    hqAddress: 'St. Halvards gate 33',
    hqCity: 'Oslo',
    employees: 25,
    ownershipType: 'private',
    valueChainStage: 'research',
    aliases: ['NATURAL STATE AS', 'Natural State'],
    sourceTerms: ['Natural State AS', 'Natural State'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Rådgivningstjenester innen strategi, ledelse og innovasjon. Selskapet vil også investere i tidlig fase selskaper og være aktive eiere i disse.',
      purpose: 'Salg av rådgivningstjenester samt porteføljeforvaltning og tilhørende tjenester.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'Nordic Circular Hotspot AS',
    orgNr: '930183350',
    legalForm: 'AS',
    founded: 2022,
    naceCode: '00.000',
    naceDescription: 'Uoppgitt',
    hqAddress: 'St. Halvards gate 33',
    hqCity: 'Oslo',
    ownershipType: 'nonprofit',
    valueChainStage: 'circular',
    aliases: ['NORDIC CIRCULAR HOTSPOT AS', 'Nordic Circular Hotspot', 'NCH'],
    sourceTerms: ['Nordic Circular Hotspot AS', 'Nordic Circular Hotspot'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Levere administrative tjenester til tilknyttede selskaper samt andre produkter/tjenester som naturlig hører til dette.',
      purpose: 'Å levere administrative tjenester til tilknyttede selskaper samt andre produkter/tjenester som naturlig hører til dette. Selskapet er et ideelt selskap (IDEELT AS) og det skal ikke tas ut utbytte av dette selskapet.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'I K Lykke AS',
    orgNr: '814055922',
    legalForm: 'AS',
    founded: 1918,
    naceCode: '47.110',
    naceDescription: 'Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
    hqAddress: 'Munkegata 48',
    hqCity: 'Trondheim',
    ownershipType: 'family',
    valueChainStage: 'retail',
    aliases: ['I K LYKKE AS', 'I.K. Lykke', 'Bunnpris'],
    sourceTerms: ['I K Lykke AS', 'I.K. Lykke', 'Bunnpris AS', 'Bunnpris'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Handel, erhvervelse og drift av eiendommer, kapitaldeltagelse i andre bedrifter, regnskapsførertjenester og dertil tilhørende konsulenttjenester, drift av kjedekontor, utleie av innredning og inventar og finansiering.',
      purpose: 'Handel, erhvervelse og drift av eiendommer, kapitaldeltagelse i andre bedrifter, bokholderitjenester og dertil tilhørende konsulenttjenester, drift av kjedekontor, utleie av innredning og inventar og finansiering.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'Joh Johannson Handel AS',
    orgNr: '921979819',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '47.110',
    naceDescription: 'Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
    hqAddress: 'Karenslyst allé 2',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    aliases: ['JOH JOHANNSON HANDEL AS', 'Joh. Johannson Handel AS'],
    sourceTerms: ['Joh Johannson Handel AS', 'Joh. Johannson Handel AS', 'Joh. Johannson Handel'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Handel, produksjon, investeringer samt utvikling og produksjon av datatjenester og hva som dermed står i forbindelse, samt deltakelse i andre foretagender.',
      purpose: 'Handel, produksjon, investeringer samt utvikling og produksjon av datatjenester og hva som dermed står i forbindelse, samt deltakelse i andre foretagender.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'Joh Johannson Eiendom AS',
    orgNr: '983522025',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '68.200',
    naceDescription: 'Utleie av egen eller leid fast eiendom',
    hqAddress: 'Karenslyst allé 2',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    aliases: ['JOH JOHANNSON EIENDOM AS', 'Joh. Johannson Eiendom AS'],
    sourceTerms: ['Joh Johannson Eiendom AS', 'Joh. Johannson Eiendom AS', 'Joh. Johannson Eiendom'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Investering i eiendom og aksjer, samt forvaltning og administrative tjenester for datterselskaper og tilknyttede selskaper.',
      purpose: 'Investering i eiendom og aksjer, samt forvaltning og administrative tjenester for datterselskaper og tilknyttede selskaper.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'Canica AS',
    orgNr: '938701237',
    legalForm: 'AS',
    founded: 1985,
    naceCode: '47.520',
    naceDescription: 'Detaljhandel med jernvarer, byggevarer, fargevarer og glass',
    hqAddress: 'Karenslyst allé 4',
    hqCity: 'Oslo',
    employees: 8,
    ownershipType: 'family',
    valueChainStage: 'retail',
    aliases: ['CANICA AS', 'Canica'],
    sourceTerms: ['Canica AS', 'Canica'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Utvikling og prosjektering av innredning for dagligvareforretninger, omsetning av innredninger og utstyr for dagligvareforretninger, erverv, salg og forvaltning av fast eiendom, samt deltakelse i andre selskaper med lignende eller beslektet virksomhet.',
      purpose: 'Handel, administrasjon, konsulentvirksomhet, erverv av fast eiendom og deltagelse i andre selskaper.',
      sourceFetchedAt: '2026-04-28',
    },
  },
  {
    name: 'Banan II AS',
    orgNr: '816488362',
    legalForm: 'AS',
    founded: 2015,
    naceCode: '68.200',
    naceDescription: 'Utleie av egen eller leid fast eiendom',
    hqAddress: 'v/Norscan Partners AS, Karenslyst allé 53',
    hqCity: 'Oslo',
    ownershipType: 'private',
    valueChainStage: 'logistics',
    aliases: ['BANAN II AS', 'Banan II'],
    sourceTerms: ['Banan II AS', 'Banan II'],
    brreg: {
      lastFinancialStatement: '2024',
      activity: 'Å drive investeringsvirksomhet, herunder investering i fast eiendom, deltagelse i andre selskaper og annen kapitalforvaltning.',
      purpose: 'Å drive investeringsvirksomhet, herunder investering i fast eiendom, deltagelse i andre selskaper og annen kapitalforvaltning.',
      sourceFetchedAt: '2026-04-28',
    },
  },
]

function normalizeText(value: string): string {
  return value
    .replace(/[ÆÄ]/g, 'A')
    .replace(/[æä]/g, 'a')
    .replace(/[ØÖ]/g, 'O')
    .replace(/[øö]/g, 'o')
    .replace(/[Å]/g, 'A')
    .replace(/[å]/g, 'a')
    .replace(/[Ü]/g, 'U')
    .replace(/[ü]/g, 'u')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
}

function normalizeSearch(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function regexForPattern(pattern: string): RegExp {
  const normalized = normalizeSearch(pattern)
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, String.raw`\s+`)
  return new RegExp(String.raw`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'g')
}

function countMatches(text: string, pattern: string): number {
  return [...text.matchAll(regexForPattern(pattern))].length
}

function isStrongContentTerm(term: string): boolean {
  const wordCount = normalizeSearch(term).split(/\s+/).filter(Boolean).length
  return wordCount >= 3 || /\b(?:AS|ASA|SA|NUF|AB|A\/S|ApS|Oyj|Oy|hf|ehf|Ltd|Limited|Inc|GmbH|AG|plc|LLC)\.?$/i.test(term)
}

function isEvidenceCandidate(title: string, filePath: string | null): boolean {
  const marker = normalizeSearch(`${title} ${filePath ?? ''}`)
  const excludedPatterns = [
    'arkiv indeks',
    'research corpus audit',
    'research missions',
    'desk research plan',
    'importplan',
    'promptpack',
    'kilderegister',
    'plattform kobling',
    'file coverage',
    'pdf katalog',
    'ki priority',
    'remediation backlog',
    'download queue',
    'download backlog',
    'data readiness',
    'orphan review',
    'control report',
  ]
  return !excludedPatterns.some((pattern) => marker.includes(pattern))
}

async function linkDocuments(companyId: string, candidate: CandidateCompany) {
  const docs = await prisma.document.findMany({
    select: { id: true, title: true, content: true, filePath: true },
  })

  const refs: Array<{ companyId: string; documentId: string; context: string }> = []

  for (const doc of docs) {
    if (!isEvidenceCandidate(doc.title, doc.filePath)) continue

    const title = normalizeSearch(`${doc.title} ${doc.filePath ?? ''}`)
    const content = normalizeSearch(doc.content)
    const matched = candidate.sourceTerms.some((term) => {
      const contentThreshold = isStrongContentTerm(term) ? 1 : 2
      return countMatches(title, term) > 0 || countMatches(content, term) >= contentThreshold
    })
    if (!matched) continue

    refs.push({
      companyId,
      documentId: doc.id,
      context: 'audit:company-extraction-candidate',
    })
  }

  if (refs.length === 0) return 0
  const result = await prisma.companyDocumentRef.createMany({
    data: refs,
    skipDuplicates: true,
  })
  return result.count
}

async function main() {
  console.log('Importing curated company extraction candidates...\n')

  let imported = 0
  let linked = 0

  for (const candidate of candidates) {
    const company = await prisma.company.upsert({
      where: { orgNr: candidate.orgNr },
      update: {
        name: candidate.name,
        legalForm: candidate.legalForm,
        founded: candidate.founded,
        naceCode: candidate.naceCode,
        naceDescription: candidate.naceDescription,
        country: 'NO',
        hqAddress: candidate.hqAddress,
        hqCity: candidate.hqCity,
        employees: candidate.employees ?? null,
        ownershipType: candidate.ownershipType,
        valueChainStage: candidate.valueChainStage,
        metadata: {
          source: 'company-extraction-candidate',
          aliases: candidate.aliases,
          brreg: candidate.brreg,
        },
      },
      create: {
        name: candidate.name,
        orgNr: candidate.orgNr,
        legalForm: candidate.legalForm,
        founded: candidate.founded,
        naceCode: candidate.naceCode,
        naceDescription: candidate.naceDescription,
        country: 'NO',
        hqAddress: candidate.hqAddress,
        hqCity: candidate.hqCity,
        employees: candidate.employees ?? null,
        ownershipType: candidate.ownershipType,
        valueChainStage: candidate.valueChainStage,
        metadata: {
          source: 'company-extraction-candidate',
          aliases: candidate.aliases,
          brreg: candidate.brreg,
        },
      },
      select: { id: true },
    })

    const createdRefs = await linkDocuments(company.id, candidate)
    console.log(`  ${candidate.name} (${candidate.orgNr}) — ${createdRefs} document refs`)
    imported++
    linked += createdRefs
  }

  console.log(`\nImported/upserted ${imported} companies`)
  console.log(`Created ${linked} new CompanyDocumentRef rows`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
