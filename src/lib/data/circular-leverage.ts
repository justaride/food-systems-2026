import type { EvidenceStatus, VisualizationSourceRef } from '@/lib/visualization/types'

export type EffectLevel = 'high' | 'medium' | 'low'
export type LeverageCountry = 'NO' | 'SE' | 'DK' | 'FI' | 'IS' | 'nordic'

export type CircularLeverage = {
  id: string
  rank: number
  country: LeverageCountry
  title: string
  shortTitle: string             // Brukes i aria-labels og for fremtidig tett-rangerings-visning
  effects: {
    klima: EffectLevel
    natur: EffectLevel
    forurensning: EffectLevel
    // Objektivfunksjon Sett II (vedtak 2026-06-18): resiliens + distrikt lagt til.
    // Bevisst valgfrie og USCORET (undefined) for de fleste punkter — det synliggjør
    // dekningsblindsonen i stedet for å fabrikkere scorer. helse = fase 2 (tom).
    resiliens?: EffectLevel
    distrikt?: EffectLevel
    helse?: EffectLevel
  }
  aggregate: EffectLevel
  headline: string
  justification: string
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
  barriers: string[]
  policyLevers: string[]
  relatedLoopIds?: string[]
  relatedGapIds?: string[]
  relatedActorCases?: string[]
  relatedQuestionIds?: string[]
}

export const lastUpdated = '2026-04-29'

// Objektivfunksjon-linser (vedtak Sett II, 2026-06-18). Fase 1 = aktive dimensjoner;
// fase 2 = planlagt blindsone (helse) som bevisst står tom til den åpnes.
export type ObjectiveDimension =
  | 'klima'
  | 'natur'
  | 'forurensning'
  | 'resiliens'
  | 'distrikt'
  | 'helse'

export const objectiveDimensions: { id: ObjectiveDimension; label: string; phase: 1 | 2 }[] = [
  { id: 'klima', label: 'Klima', phase: 1 },
  { id: 'natur', label: 'Natur', phase: 1 },
  { id: 'forurensning', label: 'Forurensning', phase: 1 },
  { id: 'resiliens', label: 'Resiliens', phase: 1 },
  { id: 'distrikt', label: 'Distrikt/bonde', phase: 1 },
  { id: 'helse', label: 'Helse (fase 2)', phase: 2 },
]

/** Effektnivå for en gitt objektiv-dimensjon, eller undefined hvis tiltaket ikke er scoret (dekningshull). */
export function objectiveLevel(l: CircularLeverage, dim: ObjectiveDimension): EffectLevel | undefined {
  return l.effects[dim]
}

/** Antall tiltak scoret på en dimensjon (for å synliggjøre dekningsgrad i UI). */
export function objectiveCoverage(dim: ObjectiveDimension): { scored: number; total: number } {
  const total = circularLeverages.length
  const scored = circularLeverages.filter((l) => l.effects[dim] != null).length
  return { scored, total }
}

