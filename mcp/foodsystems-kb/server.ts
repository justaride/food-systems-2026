import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  AUDIENCES,
  MAX_CONTENT_WINDOW,
  MAX_QUERY_LENGTH,
  McpInputError,
} from './formatters'
import {
  kbGetDocument,
  kbGetEntity,
  kbListGaps,
  kbSearch,
  kbStatus,
  kbTraceClaim,
  MIN_TRACE_CLAIM_QUERY_LENGTH,
  readObsidianResource,
  readSchemaResource,
  type EntityType,
  type EvidenceGapIssue,
  type SearchMode,
} from './service'

export const SERVER_NAME = 'foodsystems-kb'
export const SERVER_VERSION = '1.3.0'

export const KB_MCP_INSTRUCTIONS = [
  'Food Systems KB is read-only. Use it to search, inspect entities, trace claims to citations, and review gaps.',
  'The default audience is external; search and entity results are discovery-only until a claim is traced.',
  'kb_trace_claim establishes direct claim support only for an exact normalized match to stored claimText or citation.quote. Substring overlap is a lexical candidate that requires human comparison; fieldPath, citation title, citation text, and notes matches are metadata-only discovery.',
  'External claimText may be redacted; use matchProvenance.supportScope and citation policy, and never infer hidden text.',
  'External answers may use only claims whose citation.usePolicy.externalCitable and evidenceAppraisal.assessment.externalGateSatisfied are both true.',
  'External citation eligibility requires a public HTTP(S) source or archive locator; local paths and internal document IDs remain discovery context only.',
  'Never use citable_with_note, internal_context, blocked_unsourced, failed, disputed, or rejected evidence in external answers.',
  'External document text requires both an eligible external citation and explicit external library approval; internal AI approval is insufficient.',
  'Local paths and audience-sensitive entity fields are redacted from external responses.',
  'Semantic search and Obsidian resources are disabled unless their dedicated MCP opt-in environment variables are true.',
  'Never expose secrets, environment variables, raw credentials, or uncapped full documents.',
  'Prefer kb_trace_claim and citation metadata before drafting evidence-backed answers.',
].join(' ')

export const REGISTERED_TOOLS = [
  'kb_status',
  'kb_search',
  'kb_get_document',
  'kb_get_entity',
  'kb_trace_claim',
  'kb_list_gaps',
] as const

export const REGISTERED_RESOURCES = [
  'foodsystems://schema',
  'foodsystems://document/{slug}',
  'foodsystems://entity/{type}/{id}',
  'foodsystems://obsidian/{path}',
] as const

export const REGISTERED_PROMPTS = [
  'answer_with_citations',
  'claim_check',
  'knowledge_gap_review',
] as const

const searchModeSchema = z.enum(['keyword', 'semantic', 'hybrid'])
const entityTypeSchema = z.enum(['company', 'actor', 'person'])
const citationReadinessSchema = z.enum(['citable_external', 'citable_with_note', 'internal_context', 'blocked_unsourced'])
const evidenceGapIssueSchema = z.enum([
  'readiness',
  'needs_review',
  'missing_locator',
  'missing_appraisal',
  'stale_appraisal',
  'incomplete_appraisal',
])
const audienceSchema = z.enum(AUDIENCES)
const searchResultTypeSchema = z.enum([
  'document',
  'insight',
  'source',
  'report',
  'thesis',
  'company',
  'actor',
  'relationship',
  'property',
  'person',
])

export type FoodSystemsKbServices = {
  kbStatus: () => Promise<unknown>
  kbSearch: (input: Parameters<typeof kbSearch>[0]) => Promise<unknown>
  kbGetDocument: (input: Parameters<typeof kbGetDocument>[0]) => Promise<unknown>
  kbGetEntity: (input: Parameters<typeof kbGetEntity>[0]) => Promise<unknown>
  kbTraceClaim: (input: Parameters<typeof kbTraceClaim>[0]) => Promise<unknown>
  kbListGaps: (input: Parameters<typeof kbListGaps>[0]) => Promise<unknown>
  readSchemaResource: () => Promise<string>
  readObsidianResource: (resourcePath: string) => Promise<string>
}

