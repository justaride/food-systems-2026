/** Prepare source work from a read-only inventory. Does not modify any database or governed source register. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { buildLibraryAnalysisPopulation, type LibraryAnalysisPopulationInputRow } from '../src/lib/knowledge/library-analysis-population'
import { LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES } from '../src/lib/library-analysis-retained-history-contract'

const [input, output] = process.argv.slice(2)
if (!input || !output) throw new Error('Usage: tsx scripts/build-followup-workpack.ts inventory.json output-directory')
const bytes = readFileSync(input)
type Actor = { id: string; name: string; slug: string; priorityTier: string | null; owner: string | null; nextStep: string | null; specificAsk: string | null; lastVerifiedAt: string | null }
type Flow = { id: string; cellId: string; country: string; year: number; fromNode: string; toNode: string; substance: string; quantity: number | null; unit: string; quality: string; systemBoundary: string; holeReason: string | null }
const data = JSON.parse(bytes.toString()) as {
  checkedAt: string; readOnly: boolean; populationInputs: Array<LibraryAnalysisPopulationInputRow & { title: string }>;
  actorFollowups: Actor[]; flows: Flow[]; semantic: { hasOpenAiKey: boolean; total: number; embedded: number };
  candidateCounts: Record<string, number>; deliveries: Array<{ total: number; withBuyer: number }>
}
if (data.readOnly !== true) throw new Error('Expected read-only inventory')
const retained = new Set(LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.map(r => `${r.sourceKind}:${r.sourceKey}`))
const population = buildLibraryAnalysisPopulation(data.populationInputs.map(r => ({ ...r, superseded: r.superseded || retained.has(`${r.sourceKind}:${r.sourceKey}`) })))
mkdirSync(output, { recursive: true })
const write = (name: string, value: unknown) => writeFileSync(join(output, name), JSON.stringify(value, null, 2) + '\n')
const csv = (name: string, headers: string[], rows: Array<Array<unknown>>) => writeFileSync(join(output, name), [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n')
write('library-population.json', population)
const titles = new Map(data.populationInputs.map(r => [r.sourceKey, r.title]))
write('source-input-blockers.json', population.rows.filter(r => r.eligibility !== 'eligible').map(r => ({ ...r, title: titles.get(r.sourceKey), nextAction: r.eligibility === 'superseded' ? 'Bevar historikk. Bruk registrert gjeldende motpart.' : 'Finn originalkilde, lesbart innhold og eksakt kildeidentitet før ny analyse.' })))
const blank = (value: string | null) => !value?.trim()
csv('actor-followups.csv', ['id', 'name', 'priority', 'registered_owner', 'registered_next_step', 'registered_ask', 'verified_at', 'missing_owner', 'missing_next_step', 'missing_verified_at', 'url'], data.actorFollowups.map(a => [a.id, a.name, a.priorityTier, a.owner, a.nextStep, a.specificAsk, a.lastVerifiedAt, blank(a.owner), blank(a.nextStep), blank(a.lastVerifiedAt), `/aktorer/${a.slug}`]))
const holes = data.flows.filter(f => f.quantity === null)
csv('flow-data-requests.csv', ['id', 'cell', 'country', 'year', 'from', 'to', 'substance', 'unit', 'system_boundary', 'current_hole', 'required_evidence', 'owner_assignment'], holes.map(f => [f.id, f.cellId, f.country, f.year, f.fromNode, f.toNode, f.substance, f.unit, f.systemBoundary, f.holeReason, 'Realiserte mengder; våt-/tørrvekt og TS; samme år/geografi/avgrensning; originaltabell og side/rad; målemetode og usikkerhet; separat N/P/K der tilgjengelig.', 'Må utpekes av prosjektansvarlig']))
const summary = { checkedAt: data.checkedAt, inputSha256: createHash('sha256').update(bytes).digest('hex'), mode: 'preparation-only', externalReady: false,
  populationHash: population.populationHash, population: population.rows.length,
  inputEligible: population.rows.filter(r => r.eligibility === 'eligible').length,
  inputBlocked: population.rows.filter(r => r.eligibility === 'blocked_input').length,
  retainedHistory: population.rows.filter(r => r.eligibility === 'superseded').length,
  actorFollowups: data.actorFollowups.length, missingActorOwners: data.actorFollowups.filter(a => blank(a.owner)).length,
  missingActorActions: data.actorFollowups.filter(a => blank(a.nextStep)).length,
  missingActorDates: data.actorFollowups.filter(a => blank(a.lastVerifiedAt)).length,
  flowHoles: holes.length, deliveriesWithoutBuyer: data.deliveries.reduce((n, d) => n + d.total - d.withBuyer, 0),
  semantic: data.semantic, candidateCounts: data.candidateCounts }
write('summary.json', summary)
console.log(JSON.stringify(summary))
