export type CaseTrack = 'A' | 'B' | 'C'

export type CaseStatusWord =
  | 'deckklart internt'
  | 'deckklart internt med caveat'
  | 'needs-primary-check'
  | 'needs-actor-validation'
  | 'needs-data'
  | 'benchmark-kandidat'
  | 'benchmark-only'
  | 'watchlist'
  | 'parkert'

export type CaseKeyFigure = {
  label: string
  value: string
  source: string
}

export type CaseAnchor = {
  id: string
  title: string
  tracks: CaseTrack[]
  goNoGo: string
  statuses: CaseStatusWord[]
  maturity: 'kartlagt' | 'delvis' | 'radar'
  summary: string
  keyFigures: CaseKeyFigure[]
  blockers: string[]
  notSay: string[]
  nextActions: string[]
  docRefs: string[]
  /** Repo-relativ sti til den fulle case-avsjekken som surfaces på dybde-undersiden. */
  caseAvsjekk: string
}

export const CASESTATUS_UPDATED = '2026-06-12'

export const CASESTATUS_RULE =
  'Intern modenhetsstatus per caseanker, ikke ekstern godkjenning. Alle statusord følger mottaksloggen og claim-lock-tabellen. ' +
  'Tall merket «internt tallgrunnlag» er kontrollerte uttrekk fra offentlige kilder som re-trekkes autorisert før ekstern bruk.'

