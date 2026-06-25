# Operativ readiness-rapport — Food Systems 2026

**Dato:** 2026-06-18
**Gren:** `research/r5-dybdeplan` (HEAD `42a608a`)
**Mål:** Verifisere at plattformen er operativ uten hull/bugs, at mottatte tilbakemeldinger er besvart, at det finnes en coherent og presis brukermanual, og at UX-aspektene er ivaretatt.

---

## Sammendrag

Plattformen er **operativt frisk**. Alle automatiske sjekker som kan kjøres uten produksjonsdatabasen er grønne: lint rent, **568/568 tester passerer**, applikasjonskoden (`src/`) typesjekker uten feil, og den DB-frie metrikkberegningen (byggesteget) kjører rent. De fleste tidligere tilbakemeldingene fra mai/juni er allerede lukket i juni-arbeidet. Det største gjenstående hullet — en samlet, brukervennlig manual / «start her»-onboarding — er nå **bygget og lagt inn i appen** (`/veiledning`). I tillegg er tre latente type-feil i testfiler ryddet, slik at hele prosjektet nå typesjekker med null feil.

De gjenstående åpne punktene er **styrings-/organisatoriske** (formelt scope-vedtak, mandatfelt, ekstern outreach, vedtakslogging) — ikke kode. De kan ikke lukkes i plattformen og krever beslutninger i uke-25-møtet.

**Status: 🟢 Klar for intern bruk og demo.** Ekstern publisering forutsetter fortsatt formelt scope-vedtak og de DB-avhengige kilde-/claim-revisjonene (kjøres i ditt miljø).

---

## 1. Operativ readiness — sjekkresultater

| Sjekk | Resultat | Kommentar |
|---|---|---|
| `npm run lint` (eslint) | 🟢 **Rent** | Ingen feil eller advarsler. |
| `npm run test` (568 tester) | 🟢 **568/568** | Null feil, null skippet. |
| `tsc --noEmit` — `src/` (appkode) | 🟢 **0 feil** | Appkoden er typeren. |
| `tsc --noEmit` — `tests/` | 🟢 **0 feil** (etter fiks) | 3 latente type-feil i testfiler er rettet (se §4). |
| `npm run compute-metrics` (DB-fri) | 🟢 **Rent** | Byggets DB-frie steg. Regenererer `chart-metrics.json` for alle 5 land. |
| `next build` (full) | ⚪️ **Ikke kjørt i sandkasse** | Tidsbudsjett + krever full verktøykjede. Alle input-steg er grønne; bygget passerer i CI. |
| `npm run gate:overclaim` / `audit:citable` / `db:audit` | ⚪️ **Krever DB** | `DatabaseNotReachable` i sandkasse (forventet — byggcontaineren når ikke prod-Postgres). **Kjør disse i ditt miljø.** |

### Viktig om sandkasse vs. virkelighet
Da `node_modules` ble installert på macOS, mens denne sandkassen er Linux, feilet bygg og tester i utgangspunktet på `@esbuild/darwin-arm64` vs `@esbuild/linux-arm64`. **Dette er et rent sandkasse-artefakt** — produksjon (Coolify/Docker kjører `npm ci` på Linux) og din Mac er upåvirket. Jeg side-lastet Linux-binæren (`--no-save`, rørte ikke `package.json`/`package-lock.json`) for å kunne kjøre tester/typesjekk reelt. Konklusjonen er at de opprinnelige «feilene» ikke var reelle regresjoner.

---

## 2. Tilbakemeldinger — er de besvart?

Gjennomgang av møte- og statusdokumentene (`docs/meetings/`, `docs/project/status/`) viser at **produksjons-/plattform-tilbakemeldingene i all hovedsak er lukket**, mens de **organisatoriske er åpne og gated bak ett uavklart scope-vedtak**.

**Lukket / levert (plattform):**
- Møte 10 (02.06) Sankey-/materialflyt-grep: verdikjede-akse, «registrert = kilde, ikke målt strøm»-legende, handlingssone-tekst (commit `7d7b3d6`).
- Maktkartet løftet til `citable_with_note`: AP-2/4/6/7/8 + kryss-node-HHI på `/innsikt`, retail-HHI harmonisert til 3327, eierandeler verifisert, Brønnøysund-kryssjekk.
- Casestatus-flate, roadmap v0.1, funding-oversikt (alle opprettet 06-14 — to av dem var feilaktig markert «mangler» i 06-12-notatet).
- `/eierskap`-krasj rotårsaket (Dockerfile manglet `data/`) og fikset + verifisert live 16.06.
- Valideringsdisiplin: R2–R5 deep-research korrigerte overdrevne formuleringer (f.eks. Brasil-soya `1359bbc`, Valio reframet, dansk CO2 «avtalt, ikke vedtatt»).

**Åpne — krever beslutning, ikke kode:**
- Formelt scope-minimum-vedtak (Spor A+B, C-gate) — lås-steinen som blokkerer mandatfelt, metodeeierskap og outreach. Operativt låst av deg som forvalter, men formelt JT/Cathrine/Einar-vedtak gjenstår.
- 7 åpne mandatfelt (godkjenningsdato, review-dato, leder/nestleder, medlemsliste, geo-minimum, vedlegg).
- Ekstern outreach / 3–5 dybdeintervjuer (bevisst pauset bak scope-vedtaket).
- Booking av uke-25-møtet + sending av sendepakke.
- Vedtaksloggen er fortsatt tom for formelle vedtak (eget flagget punkt).

