# Evidence Discipline Thesis - Trust Through Gates

Export date: 2026-07-04
Packet type: thesis
Status label: mixed: citable plus gated/internal context
Allowed use: Use for narrative structure, but preserve source labels before making external claims.

## What This Source Is For

Make source policy and audit status part of the knowledge product.

## Core Claims Or Working Propositions

- The knowledge base is valuable because it refuses to overclaim.
- Claim-lock, source locators and fail-closed acceptance tests are the trust architecture.
- Decks should show quality status instead of hiding it in footnotes.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Source attribution policy | Use as governing rule. | Applies especially to external claims. |
| Citable acceptance pack | Use as readiness proof. | Some answers are intentionally fail-closed. |
| Audit chain | Use as verification model. | Must be rerun for current state. |

## Known Caveats

- NotebookLM cannot run audits.
- Older audit counts are evidence of that date, not live proof.

## Deck Angles

- Slide: "The boundary is the product."
- Slide: "What we refuse to say is why the rest is useful."

## Bad Generic Framing To Avoid

- Avoid hiding evidence status in appendix only.
- Avoid claiming source-grounded equals correct.

## Source Paths Included

- .claude/source-attribution-policy.md
- research/CITABLE-ACCEPTANCE-TESTS.md
- research/CITABLE-KNOWLEDGE-BASE-STATUS.md

## Source Excerpts

### .claude/source-attribution-policy.md

````markdown
# Source Attribution Policy

> Datert: 2026-05-18
> Gjelder: nye importer, nye DB-fakta, whitepaper-eksport og brukerflater som viser faktiske påstander.

## Formål

Alle faktiske påstander som importeres, vises i appen eller brukes i juni-2026-whitepaperet skal kunne spores til en navngitt kilde med lokator, aksessdato og klassifisert proveniens. Eldre data kan merkes som legacy i en overgangsfase, men skal ikke passere som whitepaper-klare uten eksplisitt kildegrunnlag.

## SourceClass

| Klasse | Bruk | Minimumskrav |
|---|---|---|
| `primary` | Original publisering, årsrapport, offentlig vedtak, lovtekst, registerutskrift eller myndighetsdata | URL, `accessedAt`, og lokal kopi når kilden er brukt til en sentral påstand |
| `secondary` | Analyse, media, bransjeartikkel eller rapport som tolker primærdata | URL, `accessedAt`, tydelig avsender og publiseringsdato hvis tilgjengelig |
| `synthesis` | Prosjektets egen sammenstilling av flere navngitte kilder | Underlagskilder må være koblet; syntesen er ikke selv primærbevis |
| `internal_construct` | Forskningskonstrukt laget for analysemodellering, for eksempel syntetisk eiendomsgren | Må ha forklaring, ansvarlig import og lenke til intern syntese eller beslutningsnotat |
| `registry_snapshot` | Maskinell eller manuell snapshot fra offentlig register/API | URL/API-endepunkt, `accessedAt`, lokal JSON/PDF/HTML-kopi og SHA-256 når mulig |
| `legacy_unsourced` | Historisk rad uten tilstrekkelig kilde | Tillatt bare som overgangsstatus; blokkeres fra whitepaper-eksport og nye importer |

## VerificationStatus

| Status | Betydning |
|---|---|
| `unverified` | Kilden er registrert, men feltet er ikke kontrollert manuelt eller maskinelt |
| `machine_verified` | Feltet er avstemt mot strukturert ekstern kilde eller registersnapshot |
| `human_verified` | Feltet er kontrollert av navngitt reviewer med dato |
| `disputed` | Kildene spriker eller feltet trenger faglig vurdering |
| `rejected` | Feltet er vurdert som feil, blokkert eller uegnet for bruk |

## AccessedAt

- `accessedAt` skal lagres som ISO-8601 med dato-presisjon: `YYYY-MM-DD`.
- Nye kilder uten aksessdato skal avvises av import-helper eller audit.
- Hvis en kilde har både publiseringsdato og aksessdato, skal begge bevares der modellen støtter det. Aksessdato erstatter ikke publiseringsdato.

## Lokatorer

For alle nye ikke-interne kilder kreves minst én av:

