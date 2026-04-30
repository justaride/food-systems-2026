import type { VisualizationSourceRef } from '@/lib/visualization/types'

type SourceFootnoteProps = {
  sourceRefs: VisualizationSourceRef[]
  className?: string
}

export function SourceFootnote({ sourceRefs, className = '' }: SourceFootnoteProps) {
  if (sourceRefs.length === 0) return null

  return (
    <p className={`text-[10px] text-stone-400 leading-relaxed ${className}`}>
      Kilder:{' '}
      {sourceRefs.map((source, index) => {
        const suffix = index < sourceRefs.length - 1 ? '; ' : ''
        const label = source.path ? `${source.label} (${source.path})` : source.label
        if (!source.href) return `${label}${suffix}`
        return (
          <span key={`${source.label}-${index}`}>
            <a href={source.href} className="hover:text-emerald-700">
              {label}
            </a>
            {suffix}
          </span>
        )
      })}
    </p>
  )
}
