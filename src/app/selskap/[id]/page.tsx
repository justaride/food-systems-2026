import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getCompanyById } from '@/lib/queries/companies'
import { getCompanyTreeIds, resolveKonsernRootOrgNr, KONSERN_REGISTRY } from '@/lib/queries/ownership'
import { getPersonKeysWithProfiles } from '@/lib/queries/persons'
import { getInterlockSummaryForCompany } from '@/lib/queries/interlocks'
import { financialAmountToNok } from '@/lib/queries/financial-units'
import { CompanyPropertiesPanel } from './CompanyPropertiesPanel'
import { EntityNeighborhood } from '@/components/graph/EntityNeighborhood'
import { Citation, type CitationViewModel } from '@/components/citations/Citation'

function formatNokBillions(value: number | null): string {
  return value != null ? `${(value / 1e9).toFixed(1)} mrd` : '—'
}

function formatNokMillions(value: number | null): string {
  return value != null ? `${(value / 1e6).toFixed(0)} MNOK` : '—'
}

function formatPct(value: unknown): string {
  return value != null ? `${Number(value)}%` : '—'
}

function isBlockedSource(source: string | null | undefined) {
  if (!source) return true
  const normalized = source.toLowerCase()
  return (
    normalized.includes('blocked-unsourced') ||
    normalized.includes('blocked_unsourced') ||
    normalized.includes('legacy_unsourced') ||
    normalized.includes('unverified-label')
  )
}

function companyCitation(args: {
  label: string
  source?: string | null
  sourceUrl?: string | null
  verifiedAt?: Date | null
  note: string
}): CitationViewModel {
  const blocked = isBlockedSource(args.source) && !args.sourceUrl
  const hasSource = Boolean(args.source || args.sourceUrl)

  return {
    label: args.label,
    citationText: args.source ?? args.label,
    url: args.sourceUrl ?? null,
    verifiedAt: args.verifiedAt ?? null,
    citationReadiness: blocked || !hasSource
      ? 'blocked_unsourced'
      : args.sourceUrl && args.verifiedAt
        ? 'citable_external'
        : 'citable_with_note',
    note: blocked || !hasSource ? 'Ingen verifisert ekstern kilde registrert.' : args.note,
  }
}