- `url`
- `localPath`
- `sourceDocId`
- `documentId`

For sentrale whitepaper-påstander skal en ekstern URL normalt ha lokal arkivkopi eller en koblet `Document`/`SourceDoc`.

## Internal Synthesis

`synthesis` eller eksisterende `internal_synthesis` er gyldig når prosjektet sammenstiller flere navngitte kilder, lager et register, eller formulerer en analyse basert på dokumenterte underlagskilder.

Det er ikke gyldig som erstatning for manglende primærkilde til:

- regnskapstall
- eierandeler
- styre- og rolleinformasjon
- subsidiebeløp
- registerstatus for selskaper
- konkrete juridiske eller regulatoriske vedtak

## Forskningskonstrukter

Forskningskonstrukter er entiteter som finnes i analysemodellen, men ikke nødvendigvis som juridisk registrerte selskaper. Eksempler er syntetiske orgnummer eller interne eiendomsgrener som brukes for å modellere struktur.

Slike entiteter skal:

- merkes med `isResearchConstruct = true`
- ha `orgNrFormat = 'research_construct'`
- ha en `internal_construct` eller `synthesis`-citation
- ikke vises som ordinær registerverifisert virksomhet

Standardspørringer til rapporter og whitepaper skal ekskludere forskningskonstrukter med mindre de er eksplisitt valgt inn.

## Hva betyr verifisert

Et felt er verifisert når verdien er kontrollert mot kilden som faktisk dokumenterer feltet.

- Brønnøysund Enhetsregisteret kan verifisere selskapsidentitet, adresse, organisasjonsform, NACE, status og roller der API-et har feltet.
- Enhetsregisteret skal ikke brukes som kilde for omsetning eller EBITDA dersom slike verdier ikke finnes i responsen.
- Regnskapstall krever årsrapport, Regnskapsregisteret-utskrift, OffentligData financial statement, Proff eller tilsvarende eksplisitt regnskapskilde med lovlig tilgang.
- Rolledata skal bruke separat rollekilde/snapshot, ikke bare generell selskapsmetadata.

## Valutakonvertering til NOK

NOK-konverterte regnskapstall er ikke verifisert bare fordi kildevaluta-tallet er funnet. Begge ledd må dokumenteres:

1. source-currency value fra primærkilde, for eksempel `net sales SEK 84,057m`
2. valutametode og valutakilde, for eksempel Norges Bank årsgjennomsnitt for samme regnskapsår

Standardregel for kalenderårsregnskap:

- Bruk Norges Banks offisielle valutakurser, årsgjennomsnitt, med NOK som kvoteringsvaluta.
- Lagre kurskilde som egen `SourceCitation` eller som eksplisitt `notes`/underlagskilde i citationen.
- Arkiver JSON/CSV fra Norges Bank API når valutakursen brukes i whitepaper-klare tall.
- Bevar originalverdien i kildevaluta i citation-notat eller eget felt når modellen støtter det.
- Avrund bare etter beregning, og dokumenter om DB-feltet bruker MNOK, hele NOK eller annen enhet.

For avvikende regnskapsår, for eksempel Hagar 2024/25, skal man ikke bruke kalenderår 2024 uten særskilt beslutning. Bruk enten:

- gjennomsnitt for faktisk regnskapsperiode hvis API/metode støtter det, eller
- kildevaluta direkte i rapport/UI inntil korrekt FX-metode er etablert.

Hagar 2024/25-pilot: Norges Bank daglige observasjoner for ISK/NOK 2024-03-01 til 2025-02-28 ble hentet 2026-05-18. Serien hadde 250 observasjoner og ga aritmetisk gjennomsnitt 7.85668 NOK per 100 ISK, dvs. 0.0785668 NOK per 1 ISK. Dette gir ca. 14,168.9 MNOK for Hagar sales 180,342 m.ISK. Serien er arkivert som `research/evidence-pack/fx-rates/norges-bank/EXR-B-ISK-NOK-SP-2024-03-01_2025-02-28-2026-05-18.json`.

Observerte Norges Bank-årsgjennomsnitt for 2024, hentet 2026-05-18:

