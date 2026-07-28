import type { Metadata } from 'next'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import {
  loadMasterhjerneStatus,
  type MasterhjerneCoverageRow,
} from '@/lib/data/masterhjerne'

export const metadata: Metadata = {
  title: 'Masterhjernen - Food Systems 2026',
  description: 'Samlet kunnskapsstatus: korpus, evidenskvalitet, verdikjededekning og datagap - generert DB-fritt fra prosjektets kontrollfiler.',
}

const nf = new Intl.NumberFormat('nb-NO')

function fmtPct(value: number): string {
  return `${value.toLocaleString('nb-NO', { maximumFractionDigits: 1 })} %`
}

function fmtDate(iso: string | null): string {
  if (!iso) return 'ukjent dato'
  return iso.slice(0, 10)
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{note}</p>}
    </div>
  )
}

function Meter({ pct }: { pct: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded bg-stone-100">
      <div className="h-full rounded-r bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900">{title}</h2>
      <p className="mt-0.5 max-w-3xl text-sm text-stone-500">{sub}</p>
    </div>
  )
}

function CoverageTable({ title, rows }: { title: string; rows: MasterhjerneCoverageRow[] }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
      <table className="mt-2 w-full text-xs">
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-stone-100 first:border-t-0">
              <td className="py-1.5 pr-2 text-stone-600">{row.label}</td>
              <td className="w-24 py-1.5 pr-2 text-right tabular-nums text-stone-500">
                {nf.format(row.present)}/{nf.format(row.total)}
              </td>
              <td className={`w-16 py-1.5 text-right font-medium tabular-nums ${row.pct === 0 ? 'text-red-600' : 'text-stone-800'}`}>
                {fmtPct(row.pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MasterhjernePage() {
  const status = loadMasterhjerneStatus()

  if (!status) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Masterhjernen</h1>
        <InternalBanner />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Fant ikke <code>public/data/masterhjerne/status.json</code>. Kjør{' '}
          <code>npm run compute-masterhjerne</code> og last siden på nytt.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Masterhjernen</h1>
        <p className="mt-1 text-sm text-stone-400">
          Samlet kunnskapsstatus generert {fmtDate(status.generatedAt)} - DB-fritt, fra prosjektets egne kontrollfiler. Oppdater med{' '}
          <code className="rounded bg-stone-100 px-1">npm run compute-masterhjerne</code>.
        </p>
      </div>

      <InternalBanner note="Masterhjernen er intern status og triage. Tallene arver kildenes claim-grenser; ingenting her er claim-locket for ekstern bruk." />

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Hva vet kunnskapsbasen, hvor godt vet den det, og hvor bør neste datainnhenting skje?',
          'Alle tall beregnes fra komitterte kontrollfiler (ledger, audits, hull-rapporter) - manglende kilder gir tomme seksjoner med advarsel, aldri anslag.',
        ]}
        takeaways={[
          status.dekning
            ? `${nf.format(status.dekning.totalMapped)} av ~${nf.format(status.dekning.totalUniverse)} aktører er kartlagt, men ${status.dekning.confidence.lav ?? 0} av ${status.dekning.cells} celler har lav konfidens - eksistens er bekreftet, aktivitet er ikke.`
            : 'Dekningsrapport mangler - kjør generatoren med research/-mappen tilgjengelig.',
          status.siterbarhet && status.siterbarhet.blockedUnsourced !== null
            ? `${nf.format(status.siterbarhet.fieldCitations ?? 0)} feltsiteringer med ${status.siterbarhet.blockedUnsourced} ukildede; ${status.siterbarhet.citableExternal ?? 0} kilder er eksternt siterbare.`
            : 'Siterbarhetstall utilgjengelig.',
          status.akademisk
            ? `Akademisk beredskap er "${status.akademisk.externalReadiness ?? 'ukjent'}": strukturert kildevurdering (appraisal) mangler for alle ${nf.format(status.akademisk.totalRows)} evidensrader.`
            : 'Evidenskvalitetsaudit mangler.',
        ]}
        caveat="Deskriptiv kartlegging og intern syntese er dekket av dagens gates. Kausale, helse- og effektpåstander er blokkert til appraisal-løpet er kjørt. Innhentingsprioriteringene står i DATAGAP-ANALYSE-2026-07-06.md."
      />

      {status.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {status.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <SectionHeading title="Hjernens masse" sub="Omfanget av det som ligger i basen og biblioteket, med kildedato per tall." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {status.bibliotek && (
            <Kpi label="Kilder i biblioteket" value={nf.format(status.bibliotek.total)} note={`${nf.format(status.bibliotek.byStatus.approved_internal ?? 0)} godkjent for KI-kontekst`} />
          )}
          {status.akademisk && (
            <Kpi label="Akademisk/ekstern evidens" value={nf.format(status.akademisk.totalRows)} note={`${status.akademisk.reports} rapporter / ${status.akademisk.theses} avhandlinger / ${status.akademisk.sourceDocs} kildedok (${fmtDate(status.akademisk.auditGeneratedAt)})`} />
          )}
          {status.siterbarhet?.fieldCitations != null && (
            <Kpi label="Feltsiteringer" value={nf.format(status.siterbarhet.fieldCitations)} note={`${status.siterbarhet.blockedUnsourced ?? '?'} uten kilde (blocked_unsourced)`} />
          )}
          {status.dekning && (
            <Kpi label="Aktører kartlagt" value={`${nf.format(status.dekning.totalMapped)}`} note={`av ~${nf.format(status.dekning.totalUniverse)} estimert (${status.dekning.cells} celler)`} />
          )}
          {status.vaultExport && (
            <Kpi label="Kuratert graf" value={nf.format(status.vaultExport.companies)} note={`selskaper / ${nf.format(status.vaultExport.ownershipEdges)} eierskapskanter / ${nf.format(status.vaultExport.boardMembers)} styreverv (${fmtDate(status.vaultExport.generatedAt)})`} />
          )}
          {status.subsidier && (
            <Kpi label="Subsidieposter" value={nf.format(status.subsidier.total)} note={`produksjonstilskudd (${fmtDate(status.subsidier.computedAt)})`} />
          )}
          {status.pdfKatalog && (
            <Kpi label="PDF-katalog" value={nf.format(status.pdfKatalog.count)} note={`${nf.format(status.pdfKatalog.pages)} sider katalogisert`} />
          )}
          {status.missions && (
            <Kpi label="Research-missions" value={nf.format(status.missions.total)} note={Object.entries(status.missions.byStatus).map(([key, value]) => `${value} ${key}`).join(' / ')} />
          )}
        </div>
      </section>

      {status.siterbarhet && (
        <section className="space-y-3">
          <SectionHeading title="Siterbarhetskjeden" sub="Fra datafelt til eksternt siterbar påstand. Fail-closed: tomme celler forblir tomme, og blokkeringer er dokumenterte funn." />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 md:grid-cols-5">
            {[
              { value: status.siterbarhet.fieldCitations, label: 'Feltsiteringer' },
              { value: status.siterbarhet.sourceCitations, label: 'Kildesiteringer' },
              { value: status.siterbarhet.citableWithNote, label: 'Siterbar med metodenote' },
              { value: status.siterbarhet.citableExternal, label: 'Siterbar eksternt' },
              {
                value: null,
                label: 'Acceptance-pack cite-ready',
                text: status.siterbarhet.acceptanceReady != null ? `${status.siterbarhet.acceptanceReady} / ${status.siterbarhet.acceptanceTotal}` : 'ukjent',
              },
            ].map((gate) => (
              <div key={gate.label} className="bg-white p-3">
                <p className="text-xl font-bold tabular-nums text-stone-900">{gate.text ?? (gate.value != null ? nf.format(gate.value) : '-')}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-stone-500">{gate.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {status.dekning && (
        <section className="space-y-3">
          <SectionHeading
            title="Verdikjededekning"
            sub={`Kartlagte aktører mot estimert univers per domene (${status.dekning.reportFile}). Universene bruker et min(20, univers)-gulv: full søyle betyr at gulvet er nådd, ikke at alle finnes.`}
          />
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="space-y-2">
              {status.dekning.domains.map((domain) => {
                const pct = domain.universe > 0 ? (domain.mapped / domain.universe) * 100 : 100
                return (
                  <div key={domain.domain} className="grid grid-cols-[170px_1fr_90px] items-center gap-3">
                    <p className="truncate text-xs font-medium text-stone-700">{domain.domain}</p>
                    <Meter pct={pct} />
                    <p className="text-right text-xs tabular-nums text-stone-500">
                      {nf.format(domain.mapped)} / {nf.format(domain.universe)}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-stone-100 pt-3 text-xs text-stone-500">
              <span>
                Konfidens per celle:{' '}
                <span className="font-medium text-stone-700">
                  {status.dekning.confidence.hoey ?? 0} høy / {status.dekning.confidence.middels ?? 0} middels / {status.dekning.confidence.lav ?? 0} lav
                </span>
              </span>
              <span>
                Åpne bredde-hull:{' '}
                {status.dekning.openGaps.length === 0
                  ? 'ingen'
                  : status.dekning.openGaps.map((gap) => `${gap.subdomain} (${gap.mapped}/${gap.universe})`).join(', ')}
              </span>
            </div>
          </div>
        </section>
      )}

      {status.akademisk && (
        <section className="space-y-3">
          <SectionHeading
            title="Evidenskvalitet i det akademiske/eksterne laget"
            sub={`Audit ${fmtDate(status.akademisk.auditGeneratedAt)}. Regresjonsgate: ${(status.akademisk.regressionGate ?? 'ukjent').toUpperCase()} - ekstern akademisk beredskap: ${(status.akademisk.externalReadiness ?? 'ukjent').toUpperCase()}. Korpuset er blandet evidens (akademia + offentlige kilder + registre), ikke bare akademiske publikasjoner.`}
          />
          <div className="grid gap-3 lg:grid-cols-3">
            {(['Report', 'Thesis', 'SourceDoc'] as const).map((set) => (
              <CoverageTable
                key={set}
                title={set === 'Report' ? `Rapporter (${status.akademisk?.reports})` : set === 'Thesis' ? `Avhandlinger (${status.akademisk?.theses})` : `Kildedokumenter (${status.akademisk?.sourceDocs})`}
                rows={(status.akademisk?.coverage ?? []).filter((row) => row.set === set)}
              />
            ))}
          </div>
          <p className="text-xs text-stone-500">
            Radene med 0 % (strukturert kildevurdering / appraisal) er hovedgrunnen til at ekstern akademisk beredskap er
            {' '}<span className="font-semibold text-red-600">not ready</span>: vurderingsmodellen er pilotert, men ingen rader har komplett gjennomført vurdering ennå.
          </p>
        </section>
      )}

      <section className="grid gap-3 lg:grid-cols-3">
        {status.bibliotek && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Bibliotekets KI-klargjøring</p>
            <div className="mt-3 flex h-4 gap-0.5 overflow-hidden rounded">
              {[
                { key: 'ai_draft', className: 'bg-stone-200' },
                { key: 'review_required', className: 'bg-emerald-300' },
                { key: 'approved_internal', className: 'bg-emerald-600' },
                { key: 'blocked', className: 'bg-red-500' },
              ].map((segment) => (
                <div
                  key={segment.key}
                  className={segment.className}
                  style={{ flexGrow: Math.max(1, status.bibliotek?.byStatus[segment.key] ?? 0) }}
                  title={`${segment.key}: ${status.bibliotek?.byStatus[segment.key] ?? 0}`}
                />
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-xs text-stone-600">
              <li>KI-utkast: <span className="font-medium tabular-nums">{nf.format(status.bibliotek.byStatus.ai_draft ?? 0)}</span></li>
              <li>I review-kø: <span className="font-medium tabular-nums">{nf.format(status.bibliotek.byStatus.review_required ?? 0)}</span></li>
              <li>Godkjent for KI-kontekst: <span className="font-medium tabular-nums">{nf.format(status.bibliotek.byStatus.approved_internal ?? 0)}</span></li>
              <li>Blokkert: <span className="font-medium tabular-nums">{nf.format(status.bibliotek.byStatus.blocked ?? 0)}</span></li>
              <li>Mangler tekstgrunnlag: <span className="font-medium tabular-nums">{nf.format(status.bibliotek.missingText)}</span></li>
            </ul>
            <p className="mt-2 text-[11px] text-stone-400">Flaskehalsen er menneskegodkjenning, ikke innsamling. Detaljer: /ai-kunnskap.</p>
          </div>
        )}

        {status.kiKorpus && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">KI-prioritert korpus ({nf.format(status.kiKorpus.n)})</p>
            <ul className="mt-3 space-y-1 text-xs text-stone-600">
              <li>Akademisk (master/ph.d./akademia): <span className="font-medium tabular-nums">{nf.format(status.kiKorpus.byGroup['akademisk'] ?? 0)}</span></li>
              <li>Offentlig & tilsyn: <span className="font-medium tabular-nums">{nf.format(status.kiKorpus.byGroup['offentlig-tilsyn'] ?? 0)}</span></li>
              <li>Bransje: <span className="font-medium tabular-nums">{nf.format(status.kiKorpus.byGroup['bransje'] ?? 0)}</span></li>
              <li>Øvrig: <span className="font-medium tabular-nums">{nf.format(status.kiKorpus.byGroup['ovrig'] ?? 0)}</span></li>
            </ul>
            <div className="mt-3 border-t border-stone-100 pt-2 text-xs text-stone-600">
              <p>Ferskhet: <span className="font-medium">{fmtPct(status.kiKorpus.share2023PlusPct)}</span> fra 2023 eller nyere</p>
              <p className="mt-1">Snittscore: <span className="font-medium tabular-nums">{status.kiKorpus.meanScore.toLocaleString('nb-NO')}</span> / 5</p>
            </div>
          </div>
        )}

        {status.urlHelse && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">URL-helse ({nf.format(status.urlHelse.checked)} sjekket)</p>
            <div className="mt-3 flex h-4 gap-0.5 overflow-hidden rounded">
              <div className="bg-emerald-500" style={{ flexGrow: Math.max(1, status.urlHelse.ok) }} title={`ok: ${status.urlHelse.ok}`} />
              <div className="bg-amber-400" style={{ flexGrow: Math.max(1, status.urlHelse.blocked) }} title={`blokkert: ${status.urlHelse.blocked}`} />
              <div className="bg-red-500" style={{ flexGrow: Math.max(1, status.urlHelse.dead) }} title={`døde: ${status.urlHelse.dead}`} />
            </div>
            <ul className="mt-3 space-y-1 text-xs text-stone-600">
              <li>OK: <span className="font-medium tabular-nums">{nf.format(status.urlHelse.ok)}</span></li>
              <li>Blokkert (paywall/robots): <span className="font-medium tabular-nums">{nf.format(status.urlHelse.blocked)}</span></li>
              <li>Døde: <span className="font-medium tabular-nums">{nf.format(status.urlHelse.dead)}</span></li>
              <li>
                Høyprioritet (P&ge;4): <span className="font-medium tabular-nums">{status.urlHelse.highPriorityDead}</span> døde av{' '}
                <span className="tabular-nums">{nf.format(status.urlHelse.highPriorityChecked)}</span>
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-stone-400">Live arkivaudit: 521 av 2 376 eksternt klare/med-note-siteringer har varig kopi; 1 855 trenger arkiv. Automatisk arkivering ved første sitering er ikke på plass.</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Hvor neste datainnhenting bør skje"
          sub="Redaksjonell prioritering fra DATAGAP-ANALYSE-2026-07-06.md - ikke beregnet av generatoren, gjengitt her som veiviser."
        />
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li><span className="font-medium">Menneskedata:</span> Mission 1- og Mission 2-pakkene er beslutningsklare, men ikke sendt; personvern, scope, mottaker og review må lukkes først.</li>
            <li><span className="font-medium">Aktivitetssignal:</span> start med entity-resolution og domenevis signaldefinisjon; MTB er kapasitet, ikke faktisk biomasse, og ingen celle oppgraderes automatisk.</li>
            <li><span className="font-medium">Strukturert kildevurdering:</span> fullfør navngitt fulltekstreview av de tre pilotene og lukk produksjonsgaten før en topp-50-kø åpnes.</li>
            <li><span className="font-medium">Nordisk paritet:</span> FI/IS 2025 er en uimportert 15+1-kandidatbatch bak kilde-/modellporter; MVK-replikering mangler landkonfig, ID-regler og kandidatpilot.</li>
            <li><span className="font-medium">Ikke mer bredde:</span> aktørgulvet er nådd; ekte C-hull dokumenteres som funn, ikke jaktes.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Kildefiler for denne statusen" sub="Hver seksjon over leses fra en komittert fil; datoen er filens siste endring da statusen ble generert." />
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-3 py-2 font-medium">Seksjon</th>
                <th className="px-3 py-2 font-medium">Fil</th>
                <th className="px-3 py-2 font-medium">Endret</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {status.sources.map((source) => (
                <tr key={`${source.id}-${source.path}`} className="border-b border-stone-100 last:border-b-0">
                  <td className="px-3 py-1.5 text-stone-700">{source.id}</td>
                  <td className="px-3 py-1.5 font-mono text-[10px] text-stone-500">{source.path}</td>
                  <td className="px-3 py-1.5 tabular-nums text-stone-500">{fmtDate(source.modifiedAt)}</td>
                  <td className="px-3 py-1.5">
                    {source.ok ? (
                      <span className="text-emerald-600">lest</span>
                    ) : (
                      <span className="font-medium text-red-600">mangler</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
