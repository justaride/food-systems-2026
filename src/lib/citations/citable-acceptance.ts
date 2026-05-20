import {
  compareCitationReadiness,
  isExternallyCitable,
  type CitationReadinessLevel,
} from './citation-status'

export type CitableAcceptanceCategory =
  | 'nordic_circularity'
  | 'market_concentration'
  | 'food_waste'
  | 'ownership_company'
  | 'public_subsidies'
  | 'library_sources'
  | 'graph_relationships'

export type CitableAcceptanceStatus = 'cite_ready' | 'blocked'

export type CitableAcceptanceCitation = {
  id: string
  title: string
  locator: string
  sourceType: string
  readiness: CitationReadinessLevel
  supportsClaim: string
}

export type CitableAcceptanceTest = {
  id: string
  category: CitableAcceptanceCategory
  question: string
  expectedSourceType: string
  requiredReadinessLevel: CitationReadinessLevel
  mustUse: string[]
  mustNotUse: string[]
  knownCaveat: string
  proposedAnswer: string
  citations: CitableAcceptanceCitation[]
  blockingNotes?: string[]
  exclusionNotes?: string[]
}

export type CitableAcceptanceResult = CitableAcceptanceTest & {
  status: CitableAcceptanceStatus
  readiness: CitationReadinessLevel
  caveatRequired: boolean
  exclusionNotes: string[]
}

export type CitableAcceptancePack = {
  generatedAt: string
  summary: {
    total: number
    citeReady: number
    blocked: number
    categories: Record<CitableAcceptanceCategory, number>
  }
  results: CitableAcceptanceResult[]
}