| Valuta | API-observasjon | Enhet | NOK per 1 |
|---|---:|---|---:|
| SEK | 101.74 | NOK per 100 SEK | 1.0174 |
| DKK | 155.89 | NOK per 100 DKK | 1.5589 |
| EUR | 11.6276 | NOK per 1 EUR | 11.6276 |
| ISK | 7.79 | NOK per 100 ISK | 0.0779 |

## Wayback og lokal arkivering

Wayback- eller annen ekstern arkivlink kreves når:

- kilden er en webside som kan endres uten versjonert PDF eller DOI
- kilden er media, bransjeweb, pressemelding eller organisasjonsside brukt til sentral påstand
- samme URL tidligere har vært ustabil, omdirigert eller blokkert
- kilden inngår i whitepaperet og ikke har stabil offentlig arkivversjon

Wayback er normalt ikke nødvendig når:

- DOI eller annen persistent akademisk identifikator peker til kilden
- lokal PDF/JSON/HTML-kopi med SHA-256 er tilstrekkelig og lisensmessig forsvarlig
- kilden er et internt forskningskonstrukt med dokumentert beslutningsnotat

## Git og rå evidensfiler

Git-repoet skal bære metadata, manifests, tekstuttrekk, URL-er, access dates og SHA-256. Store rådokumenter skal ligge i lokal eller ekstern artifact storage.

Nye PR-er skal ikke legge til:

- `research/**/*.pdf`
- `docs/**/*.pdf`
- `research/evidence-pack/registry-sources/**/documents/**`
- tracked filer på 50 MB eller mer

Guardrail:

```bash
npm run audit:research-artifacts -- --base=origin/main
```

Denne sjekken blokkerer nye råfiler i branch-diffen og tracked filer over størrelsesgrensen, men lar eksisterende legacy-PDFer under grensen forbli inntil egen migrering til artifact storage.

## Legacy-regler

Eksisterende fritekstverdier i `source`-felt kan beholdes midlertidig, men skal klassifiseres og ryddes gradvis.

- `web research`, `manual`, rene domenenavn og registeretiketter uten URL/dato skal flagges.
- `legacy_unsourced` skal være eksplisitt, ikke implisitt fravær av kilde.
- Nye import-scripts skal ikke introdusere nye legacy-kilder.
- Whitepaper-eksport skal feile dersom påstanden bygger på `legacy_unsourced`, `disputed` eller `rejected`.

## Minimum for ny import

Nye importer skal levere:

1. `sourceClass`
2. `citationText`
3. `accessedAt`
4. minst én lokator (`url`, `localPath`, `sourceDocId`, `documentId`)
5. `verificationStatus`, minst `unverified`
6. `fieldPath` når citationen bare gjelder et bestemt felt

Hvis kilden er lokal fil, skal SHA-256 beregnes før den brukes i whitepaper eller som registersnapshot.
````

### research/CITABLE-ACCEPTANCE-TESTS.md

````markdown
# Citable Acceptance Tests

Generated from `src/lib/citations/citable-acceptance.ts`.

Every question states the source type, readiness level, allowed evidence, disallowed evidence, and caveat required before the knowledge base can answer externally.

## CA-001: Kan kunnskapsbasen sitere København som benchmark for offentlig økologisk innkjøp?

- Category: `nordic_circularity`
- Expected source type: municipal/public procurement source plus audited report package
- Required citation readiness: `citable_with_note`
- Must use:
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
  - docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md
- Must not use:
  - Eldre København 84%-formulering uten 2024/peak-kontekst
  - Generert README-linjetall eller filstørrelse som kvalitetsbevis
- Known caveat: Bruk 85% i 2024 og skill det fra peak 90% i 2015; forklar at dette er procurement-benchmark, ikke generell nasjonal DK-andel.

## CA-002: Kan T3-diffen siteres som ekstern validering av rapportens konklusjoner?

- Category: `nordic_circularity`
- Expected source type: external domain validation or named expert review
- Required citation readiness: `citable_external`
- Must use:
  - research/v1-2/phase8-T3-ekstern-vs-intern-diff.md
  - research/v1-2/phase7-selvkritikk.md
- Must not use:
  - Språk som sier eller antyder at T3 er ekstern fagfellevalidering
  - LLM-diff alene som dokumentarisk tredjepartsbevis
