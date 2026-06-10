# Food TG Deep Research Source Intake 2026-06-10

**Status:** Intern kildeinntak og claim-gate
**Dato:** 2026-06-10
**Eier:** Gabriel
**Scope:** Gjennomgang av syv `deep-research-report*.md`-filer fra Downloads mot 09.06-casekort, `SRC-0906-*`, `PCQ-0906-*` og claim-lock.
**Kildeplassering:** Filene ligger forelopig utenfor repoet i `/Users/gabrielfreeman/Downloads/`.
**Relaterte kontrollfiler:** `food-tg-case-shortlist-addendum-2026-06-09.md`, `source-shortlist-food-tg.md`, `primary-check-queue-food-tg-v0.1.md`, `food-tg-claim-lock-table-2026-05.md`, `food-tg-deck-outline-2026-06-09.md`, `food-tg-deep-research-prompt-pack-2026-06-10.md`, `food-tg-casekort-og-research-mottak-2026-06-10.md`, `food-tg-deep-research-results-intake-2026-06-10.md`, `food-tg-primarkilde-og-datakontroll-ledger-2026-06-10.md`, `food-tg-research-intake-decision-pack-2026-06-10.md`.

## Bruksregel

Dette dokumentet er et kontrollert intake-lag, ikke en ny evidence matrix og ikke ekstern faktastemme. Researchfilene kan brukes til intern casekort-sortering, deckdisposisjon og neste dokumentask, men ingen claim skal gis ekstern valideringsstatus eller brukes offentlig før kilden er sjekket mot primarkilde, actor-/dokumenteier eller repoets citation/locator-gater.

De syv filene matcher 09.06-sprinten godt. Hovedregelen er derfor: styrk eksisterende `SRC-0906-*` og `PCQ-0906-*`, ikke opprett nytt hovedscope.

Videre Deep Research skal kjøres casevis med `food-tg-deep-research-prompt-pack-2026-06-10.md`. Nye outputs skal først gjennom valideringsprompten der før de importeres som kilde, PCQ-oppdatering eller claim-lock-delta.

Når nye outputer kommer tilbake, skal de registreres i `food-tg-deep-research-results-intake-2026-06-10.md` og deretter i `food-tg-casekort-og-research-mottak-2026-06-10.md`. Kilde- og datakandidater skal videre gjennom `food-tg-primarkilde-og-datakontroll-ledger-2026-06-10.md` før source-shortlist, PCQ, actor validation pack eller claim-lock oppdateres.

## Intake-matrise