const DEFAULT_SERVICES: FoodSystemsKbServices = {
  kbStatus,
  kbSearch,
  kbGetDocument,
  kbGetEntity,
  kbTraceClaim,
  kbListGaps,
  readSchemaResource,
  readObsidianResource,
}

function toolResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  }
}

async function safeToolResult(operation: string, action: () => Promise<unknown>) {
  try {
    return toolResult(await action())
  } catch (error) {
    const clientError = toClientError(operation, error)
    return {
      ...toolResult({ ok: false, error: clientError }),
      isError: true,
    }
  }
}

async function safeResourceText(operation: string, action: () => Promise<string>) {
  try {
    return await action()
  } catch (error) {
    const clientError = toClientError(operation, error)
    throw new Error(`${clientError.code}: ${clientError.message}`)
  }
}

function toClientError(operation: string, error: unknown) {
  if (error instanceof McpInputError) {
    return {
      code: 'invalid_input',
      message: error.message,
      operation,
    }
  }

  if (error instanceof Error && error.message === 'DATABASE_URL is not configured') {
    return {
      code: 'service_not_configured',
      message: 'The knowledge-base database is not configured for this MCP server.',
      operation,
    }
  }

  return {
    code: 'kb_request_failed',
    message: 'The knowledge-base request could not be completed.',
    operation,
  }
}

function resourceResult(uri: URL, text: string, mimeType = 'text/plain') {
  return {
    contents: [{ uri: uri.href, mimeType, text }],
  }
}

