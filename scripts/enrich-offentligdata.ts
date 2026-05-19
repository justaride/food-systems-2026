import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey } from '../src/lib/person-key.ts'
import {
  boardMemberPersonRoleKey,
  boardMemberNamesAreCompatible,
  groupBoardMembersByPersonRole,
} from '../src/lib/brreg-board-member-provenance.ts'

const BRREG_BASE_URL = 'https://data.brreg.no/enhetsregisteret/api'
const BRREG_ROLES_SOURCE_LABEL = 'Brønnøysundregistrene roller i virksomheten'
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'food-systems-2026-offentligdata-enrichment/0.1.0',
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CliOptions = {
  dryRun: boolean
  limit: number | null
  orgNrs: Set<string> | null
  companiesOnly: boolean
  actorsOnly: boolean
}

type BrregAddress = {
  adresse?: string[]
  postnummer?: string
  poststed?: string
  kommune?: string
  kommunenummer?: string
  land?: string
  landkode?: string
}

type BrregEntity = {
  organisasjonsnummer: string
  navn: string
  organisasjonsform?: {
    kode?: string
    beskrivelse?: string
  }
  naeringskode1?: {
    kode?: string
    beskrivelse?: string
  }
  antallAnsatte?: number
  harRegistrertAntallAnsatte?: boolean
  forretningsadresse?: BrregAddress
  postadresse?: BrregAddress
  hjemmeside?: string | null
  stiftelsesdato?: string
  registreringsdatoEnhetsregisteret?: string
  registrertIMvaregisteret?: boolean
  registrertIForetaksregisteret?: boolean
  sisteInnsendteAarsregnskap?: string
  konkurs?: boolean
  underAvvikling?: boolean
  underTvangsavviklingEllerTvangsopplosning?: boolean
  erIKonsern?: boolean
  kapital?: {
    belop?: number
    antallAksjer?: number
    type?: string
    valuta?: string
    innfortDato?: string
  }
  aktivitet?: string[]
  vedtektsfestetFormaal?: string[]
}

type BrregRolePerson = {
  fodselsdato?: string
  erDoed?: boolean
  navn?: {
    fornavn?: string
    mellomnavn?: string
    etternavn?: string
  }
}

type BrregRoleEntity = {
  organisasjonsnummer?: string
  organisasjonsform?: {
    kode?: string
    beskrivelse?: string
  }
  navn?: string[]
  erSlettet?: boolean
}

type BrregRole = {
  type?: {
    kode?: string
    beskrivelse?: string
  }
  fratraadt?: boolean
  avregistrert?: boolean
  rekkefolge?: number
  person?: BrregRolePerson | null
  enhet?: BrregRoleEntity | null
}

type BrregRoleGroup = {
  type?: {
    kode?: string
    beskrivelse?: string
  }
  sistEndret?: string
  roller?: BrregRole[]
}

type BrregRolesResponse = {
  rollegrupper?: BrregRoleGroup[]
}

type BrregUnderenhet = {
  organisasjonsnummer?: string
  navn?: string
  organisasjonsform?: {
    kode?: string
    beskrivelse?: string
  }
  naeringskode1?: {
    kode?: string
    beskrivelse?: string
  }
  antallAnsatte?: number
  beliggenhetsadresse?: BrregAddress
  postadresse?: BrregAddress
  telefon?: string
}

type BrregPagedResponse<T> = {
  _embedded?: Record<string, T[]>
  page?: {
    size?: number
    totalElements?: number
    totalPages?: number
    number?: number
  }
}

type SearchCandidate = {
  organisasjonsnummer?: string
  navn?: string
  organisasjonsform?: {
    kode?: string
    beskrivelse?: string
  }
  forretningsadresse?: BrregAddress
}

