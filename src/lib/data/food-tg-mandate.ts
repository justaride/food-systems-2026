export type FoodTgTrack = 'A' | 'B' | 'C'

export type FoodTgValidationStatus =
  | 'internt-trygt'
  | 'needs-primary-check'
  | 'needs-actor-validation'
  | 'benchmark'
  | 'hypotese'

export type FoodTgOpportunity = {
  rank: number
  title: string
  track: FoodTgTrack
  role: string
  statuses: FoodTgValidationStatus[]
  whyNow: string
  canSay: string
  cannotSay: string
  validationNeed: string
  stopSignal: string
  nextAction: string
  claimIds: string[]
  evidenceIds: string[]
  sourceIds: string[]
}

export type FoodTgSprintItem = {
  day: string
  work: string
  counterparties: string
  question: string
  output: string
  status: FoodTgValidationStatus[]
}

export type FoodTgClaimCard = {
  id: string
  track: FoodTgTrack
  title: string
  status: FoodTgValidationStatus
  useNow: string
  needs: string
}

export type FoodTgDocument = {
  id: string
  title: string
  kind: string
  status: 'klar-til-bruk' | 'arbeidsgrunnlag' | 'koe'
  path: string
  use: string
}

export const foodTgStatusLabels: Record<FoodTgValidationStatus, string> = {
  'internt-trygt': 'Internt trygt',
  'needs-primary-check': 'Needs primary-check',
  'needs-actor-validation': 'Needs actor-validation',
  benchmark: 'Benchmark',
  hypotese: 'Hypotese',
}

export const foodTgMandateSummary = {
  title: 'Food TG mandat og validering',
  date: '2026-04-28',
  decisionDate: '2026-05-05',
  scope: 'Forelopig scope: Spor A+B, med C som tverrgaende adoption-, regelverks- og datagate.',
  recommendation:
    'Beslutt en 10 arbeidsdagers valideringssprint for pilotcommitment. Ingen claims lofter status for primary-check eller actor-validation er dokumentert.',
  decisionRule:
    'Valg etter sprint: modnes som konkret case, parkeres som benchmark, eller beholdes som hypotese.',
  externalValidation: 'Ingen claims er Validert eksternt per 2026-04-28.',
}

export const foodTgDecisionDocuments: FoodTgDocument[] = [
  {
    id: 'decision-memo-v03',
    title: 'Decision memo: Food TG scope v0.3',
    kind: 'Beslutningsnotat',
    status: 'klar-til-bruk',
    path: 'docs/project/mandates/decision-memo-food-tg-scope-v0.3.md',
    use: 'Brukes i scope-mote 05.05.2026 for a laase forelopig A+B/C-retning og sprintmandat.',
  },
  {
    id: 'insight-pack-v02',
    title: 'Insight pack outline v0.2',
    kind: 'Workshop-/deck-disposisjon',
    status: 'arbeidsgrunnlag',
    path: 'docs/project/mandates/insight-pack-outline-food-tg-v0.2.md',
    use: 'Gir historien, slide-rekkefolgen og trygg/utrygg formulering per hovedclaim.',
  },
  {
    id: 'jan-thomas-cathrine-brief-r4',
    title: 'Brief Jan Thomas/Cathrine runde 4',
    kind: 'Mote-brief',
    status: 'klar-til-bruk',
    path: 'docs/project/mandates/brief-jan-thomas-cathrine-food-tg-runde-4.md',
    use: 'Kort samtalegrunnlag for hva som er modent, hva som ma vente, og hva sprinten skal avklare.',
  },
  {
    id: 'primary-check-queue-v01',
    title: 'Primary-check queue v0.1',
    kind: 'Arbeidskoe',
    status: 'koe',
    path: 'docs/project/mandates/primary-check-queue-food-tg-v0.1.md',
    use: 'Holder regulatoriske og datamessige sjekkpunkter atskilt fra aktorvalidering.',
  },
  {
    id: 'actor-validation-pack-v01',
    title: 'Actor validation pack v0.1',
    kind: 'Outreach-pakke',
    status: 'koe',
    path: 'docs/project/mandates/actor-validation-pack-food-tg-v0.1.md',
    use: 'Gir sporsmal, prioritering og responslogikk for P1/P2-aktorer.',
  },
]

