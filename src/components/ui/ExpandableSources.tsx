'use client'

import { useState } from 'react'
import type { MediaSource } from '@/lib/data/media-landscape'
import { SourceChip } from './SourceChip'

export function ExpandableSources({ sources, label = 'kilder' }: { sources: MediaSource[]; label?: string }) {
  const [open, setOpen] = useState(false)

  if (!sources.length) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
      >
        ({sources.length} {label}) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {sources.map(source => (
            <SourceChip key={source.label} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}
