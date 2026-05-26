import { inferGraphConfidence } from '@/lib/graph-confidence'
import type { NetworkEdge, NetworkNode } from '@/lib/network-map'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'

export type SupplyChainCompanyNetworkSelection = {
  id: string
  name: string
  valueChainStage: string | null
  country: string
}

export type SupplyChainRelationshipNetworkRow = {
  id: string
  fromCompanyId: string
  toCompanyId: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: number | null
  source: string | null
  metadata: unknown
  verificationStatus: string | null
  fromCompany: SupplyChainCompanyNetworkSelection
  toCompany: SupplyChainCompanyNetworkSelection
}

export type SupplyChainCompanyDocumentRefRow = {
  companyId: string
  context: string | null
  document: {
    id: string
    slug: string
    title: string
    tags: string[]
    category: string | null
  }
}

export type SupplyChainNetworkNode = NetworkNode & {
  valueChainStage?: string | null
}

export type SupplyChainNetworkEdge = NetworkEdge & {
  relationshipType: string
}

export type SupplyChainNetworkStats = {
  totalRelationships: number
  companiesInvolved: number
  byType: Record<string, number>
}

export type SupplyChainNetworkData = {
  nodes: SupplyChainNetworkNode[]
  edges: SupplyChainNetworkEdge[]
  stats: SupplyChainNetworkStats
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  supplier: 'Leverandor',
  buyer: 'Kjoper',
  distributor: 'Distributor',
  franchisor: 'Franchisegiver',
  'self-dealing': 'Egenhandel',
  'joint-venture': 'Joint venture',
  'company-ref': 'Dokument',
}

function evidenceStatusFromVerificationStatus(status: string | null | undefined): ResearchEvidenceStatus {
  const normalized = status?.toLowerCase().trim()
  if (!normalized) return 'proxy_model'
  if (['validated', 'ready_to_use', 'human_verified', 'machine_verified'].includes(normalized)) return 'validated'
  if (['primary_snapshot_confirmed', 'partial_primary_snapshot'].includes(normalized)) return 'primary_snapshot'
  if (['proxy', 'proxy_model', 'estimated', 'method_decision_recorded'].includes(normalized)) return 'proxy_model'
  if (['needs_primary_check', 'needs_harmonization', 'in_progress', 'needs_actor_validation'].includes(normalized)) {
    return 'local_research_needs_primary_check'
  }
  return 'missing'
}

function addCompanyNode(map: Map<string, SupplyChainNetworkNode>, company: SupplyChainCompanyNetworkSelection) {
  if (map.has(company.id)) return
  map.set(company.id, {
    id: company.id,
    label: company.name,
    type: company.valueChainStage ?? 'company',
    href: `/selskap/${company.id}`,
    country: company.country,
    stage: company.valueChainStage,
    valueChainStage: company.valueChainStage,
    tags: [company.country, company.valueChainStage].filter((value): value is string => Boolean(value)),
    evidenceStatus: 'validated',
  })
}

function incrementType(stats: Record<string, number>, type: string) {
  stats[type] = (stats[type] ?? 0) + 1
}

export function buildSupplyChainNetwork({
  relationships,
  companyDocumentRefs,
}: {
  relationships: SupplyChainRelationshipNetworkRow[]
  companyDocumentRefs: SupplyChainCompanyDocumentRefRow[]
}): SupplyChainNetworkData {
  const companyMap = new Map<string, SupplyChainNetworkNode>()
  const byType: Record<string, number> = {}
  const edges: SupplyChainNetworkEdge[] = []

  for (const rel of relationships) {
    addCompanyNode(companyMap, rel.fromCompany)
    addCompanyNode(companyMap, rel.toCompany)

    const confidence = inferGraphConfidence(rel.metadata, rel.source)
    incrementType(byType, rel.relationshipType)
    edges.push({
      id: rel.id,
      source: rel.fromCompanyId,
      target: rel.toCompanyId,
      type: rel.relationshipType,
      relationshipType: rel.relationshipType,
      label: RELATIONSHIP_LABELS[rel.relationshipType] ?? rel.relationshipType,
      description: rel.description,
      sector: rel.sector,
      estimatedValue: rel.estimatedValue,
      href: `/forsyningskjede?relationship=${encodeURIComponent(rel.id)}`,
      evidenceStatus: evidenceStatusFromVerificationStatus(rel.verificationStatus),
      ...(confidence.confidence !== undefined ? { confidence: confidence.confidence } : {}),
      ...(confidence.sourceLabel ? { sourceLabel: confidence.sourceLabel } : {}),
    })
  }

  const companyIds = new Set(companyMap.keys())
  const documentMap = new Map<string, SupplyChainNetworkNode>()
  for (const ref of companyDocumentRefs) {
    if (!companyIds.has(ref.companyId)) continue

    const documentId = `document:${ref.document.id}`
    if (!documentMap.has(documentId)) {
      documentMap.set(documentId, {
        id: documentId,
        label: ref.document.title,
        type: 'document',
        href: `/bibliotek/${ref.document.slug}`,
        tags: ref.document.tags,
        evidenceStatus: 'primary_snapshot',
      })
    }

    incrementType(byType, 'company-ref')
    edges.push({
      source: documentId,
      target: ref.companyId,
      type: 'company-ref',
      relationshipType: 'company-ref',
      label: RELATIONSHIP_LABELS['company-ref'],
      sourceLabel: ref.context ?? ref.document.category ?? 'company-ref',
      evidenceStatus: 'primary_snapshot',
    })
  }

  return {
    nodes: [...companyMap.values(), ...documentMap.values()],
    edges,
    stats: {
      totalRelationships: relationships.length,
      companiesInvolved: companyMap.size,
      byType,
    },
  }
}