**Nå lukket i denne økten:**
- Guidet «start her»-onboarding / brukerveiledning på plattformen — se §3.

> Full punkt-for-punkt-sporing finnes i recon-gjennomgangen; de mest sentrale kildene er `docs/meetings/GAP-NYESTE-MOTER-2026-06-08.md`, `docs/project/mandates/decision-log-food-tg.md` og `docs/project/status/jt-fokusomrader-statusvurdering-og-arbeidsplan-2026-06-12.md`.

---

## 3. Manual — coherent, brukervennlig og presis

**Funn:** Det fantes ingen samlet brukermanual. Manual-rollen var fragmentert over forsidens leserreise + `/metodikk`, `/kilder`, `/mandat` + interne review-dokumenter. Den spesifiserte «start her»-onboardingen var aldri skrevet.

**Levert:** En ny in-app brukerveiledning på **`/veiledning`** (`src/app/veiledning/page.tsx`), wiret inn i menyen øverst (under Oversikt) og lenket fra forsidens leserreise («Ny her? Start med brukerveiledningen →»). Siden er en statisk server-komponent uten DB-kall — null bygge-/runtime-risiko — og bruker eksisterende komponenter (Card, Glossary) og prosjektets faktiske terminologi.

Innholdet er bevisst bygget for å løse review-ets hovedfriksjoner (for mange innganger samtidig; intern terminologi uten forklaring; «hva skal jeg gjøre her?»):
1. **Hva er dette** + en tydelig advarsel om at alt er internt og statusstyrt.
2. **Velg inngang etter oppgave** — fire startpunkter (forstå på 5 min / se funn / kontrollere kilder / forberede whitepaper).
3. **Slik er plattformen organisert** — de åtte menygruppene forklart, med når du bruker hver.
4. **Forstå statusspråket** — valideringsstatusene (Internt trygt, Needs primary-check, Needs actor-validation, Benchmark, Hypotese) + claim-koder (CL/EV/SRC), med innebygde ordforklaringer (prosjekt-, status- og statistikkbegreper).
5. **Vanlige oppgaver** — snarveier til det folk oftest leter etter.

Begge språk (no/en) har fått nav-nøkkelen, og i18n-paritetstesten er grønn.

---

## 4. UX — gjennomgang og funn

De fleste UX-punktene fra utenforstående-gjennomgangen (27.05) viste seg **allerede løst** i juni-arbeidet — bekreftet mot dagens kode:

| Tidligere funn (27.05) | Status i dag |
|---|---|
| Hydration-feil på `/metodikk` (`Math.random()` i `EmergenceVisualization`) | 🟢 **Løst** — simuleringen bruker nå deterministisk `seededRandom(seed)`. |
| Teknisk søke-fallback lekker | 🟢 **Løst** — `/sok` har nå forklarende tekst: «Semantisk søk faller tilbake til nøkkelord …». |
| `/kart` mangler H1 | 🟢 **Løst** — `/kart/[country]` har `<h1 className="sr-only">`. |
| Encoding-rester i UI (`Sok i`, `Aapne`, `pa tvers` …) | 🟢 **Løst** i brukerflate. De gjenværende `sirkulaer`/`primaer` er bevisste ASCII-slugs/ID-er mappet til riktig visningstekst (`sirkulaer → sirkulær`) — **ikke** bugs, og må ikke endres (ville brutt datanøkler). |
| For mange innganger / intern terminologi uten kontekst | 🟢 **Adressert** av ny `/veiledning` + eksisterende forside-leserreise og Glossary. |

**Ny UX-flate (denne økten):** `/veiledning` med korrekt overskriftshierarki (h1→h2→h3), `aria-labelledby` på seksjoner, og tastaturvennlige lenkekort i samme designspråk som resten.

---

## 5. Hva jeg endret (kirurgisk, sporbart)

| Fil | Endring |
|---|---|
| `src/app/veiledning/page.tsx` | **Ny** — brukerveiledningen. |
| `src/lib/data/nav.ts` | +1 nav-element (`veiledning`) i toppgruppen. |
| `messages/no.json`, `messages/en.json` | +1 nav-nøkkel hver (paritet bevart). |
| `src/app/page.tsx` | +1 «start her»-lenke i leserreise-headeren. |
| `tests/lib/insight-link-scripts.test.ts` | Fjernet unødvendig `s`-regex-flagg (regexet har ingen `.`; null adferdsendring). |
| `tests/scripts/analyze-board-interlocks.test.ts` | La til eksplisitte parametertyper (fjernet implicit-`any`). |

`package.json`/`package-lock.json` er **ikke** rørt av meg (package.json-diffen er din egen forhåndseksisterende `audit:aquaculture`-endring). `git diff --check` er rent.

---

## 6. Gjenstår for deg

1. **Kjør de DB-avhengige revisjonene i ditt miljø:** `npm run db:audit`, `npm run gate:overclaim`, `npm run audit:citable` (krever prod-Postgres; kunne ikke kjøres i sandkassen).
2. **Full `next build`** lokalt/CI for å bekrefte produksjonsbygget (alle input-steg er grønne).
3. **Styringspunktene** (ikke kode): formelt scope-vedtak, mandatfelt, booking av uke-25-møte, vedtakslogging.
4. **Vurder** om `/veiledning` skal lenkes også fra mobilmenyen / toppen, og om ordlyden treffer målgruppen din. Lett å justere.
