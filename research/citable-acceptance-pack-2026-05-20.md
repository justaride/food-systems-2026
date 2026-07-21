# Citable Acceptance Pack 2026-05-20

Generated: 2026-05-20

Summary: 11/16 cite-ready, 5 blocked.

A blocked result is intentional when the current evidence only supports internal context or `citable_with_note` while the question requires `citable_external`.

## CA-001: Kan kunnskapsbasen sitere København som benchmark for offentlig økologisk innkjøp?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, som kommunalt innkjøps- og kjøkkenbenchmark: København rapporterer 87,7 % økologi i 2024 (nesten 88 %), mot 88 % i 2015. Dagens nivå bygger på innkjøpsdata, men målemetoden er endret over tid, så sammenstillingen skal ikke fremstilles som en metodeidentisk trend eller som Danmarks nasjonale andel.
- Required readiness: `citable_with_note`
- Expected source type: municipal/public procurement source plus audited report package
- Known caveat: Bruk 87,7 % i 2024 (kommunens vedtaksside: nesten 88 %) og 88 % i 2015. Tallene gjelder økologi i Københavns kommunale institusjoner og kjøkken. Dagens nivå bygger på innkjøpsdata, mens 2015-tallet hadde et eldre, blandet målegrunnlag. Dette er ikke en metodeidentisk tidsserie eller en nasjonal dansk økologiandel.
- Citations:
  - copenhagen-meal-strategy-renewal-2025: Godkendelse af fornyelse af Københavns Kommunes Mad- og Måltidsstrategi (municipal decision record, citable_external) - https://www.kk.dk/dagsordener-og-referater/%C3%98konomiudvalget/m%C3%B8de-18032025/referat/punkt-10. Supports: Oppgir at kommunen i 2024 lå på nesten 88 % økologi på tvers av kommunens enheter.
  - copenhagen-meal-strategy-experience-2020-2024: Erfaringsopsamling på implementering af Mad- og Måltidsstrategien 2020-2024 (municipal strategy implementation report, citable_external) - https://www.kk.dk/sites/default/files/agenda/93138585-f5a0-47a5-b500-a21cc5033912/816b7e92-7d10-403a-a631-4c742327c643-bilag-2.pdf. Supports: Oppgir 87,7 % i 2024 og dokumenterer den nyere målingen ved Meyers Madhus.
  - copenhagen-status-2025-organic-procurement: Status på København 2025 (municipal statistical report, citable_external) - https://www.kk.dk/sites/default/files/2025-08/Status%20p%C3%A5%20K%C3%B8benhavn%202025%20UA.pdf. Supports: Viser 88 % i 2015, omtaler 2024 som 88 % avrundet og dokumenterer skiftet til et rent innkjøpsdatagrunnlag.
  - nordic-circularity-report-html: Nordisk sirkularitetsrapport 2026-05 (audited report package, citable_with_note) - public/reports/nordisk-sirkularitetsrapport-2026-05.html. Supports: Propagerer korrigerte København-tall og kommunal metodekontekst.
  - nordic-circularity-appendix: Nordisk sirkularitetsrapport appendiks (appendix and evidence matrix, citable_with_note) - docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md. Supports: Propagerer samme København-verdier og kildeavgrensning som HTML-rapporten.
- Exclusion notes:
  - None

## CA-002: Kan T3-diffen siteres som ekstern validering av rapportens konklusjoner?

- Status: `blocked`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Nei. T3 kan omtales som intern metodekontroll, men skal blokkeres som ekstern validering.
- Required readiness: `citable_external`
- Expected source type: external domain validation or named expert review
- Known caveat: T3 er gjennomført, men det er en intern metodekontroll mot en generisk ekstern modellrespons, ikke ekstern validering.
- Citations:
  - phase8-t3-diff: Phase 8 T3 ekstern-vs-intern diff (internal method check, citable_with_note) - research/v1-2/phase8-T3-ekstern-vs-intern-diff.md. Supports: Dokumenterer hva T3 faktisk sammenlignet.
- Exclusion notes:
  - Required readiness is citable_external, but available T3 material is only citable_with_note and internally generated.
  - No named external validator, peer review, or domain expert sign-off is present.
  - phase8-t3-diff: citable_with_note does not satisfy citable_external

