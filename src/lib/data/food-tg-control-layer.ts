export type FoodTgControlStatus =
  | 'klar'
  | 'klar-med-forbehold'
  | 'krever-bekreftelse'
  | 'maa-harmoniseres'
  | 'hold-tilbake'
  | 'venter-minimumsvedtak'
  | 'ikke-startet'
  | 'benchmark'
  | 'hypotese'
  | 'pilotkandidat'
  | 'sekundaerspor'

export type FoodTgControlDocument = {
  id: string
  title: string
  kind: string
  status: FoodTgControlStatus
  path: string
  use: string
  blocks: string[]
}

export type FoodTgDecisionGate = {
  id: 'scope' | 'claim' | 'figure' | 'case' | 'source' | 'validation'
  title: string
  status: FoodTgControlStatus
  governingDocument: string
  mustBeTrue: string
  blocks: string
  nextAction: string
}

export type FoodTgCandidateCard = {
  id: 'A1' | 'A/B' | 'B1' | 'B2' | 'B3' | 'C-gate'
  title: string
  track: 'A' | 'A/B' | 'B' | 'B/C' | 'C'
  role: string
  status: FoodTgControlStatus
  claimIds: string[]
  evidenceIds: string[]
  sourceIds: string[]
  canSay: string
  cannotSay: string
  minimumData: string[]
  sourceGate: string
  actorGate: string
  cGate: string
  stopSignal: string
  nextAction: string
}

export type FoodTgReaderJourneySurface = {
  route: string
  title: string
  use: string
  readiness: FoodTgControlStatus
  figureNote: string
  risk: string
  nextAction: string
}

export const foodTgControlStatusLabels: Record<FoodTgControlStatus, string> = {
  klar: 'Klar',
  'klar-med-forbehold': 'Klar med forbehold',
  'krever-bekreftelse': 'Krever bekreftelse',
  'maa-harmoniseres': 'Må harmoniseres',
  'hold-tilbake': 'Hold tilbake',
  'venter-minimumsvedtak': 'Venter minimumsvedtak',
  'ikke-startet': 'Ikke startet',
  benchmark: 'Benchmark',
  hypotese: 'Hypotese',
  pilotkandidat: 'Pilotkandidat',
  sekundaerspor: 'Sekundærspor',
}

export function isExternallyValidatedFoodTgStatus(status: FoodTgControlStatus): boolean {
  void status
  return false
}

