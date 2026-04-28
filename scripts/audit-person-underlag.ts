import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey } from '../src/lib/person-key.ts'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Oppdatert 2026-04-28 etter dedupe-person-keys --commit. For tidligere tall, se
// scripts/dedupe-person-keys.ts (1573 personer / 2592 roller / 618 interlocking
// ble redusert til 1486 / 2472 / 592 etter merge av navnesplitt-grupper).
const EXPECTED_PAGE_COUNTS = {
  persons: 1486,
  roles: 2472,
  interlocking: 592,
}

const REPORT_PATH = 'docs/project/mandates/personer-underlagskontroll-food-tg-2026-04-28.md'
const JSON_PATH = 'research/_status/personer-underlagskontroll-2026-04-28.json'

type RoleSource = 'PersonProfile' | 'BoardMember'

type PersonRole = {
  companyId: string | null
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
  sources: RoleSource[]
}

type PersonRow = {
  id: string
  name: string
  personKey: string
  roles: PersonRole[]
  biography: string | null
  linkedInUrl: string | null
  photoUrl: string | null
  affiliations: string[]
  tags: string[]
  hasStoredProfile: boolean
  hasBoardFallback: boolean
}

type StoredRoleIssue = {
  personKey: string
  personName: string
  index: number
  reason: string
}

// Etter dedup (2026-04-28) er audit-skriptets forventede personKey identisk
// med canonicalPersonKey, slik at ActorContact/Meeting/Communication-navn
// matcher pageKeys riktig.
const normalizePersonKey = canonicalPersonKey

function loosePersonKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseYear(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function normalizeRoleLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function roleMergeKey(role: Pick<PersonRole, 'companyName' | 'role'>) {
  return `${role.companyName.trim().toLowerCase()}::${role.role.trim().toLowerCase()}`
}

function mergeTags(primary: string[], secondary: string[]) {
  return [...new Set([...primary, ...secondary])].sort((a, b) => a.localeCompare(b, 'nb'))
}

function mergeRoles(primary: PersonRole[], secondary: PersonRole[]): PersonRole[] {
  const merged = new Map<string, PersonRole>()

  for (const role of [...primary, ...secondary]) {
    const key = roleMergeKey(role)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, { ...role, sources: [...role.sources] })
      continue
    }

    merged.set(key, {
      companyId: role.companyId ?? existing.companyId,
      companyName: existing.companyName || role.companyName,
      role: existing.role || role.role,
      fromYear: existing.fromYear ?? role.fromYear,
      toYear: existing.toYear ?? role.toYear,
      sources: [...new Set([...existing.sources, ...role.sources])],
    })
  }

  return [...merged.values()].sort((a, b) => {
    const byStartYear = (b.fromYear ?? -Infinity) - (a.fromYear ?? -Infinity)
    if (byStartYear !== 0) return byStartYear

    const byCompany = a.companyName.localeCompare(b.companyName, 'nb')
    if (byCompany !== 0) return byCompany

    return a.role.localeCompare(b.role, 'nb')
  })
}

function normalizeStoredRoles(
  personKey: string,
  personName: string,
  roles: unknown[],
): { roles: PersonRole[]; issues: StoredRoleIssue[] } {
  const issues: StoredRoleIssue[] = []
  const normalized: PersonRole[] = []

  roles.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      issues.push({ personKey, personName, index, reason: 'role entry is not an object' })
      return
    }

    const record = entry as Record<string, unknown>
    const companyName = typeof record.companyName === 'string' ? record.companyName.trim() : ''
    const role = typeof record.role === 'string' ? record.role.trim() : ''

    if (!companyName || !role) {
      issues.push({ personKey, personName, index, reason: 'missing companyName or role' })
      return
    }

    normalized.push({
      companyId: typeof record.companyId === 'string' && record.companyId ? record.companyId : null,
      companyName,
      role,
      fromYear: parseYear(record.fromYear),
      toYear: parseYear(record.toYear),
      sources: ['PersonProfile'],
    })
  })

  return { roles: normalized, issues }
}

function mergeProfileRows(profile: PersonRow, fallback: PersonRow | null): PersonRow {
  if (!fallback) return profile

  return {
    id: profile.id,
    name: profile.name || fallback.name,
    personKey: profile.personKey,
    roles: mergeRoles(profile.roles, fallback.roles),
    biography: profile.biography ?? fallback.biography,
    linkedInUrl: profile.linkedInUrl ?? fallback.linkedInUrl,
    photoUrl: profile.photoUrl ?? fallback.photoUrl,
    affiliations: [...new Set([...profile.affiliations, ...fallback.affiliations])],
    tags: mergeTags(profile.tags, fallback.tags),
    hasStoredProfile: true,
    hasBoardFallback: true,
  }
}

