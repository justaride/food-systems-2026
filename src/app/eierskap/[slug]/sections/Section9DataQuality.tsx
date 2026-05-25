export type CoverageData = {
  qualityScore: number
  gaps: string[]
  metrics: unknown
}

function scoreColor(score: number): string {
  if (score <= 4) return 'bg-rose-100 text-rose-800 border-rose-200'
  if (score <= 7) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

export function Section9DataQuality({ coverage }: { coverage: CoverageData }) {
  const { qualityScore, gaps } = coverage

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold text-stone-900">Datakvalitet</h2>
        <span className={`inline-block text-sm font-bold px-2.5 py-0.5 rounded border ${scoreColor(qualityScore)}`}>
          {qualityScore} / 10
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">Sjekkliste</h3>
          {gaps.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <span className="text-emerald-500">&#10003;</span>
              Ingen kjente datakvalitet-gap
            </div>
          ) : (
            <ul className="space-y-1">
              {gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="text-rose-500 mt-0.5 shrink-0">&#9679;</span>
                  {gap}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">Foreslåtte berikelseskilder</h3>
          <ul className="space-y-2">
            <li className="flex flex-col gap-0.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
              <span className="text-sm font-medium text-stone-800">Aksjonærregisteret (Skatteetaten)</span>
              <span className="text-xs text-stone-500">Komplett aksjonærliste med eierandeler og historikk</span>
            </li>
            <li className="flex flex-col gap-0.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
              <span className="text-sm font-medium text-stone-800">Nordiske eierregistre</span>
              <span className="text-xs text-stone-500">Bolagsverket (SE), CVR (DK), PRH (FI) — for grensekryssende strukturer</span>
            </li>
            <li className="flex flex-col gap-0.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
              <span className="text-sm font-medium text-stone-800">Brreg Roller-API</span>
              <span className="text-xs text-stone-500">Automatisert styre-import med rollehistorikk og endringssporing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
