import { parseCsvRecords } from './csv'

export type SourceStringClass =
  | 'missing'
  | 'has_url'
  | 'has_doi'
  | 'local_path_or_file'
  | 'domain_only'
  | 'vague_research'
  | 'registry_label_without_locator'
  | 'free_text'

export type SourceClassification = {
  className: SourceStringClass
  needsAction: boolean
  reason: string
}

export type SourceFieldSummary = {
  model: string
  field: string
  value: string | null
  count: number
}

export type SourceTaxonomyRow = {
  rowType: 'source_value' | 'model_without_source_field'
  model: string
  field: string
  sourceValue: string
  recordCount: number
  className: SourceStringClass
  needsAction: 'yes' | 'no'
  reason: string
}

type SourceTaxonomyCsvRecord = {
  row_type?: string
  model?: string
  field?: string
  source_value?: string
  record_count?: string
  class_name?: string
  needs_action?: string
  reason?: string
}

export function normalizeSourceValue(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, ' ') ?? ''
}

function result(
  className: SourceStringClass,
  needsAction: boolean,
  reason: string,
): SourceClassification {
  return {
    className,
    needsAction,
    reason,
  }
}

const URL_PATTERN = /^https?:\/\/\S+$/i
const DOI_PATTERN = /^(?:doi:\s*)?10\.\d{4,9}\/\S+$/i
const DOI_URL_PATTERN = /^https?:\/\/(?:dx\.)?doi\.org\/10\.\d{4,9}\/\S+$/i
const LOCAL_PATH_PATTERN = /^(?:research|docs|public|tmp)\/.+\.(?:csv|html|json|jsonl|md|pdf|txt|xlsx?)$/i
const FILE_NAME_PATTERN = /^.+\.(?:csv|html|json|jsonl|md|pdf|txt|xlsx?)$/i
const DOMAIN_ONLY_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}(?:\s+\([^)]*\))?$/i
const VAGUE_RESEARCH_PATTERN = /\b(?:web research|manual|manuell|desk research|own research|egen research|research only)\b/i
const REGISTRY_LABEL_PATTERN = /\b(?:br[øo]nn[øo]ysund|broennoysund|offentligdata|mcp|enhetsregisteret|fiskeridirektoratet|landbruksdirektoratet|barentswatch)\b/i

export function classifyLegacySource(value: string | null | undefined): SourceClassification {
  const normalized = normalizeSourceValue(value)
  const lower = normalized.toLowerCase()

  if (!normalized) {
    return result('missing', true, 'Missing source value')
  }

  if (URL_PATTERN.test(normalized)) {
    if (DOI_URL_PATTERN.test(normalized)) {
      return result('has_doi', false, 'Persistent DOI URL')
    }
    return result('has_url', false, 'Resolvable URL is present')
  }

  if (DOI_PATTERN.test(normalized)) {
    return result('has_doi', false, 'Persistent DOI is present')
  }

  if (LOCAL_PATH_PATTERN.test(normalized) || FILE_NAME_PATTERN.test(normalized)) {
    return result('local_path_or_file', false, 'Local file path or filename is present')
  }

  if (VAGUE_RESEARCH_PATTERN.test(normalized) || lower === 'research' || lower === 'manual') {
    return result('vague_research', true, 'Vague research/manual label without a resolvable locator')
  }

  if (DOMAIN_ONLY_PATTERN.test(normalized)) {
    return result('domain_only', true, 'Bare domain or domain label without a source URL')
  }

  if (REGISTRY_LABEL_PATTERN.test(normalized)) {
    return result('registry_label_without_locator', true, 'Registry/API label lacks URL, access date, or local snapshot path')
  }

  return result('free_text', true, 'Free-text source label needs manual taxonomy review')
}

export function makeSourceTaxonomyRows(summaries: SourceFieldSummary[]): SourceTaxonomyRow[] {
  return summaries
    .map(summary => {
      const classification = classifyLegacySource(summary.value)
      return {
        rowType: 'source_value',
        model: summary.model,
        field: summary.field,
        sourceValue: normalizeSourceValue(summary.value),
        recordCount: summary.count,
        className: classification.className,
        needsAction: classification.needsAction ? 'yes' : 'no',
        reason: classification.reason,
      } satisfies SourceTaxonomyRow
    })
    .sort((a, b) => {
      if (a.needsAction !== b.needsAction) return a.needsAction === 'yes' ? -1 : 1
      if (b.recordCount !== a.recordCount) return b.recordCount - a.recordCount
      return `${a.model}:${a.field}:${a.sourceValue}`.localeCompare(`${b.model}:${b.field}:${b.sourceValue}`)
    })
}

function escapeCsvCell(value: string | number) {
  const text = String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

export function formatSourceTaxonomyCsv(rows: SourceTaxonomyRow[]) {
  const header = [
    'row_type',
    'model',
    'field',
    'source_value',
    'record_count',
    'class_name',
    'needs_action',
    'reason',
  ]

  const lines = rows.map(row => [
    row.rowType,
    row.model,
    row.field,
    row.sourceValue,
    row.recordCount,
    row.className,
    row.needsAction,
    row.reason,
  ].map(escapeCsvCell).join(','))

  return `${[header.join(','), ...lines].join('\n')}\n`
}

export function parseSourceTaxonomyCsv(csv: string): SourceTaxonomyRow[] {
  return parseCsvRecords(csv).map((record: SourceTaxonomyCsvRecord) => ({
    rowType: record.row_type === 'model_without_source_field' ? 'model_without_source_field' : 'source_value',
    model: record.model ?? '',
    field: record.field ?? '',
    sourceValue: record.source_value ?? '',
    recordCount: Number(record.record_count ?? 0),
    className: parseSourceStringClass(record.class_name),
    needsAction: record.needs_action === 'yes' ? 'yes' : 'no',
    reason: record.reason ?? '',
  }))
}

export function sourceTaxonomyRowKey(row: SourceTaxonomyRow) {
  return [
    row.rowType,
    row.model,
    row.field,
    row.sourceValue,
  ].join('\u001f')
}

export function findNewActionNeededSourceRows(currentRows: SourceTaxonomyRow[], baselineCsv: string) {
  const baselineActionKeys = new Set(
    parseSourceTaxonomyCsv(baselineCsv)
      .filter(row => row.needsAction === 'yes')
      .map(sourceTaxonomyRowKey),
  )

  return currentRows.filter(row => row.needsAction === 'yes' && !baselineActionKeys.has(sourceTaxonomyRowKey(row)))
}

function parseSourceStringClass(value: string | undefined): SourceStringClass {
  const classes: SourceStringClass[] = [
    'missing',
    'has_url',
    'has_doi',
    'local_path_or_file',
    'domain_only',
    'vague_research',
    'registry_label_without_locator',
    'free_text',
  ]
  return classes.includes(value as SourceStringClass) ? value as SourceStringClass : 'free_text'
}
