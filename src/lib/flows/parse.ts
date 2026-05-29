import { rLadderById } from '../data/r-ladder'
import { CIRCULARITY_ACTOR_MAP } from '../data/circularity-actor-map'
import type { RLevel, ValueChainSlot } from '../data/r-ladder'
import type { FlowEdge, FlowNode, FlowQuantity, LoopFlows } from './types'

export function parseVolume(input: string | undefined): FlowQuantity | undefined {
  if (!input) return undefined

  const pct = input.match(/~?\s*(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return { value: Number(pct[1].replace(',', '.')), unit: '%' }

  const m = input.match(/~?\s*(\d[\d.,]*)\s*([A-Za-zøæåØÆÅ%][A-Za-zøæåØÆÅ%]*(?:\/[A-Za-zøæåØÆÅ]+)?)/)
  if (!m) return undefined

  const value = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(value)) return undefined

  return { value, unit: m[2].trim() }
}

export type RawLoop = {
  id: string
  rLevel?: string
  volume?: string
  value_chain_step?: string[]
  flow?: string
  sources?: string[]
}

function nodeIdFrom(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `node-${index}`
}

export function parseLoopFlow(loop: RawLoop): LoopFlows {
  const segments = (loop.flow ?? '').split('→').map((s) => s.trim()).filter(Boolean)
  const rLevel: RLevel | undefined = loop.rLevel && loop.rLevel in rLadderById ? (loop.rLevel as RLevel) : undefined
  const valueChainStep = loop.value_chain_step?.[0] as ValueChainSlot | undefined
  const sourceRefs = (loop.sources ?? []).map((label) => ({ label }))
  const quantity = parseVolume(loop.volume)

  const seen = new Set<string>()
  const nodes: FlowNode[] = segments.map((label, i) => {
    let id = nodeIdFrom(label, i)
    let k = 1
    while (seen.has(id)) id = `${nodeIdFrom(label, i)}-${k++}`
    seen.add(id)
    const link = CIRCULARITY_ACTOR_MAP[label]
    return {
      id,
      type: link ? (link.type === 'company' ? 'company' : 'actor') : 'category',
      label,
      ...(link ? { ref: link.href } : {}),
      ...(valueChainStep ? { valueChainStep } : {}),
    }
  })

  const edges: FlowEdge[] = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({
      id: `${loop.id}-e${i}`,
      fromId: nodes[i].id,
      toId: nodes[i + 1].id,
      material: nodes[i].label,
      ...(rLevel ? { rLevel } : {}),
      ...(i === 0 && quantity ? { quantity } : {}),
      evidenceStatus: 'illustrative',
      sourceRefs,
    })
  }

  return { loopId: loop.id, nodes, edges }
}
