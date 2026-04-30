'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'

type ReportRow = {
  id: string
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  provenanceType: ReportProvenanceType | null
  supportingSources: ReportSupportingSource[]
  documentSlug: string | null
  origin: 'structured' | 'document'
}

type ReportProvenanceType =
  | 'external_report'
  | 'external_article'
  | 'internal_synthesis'
  | 'internal_register'
  | 'composite_source'
  | 'blocked_source'

type ReportSupportingSource = {
  label: string
  url?: string
  reportId?: string
  documentPath?: string
  note?: string
}

type ReportCategory =
  | 'nou' | 'konkurransetilsyn' | 'bransje' | 'offentlig'
  | 'konsulentrapport' | 'akademia' | 'tenketank'
  | 'juridisk' | 'beredskap' | 'sirkularitet' | 'oversikt'

const categoryLabels: Record<ReportCategory, string> = {
  nou: 'NOU',
  konkurransetilsyn: 'Konkurransetilsyn',
  bransje: 'Bransje',
  offentlig: 'Offentlig',
  konsulentrapport: 'Konsulentrapport',
  akademia: 'Akademia',
  tenketank: 'Tenketank',
  juridisk: 'Juridisk',
  beredskap: 'Beredskap',
  sirkularitet: 'Sirkularitet',
  oversikt: 'Oversikt',
}

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  nou: 'bg-violet-50 text-violet-700 border-violet-200',
  konkurransetilsyn: 'bg-red-50 text-red-700 border-red-200',
  bransje: 'bg-blue-50 text-blue-700 border-blue-200',
  offentlig: 'bg-amber-50 text-amber-700 border-amber-200',
  konsulentrapport: 'bg-orange-50 text-orange-700 border-orange-200',
  akademia: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  tenketank: 'bg-teal-50 text-teal-700 border-teal-200',
  juridisk: 'bg-pink-50 text-pink-700 border-pink-200',
  beredskap: 'bg-sky-50 text-sky-700 border-sky-200',
  sirkularitet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  oversikt: 'bg-stone-50 text-stone-600 border-stone-200',
}

const PROVENANCE_LABELS: Record<ReportProvenanceType, string> = {
  external_report: 'Ekstern rapport',
  external_article: 'Artikkel',
  internal_synthesis: 'Intern syntese',
  internal_register: 'Internt register',
  composite_source: 'Kompositt',
  blocked_source: 'Blokkert kilde',
}

const PROVENANCE_COLORS: Record<ReportProvenanceType, string> = {
  external_report: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  external_article: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  internal_synthesis: 'bg-stone-50 text-stone-600 border-stone-200',
  internal_register: 'bg-slate-50 text-slate-600 border-slate-200',
  composite_source: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  blocked_source: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function RapporterContent({ reports }: { reports: ReportRow[] }) {
  const [categoryFilter, setCategoryFilter] = useState('alle')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const structuredCount = reports.filter((report) => report.origin === 'structured').length
  const documentFallbackCount = reports.length - structuredCount

  const categoryCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.reportCategory] = (acc[r.reportCategory] || 0) + 1
    return acc
  }, {})

  const categoryFilters = [
    { label: `Alle (${reports.length})`, value: 'alle' },
    ...Object.entries(categoryLabels)
      .filter(([value]) => categoryCounts[value])
      .map(([value, label]) => ({
        label: `${label} (${categoryCounts[value]})`,
        value,
      })),
  ]

  const filtered = reports.filter(r =>
    categoryFilter === 'alle' || r.reportCategory === categoryFilter
  )

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Rapporter</h1>
        <p className="text-xs uppercase tracking-wider text-stone-500 mt-0.5 font-medium">
          Formelle rapporter — NOU, konkurransetilsyn, akademia
        </p>
        <p className="text-sm text-stone-400 mt-1">
          {structuredCount} strukturerte rapporter
          {documentFallbackCount > 0 ? ` + ${documentFallbackCount} dokumentbaserte poster` : ''}
        </p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm font-semibold text-emerald-900">Egen statisk rapport</p>
        <p className="text-xs text-emerald-700 mt-1">
          Denne rapporten ligger utenfor det vanlige database-basertede rapportutvalget.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link
            href="/rapporter/nordisk-sirkularitetsrapport-2026-05"
            className="inline-flex text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
          >
            Se nordisk sirkularitetsrapport 2026-05 (HTML)
          </Link>
          <a
            href="/reports/nordisk-sirkularitetsrapport-2026-05.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
          >
            Last ned PDF
          </a>
        </div>
      </div>

      <FilterChips items={categoryFilters} defaultValue="alle" onChange={setCategoryFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Ingen rapporter med dette filteret" />
      ) : (
        <div className="space-y-3">
          {filtered.map(report => {
            const isExpanded = expandedIds.has(report.id)
            const cat = report.reportCategory as ReportCategory

            return (
              <Card key={report.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(report.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 text-sm font-semibold text-stone-800 truncate">
                        {report.title}
                      </h3>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[cat] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                        {categoryLabels[cat] ?? cat}
                      </span>
                      {report.origin === 'document' && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          Dokument
                        </span>
                      )}
                      {report.provenanceType && (
                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium ${PROVENANCE_COLORS[report.provenanceType]}`}>
                          {PROVENANCE_LABELS[report.provenanceType]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                      {report.institution && <span>{report.institution}</span>}
                      {report.institution && report.year && <span>·</span>}
                      {report.year && <span>{report.year}</span>}
                      {(report.institution || report.year) && report.country && <span>·</span>}
                      {report.country && <span>{report.country}</span>}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-4">
                      {report.fullTitle && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Full tittel</p>
                          <p className="text-sm text-stone-700">{report.fullTitle}</p>
                        </div>
                      )}

                      {report.keyFindings.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Nokkelfunn</p>
                          <ul className="space-y-1">
                            {report.keyFindings.map((finding, i) => (
                              <li key={i} className="text-sm text-stone-600 flex gap-2">
                                <span className="text-stone-300 shrink-0">{'\u2014'}</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Anbefalinger</p>
                          <ul className="space-y-1">
                            {report.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-stone-600 flex gap-2">
                                <span className="text-emerald-400 shrink-0">{'\u2192'}</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-stone-500 mb-1">Relevans for Food Systems 2026</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{report.relevance}</p>
                      </div>

                      {report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {report.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-stone-50 text-stone-500 border border-stone-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {report.sourceUrl && (
                        <div className="pt-1">
                          <a
                            href={report.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
                          >
                            Les kilde {'\u2192'}
                          </a>
                        </div>
                      )}

                      {report.supportingSources.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Underlagskilder</p>
                          <ul className="space-y-1">
                            {report.supportingSources.map((source, i) => (
                              <li key={`${source.label}-${i}`} className="text-xs text-stone-500 break-words">
                                {source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-600 hover:text-stone-800 underline underline-offset-2"
                                  >
                                    {source.label}
                                  </a>
                                ) : (
                                  <span className="text-stone-600">{source.label}</span>
                                )}
                                {source.reportId && <span> · report:{source.reportId}</span>}
                                {source.documentPath && <span className="break-all"> · {source.documentPath}</span>}
                                {source.note && <span> · {source.note}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.documentSlug && (
                        <div className="pt-1">
                          <Link
                            href={`/bibliotek/${report.documentSlug}`}
                            className="text-xs text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                          >
                            Apne i biblioteket {'\u2192'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
