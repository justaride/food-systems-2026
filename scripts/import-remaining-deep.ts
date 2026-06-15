import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

const boards: Record<string, { orgNr: string; members: { personName: string; role: string }[] }> = {
  'Compass Group Norge AS': {
    orgNr: '952507729',
    members: [
      { personName: 'Tor Roenhovde', role: 'styreleder' },
      { personName: 'Ingvil Rasten Fongod', role: 'daglig leder' },
      { personName: 'Gaute Houge', role: 'styremedlem' },
      { personName: 'Trine Grane-Olsen', role: 'styremedlem' },
      { personName: 'Ingvil Rasten Fongod', role: 'styremedlem' },
      { personName: 'Finn Rune Kristiansen', role: 'styremedlem' },
      { personName: 'Kirsten Versland', role: 'styremedlem' },
    ],
  },
  'Sodexo AS': {
    orgNr: '932144336',
    members: [
      { personName: 'Caroline A Yvonne Soladie', role: 'styreleder' },
      { personName: 'Thomas Havnegjerde', role: 'daglig leder' },
      { personName: 'Thomas Havnegjerde', role: 'styremedlem' },
      { personName: 'Christine Johnsen', role: 'styremedlem' },
      { personName: 'Abdulkadir Said Muse', role: 'styremedlem' },
      { personName: 'Guro Noren Ask', role: 'styremedlem' },
      { personName: 'Marc Guy Louis Rolland', role: 'styremedlem' },
      { personName: 'Anton M Van Der Woerdt', role: 'styremedlem' },
    ],
  },
  'ISS Facility Services AS': {
    orgNr: '914791723',
    members: [
      { personName: 'Carl-Fredrik Langaard-Bjor', role: 'styreleder' },
      { personName: 'Carl-Fredrik Langaard-Bjor', role: 'daglig leder' },
      { personName: 'Maria Hultengren Larsson', role: 'styremedlem' },
      { personName: 'Maciej Piotr Wasek', role: 'styremedlem' },
      { personName: 'Erlend Mathiesen Kleive', role: 'styremedlem' },
      { personName: 'Irene Skuggen Olsen', role: 'styremedlem' },
      { personName: 'Karen Valbekmo Selvaag', role: 'styremedlem' },
    ],
  },
  'Servicegrossistene AS': {
    orgNr: '933444724',
    members: [
      { personName: 'Bjarte Royrvik', role: 'styreleder' },
      { personName: 'Huib Jan Van Der Burg', role: 'daglig leder' },
      { personName: 'Lotte Fosbaek Danielsen', role: 'styremedlem' },
      { personName: 'Geir-Ove Maakestad', role: 'styremedlem' },
      { personName: 'Odd-Oeyvind Maakestad', role: 'styremedlem' },
      { personName: 'Tor-Inge Maakestad', role: 'styremedlem' },
      { personName: 'Katrine Hessen Monge', role: 'styremedlem' },
      { personName: 'Tone-Berit Lintho', role: 'styremedlem' },
    ],
  },
  '4Service Gruppen AS': {
    orgNr: '897392232',
    members: [
      { personName: 'Tor Roenhovde', role: 'styreleder' },
      { personName: 'Finn Rune Kristiansen', role: 'daglig leder' },
      { personName: 'Finn Rune Kristiansen', role: 'styremedlem' },
    ],
  },
}