export const foodTgOpportunityRadar: FoodTgOpportunity[] = [
  {
    rank: 1,
    title: 'EUDR og sporbarhet som datadriver',
    track: 'A',
    role: 'Strategisk scoping og datakrav',
    statuses: ['needs-primary-check'],
    whyNow:
      'Soya og relevante avledede produkter gjor sporbarhet konkret, men norsk/EOS-gjennomforing og varekodemetode ma holdes separat.',
    canSay:
      'EUDR er et sterkt datatema for A-sporet og kan brukes til a definere hvilke data Food TG ma kunne stole pa.',
    cannotSay:
      'Ikke si at EUDR gjelder direkte i Norge for soya, eller at varekodene alene beviser SPC/lakseforvolum.',
    validationNeed:
      'Landbruksdirektoratet, Miljodirektoratet, SSB/Tolletaten og fagekspert pa varekode/metode.',
    stopSignal: 'Norsk gjennomforing eller varekodemetode kan ikke avklares raskt.',
    nextAction: 'Kjor primary-check for EUDR-Norge, HS/SSB-metode og bruksrett til data.',
    claimIds: ['CL-A-020', 'CL-C-011'],
    evidenceIds: ['EV-A-021'],
    sourceIds: ['SRC-A-017'],
  },
  {
    rank: 2,
    title: 'Alternative forproteiner',
    track: 'A',
    role: 'Roadmap-spor for importavhengighet og substitusjon',
    statuses: ['hypotese', 'needs-actor-validation'],
    whyNow:
      'Spor A har strategisk relevans, men kommersiell modenhet, kost, LCA, volum, regelverk og kjoperkrav er ikke laast.',
    canSay:
      'Alternative forproteiner er et relevant roadmap-spor dersom modenhet og kjoperkrav bekreftes.',
    cannotSay:
      'Ikke si at encelle-/gjaerprotein er kommersielt modent, substituerer soya/fiskemel eller har pilotvolum.',
    validationNeed: 'Denofa, Skretting/Sjomat Norge, NMBU/Foods of Norway og relevante foraktorer.',
    stopSignal: 'Foraktorene kan ikke dele brukbare data, eller modenhet blir for langt unna pilot.',
    nextAction: 'Skille FoU-benchmark, roadmap-spor og mulig senere pilotkandidat.',
    claimIds: ['CL-A-020', 'CL-A-021'],
    evidenceIds: ['EV-A-017', 'EV-A-018', 'EV-A-019', 'EV-A-020'],
    sourceIds: ['SRC-A-013', 'SRC-A-014', 'SRC-A-015', 'SRC-A-016'],
  },
  {
    rank: 3,
    title: 'Matsvinnkvalitet i butikk/HORECA',
    track: 'B',
    role: 'Rask adoption-/fallback-kandidat',
    statuses: ['hypotese', 'needs-actor-validation'],
    whyNow:
      'Quality windows, kategori og rutineendring kan vaere lettere a teste enn fysisk prosessering hvis partnerdata finnes.',
    canSay:
      'Matsvinnkvalitet kan bli en lavterskel adoption-kandidat hvis baseline, kategori, tidsvindu og rutineendring dokumenteres.',
    cannotSay:
      'Ikke bruk maaltider reddet som effektbevis uten baseline, kontrafaktisk og driftsdata.',
    validationNeed: 'Matvett, Too Good To Go, Matsentralen, dagligvare/HORECA og offentlig kjokken.',
    stopSignal: 'Partner mangler baseline, kategori, tidsvindu, rutineendring eller kontrafaktisk.',
    nextAction: 'Teste om data finnes for et quality-window-kart og minimum pilotdesign.',
    claimIds: ['CL-B-022', 'CL-C-012'],
    evidenceIds: ['EV-B-020', 'EV-C-017'],
    sourceIds: ['SRC-B-027', 'SRC-C-018'],
  },
  {
    rank: 4,
    title: 'Okara/BSG som ren prosess-sidestroem',
    track: 'B',
    role: 'Teknisk B-kandidat med klare gates',
    statuses: ['benchmark', 'hypotese', 'needs-actor-validation'],
    whyNow:
      'Svenske benchmark gir konkrete designkrav for fukt, holdbarhet, mikrobiologi, stabilisering, logistikk og marked.',
    canSay:
      'Okara/BSG er konkrete benchmark og betingede kandidater etter ravare-, hygiene- og off-taker-gate.',
    cannotSay:
      'Ikke si at okara/BSG har norsk/nordisk volum, matgrade-status, Novel Food-avklaring eller pilotklarhet.',
    validationNeed: 'Mattilsynet/fagekspert, okara-/BSG-ravareeier og mulig off-taker.',
    stopSignal: 'Ravareeier, hygieneport, stabilisering eller kjoper kan ikke avklares.',
    nextAction: 'Kartlegg ravareeier, matgrad, holdbarhet og off-taker for ett avgrenset case.',
    claimIds: ['CL-B-014', 'CL-B-021'],
    evidenceIds: ['EV-B-018', 'EV-B-019'],
    sourceIds: ['SRC-B-024', 'SRC-B-025', 'SRC-B-026'],
  },
  {
    rank: 5,
    title: 'Markedsmakt, handelsskikk og governance',
    track: 'C',
    role: 'Gate for adoption og ekstern fortelling',
    statuses: ['internt-trygt', 'needs-actor-validation'],
    whyNow:
      'C-sporet forklarer hvorfor gode case ikke skalerer uten kjoper, dataeier, kontrakt og handhevbar governance.',
    canSay:
      'C bor brukes som gate pa tvers av A og B, ikke som et bredt separat policyspor na.',
    cannotSay:
      'Ikke hev kausal handhevingseffekt, innkjoepseffekt eller markedseffekt uten aktordata.',
    validationNeed: 'Dagligvaretilsyn/Konkurransetilsyn, innkjop, offentlige kjokken og relevante bransjeaktorer.',
    stopSignal: 'Ingen tydelig dataeier, kjoper eller styringsarena for valgt case.',
    nextAction: 'Legg C-gate inn i alle kandidatkort for lov, kjoper, data, drift og governance.',
    claimIds: ['CL-C-001', 'CL-C-002', 'CL-C-005', 'CL-C-006', 'CL-C-014', 'CL-C-015'],
    evidenceIds: ['EV-C-013', 'EV-C-014', 'EV-C-015', 'EV-C-016', 'EV-C-017'],
    sourceIds: ['SRC-C-018'],
  },
]