## CA-003: Kan cascade-logikken prioritere forebygging før biogass i sirkularitetsråd?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, med caveat: cascade-logikken kan brukes som analytisk ramme når tallfestede effektpåstander knyttes til sine konkrete kilder.
- Required readiness: `citable_with_note`
- Expected source type: audited synthesis with cited food-waste and circularity sources
- Known caveat: Forebygging er et prioriteringsprinsipp; tallfestede effektforhold må følges av kilde og metodeavgrensning.
- Citations:
  - circular-leverage-data: Circular leverage data model (application data with cited source URLs, citable_with_note) - src/lib/data/circular-leverage.ts. Supports: Viser at matsvinnforebygging og redistribusjon skilles fra biogass/gjenvinning.
  - nordic-circularity-report-cascade: Nordisk sirkularitetsrapport cascade sections (audited report package, citable_with_note) - public/reports/nordisk-sirkularitetsrapport-2026-05.html. Supports: Bruker cascade-/leverage-logikk i anbefalingene.
- Exclusion notes:
  - None

## CA-004: Kan vi sitere Norge som HHI 3327 og CR3 96,6% uten å blande begrepene?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, når teksten sier HHI 3327 (KT-omsetning 2024) og CR3 96,6%, og ikke presenterer CR3 som HHI.
- Required readiness: `citable_with_note`
- Expected source type: computed market concentration data plus audited report correction
- Known caveat: HHI er indeks, CR3 er prosentandel; bruk begge etikettene eksplisitt. HHI 3327 er omsetnings-HHI fra Konkurransetilsynets Dagligvarerapport 2024-25 (NG 43,5/Coop 29,2/Rema 23,9/Bunnpris 3,3 → 43,5²+29,2²+23,9²+3,3² = 3327). Ikke forveksle med chart-metrics butikkantall-baserte parentHhi.
- Citations:
  - no-value-chain: Norway value-chain retail concentration (curated primary dataset (KT Dagligvarerapport 2024-25), citable_with_note) - public/data/food-systems/no/value-chain.json. Supports: Inneholder retail-HHI 3327 og CR3 96,6 % fra KT-omsetningsandeler 2024 for norsk dagligvarestruktur.
  - hhi-cr3-report-correction: Nordisk sirkularitetsrapport HHI/CR3 correction (audited report package, citable_with_note) - public/reports/nordisk-sirkularitetsrapport-2026-05.html. Supports: Dokumenterer at tidligere HHI 96,6%-formulering er rettet.
- Exclusion notes:
  - None

## CA-005: Kan Finland 30%-regelen brukes som sitatklar juridisk sammenligning?

- Status: `cite_ready`
- Readiness: `citable_external`
- Caveat required: no
- Proposed answer: Ja, men bare som juridisk sammenligning av finsk konkurranselov §4a: foretak/sammenslutninger med minst 30 % dagligvaremarkedsandel anses å ha dominerende stilling i det finske dagligvaremarkedet.
- Required readiness: `citable_external`
- Expected source type: official legal text or verified legal database locator
- Known caveat: 30%-regelen ligger i den finske konkurranseloven §4a, ikke i Elintarvikemarkkinalaki/Food Market Act. Bruk som juridisk sammenligning må derfor sitere konkurranseloven/KKV og navngi dagligvaremarkedets dominanspresumsjon.
- Citations:
  - finlex-competition-act-4a: Finnish Competition Act section 4a (official legal database, citable_external) - https://www.finlex.fi/en/legislation/2011/948. Supports: Offisiell rettskilde for §4a om dominerende markedsstilling i dagligvarehandelen ved minst 30 % markedsandel.
  - kkv-competition-act-4a-grocery: FCCA/KKV explanation of Competition Act section 4a in grocery trade (official authority explanation, citable_external) - https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/. Supports: Forklarer at forbudet mot misbruk av dominerende stilling kan brukes på dagligvareforetak med nasjonal markedsandel over 30 %, og at bestemmelsen gjaldt fra 1. januar 2014.
- Exclusion notes:
  - None

