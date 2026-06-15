# P1b — delt ordliste («forklar ordforrådet») — design

- **Dato:** 2026-06-09
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** P1-tiltak #4 (forklar badge-/status-koder), #6 (åpne + utvid glossaret) og #8 (sjargong) — samlet til én delt ordliste, siden de henger sammen.
- **Linje:** Fortsetter klarhet-auditen [`2026-06-08-sideklarhet-audit.md`](2026-06-08-sideklarhet-audit.md). P0 (#121) og P1a (#122) ligger på egne branches.

## 1. Problem

Auditen fant at uforklart ordforråd er den bredeste klarhet-fienden: badge-koder (stance, prioritet, researchstatus, insightType) vises uten nøkkel, og engelsk/intern sjargong lekker inn. Det finnes allerede to glossar-overflater, men de er ad-hoc og dekker ikke kodene:
- **Forside «Nøkkelbegreper»** (`src/app/page.tsx:65-81`) — hardkodet `<details>` med 6 prosjekt-termer.
- **`InsightGlossary`** (`src/components/ui/InsightGlossary.tsx`) — gjenbrukbar kollapsbar med `ENTRIES: {term, definition, reading?}[]`, men kun 5 statistikk-termer. Brukt på `/innsikt`.

Det finnes **ikke** ett felles badge-system (~10 ad-hoc fargesystemer), så en «global legende» betyr én delt ordliste brukt der kodene dukker opp — ikke å forene alle systemene.

## 2. Beslutninger (låst i brainstorming)

1. **Én delt ordliste:** generaliser `InsightGlossary`-mønsteret til én term-kilde + én gjenbrukbar komponent, som erstatter begge ad-hoc-glossarene.
2. **Tre kategorier:** `statistikk`, `prosjekt`, `status`. Hver overflate viser én kategori.
3. **Default-åpen** på forsiden og `/innsikt` (det var #6).
4. **Utrulling smalt:** bare `/aktorer` (+detalj) får `status`-ordlisten i denne runden.
5. **#8-regel:** oversett *på stedet* der det finnes et rent norsk ord og det ikke er et egennavn; behold egennavn/forkortelser men *definer* dem (i ordlisten eller utvid på første bruk).
6. **Ikke dupliser `StatusLegend`:** citation/proxy-statusene (Eksternt siterbar / Siterbar med forbehold / Blokkert / Proxy / Illustrativ / Utført internt) blir værende i den eksisterende `StatusLegend`-komponenten.

## 3. Arkitektur

### 3.1 Term-kilde — `src/lib/glossary/terms.ts` (ny)

```ts
export type GlossaryCategory = 'statistikk' | 'prosjekt' | 'status'
export type GlossaryTerm = {
  term: string
  definition: string
  reading?: string
  category: GlossaryCategory
}
export const GLOSSARY_TERMS: GlossaryTerm[] = [ /* §3.3 */ ]
```

### 3.2 Komponent — `src/components/ui/Glossary.tsx` (ny, generalisert fra `InsightGlossary`)

```tsx
'use client'
// props: { category: GlossaryCategory; title?: string; defaultOpen?: boolean }
// filtrerer GLOSSARY_TERMS på category, rendrer dagens kollapsbare UI
// (knapp + chevron + <dl> med term/definition/reading), defaultOpen styrer initial useState.
```

`InsightGlossary.tsx` slettes; `/innsikt` bytter til `<Glossary category="statistikk" defaultOpen />`. UI-stilen (rounded border, uppercase «Begrepsforklaringer»-knapp, chevron, `<dl>` grid) gjenbrukes uendret fra dagens `InsightGlossary`.

### 3.3 Term-innhold

**`statistikk`** (flyttes uendret fra `InsightGlossary`): HHI, Gini, CR3, Zipf, Lorenz-kurve (samme `definition`/`reading` som i dag).

**`prosjekt`** (de 6 fra forsiden, verbatim, + 3 nye):
- Food TG — «Food Transition Group, prosjektets arbeidsgruppe.»
- Ten Step — «ti-stegs metodikk for å drive transisjonsgruppen.»
- Evidence Pack — «standardsettet av leveransedokumenter.»
- Spor A/B/C — «de tre scope-sporene: fôr/import, sidestrømmer, governance.»
- Claim-koder — «CL = claim, EV = evidence, SRC = kilde, med spor og nummer.»
- Forskningsrunder — «avgrensede runder med kunnskapsinnhenting.»
- **SourceDoc** (ny) — «kilde-lag i databasen med proveniens; et bibliotek-dokument kan finnes uten et eget SourceDoc-lag.»
- **Backlog** (ny) — «kilder identifisert i en forskningsrunde, men ikke ennå registrert/nedlastet.»
- **Exa** (ny) — «søke-API brukt til å hente kilder automatisk.»

**`status`** (ny, badge-kodene):
- Stance — «aktørens holdning (teamets vurdering): champion = forkjemper · supportive = støttende · neutral = nøytral · skeptical = skeptisk · opposed = motstander.»
- Prioritet (P1–P3) — «intern prioritering av aktør: P1 = viktigst, P3 = lavest.»
- Researchstatus — «Primærsnapshot = bekreftet fra primærkilde på ett tidspunkt · Proxy/modell = indirekte indikator · Trenger primærsjekk = må verifiseres mot primærkilde.»
- Innsiktstype — «Notat / Transkripsjon / Arbeidsdok / Strategi = kilde-/dokumenttype bak innsikten · Duplikat = overlapper en annen oppføring.»

### 3.4 Migrering + utrulling

- `src/app/page.tsx`: erstatt det hardkodede `<details>Nøkkelbegreper`-blokken (linje 65-81) med `<Glossary category="prosjekt" title="Nøkkelbegreper" defaultOpen />`.
- `src/app/innsikt/InnsiktContent.tsx`: `<InsightGlossary />` → `<Glossary category="statistikk" defaultOpen />`.
- `src/app/aktorer/AktorerContent.tsx` og `src/app/aktorer/[slug]/page.tsx`: legg `<Glossary category="status" title="Statusforklaringer" />` nær badge-bruken (kollapset).
- Slett `src/components/ui/InsightGlossary.tsx`.

### 3.5 #8 — sjargong på stedet (avgrenset liste)

Oversett *synlig* tekst (ikke variabler/typer/funksjoner):
- `FTS` → `Fulltekst` (søkemodus-knapp i `src/app/bibliotek/BibliotekContent.tsx`; behold ev. `title`-tooltip).
- `Interlock-score` → `Krysstyre-score` og `Interlocking` → `Kryssverv` der de er UI-etiketter (kjente steder: `src/app/styremedlemmer/InterlockContent.tsx`, `src/app/personer/PersonerContent.tsx`, `src/app/selskap/[id]/…`). Planen grep-er for å fange alle visningsstrenger; rør **ikke** `interlockScore`/`Interlock`-identifikatorer/typer.
- Utvid på første bruk: `MTB` → `MTB (maks tillatt biomasse)` (`src/app/havbruk/HavbrukContent.tsx`, stat-kort/kolonne); `EMV` → `EMV (egne merkevarer)` (`src/app/sammenligning/SammenligningContent.tsx`).

## 4. Feilhåndtering / edge cases

- `Glossary` med en kategori uten termer → rendrer ingenting (returner `null` hvis filtrert liste er tom). Skal ikke skje for de tre brukte kategoriene.
- `defaultOpen` default `false` (bevarer dagens `InsightGlossary`-oppførsel der den ikke er satt).

## 5. Testing

- **Unit (`tests/lib/glossary-terms.test.ts`, node:test):** `GLOSSARY_TERMS` har unike `term` innen hver kategori; hver av `statistikk`/`prosjekt`/`status` har ≥1 term; alle `category`-verdier er gyldige.
- **Komponent:** `Glossary` er en client-komponent (ikke node:test-rendret) — verifiseres via tsc/lint + visuell sjekk.
- Lint + tsc rent (ignorer den kjente urelaterte `insight-link-scripts.test.ts`-feilen).
- Visuell: forside (Nøkkelbegreper åpen, 9 termer), `/innsikt` (statistikk åpen), `/aktorer` (Statusforklaringer), `/bibliotek` («Fulltekst»), `/styremedlemmer` («Krysstyre-score»), `/havbruk` («MTB (maks tillatt biomasse)»).

## 6. Filer

**Nye:** `src/lib/glossary/terms.ts`, `src/components/ui/Glossary.tsx`, `tests/lib/glossary-terms.test.ts`.
**Endres:** `src/app/page.tsx`, `src/app/innsikt/InnsiktContent.tsx`, `src/app/aktorer/AktorerContent.tsx`, `src/app/aktorer/[slug]/page.tsx`, `src/app/bibliotek/BibliotekContent.tsx`, `src/app/styremedlemmer/InterlockContent.tsx`, `src/app/personer/PersonerContent.tsx`, `src/app/selskap/[id]/…` (Interlock-etiketter), `src/app/havbruk/HavbrukContent.tsx`, `src/app/sammenligning/SammenligningContent.tsx`.
**Slettes:** `src/components/ui/InsightGlossary.tsx`.

> **Merge-merknad:** `AktorerContent.tsx` får også en `InternalBanner` i P0 (#121). Siden P1b brancher av main kan det bli en triviell merge-konflikt nær toppen av returnert JSX — løses ved å beholde begge elementene.

## 7. Utenfor omfang

- Å rulle ordlisten ut til alle badge-tunge sider (kun `/aktorer` nå); resten er P2.
- Å folde `StatusLegend` inn i den delte ordlisten (beholdes som egen citation-status-legende).
- Resten av #8/P2 (DB-felt-lekkasje, filstier, `npm`-kommandoer i UI, de ~18 «delvis»-sidene).