export const foodTgControlDocuments: FoodTgControlDocument[] = [
  {
    id: 'decision-pack-v01',
    title: 'Food TG decision pack v0.1',
    kind: 'Intern beslutningspakke',
    status: 'venter-minimumsvedtak',
    path: 'docs/project/mandates/food-tg-decision-pack-v0.1.md',
    use: 'Samler beslutningsgrunnlaget for om Food TG kan starte en begrenset sprint.',
    blocks: [
      'Stopper ekstern outreach uten minimumsvedtak og holder roadmap-språk tilbake før finans- og responsgrunnlag finnes.',
    ],
  },
  {
    id: 'insight-pack-outline-v03',
    title: 'Insight pack outline v0.3',
    kind: 'Workshop- og deckdisposisjon',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/insight-pack-outline-food-tg-v0.3.md',
    use: 'Gir trygg rekkefølge for innsikt, caveat og beslutningsspørsmål i intern gjennomgang.',
    blocks: ['Blokkerer at intern struktur brukes som ferdig publikasjonstekst uten claim- og kildeport.'],
  },
  {
    id: 'claim-lock-2026-05',
    title: 'Food TG claim lock table 2026-05',
    kind: 'Claimfilter',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md',
    use: 'Styrer hvilke claims som kan brukes internt, hvilke som trenger caveat, og hvilke som må holdes igjen.',
    blocks: ['Stopper faktastemme uten primærsjekk, aktørrespons eller dokumentert bruksrett.'],
  },
  {
    id: 'figure-model-note-audit-2026-05',
    title: 'Food TG figure and model note audit 2026-05',
    kind: 'Figur- og modellkontroll',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md',
    use: 'Kobler figurer, modeller og appflater til nødvendige fotnoter og begrensninger.',
    blocks: ['Blokkerer graf, Sankey og KPI som effektbevis uten systemgrense, note og kildeforklaring.'],
  },
  {
    id: 'case-to-claim-index-2026-05',
    title: 'Food TG case to claim index 2026-05',
    kind: 'Case- og claimindeks',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/food-tg-case-to-claim-index-2026-05.md',
    use: 'Skiller benchmark, hypotese, kandidat og effektbevis for cases og spor.',
    blocks: ['Stopper at benchmark brukes som pilotbevis før casevis råvare, eier, kjøper og systemgrense finnes.'],
  },
  {
    id: 'source-locator-risk-audit-2026-05',
    title: 'Food TG source locator risk audit 2026-05',
    kind: 'Kilde- og locatorport',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md',
    use: 'Låser high-risk tall, regelverk og actor-data til locator, metode og risikonote.',
    blocks: ['Stopper bruk av tall, varekoder, regelverk og actor-data uten locator og metodeforbehold.'],
  },
  {
    id: 'scope-decision-request-2026-05-21',
    title: 'Food TG scope decision request 2026-05-21',
    kind: 'Beslutningsforespørsel',
    status: 'venter-minimumsvedtak',
    path: 'docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md',
    use: 'Ber om enten smalt minimumsvedtak eller full scope-beslutning for sprint.',
    blocks: ['Stopper P1-outreach før skriftlig vedtak eller minimumsmandat er loggført.'],
  },
  {
    id: 'validation-sprint-log-2026-05',
    title: 'Food TG validation sprint log 2026-05',
    kind: 'Operativ responslogg',
    status: 'ikke-startet',
    path: 'docs/project/mandates/food-tg-validation-sprint-log-2026-05.md',
    use: 'Skal registrere aktørrespons, bruksrett, dato og claimkonsekvens etter vedtak.',
    blocks: ['Holdes tilbake før minimumsvedtak og blokkerer statusløft uten datert respons og bruksrett.'],
  },
  {
    id: 'baseline-freeze-2026-05-21',
    title: 'Food TG baseline freeze 2026-05-21',
    kind: 'Baselinefrys',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md',
    use: 'Fryser intern kilde- og databaseline slik at sprintfunn kan sammenlignes mot kjent utgangspunkt.',
    blocks: ['Stopper at nye data blandes inn uten revisjonslogg, dato og endringsgrunn.'],
  },
  {
    id: 'wageningen-method-transfer-2026-05-26',
    title: 'Wageningen/Moerman method transfer 2026-05-26',
    kind: 'Metodeoverforing',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/food-tg-wageningen-moerman-method-transfer-2026-05-26.md',
    use: 'Registrerer Wageningen/Moerman som internt gate- og scoringsspråk for Food TG, med åpne locator-, claim- og valideringsporter.',
    blocks: [
      'Stopper at metodeoverforingen brukes som utadvendt bekreftelse, pilotstatus eller KPI-effekt uten locator, claim-kobling og datert valideringsrespons.',
    ],
  },
]

