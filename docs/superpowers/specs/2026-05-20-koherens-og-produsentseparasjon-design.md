# Koherens & produsentseparasjon — design

**Dato**: 2026-05-20
**Branch**: `food-tg/koherens-produsentseparasjon-2026-05-20` (foreslått)
**Status**: Godkjent (review 2026-05-20) — klar for implementasjonsplan

## Bakgrunn

Fersk-blikk-gjennomgang 2026-05-20 (10 sider browset som utenforstående, uten å lese intern dokumentasjon) fant at appen er lesbar per side, men ikke koherent som helhet:

- **Ingen inngangsdør.** Forsidens største overskrift er fasenavnet («Fase 3 — Scope og pilotvalg»). Det finnes ingen forklaring av hva prosjektet er. Den ene setningen som forklarer prosjektet står bare i `CLAUDE.md`, ingensteds i appen.
- **«To apper i én».** Av 38 976 `Company`-rader er 38 925 produsenter (gårdsbruk/enkeltpersonforetak, `valueChainStage='production'`) — men de telles og vises som om de er samme sak som de 51 kuraterte selskapene. Kunnskapsgrafen melder selv 39 976 isolerte noder mot 1 096 koblede.
- **Tall spriker mellom sider.** «Hvor mange selskaper?» får fem svar: «55 000+», 38 976, 51, 20, 8. Forsiden viser «Fase 1/4» (sidemeny) og «Fase 3» (hovedinnhold) samtidig; undertittelen sier «Phase 4-5».
- **Strippede norske tegn** i hele hovednavigasjonen («Moter», «soknader», «Aktorer», «Okonomi», «eiertraer»).
- **Feilplassert navigasjon.** Entiteter (Selskaper, Personer, Aktører, Søk) ligger under gruppen «Bibliotek».

## Mål

Gjøre appen selvforklarende for en utenforstående, og strukturelt skille produsentregisteret fra den kuraterte selskapskunnskapsbasen — slik at appen tåler å deles eksternt.

## Beslutninger (låst i brainstorming 2026-05-20)

- **Målgruppe**: appen skal på sikt kunne deles eksternt, utenfor transisjonsgruppen. Skillet internt/eksternt må derfor være skarpt.
- **Produsentseparasjon**: ekte `Producer`-tabell — ikke et diskriminatorfelt på `Company`.
- **Pakking**: én samlet implementasjonsplan.
- **Navigasjon**: inkluder en langsiktig-riktig nav-omorganisering, ikke bare tegn-fiksen.

## Out of scope (oppfølging)

- Semantisk dedup / entitetsoppløsning av produsentnavn (217 normaliserte navnekollisjoner finnes, men `orgNr` er unik for alle 38 925 — det er distinkte juridiske enheter, ikke datafeil).
- Nordiske eierregistre, M&A-monitoring, automatiserte cron-jobber.
- Egen graf-/relasjonsvisning *for* produsenter (de er rene løvnoder; en enkel registervisning holder).

## Arkitektur — arbeidsområder

### 1. Inngangsdør (forside)

`src/app/page.tsx`. Legg en introseksjon øverst, *over* «Aktiv fase»-banneret:

- Prosjekt-setning: hva appen er, i én setning (kilde: `CLAUDE.md` / `.claude/project-context.md`).
- «Ny her? →»-lenke til en god startside.
- «Nøkkelbegreper»-boks: Food TG, Ten Step, Evidence Pack, Spor A/B/C, claim-koder (CL/EV/SRC), NS-rammeverk, Misjoner/Forskningsrunder.
- Sidens `<h1>` blir prosjektnavnet / en ekte tittel — ikke fasenavnet (i dag `page.tsx:35`). Fasebanneret flyttes ned under introen.

Mønster: søsterappen Circular Cities' forside (intro + «Ny her?» + ordliste).

### 2. Produsent/selskap-separasjon (datamodell) — hovedarbeidet

Se egen seksjon «Migrering» under.

