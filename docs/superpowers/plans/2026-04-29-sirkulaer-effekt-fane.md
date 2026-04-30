# `/sirkularitet` effekt-fane — implementasjonsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Legge til en preskriptiv `effekt`-fane på `/sirkularitet` som rangerer topp 10 sirkulære tiltak × land etter kvalitativ effekt på klima, natur og forurensning, med drilldown og lenking til eksisterende loops/gaps/aktører.

**Architecture:** Static editorial data (10 entries) i en typed TS-fil. Audit-script verifiserer integritet mot eksisterende `circularity-loops.json` og `circularityQuestions`. Tre nye komponenter (`EffectBar`, `EffektRow`, `EffektTab`) integreres i eksisterende `SirkularitetContent` via en ny tab-id. Stat e-bro lar rad-drilldowns navigere til relaterte elementer på andre faner.

**Tech Stack:** TypeScript, Next.js 15 App Router, Tailwind CSS, `tsx` for scripts. Eksisterende `EvidenceStatusBadge`, `Card`-komponenter og `circularity-loops.json` gjenbrukes. Ingen test-rammeverk i prosjektet — datagaranti via audit-script.

**Spec:** `docs/superpowers/specs/2026-04-29-sirkulaer-effekt-fane-design.md`

---

## File Structure

| Fil | Status | Ansvar |
|---|---|---|
| `src/lib/data/circular-leverage.ts` | Create | Type-definisjoner, `lastUpdated`-konstant, 10 redaksjonelle leverage-entries |
| `scripts/audit-circular-leverage.ts` | Create | Validerer at alle `relatedLoopIds`/`relatedGapIds`/`relatedQuestionIds`/`relatedActorCases` peker til faktiske IDer |
| `package.json` | Modify | Legg til `audit:circular-leverage`-script |
| `src/components/charts/EffectBar.tsx` | Create | Liten primitiv: én bar med farge/bredde-mapping for klima/natur/forurensning |
| `src/components/charts/EffektMethodologyCard.tsx` | Create | Bunn-kort med metodikk-forklaring |
| `src/components/charts/EffektRow.tsx` | Create | Én rad — kollapset header + ekspandert drilldown |
| `src/components/charts/EffektTab.tsx` | Create | Hele faninnholdet: header, toggle-bar, sortert liste, methodology-kort |
| `src/app/sirkularitet/SirkularitetContent.tsx` | Modify | Legg til `'effekt'`-tab, state-bro for kryss-fane-navigasjon |

---

## Task 1: Datafil med types og første entry (rank #1)

**Files:**
- Create: `src/lib/data/circular-leverage.ts`

- [ ] **Step 1: Opprett fil med types, `lastUpdated`, og første entry**

```typescript
import type { EvidenceStatus, VisualizationSourceRef } from '@/lib/visualization/types'

export type EffectLevel = 'high' | 'medium' | 'low'
export type LeverageCountry = 'NO' | 'SE' | 'DK' | 'FI' | 'IS' | 'nordic'

export type CircularLeverage = {
  id: string
  rank: number
  country: LeverageCountry
  title: string
  shortTitle: string
  effects: {
    klima: EffectLevel
    natur: EffectLevel
    forurensning: EffectLevel
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
]
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes (filen er enslig, ingen feil)

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/circular-leverage.ts
git commit -m "feat(sirkularitet): add circular-leverage data type and first entry"
```

---

## Task 2: Audit-script som validerer integritet

**Files:**
- Create: `scripts/audit-circular-leverage.ts`
- Modify: `package.json` (legg til script-kommando)

- [ ] **Step 1: Skriv audit-scriptet**