export const foodTgValidationSprint: FoodTgSprintItem[] = [
  {
    day: '1-2',
    work: 'EUDR/for-data primary-check',
    counterparties: 'Landbruksdirektoratet, Miljodirektoratet, SSB/Tolletaten',
    question: 'Kan vi formulere EUDR og varekoder trygt?',
    output: 'Metodenotat for EUDR-Norge, HS/SSB og trygge formuleringer.',
    status: ['needs-primary-check'],
  },
  {
    day: '2-4',
    work: 'A-spor actor-check',
    counterparties: 'Denofa, Skretting/Sjomat Norge, NMBU/Foods of Norway',
    question: 'Er alternative forproteiner roadmap-spor, FoU-benchmark eller senere kandidat?',
    output: 'A-spor beslutning: roadmap, benchmark, hypotese eller modningscase.',
    status: ['needs-actor-validation'],
  },
  {
    day: '3-6',
    work: 'B-spor go/no-go',
    counterparties: 'Mattilsynet/fagekspert, ravareeier, off-taker',
    question: 'Kan ren prosess-sidestroem modnes, eller skal den holdes som benchmark?',
    output: 'Gate-kort for okara/BSG: lov, hygiene, logistikk, kjoper og data.',
    status: ['benchmark', 'needs-actor-validation'],
  },
  {
    day: '5-8',
    work: 'Matsvinnkvalitet fallback/adoption',
    counterparties: 'Matvett, Too Good To Go, dagligvare/HORECA/offentlig kjokken',
    question: 'Finnes data, baseline og rutineendring som kan testes lett?',
    output: 'Quality-window-kart eller beslutning om kommunikasjonscase.',
    status: ['hypotese', 'needs-actor-validation'],
  },
  {
    day: '8-10',
    work: 'Beslutningslogg og scope-oppdatering',
    counterparties: 'Gabriel/Cathrine',
    question: 'Hva modnes, hva parkeres, og hva skal vente?',
    output: 'Oppdatert decision memo etter sprint, claim-status og stoppsignaler.',
    status: ['internt-trygt'],
  },
]

