import type { Metadata } from 'next'
import { getResearchPrompts } from '@/lib/queries/research-prompts'
import { PromptsContent } from './PromptsContent'

export const metadata: Metadata = {
  title: 'Deep research-prompter — Metodikk — Food Systems 2026',
  description: 'Prompt-maler for systematisk kunnskapsinnhenting via deep research-modeller',
}

export default async function PromptsPage() {
  let researchPrompts: Awaited<ReturnType<typeof getResearchPrompts>> = []
  try {
    researchPrompts = await getResearchPrompts()
  } catch (e) {
    console.error('[metodikk/prompts] DB query failed:', e)
  }
  return <PromptsContent researchPrompts={researchPrompts} />
}
