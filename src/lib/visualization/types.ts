export type EvidenceStatus = 'observed' | 'estimated' | 'proxy' | 'illustrative'

export type ResearchEvidenceStatus =
  | 'validated'
  | 'primary_snapshot'
  | 'proxy_model'
  | 'local_research_needs_primary_check'
  | 'missing'

export type VisualizationSourceRef = {
  label: string
  href?: string
  path?: string
}

export type VisualizationDataContract = {
  question: string
  unit: string
  period: string
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
  coverageNote?: string
}