export const foodTgDecisionGates: FoodTgDecisionGate[] = [
  {
    id: 'scope',
    title: 'Scope-port',
    status: 'venter-minimumsvedtak',
    governingDocument: 'docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md',
    mustBeTrue: 'Minimumsmandat eller scope-beslutning må være skriftlig loggført.',
    blocks: 'Stopper outreach, roadmap og pilotcommitment før beslutningen finnes.',
    nextAction: 'Avklar minimumsvedtak med JTO, Cathrine og Einar og legg beslutningen i beslutningsloggen.',
  },
  {
    id: 'claim',
    title: 'Claim-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md',
    mustBeTrue: 'Claim må ha status, caveat, kildekrav og lovlig bruksnivå.',
    blocks: 'Blokkerer ekstern faktastemme uten primærsjekk, locator og dokumentert bruksrett.',
    nextAction: 'Bruk claim-lock før tekst, deck og kandidatkort får offentlig språk.',
  },
  {
    id: 'figure',
    title: 'Figur-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md',
    mustBeTrue: 'Figur må ha note om datalag, dekning, systemgrense og hva den ikke beviser.',
    blocks: 'Stopper KPI, graf og Sankey uten figurnote eller uten tydelig metodegrense.',
    nextAction: 'Koble hver appflate og figur til note før den brukes i pack eller deck.',
  },
  {
    id: 'case',
    title: 'Case-port',
    status: 'klar-med-forbehold',
    governingDocument: 'docs/project/mandates/food-tg-case-to-claim-index-2026-05.md',
    mustBeTrue: 'Case må plasseres som benchmark, hypotese, kandidat eller effektbevis med begrunnelse.',
    blocks: 'Stopper at benchmark blir pilotbevis før råvare, eier, kjøper, baseline og systemgrense finnes.',
    nextAction: 'Hold hvert kandidatspor i riktig rolle og flytt det bare etter dokumentert sprintfunn.',
  },
  {
    id: 'source',
    title: 'Kilde-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md',
    mustBeTrue: 'High-risk tall, regelverk og actor-data må ha locator, metode og risikonote.',
    blocks: 'Stopper bruk av data uten kildeanker, år, definisjon eller bruksrett.',
    nextAction: 'Prioriter locator for EUDR, fôrkoder, actor-data og matsvinnbaseline.',
  },
  {
    id: 'validation',
    title: 'Validerings-port',
    status: 'ikke-startet',
    governingDocument: 'docs/project/mandates/food-tg-validation-sprint-log-2026-05.md',
    mustBeTrue: 'Respons må ha dato, aktørrolle, kilde, bruksrett og claimkonsekvens.',
    blocks: 'Holdes tilbake før minimumsvedtak og blokkerer statusløft uten komplett responsrad.',
    nextAction: 'Åpne sprintloggen først etter vedtak og loggfør hvert svar før språk løftes.',
  },
]

