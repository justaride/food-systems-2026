import { evidenceGrammar } from '@/lib/visualization/evidence-grammar'

const STATUS_TEXT_CLASSES = {
  observed: 'text-emerald-400',
  estimated: 'text-sky-400',
  proxy: 'text-amber-400',
  illustrative: 'text-rose-400',
} as const

type EvidenceGrammarLegendProps = {
  tone?: 'light' | 'dark'
  className?: string
}

export function EvidenceGrammarLegend({
  tone = 'light',
  className = '',
}: EvidenceGrammarLegendProps) {
  const isDark = tone === 'dark'

  return (
    <section
      aria-labelledby="evidence-grammar-title"
      className={`${isDark ? 'border-white/10 bg-black/20' : 'border-stone-200 bg-stone-50'} rounded-xl border p-3 ${className}`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3
          id="evidence-grammar-title"
          className={`text-xs font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}
        >
          Hvordan evidens tegnes
        </h3>
        <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          Linjemønsteret bærer betydningen; farge er kun støtte.
        </p>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {evidenceGrammar.map(token => (
          <li key={token.status} className="min-w-0">
            <span
              className={`evidence-line ${token.lineClassName} ${STATUS_TEXT_CLASSES[token.status]}`}
              aria-hidden="true"
            />
            <p className={`mt-1 text-[11px] font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
              {token.label}
            </p>
            <p className={`mt-0.5 text-[10px] leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
              {token.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
