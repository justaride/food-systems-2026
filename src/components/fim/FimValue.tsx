// Renders sealed FIM evidence values as they are. The package has 40+ evidence
// kinds with different shapes, so the renderer is generic rather than per kind.

const KEY_LABELS: Record<string, string> = {
  name: 'Navn',
  role: 'Rolle',
  code: 'Kode',
  changed: 'Endret',
  percent: 'Andel %',
  year: 'År',
  currency: 'Valuta',
  revenue: 'Driftsinntekter',
  operating_profit: 'Driftsresultat',
  profit: 'Resultat',
  equity: 'Egenkapital',
  assets: 'Eiendeler',
  reference_year: 'Referanseår',
  source_class: 'Kildeklasse',
}

const HIDDEN_KEYS = new Set(['_links'])

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const visibleEntries = (value: Record<string, unknown>) => Object.entries(value).filter(([key]) => !HIDDEN_KEYS.has(key))

function inlineText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'ja' : 'nei'
  if (typeof value === 'number') return value.toLocaleString('nb-NO')
  if (Array.isArray(value)) return value.map(inlineText).join(', ')
  if (isPlainObject(value)) return visibleEntries(value).map(([key, item]) => `${KEY_LABELS[key] ?? key}: ${inlineText(item)}`).join(' · ')
  return String(value)
}

export function FimValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === '') return <span className="text-stone-400">—</span>
  if (typeof value === 'boolean') return <span>{value ? 'ja' : 'nei'}</span>
  if (typeof value === 'number') return <span className="tabular-nums">{value.toLocaleString('nb-NO')}</span>
  if (typeof value === 'string') {
    return /^https?:\/\//.test(value)
      ? <a href={value} target="_blank" rel="noopener noreferrer" className="break-all text-emerald-700 hover:underline">{value}</a>
      : <span className="whitespace-pre-line break-words">{value}</span>
  }
  // Nested structure (registry addresses, codes) collapses to one line, so narrow cards never nest grids.
  if (depth >= 1) return <span className="break-words">{inlineText(value)}</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-stone-400">—</span>
    if (value.every(item => !isPlainObject(item) && !Array.isArray(item))) {
      return <span className="block space-y-0.5">{value.map((item, i) => <span key={i} className="block"><FimValue value={item} depth={depth + 1} /></span>)}</span>
    }
    if (value.every(isPlainObject)) {
      const keys = [...new Set(value.flatMap(item => visibleEntries(item).map(([key]) => key)))]
      return (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400">
              {keys.map(key => <th key={key} className="py-1 pr-3 font-medium">{KEY_LABELS[key] ?? key}</th>)}
            </tr>
          </thead>
          <tbody>
            {value.map((item, i) => (
              <tr key={i} className="border-b border-stone-100 align-top">
                {keys.map(key => <td key={key} className="py-1 pr-3"><FimValue value={item[key]} depth={depth + 1} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    return <ul className="list-disc space-y-1 pl-4">{value.map((item, i) => <li key={i}><FimValue value={item} depth={depth + 1} /></li>)}</ul>
  }

  if (isPlainObject(value)) {
    const entries = visibleEntries(value)
    if (entries.length === 0) return <span className="text-stone-400">—</span>
    // Registry extracts carry long camelCase keys; cap the key column so values keep their width.
    return (
      <dl className="grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
        {entries.map(([key, item]) => (
          <div key={key} className="contents">
            <dt className="max-w-[10rem] text-stone-400 [overflow-wrap:anywhere]">{KEY_LABELS[key] ?? key}</dt>
            <dd className="min-w-0 break-words text-stone-700"><FimValue value={item} depth={depth + 1} /></dd>
          </div>
        ))}
      </dl>
    )
  }

  return <span>{String(value)}</span>
}