- Known caveat: T3 er gjennomført, men det er en intern metodekontroll mot en generisk ekstern modellrespons, ikke ekstern validering.

## CA-003: Kan cascade-logikken prioritere forebygging før biogass i sirkularitetsråd?

- Category: `nordic_circularity`
- Expected source type: audited synthesis with cited food-waste and circularity sources
- Required citation readiness: `citable_with_note`
- Must use:
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
  - src/lib/data/circular-leverage.ts
- Must not use:
  - Teknologinøytral rangering uten avfallshierarki
  - Biogassvolum alene som bevis for høyest sirkularitet
- Known caveat: Forebygging er et prioriteringsprinsipp; tallfestede effektforhold må følges av kilde og metodeavgrensning.

## CA-004: Kan vi sitere Norge som HHI 3327 og CR3 96,6% uten å blande begrepene?

- Category: `market_concentration`
- Expected source type: computed market concentration data plus audited report correction
- Required citation readiness: `citable_with_note`
- Must use:
  - public/data/food-systems/no/value-chain.json
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
- Must not use:
  - NO HHI 96,6%
  - CR3 omtalt som HHI eller HHI omtalt som prosentandel
  - Eldre HHI 3445 (NG 48,4/Coop 27,1/Reitan 18,0/Bunnpris 6,6) — erstattet av KT-omsetning 2024
  - Butikkantall-basert parentHhi fra chart-metrics som om det var omsetnings-HHI
- Known caveat: HHI er indeks, CR3 er prosentandel; bruk begge etikettene eksplisitt. HHI 3327 er omsetnings-HHI fra Konkurransetilsynets Dagligvarerapport 2024-25 (NG 43,5/Coop 29,2/Rema 23,9/Bunnpris 3,3 → 43,5²+29,2²+23,9²+3,3² = 3327). Ikke forveksle med chart-metrics butikkantall-baserte parentHhi.

## CA-005: Kan Finland 30%-regelen brukes som sitatklar juridisk sammenligning?

- Category: `market_concentration`
- Expected source type: official legal text or verified legal database locator
- Required citation readiness: `citable_external`
- Must use:
  - Official Finlex/legal locator for Konkurrenseloven §4a
  - research/v1-2/phase8-T3-ekstern-vs-intern-diff.md only as internal comparison note
- Must not use:
  - Intern rapporttekst alene som rettskilde
  - LLM-diff som juridisk fasit
- Known caveat: Inntil juridisk primærkilde er koblet direkte, kan regelen brukes som intern analyse, ikke som ekstern juridisk dokumentasjon.

## CA-006: Kan vi bruke FI-DK 6x matsvinn-forskjell som ekstern rangering?

- Category: `food_waste`
- Expected source type: harmonized food-waste statistics with method caveat
- Required citation readiness: `citable_with_note`
- Must use:
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
  - research/v1-2/phase8-T3-ekstern-vs-intern-diff.md
- Must not use:
  - Rangering uten måleinstrument-/definisjonsforbehold
  - Island-sammenligning uten Hagstofa-validering
- Known caveat: Rapporten sier at forskjellen kan være måleinstrument. Bruk derfor metodenote, ikke ren prestasjonsrangering.

## CA-007: Kan Salling Groups matsvinnreduksjon siteres som halvering?

- Category: `food_waste`
- Expected source type: company or audited report source with scope note
- Required citation readiness: `citable_with_note`
- Must use:
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
  - docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md
- Must not use:
  - Halvering
  - Uten scope-note om food waste percentage og baseline
- Known caveat: Bruk 2,8% baseline 2015 til 1,8% i 2024 (-34,8%), ikke halvering.

## CA-008: Kan eierskaps- og selskapsstrukturer brukes eksternt fra selskapssidene?

- Category: `ownership_company`
- Expected source type: annual report, registry, transaction announcement, or verified resolver locator
- Required citation readiness: `citable_with_note`
- Must use:
  - CompanyOwnership.source citations surfaced on /selskap/[id]
  - src/lib/row-source-locators.ts resolver mappings
- Must not use:
  - Unverified company-tree inference
  - Blocked source markers as if they were documentary evidence