export const foodTgClaimBoard: FoodTgClaimCard[] = [
  {
    id: 'A-scope',
    track: 'A',
    title: 'Spor A er sterkt som strategisk scoping, ikke som substitusjonsbevis.',
    status: 'internt-trygt',
    useNow: 'Bruk som intern retning for for, import, sporbarhet og datakrav.',
    needs: 'Primary-check for EUDR/HS og actor-check for foraktorer.',
  },
  {
    id: 'A-feed-protein',
    track: 'A',
    title: 'Alternative forproteiner er et roadmap-spor hvis modenhet og kjoperkrav bekreftes.',
    status: 'hypotese',
    useNow: 'Formuler som mulighet med gates, ikke som pilotklart case.',
    needs: 'Kost, LCA, volum, regelverk, tilgjengelighet og kjoperkrav.',
  },
  {
    id: 'B-sidestreams',
    track: 'B',
    title: 'Rene prosess-sidestroemmer kan testes forst hvis hygiene, stabilisering og kjoper finnes.',
    status: 'benchmark',
    useNow: 'Bruk okara/BSG som teknisk benchmark og betinget kandidat.',
    needs: 'Norsk/nordisk volum, matgrad, Novel Food, holdbarhet og off-taker.',
  },
  {
    id: 'B-food-waste-quality',
    track: 'B',
    title: 'Matsvinnkvalitet kan vaere rask adoption-kandidat hvis partnerdata finnes.',
    status: 'hypotese',
    useNow: 'Hold som parallell fallback/adoption-kandidat.',
    needs: 'Baseline, kategori, tidsvindu, rutineendring og kontrafaktisk.',
  },
  {
    id: 'B-benchmarks',
    track: 'B',
    title: 'Marint restrastoff og nutrient loops er laering, ikke forste lettvekts-pilot.',
    status: 'benchmark',
    useNow: 'Bruk som benchmark for fraksjoner, hoyverdi, N/P/K og governance.',
    needs: 'Systemgrense, produktstatus, marked, massebalanse og sammenlignbare KPI-er.',
  },
  {
    id: 'C-gate',
    track: 'C',
    title: 'Ingen A/B-kandidat bor ga videre uten lov, kjoper, data, drift og governance.',
    status: 'internt-trygt',
    useNow: 'Bruk C som gate pa tvers av alle kandidatkort.',
    needs: 'Aktorbekreftelse og tydelig dataeier for hvert case.',
  },
]

export const foodTgStopSignals = [
  'EUDR-Norge eller varekodemetode kan ikke avklares raskt.',
  'Foraktordata kan ikke brukes eller siteres.',
  'Denofa eller Skretting brukes som bransjesnitt.',
  'Okara/BSG mangler ravareeier, hygieneport, stabilisering eller kjoper.',
  'Matsvinnkvalitet mangler baseline, kategori, tidsvindu, rutineendring eller kontrafaktisk.',
  'KPI-er mangler definisjon, ar, geografi, enhet, kilde, dataeier, frekvens eller systemgrense.',
]
