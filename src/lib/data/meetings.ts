import type { SourceRef } from '../types'

export type Meeting = {
  id: string
  date: string
  title: string
  participants: string[]
  source: string
  summary: string
  keyDecisions: string[]
  actionItems: string[]
  keyInsights: string[]
  sources?: SourceRef[]
}

export const meetings: Meeting[] = [
  {
    id: 'meeting-1',
    date: '9. mars 2026',
    title: 'Prosjektoppstart Food Systems TG',
    participants: ['Einar Kleppe Holthe', 'Martin Hagen', 'Gabriel Freeman'],
    source: '9, mars 2026 FOOD.md',
    summary: 'Oppstartsmote for Food Systems TG der mandat, leveranser og arbeidslogikk ble tydeliggjort. Food Systems skal bruke 10 Step Start som forprosjekt og levere innsiktsrapport/whitepaper, aktorkartlegging, metodekartlegging og soknadsklar concept note innen juni 2026. Teamet skal starte bredt med omgivelseskartlegging, tidligere arbeid, parallelle prosesser og nordisk merverdi, og deretter spisse fokusomrade. Samtalen koblet Food mot Circle City Life, EIB/Horizon Europe og eksisterende prosjekter som kaffe, fisk og Nordic Food gigamapping.',
    keyDecisions: [
      'Food Systems er et forprosjekt - forberede utlysning, ikke utlyse',
      'Leveranse: Innsiktsrapport/whitepaper med mulighetsstudie',
      'Team: Gabriel Freeman & Cathrine Barth',
      'Bruke avslatt NI-soknad (2024) som bakgrunnsmateriale',
      'Frist: Evaluering av nordisk merverdi i juni 2026',
      'Concept note skal vaere soknadsklar med partnere',
      'Kommunikasjon og ekstern posisjonering kommer etter at innsiktsgrunnlaget er pa plass',
      'Kartleggingen skal inkludere parallelle prosesser og relevante nordiske koblinger',
    ],
    actionItems: [
      'Gabriel: Jobbe med monitorering, transition indicators og landskapskartlegging',
      'Gabriel: Starte innsiktsanalyse og omgivelseskartlegging',
      'Martin: Kontakte Ina Simonsen (NHO Arktis)',
      'Mote med Norel: Folge opp dialogen dagen etter',
      'Mote med Kati: Forberede oppfolging mot 24. mars',
      'Jan Thomas og Julia: Gjennomga konsortsiumsdelen av soknaden',
      'Folge opp Benedikte sin e-post',
      'Kontakte Martha om koordinering og finansiering',
      'Sette av riggetid pa onsdag',
    ],
    keyInsights: [
      'Tre arbeidspakker for Circle City: samfunnsniva, systemniva, materialniva',
      'Food Systems fokusomrader: matavfall, emballasje, Horeca, deforestation-direktivet',
      'Tidligere arbeid pa fisk, laks og kaffe-verdikjeder som grunnlag',
      'EIB har ventet i fem ar pa samarbeid - stor mulighet',
      '80 personer pa workshop-liste fra Helsinki-initiativ',
      'Behov for grundig kartlegging for man bestemmer spesifikt fokus',
      'Parallelle prosesser i Norden ma kartlegges for a finne synergi og unnga dobbeltarbeid',
      'Kunnskapsgrunnlaget ma struktureres i database/plattform for videre bruk og skalering',
    ],
    sources: [
      { sourceId: 'src-3', label: '9. mars 2026 motenotat', note: 'Aksjonspunkter fra Einar/Martin' },
      { sourceId: 'src-1', label: 'NI-soknaden (avslatt)', note: 'Bakgrunnsmateriale for prosjektet' },
    ],
  },
  {
    id: 'meeting-2',
    date: 'Februar 2026',
    title: 'TG-metodikk og strategisk retning',
    participants: ['Cathrine Barth', 'Gabriel Freeman', 'Martin Hagen'],
    source: 'Speaker 1.md',
    summary: 'Strategimote om hvordan Transition Groups og Food Systems skal rigges metodisk. Cathrine droftet behovet for a revidere Ten Step Start til en mer operativ modell med dashboard, scorecard, tydelig nordisk merverdi og et klarere why. Samtalen gikk fra stakeholder mapping, PESTEL og surveydesign til branding, samarbeidsavtaler, data-tilgang, HORECA og barrierer i norsk matsektor. Gabriel koblet dette mot systemvisualisering, power law og behovet for a definere hva som faktisk er sirkulaert i matsystemet.',
    keyDecisions: [
      'Reformatere Ten Step Start til mer operativ versjon (v2.0)',
      'Bruke monitor-dashboard for a vise fremgang i prosessen',
      'Definere "why" og manifest for transition groups',
      'Lage samarbeidsavtaler med partnere for a sikre eierskap',
      'Branding-strategi: "Powered by" eller "Enabled by" NCH',
      'Kombinere apne data, aktorkartlegging og systemvisualisering i samme arbeidslop',
      'Starte med enkel survey for a fa inn nordiske aktorer og relevanssignaler',
    ],
    actionItems: [
      'Planlegge droftingsmote med Cathrine (ide-tomming)',
      'Lage survey med 4-5 nokkelsporsmal for aktorkartlegging',
      'Hente apne data: selvforsyningsgrad, markedsaktorer per land',
      'Regulatorisk kartlegging - matpolitikk per nordisk land',
      'Kartlegge parallellprosesser i Norden',
      'Se pa Wageningen cascading-modellen for sirkulaer biomasse',
      'Definere hva som skal telle som sirkularitet i Food Systems-sporet',
      'Undersoke HORECA og data-tilgang som mulig intervensjonspunkt',
    ],
    keyInsights: [
      'Matvaremarkedet er konsentrert: Reitan, NorgesGruppen, Bama dominerer',
      'Industrielle barrierer blokkerer vertical farming og aquakultur i Norge',
      'HORECA er en av raskest voksende industrier med lavest utdanning - mulighet for sirkulaer intervensjon',
      'Lokalmat star for 13% av matproduksjonen, HORECA for 77%',
      'Matdata finnes (pga matsikkerhet) men er ikke tilgjengelig pga konkurransehensyn',
      'Cascading fra Wageningen: Norge prioriterer kompost/fjernvarme fremfor sirkulaer innovasjon',
      'Power Law-analyse: a bryte opp markedsaktorer gir bare temporary perturbation - ma endre reglene',
      'Selvforsyningsgrad Norge: 98% melk, men import-avhengighet pa mange andre kategorier',
      'Transition Groups trenger tydeligere styringsmekanismer, scorecard og arbeidsavtaler for ikke a renne ut i sanden',
      'Det finnes et mulig nordisk monitor-spor som kan oppdateres lopende med fakta og indikatorer',
    ],
    sources: [
      { sourceId: 'src-4', label: 'Speaker 1 strategitranskripsjon', note: 'Strategi, data, verdikjeder og nordisk merverdi' },
      { sourceId: 'src-7', label: 'Cathrines TG-drofting', note: 'Metodikk, governance og branding' },
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf', note: 'Markedskonsentrasjon og triopol' },
    ],
  },
  {
    id: 'meeting-3',
    date: 'Februar 2026',
    title: 'Oppstart og dokumentgjennomgang',
    participants: ['Gabriel Freeman', 'Martin Hagen'],
    source: 'Speaker 1 (1).md',
    summary: 'Arbeidsmote om konkret oppstart av Food Systems-arbeidet. Gabriel og Martin gikk gjennom tilgjengelige soknader, transkripsjoner og bakgrunnsdokumenter for a finne hva som faktisk skal brukes videre. De avklarte at leveransen i juni er whitepaper/mulighetsstudie og ikke fullskala prosjekt, at NI-soknaden er primar bakgrunn, og at arbeidet ma begynne bredt men spisses raskt. Samtalen berorte ogsa food desert-analyse, eiendomslogikk i dagligvare, kaffeprosjektet som verdikjedereferanse og power law som analytisk spor.',
    keyDecisions: [
      'Bruke NI-soknaden fra 2024 som bakgrunnsmateriale - masse god tekst',
      'Starte med droftingsmote med Cathrine for ide-tomming',
      'Leveranse er whitepaper med mulighetsstudie, ikke fullskala prosjekt',
      'Scoping-prosess nodvendig for a spisse fokus tidlig',
      'Bruke transkripsjoner og eksisterende interne dokumenter som arbeidsunderlag, ikke bare ferdige soknader',
      'Food Desert Analysis og eiendomsstruktur er lovende spor for videre analyse',
    ],
    actionItems: [
      'Lese gjennom den avslatte NI-soknaden grundig',
      'Finne svarbrev/avslag fra Nordic Innovation',
      'Finne kaffeprosjektet til Einar/Jan Thomas som referanse',
      'Se pa Abe/AHO Nordic Food Gigamapping',
      'Hente Biosirkel-eksempler',
      'Kartlegge regulative forhold per nordisk land',
      'Samle soknad, transkripsjon og notater i felles arbeidsflate',
    ],
    keyInsights: [
      'Fire transition groups i NCH 2025: Corporate, Food Systems, Textile, Cities',
      'Ten Step Start er eksisterende rammeverk for TG-oppstart',
      'Food Desert Analysis er relevant vinkling for Norden pga import-avhengighet',
      'Verdikjede-tilnaerming: fra kaffebonne til waste - identifisere intervensjonspunkter',
      'Ma ga bredt ut forst, men raskt spisse fokus for a unnga "alt i alt = ingenting"',
      'Eiendomsstrategi i dagligvare kan vare en viktig forklaring pa marginpress og markedskonsentrasjon',
      'Kaffeprosjektet er metodisk nyttig som verdikjedeeksempel, ikke bare som fagreferanse',
    ],
    sources: [
      { sourceId: 'src-5', label: 'Speaker 1 dokumentgjennomgang', note: 'Dokumentgjennomgang og kontekst' },
      { sourceId: 'src-1', label: 'NI-soknaden (avslatt)', note: 'Gjenbruk tekst og analyse' },
      { sourceId: 'src-8', label: 'TG Working Doc', note: 'Ten Step Start rammeverk' },
    ],
  },
  {
    id: 'meeting-4',
    date: '16. mars 2026',
    title: 'Strategisk ledergruppe Marked — roller, leveranser og nordisk retning',
    participants: [
      'Einar Kleppe Holthe',
      'Jan Thomas Odegard',
      'Cathrine Barth',
      'Thea Martinsen',
      'Martin Hagen',
      'Gabriel Freeman',
    ],
    source: 'Strategisk ledergruppe Marked 16 mars 2026.md',
    summary: 'Strategisk ledergruppemote der roller, leveranseformat og arbeidsoppsett ble avklart for Food Systems og Cities. Cathrine er fagleder Food, Gabriel bygger data/plattform og Jan Thomas leder Cities; arbeidet skal forst samle tidligere arbeid, aktorer, metodikk og nordiske datapunkter for man spisser tema. Leveransen i slutten av juni er en liten rapport eller mini-whitepaper pa rundt 20 sider pluss presentasjon, og 250k-fasen skal brukes til a modne grunnlag for en 2,5M-soknad over tre ar. Motet tok ogsa opp sirkularitetsdefinisjon, Notion/database-oppsett, aktorkartlegging, mikro-survey, medie-API-er og Gabriels kartdata om butikknett, food deserts og saarbarhet.',
    keyDecisions: [
      'Roller avklart: Cathrine = fagleder Food, Gabriel = data/plattform, Jan Thomas = prosjektleder Cities',
      'Martin og Thea er stotteapparat, ikke operative i Food',
      'Ten Step Start v2.0 skal gjennomgas og revideres for videre arbeid',
      'Plattform: Notion + Gabriels system med kommunikasjon mellom dem',
      'Leveranse: 20-siders mini-whitepaper + presentasjon til lanseringsevent i juni',
      '250k-fase skal forberede soknad pa 2,5M for 3-arig prosjekt',
      'Ingen endelig temaspissing for kartlegging av tidligere arbeid, aktorer, metodikk og nordiske data er pa plass',
      'Aktorkartlegging skal starte bredt for man velger hvem som skal inn i dybdeintervjuer',
    ],
    actionItems: [
      'Gabriel: Utvide onsdagsmote (kl 11-12) for Food/Cities-metodikk back-to-back med Cities-mote kl 10',
      'Gabriel: Fortsette aktorkartlegging — hvem snakker om mat i nordiske land',
      'Gabriel: Sette opp liste over API-abonnementer for medieanalyse → Einar forbereder kostnadsestimat',
      'Gabriel/Cathrine: Lage 3-4 nokkelsporsmal for enkel survey som kan berike aktorkartleggingen',
      'Cathrine: Sende GEO-monitor til Gabriel for monitoreringsarbeid',
      'Cathrine: Drofte Ten Step Start v2.0 med teamet — spesielt sirkularitetskobling',
      'Alle: Sende linker og referanser til Gabriel (interne prosjekter, rapporter)',
      'Hente inn Rethink Food-kontakter (Danmark/NRU-kluster)',
      'Gabriel: Fortsette oppsett av dynamisk database/rapportstruktur for videre skalering',
    ],
    keyInsights: [
      'Food og Cities henger tett sammen — mat i by-kontekst, tverrsektorielt',
      'Sirkularitetsdimensjonen i Food ma defineres tydeligere (ressursknapphet, flyktighet)',
      'Politikk/regulering/beredskap er svaert relevant na — tusen utredninger pagar',
      'Nordisk dimensjon styrket: nordiske statsministre + Canada-initiativ gjor nordisk samarbeid mer aktuelt',
      'Selskapsstruktur-kartlegging gjennomforbart pga god datainnsikt i alle nordiske land',
      'Eiendomsmodellen i dagligvare: kjeder leier av seg selv til hoy pris → "fiktivt kapitaltap" som driver matpriser',
      'Gabriels kartdata (food desert, butikktetthet, akvakultur) godt mottatt — inspirerer til nordisk granularitet',
      'Notion + database-oppsettet gir grunnlag for levende rapportering fremfor statiske leveranser',
      'Mikro-survey og dybdeintervjuer er tenkt som komplementare grep i aktorkartleggingen',
    ],
    sources: [
      { sourceId: 'src-100', label: 'Strategisk ledergruppe transkripsjon', note: 'Primarunderlag fra mote 16. mars 2026' },
      { sourceId: 'src-71', label: 'Research Focus Report', note: 'Destillering av 27+ forskningstraader fra motet' },
    ],
  },
]
