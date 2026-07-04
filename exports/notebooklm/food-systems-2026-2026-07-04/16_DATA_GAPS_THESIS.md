# Data Gaps Thesis - Missing Data Is A Finding

Export date: 2026-07-04
Packet type: thesis
Status label: mixed: citable plus gated/internal context
Allowed use: Use for narrative structure, but preserve source labels before making external claims.

## What This Source Is For

Make structural data gaps usable as decision evidence without fabricating missing values.

## Core Claims Or Working Propositions

- Type-C gaps are findings when public data does not exist or cannot answer the question.
- A good chart can show blank cells, but it must not impute them silently.
- The project should use gaps to define actor questions and next data collection missions.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Datagap atlas | Use as internal synthesis of gaps. | Not citable as a fact source by itself. |
| R13 stop list | Use as figure guardrail. | Blocks charts until method/empty cells are visible. |
| Remediation backlog | Use for data-quality state. | Older counts can drift; verify if current status matters. |

## Known Caveats

- Do not convert unknown into zero.
- Do not convert absence of public data into proof of absence in reality.

## Deck Angles

- Slide: "The missing cell tells us who owns the next conversation."
- Slide: "Fail-closed is a quality feature."

## Bad Generic Framing To Avoid

- Avoid "more data is needed" without specifying which decision it blocks.
- Avoid smoothing caveats out of slide text.

## Source Paths Included

- docs/project/mandates/R13-LAND-004-datagap-atlas.md
- research/REMEDIATION-BACKLOG.md
- research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
- docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md

## Source Excerpts

### docs/project/mandates/R13-LAND-004-datagap-atlas.md

````markdown
# R13-LAND-004 — Datagap-atlas: hva som ikke måles og av hvem

## Hva dette er — og hva det ikke er

Dette dokumentet er et **internt arbeidskart** over type-C-hull i Food TG R13-materialet (batch 01-11), supplert med ekte C-funn fra R12 slik de er klassifisert i R13-GAP-006. Det er ikke en faktakomponent, ikke siterbar kunnskap, ikke whitepaper-stemme og ikke et ferdig visualiseringsgrunnlag.

Formålet er å samle alle dokumenterte gap på ett sted slik at:
1. Prosjektet vet hva som blokkerer hvilke faktagrunnlag.
2. Ingen fremtidige claims formuleres som om C-hullene er fylt.
3. Prioritering av actor-gate, primærdata og metodeutviklingstiltak kan gjøres systematisk.

**Overclaim-vakt:** type-C er funn, ikke research-gjeld som "vil bli løst". Hullene registreres her som de er — tomme celler er synlige, ikke skjult i en pen figur.

**Skillet som brukes i dette atlasset:**
- **Strukturelt C:** aldri målt, ikke mulig å hente uten primærdata/aktørdata/ny metodeutvikling. Vil ikke bli lukket av videre desk-research.
- **Temporalt C:** ikke målt ennå, men måleprogram er opprettet eller data vil foreligge på kjent tidspunkt.

---

## Domenetabell

