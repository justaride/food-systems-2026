import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey } from '../src/lib/person-key'

/**
 * Import av regenerativ/permakultur/lokalmat-kartleggingen (NO + Norden, 2026-06-19).
 *
 * Kilde: research/_status/regenerativ-permakultur-lokalmat-node-kandidater-2026-06-19.csv
 * Kunnskapsnotat: research/bibliotek/regenerativ-permakultur-lokalmat-norge-kartlegging-2026-06-19.md
 *
 * - node_type=person (Stephen Barstow, Andrew McMillion) -> PersonProfile (personKey)
 * - alle andre noder -> Actor (slug = node_id), m/ ActorContact for key_people,
 *   ActorDocumentRef til kunnskapsnotatet, og ActorRelationship-koblinger (§3 i handover).
 * - verificationStatus/sourceClass/confidence/locator bevares paa Actor.verificationStatus,
 *   Actor.metadata og Actor.notes — disputed-noder importeres EKSPLISITT som disputed.
 *
 * Idempotent: upsert paa Actor.id / PersonProfile.personKey; kontakter, dok-refs og
 * relasjoner slettes scoped til dette datasettet for de gjenopprettes.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const CSV_PATH = 'research/_status/regenerativ-permakultur-lokalmat-node-kandidater-2026-06-19.csv'
const NOTE_FILE_MATCH = 'regenerativ-permakultur-lokalmat-norge-kartlegging'
const DATASET_TAG = 'regenerativ-lokalmat-kartlegging-2026-06-19'
// Relasjonene er utledet av syntese-notatet; pek source dit som direkte lokator (document:<slug>).
const RELATIONSHIP_SOURCE = 'document:bibliotek/regenerativ-permakultur-lokalmat-norge-kartlegging-2026-06-19'

type CsvRow = {
  node_id: string
  name: string
  node_type: string
  domain: string
  country: string
  description: string
  key_people: string
  scale_metric_year: string
  org_nr: string
  locator_url: string
  sourceClass: string
  verificationStatus: string
  confidence: string
  accessedAt: string
  notes: string
}

// Minimal RFC-4180-ish parser (quoted fields, embedded commas, "" escapes). Unngaar ny dependency.
function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = []
  let field = ''
  let record: string[] = []
  let inQuotes = false
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      record.push(field); field = ''
    } else if (ch === '\n') {
      record.push(field); field = ''
      if (record.some(c => c.length > 0)) rows.push(record)
      record = []
    } else {
      field += ch
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field)
    if (record.some(c => c.length > 0)) rows.push(record)
  }

  const header = rows.shift()
  if (!header) return []
  return rows.map(cols => {
    const obj: Record<string, string> = {}
    header.forEach((key, idx) => { obj[key.trim()] = (cols[idx] ?? '').trim() })
    return obj as CsvRow
  })
}

const ACTOR_TYPE_BY_NODE_TYPE: Record<string, string> = {
  organisasjon: 'organization',
  nettverk: 'network',
  gaard: 'farm',
  institusjon: 'institution',
  prosjekt: 'project',
  ordning: 'public-scheme',
}

function mapActorType(nodeType: string): string {
  return ACTOR_TYPE_BY_NODE_TYPE[nodeType] ?? 'organization'
}

// "Maria Gjoelberg (leder); Anders Lerberg Kopstad (nestleder)" -> [{name, role}]
function parseKeyPeople(raw: string): { name: string; role?: string }[] {
  if (!raw) return []
  return raw.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const m = part.match(/^(.*?)\s*\(([^)]*)\)\s*$/)
    if (m) return { name: m[1].trim(), role: m[2].trim() || undefined }
    return { name: part }
  })
}

function websiteFrom(locator: string): string | null {
  if (!locator) return null
  try {
    const host = new URL(locator).hostname
    // Brreg-API-lokatorer er kildehenvisning, ikke aktorens hjemmeside.
    if (host === 'data.brreg.no') return null
    return locator
  } catch {
    return null
  }
}

function parseAccessedAt(value: string): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function nodeMetadata(row: CsvRow): Record<string, unknown> {
  return {
    dataset: DATASET_TAG,
    nodeType: row.node_type,
    domain: row.domain,
    sourceClass: row.sourceClass || null,
    verificationStatus: row.verificationStatus || null,
    confidence: row.confidence || null,
    locatorUrl: row.locator_url || null,
    accessedAt: row.accessedAt || null,
    orgNr: row.org_nr || null,
    keyPeople: row.key_people || null,
    scaleMetricYear: row.scale_metric_year || null,
  }
}

// ── Person-profiler (node_type = person) ────────────────────────────
function buildPersonProfile(row: CsvRow) {
  const base = {
    name: row.name,
    biography: row.description || undefined,
    metadata: nodeMetadata(row),
    lastVerifiedAt: parseAccessedAt(row.accessedAt) ?? undefined,
  }
  if (row.node_id === 'stephen-barstow') {
    return {
      ...base,
      roles: [{ companyName: 'KVANN (Norwegian Seed Savers)', role: 'tidl. styreleder' }],
      affiliations: ['KVANN', 'Norwegian Seed Savers'],
      tags: ['permakultur', 'edible-perennials', 'edimentals', 'flerårige', DATASET_TAG],
    }
  }
  if (row.node_id === 'andrew-mcmillion') {
    return {
      ...base,
      roles: [
        { companyName: 'KVANN (Norwegian Seed Savers)', role: 'styremedlem' },
        { companyName: "Let's Liberate Diversity", role: 'styremedlem' },
        { companyName: 'Norwegian Seed Savers', role: 'frøsamler' },
        { companyName: 'Gjøding gård (Hurdal)', role: 'driver', fromYear: 2025 },
      ],
      affiliations: ['KVANN', 'Gjøding gård', 'Norwegian Seed Savers'],
      tags: ['permakultur', 'frøbevaring', 'regenerativ', 'agroforestry', DATASET_TAG],
    }
  }
  return { ...base, roles: [], affiliations: [], tags: [DATASET_TAG] }
}

// ── Aktor-relasjoner (§3 handover) — KUN aktor↔aktor (personer dekkes av PersonProfile.roles) ──
type Rel = { from: string; to: string; type: string; note?: string }
const RELATIONSHIPS: Rel[] = [
  { from: 'kvann', to: 'solhatt', type: 'affiliation', note: 'KVANN-nettverk / frøleverandør' },
  { from: 'kvann', to: 'schubelers-hager', type: 'operates', note: 'KVANN drifter Schübelers hager' },
  { from: 'kvann', to: 'fra-froe-til-fat', type: 'partner', note: 'Nordisk frøsamarbeid' },
  { from: 'kvann', to: 'multistrata-gjoeding', type: 'partner', note: 'Norsk deltakelse i piloten via KVANN (disputed EU-status)' },
  { from: 'reko-norge', to: 'nbs-lokalmat', type: 'spun_off_from', note: 'REKO Norge overtok koordineringsrollen fra NBS' },
  { from: 'regenerativt-norge', to: 'holistic-management-no', type: 'network', note: 'Holistic Management / Savory-aksen' },
  { from: 'regenerativt-norge', to: 'holistic-management-sverige', type: 'network', note: 'Savory-hub Norden' },
  { from: 'regenerativt-norge', to: 'regenerativt-sverige', type: 'sister_org', note: 'Søsterorganisasjon' },
  { from: 'regenerativt-norge', to: 'regenerativt-jordbrug-dk', type: 'sister_org', note: 'Søsterbevegelse DK' },
  { from: 'lets-liberate-diversity', to: 'kvann', type: 'member', note: 'Nordisk medlem' },
  { from: 'lets-liberate-diversity', to: 'sesam', type: 'member', note: 'Nordisk medlem' },
  { from: 'lets-liberate-diversity', to: 'froesamlerne-dk', type: 'member', note: 'Nordisk medlem' },
  { from: 'fra-froe-til-fat', to: 'sesam', type: 'partner', note: 'Frøsamarbeid KVANN+SESAM+Frøsamlerne' },
  { from: 'fra-froe-til-fat', to: 'froesamlerne-dk', type: 'partner', note: 'Frøsamarbeid KVANN+SESAM+Frøsamlerne' },
  { from: 'hurdal-klynge', to: 'multistrata-gjoeding', type: 'contains', note: 'Geografisk syntese-node' },
  { from: 'hurdal-klynge', to: 'kvann', type: 'contains', note: 'Geografisk syntese-node' },
]

async function main() {
  const rows = parseCsv(readFileSync(path.resolve(CSV_PATH), 'utf8'))
  const actorRows = rows.filter(r => r.node_type !== 'person')
  const personRows = rows.filter(r => r.node_type === 'person')
  const actorIds = actorRows.map(r => r.node_id)

  console.log(`Leser ${rows.length} noder (${actorRows.length} aktører, ${personRows.length} personer)\n`)

  // Finn kunnskapsnotatet som Document (for ActorDocumentRef)
  const note = await prisma.document.findFirst({
    where: { OR: [
      { filePath: { contains: NOTE_FILE_MATCH } },
      { slug: { contains: NOTE_FILE_MATCH } },
    ] },
    select: { id: true, slug: true },
  })
  if (!note) {
    console.warn(`  ⚠ Fant ikke kunnskapsnotatet som Document (kjør "npm run db:import:docs"). Hopper over ActorDocumentRef.`)
  } else {
    console.log(`  Kunnskapsnotat funnet: ${note.slug}\n`)
  }

  // Noen kandidat-noder finnes allerede som kuraterte maktkart-aktører (annen id, samme slug).
  // Disse skal IKKE dupliseres eller overskrives — kun lett berikes (themeTags-union + dok-ref).
  const existing = await prisma.actor.findMany({
    where: { slug: { in: actorIds } },
    select: { id: true, slug: true, themeTags: true },
  })
  const existingBySlug = new Map(existing.map(a => [a.slug, a]))
  const resolveActorId = (nodeId: string) => existingBySlug.get(nodeId)?.id ?? nodeId

  // ── Aktører ──
  console.log('Importerer aktører...')
  let created = 0
  let enriched = 0
  for (const r of actorRows) {
    const prior = existingBySlug.get(r.node_id)
    if (prior) {
      // Eksisterende kuratert aktør: additiv berikelse, ingen klobbing av kuraterte felter.
      const mergedTags = Array.from(new Set([...(prior.themeTags ?? []), r.domain, DATASET_TAG].filter(Boolean)))
      await prisma.actor.update({ where: { id: prior.id }, data: { themeTags: mergedTags } })
      enriched++
      console.log(`  ↻ [finnes] ${r.name} → ${prior.id}`)
    } else {
      const data = {
        slug: r.node_id,
        name: r.name,
        actorType: mapActorType(r.node_type),
        country: r.country || 'NO',
        roleSummary: r.description || r.name,
        website: websiteFrom(r.locator_url),
        themeTags: [r.domain, DATASET_TAG].filter(Boolean),
        notes: r.notes || null,
        verificationStatus: r.verificationStatus || null,
        lastVerifiedAt: parseAccessedAt(r.accessedAt),
        metadata: nodeMetadata(r),
      }
      await prisma.actor.upsert({
        where: { id: r.node_id },
        update: data,
        create: { id: r.node_id, ...data },
      })
      created++

      // Kontaktpersoner (kun for nye noder — ikke rør kuraterte aktørers kontakter)
      await prisma.actorContact.deleteMany({ where: { actorId: r.node_id } })
      const people = parseKeyPeople(r.key_people)
      if (people.length) {
        await prisma.actorContact.createMany({
          data: people.map(p => ({ actorId: r.node_id, name: p.name, role: p.role ?? null })),
        })
      }
      console.log(`  ${r.verificationStatus === 'disputed' ? '⚠ [disputed] ' : '+ '}${r.name}`)
    }

    // Dok-ref til kunnskapsnotatet (idempotent, for både nye og eksisterende)
    if (note) {
      const actorId = resolveActorId(r.node_id)
      await prisma.actorDocumentRef.deleteMany({ where: { actorId, documentId: note.id } })
      await prisma.actorDocumentRef.create({
        data: { actorId, documentId: note.id, context: 'regenerativ/permakultur/lokalmat-kartlegging 2026-06-19' },
      })
    }
  }
  console.log(`  (${created} nye, ${enriched} eksisterende beriket)`)

  // ── Personer ──
  console.log('\nImporterer personprofiler...')
  for (const r of personRows) {
    const personKey = canonicalPersonKey(r.name)
    const profile = buildPersonProfile(r)
    await prisma.personProfile.upsert({
      where: { personKey },
      update: profile,
      create: { personKey, ...profile },
    })
    console.log(`  ${r.name} (${personKey})`)
  }

  // ── Relasjoner ── (scoped slett + gjenopprett — idempotent)
  console.log('\nImporterer aktør-relasjoner...')
  await prisma.actorRelationship.deleteMany({ where: { source: RELATIONSHIP_SOURCE } })
  const presentIds = new Set(actorIds)
  let relCount = 0
  for (const rel of RELATIONSHIPS) {
    if (!presentIds.has(rel.from) || !presentIds.has(rel.to)) {
      console.warn(`  ⚠ Hopper over relasjon ${rel.from} → ${rel.to} (mangler endepunkt)`)
      continue
    }
    await prisma.actorRelationship.create({
      data: {
        fromActorId: resolveActorId(rel.from),
        toActorId: resolveActorId(rel.to),
        relationType: rel.type,
        note: rel.note ?? null,
        source: RELATIONSHIP_SOURCE,
        metadata: { sourceType: 'curated_research_node_relationship', dataset: DATASET_TAG },
      },
    })
    relCount++
  }
  console.log(`  ${relCount} relasjoner importert`)

  console.log(`\nFerdig: ${actorRows.length} aktører, ${personRows.length} personer, ${relCount} relasjoner.`)
}

main()
  .catch((e) => { console.error('Import failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
