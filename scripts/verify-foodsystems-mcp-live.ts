#!/usr/bin/env tsx

import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
  CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
  classifyMatsvinnlovenAcademicIdentityCounts,
} from '../src/lib/citations/matsvinnloven-identity-migration'

const repoRoot = process.cwd()
const configuredCommand = process.env.FOODSYSTEMS_MCP_COMMAND?.trim()
const command = configuredCommand || resolve(repoRoot, 'node_modules/.bin/tsx')
const args = configuredCommand
  ? parseArgs(process.env.FOODSYSTEMS_MCP_ARGS_JSON)
  : [resolve(repoRoot, 'mcp/foodsystems-kb/server.ts')]

const childEnvironment = configuredCommand ? undefined : directChildEnvironment()
const transport = new StdioClientTransport({
  command,
  args,
  cwd: repoRoot,
  stderr: 'pipe',
  ...(childEnvironment ? { env: childEnvironment } : {}),
})
const client = new Client({ name: 'foodsystems-kb-live-acceptance', version: '1.0.0' })

async function main(): Promise<void> {
  try {
    await client.connect(transport)

  const toolList = await client.listTools()
  const expectedTools = [
    'kb_get_document',
    'kb_get_entity',
    'kb_list_gaps',
    'kb_search',
    'kb_status',
    'kb_trace_claim',
  ]
  assert.deepEqual(toolList.tools.map(tool => tool.name).sort(), expectedTools)
  assert.ok(toolList.tools.every(tool => tool.annotations?.readOnlyHint === true))

  const status = structured(await client.callTool({ name: 'kb_status', arguments: {} }))
  const database = record(status.database, 'kb_status.database')
  const counts = record(database.counts, 'kb_status.database.counts')
  assert.equal(database.configured, true)
  assert.equal(database.connected, true)
  assertMinimum(counts, 'documents', 1539)
  assertMinimum(counts, 'sourceCitations', 2699)
  assertMinimum(counts, 'insights', 132)
  assertMinimum(counts, 'reports', 139)
  // The synthetic matsvinnloven-2025 Thesis is intentionally removed and
  // replaced by an official SourceDoc without changing total evidence count.
  assertMinimum(counts, 'theses', CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY)
  assertMinimum(counts, 'sourceDocs', 199)
  assertMinimum(counts, 'companies', 351)
  assertMinimum(counts, 'actors', 1636)
  assertMinimum(counts, 'people', 1594)
  const identityCounts = {
    reports: number(counts.reports, 'kb_status.database.counts.reports'),
    theses: number(counts.theses, 'kb_status.database.counts.theses'),
    sourceDocs: number(counts.sourceDocs, 'kb_status.database.counts.sourceDocs'),
    totalEvidence: number(counts.reports, 'kb_status.database.counts.reports') +
      number(counts.theses, 'kb_status.database.counts.theses') +
      number(counts.sourceDocs, 'kb_status.database.counts.sourceDocs'),
  }
  const identityState = classifyMatsvinnlovenAcademicIdentityCounts(identityCounts)
  assert.notEqual(
    identityState,
    'invalid',
    `unexpected academic identity counts: ${JSON.stringify(identityCounts)}`,
  )

  const citationPolicy = record(status.citationPolicy, 'kb_status.citationPolicy')
  assert.equal(citationPolicy.requiresPublicHttpLocator, true)
  const citableExternalLabelled = number(
    citationPolicy.citableExternalLabelled,
    'kb_status.citationPolicy.citableExternalLabelled',
  )
  const externalAnswerEligible = number(
    citationPolicy.externalAnswerEligible,
    'kb_status.citationPolicy.externalAnswerEligible',
  )
  const externalAnswerBlocked = number(
    citationPolicy.externalAnswerBlocked,
    'kb_status.citationPolicy.externalAnswerBlocked',
  )
  const blockedMissingPublicLocator = number(
    citationPolicy.blockedMissingPublicLocator,
    'kb_status.citationPolicy.blockedMissingPublicLocator',
  )
  const citationGateEligible = number(
    citationPolicy.citationGateEligible,
    'kb_status.citationPolicy.citationGateEligible',
  )
  assert.equal(citableExternalLabelled, externalAnswerEligible + externalAnswerBlocked)
  assert.ok(citationGateEligible > 0)
  assert.equal(externalAnswerEligible, 0)
  assert.ok(blockedMissingPublicLocator <= externalAnswerBlocked)

  const appraisalPolicy = record(status.appraisalPolicy, 'kb_status.appraisalPolicy')
  const totalEvidenceRecords = number(
    appraisalPolicy.totalEvidenceRecords,
    'kb_status.appraisalPolicy.totalEvidenceRecords',
  )
  assert.equal(appraisalPolicy.modeled, true)
  assert.equal(totalEvidenceRecords, 417)
  assert.equal(totalEvidenceRecords, identityCounts.totalEvidence)
  assert.equal(appraisalPolicy.appraisals, 0)
  assert.equal(appraisalPolicy.missing, totalEvidenceRecords)
  assert.equal(appraisalPolicy.draft, 0)
  assert.equal(appraisalPolicy.reviewedCurrent, 0)
  assert.equal(appraisalPolicy.stale, 0)
  assert.equal(appraisalPolicy.incomplete, 0)
  assert.equal(appraisalPolicy.excluded, 0)
  assert.equal(appraisalPolicy.externalGateEligible, 0)

  const semantic = record(status.semanticSearch, 'kb_status.semanticSearch')
  const obsidian = record(status.obsidianVault, 'kb_status.obsidianVault')
  assert.equal(semantic.enabled, false)
  assert.equal(obsidian.enabled, false)

  const search = structured(await client.callTool({
    name: 'kb_search',
    arguments: {
      query: 'matsvinn',
      limit: 10,
      mode: 'semantic',
      types: ['document'],
    },
  }))
  assert.equal(search.audience, 'external')
  assert.equal(search.requestedMode, 'semantic')
  assert.equal(search.executedMode, 'keyword')
  const searchWarnings = array(search.warnings, 'kb_search.warnings')
  assert.ok(searchWarnings.some(item => (
    record(item, 'kb_search.warning').code === 'mcp-semantic-search-disabled'
  )))
  const searchResults = array(search.results, 'kb_search.results')
  assert.ok(searchResults.length > 0, 'expected at least one document search result')

  const firstDocument = record(searchResults[0], 'kb_search.results[0]')

  const reportSearch = structured(await client.callTool({
    name: 'kb_search',
    arguments: {
      query: 'Solutions Menu',
      limit: 1,
      mode: 'keyword',
      types: ['report'],
    },
  }))
  assert.equal(reportSearch.audience, 'external')
  const reportResults = array(reportSearch.results, 'kb_search.report.results')
  assert.equal(reportResults.length, 1, 'expected the report-only filter to be applied before the global cap')
  assert.ok(reportResults.every(value => record(value, 'kb_search.report.result').type === 'report'))
  assert.equal(
    record(reportResults[0], 'kb_search.report.result').id,
    'solutions-menu-2018',
    'expected a canonical seed Report without a Document link to be directly discoverable',
  )
  const reportLinks = record(
    record(reportResults[0], 'kb_search.report.result').links,
    'kb_search.report.result.links',
  )
  assert.equal(reportLinks.appPath, '/rapporter')
  assert.match(string(reportLinks.url, 'kb_search.report.result.links.url'), /^https:\/\/www\.norden\.org\//)
  assert.ok(!('summary' in record(reportResults[0], 'kb_search.report.result')))
  assert.equal(
    record(
      record(reportResults[0], 'kb_search.report.result').usePolicy,
      'kb_search.report.result.usePolicy',
    ).discoveryOnly,
    true,
  )

  const document = structured(await client.callTool({
    name: 'kb_get_document',
    arguments: { id: string(firstDocument.id, 'document id'), includeContent: true },
  }))
  assert.equal(document.audience, 'external')
  const contentPolicy = record(document.contentPolicy, 'kb_get_document.contentPolicy')
  if (contentPolicy.allowed === true) {
    assert.equal(contentPolicy.externalCitationPresent, true)
    assert.equal(contentPolicy.libraryApproved, true)
    assert.equal(contentPolicy.evidenceAppraisalApproved, true)
  } else {
    assert.equal(contentPolicy.requiresEvidenceAppraisal, true)
    assert.equal(contentPolicy.evidenceAppraisalApproved, false)
    assert.ok(!('content' in document))
    assert.ok(!('excerpt' in document))
    assert.ok(!('summary' in document))
  }

  const trace = structured(await client.callTool({
    name: 'kb_trace_claim',
    arguments: {
      query: 'NorgesGruppen ASA NACE 47.110: Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
      limit: 5,
    },
  }))
  assert.equal(trace.audience, 'external')
  assert.equal(trace.found, false)
  const claims = array(trace.claims, 'kb_trace_claim.claims')
  assert.equal(claims.length, 0)
  assert.ok(array(trace.warnings, 'kb_trace_claim.warnings').some(value => (
    typeof value === 'string' && value.includes('evidence appraisal')
  )))

  const internalTrace = structured(await client.callTool({
    name: 'kb_trace_claim',
    arguments: {
      query: 'NorgesGruppen ASA NACE 47.110: Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
      limit: 5,
      audience: 'internal',
    },
  }))
  assert.equal(internalTrace.audience, 'internal')
  assert.equal(internalTrace.found, true)
  const internalClaims = array(internalTrace.claims, 'kb_trace_claim.internal.claims')
  assert.ok(internalClaims.length > 0)
  for (const claimValue of internalClaims) {
    const claim = record(claimValue, 'kb_trace_claim.claim')
    const citation = record(claim.citation, 'kb_trace_claim.claim.citation')
    const appraisal = record(
      claim.evidenceAppraisal,
      'kb_trace_claim.claim.evidenceAppraisal',
    )
    const matchProvenance = record(claim.matchProvenance, 'kb_trace_claim.claim.matchProvenance')
    const usePolicy = record(citation.usePolicy, 'kb_trace_claim.claim.citation.usePolicy')
    assert.equal(matchProvenance.supportScope, 'claim_support')
    assert.ok(array(matchProvenance.matchedBy, 'kb_trace_claim.claim.matchProvenance.matchedBy')
      .some(value => value === 'claim_text_exact' || value === 'citation_quote_exact'))
    assert.equal(usePolicy.allowedForAnswer, true)
    assert.equal(appraisal.present, false)
    assert.deepEqual(
      array(
        record(appraisal.assessment, 'kb_trace_claim.claim.evidenceAppraisal.assessment').blockingReasons,
        'kb_trace_claim.claim.evidenceAppraisal.assessment.blockingReasons',
      ),
      ['appraisal_missing'],
    )
  }

  const metadataTrace = structured(await client.callTool({
    name: 'kb_trace_claim',
    arguments: { query: 'annual report', limit: 5, audience: 'internal' },
  }))
  assert.equal(metadataTrace.audience, 'internal')
  assert.equal(metadataTrace.found, false)
  assert.equal(array(metadataTrace.claims, 'kb_trace_claim.metadata.claims').length, 0)
  const discoveryMatches = array(
    metadataTrace.discoveryMatches,
    'kb_trace_claim.metadata.discoveryMatches',
  )
  assert.ok(discoveryMatches.length > 0)
  for (const discoveryValue of discoveryMatches) {
    const discovery = record(discoveryValue, 'kb_trace_claim.metadata.discovery')
    assert.equal(discovery.discoveryOnly, true)
    const provenance = record(discovery.matchProvenance, 'kb_trace_claim.metadata.provenance')
    assert.equal(provenance.supportScope, 'discovery_only')
  }

  const gaps = structured(await client.callTool({
    name: 'kb_list_gaps',
    arguments: { issue: 'readiness', readiness: 'citable_with_note', limit: 2 },
  }))
  assert.equal(gaps.audience, 'external')
  assert.ok(number(gaps.count, 'kb_list_gaps.count') > 0)
  const serializedGaps = JSON.stringify(gaps)
  assert.doesNotMatch(serializedGaps, /"claimText"|"localPath"|"filename"/)

  const appraisalGaps = structured(await client.callTool({
    name: 'kb_list_gaps',
    arguments: { issue: 'missing_appraisal', limit: 2 },
  }))
  assert.equal(appraisalGaps.audience, 'external')
  assert.equal(appraisalGaps.issue, 'missing_appraisal')
  assert.equal(number(appraisalGaps.count, 'kb_list_gaps.missing_appraisal.count'), 2)
  assert.ok(array(appraisalGaps.gaps, 'kb_list_gaps.missing_appraisal.gaps').every(value => (
    record(
      record(value, 'kb_list_gaps.missing_appraisal.gap').evidenceAppraisal,
      'kb_list_gaps.missing_appraisal.evidenceAppraisal',
    ).present === false
  )))

  let obsidianDisabled = false
  try {
    await client.readResource({ uri: 'foodsystems://obsidian/Welcome.md' })
  } catch (error) {
    assert.ok(error instanceof Error)
    assert.match(error.message, /invalid_input|disabled/i)
    obsidianDisabled = true
  }
  assert.equal(obsidianDisabled, true)

    console.log(JSON.stringify({
      status: 'PASS',
      transport: 'stdio',
      tools: toolList.tools.length,
      databaseCounts: counts,
      citationPolicy,
      appraisalPolicy,
      keywordFallback: true,
      searchResults: searchResults.length,
      reportSearchResults: reportResults.length,
      externalDocumentContentAllowed: contentPolicy.allowed === true,
      externallyCitableClaims: claims.length,
      internalClaimsBlockedExternallyByMissingAppraisal: internalClaims.length,
      metadataOnlyTraceMatches: discoveryMatches.length,
      externalGapPayloadMetadataOnly: true,
      obsidianDisabled,
    }, null, 2))
  } finally {
    await client.close().catch(() => undefined)
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'unknown error'
  console.error(`[foodsystems-kb-acceptance] FAIL: ${message}`)
  process.exitCode = 1
})

function parseArgs(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  const parsed: unknown = JSON.parse(raw)
  assert.ok(Array.isArray(parsed) && parsed.every(value => typeof value === 'string'))
  return parsed
}

function directChildEnvironment(): Record<string, string> {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  assert.ok(databaseUrl, 'DATABASE_URL is required when FOODSYSTEMS_MCP_COMMAND is not set')

  return Object.fromEntries([
    ['DATABASE_URL', databaseUrl],
    ['HOME', process.env.HOME],
    ['PATH', process.env.PATH],
    ['TMPDIR', process.env.TMPDIR],
  ].filter((entry): entry is [string, string] => Boolean(entry[1])))
}

function structured(result: unknown): Record<string, unknown> {
  const payload = record(result, 'MCP tool result')
  assert.notEqual(payload.isError, true, JSON.stringify(payload))
  if (payload.structuredContent) return record(payload.structuredContent, 'structuredContent')

  const content = array(payload.content, 'content')
  const textBlock = content
    .map(item => record(item, 'content block'))
    .find(item => item.type === 'text' && typeof item.text === 'string')
  assert.ok(textBlock && typeof textBlock.text === 'string')
  return record(JSON.parse(textBlock.text), 'parsed text result')
}

function record(value: unknown, label: string): Record<string, unknown> {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`)
  return value as Record<string, unknown>
}

function array(value: unknown, label: string): unknown[] {
  assert.ok(Array.isArray(value), `${label} must be an array`)
  return value
}

function number(value: unknown, label: string): number {
  assert.equal(typeof value, 'number', `${label} must be a number`)
  return value
}

function string(value: unknown, label: string): string {
  assert.equal(typeof value, 'string', `${label} must be a string`)
  return value
}

function assertMinimum(counts: Record<string, unknown>, key: string, minimum: number): void {
  assert.ok(number(counts[key], `kb_status.database.counts.${key}`) >= minimum)
}