const personProfiles = [
  {
    name: 'Bente Elisabeth Torstensen',
    personKey: normalizePersonKey('Bente Elisabeth Torstensen'),
    biography: 'Administrerende direktoer i Nofima AS fra 2020. Forskningsbakgrunn innen fiskeernaering og fiskehelse. Tidligere forskningsdirektør i Nofima.',
    roles: [
      { companyName: 'Nofima AS', role: 'Administrerende direktoer', fromYear: 2020 },
    ],
    tags: ['nofima', 'forskning', 'sjomat', 'daglig-leder'],
  },
  {
    name: 'Thomas Henning Farstad',
    personKey: normalizePersonKey('Thomas Henning Farstad'),
    biography: 'Styreleder i Nofima AS. Tidligere departementsraad i Naerings- og fiskeridepartementet (NFD). Lang erfaring fra norsk fiskeri- og havbrukspolitikk.',
    roles: [
      { companyName: 'Nofima AS', role: 'Styreleder', fromYear: 2019 },
    ],
    tags: ['nofima', 'styreleder', 'offentlig-sektor'],
  },
  {
    name: 'Trond Berger',
    personKey: normalizePersonKey('Trond Berger'),
    biography: 'Styreleder i Yara International ASA fra 2019. Tidligere konserndirektør og CFO i Schibsted ASA (2000-2018). Siviløkonom fra NHH.',
    roles: [
      { companyName: 'Yara International ASA', role: 'Styreleder', fromYear: 2019 },
    ],
    tags: ['yara', 'styreleder', 'finans'],
  },
  {
    name: 'Mads Martinsen',
    personKey: normalizePersonKey('Mads Martinsen'),
    biography: 'Administrerende direktoer i Skretting AS (Nutreco). Leder Skrettings norske operasjoner inkludert fiskeforfabrikker i Stavanger, Averøy og Stokmarknes. Tidligere roller i Nutreco-konsernet.',
    roles: [
      { companyName: 'Skretting AS', role: 'Administrerende direktoer', fromYear: 2018 },
    ],
    tags: ['skretting', 'nutreco', 'fiskefor', 'daglig-leder'],
  },
  {
    name: 'Ingvil Rasten Fongod',
    personKey: normalizePersonKey('Ingvil Rasten Fongod'),
    biography: 'Administrerende direktoer i Compass Group Norge AS. Ogsaa styremedlem i Compass Group Norge og styreleder i 4Service Holding AS. Leder Compass Groups norske virksomhet inkludert kantine, renhold og facility services.',
    roles: [
      { companyName: 'Compass Group Norge AS', role: 'Administrerende direktoer', fromYear: 2024 },
      { companyName: 'Compass Group Norge AS', role: 'Styremedlem', fromYear: 2024 },
      { companyName: '4Service Holding AS', role: 'Styreleder', fromYear: 2024 },
    ],
    tags: ['compass-group', 'horeca', 'daglig-leder'],
  },
  {
    name: 'Thomas Havnegjerde',
    personKey: normalizePersonKey('Thomas Havnegjerde'),
    biography: 'Administrerende direktoer og styremedlem i Sodexo AS Norge. Leder Sodexos norske virksomhet innen kantine- og facility-tjenester.',
    roles: [
      { companyName: 'Sodexo AS', role: 'Administrerende direktoer', fromYear: 2020 },
      { companyName: 'Sodexo AS', role: 'Styremedlem', fromYear: 2020 },
    ],
    tags: ['sodexo', 'horeca', 'daglig-leder'],
  },
  {
    name: 'Tor Roenhovde',
    personKey: normalizePersonKey('Tor Roenhovde'),
    biography: 'Styreleder i Compass Group Norge AS og 4Service Gruppen AS. Interlocking director mellom Compass Group-konsernets norske selskaper. Erfaring fra contract catering og facility services.',
    roles: [
      { companyName: 'Compass Group Norge AS', role: 'Styreleder', fromYear: 2024 },
      { companyName: '4Service Gruppen AS', role: 'Styreleder', fromYear: 2020 },
    ],
    tags: ['compass-group', '4service', 'horeca', 'styreleder', 'interlocking-director'],
  },
  {
    name: 'Finn Rune Kristiansen',
    personKey: normalizePersonKey('Finn Rune Kristiansen'),
    biography: 'Daglig leder i 4Service Gruppen AS og styremedlem i Compass Group Norge AS. Interlocking director mellom Compass Group-konsernets norske selskaper.',
    roles: [
      { companyName: '4Service Gruppen AS', role: 'Daglig leder', fromYear: 2020 },
      { companyName: '4Service Gruppen AS', role: 'Styremedlem', fromYear: 2020 },
      { companyName: 'Compass Group Norge AS', role: 'Styremedlem', fromYear: 2024 },
    ],
    tags: ['compass-group', '4service', 'horeca', 'daglig-leder', 'interlocking-director'],
  },
  {
    name: 'Carl-Fredrik Langaard-Bjor',
    personKey: normalizePersonKey('Carl-Fredrik Langaard-Bjor'),
    biography: 'Administrerende direktoer og styreleder i ISS Facility Services AS Norge. Kombinert rolle som bade daglig leder og styreleder i ISS Norge.',
    roles: [
      { companyName: 'ISS Facility Services AS', role: 'Administrerende direktoer', fromYear: 2022 },
      { companyName: 'ISS Facility Services AS', role: 'Styreleder', fromYear: 2022 },
    ],
    tags: ['iss', 'horeca', 'daglig-leder', 'styreleder'],
  },
  {
    name: 'Huib Jan Van Der Burg',
    personKey: normalizePersonKey('Huib Jan Van Der Burg'),
    biography: 'Daglig leder i Servicegrossistene AS. Leder bransjeorganisasjonen for 21 regionale servicegrossister som betjener det norske HoReCa-markedet.',
    roles: [
      { companyName: 'Servicegrossistene AS', role: 'Daglig leder', fromYear: 2019 },
    ],
    tags: ['servicegrossistene', 'horeca', 'daglig-leder', 'foodservice'],
  },
]

async function updateBoards() {
  console.log('Updating boards for HORECA + research companies...\n')
  let totalMembers = 0
  for (const [companyName, board] of Object.entries(boards)) {
    const id = await resolveCompanyId(board.orgNr)
    if (!id) {
      console.log(`  SKIP ${companyName} — not found (${board.orgNr})`)
      continue
    }
    await prisma.boardMember.deleteMany({ where: { companyId: id } })
    for (const b of board.members) {
      await prisma.boardMember.create({
        data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) },
      })
    }
    console.log(`  ${companyName}: ${board.members.length} members`)
    totalMembers += board.members.length
  }
  console.log(`\n${totalMembers} board members imported across ${Object.keys(boards).length} companies`)
}

async function importPersonProfiles() {
  console.log('\nImporting person profiles...\n')
  let imported = 0
  for (const p of personProfiles) {
    await prisma.personProfile.upsert({
      where: { personKey: p.personKey },
      update: { name: p.name, biography: p.biography, roles: p.roles, tags: p.tags },
      create: { name: p.name, personKey: p.personKey, biography: p.biography, roles: p.roles, tags: p.tags },
    })
    console.log(`  ${p.name} (${p.tags.slice(0, 2).join(', ')})`)
    imported++
  }
  console.log(`\n${imported} person profiles imported`)
}

async function main() {
  console.log('=== Remaining Deep Research: Nofima, Yara, Skretting + HORECA ===\n')
  await updateBoards()
  await importPersonProfiles()
  console.log('\n=== Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Board members:', await prisma.boardMember.count())
  console.log('Person profiles:', await prisma.personProfile.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Remaining deep import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