### Domene 1 — Volum og massestrøm

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| WASTE-002-A | Faktisk innsamlet oppdrettsslam per år, nasjonalt (tørrstoff, tonn) | Strukturelt C | Åpne merder har ingen oppsamlingsplikt; «~2 %» er anslag (NIBIO), ikke serie. FHF-tall er modellert fra fôrforbruk — ikke målt volum | Oppdrettsoperatører + Miljødirektoratet tilsynsrapport per anlegg | B (modellert) / C (innsamlet) | Uten aktørdata: aldri (åpne merder) | Massebalansen oppdrettsslam; fosforretur til jord |
| WASTE-002-B | Behandlet oppdrettsslam (biogass/gjødsel/kompost) per år, nasjonalt | Strukturelt C | Bransjeanslag finnes (Bioretur/Sterner), men ingen anleggsserierevidert nasjonal total | Biogassanlegg/leverandør; NIBIO; Miljødirektoratet driftsrapport | C | Uten aktørdata: aldri | Fosfor- og nitrogenregnskap; sirkulærøkonomiestimater |
| WASTE-002-C | Tre-kolonners massebalanse (modellert/innsamlet/behandlet) per lokalitet/år | Strukturelt C | Koblingen mellom de tre kolonnene finnes ikke i noen åpen kilde; anleggsvis kontroll mangler | Statsforvalter-tillatelser + driftsdata per anlegg | C | Krev aktørkontakt + Statsforvalter-API | Lokal tiltaksanalyse; regulatorisk effektvurdering |
| WASTE-005-NO | Nasjonalt aggregert NPK-retur fra digestat (N/P/K kg/tonn, absolutte verdier) | Strukturelt C | Ingen norsk SPCR 120-ekvivalent. Ny gjødselvareforskrift (2025) innfører registreringsplikt, men ikke obligatorisk sertifisert rapportering | Biogass Norge; NIBIO (Eva Brod); Mattilsynet | C (NO systemivå) / B (enkeltanlegg) | Tidligst 2027 (om ny forskrift gir aggregerte data) | Gjødselpotensial-beregning; mineralgjødselsubstitusjon |
| WASTE-005-K | Kalium (K) retur fra norsk digestat — særlig svak | Strukturelt C | K er nesten ikke kvantifisert i norsk FoU-litteratur; SPCR 120 finnes kun for Sverige | Som over | C | Ikke mulig uten systematisk anleggsmåling | Næringsstoffbalansen for K i norsk jord |
| WASTE-007-A | Industrielle næringssidestrømmers volum per fraksjon (per år, per sektor) | Temporalt C | Siste aggregering er Nofima 67/2016 (~10 år gammel); meieri-tall aktørformidlet uten verifiserbar primærkilde | Nofima; TINE årsrapport; SSB industritall | B (utdatert) / C (per fraksjon) | Ny Nofima-rapport når bestilt | Ressursregnskap; potensiell verdiskapingskart |
| WASTE-006-A | Kaffegrut (SCG) disponering — faktisk masseflyt til biogass/kompost/avfall | Strukturelt C | Ikke separat SSB-avfallsfraksjon; HORECA-etterlevelse ikke kartlagt | Avfallsmottak; biogassanlegg; SSB 08801 kaffeimport (estimat-inngang) | C (disponering) / B (volum estimert) | Uten avfallsaktørdata: ikke mulig | Materialgjenvinningspotensial; urban sidestrøm-atlas |
| PROT-008-B | Belgvekstareal i tonn (norsk produksjon bønner/erter/åkerbønne per år) | Strukturelt C | SSB tabell 07495 finnes men er ikke systematisk hentet for belgvekster som SSB-serie; nesten alt til fôr, matserien mangler | SSB tabell 07495; Landbruksdirektoratet | C (SSB-serie) | Mulig etter SSB-uttrekk | Norsk proteinvekststatistikk |
| PROT-001-A | Realisert tonn insektmel/-protein solgt i Norge/Norden per år | Strukturelt C | Invertapro, Enorm, Tebrito oppgir ikke tonn; kapasitet finnes, realisert produksjon ikke åpen | Aktørkontakt; produksjonsregnskap | C | Uten aktørdata: aldri | Proteinalternativ-rangering; fôrproteinkart |
| PROT-002-A | Realisert nordisk årsvolum single-cell/fermenteringsprotein (mat + fôr) | Strukturelt C | Kapasitet og LOI er åpent; realisert fôr-grade nordisk volumserie ikke offentlig | Unibio, Solar Foods, Calysta aktørkontakt | C | Uten aktørdata: aldri | Proteinalternativ-kart; fôrimportreduksjon |
| PROT-003-A | Kommersielt realisert nordisk fôrvolum musling/tang/tare | Strukturelt C | FoU og potensial er sterke; ingen kommersiell volumserie identifisert | Nofima; aktørkontakt (Norcod, Seaweed Solutions) | C | Uten aktørdata: aldri | Havbasert protein-kart |
| GAP-001-A | Fôrprotein-total (all import av råprotein til norsk matproduksjon, samlet) | Strukturelt C | SSB 08801 lukker varekode/mengde/verdi per HS-nummer, men sluttbruk (husdyr/fisk/human) er ikke i koden; ingen nasjonal aggregering av fôrprotein-total | Landbruksdirektoratets kraftfôrstatistikk (husdyr) + FHF ressursregnskap (fisk) krever metodekobling | C | Mulig med metodeutvikling (3–6 mnd) | Proteinselvforsyningsberegning inkl. fisk |
| GAP-003-A | Transport/lager-kapasitet (tonn/dag/lager, kaldkjedekapasitet) | Strukturelt C | Forretnings-/beredskapssensitivt; ikke åpent. ØA 60-2023 kvalitativt | Forsvarsdepartementet/DSB; aktørkontakt | C/klassifisert | Uten tilgang: ikke mulig | Forsyningssikkerhet; kriseplan |

---

