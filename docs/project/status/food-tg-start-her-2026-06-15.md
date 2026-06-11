---
tittel: Food TG Start her - uke 25
status: Intern onboarding v0.1
eier: Gabriel
dato: 2026-06-15
scope: Kort lesesti for JT, Cathrine, Thea og nye TG-lesere som skal forstå prosjektstatus uten repo-jakt.
bruksregel: Intern onboarding. Dette dokumentet åpner ikke ekstern outreach, nye claims, møtevedtak eller publiseringsmodus.
relaterte_filer:
  - docs/meetings/MØTEOVERSIKT.md
  - docs/project/mandates/food-transition-group-mandate-2026-04-21.md
  - docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
  - docs/project/status/jt-statusnotat-uke-25-2026-06-15.md
  - docs/project/status/port-e-event-go-uke-25-2026-06-15.md
  - docs/project/status/jt-uke25-sendepakke-2026-06-15.md
---

# Food TG Start her - uke 25

## 1. Formål

Food TG-prosjektet skal gjøre Circular Food-arbeidet styrbart fram mot kontraktsfristen 31.07.2026: roadmap v0.1, offentlig online event, intern deck og et kontrollert grunnlag for videre H2-validering. Arbeidet er ikke et åpent researcharkiv lenger. Det er et beslutnings- og valideringsløp der case, claims, kilder og aktørspørsmål må gå gjennom faste porter.

Les denne siden først hvis du skal inn i prosjektet som JT, Cathrine, Thea, Einar eller nytt TG-medlem og trenger status uten å åpne hele repoet.

## 2. Lesesti

Følg denne rekkefølgen. Den er bevisst: historikk først, mandat etterpå, så casevalg, operativ status og til slutt hva som kan siteres.

| Steg | Les | Bruk til |
|---:|---|---|
| 1 | MØTEOVERSIKT - `docs/meetings/MØTEOVERSIKT.md` | Forstå møtehistorikk, kontrakt, kapasitetsramme og hvilke samtaler som er arbeidsavklaringer vs. vedtak. |
| 2 | mandat - `docs/project/mandates/food-transition-group-mandate-2026-04-21.md` | Forstå formål, governance, medlemskap, beslutningsloggkrav og hva TG faktisk skal levere. |
| 3 | case-shortlist - `docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md` | Se de syv caseankrene, hvorfor de finnes, og hvilke stoppspråk som gjelder. |
| 4 | sprintboard - `docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md` | Se nå-status, blokkere, DASK/AASK-spor, deck-readiness og go/no-go-retning per case. |
| 5 | citable-status - `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` | Se operatorsekvensen og hva som må kjøres før tall eller claims kan brukes eksternt. |

Hvis tiden er knapp: les steg 3 og 4 først, men ikke ta beslutninger uten steg 1, 2 og 5.

## 3. Statusordliste

| Status | Betyr | Bruksregel |
|---|---|---|
| `citable_external` | Kilde/claim er vurdert egnet for ekstern bruk med locator og kontroll. | Kan brukes eksternt bare etter fersk operatorsekvens og riktig kontekst. |
| `internal_context` | Kilde/claim forklarer intern analyse, men er ikke ekstern faktastemme. | Kan brukes i arbeidsmøter; ikke i offentlig presentasjon. |
| `blocked_unsourced` | Claim mangler tilstrekkelig kilde eller locator. | Skal ikke løftes. Finn kilde eller parker. |
| `needs-primary-check` | Hypotesen kan være relevant, men trenger primærkilde, dokumenteier, avtaletekst eller bruksrett. | Send bare intern DASK hvis gate er åpnet. |
| `needs-actor-validation` | Claim trenger bekreftelse fra aktør eller dataeier før det kan modnes. | Forbered AASK, men ikke send før minimumsvedtak eller egen outreach-gate. |
| `deckklart internt` | Kan brukes i intern deck med tydelig caveat og stoppspråk. | Ikke gjør om til ekstern påstand. |
| `watchlist` | Interessant spor, men ikke beslutningsbærende nå. | Behold som radar til konkret kilde, aktør eller data finnes. |

## 4. Hvem eier hva

| Eier | Ansvar nå | Må ikke blandes med |
|---|---|---|
| JT | Beslutningsmøte uke 25, minimumsvedtak, H1/H2-todeling og Port E. | Teknisk merge av PR #159. |
| Einar | Bekrefte kontraktstolkning, H1/H2 og eventramme der det trengs. | Operativ kildeimport eller sprintboard-redigering. |
| Thea | Event- og kommunikasjonskapasitet etter Port E. | Faglig claim-validering før kilder/claims er klare. |
| Cathrine | Faglig sparring, dokumenteiere, ten-step/context og interne avklaringer. | Ekstern outreach uten vedtak. |
| Gabriel | Repo, kontrollfiler, claim-lock, operatorsekvens, DASK/AASK-forberedelse og plattformlanding. | Å fatte TG-vedtak alene. |

## 5. Stop-regler

1. Dette dokumentet gir ikke ekstern outreach. DASK kan sendes internt etter uke 25-gate; AASK holdes tilbake til minimumsvedtak eller separat outreach-gate.
2. Ingen claim går forbi claim-lock. Hvis sprintboard, casekort og claim-lock er uenige, stopp og oppdater kontrollfilene i riktig rekkefølge.
3. Ikke bruk nye citable- eller strict-source-tall utad før operatorsekvensen i `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` er kjørt ferskt etter merge/deploy.
4. Plattformstacken ligger i PR #159. Den er teknisk grønn, men skal ikke merges før Gabriel eksplisitt har godkjent eller endret G-06, G-10 og G-11.
5. Hvis et møte ender i orientering uten vedtak, logg det som uavklart. Ikke oppgrader status i decision-log, casekort eller sprintboard.

## 6. Neste praktiske handling

For uke 25 er riktig rekkefølge:

1. Book JT/Einar/Thea-slot med `docs/project/status/jt-uke25-sendepakke-2026-06-15.md`.
2. Bruk `docs/project/status/jt-statusnotat-uke-25-2026-06-15.md` som pre-read.
3. Bruk `docs/project/status/port-e-event-go-uke-25-2026-06-15.md` for Port E go/no-go, Q&A-stoppliste og fallback.
4. Be om vedtakene i `docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md`.
5. Logg svar i `docs/project/mandates/decision-log-food-tg.md`.
6. Deretter oppdateres casekort, sprintboard, PCQ/source-shortlist og claim-lock bare der svaret faktisk gir ny dokumentasjon eller ny beslutning.