### 3. Navigasjon — `src/components/layout/Sidebar.tsx`

- **3a. Norske tegn.** Fiks alle strippede tegn i `navGroups` (kun visningstekst `name`/`description`; `href` som `/moter` er uendret — rutemapper endres ikke).
- **3b. Omorganisering.** Flytt entiteter ut av «Bibliotek». Gruppering (godkjent i review 2026-05-20):
  - *Topp*: Oversikt, Søk
  - *Intern*: Team, Møter, Kommunikasjon, Mandat, Metodikk, Tidslinje
  - *Selskap & eierskap*: Selskaper, Eierskap, Styremedlemmer, Personer, Eiendommer
  - *Matsystem*: Verdikjede, Forsyningskjede, Havbruk, Sirkularitet, Økonomi
  - *Produsenter & støtte*: Produsentregister (ny), Subsidier
  - *Nordisk*: Sammenligning, Politikk, Kart, Media
  - *Kunnskap*: Innsikt, Forskningsrunder, Akademia, Graf, Aktører
  - *Bibliotek*: Rapporter, Bibliotek, Kilder
- **3c. Fase-indikator.** Den hardkodede «Fase 1 / 4» (`Sidebar.tsx:130`) gjøres dynamisk fra `getPhases()` — én kilde til sannhet, lik forsiden.
- **3d. Internt/eksternt.** Marker «Intern»-gruppen visuelt som internt arbeidsstoff (badge/farge), siden appen skal kunne deles eksternt.

### 4. Tall-konsistens

- Ett kanonisk «kartlagt selskap»-tall (de ~51) brukt likt på forside, `/selskap`, `/graf`, `/eierskap`.
- Fjern «Vis alle 55 000+ selskaper»-lenken og `?all=1`-modus på `/selskap`.
- Produsenttall vises alltid separat og eksplisitt merket som registerdata.
- Scope-etiketter der samme begrep har ulik verdi: selvforsyning (44 % Norge vs 105 % nordisk snitt), matsvinn (390 000 t vs 3,8 mill. t).
- Fase-tall: «Phase 4-5»-strengen i fasedata ryddes; faseskala holdes konsistent 1–4.

### 5. Innhold-tegnsetting (/mandat m.fl.)

Norske tegn er inkonsekvente *innen* innholdssider (`/mandat`: «Kjør» riktig i én linje, «Kjor» feil i neste). Dette kommer fra import, ikke fra UI-koden. Arbeidsoppgave: identifiser importkilden/-skriptet som stripper tegn, fiks ved kilden, re-importer berørt innhold. Bekreftet i review 2026-05-20: med i denne planen.

## Migrering — produsentseparasjon (detaljert)

**Produsentpopulasjon:** `Company WHERE valueChainStage='production'` = 38 925 rader. `valueChainStage` er eneste pålitelige selektor — `registrySource` er null for alle unntatt 10, `isResearchConstruct` er `false` for alle 38 976.

**Ny modell:**

```prisma
model Producer {
  id           String   @id            // gjenbruk kilde-Company.id verbatim
  orgNr        String   @unique
  name         String
  country      String   @default("NO")
  municipality String?
  metadata     Json?
  subsidies    Subsidy[]
  deliveries   DeliveryVolume[] @relation("DeliverySupplier")
  @@index([country])
}
```

Produsentrader har kun `name`, `orgNr`, `country`, `metadata` utfylt (målt 2026-05-20: 0 har `hqCity`/`naceCode`/`legalForm`/`employees`; alle 38 925 har `metadata`). `municipality` kan utledes fra `metadata` (produksjonstilskudd-import).

**FK-påvirkning (målt 2026-05-20, lokal DB):**

| Barnetabell | Kolonne | → produsent | → selskap |
|---|---|---|---|
| `Subsidy` | `companyId` | 179 310 | 1 |
| `DeliveryVolume` | `supplierId` | 60 308 | 2 |
| 14 øvrige FK-kolonner | — | 0 | (uberørt) |

