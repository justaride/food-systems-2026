# P1a — mekanisk klarhet-sveip (æøå + «rødt ≠ feil») — design

- **Dato:** 2026-06-09
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** P1-tiltak #7 (rett literal æøå-mojibake i visningstekst) og #5 (recolor tre badges der rødt feilaktig signaliserer feil). Rent mekanisk; ingen ny funksjonalitet.
- **Linje:** Fortsetter klarhet-auditen [`2026-06-08-sideklarhet-audit.md`](2026-06-08-sideklarhet-audit.md) (P1). «Forklar ordforrådet» (#4/#6/#8) brainstormes separat.

## 1. Problem

Auditen fant to mekaniske klarhet-feil: (a) flere norske visningsstrenger har fått æ/ø/å strippet til ren ASCII i kildekoden (f.eks. `<h1>Moter</h1>`), som ser uferdig ut; (b) rød farge brukes på et fåtall badges som ikke er feil, så lesere tror noe er galt.

## 2. Beslutninger (låst i brainstorming)

1. Kun **visningstekst** rettes for æøå — aldri identifikatorer, ruter, `href`, objektnøkler, enum-verdier eller CSS-klasser.
2. **To strenger bevisst utelatt:** `PromptsContent.tsx` `description`-feltene (rendres ikke noe sted → YAGNI) og `circular-leverage.ts:269` «Mote JT-Gabriel 20.04.26» (brukes verbatim som **sitat-nøkkel** i `circularity-questions.ts` — retting ville brutt kryssreferansen).
3. Recolor kun de tre stedene der rødt = ikke-feil. Rødt **beholdes** der det betyr noe ekte å holde tilbake/avslå («Blokkert», «Avslått», «NO → nordisk ⚠»).

## 3. Endringer — #7 æøå (komplett, verifisert inventar)

Format: `fil:linje` — `nå` → `rettet` (kontekst). Kun visningstekst.

**src/app/moter/page.tsx**
- `11` `Moter` → `Møter` (h1)
- `13` `Kuraterte motesammendrag fra … moter. Primarunderlag` → `Kuraterte møtesammendrag fra … møter. Primærunderlag` (avsnitt; 3 rettinger)
- `32` `Primarunderlag` → `Primærunderlag` (eyebrow-label)
- `42` `… oppfolginger` → `… oppfølginger` (badge)
- `59` `Avklart i motet` → `Avklart i møtet` (h4)
- `73` `Oppfolging` → `Oppfølging` (h4)
- `87` `Fokus og nokkelfunn` → `Fokus og nøkkelfunn` (h4)

**src/app/tidslinje/page.tsx**
- `12` `Soknader og nokkelhendelsr` → `Søknader og nøkkelhendelser` (subtittel; også droppet `e`)

**src/app/team/page.tsx**
- `38` `Organisasjon og nokkelpersoner` → `Organisasjon og nøkkelpersoner` (subtittel)

**src/components/ui/StatusBadge.tsx**
- `7` `label: 'Avslatt'` → `label: 'Avslått'` (nøkkelen `'avslatt'` og `className` urørt)

**src/components/layout/Header.tsx**
- `10` `name: 'Moter'` → `name: 'Møter'` (`href: '/moter'` urørt)

**src/app/kommunikasjon/KommunikasjonContent.tsx**
- `67` `Apne dokument` → `Åpne dokument` (lenketekst)

**src/app/metodikk/page.tsx**
- `100` `Apne mandat-flate →` → `Åpne mandat-flate →` (lenketekst)

**src/app/metodikk/prompts/PromptsContent.tsx**
- `159` `Operativ ko:` → `Operativ kø:` (avsnitt)
- `22` `label: 'Boker og akademisk'` → `label: 'Bøker og akademisk'` (kategori-label, rendres via `cat?.label`)
- `30` `label: 'Naeringspublikasjoner'` → `label: 'Næringspublikasjoner'` (kategori-label)

**src/app/politikk/PolitikkContent.tsx**
- `282` `` `Mal: ${entry.target_pct}%` `` → `` `Mål: …` `` (vist `parts`-streng)
- `284` `` `Mal: ${entry.target_gwh} GWh` `` → `` `Mål: …` ``
- `517` `Soknadsfrister:` → `Søknadsfrister:` (label)
- `533` `Omrade` → `Område` (tabell-`<th>`)
- `719` `Detaljer per omrade` → `Detaljer per område` (h2)
- `748` `Ar: ` → `År: ` (felt-label)
- `762` `Mal: ` → `Mål: ` (felt-label)
- `775` `Mal: ` → `Mål: ` (felt-label)
- `905` `Ar: ` → `År: ` (felt-label, EU-blokk)
- `911` `Mal: ` → `Mål: ` (felt-label, EU-blokk)

**src/app/personer/PersonerContent.tsx**
- `108` `Ingen personer matcher soket` → `Ingen personer matcher søket` (EmptyState)

**src/app/masteroppgaver/MasteroppgaverContent.tsx**
- `180` `… gjenstar` → `… gjenstår` (stat-caption)
- `198` `… nokkelfunn, uttak og metode. Det som fortsatt gjenstar` → `… nøkkelfunn … gjenstår` (avsnitt; 2 rettinger)
- `336` `Nokkelfunn` → `Nøkkelfunn` (felt-label)

**src/app/sirkularitet/SirkularitetContent.tsx**
- `398` `Forsokte losninger` → `Forsøkte løsninger` (felt-label; 2 rettinger)
- `663` `Sammenlignbar losning` → `Sammenlignbar løsning` (felt-label)

**src/app/verdikjede/VerdikjedeContent.tsx**
- `157` `Nokkelfunn` → `Nøkkelfunn` (felt-label)
- `184` `Nokkelaktorer` → `Nøkkelaktører` (felt-label; 2 rettinger)

**src/app/rapporter/RapporterContent.tsx**
- `296` `Nokkelfunn` → `Nøkkelfunn` (felt-label)
- `388` `Apne i biblioteket` → `Åpne i biblioteket` (lenketekst)

**src/lib/data/ten-step-start.ts** (rendres via StepCard)
- `44` `output: 'Moterytme, sprintplan, beslutningslogg'` → `'Møterytme, …'`
- `47` `description: '… moterytme … Faa, klare mal … gjennomgaaande …'` → rett **kun** `moterytme→møterytme`, `Faa→Få`, `gjennomgaaande→gjennomgående`. **La nynorsk stå** (`ikkje`, `eige`, `veke`) — det er bevisst.

> Linjenumre er fra audit-tidspunkt; planen instruerer å matche på strenginnhold (de er unike), ikke linjenummer.

## 4. Endringer — #5 recolor (tre steder)

1. **Språk-badge «NO»** — `src/app/metodikk/prompts/PromptsContent.tsx:213`: `bg-red-50 text-red-600` → `bg-stone-100 text-stone-600`. (EN-grenen `bg-sky-50 text-sky-600` uendret.)
2. **«Selvleie»-badge** — `src/app/eiendommer/EiendommerContent.tsx:413`: `bg-rose-50 text-rose-700 border border-rose-200` → `bg-amber-50 text-amber-800 border border-amber-200`. (Søsken «Ekstern» uendret.)
3. **Temporal «ukjent periode»** — `src/lib/coverage/badge-model.ts:16`: `tone: 'bad'` → `tone: 'warn'`. (Label «ukjent periode» uendret.)

## 5. Testing

- `npm run lint` rent.
- `npx tsc --noEmit` ingen nye feil i berørte filer (kjent, urelatert feil i `tests/lib/insight-link-scripts.test.ts` ignoreres).
- **Sanity-grep** etter sveipen: bekreft at ingen rute/`href`/objektnøkkel endret seg — `rg "href=|name: '|label: '" ` på de berørte filene, og at `/moter`, `'avslatt'`, `'soknad'`-nøkler står urørt.
- For badge-modellen finnes allerede `tests/lib/coverage/badge-model.test.ts`; legg én assertion om at temporal `unknown` gir `tone: 'warn'`.
- Ingen øvrige oppførsel-tester (ren tekst/farge).

## 6. Filer som berøres

13 sider/komponenter for #7 (listet over) + 3 for #5 (`PromptsContent.tsx`, `EiendommerContent.tsx`, `badge-model.ts` + dens test). Merk: `PromptsContent.tsx`, `metodikk/page.tsx` får både æøå- og (for PromptsContent) recolor-endringer.

## 7. Utenfor omfang

«Forklar ordforrådet» (#4 global badge-legende, #6 glossar, #8 sjargong-oversettelse), de ~18 «delvis»-sidene, og de to bevisst utelatte strengene (§2.2).