export function createFoodSystemsKbServer(overrides: Partial<FoodSystemsKbServices> = {}) {
  const services: FoodSystemsKbServices = { ...DEFAULT_SERVICES, ...overrides }
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: KB_MCP_INSTRUCTIONS },
  )

  server.registerTool(
    'kb_status',
    {
      title: 'Food Systems KB Status',
      description: 'Check database connectivity, citation and evidence-appraisal gates, semantic search availability, row counts, and Obsidian vault presence.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => safeToolResult('kb_status', () => services.kbStatus()),
  )

  server.registerTool(
    'kb_search',
    {
      title: 'Search Food Systems KB',
      description: 'Search documents, insights, source records, reports, theses, companies, actors, people, and relationships.',
      inputSchema: {
        query: z.string().min(1).max(MAX_QUERY_LENGTH).describe('Non-empty search query.'),
        limit: z.number().int().min(1).max(25).optional().describe('Maximum result count, capped at 25.'),
        mode: searchModeSchema.optional().describe('keyword, semantic, or hybrid.'),
        types: z.array(searchResultTypeSchema).max(10).optional().describe('Optional result-type allow list.'),
        audience: audienceSchema.optional().describe('external by default; internal must be selected explicitly.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit, mode, types, audience }) => safeToolResult('kb_search', () => services.kbSearch({
      query,
      limit,
      mode: mode as SearchMode | undefined,
      types,
      audience: audience ?? 'external',
    })),
  )

  server.registerTool(
    'kb_get_document',
    {
      title: 'Get Food Systems Document',
      description: 'Retrieve document metadata, capped content, links, and citation readiness by slug or id.',
      inputSchema: {
        slug: z.string().min(1).max(256).optional(),
        id: z.string().min(1).max(256).optional(),
        includeContent: z.boolean().optional(),
        contentWindow: z.number().int().min(500).max(MAX_CONTENT_WINDOW).optional(),
        audience: audienceSchema.optional().describe('external by default; internal returns weak citations with policy flags.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => safeToolResult('kb_get_document', () => services.kbGetDocument({
      ...input,
      audience: input.audience ?? 'external',
    })),
  )

  server.registerTool(
    'kb_get_entity',
    {
      title: 'Get Food Systems Entity',
      description: 'Retrieve a company, actor, or person profile with relationships and source status.',
      inputSchema: {
        type: entityTypeSchema,
        id: z.string().min(1).max(256).describe('Entity id, slug, orgNr, personKey, or exact name.'),
        audience: audienceSchema.optional().describe('external by default; entity fields remain discovery-only.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ type, id, audience }) => safeToolResult('kb_get_entity', () => services.kbGetEntity({
      type: type as EntityType,
      id,
      audience: audience ?? 'external',
    })),
  )

  server.registerTool(
    'kb_trace_claim',
    {
      title: 'Trace Food Systems Claim',
      description: 'Trace a query against claim evidence. Only an exact normalized claimText or citation quote match can establish direct claim support. External support also requires a complete, current, externally gateable evidence appraisal. Substring overlap is a lexical candidate for human comparison; field path, citation title/text, and notes matches are metadata-only discovery. External claimText may be redacted.',
      inputSchema: {
        query: z.string().min(MIN_TRACE_CLAIM_QUERY_LENGTH).max(MAX_QUERY_LENGTH).describe('Claim wording to match. Direct support requires an exact normalized claimText or citation quote match.'),
        entityType: z.string().min(1).max(100).optional(),
        entityId: z.string().min(1).max(256).optional(),
        limit: z.number().int().min(1).max(25).optional(),
        audience: audienceSchema.optional().describe('external by default and fail-closed to citable_external evidence with a public HTTP(S) locator plus a complete, current evidence appraisal.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => safeToolResult('kb_trace_claim', () => services.kbTraceClaim({
      ...input,
      audience: input.audience ?? 'external',
    })),
  )

  server.registerTool(
    'kb_list_gaps',
    {
      title: 'List Food Systems Evidence Gaps',
      description: 'List one exact evidence-gap class: readiness, needs_review, missing_locator, missing_appraisal, stale_appraisal, or incomplete_appraisal.',
      inputSchema: {
        limit: z.number().int().min(1).max(25).optional(),
        readiness: citationReadinessSchema.optional(),
        issue: evidenceGapIssueSchema.optional(),
        audience: audienceSchema.optional().describe('external by default; internal reveals local evidence locators.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => safeToolResult('kb_list_gaps', () => services.kbListGaps({
      ...input,
      issue: input.issue as EvidenceGapIssue | undefined,
      audience: input.audience ?? 'external',
    })),
  )

  server.registerResource(
    'schema',
    'foodsystems://schema',
    {
      title: 'Food Systems Prisma Schema',
      description: 'Current committed Prisma schema for the knowledge base.',
      mimeType: 'text/plain',
    },
    async (uri) => resourceResult(
      uri,
      await safeResourceText('schema_resource', () => services.readSchemaResource()),
    ),
  )

  server.registerResource(
    'document',
    new ResourceTemplate('foodsystems://document/{slug}', { list: undefined }),
    {
      title: 'Food Systems Document',
      description: 'Document resource by slug.',
      mimeType: 'application/json',
    },
    async (uri, { slug }) => resourceResult(
      uri,
      await safeResourceText('document_resource', async () => JSON.stringify(
        await services.kbGetDocument({ slug: String(slug), audience: 'external' }),
        null,
        2,
      )),
      'application/json',
    ),
  )

  server.registerResource(
    'entity',
    new ResourceTemplate('foodsystems://entity/{type}/{id}', { list: undefined }),
    {
      title: 'Food Systems Entity',
      description: 'Company, actor, or person resource by type and id.',
      mimeType: 'application/json',
    },
    async (uri, { type, id }) => resourceResult(
      uri,
      await safeResourceText('entity_resource', async () => {
        const parsedType = entityTypeSchema.safeParse(type)
        if (!parsedType.success) throw new McpInputError('Unsupported entity resource type')
        return JSON.stringify(await services.kbGetEntity({
          type: parsedType.data as EntityType,
          id: String(id),
          audience: 'external',
        }), null, 2)
      }),
      'application/json',
    ),
  )

  server.registerResource(
    'obsidian',
    new ResourceTemplate('foodsystems://obsidian/{path}', { list: undefined }),
    {
      title: 'Food Systems Obsidian Note',
      description: 'Read a Markdown note from the optional Food Systems Obsidian vault with path traversal protection.',
      mimeType: 'text/markdown',
    },
    async (uri, { path }) => resourceResult(
      uri,
      await safeResourceText('obsidian_resource', () => services.readObsidianResource(String(path))),
      'text/markdown',
    ),
  )

  registerPrompts(server)

  return server
}

