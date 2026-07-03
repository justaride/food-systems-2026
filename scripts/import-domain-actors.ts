import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { canonicalPersonKey } from '../src/lib/person-key'
import {
  buildActorImportData,
  buildThemeTags,
  chooseActorTarget,
  nodeMetadata,
  normalizeOrgNr,
  parseAccessedAt,
  type DomainActorCsvRow,
} from './lib/domain-actor-import'

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

// Minimal RFC-4180-ish parser (quoted fields, embedded commas, "" escapes). Unngår ny dependency.
function parseCsv(text: string): DomainActorCsvRow[] {
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
    return obj as DomainActorCsvRow
  })
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

// ── Person-profiler (node_type = person) ─────────────────────────────
function buildPersonProfile(row: DomainActorCsvRow) {
  return {
    name: row.name,
    biography: row.description || undefined,
    roles: [] as object[],
    affiliations: [] as string[],
    tags: ['domene:' + row.domain, datasetTag] as string[],
    metadata: nodeMetadata(row, datasetTag),
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
  const actorNames = Array.from(new Set(actorRows.map(r => r.name).filter(Boolean)))
  const actorCountries = Array.from(new Set(actorRows.map(r => r.country || 'NO')))
  const existing = await prisma.actor.findMany({
    where: {
      OR: [
        { slug: { in: actorIds } },
        { name: { in: actorNames }, country: { in: actorCountries } },
      ],
    },
    select: { id: true, slug: true, name: true, country: true, themeTags: true, companyId: true },
  })
  const existingBySlug = new Map(existing.map(a => [a.slug, a]))
  const existingByCountryName = new Map(existing.map(a => [`${a.country}\x00${a.name}`, a]))

  const orgNrs = Array.from(new Set(actorRows.map(r => normalizeOrgNr(r.org_nr)).filter(Boolean)))
  const companies = orgNrs.length
    ? await prisma.company.findMany({
        where: { orgNr: { in: orgNrs } },
        select: { id: true, orgNr: true, name: true },
      })
    : []
  const companyByOrgNr = new Map(companies.map(c => [c.orgNr, c]))
  const companyIds = companies.map(c => c.id)
  const existingCompanyActors = companyIds.length
    ? await prisma.actor.findMany({
        where: { companyId: { in: companyIds } },
        select: { id: true, slug: true, name: true, country: true, themeTags: true, companyId: true },
      })
    : []
  const existingByCompanyId = new Map(
    existingCompanyActors
      .filter(a => a.companyId)
      .map(a => [a.companyId!, a]),
  )
  const targetByNodeId = new Map(actorRows.map(r => [
    r.node_id,
    chooseActorTarget(r, { existingBySlug, companyByOrgNr, existingByCompanyId, existingByCountryName }),
  ]))
  const resolveActorId = (nodeId: string) => targetByNodeId.get(nodeId)?.id ?? nodeId

  // Hent docSlug for scoped relasjons-slett (brukes kun om --rel er oppgitt)
  const docSlug = note?.slug ?? (noteMatch || datasetTag)
  const relationshipSource = `document:${docSlug}`

  // ── Aktører ──
  console.log('Importerer aktører...')
  let created = 0
  let enriched = 0
  for (const r of actorRows) {
    const themeTags = buildThemeTags(r, datasetTag)
    const company = companyByOrgNr.get(normalizeOrgNr(r.org_nr)) ?? null
    const prior = targetByNodeId.get(r.node_id)
    if (prior) {
      // Eksisterende kuratert aktør: additiv berikelse, ingen klobbing av kuraterte felter.
      const mergedTags = Array.from(new Set([...(prior.themeTags ?? []), ...themeTags]))
      const canSetCompanyId = company && (!prior.companyId || prior.companyId === company.id)
      await prisma.actor.update({
        where: { id: prior.id },
        data: {
          themeTags: mergedTags,
          ...(canSetCompanyId ? { companyId: company.id } : {}),
        },
      })
      enriched++
      const companySuffix = company ? ` (companyId=${company.id})` : ''
      console.log(`  ↻ [finnes] ${r.name} → ${prior.id}${companySuffix}`)
    } else {
      const data = buildActorImportData(r, { datasetTag, company })
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