export const ACCEPTANCE_TESTS: CitableAcceptanceTest[] = [
  {
    id: 'CA-001',
    category: 'nordic_circularity',
    question:
      'Kan kunnskapsbasen sitere København som benchmark for offentlig økologisk innkjøp?',
    expectedSourceType: 'municipal/public procurement source plus audited report package',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
    ],
    mustNotUse: [
      'Eldre København 84%-formulering uten 2024/peak-kontekst',
      'Generert README-linjetall eller filstørrelse som kvalitetsbevis',
    ],
    knownCaveat:
      'Bruk 85% i 2024 og skill det fra peak 90% i 2015; forklar at dette er procurement-benchmark, ikke generell nasjonal DK-andel.',
    proposedAnswer:
      'Ja, men bare med metodecaveat: rapportpakken kan brukes til å peke på København 85% i 2024 og peak 90% i 2015 som offentlig-kjøkkenbenchmark.',
    citations: [
      {
        id: 'nordic-circularity-report-html',
        title: 'Nordisk sirkularitetsrapport 2026-05',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Standardisert København-tall og offentlig innkjøpskontekst.',
      },
      {
        id: 'nordic-circularity-appendix',
        title: 'Nordisk sirkularitetsrapport appendiks',
        locator: 'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
        sourceType: 'appendix and evidence matrix',
        readiness: 'citable_with_note',
        supportsClaim: 'Samme København-verdi og kildeavgrensning som HTML-rapporten.',
      },
    ],
  },
  {
    id: 'CA-002',
    category: 'nordic_circularity',
    question: 'Kan T3-diffen siteres som ekstern validering av rapportens konklusjoner?',
    expectedSourceType: 'external domain validation or named expert review',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md',
      'research/v1-2/phase7-selvkritikk.md',
    ],
    mustNotUse: [
      'Språk som sier eller antyder at T3 er ekstern fagfellevalidering',
      'LLM-diff alene som dokumentarisk tredjepartsbevis',
    ],
    knownCaveat:
      'T3 er gjennomført, men det er en intern metodekontroll mot en generisk ekstern modellrespons, ikke ekstern validering.',
    proposedAnswer:
      'Nei. T3 kan omtales som intern metodekontroll, men skal blokkeres som ekstern validering.',
    citations: [
      {
        id: 'phase8-t3-diff',
        title: 'Phase 8 T3 ekstern-vs-intern diff',
        locator: 'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md',
        sourceType: 'internal method check',
        readiness: 'citable_with_note',
        supportsClaim: 'Dokumenterer hva T3 faktisk sammenlignet.',
      },
    ],
    blockingNotes: [
      'Required readiness is citable_external, but available T3 material is only citable_with_note and internally generated.',
      'No named external validator, peer review, or domain expert sign-off is present.',
    ],
  },
  {
    id: 'CA-003',
    category: 'nordic_circularity',
    question: 'Kan cascade-logikken prioritere forebygging før biogass i sirkularitetsråd?',
    expectedSourceType: 'audited synthesis with cited food-waste and circularity sources',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'src/lib/data/circular-leverage.ts',
    ],
    mustNotUse: [
      'Teknologinøytral rangering uten avfallshierarki',
      'Biogassvolum alene som bevis for høyest sirkularitet',
    ],
    knownCaveat:
      'Forebygging er et prioriteringsprinsipp; tallfestede effektforhold må følges av kilde og metodeavgrensning.',
    proposedAnswer:
      'Ja, med caveat: cascade-logikken kan brukes som analytisk ramme når tallfestede effektpåstander knyttes til sine konkrete kilder.',
    citations: [
      {
        id: 'circular-leverage-data',
        title: 'Circular leverage data model',
        locator: 'src/lib/data/circular-leverage.ts',
        sourceType: 'application data with cited source URLs',
        readiness: 'citable_with_note',
        supportsClaim: 'Viser at matsvinnforebygging og redistribusjon skilles fra biogass/gjenvinning.',
      },
      {
        id: 'nordic-circularity-report-cascade',
        title: 'Nordisk sirkularitetsrapport cascade sections',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Bruker cascade-/leverage-logikk i anbefalingene.',
      },
    ],
  },
  {
    id: 'CA-004',
    category: 'market_concentration',
    question: 'Kan vi sitere Norge som HHI 3445 og CR3 96,6% uten å blande begrepene?',
    expectedSourceType: 'computed market concentration data plus audited report correction',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/data/food-systems/no/chart-metrics.json',
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
    ],
    mustNotUse: ['NO HHI 96,6%', 'CR3 omtalt som HHI eller HHI omtalt som prosentandel'],
    knownCaveat:
      'HHI er indeks, CR3 er prosentandel. Påstanden må bruke begge etikettene eksplisitt.',
    proposedAnswer:
      'Ja, når teksten sier HHI 3445 og CR3 96,6%, og ikke presenterer CR3 som HHI.',
    citations: [
      {
        id: 'no-chart-metrics',
        title: 'Norway food-system chart metrics',
        locator: 'public/data/food-systems/no/chart-metrics.json',
        sourceType: 'computed local dataset',
        readiness: 'citable_with_note',
        supportsClaim: 'Inneholder beregnet parent HHI for norsk dagligvarestruktur.',
      },
      {
        id: 'hhi-cr3-report-correction',
        title: 'Nordisk sirkularitetsrapport HHI/CR3 correction',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Dokumenterer at tidligere HHI 96,6%-formulering er rettet.',
      },
    ],
  },
  {
    id: 'CA-005',
    category: 'market_concentration',
    question: 'Kan Finland 30%-regelen brukes som sitatklar juridisk sammenligning?',
    expectedSourceType: 'official legal text or verified legal database locator',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'Official Finlex/legal locator for Konkurrenseloven §4a',
      'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md only as internal comparison note',
    ],
    mustNotUse: [
      'Intern rapporttekst alene som rettskilde',
      'LLM-diff som juridisk fasit',
    ],
    knownCaveat:
      'Inntil juridisk primærkilde er koblet direkte, kan regelen brukes som intern analyse, ikke som ekstern juridisk dokumentasjon.',
    proposedAnswer:
      'Blokker som ekstern juridisk påstand til offisiell lovlocator er koblet.',
    citations: [
      {
        id: 'phase8-finland-30-rule',
        title: 'Phase 8 note on Finland 30 percent rule',
        locator: 'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md',
        sourceType: 'internal comparison note',
        readiness: 'citable_with_note',
        supportsClaim: 'Identifiserer regelen som sammenligningspunkt, men er ikke rettskilde.',
      },
    ],
    blockingNotes: [
      'Required readiness is citable_external because the claim is legal in nature.',
      'Current acceptance input lacks an official legal locator for the statute text.',
    ],
  },
  {
    id: 'CA-006',
    category: 'food_waste',
    question: 'Kan vi bruke FI-DK 6x matsvinn-forskjell som ekstern rangering?',
    expectedSourceType: 'harmonized food-waste statistics with method caveat',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md',
    ],
    mustNotUse: [
      'Rangering uten måleinstrument-/definisjonsforbehold',
      'Island-sammenligning uten Hagstofa-validering',
    ],
    knownCaveat:
      'Rapporten sier at forskjellen kan være måleinstrument. Bruk derfor metodenote, ikke ren prestasjonsrangering.',
    proposedAnswer:
      'Ja, men bare som metodebelagt sammenligning med tydelig forbehold om målemetode.',
    citations: [
      {
        id: 'report-food-waste-6x',
        title: 'Nordisk sirkularitetsrapport food-waste section',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Presenterer 6x-forskjellen sammen med metodeforbehold.',
      },
      {
        id: 'phase8-food-waste-method-note',
        title: 'Phase 8 food-waste method note',
        locator: 'research/v1-2/phase8-T3-ekstern-vs-intern-diff.md',
        sourceType: 'internal method check',
        readiness: 'citable_with_note',
        supportsClaim: 'Bekrefter at definisjonsforskjeller er kjent og ikke unik plattforminnsikt.',
      },
    ],
  },
  {
    id: 'CA-007',
    category: 'food_waste',
    question: 'Kan Salling Groups matsvinnreduksjon siteres som halvering?',
    expectedSourceType: 'company or audited report source with scope note',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
    ],
    mustNotUse: ['Halvering', 'Uten scope-note om food waste percentage og baseline'],
    knownCaveat:
      'Bruk 2,8% baseline 2015 til 1,8% i 2024 (-34,8%), ikke halvering.',
    proposedAnswer:
      'Ja, men teksten må si -34,8% mot baseline og ikke omtale det som halvering.',
    citations: [
      {
        id: 'report-salling-waste',
        title: 'Nordisk sirkularitetsrapport Salling food-waste percentage',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Inneholder korrigert Salling-baseline og scope-note.',
      },
    ],
  },
  {
    id: 'CA-008',
    category: 'ownership_company',
    question: 'Kan eierskaps- og selskapsstrukturer brukes eksternt fra selskapssidene?',
    expectedSourceType: 'annual report, registry, transaction announcement, or verified resolver locator',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'CompanyOwnership.source citations surfaced on /selskap/[id]',
      'src/lib/row-source-locators.ts resolver mappings',
    ],
    mustNotUse: [
      'Unverified company-tree inference',
      'Blocked source markers as if they were documentary evidence',
    ],
    knownCaveat:
      'Use only ownership rows whose citation label resolves to annual report, registry, transaction announcement, or explicit internal-blocked marker.',
    proposedAnswer:
      'Ja for rows with verified locators and visible citation labels; unresolved labels remain internal or blocked.',
    citations: [
      {
        id: 'row-source-locators-ownership',
        title: 'Row source locator resolver',
        locator: 'src/lib/row-source-locators.ts',
        sourceType: 'resolver over existing database/repo locators',
        readiness: 'citable_with_note',
        supportsClaim: 'Maps ownership labels only to existing locators or explicit blocked markers.',
      },
      {
        id: 'company-page-citations',
        title: 'Company page citation rendering',
        locator: 'src/app/selskap/[id]/page.tsx',
        sourceType: 'public surface citation gate',
        readiness: 'citable_with_note',
        supportsClaim: 'Shows source readiness beside company facts.',
      },
    ],
  },
  {
    id: 'CA-009',
    category: 'ownership_company',
    question: 'Kan grafen alene brukes som bevis for styre-/personrelasjoner?',
    expectedSourceType: 'verified board-member row citation or official registry locator',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'BoardMember.source with verifiedAt',
      'PersonProfile linkage when public graph relationship is cited',
    ],
    mustNotUse: [
      'Graph edge alone without row-level source citation',
      'Orphan board-member graph rows as proof',
    ],
    knownCaveat:
      'Graph audit still reports orphan board-member graph rows; graph is navigation/context unless backed by row-level citation.',
    proposedAnswer:
      'Blokker graph-only use. Cite row-level BoardMember source data instead.',
    citations: [
      {
        id: 'graph-audit-quality',
        title: 'Knowledge graph audit output',
        locator: 'npm run graph:audit',
        sourceType: 'technical audit output',
        readiness: 'internal_context',
        supportsClaim: 'Shows graph integrity passes but practical graph coverage remains limited.',
      },
    ],
    blockingNotes: [
      'Graph audit is internal quality context, not documentary evidence for a person relationship.',
      'Required readiness is citable_external for relationship proof, but graph-only evidence is internal_context.',
    ],
  },
  {
    id: 'CA-010',
    category: 'public_subsidies',
    question: 'Kan offentlige tilskuddsrader siteres eksternt fra databasen?',
    expectedSourceType: 'official registry/API/CSV source locator',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'Subsidy.source resolver for Landbruksdirektoratet production subsidy rows',
      'npm run db:audit Source Quality Coverage for Subsidy.source',
    ],
    mustNotUse: ['Aggregated subsidy claim without row source', 'Manual label-only source text'],
    knownCaveat:
      'External use should cite the row source locator and year/category, not only an aggregate in prose.',
    proposedAnswer:
      'Ja for rows that retain the official Landbruksdirektoratet locator and row context.',
    citations: [
      {
        id: 'subsidy-row-source-resolver',
        title: 'Subsidy row-source locator resolver',
        locator: 'src/lib/row-source-locators.ts',
        sourceType: 'official registry locator resolver',
        readiness: 'citable_external',
        supportsClaim: 'Resolves production subsidy rows to official Landbruksdirektoratet sources.',
      },
    ],
  },
  {
    id: 'CA-011',
    category: 'library_sources',
    question: 'Kan en bibliotekpost siteres eksternt med bare lokal PDF/tittel?',
    expectedSourceType: 'DOI, handle, publisher URL, or verified document URL plus local file',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'Document.url, Thesis.url, DOI, handle, or verified publisher locator',
      'Local file path only as archive/copy support',
    ],
    mustNotUse: [
      'Local file path as eneste eksterne locator',
      'Title-only or imported filename as source proof',
    ],
    knownCaveat:
      'Local files are useful for archive and review, but external citations need direct public locator or persistent ID.',
    proposedAnswer:
      'Blokker title/local-file-only use until a public locator or persistent ID is present.',
    citations: [
      {
        id: 'status-library-coverage',
        title: 'Citable knowledge base status - library locator coverage',
        locator: 'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
        sourceType: 'operational status report',
        readiness: 'internal_context',
        supportsClaim: 'Documents locator coverage and DOI/persistent-ID gaps.',
      },
    ],
    blockingNotes: [
      'A local file path alone is internal archive evidence, not an external citation locator.',
      'Required readiness is citable_external, but title/local-file-only evidence is internal_context.',
    ],
  },
  {
    id: 'CA-012',
    category: 'graph_relationships',
    question: 'Kan grafrelasjoner eksporteres som siterbare relasjonspåstander?',
    expectedSourceType: 'edge with source citation, confidence, and underlying row/document locator',
    requiredReadinessLevel: 'citable_external',
    mustUse: [
      'Source-backed edge or underlying row citation',
      'Graph audit integrity output as quality context only',
    ],
    mustNotUse: [
      'Edges without confidence/source as external evidence',
      'Graph neighborhood visualization as proof',
    ],
    knownCaveat:
      'Graph currently has low confidence coverage and many isolated nodes; use it for navigation unless a relationship has source-backed evidence.',
    proposedAnswer:
      'Blokker graph-edge-only citation. Export only relationships with source-backed underlying rows.',
    citations: [
      {
        id: 'graph-query-filter',
        title: 'Public graph query source filtering',
        locator: 'src/lib/queries/graph.ts',
        sourceType: 'public graph adapter',
        readiness: 'internal_context',
        supportsClaim: 'Filters blocked markers from public graph output but does not make every edge citable.',
      },
      {
        id: 'graph-audit-low-confidence',
        title: 'Knowledge graph audit',
        locator: 'npm run graph:audit',
        sourceType: 'technical audit output',
        readiness: 'internal_context',
        supportsClaim: 'Shows confidence coverage remains a quality limitation.',
      },
    ],
    blockingNotes: [
      'Required readiness is citable_external, but graph-only evidence is internal_context.',
      'Acceptance requires a source-backed underlying row before a relationship can be cited externally.',
    ],
  },
]

