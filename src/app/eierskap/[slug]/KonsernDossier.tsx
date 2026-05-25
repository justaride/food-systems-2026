'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { KonsernDossierData, MaEvent } from '@/lib/queries/ownership'
import type { KonsernFinancialsAggregate, KonsernBoardMember, KonsernSubsidies, KonsernProperties, KonsernRelationships } from '@/lib/queries/konsern'
import { OwnershipTreeDiagram } from '@/components/charts/OwnershipTreeDiagram'

const OWNERSHIP_TYPE_LABEL: Record<string, string> = {
  family:      'Familieeid',
  cooperative: 'Samvirke',
  state:       'Statlig',
  foreign:     'Utenlandsk',
  listed:      'Børsnotert',
  subsidiary:  'Datterselskap',
}

const OWNERSHIP_TYPE_CLASS: Record<string, string> = {
  family:      'bg-amber-50 text-amber-800 border-amber-200',
  cooperative: 'bg-teal-50 text-teal-800 border-teal-200',
  state:       'bg-blue-50 text-blue-800 border-blue-200',
  foreign:     'bg-violet-50 text-violet-800 border-violet-200',
  listed:      'bg-emerald-50 text-emerald-800 border-emerald-200',
  subsidiary:  'bg-stone-100 text-stone-700 border-stone-300',
}