## CA-006: Kan vi bruke FI-DK 6x matsvinn-forskjell som ekstern rangering?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, men bare som metodebelagt sammenligning med tydelig forbehold om målemetode.
- Required readiness: `citable_with_note`
- Expected source type: harmonized food-waste statistics with method caveat
- Known caveat: Rapporten sier at forskjellen kan være måleinstrument. Bruk derfor metodenote, ikke ren prestasjonsrangering.
- Citations:
  - report-food-waste-6x: Nordisk sirkularitetsrapport food-waste section (audited report package, citable_with_note) - public/reports/nordisk-sirkularitetsrapport-2026-05.html. Supports: Presenterer 6x-forskjellen sammen med metodeforbehold.
  - phase8-food-waste-method-note: Phase 8 food-waste method note (internal method check, citable_with_note) - research/v1-2/phase8-T3-ekstern-vs-intern-diff.md. Supports: Bekrefter at definisjonsforskjeller er kjent og ikke unik plattforminnsikt.
- Exclusion notes:
  - None

## CA-007: Kan Salling Groups matsvinnreduksjon siteres som halvering?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Nei, ikke som halvering. Salling Groups danske virksomhet kan beskrives med en nedgang i food waste percentage fra 2,8 % i 2015 til 1,8 % i 2024, altså 1,0 prosentpoeng.
- Required readiness: `citable_with_note`
- Expected source type: company or audited report source with scope note
- Known caveat: Bruk 2,8 % i 2015 til 1,8 % i 2024 for Salling Groups danske virksomhet: en nedgang på 1,0 prosentpoeng. Dette er ikke en halvering. Utelat relativ prosent med mindre den eksplisitt avledes fra de avrundede endepunktene.
- Citations:
  - salling-group-annual-report-2024-food-waste: Salling Group Annual Report 2024 — Every Day Better (company annual report, citable_external) - https://digitalassets.sallinggroup.com/raw/upload/fl_attachment:Annual%20report%202024%252epdf/external_content_providers/magnolia/next/jcr:c5f40c7a-153b-434d-8d7f-3c1eafb3dafe. Supports: Viser food waste percentage 1,8 % i 2024 mot 2,8 % i 2015 og avgrenser baseline til danske formater.
  - report-salling-waste: Nordisk sirkularitetsrapport Salling food-waste percentage (audited report package, citable_with_note) - public/reports/nordisk-sirkularitetsrapport-2026-05.html. Supports: Propagerer korrigerte endepunkter, 1,0 prosentpoeng og dansk scope-note.
  - appendix-salling-waste: Nordisk sirkularitetsrapport appendiks — Salling food-waste percentage (appendix and evidence matrix, citable_with_note) - docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md. Supports: Knytter den aktive rapportformuleringen til Salling Groups offisielle årsrapport.
- Exclusion notes:
  - None

## CA-008: Kan eierskaps- og selskapsstrukturer brukes eksternt fra selskapssidene?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja for rows with verified locators and visible citation labels; unresolved labels remain internal or blocked.
- Required readiness: `citable_with_note`
- Expected source type: annual report, registry, transaction announcement, or verified resolver locator
- Known caveat: Use only ownership rows whose citation label resolves to annual report, registry, transaction announcement, or explicit internal-blocked marker.
- Citations:
  - row-source-locators-ownership: Row source locator resolver (resolver over existing database/repo locators, citable_with_note) - src/lib/row-source-locators.ts. Supports: Maps ownership labels only to existing locators or explicit blocked markers.
  - company-page-citations: Company page citation rendering (public surface citation gate, citable_with_note) - src/app/selskap/[id]/page.tsx. Supports: Shows source readiness beside company facts.
- Exclusion notes:
  - None

## CA-009: Kan grafen alene brukes som bevis for styre-/personrelasjoner?

- Status: `blocked`
- Readiness: `internal_context`
- Caveat required: no
- Proposed answer: Blokker graph-only use. Cite row-level BoardMember source data instead.
- Required readiness: `citable_external`
- Expected source type: verified board-member row citation or official registry locator
- Known caveat: Graph audit still reports orphan board-member graph rows; graph is navigation/context unless backed by row-level citation.
- Citations:
  - graph-audit-quality: Knowledge graph audit output (technical audit output, internal_context) - npm run graph:audit. Supports: Shows graph integrity passes but practical graph coverage remains limited.
- Exclusion notes:
  - Graph audit is internal quality context, not documentary evidence for a person relationship.
  - Required readiness is citable_external for relationship proof, but graph-only evidence is internal_context.
  - graph-audit-quality: internal_context does not satisfy citable_external

## CA-010: Kan offentlige tilskuddsrader siteres eksternt fra databasen?

