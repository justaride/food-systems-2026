import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'
import {
  DYBDEANALYSE_RULE,
  DYBDEANALYSE_UPDATED,
  dybdeanalyseFindings,
  type DybdeanalyseFigure,
} from '@/lib/data/dybdeanalyse'

function LorenzFigure() {
  return (
    <svg viewBox="0 0 220 130" className="w-full max-w-[220px]" role="img" aria-label="Lorenz-kurve for produksjonstilskudd 2023">
      <rect x="28" y="10" width="184" height="100" fill="none" stroke="#e7e5e4" strokeWidth="1" />
      <line x1="28" y1="110" x2="212" y2="10" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="4 3" />
      <polyline
        points="28,110 46.4,109.4 64.8,108.1 83.2,105.9 101.6,102.6 120,97.8 138.4,90.9 156.8,80.5 175.2,65 193.6,43.3 212,10"
        fill="none"
        stroke="#0284c7"
        strokeWidth="2"
      />
      <text x="120" y="124" fontSize="9" fill="#a8a29e" textAnchor="middle">kumulativ andel mottakere →</text>
    </svg>
  )
}

function SektorbroFigure() {
  return (
    <svg viewBox="0 0 220 130" className="w-full max-w-[220px]" role="img" aria-label="Sektorbroer: tett kobling mellom retail, logistikk og foredling">
      <line x1="104" y1="28" x2="165" y2="62" stroke="#0284c7" strokeWidth="4" />
      <line x1="104" y1="100" x2="165" y2="62" stroke="#0284c7" strokeWidth="3.4" />
      <line x1="104" y1="28" x2="104" y2="100" stroke="#7dd3fc" strokeWidth="1.6" />
      <line x1="165" y1="62" x2="182" y2="108" stroke="#e7e5e4" strokeWidth="1" />
      <circle cx="34" cy="34" r="5" fill="none" stroke="#d6d3d1" strokeWidth="1.4" />
      <circle cx="34" cy="102" r="5" fill="none" stroke="#d6d3d1" strokeWidth="1.4" />
      <circle cx="104" cy="28" r="6.5" fill="#0284c7" />
      <circle cx="104" cy="100" r="6.5" fill="#0284c7" />
      <circle cx="165" cy="62" r="8" fill="#075985" />
      <circle cx="182" cy="108" r="5" fill="none" stroke="#d6d3d1" strokeWidth="1.4" />
      <text x="25" y="35" fontSize="9" fill="#a8a29e" textAnchor="end">inputs</text>
      <text x="25" y="105" fontSize="9" fill="#a8a29e" textAnchor="end">sjømat</text>
      <text x="104" y="16" fontSize="9" fill="#78716c" textAnchor="middle">logistikk</text>
      <text x="104" y="116" fontSize="9" fill="#78716c" textAnchor="middle">foredling</text>
      <text x="176" y="60" fontSize="9.5" fill="#44403c" textAnchor="start">retail</text>
      <text x="182" y="122" fontSize="8.5" fill="#a8a29e" textAnchor="middle">servering</text>
    </svg>
  )
}