export const foodTgCandidateCards: FoodTgCandidateCard[] = [
  {
    id: 'A1',
    title: 'Alternative fôrproteiner',
    track: 'A',
    role: 'Roadmap- og FoU-spor',
    status: 'hypotese',
    claimIds: ['CL-A-001', 'CL-A-002', 'CL-A-020', 'CL-A-021'],
    evidenceIds: ['EV-A-017', 'EV-A-018', 'EV-A-019', 'EV-A-020'],
    sourceIds: ['SRC-A-013', 'SRC-A-014', 'SRC-A-015', 'SRC-A-016'],
    canSay: 'Alternative fôrproteiner er relevante som roadmap- og FoU-spor dersom modenhet, kost, LCA og kjøperkrav bekreftes.',
    cannotSay: 'Ikke si at teknologien erstatter soya eller fiskemel i skala, eller at volum, pris, LCA og råvaregrunnlag er avklart.',
    minimumData: [
      'modenhet',
      'kost',
      'LCA',
      'råvaregrunnlag',
      'regulatorisk vei',
      'kjøperkrav',
      'aktørdata',
    ],
    sourceGate: 'FoU-kilder, fôrkoder og EUDR-relatert sporbarhet må skilles fra kommersiell status og faktisk kjøpsvilje.',
    actorGate: 'Fôraktører, NMBU eller Foods of Norway må avklare databruk, modenhet og kjøperkrav.',
    cGate: 'Kjøper, lovlig bruk, drift og datarutine må være definert før case løftes.',
    stopSignal: 'Hold tilbake hvis fôraktører ikke kan validere modenhet eller datagrunnlag.',
    nextAction: 'Skille FoU-benchmark fra senere kandidat og be om aktørrespons på modenhet, data og kjøperkrav.',
  },
  {
    id: 'A/B',
    title: 'Insektprotein på godkjente sidestrømmer',
    track: 'A/B',
    role: 'Integrert substrat- og demand-side-hypotese',
    status: 'hypotese',
    claimIds: ['CL-A-021', 'CL-A-011', 'CL-B-009'],
    evidenceIds: ['EV-A-003', 'EV-A-013', 'EV-A-014', 'EV-A-015', 'EV-A-016'],
    sourceIds: ['SRC-A-003', 'SRC-REG-001', 'SRC-REG-002', 'SRC-REG-003', 'SRC-REG-004', 'SRC-REG-005', 'SRC-REG-006'],
    canSay: 'Insektprotein kan testes som A/B-hypotese hvis substrat, mattrygghet, regelverk, fôrbruk og kjøper avklares.',
    cannotSay: 'Ikke si at kjøkken-/matavfall, gjødsel/slam eller blandede avfallsstrømmer er lovlig substrat.',
    minimumData: ['substratliste', 'TSE/ABP', 'risiko', 'aktørkapasitet', 'fôrkjøper', 'sjømatkjøper'],
    sourceGate: 'Substrat, regelverk og risikostatus må dokumenteres med Mattilsynet/EU/EØS eller tilsvarende locator.',
    actorGate: 'Insektaktør og kjøper må bekrefte lovlig substrat, kapasitet, datadeling og bruksrett.',
    cGate: 'Lovlig substrat, kjøper, dataeier og driftsansvar må finnes før caset kan modnes.',
    stopSignal: 'Hold tilbake hvis substrat ikke er lovlig eller ikke dokumenterbart.',
    nextAction: 'Avklar konkret substratstrøm, regelverksvei, insektaktør og fôr- eller sjømatkjøper.',
  },
  {
    id: 'B1',
    title: 'Okara/BSG',
    track: 'B',
    role: 'Teknisk sidestrømskandidat',
    status: 'hypotese',
    claimIds: ['CL-B-014', 'CL-B-021', 'CL-B-009'],
    evidenceIds: ['EV-B-011', 'EV-B-018', 'EV-B-019'],
    sourceIds: ['SRC-B-024', 'SRC-B-025', 'SRC-B-026'],
    canSay: 'Okara og bryggerimask er konkrete benchmark og betingede kandidatstrømmer for teknisk scoping.',
    cannotSay: 'Ikke si at norsk volum, food-grade-kvalitet, holdbarhet eller off-taker finnes før data foreligger.',
    minimumData: [
      'tonn/år',
      'batch',
      'fukt',
      'temperatur',
      'mikrobiologi',
      'nåværende avsetning',
      'logistikk',
      'sluttbruk',
    ],
    sourceGate: 'Volum, kvalitet og nåværende avsetning må dokumenteres av råvareeier eller sporbar kilde.',
    actorGate: 'Råvareeier og mulig kjøper må bekrefte delbar data, hygiene og bruksrett.',
    cGate: 'Lovlig sluttbruk, stabilisering, logistikk og kjøper må avklares før sprintfunn kan løftes.',
    stopSignal: 'Hold tilbake hvis råvareeier, hygiene, stabilisering eller off-taker mangler.',
    nextAction: 'Velg én råvareeier og test volum, kvalitet, lovlig sluttbruk og kjøperinteresse.',
  },
  {
    id: 'B2',
    title: 'Matsvinnkvalitet',
    track: 'B/C',
    role: 'Adoption-kandidat',
    status: 'hypotese',
    claimIds: ['CL-B-022', 'CL-C-012', 'CL-C-014', 'CL-C-015'],
    evidenceIds: ['EV-B-002', 'EV-B-004', 'EV-B-014', 'EV-C-010', 'EV-C-026'],
    sourceIds: ['SRC-B-002', 'SRC-B-004', 'SRC-B-014', 'SRC-C-010', 'SRC-C-031'],
    canSay: 'Matsvinnkvalitet kan være en rask adoption-kandidat dersom baseline, kategori og rutineendring dokumenteres.',
    cannotSay: 'Ikke si at effekten er dokumentert for en konkret case uten baseline, kontrafaktisk og bruksrett.',
    minimumData: ['baseline', 'kategori', 'tidsvindu', 'rutineendring', 'destinasjon', 'kontrafaktisk', 'dataeier'],
    sourceGate: 'Baseline, kategori, år og definisjon må være sporbare og sammenlignbare.',
    actorGate: 'Matvett, TGTG, butikk, HORECA eller offentlig kjøkken må avklare data og deling.',
    cGate: 'Dataeier, driftseier, KPI og kontrafaktisk må finnes før effektspråk brukes.',
    stopSignal: 'Blokkerer effektclaim hvis baseline, kategori, tidsvindu eller dataeier mangler.',
    nextAction: 'Be partner om minimumsdata og vurder om caset skal modnes, parkeres eller beholdes som hypotese.',
  },
  {
    id: 'B3',
    title: 'Nutrient-loop benchmark',
    track: 'B/C',
    role: 'Sekundær benchmark for læring',
    status: 'sekundaerspor',
    claimIds: ['CL-B-023', 'CL-C-015'],
    evidenceIds: ['EV-B-008', 'EV-B-010', 'EV-B-016', 'EV-B-017', 'EV-B-024'],
    sourceIds: [
      'SRC-B-008',
      'SRC-B-010',
      'SRC-B-018',
      'SRC-B-019',
      'SRC-B-020',
      'SRC-B-021',
      'SRC-B-022',
      'SRC-B-023',
      'SRC-B-031',
    ],
    canSay: 'Nutrient-loop kan brukes som benchmark for hva Food TG kan lære uten å gjøre tung infrastruktur til første pilot.',
    cannotSay: 'Ikke si at nutrient-loop er første pilot eller at produktstatus, marked og systemgrense er avklart.',
    minimumData: ['produktstatus', 'N/P/K', 'regelverk', 'systemgrense', 'marked', 'aktør'],
    sourceGate: 'Produktstatus, næringsinnhold, regelverk og systemgrense må ha locator før benchmark brukes.',
    actorGate: 'Aktør og mulig marked må bekrefte hvilken læring som er relevant og delbar.',
    cGate: 'Marked, dataeier og governance må være tydelig før benchmark kan påvirke prioritering.',
    stopSignal: 'Hold tilbake hvis tung infrastruktur gjør pilot urealistisk i 2026-2027.',
    nextAction: 'Behandle som sekundær benchmark og bruk funn bare til læring og prioritering.',
  },
  {
    id: 'C-gate',
    title: 'Adoption og marked',
    track: 'C',
    role: 'Tverrgående port for A- og B-kandidater',
    status: 'krever-bekreftelse',
    claimIds: ['CL-C-002', 'CL-C-012', 'CL-C-014', 'CL-C-015'],
    evidenceIds: ['EV-C-016', 'EV-C-018', 'EV-C-019', 'EV-C-026'],
    sourceIds: ['SRC-C-002', 'SRC-C-012', 'SRC-C-014', 'SRC-C-015'],
    canSay: 'Adoption og marked må testes med kjøper, dataeier, kontrakt, rapporteringsvern, governance og KPI-minimum.',
    cannotSay: 'Ikke si at innkjøp alene skaper marked, eller at aktører er klare uten dialog og datagrunnlag.',
    minimumData: ['kjøper', 'dataeier', 'kontrakt', 'rapporteringsvern', 'governance', 'KPI-minimum'],
    sourceGate: 'Innkjøp, governance, rapportering og KPI må ha kildegrunnlag og avklart definisjon.',
    actorGate: 'Kjøper, operativ eier og datapart må bekrefte rolle, risiko, kontrakt og rapporteringsvern.',
    cGate: 'Dette er porten: uten kjøper, dataeier, kontrakt, governance og KPI-minimum skal kandidater holdes tilbake.',
    stopSignal: 'Hold tilbake hvis det ikke finnes tydelig styringsarena eller dataeier.',
    nextAction: 'Bruk C-gate som sjekkliste i alle sprintspørsmål og i go/no-go etter respons.',
  },
]

