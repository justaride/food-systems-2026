import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCsvRecords } from '../src/lib/csv'

type Candidate = Record<string, string>

const candidatePath = resolve(
  process.cwd(),
  'research/bibliotek/media/media-source-candidates-2026-04-29.csv',
)
const outputPath = resolve(
  process.cwd(),
  'research/bibliotek/media/media-source-review-queue-2026-04-29.csv',
)
const snapshotDir = resolve(process.cwd(), 'research/bibliotek/media/snapshots')

const outputHeaders = [
  'id',
  'decision',
  'review_status',
  'country',
  'theme',
  'priority',
  'source_status',
  'snapshot_status',
  'recommended_action',
  'proposed_verification_level',
  'proposed_record_type',
  'proposed_tone',
  'proposed_frame',
  'proposed_confidence',
  'notes',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

function csvEscape(value: string | number) {
  const text = String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

function loadCandidates() {
  const rows = parseCsvRecords(readFileSync(candidatePath, 'utf8'))
  if (rows.length === 0) throw new Error(`No CSV rows found in ${candidatePath}`)
  return rows as Candidate[]
}

function inferVerificationLevel(row: Candidate) {
  if (row.source_type.includes('authority') || row.source_type.includes('government')) return 'primary'
  if (row.source_type.includes('public-audit')) return 'primary'
  if (row.source_type.includes('industry-statistics')) return 'primary'
  if (row.source_type.includes('corporate')) return 'secondary_actor'
  if (row.source_type.includes('academic') || row.source_type.includes('research-publication')) return 'secondary_research'
  if (row.source_type.includes('benchmark')) return 'benchmark'
  if (row.source_type.includes('news')) return 'secondary_media'
  return 'secondary'
}

function inferRecordType(row: Candidate) {
  if (row.source_type.includes('authority-decision')) return 'authority-decision'
  if (row.source_type.includes('authority-report')) return 'authority-report'
  if (row.source_type.includes('authority')) return row.source_type
  if (row.source_type.includes('government')) return 'government-policy'
  if (row.source_type.includes('public-audit')) return 'public-audit'
  if (row.source_type.includes('academic')) return 'academic-research'
  if (row.source_type.includes('corporate')) return 'actor-position'
  if (row.source_type.includes('industry')) return 'industry-analysis'
  if (row.source_type.includes('benchmark')) return 'benchmark'
  if (row.source_type.includes('project')) return 'project-case'
  if (row.source_type.includes('news')) return 'media-article'
  return row.source_type || 'source'
}

function inferTone(row: Candidate) {
  if (row.source_type.includes('corporate') || row.source_type.includes('industry')) return 'actor-position'
  if (row.source_type.includes('authority') || row.source_type.includes('public-audit')) return 'policy'
  if (row.source_type.includes('academic') || row.source_type.includes('benchmark')) return 'analytical'
  if (row.theme === 'sirkularitet' || row.theme === 'innovasjon') return 'case-oriented'
  return 'analytical'
}

function inferFrame(row: Candidate) {
  if (row.theme === 'markedsmakt') return 'competition'
  if (row.theme === 'prispress') return 'price-pressure'
  if (row.theme === 'beredskap') return 'preparedness'
  if (row.theme === 'sirkularitet') return 'circularity'
  if (row.theme === 'innovasjon') return 'innovation'
  if (row.theme === 'regulering') return 'regulation'
  return 'system'
}

function inferConfidence(row: Candidate, hasSnapshot: boolean) {
  if (!hasSnapshot) return 1
  if (row.priority === 'P1') return 4
  if (row.priority === 'P2') return 3
  return 2
}

function inferDecision(row: Candidate, hasSnapshot: boolean) {
  if (row.status === 'already_in_corpus') return 'keep_existing_review_for_expansion'
  if (row.status === 'candidate_manual' || row.poison_pill_risk === 'high_paywall') return 'metadata_only_manual'
  if (row.status === 'watch_2026') return hasSnapshot ? 'watch_only_snapshot_available' : 'watch_only_manual'
  if (!hasSnapshot) return 'blocked_fetch_needs_alternate'
  if (row.capture_method.includes('pdf')) return 'pdf_catalog_before_import'
  if (row.priority === 'P3') return 'optional_context_review'
  return 'ready_for_human_review'
}

function inferAction(row: Candidate, decision: string) {
  if (decision === 'metadata_only_manual') return 'record_metadata_no_fulltext'
  if (decision.startsWith('watch_only')) return 'keep_outside_2016_2025_until_period_closed'
  if (decision === 'blocked_fetch_needs_alternate') return 'find_alternate_url_or_manual_source'
  if (decision === 'pdf_catalog_before_import') return 'catalog_pdf_and_link_sourcedoc_before_import'
  if (decision === 'keep_existing_review_for_expansion') return 'use_as_anchor_when_adding_related_entries'
  if (decision === 'optional_context_review') return 'use_only_if_theme_gap_remains'
  if (row.country === 'is' && row.theme === 'markedsmakt') return 'review_carefully_for_direct_grocery_relevance'
  return 'review_for_media_corpus_import'
}

const candidates = loadCandidates()
const rows = candidates.map(row => {
  const snapshotPath = resolve(snapshotDir, `${slugify(row.id)}.md`)
  const hasSnapshot = existsSync(snapshotPath)
  const snapshotStatus = hasSnapshot ? 'snapshot_exists' : 'no_snapshot'
  const decision = inferDecision(row, hasSnapshot)
  const recommendedAction = inferAction(row, decision)

  return {
    id: row.id,
    decision,
    review_status: 'pending',
    country: row.country,
    theme: row.theme,
    priority: row.priority,
    source_status: row.status,
    snapshot_status: snapshotStatus,
    recommended_action: recommendedAction,
    proposed_verification_level: inferVerificationLevel(row),
    proposed_record_type: inferRecordType(row),
    proposed_tone: inferTone(row),
    proposed_frame: inferFrame(row),
    proposed_confidence: inferConfidence(row, hasSnapshot),
    notes: row.notes,
  }
})

const csv = [
  outputHeaders.join(','),
  ...rows.map(row => outputHeaders.map(header => csvEscape(row[header as keyof typeof row])).join(',')),
].join('\n')

writeFileSync(outputPath, `${csv}\n`)
console.log(`Wrote ${rows.length} review rows to ${outputPath}`)