function KryssnodeHhiFigure() {
  // Markeds-HHI per node (citable-noder), sortert; 2500 = «høyt konsentrert» (DOJ/FTC).
  // Egg oppgradert 2026-06-15 (Strøm E): Nortura/Prior 70–80 % → ~5500–6800, ny nr. 2.
  const bars = [
    { node: 'Meieri', hhi: 6000, samvirke: true, label: '~6000' },
    { node: 'Egg', hhi: 5500, samvirke: true, label: '~5500–6800' },
    { node: 'Rødt kjøtt', hhi: 4700, samvirke: true, label: '~4700' },
    { node: 'Dagligvare', hhi: 3327, samvirke: false, label: '~3327' },
    { node: 'Kylling', hhi: 3200, samvirke: false, label: '~3200' },
    { node: 'Sjømat', hhi: 950, samvirke: false, label: '~950' },
  ]
  const maxHhi = 6000
  const plotX = 88
  const plotW = 95
  const rowH = 18
  const top = 8
  const x = (hhi: number) => plotX + (hhi / maxHhi) * plotW
  const baseY = top + bars.length * rowH
  return (
    <svg viewBox="0 0 220 145" className="w-full max-w-[220px]" role="img" aria-label="Markeds-HHI per verdikjede-node: konsentrasjonen topper i foredling. De tre øverste er samvirke — meieri ~6000 (TINE), egg ~5500–6800 og rødt kjøtt ~4700 (Nortura/Prior) — alle over dagligvare ~3327; sjømat ~950 er lavest.">
      {/* 2500-terskel */}
      <line x1={x(2500)} y1={top - 3} x2={x(2500)} y2={baseY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
      <text x={x(2500)} y={baseY + 9} fontSize="7" fill="#b45309" textAnchor="middle">2500</text>
      {bars.map((b, i) => {
        const y = top + i * rowH
        return (
          <g key={b.node}>
            <text x={plotX - 4} y={y + 9} fontSize="8" fill="#57534e" textAnchor="end">{b.node}</text>
            <rect x={plotX} y={y + 2} width={x(b.hhi) - plotX} height={9} rx="1.5" fill={b.samvirke ? '#075985' : '#0284c7'} />
            <text x={x(b.hhi) + 3} y={y + 9.5} fontSize="7" fill="#78716c" textAnchor="start">{b.label}</text>
          </g>
        )
      })}
      <g>
        <rect x={plotX} y={baseY + 13} width="8" height="6" rx="1.5" fill="#075985" />
        <text x={plotX + 11} y={baseY + 18} fontSize="7" fill="#78716c" textAnchor="start">samvirke (TINE / Nortura)</text>
      </g>
    </svg>
  )
}

function FindingFigure({ figure }: { figure: DybdeanalyseFigure }) {
  if (figure === 'lorenz') return <LorenzFigure />
  if (figure === 'sektorbro') return <SektorbroFigure />
  if (figure === 'kryssnodeHhi') return <KryssnodeHhiFigure />
  return null
}

export function DybdeanalyseSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Dybdeanalyse</h2>
        <p className="text-sm text-stone-400 mt-1">
          Ikke-opplagte funn fra arbeidspakkene, kjørt på egen data og enhetstestet. Intern baseline med claim-lock.
          Oppdatert {DYBDEANALYSE_UPDATED}.
        </p>
      </div>

      <InternalBanner note={DYBDEANALYSE_RULE} />

      <div className="space-y-4">
        {dybdeanalyseFindings.map(finding => (
          <Card key={finding.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-stone-800">{finding.title}</h3>
                <p className="text-xs text-stone-500 mt-1 font-mono">
                  {finding.arbeidspakke} · {finding.claimId}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[55%]">
                <EvidenceStatusBadge
                  status={finding.evidenceStatus}
                  citationReadiness={finding.citationReadiness}
                  citationNote={finding.citationNote}
                  detail={finding.citationNote}
                />
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                  Utkast
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed mb-4">{finding.kortFunn}</p>

            <div className={finding.figure ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4' : 'mb-4'}>
              {finding.figure && (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center justify-center">
                  <FindingFigure figure={finding.figure} />
                </div>
              )}
              <div className="space-y-3">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 font-medium mb-1">Dekning / forbehold</p>
                  <p className="text-xs text-amber-900 leading-relaxed">{finding.coverageNote}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1">Metode</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{finding.method}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {finding.tags.map(tag => (
                    <span key={tag} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">
                      {tag}
                    </span>
                  ))}
                  {finding.graphHref && (
                    <a href={finding.graphHref} className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700 hover:bg-sky-100">
                      Se i grafen →
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-rose-500 font-medium mb-1">Ikke si</p>
              <ul className="space-y-1">
                {finding.notSay.map(item => (
                  <li key={item} className="text-xs text-rose-900">{item}</li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-stone-400">
              Kilde: {finding.sources.join(' · ')}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
