export type ValueChainDisplayLane =
  | 'validated'
  | 'primary_snapshot'
  | 'proxy_model'
  | 'local_research_needs_primary_check'
  | 'missing'

export function displayLaneFromReviewStatus(status: string | undefined): ValueChainDisplayLane {
  switch (status) {
    case 'ready_to_use':
    case 'validated':
    case 'closed_for_annual_panel':
      return 'validated'
    case 'primary_snapshot_confirmed':
    case 'partial_primary_snapshot':
    case 'method_decision_recorded':
      return 'primary_snapshot'
    case 'proxy':
    case 'proxy_model':
    case 'estimated':
      return 'proxy_model'
    case 'needs_primary_check':
    case 'local_research_needs_primary_check':
    case 'needs_harmonization':
    case 'in_progress':
      return 'local_research_needs_primary_check'
    case 'missing':
    case 'not_started':
    default:
      return 'missing'
  }
}

export function valueChainFieldGapLabel(missingVolumeSteps: string[], missingWasteSteps: string[]): string {
  const parts = [
    missingVolumeSteps.length > 0 ? `Volum: ${missingVolumeSteps.length}` : null,
    missingWasteSteps.length > 0 ? `Avfall: ${missingWasteSteps.length}` : null,
  ].filter((part): part is string => part !== null)

  return parts.length > 0 ? parts.join(' / ') : 'Ingen feltgap'
}
