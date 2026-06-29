---
tittel: "Food TG: research-library coverage audit"
dato: 2026-06-18
status: "Intern analyse - ingen nye claims åpnet"
eier: "Codex / Data Analytics"
scope: "Vurderer i hvilken grad prosjektet har analysert hele forskningsbiblioteket, forskningsartikler, rapporter og tilhørende kontrollflater."
---

# Food TG: research-library coverage audit

## Kort svar

Prosjektet har analysert de prioriterte og claim-bærende problemstillingene grundig, spesielt etter R4/R5-dybdekampanjene. Det er likevel ikke dekning for å si at hele forskningsbiblioteket, hver rapport og hver artikkel, er grundig analysert på item-nivå.

Arbeidsstatusen er derfor:

| Område | Vurdering | Grad |
| --- | --- | --- |
| Prioriterte JT-/Food-TG-spørsmål | Grundig analysert, med eksplisitte hull og kontrollregler | Høy |
| R4/R5-dybdearbeid | Sterk, nyere og bedre kalibrert enn eldre statusnotater | Høy |
| Siterbar claim-beredskap | Sterk, men dette er ikke det samme som uttømmende forskningsanalyse | Høy |
| Hele biblioteket item-for-item | Delvis dokumentert, men ikke bevist uttømmende | Moderat |
| Friskhet/konsistens på tvers av eldre og nyere flater | Bedret i R4/R5, men fortsatt hovedrisiko | Moderat |

Konklusjon: Prosjektet er langt nok til å forsvare en sterk intern analysebase og et kontrollert claim-arbeid, men ikke langt nok til å beskrive hele forskningsbiblioteket som fullstendig gjennomarbeidet.

## Metode

Denne auditten er en repo-intern analyse. Den har ikke åpnet nye claims, ikke kjørt nye importjobber og ikke endret faglige kildedata.

Jeg vurderte fire bevisflater:

