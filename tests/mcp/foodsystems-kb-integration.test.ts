import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { describe, it } from 'node:test'
import {
  KB_MCP_INSTRUCTIONS,
  REGISTERED_PROMPTS,
  REGISTERED_TOOLS,
  createFoodSystemsKbServer,
  type FoodSystemsKbServices,
} from '../../mcp/foodsystems-kb/server'

type McpHarness = {
  client: Client
  close: () => Promise<void>
}

async function createHarness(overrides: Partial<FoodSystemsKbServices>): Promise<McpHarness> {
  const server = createFoodSystemsKbServer(overrides)
  const client = new Client({ name: 'foodsystems-kb-test', version: '1.0.0' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await server.connect(serverTransport)
  await client.connect(clientTransport)

  return {
    client,
    close: async () => {
      await client.close().catch(() => undefined)
      await server.close().catch(() => undefined)
    },
  }
}

function firstText(result: unknown): string {
  assert.ok(result && typeof result === 'object' && 'content' in result)
  const content = (result as { content: unknown }).content
  assert.ok(Array.isArray(content))
  const block = content.find((item) => (
    item
    && typeof item === 'object'
    && 'type' in item
    && item.type === 'text'
    && 'text' in item
    && typeof item.text === 'string'
  )) as { text: string } | undefined
  assert.ok(block)
  return block.text
}

describe('Food Systems KB MCP in-memory protocol', () => {
  it('starts as a real stdio child process from an absolute path with spaces', async () => {
    const outsideRepo = mkdtempSync(resolve(tmpdir(), 'foodsystems-kb-cwd-'))
    const client = new Client({ name: 'foodsystems-kb-stdio-test', version: '1.0.0' })
    const transport = new StdioClientTransport({
      command: resolve('node_modules/.bin/tsx'),
      args: [resolve('mcp/foodsystems-kb/server.ts')],
      cwd: outsideRepo,
      stderr: 'pipe',
      env: Object.fromEntries([
        ['HOME', process.env.HOME],
        ['PATH', process.env.PATH],
        ['TMPDIR', process.env.TMPDIR],
      ].filter((entry): entry is [string, string] => Boolean(entry[1]))),
    })

    try {
      await client.connect(transport)
      const tools = await client.listTools()
      assert.deepEqual(
        tools.tools.map(tool => tool.name).sort(),
        [...REGISTERED_TOOLS].sort(),
      )
      const schema = await client.readResource({ uri: 'foodsystems://schema' })
      const schemaContent = schema.contents[0]
      assert.ok(schemaContent && 'text' in schemaContent)
      assert.match(schemaContent.text, /model Document/)
    } finally {
      await client.close().catch(() => undefined)
      rmSync(outsideRepo, { recursive: true, force: true })
    }
  })

  it('negotiates MCP, lists the curated surface, and applies external audience by default', async () => {
    let receivedAudience: string | undefined
    let receivedTypes: string[] | undefined
    let receivedGapAudience: string | undefined
    let receivedGapIssue: string | undefined
    const harness = await createHarness({
      kbSearch: async (input) => {
        receivedAudience = input.audience
        receivedTypes = input.types
        return {
          query: input.query,
          audience: input.audience,
          results: [],
        }
      },
      kbListGaps: async (input) => {
        receivedGapAudience = input.audience
        receivedGapIssue = input.issue
        return { audience: input.audience, gaps: [] }
      },
      readSchemaResource: async () => 'model Document {}',
    })

    try {
      const tools = await harness.client.listTools()
      assert.deepEqual(
        tools.tools.map((tool) => tool.name).sort(),
        [...REGISTERED_TOOLS].sort(),
      )
      assert.ok(tools.tools.every((tool) => tool.annotations?.readOnlyHint === true))
      const traceTool = tools.tools.find((tool) => tool.name === 'kb_trace_claim')
      assert.ok(traceTool?.description)
      assert.match(traceTool.description, /Only an exact normalized claimText or citation quote match can establish direct claim support/)
      assert.match(traceTool.description, /lexical candidate for human comparison/)
      assert.match(traceTool.description, /metadata-only discovery/)
      assert.match(traceTool.description, /External claimText may be redacted/)
      assert.match(KB_MCP_INSTRUCTIONS, /exact normalized match to stored claimText or citation\.quote/)
      assert.match(KB_MCP_INSTRUCTIONS, /Substring overlap is a lexical candidate/)
      assert.match(KB_MCP_INSTRUCTIONS, /metadata-only discovery/)
      assert.match(KB_MCP_INSTRUCTIONS, /External claimText may be redacted/)
      assert.match(KB_MCP_INSTRUCTIONS, /public HTTP\(S\) source or archive locator/)
      assert.match(KB_MCP_INSTRUCTIONS, /evidenceAppraisal\.assessment\.externalGateSatisfied/)

      const prompts = await harness.client.listPrompts()
      assert.deepEqual(
        prompts.prompts.map((prompt) => prompt.name).sort(),
        [...REGISTERED_PROMPTS].sort(),
      )

      const search = await harness.client.callTool({
        name: 'kb_search',
        arguments: { query: 'matsvinn' },
      })
      assert.equal(search.isError, undefined)
      assert.equal(receivedAudience, 'external')
      assert.match(firstText(search), /"audience": "external"/)

      const reportSearch = await harness.client.callTool({
        name: 'kb_search',
        arguments: { query: 'lönsamhet', types: ['report'], limit: 1 },
      })
      assert.equal(reportSearch.isError, undefined)
      assert.deepEqual(receivedTypes, ['report'])

      await harness.client.callTool({
        name: 'kb_list_gaps',
        arguments: {},
      })
      assert.equal(receivedGapAudience, 'external')

      await harness.client.callTool({
        name: 'kb_list_gaps',
        arguments: { issue: 'missing_appraisal' },
      })
      assert.equal(receivedGapIssue, 'missing_appraisal')

      const prompt = await harness.client.getPrompt({
        name: 'answer_with_citations',
        arguments: { question: 'Hva vet vi?' },
      })
      const promptText = prompt.messages
        .map((message) => message.content.type === 'text' ? message.content.text : '')
        .join('\n')
      assert.match(promptText, /externalCitable=true/)
      assert.match(promptText, /evidenceAppraisal\.assessment\.externalGateSatisfied=true/)
      assert.match(promptText, /Never use citable_with_note/i)
      assert.match(promptText, /supportScope=claim_support/)
      assert.match(promptText, /\*_exact match/)
      assert.match(promptText, /Lexical candidates.*human comparison/)
      assert.match(promptText, /discoveryMatches\[\].*metadata-only discovery/)
      assert.match(promptText, /claimText may be redacted/)

      const claimCheck = await harness.client.getPrompt({
        name: 'claim_check',
        arguments: { claim: 'Markedskonsentrasjonen er h\u00f8y.' },
      })
      const claimCheckText = claimCheck.messages
        .map((message) => message.content.type === 'text' ? message.content.text : '')
        .join('\n')
      assert.match(claimCheckText, /matchedBy includes claim_text_exact or citation_quote_exact/)
      assert.match(claimCheckText, /lexical_candidate entries.*human comparison/)
      assert.match(claimCheckText, /claimText may be redacted/)
      assert.match(claimCheckText, /public HTTP\(S\) source or archive locator/)
      assert.match(claimCheckText, /evidenceAppraisal\.assessment\.externalGateSatisfied=true/)

      const invalidTrace = await harness.client.callTool({
        name: 'kb_trace_claim',
        arguments: { query: 'a' },
      })
      assert.equal(invalidTrace.isError, true)

      const schema = await harness.client.readResource({ uri: 'foodsystems://schema' })
      const schemaContent = schema.contents[0]
      assert.ok(schemaContent && 'text' in schemaContent)
      assert.equal(schemaContent.text, 'model Document {}')
    } finally {
      await harness.close()
    }
  })

  it('redacts unexpected service errors from tool responses', async () => {
    const harness = await createHarness({
      kbSearch: async () => {
        throw new Error('postgres://db-user:secret-password@private-host/foodsystems')
      },
      readObsidianResource: async () => {
        throw new Error('/private/vault/.obsidian/plugins/secret.js')
      },
    })

    try {
      const result = await harness.client.callTool({
        name: 'kb_search',
        arguments: { query: 'private' },
      })
      const responseText = firstText(result)

      assert.equal(result.isError, true)
      assert.match(responseText, /kb_request_failed/)
      assert.doesNotMatch(responseText, /secret-password|private-host|postgres:\/\//)

      await assert.rejects(
        () => harness.client.readResource({ uri: 'foodsystems://obsidian/test.md' }),
        (error: unknown) => {
          assert.ok(error instanceof Error)
          assert.match(error.message, /kb_request_failed/)
          assert.doesNotMatch(error.message, /private\/vault|secret\.js/)
          return true
        },
      )
    } finally {
      await harness.close()
    }
  })
})
