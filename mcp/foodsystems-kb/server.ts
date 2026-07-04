import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  kbGetDocument,
  kbGetEntity,
  kbListGaps,
  kbSearch,
  kbStatus,
  kbTraceClaim,
  readObsidianResource,
  readSchemaResource,
  type EntityType,
  type SearchMode,
} from './service'

export const SERVER_NAME = 'foodsystems-kb'
export const SERVER_VERSION = '1.0.0'

export const KB_MCP_INSTRUCTIONS = [
  'Food Systems KB is read-only. Use it to search, inspect entities, trace claims to citations, and review gaps.',
  'Do not claim external readiness unless citationReadiness says citable_external or citable_with_note.',
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

function toolResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  }
}

function resourceResult(uri: URL, text: string, mimeType = 'text/plain') {
  return {
    contents: [{ uri: uri.href, mimeType, text }],
  }
}

export function createFoodSystemsKbServer() {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: KB_MCP_INSTRUCTIONS },
  )

  server.registerTool(
    'kb_status',
    {
      title: 'Food Systems KB Status',
      description: 'Check database connectivity, semantic search availability, row counts, and Obsidian vault presence.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => toolResult(await kbStatus()),
  )

  server.registerTool(
    'kb_search',
    {
      title: 'Search Food Systems KB',
      description: 'Search documents, insights, sources, companies, actors, people, and relationships.',
      inputSchema: {
        query: z.string().describe('Non-empty search query.'),
        limit: z.number().int().min(1).max(25).optional().describe('Maximum result count, capped at 25.'),
        mode: searchModeSchema.optional().describe('keyword, semantic, or hybrid.'),
        types: z.array(z.string()).optional().describe('Optional result-type allow list.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit, mode, types }) => toolResult(await kbSearch({
      query,
      limit,
      mode: mode as SearchMode | undefined,
      types,
    })),
  )

  server.registerTool(
    'kb_get_document',
    {
      title: 'Get Food Systems Document',
      description: 'Retrieve document metadata, capped content, links, and citation readiness by slug or id.',
      inputSchema: {
        slug: z.string().optional(),
        id: z.string().optional(),
        includeContent: z.boolean().optional(),
        contentWindow: z.number().int().min(500).max(20_000).optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => toolResult(await kbGetDocument(input)),
  )

  server.registerTool(
    'kb_get_entity',
    {
      title: 'Get Food Systems Entity',
      description: 'Retrieve a company, actor, or person profile with relationships and source status.',
      inputSchema: {
        type: entityTypeSchema,
        id: z.string().describe('Entity id, slug, orgNr, personKey, or exact name.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ type, id }) => toolResult(await kbGetEntity({ type: type as EntityType, id })),
  )

  server.registerTool(
    'kb_trace_claim',
    {
      title: 'Trace Food Systems Claim',
      description: 'Find matching field/source citations and return claim text, locators, readiness, and confidence.',
      inputSchema: {
        query: z.string(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        limit: z.number().int().min(1).max(25).optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => toolResult(await kbTraceClaim(input)),
  )

  server.registerTool(
    'kb_list_gaps',
    {
      title: 'List Food Systems Evidence Gaps',
      description: 'List citations matching a readiness level plus needs-review or locator-missing citations, with linked field claims.',
      inputSchema: {
        limit: z.number().int().min(1).max(25).optional(),
        readiness: citationReadinessSchema.optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => toolResult(await kbListGaps(input)),
  )

  server.registerResource(
    'schema',
    'foodsystems://schema',
    {
      title: 'Food Systems Prisma Schema',
      description: 'Current committed Prisma schema for the knowledge base.',
      mimeType: 'text/plain',
    },
    async (uri) => resourceResult(uri, await readSchemaResource()),
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
      JSON.stringify(await kbGetDocument({ slug: String(slug) }), null, 2),
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
    async (uri, { type, id }) => {
      const parsedType = entityTypeSchema.parse(type)
      return resourceResult(
        uri,
        JSON.stringify(await kbGetEntity({ type: parsedType as EntityType, id: String(id) }), null, 2),
        'application/json',
      )
    },
  )

  server.registerResource(
    'obsidian',
    new ResourceTemplate('foodsystems://obsidian/{path}', { list: undefined }),
    {
      title: 'Food Systems Obsidian Note',
      description: 'Read a Markdown note from the optional Food Systems Obsidian vault with path traversal protection.',
      mimeType: 'text/markdown',
    },
    async (uri, { path }) => resourceResult(uri, await readObsidianResource(String(path)), 'text/markdown'),
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
        question: z.string(),
      },
    },
    ({ question }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Question: ${question}`,
            '',
            'Use foodsystems-kb tools in this order: kb_search, kb_trace_claim for key claims, then kb_get_document or kb_get_entity for details.',
            'Only present externally usable claims when citationReadiness is citable_external or citable_with_note. Clearly mark internal_context and blocked_unsourced material.',
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
        claim: z.string(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
      },
    },
    ({ claim, entityType, entityId }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Claim: ${claim}`,
            entityType ? `Entity type: ${entityType}` : '',
            entityId ? `Entity id: ${entityId}` : '',
            'Use kb_trace_claim first. If there is no match, say the claim is not currently citable from the KB and suggest the smallest source-gap follow-up.',
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
        topic: z.string().optional(),
      },
    },
    ({ topic }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            topic ? `Topic: ${topic}` : 'Topic: general Food Systems KB gaps',
            'Use kb_list_gaps and kb_search. Group findings by blocked_unsourced, internal_context, missing locator, and needs_review. Do not promote gap material into external claims.',
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

if (import.meta.url === `file://${process.argv[1]}`) {
  runStdioServer().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
