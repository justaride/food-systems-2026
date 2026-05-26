'use client'

import { NetworkMap, type NetworkTypeConfig } from '@/components/network/NetworkMap'
import type { NetworkEdge, NetworkNode, NetworkPreset } from '@/lib/network-map'

type GraphNode = NetworkNode & {
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source' | 'actor' | 'person' | 'property'
}

type GraphEdge = NetworkEdge

type Props = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const TYPE_CONFIG: Record<string, NetworkTypeConfig> = {
  document: { label: 'Dokument', color: '#059669', size: 6 },
  insight: { label: 'Innsikt', color: '#2563eb', size: 5 },
  thesis: { label: 'Akademia', color: '#7c3aed', size: 5 },
  company: { label: 'Selskap', color: '#e11d48', size: 7 },
  source: { label: 'Kilde', color: '#d97706', size: 4 },
  actor: { label: 'Aktør', color: '#0f766e', size: 6 },
  person: { label: 'Person', color: '#6d28d9', size: 6 },
  property: { label: 'Eiendom', color: '#ca8a04', size: 4 },
}

const DEFAULT_NODE_TYPES = ['document', 'insight', 'thesis', 'company', 'source', 'actor', 'person', 'property']

const FOOD_TG_MATCH_RULES: NetworkPreset['matchRules'] = [
  {
    field: 'tag',
    mode: 'exact',
    values: [
      'food-tg',
      'food tg',
      'nch',
      'nch-contract',
      'mandat',
      'mandate',
      'transition-group',
      'transition-groups',
    ],
  },
  {
    field: 'href',
    mode: 'includes',
    values: [
      'food-tg',
      'nch-contract',
      'transition-group',
      'transition-groups',
      'root-9-mars-2026-food',
      'root-2026-transition-group',
      'mandate-for-transition-group-food',
    ],
  },
  {
    field: 'label',
    mode: 'includes',
    values: [
      'food tg',
      'food systems transition group',
      'circular food transition group',
      'transition group food',
      'transition group overview',
      'transition groups',
      'nch transition',
    ],
  },
]

const GRAPH_PRESETS: NetworkPreset[] = [
  {
    id: 'connected',
    label: 'Koblet',
    description: 'Alt som faktisk har minst én synlig relasjon.',
    nodeTypes: DEFAULT_NODE_TYPES,
    showIsolated: false,
  },
  {
    id: 'evidence',
    label: 'Dokument/innsikt',
    description: 'Kilde-, dokument- og innsiktsnabolag.',
    nodeTypes: ['document', 'insight', 'thesis', 'source'],
    showIsolated: false,
  },
  {
    id: 'company',
    label: 'Selskap/eierskap',
    description: 'Selskap, personer, aktører og eiendommer.',
    nodeTypes: ['company', 'person', 'property', 'actor'],
    showIsolated: false,
  },
  {
    id: 'actors',
    label: 'Aktør',
    description: 'Aktører, selskapskoblinger og dokumentgrunnlag.',
    nodeTypes: ['actor', 'company', 'document'],
    showIsolated: false,
  },
  {
    id: 'supply',
    label: 'Forsyning',
    description: 'Forretningsrelasjoner, eiendom og forsyningsroller.',
    nodeTypes: ['company', 'property'],
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture', 'owns-property', 'leases-property'],
    showIsolated: false,
  },
  {
    id: 'food-tg',
    label: 'Food TG',
    description: 'Regelbasert Food TG-nabolag: eksplisitte tag-, rute- og tittelsignaler pluss direkte naboer.',
    nodeTypes: DEFAULT_NODE_TYPES,
    edgeTypes: ['insight-ref', 'actor-ref', 'company-ref', 'supports', 'references', 'cites'],
    showIsolated: false,
    matchRules: FOOD_TG_MATCH_RULES,
    includeMatchedNeighbors: true,
  },
  {
    id: 'all',
    label: 'Alle koblede',
    description: 'Alle nodetyper som har minst én relasjon i grafdatasettet.',
    nodeTypes: DEFAULT_NODE_TYPES,
    showIsolated: true,
  },
]

export function KnowledgeGraph({ nodes, edges }: Props) {
  return (
    <NetworkMap
      nodes={nodes}
      edges={edges}
      presets={GRAPH_PRESETS}
      defaultPresetId="connected"
      typeConfig={TYPE_CONFIG}
      maxRenderNodes={2000}
      inspectorLinkLabel="Åpne side"
    />
  )
}
