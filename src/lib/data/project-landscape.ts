import { readFileSync } from 'node:fs'
import path from 'node:path'

export type LandscapeProject = {
  id: string
  canonicalName: string
  entityKind: string
  problem: string
  geography: {
    scope: string
    countries: string[]
    places: string[]
    indigenousRegions: string[]
  }
  coverage: {
    valueChainStages: string[]
    themes: string[]
    stakeholderGroups: string[]
  }
  lifecycle: {
    status: string
    startDate: string | null
    endDate: string | null
    lastActivityDate: string
  }
  methods: Array<{ name: string; type: string }>
  outputs: Array<{ name: string; outputType: string; status: string }>
  qualitativeFindings: Array<{
    id: string
    type: string
    statement: string
    evidenceStatus: string
  }>
  urls: {
    official: string
    documentation: string
    publication: string
  }
  analysis: {
    priorityScore: number
    evidenceScore: number
    fitCategory: string
    overlap: string
    complementarityNarrative: string
    nextAction: string
  }
}

export type LandscapeCandidate = {
  id: string
  canonicalName: string
  entityKind: string
  workflowStatus: string
  decision: string
  relevance: string
  nextAction: string
  geography: {
    scope: string
    countries: string[]
    indigenousRegions: string[]
  }
}

type LandscapeSource = {
  id: string
  role: string
  independence: string
  rightsStatus: string
}

export type LandscapeCoverageRow = {
  key: string
  label: string
  count: number
  projectIds: string[]
  level: 'strong' | 'present' | 'thin' | 'gap'
}

export type LandscapeDistributionRow = {
  key: string
  label: string
  count: number
}

export type ProjectLandscapeView = {
  cutoff: string
  projects: Array<LandscapeProject & { rank: number }>
  candidates: LandscapeCandidate[]
  geographyCoverage: LandscapeCoverageRow[]
  themeCoverage: LandscapeCoverageRow[]
  evidenceDistribution: LandscapeDistributionRow[]
  entityDistribution: LandscapeDistributionRow[]
  sourceIndependence: LandscapeDistributionRow[]
  candidateDistribution: LandscapeDistributionRow[]
  stats: {
    projects: number
    candidates: number
    sources: number
    independentSources: number
    ownerAffiliatedSources: number
    qualitativeProjects: number
    qualitativeFindings: number
    independentlyEvaluatedFindings: number
    rightsLimitedSources: number
  }
}

const LANDSCAPE_DIR = path.join(process.cwd(), 'research', 'landscape')

