import {
  KB_MCP_INSTRUCTIONS,
  REGISTERED_PROMPTS,
  REGISTERED_RESOURCES,
  REGISTERED_TOOLS,
  createFoodSystemsKbServer,
} from './server'

const server = createFoodSystemsKbServer()

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

async function main() {
  await server.close().catch(() => undefined)

  console.log(JSON.stringify({
    name: 'foodsystems-kb',
    instructions: KB_MCP_INSTRUCTIONS,
    tools: REGISTERED_TOOLS,
    resources: REGISTERED_RESOURCES,
    prompts: REGISTERED_PROMPTS,
  }, null, 2))
}
