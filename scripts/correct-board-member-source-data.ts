import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  resolveBoardMemberAnnualReportSourceLocator,
  resolveBoardMemberSourceLabel,
} from '../src/lib/board-member-provenance'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type BoardMemberSeed = {
  personName: string
  role: string
}

type BoardMemberRosterCorrection = {
  companyOrgNr: string
  members: BoardMemberSeed[]
}

const corrections: BoardMemberRosterCorrection[] = [
  {
    companyOrgNr: 'DK-14705627',
    members: [
      { personName: 'Ole Robert Reitan', role: 'bestyrelsesformand' },
      { personName: 'Henrik Burkal', role: 'CEO' },
      { personName: 'Tom Kristiansen', role: 'næstformand' },
      { personName: 'Kristin Solheim Genton', role: 'bestyrelsesmedlem' },
      { personName: 'Monica Ødegaard', role: 'bestyrelsesmedlem' },
      { personName: 'Tania Klæbel', role: 'bestyrelsesmedlem' },
    ],
  },
  {
    companyOrgNr: 'DK-38714295',
    members: [
      { personName: 'Jesper Lok', role: 'bestyrelsesformand' },
      { personName: 'Tore Bekken', role: 'næstformand' },
      { personName: 'Michael Christiansen', role: 'bestyrelsesmedlem' },
      { personName: 'Anne Bech Torgersen', role: 'bestyrelsesmedlem' },
      { personName: 'Marianne Rørslev Bock', role: 'bestyrelsesmedlem' },
      { personName: 'Søren Engberg', role: 'bestyrelsesmedlem' },
      { personName: 'Kennet Berlin', role: 'bestyrelsesmedlem' },
      { personName: 'Liza Østergren Jensen', role: 'bestyrelsesmedlem' },
      { personName: 'Søren Hansen', role: 'bestyrelsesmedlem' },
      { personName: 'Tomas Pietrangeli', role: 'administrerende direktør' },
      { personName: 'Thomas Thellersen Børner', role: 'økonomidirektør' },
    ],
  },
  {
    companyOrgNr: 'FI-0116323-9',
    members: [
      { personName: 'Hannu Krook', role: 'CEO / Chair of SOK Executive Board' },
      { personName: 'Harri Miettinen', role: 'Vice Chair of SOK Executive Board' },
      { personName: 'Kim Biskop', role: 'SOK Executive Board member' },
      { personName: 'Nermin Hairedin', role: 'SOK Executive Board member' },
      { personName: 'Katri Harra-Salonen', role: 'SOK Executive Board member' },
      { personName: 'Antti Heikkinen', role: 'SOK Executive Board member' },
      { personName: 'Veli-Matti Liimatainen', role: 'SOK Executive Board member' },
      { personName: 'Antti Määttä', role: 'SOK Executive Board member' },
      { personName: 'Juha Riikola', role: 'SOK Executive Board member' },
    ],
  },
  {
    companyOrgNr: 'FI-1615492-7',
    members: [
      { personName: 'Conor Boyle', role: 'toimitusjohtaja' },
      { personName: 'Jochen Fries', role: 'kaupallinen johtaja' },
      { personName: 'Heli Hassinen-Biberger', role: 'henkilöstöjohtaja' },
      { personName: 'Meri Aalto', role: 'markkinointi- ja asiakkuusjohtaja' },
      { personName: 'Antonio Maselli', role: 'operatiivinen johtaja' },
      { personName: 'Sami Pyykönen', role: 'CFO' },
    ],
  },
  {
    companyOrgNr: 'IS-540206-2010',
    members: [
      { personName: 'Guðjón Karl Reynisson', role: 'stjórnarformaður' },
      { personName: 'Sigurlína Ingvarsdóttir', role: 'varaformaður stjórnar' },
      { personName: 'Guðjón Auðunsson', role: 'stjórnarmaður' },
      { personName: 'Hjörleifur Pálsson', role: 'stjórnarmaður' },
      { personName: 'Margrét Guðmundsdóttir', role: 'stjórnarmaður' },
      { personName: 'Ásta S. Fjeldsted', role: 'forstjóri' },
    ],
  },
  {
    companyOrgNr: 'IS-571298-3769',
    members: [
      { personName: 'Jón Ásgeir Jóhannesson', role: 'stjórnarformaður' },
      { personName: 'Magnús Ingi Einarsson', role: 'stjórnarmaður' },
      { personName: 'Liv Bergþórsdóttir', role: 'stjórnarmaður' },
      { personName: 'Garðar Newman', role: 'stjórnarmaður' },
      { personName: 'Margrét Katrín Guðnadóttir', role: 'stjórnarmaður' },
    ],
  },
  {
    companyOrgNr: 'SE-702001-3469',
    members: [
      { personName: 'Kerstin Maria Wallentin', role: 'styrelseordförande' },
      { personName: 'Pär Bernhard Ygge Sandström', role: 'styrelseledamot' },
      { personName: 'Barbro Kristina Viberg', role: 'styrelseledamot' },
      { personName: 'Maria Christina Söderbom', role: 'styrelseledamot' },
      { personName: 'Bo Ronnie Michael Wångdahl', role: 'styrelseledamot' },
      { personName: 'Stig Wilhelm Nilsson', role: 'styrelseledamot' },
      { personName: 'Jan Håkan Thorell', role: 'styrelseledamot' },
      { personName: 'Gunilla Astrid Henriette Asker', role: 'styrelseledamot' },
      { personName: 'Ingrid Maria Rudolphi', role: 'styrelseledamot' },
      { personName: 'Bo Jesper Mattias Josbrant', role: 'styrelseledamot' },
      { personName: 'Bo Henrik Skyttberg', role: 'styrelseledamot' },
      { personName: 'Anders Jonas Nygren', role: 'styrelseledamot' },
      { personName: 'Louise Anita Ring', role: 'styrelseledamot' },
      { personName: 'Karl Anders Torell', role: 'CEO' },
      { personName: 'Örjan Gösta Grandin', role: 'extern vice verkställande direktör' },
    ],
  },
  {
    companyOrgNr: 'SE-969697-6594',
    members: [
      { personName: 'Jakob Josefsson', role: 'styrelseordförande / Sverigechef' },
      { personName: 'Martin Kauffner', role: 'ekonomidirektör' },
      { personName: 'Helena Erlingsjö', role: 'HR direktör' },
      { personName: 'Robert Stekovic', role: 'kommersiell direktör' },
      { personName: 'Carl Balcer', role: 'fastighetsdirektör' },
      { personName: 'Georgios Tokatlis', role: 'försäljningsdirektör' },
    ],
  },
]