function weakestReadiness(citations: CitableAcceptanceCitation[]): CitationReadinessLevel {
  if (citations.length === 0) return 'blocked_unsourced'

  return citations
    .map(citation => citation.readiness)
    .slice(1)
    .reduce<CitationReadinessLevel>(
      (weakest, readiness) =>
        compareCitationReadiness(readiness, weakest) < 0 ? readiness : weakest,
      citations[0].readiness,
    )
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function buildCitableAcceptanceResult(
  test: CitableAcceptanceTest,
): CitableAcceptanceResult {
  const citationBlockers = test.citations
    .filter(
      citation =>
        !isExternallyCitable(citation.readiness) ||
        compareCitationReadiness(citation.readiness, test.requiredReadinessLevel) < 0,
    )
    .map(
      citation =>
        `${citation.id}: ${citation.readiness} does not satisfy ${test.requiredReadinessLevel}`,
    )

  const blockingNotes = unique([...(test.blockingNotes ?? []), ...citationBlockers])
  const status: CitableAcceptanceStatus = blockingNotes.length > 0 ? 'blocked' : 'cite_ready'
  const readiness = weakestReadiness(test.citations)

  return {
    ...test,
    status,
    readiness,
    caveatRequired:
      readiness === 'citable_with_note' || test.requiredReadinessLevel === 'citable_with_note',
    exclusionNotes:
      status === 'blocked'
        ? unique([...blockingNotes, ...(test.exclusionNotes ?? [])])
        : unique(test.exclusionNotes ?? []),
  }
}

export function buildCitableAcceptancePack(
  tests: CitableAcceptanceTest[] = ACCEPTANCE_TESTS,
  generatedAt = '2026-05-20',
): CitableAcceptancePack {
  const results = tests.map(buildCitableAcceptanceResult)
  const categories = results.reduce(
    (acc, result) => {
      acc[result.category] += 1
      return acc
    },
    {
      nordic_circularity: 0,
      market_concentration: 0,
      food_waste: 0,
      ownership_company: 0,
      public_subsidies: 0,
      library_sources: 0,
      graph_relationships: 0,
    } satisfies Record<CitableAcceptanceCategory, number>,
  )

  return {
    generatedAt,
    summary: {
      total: results.length,
      citeReady: results.filter(result => result.status === 'cite_ready').length,
      blocked: results.filter(result => result.status === 'blocked').length,
      categories,
    },
    results,
  }
}

function markdownList(items: string[]) {
  return items.map(item => `  - ${item}`).join('\n')
}

function formatCitations(citations: CitableAcceptanceCitation[]) {
  if (citations.length === 0) return '  - None'

  return citations
    .map(
      citation =>
        `  - ${citation.id}: ${citation.title} (${citation.sourceType}, ${citation.readiness}) - ${citation.locator}. Supports: ${citation.supportsClaim}`,
    )
    .join('\n')
}

export function formatAcceptanceTestsMarkdown(tests: CitableAcceptanceTest[] = ACCEPTANCE_TESTS) {
  const lines = [
    '# Citable Acceptance Tests',
    '',
    'Generated from `src/lib/citations/citable-acceptance.ts`.',
    '',
    'Every question states the source type, readiness level, allowed evidence, disallowed evidence, and caveat required before the knowledge base can answer externally.',
  ]

  for (const test of tests) {
    lines.push(
      '',
      `## ${test.id}: ${test.question}`,
      '',
      `- Category: \`${test.category}\``,
      `- Expected source type: ${test.expectedSourceType}`,
      `- Required citation readiness: \`${test.requiredReadinessLevel}\``,
      '- Must use:',
      markdownList(test.mustUse),
      '- Must not use:',
      markdownList(test.mustNotUse),
      `- Known caveat: ${test.knownCaveat}`,
    )
  }

  return `${lines.join('\n')}\n`
}

export function formatAcceptancePackMarkdown(pack: CitableAcceptancePack) {
  const lines = [
    '# Citable Acceptance Pack 2026-05-20',
    '',
    `Generated: ${pack.generatedAt}`,
    '',
    `Summary: ${pack.summary.citeReady}/${pack.summary.total} cite-ready, ${pack.summary.blocked} blocked.`,
    '',
    'A blocked result is intentional when the current evidence only supports internal context or `citable_with_note` while the question requires `citable_external`.',
  ]

  for (const result of pack.results) {
    lines.push(
      '',
      `## ${result.id}: ${result.question}`,
      '',
      `- Status: \`${result.status}\``,
      `- Readiness: \`${result.readiness}\``,
      `- Caveat required: ${result.caveatRequired ? 'yes' : 'no'}`,
      `- Proposed answer: ${result.proposedAnswer}`,
      `- Required readiness: \`${result.requiredReadinessLevel}\``,
      `- Expected source type: ${result.expectedSourceType}`,
      `- Known caveat: ${result.knownCaveat}`,
      '- Citations:',
      formatCitations(result.citations),
      '- Exclusion notes:',
      result.exclusionNotes.length > 0 ? markdownList(result.exclusionNotes) : '  - None',
    )
  }

  return `${lines.join('\n')}\n`
}
