import type { GraphEdge, GraphNode } from '@/lib/queries/graph'

export type GraphIsolateAction =
  | 'intentional_catalog'
  | 'missing_evidence_link'
  | 'missing_actor_relationship'
  | 'missing_person_role'
  | 'needs_review'

export type GraphIsolateClassification = {
  action: GraphIsolateAction
  actionable: boolean
  rationale: string
}

export type GraphIsolateRecord = GraphIsolateClassification & {
  id: string
  label: string
  type: GraphNode['type']
  href?: string
  tags?: string[]
}

export type GraphIsolateSummary = {
  total: number
  actionable: number
  intentional: number
  byAction: Partial<Record<GraphIsolateAction, number>>
  byType: Partial<Record<GraphNode['type'], number>>
  samples: GraphIsolateRecord[]
}

const CATALOG_DOCUMENT_TAGS = new Set([
  '_plans',
  'academic',
  'bibliotek',
  'research',
  'dataset',
  'external',
  'evidence-pack',
  'external-source',
  'intake',
  'meeting',
  'meeting-note',
  'meeting-summary',
  'norden',
  'pdf',
  'project',
  'review',
  'regulatory',
  'thesis',
  'transcript',
  'transkripsjon',
  'sirkularitet-sprint-2026-05',
  'internal_register',
  'internal_synthesis',
  'youtube',
])

const CATALOG_DOCUMENT_TAG_PREFIXES = [
  'akademia/',
  'forskningsrunde-',
  'landbrukarena_transcripts',
  'media/',
  'okologisk-norden',
  'perplexity-',
]

function endpointId(endpoint: unknown): string {
  if (typeof endpoint === 'string') return endpoint
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) {
    const id = (endpoint as { id?: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

function increment<T extends string>(map: Partial<Record<T, number>>, key: T) {
  map[key] = (map[key] ?? 0) + 1
}

export function classifyGraphIsolate(node: GraphNode): GraphIsolateClassification {
  const tags = new Set((node.tags ?? []).map(tag => tag.toLowerCase()))

  if (
    node.type === 'document' &&
    [...tags].some(tag =>
      CATALOG_DOCUMENT_TAGS.has(tag) ||
      CATALOG_DOCUMENT_TAG_PREFIXES.some(prefix => tag.startsWith(prefix)),
    )
  ) {
    return {
      action: 'intentional_catalog',
      actionable: false,
      rationale: 'Standalone source, research, or register document',
    }
  }

  if (node.type === 'actor') {
    return {
      action: 'missing_actor_relationship',
      actionable: true,
      rationale: 'Actor has no ActorRelationship, ActorDocumentRef, or company link',
    }
  }

  if (node.type === 'person') {
    return {
      action: 'missing_person_role',
      actionable: true,
      rationale: 'PersonProfile has no graph role or board-member edge',
    }
  }

  if (node.type === 'insight' || node.type === 'thesis' || node.type === 'document') {
    return {
      action: 'missing_evidence_link',
      actionable: true,
      rationale: 'Node is not linked to supporting evidence',
    }
  }

  return {
    action: 'needs_review',
    actionable: true,
    rationale: 'Isolated graph node needs manual classification',
  }
}

export function analyzeGraphIsolates(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sampleLimit = 50,
): GraphIsolateSummary {
  const degreeById = new Map<string, number>()
  for (const edge of edges) {
    const source = endpointId(edge.source)
    const target = endpointId(edge.target)
    degreeById.set(source, (degreeById.get(source) ?? 0) + 1)
    degreeById.set(target, (degreeById.get(target) ?? 0) + 1)
  }

  const summary: GraphIsolateSummary = {
    total: 0,
    actionable: 0,
    intentional: 0,
    byAction: {},
    byType: {},
    samples: [],
  }
  const actionableSamples: GraphIsolateRecord[] = []
  const intentionalSamples: GraphIsolateRecord[] = []

  for (const node of nodes) {
    if ((degreeById.get(node.id) ?? 0) > 0) continue

    const classification = classifyGraphIsolate(node)
    summary.total += 1
    if (classification.actionable) summary.actionable += 1
    else summary.intentional += 1
    increment(summary.byAction, classification.action)
    increment(summary.byType, node.type)

    const record: GraphIsolateRecord = {
      id: node.id,
      label: node.label,
      type: node.type,
      ...(node.href ? { href: node.href } : {}),
      ...(node.tags?.length ? { tags: node.tags } : {}),
      ...classification,
    }

    if (classification.actionable) actionableSamples.push(record)
    else intentionalSamples.push(record)
  }

  summary.samples = [...actionableSamples, ...intentionalSamples].slice(0, sampleLimit)

  return summary
}