### Domene 2 — Eierskap og aksjonær

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| AKTOR-006-A | Aksjonærregister for alle kartlagte sirkulær/altprotein/CEA-selskaper | Strukturelt C | Skatteetatens aksjonærregister er ikke åpent. Brreg API gir rolledata (styre/DL), ikke eierstruktur | Proff Forvalt/Infotorg (betalt); Skatteetaten innsynsbegjæring | C (alle 8 selskaper) | Mulig med betalingsverktøy | Eierskapskart; maktanalyseclaims |
| AKTOR-006-B | Vestkorn Milling AS — tilknytning til dsm-firmenich | Strukturelt C | Indikasjon via styremedlems etternavn, men ikke bekreftbart via Brreg | dsm-firmenich årsrapport; Proff Forvalt | C | Mulig med manuell rapport-sjekk | Konsentrasjonskart altprotein |
| AKTOR-006-C | Invertapro AS — aksjeklassestruktur (A/B-klasser) | Strukturelt C | Brreg viser at tre styremedlemmer er «valgt av A-aksjonærene», men klassestruktur ikke offentlig | Selskapets vedtekter (betalt); Proff Forvalt | C | Mulig med betalingsverktøy | Eiermaktanalyse |
| AKTOR-006-D | NorInsect Holding AS — ytterste eiere | Strukturelt C | Holdingselskap uten åpent aksjonærregister; fire datterselskaper bekreftet | Skatteetaten/Proff Forvalt | C | Mulig med betalingsverktøy | Konsentrasjonskart altprotein |
| AKTOR-006-E | Gruten AS — org.nr og driftstatus | Strukturelt C | Ikke funnet i Brreg (aktive eller slettede) — kan operere under annet navn, som ENK, eller slettet | Sekundærkilder fra 2017/2021; Brreg historisk søk | C | Ukjent | Kaffegrut-aktørkart |
| DIST-001 | ASKO storh.andel 70 % — uavhengig bekreftelse | Strukturelt C | Tall sirkulerer i bransje, men ingen uavhengig primærkilde identifisert i R12/R13 | Dagligvarerapport KT 2024-25 (PCQ gjenstår); aktørkontakt | C (uavhengig) / B (bransje) | Mulig etter KT-rapport PCQ | HORECA-konsentrasjonsanalyse |
| DIST-003 | EMV-andel i Danmark og Island | Strukturelt C (IS) / Temporalt C (DK) | DK: eldre primærkilde; IS: ikke søkt/ikke funnet | Oppdatert nordisk myndighets-/markedskilde | C (IS) / B (DK) | DK: mulig med ny kilde; IS: ukjent | Nordisk EMV-rangering |
| AKTOR-001-POP | Totalpopulasjon markedshager i Norge | Strukturelt C | Ingen nasjonal database; Brreg-treff (18 foretak) er minimumsanker; mange bruker ikke «markedshage» i foretaksnavn | Småskala Grønt Norge (ingen nettside/liste); Debio | C | Etter aktørkontakt Småskala Grønt Norge | Markedshagebransjens størrelse |
| AKTOR-006-F | Onna Greens AS — kunder og salgssteder i dagligvare | Strukturelt C | Ikke bekreftet i åpen kilde | Coop/NorgesGruppen årsrapporter; aktørkontakt | C | Mulig med manuell årsrapportsjekk | CEA-distribusjonskanal-analyse |

---

### Domene 3 — Jordkvalitet og karbon

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| OKO-003-A | Nasjonal SOC-baseline for jordbruksjord | Temporalt C | JordVAAK startet datafangst 2026; 10-årig rotasjonssyklus — første fullstendige tilstandsanalyse ~2036 | JordVAAK/NIBIO | B (program etablert, ingen data) | ~2036 (første fullstendige) / ~2029 (delresultater mulig) | Karbonberegninger; UNFCCC-rapportering; klimakalkulator-validering |
| OKO-003-B | Nasjonal SOC-baseline skog og eng (NSCM) | Temporalt C | NSCM-innsamling startet 2023, første fullstendige runde ~2032 | NIBIO NSCM | B (innsamles, ikke publisert) | ~2032 | LULUCF-rapportering; areal-CO₂-regnskap |
| OKO-003-C | Historisk SOC-tidsserie for norsk jordbruksjord | Strukturelt C | Aldri systematisk målt — NIBIO bekrefter eksplisitt «no historic data» | Finnes ikke i eksisterende datakilder | C | Vil ikke foreligge | Trendanalyse jordkarbon; klimascenarioer |
| OKO-003-D | Andel jordbruksareal med jordsmonnskart | Temporalt C | 39 % av arealet mangler per 2026; løpende ~100 km²/år (siden 1980-tallet) | NIBIO jordkartlegging | B (61 % dekning) | Tidligst 2040+ for full dekning | Klimakalkulator (settes til 0 for ukartlagte arealer) |
| OKO-002-A | EOV-sertifiserte gårder i Norge — antall og liste | Strukturelt C | Regenerativt Norge tilbyr EOV-metoden, men antall norske sertifiserte gårder er ikke offentliggjort | Regenerativt Norge aktørkontakt | C | Etter aktørkontakt | Regenerativt landbruk-spredningsanalyse |
| OKO-002-B | Nasjonal myrjordbaseline (SOC i torvjord) | Temporalt C | Forskning pågår (NORSØK PEATIMPROVE 2022–2025); ingen nasjonal samlet baseline | NORSØK; NIBIO | B/C | ~2026-2027 (prosjektavslutning) | Myrjord klimaregnskap; dreneringspolicy-vurdering |
| OKO-003-E | Karbonfarmingprogram i norsk jordbruk — etablerte kredittordninger | Strukturelt C | Ingen etablerte programmer per juni 2026; EU CRCF trådte i kraft 2024 men ikke EØS-innlemmet | Bionova; EU CRCF innlemmelsesprosess | C | Tidligst 2028 (EØS-prosess) | Carbon farming business case; bønders insentiver |

