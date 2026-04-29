# Media source review round 1

Dato: 2026-04-29  
Input: P1 `candidate_fetch` fra `media-source-candidates-2026-04-29.csv`  
Output: 14 snapshots i `research/bibliotek/media/snapshots/`

## Status

Alle P1-kandidatene i foerste maskinelle hente-runde ga HTTP 200 og er lagret som korte research-snapshots. PDF-kilder er ikke kopiert inn som fulltekst; de er registrert som PDF-snapshots og maa gjennom PDF-katalog/SourceDoc-sporet foer import.

## Viktigste innsikter

### Norge

- Konkurransetilsynets dagligvarehub gir et bredere operativt bilde enn dagens enkeltentry om prisjegere: prisjeger-saken, medieuttalelser om prisendringer, faste prisendringsvinduer, negative servitutter, marginer, innkjopspriser og lokal etableringskonkurranse ligger som separate arbeidsspor.
- NHH/S-WoBA-kilden gjoer medieomtale til et eget markedsfenomen: forbrukerjournalistikk og prissammenligninger kan paavirke prisatferd, ikke bare beskrive den.
- Riksrevisjonens matsikkerhetsrapport forankrer beredskapssporet i areal, importavhengighet, foerraavarer, selvforsyningsevne og manglende planforutsetninger.

Foreslaatt neste koding: splitt Norge i minst tre entries: `competition-workstream`, `consumer-journalism-price-effect`, `preparedness-audit`.

### Sverige

- Konkurrensverket-huben peker paa en samlet, flerleddet konkurranseanalyse av livsmedelsbranschen, ikke bare en enkelt 2024-rapport.
- Axfood/City Gross-kilden gir bransjens egen konsolideringsfortelling: oppkjopet framstilles som konkurransestyrkende i stormarkedssegmentet.
- Livsmedelsstrategin 2.0 flytter svensk media-/policyspor fra pris alene til produksjon, konkurransekraft og maalbar robusthet.

Foreslaatt neste koding: behold baade myndighetsfunn og corporate counter-frame for Axfood/City Gross, slik at Sverige ikke bare blir en myndighetsprofil.

### Danmark

- KFSTs Salling/Coop-PDF er en konkret lokal konkurransecase med butikkportefolje, nasjonale markedsandeler og lokale problemomraader.
- KFSTs mars 2025-mote med dagligvarekjedene legger til et nytt prispress-spor: digitale verktøy, algoritmisk prissetting, informasjonsgrunnlag og forhandlingsstyrke.
- USDA GAIN Denmark er nyttig som ekstern markedsstrukturkryssjekk, men maa behandles som sekundær sammenligningskilde.

Foreslaatt neste koding: Denmark trenger minst ett entry for digital prissetting og ett for lokal fusjonskontroll.

### Finland

- KKV/FCCA-kilden peker paa prisoverforing og marginstruktur i matkjeden som finsk hovedinngang til prispress.
- PTY-kilden gir den reneste tallbasen for finsk duopolstruktur og 2024-markedsandeler.

Foreslaatt neste koding: kombiner `price-transmission-study` og `duopoly-market-structure`, og hent deretter Kesko/S Group-respons som bransjecounter-frame.

### Island

- Samkeppniseftirlitid/Festi-Lyfja viser at islandsk konkurranseanalyse og betingede godkjenninger ogsaa berorer dagligvare-/retail-naere markeder.
- Hagar-rapporten gir markedslederens egen 2024/25-kontekst, men dette maa kryssjekkes mot en mer direkte grocery-market source.

Foreslaatt neste koding: Island trenger fortsatt eksakt myndighets-/markedsrapport for dagligvarekonsentrasjon. Dagens Festi/Lyfja-kilde kan brukes som adjacent concentration evidence, ikke som hovedbevis for matvaremarkedet.

## Importkandidater etter review

Prioriter disse foer neste `media-corpus.ts`-utvidelse:

1. `no-kt-dagligvaremarkedet-2020` som hub/arbeidsspor-entry for norsk konkurransetilsyn.
2. `no-nhh-media-attention-2025` som metode-/theme-entry for medieoppmerksomhet og prisatferd.
3. `no-riksrevisjonen-matsikkerhet-2024` som beredskap-entry.
4. `se-konkurrensverket-food-knowledge-2025` som svensk myndighets-hub.
5. `se-axfood-citygross-acquires-2024` som bransje/corporate counter-frame.
6. `se-regeringen-livsmedelsstrategi-2025` som svensk beredskap/produksjonsstrategi.
7. `dk-kfst-price-policy-2025` som digital prissetting/algoritme-entry.
8. `dk-kfst-salling-coop-pdf-2025` som fusjonskontroll-entry.
9. `fi-kkv-food-market-study-2023` som prisoverfoering-entry.
10. `fi-pty-grocery-market-2024` som markedsstruktur-entry.
11. `is-samkeppni-festi-lyfja-2024` bare som adjacent retail concentration until better source is found.
12. `is-hagar-management-2024-25` som corporate context, ikke som uavhengig verifikasjon.

## Ikke importer direkte ennaa

- Paywallkilder i koen skal bare metadata-registreres foer eventuell manuell tilgang.
- PDF-kilder skal kobles mot PDF-katalogen og eventuelle `SourceDoc`-rader foer app-import.
- 2026-kilder skal bli i `watch_2026` til et delaar er lukket eller media-sidens metode endres.

## Neste arbeidsrunde

1. Kjor P2-runde for `candidate_fetch` og `existing_backlog`.
2. Lag manuell metadatafil for `candidate_manual`-kilder.
3. Finn eksakt islandsk grocery-konsentrasjonsrapport, ikke bare rapportoversikt.
4. Bygg en review-CSV med `decision`, `proposed_entry_id`, `verification_level`, `tone`, `frame`, `confidence`.
5. Importer bare godkjente rows til `src/lib/data/media-corpus.ts` og re-kjor media-audit.
