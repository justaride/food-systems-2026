import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dataDir = join(process.cwd(), 'public/data/food-systems')
const intakeDir = join(process.cwd(), 'research/intake/perplexity-2026-04-20')

const production = JSON.parse(readFileSync(join(dataDir, 'circularity-loops.json'), 'utf-8'))
const newFailures = JSON.parse(readFileSync(join(intakeDir, 'failure-cases.json'), 'utf-8'))
const newSuccessData = JSON.parse(readFileSync(join(intakeDir, 'success-cases.json'), 'utf-8'))
const newGaps = JSON.parse(readFileSync(join(intakeDir, 'circularity-gaps.json'), 'utf-8'))

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// --- FAILURE CASES ---
const existingFailureNames = new Set([
  ...production.actor_cases.failure.map((c: any) => normalize(c.name)),
  ...production.additional_failure.map((c: any) => normalize(c.name)),
])

for (const f of newFailures) {
  const key = normalize(f.name)
  // Update existing ENORM entry with richer data
  const existingMain = production.actor_cases.failure.find((c: any) => normalize(c.name) === key)
  if (existingMain) {
    existingMain.concept = f.concept
    existingMain.cause = f.cause
    existingMain.lesson = f.lesson
    if (f.founded) existingMain.founded = f.founded
    if (f.invested_eur_m) existingMain.invested_eur_m = f.invested_eur_m
    existingMain.status = f.status
    continue
  }
  const existingAdd = production.additional_failure.find((c: any) => normalize(c.name) === key)
  if (existingAdd) {
    existingAdd.concept = f.concept
    existingAdd.cause = f.cause
    existingAdd.lesson = f.lesson
    if (f.founded) existingAdd.founded = f.founded
    if (f.invested_eur_m) existingAdd.invested_eur_m = f.invested_eur_m
    existingAdd.status = f.status
    existingAdd.bankrupt = f.bankrupt
    continue
  }
  production.additional_failure.push(f)
}

// --- SUCCESS CASES ---
const existingSuccessNames = new Set([
  ...production.actor_cases.success.map((c: any) => normalize(c.name)),
  ...production.additional_success.map((c: any) => normalize(c.name)),
])

// Apply enrichments to existing entries
for (const update of (newSuccessData.existing_updates || [])) {
  const key = normalize(update.name)
  const target =
    production.actor_cases.success.find((c: any) => normalize(c.name) === key) ||
    production.additional_success.find((c: any) => normalize(c.name) === key)
  if (target && update.new_data) {
    if (update.new_data.status_update) target.status = update.new_data.status_update
    if (update.new_data.lesson_enrichment) target.lesson = update.new_data.lesson_enrichment
  }
}

// Add new success cases
for (const s of (newSuccessData.new_cases || [])) {
  const key = normalize(s.name)
  // Check for partial name matches too (e.g. "Den Magiske Fabrikken" vs "Den Magiske Fabrikken / Greve Biogass")
  const alreadyExists = [...production.actor_cases.success, ...production.additional_success].some(
    (c: any) => normalize(c.name).includes(key) || key.includes(normalize(c.name))
  )
  if (alreadyExists) continue
  production.additional_success.push(s)
}

// --- GAPS ---
const existingGapIds = new Set(production.gaps.map((g: any) => g.id))

for (const gap of newGaps) {
  if (existingGapIds.has(gap.id)) {
    // Update in place with richer data
    const idx = production.gaps.findIndex((g: any) => g.id === gap.id)
    production.gaps[idx] = gap
  } else {
    production.gaps.push(gap)
  }
}

// Update pattern with cross-case synthesis
production.actor_cases.pattern =
  "Platform/discount models (TGTG, REKO, Holdbart) survive under cost pressure. " +
  "Production-heavy models (Enorm, Ynsect, Infarm) collapse — even with €600M+ invested. " +
  "Key failure patterns: (1) mega-CAPEX in unproven markets, (2) B2C plant-meat post-hype demand collapse, " +
  "(3) structural price gap vs soy/fishmeal (3-10x). Survivors: B2B ingredient plays (PeelPioneers), " +
  "consortium/foundation models (AX Foundation), low-CAPEX platforms (TGTG, Matsentralen). " +
  "Finnish insect companies (Volare) surviving where Danish/French fail — leaner cost structure + patient capital."

production.generated = "2026-04-20"

writeFileSync(
  join(dataDir, 'circularity-loops.json'),
  JSON.stringify(production, null, 2) + '\n',
  'utf-8'
)

const stats = {
  failures_updated: newFailures.filter((f: any) => existingFailureNames.has(normalize(f.name))).length,
  failures_added: newFailures.filter((f: any) => !existingFailureNames.has(normalize(f.name))).length,
  successes_enriched: (newSuccessData.existing_updates || []).length,
  successes_added: production.additional_success.length - 6, // was 6 before
  gaps_total: production.gaps.length,
  gaps_new: newGaps.length - [...existingGapIds].filter(id => newGaps.some((g: any) => g.id === id)).length,
}

console.log('Merge complete:', JSON.stringify(stats, null, 2))