export const caseAnchors: CaseAnchor[] = [
  {
    id: 'kaffe-brasil',
    title: 'Kaffe / Brasil',
    tracks: ['A', 'C'],
    goNoGo: 'Go som import-/EUDR-case (kvantifisert); no-go som relasjonscase uten MOU-dokument.',
    statuses: ['deckklart internt med caveat', 'needs-actor-validation'],
    maturity: 'kartlagt',
    summary:
      'Verdikjeden Brasil til Norge er tallfestet med tolldata, og EUDR-konteksten er avklart: Brasil er «standard risk», ' +
      'kaffe er innlemmet i den norske EUDR-gjennomføringen, og CONAB Parque Cafeeiro er en operativ brasiliansk sporbarhetsplattform. ' +
      'Aktørlandskapet er kartlagt med kandidater (Fuglen, Nordic Approach, Norsk Kaffeinformasjon, Joh. Johannson/ICP, Gruten). ' +
      'Relasjonssporet (MOU) finnes ikke i offentlige kilder og avgjøres kun av intern dokumentask.',
    keyFigures: [
      { label: 'Brasil-andel av norsk råkaffeimport 2022–2025', value: '45–48 %', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06 (SRC-0906-011)' },
      { label: 'Import fra Brasil 2025 (HS 090111)', value: '15,6 mill. kg / 122,9 mUSD', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06' },
      { label: 'Prisutvikling per kg 2024 til 2025', value: '+65 %', source: 'avledet av Comtrade-serien; importverdi fra verden ~doblet' },
      { label: 'NKI-kryssverifikasjon', value: '2024-tall identisk med tolldata', source: 'NKI-tabell mot Comtrade 090111-aggregat' },
    ],
    blockers: ['MOU/avtaletekst med Brasil (kun intern dokumentask kan svare)', 'Aktørroller og bruksrett (etter vedtak)'],
    notSay: ['«Det finnes en Brasil-MOU om kaffe»', '«Brasil er lavrisiko under EUDR»', '«Kaffegrut-til-biogass er et norsk pilotcase»'],
    nextActions: ['Send DASK-0906-001/003 internt', 'Autorisert re-trekk av importserien før ekstern bruk'],
    docRefs: [
      'research/external/dro-0906/drr-0906-001-brasil-kaffe.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-01-kaffe-brasil-2026-06-12.md',
  },
  {
    id: 'kakao-elfenbenskysten',
    title: 'Kakao / Elfenbenskysten',
    tracks: ['C'],
    goNoGo: 'Go som EUDR-/sporbarhetskontekst med caveat; no-go som relasjonscase uten dokument; direkteimport-vinkel avskrevet.',
    statuses: ['deckklart internt med caveat', 'needs-primary-check'],
    maturity: 'kartlagt',
    summary:
      'EUDR-rammeverket er avklart (Côte d’Ivoire er «standard risk» med nasjonalt sporbarhetssystem og produsentkort), ' +
      'men direkteimport til Norden er motbevist for alle kakaokapitler 1801–1806 i 2024. Nordisk eksponering går via ' +
      'EU-prosessering og merkevarekjeder; Fazer er sterkeste nordiske aktørkandidat. Relasjonssporet (LEAD Ivory Coast) ' +
      'hviler kun på en intensjonsomtale og avgjøres av intern dokumentask.',
    keyFigures: [
      { label: 'Direkteimport CI til Norden 2024, alle kakaokapitler', value: 'neglisjerbar (største post: 36 t kakaosmør til Norge)', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06' },
      { label: 'Råbønner (HS 1801) CI til NO/SE/DK/FI', value: '0 kg', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06' },
      { label: 'EUDR-anvendelse', value: '30.12.2026 (store/mellomstore)', source: 'EU-kommisjonen via DRR-0906-002' },
    ],
    blockers: ['MOU/LOI med LEAD Ivory Coast (kun intern dokumentask)', 'EU-aggregat for indirekte eksponering (Eurostat Comext)'],
    notSay: ['«Nordiske land importerer kakao direkte fra Elfenbenskysten»', '«CI er high-risk under EUDR»', '«Det finnes en signert kakao-MOU»'],
    nextActions: ['Send DASK-0906-002 internt', 'Eurostat Comext-uttrekk for EU-omveien'],
    docRefs: [
      'research/external/dro-0906/drr-0906-002-elfenbenskysten-kakao-eudr.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-02-kakao-elfenbenskysten-2026-06-12.md',
  },
  {
    id: 'valio-finland',
    title: 'Valio / Finland (soyafri fôr-governance)',
    tracks: ['A'],
    goNoGo: 'Go som soyafri governance-case med grasbasert system; no-go for «importfritt fôr».',
    statuses: ['deckklart internt med caveat', 'needs-data'],
    maturity: 'kartlagt',
    summary:
      'Soyaforbudet på finske Valio-melkegårder (fra 1.3.2018) er dokumentert med primærkilder, sammen med governance-mekanismene ' +
      '(kvalitetsmanual, positivliste, gårdskontroller). «Importfritt fôr» er motbevist av Valios egne kilder, og den nasjonale ' +
      'rammen er nå tallfestet: selve soyaerstatningen (rapsmel) er en stabil storimport. Valios interne fôrkurv per råvare ' +
      'finnes ikke offentlig og krever aktørsvar.',
    keyFigures: [
      { label: 'Finsk rapsmelimport per år 2022–2024 (HS 230641)', value: '~216 000 tonn, stabilt', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06' },
      { label: 'Finsk soyamelimport per år (HS 2304)', value: '87 000–144 000 tonn', source: 'internt tallgrunnlag: Comtrade-uttrekk 12.06' },
      { label: 'Valios egen innenlandskhets-indikasjon', value: '76–88 % av tørrstoff', source: 'Valio 2020-artikkel via DRR-0906-003 (needs-data for metode)' },
      { label: 'Nasjonal selvforsyning, supplerende planteprotein til fôr', value: '15 %', source: 'Luke via DRR-0906-003' },
    ],
    blockers: ['Valios aggregerte fôrkurv 2022–2025 (kun Valio kan svare)', 'A-Rehu-rollen utover Startti (aktørvalidering)'],
    notSay: ['«Valio bruker importfritt fôr»', '«Valios fôr er 100 % finsk»', '«A-Rehu er Valios generelle fôrleverandør»'],
    nextActions: ['DASK-0906-004 / AASK-0906-003 etter vedtak'],
    docRefs: [
      'research/external/dro-0906/drr-0906-003-valio-importfritt-for-case.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-03-valio-finland-2026-06-12.md',
  },
  {
    id: 'distribusjon-adoption',
    title: 'Distribusjon / adoption-gate for norsk frukt og grønt',
    tracks: ['C'],
    goNoGo: 'Go som bred strukturell C-gate; no-go for aktørspesifikke anklager (marginer, blokkering).',
    statuses: ['deckklart internt', 'needs-actor-validation', 'needs-data'],
    maturity: 'kartlagt',
    summary:
      'Strukturen er dokumentert med tilsyns- og institusjonskilder: høykonsentrert dagligvareoligopol, vertikalt integrert ' +
      'frukt/grønt, og markedstilgang/distribusjon som dokumentert barriere for vertikal innendørs dyrking (SINTEF 2025). ' +
      'Avgjørende negativfunn: Menon 2024 fant ingen rapportert tilgangsnekt, og margindata finnes ikke offentlig — derfor føres ' +
      'caset som struktur, ikke anklage. Politikkvinduet er aktivt: Konkurransetilsynet overtok god handelsskikk-håndhevingen ' +
      '01.05.2026 med egne føringer fra NFD, og høringer om innkjøpsbetingelser pågår.',
    keyFigures: [
      { label: 'Norskandel frukt/grønt/bær/poteter inkl. industri 2025', value: '44 %', source: 'OFG/Grøntinnsikt via DRR-0906-005' },
      { label: 'Norskandel frukt', value: '4 %', source: 'OFG via DRR-0906-005' },
      { label: 'BAMA-skala', value: '>500 000 tonn/år; 37/63 norsk/import', source: 'BAMA egenrapportering via DRR-0906-005' },
      { label: 'Regulatorisk vindu', value: 'KT-håndheving fra 01.05.2026 + pågående høringer', source: 'SRC-0906-015' },
    ],
    blockers: ['Aktørdata om onboarding/vilkår (BAMA/Gartnerhallen, etter vedtak)', 'Produkt-/månedstall for CEA-relevante varer'],
    notSay: ['«BAMA blokkerer vertical farming»', '«Grossistmarginene er X %»', '«BAMA er juridisk dominerende»'],
    nextActions: ['Aktørvalidering etter vedtak', 'Følg høringsutfall om innkjøpsbetingelser'],
    docRefs: [
      'research/external/dro-0906/drr-0906-005-distribusjon-adoption-gate.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-04-distribusjon-adoption-2026-06-12.md',
  },
  {
    id: 'spillvarme',
    title: 'Spillvarme / drivhus / akvakultur',
    tracks: ['B'],
    goNoGo: 'Go for Hima som operativt internt case med datagap; Frövi som industriell benchmark; resten radar. No-go for nasjonalt TWh-claim.',
    statuses: ['deckklart internt med caveat', 'needs-primary-check', 'needs-data'],
    maturity: 'delvis',
    summary:
      'Green Mountain–Hima (Rjukan) er det sterkeste operative datasenter-til-mat-caset i Norden: i drift høsten 2025, testet ' +
      'til 1,75 MW, fase 2 vurderes til 8 MW. Frövi/Billerud er operativ industriell spillvarme-til-drivhus-benchmark. ' +
      'Wiig/Klepp har bekreftet Enova-prosjektside (4 MW initielt, 50–70 °C), men driftsstatus er udokumentert. ' +
      'Kviamarka og Varde er plan-/høringscase. NVE-kravet om kost-nytteanalyse for datasentre over 2 MW er strukturell driver.',
    keyFigures: [
      { label: 'Hima/Rjukan varmefase 1', value: '1,75 MW testet; mål 8 000 t ørret/år (mål, ikke dagens produksjon)', source: 'Green Mountain via DRR-0906-006' },
      { label: 'Frövi gjenbrukt industrivarme', value: '35 GWh/år; 100 000 m²; 8 000 t tomater/år', source: 'WA3RM via DRR-0906-006' },
      { label: 'Wiig/Green Horizon (plan)', value: '4 MW initielt; 50–70 °C; erstatter naturgass', source: 'Enova-prosjektside (SRC-0906-013)' },
    ],
    blockers: ['Hima driftsdata (GWh/år, temperatur, økonomi)', 'Wiig ferdigattest/driftsbevis (Klepp byggesak)', 'Varde §25-utfall (høring til 25.06.2026)'],
    notSay: ['«Wiig-anlegget er operativt»', '«Frövi er datasenterspillvarme»', '«Kviamarka har 492 GWh/år nyttiggjort varme»', 'Nasjonale TWh-tall uten kilde'],
    nextActions: ['Klepp byggesak via eInnsyn', 'Hima driftsdata via aktørask etter vedtak', 'Varde-oppfølging uke 27'],
    docRefs: [
      'research/external/dro-0906/drr-0906-006-spillvarme-green-mountain-hima.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-05-spillvarme-2026-06-12.md',
  },
  {
    id: 'fish-restrastoff',
    title: '100% Fish / marint restråstoff',
    tracks: ['B'],
    goNoGo: 'Go som designbenchmark med claim-lock; no-go som norsk pilotbevis eller bokstavelig «100 %».',
    statuses: ['benchmark-only', 'deckklart internt med caveat', 'needs-data'],
    maturity: 'kartlagt',
    summary:
      'Kjerneskillet «utnyttet vs. høyverdiutnyttet» er tallfestet på norsk side med SINTEF/FHF 2024: høy total utnyttelse, ' +
      'men lav human konsum-andel. Island brukes som designbenchmark for produktkaskade og clusterlogikk — bokstavelig ' +
      '«100 %» er svekket av Matís. Skottland-prisene (2019) kvantifiserer høyverdigevinsten: segregerte fraksjoner betales ' +
      '3–7 ganger bedre enn blandede. Islandsk nåtidsdata venter på ett manuelt tabelluttrekk.',
    keyFigures: [
      { label: 'Norsk total utnyttelsesgrad 2024', value: '89 % (976 000 av 1 094 000 tonn)', source: 'SINTEF/FHF 2024 via DRR-0906-007' },
      { label: 'Human konsum-andel av produktvolum', value: '~15 %', source: 'SINTEF/FHF 2024' },
      { label: 'Største enkeltgap', value: 'fritt blod fra laksefisk, 34 300 tonn', source: 'SINTEF/FHF 2024' },
      { label: 'Prisskille segregert vs. blandet (Skottland 2019)', value: '£250–520/t mot £62–173/t', source: 'ZWS/Enscape 2020 (SRC-0906-012)' },
    ],
    blockers: ['Statistics Iceland-uttrekk (manuell PxWeb-eksport, oppskrift i loggen)', 'Norsk fraksjons-/høyverdidata (SINTEF/FHF-uttrekk)'],
    notSay: ['«Island utnytter 100 % av fisken»', '«89 % utnyttelse betyr høyverdi»', '«100% Fish er en norsk pilot»'],
    nextActions: ['Manuell PxWeb-eksport av SJA09114', 'Fraksjonssammenligning Island/Norge'],
    docRefs: [
      'research/external/dro-0906/drr-0906-007-100-fish-iceland-ocean-cluster.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-06-fish-restrastoff-2026-06-12.md',
  },
  {
    id: 'skottland-polen',
    title: 'Skottland (benchmark) / Polen (radar)',
    tracks: ['B'],
    goNoGo: 'Skottland: go som benchmark-kandidat med aktualitetscaveat. Polen: watchlist bekreftet; parkeres som direkte case uten nye primærdata.',
    statuses: ['benchmark-kandidat', 'watchlist', 'needs-data'],
    maturity: 'delvis',
    summary:
      'Skottlands hovedkilde (ZWS «Characterising fish processing by-products») er fulltekstkontrollert — med viktig ' +
      'dateringskorreksjon: rapporten er fra mars 2020 med 2019-survey, republisert 2025. Struktur- og prislogikken er sterk ' +
      '(to prosessanlegg bærer nesten alt; 60 % av bedriftene vil utvikle høyverdi), men all bruk krever årstallscaveat. ' +
      'Polen har statistikk- og governancegrunnlag, men ingen sidestrømspilot med aktør, lokasjon, volum og output ble funnet.',
    keyFigures: [
      { label: 'Skotske biproduktvolum (estimat, 2019-survey)', value: '41 188 t akvakultur + 94 697 t villfisk', source: 'ZWS/Enscape 2020 (SRC-0906-012)' },
      { label: 'Input til added value-prosessorer', value: '179 640 t/år', source: 'ZWS/Enscape 2020' },
      { label: 'Polen-kill-test 12.06', value: 'ingen pilot med aktør+lokasjon+volum+output funnet', source: 'desk-research-logg kap. 7' },
    ],
    blockers: ['SBMT-datatilgang/lisens (IBioIC)', 'Polen full kill-test (GUS XLS, EMFAF-prosjektbase)'],
    notSay: ['«Skottland er et dokumentert Food TG-case»', '«ZWS-tallene beskriver dagens strømmer»', '«Polen er en stor sidestrømsmulighet»'],
    nextActions: ['SBMT-forespørsel etter vedtak', 'Polen full kill ved kapasitet'],
    docRefs: [
      'research/external/dro-0906/drr-0906-008-skottland-polen.md',
      'docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md',
    ],
    caseAvsjekk: 'docs/project/analysis/case-avsjekk/avsjekk-07-skottland-polen-2026-06-12.md',
  },
]