function readJsonl<T>(fileName: string): T[] {
  const raw = readFileSync(path.join(LANDSCAPE_DIR, fileName), 'utf8').trim()
  if (!raw) return []
  return raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

function coverageLevel(count: number): LandscapeCoverageRow['level'] {
  if (count === 0) return 'gap'
  if (count === 1) return 'thin'
  if (count < 5) return 'present'
  return 'strong'
}

const COUNTRY_LABELS: Array<[string, string]> = [
  ['NO', 'Norge'],
  ['SE', 'Sverige'],
  ['DK', 'Danmark'],
  ['FI', 'Finland'],
  ['IS', 'Island'],
  ['GL', 'Grønland'],
  ['FO', 'Færøyene'],
  ['AX', 'Åland'],
]

const THEME_SPECS: Array<[string, string, (project: LandscapeProject) => boolean]> = [
  ['production', 'Produksjon', (project) => project.coverage.valueChainStages.includes('production')],
  ['processing', 'Foredling', (project) => project.coverage.valueChainStages.some((value) => ['processing', 'small_scale_processing'].includes(value)) || project.coverage.themes.includes('small_scale_processing')],
  ['distribution', 'Distribusjon', (project) => project.coverage.valueChainStages.some((value) => ['distribution', 'supply_chain'].includes(value)) || project.coverage.themes.includes('supply_chain')],
  ['consumption', 'Forbruk og helse', (project) => project.coverage.valueChainStages.includes('consumption') || project.coverage.themes.includes('consumption_health')],
  ['seafood', 'Sjømat', (project) => project.coverage.themes.includes('seafood')],
  ['local_food', 'Lokalmat', (project) => project.coverage.themes.includes('local_food')],
  ['circularity', 'Sirkularitet', (project) => project.coverage.themes.includes('circularity')],
  ['preparedness', 'Beredskap', (project) => project.coverage.themes.includes('preparedness') || project.coverage.themes.includes('resilience')],
  ['governance', 'Makt og styring', (project) => project.coverage.themes.includes('governance') || project.coverage.themes.includes('food_democracy') || project.coverage.valueChainStages.includes('system_governance')],
  ['data_models', 'Data og modeller', (project) => project.coverage.themes.includes('data_models') || ['dataset', 'model'].includes(project.entityKind)],
]

function distribution(rows: string[], labels: Record<string, string> = {}, orderedKeys?: string[]): LandscapeDistributionRow[] {
  const counts = rows.reduce<Record<string, number>>((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const result = (orderedKeys ?? Object.keys(counts))
    .map((key) => ({ key, label: labels[key] ?? key, count: counts[key] ?? 0 }))
  return orderedKeys
    ? result
    : result.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'nb'))
}

export function loadProjectLandscape(): ProjectLandscapeView | null {
  try {
    const projects = readJsonl<LandscapeProject>('projects-2026-08-10.jsonl')
      .sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore || a.canonicalName.localeCompare(b.canonicalName, 'nb'))
      .map((project, index) => ({ ...project, rank: index + 1 }))
    const candidates = readJsonl<LandscapeCandidate>('longlist-2026-08-10.jsonl')
    const sources = readJsonl<LandscapeSource>('sources-2026-08-10.jsonl')

    const geographyCoverage: LandscapeCoverageRow[] = COUNTRY_LABELS.map(([key, label]) => {
      const matches = projects.filter((project) => project.geography.countries.includes(key))
      return { key, label, count: matches.length, projectIds: matches.map((project) => project.id), level: coverageLevel(matches.length) }
    })
    const sapmi = projects.filter((project) => project.geography.indigenousRegions.includes('Sápmi'))
    geographyCoverage.push({ key: 'SAPMI', label: 'Sápmi', count: sapmi.length, projectIds: sapmi.map((project) => project.id), level: coverageLevel(sapmi.length) })

    const themeCoverage = THEME_SPECS.map(([key, label, predicate]) => {
      const matches = projects.filter(predicate)
      return { key, label, count: matches.length, projectIds: matches.map((project) => project.id), level: coverageLevel(matches.length) }
    })

    const findings = projects.flatMap((project) => project.qualitativeFindings)
    const qualitativeProjects = projects.filter((project) => project.methods.some((method) => ['qualitative', 'ethnographic', 'participatory'].includes(method.type)))

    return {
      cutoff: '2026-08-10',
      projects,
      candidates,
      geographyCoverage,
      themeCoverage,
      evidenceDistribution: distribution(projects.map((project) => String(project.analysis.evidenceScore)), {
        '2': '2 / 5 — grunnlag',
        '3': '3 / 5 — metode/resultat',
        '4': '4 / 5 — uavhengig støttet',
        '5': '5 / 5 — evaluert',
      }, ['2', '3', '4', '5']),
      entityDistribution: distribution(projects.map((project) => project.entityKind), {
        project: 'Prosjekt', programme: 'Program', platform: 'Plattform', dataset: 'Datasett', model: 'Modell', network: 'Nettverk', framework: 'Rammeverk', repository_reference: 'Repo-referanse',
      }),
      sourceIndependence: distribution(sources.map((source) => source.independence), {
        independent: 'Uavhengig', owner: 'Eier', affiliated: 'Tilknyttet', unknown: 'Ukjent',
      }),
      candidateDistribution: distribution(candidates.map((candidate) => candidate.workflowStatus), {
        discovered: 'Oppdaget', identity_resolved: 'Identitet løst', duplicate: 'Duplikat', not_same: 'Ikke samme', reference_only: 'Kun referanse', human_gated: 'Menneskeport', source_blocked: 'Kildeblokkert',
      }),
      stats: {
        projects: projects.length,
        candidates: candidates.length,
        sources: sources.length,
        independentSources: sources.filter((source) => source.independence === 'independent').length,
        ownerAffiliatedSources: sources.filter((source) => ['owner', 'affiliated'].includes(source.independence)).length,
        qualitativeProjects: qualitativeProjects.length,
        qualitativeFindings: findings.length,
        independentlyEvaluatedFindings: findings.filter((finding) => finding.type === 'evaluated_outcome' || finding.evidenceStatus === 'independently_documented').length,
        rightsLimitedSources: sources.filter((source) => ['unknown', 'link_only'].includes(source.rightsStatus)).length,
      },
    }
  } catch {
    return null
  }
}
