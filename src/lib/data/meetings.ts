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
    summary: 'Oppstartsmote for Food Systems Transition Group. Definerte leveranser, arbeidsmetodikk og tidsplan. Besluttet at prosjektet er et forarbeid - ikke utlysning av initiativet, men forberedelse til utlysning. Hovedleveranse er en innsiktsrapport/whitepaper innen juni 2026. Diskuterte ogsa Circle City Life-arbeidspakker og kobling til EIB/Horizon Europe.',
    keyDecisions: [
      'Food Systems er et forprosjekt - forberede utlysning, ikke utlyse',
      'Leveranse: Innsiktsrapport/whitepaper med mulighetsstudie',
      'Team: Gabriel Freeman & Cathrine Barth',
      'Bruke avslatt NI-soknad (2024) som bakgrunnsmateriale',
      'Frist: Evaluering av nordisk merverdi i juni 2026',
      'Concept note skal vaere soknadsklar med partnere',
    ],
    actionItems: [
      'Gabriel: Jobbe med monitorering, transition indicators og landskapskartlegging',
      'Gabriel: Starte innsiktsanalyse og omgivelseskartlegging',
      'Martin: Kontakte Ina Simonsen (NHO Arktis)',
      'Jan Thomas og Julia: Gjennomga konsortsiumsdelen av soknaden',
      'Folge opp Benedikte sin e-post',
      'Kontakte Martha om koordinering og finansiering',
    ],
    keyInsights: [
      'Tre arbeidspakker for Circle City: samfunnsniva, systemniva, materialniva',
      'Food Systems fokusomrader: matavfall, emballasje, Horeca, deforestation-direktivet',
      'Tidligere arbeid pa fisk, laks og kaffe-verdikjeder som grunnlag',
      'EIB har ventet i fem ar pa samarbeid - stor mulighet',
      '80 personer pa workshop-liste fra Helsinki-initiativ',
      'Behov for grundig kartlegging for man bestemmer spesifikt fokus',
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
    summary: 'Cathrine presenterte sitt droftingsdokument om Transition Groups fra januar 2026. Diskuterte Ten Step Start v2.0-rammeverket, behov for reformatering til mer operativ modell, og hvordan dokumentere og male fremgang. Samtalen gikk inn pa nordisk matpolitikk, markedskonsentrasjon (Reitan/NorgesGruppen/Bama), verdikjeder, og sirkulaer biokonomi. Gabriel introduserte Power Law-analyse og cascading-konsepter fra Wageningen.',
    keyDecisions: [
      'Reformatere Ten Step Start til mer operativ versjon (v2.0)',
      'Bruke monitor-dashboard for a vise fremgang i prosessen',
      'Definere "why" og manifest for transition groups',
      'Lage samarbeidsavtaler med partnere for a sikre eierskap',
      'Branding-strategi: "Powered by" eller "Enabled by" NCH',
    ],
    actionItems: [
      'Planlegge droftingsmote med Cathrine (ide-tomming)',
      'Lage survey med 4-5 nokkelsporsmal for aktorkartlegging',
      'Hente apne data: selvforsyningsgrad, markedsaktorer per land',
      'Regulatorisk kartlegging - matpolitikk per nordisk land',
      'Kartlegge parallellprosesser i Norden',
      'Se pa Wageningen cascading-modellen for sirkulaer biomasse',
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
    ],
    sources: [
      { sourceId: 'src-5', label: 'Speaker 1 transkripsjon', note: 'Strategi, data, verdikjeder og nordisk merverdi' },
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
    summary: 'Arbeidsmote der Gabriel og Martin gikk gjennom tilgjengelige dokumenter for Food Systems-prosjektet. Fant den avslatte NI-soknaden fra 2024 og diskuterte hvordan bruke den som bakgrunnsmateriale. Martin forklarte konteksten: etter avslaget ble Food Systems lagt inn som en av fire transition groups i NCH 2025-soknaden. Leveransen er en whitepaper/mulighetsstudie, ikke et fullskala prosjekt.',
    keyDecisions: [
      'Bruke NI-soknaden fra 2024 som bakgrunnsmateriale - masse god tekst',
      'Starte med droftingsmote med Cathrine for ide-tomming',
      'Leveranse er whitepaper med mulighetsstudie, ikke fullskala prosjekt',
      'Scoping-prosess nodvendig for a spisse fokus tidlig',
    ],
    actionItems: [
      'Lese gjennom den avslatte NI-soknaden grundig',
      'Finne kaffeprosjektet til Einar/Jan Thomas som referanse',
      'Se pa Abe/AHO Nordic Food Gigamapping',
      'Hente Biosirkel-eksempler',
      'Kartlegge regulative forhold per nordisk land',
    ],
    keyInsights: [
      'Fire transition groups i NCH 2025: Corporate, Food Systems, Textile, Cities',
      'Ten Step Start er eksisterende rammeverk for TG-oppstart',
      'Food Desert Analysis er relevant vinkling for Norden pga import-avhengighet',
      'Verdikjede-tilnaerming: fra kaffebonne til waste - identifisere intervensjonspunkter',
      'Ma ga bredt ut forst, men raskt spisse fokus for a unnga "alt i alt = ingenting"',
    ],
    sources: [
      { sourceId: 'src-4', label: 'Speaker 1 transkripsjon', note: 'Dokumentgjennomgang og kontekst' },
      { sourceId: 'src-1', label: 'NI-soknaden (avslatt)', note: 'Gjenbruk tekst og analyse' },
      { sourceId: 'src-8', label: 'TG Working Doc', note: 'Ten Step Start rammeverk' },
    ],
  },
]
