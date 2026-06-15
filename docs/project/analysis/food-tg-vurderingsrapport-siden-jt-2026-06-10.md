---
tittel: Vurderingsrapport — arbeid og oppnådd innsikt siden samtalene med Jan Thomas
status: Intern analyse
eier: Gabriel
dato: 2026-06-10
baseline: Møte 9 (26.05.2026, metodeoverføring) som hovedlinje; eget delkapittel for leveranser på møte 10 (09.06.2026, arbeidsavklaring/case-spissing)
bruksregel: Dette dokumentet løfter ingen claim til validert eksternt. Det er en intern statusvurdering for videre utvikling av prosjekt, database, kunnskapsgrunnlag, transparens og onboarding.
relaterte_filer:
  - docs/meetings/MØTEOVERSIKT.md
  - docs/project/analysis/food-systems-samtaleanalyse-og-status-2026-06-09.md
  - docs/project/status/FULL-INTERN-HELSESJEKK-2026-05-27.md
  - docs/project/analysis/outside-user-platform-review-2026-05-27.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Vurderingsrapport: hva har vi gjort, oppnådd og hvor går vi videre

## 1. Kort konklusjon

Siden metodeoverføringsmøtet med Jan Thomas 26.05.2026 har prosjektet levert 137 commits og 132 nye filer i fire tydelige bølger: (1) kilde- og siteringskontroll på databasenivå, (2) datakvalitetsmerking og flytmodeller som nye analyseuttak, (3) klarhets- og transparensarbeid på plattformen, og (4) et komplett mottaksapparat for 09.06-samtalens case-spissing.

Svaret på hovedspørsmålene er:

- **Har vi oppnådd noe?** Ja. Materialet er omgjort til konkrete uttak: en case-shortlist med 7 prioriterte caseankre, casekort med go/no-go-status, deck-outline med sikker språkbank, evidensgraderte materialflytkart, og et siterbarhetslag der 7 av 12 acceptance-svar er cite-ready og resten fail-closed blokkert.
- **Er det pålitelig?** Kontrollapparatet er prosjektets sterkeste side. Strict source gate er grønn per 10.06 etter re-greening, 446 tester passerer, og 0 av 2 699 kildesiteringer står som blocked_unsourced. Påliteligheten er bygget inn som porter (claim-lock, PCQ, source-shortlist), ikke som etterkontroll.
- **Bør vi gjøre mer research?** Ja, men målrettet — ikke i bredden. Bredde-research er ikke lenger flaskehalsen. Flaskehalsen er (a) interne dokumenter som mangler (MOU-er, kaffeprosjekt, møtelogg etter 21.04), (b) aktørdata som krever kontakt, og (c) ett formelt minimumsvedtak som ingen kontrollfil kan erstatte.
- **Trenger vi flere oppstillinger/matriser/verktøy?** Strukturene finnes allerede og er gode. Behovet er konsolidering og synliggjøring: én samlet casestatus-flate i appen, ferdigstilt deck, og en guidet leserreise for onboarding — ikke flere parallelle dokumenter.

## 2. Baseline: de to samtalene

| Samtale | Dato | Innhold | Status i repo |
|---|---|---|---|
| Møte 9 — Metodeoverføring Cities/Food | 26.05.2026 | Wageningen/Moerman/R9-metode overført som internt metodegrunnlag med forbehold; Food TG eier source-registration, claim-lock, scorecard og valideringssprint. Stoppsignal: ikke bruk WUR-score/Moerman/utenlandscaser som nordisk bevis. | QA-lukket 28.05 i `food-tg-meeting-transfer-qa-2026-05-28.md`; ikke formelt TG-vedtak. |
| Møte 10 — Arbeidsavklaring og case-spissing | 09.06.2026 | Styringskorreksjon: bort fra «hele matsystemet», inn i 5–7 verdikjedeankre der prosjektet har data, relasjoner eller finansieringsinnganger. Casesignaler: kaffe/Brasil, kakao, Valio, Bama/distribusjon, spillvarme, 100% Fish, Skottland/Polen. | Transkripsjon importert, analysert i `food-systems-samtaleanalyse-og-status-2026-06-09.md`, ført i MØTEOVERSIKT som arbeidsavklaring. |

## 3. Hva som er gjort i perioden 26.05–10.06

### 3.1 Kilde- og siteringskontroll på databasenivå (26.05)