export const foodTgReaderJourneySurfaces: FoodTgReaderJourneySurface[] = [
  {
    route: '/mandat',
    title: 'Mandat',
    use: 'Intern mandatstatus, beslutningsporter og valideringslogikk.',
    readiness: 'venter-minimumsvedtak',
    figureNote: 'Scope er ikke endelig før beslutningslogg og sprintlogg er oppdatert.',
    risk: 'Kan leses som beslutning hvis forbehold og stoppsignal fjernes.',
    nextAction: 'Vis kontrollporter, kandidatkort og dokumentpakke samlet.',
  },
  {
    route: '/innsikt',
    title: 'Innsikt',
    use: 'Leserinngang til innsikter, claims og kildechips.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Readiness og kildechips styrer hvilket språk som kan brukes.',
    risk: 'Innsikt kan overtolkes uten claim-lock og kildeport.',
    nextAction: 'Koble hvert Food TG-claim til kontrollstatus og caveat.',
  },
  {
    route: '/forsyningskjede',
    title: 'Forsyningskjede',
    use: 'Datalag for primærflyt, import, relasjoner og returstrømmer.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Flere datalag har ulik dekning og må ikke blandes uten metode.',
    risk: 'Varekoder, relasjoner og actor-data kan bli lest som råvare- eller bruksbevis.',
    nextAction: 'Legg figurnoter på import, fôrdata og returstrømmer før deckbruk.',
  },
  {
    route: '/verdikjede',
    title: 'Verdikjede',
    use: 'Verdikjededekning, flow-skisse og kjente matsvinnpunkter.',
    readiness: 'benchmark',
    figureNote: 'Kjent matsvinn er ikke full nordisk total og har varierende systemgrenser.',
    risk: 'Flow kan bli lest som komplett markedskart uten dekning per land og sektor.',
    nextAction: 'Merk baseline, hull og systemgrense per claim som brukes.',
  },
  {
    route: '/sirkularitet',
    title: 'Sirkularitet',
    use: 'R-stige, KPI og case- eller gaplogikk.',
    readiness: 'klar-med-forbehold',
    figureNote: 'KPI og cases er styringsindikatorer, ikke effektbevis alene.',
    risk: 'Benchmark og gap kan bli solgt som gjennomført forbedring.',
    nextAction: 'Knytt hvert case til case-port, C-gate og målekrav.',
  },
  {
    route: '/graf',
    title: 'Graf',
    use: 'Navigasjon i koblinger, datakvalitet og Food TG-nabolag.',
    readiness: 'benchmark',
    figureNote: 'Graf viser koblinger og datastatus, ikke aktørforankring.',
    risk: 'Nodetetthet kan tolkes som evidensstyrke uten kilde- og claimfilter.',
    nextAction: 'Bruk grafen som locator og QA-verktøy, ikke som selvstendig bevis.',
  },
  {
    route: '/sammenligning',
    title: 'Sammenligning',
    use: 'Nordisk kontekst, landforskjeller og benchmark mot kjente indikatorer.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Rangering krever harmonisert definisjon, år og kildegrunnlag.',
    risk: 'Land kan sammenlignes feil hvis definisjon, år og datakilde avviker.',
    nextAction: 'Vis harmoniseringskrav og kildeår før sammenligning brukes i beslutningsspråk.',
  },
]
