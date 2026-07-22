import { readFileSync } from 'node:fs'
import path from 'node:path'

// Typen speiler output fra scripts/compute-masterhjerne-status.ts (DB-fri generator).

export type MasterhjerneSourceRef = {
  id: string
  path: string
  modifiedAt: string | null
  ok: boolean
  note?: string
}

export type MasterhjerneCoverageRow = {
  set: string
  key: string
  label: string
  present: number
  total: number
  pct: number
}

export type MasterhjerneStatus = {
  generatedAt: string
  sources: MasterhjerneSourceRef[]
  warnings: string[]
  bibliotek: {
    total: number
    byStatus: Record<string, number>
    byUsageRule: Record<string, number>
    missingText: number
    claimCandidates: number
  } | null
  akademisk: {
    auditGeneratedAt: string | null
    reports: number
    theses: number
    sourceDocs: number
    totalRows: number
    regressionGate: string | null
    externalReadiness: string | null
    coverage: MasterhjerneCoverageRow[]
  } | null
  siterbarhet: {
    fieldCitations: number | null
    sourceCitations: number | null
    citableExternal: number | null
    citableWithNote: number | null
    internalContext: number | null
    blockedUnsourced: number | null
    acceptanceReady: number | null
    acceptanceTotal: number | null
  } | null
  dekning: {
    reportFile: string
    totalMapped: number
    totalUniverse: number
    cells: number
    confidence: Record<string, number>
    domains: { domain: string; mapped: number; universe: number }[]
    openGaps: { domain: string; subdomain: string; mapped: number; universe: number; gap: number }[]
  } | null
  kiKorpus: {
    n: number
    meanScore: number
    byYear: Record<string, number>
    byGroup: Record<string, number>
    share2023PlusPct: number
  } | null
  urlHelse: {
    checked: number
    ok: number
    blocked: number
    dead: number
    other: number
    highPriorityChecked: number
    highPriorityDead: number
    highPriorityBlocked: number
  } | null
  pdfKatalog: { count: number; pages: number } | null
  vaultExport: {
    generatedAt: string | null
    companies: number
    ownershipEdges: number
    boardMembers: number
    businessRelationships: number
    properties: number
  } | null
  subsidier: { total: number; computedAt: string | null } | null
  missions: { file: string; total: number; byStatus: Record<string, number> } | null
}

const STATUS_PATH = path.join(process.cwd(), 'public', 'data', 'masterhjerne', 'status.json')

export function loadMasterhjerneStatus(): MasterhjerneStatus | null {
  try {
    return JSON.parse(readFileSync(STATUS_PATH, 'utf-8')) as MasterhjerneStatus
  } catch {
    return null
  }
}
