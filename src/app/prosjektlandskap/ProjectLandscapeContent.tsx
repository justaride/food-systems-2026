'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { InternalBanner } from '@/components/ui/InternalBanner'
import type { LandscapeCoverageRow, LandscapeProject, ProjectLandscapeView } from '@/lib/data/project-landscape'

function coverageClasses(level: LandscapeCoverageRow['level']): string {
  if (level === 'strong') return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  if (level === 'present') return 'border-sky-200 bg-sky-50 text-sky-950'
  if (level === 'thin') return 'border-amber-200 bg-amber-50 text-amber-950'
  return 'border-rose-200 bg-rose-50 text-rose-950'
}

function EvidenceBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${label} ${score} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`h-1.5 w-4 rounded-sm ${index < score ? 'bg-sky-600' : 'bg-stone-200'}`} aria-hidden="true" />
      ))}
      <span className="ml-1 text-xs font-semibold tabular-nums text-stone-700">{score}/5</span>
    </div>
  )
}

function PriorityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-sm bg-stone-200" aria-hidden="true">
        <div className="h-full bg-emerald-600" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-stone-800">{score.toFixed(2)}</span>
    </div>
  )
}

function projectUrl(project: LandscapeProject): string {
  return project.urls.official || project.urls.documentation || project.urls.publication
}

