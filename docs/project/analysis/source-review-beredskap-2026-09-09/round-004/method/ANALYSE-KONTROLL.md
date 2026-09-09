# Kritisk kontroll av kornanalysen

9. september 2026. Separat agentkontroll av kode, tester og bevarte lokale kildebytes. Ingen nye kilder, modellestimater eller endringer i analysescriptet.

**Konklusjon:** Påstanden kan brukes med eksplisitt varekode- og baselineforbehold: «I det avgrensede panelet var produksjonen i alle åtte land–vare-serier lavere i 2018 enn seriens eget gjennomsnitt for 2015–2017. Norsk hvete bruker C1110 gjennom hele perioden; svensk, dansk og finsk hvete bruker C1100. Bygg bruker C1300 i alle fire land.» Dette er ikke åtte identisk definerte vareserier, et samlet nordisk volum, kausal klimaeffekt eller dokumentert leveringssvikt.

Ingen P0/P1-funn som underkjenner denne avgrensede produksjonspåstanden. Ett P2-funn gjelder videre bruk på flaggede data.

## Reproduserte produksjonstall

Uavhengig koordinatoppslag ble gjort direkte fra JSON-stat-dimensjonenes posisjoner, uten å bruke scriptets `decode`. Baseline og prosentendring ble rekalkulert fra originale produksjonsceller.

| Land | Serie | Baseline 2015–2017, tusen tonn | 2018, tusen tonn | Endring |
|---|---|---:|---:|---:|
| Norge | Hvete C1110 | 397,020 | 136,07 | −65,73 % |
| Norge | Bygg C1300 | 566,530 | 435,73 | −23,09 % |
| Sverige | Hvete C1100 | 3 146,867 | 1 620,30 | −48,51 % |
| Sverige | Bygg C1300 | 1 615,133 | 1 094,40 | −32,24 % |
| Danmark | Hvete C1100 | 4 634,017 | 2 623,93 | −43,38 % |
| Danmark | Bygg C1300 | 3 886,903 | 3 445,17 | −11,36 % |
| Finland | Hvete C1100 | 884,207 | 501,60 | −43,27 % |
| Finland | Bygg C1300 | 1 555,080 | 1 353,19 | −12,98 % |

Alle 48 produksjonsceller i det brukte panelet er utfylte og uten statusflagg. De 12 svenske produksjonskontrollene ble regnet på nytt fra SCBs direkte respons: høst+vår for hvete og bygg i hvert av seks år. Alle matcher Eurostat nøyaktig på oppgitt tonn-nivå. Dette er konsistens mellom beslektede offentlige rapporteringsstrømmer, ikke uavhengig replikasjon eller generell bekreftelse av samme kategoriomfang i andre land/år.

## Funn med prioritet

### P2 — Tidsseriebrudd påvirker ikke om en kontrast beregnes

I `scripts/analyze-beredskap-cereals.py` linje 94–96 bevares status i lokator og global warning, men linje 121–127 beregner baseline og prosentendring fra alle numeriske verdier uten å kvalifisere kontrasten etter flagg. Reprodusert i minne ved å sette status `b` (tidsseriebrudd) på svensk hveteproduksjon i 2015: 2018-kontrasten forblir −48,51068788000763 %, og selve kontrasten har ingen flagg-/sammenlignbarhetsstatus. Warning finnes fortsatt i hovedresultatet.

Før gjenbruk på nye flaggede serier: behold råverdien, men gi kontrasten eksplisitt status med års-/måleflagg. Et brudd som krysser baseline krever enten harmonisering eller at prosentkontrasten holdes tilbake. Andre flagg, som foreløpig eller estimert verdi, bør få en erklært policy; de skal ikke nødvendigvis behandles likt som tidsseriebrudd. Dagens produksjonsserier er uflaggede og berøres ikke av dette funnet.

### P3 — Kjernetolkningen mangler faste regresjonstester

De ti medfølgende testene passerer. De kontrollerer decoder og `change`, men tester ikke `analyze`-grenen for norsk C1110 gjennom seks år, baseline 2015–2017, manglende baselinecelle eller forholdet mellom rapportert og beregnet avling. Disse delene ble kontrollert direkte i denne agentgjennomgangen, men kontrollen bør bli en liten fast test før scriptet brukes på flere pakker. Ingen produksjonskode er endret av reviewer.

## Kontroller og avgrensninger

- Hele `analyze`-returverdien ble replisert og sammenlignet likt med bevart `analysis-run-001/analysis.json`, bortsett fra kildebindingsfeltet som CLI legger til. Begge kildefilers manifesthasher stemmer.
- Norsk hvete bruker C1110 for alle seks år. De tolv manglende C1100-cellene for Norge i 2018–2020 er fortsatt synlige i `missing_original_total_wheat_cells`; ingen år er skjøtt mellom koder.
- En produksjonscelle fra baseline ble fjernet i en minnekopi. Baseline og prosentendring ble da `null`, uten bruk av toårs-gjennomsnitt eller nullerstatning. Originaler er urørt.
- `derived_yield_t_ha` er rekalkulert som produksjon/areal for alle 48 poster. Både teller og nevner har tusen-skala, så kvotienten gir tonn/hektar. Den må omtales som beregnet kvotient. Den er ikke automatisk identisk med rapportert avling eller et kausalt avlingsestimat.
- Rapportert avling er bevart. Åtte forhold faller utenfor scriptets konservative avrundingskonvolutt, og dansk hvete mangler rapportert avling i 2015. Dette gir ni warnings. Beregnet P/A erstatter ikke originalfeltene. Avvikets årsak kan være definisjon, avrunding, revisjon eller rapportering og er ikke avklart her.
- Baseline for beregnet avling er gjennomsnittet av tre årlige P/A-forhold, i samsvar med erklært uvektet årsbaseline. Dette er forskjellig fra summert produksjon/summert areal; ingen additiv dekomponering av produksjonsendring er dokumentert.
- Alle brukte fuktceller er 14 %. Scriptet stopper ved annen eller manglende fuktbasis. Det er en avgrenset inputkontrakt, ikke en generell fuktnormalisering.
- 2019 og 2020 bruker samme baseline og står separat. Verken etterfølgende oppgang eller de åtte negative 2018-kontrastene dokumenterer årsak, sannsynlighet, eksportkapasitet, matkvalitet eller nordisk merverdi.

## Eksakte kontrollerte versjoner

Private kilde-/resultatfiler ligger under `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-004/`.

| Artefakt | SHA-256 |
|---|---|
| analysescript | `31e1f75334b11549ca22637bf20afccf8c7730e44fd071d5ed8e0cc2de3b4e3d` |
| testscript | `5c13c07a1f8e62ba3b58350c4e051a1b37910966777d623491247b5ec4a6acef` |
| analysis-run-001/analysis.json | `f4d55ccec19009df7b679b60f3b45a5bd4463e0520b68d0bf9ee068e98b543a9` |
| scb-crosscheck.json | `7878f024e4f961687f76565c862985dda30cfa55952ccf4169e67f4edb448e5d` |
| eurostat/panel-response.json | `a91101d823537347924e1129df2d32c02d573eafc63bf3e927425774ad1a7d1d` |
| eurostat/norway-common-wheat-response.json | `16cba9088974cd33a0d7072f1b78f377091927522c44800d8484eb09631e9033` |

Dette er lokal kode- og analysekontroll utført av en annen agent i samme kjøring. Uavhengig modellidentitet, menneskelig review, CI, produksjon og publisering er ikke attestert.