| Intake-ID | Researchfil | Hovedtema | Kobling til kontrollstack | Hva materialet styrker | Intern bruk na | Hold tilbake | Neste kontrollhandling |
|---|---|---|---|---|---|---|---|
| DRI-0906-001 | `/Users/gabrielfreeman/Downloads/deep-research-report.md` | Kaffe, Brasil, EUDR, sporbarhet, kaffeavfall og nordiske aktorer | `SRC-0906-001`, `SRC-0906-003`; `PCQ-0906-001`, `PCQ-0906-003`; claim-lock rad om Brasil-MOU, Fuglen/Norsk Kaffeinformasjon og kaffegrut/biogass | God kildeoversikt for EUDR-, importstatistikk-, sporbarhets- og kaffeavfallsspor. Styrker dokumentask for hvilke primarkilder som bor sjekkes. | Internt bakteppe for kaffe/Brasil som importverdikjede- og EUDR-case. Kan brukes til a formulere bedre sok/asks. | Ikke bruk som bevis for at MOU finnes, at Fuglen/Norsk Kaffeinformasjon er partner, eller at kaffegrut gir dokumentert Food TG-effekt. | Finn faktisk Brasil-/kaffeprosjektdokument, partsliste, dato, scope, kontaktpunkt og bruksrett. Deretter oppdater `SRC-0906-001`/`003` med konkrete kilder. |
| DRI-0906-002 | `/Users/gabrielfreeman/Downloads/deep-research-report (1).md` | Kakao i Cote d'Ivoire, EUDR, sporbarhet, avskoging, nordiske aktorer og kakaoreststrommer | `SRC-0906-002`; `PCQ-0906-002`; claim-lock rad om Elfenbenskysten-MOU/kakao | Sterk syntese av policy-, sporbarhets- og reststromsfeltet. Den skiller ogsa mellom direkte verdikjeder, indirekte eksportstrommer og pilot-/roadmap-stadium for reststrommer. | Internt kildekart for kakao/Elfenbenskysten som mulig relasjons- og EUDR-case. | Ikke bruk som bevis for avtale, organisasjonsnavn, nordisk partnerrolle eller at kakaoreststrommer er skalert losning. | Finn MOU/avtale, organisasjonsnavn, motpart, dato, scope og bruksrett. Sjekk EUDR-datoer mot EU-side ved hver ekstern bruk. |
| DRI-0906-003 | `/Users/gabrielfreeman/Downloads/deep-research-report (2).md` | Valio, finsk meieri, soyafri melkefor, lokal protein og importavhengighet | `SRC-0906-006`; `PCQ-0906-006`; berorer `CL-A-020`, `CL-C-001`; claim-lock rad om importfritt meieri | Meget nyttig fordi rapporten eksplisitt avgrenser claim: Valio er soyafri melkefor-governance, ikke importfri forbase. | Kan gjore Valio mer deckklar internt som governance-/innkjopscase med tydelig caveat. | Ikke si at Valio eller Finland produserer melk uten importert for, eller at Valio dokumenterer hele substituttproteinets opprinnelse. | Sjekk Valio primarkilder, Luke/VTT/MMM-kilder og eventuelt A-Rehu/Valio-data for protein-supplementbasket: raps/canola, erter, bonner, importandel og ar. |
| DRI-0906-004 | `/Users/gabrielfreeman/Downloads/deep-research-report (3).md` | Bama, grossistledd, grontverdikjede, import, veksthus og vertikalt landbruk | `SRC-0906-004`; `PCQ-0906-004`; berorer `CL-C-001`, `CL-C-006`, `CL-C-015`; claim-lock rad om Bama/blokkering/marginer | Sterkest som C-gate: skiller fullsortimentsgrossist fra kategoriaktor og dokumenterer strukturelle barrierer uten a overdrive. | Kan brukes i internt deck som tryggere markedsstruktur- og adoption-gate for gront/lokal produksjon. | Ikke si at Bama blokkerer aktorer, har bestemte vinterimportmarginer, eller at rapporten dokumenterer ulovlig eller konkret ekskluderende praksis. | Primarsjekk Bama, Menon, Konkurransetilsynet, Dagligvaretilsynet, SSB og Landbruksdirektoratet. Avklar om case skal hete Bama, grontgrossistledd eller bredere adoption/distribusjon. |
| DRI-0906-005 | `/Users/gabrielfreeman/Downloads/deep-research-report (4).md` | Nordiske spillvarmeprosjekter til veksthus, akvakultur og annen matproduksjon | `SRC-0906-005`; `PCQ-0906-005`; berorer `CL-B-023`, `CL-C-015`; claim-lock rad om TWh-tall for spillvarme | God case-radar og metodevarsel: skiller elektrisk kapasitet fra faktisk nyttiggjort varme og viser at temperaturdata ofte mangler. | Internt benchmarkkart for lokal produksjon/energi som mulig B/C-case. Frövi, Wiig-Green Horizon, Polar DC DRA02, Green Mountain-Hima og Varde/Krageris peker seg ut for neste sjekk. | Ikke oppgi ett norsk TWh-potensial for matproduksjon, eller behandle plan-/pipelineprosjekter som operative investeringscase. | Hent regulatoriske kost-nytteanalyser, planvedlegg og prosjektdata med MW/GWh, temperatur, sesong, reservebehov, CAPEX/OPEX, eier og kjoper. |
| DRI-0906-006 | `/Users/gabrielfreeman/Downloads/deep-research-report (5).md` | Island/100% Fish, full fiskutnyttelse og overforbarhet til Norge | Marint restrastoff-case i addendumet; berorer `PCQ-B-005`; claim-lock rad om 100% Fish som norsk pilotbevis | Sterk benchmark for cascade-utilisation, fraksjonskvalitet, hub-/clusterlogikk og forskjellen mellom utnyttelse og hoyverdiutnyttelse. | Kan brukes internt til a styrke case 2 i decket: marint restrastoff som benchmark og designkrav. | Ikke si at 100% Fish beviser norsk pilotstatus, eller at all norsk restrastoffutnyttelse kan kopieres direkte til premiumprodukter. | Primarsjekk Iceland Ocean Cluster/100% Fish, Matís, SINTEF/FHF/Nofima/SUPREME og norske aktordata. Hold fast ved front-end: landing, sortering, kvalitet og hub-logistikk for premiumspor. |
| DRI-0906-007 | `/Users/gabrielfreeman/Downloads/deep-research-report (6).md` | Polen og Skottland som benchmarkland for sidestrømmer, bioressurser, akvakultur, fiskeri, matindustriavfall og sirkular biookonomi | `SRC-0906-007`, `SRC-0906-008`; `PCQ-0906-007`; claim-lock rader om Polen/Skottland watchlist | Oppgraderer Skottland fra los watchlist til seriost benchmark-kildegrunnlag etter primarsjekk. Polen blir mer governance-/statistikk- og matsvinnbenchmark enn direkte sidestrømvaloriseringscase. | Internt: bruk Skottland som hovedbenchmarkkandidat for bioressurskartlegging/sjomat/sidestrømmer; Polen som supplerende EU-monitoreringscase. | Ikke si at Polen er stor sidestrømsmulighet eller at Skottland er dokumentert Food TG-case for konkret norsk sammenligning for konkrete rapporter er primarsjekket. | Prioriter de fem sterkeste skotske kildene for fulltekstkontroll. For Polen: hold til fiskeri/akvakulturstatistikk, matsvinn og governance til konkrete massestromskilder finnes. |

