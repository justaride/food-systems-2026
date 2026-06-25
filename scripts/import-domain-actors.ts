import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey } from '../src/lib/person-key'

/**
 * Generalisert domene-importer (CLI-parameterisert, idempotent).
 *
 * Bruk:
 *   npx tsx scripts/import-domain-actors.ts \
 *     --csv=<sti-til-csv> \
 *     --dataset=<dataset-tag> \
 *     [--doc=<document-slug-fragment>] \
 *     [--rel=<sti-til-relasjoner.json>]
 *
 * CSV-skjema (15 kolonner):
 *   node_id, name, node_type, domain, subdomain, country, description,
 *   key_people, scale_metric_year, org_nr, locator_url, sourceClass,
 *   verificationStatus, confidence, accessedAt, notes
 *
 * Idempotent: upsert på Actor.id / PersonProfile.personKey; kontakter,
 * dok-refs og relasjoner slettes scoped til dette datasettet før gjenoppretting.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── CLI-arg-parsing ──────────────────────────────────────────────────
function arg(name: string, fallback?: string): string {
  const a = process.argv.find(x => x.startsWith(`--${name}=`))
  if (a) return a.slice(`--${name}=`.length)
  if (fallback !== undefined) return fallback
  throw new Error(`Mangler påkrevd argument --${name}=`)
}

const CSV_PATH = arg('csv')
const datasetTag = arg('dataset')
const noteMatch = arg('doc', '')   // tom = ingen dok-ref
const relPath = arg('rel', '')     // tom = ingen relasjoner

type CsvRow = {
  node_id: string
  name: string
  node_type: string
  domain: string
  subdomain: string
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

// Minimal RFC-4180-ish parser (quoted fields, embedded commas, "" escapes). Unngår ny dependency.
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
    // Brreg-API-lokatorer er kildehenvisning, ikke aktørens hjemmeside.
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
    dataset: datasetTag,
    nodeType: row.node_type,
    domain: row.domain,
    subdomain: row.subdomain ?? null,
    geo: row.country || 'NO',
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

// ── Person-profiler (node_type = person) ─────────────────────────────
function buildPersonProfile(row: CsvRow) {
  return {
    name: row.name,
    biography: row.description || undefined,
    roles: [] as object[],
    affiliations: [] as string[],
    tags: ['domene:' + row.domain, datasetTag] as string[],
    metadata: nodeMetadata(row),
    lastVerifiedAt: parseAccessedAt(row.accessedAt) ?? undefined,
  }
}

type Rel = { from: string; to: string; type: string; note?: string }

async function main() {
  const rows = parseCsv(readFileSync(path.resolve(CSV_PATH), 'utf8'))
  const actorRows = rows.filter(r => r.node_type !== 'person')
  const personRows = rows.filter(r => r.node_type === 'person')
  const actorIds = actorRows.map(r => r.node_id)

  console.log(`Leser ${rows.length} noder (${actorRows.length} aktører, ${personRows.length} personer)\n`)

  // Finn kunnskapsnotatet som Document (for ActorDocumentRef)
  let note: { id: string; slug: string } | null = null
  if (noteMatch) {
    note = await prisma.document.findFirst({
      where: { OR: [
        { filePath: { contains: noteMatch } },
        { slug: { contains: noteMatch } },
      ] },
      select: { id: true, slug: true },
    })
    if (!note) {
      console.warn(`  ⚠ Fant ikke kunnskapsnotatet som Document (--doc=${noteMatch}). Hopper over ActorDocumentRef.`)
    } else {
      console.log(`  Kunnskapsnotat funnet: ${note.slug}\n`)
    }
  }

  // Noen kandidat-noder finnes allerede som kuraterte maktkart-aktører (annen id, samme slug).
  // Disse skal IKKE dupliseres eller overskrives — kun lett berikes (themeTags-union + dok-ref).
  const existing = await prisma.actor.findMany({
    where: { slug: { in: actorIds } },
    select: { id: true, slug: true, themeTags: true },
  })
  const existingBySlug = new Map(existing.map(a => [a.slug, a]))
  const resolveActorId = (nodeId: string) => existingBySlug.get(nodeId)?.id ?? nodeId

  // Hent docSlug for scoped relasjons-slett (brukes kun om --rel er oppgitt)
  const docSlug = note?.slug ?? (noteMatch || datasetTag)
  const relationshipSource = `document:${docSlug}`

  // ── Aktører ──
  console.log('Importerer aktører...')
  let created = 0
  let enriched = 0
  for (const r of actorRows) {
    const themeTags = [
      'domene:' + r.domain,
      r.subdomain ? 'subdomene:' + r.subdomain : null,
      datasetTag,
    ].filter(Boolean) as string[]

    const prior = existingBySlug.get(r.node_id)
    if (prior) {
      // Eksisterende kuratert aktør: additiv berikelse, ingen klobbing av kuraterte felter.
      const mergedTags = Array.from(new Set([...(prior.themeTags ?? []), ...themeTags]))
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
        themeTags,
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
        data: { actorId, documentId: note.id, context: `${datasetTag} kartlegging` },
      })
    }
  }
  console.log(`  (${created} nye, ${enriched} eksisterende beriket)`)

  // ── Personer ──
  if (personRows.length > 0) {
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
  }

  // ── Relasjoner ── (scoped slett + gjenopprett — idempotent)
  if (relPath) {
    console.log('\nImporterer aktør-relasjoner...')
    const RELATIONSHIPS: Rel[] = JSON.parse(readFileSync(path.resolve(relPath), 'utf8'))
    await prisma.actorRelationship.deleteMany({ where: { source: relationshipSource } })
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
          source: relationshipSource,
          metadata: { sourceType: 'curated_research_node_relationship', dataset: datasetTag },
        },
      })
      relCount++
    }
    console.log(`  ${relCount} relasjoner importert`)
    console.log(`\nFerdig: ${actorRows.length} aktører, ${personRows.length} personer, ${relCount} relasjoner.`)
  } else {
    console.log(`\nFerdig: ${actorRows.length} aktører, ${personRows.length} personer (ingen relasjoner — --rel ikke oppgitt).`)
  }
}

main()
  .catch((e) => { console.error('Import failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
