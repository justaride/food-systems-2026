import { rLadderById } from '../data/r-ladder'
import { CIRCULARITY_ACTOR_MAP } from '../data/circularity-actor-map'
import type { VisualizationSourceRef } from '../visualization/types'
import type { FlowIssue, MaterialFlowsFile } from './types'

const KNOWN_HREFS = new Set(Object.values(CIRCULARITY_ACTOR_MAP).map((l) => l.href))

function isCitable(refs: VisualizationSourceRef[]): boolean {
  return refs.some(
    (r) => r.citationReadiness === 'citable_external' || r.citationReadiness === 'citable_with_note' || !!r.href || !!r.path,
  )
}

export function validateMaterialFlows(file: MaterialFlowsFile, knownLoopIds?: Set<string>): FlowIssue[] {
  const issues: FlowIssue[] = []
  for (const loop of file.loops) {
    if (knownLoopIds && !knownLoopIds.has(loop.loopId)) {
      issues.push({
        code: 'unknown_loop_id',
        severity: 'blocking',
        loopId: loop.loopId,
        message: `loopId "${loop.loopId}" not in circularity-loops.json`,
      })
    }
    const nodeIds = new Set(loop.nodes.map((n) => n.id))
    for (const n of loop.nodes) {
      if (n.ref && !KNOWN_HREFS.has(n.ref)) {
        issues.push({
          code: 'unknown_actor_ref',
          severity: 'warning',
          loopId: loop.loopId,
          message: `node ref "${n.ref}" not in CIRCULARITY_ACTOR_MAP`,
        })
      }
    }
    for (const e of loop.edges) {
      if (!nodeIds.has(e.fromId) || !nodeIds.has(e.toId)) {
        issues.push({
          code: 'dangling_node_ref',
          severity: 'blocking',
          loopId: loop.loopId,
          edgeId: e.id,
          message: `edge "${e.id}" endpoints must resolve to nodes in the same loop`,
        })
      }
      if (e.quantity && !e.quantity.unit.trim()) {
        issues.push({
          code: 'quantity_without_unit',
          severity: 'blocking',
          loopId: loop.loopId,
          edgeId: e.id,
          message: `edge "${e.id}" quantity requires a unit`,
        })
      }
      if (e.rLevel && !(e.rLevel in rLadderById)) {
        issues.push({
          code: 'invalid_rlevel',
          severity: 'blocking',
          loopId: loop.loopId,
          edgeId: e.id,
          message: `edge "${e.id}" has invalid rLevel "${e.rLevel}"`,
        })
      }
      if (e.evidenceStatus === 'observed' && !isCitable(e.sourceRefs)) {
        issues.push({
          code: 'observed_without_citable_source',
          severity: 'blocking',
          loopId: loop.loopId,
          edgeId: e.id,
          message: `edge "${e.id}" is observed but has no citable source`,
        })
      }
      if ((e.evidenceStatus === 'estimated' || e.evidenceStatus === 'proxy') && e.sourceRefs.length === 0) {
        issues.push({
          code: 'sourced_status_without_source',
          severity: 'blocking',
          loopId: loop.loopId,
          edgeId: e.id,
          message: `edge "${e.id}" is ${e.evidenceStatus} but has no source`,
        })
      }
    }
  }
  return issues
}