## Forelopig modenhetsvurdering

| Spor | Ny status etter intake | Begrunnelse | Foreslatt deckstatus |
|---|---|---|---|
| Kaffe/Brasil | Bedre kildekart, fortsatt `needs-source` | God EUDR-/import-/kaffeavfallsliste, men ingen MOU eller prosjekttekst. | Samtalehypotese med dokumentask. |
| Kakao/Cote d'Ivoire | Bedre kildekart, fortsatt `needs-source` | Sterk EUDR-/sporbarhetsanalyse, men relasjon/avtale er ikke dokumentert. | Samtalehypotese med dokumentask. |
| Valio/Finland | Oppgrader til `intern deckklar med caveat` | Rapporten gir trygg stoppsprak og presis claim: soyafri melkefor-governance, ikke importfri forbase. | Exploratory case med tydelig caveat. |
| Bama/grontgrossist | Oppgrader til `intern deckklar som C-gate` | Kildene stotter struktur/barrierer og avviser for sterke blokkeringclaims. | C-gate/adoption, ikke aktoranklage. |
| Spillvarme/matproduksjon | Oppgrader til `benchmark-radar` | Flere navngitte case og gode tekniske sjekkpunkter, men ujevn temperatur/okonomidata. | Case-radar med due-diligence-gate. |
| Island/100% Fish | Oppgrader til `sterk benchmark med claim-lock` | Styrker marint restrastoff som designbenchmark, men ikke norsk effektbevis. | Benchmark/designkrav. |
| Polen/Skottland | Del opp | Skottland er sterk benchmarkkandidat; Polen er supplerende governance/statistikk. | Skottland: benchmarkkandidat. Polen: watchlist/supplement. |

