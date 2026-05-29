import type { EvidenceStatus, VisualizationSourceRef } from '../visualization/types'
import type { RLevel, ValueChainSlot } from '../data/r-ladder'

export type FlowNodeType = 'actor' | 'company' | 'location' | 'category' | 'process'

export type FlowNode = {
  id: string
  type: FlowNodeType
  label: string
  ref?: string
  valueChainStep?: ValueChainSlot
}

export type FlowQuantity = { value: number; unit: string }

export type FlowEdge = {
  id: string
  fromId: string
  toId: string
  material: string
  process?: string
  rLevel?: RLevel
  quantity?: FlowQuantity
  year?: number
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
}

export type LoopFlows = { loopId: string; nodes: FlowNode[]; edges: FlowEdge[] }
export type MaterialFlowsFile = { generated: string; description: string; loops: LoopFlows[] }

export type FlowIssueCode =
  | 'observed_without_citable_source'
  | 'sourced_status_without_source'
  | 'quantity_without_unit'
  | 'dangling_node_ref'
  | 'invalid_rlevel'
  | 'unknown_actor_ref'
  | 'unknown_loop_id'

export type FlowIssue = {
  code: FlowIssueCode
  severity: 'blocking' | 'warning'
  loopId: string
  edgeId?: string
  message: string
}
