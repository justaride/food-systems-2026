# Intern/ekstern-skille + dekning-merking opprydding (P0)

- **Dato:** 2026-06-08
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** P0-fundamentet fra klarhet-auditen. Bygger gjenbrukbare primitiver for skillet intern arbeidsflate vs. formidling, retter den villedende «0% verifisert»-tilstanden, og lar dekning-forklaringen følge boksen.
- **Linje:** Utløst av [`2026-06-08-sideklarhet-audit.md`](2026-06-08-sideklarhet-audit.md). Restaurerer intensjon fra [`2026-05-29-datakvalitet-merking-design.md`](2026-05-29-datakvalitet-merking-design.md) (seksjon 6: tomt datasett skal vise «ukjent dekning», ikke «0% verifisert»).

## 1. Bakgrunn og problem

Klarhet-auditen (2026-06-08) av alle ~47 ruter fant at appens største intuitivitetsproblem er at **interne arbeidsflater (datakvalitet, kurasjon, backlog, påvirkningsdata) rendres inline i leservendte sider uten markør**. Et godt innrammings-system finnes (`PageFraming`, `StatusLegend`), men brukes bare på ~7 av 47 sider. Det mest synlige symptomet er «Dekningsoversikt»-boksen: «0% verifisert» i rødt, der `0/0` («ikke sporet») ser identisk ut med `0/179 311` («ingen av svært mange kontrollert»).

Målgruppe-beslutning (låst): appen tjener **både** internt team **og** eksterne lesere, med et **tydelig skille**. Det finnes **ingen auth/middleware/rolle-gating** i appen i dag — skillet blir derfor **visuelt**, ikke faktisk tilgangskontroll.

## 2. Beslutninger låst i brainstorming

1. **Skille-mekanisme: «merk + fold sammen».** Interne seksjoner pakkes i en merket, sammenfoldet boks (lukket som standard); leservendt innhold står åpent. Ingen ny tilgangs-infrastruktur.
2. **To primitiver:** `InternalSection` (sammenfoldbar, for intern data inne i leservendte sider) + `InternalBanner` (banner for sider som er *helt* interne).
3. **0/0-fiksen er visning-nivå** i `badge-model.ts` — restaurerer det godkjente designet («ukjent dekning» for `total === 0`). `classify.ts` og overclaim-gaten røres **ikke**.
4. **Fjern «rødt = feil» for verifisering:** ekte lav verifiseringsgrad (registerrader, `needs_review`) blir **gult** (warn), ikke rødt. Rødt reserveres for ekte overclaim («NO → nordisk ⚠»).
5. **Dekning-forklaringen flyttes inn i `CoverageOverview`-komponenten**, så den følger boksen overalt (inkl. `/kilder`, der den i dag mangler).
6. **Utrulling** til de 6 «nei»-sidene; `/kilder` er navngitt prioritet og fungerer som mal.

## 3. Arkitektur

### 3.1 `InternalSection` (ny, `src/components/ui/InternalSection.tsx`)

Sammenfoldbar seksjon, **lukket som standard**, native `<details>/<summary>` (ingen klient-JS, tilgjengelig, server-komponent). Stilspråk i tråd med `PageFraming` (stone/amber).

```tsx
type InternalSectionProps = {
  label: string              // f.eks. "datakvalitet & kurasjon"
  summary?: string           // kort underlinje; default: "Internt arbeidsgrunnlag — ikke ferdig formidling. Tall kan endres."
  children: React.ReactNode
}
// <details> lukket:
//   <summary> 🛠 Internt: {label}  —  {summary} </summary>
//   {children}
```

### 3.2 `InternalBanner` (ny, `src/components/ui/InternalBanner.tsx`)

Lite banner øverst på sider som er *helt* interne (der det ikke gir mening å folde bort alt). Én linje + valgfri note.

```tsx
type InternalBannerProps = { note?: string }
// "🛠 Intern arbeidsflate — datakvalitet/kurasjon, ikke ferdig formidling. Tall kan endres."
```

`PageFraming` og `StatusLegend` røres ikke (kirurgisk; nye komponenter ved siden av).

### 3.3 Badge-fiksen (`src/lib/coverage/badge-model.ts`)

```tsx
const v = profile.verification
const verification: Chip =
  v.total === 0
    ? { label: 'ikke sporet', tone: 'neutral',
        title: 'Verifisering spores ikke for dette datasettet (0 rader).' }
    : { label: `${v.humanVerifiedPct}% verifisert`,
        tone: v.rollup === 'human_grade' ? 'good' : 'warn',   // var: needs_review → 'bad' (rødt)
        title: `Andel poster en person har kvalitetssjekket: ${v.humanVerified} av ${v.total}.` }
```

- `total === 0` → nøytralt «ikke sporet» (ikke rødt «0% verifisert»).
- Ekte lav grad → gult (warn) i stedet for rødt (bad).
- `title` definerer hva «verifisert» betyr.
- **Ingen endring i `classify.ts`/`rollupVerification` eller audit-gaten** — `rollup` forblir `needs_review` for `total === 0`, så `verification_overclaim` (utløses når `rollup !== 'human_grade'`) fortsatt fail-closer korrekt på sterke påstander.

### 3.4 Dekning-forklaring i `CoverageOverview` (`src/components/coverage/CoverageOverview.tsx`)

