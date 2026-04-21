import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const actorsPath = join(process.cwd(), 'src/lib/data/actors.ts')
const intakePath = join(process.cwd(), 'research/intake/perplexity-2026-04-20/new-actors.json')

const newActors: any[] = JSON.parse(readFileSync(intakePath, 'utf-8'))
const actorsFile = readFileSync(actorsPath, 'utf-8')

// Extract existing actor IDs to dedup
const existingIds = new Set<string>()
const idRegex = /id:\s*'(actor-[^']+)'/g
let match
while ((match = idRegex.exec(actorsFile)) !== null) {
  existingIds.add(match[1])
}

const toAdd = newActors.filter(a => !existingIds.has(a.id))
const skipped = newActors.filter(a => existingIds.has(a.id))

if (skipped.length > 0) {
  console.log(`Skipping ${skipped.length} duplicates: ${skipped.map(a => a.id).join(', ')}`)
}

if (toAdd.length === 0) {
  console.log('No new actors to add.')
  process.exit(0)
}

// Generate TypeScript entries
const tsEntries = toAdd.map(a => {
  const lines = [
    `  {`,
    `    id: '${a.id}',`,
    `    slug: '${a.slug}',`,
    `    name: '${a.name.replace(/'/g, "\\'")}',`,
    `    actorType: '${a.actorType}',`,
  ]
  if (a.organizationType) lines.push(`    organizationType: '${a.organizationType}',`)
  if (a.country) lines.push(`    country: '${a.country}',`)
  lines.push(`    roleSummary: '${a.roleSummary.replace(/'/g, "\\'")}',`)
  if (a.currentRelevance) lines.push(`    currentRelevance: '${a.currentRelevance.replace(/'/g, "\\'")}',`)
  if (a.website) lines.push(`    website: '${a.website}',`)
  lines.push(`    currentStance: '${a.currentStance || 'unknown'}',`)
  if (a.themeTags?.length) lines.push(`    themeTags: [${a.themeTags.map((t: string) => `'${t}'`).join(', ')}],`)
  if (a.notes) lines.push(`    notes: '${a.notes.replace(/'/g, "\\'")}',`)
  lines.push(`  },`)
  return lines.join('\n')
}).join('\n\n')

const block = `\n  // --- Perplexity research round 20.04.26: sirkulaer mat, alt-protein, sidestroem, biorest ---\n${tsEntries}\n`

// Insert before the closing ] of actorsSeed
const insertPoint = actorsFile.lastIndexOf('\n]\n\nexport const actorRelationshipsSeed')
if (insertPoint === -1) {
  console.error('Could not find insertion point in actors.ts')
  process.exit(1)
}

const merged = actorsFile.slice(0, insertPoint) + block + actorsFile.slice(insertPoint)

writeFileSync(actorsPath, merged, 'utf-8')
console.log(`Added ${toAdd.length} new actors to actors.ts`)
