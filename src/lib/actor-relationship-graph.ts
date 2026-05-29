import { inferGraphConfidence } from '@/lib/graph-confidence'

export const DEFAULT_ACTOR_RELATIONSHIP_SOURCE = 'source:curated-actor-relationship-seed'

export type ActorRelationshipGraphInput = {
  fromActorId: string
  toActorId: string
  relationType: string
  source?: string | null
  metadata?: unknown
}

export type ActorRelationshipGraphEdge = {
  source: string
  target: string
  type: string
  confidence?: number
  sourceLabel?: string
}

export function actorRelationshipGraphEdge(
  relationship: ActorRelationshipGraphInput,
): ActorRelationshipGraphEdge {
  const { confidence, sourceLabel } = inferGraphConfidence(
    relationship.metadata,
    relationship.source,
  )

  return {
    source: relationship.fromActorId,
    target: relationship.toActorId,
    type: relationship.relationType,
    ...(confidence !== undefined ? { confidence } : {}),
    ...(sourceLabel ? { sourceLabel } : {}),
  }
}