Legg en sammenfoldbar «Hva betyr merkene?»-`<details>` (eller kompakt caption) **i selve komponenten**, så den vises der boksen står. Innholdet generaliserer dagens avsnitt fra `/hvitbok/proveniens`:
- **Tid:** øyeblikksbilde (ett år) · flere år · tidsserie (≥5 sammenhengende år).
- **Geografi:** NO/DK (ett land) · Norden (5) · «NO → nordisk ⚠» (kun norske data bak en nordisk-presentert figur).
- **Verifisering:** andel poster en person har kvalitetssjekket. «ikke sporet» = datasettet har ingen verifiseringsdata (0 rader).
- **«(local)»** = beregnet mot lokal database, ikke prod.

`/hvitbok/proveniens/page.tsx` sitt egne avsnitt fjernes/erstattes (komponenten bærer det nå); ingen dobbel tekst.

### 3.5 Utrulling per side

| Side | Grep |
|---|---|
| `/kilder` (`KilderContent.tsx`) | `InternalBanner` øverst; backlog/nedlastingsstatus i `InternalSection`; `CoverageOverview` viser nå forklaring (3.4) |
| `/forskningsrunder` (`ForskningsrunderContent.tsx`) | `InternalBanner`; CSV-stier + `npm run …`-blokk i `InternalSection` |
| `/eierskap` (`EierskapContent.tsx`) | `InternalBanner`; kolonne «Score» → «Datakvalitet» + `title`-tooltip («0–10: hvor komplett kartleggingen er, ikke en vurdering av selskapet») |
| `/verdikjede` (`VerdikjedeContent.tsx`) | «arbeidsflate»-/datadeknings-panelet i `InternalSection` (lesekort står åpne) |
| `/aktorer` (`AktorerContent.tsx`) | påvirkningsdata (asks, neste steg) i `InternalSection`; stance + P1–P3-legende (gjenbruk `StatusLegend`-mønster) |
| `/aktorer/[slug]` (`page.tsx`) | «Commitment Snapshot»/«Intern eier»/«Ønsket stance» i `InternalSection`; map rå `actorType`/`country`/stance til lesbare etiketter |

## 4. Feilhåndtering / edge cases

- `InternalSection` uten `summary` → bruker default-tekst.
- `CoverageOverview` når `profiles.json` mangler/tomt → returnerer `null` som i dag (uendret).
- Badge: `humanVerifiedPct` for `total === 0` er allerede `0` fra `rollupVerification`; vi leser `total`, ikke pct, så ingen NaN.
- Sider der hele innholdet er internt (`/eierskap`, `/forskningsrunder`): bruk `InternalBanner` (ikke fold bort alt — det gir tom side).

## 5. Testing (TDD)

- **`InternalSection`:** rendrer lukket som standard (`<details>` uten `open`); `summary`/`label` vises; children finnes i DOM (tilgjengelig selv lukket).
- **`InternalBanner`:** rendrer note + standardtekst.
- **`badge-model` (utvid `tests/…/CoverageBadge`/badge-model-test):**
  - `total === 0` → chip `{ label: 'ikke sporet', tone: 'neutral' }`.
  - `rollup: 'needs_review'`, `total > 0` → `tone: 'warn'` (ikke `'bad'`).
  - `rollup: 'human_grade'` → `tone: 'good'`, label `'X% verifisert'`.
- **`CoverageOverview`:** forklaring-elementet finnes i output.
- **Guard:** eksisterende coverage-/audit-tester forblir grønne (gaten uendret).

## 6. Suksesskriterier

1. `total === 0`-datasett viser nøytralt «ikke sporet», ikke rødt «0% verifisert».
2. Ingen verifiserings-badge er rød for ekte lav grad (kun warn/gul); rødt kun på ekte overclaim.
3. Dekning-forklaringen vises på `/kilder` (og overalt boksen står), ikke bare `/hvitbok/proveniens`.
4. De 6 «nei»-sidene har et synlig, konsistent intern/ekstern-skille (`InternalBanner` eller `InternalSection`).
5. Overclaim-gaten og dens tester er uendret og grønne.
6. `lint` + full test-suite grønn.

## 7. Filer som berøres

**Nye:**
- `src/components/ui/InternalSection.tsx`
- `src/components/ui/InternalBanner.tsx`
- tester: `tests/components/InternalSection.test.tsx`, `tests/components/InternalBanner.test.tsx`

**Endres:**
- `src/lib/coverage/badge-model.ts` (0/0 + tone)
- `src/components/coverage/CoverageOverview.tsx` (forklaring)
- `src/app/hvitbok/proveniens/page.tsx` (fjern dobbel forklaring)
- `src/app/kilder/KilderContent.tsx`
- `src/app/forskningsrunder/ForskningsrunderContent.tsx`
- `src/app/eierskap/EierskapContent.tsx`
- `src/app/verdikjede/VerdikjedeContent.tsx`
- `src/app/aktorer/AktorerContent.tsx`
- `src/app/aktorer/[slug]/page.tsx`
- relevante badge-model/coverage-tester (`tests/lib/…`)

> Merk: `badge-model.ts` og `classify.ts` ligger i `src/lib/coverage/`; `CoverageOverview.tsx`/`CoverageBadge.tsx` i `src/components/coverage/`.

## 8. Utenfor omfang (senere runder)

- P1/P2-tiltak fra auditen (global badge-legende overalt, glossar, æøå-mojibake, DB-felt-opprydding, sjargong-oversettelse).
- De ~18 «delvis»-sidene.
- Leservisning-bryter / faktisk auth (avvist i brainstorming — ikke behov nå).
- `computedEnv: 'prod'`-regenerering av `profiles.json` (data/ops, eget spor).