En kritisk analyse av database, datagrunnlag, siteringer og validering (PR #83) ble fulgt av en sammenhengende remedieringsserie samme dag: kvalitetsaudit av akademiske kilder, link-rot-worklist, sha256-filhash med integritetsverifikasjon, backfill av accessedAt/archivedUrl via Wayback, Crossref DOI-resolver, påkrevd Report.author med CI-gate, primaryCitationId på produsenter, og en ukentlig automatisert citation-verification-workflow over Cloudflare Tunnel (PR #84–#101). Dette flyttet kildekontrollen fra manuell til løpende maskinell.

### 3.2 Metodeoverføring lukket kontrollert (26.05–03.06)

Wageningen-gate-analysen og valideringskontrollene ble dokumentert 26.05, metodeoverføringen registrert, og hele møteoverføringen QA-lukket 28.05 (merged 03.06, PR #113). Stopplisten fra møtet er respektert: metoden står som internt grunnlag med forbehold, ikke som ekstern validering.

### 3.3 Graf- og personopprydding (26.05–27.05)

Duplikate personprofiler trietert, isolerte grafnoder behandlet, proveniens lagt på aktørrelasjoner, strukturell konfidens klassifisert, og PersonProfile-stubber laget for styremedlemmer uten profil. Graf-audit 27.05: 2 137 noder, 2 739 kanter, 100 % kantkonfidens, 0 manglende endepunkter.

### 3.4 Full intern helsesjekk og utenforstående-gjennomgang (27.05)

`FULL-INTERN-HELSESJEKK-2026-05-27.md` kjørte hele gate-settet (lint, test, db:audit, strict-sources, citable, graf, remediation, build) pluss fysisk runtime-QA av 12 nøkkelflater og 4 API-er: ingen P0-blokkere, ett P1-funn (hydration-feil på `/metodikk`). Parallelt ga `outside-user-platform-review-2026-05-27.md` en førstegangsbruker-vurdering: «intern beslutnings- og valideringsklar, men ikke ekstern presentasjonsklar uten guidet leserflate».

### 3.5 Datakvalitetsmerking og overclaim-gate (29.05)

CoverageProfile-primitiv med ren klassifisering (temporal/geografisk/verifikasjon), CoverageBadge i UI, dataset-registry, compute-coverage kjedet inn i metrics, overclaim-audit-koder i PR-gaten, coverage-oversikt på `/kilder` og proveniens-appendix i hvitboken. Dette er et direkte svar på behovet for transparens om hva dataen faktisk dekker.

### 3.6 Sirkulær og romlig flytmodell (29.05)

Strukturerte, evidensgraderte materialstrømmer (FlowEdge/LoopFlows gjenbruker EvidenceStatus + R-ladder), Sankey- og nettverksvisning med evidensfarger og sporbare kildereferanser i inspektøren, materialflyt-fane, og Kalundborg-symbiosen som første romlige case med observert gips-strøm (PR #104–#109). R-ladder-klassifiseringene ble samtidig justert til kanonisk Potting 2017 (PR #111). Dette er nye analyseuttak — ikke bare lagring av research.

### 3.7 Klarhet, transparens og onboarding på plattformen (08.06–09.06)

Basert på utenforstående-gjennomgangen ble en sideklarhets-audit omsatt i seks merged bølger: intern/ekstern-skille med dekningmerking (P0, PR #121), æ/ø/å-sveip og rød-recolor (P1a, PR #122), delt ordliste/glossary-komponent (P1b, PR #123), fjerning av DB-/dev-lekkasje i leserflater (P2a, PR #124), orienteringsingress/breadcrumbs/enhetslabels (P2b, PR #125), og norsk språk på `/kart/flow`, delvis-sidene og `/media` (P2c–P2e, PR #126–128). I tillegg i18n fase 1 med NO/EN-kataloger og språkbryter (PR #129).

### 3.8 Infrastruktur og drift (10.06)

Tunnel-diagnose med rotårsak (tom TUNNEL_TOKEN), autentisert DB-readiness-probe, økosystemkart og runbook (`INFRA-ECOSYSTEM-MAP.md`), manuell prod-dataimport-workflow, dependabot-opprydding (PR #130–#134). Daglige Coolify-snapshots har gått uavbrutt hele perioden.

## 4. Leveranser spesifikt på bestillingene fra 09.06-samtalen

Samtalen ba om executive summary, 5–7 prioriterte caseområder, casekort, claim hygiene-tabell, timeline juni–desember og deck-uttak. Status etter 24 timer:

| Bestilling fra samtalen | Leveranse | Status |
|---|---|---|
| Samtalen arkivert og analysert | Transkripsjon + `food-systems-samtaleanalyse-og-status-2026-06-09.md` + MØTEOVERSIKT-føring | Levert |
| 5–7 prioriterte caseområder | `food-tg-case-shortlist-addendum-2026-06-09.md` med casekort, watchlist, go/no-go og to-ukers arbeidsløp | Levert |
| Casekort med claim hygiene | `food-tg-casekort-og-research-mottak-2026-06-10.md` + claim-lock-innstramming | Levert |
| Deck-uttak | `food-tg-deck-outline-2026-06-09.md` med slideplan, visuelle uttak og sikker språkbank | Levert (outline; selve decket gjenstår) |
| Beslutningsgrunnlag | `food-tg-minimumsvedtak-casekort-2026-06-09.md` med foreslått vedtakstekst | Levert — venter på vedtak |
| Dokument- og aktørinnhenting | `food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md` (DASK/AASK-IDer) | Levert — ask ikke sendt |
| Research på nye casesignaler | Deep research-prompt pack + mottak av 8 DRO/DRR-resultater + source intake, alt 10.06 | Levert og logget |
| Operativ styring | `food-tg-0906-sprintboard-go-no-go-2026-06-10.md`: 7 case med nå-status, blokkere, stoppsignal og go/no-go-retning | Levert |
| Timeline juni–desember | Inngår i case-shortlist («Juni-desember uttak») | Levert, må integreres i arbeidsplanen |

Vurderingen er at samtalens arbeidsbestilling er omsatt komplett til internt apparat på under to døgn, uten at noen av de nye samtalehypotesene har lekket inn i faktastemme. Deep research-runden 10.06 ga allerede differensiert utfall: Valio, distribusjon/adoption-gate og 100% Fish står som «deckklart internt» (med caveats), kaffe/kakao står som needs-primary-check uten MOU-dokument, Polen står som watchlist/kill-test.

## 5. Har materialet gitt uttak, oversikter og innsikt?

Ja, på fire nivåer:

1. **Beslutningsuttak.** Case-shortlist, casekort, minimumsvedtak og sprintboard gjør at neste TG-møte kan fatte ett konkret vedtak i stedet for å diskutere et åpent materialtilfang. Deck-readiness-tabellen viser at slideområdene «syv caseanker», Valio (smalt), distribusjon (bredt) og 100% Fish (benchmark) kan fylles nå.
2. **Analyseuttak.** Flytmodellen (Sankey/nettverk med evidensfarger), coverage-oversikten, Wageningen-dashboardet og den nordiske sirkularitetsrapporten er visuelle/strukturerte uttak generert fra databasen, ikke håndtegnede figurer. R-ladder er nå kanonisk forankret (Potting 2017).
3. **Siterbarhetsuttak.** Acceptance-pakken svarer på 12 definerte spørsmål: 7 cite-ready, 5 fail-closed. Det er et reelt, etterprøvbart «hva kan vi si utad»-uttak — og at 5 blokkeres er en styrke, ikke en svakhet.
4. **Innsiktsmessig.** Det viktigste substansfunnet i perioden er bekreftelsen av spor-arkitekturen: A (fôr/import/proteiner) er mest modent, B (sidestrømmer/restråstoff) er modent med 100% Fish som benchmark — med skillet «utnyttet» vs. «høyverdiutnyttet» som kjerneformulering — og C (marked/innkjøp/distribusjon) forklarer hvorfor løsninger ikke skalerer. 09.06-samtalen utvidet caseuniverset rundt denne kjernen uten å velte den.

Begrensningen er like tydelig: all innsikt har status «sterk intern baseline». Ingen claims er eksternt validert, ingen aktører er kontaktet, og de nye relasjonscasene (kaffe/kakao) hviler på dokumenter som ikke er funnet.

## 6. Pålitelighet og kvalitet

| Kontroll | Status 10.06.2026 |
|---|---|
| Tester | 446 tester / 111 suiter, 0 feil |
| Lint, build, db:audit | Grønt |
| Strict source gate (`db:audit:strict-sources`) | Grønt etter re-greening 10.06 — tre blocker-grupper funnet og fikset (label-only eierskapsrad, 4 vage Bransjeanalyse-relasjoner, 11 interne provenance-unntak harmonisert mellom sjekk #11 og §13) |
| SourceCitation | 2 699 totalt: 154 citable_external, 2 433 citable_with_note, 112 internal_context, **0 blocked_unsourced** |
| FieldCitation | 244 517 |
| Citation readiness-kø | 1 rad igjen (P2, bevisst blokkert kilde) |
| Acceptance pack | 7/12 cite-ready, 5 fail-closed |
| Remediation backlog (27.05) | 471 funn, alle LOW; 0 HIGH/MEDIUM |

To poenger fortjener vekt. For det første viste re-greeningen 10.06 at strict-gaten *hadde regressert* siden 20.05 uten at noen merket det manuelt — det er selve argumentet for at operator-sekvensen i `CITABLE-KNOWLEDGE-BASE-STATUS.md` må kjøres før hver ekstern bruk, og for at den ukentlige CI-verifikasjonen var riktig investering. For det andre er kontrollapparatet nå større enn analyseproduksjonen: claim-registeret med Claim-ID, evidens- og risikofelt per påstand, claim-lock-tabell (~56 rader), source-shortlist (~181 rader), PCQ (14 punkter), DRO/DRR/DASK/AASK-løypene. Det er riktig for pålitelighet, men det betyr at neste marginalinvestering bør gå til *innhold gjennom portene*, ikke flere porter.

## 7. Datastatus og struktur

- **Omfang:** ~183 000 DB-rader (audit 27.05), 2 002 filer i `research/` hvorav 477 i biblioteket, 41 072 noder / 1 641 kanter i utvidet graf-audit på main (mot 2 137/2 739 i kjernegrafen 27.05 — de to tallene måler ulike scope og bør ikke blandes i presentasjoner).
- **Struktur:** Informasjonen er nå lagdelt konsekvent: rådata/kilder → SourceCitation/FieldCitation → claims med lock-status → citable uttak → presentasjonsflater, med coverage- og evidensmerking i UI. Møter, mandater, planer og analyser ligger adskilt under `docs/`, med MØTEOVERSIKT som inngang.
- **Kjente hull (data):** Hima driftsdata (GWh, temperatur, økonomi), islandsk nåtidsdata og norsk fraksjonsdata for restråstoff, Valio fôrkurv/importandel, ZWS/SBMT-fulltekst for Skottland, polske aktør-/volumdata, aggregert handelsdata for bacalhau/kaffe-aksene.
- **Kjente hull (dokumenter):** MOU Brasil og Elfenbenskysten, originalt kaffeprosjekt, FUD-søknader, siste slide deck, formelle TG-møtereferater etter 21.04 (26.05 og 09.06 er intake/arbeidsavklaring, ikke vedtaksmøter).
- **Teknisk gjeld:** hydration-feil på `/metodikk` (P1), 471 LOW-funn i remediation-backlog (rydd kun der funn brukes aktivt), 40 duplicate-warnings i download-backlog.

## 8. Transparens og onboarding

Gjort i perioden: intern/ekstern-skille med InternalSection/InternalBanner, dekningsbadges med legend, delt ordliste nær fagbegreper, fjerning av filstier/DB-navn/shell-kommandoer fra leserflater, norsk språk gjennomgående, breadcrumbs og enhetslabels, NO/EN-bryter. Dette svarer direkte på hovedfunnene i utenforstående-gjennomgangen.

Gjenstår fra samme gjennomgang, i prioritert rekkefølge:

1. **Guidet leserreise på forsiden** — fire innganger: «forstå prosjektet på 5 min», «viktigste funn», «kontroller kilder», «bruk til whitepaper/roadmap». Dette er det største enkeltstående onboarding-grepet.
2. **Topp-seksjon på /innsikt** med de 5 viktigste funnene og deres eksterne-bruk-status.
3. **Søk-tomtilstand** med eksempelsøk og forklaring av modusene; produktmelding i stedet for teknisk feiltekst ved manglende embeddings.
4. **Guidet startmodus i grafen** («mest sentrale aktører», «makt og eierskap», «claims uten nok evidens») i stedet for hairball.
5. **«Hva betyr dette for neste beslutning?»-ingress på /mandat.**
6. **Fix /metodikk-hydration.**

For onboarding av nye mennesker (ikke bare lesere) mangler ett dokument: en kort «start her»-guide som peker på MØTEOVERSIKT → mandat → case-shortlist → sprintboard → citable-status som lesesti. CLAUDE.md + task-guidene dekker utvikler-onboarding; prosjekt-/innholds-onboarding er udekket.

## 9. Bør vi gå videre med mer research og datainnhenting?

Anbefalingen er **ja, men kun gjennom tre smale kanaler** — og nei til ny bredde-research nå:

1. **Intern dokumentask (P0, koster bare en henvendelse):** MOU Brasil/Elfenbenskysten, kaffeprosjekt-dokumentasjon, siste deck, møtelogg etter 21.04, FUD-søknader. Dette avgjør om kaffe/kakao er caser eller parkeres — ingen mengde web-research kan erstatte disse dokumentene.
2. **Målrettet kildeinnhenting per sprintboard-blokker (P1):** Statistics Iceland + SINTEF/FHF-fraksjonsdata, ZWS/SBMT-fulltekst, Ruokavirasto/Tulli for Valio, Klepp/Enova for Wiig, GUS/PROM for Polen-kill-test. Hver av disse har allerede definert stoppsignal i sprintboardet.
3. **Aktørvalidering (P1, etter minimumsvedtak):** AASK-pakken er klar men usendt. Uten aktørdata kommer ingen case forbi «sterk intern baseline». Dette er den reelle flaskehalsen for å løfte innsikt til ekstern bruk.

Begrunnelsen for nei til bredde: samtaleanalysen 09.06 konkluderte selv at «risikoen nå er ikke for lite kunnskap, men at alt blir like viktig», og deep research-runden 10.06 viste at ny research primært produserer needs-primary-check-rader når dokumentgrunnlaget mangler.

## 10. Oppstillinger, matriser og verktøy

Det som finnes og fungerer: sprintboard-matrisen (case × DRO/DASK × blokker × go/no-go), claim-lock-tabellen, statusmodellen for samtalepunkter (dekket-sterkt-internt / venter-aktør / nytt-uten-kilde / benchmark / hold-tilbake), coverage-badges, flytmodellen, deck-readiness-tabellen. Strukturen er moden — anbefalingen er å *ikke* lage flere parallelle matriser.

Tre konsoliderende grep anbefales i stedet:

| Grep | Innhold | Verdi |
|---|---|---|
| Casestatus-flate i appen | Én side som leser sprintboard/casekort og viser de 7 caseankrene med go/no-go, blokkere og deck-readiness — samme data som markdown-filene, men synlig for JT/Cathrine uten å lese repo | Gjør styringsdialogen med JT visuell og løpende; bygger på eksisterende intern/ekstern-komponentene |
| Deck-produksjon | Fyll deck-outline til faktisk presentasjon for slideområdene som er «kan fylles nå» | Innfrir Einars «må i presentasjonsformat» fra april og samtalens eksplisitte deck-bestilling |
| Claim-trakt-oversikt | Liten visning/tabell som viser antall claims per status (lock → cite-ready) over tid | Gjør fremdrift i validering målbar møte til møte |

## 11. Anbefalt veikart

| Prioritet | Handling | Eier | Port |
|---:|---|---|---|
| P0 | Fatte minimumsvedtak om 5–7 casekort (tekst ligger klar) | JT/TG | Formelt TG-vedtak, logges i decision-log |
| P0 | Sende intern dokumentask DASK-0906-001/002 m.fl. | Gabriel/Cathrine/JT | Ingen ekstern kontakt |
| P1 | Produsere intern deck fra outline + sikker språkbank | Gabriel | Claim-lock respekteres; status vises som intern modenhet |
| P1 | Målrettet kildeinnhenting per sprintboard (Island, Skottland, Valio, Hima) | Gabriel | PCQ/source-shortlist oppdateres først |
| P1 | Tette møtelogg-hullet etter 21.04 (Notion-synk eller eksplisitt merking) | Gabriel + Cathrine | MØTEOVERSIKT + meetings.ts |
| P1 | Guidet leserreise på forsiden + «start her»-onboardingdokument | Gabriel | Bygger på P0–P2-klarhetsarbeidet |
| P2 | Aktørvalidering (AASK) etter vedtak | TG | Egen gate, ikke fra sprintboard |
| P2 | Casestatus-flate og claim-trakt i appen | Gabriel | Gjenbruk eksisterende datafiler |
| P2 | Fix /metodikk-hydration; rydd LOW-funn kun ved aktiv bruk | Gabriel | Playwright-verifikasjon |

## 12. Verifikasjon av denne rapporten

Tall og påstander er hentet fra: git-logg 26.05–10.06 (137 commits målt på commit-dato, 132 nye filer, PR #75–#134), `CITABLE-KNOWLEDGE-BASE-STATUS.md` (siteringstall, gate-status 10.06, testtall), `FULL-INTERN-HELSESJEKK-2026-05-27.md` (DB-rader, graf-audit, runtime-QA, backlog), `outside-user-platform-review-2026-05-27.md` (onboarding-funn), `food-systems-samtaleanalyse-og-status-2026-06-09.md` og sprintboardet 10.06 (casestatus, DRR-utfall), samt MØTEOVERSIKT (møtehistorikk). Filtellinger i `research/` og radtellinger i kontrollfilene er gjort med grep/find 10.06. Kvalitetstallene er ikke re-kjørt i denne sesjonen; før ekstern bruk av dem skal operator-sekvensen i `CITABLE-KNOWLEDGE-BASE-STATUS.md` kjøres på nytt.