function registerPrompts(server: McpServer) {
  server.registerPrompt(
    'answer_with_citations',
    {
      title: 'Answer With Citations',
      description: 'Answer a Food Systems question using KB search and citation readiness.',
      argsSchema: {
        question: z.string().min(1).max(2_000),
        audience: audienceSchema.optional(),
      },
    },
    ({ question, audience }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Question: ${question}`,
            `Audience: ${audience ?? 'external'}`,
            '',
            `Call kb_search and kb_trace_claim with audience=${audience ?? 'external'}, then use kb_get_document or kb_get_entity only for discovery details.`,
            'Search and entity results never establish a claim by themselves.',
            'From kb_trace_claim, treat only claims[] entries with matchProvenance.supportScope=claim_support and an *_exact match as direct support. Lexical candidates in discoveryMatches[] require human comparison; field path, citation title/text, or notes matches are metadata-only discovery.',
            'For external results, claimText may be redacted. Do not reconstruct or infer hidden text.',
            audience === 'internal'
              ? 'Internal material may be summarized only with its warnings and must not be described as externally citable.'
              : 'Every factual claim must be returned by kb_trace_claim with citation.usePolicy.externalCitable=true and evidenceAppraisal.assessment.externalGateSatisfied=true.',
            'Never use citable_with_note, internal_context, blocked_unsourced, failed, disputed, rejected, blocked, or do_not_use_for_claims material in an external answer.',
            'If no eligible citation remains, state that the KB does not currently support the claim externally.',
          ].join('\n'),
        },
      }],
    }),
  )

  server.registerPrompt(
    'claim_check',
    {
      title: 'Claim Check',
      description: 'Check whether a specific claim is supported, internally contextual, or blocked.',
      argsSchema: {
        claim: z.string().min(1).max(2_000),
        entityType: z.string().min(1).max(100).optional(),
        entityId: z.string().min(1).max(256).optional(),
        audience: audienceSchema.optional(),
      },
    },
    ({ claim, entityType, entityId, audience }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Claim: ${claim}`,
            `Audience: ${audience ?? 'external'}`,
            entityType ? `Entity type: ${entityType}` : '',
            entityId ? `Entity id: ${entityId}` : '',
            `Use kb_trace_claim with audience=${audience ?? 'external'} first.`,
            'Count direct support only in claims[] when matchProvenance.supportScope=claim_support and matchedBy includes claim_text_exact or citation_quote_exact.',
            'Treat lexical_candidate entries and matches through field_path, citation_title, citation_text, or citation_notes as discovery requiring human comparison, never as claim support.',
            'For external results, claimText may be redacted. Do not reconstruct or infer hidden text.',
            'For an external audience, support exists only when citation.usePolicy.externalCitable=true and evidenceAppraisal.assessment.externalGateSatisfied=true; this requires a public HTTP(S) source or archive locator plus a complete, current, direct, low-risk appraisal, and all failed, disputed, rejected, and non-external readiness states are blocked.',
            'If there is no eligible match, say the claim is not currently citable from the KB and suggest the smallest source-gap follow-up.',
          ].filter(Boolean).join('\n'),
        },
      }],
    }),
  )

  server.registerPrompt(
    'knowledge_gap_review',
    {
      title: 'Knowledge Gap Review',
      description: 'Review blocked or weakly sourced knowledge-base areas before external use.',
      argsSchema: {
        topic: z.string().max(500).optional(),
      },
    },
    ({ topic }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            topic ? `Topic: ${topic}` : 'Topic: general Food Systems KB gaps',
            'Call kb_list_gaps with audience=internal separately for issue=readiness, issue=needs_review, issue=missing_locator, issue=missing_appraisal, issue=stale_appraisal, and issue=incomplete_appraisal; each call uses an exact-match contract.',
            'Use kb_search with audience=internal only for triage context.',
            'Do not promote gap material, failed/rejected citations, or blocked library-analysis records into external claims.',
          ].join('\n'),
        },
      }],
    }),
  )
}

export async function runStdioServer() {
  const server = createFoodSystemsKbServer()
  await server.connect(new StdioServerTransport())
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runStdioServer().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
