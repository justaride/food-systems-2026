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
      'https://www.kk.dk/dagsordener-og-referater/%C3%98konomiudvalget/m%C3%B8de-18032025/referat/punkt-10',
      'https://www.kk.dk/sites/default/files/agenda/93138585-f5a0-47a5-b500-a21cc5033912/816b7e92-7d10-403a-a631-4c742327c643-bilag-2.pdf',
      'https://www.kk.dk/sites/default/files/2025-08/Status%20p%C3%A5%20K%C3%B8benhavn%202025%20UA.pdf',
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
    ],
    mustNotUse: [
      '85 % i 2024, 85 % i 2015 eller 90 % som oppnådd topp i 2015',
      'København-tallet som generell nasjonal dansk økologiandel',
      'Generert README-linjetall eller filstørrelse som kvalitetsbevis',
    ],
    knownCaveat:
      'Bruk 87,7 % i 2024 (kommunens vedtaksside: nesten 88 %) og 88 % i 2015. Tallene gjelder økologi i Københavns kommunale institusjoner og kjøkken. Dagens nivå bygger på innkjøpsdata, mens 2015-tallet hadde et eldre, blandet målegrunnlag. Dette er ikke en metodeidentisk tidsserie eller en nasjonal dansk økologiandel.',
    proposedAnswer:
      'Ja, som kommunalt innkjøps- og kjøkkenbenchmark: København rapporterer 87,7 % økologi i 2024 (nesten 88 %), mot 88 % i 2015. Dagens nivå bygger på innkjøpsdata, men målemetoden er endret over tid, så sammenstillingen skal ikke fremstilles som en metodeidentisk trend eller som Danmarks nasjonale andel.',
    citations: [
      {
        id: 'copenhagen-meal-strategy-renewal-2025',
        title: 'Godkendelse af fornyelse af Københavns Kommunes Mad- og Måltidsstrategi',
        locator:
          'https://www.kk.dk/dagsordener-og-referater/%C3%98konomiudvalget/m%C3%B8de-18032025/referat/punkt-10',
        sourceType: 'municipal decision record',
        readiness: 'citable_external',
        supportsClaim:
          'Oppgir at kommunen i 2024 lå på nesten 88 % økologi på tvers av kommunens enheter.',
      },
      {
        id: 'copenhagen-meal-strategy-experience-2020-2024',
        title: 'Erfaringsopsamling på implementering af Mad- og Måltidsstrategien 2020-2024',
        locator:
          'https://www.kk.dk/sites/default/files/agenda/93138585-f5a0-47a5-b500-a21cc5033912/816b7e92-7d10-403a-a631-4c742327c643-bilag-2.pdf',
        sourceType: 'municipal strategy implementation report',
        readiness: 'citable_external',
        supportsClaim:
          'Oppgir 87,7 % i 2024 og dokumenterer den nyere målingen ved Meyers Madhus.',
      },
      {
        id: 'copenhagen-status-2025-organic-procurement',
        title: 'Status på København 2025',
        locator:
          'https://www.kk.dk/sites/default/files/2025-08/Status%20p%C3%A5%20K%C3%B8benhavn%202025%20UA.pdf',
        sourceType: 'municipal statistical report',
        readiness: 'citable_external',
        supportsClaim:
          'Viser 88 % i 2015, omtaler 2024 som 88 % avrundet og dokumenterer skiftet til et rent innkjøpsdatagrunnlag.',
      },
      {
        id: 'nordic-circularity-report-html',
        title: 'Nordisk sirkularitetsrapport 2026-05',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Propagerer korrigerte København-tall og kommunal metodekontekst.',
      },
      {
        id: 'nordic-circularity-appendix',
        title: 'Nordisk sirkularitetsrapport appendiks',
        locator: 'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
        sourceType: 'appendix and evidence matrix',
        readiness: 'citable_with_note',
        supportsClaim: 'Propagerer samme København-verdier og kildeavgrensning som HTML-rapporten.',
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
    question: 'Kan vi sitere Norge som HHI 3327 og CR3 96,6% uten å blande begrepene?',
    expectedSourceType: 'computed market concentration data plus audited report correction',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'public/data/food-systems/no/value-chain.json',
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
    ],
    mustNotUse: [
      'NO HHI 96,6%',
      'CR3 omtalt som HHI eller HHI omtalt som prosentandel',
      'Eldre HHI 3445 (NG 48,4/Coop 27,1/Reitan 18,0/Bunnpris 6,6) — erstattet av KT-omsetning 2024',
      'Butikkantall-basert parentHhi fra chart-metrics som om det var omsetnings-HHI',
    ],
    knownCaveat:
      'HHI er indeks, CR3 er prosentandel; bruk begge etikettene eksplisitt. HHI 3327 er omsetnings-HHI fra Konkurransetilsynets Dagligvarerapport 2024-25 (NG 43,5/Coop 29,2/Rema 23,9/Bunnpris 3,3 → 43,5²+29,2²+23,9²+3,3² = 3327). Ikke forveksle med chart-metrics butikkantall-baserte parentHhi.',
    proposedAnswer:
      'Ja, når teksten sier HHI 3327 (KT-omsetning 2024) og CR3 96,6%, og ikke presenterer CR3 som HHI.',
    citations: [
      {
        id: 'no-value-chain',
        title: 'Norway value-chain retail concentration',
        locator: 'public/data/food-systems/no/value-chain.json',
        sourceType: 'curated primary dataset (KT Dagligvarerapport 2024-25)',
        readiness: 'citable_with_note',
        supportsClaim: 'Inneholder retail-HHI 3327 og CR3 96,6 % fra KT-omsetningsandeler 2024 for norsk dagligvarestruktur.',
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
      'Official Finlex/legal locator for Finnish Competition Act section 4a',
      'Official Finnish Competition and Consumer Authority locator explaining section 4a',
    ],
    mustNotUse: [
      'Intern rapporttekst alene som rettskilde',
      'LLM-diff som juridisk fasit',
      'Food Market Act as the statutory locator for the 30 percent dominance rule',
    ],
    knownCaveat:
      '30%-regelen ligger i den finske konkurranseloven §4a, ikke i Elintarvikemarkkinalaki/Food Market Act. Bruk som juridisk sammenligning må derfor sitere konkurranseloven/KKV og navngi dagligvaremarkedets dominanspresumsjon.',
    proposedAnswer:
      'Ja, men bare som juridisk sammenligning av finsk konkurranselov §4a: foretak/sammenslutninger med minst 30 % dagligvaremarkedsandel anses å ha dominerende stilling i det finske dagligvaremarkedet.',
    citations: [
      {
        id: 'finlex-competition-act-4a',
        title: 'Finnish Competition Act section 4a',
        locator: 'https://www.finlex.fi/en/legislation/2011/948',
        sourceType: 'official legal database',
        readiness: 'citable_external',
        supportsClaim: 'Offisiell rettskilde for §4a om dominerende markedsstilling i dagligvarehandelen ved minst 30 % markedsandel.',
      },
      {
        id: 'kkv-competition-act-4a-grocery',
        title: 'FCCA/KKV explanation of Competition Act section 4a in grocery trade',
        locator: 'https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/',
        sourceType: 'official authority explanation',
        readiness: 'citable_external',
        supportsClaim: 'Forklarer at forbudet mot misbruk av dominerende stilling kan brukes på dagligvareforetak med nasjonal markedsandel over 30 %, og at bestemmelsen gjaldt fra 1. januar 2014.',
      },
    ],
    blockingNotes: [],
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
      'https://digitalassets.sallinggroup.com/raw/upload/fl_attachment:Annual%20report%202024%252epdf/external_content_providers/magnolia/next/jcr:c5f40c7a-153b-434d-8d7f-3c1eafb3dafe',
      'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
      'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
    ],
    mustNotUse: [
      'Halvering som realisert reduksjon',
      '-34,8% som reduksjonstall i den eksterne formuleringen',
      'Relativ reduksjon uten eksplisitt avledningsnote fra avrundede endepunkter',
      'Uten scope-note om food waste percentage og dansk virksomhet',
    ],
    knownCaveat:
      'Bruk 2,8 % i 2015 til 1,8 % i 2024 for Salling Groups danske virksomhet: en nedgang på 1,0 prosentpoeng. Dette er ikke en halvering. Utelat relativ prosent med mindre den eksplisitt avledes fra de avrundede endepunktene.',
    proposedAnswer:
      'Nei, ikke som halvering. Salling Groups danske virksomhet kan beskrives med en nedgang i food waste percentage fra 2,8 % i 2015 til 1,8 % i 2024, altså 1,0 prosentpoeng.',
    citations: [
      {
        id: 'salling-group-annual-report-2024-food-waste',
        title: 'Salling Group Annual Report 2024 — Every Day Better',
        locator:
          'https://digitalassets.sallinggroup.com/raw/upload/fl_attachment:Annual%20report%202024%252epdf/external_content_providers/magnolia/next/jcr:c5f40c7a-153b-434d-8d7f-3c1eafb3dafe',
        sourceType: 'company annual report',
        readiness: 'citable_external',
        supportsClaim:
          'Viser food waste percentage 1,8 % i 2024 mot 2,8 % i 2015 og avgrenser baseline til danske formater.',
      },
      {
        id: 'report-salling-waste',
        title: 'Nordisk sirkularitetsrapport Salling food-waste percentage',
        locator: 'public/reports/nordisk-sirkularitetsrapport-2026-05.html',
        sourceType: 'audited report package',
        readiness: 'citable_with_note',
        supportsClaim: 'Propagerer korrigerte endepunkter, 1,0 prosentpoeng og dansk scope-note.',
      },
      {
        id: 'appendix-salling-waste',
        title: 'Nordisk sirkularitetsrapport appendiks — Salling food-waste percentage',
        locator: 'docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md',
        sourceType: 'appendix and evidence matrix',
        readiness: 'citable_with_note',
        supportsClaim: 'Knytter den aktive rapportformuleringen til Salling Groups offisielle årsrapport.',
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
  {
    id: 'CA-013',
    category: 'market_concentration',
    question:
      'Kan vi sitere at konsentrasjonen i norsk matsystem topper i foredling (meieri ~6000, rødt kjøtt ~4600) over dagligvare (~3327), med samvirkene TINE/Nortura som mest konsentrert?',
    expectedSourceType: 'sourced market shares per node (authority/industry) with arithmetic verification',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md',
      'public/data/food-systems/no/value-chain.json',
    ],
    mustNotUse: [
      'Estimerte utfordrer-andeler presentert som kildebelagte',
      'Sammenligning av ulike baser/referanseår som om de var én base',
      'Sjømat (~950) framstilt som like konsentrert som retail (~3327)',
      'AP-2s n-følsomme inntekts-HHI brukt som markedskonsentrasjon',
    ],
    knownCaveat:
      'Ordinal-funnet (foredling > retail > primær) er robust via leder-gulv (TINE 76,4² = 5837; Nortura 66² = 4356 — begge over retail uansett utfordrer-split). Per-node presise HHI varierer; bær basis + år.',
    proposedAnswer:
      'Ja, med forbehold: det ordinale funnet (foredling topper, samvirke mest konsentrert, primær lavest) er citable m/forbehold; oppgi at utfordrer-andeler er estimert og at referanseår/baser varierer.',
    citations: [
      {
        id: 'ap2-kryssnode-funn',
        title: 'AP-2 kryss-node markeds-HHI funn',
        locator: 'docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md',
        sourceType: 'internal sourced analysis (Oslo Economics / KLF / Animalia / KT / Fiskeridir.)',
        readiness: 'citable_with_note',
        supportsClaim: 'Dokumenterer node-HHI med kildebelagte leder-andeler + leder-gulv-robusthet og sjømat-kryssvalidering.',
      },
      {
        id: 'no-value-chain-retail',
        title: 'Norway retail concentration (KT 2024)',
        locator: 'public/data/food-systems/no/value-chain.json',
        sourceType: 'curated primary dataset (KT Dagligvarerapport 2024-25)',
        readiness: 'citable_with_note',
        supportsClaim: 'Retail-HHI 3327 (KT-omsetning) som referansepunkt for «over dagligvare».',
      },
    ],
  },
  {
    id: 'CA-014',
    category: 'public_subsidies',
    question:
      'Kan vi sitere at samlede produksjonstilskudd i 2024 var ~18,6 mrd kr, og at den tidligere 10,94 mrd-totalen var et skript-artefakt?',
    expectedSourceType: 'open agency data (Landbruksdirektoratet) with reproducible aggregate',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'research/analyse/ap3-tilskuddskonsentrasjon.json',
      'docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md',
    ],
    mustNotUse: [
      'Tidligere 10,94 mrd 2024-total framstilt som reell nedgang',
      'Gini/konsentrasjon omtalt som «kapret av de store» uten struktur-/policy-kontekst',
    ],
    knownCaveat:
      '2024-totalen 18,61 mrd er regenerert etter en kolonnematch-bug (SCHEME_ALIASES) og avstemt mot publisert 18,39 mrd. Gini ~0,52–0,54; konsentrasjonen er strukturdrevet (husdyr/areal).',
    proposedAnswer:
      'Ja, med forbehold: 2024 ~18,6 mrd (verifisert mot publisert 18,39 mrd); den tidligere 10,94 mrd var en skript-bug, ikke en reell nedgang.',
    citations: [
      {
        id: 'ap3-aggregate',
        title: 'AP-3 tilskuddskonsentrasjon aggregat',
        locator: 'research/analyse/ap3-tilskuddskonsentrasjon.json',
        sourceType: 'reproducible aggregate over Landbruksdirektoratet open data',
        readiness: 'citable_with_note',
        supportsClaim: 'Inneholder 2024-total 18,61 mrd + Gini, regenerert og avstemt mot publisert total.',
      },
      {
        id: 'ap3-funn',
        title: 'AP-3 funnnotat',
        locator: 'docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md',
        sourceType: 'internal sourced analysis',
        readiness: 'citable_with_note',
        supportsClaim: 'Dokumenterer bug-fiksen og avstemmingen mot publisert total.',
      },
    ],
  },
  {
    id: 'CA-015',
    category: 'graph_relationships',
    question:
      'Kan vi sitere AP-1-styrebroene (logistikk↔retail 7, foredling↔retail 6) som ekstern påstand om makt-konsentrasjon?',
    expectedSourceType: 'internal board-interlock graph pending primary check + coverage extension',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: ['docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md'],
    mustNotUse: [
      '«Kontrollerer» / «koordinerer» / «skjult makt» utledet fra AP-1 alene',
      'Generalisering til hele selskapsuniverset uten utvidet styredekning',
    ],
    knownCaveat:
      'AP-1 er intern baseline: 36 % styredekning, favoriserer store/velinnsamlede selskaper; dekningsutvidelse til ~47 % krever DB-kjøring. Pekepinn for AP-2/AP-5, ikke konklusjon.',
    proposedAnswer:
      'Nei (ennå): AP-1-broene er intern baseline (internal_context) og fail-closes til de er primærsjekket og styredekningen er utvidet. Trianguleringen med AP-5 (vertikal eierkontroll) er den citerbare ruten.',
    citations: [
      {
        id: 'ap1-funn',
        title: 'AP-1 styreoverlapp funn',
        locator: 'docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md',
        sourceType: 'internal graph analysis',
        readiness: 'internal_context',
        supportsClaim: 'Dokumenterer broene, men som intern baseline (36 % styredekning).',
      },
    ],
    blockingNotes: [
      'AP-1 alene er intern baseline (36 % styredekning) — fail-closed til primærsjekk + dekningsutvidelse (~47 %).',
      'Ekstern makt-påstand krever AP-5-triangulering (eierkontroll), ikke styregraf alene.',
    ],
  },
  {
    id: 'CA-016',
    category: 'ownership_company',
    question:
      'Kan vi sitere CL-MAKTKART-001: et fåtall konsern kontrollerer vertikalt på tvers av butikk, logistikk og foredling, og konsentrasjonen topper i samvirke-foredling?',
    expectedSourceType:
      'triangulated board + ownership graph, Brønnøysund + public company primary sources',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: [
      'docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md',
      'docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md',
      'docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md',
      'docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md',
    ],
    mustNotUse: [
      '«Samordner»/«opererer i samråd» fra eierstruktur alene',
      'AP-1-styrebroer alene uten AP-5-triangulering',
      'Aksjonærregisteret som faktisk brukt kilde for 2026-06-15-løftet',
    ],
    knownCaveat:
      'Struktur (form + styre + eierandel-%) er primærsjekket; «kontroll» = strukturell posisjon, ikke intensjon/samordning. Enkeltnoders presise HHI bærer fortsatt forbehold.',
    proposedAnswer:
      'Ja, med forbehold: vertikal konsernkontroll (butikk+logistikk+foredling) er triangulert over to uavhengige grafer og primærsjekket mot Brønnøysund + offentlige primærkilder for eierandel-%; konsentrasjonen topper i samvirke-foredling (kryss-node-HHI).',
    citations: [
      {
        id: 'maktkart-syntese',
        title: 'Maktkart-syntese (triangulert)',
        locator: 'docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md',
        sourceType: 'internal triangulated synthesis',
        readiness: 'citable_with_note',
        supportsClaim:
          'Binder AP-1/AP-2/AP-5 til ett strukturkart; to uavhengige grafer sammenfaller.',
      },
      {
        id: 'ap5-krysseie',
        title: 'AP-5 krysseie og eierandel-%',
        locator: 'docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md',
        sourceType: 'internal analysis with public primary source checks',
        readiness: 'citable_with_note',
        supportsClaim:
          'Dokumenterer eierandel-% for toppkonsernene fra selskapenes IR-/årsrapportsider og presiserer BAMA-/majoritetsforbehold.',
      },
      {
        id: 'kryssnode-hhi',
        title: 'Kryss-node HHI-profil',
        locator: 'docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md',
        sourceType: 'internal sourced analysis',
        readiness: 'citable_with_note',
        supportsClaim:
          'Dokumenterer at konsentrasjonen topper i samvirke-foredling, over dagligvare, med caveats per node.',
      },
    ],
  },
  {
    id: 'CA-017',
    category: 'market_concentration',
    question:
      'Kan vi sitere at fire konsern kontrollerer ~57 % av sjøbasert MTB i norsk laks-/ørretoppdrett, og at totaltallet underdriver konsentrasjonen?',
    expectedSourceType:
      'open register data (Fiskeridirektoratet Akvakulturregister) with Brønnøysund-checked konsern rollup',
    requiredReadinessLevel: 'citable_with_note',
    mustUse: ['docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md'],
    mustNotUse: [
      'Lokalitetstall, MTB og restråstoffvolum brukt om hverandre — tre atskilte nivåer',
      'Denne MTB-HHI sammenlignet direkte mot AP-2s node-HHI (ulike størrelser)',
      'MTB framstilt som realisert slaktevolum',
      'Restråstoff-kontroll framstilt som målt strøm eller intensjon framfor strukturell posisjon',
    ],
    knownCaveat:
      'MTB er tildelt kapasitet, ikke slaktevolum. Konsern-rollupen er stikkprøvet mot Brønnøysund 2026-06-15 (§7b) uten feilallokering, men eierandels-%/ultimat eierskap er offentlig kjent og ikke register-bekreftet her (→ AP-5/Aksjonærregisteret). Per-aktør restråstoff-tonnasje er needs-data.',
    proposedAnswer:
      'Ja, med forbehold: CR4 ~57 % og HHI ~929 for sjøbasert MTB (n=92 innehavere), mot HHI ~510 når store land-RAS-/offshore-tillatelser regnes med — de har høy nominell MTB på få lokaliteter og fortynner totaltallet. Restråstoff-koblingen er strukturell posisjon, ikke målt strøm.',
    citations: [
      {
        id: 'ap6-havbruk',
        title: 'AP-6 havbrukskonsentrasjon og restråstoff-tilgang',
        locator: 'docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md',
        sourceType: 'internal analysis over open register data, konsern rollup primary-checked',
        readiness: 'citable_with_note',
        supportsClaim:
          'Dokumenterer CR4/HHI for sjøbasert MTB mot totalbraketten, og stikkprøven som lukket konsern-rollup-forbeholdet (§7b).',
      },
    ],
  },
]

/**
 * Svakeste readiness gaten gir for én eller flere lokatorer.
 *
 * Dette er oppslaget andre flater skal utlede siterbarhet fra, framfor å
 * gjenta et nivå i egne lister. Duplisering var årsaken til at AP-3, AP-5 og
 * AP-6 lå på `internal_context` i appen mens gaten og hvitboka sa
 * `citable_with_note` — med badgetekster som etterlyste stikkprøver som var
 * gjort.
 *
 * Returnerer `null` når ingen acceptance-test dekker lokatorene. Null betyr
 * «gaten har ingen mening», ikke «blokkert» — kallstedet må da si eksplisitt
 * hvilket nivå som gjelder.
 */
export function gateReadinessForLocators(
  locators: string[],
  tests: CitableAcceptanceTest[] = ACCEPTANCE_TESTS,
): CitationReadinessLevel | null {
  const wanted = new Set(locators.filter(Boolean))
  if (wanted.size === 0) return null

  const matched = tests.flatMap(test => test.citations.filter(citation => wanted.has(citation.locator)))

  return matched.length === 0 ? null : weakestReadiness(matched)
}

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
