import { getResearchPrompts } from '@/lib/queries/research-prompts'
import { ForskningContent } from './ForskningContent'

export default async function ForskningPage() {
  const researchPrompts = await getResearchPrompts()
  return <ForskningContent researchPrompts={researchPrompts} />
}
