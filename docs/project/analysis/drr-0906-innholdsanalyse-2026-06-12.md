---
tittel: DRR-0906 innholdsanalyse — hva deep research-runden faktisk ga oss
status: Intern analyse
eier: Gabriel
dato: 2026-06-12
scope: Substansiell gjennomgang av de åtte DRR-0906-rapportene (sikret i research/external/dro-0906/ 12.06) — etablerte fakta, svekkede claims, primærkildekandidater og en prioritert desk-research-kø som kan utføres uten aktørkontakt.
bruksregel: Intern analyse av mottaksdokumenter. Ingen claim løftes; alle statusord følger mottaksloggen (food-tg-deep-research-results-intake-2026-06-10.md). PCQ, source-shortlist og claim-lock er IKKE endret av dette dokumentet — endringer der skjer kun via mottaksprotokollens rekkefølge.
relaterte_filer:
  - research/external/dro-0906/README.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md
---

# DRR-0906 innholdsanalyse: hva runden faktisk ga oss

## 1. Hovedfunn på tvers

De åtte rapportene (alle 10.06, sikret i repo 12.06 med repo-sha256) er gjennomgående av høy kontrollkvalitet: hver har claim-test-tabell, kildeledger med locators, datauttrekk, aktørkart, «ikke si»-liste og rangerte neste handlinger. Tre tverrgående funn:

1. **Relasjonscasene (kaffe/Brasil, kakao/Elfenbenskysten) står og faller på interne dokumenter.** Begge rapportene bekrefter at offentlige kilder IKKE inneholder MOU-tekst — kaffe-rapporten fant kun Nordic Innovation Annual Report 2025-referansen til en signert partneravtale med Exchange4Change (uten kaffespråk), og kakao-rapporten fant kun Natural States egen LinkedIn-post om MOU-*intensjon* med LEAD Ivory Coast. DASK-0906-001/002 er dermed eneste vei videre for relasjonsclaims — mer web-research er bortkastet der.
2. **Begge relasjonscasene overlever likevel som import-/EUDR-caser på egne bein.** Kaffe: Brasil er største opprinnelse i norsk kaffeimport (NKI: 12,4 mill. kg råkaffeekvivalent 2024), Brasil er standard risk under EUDR (ikke lavrisiko), og CONAB Parque Cafeeiro er en operativ brasiliansk sporbarhetplattform. Kakao: EUDR dekker kakao/sjokolade, Côte d'Ivoire er standard risk med nasjonalt sporbarhetssystem (dekret 13.09.2023, RPCCV, ~950 000 produsentkort) — men direkte nordisk råbønneimport (HS180100) fra CI er *ikke synlig* i WITS 2024-tabellene, så nordisk relevans må bygges via bearbeidede produkter (HS1801–1806) og merkevarekjeder (Fazer er sterkeste nordiske aktørkandidat).
3. **Hver rapport leverer en konkret, utførbar primærkilde-kø.** Mye av «neste handling» er IKKE aktørkontakt, men henting og ekstraksjon av offentlige datasett og fulltekster — arbeid vi kan gjøre nå (se kap. 4).

## 2. Casevis substans

### DRR-001 Kaffe/Brasil
**Etablert:** Nordic Night (WCEF 2025, São Paulo) med NCH/Exchange4Change/IBEC og Martin Hagen/Natural State som kontakt; NI Annual Report 2025 refererer signert partneravtale inkl. food systems; Natural State har dokumentert kaffebransje-strategierfaring (2021-verdikjedeanalyse, Fuglen-kobling); importdata finnes (NKI-serie 2022–2024, WITS HS090111/090121). **Svekket:** «Brasil er lavrisiko under EUDR» (standard risk); norsk kaffegrut-til-biogass-pilot ikke funnet (parkert). **Nye aktørspor:** Nordic Approach (dokumentert EUDR-arbeid + Brasil-sporbarhet), Joh. Johannson/ICP Minas Gerais-prosjekt (benchmark-only), Gruten (kaffeavfall Oslo, benchmark-only). **Vei videre uten MOU:** kvantifisert norsk/nordisk import-/EUDR-eksponeringscase med SSB/Comtrade-serie 2022–2025.