1. Bibliotekets egen kartlegging: `research/README.md`, `research/RESEARCH-AUDIT.md`, `research/FILE-COVERAGE.md`.
2. Citable/readiness-status: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`, `research/DATA-READINESS-SLUTTRAPPORT.md`.
3. Prosjektets kontroll- og mottaksflater: `docs/project/mandates/`, `docs/project/status/`, source-shortlist/PCQ/claim-lock.
4. De nyeste dybdeanalysene: R4/R5 i `research/external/r4/`, `research/external/r5/` og `docs/project/analysis/food-tg-dybdeaudit-jt-fokusfelt-2026-06-18.md`.

Jeg skiller mellom tre typer dekning:

| Type dekning | Hva det beviser | Hva det ikke beviser |
| --- | --- | --- |
| Citable/readiness | At kontrollerte claims kan kobles til kilde, note og gate | At hele biblioteket er lest dypt |
| Fokusfeltanalyse | At bestemte strategiske spørsmål er analysert med dybde | At perifere kilder er item-for-item vurdert |
| Bibliotek-/fildekning | At filer finnes, er indeksert eller har metadata | At innholdet er analysert eller syntetisert |

## Kvantitativ status

### Bibliotek og forskningsflater

| Flate | Observasjon |
| --- | --- |
| `research/` samlet | 1 029 markdown-filer og 435 PDF-er ble observert i treet |
| `research/bibliotek/` | 465 markdown-notater |
| `research/evidence-pack/` | 352 filer |
| `research/external/` | 153 filer |
| `research/analyse/` | 34 markdown-analysefiler |
| `docs/project/analysis/` | 58 markdown-analysefiler, inkludert denne auditten |
| `docs/project/mandates/` | 136 markdown-kontroll-/mandatfiler |

Dette viser et stort og modent kunnskapsapparat, ikke i seg selv en komplett analysegrad.

### Eldre biblioteks-/dekningstall

`research/RESEARCH-AUDIT.md` oppgir et tidligere breddegrunnlag på 316 markdown-filer, 65 PDF-er, 70 masteroppgaver, 61 rapporter og 126 kildedokumenter. Samme audit vurderte masteroppgaver som dypest analysert, mens flere norske/offentlige/regulatoriske delkategorier lå på lavere dybde.

`research/FILE-COVERAGE.md` skannet senere 1 320 `.pdf`/`.md`-filer under `research/` og fant 512 dekningstreff:

| Problemtype | Antall |
| --- | ---: |
| Orphan file | 369 |
| Missing file document | 141 |
| Missing file sourcedoc | 0 |
| Broken supportingSource | 1 |
| Report without analytical link | 0 |
| Duplicate file separate records | 1 |

Severitet i samme fil: 65 HIGH, 105 MEDIUM og 342 LOW. Dette er ikke et direkte mål på analysegrad, men det er bevis mot å hevde full bibliotekskontroll.

### PDF-, URL- og triage-status

| Ledger | Status |
| --- | --- |
| `research/PDF-QUALITY.csv` | 399 PDF-er; 349 ok, 5 scanned, 44 low-text, 45 LOW og 5 MEDIUM |
| `research/URL-HEALTH.csv` | 600 URL-er; 500 med 200-status, 49 med 403, 30 med 404, 11 ENOTFOUND |
| `research/HTML-TRIAGE.csv` | 29 rader, alle LOW |
| `research/KI-PRIORITY.csv` | 186 prioriterte rader, med blant annet 64 master, 24 bransje, 22 konkurransetilsyn, 18 akademia |
| `research/REMEDIATION-BACKLOG.csv` | 471 rader, alle LOW i nyere backlog |

Dette peker mot sterk drift og opprydding, men fortsatt med lavprioriterte rester og noen tekniske begrensninger.

## Citable/readiness er sterkt, men annet enn dybdeanalyse

`research/CITABLE-KNOWLEDGE-BASE-STATUS.md` er den viktigste motvekten mot eldre coverage-varsler. Den sier at nyere operasjonell status erstatter eldre snapshots, og rapporterer:

| Felt | Status |
| --- | --- |
| Strict source gate | Grønn etter 2026-06-10-fiks |
| Citation readiness queue | P0 = 0, P1 = 0, P2 = 1 |
| SourceCitation | 2 699 |
| citable_external | 154 |
| citable_with_note | 2 433 |
| internal_context | 112 |
| blocked_unsourced | 0 |
| FieldCitation | 244 517 |
| External blocking citation issues | 0 |

Dette er en sterk indikator på at claim-bærende arbeid har kilde- og sitatstruktur. Men det svarer primært på: "Kan kontrollerte claims dokumenteres?" Det svarer ikke fullt på: "Er hver kilde i biblioteket faglig gjennomlest, vurdert og syntetisert?"

`research/DATA-READINESS-SLUTTRAPPORT.md` bekrefter samme skille. Den beskriver 108 reports, 86 theses, 1 163 documents og 307 SourceDocs som KI-ready eller citable i basislinjen, samtidig som den lister gjenstående kategorier som scanned PDFs, DB-only docs, low-text PDFs, orphan files, demoted docs og broken supportingSource.

## R4/R5 endrer vurderingen oppover

De nyeste R4/R5-filene er viktigere enn eldre ukes- og sluttrapporter for akkurat dette spørsmålet, fordi de er datert 2026-06-18 og direkte adresserer "hvor dypt er dette analysert?"

### R4

`research/external/r4/DRO-R4-INDEX-2026-06-18.md` viser at R4 ikke bare var bred research, men en kontrollert dybde- og avklaringsrunde:

| R4-signal | Vurdering |
| --- | --- |
| 23 prompts run | Betydelig dekning på utvalgte felt |
| 6 verification passes | Egen kontroll mot overclaim |
| 9 fields lifted | Flere felt fikk bedre analysegrad |
| 6 fields closed as documented absence / answered | Negative funn ble behandlet som gyldige |
| 8 type-C findings formalized | Prosjektet skiller ekte kunnskapshull fra desk-work-hull |
| P0-fikser i arbeidsflate | Viktige formuleringer/freshness-problemer ble fanget, men arbeidsstatus må gates for ekstern bruk |

R4s aktørgate-markører viser samtidig at flere hull ikke kan lukkes med mer skrivebordsresearch alene: Valio feed mix, ASKO foodservice-prosent, FMFO-sourcing, Skretting-andeler og CEA market access krever aktøravklaring.

### R5

`research/external/r5/DRO-R5-INDEX-2026-06-18.md` er enda sterkere:

| R5-signal | Vurdering |
| --- | --- |
| 16 goals run | Full gjennomføring av planlagt R5-katalog |
| 6 independent verification passes | Motkontroll ble faktisk brukt |
| No claim opened | Riktig kontrollspråk |
| 7 new type-C findings | Uløselige/epistemiske hull ble formalisert i stedet for oversolgt |
| No HIGH, one MED resolved/explained | Ingen høy alvorlighetsgrad ved mottak |
| No surface edits/gates run | R5 er analyse-/mottaksgrunnlag, ikke automatisk publiserbar overflate |

R5 gir sterk støtte for at prioriterte spørsmål er analysert grundig. Den gir ikke full støtte for at alle eldre biblioteknotater og PDF-er er ferdig syntetisert.

## JT-/Food-TG-fokusfeltene er bredt, men ikke jevnt, analysert

`docs/project/analysis/food-tg-dybdeaudit-jt-fokusfelt-2026-06-18.md` er den mest direkte interne vurderingen av analysegrad. Den konkluderer med et bimodalt bilde:

| Dybdenivå i JT-matrisen | Antall |
| --- | ---: |
| Dyp | 7 |
| Solid | 11 |
| Delvis | 3 |
| Tynn | 2 |
| Fraværende | 0 |

Samme audit vurderer:

| Dimensjon | Score i dybdeaudit |
| --- | --- |
| Dybde der prosjektet er dypt | 9/10 |
| Bredde mot JT-kart | 6-7/10 |
| Freshness/konsistens | 5/10 |
| Kalibrering | 7/10 |

Dette er trolig den mest presise en-linjers vurderingen: ingen sentrale JT-anker mangler helt, men analysegraden er ujevn og dypest på marked, makt og eier-/aktorspor, ikke på hele sirkularitets- og verdikjedebiblioteket.

## Item-level bibliotek: bevisgapet

En streng eksplisitt-path-test på `research/bibliotek/` fant:

| Mål | Antall |
| --- | ---: |
| Markdown-notater i `research/bibliotek/` | 465 |
| Filer med eksplisitt `research/bibliotek/...md`-referanse funnet andre steder | 209 |
| Ikke funnet via eksplisitt path-referanse | 256 |

Dette er en konservativ og ufullkommen test. En kilde kan være analysert via tittel, DB-record, SourceDoc, claim-lock eller rapport uten at filbanen nevnes eksplisitt. Likevel viser testen at repoet ikke har et enkelt, komplett item-level bevis for at hvert biblioteknotat er brukt i analyse eller syntese.

Innholdsprofilen i `research/bibliotek/` peker i samme retning:

| Heuristikk | Funn |
| --- | ---: |
| Median ord per biblioteknotat | 339 |
| Filer under 200 ord | 101 |
| Filer under 500 ord | 284 |
| Filer med `relevans` | 335 |
| Filer med `sammendrag` | 286 |
| Filer med `nøkkelfunn` | 157 |
| Filer med `metode` | 152 |
| Filer med `begrensning` | 58 |

Dette ligner et bibliotek med mange sammendrag, relevansnotater og metadata-orienterte vurderinger, ikke et bibliotek der hver fil beviselig har fått lik dybdeanalyse.

## Prosjektets faktiske modenhetsgrad

Jeg vurderer graden slik:

| Spørsmål | Svar | Begrunnelse |
| --- | --- | --- |
| Er hele research-biblioteket samlet og strukturert? | Ja, i stor grad | Stort `research/`-tre, biblioteksnotater, evidence-pack, source-shortlist, SourceDocs og readiness-ledgers |
| Er prioriterte Food-TG/JT-spørsmål analysert grundig? | Ja | R4/R5, dybdeaudit, claim-lock og kontrollflater viser reell dybde |
| Er alle citable claims godt nok kontrollert? | Nesten, med kjente rester | Strict gate grønn, P0/P1 null, P2 en, men R5 sier gates/surface edits ikke er kjørt |
| Er hele biblioteket analysert item-for-item? | Nei, ikke bevist | 256/465 biblioteknotater uten eksplisitt path-referanse og mange korte notater |
| Er alle rapporter/papers analysert like dypt? | Nei | Dybden er prioritert etter prosjektspørsmål; tekniske og perifere kilder har lavere bevisgrad |
| Er "ikke funnet" brukt disiplinert? | Ja | R2/R3/R4/R5 viser negative funn og type-B/type-C-hull i stedet for tvungne konklusjoner |

Samlet vurdering:

| Vurderingsakse | Grad |
| --- | --- |
| Strategisk analysegrad for kjernecase | 8-9/10 |
| Bredde mot JT-/Food-TG-kart | 7/10 |
| Source/citation readiness | 8-9/10 |
| Full item-level bibliotekanalyse | 5-6/10 |
| Konsistens/freshness på tvers av alle flater | 6/10 |

## Viktigste risikoer

1. **Overclaim fra bibliotekstørrelse.** Antall kilder og gates kan få prosjektet til å se mer uttømmende analysert ut enn item-level bevisene faktisk viser.
2. **Freshness-drift.** R4/R5 har fanget flere gamle formuleringer, men eldre docs kan fortsatt inneholde for sterke eller utdaterte formuleringer.
3. **Citable/readiness forveksles med analysegrad.** En kilde kan være citable uten at alle implikasjoner er analysert.
4. **Aktor-gatede hull.** Noen viktige spørsmål kan ikke lukkes uten aktoravklaring, selv om skrivebordsresearchen er god.
5. **Tekniske dekningstreff.** Orphan-, low-text-, scanned- og DB-only-flater betyr ikke nødvendigvis faglig mangel, men de svekker beviset for kompletthet.

## Hva kan sies utad og internt

### Trygt internt

"Prosjektet har en omfattende og kontrollert researchbase. De prioriterte Food-TG/JT-spørsmålene er analysert med høy dybde, og R4/R5 har redusert flere tidligere desk-research-hull. Samtidig er biblioteket ikke dokumentert som fullstendig analysert item-for-item."

### Ikke si uten mer bevis

"Hele forskningsbiblioteket er grundig analysert."

"Alle papers og rapporter er ferdig syntetisert."

"Alle gjenstående hull kan lukkes med mer desk research."

### Mer presist

"Prosjektet har grundig analysert kjerneproblemstillingene og har en sterk citable knowledge base, men hele biblioteket er ikke bevist uttømmende gjennomarbeidet på kilde-for-kilde-nivå."

## Anbefalt neste kontroll hvis prosjektet vil lukke gapet

1. Lag en `library-analysis-ledger` med en rad per `research/bibliotek/`-fil.
2. Bruk eksplisitte statuser: `syntetisert`, `kun sammendrag`, `citable`, `bakgrunn`, `superseded`, `aktor-gated`, `type-C-hull`, `ikke relevant`.
3. Koble hver rad til minst en av: claim-lock, source-shortlist, report, JT-felt, R4/R5 goal eller eksplisitt "ikke brukt"-begrunnelse.
4. Start med de 256 biblioteknotatene uten eksplisitt path-referanse.
5. Prioriter filer under 200 ord og PDF-er med low-text/scanned-status, siden de er mest sannsynlige bevisgap.
6. Kjør en ny coverage-audit etter at R4/R5-funn er importert og gates er kjørt.

## Auditens endelige svar

Prosjektet har ikke bare samlet forskning; det har gjennomført mye reell analyse. For de sentrale Food-TG/JT-spørsmålene er analysegraden høy og nylig styrket av R4/R5. For hele forskningsbiblioteket som komplett kildepopulasjon er status derimot "strukturert, delvis analysert og sterkt prioritert", ikke "uttømmende analysert".

Den mest sannsynlige sannheten er:

> Kjerneanalysen er moden. Biblioteket er ikke ferdig item-for-item.
