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
  {
    id: 'ins-31',
    title: 'Norge har Europas hoeyeste dagligvare-HHI (~3400)',
    type: 'analyse',
    source: 'Kryssegment-analyse',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Kryssegment-analysen estimerer Norges dagligvare-HHI til ~3400 — hoeyest i Europa og i Norden. Finland foelger med ~3200 (duopol), Danmark lavest (~1800). Konsentrasjonen er strukturell og har vaert dokumentert siden 2005.',
    tags: ['maktkonsentrasjon', 'HHI', 'nordisk', 'dagligvare'],
    sources: [
      { sourceId: 'src-64', label: 'Kryssegment verdikjedeanalyse', note: 'HHI-tilnaerming basert paa VK-001 til VK-009' },
      { sourceId: 'src-66', label: 'Nordic Food Markets 2005', note: 'Historisk HHI opp til 3100' },
    ],
  },
  {
    id: 'ins-32',
    title: 'Syv kritiske flaskehalser i nordisk matforsyning',
    type: 'analyse',
    source: 'Kryssegment-analyse',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Identifisert 7 kritiske flaskehalser: (1) Yara Porsgrunn — eneste nordiske nitrogengjoedselfabrikk, (2) BAMA — 70% av norsk frukt/groent, (3) Tre utenlandskeide fiskeforselskaper, (4) Denofa — eneste soyaimportoer, (5) Oestlandet lagerkonsentrasjon, (6) Kooperativ foredlingsmonopol, (7) Digital infrastruktur (kjedeeide kundeprogrammer).',
    tags: ['flaskehalser', 'sarbarhet', 'infrastruktur', 'systemrisiko'],
    sources: [
      { sourceId: 'src-64', label: 'Kryssegment verdikjedeanalyse' },
    ],
  },
  {
    id: 'ins-33',
    title: 'Selvforsyningsgrad kollapset: 41,6% til 34,9% paa ett aar',
    type: 'funn',
    source: 'Beredskapskilder',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Norges forkorrigerte selvforsyningsgrad falt fra 41,6% til 34,9% mellom 2023 og 2024 — et dramatisk fall mot det politiske maalet paa 50%. Kjottimport oekte 45%. Finland har 8,5 maaneders kornlager; Norge har null statlige matlagre.',
    tags: ['selvforsyning', 'beredskap', 'matsikkerhet', 'norge'],
    sources: [
      { sourceId: 'src-67', label: 'Bransje-statistikk-beredskap', note: 'NIBIO, SSB, NESA/HVK' },
    ],
  },
  {
    id: 'ins-34',
    title: 'Prisjeger-vedtaket: NOK 4,9 mrd for ulovlig prisinformasjon',
    type: 'funn',
    source: 'Konkurransetilsynet',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Konkurransetilsynet ila overtredelsesgebyr paa 4,9 mrd NOK til NorgesGruppen, Coop og REMA for ulovlig informasjonsutveksling gjennom prisjegere (2011-2018). Historiens stoerste norske konkurransesak. Dokumenterer at priskonkurransen var svekket i en aarrekke.',
    tags: ['prisjeger', 'konkurranserett', 'dagligvare', 'vedtak'],
    sources: [
      { sourceId: 'src-66', label: 'Konkurransetilsyn-konsulent', note: 'Vedtak 2024' },
      { sourceId: 'src-42', label: 'Prisjeger-saken' },
    ],
  },
  {
    id: 'ins-35',
    title: 'Bestiller-bias: Statlige rapporter finner svak konkurranse, bransjen finner det motsatte',
    type: 'analyse',
    source: 'Konkurransetilsynet/konsulenter',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Systematisk moenster i konsulentrapporter: Statlig bestilte (SOA 2023, KT-rapporter) finner hoeye marginer og svak konkurranse. Bransjebestilte (Oslo Economics for NorgesGruppen, Menon for Virke) finner at konkurransen fungerer. Bestiller-identitet korrelerer sterkt med konklusjon.',
    tags: ['bias', 'konsulentrapporter', 'metodikk', 'dagligvare'],
    sources: [
      { sourceId: 'src-66', label: 'Konkurransetilsyn-konsulent', note: 'Systematisk gjennomgang av 12 kilder' },
    ],
  },
  {
    id: 'ins-36',
    title: 'NOU 2013:6 definerte portvoktermakt — grunnlaget for dagens regulering',
    type: 'kartlegging',
    source: 'NOU/stortingsdokumenter',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Dagligvarelovutvalget (Hjelmeng) definerte portvoktermakt som makten til aa avgjore om andre faar bringe sitt produkt til markedet. Utredningen la grunnlaget for lov om god handelsskikk (2020), Dagligvaretilsynet og markedsetterforskning (2025). Tre parallelle regulatoriske spor: handelsskikk, konkurranserett og markedsetterforskning.',
    tags: ['portvoktermakt', 'regulering', 'NOU', 'handelsskikk'],
    sources: [
      { sourceId: 'src-65', label: 'NOU-stortingsdok-juridisk', note: '10 primaerkilder dokumentert' },
    ],
  },
  {
    id: 'ins-37',
    title: '1 av 12 norske husholdninger viser tegn til matfattigdom',
    type: 'funn',
    source: 'SIFO/OsloMet',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'SIFOs Dyrtid 4-rapport dokumenterer at 1 av 12 norske husholdninger hopper over maaltider, bruker matbanker eller reduserer matinntak grunnet oekonomi. Matkostnadene oekte 30% fra 2021 til 2025 for en referansefamilie. Matfattigdom er ikke lenger et marginalt fenomen i Norge.',
    tags: ['matfattigdom', 'forbruker', 'ulikhet', 'SIFO'],
    sources: [
      { sourceId: 'src-68', label: 'Akademia dyp research', note: 'SIFO Dyrtid 4 og referansebudsjettet 2025' },
    ],
  },
  {
    id: 'ins-38',
    title: 'Biogass-gap oppdatert: Norge 11,6x under Danmark (0,7 vs 8 TWh)',
    type: 'funn',
    source: 'Sirkularitet-research',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Oppdatert analyse viser gapet er 11,6x (ikke 9,7x som i kryssanalysen). Danmark: 8 TWh, 160 anlegg, 37,3% av gassforbruk. Norge: 0,7 TWh, 40 anlegg. Hovedforklaring: 20-aars forutsigbar feed-in-premium i Danmark vs kortsiktige ordninger i Norge. Potensial: 5,5-11 TWh med 100-160 nye anlegg og 15-25 mrd NOK investering.',
    tags: ['biogass', 'sirkulaer', 'danmark', 'norge', 'energi'],
    sources: [
      { sourceId: 'src-70', label: 'Sirkularitet dyp research', note: 'Biogas Danmark, Biogass Norge, Enova' },
    ],
  },
  {
    id: 'ins-39',
    title: 'IPES-Food: 8 lock-ins holder matsystemer fast i uholdbar bane',
    type: 'analyse',
    source: 'Tenketanker/NGO',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'IPES-Food identifiserer 8 lock-ins som hindrer matsystemtransformasjon: (1) path dependency i infrastruktur, (2) eksportorientering, (3) maktkonsentrasjon, (4) silo-tenkning i politikk, (5) kortsiktig oekonomisk logikk, (6) maaltall som premierer volum, (7) forventning om billig mat, (8) mangel paa alternativ kunnskap.',
    tags: ['lock-in', 'systemtransformasjon', 'IPES-Food', 'politikk'],
    sources: [
      { sourceId: 'src-69', label: 'Tenketanker-NGO', note: 'IPES-Food: From Uniformity to Diversity (2016) og Too Big to Feed (2017)' },
    ],
  },
  {
    id: 'ins-40',
    title: 'DNVA: Norge mangler nasjonal matpolitikk — 18 anbefalinger',
    type: 'funn',
    source: 'Tenketanker/NGO',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Det Norske Videnskaps-Akademi (DNVA) konkluderer at Norge mangler en samlet nasjonal matpolitikk. 18 anbefalinger inkluderer: nasjonal matstrategi, samordning mellom departementer, styrket beredskap, oekt selvforsyning. Matsystemutvalget (Hoeie) skal levere NOU innen november 2026.',
    tags: ['matpolitikk', 'DNVA', 'strategi', 'matsystemutvalget'],
    sources: [
      { sourceId: 'src-69', label: 'Tenketanker-NGO', note: 'DNVA-rapporten og Matsystemutvalget' },
    ],
  },
  {
    id: 'ins-41',
    title: 'Matsvinnloven 2026: Nordens foerste obligatoriske matsvinnsregulering',
    type: 'kartlegging',
    source: 'Sirkularitet-research',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Norges matsvinnlov (vedtatt juni 2025, ikraft 2026) innfoerer aktsomhetsplikt, donasjonsplikt og prisreduksjonsplikt. Foerste obligatoriske lovgivning mot matsvinn i Norden. Bygger paa bransjeavtalen som allerede har redusert matsvinn 24% siden 2015 (407 000 tonn gjenstaande).',
    tags: ['matsvinn', 'regulering', 'matsvinnloven', 'norge'],
    sources: [
      { sourceId: 'src-70', label: 'Sirkularitet dyp research', note: 'Matvett, Stortinget, Matsvinnutvalget' },
    ],
  },
  {
    id: 'ins-42',
    title: 'Sortiment som skjult markedsmakt: NHH-forskning paa hylleplass',
    type: 'analyse',
    source: 'NHH FOOD',
    phase: 'fase-1',
    date: '2026-03-13',
    description:
      'Ozhegova (NHH FOOD working paper) dokumenterer at dagligvarekjedenes kontroll over sortiment og hylleplass er en skjult markedsmaktmekanisme. Kjedene styrer hvilke produkter forbrukerne ser — og dermed hva de kjoeper. Supplerer portvoktermakt-begrepet fra NOU 2013:6.',
    tags: ['sortiment', 'markedsmakt', 'NHH', 'EMV'],
    sources: [
      { sourceId: 'src-68', label: 'Akademia dyp research', note: 'Ozhegova working paper + Menon EMV-kartlegging' },
    ],
  },
  {
    id: 'ins-43',
    title: 'WUR 6-nivaa operativt rammeverk for sirkulaere matsystemer',
    type: 'kartlegging',
    source: 'Perplexity-research sirkulaert',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'WUR definerer 6 operative nivaaer for sirkulaere matsystemer: materialer, naeringsstoffer, energi, logistikk/verdikjede, sosial sirkularitet og offentlig innkjoep. Fire kjerneprinsipp: (1) mark til humant konsum, (2) minimer mattap, (3) resirkuler biprodukter, (4) dyr som resirkulatorer.',
    tags: ['sirkularitet', 'rammeverk', 'WUR', 'operativt'],
    sources: [
      { sourceId: 'src-72', label: 'WUR Circular Food Systems', url: 'https://doi.org/10.18174/638397' },
      { sourceId: 'src-73', label: 'van Zanten Nature Food 2023', url: 'https://www.nature.com/articles/s43016-023-00734-9' },
    ],
  },
  {
    id: 'ins-44',
    title: 'NKJ identifiserer 12 nordiske intervensjonspunkter for matsystemtransformasjon',
    type: 'kartlegging',
    source: 'Perplexity-research sirkulaert',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Nordisk komite for jordbruksforskning (NKJ) identifiserer 12 intervensjonspunkter organisert i 4 pilarer for nordisk matsystemtransformasjon. Dekker hele verdikjeden fra primaerproduksjon til forbruk og avfall.',
    tags: ['nordisk', 'intervensjonspunkter', 'NKJ', 'transformasjon'],
    sources: [
      { sourceId: 'src-76', label: 'NKJ White Paper 2024' },
    ],
  },
  {
    id: 'ins-45',
    title: 'EU Farm to Fork: 50% pesticid, 20% gjodsel, 25% okologisk innen 2030',
    type: 'funn',
    source: 'Perplexity-research sirkulaert',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'EU Farm to Fork-strategiens kvantifiserte maal: 50% reduksjon i pesticidbruk, 20% reduksjon i gjodselforbruk, 25% oekologisk areal innen 2030. Gir konkrete benchmarks for nordisk matsystemarbeid.',
    tags: ['EU', 'Farm-to-Fork', 'maal', 'regulering'],
    sources: [
      { sourceId: 'src-75', label: 'JRC SPP 2025' },
    ],
  },
  {
    id: 'ins-46',
    title: 'Norsk lokal HHI: median 1.0 (monopol) paa postnummernivaet',
    type: 'funn',
    source: 'Perplexity-research food access',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Halseth (NHH 2023) kartlegger lokal HHI i norsk dagligvare paa postnummernivaet. Median HHI er 1.0, som betyr at halvparten av norske postnumre har kun en enkelt dagligvarekjede tilgjengelig — de facto lokale monopoler.',
    tags: ['HHI', 'food-access', 'monopol', 'Norge', 'lokal-konkurranse'],
    sources: [
      { sourceId: 'src-77', label: 'Halseth NHH 2023: Lokal HHI' },
    ],
  },
  {
    id: 'ins-47',
    title: 'Sverige: 102 av 290 kommuner mangler discounter (~1M mennesker beroert)',
    type: 'funn',
    source: 'Perplexity-research food access',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Konkurrensverkets analyse (2024:4) viser at 102 av 290 svenske kommuner helt mangler discountbutikker. Ca. 1 million mennesker bor i kommuner uten tilgang til lavprisalternativ — en strukturell food access-utfordring.',
    tags: ['Sverige', 'food-access', 'discounter', 'lokal-konkurranse'],
    sources: [
      { sourceId: 'src-78', label: 'Konkurrensverket 2024:4', url: 'https://www.konkurrensverket.se/publikationer/' },
    ],
  },
  {
    id: 'ins-48',
    title: 'Metodisk gap: Ingen nordisk studie kombinerer NEMS kvalitetsscorer med GIS-tilgjengelighet',
    type: 'analyse',
    source: 'Perplexity-research food access',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Gjennomgang av nordisk food access-forskning avdekker et sentralt metodisk gap: ingen studie kombinerer NEMS-type kvalitetsscoring (sortiment, pris, ferskhet) med GIS-basert tilgjengelighetsanalyse. Britiske CDRC Priority Places Index (7-domene kompositt) er nermeste referanse.',
    tags: ['metodikk', 'food-access', 'kunnskapsgap', 'GIS', 'NEMS'],
    sources: [
      { sourceId: 'src-80', label: 'CDRC Priority Places v2.1', url: 'https://data.cdrc.ac.uk/' },
    ],
  },
  {
    id: 'ins-49',
    title: 'Alle 5 nordiske land har HHI >2500: highly concentrated etter DOJ/EU-standard',
    type: 'funn',
    source: 'Perplexity-research markedsstruktur',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Validert 2024-data viser at alle 5 nordiske dagligvaremarkeder har HHI over 2500: NO 3327, SE 3500, DK 2623, FI 3633, IS 3298. Samtlige klassifiseres som «highly concentrated» etter DOJ/EU Horizontal Merger Guidelines.',
    tags: ['HHI', 'nordisk', 'maktkonsentrasjon', 'dagligvare'],
    sources: [
      { sourceId: 'src-82', label: 'ECR Dagligvarukartan 2024/2025' },
      { sourceId: 'src-83', label: 'PTY Finnish Grocery Trade 2024/2025' },
      { sourceId: 'src-86', label: 'NHH FOOD Steen 2024' },
    ],
  },
  {
    id: 'ins-50',
    title: 'Axfood kjopte City Gross (3.7% andel) for SEK 2 mrd — svensk konsolidering',
    type: 'funn',
    source: 'Perplexity-research markedsstruktur',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Axfood fullfoerte kjop av City Gross (3.7% markedsandel) for SEK 2 milliarder i 2024, noe som oeker Axfoods totale andel til ~24.9% og forsterker svensk konsolideringstrend.',
    tags: ['Sverige', 'konsolidering', 'Axfood', 'oppkjop'],
    sources: [
      { sourceId: 'src-82', label: 'ECR Dagligvarukartan 2024/2025' },
    ],
  },
  {
    id: 'ins-51',
    title: 'Island: Drangar hf. dannet (Samkaup+Heimkaup+Orkan fusjon des. 2024)',
    type: 'funn',
    source: 'Perplexity-research markedsstruktur',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Drangar hf. ble dannet desember 2024 gjennom fusjon av Samkaup, Heimkaup og Orkan med samlet omsetning ISK 75 milliarder (~20% markedsandel). Island gaar fra 5 til 3 aktorer.',
    tags: ['Island', 'fusjon', 'konsolidering', 'Drangar'],
    sources: [
      { sourceId: 'src-85', label: 'USDA GAIN Iceland 2024' },
    ],
  },
  {
    id: 'ins-52',
    title: 'Aldi Nord forlot Danmark 2024; Lidl fravaerende fra NO og IS',
    type: 'funn',
    source: 'Perplexity-research markedsstruktur',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Aldi Nord trakk seg ut av Danmark i 2024 etter aarevis med tap. Lidl er fravaerende fra Norge og Island. Dokumenterer strukturelle etableringsbarrierer i nordiske dagligvaremarkeder.',
    tags: ['etableringsbarrierer', 'Aldi', 'Lidl', 'nordisk'],
    sources: [
      { sourceId: 'src-84', label: 'USDA GAIN Denmark 2024' },
    ],
  },
  {
    id: 'ins-53',
    title: 'NOK 4.9 mrd bot for ulovlig prissamarbeid 2011-2018 — anke paagaar',
    type: 'funn',
    source: 'Perplexity-research markedsstruktur',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Oppdatering: Konkurransetilsynets vedtak om NOK 4.9 mrd i overtredelsesgebyr til NorgesGruppen, Coop og REMA for prisjeger-samarbeid 2011-2018 er anket. Saken behandles i rettssystemet.',
    tags: ['prisjeger', 'konkurranse', 'anke', 'dagligvare'],
    sources: [
      { sourceId: 'src-86', label: 'NHH FOOD Steen 2024' },
      { sourceId: 'src-42', label: 'Prisjeger-saken' },
    ],
  },
  {
    id: 'ins-54',
    title: 'Halseth PhD: Coop/ICA rebranding 554 butikker — 7-12.9% salgsfall for eksisterende discountere',
    type: 'funn',
    source: 'Perplexity-research avhandlinger',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Halseths NHH PhD (2024) viser at Coop og ICAs rebranding av 554 butikker til discountformat foraarsaket 7-12.9% salgsfall for eksisterende discountere i naerhet. Foerste granulare CID-analyse (Competition Impact of Discounters) i Norden.',
    tags: ['konkurranse', 'discounter', 'rebranding', 'NHH'],
    sources: [
      { sourceId: 'src-87', label: 'Halseth PhD 2024: CID-analyse' },
    ],
  },
  {
    id: 'ins-55',
    title: 'Danmark 88% okologisk offentlig innkjop vs. Norge 2% — offentlig innkjop er sterkeste policy-verktoy',
    type: 'analyse',
    source: 'Perplexity-research avhandlinger',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Kjoebenhavns kommune har 88% oekologisk andel i offentlige kjoekken. Norges offentlige innkjoep ligger paa ~2%. Stein (Salford 2022) dokumenterer at offentlig innkjoep er det sterkeste tilgjengelige policyverktoeyet for matsystemtransformasjon.',
    tags: ['offentlig-innkjoep', 'oekologisk', 'Danmark', 'policy'],
    sources: [
      { sourceId: 'src-87', label: 'Halseth PhD 2024', note: 'Komparativ kontekst' },
      { sourceId: 'src-75', label: 'JRC SPP 2025' },
    ],
  },
  {
    id: 'ins-56',
    title: 'Island matsvinn: Reykjavik 48-27 kg/person (44% reduksjon 2015-2018)',
    type: 'funn',
    source: 'Perplexity-research avhandlinger',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Burgherr (Uni. Iceland 2019) dokumenterer at Reykjavik reduserte matsvinn fra 48 til 27 kg per person (44% reduksjon) mellom 2015 og 2018 — en av de raskeste dokumenterte matsvinreduksjonene i Norden.',
    tags: ['matsvinn', 'Island', 'Reykjavik', 'reduksjon'],
    sources: [
      { sourceId: 'src-88', label: 'Eriksson SLU PhD 2015', note: 'Komparativ kontekst' },
    ],
  },
  {
    id: 'ins-57',
    title: 'Matsvinnutvalget 2024: 75% reduksjon av matsvinn er mulig — over SDG 12.3 (50%)',
    type: 'funn',
    source: 'Perplexity-research offentlige rapporter',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Norges Matsvinnutvalg konkluderer at 75% reduksjon av matsvinn er mulig med riktige tiltak — langt over FNs beaerekraftsmaal 12.3 som sikter mot 50% reduksjon innen 2030.',
    tags: ['matsvinn', 'ambisjon', 'Matsvinnutvalget', 'SDG'],
    sources: [
      { sourceId: 'src-91', label: 'Matsvinnutvalgets rapport 2024' },
    ],
  },
  {
    id: 'ins-58',
    title: 'NOU 2023:1 + Meld.St.11: Regjeringen hever selvforsyningsambisjon til 50% innen 2030',
    type: 'kartlegging',
    source: 'Perplexity-research offentlige rapporter',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Regjeringens Meld. St. 11 (2023-2024) setter eksplisitt maal om 50% selvforsyningsgrad innen 2030. Sammenstilt med NOU 2023:1 utgoer dette den mest ambisiose norske matsikkerhetspolitikken paa tiaar.',
    tags: ['selvforsyning', 'policy', 'matsikkerhet', 'Meld.St.11'],
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/' },
    ],
  },
  {
    id: 'ins-59',
    title: 'Norsk laksefor: 92% importavhengighet ($2.80 mrd), 9/10 kg fra saarbare regioner',
    type: 'funn',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'I 2024 ble 2.26 millioner tonn for brukt til norsk lakseoppdrett med ingrediensverdi $3.16 mrd, hvorav $2.80 mrd (92%) var importert. 9 av 10 kg raavarer kommer fra geopolitisk eller klimatisk saarbare regioner (Brasil, Peru, Vest-Afrika).',
    tags: ['sjomatfor', 'importavhengighet', 'sarbarhet', 'lakseoppdrett'],
    sources: [
      { sourceId: 'src-94', label: 'Greenpeace Feeding a Monster 2021', url: 'https://www.greenpeace.org/' },
      { sourceId: 'src-95', label: 'Feedback Blue Empire 2024' },
      { sourceId: 'src-97', label: 'Skretting Sustainability 2024' },
    ],
  },
  {
    id: 'ins-60',
    title: 'Vest-Afrika fiskeolje: 123-144K tonn fisk tilsv. 2.5-4M menneskers matforbruk',
    type: 'funn',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Norsk laksenearing brukte 123-144K tonn smaapelagisk fisk fra Vest-Afrika (Mauritania, Senegal, Gambia) i 2020 — nok til aa ernaere 2.5-4 millioner mennesker i ett aar. Aktiv politisk konflikt med 39 NGOer som krever forbud.',
    tags: ['Vest-Afrika', 'matsikkerhet', 'fiskefor', 'etikk', 'NGO'],
    sources: [
      { sourceId: 'src-94', label: 'Greenpeace Feeding a Monster 2021' },
      { sourceId: 'src-95', label: 'Feedback Blue Empire 2024' },
    ],
  },
  {
    id: 'ins-61',
    title: 'Historisk forskift: 1990 65% fiskemel → 2024 22% marine, 73% vegetabilsk',
    type: 'analyse',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Norsk laksefor har gjennomgaatt dramatisk sammensetningsendring: fra 65% fiskemel og 24% fiskeolje i 1990 til ~22% marine og ~73% vegetabilske raavarer i 2024. Men soyaavhengigheten (20% av for) utgoer ny importrisiko fra Brasil.',
    tags: ['forsammensetning', 'historisk', 'soya', 'risikoskift'],
    sources: [
      { sourceId: 'src-97', label: 'Skretting Sustainability 2024' },
    ],
  },
  {
    id: 'ins-62',
    title: 'Raavareloeftet: 0.4% → 25% nye raavarer innen 2030 (6000% oekning)',
    type: 'kartlegging',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Raavareloeftet (Bellona + Sjoemat Norge + forselskaper) setter maal om 25% nye raavarer (insektmel, mikroalger, gjaerprotein) i norsk laksefor innen 2030 — opp fra 0.4% i 2020. Kritisk transformasjonsvindu paa 4 aar.',
    tags: ['Raavareloeftet', 'novel-ingredienser', 'transformasjon', 'for'],
    sources: [
      { sourceId: 'src-96', label: 'Raavareloeftet 2.0' },
      { sourceId: 'src-98', label: 'NordicFeed NordForsk' },
      { sourceId: 'src-99', label: 'Green Platform Mikroalger' },
    ],
  },
  {
    id: 'ins-63',
    title: 'Peru anchovy: El Nino 2023 → 1.3M tonn (ned 70%), 2024 normalisert 4.85M tonn',
    type: 'funn',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Peru-ansjosfangsten kollapset med 70% i 2023 (1.3M tonn) pga. El Nino, men normaliserte til 4.85M tonn i 2024. Strukturell volatilitet: gjennomsnittlig en alvorlig El Nino hvert 4-7 aar pavirker direkte norsk laksefor.',
    tags: ['Peru', 'anchovy', 'El-Nino', 'volatilitet', 'fiskefor'],
    sources: [
      { sourceId: 'src-94', label: 'Greenpeace Feeding a Monster', note: 'Kontekst for raavare-sarbarhet' },
    ],
  },
  {
    id: 'ins-64',
    title: 'Regjeringens 5M tonn laks 2050-ambisjon umulig innenfor 92% importbasert raavaregrunnlag',
    type: 'analyse',
    source: 'Perplexity-research sjomatfor',
    phase: 'fase-1',
    date: '2026-03-17',
    description:
      'Norges ambisjon om 5 millioner tonn lakseproduksjon innen 2050 (opp fra 1.6M tonn) er umulig aa realisere innenfor dagens 92% importbaserte raavaregrunnlag uten fundamental omlegging av foringredienssystemet.',
    tags: ['lakseproduksjon', 'ambisjon', 'importavhengighet', 'umulig'],
    sources: [
      { sourceId: 'src-96', label: 'Raavareloeftet 2.0' },
      { sourceId: 'src-97', label: 'Skretting Sustainability 2024' },
    ],
  },
  {
    id: 'ins-65',
    title: 'Dagligvarekjedenes eiendomsportefoljer utgjor over 35 mrd. NOK',
    type: 'kartlegging',
    source: 'Bronnoysund/offentligdata MCP',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'NorgesGruppen (~12,7 mrd.), Reitan Eiendom (~16,0 mrd.) og Coop Eiendom (~6,5 mrd.) har samlede eiendomseiendeler paa minimum 35,2 mrd. NOK. Reitan Eiendom AS alene har 16 mrd. NOK i eiendeler med 89,7 % egenkapitalandel. NorgesGruppen opererer med minst 10 separate eiendomsselskaper fordelt paa holding, kapital, utvikling og regionale enheter.',
    tags: ['eiendom', 'eiendomsmodell', 'NorgesGruppen', 'Reitan', 'Coop', 'maktkonsentrasjon'],
    sources: [
      { sourceId: 'src-100', label: 'Bronnoysundregistrene — selskapsregnskap 2024' },
    ],
  },
  {
    id: 'ins-66',
    title: 'Estimert internleie i dagligvare: 2,5-4,6 mrd. NOK aarlig',
    type: 'analyse',
    source: 'Bronnoysund/offentligdata MCP',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Basert paa regionale eiendomsselskapers driftsinntekter og antatt yield paa eiendomsportefoljer, estimeres internleien mellom eiendomsselskaper og operative dagligvareselskaper til 2,5-4,6 mrd. NOK aarlig. NorgesGruppens regionale selskaper hadde alene ~1,23 mrd. i driftsinntekter (2024), primaert leie fra Kiwi/Meny/SPAR-butikker.',
    tags: ['eiendom', 'self-dealing', 'internleie', 'profittforskyvning'],
    sources: [
      { sourceId: 'src-100', label: 'Bronnoysundregistrene — selskapsregnskap 2024' },
    ],
  },
  {
    id: 'ins-67',
    title: 'Eiendomsmodellen gir 3-8 % strukturell kostnadsfordel',
    type: 'analyse',
    source: 'Bronnoysund/offentligdata MCP',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'De tre store dagligvarekjedene internaliserer leiekostnaden som konsernpost, mens nye konkurrenter maa betale markedsleie. Forskjellen estimeres til 3-8 % av omsetningen — avgjorende i en bransje med netto driftsmargin under 3 %. Kombinert med kontroll over prime lokasjoner skaper dette en naer uoverkommelig etableringshindring. Lidls exit i 2008 understreker poenget.',
    tags: ['eiendom', 'etableringshindring', 'konkurranse', 'self-dealing', 'Lidl'],
    sources: [
      { sourceId: 'src-100', label: 'Bronnoysundregistrene — selskapsregnskap 2024' },
    ],
  },
  {
    id: 'ins-68',
    title: 'Odd Reitan leder personlig Reitan Eiendom med 16 mrd. i eiendeler',
    type: 'funn',
    source: 'Bronnoysund/offentligdata MCP',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Reitan Eiendom AS (915994415), med 16 mrd. NOK i eiendeler og 14,3 mrd. i egenkapital, har Odd Reitan som styreleder. Selskapet ble stiftet i 2015 som del av restrukturering av Reitan-konsernet. Den hoye egenkapitalandelen (89,7 %) indikerer at portefoljen er finansiert med akkumulert overskudd fra dagligvaredriften, ikke gjeldsfinansiert ekspansjon.',
    tags: ['eiendom', 'Reitan', 'Odd Reitan', 'styrekoblinger', 'maktkonsentrasjon'],
    sources: [
      { sourceId: 'src-100', label: 'Bronnoysundregistrene — selskapsregnskap 2024' },
    ],
  },
  {
    id: 'ins-69',
    title: 'Halvparten av enslige forsoergere rapporterer lav matsikkerhet',
    type: 'funn',
    source: 'SIFO/OsloMet 2024',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'SIFO-forskning viser at 50 % av familier med enslige forsoergere sliter med aa ha raad til nok og sunn mat (2024). Lavinntektsfamilier bruker 39,1 % av disponibel inntekt paa mat, mot 11,9 % for hoyinntektsfamilier. Matfattigdom i Norge er et reelt og voksende problem.',
    tags: ['matfattigdom', 'saarbarhet', 'lavinntekt', 'matsikkerhet'],
    sources: [
      { sourceId: 'src-101', label: 'SIFO/OsloMet: Aleneforeldres matsikkerhet 2024' },
    ],
  },
  {
    id: 'ins-70',
    title: 'Median HHI = 1,0 (monopol) paa postnummernivaa i norsk dagligvare',
    type: 'analyse',
    source: 'Strom & Halseth, NHH 2023',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'NHH-forskning viser at flertallet av norske postnumre har kun en dagligvarekjede (median HHI = 1,0). Coop staar for naer halvparten av omsetningen i de 50 minst befolkede kommunene. Kombinert med matprisvekst paa 33 % (2021-2024) betyr dette at husholdninger i distriktene moeter monopolprising uten alternativer.',
    tags: ['HHI', 'monopol', 'maktkonsentrasjon', 'distrikt', 'matorken'],
    sources: [
      { sourceId: 'src-58', label: 'Strom & Halseth: Competition and Grocery Retail Formats (NHH 2023)' },
    ],
  },
  {
    id: 'ins-71',
    title: 'Koebenhavn 84 % oekologisk i offentlige kjokken uten oekt budsjett',
    type: 'kartlegging',
    source: 'Future of Food Foundation 2024',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Koebenhavns 1 000+ offentlige kjokken serverer 70 000 maaltider daglig med 84 % oekologisk andel, oppnaadd uten budsjettoekning siden 2001. Norge har ingen nasjonal maaling av oekologisk andel i offentlige kjokken. Med 611 mrd. NOK i samlede offentlige innkjoep representerer matandelen et stort uutnyttet potensial.',
    tags: ['offentlig-innkjoep', 'oekologisk', 'Koebenhavn', 'benchmark'],
    sources: [
      { sourceId: 'src-102', label: 'Future of Food Foundation: Copenhagen Public Kitchens 2024' },
      { sourceId: 'src-103', label: 'DFOE/Anskaffelser.no: Mat og maaltidstjenester' },
    ],
  },
  {
    id: 'ins-72',
    title: 'Sverige leder Norden i oekologisk offentlig matinnkjoep med 39 %',
    type: 'kartlegging',
    source: 'University of Copenhagen 2021',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Sverige oppnaadde 39 % oekologisk andel i offentlig sektor (2019). Oerebro kommune leder med 70 %. Livsmedelsstrategin sikter mot 60 % innen 2030. SLU-forskning dokumenterer positiv kobling mellom kommuners oekologiske innkjoep og oekologisk jordbruksareal — innkjoepspolitikk driver produksjonsomlegging. Norge og Finland ligger langt bak.',
    tags: ['offentlig-innkjoep', 'oekologisk', 'Sverige', 'nordisk', 'benchmark'],
    sources: [
      { sourceId: 'src-104', label: 'University of Copenhagen: Organic procurement comparison 2021' },
      { sourceId: 'src-105', label: 'Upphandlingsmyndigheten 2025' },
    ],
  },
  {
    id: 'ins-73',
    title: 'Nordisk matsvinnreduksjon: Norge -24 %, Sverige 0 % — divergerende baner mot 2030',
    type: 'analyse',
    source: 'Matvett/NORSUS 2024, Naturvaardsverket 2024',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Norge har oppnaatt -24 % per capita matsvinnreduksjon (2015-baseline), men totalvolumet er fortsatt over 407 000 tonn. Sverige viser null reduksjon siden 2020 — etappmaalet for 2025 (20 %) er ikke naatt. For aa naa 50 %-maalet innen 2030 maa Norges aarlige reduksjonstakt oeke fra 2,7 til 4,3 prosentpoeng. Husholdningene (47 % av matsvinnet, bare -18 % reduksjon) er flaskehalsen.',
    tags: ['matsvinn', 'tidsserier', 'nordisk', '2030-maal', 'husholdninger'],
    sources: [
      { sourceId: 'src-96', label: 'Matvett/NORSUS matsvinnrapport 2024' },
      { sourceId: 'src-97', label: 'Naturvaardsverket matavfallstatistikk 2024' },
    ],
  },
  {
    id: 'ins-74',
    title: 'Sirkulaer matomkonomi: tre uutnyttede spaker — redistribusjon, biogass, innkjoep',
    type: 'funn',
    source: 'Sirkularitetsanalyse 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Matsentralen redistribuerer bare 3 % av kassert mat (6 000 av ~200 000 tonn). Norges biogassproduksjon (828 GWh) er 11x lavere enn Danmarks (>8 000 GWh) grunnet kortsiktige subsidier vs. Danmarks 20-aars feed-in-tariffer. Norge mangler nasjonalt maal for oekologisk offentlig innkjoep — Danmark (84 % i Koebenhavn) og Sverige (39 % nasjonalt) er langt foran. Kombinert representerer disse tre spakene det stoerste transformasjonsmulighetsrommet i nordisk matpolitikk.',
    tags: ['sirkularitet', 'redistribusjon', 'biogass', 'offentlig-innkjoep', 'transformasjon'],
    sources: [
      { sourceId: 'src-98', label: 'Matsentralen aarsdata 2024' },
      { sourceId: 'src-99', label: 'Biogass Norge 2025' },
      { sourceId: 'src-100', label: 'Future of Food Foundation 2024' },
    ],
  },
  {
    id: 'ins-75',
    title: 'Panteordninger (87-94 %) mest effektive nordiske sirkulaerverktoeyet — matsvinnlov for tidlig aa evaluere',
    type: 'analyse',
    source: 'Nordisk regulatorisk komparativ 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Panteordninger er det mest vellykkede regulatoriske sirkulaerinstrumentet i Norden: alle fem land oppnaar 87-94 % returandel gjennom bransjeeid non-profit-infrastruktur. Biogasssubsidier med lang horisont (DK: 20 aar) gir dramatisk hoeyere effekt enn kortsiktige ordninger (NO). Sivilsamfunnsmobilisering (Stop Spild Af Mad, DK) oppnaadde -25 % reduksjon uten lovgivning. Norges matsvinnlov (2025) er banebrytende men ikke traadt i kraft — forskrifter under utvikling 2026.',
    tags: ['regulering', 'panteordning', 'matsvinnlov', 'biogass', 'virkemiddeldesign'],
    sources: [
      { sourceId: 'src-101', label: 'Infinitum/PALPA/Dansk Retursystem aarsdata 2024' },
      { sourceId: 'src-102', label: 'Biogas Danmark Outlook 2025' },
      { sourceId: 'src-103', label: 'Lovdata: Lov 2025-06-20-103 matsvinnloven' },
    ],
  },
  {
    id: 'ins-76',
    title: 'REKO-ringer: 400+ ringer og 1 mill.+ medlemmer i Finland/Sverige — motmodell til kjedekonsentrasjon',
    type: 'kartlegging',
    source: 'REKO-ring Wikipedia, ATL.nu, EkoNu.fi',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'REKO-ringene er en Facebook-basert direktdistribusjonsmodell der smaaskalaprodusenter selger direkte til forbrukere uten mellomledd. Finland har ~180 ringer (270 000+ medlemmer, startet 2013), Sverige ~220 ringer (800 000+ medlemmer, startet 2016). Globalt >600 ringer i 14 land. Modellen gir produsenter full priskontroll utenfor dagligvarekjedenes oligopol. Begrenset skalerbarhet og digitalt ekskluderende for enkelte grupper, men et funksjonsbevis for alternativ distribusjon.',
    tags: ['REKO', 'direktdistribusjon', 'motmodell', 'Finland', 'Sverige', 'smaaskala'],
    sources: [
      { sourceId: 'src-106', label: 'REKO-ring Wikipedia (sv)' },
      { sourceId: 'src-107', label: 'ATL.nu: Reko-ringarna vaexer i antal' },
      { sourceId: 'src-108', label: 'EkoNu.fi: REKO Finland' },
    ],
  },
  {
    id: 'ins-77',
    title: 'Markedskonsentrasjon som stabil attraktor: CR3 ~ 96 % i 8 aar',
    type: 'analyse',
    source: 'Konkurransetilsynets Dagligvarerapport 2017-2024',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'CR3 for norsk dagligvare har ligget mellom 95,5 % og 96,6 % fra 2017 til 2024 — en variasjon paa 1,1 prosentpoeng over 8 aar. NorgesGruppen har holdt seg i baandet 42,3-44,1 %, Coop 29,0-29,5 %, REMA 23,1-23,9 %. Moensteret bekrefter at markedsstrukturen er en stabil attraktor der politisk oppmerksomhet, offentlig debatt og tilsynsrapporter ikke har endret systemets grunnleggende dynamikk.',
    tags: ['markedskonsentrasjon', 'CR3', 'stabil-attraktor', 'dagligvare', 'konkurransetilsynet'],
    sources: [
      { sourceId: 'src-114', label: 'Konkurransetilsynets Dagligvarerapport 2024 (april 2025)' },
    ],
  },
  {
    id: 'ins-78',
    title: 'Eiendomsinvestering 6x raskere enn omsetningsvekst: strukturell lock-in',
    type: 'analyse',
    source: 'Broennoeysundregistrene / NorgesGruppen aarsregnskap',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'NorgesGruppens eiendomsinvesteringer vokste fra 727 MNOK (2018) til 4 200 MNOK (2022) — en 6x oekning. Samlet eiendomsportefoelje for Big 3 er 35,2 mrd. NOK (2024): NorgesGruppen 12,7 mrd., Reitan 16,0 mrd., Coop 6,5 mrd. Eiendomsportefoeljene utgjoer 32-65 % av konsernenes totale eiendeler. Denne veksttakten overgaar kraftig dagligvareomsetningens vekst, noe som indikerer bevisst kapitalallokering til eiendom som etableringshindring.',
    tags: ['eiendom', 'lock-in', 'etableringshindring', 'eiendomsportefoelje', 'dagligvare'],
    sources: [
      { sourceId: 'src-115', label: 'Broennoeysundregistrene — selskapsregnskap 2024 (offentligdata MCP)' },
    ],
  },
  {
    id: 'ins-79',
    title: 'Divergerende trender: matsvinn -24 % mens konsentrasjon og priser vedvarer',
    type: 'analyse',
    source: 'Matvett/NORSUS OR.27.25, Eurostat, Konkurransetilsynet',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Tre indikatorer viser divergerende trender 2015-2024: (1) Matsvinn per capita falt 24 %, med dagligvareleddet ned 47 %. (2) Markedskonsentrasjon forble uendret (CR3 ~96 %). (3) Norsk matprisnivaa forble 23-39 % over Sverige og akselererte etter 2023 (17,6 % vekst vs. 9,1 % i Sverige). Moensteret viser at kjedene er effektive innenfor sin sfaere (matsvinn), men at denne effektiviteten ikke kanaliseres til lavere priser eller redusert markedsmakt.',
    tags: ['divergerende-trender', 'matsvinn', 'matpriser', 'konsentrasjon', 'paradoks'],
    sources: [
      { sourceId: 'src-116', label: 'Matvett/NORSUS matsvinnrapport 2024' },
      { sourceId: 'src-114', label: 'Konkurransetilsynets Dagligvarerapport 2024' },
    ],
  },
  {
    id: 'ins-80',
    title: 'Matpolitikk fragmentert over 4-6 departementer i hvert nordisk land',
    type: 'kartlegging',
    source: 'Governance-arkitektur-analyse 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Kartlegging av nordisk styringsarkitektur viser at matpolitikken i hvert land er spredt over 4-6 departementer (landbruk, naering, miljoe, helse, beredskap, forbrukervern) uten at noe enkelt departement eier matsystemet helhetlig. Norge har den mest fragmenterte strukturen: LMD (produksjon), NFD (konkurranse), KLD (sirkularitet), JD (beredskap), HOD (folkehelse) og BFD (forbrukervern) deler alle ansvaret. Danmark forsoeker aa loese dette gjennom sammenslaaingen av Foedevarestyrelsen og Landbrugsstyrelsen fra 1.1.2026. Finlands Matmarkedsombud + KKV § 4a-modellen viser at supplerende sektorspesifikke organer kan kompensere for departemental fragmentering.',
    tags: ['governance', 'fragmentering', 'departementsstruktur', 'nordisk', 'institusjonell'],
    sources: [
      { sourceId: 'src-90', label: 'Governance-arkitektur nordisk: komparativ kartlegging 2026' },
    ],
  },
  {
    id: 'ins-81',
    title: 'Ingen nordisk institusjon eier sirkulaer matsystemomstilling',
    type: 'kartlegging',
    source: 'Governance-arkitektur-analyse 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Sirkulaer matsystemomstilling — som krever koordinering paa tvers av primaerproduksjon, industri, handel, avfall og energi — har ingen institusjonell eier i noe nordisk land. Matsvinnreduksjon deles typisk mellom 2-3 myndigheter (i Sverige: Livsmedelsverket + Naturvaardsverket + Jordbruksverket). Biomassekaskade-prinsippet har ingen ansvarlig myndighet. Regenerativt jordbruk er ikke eksplisitt i mandatet til noe landbruksdirektorat. For NCH betyr dette at et sirkulaert matpolitikkmandat maa skapes — det finnes ikke i dag.',
    tags: ['governance', 'sirkularitet', 'styringshull', 'biomasse', 'nordisk', 'matsvinn'],
    sources: [
      { sourceId: 'src-90', label: 'Governance-arkitektur nordisk: komparativ kartlegging 2026' },
    ],
  },
  {
    id: 'ins-82',
    title: 'Dagligvarekjedenes grossistmonopol reproduseres i HORECA',
    type: 'kartlegging',
    source: 'HORECA-kartlegging 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Dagligvarekjedenes grossistdominans overfoeres direkte til foodservice-sektoren. ASKO Servering (NorgesGruppen) kontrollerer ~70 % av norsk storhusholdningsgrossist. I Finland kontrollerer Kespro (Kesko, ~49 %) og Meira Nova (S-Group, ~25 %) tilsammen ~74 %. I Sverige eier Axel Johnson baade Axfood (dagligvare #2) og Martin & Servera (foodservice #1, 19,9 mrd SEK). Moenstrene viser at markedskonsentrasjon i dagligvare reproduseres 1:1 i foodservice-grossistleddet.',
    tags: ['horeca', 'maktkonsentrasjon', 'grossist', 'nordisk', 'foodservice'],
    sources: [
      { sourceId: 'src-117', label: 'HORECA-kartlegging nordisk foodservice 2026' },
    ],
  },
  {
    id: 'ins-83',
    title: 'Compass Group dominerer nordisk kontraktcatering etter to oppkjoep',
    type: 'kartlegging',
    source: 'HORECA-kartlegging 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Compass Group plc (UK, GBP 38+ mrd global omsetning) har blitt dominerende i nordisk kontraktcatering gjennom to oppkjoep: Fazer Food Services (2020, EUR 475M, 1000+ kantiner i FI/SE/DK/NO) og 4Service AS (2024, norsk catering/FM). Selskapet driver naa over 300 personalrestauranter i Skandinavia og Forsvarets kantiner i Norge (~900 MNOK kontraktsverdi, ~35 000 daglige maaltider). Oppkjoepene ble vurdert nasjonalt, ikke som nordisk konsolideringsstrategi.',
    tags: ['horeca', 'kontraktcatering', 'compass-group', 'konsolidering', 'nordisk'],
    sources: [
      { sourceId: 'src-117', label: 'HORECA-kartlegging nordisk foodservice 2026' },
    ],
  },
  {
    id: 'ins-84',
    title: 'Skolematsystemet er Nordens stoerste uutnyttede folkehelseverktoy',
    type: 'analyse',
    source: 'HORECA-kartlegging 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Finland (1948) og Sverige (1946) har universelt gratis skolemat for alle elever — tilsammen ~2,4 millioner daglige maaltider. Lunds universitet viser at universell skolelunsj oeker livstidinntekt med 3 %. Norge og Danmark har matpakkemodell der ernaeringskvaliteten gjenspeiler hjemmets sosiooekonomiske status. Overgangen til universelt skolemat i Norge/Danmark ville vaere det stoerste folkehelsegrepet i nordisk matpolitikk — men motstanden handler om kostnad, ikke evidens.',
    tags: ['horeca', 'skolemat', 'folkehelse', 'ulikhet', 'nordisk', 'policy'],
    sources: [
      { sourceId: 'src-117', label: 'HORECA-kartlegging nordisk foodservice 2026' },
    ],
  },
  {
    id: 'ins-85',
    title: 'Axel Johnson-familien kontrollerer baade dagligvare og storhusholdning i Sverige',
    type: 'funn',
    source: 'HORECA-kartlegging 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Axel Johnson AB eier Axfood (50,1 %, Sveriges #2 dagligvarekjede) og Martin & Servera (100 %, Sveriges #1 foodservice-grossist med 19,9 mrd SEK omsetning). Samme familiekonsern kontrollerer dermed baade dagligvare- og storhusholdningsdistribusjon — en dobbeltposisjon uten parallell i noe annet nordisk land. Konkurrensverket har ikke undersoekt denne kryss-kanal-konsentrasjonen.',
    tags: ['horeca', 'axel-johnson', 'dual-kontroll', 'sverige', 'maktkonsentrasjon'],
    sources: [
      { sourceId: 'src-117', label: 'HORECA-kartlegging nordisk foodservice 2026' },
    ],
  },
  {
    id: 'ins-86',
    title: 'HORECA-sektoren mangler maktkonsentrasjonsovervaaking i alle nordiske land',
    type: 'analyse',
    source: 'HORECA-kartlegging 2026',
    phase: 'fase-1',
    date: '2026-03-23',
    description:
      'Ingen nordisk konkurransetilsyn publiserer regelmessige rapporter om foodservice-konsentrasjon. Konkurransetilsynets aarlige Dagligvarerapport dekker ikke storhusholdning, til tross for at 30-40 % av nordisk matforbruk skjer utenfor hjemmet. Foodservice-sektoren — med estimert nordisk omsetning paa 250+ mrd NOK — opererer i et tilsynsmessig vakuum. For NCH betyr dette at HORECA-perspektivet maa loftes inn i whitepaperret som et blindpunkt i eksisterende maktanalyse.',
    tags: ['horeca', 'tilsynsgap', 'konkurransetilsyn', 'nordisk', 'blindpunkt'],
    sources: [
      { sourceId: 'src-117', label: 'HORECA-kartlegging nordisk foodservice 2026' },
    ],
  },
  {
    id: 'ins-87',
    title: 'EU PPWR: ny emballasjeforordning med generell anvendelse fra august 2026',
    type: 'funn',
    source: 'Cathrine Barth / EU-regelverk',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'EUs nye Packaging and Packaging Waste Regulation (PPWR) traadde i kraft 11.02.2025 og har generell anvendelse fra 12.08.2026. Sammen med revidert Waste Framework Directive (bindende maal: 10% matavfallsreduksjon i prosessering, 30% per capita i retail/forbruk innen 2030) og EUDR (utsatt til des 2026/juni 2027) skaper dette et implementeringsvindu der kravene blir operative i markedet de neste 18 maanedene. Tre signal: mindre rom for lineaere loesninger, mer behov for dokumentasjon i verdikjeden, stoerre verdi i aktoerer som kobler mat, emballasje, avfall og data.',
    tags: ['PPWR', 'WFD', 'EUDR', 'EU-regulering', 'emballasje', 'matsvinn', 'sirkulaer'],
    sources: [
      { label: 'EUR-Lex Regulation (EU) 2025/40', url: 'https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng' },
      { label: 'EC Revised Waste Framework Directive', url: 'https://environment.ec.europa.eu/news/revised-waste-framework-directive-enters-force-2025-10-16_en' },
      { label: 'EC Food waste reduction targets', url: 'https://food.ec.europa.eu/food-safety/food-waste/eu-food-waste-relevant-legislation/food-waste-reduction-targets_en' },
      { label: 'Access2Markets EUDR delay', url: 'https://trade.ec.europa.eu/access-to-markets/en/news/delay-until-december-2026-and-other-developments-implementation-eudr-regulation' },
    ],
  },
  {
    id: 'ins-88',
    title: 'Nordisk matsvinnforpliktelse: halvere matavfall innen 2030',
    type: 'funn',
    source: 'Cathrine Barth / Nordisk ministerraad',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Nordisk ministerforpliktelse fra 2023: halvere matavfall i regionen innen 2030. Ulik policy-modenhet mellom landene: Norge har bransjeavtale + matsvinnlov paa vei, Danmark har Madspildsstrategi 2.0, Sverige har oppdatert handlingsplan, Finland nasjonal avfallsplan til 2027. Felles retning gir NCH legitimt handlingsrom. TG-en boer designes som nordisk laeringsarena med lokale piloter — ikkje eein homogen nordisk policyfortelling.',
    tags: ['nordisk', 'matsvinn', 'policy', 'ministerraad', '2030-maal'],
    sources: [
      { label: 'Nordic Co-operation: Reducing food waste', url: 'https://www.norden.org/en/declaration/policy-commitment-reducing-food-waste-green-nordic-region' },
      { label: 'Regjeringen: Bransjeavtale matsvinn', url: 'https://www.regjeringen.no/no/tema/mat-fiske-og-landbruk/mat/matsvinn/bransjeavtale-om-matsvinn-reduksjon/id2891198/' },
      { label: 'Regjeringen: Prop. 130 L matsvinnlov', url: 'https://www.regjeringen.no/no/dokumenter/prop.-130-l-20242025/id3096529/' },
    ],
  },
  {
    id: 'ins-89',
    title: 'Fem sirkulaere sloyfer for TG Food Systems',
    type: 'analyse',
    source: 'Cathrine Barth / NCH discussion deck',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'TG-en boer ikkje eie heile matsystemet, men arbeide maalretta der regulering, ressursstroemmer og samhandling moetast. Fem sloyfer identifisert: (1) Forebygge matsvinn, (2) Redistribuere overskuddsmat, (3) Utnytte sidestroummer, (4) Tilbakefoere naeringsstoffer til jord, (5) Sirkulaer emballasje og logistikk. Tre mulighetsrom: matsvinnforebygging/redistribusjon, sirkulaer emballasje/logistikk, og sporbare/robuste importkjeder (kaffe, kakao, soya).',
    tags: ['sirkulaer', 'sloyfer', 'TG-scope', 'matsvinn', 'emballasje', 'sidestroemmer', 'naeringsstoffer'],
    sources: [
      { label: 'Circular Food Systems discussion deck NCH (mars 2026)' },
    ],
  },
  {
    id: 'ins-90',
    title: 'ISO 59000-serien som forankring for TG sirkulaeroekonomi',
    type: 'analyse',
    source: 'Cathrine Barth / Standard Norge',
    phase: 'fase-2',
    date: '2026-03-17',
    description:
      'ISO 59000-serien (59004: terminologi og prinsipper, 59010: omlegging av forretningsmodeller, 59020: maaling av sirkularitet) gir anerkjent rammeverk for aa forankre TG-arbeidet. Cathrine har full tilgang gjennom speilkomiteen. Aa knytte TG til Eurostats sirkulaerindikatorer og ISO-terminologi styrker relevans, konkretisering mot leveranse og troverdighet overfor finansioerer/policy-aktoerer.',
    tags: ['ISO-59000', 'standardisering', 'sirkularitet', 'metodikk', 'indikatorer'],
    sources: [
      { label: 'Standard Norge: ISO 59000-serien', url: 'https://standard.no/fagomrader/sirkularokonomi/sirkular-okonomi-iso-59000-serien/' },
      { label: 'Eurostat Circular Economy Monitor', url: 'https://ec.europa.eu/eurostat/web/circular-economy/monitoring-framework' },
    ],
  },
  {
    id: 'ins-91',
    title: 'NMBU FeedLoop: operasjonalisert sirkulaert matsystemdesign',
    type: 'funn',
    source: 'Cathrine Barth / NMBU-intervju',
    phase: 'fase-2',
    date: '2026-03-18',
    description:
      'Hanne Fjerdingby Olsen (NMBU) leder FeedLoop-prosjektet (2025-2027) som redesigner lokale matsystemer for sirkulaer husdyrproduksjon. Bruker optimaliseringsmodell (CIBUS-OPT) og living lab-tilnaerming i Troendelag/Innlandet. Direkte kobling til SLU (svensk modelleringsverktoy). NewTools (FHI) utvikler indikatorer for ernaering og baerekraft. Senter for baerekraftige matsystemer avvikles i 2026 — aapner rom for ny samarbeidsarkitektur.',
    tags: ['NMBU', 'FeedLoop', 'sirkulaer', 'living-lab', 'indikatorer', 'SLU', 'forskning'],
    sources: [
      { label: 'NMBU profil Hanne Fjerdingby Olsen', url: 'https://www.nmbu.no/om/ansatte/hanne-fjerdingby-olsen' },
      { label: 'SLU Future Food', url: 'https://www.slu.se/en/about-slu/organisation/future-platforms/slu-future-food/' },
    ],
  },
  {
    id: 'ins-92',
    title: 'NCE Heidner kartlegger matberedskap i NO/SE/FI — parallellprosess',
    type: 'kartlegging',
    source: 'Cathrine Barth / LinkedIn',
    phase: 'fase-2',
    date: '2026-03-19',
    description:
      'To NMBU-masterstudenter (Thea Ingvaldsen og Martin Saetra, biooekonomi) kartlegger paagende initiativer og prosjekter innen matberedskap i Norge, Sverige og Finland gjennom internship hos NCE Heidner Biocluster og Klosser Innovasjon. Koblet til IFK-prosjektet "Matproduksjon som del av totalforsvaret" og AgriFoodTech Norway. Funn kan vaere direkte relevant for TG Food Systems innsiktsarbeid.',
    tags: ['matberedskap', 'nordisk', 'NMBU', 'Heidner', 'parallellprosess', 'kartlegging'],
  },

  // ═══ Forskningsrunde 2026-04-20 — 8 dybderapporter (Eiendomsmakt, fryktkultur, HORECA, alt-distribusjon, failed entrants, benchmark, framstillinger, evidens) ═══

  {
    id: 'ins-93',
    title: 'Eiendom som strukturell konkurransebarriere — 350+ registrerte negative servitutter',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Eiendomsmakt-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Konkurransetilsynet har identifisert over 350 registrerte negative servitutter der en av de tre paraplykjedene (NorgesGruppen, Coop, REMA) er rettighetshaver — hovedsakelig i og rundt storbyene. Nye negative servitutter ble forbudt fra 1. januar 2024, og regjeringen prioriterer arbeid mot eksklusive leieavtaler i 2025-2026. Eksklusivitet i leieavtaler er fortsatt privat og dermed usynlig for offentlig innsyn — sannsynlig undervurdering av faktisk kontroll.',
    tags: ['eiendom', 'servitutter', 'konkurranse', 'maktkonsentrasjon', 'dagligvare', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Regjeringen — forbyr praksis som motvirker konkurranse', url: 'https://www.regjeringen.no/no/aktuelt/forbyr-praksis-som-motvirker-konkurranse-i-dagligvaremarkedet/id2985486/' },
      { label: 'Konkurransetilsynets dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
    ],
  },
  {
    id: 'ins-94',
    title: 'Internleie i NorgesGruppen — NOK 168m til naerstaaende eiendom 2024',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Eiendomsmakt-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'NorgesGruppens registreringsdokument 2025 dokumenterer 2024-husleie paa ca NOK 120m til Joh. Johannson Eiendom AS og Bokveien 112 AS (Johannson-familien), og ca NOK 48m (NGs andel) til Alf Bjercke Eiendom AS. Totalt paa tvers av aar har de naerstaaende rentestroemmene ligget i intervallet NOK 10-200m. Sale-leaseback-transaksjoner og internleie gjoer at eiendomsverdier og leiekostnader kan flyttes mellom naerstaaende selskaper utenfor offentlig innsyn.',
    tags: ['internleie', 'naerstaaende', 'NorgesGruppen', 'eiendom', 'Johannson', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'NorgesGruppen registreringsdokument 02.06.2025 (NO0013462705)' },
    ],
  },
  {
    id: 'ins-95',
    title: 'Reitan Eiendom forvalter 2,077 millioner kvm bygningsmasse — REBUS-portefoelje overfoert',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Eiendomsmakt-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Reitan Eiendom AS (etablert 1995) forvalter ca 2,077 millioner kvm bygningsmasse i 2024 med ca NOK 2 mrd i omsetning. REBUS Handelseiendom kjoepte REBUS Utvikling fra REMA 1000 Norge i desember 2023 — en portefoelje paa 27 heleide og 38 deleide eiendommer. Datterselskaper inkluderer E C Dahls Eiendom, RELOG, Christiania Areal. Coop Midt-Norge forvalter ca 925 000 kvm tomteareal og 325 000 kvm bygningsmasse med 120 interne og ca 400 eksterne leieforhold.',
    tags: ['eiendom', 'Reitan', 'REBUS', 'Coop', 'REMA', 'eiendomsportefoelje', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Reitan Eiendom arsrapport 2024', url: 'https://2024.reitaneiendom.no/' },
    ],
  },
  {
    id: 'ins-96',
    title: 'Dagligvaretilsynet: 0 vedtak om lovbrudd siden oppstart',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Makt, fryktkultur og enforcement',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Dagligvaretilsynets aarsrapport 2024 viser 12 mottatte saker — 7 loest paa leverandoersiden, 4 i dialog med kjeder, 1 uavklart. Null vedtak om lovbrudd siden tilsynet ble etablert i 2020. Handheving av Lov om god handelsskikk flyttes til Konkurransetilsynet fra 30. april 2026 (forskrift 2026-04-17-601). Dagligvaretilsynets hoeringssvar 2025 peker paa narrow lovdesign (Prop. 33 L 2019-2020) og dialogbasert handheving som hovedforklaringer paa lav inngripen.',
    tags: ['handheving', 'Dagligvaretilsynet', 'Konkurransetilsynet', 'lov-om-god-handelsskikk', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Dagligvaretilsynet aarsrapport 2024' },
      { label: 'Forskrift 2026-04-17-601', url: 'https://lovdata.no/' },
      { label: 'Prop. 4 L (2025-2026)', url: 'https://www.regjeringen.no/id3124887/' },
    ],
  },
  {
    id: 'ins-97',
    title: 'Fryktkultur: 13-17% muntlige sideavtaler; >1/3 leverandoerer delistet uten saklig grunn',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Makt, fryktkultur og enforcement',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      '13-17% av norske leverandoerer rapporterte i 2024 muntlige sideavtaler i tillegg til skriftlige avtaler med de tre stoerste kjedene. Over en tredjedel av leverandoerrepresentanter opplever delisting uten saklig begrunnet forklaring. Matkjedeutvalget (NOU 2011:4) beskrev "konstant og reell trussel" om delisting — situasjonen er strukturelt uendret. Under-rapportering driver lav handhevingsstatistikk; den er ikke en indikasjon paa lav fryktkultur men paa intens fryktkultur.',
    tags: ['fryktkultur', 'leverandoerer', 'delisting', 'muntlige-avtaler', 'dagligvare', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Samarbeidsklimaet i Dagligvarebransjen 2023 — Dagligvaretilsynet' },
      { label: 'NOU 2011:4 Mat, makt og avmakt' },
    ],
  },
  {
    id: 'ins-98',
    title: 'Nordisk UTP-handheving: Sverige 4 sanksjonsavgifter, Danmark 1 klage trukket',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / Makt, fryktkultur og enforcement',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Nordisk handhevingsgap er strukturelt. Sverige (Konkurrensverket 2025): 4 saker med sanksjonsavgift per 31. oktober 2025. Danmark (KFST 2024): 1 klage siden foedevarehandelsloven traadte i kraft — senere trukket, null vedtak. Finland (Ruokavirasto/ETMV 2024): 40% av respondenter i frukt/baer sektor peker paa ensidige kontraktsendringer som stoerste problem, drikkevare-sektor paa betalingstid. Bred UTP-regulering hjelper ikke naar underliggende avhengighet er hoy.',
    tags: ['UTP', 'nordisk', 'handheving', 'Konkurrensverket', 'KFST', 'Ruokavirasto', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Konkurrensverket rapport 2025-5' },
      { label: 'KFST Evaluering af foedevarehandelsloven 2024' },
      { label: 'ETMV toimintakertomus 2024 — Finnish Food Market Ombudsman' },
    ],
  },
  {
    id: 'ins-99',
    title: 'Nordisk offentlig maaltid: 5,5 millioner maaltider per dag',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / HORECA-analyse',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Offentlige og institusjonelle maaltider utgjoer ca 5,5 millioner maaltider per dag paa tvers av Norden. Sverige: 3 millioner maaltider per dag (skole/vaard/omsorg) — SEK 10 mrd i matinnkjoep + SEK 2 mrd maaltidstjenester (2019). Finland: 850 000 elever med rett til gratis skolemaaltid, 750-868 millioner maaltider aarlig i profesjonelle kjoekken. Kespro dominerer finsk foodservice-grossist med ca 49% markedsandel. Danmark: 3500 kjoekken med oekologisk spisemaerke. Norge har ingen nasjonal skolemaaltidsordning — kun 45% av ungdomsskoler og 6% av vgs tilbyr daglig maaltid.',
    tags: ['HORECA', 'offentlige-maaltider', 'nordisk', 'innkjoep', 'skolemaaltid', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Kesko Q3 2025 investor presentation' },
      { label: 'Copenhagen Food Strategy 2019' },
      { label: 'Motiva — Guide for Responsible Procurement of Food (2026)' },
      { label: 'Helsedirektoratet — Kartlegging av ernaeringsomraadet 2024' },
    ],
  },
  {
    id: 'ins-100',
    title: 'Koebenhavn 87,8% oekologisk i 70 000 daglige maaltider — samme budsjett',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / HORECA og benchmark-case',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Koebenhavns Madhus leverer ca 70 000 maaltider per dag i ca 1000 institusjoner med over 1750 kjoekkenmedarbeidere. Oekologisk andel gikk fra ca 35% til 72% uten oekt budsjett; toppet paa 88% i 2015, er ca 87,8% i dag. Maatet klimaavtrykk: -17,6% fra mat i perioden 2018-2022, nyere data >30% CO2-reduksjon. Motor: opplaering, menyendringer, mindre svinn — ikke dyrere raavarer. Danmark kjoerer ogsaa nasjonal skolemaaltidsproevordning med 191 skoler og 4 aars finansiering fra 2025.',
    tags: ['benchmark', 'oekologisk', 'Kobenhavn', 'offentlige-maaltider', 'klimafotavtrykk', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Koebenhavns Madhus — Food Strategy' },
    ],
  },
  {
    id: 'ins-101',
    title: 'Alternative distribusjonskanaler Norden: penetrasjonsindeks SE 3,8 / NO 3,6 / FI 3,4 / DK 3,0',
    type: 'analyse',
    source: 'Forskningsrunde 2026-04-20 / Alternative distribusjonskanaler',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Indikativ penetrasjonsindeks (0-5) for alternative kanaler (REKO, D2C, subscription, kooperativer, digitale nisjer): Sverige 3,8, Norge 3,6, Finland 3,4, Danmark 3,0. REKO sterkest i FI/SE, D2C i NO/FI, subscription i DK/SE/NO. Norsk lokalmat 2025: NOK 13,55 mrd totalt, NOK 938m direkte salg. Finland: 62% av REKO-produsenter rapporterte oekt loensomhet, 53% oekt profitt, 23% hoyere salgspriser. Kanalene erstatter ikke kjedene — de fyller strukturelle hull (kortere kjeder, lokal opprinnelse, fleksibelt sortiment).',
    tags: ['alternative-distribusjon', 'REKO', 'D2C', 'lokalmat', 'subscription', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Stiftelsen Norsk Mat — Lokalmatrapport 2025' },
      { label: 'Jukuri.luke.fi — Finnish local food study' },
      { label: 'Emerald QMR — Practicing mundane consumer resistance in the REKO (2021)' },
    ],
  },
  {
    id: 'ins-102',
    title: 'Cheffelo SEK 1,188 mrd — nordens stoerste maaltidskasse-aktoer',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / Alternative distribusjonskanaler',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Cheffelo (NO/SE/DK, Finland-pilot planlagt 2026) omsatte SEK 1,188 mrd i 2025 og leverte ca 17 millioner maaltider. 2024-fordeling: NO 505,5 MSEK / SE 403,1 MSEK / DK 149,6 MSEK. Andre nordiske alternativer: Aarstiderne (DK) leverer til 50 000 DK-husholdninger + 10 000 SE-husholdninger (~250 000 ukentlige maaltider); Linas Matkasse (SE) SEK 403,1m; RetNemt (DK) SEK 149,6m; Matsmart (SE, overskuddsmat) SEK 756m nordisk 2024.',
    tags: ['subscription', 'Cheffelo', 'Aarstiderne', 'Matsmart', 'maaltidskasse', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Cheffelo Q4 2025 press release' },
      { label: 'Aarstiderne corporate site 2024-2025' },
    ],
  },
  {
    id: 'ins-103',
    title: 'Etableringsbarrierer: 7-dimensjonal modell fra nordiske failed entrants',
    type: 'analyse',
    source: 'Forskningsrunde 2026-04-20 / Failed-entrants-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Analyse av nordiske dagligvare-failures gir en 7-dimensjonal etableringsbarrieremodell: (1) innkjoepsmakt, (2) grossist-logistikk, (3) lokalitet-eiendom, (4) regulering, (5) etterspoersel-vane, (6) konsentrasjonsmotreaksjon, (7) kapital-utholdenhet. Lidl Norge (2004-2008) feilet paa alle 7. ICA Norge (solgt 2014) feilet paa innkjoep + volum — markedsandel falt 15,7% (2009) til 11,1% (2013), -SEK 577m EBIT T12M. Coop.dk MAD: 10 aar med tap, stengt 2023. Stockmann Delicatessen: -EUR 11m i 2016, solgt til S Group 2017. Irma: 65 butikker splittet under "Fremtidens Coop" 2023.',
    tags: ['etableringsbarrierer', 'failed-entrants', 'Lidl', 'ICA', 'Coop.dk', 'Irma', 'dagligvare', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'ICA Gruppen press release 2014' },
      { label: 'NHH food-news 2023 (Coop.dk MAD)' },
      { label: 'Konkurransetilsynet dagligvarerapport 2022' },
      { label: 'Lindex Group press release 2017 (Stockmann Delicatessen)' },
    ],
  },
  {
    id: 'ins-104',
    title: 'Mathem/Oda/Axfood online grocery — konsolidering endte i rekonstruksjon 2024',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Failed-entrants-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Svensk online grocery konsolidering viser at online "ikke bryter gamle barrierer — det flytter dem" (fra butikknettverk til plukkhastighet, rutedensitet, kapital i automatisering). Axfood byttet Mat.se for andel i Mathem (2021), lang-tidskontrakt med Dagab. 2023 slo Mathem seg sammen med Oda, 2024 foertagsrekonstruktion. Lager i Gothenburg og Malmoe flyttet til automatisert Larsboda-anlegg. Laerdom: prosessautomatisering + grossistavhengighet = samme konsentrasjonsmekanikk som tradisjonell dagligvare.',
    tags: ['online-grocery', 'Mathem', 'Oda', 'Axfood', 'Dagab', 'rekonstruksjon', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Mathem press release 2024 — financial sustainability (Mynewsdesk)' },
      { label: 'Kinnevik press release 2021 — Mat.se/Mathem merger' },
    ],
  },
  {
    id: 'ins-105',
    title: 'Too Good To Go 120 millioner brukere / 1,35 megatonn CO2e unngaatt',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Too Good To Go (DK, 2015-) har 120 millioner registrerte brukere og 180 000 aktive partnere i 20 land, med over 500 millioner maaltider reddet og ca 1,35 millioner tonn CO2e unngaatt. Introduserte "Look-Smell-Taste" datomerking. Norsk Coop-avtale (2021) dekker alle 804 Coop-butikker, forventet ca 6% reduksjon i matsvinn og 550 000 reddede poser = 1375 tonn CO2e. Modell viser at enkle markedsplattformer kan skalere naar de gjoer riktig adferd enklere og mer attraktiv.',
    tags: ['benchmark', 'Too-Good-To-Go', 'matsvinn', 'plattform', 'Coop', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Too Good To Go press release / CEVA Logistics 2024' },
    ],
  },
  {
    id: 'ins-106',
    title: 'Plantefonden (DK) forpliktet DKK 394m over 116 prosjekter 2023-2025',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Danmarks Plantefond (DKK 675m for perioden 2023-2030, forankret i Gront Landbrugsavtalen) har committet ca DKK 393,8m over 116 prosjekter i 2023-2025. Dedikert offentlig fond for plantebasert matsystemomlegging — kapital motor i trekanten (demand/operational/finance) som skiller benchmarks som skifter praksis fra de som ikke gjoer det. Benchmark-modell direkte relevant for norsk Raavareloefte og matsystemutvalgets arbeid.',
    tags: ['benchmark', 'Plantefonden', 'plantebasert', 'protein', 'Danmark', 'finansiering', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Plantefonden.dk — projects page' },
    ],
  },
  {
    id: 'ins-107',
    title: 'Soer-Korea resirkulerer 96,8% av 4,81 megatonn matavfall (2023)',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'PAYT/RFID-basert matavfallshaandtering i Soer-Korea resirkulerte 96,8% av 4,81 millioner tonn matavfall i 2023. Seoul: -23,9% matsvinn siden 2013. Alt matavfall gaar til foor/kompost/biogass. Hovedbarriere: drifts- og vedlikeholdskostnad, spesielt for smaa kommuner. Kontrast til fransk Garot-lov (2016): krever donasjonsavtaler for butikker >400 kvm; ADEME-panel av 10 butikker: -22% svinn paa 3 maaneder = 160 tonn/aar = ~EUR 70 000 per butikk per aar. Begge er forskriftsdrevne — markedsmodeller (TGTG) fungerer parallelt.',
    tags: ['benchmark', 'matsvinn', 'Soer-Korea', 'Frankrike', 'PAYT', 'regulering', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'OECD Environmental Performance Reviews — Korea 2017' },
      { label: 'ADEME — French food waste panel study' },
    ],
  },
  {
    id: 'ins-108',
    title: 'Arla FarmAhead: -9,9% CO2/kg melk fra 2020-basislinjen innen 2025',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Arla Foods FarmAhead Check omfatter ca 8000 gaarder i 7 europeiske land med 99% datadekning av melk. EUR 337m utbetalt i 2024 (ramme EUR 500m/aar). Utslippsintensitet 1,12 kg CO2e/kg melk (2022) til 1,06 (2024) — -9,9% fra 2020-basislinjen innen 2025. Private-sektor parallell til offentlige procurement-incentiver, relevant som modell for Tine/Q-Meieriene sirkulaer-incentiver. Viser at demand+operational+finance-trekanten fungerer ogsaa som intra-samvirke insentiv.',
    tags: ['benchmark', 'Arla', 'melk', 'klima', 'samvirke', 'gaardsincentiv', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Arla.com — FarmAhead sustainability' },
    ],
  },
  {
    id: 'ins-109',
    title: 'Brasil PNAE: 71,2% av kommuner naar 30%-familiebruk-krav — 120 000 familier, 40 mill elever',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Brasil PNAE (Lov 11.947/2009) forvaltet av FNDE dekker ca 40 millioner elever og 50+ millioner daglige maaltider. 30%-regelen krever at en tredjedel av offentlig skolemat kjoepes fra familielandbruk — 71,2% av undersoekte kommuner naar kravet, og ca halvparten av landets kommuner fortsatt under kravet. Modellen beviser at policy kan flytte stoerre volum naar den er lovfestet og budsjettmessig forankret — relevant for nordisk diskusjon om 30%-klimavekt og maaltidsprosjekter.',
    tags: ['benchmark', 'PNAE', 'Brasil', 'offentlige-innkjoep', 'familielandbruk', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'FAO Brazil programme / Global Alliance Against Hunger' },
    ],
  },
  {
    id: 'ins-110',
    title: 'Framstillinger 2020-2026: to narrative poler — beredskap og kjoepekraft',
    type: 'analyse',
    source: 'Forskningsrunde 2026-04-20 / Framstillinger av mat, makt og beredskap',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Norsk offentlig diskurs om mat har konvergert mot to narrative poler 2020-2026: (1) mat-som-beredskap (pandemi, Ukrainakrigen, Riksrevisjonen 2023, beredskapslagre 2024-26) og (2) mat-som-kjoepekraft (inflasjon 2022 +11,5%, dagligvaremakt). Stoerste analytiske fravaerende temaer er distribusjon/tilgang i krise, importavhengighetens dybde, og sirkularitet utover matsvinn. Anbefaling: hvitbokens rammeverk bor flyttes fra "billig mat" og "hoyere selvforsyningsprosent" til "trygg, rettferdig og robust matforsyning".',
    tags: ['media-framing', 'beredskap', 'kjoepekraft', 'diskursanalyse', 'hvitbok', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Riksrevisjonen — Matsikkerhet og beredskap 2023' },
      { label: 'SIFO/OsloMet — dyrtiden research' },
      { label: 'Matvett 2025 — husholdningens matsvinn' },
    ],
  },
  {
    id: 'ins-111',
    title: 'Regulatorisk tidslinje 2024-2026 — 8 hoeydepunkter for dagligvarepolitikk',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / Syntese',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Aatte regulatoriske ankerpunkter i perioden: (1) 1. januar 2024 — nye negative servitutter forbudt; (2) 18. april 2024 — Stortingsinstruks om 50% selvforsyning innen 2030; (3) 25. juni 2024 — beredskapslager matkorn-avtaler; (4) 19. mai 2025 — regjeringens konkurransepakke dagligvare; (5) 20. juni 2025 — matsvinnloven sanksjonert; (6) 22. desember 2025 — lov 129/2025 (forskrift 2026-04-17-601); (7) 30. april 2026 — handheving av lov om god handelsskikk flyttes til Konkurransetilsynet; (8) 1. november 2026 — NOU-frist matsystemutvalget.',
    tags: ['regulering', 'tidslinje', 'policy-events', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Regjeringen — 19. mai 2025 konkurransepakke', url: 'https://www.regjeringen.no/id3101561/' },
      { label: 'Regjeringen — beredskapslager matkorn', url: 'https://www.regjeringen.no/id3046671/' },
    ],
  },
  {
    id: 'ins-112',
    title: 'STROBE+GRADE-ramverk for FS2026 evidensregister',
    type: 'notat',
    source: 'Forskningsrunde 2026-04-20 / Evidensnotat',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'FS2026 boer bruke STROBE (kildemetadata) og GRADE (tillitsgradering) som skjelett for evidensregister. 8 prioriterte metadatafelt: (1) kildeopprinnelse, (2) dato/feltperiode, (3) studiedesign, (4) geografisk omfang, (5) utvalgsstoerrelse, (6) utfall/indikator, (7) sammenligning/basislinje, (8) begrensninger/bias. Tre epistemiske kategorier: dokumentert / analyse-tolkning / arbeidshypotese. Anbefalt tidslinje: 1-2 dager kildeinventar, 2-4 dager utfallsekstraksjon, 3-5 dager GRADE-gradering foer hvitbokscopy.',
    tags: ['metodikk', 'STROBE', 'GRADE', 'evidens', 'hvitbok', 'forskningsrunde-2026-04-20'],
  },
  {
    id: 'ins-113',
    title: 'Norges sirkulaer matinnovasjon: biogass, tare, plantebasert, CSA — fem laererike case',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / Norges matrevolusjon-compass',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Fem norske sirkulaere matcase som alle skalerer ved aa binde seg til eksisterende verdikjeder (Coop, Orkla, Pelagia) istedenfor stoppe alene: (1) Den Magiske Fabrikken (Greve Biogass, Vestfold) — 120 000 tonn matavfall + gjoedsel til ca 120 GWh biogass + CO2 til naboens klimatomater; (2) Alginor ASA (Haugesund) — biorafineri inntil 50 000 tonn tare/aar, AORTA-teknologi; (3) Pelagia kjoepte Hordafor 2021 (NOK 477m) — 180 000 tonn fiskebirestraavare; (4) Orkla Alternative Proteins (2021) — NOK 3 mrd omsetningsmaal 2025, Naturli fava-hamburger; (5) Avisomo+Coop JV Himmelgroent (2023) — 100 tonn salat/aar vertikalt paa Gardermoen. 80-90 aktive CSA-gaarder i 2024, vs 1 i 2006.',
    tags: ['sirkulaer', 'biogass', 'tare', 'plantebasert', 'vertikalt-landbruk', 'CSA', 'Norge', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'FoodProFuture (Nofima)' },
      { label: 'Den Magiske Fabrikken — Greve Biogass' },
    ],
  },
  {
    id: 'ins-114',
    title: 'Nordisk foodservice-grossistkart: Kespro 49% FI, ASKO dominant NO, Martin & Servera + Menigo SE',
    type: 'kartlegging',
    source: 'Forskningsrunde 2026-04-20 / HORECA-analyse',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Foodservice-grossist konsentrasjon er hoy paa tvers av Norden, parallell til dagligvaredelen. Norge: ASKO (NG-eid) stoerst, Servicegrossistene #2, Norengros #3. Sverige: Martin & Servera (Axel Johnson), Menigo, Dagab (Axfood). Finland: Kespro ca 49% av foodservice-grossist (del av Kesko, EUR 2,5 mrd marked 2025), Meira Nova, Metro-tukku, Valio Aimo. Danmark: Dagrofa, Hoerkram Foodservice, Dansk Cater, BC Catering. Hoy vertikal integrasjon med detaljhandel gjoer at HORECA-offentlig-innkjoep blir enda mer eksponert for samme innkjoepsmakt.',
    tags: ['HORECA', 'grossist', 'ASKO', 'Kespro', 'Martin-Servera', 'Dagrofa', 'nordisk', 'forskningsrunde-2026-04-20'],
  },
  {
    id: 'ins-115',
    title: 'Norsk 30%-klimavekt i offentlige innkjoep fra 1. januar 2024',
    type: 'funn',
    source: 'Forskningsrunde 2026-04-20 / HORECA-analyse',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Fra 1. januar 2024 skal norske offentlige innkjoep vekte klima- og miljoehensyn minst 30% (alternativt som kravspesifikasjon). Kombinert med fragmentert norsk skolemaaltidssystem, ~1/3 av sykehuspasienter underernaerte eller i risiko (Helsedirektoratet), og manglende nasjonal maaltidsstandard, gir dette betydelig uutnyttet loeftepotensial. Motiva (FI) har utgitt nasjonal innkjoepsveileder januar 2026 som benchmark for struktur-tilnaerming. Koebenhavns 87,8% oekologisk og Soedertaelje 24 000 maaltider/dag samme budsjett er direkte relevante best-practice.',
    tags: ['offentlig-innkjoep', 'klimavekt', 'HORECA', 'Norge', '30-prosent-regel', 'forskningsrunde-2026-04-20'],
    sources: [
      { label: 'Regjeringen — 30% klima/miljoe pressmelding' },
      { label: 'Motiva — Responsible Food Procurement Guide 2026' },
      { label: 'Helsedirektoratet — Kartlegging ernaering 2024' },
    ],
  },
  {
    id: 'ins-116',
    title: 'Under-rapportering er hovedeffekten — ikke lav lovbruddssats',
    type: 'analyse',
    source: 'Forskningsrunde 2026-04-20 / Makt og fryktkultur',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Aarsakskjeden i nordisk dagligvare: konsentrasjon → avhengighet → frykt → svak rapportering → svak handheving → narrow lov treffer ikke de mest effektive formene for makt. Overflytting av handheving til Konkurransetilsynet (30. april 2026) loeser ikke dette uten (a) styrket materielle bestemmelser i Lov om god handelsskikk og (b) klar varsleverbeskyttelse. Internasjonal erfaring: bred UTP-lovgivning i DK/FI gir fortsatt lav innleveringssats naar markedsstruktur er toppkonsentrert.',
    tags: ['fryktkultur', 'handheving', 'varsler', 'UTP', 'Konkurransetilsynet', 'forskningsrunde-2026-04-20'],
  },
  {
    id: 'ins-117',
    title: 'Tre motorer for faktisk endring: etterspoersel, operasjon, finansiering',
    type: 'analyse',
    source: 'Forskningsrunde 2026-04-20 / Benchmark-rapport',
    phase: 'fase-2',
    date: '2026-04-20',
    description:
      'Syntese fra 10 nordisk-internasjonale benchmarks: case som faktisk har flyttet praksis/policy/kapital kombinerer tre motorer: (1) demand (innkjoep/pris/regulering) — Garot-loven, 30%-regelen, Koebenhavn maaltidsprogram; (2) operational (opplaering/data/logistikk) — Koebenhavns Madhus-opplaering, PeelPioneers logistikk, FarmAhead-data; (3) finance (tilskudd/fond/kontrakter) — Plantefonden, Agrain-kapital, PNAE-budsjett. Policy og markedsmodeller utfyller — Soer-Korea+Frankrike viser regulering virker naar det gjoer praksis obligatorisk; TGTG+REKO viser marked virker naar det gjoer praksis enkel+attraktiv.',
    tags: ['benchmark', 'transformasjon', 'policy-design', 'forskningsrunde-2026-04-20'],
  },
]
