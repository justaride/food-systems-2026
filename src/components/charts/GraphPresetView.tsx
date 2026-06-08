'use client'

import { useMemo, useState } from 'react'
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
import {
  deriveGraphPreset,
  GRAPH_PRESETS,
  DEFAULT_GRAPH_PRESET,
  type GraphPresetId,
} from '@/lib/graph/preset'
import type { GraphNode, GraphEdge } from '@/lib/queries/graph'

export function GraphPresetView({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [preset, setPreset] = useState<GraphPresetId>(DEFAULT_GRAPH_PRESET)
  const view = useMemo(() => deriveGraphPreset(nodes, edges, preset), [nodes, edges, preset])
  const activeHint = GRAPH_PRESETS.find((p) => p.id === preset)?.hint

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {GRAPH_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            title={p.hint}
            aria-pressed={preset === p.id}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              preset === p.id
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">
        {activeHint} <span className="text-stone-400">— viser {view.nodes.length} noder.</span>
      </p>
      <KnowledgeGraph nodes={view.nodes} edges={view.edges} />
    </div>
  )
}