- Status: `cite_ready`
- Readiness: `citable_external`
- Caveat required: no
- Proposed answer: Ja for rows that retain the official Landbruksdirektoratet locator and row context.
- Required readiness: `citable_external`
- Expected source type: official registry/API/CSV source locator
- Known caveat: External use should cite the row source locator and year/category, not only an aggregate in prose.
- Citations:
  - subsidy-row-source-resolver: Subsidy row-source locator resolver (official registry locator resolver, citable_external) - src/lib/row-source-locators.ts. Supports: Resolves production subsidy rows to official Landbruksdirektoratet sources.
- Exclusion notes:
  - None

## CA-011: Kan en bibliotekpost siteres eksternt med bare lokal PDF/tittel?

- Status: `blocked`
- Readiness: `internal_context`
- Caveat required: no
- Proposed answer: Blokker title/local-file-only use until a public locator or persistent ID is present.
- Required readiness: `citable_external`
- Expected source type: DOI, handle, publisher URL, or verified document URL plus local file
- Known caveat: Local files are useful for archive and review, but external citations need direct public locator or persistent ID.
- Citations:
  - status-library-coverage: Citable knowledge base status - library locator coverage (operational status report, internal_context) - research/CITABLE-KNOWLEDGE-BASE-STATUS.md. Supports: Documents locator coverage and DOI/persistent-ID gaps.
- Exclusion notes:
  - A local file path alone is internal archive evidence, not an external citation locator.
  - Required readiness is citable_external, but title/local-file-only evidence is internal_context.
  - status-library-coverage: internal_context does not satisfy citable_external

## CA-012: Kan grafrelasjoner eksporteres som siterbare relasjonspåstander?

- Status: `blocked`
- Readiness: `internal_context`
- Caveat required: no
- Proposed answer: Blokker graph-edge-only citation. Export only relationships with source-backed underlying rows.
- Required readiness: `citable_external`
- Expected source type: edge with source citation, confidence, and underlying row/document locator
- Known caveat: Graph currently has low confidence coverage and many isolated nodes; use it for navigation unless a relationship has source-backed evidence.
- Citations:
  - graph-query-filter: Public graph query source filtering (public graph adapter, internal_context) - src/lib/queries/graph.ts. Supports: Filters blocked markers from public graph output but does not make every edge citable.
  - graph-audit-low-confidence: Knowledge graph audit (technical audit output, internal_context) - npm run graph:audit. Supports: Shows confidence coverage remains a quality limitation.
- Exclusion notes:
  - Required readiness is citable_external, but graph-only evidence is internal_context.
  - Acceptance requires a source-backed underlying row before a relationship can be cited externally.
  - graph-query-filter: internal_context does not satisfy citable_external
  - graph-audit-low-confidence: internal_context does not satisfy citable_external

## CA-013: Kan vi sitere at konsentrasjonen i norsk matsystem topper i foredling (meieri ~6000, rødt kjøtt ~4600) over dagligvare (~3327), med samvirkene TINE/Nortura som mest konsentrert?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, med forbehold: det ordinale funnet (foredling topper, samvirke mest konsentrert, primær lavest) er citable m/forbehold; oppgi at utfordrer-andeler er estimert og at referanseår/baser varierer.
- Required readiness: `citable_with_note`
- Expected source type: sourced market shares per node (authority/industry) with arithmetic verification
- Known caveat: Ordinal-funnet (foredling > retail > primær) er robust via leder-gulv (TINE 76,4² = 5837; Nortura 66² = 4356 — begge over retail uansett utfordrer-split). Per-node presise HHI varierer; bær basis + år.
- Citations:
  - ap2-kryssnode-funn: AP-2 kryss-node markeds-HHI funn (internal sourced analysis (Oslo Economics / KLF / Animalia / KT / Fiskeridir.), citable_with_note) - docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md. Supports: Dokumenterer node-HHI med kildebelagte leder-andeler + leder-gulv-robusthet og sjømat-kryssvalidering.
  - no-value-chain-retail: Norway retail concentration (KT 2024) (curated primary dataset (KT Dagligvarerapport 2024-25), citable_with_note) - public/data/food-systems/no/value-chain.json. Supports: Retail-HHI 3327 (KT-omsetning) som referansepunkt for «over dagligvare».
- Exclusion notes:
  - None

