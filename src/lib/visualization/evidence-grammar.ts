import { evidenceStatusOrder, getEvidenceStatusConfig } from './status'
import type { EvidenceStatus } from './types'

export type EvidenceLinePattern = 'solid' | 'dashed' | 'dotted' | 'long-dashed'

export type EvidenceGrammarToken = {
  status: EvidenceStatus
  label: string
  description: string
  pattern: EvidenceLinePattern
  lineClassName: string
  svgDasharray?: string
}

const EVIDENCE_LINE_PATTERN: Record<
  EvidenceStatus,
  Pick<EvidenceGrammarToken, 'pattern' | 'lineClassName' | 'svgDasharray'>
> = {
  observed: {
    pattern: 'solid',
    lineClassName: 'evidence-line--observed',
  },
  estimated: {
    pattern: 'dashed',
    lineClassName: 'evidence-line--estimated',
    svgDasharray: '10 5',
  },
  proxy: {
    pattern: 'dotted',
    lineClassName: 'evidence-line--proxy',
    svgDasharray: '2 6',
  },
  illustrative: {
    pattern: 'long-dashed',
    lineClassName: 'evidence-line--illustrative',
    svgDasharray: '16 9',
  },
}

export const evidenceGrammar: readonly EvidenceGrammarToken[] = evidenceStatusOrder.map(status => {
  const config = getEvidenceStatusConfig(status)
  return {
    status,
    label: config.label,
    description: config.description,
    ...EVIDENCE_LINE_PATTERN[status],
  }
})

export function getEvidenceGrammarToken(status: EvidenceStatus): EvidenceGrammarToken {
  return evidenceGrammar.find(token => token.status === status)!
}