function formatPercent(part: number, total: number) {
  if (total === 0) return '0.0%'
  return `${((part / total) * 100).toFixed(1)}%`
}

function sample<T>(items: T[], size = 15) {
  return items.slice(0, size)
}

function table(rows: Array<Array<string | number>>) {
  const [header, ...body] = rows
  const separator = header.map(() => '---')
  return [header, separator, ...body].map(row => `| ${row.join(' | ')} |`).join('\n')
}

function status(ok: boolean) {
  return ok ? 'PASS' : 'FAIL'
}

function warnStatus(ok: boolean) {
  return ok ? 'PASS' : 'WARN'
}

async function main() {
  const [
    profiles,
    boardMembers,
    actorContacts,
    meetings,
    communications,
  ] = await Promise.all([
    prisma.personProfile.findMany({ orderBy: { name: 'asc' } }),
    prisma.boardMember.findMany({
      include: { company: { select: { id: true, name: true } } },
      orderBy: [{ personName: 'asc' }, { role: 'asc' }],
    }),
    prisma.actorContact.findMany({
      select: { id: true, name: true, role: true, organization: true, actorId: true },
      orderBy: { name: 'asc' },
    }),
    prisma.meeting.findMany({
      select: { id: true, title: true, participants: true },
      orderBy: { date: 'asc' },
    }),
    prisma.communication.findMany({
      select: { id: true, title: true, sender: true, recipients: true },
      orderBy: { date: 'asc' },
    }),
  ])

  const storedRoleIssues: StoredRoleIssue[] = []
  const storedRows: PersonRow[] = profiles.map((profile) => {
    const { roles, issues } = normalizeStoredRoles(
      profile.personKey,
      profile.name,
      profile.roles as unknown[],
    )
    storedRoleIssues.push(...issues)

    return {
      id: profile.id,
      name: profile.name,
      personKey: profile.personKey,
      roles,
      biography: profile.biography,
      linkedInUrl: profile.linkedInUrl,
      photoUrl: profile.photoUrl,
      affiliations: profile.affiliations,
      tags: profile.tags,
      hasStoredProfile: true,
      hasBoardFallback: false,
    }
  })

  const fallbackByKey = new Map<string, PersonRow>()
  for (const member of boardMembers) {
    const key = member.personKey
    const existing = fallbackByKey.get(key)
    const role: PersonRole = {
      companyId: member.company.id,
      companyName: member.company.name,
      role: member.role,
      fromYear: null,
      toYear: null,
      sources: ['BoardMember'],
    }

    if (existing) {
      existing.roles = mergeRoles(existing.roles, [role])
      continue
    }

    fallbackByKey.set(key, {
      id: `board-${key}`,
      name: member.personName,
      personKey: key,
      roles: [role],
      biography: null,
      linkedInUrl: null,
      photoUrl: null,
      affiliations: [],
      tags: [],
      hasStoredProfile: false,
      hasBoardFallback: true,
    })
  }

  for (const fallback of fallbackByKey.values()) {
    fallback.tags = mergeTags(
      fallback.tags,
      fallback.roles.length > 1
        ? ['auto-detected', 'board-member', 'interlocking-director']
        : ['auto-detected', 'board-member'],
    )
  }

  const personsByKey = new Map<string, PersonRow>()
  for (const fallback of fallbackByKey.values()) {
    personsByKey.set(fallback.personKey, fallback)
  }
  for (const profile of storedRows) {
    personsByKey.set(profile.personKey, mergeProfileRows(profile, personsByKey.get(profile.personKey) ?? null))
  }

  const persons = [...personsByKey.values()].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
  const profileKeys = new Set(storedRows.map(p => p.personKey))
  const boardKeys = new Set(fallbackByKey.keys())
  const pageKeys = new Set(persons.map(p => p.personKey))
  const pageLooseKeys = new Set(persons.map(p => loosePersonKey(p.name)))

  const pageCounts = {
    persons: persons.length,
    roles: persons.reduce((sum, person) => sum + person.roles.length, 0),
    interlocking: persons.filter(person => person.roles.length > 1).length,
  }

  const boardOnly = persons.filter(person => person.hasBoardFallback && !person.hasStoredProfile)
  const profileOnly = persons.filter(person => person.hasStoredProfile && !person.hasBoardFallback)
  const profileAndBoard = persons.filter(person => person.hasStoredProfile && person.hasBoardFallback)
  const fallbackOnlyInterlocking = boardOnly.filter(person => person.roles.length > 1)

  const missingBoardRolesByDisplay = boardMembers.filter((member) => {
    const person = personsByKey.get(member.personKey)
    if (!person) return true
    const expectedKey = roleMergeKey({
      companyName: member.company.name,
      role: member.role,
    })
    return !person.roles.some(role => roleMergeKey(role) === expectedKey)
  })

  const missingBoardRolesByCompanyId = boardMembers.filter((member) => {
    const person = personsByKey.get(member.personKey)
    if (!person) return true
    return !person.roles.some(role =>
      role.companyId === member.company.id &&
      normalizeRoleLabel(role.role) === normalizeRoleLabel(member.role)
    )
  })

  const boardRoleCompanyIdMismatches = missingBoardRolesByCompanyId.flatMap((member) => {
    const person = personsByKey.get(member.personKey)
    if (!person) {
      return [{
        personKey: member.personKey,
        personName: member.personName,
        companyName: member.company.name,
        boardCompanyId: member.company.id,
        pageCompanyId: null,
        role: member.role,
        reason: 'person missing from page',
      }]
    }

    const expectedKey = roleMergeKey({
      companyName: member.company.name,
      role: member.role,
    })
    const displayMatch = person.roles.find(role => roleMergeKey(role) === expectedKey)

    return [{
      personKey: member.personKey,
      personName: member.personName,
      companyName: member.company.name,
      boardCompanyId: member.company.id,
      pageCompanyId: displayMatch?.companyId ?? null,
      role: member.role,
      reason: displayMatch ? 'display role exists with different companyId' : 'display role missing',
    }]
  })

  const boardRoleCompanyIdMismatchGroups = [...boardRoleCompanyIdMismatches
    .reduce((groups, mismatch) => {
      const key = `${mismatch.companyName}::${mismatch.pageCompanyId ?? 'null'}::${mismatch.boardCompanyId}`
      const existing = groups.get(key)
      if (existing) {
        existing.count += 1
      } else {
        groups.set(key, {
          companyName: mismatch.companyName,
          pageCompanyId: mismatch.pageCompanyId,
          boardCompanyId: mismatch.boardCompanyId,
          count: 1,
        })
      }
      return groups
    }, new Map<string, { companyName: string; pageCompanyId: string | null; boardCompanyId: string; count: number }>())
    .values()]
    .sort((a, b) => b.count - a.count)

  const boardRoleGroups = new Map<string, typeof boardMembers>()
  for (const member of boardMembers) {
    const key = `${member.personKey}::${member.company.id}::${normalizeRoleLabel(member.role)}`
    boardRoleGroups.set(key, [...(boardRoleGroups.get(key) ?? []), member])
  }
  const duplicateBoardRoles = [...boardRoleGroups.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      count: entries.length,
      personName: entries[0].personName,
      companyName: entries[0].company.name,
      role: entries[0].role,
    }))
    .sort((a, b) => b.count - a.count)

  const unresolvedProfileRoles = storedRows.flatMap(person =>
    person.roles
      .filter(role => !role.companyId)
      .map(role => ({
        personKey: person.personKey,
        personName: person.name,
        companyName: role.companyName,
        role: role.role,
      })),
  )

  const boardNamesByKey = new Map<string, Set<string>>()
  for (const member of boardMembers) {
    boardNamesByKey.set(member.personKey, new Set([...(boardNamesByKey.get(member.personKey) ?? []), member.personName]))
  }

  const profileBoardNameMismatches = storedRows
    .filter(profile => boardNamesByKey.has(profile.personKey))
    .map(profile => ({
      personKey: profile.personKey,
      profileName: profile.name,
      boardNames: [...boardNamesByKey.get(profile.personKey)!].sort((a, b) => a.localeCompare(b, 'nb')),
    }))
    .filter(row => !row.boardNames.includes(row.profileName))

  const looseGroups = new Map<string, PersonRow[]>()
  for (const person of persons) {
    const key = loosePersonKey(person.name)
    looseGroups.set(key, [...(looseGroups.get(key) ?? []), person])
  }
  const possibleNameSplits = [...looseGroups.entries()]
    .map(([key, group]) => ({
      key,
      persons: group,
      distinctPersonKeys: new Set(group.map(person => person.personKey)).size,
    }))
    .filter(group => group.distinctPersonKeys > 1)
    .sort((a, b) => b.persons.length - a.persons.length)

  const interlockingDetailGaps = persons
    .filter(person => person.roles.length > 1)
    .filter(person => !person.biography || person.affiliations.length === 0)
    .sort((a, b) => b.roles.length - a.roles.length)
    .map(person => ({
      personKey: person.personKey,
      name: person.name,
      roles: person.roles.length,
      missingBiography: !person.biography,
      missingAffiliations: person.affiliations.length === 0,
      tags: person.tags,
    }))

  const detailCoverage = {
    biography: persons.filter(person => Boolean(person.biography)).length,
    linkedInUrl: persons.filter(person => Boolean(person.linkedInUrl)).length,
    photoUrl: persons.filter(person => Boolean(person.photoUrl)).length,
    affiliations: persons.filter(person => person.affiliations.length > 0).length,
    tags: persons.filter(person => person.tags.length > 0).length,
  }

  const allActorContactNames = actorContacts
    .filter(contact => contact.name.trim())
    .map(contact => ({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      organization: contact.organization,
      actorId: contact.actorId,
      personKey: normalizePersonKey(contact.name),
      looseKey: loosePersonKey(contact.name),
    }))

  const actorContactsNotOnPage = allActorContactNames
    .filter(contact => !pageKeys.has(contact.personKey) && !pageLooseKeys.has(contact.looseKey))

  const meetingParticipantNames = [...new Set(meetings.flatMap(meeting => meeting.participants))]
    .filter(name => name.trim())
    .map(name => ({ name, personKey: normalizePersonKey(name), looseKey: loosePersonKey(name) }))

  const meetingParticipantsNotOnPage = meetingParticipantNames
    .filter(participant => !pageKeys.has(participant.personKey) && !pageLooseKeys.has(participant.looseKey))

  const communicationNames = [...new Set(communications.flatMap(comm => [comm.sender, ...comm.recipients]))]
    .filter(name => name.trim())
    .map(name => ({ name, personKey: normalizePersonKey(name), looseKey: loosePersonKey(name) }))

  const communicationNamesNotOnPage = communicationNames
    .filter(person => !pageKeys.has(person.personKey) && !pageLooseKeys.has(person.looseKey))

  const gates = {
    expectedPageCounts:
      pageCounts.persons === EXPECTED_PAGE_COUNTS.persons &&
      pageCounts.roles === EXPECTED_PAGE_COUNTS.roles &&
      pageCounts.interlocking === EXPECTED_PAGE_COUNTS.interlocking,
    allBoardPersonsOnPage: [...boardKeys].every(key => pageKeys.has(key)),
    allBoardDisplayRolesOnPage: missingBoardRolesByDisplay.length === 0,
    allBoardRoleCompanyIdsOnPage: missingBoardRolesByCompanyId.length === 0,
    storedRolesParse: storedRoleIssues.length === 0,
  }

  const result = {
    generatedAt: new Date().toISOString(),
    expectedPageCounts: EXPECTED_PAGE_COUNTS,
    pageCounts,
    rawCounts: {
      personProfile: profiles.length,
      boardMember: boardMembers.length,
      uniqueBoardPersons: boardKeys.size,
      actorContact: actorContacts.length,
      meeting: meetings.length,
      communication: communications.length,
    },
    coverage: {
      profileAndBoard: profileAndBoard.length,
      profileOnly: profileOnly.length,
      boardOnly: boardOnly.length,
      fallbackOnlyInterlocking: fallbackOnlyInterlocking.length,
      detailCoverage,
    },
    gates,
    issues: {
      storedRoleIssues,
      missingBoardRolesByDisplay: missingBoardRolesByDisplay.map(member => ({
        personKey: member.personKey,
        personName: member.personName,
        companyId: member.company.id,
        companyName: member.company.name,
        role: member.role,
      })),
      missingBoardRolesByCompanyId: missingBoardRolesByCompanyId.map(member => ({
        personKey: member.personKey,
        personName: member.personName,
        companyId: member.company.id,
        companyName: member.company.name,
        role: member.role,
      })),
      boardRoleCompanyIdMismatches,
      boardRoleCompanyIdMismatchGroups,
      duplicateBoardRoles,
      unresolvedProfileRoles,
      profileBoardNameMismatches,
      possibleNameSplits: possibleNameSplits.map(group => ({
        key: group.key,
        persons: group.persons.map(person => ({
          personKey: person.personKey,
          name: person.name,
          roles: person.roles.length,
        })),
      })),
      interlockingDetailGaps,
      actorContactsNotOnPage,
      meetingParticipantsNotOnPage,
      communicationNamesNotOnPage,
    },
  }

  mkdirSync(dirname(REPORT_PATH), { recursive: true })
  mkdirSync(dirname(JSON_PATH), { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`)

  const report = `---
tittel: "Personer underlagskontroll - Food TG"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Kjør raadokument/NER-pass for personnavn som ikke ligger i strukturerte PersonProfile-, BoardMember- eller ActorContact-data.
relaterte_filer:
  - scripts/audit-person-underlag.ts
  - research/_status/personer-underlagskontroll-2026-04-28.json
  - src/lib/queries/persons.ts
  - src/app/personer/PersonerContent.tsx
---

# Personer underlagskontroll - Food TG

## Konklusjon

Strukturert personunderlag er representert på personsiden: alle \`${boardKeys.size}\` unike personer fra \`BoardMember\` finnes i den sammenslåtte \`/personer\`-visningen, og alle \`${boardMembers.length}\` styre-/lederroller er dekket på visningsnivå etter samme merge-logikk som appen bruker.

Tallene på personsiden er bekreftet mot forventning: \`${pageCounts.persons}\` personer, \`${pageCounts.roles}\` roller og \`${pageCounts.interlocking}\` interlocking-personer. Dette bekrefter dekning for de strukturerte underlagene, men ikke at alle personnavn som finnes i fritekst/PDF/rånotater er løftet inn. Det siste krever et eget NER-/rådokumentpass.

## Workflow-sjekk

| Gate | Status | Resultat |
|---|---:|---|
| Forventede sidetall | ${status(gates.expectedPageCounts)} | ${pageCounts.persons}/${EXPECTED_PAGE_COUNTS.persons} personer, ${pageCounts.roles}/${EXPECTED_PAGE_COUNTS.roles} roller, ${pageCounts.interlocking}/${EXPECTED_PAGE_COUNTS.interlocking} interlocking |
| Alle BoardMember-personer på siden | ${status(gates.allBoardPersonsOnPage)} | ${boardKeys.size} unike board-personer |
| Alle BoardMember-roller på siden | ${status(gates.allBoardDisplayRolesOnPage)} | ${missingBoardRolesByDisplay.length} mangler på visningsnivå |
| BoardMember-roller beholder companyId | ${warnStatus(gates.allBoardRoleCompanyIdsOnPage)} | ${missingBoardRolesByCompanyId.length} mangler på strict companyId-sjekk |
| PersonProfile roles kan parses | ${status(gates.storedRolesParse)} | ${storedRoleIssues.length} ugyldige role entries |

## Tellegrunnlag

${table([
    ['Metrikk', 'Antall', 'Notat'],
    ['PersonProfile', profiles.length, 'Manuelt eller auto-opprettet profilrad'],
    ['BoardMember', boardMembers.length, 'Rå styre-/lederroller'],
    ['Unike BoardMember-personer', boardKeys.size, 'Fallback-grunnlag for personsiden'],
    ['Personer på /personer', pageCounts.persons, 'PersonProfile + BoardMember fallback'],
    ['Roller på /personer', pageCounts.roles, 'Dedupet per person, selskap og rollelabel'],
    ['Interlocking på /personer', pageCounts.interlocking, 'Personer med mer enn én rolle'],
    ['ActorContact', actorContacts.length, 'Kontaktpersoner i actor-modellen, separat fra /personer'],
    ['Meeting', meetings.length, 'Møteunderlag med participants[]'],
  ])}

## Dekningssplit

${table([
    ['Kategori', 'Antall', 'Andel av /personer'],
    ['Profil + board-fallback', profileAndBoard.length, formatPercent(profileAndBoard.length, persons.length)],
    ['Kun PersonProfile', profileOnly.length, formatPercent(profileOnly.length, persons.length)],
    ['Kun BoardMember fallback', boardOnly.length, formatPercent(boardOnly.length, persons.length)],
    ['Kun fallback og interlocking', fallbackOnlyInterlocking.length, formatPercent(fallbackOnlyInterlocking.length, persons.length)],
  ])}

## Detaljdekning

${table([
    ['Detaljfelt', 'Dekket', 'Andel av /personer'],
    ['Biography', detailCoverage.biography, formatPercent(detailCoverage.biography, persons.length)],
    ['LinkedIn URL', detailCoverage.linkedInUrl, formatPercent(detailCoverage.linkedInUrl, persons.length)],
    ['Photo URL', detailCoverage.photoUrl, formatPercent(detailCoverage.photoUrl, persons.length)],
    ['Affiliations', detailCoverage.affiliations, formatPercent(detailCoverage.affiliations, persons.length)],
    ['Tags', detailCoverage.tags, formatPercent(detailCoverage.tags, persons.length)],
  ])}

## Funn som må håndteres

- \`${interlockingDetailGaps.length}\` interlocking-personer mangler biography og/eller affiliations. De er dekket som personer/roller, men ikke ferdig detaljerte profiler.
- \`${unresolvedProfileRoles.length}\` lagrede PersonProfile-roller mangler \`companyId\`. Dette er ikke en referansefeil, men bør ryddes der selskapet finnes i databasen.
- \`${boardRoleCompanyIdMismatches.length}\` BoardMember-roller mangler strict \`companyId\`-match i den sammenslåtte visningen. De er dekket på visningsnivå, men peker på dupliserte selskapsrader med samme navn.
- \`${duplicateBoardRoles.length}\` dupliserte BoardMember person/selskap/rolle-kombinasjoner ble funnet.
- \`${possibleNameSplits.length}\` mulige navnesplitt-grupper ble funnet med løs norsk/ascii-normalisering. Disse bør manuelt sjekkes før vi sier at persondeduplisering er helt ren.
- \`${actorContactsNotOnPage.length}\` ActorContact-navn finnes ikke på personsiden. Dette kan være riktig modellskille, men må avklares hvis /personer skal være total personkatalog.

## Eksempler til manuell sjekk

### Interlocking med detaljgap

${sample(interlockingDetailGaps, 15).map(item => `- ${item.name} (${item.personKey}) - ${item.roles} roller; mangler biography: ${item.missingBiography ? 'ja' : 'nei'}, affiliations: ${item.missingAffiliations ? 'ja' : 'nei'}`).join('\n') || '- Ingen'}

### Mulige navnesplitt

${sample(possibleNameSplits, 15).map(group => `- ${group.key}: ${group.persons.map(person => `${person.name} [${person.personKey}, ${person.roles.length} roller]`).join('; ')}`).join('\n') || '- Ingen'}

### CompanyId-avvik for board-roller

${sample(boardRoleCompanyIdMismatchGroups, 12).map(group => `- ${group.companyName}: ${group.count} roller; pageCompanyId=${group.pageCompanyId ?? 'null'}; boardCompanyId=${group.boardCompanyId}`).join('\n') || '- Ingen'}

### ActorContact ikke på /personer

${sample(actorContactsNotOnPage, 15).map(contact => `- ${contact.name}${contact.organization ? ` (${contact.organization})` : ''}${contact.role ? ` - ${contact.role}` : ''}`).join('\n') || '- Ingen'}

## Neste orkestrerte steg

1. Kjør et råkorpus-pass som aktivitet: hent personnavn-kandidater fra \`research/\`, \`docs/meetings/\`, \`docs/project/mandates/\` og PDF/OCR-tekst.
2. Fan-out per kildegruppe: selskaps-/årsrapporter, møter/transkripter, forskningsnotater og actor/outreach-dokumenter.
3. Fan-in til en kandidatkø med \`name\`, \`source_path\`, \`context\`, \`confidence\`, \`suggested_personKey\` og \`action\`.
4. Promoter bare bekreftede kandidater til \`PersonProfile\` eller \`ActorContact\`; hold resten som triage, ikke fakta.
`

  writeFileSync(REPORT_PATH, report)

  console.log('Personer underlagskontroll')
  console.log(`Persons page counts: ${pageCounts.persons} personer, ${pageCounts.roles} roller, ${pageCounts.interlocking} interlocking`)
  console.log(`Board coverage: ${missingBoardRolesByDisplay.length} missing display roles, ${missingBoardRolesByCompanyId.length} missing companyId roles, ${storedRoleIssues.length} invalid stored roles`)
  console.log(`Detail gaps: ${interlockingDetailGaps.length} interlocking rows need biography/affiliations review`)
  console.log(`Possible name splits: ${possibleNameSplits.length}`)
  console.log(`Wrote ${REPORT_PATH}`)
  console.log(`Wrote ${JSON_PATH}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
