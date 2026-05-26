/**
 * Konsoliderer historiske BoardMember- og PersonProfile-rader sa alle peker
 * pa samme `personKey` for samme person. Adresser navnesplitt-grupper som
 * "arne-mgster" / "arne-m-gster" / "arne-moegster" → alle blir til
 * "arne-mogster" via canonicalPersonKey().
 *
 * Bruk:
 *   npx tsx scripts/dedupe-person-keys.ts                # dry-run (default)
 *   npx tsx scripts/dedupe-person-keys.ts --commit       # skriv til DB
 *   npx tsx scripts/dedupe-person-keys.ts --commit --limit 5  # bare 5 grupper
 */

import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey, pickCanonicalName } from '../src/lib/person-key.ts'
import { isSafeAutomaticPersonDuplicateMerge } from '../src/lib/person-duplicate-triage.ts'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const REPORT_JSON = 'research/_status/dedupe-person-keys-2026-04-28.json'
const REPORT_MD = 'docs/project/mandates/dedupe-person-keys-food-tg-2026-04-28.md'

type CliOptions = {
  commit: boolean
  limit: number | null
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { commit: false, limit: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--commit') opts.commit = true
    else if (arg === '--limit') {
      const value = argv[++i]
      if (!value || Number.isNaN(Number(value))) throw new Error('--limit requires a number')
      opts.limit = Number(value)
    } else if (arg === '--dry-run') opts.commit = false
    else if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`)
  }
  return opts
}

type ProfileRoleEntry = {
  companyId?: string | null
  companyName?: string
  role?: string
  fromYear?: number | null
  toYear?: number | null
}

function roleMergeKey(entry: ProfileRoleEntry) {
  const company = (entry.companyName ?? '').trim().toLowerCase()
  const role = (entry.role ?? '').trim().toLowerCase()
  return `${company}::${role}`
}

function mergeProfileRoles(rolesArrays: unknown[][]): unknown[] {
  const merged = new Map<string, ProfileRoleEntry>()
  for (const arr of rolesArrays) {
    for (const raw of arr) {
      if (!raw || typeof raw !== 'object') continue
      const entry = raw as ProfileRoleEntry
      const key = roleMergeKey(entry)
      if (!key.startsWith('::')) {
        const existing = merged.get(key)
        if (!existing) {
          merged.set(key, { ...entry })
        } else {
          merged.set(key, {
            companyId: entry.companyId ?? existing.companyId ?? null,
            companyName: existing.companyName || entry.companyName,
            role: existing.role || entry.role,
            fromYear: existing.fromYear ?? entry.fromYear ?? null,
            toYear: existing.toYear ?? entry.toYear ?? null,
          })
        }
      }
    }
  }
  return [...merged.values()]
}

function mergeStringArrays(...arrays: (string[] | null | undefined)[]): string[] {
  const set = new Set<string>()
  for (const arr of arrays) {
    if (!arr) continue
    for (const s of arr) {
      const trimmed = s.trim()
      if (trimmed) set.add(trimmed)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'nb'))
}

function mergeMetadata(items: (Record<string, unknown> | null | undefined)[]): Record<string, unknown> | null {
  const merged: Record<string, unknown> = {}
  let hasAny = false
  for (const item of items) {
    if (!item) continue
    hasAny = true
    Object.assign(merged, item)
  }
  return hasAny ? merged : null
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const generatedDateOslo = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
  }).format(new Date())
  console.log(`mode: ${opts.commit ? 'COMMIT (will write to DB)' : 'DRY-RUN'}${opts.limit ? `, limit ${opts.limit}` : ''}`)

  const [profiles, boardMembers] = await Promise.all([
    prisma.personProfile.findMany(),
    prisma.boardMember.findMany({ select: { id: true, personKey: true, personName: true, companyId: true } }),
  ])

  console.log(`loaded: ${profiles.length} PersonProfile, ${boardMembers.length} BoardMember`)

  // -------- Compute canonical key for every row --------
  type ProfileRow = (typeof profiles)[number] & { newKey: string }
  type BoardRow = (typeof boardMembers)[number] & { newKey: string }

  const profileRows: ProfileRow[] = profiles.map((p) => ({
    ...p,
    newKey: canonicalPersonKey(p.name),
  }))
  const boardRows: BoardRow[] = boardMembers.map((m) => ({
    ...m,
    newKey: canonicalPersonKey(m.personName),
  }))

  // -------- Group by newKey --------
  const profilesByNewKey = new Map<string, ProfileRow[]>()
  for (const row of profileRows) {
    const arr = profilesByNewKey.get(row.newKey) ?? []
    arr.push(row)
    profilesByNewKey.set(row.newKey, arr)
  }

  const boardByNewKey = new Map<string, BoardRow[]>()
  for (const row of boardRows) {
    const arr = boardByNewKey.get(row.newKey) ?? []
    arr.push(row)
    boardByNewKey.set(row.newKey, arr)
  }

  // -------- Identify groups that need consolidation --------
  // A group needs work if: 2+ distinct existing personKeys map to the same newKey,
  // OR a row's existing personKey != newKey (orphan that needs renaming).
  const allNewKeys = new Set([
    ...profilesByNewKey.keys(),
    ...boardByNewKey.keys(),
  ])

  type GroupAction = {
    newKey: string
    canonicalName: string
    profileWinner: ProfileRow | null
    profileLosers: ProfileRow[]
    boardKeyChanges: BoardRow[]
    profileKeyChanges: ProfileRow[]
    sourceKeys: string[]
    boardMemberCount: number
  }

  const actions: GroupAction[] = []
  const skippedUnsafeProfileMerges: Array<{
    newKey: string
    canonicalName: string
    profileIds: string[]
    sourceKeys: string[]
  }> = []
  for (const newKey of allNewKeys) {
    const profilesInGroup = profilesByNewKey.get(newKey) ?? []
    const boardInGroup = boardByNewKey.get(newKey) ?? []

    const sourceKeys = new Set<string>([
      ...profilesInGroup.map((p) => p.personKey),
      ...boardInGroup.map((b) => b.personKey),
    ])

    const profileNeedsMerge = profilesInGroup.length > 1
    const profileNeedsRekey = profilesInGroup.some((p) => p.personKey !== newKey)
    const boardNeedsRekey = boardInGroup.some((b) => b.personKey !== newKey)

    if (!profileNeedsMerge && !profileNeedsRekey && !boardNeedsRekey) continue

    const namesPool = [
      ...profilesInGroup.map((p) => p.name),
      ...boardInGroup.map((b) => b.personName),
    ]
    const canonicalName = pickCanonicalName(namesPool)

    if (
      profileNeedsMerge &&
      !isSafeAutomaticPersonDuplicateMerge(
        {
          key: newKey,
          label: canonicalName,
          ids: profilesInGroup.map((p) => p.id),
        },
        profilesInGroup,
      )
    ) {
      skippedUnsafeProfileMerges.push({
        newKey,
        canonicalName,
        profileIds: profilesInGroup.map((p) => p.id),
        sourceKeys: [...sourceKeys].sort(),
      })
      continue
    }

    const profileWinner = profilesInGroup.length > 0
      ? [...profilesInGroup].sort((a, b) => {
          const aRoles = Array.isArray(a.roles) ? a.roles.length : 0
          const bRoles = Array.isArray(b.roles) ? b.roles.length : 0
          if (aRoles !== bRoles) return bRoles - aRoles
          // tie-breaker: prefer one whose existing key matches newKey
          if (a.personKey === newKey && b.personKey !== newKey) return -1
          if (b.personKey === newKey && a.personKey !== newKey) return 1
          return 0
        })[0]
      : null

    const profileLosers = profileWinner
      ? profilesInGroup.filter((p) => p.id !== profileWinner.id)
      : []

    const boardKeyChanges = boardInGroup.filter((b) => b.personKey !== newKey)
    const profileKeyChanges = profileWinner && profileWinner.personKey !== newKey
      ? [profileWinner]
      : []

    actions.push({
      newKey,
      canonicalName,
      profileWinner,
      profileLosers,
      boardKeyChanges,
      profileKeyChanges,
      sourceKeys: [...sourceKeys].sort(),
      boardMemberCount: boardInGroup.length,
    })
  }

  // sort: most BoardMember rows first (biggest impact), then most source keys
  actions.sort((a, b) => {
    if (b.boardMemberCount !== a.boardMemberCount) return b.boardMemberCount - a.boardMemberCount
    return b.sourceKeys.length - a.sourceKeys.length
  })

  console.log(`groups requiring action: ${actions.length}`)
  console.log(`  with 2+ source keys: ${actions.filter((a) => a.sourceKeys.length > 1).length}`)
  console.log(`  with profile merges: ${actions.filter((a) => a.profileLosers.length > 0).length}`)

  const limited = opts.limit ? actions.slice(0, opts.limit) : actions

  // -------- Execute / dry-run --------
  let profilesDeleted = 0
  let profilesUpdated = 0
  let boardUpdated = 0

  for (const action of limited) {
    if (action.profileWinner && action.profileLosers.length > 0) {
      const winner = action.profileWinner
      const allRolesArrays = [winner.roles as unknown[], ...action.profileLosers.map((l) => l.roles as unknown[])]
      const mergedRoles = mergeProfileRoles(allRolesArrays)
      const mergedAffiliations = mergeStringArrays(winner.affiliations, ...action.profileLosers.map((l) => l.affiliations))
      const mergedTags = mergeStringArrays(winner.tags, ...action.profileLosers.map((l) => l.tags))
      const mergedBio = winner.biography ?? action.profileLosers.find((l) => l.biography)?.biography ?? null
      const mergedLinkedIn = winner.linkedInUrl ?? action.profileLosers.find((l) => l.linkedInUrl)?.linkedInUrl ?? null
      const mergedPhoto = winner.photoUrl ?? action.profileLosers.find((l) => l.photoUrl)?.photoUrl ?? null
      const mergedMetadata = mergeMetadata([
        winner.metadata as Record<string, unknown> | null,
        ...action.profileLosers.map((l) => l.metadata as Record<string, unknown> | null),
      ])

      if (opts.commit) {
        await prisma.personProfile.deleteMany({
          where: { id: { in: action.profileLosers.map((l) => l.id) } },
        })
        profilesDeleted += action.profileLosers.length

        await prisma.personProfile.update({
          where: { id: winner.id },
          data: {
            personKey: action.newKey,
            name: action.canonicalName,
            roles: mergedRoles as never,
            biography: mergedBio,
            linkedInUrl: mergedLinkedIn,
            photoUrl: mergedPhoto,
            affiliations: mergedAffiliations,
            tags: mergedTags,
            metadata: mergedMetadata as never,
          },
        })
        profilesUpdated += 1
      } else {
        profilesDeleted += action.profileLosers.length
        profilesUpdated += 1
      }
    } else if (action.profileKeyChanges.length > 0) {
      const winner = action.profileKeyChanges[0]
      if (opts.commit) {
        await prisma.personProfile.update({
          where: { id: winner.id },
          data: { personKey: action.newKey, name: action.canonicalName },
        })
      }
      profilesUpdated += 1
    }

    if (action.boardKeyChanges.length > 0) {
      if (opts.commit) {
        const result = await prisma.boardMember.updateMany({
          where: { id: { in: action.boardKeyChanges.map((b) => b.id) } },
          data: { personKey: action.newKey, personName: action.canonicalName },
        })
        boardUpdated += result.count
      } else {
        boardUpdated += action.boardKeyChanges.length
      }
    }
  }

  // -------- Pass 2: remove duplicate (personKey, companyId, role) tripletter --------
  // Etter re-noeklingen kan to tidligere distinkte BoardMember-rader (eks.
  // bj-rn-strand/bjrn-strand som styreleder i SalMar) na ha samme triplett.
  let boardTripletDuplicatesDeleted = 0
  const postRekeyMembers = await prisma.boardMember.findMany({
    select: { id: true, personKey: true, companyId: true, role: true },
    orderBy: { id: 'asc' },
  })
  const tripletGroups = new Map<string, string[]>()
  for (const m of postRekeyMembers) {
    const k = `${m.personKey}::${m.companyId}::${m.role.trim().toLowerCase()}`
    const arr = tripletGroups.get(k) ?? []
    arr.push(m.id)
    tripletGroups.set(k, arr)
  }
  const tripletDuplicateIds: string[] = []
  for (const ids of tripletGroups.values()) {
    if (ids.length <= 1) continue
    // keep first (lowest id), delete rest
    tripletDuplicateIds.push(...ids.slice(1))
  }
  if (tripletDuplicateIds.length > 0) {
    if (opts.commit) {
      const result = await prisma.boardMember.deleteMany({
        where: { id: { in: tripletDuplicateIds } },
      })
      boardTripletDuplicatesDeleted = result.count
    } else {
      boardTripletDuplicatesDeleted = tripletDuplicateIds.length
    }
  }
  console.log(`  BoardMember triplet duplicates removed: ${boardTripletDuplicatesDeleted}`)

  // -------- Write report --------
  const report = {
    generatedAt: new Date().toISOString(),
    mode: opts.commit ? 'commit' : 'dry-run',
    limit: opts.limit,
    counts: {
      personProfileLoaded: profiles.length,
      boardMemberLoaded: boardMembers.length,
      groupsTotal: actions.length,
      groupsRunInThisPass: limited.length,
      groupsWithMultipleSourceKeys: actions.filter((a) => a.sourceKeys.length > 1).length,
      unsafeProfileMergeGroupsSkipped: skippedUnsafeProfileMerges.length,
      profileLosersDeleted: profilesDeleted,
      profileWinnersUpdated: profilesUpdated,
      boardMembersRekeyed: boardUpdated,
      boardTripletDuplicatesDeleted,
    },
    actions: limited.map((a) => ({
      newKey: a.newKey,
      canonicalName: a.canonicalName,
      sourceKeys: a.sourceKeys,
      boardMemberCount: a.boardMemberCount,
      profileLosers: a.profileLosers.map((l) => ({ id: l.id, personKey: l.personKey, name: l.name })),
      profileWinner: a.profileWinner ? { id: a.profileWinner.id, personKey: a.profileWinner.personKey, name: a.profileWinner.name } : null,
      boardKeyChanges: a.boardKeyChanges.map((b) => ({ id: b.id, oldKey: b.personKey, oldName: b.personName })),
    })),
    skippedUnsafeProfileMerges,
  }

  mkdirSync(dirname(REPORT_JSON), { recursive: true })
  writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`)

  const md = `---
tittel: "Personer dedup - Food TG"
status: ${opts.commit ? 'Utført' : 'Dry-run'}
eier: Gabriel
sist_oppdatert: ${generatedDateOslo}
relaterte_filer:
  - scripts/dedupe-person-keys.ts
  - src/lib/person-key.ts
  - ${REPORT_JSON}
---

# Personer dedup - Food TG

Modus: \`${report.mode}\`${opts.limit ? `, begrenset til ${opts.limit} grupper` : ''}.

## Tellegrunnlag

| Metrikk | Antall |
| --- | --- |
| PersonProfile lastet | ${report.counts.personProfileLoaded} |
| BoardMember lastet | ${report.counts.boardMemberLoaded} |
| Grupper som krever endring | ${report.counts.groupsTotal} |
| Med 2+ kilde-personKey | ${report.counts.groupsWithMultipleSourceKeys} |
| Usikre profile-merge-grupper holdt igjen | ${report.counts.unsafeProfileMergeGroupsSkipped} |
| PersonProfile-tapere som slettes | ${report.counts.profileLosersDeleted} |
| PersonProfile-vinnere som oppdateres | ${report.counts.profileWinnersUpdated} |
| BoardMember-rader som re-nokles | ${report.counts.boardMembersRekeyed} |

## Top-20 grupper etter BoardMember-impact

${limited.slice(0, 20).map((a, i) => {
    const sources = a.sourceKeys.map((k) => `\`${k}\``).join(', ')
    return `${i + 1}. **${a.canonicalName}** → \`${a.newKey}\` (${a.boardMemberCount} BoardMember; kilder: ${sources})`
  }).join('\n')}
`

  mkdirSync(dirname(REPORT_MD), { recursive: true })
  writeFileSync(REPORT_MD, md)

  console.log(`\nresult:`)
  console.log(`  PersonProfile losers deleted: ${profilesDeleted}`)
  console.log(`  PersonProfile winners updated: ${profilesUpdated}`)
  console.log(`  BoardMember rows re-keyed: ${boardUpdated}`)
  console.log(`\nwrote ${REPORT_JSON}`)
  console.log(`wrote ${REPORT_MD}`)

  if (!opts.commit) {
    console.log(`\nDRY-RUN — ingen endringer gjort. Kjor med --commit for a oppdatere DB.`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