### DRR-002 Kakao/Elfenbenskysten
**Etablert:** EUDR-rammeverk (anvendelse 30.12.2026/30.06.2027), CI = standard risk (3 % kontrollnivå), ivoriansk sporbarhetssystem myndighetsomtalt, kakao = 37,4 % av avskoging (tall trenger metodekontroll), ICCO-produksjonsserie. **Svekket:** direkte nordisk råbønneimport fra CI (ikke synlig i WITS 2024 for NO/SE/DK/FI/IS). **Sterkeste nordiske aktørkandidat:** Fazer (Ivory Coast farmer programmes, EUDR-arbeid, 53/47 % sertifisering/programmer). **Reststrømsporet** (Kumasi/kakaopulp): watchlist/benchmark-only — ingen primærkilde med volum/operatør/lokasjon.

### DRR-003/004 Valio/Finland (duplikater — bekreftet: 003 og 004 er i praksis samme dokument)
**Etablert:** Soyaforbud på finske Valio-melkegårder fra 1.3.2018 (policy + 2018-beslutning + 2024-review); grasbasert system (surfôr 40–60 % av tørrstoff innendørs); governance-mekanismer (kvalitetsmanual, ETT-positivliste, gårdskontroller); Valio ~3 000 gårder / ~80 % av finsk melk. **Motbevist:** «importfritt fôr» — Valio sier selv at rapsmel særlig er importvare og vitaminer/mineraler importeres; egen indikasjon 76–88 % innenlandskhet; Luke: bare 15 % selvforsyning for supplerende planteprotein i dyrefôr. **Datagap:** Valios aggregerte fôrkurv per råvare/opprinnelse finnes ikke offentlig (→ DASK/AASK). **Offentlige datakilder klare for uttrekk:** Ruokavirasto fôrstatistikk (oppdatert 20.04.2026), Tulli/Uljas CN-koder (2304, 230641/49, 1205, 071310), Luke avlings-/balansestatistikk.

### DRR-005 Distribusjon/adoption-gate (ikke «Bama-case»)
**Etablert:** Konkurransetilsynet 2022/2025 dokumenterer høykonsentrert oligopol og vertikalt integrert frukt/grønt; BAMA-skala (>500 000 tonn/år, 37/63 norsk/import, eierskap NG 46 %/Banan II 34 %/Rema 20 %); SINTEF 2025 dokumenterer markedstilgang/distribusjon som barriere for vertikal innendørs dyrking; OFG 2025: 44 % norskandel totalt, frukt 4 %, tomat 43 %, agurk ~80 %. **Avgjørende negativt funn:** Menon 2024 fant *ingen* rapporterte tilfeller av nektet grossisttilgang, og SØA har ikke margindata — BAMA-blokkering/margin-claims er dermed ikke dokumenterbare offentlig og skal ikke brukes. **Ny regulatorisk inngang:** Konkurransetilsynet overtok Dagligvaretilsynets god handelsskikk-oppgaver 01.05.2026. **Benchmark:** Coop/Avisomo/Reindyrka som retailer-koblet vertical farming-løp — kontrollgruppe for grossistbarriere-hypotesen.