export default async function SelskapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [company, treeIds, profileKeys, interlockSummary, konsernRootOrgNr] = await Promise.all([
    getCompanyById(id),
    getCompanyTreeIds(),
    getPersonKeysWithProfiles(),
    getInterlockSummaryForCompany(id),
    resolveKonsernRootOrgNr(id),
  ])
  if (!company) return notFound()
  const memberScoreByKey = new Map(
    interlockSummary.memberScores.map(member => [member.personKey, member])
  )
  const interlockingMemberCount = interlockSummary.interlockingMembers
  const isInTree = treeIds.has(company.id)

  // Determine if this company belongs to a tracked konsern
  const konsernSlug = konsernRootOrgNr ? (KONSERN_REGISTRY[konsernRootOrgNr]?.slug ?? null) : null

  const latestFinancial = company.financials[0]
  const latestRevenueNok = financialAmountToNok(latestFinancial?.revenueNok, latestFinancial?.source)
  const latestOperatingResultNok = financialAmountToNok(
    latestFinancial?.operatingResult,
    latestFinancial?.source
  )
  const latestEbitdaNok = financialAmountToNok(latestFinancial?.ebitda, latestFinancial?.source)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900">{company.name}</h1>
          {company.ownershipType && (
            <StatusBadge status={company.ownershipType} />
          )}
        </div>
        <div className="flex gap-3 mt-1 text-sm text-stone-400">
          <span>Org.nr: {company.orgNr}</span>
          {company.hqCity && <span>· {company.hqCity}</span>}
          {company.founded && <span>· Stiftet {company.founded}</span>}
        </div>
        {company.naceDescription && (
          <p className="text-sm text-stone-500 mt-2">{company.naceDescription}</p>
        )}
        {konsernSlug && (
          <Link href={`/eierskap/${konsernSlug}`} className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline mt-2">
            Se konsern &rarr;
          </Link>
        )}
      </div>

      <EntityNeighborhood
        groups={[
          {
            label: 'Utgående relasjoner',
            items: company.relationshipsFrom.map(r => ({
              label: r.toCompany.name,
              href: `/selskap/${r.toCompany.id}`,
              meta: r.description ?? r.relationshipType,
              badge: r.relationshipType,
              detailHref: `/forsyningskjede?relationship=${encodeURIComponent(r.id)}`,
              detailLabel: 'Vis i forsyningskjeden',
            })),
            emptyText: 'Ingen utgående relasjoner registrert.',
          },
          {
            label: 'Inngående relasjoner',
            items: company.relationshipsTo.map(r => ({
              label: r.fromCompany.name,
              href: `/selskap/${r.fromCompany.id}`,
              meta: r.description ?? r.relationshipType,
              badge: r.relationshipType,
              detailHref: `/forsyningskjede?relationship=${encodeURIComponent(r.id)}`,
              detailLabel: 'Vis i forsyningskjeden',
            })),
            emptyText: 'Ingen inngående relasjoner registrert.',
          },
          {
            label: 'Dokumentkoblinger',
            items: company.documentRefs.map(ref => ({
              label: ref.document.title,
              href: `/bibliotek/${ref.document.slug}`,
              meta: ref.context ?? 'company-ref',
            })),
            emptyText: 'Ingen dokumentkoblinger registrert.',
          },
          {
            label: 'Styrepersoner',
            items: company.boardMembers.map(member => ({
              label: member.personName,
              href: profileKeys.has(member.personKey) ? `/personer/${member.personKey}` : undefined,
              meta: member.role,
              badge: (memberScoreByKey.get(member.personKey)?.otherCompanyCount ?? 0) > 0 ? 'kryssverv' : undefined,
            })),
            emptyText: 'Ingen styrepersoner registrert.',
          },
        ]}
      />

      {latestFinancial && (
        <Card title="Regnskap">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Omsetning</p>
              <p className="text-lg font-bold text-stone-900">
                {formatNokBillions(latestRevenueNok)}
              </p>
              <p className="text-xs text-stone-400">{latestFinancial.year}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Driftsresultat</p>
              <p className="text-lg font-bold text-stone-900">
                {formatNokMillions(latestOperatingResultNok)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Driftsmargin</p>
              <p className="text-lg font-bold text-stone-900">
                {formatPct(latestFinancial.operatingMargin)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">EBITDA</p>
              <p className="text-lg font-bold text-stone-900">
                {formatNokMillions(latestEbitdaNok)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Egenkapitalandel</p>
              <p className="text-lg font-bold text-stone-900">
                {formatPct(latestFinancial.equityRatio)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Ansatte</p>
              <p className="text-lg font-bold text-stone-900">
                {latestFinancial.groupEmployees?.toLocaleString() ?? company.employees?.toLocaleString() ?? '—'}
              </p>
            </div>
          </div>

          {company.financials.length > 1 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 text-stone-400">Ar</th>
                    <th className="text-right py-2 text-stone-400">Omsetning</th>
                    <th className="text-right py-2 text-stone-400">Driftsresultat</th>
                    <th className="text-right py-2 text-stone-400">Margin</th>
                    <th className="text-right py-2 text-stone-400">EBITDA</th>
                    <th className="text-right py-2 text-stone-400">Egenkapital</th>
                    <th className="text-right py-2 text-stone-400">Ansatte</th>
                  </tr>
                </thead>
                <tbody>
                  {company.financials.map(f => {
                    const revenueNok = financialAmountToNok(f.revenueNok, f.source)
                    const operatingResultNok = financialAmountToNok(f.operatingResult, f.source)
                    const ebitdaNok = financialAmountToNok(f.ebitda, f.source)
                    return (
                      <tr key={f.id} className="border-b border-stone-100">
                        <td className="py-2 text-stone-700">{f.year}</td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {formatNokBillions(revenueNok)}
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {formatNokMillions(operatingResultNok)}
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {formatPct(f.operatingMargin)}
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {formatNokMillions(ebitdaNok)}
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {formatPct(f.equityRatio)}
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {f.groupEmployees?.toLocaleString() ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 border-t border-stone-100 pt-3">
            <Citation
              citation={companyCitation({
                label: 'Regnskapskilde',
                source: latestFinancial.source,
                note: 'Regnskapsrad/resolver; kontroller arsrapportfelt for ekstern sitatbruk.',
              })}
            />
          </div>
        </Card>
      )}

      {company.shareholders.length > 0 && (
        <Card id="eierskap" title="Aksjonaerer">
          <div className="space-y-2">
            {company.shareholders.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <span className="text-sm text-stone-700">{s.name}</span>
                  {s.shareholderType && (
                    <span className="ml-2 text-xs text-stone-400">({s.shareholderType})</span>
                  )}
                  <div className="mt-1">
                    <Citation
                      compact
                      citation={companyCitation({
                        label: 'Eierskapskilde',
                        source: s.source,
                        sourceUrl: s.sourceUrl,
                        verifiedAt: s.verifiedAt,
                        note: 'Aksjonaeropplysning med kilde-/datoavgrensning.',
                      })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.ownershipPct && (
                    <span className="text-sm font-medium text-stone-700">{Number(s.ownershipPct)}%</span>
                  )}
                  {s.isControlling && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Kontrollerende
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {company.boardMembers.length > 0 && (
        <Card id="styre" title="Styre">
          {interlockingMemberCount > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
              <span className="text-amber-900">
                <strong>{interlockingMemberCount}</strong> av {company.boardMembers.length} har styreverv i andre selskaper.
                <span className="ml-2 font-medium">
                  Krysstyre-score {interlockSummary.interlockScore}
                </span>
                {interlockSummary.connectedCompanies > 0 && (
                  <span className="ml-2 text-amber-800">
                    Binder til {interlockSummary.connectedCompanies} selskaper
                  </span>
                )}
              </span>
              <Link
                href={`/styremedlemmer?company=${company.id}`}
                className="font-medium text-amber-900 hover:underline"
              >
                Vis i kryssstyre-grafen &rarr;
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {company.boardMembers.map(m => {
              const memberScore = memberScoreByKey.get(m.personKey)
              const otherVerv = memberScore?.otherCompanyCount ?? 0
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
                    {m.personName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    {profileKeys.has(m.personKey) ? (
                      <Link href={`/personer/${m.personKey}`} className="text-sm font-medium text-emerald-700 hover:underline">
                        {m.personName}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-stone-800">{m.personName}</p>
                    )}
                    <p className="text-xs text-stone-400">
                      {m.role}
                      {memberScore && (
                        <span className="ml-2">score {memberScore.interlockScore}</span>
                      )}
                    </p>
                    <div className="mt-1">
                      <Citation
                        compact
                        citation={companyCitation({
                          label: 'Styrekilde',
                          source: m.source,
                          sourceUrl: m.sourceUrl,
                          verifiedAt: m.verifiedAt,
                          note: 'Styreopplysning med kilde-/datoavgrensning.',
                        })}
                      />
                    </div>
                  </div>
                  {otherVerv > 0 && (
                    <Link
                      href={`/styremedlemmer?company=${company.id}&person=${m.personKey}`}
                      className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-medium hover:bg-amber-200"
                      title={`${otherVerv} andre styreverv`}
                    >
                      +{otherVerv}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {company.subsidies.length > 0 && (
        <Card id="subsidier" title="Tilskudd">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-400">Type</th>
                  <th className="text-left py-2 text-stone-400">Prosjekt</th>
                  <th className="text-right py-2 text-stone-400">Belop</th>
                  <th className="text-right py-2 text-stone-400">Ar</th>
                </tr>
              </thead>
              <tbody>
                {company.subsidies.map(s => (
                  <tr key={s.id} className="border-b border-stone-100">
                    <td className="py-2 text-stone-700">{s.subsidyType}</td>
                    <td className="py-2 text-stone-700">{s.project ?? '—'}</td>
                    <td className="text-right py-2 text-stone-700 tabular-nums">
                      {s.amountNok ? `${(Number(s.amountNok) / 1e3).toFixed(0)}k` : '—'}
                    </td>
                    <td className="text-right py-2 text-stone-700">{s.year ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(company.ownedProperties.length > 0 || company.tenantProperties.length > 0) && (
        <Card title="Eiendommer">
          <CompanyPropertiesPanel
            owned={company.ownedProperties}
            tenant={company.tenantProperties}
          />
        </Card>
      )}

      {(company.relationshipsFrom.length > 0 || company.relationshipsTo.length > 0) && (
        <Card title="Forretningsrelasjoner">
          <div className="space-y-6">
            {company.relationshipsFrom.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Utgående ({company.relationshipsFrom.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 text-stone-400">Type</th>
                        <th className="text-left py-2 text-stone-400">Motpart</th>
                        <th className="text-left py-2 text-stone-400">Beskrivelse</th>
                        <th className="text-right py-2 text-stone-400">Estimert verdi</th>
                        <th className="text-left py-2 text-stone-400">Status</th>
                        <th className="text-left py-2 text-stone-400">Kilde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.relationshipsFrom.map(r => {
                        const isSelfDealing =
                          r.relationshipType === 'self-dealing' ||
                          r.fromCompanyId === r.toCompanyId
                        return (
                          <tr key={r.id} className="border-b border-stone-100">
                            <td className="py-2 text-stone-700">{r.relationshipType}</td>
                            <td className="py-2">
                              <Link
                                href={`/selskap/${r.toCompany.id}`}
                                className="text-emerald-700 hover:underline"
                              >
                                {r.toCompany.name}
                              </Link>
                            </td>
                            <td className="py-2 text-stone-600">{r.description ?? '—'}</td>
                            <td className="py-2 text-right text-stone-700 tabular-nums">
                              {r.estimatedValue
                                ? `${Math.round(r.estimatedValue).toLocaleString('no')} NOK`
                                : '—'}
                            </td>
                            <td className="py-2">
                              {isSelfDealing ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  Selvhandel
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>
                            <td className="py-2">
                              <Citation
                                compact
                                citation={companyCitation({
                                  label: 'Relasjonskilde',
                                  source: r.source,
                                  note: 'Kuraterte relasjoner; kontroller metodegrunnlag for ekstern sitatbruk.',
                                })}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {company.relationshipsTo.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Inngående ({company.relationshipsTo.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 text-stone-400">Type</th>
                        <th className="text-left py-2 text-stone-400">Motpart</th>
                        <th className="text-left py-2 text-stone-400">Beskrivelse</th>
                        <th className="text-right py-2 text-stone-400">Estimert verdi</th>
                        <th className="text-left py-2 text-stone-400">Status</th>
                        <th className="text-left py-2 text-stone-400">Kilde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.relationshipsTo.map(r => {
                        const isSelfDealing =
                          r.relationshipType === 'self-dealing' ||
                          r.fromCompanyId === r.toCompanyId
                        return (
                          <tr key={r.id} className="border-b border-stone-100">
                            <td className="py-2 text-stone-700">{r.relationshipType}</td>
                            <td className="py-2">
                              <Link
                                href={`/selskap/${r.fromCompany.id}`}
                                className="text-emerald-700 hover:underline"
                              >
                                {r.fromCompany.name}
                              </Link>
                            </td>
                            <td className="py-2 text-stone-600">{r.description ?? '—'}</td>
                            <td className="py-2 text-right text-stone-700 tabular-nums">
                              {r.estimatedValue
                                ? `${Math.round(r.estimatedValue).toLocaleString('no')} NOK`
                                : '—'}
                            </td>
                            <td className="py-2">
                              {isSelfDealing ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  Selvhandel
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>
                            <td className="py-2">
                              <Citation
                                compact
                                citation={companyCitation({
                                  label: 'Relasjonskilde',
                                  source: r.source,
                                  note: 'Kuraterte relasjoner; kontroller metodegrunnlag for ekstern sitatbruk.',
                                })}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {company.documentRefs.length > 0 && (
        <Card title="Relaterte dokumenter">
          <div className="space-y-2">
            {company.documentRefs.map(ref => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <a href={`/bibliotek/${ref.document.slug}`} className="text-sm text-emerald-700 hover:underline">
                  {ref.document.title}
                </a>
                {ref.context && <span className="text-xs text-stone-400">{ref.context}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
