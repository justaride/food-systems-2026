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
]