function parseArgs(argv: string[]): { dryRun: boolean } {
  const allowed = new Set(['--dry-run'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }

  return { dryRun: argv.includes('--dry-run') }
}

function normalizePersonKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function provenanceFields(locator: string, verifiedAt: Date) {
  if (locator.startsWith('document:')) {
    return {
      source: locator,
      sourceUrl: null,
      verifiedAt,
    }
  }

  return {
    source: resolveBoardMemberSourceLabel(locator),
    sourceUrl: locator,
    verifiedAt,
  }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))
  console.log(`Correcting checked board-member source data${dryRun ? ' (dry run)' : ''}`)

  const documents = await prisma.document.findMany({ select: { id: true, slug: true } })
  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
  const verifiedAt = new Date()

  let replaced = 0
  let inserted = 0
  let skipped = 0

  for (const correction of corrections) {
    const company = await prisma.company.findUnique({
      where: { orgNr: correction.companyOrgNr },
      select: {
        id: true,
        name: true,
        orgNr: true,
        boardMembers: { select: { id: true } },
      },
    })

    if (!company) {
      console.log(`  skip ${correction.companyOrgNr}: company not found`)
      skipped += 1
      continue
    }

    const locator = resolveBoardMemberAnnualReportSourceLocator(
      { company: { orgNr: company.orgNr } },
      documentRefs,
    )
    if (!locator) {
      console.log(`  skip ${company.name}: no checked board-member locator`)
      skipped += 1
      continue
    }

    console.log(
      `  ${company.name}: replace ${company.boardMembers.length} row(s) with ` +
        `${correction.members.length} checked row(s) -> ${locator}`,
    )

    if (!dryRun) {
      await prisma.boardMember.deleteMany({ where: { companyId: company.id } })
      for (const member of correction.members) {
        await prisma.boardMember.create({
          data: {
            companyId: company.id,
            personName: member.personName,
            role: member.role,
            personKey: normalizePersonKey(member.personName),
            ...provenanceFields(locator, verifiedAt),
          },
        })
      }
    }

    replaced += company.boardMembers.length
    inserted += correction.members.length
  }

  console.log(
    `Board-member data correction complete: ${replaced} replaced, ` +
      `${inserted} inserted, ${skipped} skipped`,
  )
}

main()
  .catch((error) => {
    console.error('Board-member data correction failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