### DRR-006 Spillvarme (Green Mountain–Hima m.fl.)
**Etablert og sterkest:** Hima/Rjukan operativ fase 1 høsten 2025 (1,75 MW testet, fase 2 vurderes til 8 MW, 800 m avstand, mål 8 000 tonn ørret/år — *mål*, ikke dagens produksjon). **Benchmark, ikke datasenter:** Frövi/Billerud (35 GWh/år industriell spillvarme, 100 000 m², 8 000 tonn tomater/år). **Uavklart:** Wiig/Klepp (forstudie sier 42 GWh/år og 55 °C, men ferdigattest/Enova-primærkilde ikke funnet — kill/valider via Klepp kommune + Enova er ren dokumentjakt); Kviamarka (plan; 492 GWh/år er *energiforbruk*, ikke nyttiggjort varme — viktig ikke-si); Varde/atNorth (§25-utkast, høring til 25.06.2026, WA3RM ute av prosjektet). **Parkert som matcase:** Polar DRA02 (ingen mottaker), men beste metodebenchmark for å skille elektrisk kapasitet fra nyttiggjort varme (57 MW vs. 9 MW). **NVE-krav** om kost-nytteanalyse for datasentre >2 MW (fra 01.04.2025) er en strukturell driver for hele sporet.

### DRR-007 100% Fish/marint restråstoff
**Etablert norsk baseline (SINTEF/FHF 2024):** 1 094 000 tonn tilgjengelig restråstoff, 976 000 utnyttet, 89 % total utnyttelse; men bare ~15 % av produktvolum til human konsum og ~66 % til fôr — skillet «utnyttet» vs. «høyverdiutnyttet» er nå tallfestet på norsk side. Sektortall: hvitfisk 72 %, pelagisk 100 %, havbruk 94 %, skalldyr 27 %; største enkeltgap er fritt blod fra laksefisk (34 300 tonn). **Svekket:** bokstavelig «100 %»-utnyttelse på Island (Matís: teoretisk mulig, ikke realistisk); IOC-claimen «>90 %» trenger metode/denominator. **Klar for uttrekk:** Statistics Iceland PxWeb-tabellene SJA09114 (biprodukter per art 1992–2024), SJA09110 og SJA04903 — identifisert men ikke ekstrahert. **Trygg slideformulering finnes ferdig i rapporten** (benchmark-only med claim-lock).

### DRR-008 Skottland/Polen (skal behandles separat)
**Skottland (benchmark-kandidat):** ZWS «Characterising fish processing by-products» (20.02.2025) er mest direkte kilde — fulltekst må hentes; sektorstudien estimerer 189 538 tonn fisk/skalldyr-sidestrømmer inkl. mortalitet (eldre, estimat); >27 mill. tonn bioressurser i SBMT-kartleggingen; CE-strategi 2026 + akvakulturvisjon gir policyspor; Scottish Ocean Cluster (ledet av Seafood Scotland, m/ZWS/IBioIC) er aktørbro men kun ambisjon dokumentert. Viktig negativfunn: Blue Economy-review sier offisiell marine-circularity-monitorering mangler. **Polen (watchlist):** GUS-baseline finnes (130,7 tusen tonn marine fangster 2024; akvakultur 36,0 tusen tonn 2023), PROM-matsvinn (4,84 mill. tonn/år) og governance-spor (CE-roadmap, NIK-audit «not fully effective») — men ingen sidestrømpilot med aktør+lokasjon+volum+output funnet. Kill-testen (GUS XLS, PROM fullrapport, CDR/SIR 2019, EMFAF-prosjektbase) er definert og er ren desk-research.

## 3. Hva dette betyr for deck og casekort

Rapportenes innhold bekrefter sprintboardets go/no-go-retninger og gir i tillegg ferdige trygge formuleringer: Valio-slide («soyafri governance, ikke importfritt»), distribusjons-slide («C-gate-formuleringen» i DRR-005 kap. 1), 100% Fish-slide (ferdig slidetekst + claim-lock i DRR-007 kap. 8), Hima-slide (operativ med datagap). Kaffe/kakao kan fylles som import-/EUDR-hypoteser med tallene over (med kildemerking «mottak, ikke importert kilde» til PCQ/source-shortlist-løftet er gjort). «Ikke si»-listene (10–12 punkter per case) bør konsolideres inn i claim-lock-tabellen ved neste kontrollerte oppdatering.