---

### Domene 4 — Aktørstatus

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| AKTOR-002-A | Per-gård aktiv status andelslandbruk (av ~90 aktive, kun 25 Brreg-bekreftet) | Strukturelt C | Økoguiden-kart er JavaScript-drevet — ikke maskinlesbar; resten krever per-gård-bekreftelse | Debio for produsentliste; Chrome MCP på Økoguiden | C (65–70 gårder) | Mulig med Chrome MCP/Debio-kontakt | Andelslandbruk-sektors faktiske størrelse |
| AKTOR-004-A | Totaltall regenerative bønder i Norge | Strukturelt C | HM-utøverkart (Regenerativt Norge) ikke offentlig navneliste; 11 gårder er bekreftet navngitt (B) | Regenerativt Norge aktørkontakt | C | Etter aktørkontakt | Regenerativ praksis-spredningsanalyse |
| AKTOR-007-A | Nasjonal inventarliste skogshage/permakultur-sites | Strukturelt C | Google Maps-embed ikke maskinlesbar; 13 sites bekreftet (B) — ikke fullstendig | Norsk Permakulturforening; Root2Fork-forum | C | Høst 2026 (Root2Fork åpnet juni 2026) | Permakultur-sektorkart

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### research/REMEDIATION-BACKLOG.md

````markdown
# REMEDIATION BACKLOG — data-readiness Fase B

> Auto-generert av `scripts/build-remediation-backlog.ts` — ikke rediger manuelt.
> Generert: 2026-07-01T02:10:27.247Z
> Totalt: **917** funn

## Sammendrag per kilde × severity

| Kilde | HIGH | MEDIUM | LOW | INFO |
|---|---:|---:|---:|---:|
| file-coverage | 65 | 105 | 342 | 0 |
| pdf-quality | 0 | 289 | 0 | 0 |
| html-triage | 0 | 0 | 29 | 0 |
| url-health | 0 | 0 | 87 | 0 |
| **Total** | 65 | 394 | 458 | 0 |

## Fiksgrupper (rotårsak-analyse)

Mange MEDIUM-funn deler rotårsak. Grupper for batch-fiks:

| Gruppe | Funn | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|
| B: external/ DB-only | 44 | 0 | 44 | 0 |
| D: other missing-document | 97 | 65 | 31 | 1 |
| F: orphan files | 369 | 0 | 30 | 339 |
| G: broken supportingSource | 1 | 0 | 0 | 1 |
| H: duplicate Documents | 1 | 0 | 0 | 1 |
| M: other PDF issues | 289 | 0 | 289 | 0 |
| O: other HTML issues | 29 | 0 | 0 | 29 |
| P: dead URLs | 41 | 0 | 0 | 41 |
| Q: blocked URLs (403/451) | 44 | 0 | 0 | 44 |
| T: other URL issues | 2 | 0 | 0 | 2 |

## Nåværende hovedrestanser

- **SourceDoc-lokatorer:** 0 funn. Strukturerte SourceDoc-poster regnes som dekket når de har URL, DOI, koblet Document eller lokal fil.
- **PDF-OCR:** 0 scannede PDF-er er lukket i `research/PDF-OCR-REVIEW.csv` fordi OCR-tekst, eksisterende Document-tekst eller eksplisitt lokal erstatningstekst er dekkende; 1 review-rader traff ingen aktiv PDF-quality-rad.
- **URL-helse:** 87 funn fordelt på dead/blocked/timeout/server_error/other.
- **URL-review:** 5 blokkerte URL-er er lukket i `research/URL-HEALTH-REVIEW.csv` fordi de er verifisert via nettleser, citable mirror eller lokal kildepakke; 0 review-rader traff ingen aktiv URL-health-rad.
- **Document.filePath:** 141 manglende dokumentfiler i denne kjøringen.
- **Orphan files:** 369 repo-filer uten DB-rad. Dette er lavere prioritet så lenge de ikke er brukt i app eller rapport.

## Anbefalt rekkefølge for neste ryddeslice