## Claim-lock-effekt

Ingen claim-lock-rad kan apnes direkte etter denne intake'en. Folgende rader far bedre arbeidsgrunnlag, men status bor fortsatt vaere `hold-tilbake` eller `needs-primary-check` inntil primarkilde/actor-kontroll er gjort:

| Claim-lock-tema | Effekt av deep research | Anbefalt status |
|---|---|---|
| Brasil-MOU / kaffe | Kildekart styrket; MOU fortsatt ufunnet. | `hold-tilbake` |
| Elfenbenskysten-MOU / kakao | Kildekart styrket; avtale og motpart fortsatt ufunnet. | `hold-tilbake` |
| Fuglen/Norsk Kaffeinformasjon som partner | Mulige aktorer identifisert; rolle ikke bekreftet. | `hold-tilbake` |
| Bama/blokkering/marginer | Tryggere markedsstrukturgrunnlag; blokkerings- og marginclaims avkreftes ikke/bekreftes ikke. | `hold-tilbake`; bruk C-gate-sprak |
| Valio/importfritt for | Researchfilen svekker importfri-claim og styrker soyafri-governance claim. | `hold-tilbake` for importfritt; `intern caveat` for soyafri governance |
| Spillvarme TWh | Flere case og tall, men ikke ett nasjonalt potensial. | `hold-tilbake` |
| Polen/Skottland | Skottland har bedre dokumentkjede enn antatt; Polen mindre direkte for sidestrømvalorisering. | `watchlist`; Skottland kan primarsjekkes for benchmark |
| 100% Fish norsk pilotbevis | Benchmark styrket, men norsk gjennomforing ma valideres separat. | `hold-tilbake`; bruk som benchmark |

## Prioritert neste pass

| Rekkefolge | Pass | Output | Stoppsignal |
|---:|---|---|---|
| 1 | MOU/prosjektdokumenter for Brasil, kaffe, Elfenbenskysten og kakao | Avgjore om case 6 overlever som mer enn samtalehypotese. | Ingen dokumenteier, avtaletekst, partsliste, dato eller bruksrett. |
| 2 | Valio/Finland primarsjekk | Kort casekort: soyafri governance, importavhengig proteinstruktur, datagap. | Bare generelle sustainability-sider uten fordata eller ar/geografi. |
| 3 | Bama/grontgrossist C-gate | Juridisk aktsom caseformulering med Menon/tilsyn/SSB/Landbruksdirektoratet. | Margin- eller blokkeringsclaim uten primarkilde. |
| 4 | Spillvarme due-diligence mini-ledger | Case-tabell med operativ status, MW/GWh, temperatur, eier, matkobling og økonomi. | Kun datasenterkapasitet uten nyttiggjort varme og temperaturprofil. |
| 5 | 100% Fish / Norge restrastoff benchmark | Skille baselineutnyttelse, hoyverdiutnyttelse, fraksjonskvalitet og hubkrav. | Bruk av islandsk benchmark som norsk effektbevis. |
| 6 | Skottland/Polen split | Skottland fulltekstkontroll og Polen watchlistnotat. | Manglende fulltekst eller ingen konkret A/B/C-kobling. |

## Fil- og importnotat

Filene er ikke kopiert inn i repoet i denne pass'en. Hvis de skal bli permanente arbeidskilder, bor neste kontrollsteg enten:

1. kopiere dem inn under `research/intake/food-research-process-2026-06-10/` med hash, intake-ID og reviewstatus, eller
2. flytte relevante utdrag til `sprint-docs-0906/case*/` som case-spesifikke arbeidsnotater, mens originalfilene forblir eksterne.

Anbefaling: vent med import til vi har bestemt om dette skal vaere et generelt intake-arkiv eller case-spesifikke sprintnotater.