## CA-014: Kan vi sitere at samlede produksjonstilskudd i 2024 var ~18,6 mrd kr, og at den tidligere 10,94 mrd-totalen var et skript-artefakt?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, med forbehold: 2024 ~18,6 mrd (verifisert mot publisert 18,39 mrd); den tidligere 10,94 mrd var en skript-bug, ikke en reell nedgang.
- Required readiness: `citable_with_note`
- Expected source type: open agency data (Landbruksdirektoratet) with reproducible aggregate
- Known caveat: 2024-totalen 18,61 mrd er regenerert etter en kolonnematch-bug (SCHEME_ALIASES) og avstemt mot publisert 18,39 mrd. Gini ~0,52–0,54; konsentrasjonen er strukturdrevet (husdyr/areal).
- Citations:
  - ap3-aggregate: AP-3 tilskuddskonsentrasjon aggregat (reproducible aggregate over Landbruksdirektoratet open data, citable_with_note) - research/analyse/ap3-tilskuddskonsentrasjon.json. Supports: Inneholder 2024-total 18,61 mrd + Gini, regenerert og avstemt mot publisert total.
  - ap3-funn: AP-3 funnnotat (internal sourced analysis, citable_with_note) - docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md. Supports: Dokumenterer bug-fiksen og avstemmingen mot publisert total.
- Exclusion notes:
  - None

## CA-015: Kan vi sitere AP-1-styrebroene (logistikk↔retail 7, foredling↔retail 6) som ekstern påstand om makt-konsentrasjon?

- Status: `blocked`
- Readiness: `internal_context`
- Caveat required: yes
- Proposed answer: Nei (ennå): AP-1-broene er intern baseline (internal_context) og fail-closes til de er primærsjekket og styredekningen er utvidet. Trianguleringen med AP-5 (vertikal eierkontroll) er den citerbare ruten.
- Required readiness: `citable_with_note`
- Expected source type: internal board-interlock graph pending primary check + coverage extension
- Known caveat: AP-1 er intern baseline: 36 % styredekning, favoriserer store/velinnsamlede selskaper; dekningsutvidelse til ~47 % krever DB-kjøring. Pekepinn for AP-2/AP-5, ikke konklusjon.
- Citations:
  - ap1-funn: AP-1 styreoverlapp funn (internal graph analysis, internal_context) - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md. Supports: Dokumenterer broene, men som intern baseline (36 % styredekning).
- Exclusion notes:
  - AP-1 alene er intern baseline (36 % styredekning) — fail-closed til primærsjekk + dekningsutvidelse (~47 %).
  - Ekstern makt-påstand krever AP-5-triangulering (eierkontroll), ikke styregraf alene.
  - ap1-funn: internal_context does not satisfy citable_with_note

## CA-016: Kan vi sitere CL-MAKTKART-001: et fåtall konsern kontrollerer vertikalt på tvers av butikk, logistikk og foredling, og konsentrasjonen topper i samvirke-foredling?

- Status: `cite_ready`
- Readiness: `citable_with_note`
- Caveat required: yes
- Proposed answer: Ja, med forbehold: vertikal konsernkontroll (butikk+logistikk+foredling) er triangulert over to uavhengige grafer og primærsjekket mot Brønnøysund + offentlige primærkilder for eierandel-%; konsentrasjonen topper i samvirke-foredling (kryss-node-HHI).
- Required readiness: `citable_with_note`
- Expected source type: triangulated board + ownership graph, Brønnøysund + public company primary sources
- Known caveat: Struktur (form + styre + eierandel-%) er primærsjekket; «kontroll» = strukturell posisjon, ikke intensjon/samordning. Enkeltnoders presise HHI bærer fortsatt forbehold.
- Citations:
  - maktkart-syntese: Maktkart-syntese (triangulert) (internal triangulated synthesis, citable_with_note) - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md. Supports: Binder AP-1/AP-2/AP-5 til ett strukturkart; to uavhengige grafer sammenfaller.
  - ap5-krysseie: AP-5 krysseie og eierandel-% (internal analysis with public primary source checks, citable_with_note) - docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md. Supports: Dokumenterer eierandel-% for toppkonsernene fra selskapenes IR-/årsrapportsider og presiserer BAMA-/majoritetsforbehold.
  - kryssnode-hhi: Kryss-node HHI-profil (internal sourced analysis, citable_with_note) - docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md. Supports: Dokumenterer at konsentrasjonen topper i samvirke-foredling, over dagligvare, med caveats per node.
- Exclusion notes:
  - None
