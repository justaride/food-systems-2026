import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Glossary } from '@/components/ui/Glossary'
import { getActorBySlug } from '@/lib/queries/actors'
import { EntityNeighborhood } from '@/components/graph/EntityNeighborhood'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { InternalSection } from '@/components/ui/InternalSection'

const STANCE_LABELS: Record<string, string> = {
  champion: 'Champion',
  supportive: 'Supportive',
  neutral: 'Neutral',
  skeptical: 'Skeptical',
  opposed: 'Opposed',
}

const STANCE_STYLES: Record<string, string> = {
  champion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  supportive: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-stone-100 text-stone-600 border-stone-200',
  skeptical: 'bg-amber-50 text-amber-700 border-amber-200',
  opposed: 'bg-rose-50 text-rose-700 border-rose-200',
}

const PRIORITY_STYLES: Record<string, string> = {
  p1: 'bg-stone-900 text-white border-stone-900',
  p2: 'bg-stone-100 text-stone-700 border-stone-200',
  p3: 'bg-white text-stone-500 border-stone-200',
}

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const actor = await getActorBySlug(slug)

  if (!actor) return notFound()

  return (
    <div className="space-y-6">
      <InternalBanner note="Intern aktørprofil: påvirkningsvurdering, ikke ekstern fakta-profil." />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-stone-900">{actor.name}</h1>
          {actor.priorityTier && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[actor.priorityTier] ?? PRIORITY_STYLES.p3}`}>
              {actor.priorityTier.toUpperCase()}
            </span>
          )}
          {actor.currentStance && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STANCE_STYLES[actor.currentStance] ?? STANCE_STYLES.neutral}`}>
              {STANCE_LABELS[actor.currentStance] ?? actor.currentStance}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
          <span>{actor.actorType}</span>
          {actor.organizationType && <span>· {actor.organizationType}</span>}
          <span>· {actor.country}</span>
          {actor.website && (
            <a href={actor.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
              Nettside
            </a>
          )}
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-700">{actor.roleSummary}</p>
      </div>

      <Glossary category="status" title="Statusforklaringer" />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Makt</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{actor.powerScore ?? '—'}</div>
          <div className="text-xs text-stone-500">Skala 1-5</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Interesse</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{actor.interestScore ?? '—'}</div>
          <div className="text-xs text-stone-500">Skala 1-5</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Ansvar</div>
          <div className="mt-1 text-lg font-semibold text-stone-900">{actor.owner ?? 'Ikke satt'}</div>
          <div className="text-xs text-stone-500">Intern eier</div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-stone-400">Dokumenter</div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{actor.documentRefs.length}</div>
          <div className="text-xs text-stone-500">Kildekoblinger</div>
        </Card>
      </div>

      <EntityNeighborhood
        groups={[
          {
            label: 'Utgående aktørrelasjoner',
            items: actor.relationshipsFrom.map(relation => ({
              label: relation.toActor.name,
              href: `/aktorer/${relation.toActor.slug}`,
              meta: relation.note ?? relation.toActor.actorType,
              badge: relation.relationType,
            })),
            emptyText: 'Ingen utgående aktørrelasjoner registrert.',
          },
          {
            label: 'Inngående aktørrelasjoner',
            items: actor.relationshipsTo.map(relation => ({
              label: relation.fromActor.name,
              href: `/aktorer/${relation.fromActor.slug}`,
              meta: relation.note ?? relation.fromActor.actorType,
              badge: relation.relationType,
            })),
            emptyText: 'Ingen inngående aktørrelasjoner registrert.',
          },
          {
            label: 'Dokumentkoblinger',
            items: actor.documentRefs.map(ref => ({
              label: ref.document.title,
              href: `/bibliotek/${ref.document.slug}`,
              meta: ref.context ?? ref.document.category ?? 'actor-ref',
            })),
            emptyText: 'Ingen dokumentkoblinger registrert.',
          },
          {
            label: 'Koblet selskap',
            items: actor.company
              ? [{
                  label: actor.company.name,
                  href: `/selskap/${actor.company.id}`,
                  meta: actor.company.valueChainStage ?? 'selskap',
                  badge: actor.company.ownershipType ?? undefined,
                }]
              : [],
            emptyText: 'Ingen selskapskobling registrert.',
          },
        ]}
      />

      <InternalSection label="påvirkningsarbeid (asks, eier, ønsket stance)">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <Card title="Commitment Snapshot">
            <div className="space-y-4">
              {actor.currentRelevance && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Hvorfor denne aktøren betyr noe nå</p>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">{actor.currentRelevance}</p>
                </div>
              )}

              {actor.specificAsk && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Specific ask</p>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">{actor.specificAsk}</p>
                </div>
              )}

              {actor.nextStep && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Neste steg</p>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">{actor.nextStep}</p>
                </div>
              )}

              {actor.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Notater</p>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">{actor.notes}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Profil">
            <div className="space-y-3 text-sm text-stone-700">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400">Ønsket stance</p>
                <p className="mt-1">{actor.desiredStance ? STANCE_LABELS[actor.desiredStance] ?? actor.desiredStance : 'Ikke satt'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400">Tematagger</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {actor.themeTags.length > 0 ? (
                    actor.themeTags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500">Ingen tagger</span>
                  )}
                </div>
              </div>
              {actor.company && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400">Koblet selskap</p>
                  <div className="mt-1">
                    <Link href={`/selskap/${actor.company.id}`} className="font-medium text-rose-700 hover:underline">
                      {actor.company.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-1">
                      {actor.company.valueChainStage ?? 'ukjent ledd'}
                      {actor.company.ownershipType ? ` · ${actor.company.ownershipType}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </InternalSection>

      {actor.contacts.length > 0 && (
        <Card title="Kontakter">
          <div className="grid gap-3 sm:grid-cols-2">
            {actor.contacts.map(contact => (
              <div key={contact.id} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="font-medium text-stone-900">{contact.name}</p>
                {contact.role && <p className="text-sm text-stone-600">{contact.role}</p>}
                {contact.organization && <p className="text-xs text-stone-500 mt-1">{contact.organization}</p>}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="mt-2 block text-sm text-emerald-700 hover:underline">
                    {contact.email}
                  </a>
                )}
                {contact.note && <p className="text-xs text-stone-500 mt-2">{contact.note}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Utgaaende relasjoner">
          <div className="space-y-2">
            {actor.relationshipsFrom.length > 0 ? (
              actor.relationshipsFrom.map(relation => (
                <div key={relation.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-stone-900">{relation.relationType}</span>
                    {relation.strength && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 text-stone-600">
                        {relation.strength}
                      </span>
                    )}
                  </div>
                  <Link href={`/aktorer/${relation.toActor.slug}`} className="mt-1 inline-block text-sm text-emerald-700 hover:underline">
                    {relation.toActor.name}
                  </Link>
                  {relation.note && <p className="text-xs text-stone-500 mt-2">{relation.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Ingen utgaaende relasjoner registrert.</p>
            )}
          </div>
        </Card>

        <Card title="Inngaende relasjoner">
          <div className="space-y-2">
            {actor.relationshipsTo.length > 0 ? (
              actor.relationshipsTo.map(relation => (
                <div key={relation.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-stone-900">{relation.relationType}</span>
                    {relation.strength && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 text-stone-600">
                        {relation.strength}
                      </span>
                    )}
                  </div>
                  <Link href={`/aktorer/${relation.fromActor.slug}`} className="mt-1 inline-block text-sm text-emerald-700 hover:underline">
                    {relation.fromActor.name}
                  </Link>
                  {relation.note && <p className="text-xs text-stone-500 mt-2">{relation.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Ingen inngaende relasjoner registrert.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Kildegrunnlag">
        <div className="space-y-2">
          {actor.documentRefs.length > 0 ? (
            actor.documentRefs.map(ref => (
              <div key={ref.id} className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/bibliotek/${ref.document.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">
                    {ref.document.title}
                  </Link>
                  <p className="text-xs text-stone-500 mt-1">
                    {ref.document.category ?? 'research'}
                    {ref.document.country ? ` · ${ref.document.country}` : ''}
                  </p>
                </div>
                {ref.context && <span className="text-xs text-stone-500">{ref.context}</span>}
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">Ingen dokumentkoblinger registrert.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