export function ProjectLandscapeContent({ landscape }: { landscape: ProjectLandscapeView }) {
  const t = useTranslations('projectLandscape')
  const [query, setQuery] = useState('')
  const [entity, setEntity] = useState('all')
  const [geography, setGeography] = useState('all')

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('nb')
    return landscape.projects.filter((project) => {
      const textMatch = !normalized || [project.canonicalName, project.problem, project.analysis.overlap, project.analysis.complementarityNarrative]
        .join(' ')
        .toLocaleLowerCase('nb')
        .includes(normalized)
      const entityMatch = entity === 'all' || project.entityKind === entity
      const geographyMatch = geography === 'all'
        || project.geography.countries.includes(geography)
        || (geography === 'SAPMI' && project.geography.indigenousRegions.includes('Sápmi'))
      return textMatch && entityMatch && geographyMatch
    })
  }, [entity, geography, landscape.projects, query])

  const priorityCandidates = landscape.candidates.filter((candidate) => ['identity_resolved', 'human_gated', 'source_blocked'].includes(candidate.workflowStatus))
  const entityLabel = (key: string) => t(`entity.${key}`)
  const lifecycleLabel = (key: string) => t(`lifecycle.${key}`)
  const candidateStatusLabel = (key: string) => t(`candidateStatus.${key}`)

  return (
    <div className="project-landscape space-y-6 selection:bg-emerald-200 selection:text-emerald-950 sm:space-y-8">
      <span
        className="hidden"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: '<!-- THESIS: Coverage leads; ranking never masquerades as certainty. OWN-WORLD: incumbent stone surfaces, emerald strategic signal, sky evidence signal, amber gates, compact tables. STORY: see Nordic and thematic coverage, compare relevance with evidence, then act on candidates and gaps. FIRST VIEWPORT: title and status rail above a nine-cell geographic field with thematic depth beside it. FORM: grounded surface candidate 3, coverage matrix first, seed b72388ae. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->' }}
      />

      <header className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-[-0.025em] text-stone-950">{t('title')}</h1>
            <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-stone-600">
              {t('intro', { cutoff: landscape.cutoff })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <a className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium text-stone-700 underline-offset-4 hover:border-stone-400 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2" href="https://github.com/justaride/food-systems-2026/blob/main/research/landscape/report-2026-08-10.md" target="_blank" rel="noreferrer">{t('openReport')}</a>
            <a className="rounded-lg bg-stone-900 px-3 py-2 font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2" href="https://github.com/justaride/food-systems-2026/blob/main/docs/project/status/food-systems-completion-register-2026-07-15.md" target="_blank" rel="noreferrer">{t('completionRegister')}</a>
          </div>
        </div>

        <InternalBanner label={t('internalLabel')} note={t('internalNote')} />

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-stone-200 py-3 text-xs text-stone-600">
          <span><strong className="font-semibold text-stone-950">{landscape.stats.projects}</strong> {t('stats.mainProfiles')}</span>
          <span><strong className="font-semibold text-stone-950">{landscape.stats.sources}</strong> {t('stats.sources')}</span>
          <span><strong className="font-semibold text-sky-800">{landscape.stats.independentSources}</strong> {t('stats.independentSources')}</span>
          <span><strong className="font-semibold text-emerald-800">{landscape.stats.qualitativeProjects}</strong> {t('stats.qualitativeProfiles')}</span>
          <span><strong className="font-semibold text-rose-700">{landscape.stats.independentlyEvaluatedFindings}</strong> {t('stats.independentFindings')}</span>
        </div>
      </header>

      <section aria-labelledby="coverage-title" className="space-y-3 sm:space-y-4">
        <div>
          <h2 id="coverage-title" className="text-xl font-bold text-stone-950">{t('coverage.title')}</h2>
          <p className="mt-1 max-w-[72ch] text-xs leading-relaxed text-stone-600 sm:text-sm">{t('coverage.description')}</p>
        </div>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] leading-relaxed text-amber-950 sm:hidden">
          {t('coverage.thinMobile')}
        </p>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="border-b border-stone-200 p-3 sm:p-5 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-semibold text-stone-900">{t('coverage.geographyTitle')}</h3>
              <div className="mt-2 grid grid-cols-3 gap-1 sm:mt-3 sm:gap-2">
                {landscape.geographyCoverage.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => setGeography(geography === row.key ? 'all' : row.key)}
                    className={`min-h-10 rounded-lg border p-1.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:min-h-24 sm:rounded-xl sm:p-3 ${coverageClasses(row.level)} ${geography === row.key ? 'ring-2 ring-stone-900 ring-offset-2' : ''}`}
                    aria-pressed={geography === row.key}
                  >
                    <span className="block text-[10px] font-semibold leading-tight sm:text-sm">{t(`geography.${row.key}`)}</span>
                    <span className="mt-0.5 block text-lg font-bold leading-none tabular-nums sm:mt-3 sm:text-2xl sm:leading-normal">{row.count}</span>
                    <span className="mt-0.5 hidden text-[11px] opacity-75 sm:block">{row.count === 1 ? t('coverage.singular') : t('coverage.plural')}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 hidden text-xs leading-relaxed text-stone-500 sm:block">{t('coverage.geographyNote')}</p>
            </div>

            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-stone-900">{t('coverage.thematicTitle')}</h3>
              <div className="mt-4 space-y-3">
                {landscape.themeCoverage.map((row) => (
                  <div key={row.key} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-xs">
                    <span className="text-stone-600">{t(`theme.${row.key}`)}</span>
                    <div className="h-2 overflow-hidden rounded-sm bg-stone-100" aria-hidden="true">
                      <div className={`h-full ${row.level === 'thin' ? 'bg-amber-500' : row.level === 'present' ? 'bg-sky-500' : 'bg-emerald-600'}`} style={{ width: `${Math.max(4, (row.count / landscape.stats.projects) * 100)}%` }} />
                    </div>
                    <span className="text-right font-semibold tabular-nums text-stone-800">{row.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-stone-100 pt-4 text-xs leading-relaxed text-stone-600">
                {t('coverage.thinDetail')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
            <h2 className="text-lg font-bold text-stone-950">{t('ranking.title')}</h2>
            <p className="mt-1 text-xs text-stone-500">{t('ranking.description')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-2 font-medium">{t('ranking.table.rank')}</th>
                  <th className="px-3 py-2 font-medium">{t('ranking.table.profile')}</th>
                  <th className="px-3 py-2 font-medium">{t('ranking.table.strategic')}</th>
                  <th className="px-3 py-2 font-medium">{t('ranking.table.evidence')}</th>
                  <th className="px-4 py-2 font-medium">{t('ranking.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {landscape.projects.slice(0, 10).map((project) => (
                  <tr key={project.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-semibold tabular-nums text-stone-400">{project.rank}</td>
                    <td className="px-3 py-3">
                      <a className="font-semibold text-stone-900 underline-offset-4 hover:text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600" href={projectUrl(project)} target="_blank" rel="noreferrer">{project.canonicalName}</a>
                      <span className="mt-0.5 block text-[11px] text-stone-400">{entityLabel(project.entityKind)}</span>
                    </td>
                    <td className="px-3 py-3"><PriorityBar score={project.analysis.priorityScore} /></td>
                    <td className="px-3 py-3"><EvidenceBar score={project.analysis.evidenceScore} label={t('ranking.table.evidence')} /></td>
                    <td className="px-4 py-3 text-stone-600">{lifecycleLabel(project.lifecycle.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-950 p-5 text-stone-100">
          <h2 className="text-lg font-bold text-white">{t('evidence.title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-300">{t('evidence.description')}</p>
          <div className="mt-5 space-y-4">
            {landscape.evidenceDistribution.map((row) => (
              <div key={row.key}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-stone-300">{t(`evidenceLevel.${row.key}`)}</span>
                  <span className="font-semibold tabular-nums text-white">{row.count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-stone-800">
                  <div className="h-full bg-sky-400" style={{ width: `${(row.count / landscape.stats.projects) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-3 border-t border-stone-800 pt-4 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-stone-400">{t('evidence.ownerAffiliated')}</dt><dd className="font-semibold tabular-nums">{landscape.stats.ownerAffiliatedSources}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-stone-400">{t('evidence.rightsLimited')}</dt><dd className="font-semibold tabular-nums">{landscape.stats.rightsLimitedSources}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-stone-400">{t('evidence.qualitativeFindings')}</dt><dd className="font-semibold tabular-nums">{landscape.stats.qualitativeFindings}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-stone-400">{t('evidence.independentlyEvaluated')}</dt><dd className="font-semibold tabular-nums text-rose-300">{landscape.stats.independentlyEvaluatedFindings}</dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="register-title" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="register-title" className="text-xl font-bold text-stone-950">{t('register.title')}</h2>
            <p className="mt-1 text-sm text-stone-600">{t('register.description')}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[680px]">
            <label className="text-xs font-medium text-stone-600">
              <span className="sr-only">{t('register.searchLabel')}</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('register.searchPlaceholder')} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label className="text-xs font-medium text-stone-600">
              <span className="sr-only">{t('register.entityLabel')}</span>
              <select value={entity} onChange={(event) => setEntity(event.target.value)} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                <option value="all">{t('register.allEntities')}</option>
                {landscape.entityDistribution.map((row) => <option key={row.key} value={row.key}>{entityLabel(row.key)} ({row.count})</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-600">
              <span className="sr-only">{t('register.geographyLabel')}</span>
              <select value={geography} onChange={(event) => setGeography(event.target.value)} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                <option value="all">{t('register.allGeographies')}</option>
                {landscape.geographyCoverage.map((row) => <option key={row.key} value={row.key}>{t(`geography.${row.key}`)} ({row.count})</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-500">
            <span>{t('register.resultCount', { visible: filteredProjects.length, total: landscape.stats.projects })}</span>
            {(query || entity !== 'all' || geography !== 'all') && <button type="button" onClick={() => { setQuery(''); setEntity('all'); setGeography('all') }} className="font-medium text-emerald-800 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600">{t('register.reset')}</button>}
          </div>
          {filteredProjects.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-stone-800">{t('register.emptyTitle')}</p>
              <p className="mt-1 text-xs text-stone-500">{t('register.emptyDetail')}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredProjects.map((project) => (
                <details key={project.id} className="group">
                  <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 sm:grid-cols-[42px_minmax(0,1fr)_140px_110px] sm:items-center sm:px-5">
                    <span className="text-sm font-semibold tabular-nums text-stone-400">{project.rank}</span>
                    <span>
                      <span className="block text-sm font-semibold text-stone-900">{project.canonicalName}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-stone-500">
                        <span className="rounded bg-stone-100 px-1.5 py-0.5">{entityLabel(project.entityKind)}</span>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5">{project.geography.indigenousRegions.includes('Sápmi') ? 'Sápmi' : project.geography.countries.join(', ') || project.geography.scope}</span>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5">{lifecycleLabel(project.lifecycle.status)}</span>
                      </span>
                    </span>
                    <PriorityBar score={project.analysis.priorityScore} />
                    <EvidenceBar score={project.analysis.evidenceScore} label={t('ranking.table.evidence')} />
                  </summary>
                  <div className="grid gap-5 bg-stone-50/70 px-4 pb-5 pt-1 text-xs text-stone-600 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
                    <div><h3 className="font-semibold text-stone-900">{t('detail.problemOverlap')}</h3><p className="mt-1 leading-relaxed">{project.problem}</p><p className="mt-2 leading-relaxed text-stone-500">{project.analysis.overlap}</p></div>
                    <div><h3 className="font-semibold text-stone-900">{t('detail.methodsOutputs')}</h3><p className="mt-1 leading-relaxed">{project.methods.slice(0, 4).map((method) => method.name).join(', ') || t('detail.undocumented')}</p><p className="mt-2 leading-relaxed text-stone-500">{project.outputs.slice(0, 3).map((output) => output.name).join(', ') || t('detail.noOutput')}</p></div>
                    <div><h3 className="font-semibold text-stone-900">{t('detail.nextAction')}</h3><p className="mt-1 leading-relaxed">{project.analysis.nextAction}</p><a className="mt-3 inline-block font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600" href={projectUrl(project)} target="_blank" rel="noreferrer">{t('detail.openDocument')}</a></div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="candidate-title" className="space-y-4">
        <div>
          <h2 id="candidate-title" className="text-xl font-bold text-stone-950">{t('candidates.title')}</h2>
          <p className="mt-1 max-w-[72ch] text-sm text-stone-600">{t('candidates.description')}</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {landscape.candidateDistribution.map((row) => (
            <div key={row.key} className="bg-white p-4">
              <span className="text-2xl font-bold tabular-nums text-stone-950">{row.count}</span>
              <span className="ml-2 text-xs text-stone-500">{candidateStatusLabel(row.key)}</span>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {priorityCandidates.map((candidate) => (
            <div key={candidate.id} className="grid gap-2 border-t border-stone-100 px-4 py-4 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_150px] sm:px-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-900">{candidate.canonicalName}</h3>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${candidate.workflowStatus === 'human_gated' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'}`}>
                    {candidateStatusLabel(candidate.workflowStatus)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">{candidate.nextAction}</p>
              </div>
              <div className="text-xs text-stone-500 sm:text-right">{entityLabel(candidate.entityKind)}<span className="mt-1 block">{candidate.geography.scope}</span></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 pt-5 text-xs leading-relaxed text-stone-500">
        {t.rich('footer', {
          reportCommand: (chunks) => <code className="rounded bg-stone-100 px-1 py-0.5">{chunks}</code>,
          validateCommand: (chunks) => <code className="rounded bg-stone-100 px-1 py-0.5">{chunks}</code>,
        })}
      </footer>
    </div>
  )
}
