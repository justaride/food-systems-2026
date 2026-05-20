import type { VisualizationSourceRef } from '@/lib/visualization/types'
import { Citation } from '@/components/citations/Citation'

type SourceFootnoteProps = {
  sourceRefs: VisualizationSourceRef[]
  className?: string
}

export function SourceFootnote({ sourceRefs, className = '' }: SourceFootnoteProps) {
  if (sourceRefs.length === 0) return null

  return (
    <div className={`text-[10px] text-stone-400 leading-relaxed ${className}`}>
      Kilder:{' '}
      <span className="inline-flex flex-wrap gap-x-2 gap-y-1 align-baseline">
      {sourceRefs.map((source, index) => {
        const label = source.path ? `${source.label} (${source.path})` : source.label
        const readiness = source.citationReadiness ?? (source.href || source.path ? 'citable_with_note' : 'blocked_unsourced')
        return (
          <Citation
            key={`${source.label}-${index}`}
            compact
            citation={{
              label,
              url: source.href,
              localPath: source.path,
              citationReadiness: readiness,
              note: source.note ?? (readiness === 'citable_with_note' ? 'metode-/dekningsforbehold' : undefined),
            }}
          />
        )
      })}
      </span>
    </div>
  )
}