- Known caveat: Use only ownership rows whose citation label resolves to annual report, registry, transaction announcement, or explicit internal-blocked marker.

## CA-009: Kan grafen alene brukes som bevis for styre-/personrelasjoner?

- Category: `ownership_company`
- Expected source type: verified board-member row citation or official registry locator
- Required citation readiness: `citable_external`
- Must use:
  - BoardMember.source with verifiedAt
  - PersonProfile linkage when public graph relationship is cited
- Must not use:
  - Graph edge alone without row-level source citation
  - Orphan board-member graph rows as proof
- Known caveat: Graph audit still reports orphan board-member graph rows; graph is navigation/context unless backed by row-level citation.

## CA-010: Kan offentlige tilskuddsrader siteres eksternt fra databasen?

- Category: `public_subsidies`
- Expected source type: official registry/API/CSV source locator
- Required citation readiness: `citable_external`
- Must use:
  - Subsidy.source resolver for Landbruksdirektoratet production subsidy rows
  - npm run db:audit Source Quality Coverage for Subsidy.source
- Must not use:
  - Aggregated subsidy claim without row source
  - Manual label-only source text
- Known caveat: External use should cite the row source locator and year/category, not only an aggregate in prose.

## CA-011: Kan en bibliotekpost siteres eksternt med bare lokal PDF/tittel?

- Category: `library_sources`
- Expected source type: DOI, handle, publisher URL, or verified document URL plus local file
- Required citation readiness: `citable_external`
- Must use:
  - Document.url, Thesis.url, DOI, handle, or verified publisher locator
  - Local file path only as archive/copy support
- Must not use:
  - Local file path as eneste eksterne locator
  - Title-only or imported filename as source proof
- Known caveat: Local files are useful for archive and review, but external citations need direct public locator or persistent ID.

## CA-012: Kan grafrelasjoner eksporteres som siterbare relasjonspåstander?

- Category: `graph_relationships`
- Expected source type: edge with source citation, confidence, and underlying row/document locator
- Required citation readiness: `citable_external`
- Must use:
  - Source-backed edge or underlying row citation
  - Graph audit integrity output as quality context only
- Must not use:
  - Edges without confidence/source as external evidence
  - Graph neighborhood visualization as proof
- Known caveat: Graph currently has low confidence coverage and many isolated nodes; use it for navigation unless a relationship has source-backed evidence.

## CA-013: Kan vi sitere at konsentrasjonen i norsk matsystem topper i foredling (meieri ~6000, rødt kjøtt ~4600) over dagligvare (~3327), med samvirkene TINE/Nortura som mest konsentrert?

- Category: `market_concentration`
- Expected source type: sourced market shares per node (authority/industry) with arithmetic verification
- Required citation readiness: `citable_with_note`
- Must use:
  - docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md
  - public/data/food-systems/no/value-chain.json
- Must not use:
  - Estimerte utfordrer-andeler presentert som kildebelagte
  - Sammenligning av ulike baser/referanseår som om de var én base
  - Sjømat (~950) framstilt som like konsentrert som retail (~3327)
  - AP-2s n-følsomme inntekts-HHI brukt som markedskonsentrasjon
- Known caveat: Ordinal-funnet (foredling > retail > primær) er robust via leder-gulv (TINE 76,4² = 5837; Nortura 66² = 4356 — begge over retail uansett utfordrer-split). Per-node presise HHI varierer; bær basis + år.

## CA-014: Kan vi sitere at samlede produksjonstilskudd i 2024 var ~18,6 mrd kr, og at den tidligere 10,94 mrd-totalen var et skript-artefakt?

- Category: `public_subsidies`
- Expected source type: open agency data (Landbruksdirektoratet) with reproducible aggregate
- Required citation readiness: `citable_with_note`
- Must use:
  - research/analyse/ap3-tilskuddskonsentrasjon.json
  - docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md
- Must not use:
  - Tidligere 10,94 mrd 2024-total framstilt som reell nedgang
  - Gini/konsentrasjon omtalt som «kapret av de store» uten struktur-/policy-kontekst
- Known caveat: 2024-totalen 18,61 mrd er regenerert etter en kolonnematch-bug (SCHEME_ALIASES) og avstemt mot publisert 18,39 mrd. Gini ~0,52–0,54; konsentrasjonen er strukturdrevet (husdyr/areal).

