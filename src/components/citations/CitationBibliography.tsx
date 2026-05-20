import { Citation, type CitationViewModel } from './Citation'

type CitationBibliographyProps = {
  citations: CitationViewModel[]
  title?: string
  className?: string
}

export function CitationBibliography({
  citations,
  title = 'Kildegrunnlag',
  className = '',
}: CitationBibliographyProps) {
  if (citations.length === 0) return null

  return (
    <div className={`rounded-lg border border-stone-200 bg-stone-50 p-3 ${className}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</p>
      <ul className="space-y-2">
        {citations.map((citation, index) => (
          <li key={`${citation.citationText ?? citation.url ?? citation.localPath ?? 'citation'}-${index}`}>
            <Citation citation={citation} />
          </li>
        ))}
      </ul>
    </div>
  )
}
