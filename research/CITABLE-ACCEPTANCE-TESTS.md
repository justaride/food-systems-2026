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