```typescript
#!/usr/bin/env tsx
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { circularLeverages } from '../src/lib/data/circular-leverage'
import { circularityQuestions } from '../src/lib/data/circularity-questions'

type LoopJson = {
  existing_loops: { id: string }[]
  gaps: { id: string }[]
  actor_cases: {
    success: { name: string }[]
    failure: { name: string }[]
  }
  additional_success: { name: string }[]
  additional_failure: { name: string }[]
}

const root = resolve(__dirname, '..')
const loopsPath = resolve(root, 'public/data/food-systems/circularity-loops.json')
const loops: LoopJson = JSON.parse(readFileSync(loopsPath, 'utf-8'))

const validLoopIds = new Set(loops.existing_loops.map((l) => l.id))
const validGapIds = new Set(loops.gaps.map((g) => g.id))
const validQuestionIds = new Set(circularityQuestions.map((q) => q.id))
const validActorNames = new Set([
  ...loops.actor_cases.success.map((a) => a.name),
  ...loops.actor_cases.failure.map((a) => a.name),
  ...loops.additional_success.map((a) => a.name),
  ...loops.additional_failure.map((a) => a.name),
])

const errors: string[] = []
const seenRanks = new Set<number>()
const seenIds = new Set<string>()

for (const lev of circularLeverages) {
  if (seenRanks.has(lev.rank)) {
    errors.push(`Duplikat rank: ${lev.rank} på id=${lev.id}`)
  }
  seenRanks.add(lev.rank)

  if (seenIds.has(lev.id)) {
    errors.push(`Duplikat id: ${lev.id}`)
  }
  seenIds.add(lev.id)

  if (lev.rank < 1 || lev.rank > 10) {
    errors.push(`Rank ${lev.rank} på ${lev.id} er ute av 1..10`)
  }

  for (const loopId of lev.relatedLoopIds ?? []) {
    if (!validLoopIds.has(loopId)) {
      errors.push(`${lev.id}: relatedLoopId "${loopId}" finnes ikke i circularity-loops.json existing_loops`)
    }
  }

  for (const gapId of lev.relatedGapIds ?? []) {
    if (!validGapIds.has(gapId)) {
      errors.push(`${lev.id}: relatedGapId "${gapId}" finnes ikke i circularity-loops.json gaps`)
    }
  }

  for (const qId of lev.relatedQuestionIds ?? []) {
    if (!validQuestionIds.has(qId)) {
      errors.push(`${lev.id}: relatedQuestionId "${qId}" finnes ikke i circularityQuestions`)
    }
  }

  for (const actorName of lev.relatedActorCases ?? []) {
    if (!validActorNames.has(actorName)) {
      errors.push(`${lev.id}: relatedActorCase "${actorName}" finnes ikke i actor_cases`)
    }
  }
}

if (errors.length > 0) {
  console.error('audit:circular-leverage feilet:')
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

console.log(`audit:circular-leverage OK · ${circularLeverages.length} entries validert`)
```

- [ ] **Step 2: Legg til npm-script**

Modify `package.json` — finn `"scripts"`-objektet og legg til etter `"db:import"`-rekken:

```json
    "audit:circular-leverage": "tsx scripts/audit-circular-leverage.ts",
```

