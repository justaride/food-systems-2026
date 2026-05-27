import type { RLevel } from './r-ladder'

export type QuestionStatus = 'open' | 'in-research' | 'answered' | 'parked'

export type CircularityQuestion = {
  id: string
  number: number
  question: string
  context: string
  rLevels: RLevel[]
  valueChainSteps: string[]
  attemptedSolutions: string[]
  successCases: string[]
  failureCases: string[]
  barriers: string[]
  evidenceRefs: string[]
  isRealGap: 'yes' | 'no' | 'unclear'
  status: QuestionStatus
  tags: string[]
  note?: string
}

export const circularityQuestions: CircularityQuestion[] = [
  {
    id: 'q-alternativt-for',
    number: 1,
    question:
      'Kan nordisk matavfall og sideressurser dekke en vesentlig andel av fôrbehovet i oppdrett og husdyrhold — og hvorfor har det ikke skjedd ennå?',
    context:
      'Fiskefôr og husdyrfôr er det største enkelt-importtema i nordisk matsystem. Soya og fiskemel dominerer. ~70 % av fiskefôr går rett i fjorden ved åpne anlegg. JT: "fôrselskapet egentlig ikke vil, for det er så billig med soya."',
    rLevels: ['R6', 'R7'],
    valueChainSteps: ['processing', 'seafood', 'waste'],
    attemptedSolutions: [
      'Insektprotein (BSF): Enorm (DK, konkurs), Volare (FI, overlever)',
      'AX Framtidens Fisk (SE): 20-ingrediens formula fra sideressurser',
      'Mikroprotein (Solar Foods FI)',
      'Myse fra meieri til protein (TINE)',
      'Alger og muslinger som fôrtillegg',
    ],
    successCases: ['AX Foundation Framtidens Fisk', 'Volare', 'Solar Foods', 'TINE myse'],
    failureCases: ['Enorm Biofactory', 'Ynsect'],
    barriers: [
      'Prisgap: insektmel 2-10x dyrere enn soya/fiskemel',
      'EU-regulering på avfall som fôringrediens',
      'Fôrprodusenter (Skretting m.fl.) bytter ikke uten prisparitet',
      'Variabel avfallsstrøm = variabel kvalitet',
    ],
    evidenceRefs: ['circularity-loops.json:gap-insektprotein', 'SEC-MAT-TEK-02', 'arbeidsanalyse'],
    isRealGap: 'yes',
    status: 'in-research',
    tags: ['alternativt_for', 'oppdrett', 'soya-substitusjon'],
  },
  {
    id: 'q-svartvann',
    number: 2,
    question:
      'Hvor mye næring (N, P, K) går ubenyttet i nordisk svartvann — og kunne dette lukke gjødselimporten?',
    context:
      'JT: "det er faktisk en missing link". Fra husholdning og oppdrett går enorme næringsmengder til fjord eller renseanlegg uten gjenvinning. Helsingborg (2500 boliger) er eneste nordiske pilot i skala.',
    rLevels: ['R8'],
    valueChainSteps: ['household', 'waste', 'primary'],
    attemptedSolutions: [
      'Helsingborg H+ separat svartvann-system',
      'Fire-fem norske småpiloter (VS Asker m.fl.)',
      'CO2-fangst fra biogassanlegg',
    ],
    successCases: ['Helsingborg svartvann (Oceanhamnen)'],
    failureCases: [],
    barriers: [
      'Eksisterende avløpsinfrastruktur er sentralisert og kostbar å konvertere',
      'Energi til pumping over lange avstander',
      'Offentlig aksept og smitte-oppfatning',
      'Gjødsel-regulering tillater ikke ennå alle resirkulerte kilder',
    ],
    evidenceRefs: ['circularity-loops.json:gap-svartvann-naeringsgjenvinning', 'Mote JT-Gabriel 20.04.26'],
    isRealGap: 'yes',
    status: 'in-research',
    tags: ['regenerativt_landbruk', 'naeringsgjenvinning', 'missing-link'],
  },
  {
    id: 'q-matavfall-kvalitet',
    number: 3,
    question:
      'Hvordan kan vi hindre at matavfall (grønnposer) blir forurenset av mikroplast så det ikke kan brukes til fôr?',
    context:
      'JT: "så lenge man putter matavfallet i grønn pose, så kan det egentlig ikke brukes til fôr". Biorest etter biogass full av mikroplast. Papirpose-bytte pågår men biorest-problematikk består.',
    rLevels: ['R7', 'R9'],
    valueChainSteps: ['household', 'waste'],
    attemptedSolutions: [
      'Bytte fra grønn plastpose til papirpose (Oslo pågår)',
      'Industriell matavfall-innsamling separat fra husholdning',
      'Restaurant-dedikerte innsamlingslinjer (Matemark/drommefabrikken)',
    ],
    successCases: ['Dedikert restaurant-innsamling (vermi)'],
    failureCases: [],
    barriers: [
      'Husholdninger kan ikke lett skille mikroplast',
      'Biorest etter AD er fortsatt kontaminert',
      'Logistikk for segregert innsamling kostbar',
    ],
    evidenceRefs: ['Mote JT-Gabriel 20.04.26'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['matsvinn', 'mikroplast', 'biorest'],
  },
  {
    id: 'q-akademia-skala',
    number: 4,
    question:
      'Hvorfor kommersialiseres så få av de 71 masteroppgavene og 11 PhD-ene på alternativt fôr og sirkulær mat?',
    context:
      'NMBU har 10-årig prosjekt på gran som fôr. Solar Foods og Enifer er sjeldne suksesser. De fleste studier stopper ved doktorgrad.',
    rLevels: ['R6', 'R7'],
    valueChainSteps: ['processing', 'primary'],
    attemptedSolutions: [
      'Innovation Norway kommersialiseringsstøtte',
      'Business Finland agrifoodtech-program',
      'EU Horizon matsystem-calls',
    ],
    successCases: ['Solar Foods', 'Enifer'],
    failureCases: ['De fleste akademiske spor når ikke marked'],
    barriers: [
      'Fôrmarkedet venter på prisparitet',
      'Ingen skaleringsmekanisme mellom TRL 4 og TRL 7',
      'Svake industrisamarbeid tidlig i forskning',
    ],
    evidenceRefs: ['circularity-loops.json:gap-akademia-industri', 'theses.ts'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['akademia_skala', 'kommersialisering'],
  },
  {
    id: 'q-havremelk-okara',
    number: 5,
    question:
      'Hvorfor er havremelk-okara (30-50 kg fast avfall per liter) fortsatt ubrukt i Norden etter 10 års plantemelk-vekst?',
    context:
      'JT: "havremelk, ja det er så super det er så bra natur, nei det er enorme avfallsminner". Teknisk mulig gjenbruk som bakevareingrediens, men 3-timers prosesseringsvindu og logistikk stopper det.',
    rLevels: ['R6'],
    valueChainSteps: ['processing', 'waste'],
    attemptedSolutions: [
      'Oatly pilotsamarbeid internasjonalt',
      'Dole (US) okara-bakevarer',
      'Ingen nordisk kommersialisert kjede',
    ],
    successCases: [],
    failureCases: ['Havremelk-okara (ikke realisert)'],
    barriers: [
      '3-timers prosesseringsvindu',
      'Transport og logistikk krever industrisamarbeid',
      'Ingen lønnsom parallellinje per produsent',
    ],
    evidenceRefs: ['circularity-loops.json:gap-havremelk-okara', 'Mote JT-Gabriel 20.04.26'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['matsvinn', 'sideressurser', 'plantemelk'],
  },
  {
    id: 'q-lukkede-anlegg',
    number: 6,
    question:
      'Hvor mye fôr og næring kan fanges opp ved overgang til lukkede oppdrettsanlegg — og finnes det en nordisk businesscase?',
    context:
      'JT: "70 % av det der går rett ned i fjora". Argument for lukkede anlegg både av miljø- og ressursgrunner. Finnforel (FI) reiste $259M på RAS-modell.',
    rLevels: ['R7', 'R8'],
    valueChainSteps: ['seafood', 'primary', 'waste'],
    attemptedSolutions: [
      'Finnforel (FI) RAS',
      'Atlantic Sapphire (land-based)',
      'Norske RAS-piloter',
    ],
    successCases: ['Finnforel'],
    failureCases: ['Flere tidlige RAS-prosjekter i Norge'],
    barriers: [
      'Kapitaltung infrastruktur',
      'Fôreffektivitet og sykdomskontroll',
      'Regulatorisk uvisshet',
    ],
    evidenceRefs: ['circularity-loops.json:gap-oppdrettsslam', 'arbeidsanalyse'],
    isRealGap: 'unclear',
    status: 'open',
    tags: ['fiskeslam', 'lukkede_anlegg', 'oppdrett'],
  },
  {
    id: 'q-husholdningssvinn',
    number: 7,
    question:
      'Hvorfor stagnerer husholdningsmatsvinn-reduksjon (-5 %) mens retail har lykkes (-21 %) i Norge?',
    context:
      'EU WFD-mål: -30 %. 215 000 t husholdningssvinn/år. Adferds-endring vanskelig, "best før"-forvirring.',
    rLevels: ['R0', 'R1', 'R2'],
    valueChainSteps: ['household', 'retail'],
    attemptedSolutions: [
      'Datomerkingsreform EU',
      'UK WRAP-kampanjer (15-20 % reduksjon)',
      'Matsvinnloven (NO)',
      'Too Good To Go-appar',
    ],
    successCases: ['Too Good To Go', 'UK WRAP (utenfor Norden)'],
    failureCases: [],
    barriers: [
      'Adferd vanskelig å endre',
      '"Best før"-forvirring gir forkasting',
      'Ingen direkte økonomisk insentiv per husholdning',
    ],
    evidenceRefs: ['circularity-loops.json:gap-husholdningssvinn', 'matsvinn-2024'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['matsvinn', 'husholdning', 'adferdsendring'],
  },
  {
    id: 'q-horeca-reuse',
    number: 8,
    question:
      'Hvordan kan HORECA-takeaway og institusjonelle måltider overholde EU PPWR (10 % ombrukbart innen 2030)?',
    context:
      '~150 000 containere trengs i Norge. Vaskeinfrastruktur og forbrukeraksept er kjernebarrierer.',
    rLevels: ['R3'],
    valueChainSteps: ['horeca'],
    attemptedSolutions: [
      'Vytal (DE) ombruk-nettverk',
      'Kommunale piloter i Norden',
      'Offentlig innkjøpspakke i Sverige',
    ],
    successCases: ['Vytal DE (utenfor Norden)'],
    failureCases: [],
    barriers: [
      'Vaskeinfrastruktur',
      'Kjede-logistikk på tvers av aktører',
      'Forbrukeraksept og pant/gebyr-modell',
    ],
    evidenceRefs: ['circularity-loops.json:gap-horeca-reuse', 'SEC-MAT-03'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['horeca', 'ombruk', 'EU_PPWR'],
  },
  {
    id: 'q-regenerativt',
    number: 9,
    question:
      'Hvorfor ligger Norge på 4,7 % økologisk mens Sverige leder (18,4 % i Eurostat 2023; foreløpig 16,7 % i 2024) — og hva drev skiftet i Danmark?',
    context:
      'Regenerativ omstilling stanger mot investeringsrisiko hos bønder. Danmark innfører verdens første CO2-avgift på kjøttproduksjon 2030.',
    rLevels: ['R1'],
    valueChainSteps: ['primary'],
    attemptedSolutions: [
      'Agreena carbon credits (€500-2000/ha/år)',
      'Arla/Lantmannen pilotprogrammer',
      'DK CO2-avgift (2030)',
    ],
    successCases: ['SE (18,4 % økologisk areal i Eurostat 2023)', 'Agreena'],
    failureCases: [],
    barriers: [
      'Investeringsrisiko for bønder',
      'Ingen langsiktig overgangsstøtte',
      'Markedsbetaling svak for regenerativt',
    ],
    evidenceRefs: ['circularity-loops.json:gap-regenerativ-omstilling', 'SEC-MAT-PROD-02'],
    isRealGap: 'yes',
    status: 'open',
    tags: ['regenerativt_landbruk', 'CO2_avgift', 'policy'],
  },
  {
    id: 'q-kaffe',
    number: 10,
    question:
      'Hva er sirkulæranalysen på kaffe — en av Nordens mest importavhengige matvarer?',
    context:
      'Nytt spor åpnet på møtet 20.04.26. JT: "det er jo kaffe. vet ikke hva". Krever dokumentsamling for dashboard-arbeid kan starte.',
    rLevels: [],
    valueChainSteps: ['processing', 'retail', 'household', 'waste'],
    attemptedSolutions: [
      'Kaffegrut til biogass (lokale piloter)',
      'Kaffesum til matindustri (sjokolade, øl)',
      'Kompostering av grut',
    ],
    successCases: [],
    failureCases: [],
    barriers: [
      'Helt importavhengig — ingen nordisk primærproduksjon',
      'Kaffegrut-volym stort men fragmentert',
    ],
    evidenceRefs: ['Møte JT-Gabriel 20.04.26'],
    isRealGap: 'unclear',
    status: 'parked',
    tags: ['kaffe', 'importavhengighet', 'sideressurser'],
    note: 'Research-spor i tidlig fase. Dokumentsamling starter i research corpus for dashboard-arbeid planlegges.',
  },
]

export const questionsByStatus: Record<QuestionStatus, CircularityQuestion[]> = {
  open: circularityQuestions.filter((q) => q.status === 'open'),
  'in-research': circularityQuestions.filter((q) => q.status === 'in-research'),
  answered: circularityQuestions.filter((q) => q.status === 'answered'),
  parked: circularityQuestions.filter((q) => q.status === 'parked'),
}