## CA-015: Kan vi sitere AP-1-styrebroene (logistikk↔retail 7, foredling↔retail 6) som ekstern påstand om makt-konsentrasjon?

- Category: `graph_relationships`
- Expected source type: internal board-interlock graph pending primary check + coverage extension
- Required citation readiness: `citable_with_note`
- Must use:
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
- Must not use:
  - «Kontrollerer» / «koordinerer» / «skjult makt» utledet fra AP-1 alene
  - Generalisering til hele selskapsuniverset uten utvidet styredekning
- Known caveat: AP-1 er intern baseline: 36 % styredekning, favoriserer store/velinnsamlede selskaper; dekningsutvidelse til ~47 % krever DB-kjøring. Pekepinn for AP-2/AP-5, ikke konklusjon.

## CA-016: Kan vi sitere CL-MAKTKART-001: et fåtall konsern kontrollerer vertikalt på tvers av butikk, logistikk og foredling, og konsentrasjonen topper i samvirke-foredling?

- Category: `ownership_company`
- Expected source type: triangulated board + ownership graph, Brønnøysund + public company primary sources
- Required citation readiness: `citable_with_note`
- Must use:
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md
  - docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md
- Must not use:
  - «Samordner»/«opererer i samråd» fra eierstruktur alene
  - AP-1-styrebroer alene uten AP-5-triangulering
  - Aksjonærregisteret som faktisk brukt kilde for 2026-06-15-løftet
- Known caveat: Struktur (form + styre + eierandel-%) er primærsjekket; «kontroll» = strukturell posisjon, ikke intensjon/samordning. Enkeltnoders presise HHI bærer fortsatt forbehold.
````

### research/CITABLE-KNOWLEDGE-BASE-STATUS.md

````markdown
# Citable Knowledge Base Status

Date: 2026-06-10
Branch: `codex/food-tg-mandat-2026-06-09`
Base before current quality-pass commit: `f302ab3 docs: prepare next citable quality tranche`

## Purpose

This file is the current operational status for making the Food Systems 2026
knowledge base usable as a citable external knowledge base. It replaces older
snapshot interpretation for this workstream. Historical audit counts should be
treated as stale unless repeated here.

## 2026-06-10 Strict-Gate Re-Greening (supersedes all verification sections below)

Running the operator sequence on `codex/food-tg-mandat-2026-06-09` found the
strict source gate had **regressed to red** since the 2026-05-20 snapshot: three
enforced violations in `db:audit:strict-sources` / `audit:citations` §13. The
non-strict `db:audit`, `audit:citable-reports`, tests, lint, and build all
stayed green; the regression was data/code drift after the 2026-05-26 gate
change (`9e68918`) and the 2026-06-03 KS/Re:Source import, not from any docs
commit on this branch.

The three blocker groups and their fixes:

- **A — 1 `CompanyOwnership` label-only row.** NorgesGruppen → BAMA Gruppen (46%)
  carried a bare `Brønnøysund` source that missed the resolver's
  `bronnoysund + arsrapport` annual-report case. Set the source to
  `Brønnøysund årsrapport 2024` so the existing resolver returns the BAMA 2024
  annual-report URL. Applied to the DB **and** to the seed-of-truth
  `scripts/import-company-ownership.ts` so it survives re-import and reaches
  prod on the next `db:import`.
- **B — 4 `BusinessRelationship` `Bransjeanalyse` rows** (Skretting→Lerøy/SalMar/
  Mowi feed, Yara→Felleskjøpet fertilizer). `Bransjeanalyse` was the only vague
  industry-label not in `BLOCKED_BUSINESS_RELATIONSHIP_SOURCE_LABELS`; added it
  so those rows carry the same honest blocked-unverified locator as their
  siblings (`Bransjedata`, `BioMar`, …). This also cleared the 4 P0 rows that
  had appeared in the readiness queue.
