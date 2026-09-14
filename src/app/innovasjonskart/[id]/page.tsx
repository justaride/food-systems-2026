import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { FimValue } from '@/components/fim/FimValue'
import {
  FIM_COHORT_LABELS,
  FIM_EVIDENCE_STATE_LABELS,
  FIM_EVIDENCE_STATE_STYLES,
  FIM_NEUTRAL_STYLE,
  FIM_VERDICT_STYLES,
} from '@/components/fim/labels'
import { FIM_FIELD_ORDER, type FimField, type FimPilotReview } from '@/lib/fim/profile-rows'
import { getFimProfile } from '@/lib/queries/fim'

export const metadata = { title: 'Innovasjonskart — Food Systems 2026' }

type Obj = Record<string, unknown>
const asObj = (value: unknown): Obj => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Obj) : {})
const asObjects = (value: unknown): Obj[] => (Array.isArray(value) ? value.filter((v): v is Obj => Boolean(v) && typeof v === 'object') : [])
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

function formatPeriod(value: unknown) {
  const period = asObj(value)
  const from = text(period.fraDato)
  const to = text(period.tilDato)
  return from || to ? `${from ?? '?'} – ${to ?? '?'}` : text(value)
}

function Badge({ label, style }: { label: string; style: string }) {
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] ${style}`}>{label}</span>
}

function SourceRef({ source }: { source: unknown }) {
  const ref = asObj(source)
  const url = text(ref.url) ?? text(ref.final_url)
  const local = [text(ref.release), text(ref.path)].filter(Boolean).join('/')
  const captured = text(ref.captured_at)?.slice(0, 10)
  if (!url && !local) return null
  return (
    <span className="text-[11px] text-stone-500">
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-emerald-700 hover:underline">{url}</a>
        : <span className="break-all font-mono">{local}</span>}
      {text(ref.json_pointer) && <span className="font-mono"> {text(ref.json_pointer)}</span>}
      {captured && <> · hentet {captured}</>}
    </span>
  )
}

function FindingItem({ finding }: { finding: Obj }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm text-stone-700">
      <div className="mb-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-stone-400">
        {text(finding.kind) && <span>{text(finding.kind)}</span>}
        {formatPeriod(finding.period) && <span>{formatPeriod(finding.period)}</span>}
        {text(finding.scope) && <span>{text(finding.scope)}</span>}
      </div>
      <div className="overflow-x-auto"><FimValue value={finding.value} /></div>
      {text(finding.statement) && <p className="mt-1 text-xs text-stone-600">{text(finding.statement)}</p>}
      {asObjects(finding.source_refs).map((source, i) => <div key={i} className="mt-1"><SourceRef source={source} /></div>)}
    </div>
  )
}

function FieldCard({ fieldKey, field, findings }: { fieldKey: string; field: FimField; findings: Obj[] }) {
  const evidence = asObjects(field.evidence)
  const issues = Array.isArray(field.issues) ? field.issues : []
  const numeric = Array.isArray(field.numeric_observations) ? field.numeric_observations : []
  return (
    <Card className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-stone-800">{field.label ?? fieldKey}</h3>
        <div className="flex flex-wrap gap-1">
          <Badge
            label={FIM_EVIDENCE_STATE_LABELS[field.evidence_state] ?? field.evidence_state}
            style={FIM_EVIDENCE_STATE_STYLES[field.evidence_state] ?? FIM_NEUTRAL_STYLE}
          />
          {findings.length > 0 && <Badge label={`${findings.length} kildefunn`} style={FIM_EVIDENCE_STATE_STYLES.enriched_candidate} />}
        </div>
      </div>
      {findings.length > 0 && (
        <div className="mt-3 space-y-2">
          {findings.map((finding, i) => <FindingItem key={String(finding.finding_id ?? i)} finding={finding} />)}
        </div>
      )}
      {evidence.length === 0 ? (
        findings.length === 0 && <p className="mt-2 text-xs text-stone-400">Ingen strukturert evidens.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {evidence.map((item, i) => (
            <div key={i} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
              <div className="mb-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-stone-400">
                {text(item.kind) && <span>{text(item.kind)}</span>}
                {formatPeriod(item.reporting_period) && <span>{formatPeriod(item.reporting_period)}</span>}
                {text(item.scope) && <span>{text(item.scope)}</span>}
              </div>
              <div className="overflow-x-auto"><FimValue value={item.value} /></div>
              {text(item.statement) && <p className="mt-1 text-xs text-stone-600">{text(item.statement)}</p>}
              {text(item.qualification) && <p className="mt-1 text-xs italic text-stone-500">{text(item.qualification)}</p>}
              <div className="mt-1"><SourceRef source={item.source_ref} /></div>
            </div>
          ))}
        </div>
      )}
      {numeric.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <p className="mb-1 text-xs font-medium text-stone-500">Tallobservasjoner</p>
          <FimValue value={numeric} />
        </div>
      )}
      {issues.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-rose-700">Avvik</p>
          <FimValue value={issues} />
        </div>
      )}
    </Card>
  )
}

function PilotReview({ review }: { review: FimPilotReview }) {
  return (
    <Card title="Automatisert pilotgjennomgang (v001)">
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span>Samlet vurdering:</span>
        {review.verdict && <Badge label={review.verdict} style={FIM_VERDICT_STYLES[review.verdict] ?? FIM_NEUTRAL_STYLE} />}
        {review.excludedClaimCount > 0 && <span>· {review.excludedClaimCount} påstander utelatt</span>}
      </div>
      <p className="mt-1 text-xs text-stone-400">Maskinell kontroll mot kildene, ikke menneskelig godkjenning.</p>
      <div className="mt-4 space-y-3">
        {review.claims.map(claim => (
          <div key={claim.claimId} className="rounded-lg border border-stone-200 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-stone-400">
              {claim.verdict && <Badge label={claim.verdict} style={FIM_VERDICT_STYLES[claim.verdict] ?? FIM_NEUTRAL_STYLE} />}
              <span>{claim.fields.join(', ')}</span>
              {claim.period && <span>{claim.period}</span>}
            </div>
            {claim.statement && <p className="mt-1 text-sm text-stone-700">{claim.statement}</p>}
            {claim.scope && <p className="mt-1 text-xs text-stone-500">Omfang: {claim.scope}</p>}
            {claim.reason && <p className="mt-1 text-xs italic text-stone-500">{claim.reason}</p>}
            <div className="mt-1 space-y-0.5">
              {claim.sources.map((source, i) => (
                <div key={i}><SourceRef source={{ url: source.url, json_pointer: source.pointer }} /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {review.fieldAssessments.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <p className="mb-1 text-xs font-medium text-stone-500">Feltvurderinger</p>
          <FimValue value={review.fieldAssessments} />
        </div>
      )}
      {review.escalations.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <p className="mb-1 text-xs font-medium text-amber-700">Eskalerte spørsmål</p>
          <FimValue value={review.escalations} />
        </div>
      )}
    </Card>
  )
}

export default async function FimProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getFimProfile(decodeURIComponent(id))
  if (!profile) return notFound()

  const fields = profile.fields as Record<string, FimField>
  const fieldKeys = [...FIM_FIELD_ORDER.filter(key => key in fields), ...Object.keys(fields).filter(key => !FIM_FIELD_ORDER.includes(key))]
  const findings = asObjects(profile.findings)
  const findingFields = (finding: Obj) => (Array.isArray(finding.fields) ? finding.fields.map(String) : [])
  const findingsFor = (key: string) => findings.filter(finding => findingFields(finding).includes(key))
  const unmappedFindings = findings.filter(finding => !findingFields(finding).some(key => fieldKeys.includes(key)))
  const observations = asObjects(profile.numericObservations)
  const openQuestions = asObjects(profile.openQuestions)
  const narrative = asObj(profile.narrative)
  const pilotReview = profile.pilotReview as FimPilotReview | null

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/innovasjonskart" className="hover:text-emerald-700">Innovasjonskart</Link>
        <span>/</span>
        <span className="font-medium text-stone-700">{profile.name}</span>
      </nav>

      <InternalBanner
        label="Kandidatprofil"
        note={`Utgave ${profile.releaseId}. Maskinelt strukturert fra kilder, ikke menneskelig verifisert. Les forbeholdet på hvert felt.`}
      />

      <div>
        <h1 className="text-2xl font-bold text-stone-900">{profile.name}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
          {profile.orgNumber && <span className="tabular-nums">Org.nr. {profile.orgNumber}</span>}
          <span>· {profile.entityKind}</span>
          <span>· {FIM_COHORT_LABELS[profile.cohort] ?? profile.cohort}</span>
          {profile.company && (
            <Link href={`/selskap/${profile.company.id}`} className="text-emerald-700 hover:underline">· Selskapsprofil</Link>
          )}
        </div>
        {profile.origin && <p className="mt-2 text-xs text-stone-500">Opprinnelse: {profile.origin}</p>}
        {text(narrative.text) && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-700">
            {text(narrative.text)}
            {text(narrative.status) && <span className="ml-2 text-xs text-stone-400">({text(narrative.status)})</span>}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Felt med kilder</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{profile.documentedFieldCount} / {fieldKeys.length}</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Kildefunn</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{findings.length}</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Tallobservasjoner</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{observations.length}</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Åpne konflikter</div>
          <div className={`mt-1 text-2xl font-bold ${profile.conflictCount > 0 ? 'text-rose-700' : 'text-stone-900'}`}>{profile.conflictCount}</div>
        </Card>
      </div>

      {pilotReview && <PilotReview review={pilotReview} />}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-900">Profilfelt</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {fieldKeys.map(key => <FieldCard key={key} fieldKey={key} field={fields[key]} findings={findingsFor(key)} />)}
        </div>
      </section>

      {unmappedFindings.length > 0 && (
        <Card title={`Kildefunn uten profilfelt (${unmappedFindings.length})`}>
          <div className="space-y-2">
            {unmappedFindings.map((finding, i) => <FindingItem key={String(finding.finding_id ?? i)} finding={finding} />)}
          </div>
        </Card>
      )}

      {observations.length > 0 && (
        <Card title={`Tallobservasjoner (${observations.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400">
                  <th className="py-1 pr-3 font-medium">Metrikk</th>
                  <th className="py-1 pr-3 text-right font-medium">Verdi</th>
                  <th className="py-1 pr-3 font-medium">Enhet</th>
                  <th className="py-1 pr-3 font-medium">Periode</th>
                  <th className="py-1 pr-3 font-medium">Omfang</th>
                  <th className="py-1 pr-3 font-medium">Grunnlag</th>
                  <th className="py-1 font-medium">Kilde</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((observation, i) => (
                  <tr key={i} className="border-b border-stone-100 align-top">
                    <td className="py-1 pr-3 text-stone-700">{text(observation.metric)}</td>
                    <td className="py-1 pr-3 text-right"><FimValue value={observation.value} /></td>
                    <td className="py-1 pr-3 text-stone-500">{text(observation.unit)}</td>
                    <td className="py-1 pr-3 text-stone-500">{formatPeriod(observation.period) ?? '—'}</td>
                    <td className="py-1 pr-3 text-stone-500">{text(observation.scope)}</td>
                    <td className="py-1 pr-3 text-stone-500">{text(observation.basis)}</td>
                    <td className="py-1"><SourceRef source={observation.source_ref} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {openQuestions.length > 0 && (
        <Card title="Åpne spørsmål fra tidligere dossier">
          <ul className="space-y-1 text-sm text-stone-700">
            {openQuestions.map((question, i) => (
              <li key={i}><span className="text-xs text-stone-400">{text(question.field)}: </span>{text(question.question)}</li>
            ))}
          </ul>
        </Card>
      )}

      {profile.assessment !== null && (
        <Card title="Vurdering i v009">
          <div className="overflow-x-auto"><FimValue value={profile.assessment} /></div>
        </Card>
      )}
    </div>
  )
}
