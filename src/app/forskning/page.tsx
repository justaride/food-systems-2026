import { getResearchPrompts } from '@/lib/queries/research-prompts'
import { ForskningContent } from './ForskningContent'

export default async function ForskningPage() {
  let researchPrompts: Awaited<ReturnType<typeof getResearchPrompts>> = []
  try {
    researchPrompts = await getResearchPrompts()
  } catch (e) {
    console.error('[forskning] DB query failed:', e)
  }
  return <ForskningContent researchPrompts={researchPrompts} />
}