## 4. Prioritert desk-research-kø (kan gjøres nå, uten aktørkontakt)

Alt under er henting/ekstraksjon av offentlige kilder — innenfor gatene, ingen outreach. Hver leveranse går gjennom mottaksprotokollen (DRO/DRR-rad → ev. PCQ/source-shortlist).

| # | Oppgave | Case | Output | Kilde |
|---:|---|---|---|---|
| 1 | Ekstraher Statistics Iceland PxWeb: SJA09114 (biprodukter per art/type), SJA09110, SJA04903 | 100% Fish | Islandsk nåtids-tallgrunnlag som erstatter Matís 2014-tall | px.hagstofa.is |
| 2 | Hent ZWS-fulltekster: «Characterising fish processing by-products» (2025) + Biorefining Potential + sektorstudien | Skottland | Benchmark-kandidat bekreftes eller nedgraderes | zerowastescotland.org.uk |
| 3 | Trekk SSB/Comtrade-serie HS 090111/090121 for 2022–2025 (+ SE/DK/FI-parallell) | Kaffe | Slideklart kvantifisert nordisk eksponeringscase | SSB/WITS |
| 4 | Trekk Eurostat Comext/SSB HS1801–1806 fordelt på råbønner/masse/smør/pulver/sjokolade | Kakao | Reell nordisk kakaoeksponering via bearbeidede produkter | Eurostat/SSB |
| 5 | Trekk Ruokavirasto fôrimport-/produksjonsrapporter + Tulli/Uljas CN 2304/230641/230649/1205/071310 | Valio | Nasjonal fôrimport-kontekst som rammer inn governance-casen | ruokavirasto.fi / tulli.fi |
| 6 | Dokumentjakt Wiig: Klepp kommune-sak gnr/bnr 39/59 + Enova-tilsagn «Energioverføring fra datasenter til gartneri» | Spillvarme | Kill eller valider Wiig som operativt case | klepp.kommune.no / enova.no |
| 7 | Polen kill-test: GUS XLS, PROM fullrapport, CDR/SIR 2019 fulltekst, EMFAF-prosjektsøk (odpady/produkty uboczne/przetwórstwo ryb) | Polen | Watchlist bekreftes eller parkeres | stat.gov.pl m.fl. |
| 8 | Sjekk Konkurransetilsynet etter 01.05.2026: saker/høringer om grossisttilgang/god handelsskikk i frukt/grønt | Distribusjon | Regulatorisk primary check for C-gate | konkurransetilsynet.no |
| 9 | Varde-oppfølging etter høringsfrist 25.06.2026: endelig §25/lokalplan + ev. navngitt drivhusoperatør | Spillvarme | Benchmark-radar oppdateres | vardekommune.dk |
| 10 | Konsolider «ikke si»-listene fra alle 8 rapporter inn i claim-lock-tabellen (kontrollert oppdatering per protokoll) | Alle | Én autoritativ ikke-si-liste | denne analysen |

Rekkefølgen følger valideringskraft: 1–2 låser de to benchmark-sporene som allerede er «deckklart internt», 3–5 gjør import-/EUDR-casene kvantitative, 6–7 er kill-tester som rydder casekartet, 8–10 er kontrollvedlikehold.

## 5. Verifikasjon

Analysen bygger utelukkende på de åtte sikrede rapportene i `research/external/dro-0906/` (repo-sha256-hasher i README, kopiert fra Downloads 12.06 og Markdown-normalisert for whitespace), lest i sin helhet 12.06, samt mottaksloggen og sprintboardet. Ingen nye claims er løftet; alle statusord er identiske med mottaksloggens. Tall gjengitt her er rapportenes egne uttrekk og er IKKE selvstendig verifisert mot primærkildene — det er nettopp det desk-research-køen i kap. 4 skal gjøre. `git diff --check` kjørt rent.