1. **Åpne MEDIUM-funn:** håndter gjenværende `pdf-quality`-rad først. For skippede/korrupt-lignende PDF-er betyr dette re-nedlasting, erstatningskilde eller eksplisitt arkivbeslutning.
2. **Graph enrichment:** prioriter board-member profile gaps og company-name duplicate groups; teknisk graf-integritet er allerede grønn.
3. **Dead/low-priority URL-er (Gruppe P/T):** rydd bare der kilden brukes i app/rapport eller har klar ny URL.
4. **Orphan files (Gruppe F):** vurder arkivering/sletting senere; alle Document/SourceDoc-lokatorer er grønne i denne kjøringen.

## URL-HEALTH status

URL-helse er klassifisert fra `research/URL-HEALTH.csv`. `blocked` kan være reell botblokkering/paywall og må ikke automatisk tolkes som død kilde; `dead` og nettverksfeil krever ny URL, arkivkopi eller lokal kildepakke.

Review-lukkede URL-er i `research/URL-HEALTH-REVIEW.csv` beholdes med opprinnelig kilde-URL, men tas ut av åpen backlog når det finnes eksplisitt nettleserverifikasjon, citable mirror eller lokal kildepakke. Dette er ikke det samme som å erklære CLI-sjekken grønn.

Scannede PDF-er i `research/PDF-OCR-REVIEW.csv` beholdes som opprinnelige PDF-filer, men tas ut av åpen backlog når OCR-tekst, DB-innhold eller eksplisitt lokal erstatningstekst på minst 100 ord er dekkende. Dette er ikke det samme som å erklære PDF-filen tekstbasert.

## Top 30 høyest prioritet

