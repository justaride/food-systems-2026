import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  actorRelationshipGraphEdge,
  DEFAULT_ACTOR_RELATIONSHIP_SOURCE,
} from '../../src/lib/actor-relationship-graph'

describe('actor relationship graph adapter', () => {
  it('uses actor relationship provenance to expose conservative graph confidence', () => {
    assert.deepEqual(
      actorRelationshipGraphEdge({
        fromActorId: 'actor-a',
        toActorId: 'actor-b',
        relationType: 'partners_with',
        source: DEFAULT_ACTOR_RELATIONSHIP_SOURCE,
        metadata: { sourceType: 'curated_actor_relationship_seed' },
      }),
      {
        source: 'actor-a',
        target: 'actor-b',
        type: 'partners_with',
        confidence: 0.6,
        sourceLabel: DEFAULT_ACTOR_RELATIONSHIP_SOURCE,
      },
    )
  })

  it('keeps actor relationship confidence absent when provenance is missing', () => {
    assert.deepEqual(
      actorRelationshipGraphEdge({
        fromActorId: 'actor-a',
        toActorId: 'actor-b',
        relationType: 'partners_with',
        source: null,
        metadata: null,
      }),
      {
        source: 'actor-a',
        target: 'actor-b',
        type: 'partners_with',
      },
    )
  })
})
