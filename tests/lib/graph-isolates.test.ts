import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  analyzeGraphIsolates,
  classifyGraphIsolate,
} from '../../src/lib/graph-isolates'
import type { GraphEdge, GraphNode } from '../../src/lib/queries/graph'

describe('graph isolate triage', () => {
  it('keeps source/catalog documents separate from actionable isolate work', () => {
    assert.deepEqual(
      classifyGraphIsolate({
        id: 'doc-1',
        label: 'Imported source packet',
        type: 'document',
        tags: ['research', 'evidence-pack'],
        href: '/bibliotek/doc-1',
      }),
      {
        action: 'intentional_catalog',
        actionable: false,
        rationale: 'Standalone source, research, or register document',
      },
    )
  })

  it('treats Nordic sprint and regulatory source documents as intentional catalog isolates', () => {
    assert.equal(
      classifyGraphIsolate({
        id: 'doc-norden',
        label: 'Sirkularitet sprint source packet',
        type: 'document',
        tags: ['norden', 'sirkularitet-sprint-2026-05'],
      }).action,
      'intentional_catalog',
    )
    assert.equal(
      classifyGraphIsolate({
        id: 'doc-regulatory',
        label: 'Regulatory source capture',
        type: 'document',
        tags: ['regulatory'],
      }).action,
      'intentional_catalog',
    )
  })

  it('classifies isolated actors, people, and insights as actionable graph work', () => {
    assert.deepEqual(
      classifyGraphIsolate({
        id: 'actor-1',
        label: 'Unlinked actor',
        type: 'actor',
        tags: ['retail'],
        href: '/aktorer/unlinked',
      }),
      {
        action: 'missing_actor_relationship',
        actionable: true,
        rationale: 'Actor has no ActorRelationship, ActorDocumentRef, or company link',
      },
    )

    assert.deepEqual(
      classifyGraphIsolate({
        id: 'person-1',
        label: 'Unlinked person',
        type: 'person',
        tags: ['policy'],
        href: '/personer/unlinked',
      }),
      {
        action: 'missing_person_role',
        actionable: true,
        rationale: 'PersonProfile has no graph role or board-member edge',
      },
    )

    assert.deepEqual(
      classifyGraphIsolate({
        id: 'insight-1',
        label: 'Unlinked insight',
        type: 'insight',
        tags: ['matsikkerhet'],
        href: '/innsikt#insight-1',
      }),
      {
        action: 'missing_evidence_link',
        actionable: true,
        rationale: 'Node is not linked to supporting evidence',
      },
    )
  })

  it('summarizes isolated nodes from graph degree', () => {
    const nodes: GraphNode[] = [
      { id: 'doc-1', label: 'Source packet', type: 'document', tags: ['research'] },
      { id: 'actor-1', label: 'Unlinked actor', type: 'actor' },
      { id: 'company-1', label: 'Connected company', type: 'company' },
      { id: 'doc-2', label: 'Connected document', type: 'document' },
    ]
    const edges: GraphEdge[] = [{ source: 'doc-2', target: 'company-1', type: 'company-ref' }]

    assert.deepEqual(analyzeGraphIsolates(nodes, edges), {
      total: 2,
      actionable: 1,
      intentional: 1,
      byAction: {
        intentional_catalog: 1,
        missing_actor_relationship: 1,
      },
      byType: {
        actor: 1,
        document: 1,
      },
      samples: [
        {
          id: 'actor-1',
          label: 'Unlinked actor',
          type: 'actor',
          action: 'missing_actor_relationship',
          actionable: true,
          rationale: 'Actor has no ActorRelationship, ActorDocumentRef, or company link',
        },
        {
          id: 'doc-1',
          label: 'Source packet',
          type: 'document',
          tags: ['research'],
          action: 'intentional_catalog',
          actionable: false,
          rationale: 'Standalone source, research, or register document',
        },
      ],
    })
  })
})
