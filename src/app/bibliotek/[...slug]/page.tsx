import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocumentBySlug } from '@/lib/queries/documents'
import { Card } from '@/components/ui/Card'
import { EntityNeighborhood } from '@/components/graph/EntityNeighborhood'
import { Citation, type CitationViewModel } from '@/components/citations/Citation'
import { CitationBibliography } from '@/components/citations/CitationBibliography'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RelatedLinks } from '@/components/ui/RelatedLinks'

type Props = {
  params: Promise<{ slug: string[] }>
}

function formatWordCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k ord`
  return `${n} ord`
}

function mapSourceCitation(citation: {
  citationText: string
  title: string | null
  url: string | null
  localPath: string | null
  pageRef: string | null
  accessedAt: Date | null
  verifiedAt: Date | null
  citationReadiness: string
  notes: string | null
}): CitationViewModel {
  return {
    citationText: citation.citationText,
    title: citation.title,
    url: citation.url,
    localPath: citation.localPath,
    pageRef: citation.pageRef,
    accessedAt: citation.accessedAt,
    verifiedAt: citation.verifiedAt,
    citationReadiness: citation.citationReadiness,
    notes: citation.notes,
  }
}

function fallbackCitation(args: {
  label: string
  url?: string | null
  localPath?: string | null
  note: string
}): CitationViewModel {
  const hasSource = Boolean(args.url || args.localPath)
  return {
    label: args.label,
    url: args.url ?? null,
    localPath: args.localPath ?? null,
    citationReadiness: hasSource ? 'citable_with_note' : 'blocked_unsourced',
    note: hasSource ? args.note : 'Ingen verifisert kildepost registrert.',
  }
}

export default async function DocumentDetailPage({ params }: Props) {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')
  const doc = await getDocumentBySlug(slug)

  if (!doc) notFound()

  const hasRefs = doc.refsFrom.length > 0 || doc.refsTo.length > 0
  const meta = [doc.author, doc.year, doc.documentType, doc.country].filter(Boolean)
  const actorItemsByHref = new Map<
    string,
    { label: string; href: string; meta?: string; badge?: string }
  >()

  for (const ref of doc.actorDocumentRefs) {
    actorItemsByHref.set(`/aktorer/${ref.actor.slug}`, {
      label: ref.actor.name,
      href: `/aktorer/${ref.actor.slug}`,
      meta: ref.context ?? ref.actor.actorType,
      badge: ref.actor.themeTags[0],
    })
  }

  for (const ref of doc.companyDocumentRefs) {
    const actor = ref.company.actor
    if (!actor) continue

    const href = `/aktorer/${actor.slug}`
    if (actorItemsByHref.has(href)) continue

    actorItemsByHref.set(href, {
      label: actor.name,
      href,
      meta: `via ${ref.company.name}${ref.context ? ` · ${ref.context}` : ''}`,
      badge: actor.themeTags[0] ?? actor.actorType,
    })
  }

  const actorItems = [...actorItemsByHref.values()]
  const relatedItems = [
    ...doc.companyDocumentRefs.map(ref => ({
      label: ref.company.name,
      href: `/selskap/${ref.company.id}`,
      meta: ref.context ?? ref.company.valueChainStage ?? 'Selskapskobling',
      badge: ref.company.ownershipType,
    })),
    ...doc.actorDocumentRefs.map(ref => ({
      label: ref.actor.name,
      href: `/aktorer/${ref.actor.slug}`,
      meta: ref.context ?? ref.actor.actorType,
      badge: ref.actor.themeTags[0],
    })),
    ...doc.refsFrom
      .filter(ref => ref.to)
      .map(ref => ({
        label: ref.to!.title,
        href: `/bibliotek/${ref.to!.slug}`,
        meta: ref.refType,
        badge: 'refererer til',
      })),
    ...doc.refsTo
      .filter(ref => ref.from)
      .map(ref => ({
        label: ref.from!.title,
        href: `/bibliotek/${ref.from!.slug}`,
        meta: ref.refType,
        badge: 'referert av',
      })),
  ]
  const storedCitations = [
    ...doc.sourceCitations.map(mapSourceCitation),
    ...(doc.sourceDoc?.sourceCitations ?? []).map(mapSourceCitation),
  ]
  const documentCitations =
    storedCitations.length > 0
      ? storedCitations
      : [
          fallbackCitation({
            label: doc.title,
            url: doc.url,
            localPath: doc.filePath,
            note: 'Dokumentlenke/lokal fil finnes; kontroller sidegrunnlag for direkte sitatbruk.',
          }),
        ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bibliotek', href: '/bibliotek' }, { label: doc.title }]} />

      <div>
        <h1 className="text-2xl font-bold text-stone-900">{doc.title}</h1>
        {meta.length > 0 && (
          <p className="text-sm text-stone-400 mt-1">
            {meta.join(' \u00b7 ')}
          </p>
        )}
        <p className="text-xs text-stone-400 mt-0.5">{formatWordCount(doc.wordCount)}</p>
      </div>

      {doc.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {doc.tags.map((tag, index) => (
            <span
              key={`${doc.id}-${tag}-${index}`}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <RelatedLinks items={relatedItems} />

      {doc.summary && (
        <Card title="Sammendrag">
          <p className="text-sm text-stone-700 leading-relaxed">{doc.summary}</p>
        </Card>
      )}

      <CitationBibliography citations={documentCitations} />

      <EntityNeighborhood
        groups={[
          {
            label: 'Refererer til',
            items: doc.refsFrom
              .filter(ref => ref.to)
              .map(ref => ({
                label: ref.to.title,
                href: `/bibliotek/${ref.to.slug}`,
                meta: ref.refType,
                badge: 'utgående',
              })),
            emptyText: 'Ingen utgående dokumentreferanser.',
          },
          {
            label: 'Referert av',
            items: doc.refsTo
              .filter(ref => ref.from)
              .map(ref => ({
                label: ref.from.title,
                href: `/bibliotek/${ref.from.slug}`,
                meta: ref.refType,
                badge: 'inngående',
              })),
            emptyText: 'Ingen inngående dokumentreferanser.',
          },
          {
            label: 'Innsikter',
            items: doc.insightDocumentRefs.map(ref => ({
              label: ref.insight.title,
              href: `/innsikt#${ref.insight.id}`,
              meta: ref.relevance,
              badge: ref.insight.insightType,
            })),
            emptyText: 'Ingen innsiktskoblinger registrert.',
          },
          {
            label: 'Selskaper',
            items: doc.companyDocumentRefs.map(ref => ({
              label: ref.company.name,
              href: `/selskap/${ref.company.id}`,
              meta: ref.context ?? ref.company.valueChainStage ?? 'company-ref',
              badge: ref.company.ownershipType ?? undefined,
            })),
            emptyText: 'Ingen selskapskoblinger registrert.',
          },
          {
            label: 'Aktører',
            items: actorItems,
            emptyText: 'Ingen aktørkoblinger registrert.',
          },
        ]}
      />

      <Card title="Fulltekst">
        <div className="max-h-[600px] overflow-y-auto rounded-lg bg-stone-50 border border-stone-200 p-4">
          <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
            {doc.content}
          </pre>
        </div>
      </Card>

      {hasRefs && (
        <Card title="Relaterte dokumenter">
          <div className="space-y-3">
            {doc.refsFrom.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-1.5">Refererer til</p>
                <div className="flex gap-1.5 flex-wrap">
                  {doc.refsFrom.map(ref => ref.to && (
                    <Link
                      key={ref.to.id}
                      href={`/bibliotek/${ref.to.slug}`}
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {ref.to.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {doc.refsTo.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-1.5">Referert av</p>
                <div className="flex gap-1.5 flex-wrap">
                  {doc.refsTo.map(ref => ref.from && (
                    <Link
                      key={ref.from.id}
                      href={`/bibliotek/${ref.from.slug}`}
                      className="text-xs px-2 py-1 rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
                    >
                      {ref.from.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {doc.thesis && (
        <Card title="Masteroppgave / PhD">
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-stone-400 shrink-0 w-24">Forfattere</span>
              <span className="text-stone-700">{doc.thesis.authors}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-stone-400 shrink-0 w-24">Institusjon</span>
              <span className="text-stone-700">{doc.thesis.institution}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-stone-400 shrink-0 w-24">Grad</span>
              <span className="text-stone-700">{doc.thesis.degree === 'phd' ? 'PhD' : 'Master'}</span>
            </div>
            {doc.thesis.method && (
              <div className="flex gap-2">
                <span className="text-stone-400 shrink-0 w-24">Metode</span>
                <span className="text-stone-700">{doc.thesis.method}</span>
              </div>
            )}
            {doc.thesis.keyFindings.length > 0 && (
              <div>
                <p className="text-stone-400 mb-1">Hovedfunn</p>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  {doc.thesis.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            {doc.thesis.url && (
              <Citation
                className="mt-1"
                citation={fallbackCitation({
                  label: 'Oppgave',
                  url: doc.thesis.url,
                  note: 'Tilknyttet oppgavelink; kontroller sidegrunnlag for direkte sitatbruk.',
                })}
              />
            )}
          </div>
        </Card>
      )}

      {doc.report && (
        <Card title="Rapport">
          <div className="space-y-2 text-sm">
            {doc.report.institution && (
              <div className="flex gap-2">
                <span className="text-stone-400 shrink-0 w-24">Institusjon</span>
                <span className="text-stone-700">{doc.report.institution}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-stone-400 shrink-0 w-24">Kategori</span>
              <span className="text-stone-700">{doc.report.reportCategory}</span>
            </div>
            {doc.report.relevance && (
              <div className="flex gap-2">
                <span className="text-stone-400 shrink-0 w-24">Relevans</span>
                <span className="text-stone-700">{doc.report.relevance}</span>
              </div>
            )}
            {doc.report.keyFindings.length > 0 && (
              <div>
                <p className="text-stone-400 mb-1">Hovedfunn</p>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  {doc.report.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            {doc.report.recommendations.length > 0 && (
              <div>
                <p className="text-stone-400 mb-1">Anbefalinger</p>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  {doc.report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {doc.report.sourceUrl && (
              <Citation
                className="mt-1"
                citation={fallbackCitation({
                  label: 'Rapport',
                  url: doc.report.sourceUrl,
                  note: 'Tilknyttet rapportlink; kontroller felt-/sidegrunnlag for direkte sitatbruk.',
                })}
              />
            )}
          </div>
        </Card>
      )}

      {doc.sourceDoc && (
        <Card title="Kildedokument">
          <div className="space-y-2 text-sm">
            {doc.sourceDoc.description && (
              <p className="text-stone-700">{doc.sourceDoc.description}</p>
            )}
            <div className="flex gap-2">
              <span className="text-stone-400 shrink-0 w-24">Type</span>
              <span className="text-stone-700">{doc.sourceDoc.sourceType}</span>
            </div>
            {doc.sourceDoc.relevance && (
              <div className="flex gap-2">
                <span className="text-stone-400 shrink-0 w-24">Relevans</span>
                <span className="text-stone-700">{doc.sourceDoc.relevance}</span>
              </div>
            )}
            {doc.sourceDoc.url && (
              <Citation
                className="mt-1"
                citation={fallbackCitation({
                  label: 'Kildedokument',
                  url: doc.sourceDoc.url,
                  note: 'Kildedokumentlenke; kontroller sidegrunnlag for direkte sitatbruk.',
                })}
              />
            )}
          </div>
        </Card>
      )}

      {doc.url && (
        <div className="pt-2">
          <Citation
            citation={fallbackCitation({
              label: 'Ekstern kilde',
              url: doc.url,
              note: 'Dokumentets eksterne URL; kontroller sidegrunnlag for direkte sitatbruk.',
            })}
          />
        </div>
      )}
    </div>
  )
}
