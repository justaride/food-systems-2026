import type { MediaSource } from '@/lib/data/media-landscape'

export function SourceChip({ source }: { source: MediaSource }) {
  const base = 'inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 transition-colors'

  if (source.url) {
    return (
      <a
        href={source.url.startsWith('http') ? source.url : `https://${source.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} hover:bg-stone-100 hover:text-stone-800`}
      >
        {source.label}
        <svg className="h-3 w-3 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    )
  }

  return <span className={base}>{source.label}</span>
}