- [ ] **Step 3: Kjør audit-scriptet**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npm run audit:circular-leverage`
Expected: `audit:circular-leverage OK · 1 entries validert`

- [ ] **Step 4: Commit**

```bash
git add scripts/audit-circular-leverage.ts package.json
git commit -m "feat(sirkularitet): add audit script for circular-leverage data"
```

---

## Task 3: Legg til de resterende 9 entries

**Files:**
- Modify: `src/lib/data/circular-leverage.ts` (utvid `circularLeverages`-arrayet)

- [ ] **Step 1: Legg til entries 2–10 i `circularLeverages`-arrayet**

Etter første entry, legg til disse ni før den avsluttende `]`:

```typescript
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
      { label: 'Naturvårdsverket 2024', href: 'https://www.naturvardsverket.se/' },
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
    effects: { klima: 'high', natur: 'medium', forurensning: 'high' },
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
    effects: { klima: 'medium', natur: 'high', forurensning: 'high' },
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
    effects: { klima: 'high', natur: 'high', forurensning: 'medium' },
    aggregate: 'high',
    headline: '611 mrd. NOK uten øko-mål · KBH har 84 % økologisk uten budsjettøkning',
    justification:
      'Norge har 611 mrd. NOK i offentlige innkjøp uten nasjonal måling av økologisk andel. Danmark har 60 %-mål; Sverige 60 %-mål med 39 % oppnådd. København oppnår 84 % økologisk i 1 000+ kjøkken med 70 000 måltider daglig — uten økt budsjett. Dette er det eneste tiltaket på listen som krever null ny teknologi: politisk vilje + kompetanseheving av kjøkkenpersonell er hele løsningen. Strukturell virkning: stabilt offentlig marked reduserer omleggingsrisiko for produsenter og driver pesticid-reduksjon (KBH har beskyttet 370 mill. l grunnvann).',
    evidenceStatus: 'estimated',
    sourceRefs: [
      { label: 'Whitepaper §7.3', path: 'research/whitepaper/section-7-circular-food-systems.md' },
      { label: 'Future of Food Foundation 2024', href: 'https://www.futureoffoodfoundation.org/' },
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
    effects: { klima: 'medium', natur: 'high', forurensning: 'medium' },
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
      { label: 'Umhverfisstofnun', href: 'https://www.ust.is/' },
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
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 3: Kjør audit-scriptet**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npm run audit:circular-leverage`
Expected: `audit:circular-leverage OK · 10 entries validert`

Hvis noen `relatedLoopIds`/`relatedActorCases` ikke matcher: rett ID-en til en som finnes (sjekk `jq '[.existing_loops[].id]' public/data/food-systems/circularity-loops.json`), eller fjern referansen.

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/circular-leverage.ts
git commit -m "feat(sirkularitet): populate top 10 circular leverage entries"
```

---

## Task 4: `EffectBar`-primitiv

**Files:**
- Create: `src/components/charts/EffectBar.tsx`

- [ ] **Step 1: Skriv komponent**

```typescript
import type { EffectLevel } from '@/lib/data/circular-leverage'

type Dimension = 'klima' | 'natur' | 'forurensning'

const DIMENSION_LABEL: Record<Dimension, string> = {
  klima: 'Klima',
  natur: 'Natur',
  forurensning: 'Forurensning',
}

const DIMENSION_COLOR: Record<Dimension, string> = {
  klima: 'bg-red-600',
  natur: 'bg-green-600',
  forurensning: 'bg-blue-500',
}

const LEVEL_WIDTH: Record<EffectLevel, string> = {
  high: 'w-[90%]',
  medium: 'w-[60%]',
  low: 'w-[30%]',
}

const LEVEL_LABEL: Record<EffectLevel, string> = {
  high: 'høy',
  medium: 'medium',
  low: 'lav',
}

type Props = {
  dim: Dimension
  level: EffectLevel
}

export function EffectBar({ dim, level }: Props) {
  return (
    <div
      className="flex flex-col items-end gap-[2px]"
      aria-label={`${DIMENSION_LABEL[dim]}-effekt: ${LEVEL_LABEL[level]}`}
    >
      <div className="text-[10px] uppercase tracking-wide text-stone-400">{DIMENSION_LABEL[dim]}</div>
      <div className="w-16 h-[5px] bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full ${LEVEL_WIDTH[level]} ${DIMENSION_COLOR[dim]}`} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/EffectBar.tsx
