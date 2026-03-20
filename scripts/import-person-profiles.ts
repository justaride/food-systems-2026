import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type PersonRole = {
  companyId?: string
  companyName: string
  role: string
  fromYear?: number
  toYear?: number
}

type PersonProfileData = {
  name: string
  roles: PersonRole[]
  biography?: string
  linkedInUrl?: string
  photoUrl?: string
  affiliations?: string[]
  tags?: string[]
  metadata?: Record<string, unknown>
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

const profiles: PersonProfileData[] = [
  // --- Company Executives ---

  {
    name: 'Runar Hollevik',
    roles: [
      { companyName: 'NorgesGruppen ASA', role: 'CEO', fromYear: 2016 },
      { companyName: 'ASKO Norge AS', role: 'CEO', fromYear: 2008, toYear: 2016 },
      { companyName: 'BAMA Gruppen AS', role: 'styremedlem' },
      { companyName: 'Kiwi Minidrift AS', role: 'styreleder' },
    ],
    biography: 'Konsernsjef i NorgesGruppen siden 2016. Sivilokonom fra BI, startet karrieren i dagligvare som 15-aring. Var konsulent i PwC for ledet ASKO Norge i atte ar.',
    affiliations: ['NorgesGruppen konsernledelse'],
    tags: ['retail', 'dagligvare', 'interlocking-director'],
  },
  {
    name: 'Johan Johannson',
    roles: [
      { companyName: 'NorgesGruppen ASA', role: 'styreleder' },
    ],
    biography: 'Styreleder i NorgesGruppen, representant for Johannson-familien som eier 74.4% av selskapet. Fodt 1967.',
    affiliations: [],
    tags: ['retail', 'dagligvare', 'family-owner'],
  },
  {
    name: 'Philipp Engedal',
    roles: [
      { companyName: 'Coop Norge SA', role: 'CEO', fromYear: 2023 },
      { companyName: 'Flytoget AS', role: 'CEO', fromYear: 2017, toYear: 2023 },
      { companyName: 'Nobina AS', role: 'CEO', fromYear: 2012, toYear: 2016 },
    ],
    biography: 'Konsernsjef i Coop Norge fra 2023. Utdannet ved Universitat Mannheim. Bakgrunn fra transport og logistikk, tidligere CEO i Flytoget og Nobina.',
    affiliations: [],
    tags: ['retail', 'dagligvare', 'cooperative'],
  },
  {
    name: 'Geir Inge Stokke',
    roles: [
      { companyName: 'Coop Norge SA', role: 'CEO', fromYear: 2015, toYear: 2022 },
      { companyName: 'Vy Gruppen AS', role: 'nestleder styret' },
    ],
    biography: 'Tidligere konsernsjef i Coop Norge (2015-2022). Over 30 ars erfaring fra handel, IT og konseptutvikling. Ledet Coops oppkjop av ICA og Coop Norden-salget.',
    affiliations: ['Amnesty International Norge', 'Virke'],
    tags: ['retail', 'dagligvare', 'cooperative', 'former-ceo'],
  },
  {
    name: 'Ole Robert Reitan',
    roles: [
      { companyName: 'Reitan Retail AS', role: 'CEO' },
      { companyName: 'REMA 1000 AS', role: 'CEO og styremedlem' },
      { companyName: 'BAMA Gruppen AS', role: 'styremedlem' },
      { companyName: 'Reitangruppen AS', role: 'styremedlem' },
      { companyName: 'Britannia Hotel AS', role: 'styremedlem' },
      { companyName: 'Treschow-Fritzøe AS', role: 'styremedlem' },
    ],
    biography: 'CEO i Reitan Retail og REMA 1000. Sonn av grunder Odd Reitan, medeier i REITAN AS. Utdannet ved BI. Fodt 1971.',
    affiliations: [],
    tags: ['retail', 'dagligvare', 'family-owner', 'interlocking-director'],
  },
  {
    name: 'Nils K. Selte',
    roles: [
      { companyName: 'Orkla ASA', role: 'CEO', fromYear: 2022 },
      { companyName: 'Orkla ASA', role: 'styremedlem', fromYear: 2014, toYear: 2022 },
      { companyName: 'Canica AS', role: 'CEO', fromYear: 2001, toYear: 2022 },
      { companyName: 'Komplett AS', role: 'styreleder' },
      { companyName: 'Jotun AS', role: 'styremedlem' },
      { companyName: 'Arcus AS', role: 'styremedlem' },
      { companyName: 'ICA Ahold AB', role: 'SVP Finance', fromYear: 1999, toYear: 2001 },
      { companyName: 'Hakon Gruppen AS', role: 'SVP Finance', fromYear: 1996, toYear: 1999 },
    ],
    biography: 'Konsernsjef i Orkla fra april 2022. Sivilokonom fra BI (1991). Kom fra Stein Erik Hagens familieselskap Canica der han var CEO/CFO i over 20 ar. Ledet Orklas revisjonsutvalg som styremedlem fra 2014.',
    affiliations: ['Canica-sfaeren'],
    tags: ['processing', 'fmcg', 'hagen-family'],
  },
  {
    name: 'Stein Erik Hagen',
    roles: [
      { companyName: 'Orkla ASA', role: 'styreleder' },
      { companyName: 'Canica AS', role: 'eier og grunder' },
    ],
    biography: 'Grunder av Rimi og storste eier i Orkla via Canica (25.1%). Norges mest innflytelsesrike dagligvareentreprenor. Fodt 1956.',
    affiliations: [],
    tags: ['processing', 'fmcg', 'family-owner', 'retail-history'],
  },
  {
    name: 'Ivan Vindheim',
    roles: [
      { companyName: 'Mowi ASA', role: 'CEO', fromYear: 2019 },
      { companyName: 'Mowi ASA', role: 'CFO', fromYear: 2012, toYear: 2019 },
      { companyName: 'Arctic Fish Holding AS', role: 'styremedlem', fromYear: 2023 },
      { companyName: 'Lerøy Seafood Group ASA', role: 'CFO', fromYear: 2007, toYear: 2012 },
      { companyName: 'Rolls-Royce', role: 'VP Finance', fromYear: 2005, toYear: 2007 },
    ],
    biography: 'CEO i Mowi fra 2019, tidligere CFO i Mowi (7 ar) og Leroy (5 ar). MSc og MBA fra NHH, statsautorisert revisor. Bakgrunn fra Deloitte og Rolls-Royce.',
    affiliations: [],
    tags: ['seafood', 'aquaculture', 'interlocking-director'],
  },
  {
    name: 'Svein Tore Holsether',
    roles: [
      { companyName: 'Yara International ASA', role: 'CEO', fromYear: 2015 },
      { companyName: 'Sapa AS', role: 'CEO', fromYear: 2011, toYear: 2015 },
      { companyName: 'Orkla ASA', role: 'EVP M&A', fromYear: 2010, toYear: 2011 },
      { companyName: 'Sapa AB', role: 'CFO', fromYear: 2007, toYear: 2010 },
      { companyName: 'Elkem ASA', role: 'CFO', fromYear: 2005, toYear: 2007 },
      { companyName: 'SEB AB', role: 'styremedlem' },
    ],
    biography: 'CEO i Yara fra 2015. BSc Finance & Management fra University of Utah. Karriere via Elkem, Orkla og Sapa. President i NHO fra 2022.',
    affiliations: ['NHO', 'NHO president', 'WBCSD Food & Nature', 'WEF Alliance of CEO Climate Leaders', 'CEFIC styremedlem', 'IFA styreleder'],
    tags: ['inputs', 'fertilizer', 'sustainability', 'nho-president', 'state-owned'],
  },
  {
    name: 'Ann-Beth Freuchen',
    roles: [
      { companyName: 'TINE SA', role: 'CEO', fromYear: 2023 },
      { companyName: 'TINE SA', role: 'vise-konsernsjef', fromYear: 2022, toYear: 2023 },
      { companyName: 'Orkla ASA', role: 'konserndirektor Orkla Foods Nordics & Baltics', fromYear: 2013, toYear: 2022 },
      { companyName: 'KiMs Norge AS', role: 'adm. dir.', fromYear: 2010, toYear: 2013 },
      { companyName: 'Nidar AS', role: 'markedsdirektor', fromYear: 1996, toYear: 2010 },
    ],
    biography: 'Konsernsjef i TINE fra oktober 2023. 25 ars erfaring fra FMCG-bransjen, hovedsakelig i Orkla-systemet. Utdanning fra IMD Business School.',
    affiliations: ['NHO Mat og Drikke'],
    tags: ['processing', 'dairy', 'cooperative', 'fmcg'],
  },
  {
    name: 'Svenn Ivar Fure',
    roles: [
      { companyName: 'Felleskjøpet Agri SA', role: 'CEO', fromYear: 2021 },
      { companyName: 'NorSun AS', role: 'CEO', fromYear: 2017, toYear: 2021 },
      { companyName: 'Aker Solutions ASA', role: 'konsernledelse', fromYear: 2016, toYear: 2017 },
      { companyName: 'Aker Solutions ASA', role: 'diverse lederstillinger', fromYear: 2002, toYear: 2016 },
    ],
    biography: 'Konsernsjef i Felleskjopet Agri fra juni 2021. Sivilingenior i industriell okonomi fra NTNU, MBA fra Middlebury Institute i California. Vokste opp pa gard i Stryn.',
    affiliations: [],
    tags: ['inputs', 'agriculture', 'cooperative'],
  },
  {
    name: 'Morten Henriksen',
    roles: [
      { companyName: 'Nortura SA', role: 'CEO', fromYear: 2026 },
      { companyName: 'Mainstream Renewable Power', role: 'CEO', fromYear: 2025, toYear: 2026 },
      { companyName: 'Gassnova SF', role: 'CEO', fromYear: 2023, toYear: 2025 },
      { companyName: 'Arendals Fossekompani ASA', role: 'EVP', toYear: 2023 },
      { companyName: 'Statkraft AS', role: 'lederroller' },
    ],
    biography: 'Ny konsernsjef i Nortura fra 1. mars 2026. Bred ledererfaring fra energisektoren, bl.a. som CEO i Mainstream Renewable Power og Gassnova. Etterfolger Anne Marit Panengstuen.',
    affiliations: [],
    tags: ['processing', 'meat', 'cooperative', 'new-appointment'],
  },
  {
    name: 'Gustav Witzøe',
    roles: [
      { companyName: 'SalMar ASA', role: 'styreleder', fromYear: 2022 },
      { companyName: 'SalMar ASA', role: 'grunder', fromYear: 1991 },
      { companyName: 'Kverva AS', role: 'styreleder' },
      { companyName: 'BEWI AS', role: 'medgrunder og adm. dir.', fromYear: 1983, toYear: 1990 },
    ],
    biography: 'Grunder av SalMar ASA (1991) og styreleder fra 2022. Eier 92.5% av Kverva AS som kontrollerer 44.3% av SalMar. Utdannet ingenior. Tidligere medgrunder av BEWI AS (styroforemballasje for fiskeindustri).',
    affiliations: [],
    tags: ['seafood', 'aquaculture', 'family-owner', 'founder'],
  },
  {
    name: 'Gustav Magnar Witzøe',
    roles: [
      { companyName: 'SalMar ASA', role: 'hovedaksjonaer (41.3%)', fromYear: 2013 },
      { companyName: 'Kverva AS', role: 'styremedlem' },
    ],
    biography: 'Storste aksjonaer i SalMar ASA (41.3%), arvet aksjeposten fra far Gustav Witzo som grunnla selskapet i 1991. Fodt 1993, en av verdens yngste milliardaerer. Aktiv tech-investor.',
    affiliations: ['W Initiative'],
    tags: ['seafood', 'aquaculture', 'family-owner', 'investor'],
  },
  {
    name: 'Frode Arntsen',
    roles: [
      { companyName: 'SalMar ASA', role: 'CEO', fromYear: 2022 },
      { companyName: 'SalMar ASA', role: 'COO Industry and Sales', fromYear: 2017, toYear: 2022 },
      { companyName: 'Lerøy Midt AS', role: 'produksjonsdirektor', fromYear: 2012, toYear: 2017 },
      { companyName: 'Lerøy Midnor AS', role: 'fabrikksjef', fromYear: 2009, toYear: 2012 },
      { companyName: 'HitraMat AS', role: 'produksjonssjef', fromYear: 2004, toYear: 2009 },
    ],
    biography: 'CEO i SalMar fra oktober 2022. Bakgrunn fra Forsvaret, utdannet innen ledelse. Har jobbet i sjomatindustrien siden 2000, med erfaring fra Leroy-systemet og HitraMat.',
    affiliations: [],
    tags: ['seafood', 'aquaculture'],
  },
  {
    name: 'Gunhild Stordalen',
    roles: [
      { companyName: 'EAT Foundation', role: 'grunder og styreleder', fromYear: 2014 },
      { companyName: 'GreeNudge', role: 'grunder og styreleder' },
      { companyName: 'Stordalen Foundation', role: 'medgrunder', fromYear: 2011 },
    ],
    biography: 'Lege og PhD i patologi fra UiO. Medgrunder av EAT Foundation, global plattform for mattransformasjon. Ledet UN Food Systems Summit Action Track 2 (2021). Young Global Leader (WEF 2015).',
    affiliations: [
      'UN Food Systems Advisory Group',
      'UN Scaling Up Nutrition Lead Group',
      'WEF Stewardship Board Food Systems',
      'Stockholm Resilience Centre International Advisory Board',
      'Champions 12.3',
      'High-Level Panel for a Sustainable Ocean Economy',
      'REQ Capital',
    ],
    tags: ['food-policy', 'sustainability', 'civil-society', 'global-governance'],
  },
  {
    name: 'Henning Beltestad',
    roles: [
      { companyName: 'Lerøy Seafood Group ASA', role: 'CEO', fromYear: 2010 },
      { companyName: 'Hallvard Lerøy AS', role: 'adm. dir.', fromYear: 2007, toYear: 2010 },
      { companyName: 'Hallvard Lerøy AS', role: 'diverse stillinger', fromYear: 1993, toYear: 2007 },
    ],
    biography: 'CEO i Leroy Seafood Group fra 2010. Sivilokonom fra BI. Startet i Hallvard Leroy i 1993, hele karrieren i Leroy-systemet.',
    affiliations: [],
    tags: ['seafood', 'aquaculture'],
  },
  {
    name: 'Marit Haugen',
    roles: [
      { companyName: 'TINE SA', role: 'styreleder', fromYear: 2019, toYear: 2025 },
      { companyName: 'TINE SA', role: 'styremedlem', fromYear: 2015, toYear: 2019 },
      { companyName: 'International Dairy Federation', role: 'styremedlem' },
    ],
    biography: 'Styreleder i TINE 2019-2025, forste kvinne i rollen. Melkebonde i Beitstad, Steinkjer. Utdannet landbruksokonom fra NMBU. Bakgrunn fra Landbruksdepartementet og Nord-Trondelag Bondelag.',
    affiliations: ['International Dairy Federation (IDF)', 'Nord-Trondelag Bondelag'],
    tags: ['dairy', 'cooperative', 'farmer', 'former-chair'],
  },
  {
    name: 'Rolf Øyvind Thune',
    roles: [
      { companyName: 'TINE SA', role: 'styreleder', fromYear: 2025 },
      { companyName: 'TINE SA', role: 'nestleder styret', fromYear: 2020, toYear: 2025 },
      { companyName: 'TINE SA', role: 'styremedlem', fromYear: 2015, toYear: 2020 },
    ],
    biography: 'Styreleder i TINE fra 2025, etterfolger Marit Haugen. Melkebonde i Rakkestad, Ostfold. Utdannet husdyrfag fra Steinkjer og NMBU.',
    affiliations: [],
    tags: ['dairy', 'cooperative', 'farmer'],
  },

  // --- Policy & Advocacy Leaders ---

  {
    name: 'Petter Haas Brubakk',
    roles: [
      { companyName: 'NHO Mat og Drikke', role: 'administrerende direktør' },
    ],
    biography: 'CEO of NHO Mat og Drikke, the food and beverage industry association under NHO representing 1,500+ enterprises. Previously regional director for business policy at NHO. Advocates on tax/duty policy, cross-border trade, and food industry framework conditions.',
    affiliations: ['NHO Mat og Drikke', 'NHO'],
    tags: ['policy', 'advocacy', 'industry-association', 'food-industry'],
  },
  {
    name: 'Håkon Mageli',
    roles: [
      { companyName: 'NHO Mat og Drikke', role: 'styreleder', fromYear: 2019 },
      { companyName: 'Orkla ASA', role: 'konserndirektør kommunikasjon og Corporate Affairs', fromYear: 2012 },
    ],
    biography: 'Chair of NHO Mat og Drikke since 2019 and EVP Communication & Corporate Affairs at Orkla ASA since 2012. Also chairs NHOs trade policy committee and the Norwegian Food Foundation. Former journalist at Dagens Næringsliv (1985-1990), graduate of BI.',
    affiliations: ['NHO Mat og Drikke', 'Orkla ASA', 'NHO handelspolitisk utvalg', 'Matfondet'],
    tags: ['policy', 'advocacy', 'industry-association', 'food-industry', 'interlocking-director'],
  },
  {
    name: 'Bernt Gudmund Apeland',
    roles: [
      { companyName: 'Virke', role: 'administrerende direktør', fromYear: 2023 },
    ],
    biography: 'CEO of Virke (main trade and service employers association) since January 2023. Previously general secretary of Norwegian Red Cross (6 years) and UNICEF Norway. Background in political science from UiO and journalism at VG and Dagbladet.',
    affiliations: ['Virke'],
    tags: ['policy', 'advocacy', 'industry-association', 'commerce'],
  },
  {
    name: 'Bendik Solum Whist',
    roles: [
      { companyName: 'Virke', role: 'bransjedirektør dagligvare' },
    ],
    biography: 'Branch director for grocery retail at Virke. 15 years experience in climate and energy policy including postings at the Norwegian embassy in Berlin, EFTA in Brussels, and the Ministry of Climate and Environment. Facilitates dialogue between grocery members and political authorities.',
    affiliations: ['Virke'],
    tags: ['policy', 'advocacy', 'dagligvare', 'industry-association'],
  },
  {
    name: 'Gaute Homb Lenvik',
    roles: [
      { companyName: 'Norsk Landbrukssamvirke', role: 'administrerende direktør', fromYear: 2021 },
    ],
    biography: 'CEO of Norsk Landbrukssamvirke (umbrella org for agricultural cooperatives) since June 2021. Previously CEO of Veterinærinstituttet (2016-2021), department director at Ministry of Agriculture and Food, and director of analysis/policy at NHO Mat og Drikke. Educated at NMBU.',
    affiliations: ['Norsk Landbrukssamvirke'],
    tags: ['policy', 'advocacy', 'cooperative', 'agriculture'],
  },
  {
    name: 'Anne Jødahl Skuterud',
    roles: [
      { companyName: 'Norsk Landbrukssamvirke', role: 'styreleder', fromYear: 2019 },
      { companyName: 'Felleskjøpet Agri SA', role: 'styreleder', fromYear: 2016, toYear: 2025 },
    ],
    biography: 'Chair of Norsk Landbrukssamvirke since 2019. Was first woman elected chair of Felleskjøpet Agri (2016-2025), one of the longest-serving chairs. Grain farmer in Gjerdrum and trained lawyer. Succeeded by Jens Lippestad at Felleskjøpet in 2025.',
    affiliations: ['Norsk Landbrukssamvirke', 'Felleskjøpet Agri SA'],
    tags: ['policy', 'advocacy', 'cooperative', 'agriculture', 'interlocking-director'],
  },
  {
    name: 'Mette Fossum',
    roles: [
      { companyName: 'Forbrukerrådet', role: 'direktør', fromYear: 2026 },
    ],
    biography: 'Director of Forbrukerrådet (Norwegian Consumer Council) from February 2026, succeeding Inger Lise Blyverket. Previously partner/CEO at Sustainability AS, communications director at Rema 1000 (2013-2021), communications director at Norges Bank (2011-2013), and political reporter at TV 2.',
    affiliations: ['Forbrukerrådet'],
    tags: ['policy', 'advocacy', 'consumer-protection', 'food-retail'],
  },
  {
    name: 'Ingunn Midttun Godal',
    roles: [
      { companyName: 'Mattilsynet', role: 'administrerende direktør', fromYear: 2019 },
    ],
    biography: 'CEO of Mattilsynet (Norwegian Food Safety Authority) since October 2019. Civil engineer from NTH (1992). Previously held leadership positions at DNV GL Business Assurance, Klima- og forurensningsdirektoratet, and NAV.',
    affiliations: ['Mattilsynet'],
    tags: ['policy', 'regulation', 'food-safety', 'government-agency'],
  },
  {
    name: 'Eli Reistad',
    roles: [
      { companyName: 'Landbruksdirektoratet', role: 'direktør', fromYear: 2024 },
    ],
    biography: 'Director of Landbruksdirektoratet (Norwegian Agriculture Agency) since July 2024. Previously group director at Felleskjøpet Agri, organization director at TINE SA, and acting deputy director at Ministry of Agriculture. Former chair/vice-chair of Norges Bondelag (2004-2009) and vice-chair of Statskog board (2013-2023). MSc from NMBU, operates grain farm in Sigdal.',
    affiliations: ['Landbruksdirektoratet', 'Felleskjøpet Agri SA', 'TINE SA'],
    tags: ['policy', 'regulation', 'agriculture', 'government-agency', 'interlocking-director'],
  },
  {
    name: 'Bjørn Gimming',
    roles: [
      { companyName: 'Norges Bondelag', role: 'leder', fromYear: 2021 },
    ],
    biography: 'President of Norges Bondelag (Norwegian Farmers Union) since 2021, now in his fifth term. Agronom and cand. agric. in soil/plant science. Farms grain, suckler cattle, and forest at Idd in Østfold. Previously 1st deputy leader (from 2016), county leader of Østfold Bondelag.',
    affiliations: ['Norges Bondelag'],
    tags: ['policy', 'advocacy', 'agriculture', 'farmer-union'],
  },
  {
    name: 'Tor Jacob Solberg',
    roles: [
      { companyName: 'Norsk Bonde- og Småbrukarlag', role: 'leder', fromYear: 2022 },
    ],
    biography: 'Leader of Norsk Bonde- og Småbrukarlag (Norwegian Smallholders Union). Organic dairy and grain farmer in Skiptvet, Østfold. Co-founded Bondeopprøret (Farmer Uprising) in 2021. Central figure in the "correct figures" campaign for accurate farmer income calculations. Previously active in Nortura, Felleskjøpet, and Bondelaget.',
    affiliations: ['Norsk Bonde- og Småbrukarlag'],
    tags: ['policy', 'advocacy', 'agriculture', 'farmer-union', 'smallholders'],
  },
]

async function resolveCompanyIds(roles: PersonRole[]): Promise<PersonRole[]> {
  const resolved: PersonRole[] = []
  for (const role of roles) {
    const company = await prisma.company.findFirst({
      where: { name: role.companyName },
      select: { id: true },
    })
    resolved.push({
      ...role,
      companyId: company?.id,
    })
  }
  return resolved
}

async function main() {
  console.log('Importing person profiles...\n')

  const boardMembers = await prisma.boardMember.findMany({
    include: { company: { select: { id: true, name: true } } },
  })

  const boardByKey = new Map<string, Array<{ companyId: string; companyName: string; role: string }>>()
  for (const bm of boardMembers) {
    const key = normalizePersonKey(bm.personName)
    if (!boardByKey.has(key)) boardByKey.set(key, [])
    boardByKey.get(key)!.push({
      companyId: bm.company.id,
      companyName: bm.company.name,
      role: bm.role,
    })
  }

  let imported = 0

  for (const p of profiles) {
    const personKey = normalizePersonKey(p.name)
    const resolvedRoles = await resolveCompanyIds(p.roles)

    await prisma.personProfile.upsert({
      where: { personKey },
      update: {
        name: p.name,
        roles: resolvedRoles,
        biography: p.biography,
        linkedInUrl: p.linkedInUrl,
        photoUrl: p.photoUrl,
        affiliations: p.affiliations ?? [],
        tags: p.tags ?? [],
        metadata: p.metadata,
      },
      create: {
        name: p.name,
        personKey,
        roles: resolvedRoles,
        biography: p.biography,
        linkedInUrl: p.linkedInUrl,
        photoUrl: p.photoUrl,
        affiliations: p.affiliations ?? [],
        tags: p.tags ?? [],
        metadata: p.metadata,
      },
    })

    console.log(`  ${p.name} (${personKey}) — ${resolvedRoles.length} roles`)
    imported++
  }

  let autoCreated = 0
  for (const [key, roles] of boardByKey) {
    if (roles.length < 2) continue

    const existing = await prisma.personProfile.findUnique({ where: { personKey: key } })
    if (existing) continue

    const name = boardMembers.find(bm => normalizePersonKey(bm.personName) === key)!.personName
    await prisma.personProfile.create({
      data: {
        name,
        personKey: key,
        roles: roles.map(r => ({
          companyId: r.companyId,
          companyName: r.companyName,
          role: r.role,
        })),
        affiliations: [],
        tags: ['interlocking-director', 'auto-detected'],
      },
    })

    console.log(`  AUTO: ${name} (${key}) — ${roles.length} interlocking roles`)
    autoCreated++
  }

  console.log(`\n${imported} profiles imported, ${autoCreated} auto-created from board interlocks`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