Bare `Subsidy` og `DeliveryVolume.supplierId` peker på produsenter. Alle andre `Company`-relasjoner (regnskap, styre, eierskap, eiendom, dokumenter, havbruk, business-relasjoner) har **null** produsentrader og er uberørt. `DeliveryVolume.buyerId` peker alltid på et kuratert selskap.

**Migreringssekvens (hvert steg verifiserbart):**

1. Opprett `Producer`-tabell (Prisma-migrering).
2. Kopier 38 925 rader `Company` → `Producer`. **`id` gjenbrukes uendret** — derfor trenger ingen FK-*verdier* å endres, bare hvilken tabell de peker på.
3. `Subsidy`: legg til `producerId`, sett `= companyId`, håndter den 1 selskaps-koblede raden, dropp `companyId`-koblingen mot produsenter, legg til FK mot `Producer`.
4. `DeliveryVolume`: repek `supplierId`-FK fra `Company` til `Producer`; håndter de 2 selskaps-leverandørradene; `buyerId` uendret.
5. Slett de 38 925 produsentradene fra `Company`.
6. Verifiser rad-antall før/etter hvert steg.

**Avvikrader (3 stk) — egen oppgave før migrering:** undersøk den 1 `Subsidy`→selskap og de 2 `DeliveryVolume`→selskap. Forventet løsning: omklassifiser entitetene (en produsent *kan* være et AS, f.eks. «HORNS SLAKTERI AS») eller korriger radene. Besluttet (review 2026-05-20): default = behandle dem som produsenter hvis de er gårdsbruk/primærprodusenter.

**Etter migrering:**

- `Company` har ~51 rader → `getCompanies()` i `src/lib/queries/companies.ts` kan droppe chunking-/`includeAll`-/55k-logikken (`companies.ts:67-78`).
- Nytt query-modul `src/lib/queries/producers.ts`.
- `graph.ts`: produsenter forsvinner som 38 925 isolerte `company`-noder → «isolerte noder» faller mot null.
- `subsidies.ts`, `subsidies-agg.ts`, `supply-chain.ts` leser fra `Producer`.
- Sider: `/selskap` blir rent kuratert (ingen «vis alle»); ny `/produsenter`-flate (registervisning, tydelig merket som rådata).

**Prod-runbook:** prod-DB har ferske migreringssår (skjemadrift, catch-up-migrering, bare-psql-runner). Planen inkluderer dry-run, rad-antall-assertions før/etter, og et eget prod-migreringssteg.

## Risiko

| Risiko | Avbøtende tiltak |
|---|---|
| ~240k FK-rader repekes | `id`-gjenbruk gjør steg 3–4 til rene constraint-endringer, ikke dataomskriving |
| Prod-migrering på en DB med driftshistorikk | Dry-run + rad-antall-assertions + eksplisitt runbook i planen |
| 3 avvikrader (Subsidy/DeliveryVolume → selskap) | Egen undersøkelsesoppgave *før* migreringssteget |
| Stort plan-omfang i én sesjon | Planen fases internt: lav-risiko UI-arbeid først, migrering som isolert, verifiserbar blokk |

## Suksesskriterier

- En utenforstående leser forsiden på ~20 sekunder og vet hva appen er.
- Ett selskapstall brukes overalt; «55 000+» er borte.
- Kunnskapsgrafens «isolerte noder» er nær null.
- Ingen strippede norske tegn i navigasjonen.
- Produsenter ligger i egen `Producer`-tabell og har en egen, tydelig merket flate.
- Sidemenyens fase-tall er identisk med forsidens.
- `npm run build` og `npm run lint` er grønne; eksisterende tester passerer.

## Avklart i review (2026-05-20)

1. **Nav-gruppering (3b)** — godkjent som foreslått.
2. **Innhold-tegnsetting (arbeidsområde 5)** — med i denne planen.
3. **Avvikrader** — default-håndtering (behandle de 3 som produsenter) godkjent.

Spec godkjent av bruker — klar for implementasjonsplan.