export const circularLeverages: CircularLeverage[] = [
  {
    id: 'no-husholdningssvinn',
    rank: 1,
    country: 'NO',
    title: 'Forebygging av husholdningssvinn',
    shortTitle: 'Husholdningssvinn',
    effects: { klima: 'high', natur: 'medium', forurensning: 'low' },
    aggregate: 'high',
    headline: '215 000 t/år · −5 % per capita siden 2015 (vs retail −21 %)',
    justification:
      'Husholdninger står for 53 % av norsk matsvinn (215 000 t/år) og er sektoren der reduksjons­takten er lavest. NORSUS dokumenterer at forebygging er 5–10× mer klimaeffektivt enn gjenvinning, så hver tonn forebygget husholdningssvinn slår hardere på klima enn tilsvarende biogass-konvertering. Klimafotavtrykket fra svinn er allerede redusert 28 % fordi de mest klimaintensive varene (kjøtt, meieri) er prioritert. Matsvinnloven (2025) gir aktsomhetsplikt og prisreduksjon, men husholdnings­adferd krever kampanjer av UK WRAP-typen for å akselerere fra ~2,7 pp/år til ~4,3 pp/år som trengs mot 2030-målet.',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Whitepaper §7.2', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Sirkularitet-dyp Track 1', path: 'research/bibliotek/sirkularitet-dyp.md' },
      { label: 'Matvett 2024', href: 'https://www.matvett.no/uploads/documents/Slik-var-matsvinnaret-2024.pdf' },
    ],
    barriers: [
      '«Best før»-forvirring gir forkasting',
      'Ingen direkte økonomisk insentiv per husholdning',
      'Adferd vanskelig å endre uten kampanje­infrastruktur',
    ],
    policyLevers: [
      'Implementer matsvinnloven 2026 med tydelige forskrifter',
      'UK WRAP-style nasjonal husholdnings­kampanje',
      'EU-datomerkings­reform innfases via EØS',
      'Donasjonsplikt aktiveres → tredobler Matsentralen-volumer',
    ],
    relatedLoopIds: ['no-matsentralen', 'nordic-tgtg'],
    relatedGapIds: ['gap-husholdningssvinn'],
    relatedActorCases: ['Too Good To Go'],
    relatedQuestionIds: ['q-husholdningssvinn'],
  },
  {
    id: 'se-matsvinn-stagnasjon',
    rank: 2,
    country: 'SE',
    title: 'Reverser matsvinn-stagnasjon',
    shortTitle: 'SE matsvinn-stagnasjon',
    effects: { klima: 'high', natur: 'low', forurensning: 'low' },
    aggregate: 'high',
    headline: '880 000 t/år · 0 % reduksjon siden 2020 — etappmål 2025 ikke nådd',
    justification:
      'Sverige har 330 biogassanlegg og 39 % økologisk offentlig innkjøp — men matsvinnet har ikke falt på fire år. Etappmålet om 20 % reduksjon innen 2025 er ikke nådd. Restaurantsektoren viser økende svinn. Forebygging er 5–10× mer klimaeffektivt enn gjenvinning (NORSUS), så stagnasjonen utgjør Nordens største enkeltgap når man veier volum mot leverage.',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Whitepaper §7.4', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Naturvårdsverket 2024 (nettsted)', href: 'https://www.naturvardsverket.se/' },
    ],
    barriers: [
      'Ingen nasjonal matsvinnlov (vs Norge 2025)',
      'Frivillig bransjeavtale mangler',
      'Husholdnings­adferd lite kartlagt på svenske data',
    ],
    policyLevers: [
      'Adoptere norsk matsvinnlov-modell',
      'UK WRAP-style husholdnings­kampanje',
      'Datomerkings­reform via EU',
    ],
    relatedLoopIds: ['nordic-tgtg', 'fi-se-reko'],
    relatedGapIds: ['gap-husholdningssvinn'],
    relatedActorCases: ['Too Good To Go'],
    relatedQuestionIds: ['q-husholdningssvinn'],
  },
  {
    id: 'no-biogass-gap',
    rank: 3,
    country: 'NO',
    title: 'Lukke 11× biogass-gap til DK-nivå',
    shortTitle: 'NO biogass-gap',
    effects: { klima: 'high', natur: 'medium', forurensning: 'high', resiliens: 'high', distrikt: 'medium' },
    aggregate: 'high',
    headline: '5–7 TWh potensial · 1,5–3 mill. tonn CO₂e/år',
    justification:
      'Norge produserer 0,7 TWh biogass mens Danmark produserer ~8 TWh — et 11× gap som primært skyldes virkemiddeldesign. Danmark har 20-års forutsigbar feed-in-premium; Norge har hatt kortsiktige ordninger. Norsk potensial er 5,5–11 TWh, hvorav fiskeslam alene utgjør 3 TWh. Hiis et al. (2024) i Nature viser at biorest fra biogass kan bære bakterier som reduserer N₂O-utslipp betydelig — biogass er både klimagevinst, forurensnings­reduksjon (gjødsel-tap) og næringsstoff-plattform.',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Sirkularitet-dyp Track 2', path: 'research/bibliotek/sirkularitet-dyp.md' },
      { label: 'Biogas Outlook 2025 (DK)', href: 'https://www.biogas.dk/wp-content/uploads/2025/11/Biogas-Outlook-2025-English-2nd-September.pdf' },
      { label: 'Biogassplattformen NO', href: 'https://biogassnorge.no/wp-content/uploads/2025/04/Biogassplattformen.pdf' },
    ],
    barriers: [
      'Mangler langsiktig feed-in-premium',
      'Ingen naturgassnett for biomethan-injeksjon',
      'Fragmentert gjødsels-innsamling',
    ],
    policyLevers: [
      'Adoptere dansk 20-års feed-in-premium-modell',
      'Mandat for husdyrgjødsel-behandling i Rogaland som pilot',
      'Investering i LBG-fyllstasjoner for tungtransport/sjøfart',
      'Kommunal mandat for matavfall til biogass',
    ],
    relatedLoopIds: ['dk-biogas', 'se-biogas', 'nordic-gasum'],
    relatedGapIds: ['gap-biogass-norge'],
    relatedActorCases: ['Den Magiske Fabrikken', 'Gasum'],
    relatedQuestionIds: [],
  },
  {
    id: 'no-akvakultur-slam',
    rank: 4,
    country: 'NO',
    title: 'Akvakultur-slam → biogass + P-gjenvinning',
    shortTitle: 'NO akvakultur-slam',
    effects: { klima: 'medium', natur: 'high', forurensning: 'high', resiliens: 'high' },
    aggregate: 'high',
    headline: '70 % av N/P fra åpne anlegg slippes i fjord · 3 TWh + struvitt-potensial',
    justification:
      'Åpne oppdrettsanlegg slipper ~70 % av fôringsstoffene rett i fjorden — direkte kobling fra matsystem til marin eutrofiering. Dette er Nordens største enkelt-bidrag til fjord-eutrofiering. Norge importerer 100 % av fosfat; HIAS-prosessen viser at biofilm-basert P-gjenvinning er teknisk moden og 40–50 % billigere enn kjemisk rensing. Lukkede anlegg + biogass + struvitt-gjenvinning løser tre problemer samtidig (klima via energi, natur via redusert fjord-utslipp, forurensning via N/P-fangst).',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Sirkularitet-dyp Track 4', path: 'research/bibliotek/sirkularitet-dyp.md' },
      { label: 'Frontiers Sustainable Food Systems', href: 'https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2023.1248984/full' },
    ],
    barriers: [
      'Kapitaltung overgang til lukkede anlegg',
      'Regulatorisk uvisshet rundt resirkulert gjødsel',
      'Logistikk for fiskeslam-innsamling fra havflåten',
    ],
    policyLevers: [
      'Mandat for slam-innsamling fra landbaserte oppdrettsanlegg',
      'Prising av fjord-utslipp av N/P',
      'Subsidiebro for P-gjenvinning etter HIAS-modell',
    ],
    relatedLoopIds: ['no-fiskeavfall'],
    relatedGapIds: ['gap-oppdrettsslam', 'gap-oppdrett-npk-fjord', 'gap-fiskeavfall-havet'],
    relatedActorCases: ['Finnforel'],
    relatedQuestionIds: ['q-lukkede-anlegg'],
  },
  {
    id: 'no-offentlig-innkjop',
    rank: 5,
    country: 'NO',
    title: 'Offentlig innkjøp etter København-modell',
    shortTitle: 'NO offentlig innkjøp',
    effects: { klima: 'high', natur: 'high', forurensning: 'medium', distrikt: 'medium' },
    aggregate: 'high',
    headline: '611 mrd. NOK uten øko-mål · KBH har 84 % økologisk uten budsjettøkning',
    justification:
      'Norge har 611 mrd. NOK i offentlige innkjøp uten nasjonal måling av økologisk andel. Danmark har 60 %-mål; Sverige 60 %-mål med 39 % oppnådd. København oppnår 84 % økologisk i 1 000+ kjøkken med 70 000 måltider daglig — uten økt budsjett. Dette er det eneste tiltaket på listen som krever null ny teknologi: politisk vilje + kompetanseheving av kjøkkenpersonell er hele løsningen. Strukturell virkning: stabilt offentlig marked reduserer omleggingsrisiko for produsenter og driver pesticid-reduksjon (KBH har beskyttet 370 mill. l grunnvann).',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Whitepaper §7.3', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Future of Food Foundation 2024 (nettsted)', href: 'https://www.futureoffoodfoundation.org/' },
    ],
    barriers: [
      'Ingen nasjonale mål eller måling',
      'Fragmentert kommunal praksis',
      'DFØ mangler mandat for bindende mål',
    ],
    policyLevers: [
      'Nasjonal måling av økologisk andel i offentlige kjøkken',
      'Mål 30 % økologisk innen 2030, 60 % innen 2035',
      'Kompetanseheving av kjøkkenpersonell etter KBH-modell',
      'Klima/miljø-vekting (30 %) konkretiseres med øko-andel',
    ],
    relatedLoopIds: ['fi-skolmat'],
    relatedGapIds: ['gap-regenerativ-omstilling'],
    relatedActorCases: [],
    relatedQuestionIds: ['q-regenerativt'],
  },
  {
    id: 'dk-co2-avgift-kjott',
    rank: 6,
    country: 'DK',
    title: 'CO₂-avgift kjøttproduksjon 2030',
    shortTitle: 'DK CO₂-avgift kjøtt',
    effects: { klima: 'high', natur: 'medium', forurensning: 'low' },
    aggregate: 'medium',
    headline: 'Verdens første CO₂-avgift på kjøttproduksjon · iverksettes 2030',
    justification:
      'Danmark blir det første landet i verden som innfører CO₂-avgift på kjøttproduksjon, fra 2030. Dette er en strukturell intervensjon på pris-signalet i et nordisk matsystem dominert av kjøtt-eksport (DK har 300 % selvforsyning på animalske produkter). Forventet effekt: forskyvning mot plante-protein, redusert metan-utslipp, og presedens for andre nordiske land. Implementerings-fasen 2026–2030 er kritisk — design av overgangsstøtte og unntak avgjør om regenerativ omstilling skjer eller om eksport bare flyttes til andre land.',
    evidenceStatus: 'illustrative',
    sourceRefs: [
      { label: 'Whitepaper §7.4', path: 'research/whitepaper/section-7-circular-food-systems.md' },
    ],
    barriers: [
      'Politisk motstand fra eksportlandbruks-lobby',
      'Risiko for produksjons­flytting til andre land uten avgift',
      'Mangel på overgangsstøtte for bønder',
    ],
    policyLevers: [
      'Detaljerte forskrifter med overgangs­ordning 2026–2030',
      'EU-koordinering for å unngå karbon-lekkasje',
      'Provenuet øremerkes regenerativ omstilling',
    ],
    relatedLoopIds: ['dk-kalundborg'],
    relatedGapIds: ['gap-regenerativ-omstilling'],
    relatedActorCases: [],
    relatedQuestionIds: ['q-regenerativt'],
  },
  {
    id: 'nordic-matsentraler-skala',
    rank: 7,
    country: 'nordic',
    title: 'Skala matredistribusjon (Matsentralen-modell)',
    shortTitle: 'Norden matsentraler',
    effects: { klima: 'medium', natur: 'low', forurensning: 'low' },
    aggregate: 'medium',
    headline: 'Matsentralen NO redistribuerer 3,7× mer enn DK · potensial 15–20 000 t/år',
    justification:
      'Matsentralen Norge redistribuerer 6 000 t/år (10 mill. måltider) — 3,7× mer enn dansk Fødevarebanken trass mindre befolkning. Med matsvinnlovens donasjonsplikt kan volumene tredobles til 15–20 000 t/år. Redistribusjon er på topptrinnet av avfallshierarkiet (R2 gjenbruk) — mat redirigeres fra kasse til konsum, ikke til biogass. Klimaeffekt per tonn er moderat sammenlignet med forebygging, men Norden har her én av sine få lederposisjoner — modellen kan eksporteres til DK/SE/FI.',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Sirkularitet-dyp 4.3-4.4', path: 'research/bibliotek/sirkularitet-dyp.md' },
      { label: 'Matsentralen NO', href: 'https://www.matsentralen.no/' },
      { label: 'Fødevarebanken DK', href: 'https://foedevarebanken.dk/' },
    ],
    barriers: [
      'Logistikk: kjøletransport og lagerkapasitet',
      'Sentralisert anerkjennelse som infrastruktur, ikke veldedighet',
      'Fragmentert offentlig medfinansiering',
    ],
    policyLevers: [
      'Aktiver donasjons­plikten i matsvinnloven',
      'Offentlig medfinansiering av kjøletransport og lager',
      'Eksporter Matsentralen-modellen til DK/SE/FI',
    ],
    relatedLoopIds: ['no-matsentralen'],
    relatedGapIds: ['gap-matsentralen-kapasitet'],
    relatedActorCases: ['Foodsharing Copenhagen', 'Restaurant Rest'],
    relatedQuestionIds: [],
  },
  {
    id: 'se-helsingborg-svartvann',
    rank: 8,
    country: 'SE',
    title: 'Helsingborg svartvann skaleres nordisk',
    shortTitle: 'SE svartvann-modell',
    effects: { klima: 'low', natur: 'high', forurensning: 'high' },
    aggregate: 'medium',
    headline: '320 boliger operativt · eneste nordisk skala-pilot på «missing link»',
    justification:
      'Helsingborg Oceanhamnen har 320 boliger i operativt separat svartvann-system med næringsstoffgjenvinning. Dette er Nordens eneste skala-pilot på det JT kaller en «missing link»: enorme N/P-mengder fra husholdninger og oppdrett går til renseanlegg eller fjord uten gjenvinning. Skalering vil treffe Østersjø-eutrofiering direkte og lukke næringsstoff-sløyfen tilbake til landbruket — adresserer Nordens akutteste natur-problem (Østersjø-død­soner).',
    evidenceStatus: 'observed',
    sourceRefs: [
      { label: 'Whitepaper §7.5', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Mote JT-Gabriel 20.04.26', path: 'research/' },
    ],
    barriers: [
      'Eksisterende sentralisert avløpsinfrastruktur',
      'Energi til pumping over avstand',
      'Offentlig aksept (smitte-oppfatning)',
      'Gjødselregulering for resirkulerte kilder',
    ],
    policyLevers: [
      'Pilot-mandat for nye boligfelt-utbygginger',
      'EU-direktiv om byavløp tilpasset gjenvinning',
      'Næringsstoff-regnskap som regulatorisk krav',
    ],
    relatedLoopIds: ['se-helsingborg-blackwater'],
    relatedGapIds: ['gap-svartvann-naeringsgjenvinning', 'gap-svartvann-fosfor', 'gap-svartvann-nitrogen'],
    relatedActorCases: ['Helsingborg svartvann (Oceanhamnen)'],
    relatedQuestionIds: ['q-svartvann'],
  },
  {
    id: 'fi-alternativt-protein',
    rank: 9,
    country: 'FI',
    title: 'Industrialiser alternativt protein (Volare/Enifer/Solar Foods)',
    shortTitle: 'FI alt. protein',
    effects: { klima: 'medium', natur: 'high', forurensning: 'medium', resiliens: 'high' },
    aggregate: 'medium',
    headline: 'Volare €26M · Enifer PEKILO · Solar Foods · de få som lykkes med akademia→industri',
    justification:
      'Finland har de tre mest skalerte nordiske aktørene innen alternativt protein: Volare (€26M, insektprotein fra matavfall), Enifer (PEKILO mycoprotein fra skogindustri-sidestrømmer), og Solar Foods (Solein, gass­fermentering). Alle tre er sjeldne suksesser i akademia→industri-overgangen — de fleste forsknings­spor stopper ved doktorgrad. Industrialisering kan redusere norsk soya-import (5–10 % erstatning ved skala) og frigjøre fôr-areal globalt for natur. EU-godkjenning for insektprotein i fjørfe/svin er på plass; akvakultur-fôr under vurdering.',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Sirkularitet-dyp 3.3', path: 'research/bibliotek/sirkularitet-dyp.md' },
      { label: 'Volare', href: 'https://www.volareprotein.com/' },
      { label: 'Enorm Biofactory case', href: 'https://www.feedstrategy.com/business-markets/company-news/article/15660095/enorm-biofactory-opens-largest-insect-factory-in-northern-europe' },
    ],
    barriers: [
      'Prisgap: insektmel 2–10× dyrere enn soya/fiskemel',
      'Fôrprodusenter bytter ikke uten prisparitet',
      'Variabel avfallsstrøm = variabel kvalitet',
      'EU-regulering for akvakultur-fôr ennå ikke ferdig',
    ],
    policyLevers: [
      'Foravgift på importert soya finansierer omstilling',
      'EU-forhandling om akvakultur-godkjenning',
      'Skaleringsstøtte mellom TRL 4 og TRL 7',
    ],
    relatedLoopIds: ['no-tine-myse', 'nordic-bryggerimask-for'],
    relatedGapIds: ['gap-insektprotein', 'gap-akademia-industri'],
    relatedActorCases: ['Volare', 'Solar Foods (Solein)', 'Enorm Biofactory', 'Mycorena'],
    relatedQuestionIds: ['q-alternativt-for', 'q-akademia-skala'],
  },
  {
    id: 'is-fiskeri-svinn',
    rank: 10,
    country: 'IS',
    title: 'Kartlegg + valoriser fiskeri-svinn',
    shortTitle: 'IS fiskeri-svinn',
    effects: { klima: 'low', natur: 'high', forurensning: 'high' },
    aggregate: 'medium',
    headline: '~50 % av islandsk matsvinn er fiskerirelatert · ukartlagt',
    justification:
      'Island har estimert ~50 % av sitt matsvinn knyttet til fiskeri, men dette er ikke kartlagt på nivå med de andre nordiske landene. Det globale potensialet for valorisering av fiskeavfall (omega-3-konsentrater, kollagen, gelatin, fiskeprotein-hydrolysat) er stort, og Islands fiskeri-dominans gjør dette til den enkleste sirkulære innovasjons-arenaen i landet. Melta (matavfall til gjødsel) er et eksempel på lokal sirkulær innovasjon. Kartlegging er forutsetning — uten data er prioritering umulig.',
    evidenceStatus: 'illustrative',
    sourceRefs: [
      { label: 'Whitepaper §7.4', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Umhverfisstofnun (nettsted)', href: 'https://www.ust.is/' },
    ],
    barriers: [
      'Liten skala på forsknings­infrastruktur',
      'Begrenset redistribusjons­infrastruktur',
      'Estimater ikke målinger',
    ],
    policyLevers: [
      'Nordisk Ministerråd-finansiert IS-måling',
      'Nordisk harmonisering av fiskeri-svinndata',
      'Skalering av Melta-modell',
    ],
    relatedLoopIds: ['no-fiskeavfall'],
    relatedGapIds: ['gap-fiskeavfall-havet'],
    relatedActorCases: ['Melta'],
    relatedQuestionIds: [],
  },
]