- **C — 11 internal-exception report `Document` rows** (`internal_synthesis` /
  `composite_source` / `internal_register` / `blocked_source`, each with
  `supportingSources`). The report-URL check (#11) already honoured these
  provenance exceptions, but the Document locator check (§13) did not — a
  coherence gap. Extracted #11's exact predicate into a shared
  `reportQualifiesAsProvenanceException()` used by **both** checks so they
  cannot drift; §13 now exempts Documents whose linked report is a reviewed
  provenance exception. No fabricated locators.

Verification after the fixes (all green):

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 446 tests across 111 suites, 0 fail (incl. new `Bransjeanalyse` resolver test). |
| `npm run lint` | passed | ESLint clean. |
| `npm run db:audit` | passed | Enforced integrity checks pass. |
| `npm run db:audit:strict-sources` / `audit:citations` | passed | Strict gate exits 0; the three §13 violations are gone. |
| `npm run audit:citable` | passed | Full chain (`db:audit` + strict + citable-reports + readiness) exits 0. |
| `npm run research:citation-readiness-queue` | passed | Down to 1 row: P0 0, P1 0, **P2 1**, P3 0 (the intentionally-blocked `agrianalyse-bondens-andel-2025`). |
| `npm run research:citable-acceptance-pack` | passed | 7 of 12 cite-ready, 5 fail-closed blocked. |
| `npm run build` | passed | Prisma + metrics + Next.js build; timestamp/property-count metric diffs reverted (pre-existing drift, not this fix). |
| `git diff --check` | passed | No whitespace errors. |

Current strict citation coverage (supersedes the PR #60/#61 counts below):

- `SourceCitation=2699`
- `citable_external=154`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

## Standard Operator Sequence

Run this sequence before claiming the knowledge base is externally citable:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
```

Current note: PR #60 and PR #61 are merged to `main`. `npm run
db:audit:strict-sources` now passes after citation coverage remediation and the
post-merge internal-marker fix. The readiness queue now tracks 1 P2 residual
report row: the intentionally blocked `agrianalyse-bondens-andel-2025` source.
The 10 internal/composite/register reports without a single URL are reviewed
sourceUrl exceptions because they have explicit `provenanceType` and
`supportingSources` bibliographies. These are not strict external-citation
blockers.

## Current Main Verification After PR #60 And PR #61

This section supersedes the historical milestone counts below.

| Command | Result | Notes |
|---|---:|---|
| `git status --short --branch` | expected clean after commit | Branch is `main`; rerun after checkout to verify no local drift. |
| `npm test` | passed | 176 tests passed across 40 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:refresh:source-citation-readiness` | passed | 2,698 `SourceCitation` rows scanned, 0 rows to update. |
| `npm run db:audit` | passed | Enforced integrity checks passed; warnings remain documented below. |
| `npm run db:audit:strict-sources` | passed | Strict source/citation gate exits 0. |
| `npm run audit:citable` | passed | `db:audit`, strict `audit:citations`, citable report audit, and queue export all completed with exit 0. |
| `npm run research:citable-acceptance-pack` | passed | Regenerated acceptance artifacts; 7 of 12 answers are cite-ready and 5 are fail-closed blocked. |
| `npm run graph:audit` | passed | 41,072 nodes, 1,641 edges, 0 orphan board-member graph rows, 187 board-member profile gaps, 34.8 percent edge confidence. |
| `npm run build` | passed | Prisma generation, chart metric computation, TypeScript, and Next.js production build passed; timestamp-only chart-metric diffs were cleaned afterwards. |
| `git diff --check` | passed | No whitespace errors reported. |

Current strict citation coverage:

- `SourceCitation=2698`
- `citable_external=153`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

Post-merge DB note: syncing `main` and applying the source-citation backfill
added 83 `SourceCitation` rows and 213 `FieldCitation` rows from existing
locators only. A follow-up strict audit found 36 internal
`source:blocked-unsourced/...` marker citations that had been backfilled as
primary/blocked rows. PR #61 fixed the backfill rule and refresh repair path;
the local repair moved those 36 rows to `internal_context`.

Current residual work queue:

- Citation readiness queue: P0 0, P1 0, P2 1, P3 0.
- Remediation backlog: 472 findings total: 0 HIGH, 1 MEDIUM finding, and
  471 LOW findings. SourceDoc locator findings are 0. The former five HIGH
  URL-health blockers are closed in `research/URL-HEALTH-REVIEW.csv` as
  browser-verified tool blocks, citable mirror/local evidence cases, or both;
  the original source URLs were not replaced. The former 18 MEDIUM
  HTML-to-Markdown rows are closed by Markdown companions. Four of the former
  five scanned-PDF MEDIUM rows are closed by `research/PDF-OCR-REVIEW.csv`;
  the remaining MEDIUM row is the 1 KB RASTECH PDF that OCR skipped as likely
  corrupt.
- Graph quality: technical graph audit passes. Board-member graph orphans are
  0 after fallback person nodes; 187 board-member rows still lack full
  `PersonProfile` pages. Edge-confidence coverage is 34.8 percent.

Continuation verification after residual URL/HTML/OCR review:

- `npm test` passed with 181 tests across 42 suites.
- `npm run lint` passed.
- `npm run db:audit:strict-sources` passed.
- `npm run audit:citable` passed and kept the readiness queue at P0 0, P1 0,
  P2 1, P3 0.
- `npm run research:citable-acceptance-pack` passed with 7 of 12 cite-ready and
  5 blocked.
- `npm run graph:audit` passed with 41,072 nodes, 1,641 edges, 0 orphan
  board-member rows, 187 board-member profile gaps, and 34.8 percent edge
  confidence coverage.
- `npm run build` passed with the known worktree multiple-lockfile warning;
  timestamp-only chart-metric diffs were cleaned afterwards.
- `git diff --check` passed.

## Baseline Commands

| Command | Result | Notes |
|---|---:|---|
| `npm install` | passed | 746 packages installed in the fresh worktree, 0 vulnerabilities reported. |
| `npm test` | passed | 100 tests passed. |
| `npm run db:generate` | passed | Required in the fresh worktree because `src/generated/prisma` is ignored. |
| `npm run db:audit` | passed with warnings | All enforced integrity checks passed. |
| `npm run db:audit:strict-sources` | failed as expected | 3 enforced source violations, matching the known strict-source groups after local ignored evidence files were synced into the worktree. |
| `npm run graph:audit` | passed | Technical graph integrity passed. Practical graph coverage remains weak. |

Fresh-worktree setup note: the first `db:audit` failed because the generated
Prisma client was absent. After `npm run db:generate`, the next audit failed
because ignored local `.env`, `.env.local`, and local research evidence files
were not present in the worktree. Those local setup files were copied/synced
from the original checkout without changing tracked source files.

## Milestone Verification After Tasks 1-4

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 122 tests passed across 27 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:audit` | passed with warnings | Integrity gates passed; quality warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Same 3 strict-source groups remain; no new blocker group was introduced. |
| `npm run graph:audit` | passed | 40,885 nodes, 1,076 edges, 39,976 isolated nodes, 0.6 percent edge confidence. |
| `npm run build` | passed | Build completed; Next.js warned about multiple lockfiles/root inference in the worktree. |
| `git diff --check` | passed | No whitespace errors reported. |

## Milestone Verification After Tasks 5-7

| Command | Result | Notes |
|---|---:|---|
| `npm run db:backfill:source-citations` | passed | Dry-run wrote `research/citation-backfill-preview-2026-05-20.csv` and left counts unchanged at `SourceCitation=71`, `FieldCitation=1286`. |
| `npm run db:backfill:source-citations:apply` | passed | Created 2,544 `SourceCitation` rows and 243,018 `FieldCitation` rows from existing locators only. |
| second `npm run db:backfill:source-citations:apply` | passed | Historical checkpoint idempotence check: 0 source citations and 0 field citations to create. Counts stayed at `SourceCitation=2615`, `FieldCitation=244304` before the later post-merge backfill added more rows. |
| `npm test -- tests/lib/citation-audit.test.ts tests/lib/source-quality-audit.test.ts` | passed | Full test runner reported 131 tests passing. |
| `npm run db:audit` | passed with warnings | New `Citation Coverage` section is present; standard mode remains non-failing. |
| `npm run db:audit:strict-sources` | failed as expected | Now fails on 5 enforced groups: the 3 source-label groups plus citation coverage blockers. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 2,184 rows: 2,174 P0 and 10 P2. |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