git commit -m "feat(sirkularitet): add EffectBar component for leverage visualization"
```

---

## Task 5: `EffektMethodologyCard`

**Files:**
- Create: `src/components/charts/EffektMethodologyCard.tsx`

- [ ] **Step 1: Skriv komponent**

```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export function EffektMethodologyCard() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="bg-stone-50 border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-stone-700">Metodikk og forbehold</span>
        <svg
          className={`w-3 h-3 text-stone-500 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-xs text-stone-600 leading-relaxed">
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hvorfor ingen LCA?</p>
            <p>
              Vi har ikke en samlet nordisk LCA-komparator som rangerer tiltak per kg CO₂e, kg N/P og biodiversitets­påvirkning per investert krone. NORSUS dokumenterer at forebygging er 5–10× mer klimaeffektiv enn gjenvinning, og van der Fels-Klerx et al. (2024) påpeker at sirkularitet må passere et mattrygghet-gate-kriterium for å være systemisk forbedring. Inntil en samlet LCA er på plass, er rangeringen redaksjonell — basert på syntese av prosjektets research­dokumenter.
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hva vurderte vi?</p>
            <p>
              Vi inkluderte tiltak som har dokumentert volum-/effekt-grunnlag i forsknings­korpuset (whitepaper §7, sirkularitet-dyp, circularity-loops, circularity-questions) og som er meningsfulle på land- eller nordisk nivå. Tiltak med tynt grunnlag (kaffe-svinn, mikroplast i biorest, R4-emballasje) er parkert til mer research er tilgjengelig.
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hvordan foreslå endring</p>
            <p>
              Endringer skjer via PR mot{' '}
              <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">src/lib/data/circular-leverage.ts</code>{' '}
              i{' '}
              <a
                href="https://github.com/justaride/food-systems-2026"
                target="_blank"
                rel="noreferrer"
                className="underline text-stone-700 hover:text-stone-900"
              >
                food-systems-2026
              </a>
              . Hver rad har eksplisitt evidence-status og kildehenvisninger.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/EffektMethodologyCard.tsx
git commit -m "feat(sirkularitet): add EffektMethodologyCard with framework explanation"
```

---

## Task 6: `EffektRow` med kollapset/ekspandert tilstand

**Files:**
- Create: `src/components/charts/EffektRow.tsx`

- [ ] **Step 1: Skriv komponent**

```typescript
'use client'

import Link from 'next/link'
import type { CircularLeverage } from '@/lib/data/circular-leverage'
import { EffectBar } from './EffectBar'

const COUNTRY_LABEL: Record<string, string> = {
  NO: 'NO',
  SE: 'SE',
  DK: 'DK',
  FI: 'FI',
  IS: 'IS',
  nordic: 'Norden',
}

type Props = {
  leverage: CircularLeverage
  isExpanded: boolean
  onToggle: () => void
  onNavigateToTab?: (tab: string, itemId: string) => void
}

export function EffektRow({ leverage: l, isExpanded, onToggle, onNavigateToTab }: Props) {
  return (
    <div
      id={`leverage-${l.id}`}
      className="bg-white border border-stone-200 rounded-lg overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isExpanded ? 'bg-stone-50' : ''}`}
      >
        <svg
          className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>

        <div className="text-xs font-bold text-stone-400 w-6 text-right">#{l.rank}</div>

        <span className="text-xs font-semibold px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-700">
          {COUNTRY_LABEL[l.country] ?? l.country}
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-stone-900">{l.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">{l.headline}</div>
        </div>

        <div className="flex gap-3 items-center shrink-0">
          <EffectBar dim="klima" level={l.effects.klima} />
          <EffectBar dim="natur" level={l.effects.natur} />
          <EffectBar dim="forurensning" level={l.effects.forurensning} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pl-14 border-t border-stone-100 text-sm text-stone-700">
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Begrunnelse</p>
            <p className="leading-relaxed">{l.justification}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Barrierer</p>
              <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                {l.barriers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Policy-løftestenger</p>
              <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                {l.policyLevers.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-3 mt-3 border-t border-dashed border-stone-200">
            {(l.relatedActorCases?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Suksesshistorier å lære fra</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedActorCases!.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onNavigateToTab?.('actors', name)}
                      className="text-[11px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      {name} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {l.sourceRefs.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Kilder</p>
                <div className="flex flex-wrap gap-2">
                  {l.sourceRefs.map((s) => (
                    s.href ? (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-700 hover:underline"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span
                        key={s.label}
                        className="text-xs text-stone-600 font-mono"
                        title={s.path}
                      >
                        {s.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {(l.relatedGapIds?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Relaterte gap</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedGapIds!.map((gapId) => (
                    <button
                      key={gapId}
                      type="button"
                      onClick={() => onNavigateToTab?.('gaps', gapId)}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      → {gapId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(l.relatedLoopIds?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-stone-500 mb-1">Relaterte looper</p>
                <div className="flex flex-wrap gap-1">
                  {l.relatedLoopIds!.map((loopId) => (
                    <button
                      key={loopId}
                      type="button"
                      onClick={() => onNavigateToTab?.('loops', loopId)}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      → {loopId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/EffektRow.tsx
git commit -m "feat(sirkularitet): add EffektRow with collapsed and expanded states"
```

---

## Task 7: `EffektTab` orchestrator

**Files:**
- Create: `src/components/charts/EffektTab.tsx`

- [ ] **Step 1: Skriv komponent**

```typescript
'use client'

import { useState, useMemo } from 'react'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'
import { circularLeverages, lastUpdated, type EffectLevel } from '@/lib/data/circular-leverage'
import { EffektRow } from './EffektRow'
import { EffektMethodologyCard } from './EffektMethodologyCard'

type SortDim = 'aggregate' | 'klima' | 'natur' | 'forurensning'

const LEVEL_RANK: Record<EffectLevel, number> = { high: 3, medium: 2, low: 1 }

const SORT_LABEL: Record<SortDim, string> = {
  aggregate: 'Aggregat',
  klima: 'Klima',
  natur: 'Natur',
  forurensning: 'Forurensning',
}

type Props = {
  expandedIds: Set<string>
  onToggleRow: (id: string) => void
  onNavigateToTab?: (tab: string, itemId: string) => void
}

export function EffektTab({ expandedIds, onToggleRow, onNavigateToTab }: Props) {
  const [sortDim, setSortDim] = useState<SortDim>('aggregate')

  const sorted = useMemo(() => {
    const list = [...circularLeverages]
    if (sortDim === 'aggregate') {
      return list.sort((a, b) => a.rank - b.rank)
    }
    return list.sort((a, b) => {
      const diff = LEVEL_RANK[b.effects[sortDim]] - LEVEL_RANK[a.effects[sortDim]]
      return diff !== 0 ? diff : a.rank - b.rank
    })
  }, [sortDim])

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Hvor har sirkulære tiltak størst effekt?</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Topp 10 prioriteringer for nordisk matsystem · Kuratert basert på prosjektets research
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EvidenceStatusBadge status="illustrative" />
            <span className="text-[11px] text-stone-400">Oppdatert {lastUpdated}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2 flex-wrap">
          {(Object.keys(SORT_LABEL) as SortDim[]).map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => setSortDim(dim)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                sortDim === dim
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {SORT_LABEL[dim]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {sorted.map((l) => (
          <EffektRow
            key={l.id}
            leverage={l}
            isExpanded={expandedIds.has(`leverage-${l.id}`)}
            onToggle={() => onToggleRow(`leverage-${l.id}`)}
            onNavigateToTab={onNavigateToTab}
          />
        ))}
      </div>

      <EffektMethodologyCard />
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/EffektTab.tsx
git commit -m "feat(sirkularitet): add EffektTab orchestrator with sort and methodology"
```

---

## Task 8: Wire `effekt`-tab into `SirkularitetContent`

**Files:**
- Modify: `src/app/sirkularitet/SirkularitetContent.tsx`

Tre endringer:
1. Importer `EffektTab`
2. Utvid `Tab`-typen og legg til knapp i fanerekka
3. Legg til state-bro (`navigateToRelatedItem` + `pendingScrollId`) og rendre `<EffektTab>` når `tab === 'effekt'`
4. Sikre at gap-/loop-/aktør-rader får `id`-attributter slik at scroll-til kan fungere

- [ ] **Step 1: Legg til import**

Modify `src/app/sirkularitet/SirkularitetContent.tsx` — etter de andre chart-importene rundt linje 9–10, legg til:

```typescript
import { EffektTab } from '@/components/charts/EffektTab'
```

- [ ] **Step 2: Utvid `Tab`-typen og fanerekken**

Finn `type Tab = ...` (rundt linje 106) og endre til:

```typescript
type Tab = 'matrix' | 'effekt' | 'maturity' | 'kpi' | 'questions' | 'loops' | 'gaps' | 'actors' | 'naeringsflyt'
```

Finn `(['matrix', 'maturity', ...]` (rundt linje 238) og endre til:

```typescript
        {(['matrix', 'effekt', 'maturity', 'kpi', 'questions', 'loops', 'gaps', 'actors', 'naeringsflyt'] as Tab[]).map((t) => (
```

Finn knapp-etiketter rett under (rundt linje 249) og legg til etter `t === 'matrix'`-linja:

```typescript
            {t === 'effekt' && `Effekt (10)`}
```

- [ ] **Step 3: Legg til state-bro og pendingScrollId**

`useEffect` er allerede importert i fila (linje 3: `import { useEffect, useMemo, useState } from 'react'`).

Finn `const [data, setData] = useState<CircularityData | null>(null)` (rundt linje 129) og legg til disse linjene rett under:

```typescript
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
```

Etter eksisterende `useEffect` rundt linje 134, legg til:

```typescript
  useEffect(() => {
    if (!pendingScrollId) return
    const handle = requestAnimationFrame(() => {
      const el = document.getElementById(pendingScrollId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setPendingScrollId(null)
    })
    return () => cancelAnimationFrame(handle)
  }, [pendingScrollId, tab])
```

Etter `toggle`-funksjonen rundt linje 141, legg til:

```typescript
  const navigateToRelatedItem = (targetTab: Tab, itemId: string) => {
    let prefixedId: string
    if (targetTab === 'gaps') prefixedId = `gap-${itemId}`
    else if (targetTab === 'loops') prefixedId = `loop-${itemId}`
    else prefixedId = itemId
    setTab(targetTab)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(prefixedId)
      // For aktorer: ekspander begge mulige prefiks — kun én eksisterer
      if (targetTab === 'actors') {
        next.add(`s-${itemId}`)
        next.add(`f-${itemId}`)
      }
      return next
    })
    setPendingScrollId(prefixedId)
  }
```

- [ ] **Step 4: Rendre `EffektTab` når `tab === 'effekt'`**

Finn linja `{tab === 'matrix' && (` (rundt linje 261). Like etter dens `</div>` med matriseinnhold (rundt linje 273), legg til:

```typescript
      {tab === 'effekt' && (
        <EffektTab
          expandedIds={expandedIds}
          onToggleRow={toggle}
          onNavigateToTab={(t, id) => navigateToRelatedItem(t as Tab, id)}
        />
      )}
```

- [ ] **Step 5: Legg til `id`-attributter på rader i andre faner som er navigasjonsmål**

I gaps-fanen, finn `filteredGaps.map((g) => (` og legg til `id={\`gap-${g.id}\`}` på `<Card>`-elementet (rot for hver gap-rad).

I loops-fanen, finn `filteredLoops.map((l) => (` og legg til `id={\`loop-${l.id}\`}` på `<Card>`-elementet.

For aktor-navigasjon: aktørnavn kan inneholde mellomrom og parenteser som ikke er gyldige i HTML id-attributter (f.eks. «Solar Foods (Solein)»). Vi har to valg:
- (a) Slugify navnet før vi setter id og søker i DOM
- (b) Hopp over scroll-til-aktør i V1; tab-bytting + expand fungerer fortsatt

Vi velger **(b)** for V1 — enkelt og dekker hovedjobben. `navigateToRelatedItem` setter `tab='actors'` og legger til både `s-${name}` og `f-${name}` i expandedIds (som vi allerede gjorde i Step 3); brukeren ser ekspandert aktør, men må scrolle manuelt. V2 kan adde slugify+scroll når behovet er tydelig.

For å unngå at `pendingScrollId` peker til et ikke-eksisterende DOM-id ved actors-navigasjon: oppdater `navigateToRelatedItem` til å hoppe over scroll for actors:

```typescript
  const navigateToRelatedItem = (targetTab: Tab, itemId: string) => {
    let prefixedId: string
    if (targetTab === 'gaps') prefixedId = `gap-${itemId}`
    else if (targetTab === 'loops') prefixedId = `loop-${itemId}`
    else prefixedId = itemId
    setTab(targetTab)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(prefixedId)
      if (targetTab === 'actors') {
        next.add(`s-${itemId}`)
        next.add(`f-${itemId}`)
      }
      return next
    })
    if (targetTab !== 'actors') setPendingScrollId(prefixedId)
  }
```

Erstatt `navigateToRelatedItem`-blokken fra Step 3 med denne — denne overstyrer den.

- [ ] **Step 6: Type-check**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npx tsc --noEmit`
Expected: passes

- [ ] **Step 7: Lint**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npm run lint`
Expected: passes (eller bare warnings vi ikke har innført)

- [ ] **Step 8: Commit**

```bash
git add src/app/sirkularitet/SirkularitetContent.tsx
git commit -m "feat(sirkularitet): wire effekt-tab and cross-tab navigation"
```

---

## Task 9: Browser-sjekk og finalisering

**Files:**
- Ingen kode­endringer hvis alt funker. Kun verifikasjon + commit `lastUpdated`-bump om noe har endret seg.

- [ ] **Step 1: Start dev-server**

Run: `cd "/Users/gabrielboen/Documents/Food Systems 2026" && npm run dev`

- [ ] **Step 2: Manuell browser-sjekk**

Åpne `http://localhost:3000/sirkularitet`. Verifiser i denne rekkefølgen:

1. **Fanerekken viser «Effekt (10)»** som andre fane etter «R-stige × verdikjede»
2. **Klikk på «Effekt (10)»** — innholdet rendres med header, illustrative-badge, «Oppdatert 2026-04-29», toggle-bar med fire knapper, og 10 rader
3. **Default-sortering**: rad #1 er NO Forebygging av husholdningssvinn, rad #10 er IS Kartlegg + valoriser fiskeri-svinn
4. **Klikk «Klima»-toggle** — rader sorteres synkende på klima-effekt; ties brytes av rank
5. **Klikk «Natur»-toggle** — IS fiskeri-svinn (HØY natur) skal komme før entries med MED/LAV natur
6. **Klikk «Aggregat»-toggle** — tilbake til rank-sortering
7. **Klikk på rad #2 (SE matsvinn-stagnasjon)** — ekspanderer med begrunnelse, barrierer, policy-løftestenger, suksesshistorier, kilder, relaterte gap og looper
8. **Klikk på «→ gap-husholdningssvinn»-lenken** — bytter til gaps-fanen, scroller til gap-elementet, og elementet er ekspandert
9. **Bytt tilbake til «Effekt»-fanen** — rad #2 forblir ekspandert (state bevart)
10. **Klikk på «Volare →»-suksesshistorie i rad #9 (FI alt. protein)** — bytter til actors-fanen, og Volare-aktøren er ekspandert (scroll må gjøres manuelt — V2)
11. **Klikk på en kilde-lenke med `href`** — åpner i ny tab
12. **Åpne «Metodikk og forbehold»-kortet på bunnen** — ekspanderer med tre seksjoner

- [ ] **Step 3: Hvis noe feiler — fiks og recommit**

Vanlige feil og fix:
- `gap-`/`loop-`/`actor-` ID-prefiks mismatch: sjekk at id-attributter ble lagt til alle steder i Task 8 Step 5
- ScrollIntoView feiler hvis elementet ikke finnes når useEffect kjører: øk `requestAnimationFrame` til en `setTimeout(..., 50)` om nødvendig
- Sortering virker ikke: sjekk at `LEVEL_RANK`-mappingen i `EffektTab` er rett

Hvis du fikser noe, commit:

```bash
git add <fixed files>
git commit -m "fix(sirkularitet): <kort beskrivelse>"
```

- [ ] **Step 4: Stopp dev-server**

`Ctrl+C` i terminalen som kjører `npm run dev`.

- [ ] **Step 5: Sluttkjøring av audit + type/lint**

```bash
cd "/Users/gabrielboen/Documents/Food Systems 2026"
npm run audit:circular-leverage
npx tsc --noEmit
npm run lint
```

Alle tre skal være grønne.

- [ ] **Step 6: Sluttcommit (om noen smårettelser ble gjort)**

```bash
git status
# om alt er committet, ferdig.
# om noe er ucommittet:
git add <files>
git commit -m "chore(sirkularitet): browser-fix etter sluttverifikasjon"
```

---

## Akseptkriterier (sjekkliste mot spec)

- [ ] `effekt`-fane synlig som andre fane på `/sirkularitet`
- [ ] Topp-10 rader rendres med rang, land-pill, tittel, headline, tre effektbarer
- [ ] Toggle-knappene endrer sortering uten å miste utvidet tilstand
- [ ] Klikk ekspanderer drilldown med begrunnelse, barrierer, policy-løftestenger, kilder, lenker
- [ ] `evidenceStatus`-badge synlig i header (alltid `illustrative`)
- [ ] `npm run audit:circular-leverage` passerer
- [ ] `npx tsc --noEmit` passerer
- [ ] `npm run lint` passerer
- [ ] Alle 12 browser-sjekk-punkter i Task 9 Step 2 fungerer
