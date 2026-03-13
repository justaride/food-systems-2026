import type { Insight } from '../types'

export const insights: Insight[] = [
  {
    id: 'ins-01',
    title: 'Norsk selvforsyningsgrad under 50% for matvarer',
    type: 'funn',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Norges selvforsyningsgrad for matvarer ligger rundt 45%, noe som gjor landet sarbart for forstyrrelser i globale forsyningskjeder.',
    tags: ['selvforsyning', 'Norge'],
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/', note: '50 %-maal innen 2030' },
      { sourceId: 'src-31', label: 'NIBIO sjolvforsyningsgrad', url: 'nibio.no', note: 'Metodisk grunnlag for beredskapsdebatt' },
    ],
  },
  {
    id: 'ins-02',
    title: 'Tre dagligvarekjeder kontrollerer 96% av markedet',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'NorgesGruppen, Coop og REMA 1000 har tilsammen 96% av det norske dagligvaremarkedet, en av de hoyeste konsentrasjonene i verden.',
    tags: ['maktkonsentrasjon', 'dagligvare'],
    sources: [
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
      { sourceId: 'src-12', label: 'NOU 2011:4 Mat, makt og avmakt', url: 'https://www.regjeringen.no/no/dokumenter/nou-2011-4/id640128/', note: 'Grunnlagsdokument for markedskonsentrasjon' },
    ],
  },
  {
    id: 'ins-03',
    title: 'Nordisk matsikkerhetsstrategi mangler koordinering',
    type: 'analyse',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'De nordiske landene har individuelle matsikkerhetsstrategier men mangler en koordinert tilnarming til felles utfordringer i matforsyningskjeden.',
    tags: ['nordisk', 'matsikkerhet'],
    sources: [
      { sourceId: 'src-23', label: 'Stockholm Resilience Centre', url: 'https://www.stockholmresilience.org/', note: 'Nordisk matsystem — helse og baerekraft' },
    ],
  },
  {
    id: 'ins-04',
    title: 'Matsvinn i Norge: 390 000 tonn arlig',
    type: 'funn',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Norge kaster omtrent 390 000 tonn spiselig mat arlig, med storst svinn i husholdningene (58%) etterfulgt av industri og handel.',
    tags: ['matsvinn', 'Norge'],
    sources: [
      { sourceId: 'src-32', label: 'Matsvinn i Norge 2024', url: 'matvett.no', note: 'Ressurstap i hele verdikjeden' },
    ],
  },
  {
    id: 'ins-05',
    title: 'Ten Step Start v2.0 anvendt pa matsystemer',
    type: 'notat',
    source: '9. mars-motet',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Gjennomgang av hvordan Ten Step Start v2.0-metodikken kan tilpasses spesifikt til matsystemtransformasjon i nordisk kontekst.',
    tags: ['metodikk', 'ten-step'],
    sources: [
      { sourceId: 'src-8', label: 'TG Working Doc', note: 'Revidert 10-step start rammeverk' },
    ],
  },
  {
    id: 'ins-06',
    title: 'EU Farm to Fork-strategien som rammeverk',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'EUs Farm to Fork-strategi gir et rammeverk for baerekraftig matproduksjon som kan brukes som referanse for nordisk matsystemarbeid.',
    tags: ['EU', 'Farm to Fork'],
    sources: [
      { label: 'EU Farm to Fork Strategy', url: 'https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en', note: 'EUs rammeverkstrategi for baerekraftig mat' },
    ],
  },
  {
    id: 'ins-07',
    title: 'Gigamapping som metode for systemkartlegging',
    type: 'analyse',
    source: '9. mars-motet',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Gigamapping fra AHO/Systemorientert design kan brukes til a kartlegge kompleksiteten i nordiske matsystemer og identifisere intervensjonspunkter.',
    tags: ['metodikk', 'gigamapping', 'AHO'],
    sources: [
      { sourceId: 'src-5', label: 'Speaker 1 transkripsjon', note: 'Samtale om strategi og systemkartlegging' },
    ],
  },
  {
    id: 'ins-08',
    title: 'Biosirkel-modellen for sirkulaer matproduksjon',
    type: 'lenke',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Biosirkel-prosjektet demonstrerer en modell for sirkulaer matproduksjon som kobler avfall fra en sektor til ressurser i en annen.',
    tags: ['sirkulaer', 'Biosirkel'],
  },
  {
    id: 'ins-09',
    title: 'Regulatoriske forskjeller mellom nordiske land',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Betydelige forskjeller i matpolitikk og regulering mellom Norge, Sverige, Danmark og Finland skaper bade utfordringer og muligheter for nordisk samarbeid.',
    tags: ['regulering', 'nordisk'],
    sources: [
      { sourceId: 'src-25', label: 'Konkurrensverket livsmedel', url: 'https://www.konkurrensverket.se/publikationer/', note: 'Svensk regulering og markedsmakt' },
      { sourceId: 'src-24', label: 'Kilpailulaki § 4a', url: 'https://www.kkv.fi/en/', note: 'Finsk dominansterskel 30 %' },
    ],
  },
  {
    id: 'ins-10',
    title: 'Kaffeprosjektet som referansecase',
    type: 'notat',
    source: '9. mars-motet',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Kaffeprosjektet nevnt som relevant referanse for hvordan man kan kartlegge en spesifikk verdikjede pa tvers av nordiske land.',
    tags: ['referanse', 'verdikjede'],
  },
  {
    id: 'ins-11',
    title: 'Danmark bruker 62% av landarealet til jordbruk — hoyest i Norden',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Danmark bruker 62 % av landarealet til jordbruk, blant de hoyeste i Europa. Norge bruker bare 3 %. Dette forklarer Danmarks >300 % selvforsyning.',
    tags: ['danmark', 'arealbruk', 'primaerproduksjon'],
    sources: [
      { sourceId: 'src-55', label: 'Nordisk primaerproduksjon', note: 'Arealdata fra Eurostat og DST' },
    ],
  },
  {
    id: 'ins-12',
    title: 'Nordisk gardskonsolidering: 62% faerre bruk i Norge siden 1989',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Antall gardsbruk i Norge falt 62 % (99 400 i 1989 til 37 561 i 2023) med 2-3 % arlig nedgang i hele Norden. Danmark mest konsolidert (snitt 75 ha), Norge minst (26 ha).',
    tags: ['konsolidering', 'strukturendring', 'nordisk'],
    sources: [
      { sourceId: 'src-55', label: 'Nordisk primaerproduksjon', note: 'SSB, SCB, DST, Luke, Hagstofa' },
    ],
  },
  {
    id: 'ins-13',
    title: 'Nordisk foredlingsindustri: EUR 80 mrd, 260 000+ ansatte',
    type: 'kartlegging',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Naeringsindustrien i Norden har samlet omsetning pa ca. EUR 80 mrd og sysselsetter over 260 000 personer. Storste eller nest storste industrigren i hvert land.',
    tags: ['industri', 'sysselsetting', 'nordisk'],
    sources: [
      { sourceId: 'src-56', label: 'Nordisk foredlingsindustri', note: 'NHO Mat og Drikke, ETL, Livsmedelsforetagen' },
    ],
  },
  {
    id: 'ins-14',
    title: 'EUR 500M+ i lagerautomatisering i Norden (2021-2031)',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Nordiske dagligvarekjeder investerer EUR 500+ mill i lagerautomatisering: Axfood Kungsbacka EUR 265M, Kesko Onnela EUR 250M, Coop Sverige Eskilstuna EUR 146M. WITRON dominerer.',
    tags: ['logistikk', 'automatisering', 'investering'],
    sources: [
      { sourceId: 'src-57', label: 'Nordisk distribusjon og logistikk', note: 'Axfood, Kesko, Coop arsrapporter' },
    ],
  },
  {
    id: 'ins-15',
    title: '100% importavhengighet for fosfat og kalium i hele Norden',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Alle fem nordiske land er 100 % importavhengige for fosfat og kalium. EU-gruvedrift dekker bare 5-10 % av fosfatbehovet. Noekkelleverandorer (Russland, Hviterussland, Marokko) er geopolitisk ustabile.',
    tags: ['sarbarhet', 'gjodsel', 'matsikkerhet', 'importavhengighet'],
    sources: [
      { sourceId: 'src-58', label: 'Nordiske innsatsvarer', note: 'Yara, FAO, Eurostat' },
    ],
  },
  {
    id: 'ins-16',
    title: 'Nordisk antibiotikabruk: 10-15x lavere enn EU-snitt',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Norge og Island bruker 3-6 mg/kg biomasse veterinaer antibiotika vs. EU-snitt 73,9 mg/kg (2022). Viser at lav antibiotikabruk er forenlig med hoy produktivitet.',
    tags: ['dyrehelse', 'antibiotika', 'konkurransefortrinn'],
    sources: [
      { sourceId: 'src-58', label: 'Nordiske innsatsvarer', note: 'ESVAC 2022-2023' },
    ],
  },
  {
    id: 'ins-17',
    title: 'Danmarks biogass-lederskap: 160 anlegg, 40% av gassforbruket',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Danmark har 160 biogassanlegg som produserer 32 PJ arlig. Produksjonen er femdoblet siden 2013. Biogass dekker ~40 % av Danmarks gassforbruk (2022) med mal om 100 % gronn gass innen 2030.',
    tags: ['energi', 'biogass', 'sirkulaer', 'danmark'],
    sources: [
      { sourceId: 'src-60', label: 'Matsvinn og sirkulaer', note: 'Biogas Danmark, IEA Bioenergy' },
    ],
  },
  {
    id: 'ins-18',
    title: 'Nordisk matsvinn: 3,5-4 millioner tonn arlig',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'De fem nordiske landene kaster 3,5-4 mill tonn mat arlig. Danmark hoyest per capita (254 kg, drevet av stor foredlingsindustri), Norge lavest (73 kg). Norges matsvinnlov (2026) er forst i Norden.',
    tags: ['matsvinn', 'regulering', 'nordisk'],
    sources: [
      { sourceId: 'src-60', label: 'Matsvinn og sirkulaer', note: 'UNEP, Eurostat, Matvett, Naturvardsverket' },
    ],
  },
  {
    id: 'ins-19',
    title: 'Nordiske panteordninger: 87-93% returrate',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Alle fem land har verdensledende pante-/retursystemer med 87-93 % returrate. Danmark (93 %) og Norge (92,3 %) leder. Alle er bransjeeide non-profit-organisasjoner.',
    tags: ['sirkulaer', 'emballasje', 'gjenvinning', 'nordisk'],
    sources: [
      { sourceId: 'src-60', label: 'Matsvinn og sirkulaer', note: 'Infinitum, Pantamera, Dansk Retursystem, PALPA, Endurvinnslan' },
    ],
  },
  {
    id: 'ins-20',
    title: 'Nordisk sjoematregion: NOK 250+ mrd i samlet eksport',
    type: 'kartlegging',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'De fem nordiske landene pluss Faeroyene og Gronland eksporterer sjoemat for over NOK 250 mrd arlig — verdens mest konsentrerte sjoemathub.',
    tags: ['sjoemat', 'eksport', 'handel', 'nordisk'],
    sources: [
      { sourceId: 'src-61', label: 'Nordisk sjomatverdikjede', note: 'Sjomatradet, FAO FishStatJ' },
    ],
  },
  {
    id: 'ins-21',
    title: 'Okologisk matmarked: Danmark 11,6% vs. Norge 2,0%',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Danmark har verdens nest hoyeste okologiske markedsandel (11,6 % av matforbruk), mens Norge ligger pa bare 2,0 % — nesten seksdobbel forskjell som reflekterer ulike politikk- og distribusjonskulturer.',
    tags: ['okologisk', 'forbruk', 'danmark', 'norge'],
    sources: [
      { sourceId: 'src-62', label: 'Nordiske forbrukermonstre', note: 'Organic Denmark, Okologisk Norge' },
    ],
  },
  {
    id: 'ins-22',
    title: 'Norske matpriser 24% hoyere enn Sverige',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Norges matprisindeks (131, EU27=100) er 23,6 % over Sverige (106). Bare Island (146) er dyrere. Norske husholdningers matbudsjett okte 33 % pa tre ar (2021-2024).',
    tags: ['matpriser', 'inflasjon', 'forbruker', 'norge'],
    sources: [
      { sourceId: 'src-62', label: 'Nordiske forbrukermonstre', note: 'Eurostat prisniva, SIFO referansebudsjett' },
    ],
  },
  {
    id: 'ins-23',
    title: 'Grensehandel NO-SE: NOK 11,3 mrd (2025)',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Nordmenn brukte NOK 11,3 mrd pa grensehandel i Sverige (2025), hvorav mat/dagligvarer utgjorde NOK 4,7 mrd (43 %). Tilsvarer ca. 4-5 % av Norges totale dagligvaremarked.',
    tags: ['grensehandel', 'matpriser', 'norge', 'sverige'],
    sources: [
      { sourceId: 'src-43', label: 'SSB grensehandel', note: 'Oppdatert med 2025-tall fra verdikjede-kartlegging' },
      { sourceId: 'src-62', label: 'Nordiske forbrukermonstre' },
    ],
  },
  {
    id: 'ins-24',
    title: 'Sverige og Finland: gratis skolemaltider siden 1946/1948',
    type: 'kartlegging',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Finland (1948) og Sverige (1946) tilbyr universelle gratis skolemaltider. Sverige bruker ~SEK 7 mrd arlig. Norge og Danmark baserer seg fortsatt pa nistepakke. Lund-studie viser 3 % okt livsinntekt.',
    tags: ['skolemaltider', 'politikk', 'ernaering', 'sverige', 'finland'],
    sources: [
      { sourceId: 'src-59', label: 'Nordisk HoReCa', note: 'Livsmedelsverket, Lunds universitet' },
    ],
  },
  {
    id: 'ins-25',
    title: 'Kobenhavn: 84% okologisk mat i offentlige kjokken',
    type: 'funn',
    source: 'Verdikjede-kartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Kobenhavns kommune har oppnadd 84 % okologisk andel i offentlige kjokken — verdens hoyeste for en storby. Norges offentlige innkjop henger langt etter.',
    tags: ['okologisk', 'offentlige-innkjop', 'kobenhavn', 'benchmark'],
    sources: [
      { sourceId: 'src-59', label: 'Nordisk HoReCa', note: 'Kobenhavns Kommune, Ekomatcentrum' },
    ],
  },
  {
    id: 'ins-26',
    title: '14 norske mataktorer omsetter for over 800 mrd. NOK',
    type: 'funn',
    source: 'Bedriftskartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'De 14 storste norske matselskapene (dagligvare, foredling, sjomat, innsatsvarer) har samlet omsetning over 800 mrd. NOK (2024). Yara (~150 mrd), NorgesGruppen (118 mrd) og Orkla (70,7 mrd) er de tre storste.',
    tags: ['bedriftsdata', 'omsetning', 'Norge'],
    sources: [
      { sourceId: 'src-63', label: 'Norsk bedriftsdata', note: 'Basert paa arsrapporter 2024' },
    ],
  },
  {
    id: 'ins-27',
    title: 'BAMA-styret: Interlocking directorates mellom NG og REMA',
    type: 'funn',
    source: 'Bedriftskartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'NorgesGruppens CEO (Runar Hollevik) og REMA 1000s CEO (Ole Robert Reitan) sitter begge i BAMAs styre. NorgesGruppen eier 46% og REMA 20% av BAMA — til sammen 66% av Norges storste frukt/gront-grossist kontrollert av dagligvarekjedene.',
    tags: ['maktkonsentrasjon', 'eierskap', 'BAMA', 'interlocking-directorates'],
    sources: [
      { sourceId: 'src-63', label: 'Norsk bedriftsdata', note: 'Bronnoysundregistrene roller-API' },
    ],
  },
  {
    id: 'ins-28',
    title: 'Familiedynastier kontrollerer ~55% av norsk matomsetning',
    type: 'analyse',
    source: 'Bedriftskartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Fem familier dominerer norsk matindustri: Johannson (NorgesGruppen 74,4%), Reitan (REMA 100%), Hagen (Orkla 25,1%), Witzoe (SalMar 41,3%) og Fredriksen (Mowi 14,4%). Kooperativene (Coop, Nortura, Tine, Felleskjopet) representerer ~20%.',
    tags: ['eierskap', 'familiedynasti', 'maktkonsentrasjon'],
    sources: [
      { sourceId: 'src-63', label: 'Norsk bedriftsdata', note: 'Aksjonaerdata og arsrapporter' },
    ],
  },
  {
    id: 'ins-29',
    title: 'Yara: 2000+ patenter og 36,2% statlig eierskap',
    type: 'funn',
    source: 'Bedriftskartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Yara International er det eneste norske matsystemselskapet med direkte statlig eierskap (36,2%). Selskapet har over 2000 patenter innen gjodselteknologi, groen ammoniakk og katalysatorteknologi — storst IP-portefolje i norsk matsektor.',
    tags: ['yara', 'patenter', 'statlig-eierskap', 'IP'],
    sources: [
      { sourceId: 'src-63', label: 'Norsk bedriftsdata', note: 'Yara IR og patentdatabaser' },
    ],
  },
  {
    id: 'ins-30',
    title: 'Utenlandsk kontroll over 40% av norsk laksefôr',
    type: 'funn',
    source: 'Bedriftskartlegging',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Skretting (Nutreco/SHV Holdings, Nederland) kontrollerer ~40% av norsk laksefôrproduksjon. Sammen med Mowi Feed (~15%) utgjor de ~55% av markedet. Utenlandsk eierskap i en kritisk innsatsfaktor for Norges storste eksportnaering.',
    tags: ['fiskefor', 'utenlandsk-eierskap', 'sarbarhet', 'sjomat'],
    sources: [
      { sourceId: 'src-63', label: 'Norsk bedriftsdata', note: 'Skretting/Nutreco selskapsdata' },
      { sourceId: 'src-61', label: 'Nordisk sjomatverdikjede', note: 'Forprodusent-oversikt' },
    ],
  },
]