| # | Severity | Source | Fix-gruppe | Problem | Ref |
|---:|---|---|---|---|---|
| 1 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyof0000njvmdjrv2blv (tesdal-2013) |
| 2 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyqr0001njvm7la1op31 (sedwall-2025) |
| 3 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyqy0002njvmeo5z64yk (bojo-2023) |
| 4 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyr30003njvmka3xvjsc (nmbu-circular-vegetables-2022) |
| 5 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyr60004njvmkuyujbnd (van-straten-2025) |
| 6 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrc0005njvm3ccaxbrf (segersven-2024) |
| 7 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyri0006njvm31b5p6at (rey-verge-2005) |
| 8 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrn0007njvmd1h15xme (slu-house-crickets-2025) |
| 9 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrr0008njvm72f0l3n2 (bueso-bordils-2021) |
| 10 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyru0009njvmavxrd7cp (desilva-2023) |
| 11 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyrz000anjvm40x9zv8t (lund-beijer-2026) |
| 12 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajys2000bnjvm18kstw5z (mirza-2016) |
| 13 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyso000cnjvm1vx5gvhu (matsystemutvalget-2026) |
| 14 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajysv000dnjvm5uvvmk08 (akademia-uib-kjopermakt) |
| 15 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyt3000fnjvmjakt14qv (se-konkurrensverket-2024-5) |
| 16 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyt8000gnjvmz8r1gkuy (asko-infrastruktur-2025) |
| 17 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytd000hnjvmn60kb31b (kt-markedsundersokelser-2026) |
| 18 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytf000injvm3k3rqsu6 (is-markedsstruktur-2024) |
| 19 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytj000jnjvmapvnokb7 (juridisk-eudr-norge-2025) |
| 20 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajytn000knjvm9q2oil3y (nbs-systemkritikk) |
| 21 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyu3000onjvmqmv7ycxt (norden-policy-2024) |
| 22 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyu9000pnjvmnf9p1ypx (akademia-sifo-retail-media-2025) |
| 23 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuc000qnjvmm7gsitu3 (juridisk-eiendomsmakt-lokal-konku |
| 24 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyue000rnjvmxrad483t (etmv-toimintakertomus-2024) |
| 25 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuh000snjvmgcmt6umd (coop-danmark-2024) |
| 26 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyul000tnjvmlzlt7jek (verdibutikker-utfordrere) |
| 27 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyuo000unjvmcl2enn4a (nordisk-sammenligning-2024) |
| 28 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyut000wnjvm9uh3kihc (dlf-leverandor-2025) |
| 29 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyv1000ynjvmqjymvcbk (menon-emv-innovasjon) |
| 30 | HIGH | file-coverage | D: other missing-document | missing_file_document | cmppajyv3000znjvm24f56eod (merkevarer-historie) |
````

### research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

````markdown
# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 50 / 50
- **Decision-batcher funnet:** batch-01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002), batch-02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002), batch-03 (R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007), batch-04 (R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007), batch-05 (R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004), batch-06 (R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003), batch-07 (R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007), batch-08 (R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002), batch-09 (R13-INNO-003, R13-INNO-004, R13-INNO-005, R13-INNO-006), batch-10 (R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003), batch-11 (R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007), batch-12 (R13-LAND-001, R13-LAND-002, R13-LAND-003, R13-LAND-004), batch-13 (R13-LAND-005, R13-LAND-006)
- **Batcher ikke funnet som decision/report-fil:** batch-13 (ikke startet)
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 14 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 24 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 1 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 8 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 4 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 3 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 46 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 gir Type-A importtidsserie 2020–2024 (volum+verdi separat) for soya/fiskeolje/kaffe/kakao; fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke. | importer (PCQ; speil holdt ute) | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | 3 løftbare m/caveat (REKO 2022, andelslandbruk 93/2023, Rest-konkurs 2024), 1 delvis (fiskeolje), 3 parkert/nedgradert (ASKO 70 %, SOIL-score, Plantagon). | claim-lock-kandidat for smale rader; verifiser per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF fulltekst: ~1,1 mill. t, 89 % utnyttet, men kun ~15 % humant konsum vs 66 % fôr / ~19 % energi — utnyttet ≠ høyverdi. | importer (PCQ) | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Offentlige tall er modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet/behandlet kun fragmenter; åpne merder samler ~0. Ingen 3-kolonners anleggsbalanse i åpne kilder. | vent — parkert til actor/primærdata (se også parkert) | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | NORSUS/Matvett OR.16.24 (husholdning 2023: 193 200 tonn) og OR.28.25 (dagligvare 2024: 43 600 tonn); bransjeavtale og matsvinnlov primærkilder. A-klasse med C-gap (husholdning 2024 mangler, matindustri kun t.o.m. 2022). | importer med synlige caveater og tomme 2024-celler | research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige A (SPCR 120 2023: Tot-N ~5,1 / P ~0,60 / K ~2,1 kg/tonn); Norge B/C — ingen nasjonal aggregering, strukturelt hull. | aktørspørsmål til Biogass Norge/NIBIO | research/external/r13/R13-WASTE-005-digestat-npk-retur.md |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | SPC dominerer (~21 % av fôr 2020, Nofima/FHF A-kilde). Fiskemjøl ned fra 65 % (1990) til 12 % (2020). All SPC ProTerra/RTRS-sertifisert via Denofa. Ingen offentlig ressursregnskap etter 2020. | vent — hent nyere Nofima/FHF ressursregnskap 2022/2023 | research/external/r13/R13-PROT-006-soya-erstatning-for.md |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | Rå 41,3 % / fôrkorrigert 34,9 % (2024, energibasis, A). Protein-gram-serie mangler offisiell beregning (C). Fôrkorrigert ekskluderer fiskefôr — strukturelt hull. | vent — aktørspørsmål til NIBIO om protein-gram-serie og akvakulturfôr-korreksjon | research/external/r13/R13-PROT-007-proteinselvforsyning.md |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Brreg rolledata (A) for 8 aktører: Invertapro, NorInsect, Vestkorn, NoMy, Avisomo, Onna, Vertical Agri. Rest AS bekreftet slettet (konkurs 2024-09-05). Gruten AS ikke funnet. Aksjonærregister C-celle systematisk. | vent — Proff Forvalt/Skatteetaten for aksjonærdata; dsm-firmenich årsrapport for Vestkorn | research/external/r13/R13-AKTOR-006-eierskap-founders.md |
| R13-OKO-001 | 10 | Økologisk areal og produksjon i Norge | PCQ | Norsk øko-areal stabilt ~4,3–4,5 % (2024, inkl. karens), vedvarende nedgang i produsentantall siden 2011–2012. 10%-mål 2032 krever dobling. Øko-salg +17,6 % 2025, men norsk melkeproduksjon faller. Import-vs-norsk andel: C. | **importer** med synlige tomme celler (godkjent/karens-skille; import/norsk) — Debio statistikkhefte 2025 er sterkeste A-kilde | research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord: måleprogrammer og baseline | PCQ | Norge mangler nasjonal SOC-baseline for jordbruksjord. JordVAAK oppstartet 2026, første analyse tidligst ~2036. UNFCCC-karbontall er Tier 1/2-modellert, ikke direkte målt. 39 % av jordbruksareal mangler jordsmonnskart. | vent — JordVAAK tidligst 2029; NIBIO jordsmonnskart (61 % dekning) kan brukes som proxy med caveat | research/external/r13/R13-OKO-003-jordhelse-karbon.md |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft: nasjonale mål, EU F2F og måloppnåelse | PCQ | Riksrevisjonen (jun. 2025): klimamål IKKE i rute. Jordvernmål nådd 2025 (1 763 daa, foreløpig). Øko-areal 4,6 % mot 10 %-mål 2032. Selvforsyning ~40 % mot vedtatt mål 50 %. EU F2F ikke EØS-innlemmet. | **importer** med synlige tomme celler (matsvinn ekskl. primærjordbruk; selvforsyningsprognose; pollinatorbestandsmål) | research/external/r13/R13-OKO-007-policy-mal-okologi.md |
| R13-LAND-001 | 12 | Makt- og eierkonsentrasjon — dagligvare, grossist, foredling og fôr | PCQ | KT Dagligvarerapport 2024 (A): NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 %. Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023, A). Grossistprosenter: C. Fiskefôr 2024: C. Kraftfôrandel: C. | **importer** med synlige C-celler (grossistprosenter, fiskefôr, Tine 2024, kraftfôrandel) — KT-rapporten er sterkeste A-kilde | research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md |
| R13-LAND-002 | 12 | Vertikal integrasjon og kontroll i norsk matsystem | PCQ | 28 integrasjonskoblinger dokumentert fra årsrapporter: NG (ASKO, UNIL, BAMA 46 %), Coop (industri, logistikk), Reitan (Norsk Kylling 100 %, Stange Gård 95 %), Nortura, Tine, Mowi (rogn-til-pakke), FK (Norgesmøllene 2025). 6 tomme celler. | **importer** med 6 navngitte PCQ-tomme celler (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | research/external/r13/R13-LAND-002-vertikal-integrasjon.md |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md

````markdown
# GOAL: Execute Food TG Research OS Runde 13 (autonom)

## Goal-setning

Kjør hele R13-backloggen (50 prompts) autonomt med R2-berikelsesdisiplin: for hver prompt, hent primærkilder, skriv et mottakbart research-artefakt, fatt en mottaksbeslutning, og rull funnene opp i en intake-indeks. Ingen output blir ekstern faktastemme. Goalet er ferdig når alle 50 prompts har output-fil, decision-rad og intake-rad, og kontrollene er grønne.

## Inndata (les disse først)

1. **Promptpack** — `docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md` (selve promptene + universal instruks).
2. **Backlog-CSV** — `research/_status/food-tg-research-backlog-2026-06-25.csv` (kanonisk ID/gate/next_artifact).
3. **Masterplan** — `docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md` (rekkefølge §8, stop-regler §9).
4. **Mottaksprotokoll** — `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md` (A/B/C, hulltyper, gates).
5. **Intake-mal** — `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` (fylles per batch).

CSV-en er fasit for ID, rekkefølge, gate og `next_artifact`. Promptpacken er fasit for prompt-tekst og `Lagre output`-sti.

## Harde regler (gjelder hele kjøringen)

1. **Primærkilde først.** Sekundær-/speilkilde bare når primær mangler, og merk `B`.
2. **Ikke gjett.** Tomme celler og dokumentert fravær er gyldige funn.
3. **Skill kildeklasse `A`/`B`/`C` per funn**, ikke bare per dokument.
4. **Skill realisert volum, kapasitet, plan, potensial og hypotese.**
5. **Hver output ender i én gate:** source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkert.
6. **Lag alltid en `Ikke si`-liste.** Mangler den, er importbeslutning `vent`.
7. **Ingen DB-skriving, ingen `safe_for_ai_context`, ingen claim-åpning, ingen whitepaper-/deck-tekst.**
8. **Følg stop-reglene i masterplan §9.** Parker heller enn å overclaime.
9. **Hold deg til scope per prompt.** Én prompt = ett smalt artefakt.

## Kjørerekkefølge og batcher

Kjør gap-closure først (masterplan §8), deretter food-waste, protein-alt, actor-map, innovation, ecology, landscape. 13 batcher à ~4 prompts:

| Batch | Prompt-IDer |
|---|---|
| 01 | R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002 |
| 02 | R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002 |
| 03 | R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007 |
| 04 | R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007 |
| 05 | R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004 |
| 06 | R13-PROT-005, R13-PROT-008, R13-AKTOR-001, R13-AKTOR-002 |
| 07 | R13-AKTOR-003, R13-AKTOR-004, R13-AKTOR-006, R13-AKTOR-005 |
| 08 | R13-AKTOR-007, R13-AKTOR-008, R13-INNO-001, R13-INNO-002 |
| 09 | R13-INNO-003, R13-INNO-004, R13-INNO-006, R13-INNO-005 |
| 10 | R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003 |
| 11 | R13-OKO-005, R13-OKO-007, R13-OKO-004, R13-OKO-006 |
| 12 | R13-LAND-001, R13-LAND-002, R13-LAND-005, R13-LAND-003 |
| 13 | R13-LAND-004, R13-LAND-006 |

Innenfor en batch: kjør P0/P1 før P2. Hvis en kilde ikke finnes, registrer hullet og gå videre — ikke stopp hele batchen.

## Per-prompt arbeidsløkke

For hver prompt-ID:

1. Les prompt-blokken i promptpacken og `next_artifact`/`Lagre output`-stien.
2. Hent primærkilder (offisiell statistikk, register, lovtekst, årsrapport, fagrapport). Logg URL og tilgangsdato.
3. Skriv output-fila på `Lagre output`-stien med universal-format: Kort dom, Sterkeste kilde, Svakeste punkt, Funn-tabell (kilde/år/lokator/klasse/caveat), Tomme celler, `Ikke si`, Anbefalt gate.
4. Fatt mottaksbeslutning: `enrich` (importer som kandidat), `park` (stopp claim), eller `actor-gate` (krever aktørdata).
5. Append én linje til `research/_status/food-tg-r13/decisions/batch-NN.jsonl` (schema under).
6. Behold gate fra CSV som default, men nedgrader hvis svakeste punkt krever det (svakeste punkt styrer gate, ikke ønsket bruk).

## Output-kontrakt per batch

Etter hver batch, produser:

1. **Output-filer** — én per prompt på `Lagre output`-stien.
2. **Decision JSONL** — `research/_status/food-tg-r13/decisions/batch-NN.jsonl`, én linje per prompt.
3. **Batch-rapport** — `research/_status/food-tg-r13/report-batch-NN.md` med: header (Dato, Goal, Batch, Regel), Oppsummering (beslutning → antall → IDer), Mottaksrad-tabell (8 kolonner fra mottaksprotokoll §3), og Per-target outcome med verifisert(e) kilde(r) og utfall per ID.
4. **Oppdater intake-indeks** — legg hver prompt-ID i riktig(e) gruppe i `r13-intake-index-2026-06-25.md`, og oppdater Kontrollstatus + Hurtigoppsummering.

### Decision JSONL-schema (én linje per prompt)

```json
{"id":"R13-XXX-NNN","decision":"enrich|park|actor-gate","valueTier":"high|medium|low","title":"...","canonicalPath":"research/external/r13/...","shortVerdict":"2-4 setninger, funn ikke tolkning","strongestSource":"navn, år, lokator","weakestPoint":"hva tåler ikke ekstern bruk","sourceClass":"A | B | C | A with C gaps","gapType":"Type A | Type B | Type C (per relevant celle)","gate":"source-shortlist|PCQ|claim-lock|actor-gate|forstaelse|internal|parkert","importDecision":"importer|vent|parker|aktørspørsmål|claim-lock-kandidat","ikkeSi":["...","..."],"fetchedSources":[{"url":"https://...","accessedAt":"2026-06-25","sourceClass":"primary|secondary|actor-primary|public-filing"}],"fileEdited":true}
```

## Spesielle hensyn for gap-closure-batchen

`R13-GAP-*` lukker kjente R12-hull. Bruk R12-funnene som utgangspunkt:

- **GAP-001 (importnoder):** krever SSB 08801 HS-uttak per node; fosfat og fôrprotein-total var tomme celler i R12 — vis dem.
- **GAP-004 (alt. fôrproteiner):** realisert fôr-grade volum manglet nesten helt i R12 — annonsert kapasitet/plan skal ikke bli realisert volum.
- **GAP-005 (parkerte claims):** behandle ASKO/HORECA 70 %, REKO-tall, andelslandbruk aktiv-telling, SOIL-score, fiskeolje art/sluttbruk og Plantagon/Rest hver for seg; løft kun med uavhengig primærkilde.
- **GAP-006 (type-C-eskalering):** input er R12 intake-indeks; klassifiser hvert hull som Type A/B/C på nytt.

## Definition of done

Goalet er ferdig når:

- alle 50 prompt-IDer har en output-fil på `Lagre output`-stien
- alle 50 har én decision-linje fordelt på `decisions/batch-01..13.jsonl`
- alle 13 batch-rapporter finnes
- intake-indeksen viser «Promptrader indeksert: 50 / 50» og alle grupper er fylt
- ingen output åpner claim, skriver DB, eller bruker `safe_for_ai_context`/whitepaper-stemme
- følgende kontroller er kjørt og grønne:

```bash
# ID/struktur-konsistens
python3 - <<'PY'
import csv, re, json, pathlib
ids=[r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-25.csv"))]
dec=[]
for p in sorted(pathlib.Path("research/_status/food-tg-r13/decisions").glob("batch-*.jsonl")):
    dec += [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
dids=[d["id"] for d in dec]
print("backlog:",len(ids),"decisions:",len(dids),"unique:",len(set(dids)))
print("missing decisions:",sorted(set(ids)-set(dids)))
print("missing output files:",[i for i in ids if not list(pathlib.Path('.').glob(f'**/{i}-*.md'))])
PY

# repo-vakter
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

## Stop / eskaler til menneske

Stopp og rapporter i stedet for å gjette når:

- en prompt krever lukket aktørdata eller beslutningstilgang (actor-gate) — registrer kravet, ikke et tall
- to kilder gir motstridende primærtall uten metode for å avgjøre
- en kilde ser ut til å kreve betaling, innlogging eller er blokkert — noter som `C`/Type B og gå videre
- output ville måtte åpne et nytt claim for å være nyttig — parker det
````