type ActorMatchResult = {
  status: 'matched-existing-company' | 'matched-new-company' | 'matched-metadata-only' | 'ambiguous' | 'no-match'
  query: string | null
  orgNr: string | null
  companyId: string | null
  companyName: string | null
  candidates: {
    orgNr: string | null
    name: string | null
    legalForm: string | null
  }[]
}

type PersonRole = {
  companyId?: string
  companyName: string
  role: string
  fromYear?: number
  toYear?: number
}

type JsonObject = Record<string, unknown>

function parseArgs(argv: string[]): CliOptions {
  let dryRun = false
  let limit: number | null = null
  let orgNrs: Set<string> | null = null
  let companiesOnly = false
  let actorsOnly = false

  for (const arg of argv) {
    if (arg === '--dry-run') {
      dryRun = true
      continue
    }
    if (arg === '--companies-only') {
      companiesOnly = true
      continue
    }
    if (arg === '--actors-only') {
      actorsOnly = true
      continue
    }
    if (arg.startsWith('--limit=')) {
      const value = Number(arg.slice('--limit='.length))
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --limit value: ${arg}`)
      }
      limit = Math.floor(value)
      continue
    }
    if (arg.startsWith('--orgnr=')) {
      const values = arg
        .slice('--orgnr='.length)
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)

      if (values.length === 0) {
        throw new Error('Expected at least one org number after --orgnr=')
      }
      orgNrs = new Set(values)
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (companiesOnly && actorsOnly) {
    throw new Error('Use either --companies-only or --actors-only, not both.')
  }

  return { dryRun, limit, orgNrs, companiesOnly, actorsOnly }
}

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJson<T>(path: string, query?: Record<string, string | number | undefined>, attempt = 0): Promise<T> {
  const url = new URL(path.replace(/^\//, ''), `${BRREG_BASE_URL}/`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, { headers: DEFAULT_HEADERS })
  if (!response.ok) {
    if (response.status >= 500 && attempt < 3) {
      await sleep(400 * (attempt + 1))
      return fetchJson<T>(path, query, attempt + 1)
    }
    const body = await response.text()
    const error = new Error(`BRREG ${response.status} for ${url.toString()}: ${body.slice(0, 300)}`) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const body = await response.text()
  try {
    return JSON.parse(body) as T
  } catch (error) {
    throw new Error(`Invalid JSON from BRREG for ${url.toString()}: ${body.slice(0, 300)}`, { cause: error })
  }
}

function brregRolesUrl(orgNr: string): string {
  return `${BRREG_BASE_URL}/enheter/${encodeURIComponent(orgNr)}/roller`
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' og ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLegalSuffixes(name: string): string {
  return name
    .replace(/\b(asa|as|sa|ba|da|ans|iks|nuf|sf|kf|foretak|stiftelse)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function actorSearchQueries(name: string): string[] {
  const candidates = new Set<string>()
  candidates.add(name.trim())

  const beforeSlash = name.split('/')[0]?.trim()
  if (beforeSlash) candidates.add(beforeSlash)

  const withoutParens = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
  if (withoutParens) candidates.add(withoutParens)

  const beforeDash = name.split(' - ')[0]?.trim()
  if (beforeDash) candidates.add(beforeDash)

  return [...candidates].filter(value => value.length >= 3)
}

function companyLikeActor(actorType: string): boolean {
  return new Set([
    'company',
    'corporate',
    'producer',
    'retailer',
    'cooperative',
    'biogas-operator',
    'waste-operator',
    'consulting',
    'deposit-system',
    'innovation-hub',
  ]).has(actorType)
}

function addressToLine(address?: BrregAddress | null): string | null {
  if (!address?.adresse?.length) return null
  return address.adresse.join(', ')
}

function addressToCity(address?: BrregAddress | null): string | null {
  return address?.poststed?.trim() || address?.kommune?.trim() || null
}

function yearFromDate(date?: string | null): number | null {
  if (!date || date.length < 4) return null
  const year = Number(date.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

// Bruker canonical key fra src/lib/person-key.ts som handterer ae/oe/aa
// konsistent og forhindrer at "Bjorn" og "Bjoern" og ASCII-stripping ender pa
// ulike noklder.
const normalizePersonKey = canonicalPersonKey

function buildPersonName(person?: BrregRolePerson | null): string | null {
  if (!person?.navn) return null
  const parts = [person.navn.fornavn, person.navn.mellomnavn, person.navn.etternavn].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

function mapBoardRole(groupCode: string | undefined, roleCode: string | undefined, description: string | undefined): string | null {
  if (roleCode === 'DAGL' || groupCode === 'DAGL') return 'CEO'
  if (roleCode === 'LEDE') return 'styreleder'
  if (roleCode === 'NEST') return 'nestleder'
  if (groupCode === 'STYR' || description?.toLowerCase().includes('styre')) return 'styremedlem'
  return null
}

function mergeStringArrays(existing: unknown, incoming: string[]): string[] {
  const current = Array.isArray(existing) ? existing.filter((value): value is string => typeof value === 'string') : []
  return [...new Set([...current, ...incoming].filter(Boolean))]
}

function roleKey(role: PersonRole): string {
  return [
    role.companyId ?? '',
    role.companyName,
    role.role,
    role.fromYear ?? '',
    role.toYear ?? '',
  ].join('|')
}

function mergeRoles(existing: unknown, additions: PersonRole[]): PersonRole[] {
  const current = Array.isArray(existing)
    ? existing.filter((value): value is PersonRole => typeof value === 'object' && value !== null && typeof (value as PersonRole).companyName === 'string')
    : []

  const merged = new Map<string, PersonRole>()
  for (const role of current) merged.set(roleKey(role), role)
  for (const role of additions) merged.set(roleKey(role), role)
  return [...merged.values()]
}

function asObject(value: unknown): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as JsonObject
}

function withPublicDataMetadata(existing: unknown, patch: JsonObject): JsonObject {
  const metadata = asObject(existing)
  const offentligdata = asObject(metadata.offentligdata)
  return {
    ...metadata,
    offentligdata: {
      ...offentligdata,
      ...patch,
    },
  }
}

function buildAnnualAccounts(entity: BrregEntity): JsonObject {
  return {
    latestAnnualAccountsYear: entity.sisteInnsendteAarsregnskap ?? null,
    employeeCount: entity.antallAnsatte ?? null,
    shareCapital: entity.kapital ?? null,
    registeredInBusinessRegister: entity.registrertIForetaksregisteret ?? null,
    registeredInVatRegister: entity.registrertIMvaregisteret ?? null,
  }
}

async function fetchAllUnderenheter(overordnetEnhet: string): Promise<{ totalElements: number; items: BrregUnderenhet[] }> {
  const pageSize = 100
  let page = 0
  let totalPages = 1
  let totalElements = 0
  const items: BrregUnderenhet[] = []

  while (page < totalPages) {
    let data: BrregPagedResponse<BrregUnderenhet>
    try {
      data = await fetchJson<BrregPagedResponse<BrregUnderenhet>>('/underenheter', {
        overordnetEnhet,
        size: pageSize,
        page,
      })
    } catch (error) {
      if ((error as Error & { status?: number }).status === 404) {
        return { totalElements: 0, items: [] }
      }
      throw error
    }
    const pageItems = data._embedded?.underenheter ?? []
    items.push(...pageItems)
    totalPages = data.page?.totalPages ?? (pageItems.length === 0 ? 0 : page + 1)
    totalElements = data.page?.totalElements ?? items.length
    page += 1
  }

  return { totalElements, items }
}

async function fetchRoleGroups(orgNr: string): Promise<BrregRoleGroup[]> {
  try {
    const data = await fetchJson<BrregRolesResponse>(`/enheter/${orgNr}/roller`)
    return data.rollegrupper ?? []
  } catch (error) {
    if ((error as Error & { status?: number }).status === 404) {
      return []
    }
    throw error
  }
}

async function searchEntities(companyName: string): Promise<SearchCandidate[]> {
  const data = await fetchJson<BrregPagedResponse<SearchCandidate>>('/enheter', {
    navn: companyName,
    navnMetodeForSoek: 'FORTLOEPENDE',
    size: 10,
  })
  return data._embedded?.enheter ?? []
}

async function resolveEntityFromRegistry(orgNr: string, companyName: string): Promise<{
  entity: BrregEntity
  resolvedOrgNr: string
  matchedByName: boolean
}> {
  try {
    const entity = await fetchJson<BrregEntity>(`/enheter/${orgNr}`)
    return { entity, resolvedOrgNr: orgNr, matchedByName: false }
  } catch (error) {
    const status = (error as Error & { status?: number }).status
    if (status !== 404) throw error

    const candidates = await searchEntities(companyName)
    const ranked = [...candidates].sort((left, right) => {
      return candidateScore(companyName, left.navn ?? '') - candidateScore(companyName, right.navn ?? '')
    })
    const best = ranked[0]
    const bestScore = best ? candidateScore(companyName, best.navn ?? '') : Number.POSITIVE_INFINITY
    const secondScore = ranked[1] ? candidateScore(companyName, ranked[1].navn ?? '') : Number.POSITIVE_INFINITY

    if (!best?.organisasjonsnummer || bestScore > 1 || secondScore <= bestScore) {
      throw new Error(`BRREG missing orgNr ${orgNr} for ${companyName}, and no safe fallback match was found.`)
    }

    const entity = await fetchJson<BrregEntity>(`/enheter/${best.organisasjonsnummer}`)
    return {
      entity,
      resolvedOrgNr: best.organisasjonsnummer,
      matchedByName: true,
    }
  }
}

function candidateScore(targetName: string, candidateName: string): number {
  const targetBase = stripLegalSuffixes(normalizeText(targetName))
  const candidateBase = stripLegalSuffixes(normalizeText(candidateName))
  if (!candidateBase) return 100
  if (candidateBase === targetBase) return 0
  if (candidateBase.includes(targetBase) || targetBase.includes(candidateBase)) return 1
  return 10 + Math.abs(candidateBase.length - targetBase.length)
}

function summarizeCandidates(candidates: SearchCandidate[]): ActorMatchResult['candidates'] {
  return candidates.slice(0, 5).map(candidate => ({
    orgNr: candidate.organisasjonsnummer ?? null,
    name: candidate.navn ?? null,
    legalForm: candidate.organisasjonsform?.kode ?? null,
  }))
}

async function upsertBoardMembers(
  companyId: string,
  companyName: string,
  activeOrgNr: string,
  roleGroups: BrregRoleGroup[],
  dryRun: boolean,
  syncedAt: Date,
): Promise<number> {
  const existing = await prisma.boardMember.findMany({
    where: { companyId },
    select: { id: true, personKey: true, personName: true, role: true },
  })
  const existingByKey = groupBoardMembersByPersonRole(existing)

  let inserted = 0
  let verified = 0
  for (const group of roleGroups) {
    const groupCode = group.type?.kode
    for (const role of group.roller ?? []) {
      const personName = buildPersonName(role.person)
      if (!personName) continue
      const mappedRole = mapBoardRole(groupCode, role.type?.kode, role.type?.beskrivelse)
      if (!mappedRole) continue

      const personKey = normalizePersonKey(personName)
      const dedupeKey = boardMemberPersonRoleKey(personKey, mappedRole)
      const existingMembersById = new Map(
        (existingByKey.get(dedupeKey) ?? []).map(member => [member.id, member]),
      )
      for (const member of existing) {
        if (member.role !== mappedRole) continue
        if (!boardMemberNamesAreCompatible(member.personName, personName)) continue
        existingMembersById.set(member.id, member)
      }
      const existingMembers = [...existingMembersById.values()]
      if (existingMembers.length > 0) {
        verified += existingMembers.length
        if (!dryRun) {
          await prisma.boardMember.updateMany({
            where: { id: { in: existingMembers.map(member => member.id) } },
            data: {
              source: BRREG_ROLES_SOURCE_LABEL,
              sourceUrl: brregRolesUrl(activeOrgNr),
              verifiedAt: syncedAt,
            },
          })
        }
        continue
      }

      inserted += 1
      verified += 1

      if (!dryRun) {
        await prisma.boardMember.create({
          data: {
            companyId,
            personName,
            role: mappedRole,
            personKey,
            source: BRREG_ROLES_SOURCE_LABEL,
            sourceUrl: brregRolesUrl(activeOrgNr),
            verifiedAt: syncedAt,
          },
        })
      }
    }
  }

  if (inserted > 0) {
    console.log(`    Added ${inserted} BRREG board role(s) for ${companyName}`)
  }
  if (verified > 0) {
    console.log(`    Verified ${verified} BRREG board role source(s) for ${companyName}`)
  }

  return verified
}

async function upsertPersonProfiles(companyId: string, companyName: string, roleGroups: BrregRoleGroup[], dryRun: boolean): Promise<number> {
  let touched = 0

  for (const group of roleGroups) {
    for (const role of group.roller ?? []) {
      const personName = buildPersonName(role.person)
      if (!personName) continue

      const roleLabel = role.type?.beskrivelse ?? group.type?.beskrivelse ?? 'Rolle'
      const personKey = normalizePersonKey(personName)
      const roleEntry: PersonRole = {
        companyId,
        companyName,
        role: roleLabel,
      }

      const existing = await prisma.personProfile.findUnique({
        where: { personKey },
      })

      const nextRoles = mergeRoles(existing?.roles, [roleEntry])
      const nextAffiliations = mergeStringArrays(existing?.affiliations, [companyName])
      const nextTags = mergeStringArrays(existing?.tags, ['brreg-role', normalizeText(roleLabel).replace(/\s+/g, '-')])

      const publicMetadata = {
        lastSyncedAt: new Date().toISOString(),
        companies: mergeStringArrays(asObject(existing?.metadata).companies, [companyName]),
        rolesSource: 'Brønnoysundregistrene roller i virksomheten',
      }
      const nextMetadata = withPublicDataMetadata(existing?.metadata, publicMetadata)

      touched += 1
      if (!dryRun) {
        await prisma.personProfile.upsert({
          where: { personKey },
          update: {
            name: existing?.name ?? personName,
            roles: nextRoles as unknown as object[],
            affiliations: nextAffiliations,
            tags: nextTags,
            metadata: nextMetadata,
          },
          create: {
            name: personName,
            personKey,
            roles: nextRoles as unknown as object[],
            affiliations: nextAffiliations,
            tags: nextTags,
            metadata: nextMetadata,
          },
        })
      }
    }
  }

  if (touched > 0) {
    console.log(`    Updated ${touched} person profile(s) from BRREG roles for ${companyName}`)
  }

  return touched
}

async function enrichCompanies(options: CliOptions): Promise<void> {
  const companies = await prisma.company.findMany({
    where: {
      country: 'NO',
      ...(options.orgNrs ? { orgNr: { in: [...options.orgNrs] } } : {}),
    },
    orderBy: { name: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  })

  console.log(`Enriching ${companies.length} Norwegian compan${companies.length === 1 ? 'y' : 'ies'} from BRREG`)

  for (const company of companies) {
    console.log(`  ${company.name} (${company.orgNr})`)
    try {
      const resolved = await resolveEntityFromRegistry(company.orgNr, company.name)
      const activeOrgNr = resolved.resolvedOrgNr
      const syncedAt = new Date()

      if (resolved.matchedByName && activeOrgNr !== company.orgNr) {
        const conflict = await prisma.company.findUnique({
          where: { orgNr: activeOrgNr },
          select: { id: true, name: true },
        })

        if (conflict && conflict.id !== company.id) {
          console.log(`    Duplicate target orgNr already exists on ${conflict.name} (${conflict.id}); storing conflict metadata and skipping company update`)
          const conflictMetadata = withPublicDataMetadata(company.metadata, {
            lastSyncedAt: new Date().toISOString(),
            orgNrConflict: {
              previousOrgNr: company.orgNr,
              correctedOrgNr: activeOrgNr,
              conflictingCompanyId: conflict.id,
              conflictingCompanyName: conflict.name,
              detectedAt: new Date().toISOString(),
            },
          })

          if (!options.dryRun) {
            await prisma.company.update({
              where: { id: company.id },
              data: {
                metadata: conflictMetadata,
              },
            })
          }
          continue
        }
      }

      const entity = resolved.entity
      const roleGroups = await fetchRoleGroups(activeOrgNr)
      const underenheter = await fetchAllUnderenheter(activeOrgNr)

      if (resolved.matchedByName && activeOrgNr !== company.orgNr) {
        console.log(`    Corrected orgNr ${company.orgNr} -> ${activeOrgNr} via BRREG name search`)
      }

      const nextMetadata = withPublicDataMetadata(company.metadata, {
        lastSyncedAt: new Date().toISOString(),
        source: 'Brreg Enhetsregisteret',
        lastSyncError: null,
        orgNrCorrection: resolved.matchedByName && activeOrgNr !== company.orgNr
          ? {
              previousOrgNr: company.orgNr,
              correctedOrgNr: activeOrgNr,
              correctedAt: new Date().toISOString(),
            }
          : asObject(asObject(company.metadata).offentligdata).orgNrCorrection ?? null,
        entity,
        annualAccounts: buildAnnualAccounts(entity),
        roleGroups,
        underenheter: {
          totalElements: underenheter.totalElements,
          items: underenheter.items,
        },
      })

      const updateData = {
        orgNr: activeOrgNr,
        legalForm: entity.organisasjonsform?.kode ?? company.legalForm,
        founded: yearFromDate(entity.stiftelsesdato) ?? company.founded,
        naceCode: entity.naeringskode1?.kode ?? company.naceCode,
        naceDescription: entity.naeringskode1?.beskrivelse ?? company.naceDescription,
        hqAddress: addressToLine(entity.forretningsadresse) ?? company.hqAddress,
        hqCity: addressToCity(entity.forretningsadresse) ?? company.hqCity,
        employees: entity.harRegistrertAntallAnsatte ? (entity.antallAnsatte ?? company.employees) : company.employees,
        metadata: nextMetadata,
      }

      if (!options.dryRun) {
        await prisma.company.update({
          where: { id: company.id },
          data: updateData,
        })
      }

      await upsertBoardMembers(company.id, company.name, activeOrgNr, roleGroups, options.dryRun, syncedAt)
      await upsertPersonProfiles(company.id, company.name, roleGroups, options.dryRun)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`    Skipping after BRREG error: ${message}`)
      const errorMetadata = withPublicDataMetadata(company.metadata, {
        lastSyncedAt: new Date().toISOString(),
        lastSyncError: {
          message,
          failedAt: new Date().toISOString(),
        },
      })

      if (!options.dryRun) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            metadata: errorMetadata,
          },
        })
      }
    }
  }
}

function buildCompanyIndexes(companies: { id: string; name: string; orgNr: string }[]): Map<string, { id: string; name: string; orgNr: string }[]> {
  const index = new Map<string, { id: string; name: string; orgNr: string }[]>()

  for (const company of companies) {
    const keys = new Set([
      normalizeText(company.name),
      stripLegalSuffixes(normalizeText(company.name)),
    ])

    for (const key of keys) {
      if (!key) continue
      const existing = index.get(key) ?? []
      existing.push(company)
      index.set(key, existing)
    }
  }

  return index
}

async function matchActorToRegistry(
  actor: { id: string; name: string; actorType: string; metadata: unknown },
  companyIndex: Map<string, { id: string; name: string; orgNr: string }[]>,
): Promise<ActorMatchResult> {
  const actorKeys = [
    normalizeText(actor.name),
    stripLegalSuffixes(normalizeText(actor.name)),
  ].filter(Boolean)

  for (const key of actorKeys) {
    const directMatches = companyIndex.get(key) ?? []
    if (directMatches.length === 1) {
      const match = directMatches[0]
      return {
        status: 'matched-existing-company',
        query: null,
        orgNr: match.orgNr,
        companyId: match.id,
        companyName: match.name,
        candidates: [{ orgNr: match.orgNr, name: match.name, legalForm: null }],
      }
    }
  }

  for (const query of actorSearchQueries(actor.name)) {
    const candidates = await searchEntities(query)
    if (candidates.length === 0) {
      continue
    }

    const ranked = [...candidates].sort((left, right) => {
      return candidateScore(actor.name, left.navn ?? '') - candidateScore(actor.name, right.navn ?? '')
    })

    const best = ranked[0]
    const bestName = best.navn ?? ''
    const bestScore = candidateScore(actor.name, bestName)
    const secondScore = ranked[1] ? candidateScore(actor.name, ranked[1].navn ?? '') : Number.POSITIVE_INFINITY

    if (best.organisasjonsnummer && bestScore <= 1 && secondScore > bestScore) {
      const existingCompanyCandidates = companyIndex.get(stripLegalSuffixes(normalizeText(bestName))) ?? []
      if (existingCompanyCandidates.length === 1) {
        const existingCompany = existingCompanyCandidates[0]
        return {
          status: 'matched-existing-company',
          query,
          orgNr: existingCompany.orgNr,
          companyId: existingCompany.id,
          companyName: existingCompany.name,
          candidates: summarizeCandidates(ranked),
        }
      }

      if (companyLikeActor(actor.actorType)) {
        return {
          status: 'matched-new-company',
          query,
          orgNr: best.organisasjonsnummer,
          companyId: null,
          companyName: bestName || actor.name,
          candidates: summarizeCandidates(ranked),
        }
      }

      return {
        status: 'matched-metadata-only',
        query,
        orgNr: best.organisasjonsnummer,
        companyId: null,
        companyName: bestName || actor.name,
        candidates: summarizeCandidates(ranked),
      }
    }

    return {
      status: 'ambiguous',
      query,
      orgNr: null,
      companyId: null,
      companyName: null,
      candidates: summarizeCandidates(ranked),
    }
  }

  return {
    status: 'no-match',
    query: null,
    orgNr: null,
    companyId: null,
    companyName: null,
    candidates: [],
  }
}

async function createCompanyFromBrreg(orgNr: string, fallbackName: string, dryRun: boolean): Promise<{ id: string | null; name: string; orgNr: string }> {
  const entity = await fetchJson<BrregEntity>(`/enheter/${orgNr}`)
  const existing = await prisma.company.findUnique({ where: { orgNr } })
  if (existing) {
    return { id: existing.id, name: existing.name, orgNr: existing.orgNr }
  }

  const metadata = withPublicDataMetadata(null, {
    lastSyncedAt: new Date().toISOString(),
    source: 'Brreg Enhetsregisteret',
    entity,
    annualAccounts: buildAnnualAccounts(entity),
  })

  if (dryRun) {
    return {
      id: null,
      name: entity.navn || fallbackName,
      orgNr,
    }
  }

  const created = await prisma.company.create({
    data: {
      name: entity.navn || fallbackName,
      orgNr,
      country: 'NO',
      legalForm: entity.organisasjonsform?.kode ?? null,
      founded: yearFromDate(entity.stiftelsesdato),
      naceCode: entity.naeringskode1?.kode ?? null,
      naceDescription: entity.naeringskode1?.beskrivelse ?? null,
      hqAddress: addressToLine(entity.forretningsadresse),
      hqCity: addressToCity(entity.forretningsadresse),
      employees: entity.antallAnsatte ?? null,
      ownershipType: null,
      valueChainStage: null,
      metadata,
    },
  })

  return { id: created.id, name: created.name, orgNr: created.orgNr }
}

async function enrichActors(options: CliOptions): Promise<string[]> {
  const companies = await prisma.company.findMany({
    where: { country: 'NO' },
    select: { id: true, name: true, orgNr: true },
  })
  const companyIndex = buildCompanyIndexes(companies)
  const createdOrgNrs = new Set<string>()

  const actors = await prisma.actor.findMany({
    where: {
      country: 'NO',
      companyId: null,
    },
    orderBy: { name: 'asc' },
    ...(options.limit ? { take: options.limit } : {}),
  })

  console.log(`Matching ${actors.length} Norwegian actor${actors.length === 1 ? '' : 's'} without company links`)

  for (const actor of actors) {
    console.log(`  ${actor.name}`)
    try {
      const match = await matchActorToRegistry(actor, companyIndex)
      let companyId: string | null = null

      if (match.status === 'matched-existing-company') {
        companyId = match.companyId
      } else if (match.status === 'matched-new-company' && match.orgNr) {
        const company = await createCompanyFromBrreg(match.orgNr, match.companyName ?? actor.name, options.dryRun)
        companyId = company.id
        createdOrgNrs.add(match.orgNr)
        if (company.id) {
          const keys = new Set([
            normalizeText(company.name),
            stripLegalSuffixes(normalizeText(company.name)),
          ])
          for (const key of keys) {
            if (!key) continue
            const existing = companyIndex.get(key) ?? []
            existing.push(company)
            companyIndex.set(key, existing)
          }
        }
      }

      const nextMetadata = withPublicDataMetadata(actor.metadata, {
        lastActorMatchAt: new Date().toISOString(),
        actorMatchError: null,
        actorRegistryMatch: {
          ...match,
          companyId,
        },
      })

      if (!options.dryRun) {
        await prisma.actor.update({
          where: { id: actor.id },
          data: {
            companyId,
            metadata: nextMetadata,
          },
        })
      }

      console.log(`    ${match.status}${match.orgNr ? ` -> ${match.orgNr}` : ''}${companyId ? ` (linked ${companyId})` : ''}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`    Skipping actor after BRREG error: ${message}`)
      const nextMetadata = withPublicDataMetadata(actor.metadata, {
        lastActorMatchAt: new Date().toISOString(),
        actorMatchError: {
          message,
          failedAt: new Date().toISOString(),
        },
      })

      if (!options.dryRun) {
        await prisma.actor.update({
          where: { id: actor.id },
          data: {
            metadata: nextMetadata,
          },
        })
      }
    }
  }

  return [...createdOrgNrs]
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  console.log('=== Offentligdata / BRREG enrichment ===')
  console.log(JSON.stringify(options))

  if (!options.actorsOnly) {
    await enrichCompanies(options)
  }

  let createdOrgNrs: string[] = []
  if (!options.companiesOnly) {
    createdOrgNrs = await enrichActors(options)
  }

  if (createdOrgNrs.length > 0) {
    console.log(`Running a follow-up company sync for ${createdOrgNrs.length} newly created company record(s)`)
    await enrichCompanies({
      ...options,
      companiesOnly: true,
      actorsOnly: false,
      orgNrs: new Set(createdOrgNrs),
      limit: null,
    })
  }

  console.log('=== Enrichment complete ===')
}

main()
  .catch(error => {
    console.error('Offentligdata enrichment failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