function fmtRevenueMNok(nok: number | null): string {
  if (nok === null) return '—'
  const mnok = nok / 1_000_000
  if (mnok >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  return `${mnok.toFixed(0)} MNOK`
}

function fmtEmployees(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('no-NO')
}

function fmtDaysSince(n: number | null): string {
  if (n === null) return 'Aldri'
  if (n === 0) return 'I dag'
  if (n < 30) return `${n} dager siden`
  if (n < 365) return `${Math.floor(n / 30)} mnd siden`
  return `${Math.floor(n / 365)} år siden`
}

const DEAL_TYPE_LABEL: Record<string, string> = {
  acquisition:   'Oppkjøp',
  merger:        'Fusjon',
  divestment:    'Frasalg',
  'partial-sale': 'Delsalg',
}

const DEAL_TYPE_CLASS: Record<string, string> = {
  acquisition:   'bg-emerald-50 text-emerald-800 border-emerald-200',
  merger:        'bg-blue-50 text-blue-800 border-blue-200',
  divestment:    'bg-rose-50 text-rose-800 border-rose-200',
  'partial-sale': 'bg-amber-50 text-amber-800 border-amber-200',
}

function fmtEventDate(iso: string | null): string {
  if (iso === null) return 'Udatert'
  const d = new Date(iso)
  return d.toLocaleDateString('no-NO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://')
}

// ─── Section 4 helpers ────────────────────────────────────────────────────────

function fmtMnok(nok: number | null): string {
  if (nok === null) return '—'
  const mnok = nok / 1_000_000
  if (Math.abs(mnok) >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  return `${mnok.toFixed(0)} MNOK`
}

function Section4Economy({ financials }: { financials: KonsernFinancialsAggregate }) {
  const { perYear, topRevenueChildren, childrenWithoutLatestFinancial } = financials

  const hasData = perYear.length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Aggregert økonomi</h2>

      {!hasData ? (
        <p className="text-sm text-stone-400 italic">Ingen aggregert finansiell data tilgjengelig</p>
      ) : (
        <div className="space-y-5">
          {/* Year-by-year table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">År</th>
                  <th className="text-right px-3 py-2">Omsetning</th>
                  <th className="text-right px-3 py-2">EBITDA</th>
                  <th className="text-right px-3 py-2">Ansatte</th>
                </tr>
              </thead>
              <tbody>
                {perYear.map(row => (
                  <tr key={row.year} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-3 py-2 tabular-nums font-medium text-stone-700">{row.year}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnok(row.totalRevenueNok)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnok(row.totalEbitdaNok)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtEmployees(row.totalEmployees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top 5 by revenue */}
          {topRevenueChildren.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">
                Topp 5 datterselskap (omsetning siste år)
              </h3>
              <ol className="space-y-1">
                {topRevenueChildren.map((child, i) => (
                  <li key={child.companyId} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <Link
                      href={`/selskap/${child.companyId}`}
                      className="text-emerald-700 hover:underline flex-1 truncate"
                    >
                      {child.companyName}
                    </Link>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnok(child.revenueNok)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Companies without latest financials */}
          {childrenWithoutLatestFinancial.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700 select-none list-none flex items-center gap-1">
                <span className="group-open:rotate-90 inline-block transition-transform text-xs">&#9654;</span>
                Datterselskap uten siste års regnskap ({childrenWithoutLatestFinancial.length})
              </summary>
              <ul className="mt-2 space-y-1 pl-4">
                {childrenWithoutLatestFinancial.map(child => (
                  <li key={child.companyId} className="text-sm">
                    <Link
                      href={`/selskap/${child.companyId}`}
                      className="text-stone-600 hover:text-emerald-700 hover:underline"
                    >
                      {child.companyName}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section 5 helpers ────────────────────────────────────────────────────────

function Section5Board({ board }: { board: KonsernBoardMember[] }) {
  if (board.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Styre &amp; interlocks</h2>
        <p className="text-sm text-stone-400 italic">Ingen styremedlemmer registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Styre &amp; interlocks</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
          <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
            <tr>
              <th className="text-left px-3 py-2">Person</th>
              <th className="text-left px-3 py-2">Roller i konsernet</th>
              <th className="text-right px-3 py-2">Annet styreverv</th>
              <th className="text-left px-3 py-2">Profil</th>
            </tr>
          </thead>
          <tbody>
            {board.map(member => (
              <tr key={member.personKey} className="border-b border-stone-100 hover:bg-stone-50 align-top">
                {/* Person name — link only if hasProfile */}
                <td className="px-3 py-2">
                  {member.hasProfile ? (
                    <Link
                      href={`/personer/${member.personKey}`}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      {member.personName}
                    </Link>
                  ) : (
                    <span className="font-medium text-stone-800">{member.personName}</span>
                  )}
                  {/* Interlock badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.internalInterlock && (
                      <span className="text-xs px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200">
                        intern interlock
                      </span>
                    )}
                    {member.externalInterlock && (
                      <Link
                        href={`/styremedlemmer?personKey=${member.personKey}`}
                        className="text-xs px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      >
                        ekstern interlock ({member.externalCount})
                      </Link>
                    )}
                  </div>
                </td>

                {/* Roles in this konsern */}
                <td className="px-3 py-2">
                  <ul className="space-y-0.5">
                    {member.konsernCompanies.map(kc => (
                      <li key={kc.companyId} className="flex items-start gap-1 text-xs">
                        <Link
                          href={`/selskap/${kc.companyId}`}
                          className="text-stone-600 hover:text-emerald-700 hover:underline shrink-0"
                        >
                          {kc.companyName}
                        </Link>
                        {kc.role && (
                          <span className="text-stone-400">— {kc.role}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>

                {/* External count */}
                <td className="px-3 py-2 text-right tabular-nums text-stone-500 text-xs">
                  {member.externalInterlock ? member.externalCount : '—'}
                </td>

                {/* Profile link */}
                <td className="px-3 py-2">
                  {member.hasProfile ? (
                    <Link
                      href={`/personer/${member.personKey}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Vis profil
                    </Link>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section 6 helpers ────────────────────────────────────────────────────────

function fmtMnokSubsidy(nok: number): string {
  const mnok = nok / 1_000_000
  if (Math.abs(mnok) >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  if (Math.abs(mnok) >= 1) return `${mnok.toFixed(1)} MNOK`
  return `${Math.round(nok / 1_000)} kNOK`
}

function Section6Subsidies({ subsidies, slug }: { subsidies: KonsernSubsidies; slug: string }) {
  if (subsidies.rowCount === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Tilskudd inn</h2>
        <p className="text-sm text-stone-400 italic">Ingen tilskudd registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Tilskudd inn</h2>
      <div className="space-y-5">
        {/* Per-year table */}
        {subsidies.perYear.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">År</th>
                  <th className="text-right px-3 py-2">Total tilskudd</th>
                </tr>
              </thead>
              <tbody>
                {subsidies.perYear.map(row => (
                  <tr key={row.year} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-3 py-2 tabular-nums font-medium text-stone-700">{row.year}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-stone-700">{fmtMnokSubsidy(row.totalNok)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Top schemes */}
          {subsidies.topSchemes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Topp 5 ordninger</h3>
              <ol className="space-y-1">
                {subsidies.topSchemes.map((s, i) => (
                  <li key={s.scheme} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <span className="flex-1 truncate text-stone-700">{s.scheme}</span>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnokSubsidy(s.totalNok)} ({s.count})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Top recipients */}
          {subsidies.topRecipients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Topp 5 mottakerselskap</h3>
              <ol className="space-y-1">
                {subsidies.topRecipients.map((r, i) => (
                  <li key={r.companyId} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-stone-400 tabular-nums w-4">{i + 1}.</span>
                    <Link
                      href={`/selskap/${r.companyId}`}
                      className="text-emerald-700 hover:underline flex-1 truncate"
                    >
                      {r.companyName}
                    </Link>
                    <span className="text-stone-500 tabular-nums text-xs shrink-0">
                      {fmtMnokSubsidy(r.totalNok)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Total registrert: {fmtMnokSubsidy(subsidies.totalNok)}</span>
          <Link
            href={`/subsidier?konsern=${slug}`}
            className="text-xs text-emerald-700 hover:underline ml-auto"
          >
            Se alle tilskudd &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Section 7 helpers ────────────────────────────────────────────────────────

function fmtArea(sqm: number | null): string {
  if (sqm === null) return '—'
  if (sqm >= 10_000) return `${Math.round(sqm / 1_000)} 000 m²`
  return `${sqm.toLocaleString('no-NO')} m²`
}

function Section7Properties({ properties, slug }: { properties: KonsernProperties; slug: string }) {
  if (properties.totalCount === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Eiendommer</h2>
        <p className="text-sm text-stone-400 italic">Ingen eiendommer registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Eiendommer</h2>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
              <tr>
                <th className="text-left px-3 py-2">Kommune</th>
                <th className="text-right px-3 py-2">Antall</th>
                <th className="text-right px-3 py-2">m²</th>
                <th className="text-left px-3 py-2">Typer</th>
              </tr>
            </thead>
            <tbody>
              {properties.perMunicipality.map(row => (
                <tr key={row.municipality} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2 text-stone-700">{row.municipality}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-stone-700">{row.count}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-stone-500">{fmtArea(row.areaSqm)}</td>
                  <td className="px-3 py-2 text-stone-400 text-xs">{row.types.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-stone-500">
            Totalt {properties.totalCount} eiendommer
            {properties.totalAreaSqm != null && ` · ${fmtArea(properties.totalAreaSqm)}`}
          </span>
          <Link
            href={`/eiendommer?konsern=${slug}`}
            className="text-xs text-emerald-700 hover:underline ml-auto"
          >
            Se på kart &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Section 8 helpers ────────────────────────────────────────────────────────

const RELATIONSHIP_TYPE_LABEL: Record<string, string> = {
  supplier:     'Leverandør',
  buyer:        'Kjøper',
  distributor:  'Distributør',
  franchisor:   'Franchisor',
  'self-dealing': 'Intern handel',
  'joint-venture': 'Joint venture',
}

function RelationshipList({
  items,
  direction,
}: {
  items: Array<{ counterpartyName: string; counterpartyId: string | null; relationshipType: string; description: string | null }>
  direction: 'outgoing' | 'incoming'
}) {
  if (items.length === 0) return <p className="text-sm text-stone-400 italic">Ingen</p>
  return (
    <ul className="space-y-2">
      {items.map((rel, i) => (
        <li key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${
              direction === 'outgoing'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {RELATIONSHIP_TYPE_LABEL[rel.relationshipType] ?? rel.relationshipType}
            </span>
            {rel.counterpartyId ? (
              <Link
                href={`/selskap/${rel.counterpartyId}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                {rel.counterpartyName}
              </Link>
            ) : (
              <span className="font-medium text-stone-800">{rel.counterpartyName}</span>
            )}
          </div>
          {rel.description && (
            <p className="text-stone-500 text-xs">{rel.description}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

function Section8Relationships({ relationships }: { relationships: KonsernRelationships }) {
  const { outgoingExternal, incomingExternal, intraKonsern } = relationships
  const hasAny = outgoingExternal.length > 0 || incomingExternal.length > 0 || intraKonsern.length > 0

  if (!hasAny) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Forretningsrelasjoner</h2>
        <p className="text-sm text-stone-400 italic">Ingen forretningsrelasjoner registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Forretningsrelasjoner</h2>
      <div className="space-y-5">
        {/* Outgoing */}
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">
            Utgående til eksterne aktører ({outgoingExternal.length})
          </h3>
          <RelationshipList items={outgoingExternal} direction="outgoing" />
        </div>

        {/* Incoming */}
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">
            Innkommende fra eksterne ({incomingExternal.length})
          </h3>
          <RelationshipList items={incomingExternal} direction="incoming" />
        </div>

        {/* Intra-konsern — market power relevant */}
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
            Innenfor konsernet ({intraKonsern.length})
            {intraKonsern.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
                markedsmakt-relevant
              </span>
            )}
          </h3>
          {intraKonsern.length === 0 ? (
            <p className="text-sm text-stone-400 italic">Ingen</p>
          ) : (
            <ul className="space-y-2">
              {intraKonsern.map((rel, i) => (
                <li key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded border bg-rose-100 text-rose-700 border-rose-200">
                      {RELATIONSHIP_TYPE_LABEL[rel.relationshipType] ?? rel.relationshipType}
                    </span>
                    <span className="text-stone-700">
                      <span className="font-medium">{rel.fromCompanyName}</span>
                      <span className="text-stone-400 mx-1">&rarr;</span>
                      <span className="font-medium">{rel.toCompanyName}</span>
                    </span>
                  </div>
                  {rel.description && (
                    <p className="text-rose-600 text-xs">{rel.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section 9 helpers ────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score <= 4) return 'bg-rose-100 text-rose-800 border-rose-200'
  if (score <= 7) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

type CoverageData = {
  qualityScore: number
  gaps: string[]
  metrics: unknown
}

function Section9DataQuality({ coverage }: { coverage: CoverageData }) {
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
        {/* Checklist / gaps */}
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

        {/* Static enrichment sources */}
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

type StatBoxProps = {
  label: string
  value: string
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="flex flex-col items-start px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg min-w-[120px]">
      <span className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</span>
      <span className="text-lg font-bold text-stone-900 tabular-nums">{value}</span>
    </div>
  )
}

function MaEventCard({ event }: { event: MaEvent }) {
  const dealLabel = event.dealType
    ? (DEAL_TYPE_LABEL[event.dealType] ?? event.dealType)
    : null
  const dealClass = event.dealType
    ? (DEAL_TYPE_CLASS[event.dealType] ?? 'bg-stone-100 text-stone-700 border-stone-300')
    : null

  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-stone-500 tabular-nums">
          {fmtEventDate(event.effectiveFrom)}
        </span>
        {dealLabel && dealClass && (
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${dealClass}`}>
            {dealLabel}
          </span>
        )}
        <span className="text-sm font-semibold text-stone-900">{event.childName}</span>
      </div>
      {event.dealValue && (
        <p className="text-sm text-stone-700">
          <span className="text-stone-500">Verdi: </span>{event.dealValue}
        </p>
      )}
      {event.notes && (
        <p className="text-sm text-stone-600">{event.notes}</p>
      )}
      {event.source && (
        <p className="text-xs text-stone-400 mt-0.5">
          Kilde:{' '}
          {isUrl(event.source) ? (
            <a
              href={event.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline break-all"
            >
              {event.source}
            </a>
          ) : (
            <span className="text-stone-500">{event.source}</span>
          )}
        </p>
      )}
    </div>
  )
}

type Props = {
  dossier: KonsernDossierData
}

export function KonsernDossier({ dossier }: Props) {
  const { root, ownershipType, controllingOwner, metrics, tree, maEvents, financials, board, subsidies, properties, relationships } = dossier
  const [treeView, setTreeView] = useState<'diagram' | 'table'>('diagram')

  const ownershipLabel = ownershipType
    ? (OWNERSHIP_TYPE_LABEL[ownershipType] ?? ownershipType)
    : null
  const ownershipClass = ownershipType
    ? (OWNERSHIP_TYPE_CLASS[ownershipType] ?? 'bg-stone-100 text-stone-700 border-stone-300')
    : null

  const datedEvents = maEvents.filter(e => e.effectiveFrom !== null)
  const undatedEvents = maEvents.filter(e => e.effectiveFrom === null)

  return (
    <div className="space-y-8">
      {/* Section 1: Header */}
      <div>
        <Link
          href="/eierskap"
          className="text-xs text-stone-400 hover:text-stone-600 hover:underline mb-2 inline-block"
        >
          &larr; Tilbake til eierskap
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-900">{root.name}</h1>
          {ownershipLabel && ownershipClass && (
            <span
              className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${ownershipClass}`}
            >
              {ownershipLabel}
            </span>
          )}
        </div>

        {controllingOwner && (
          <p className="text-sm text-stone-600 mt-1">
            Kontrollerende eier:{' '}
            <span className="font-medium text-stone-800">{controllingOwner.name}</span>
            {controllingOwner.pct !== null && (
              <span className="text-stone-500"> ({controllingOwner.pct}%)</span>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <StatBox
            label="Selskap i tre"
            value={metrics.treeSize.toString()}
          />
          <StatBox
            label="Sum omsetning"
            value={fmtRevenueMNok(metrics.totalRevenue)}
          />
          <StatBox
            label="Sum ansatte"
            value={fmtEmployees(metrics.totalEmployees)}
          />
          <StatBox
            label="Sist Brreg-refreshet"
            value={fmtDaysSince(metrics.daysSinceBrregRefresh)}
          />
        </div>
      </div>

      {/* Section 2: Konsernstruktur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-900">Konsernstruktur</h2>
          {metrics.treeSize > 30 && (
            <div className="flex gap-1">
              <button
                onClick={() => setTreeView('diagram')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  treeView === 'diagram'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                Diagram
              </button>
              <button
                onClick={() => setTreeView('table')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  treeView === 'table'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                Vis som tabell
              </button>
            </div>
          )}
        </div>

        {treeView === 'diagram' || metrics.treeSize <= 30 ? (
          <OwnershipTreeDiagram tree={tree} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="text-left px-3 py-2">Morselskap</th>
                  <th className="text-left px-3 py-2">Datterselskap</th>
                  <th className="text-right px-3 py-2">Eierandel</th>
                  <th className="text-left px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {tree.edges
                  .filter(edge => !edge.parentId.startsWith('shareholder-'))
                  .map((edge, i) => {
                    const parent = tree.nodes.find(n => n.id === edge.parentId)
                    const child = tree.nodes.find(n => n.id === edge.childId)
                    return (
                      <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-3 py-2 text-stone-700">{parent?.name ?? edge.parentId}</td>
                        <td className="px-3 py-2">
                          <Link href={`/selskap/${edge.childId}`} className="text-emerald-700 hover:underline">
                            {child?.name ?? edge.childId}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-600">
                          {edge.ownershipPct != null ? `${edge.ownershipPct}%` : '—'}
                        </td>
                        <td className="px-3 py-2 text-stone-500">{edge.ownershipType}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: M&A-historikk */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">M&amp;A-historikk</h2>

        {maEvents.length === 0 ? (
          <p className="text-sm text-stone-400 italic">Ingen M&amp;A-events registrert</p>
        ) : (
          <div className="space-y-6">
            {datedEvents.length > 0 && (
              <div className="space-y-2">
                {datedEvents.map((event, i) => (
                  <MaEventCard key={`dated-${i}`} event={event} />
                ))}
              </div>
            )}

            {undatedEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                  Udatert
                </h3>
                <div className="space-y-2">
                  {undatedEvents.map((event, i) => (
                    <MaEventCard key={`undated-${i}`} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 4: Aggregert økonomi */}
      <Section4Economy financials={financials} />

      {/* Section 5: Styre & interlocks */}
      <Section5Board board={board} />

      {/* Section 6: Tilskudd inn */}
      <Section6Subsidies subsidies={subsidies} slug={dossier.slug} />

      {/* Section 7: Eiendommer */}
      <Section7Properties properties={properties} slug={dossier.slug} />

      {/* Section 8: Forretningsrelasjoner */}
      <Section8Relationships relationships={relationships} />

      {/* Section 9: Datakvalitet */}
      <Section9DataQuality coverage={dossier.coverage} />
    </div>
  )
}
