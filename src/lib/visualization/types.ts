export type EvidenceStatus = 'observed' | 'estimated' | 'proxy' | 'illustrative'

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
