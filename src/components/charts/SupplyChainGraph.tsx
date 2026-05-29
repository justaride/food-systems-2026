'use client'

import { NetworkMap, type NetworkTypeConfig } from '@/components/network/NetworkMap'
import type { NetworkEdge, NetworkNode, NetworkPreset } from '@/lib/network-map'

type Props = {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  stageColors: Record<string, string>
  relationshipColors: Record<string, string>
  selectedRelationshipId?: string | null
  selectedNodeId?: string | null
  onNodeClick?: (nodeId: string | null) => void
}

const STAGE_LABELS: Record<string, string> = {
  retail: 'Dagligvare',
  processing: 'Foredling',
  seafood: 'Sjømat',
  inputs: 'Innsatsmidler',
  logistics: 'Logistikk',
  circular: 'Sirkulær',
  research: 'Forskning',
  foodservice: 'Foodservice',
  'export-promotion': 'Export-promotion',
  company: 'Selskap',
  document: 'Dokument',
  source: 'Kilde',
}

const EDGE_LABELS: Record<string, string> = {
  supplier: 'Leverandør',
  buyer: 'Kjøper',
  distributor: 'Distributør',
  franchisor: 'Franchisegiver',
  'self-dealing': 'Egenhandel',
  'joint-venture': 'Joint venture',
  'company-ref': 'Dokumentbevis',
}

const COMPANY_STAGE_TYPES = [
  'retail',
  'processing',
  'seafood',
  'inputs',
  'logistics',
  'circular',
  'research',
  'foodservice',
  'export-promotion',
  'company',
]

const SUPPLY_PRESETS: NetworkPreset[] = [
  {
    id: 'power',
    label: 'Maktrelasjoner',
    description: 'Kuraterte forretningsrelasjoner. Bruk Bevis/kilder for dokumentlaget.',
    nodeTypes: [...COMPANY_STAGE_TYPES, 'document', 'source'],
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture'],
    showIsolated: false,
  },
  {
    id: 'supplier-buyer',
    label: 'Leverandør/kjøper',
    description: 'Retter oppmerksomheten mot leverandør- og kjøpermakt.',
    nodeTypes: COMPANY_STAGE_TYPES,
    edgeTypes: ['supplier', 'buyer'],
    showIsolated: false,
  },
  {
    id: 'self-dealing',
    label: 'Egenhandel',
    description: 'Interne handelsrelasjoner og konsernnære koblinger.',
    nodeTypes: COMPANY_STAGE_TYPES,
    edgeTypes: ['self-dealing'],
    showIsolated: false,
  },
  {
    id: 'food-tg',
    label: 'Food TG',
    description: 'Food TG-signaler fra dokumenttagger, titler og direkte nabolag.',
    nodeTypes: [...COMPANY_STAGE_TYPES, 'document', 'source'],
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture', 'company-ref'],
    showIsolated: false,
    includeMatchedNeighbors: true,
    matchRules: [
      { field: 'tag', mode: 'exact', values: ['food-tg', 'food tg', 'transition-group', 'transition-groups', 'mandat'] },
      { field: 'href', mode: 'includes', values: ['food-tg', 'transition-group', 'mandat'] },
      { field: 'label', mode: 'includes', values: ['food tg', 'transition group', 'nch'] },
    ],
  },
  {
    id: 'evidence',
    label: 'Bevis/kilder',
    description: 'Dokumentnoder og relasjoner som viser hvorfor en kobling finnes.',
    nodeTypes: [...COMPANY_STAGE_TYPES, 'document', 'source'],
    edgeTypes: ['company-ref'],
    showIsolated: false,
  },
  {
    id: 'stage-country',
    label: 'Land/ledd',
    description: 'Selskaper gruppert etter verdikjedeledd og land, med alle relasjonstyper aktive.',
    nodeTypes: COMPANY_STAGE_TYPES,
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture'],
    showIsolated: false,
  },
]

export function SupplyChainGraph({
  nodes,
  edges,
  stageColors,
  relationshipColors,
  selectedRelationshipId = null,
  selectedNodeId,
  onNodeClick,
}: Props) {
  const typeConfig: Record<string, NetworkTypeConfig> = {
    document: { label: STAGE_LABELS.document, color: '#059669', size: 5 },
    source: { label: STAGE_LABELS.source, color: '#d97706', size: 4 },
    company: { label: STAGE_LABELS.company, color: '#78716c', size: 6 },
  }

  for (const type of COMPANY_STAGE_TYPES) {
    typeConfig[type] = {
      label: STAGE_LABELS[type] ?? type,
      color: stageColors[type] ?? '#78716c',
      size: type === 'retail' || type === 'processing' ? 8 : 6,
    }
  }

  return (
    <NetworkMap
      nodes={nodes}
      edges={edges}
      presets={SUPPLY_PRESETS}
      defaultPresetId="power"
      typeConfig={typeConfig}
      edgeLabels={EDGE_LABELS}
      edgeColors={relationshipColors}
      maxRenderNodes={500}
      selectedEdgeId={selectedRelationshipId}
      selectedNodeId={selectedNodeId}
      onNodeSelect={onNodeClick}
      inspectorLinkLabel="Åpne side"
      emptyTitle="Ingen forsyningskjede-graf"
      emptyMessage="Databasen returnerte ingen relasjoner for denne arbeidsflaten."
    />
  )
}
