---
tittel: "Innsiktsmotor T1-T5 — kjøring mot baseline v0.3 og 8 batches"
status: utkast
eier: Gabriel
dato: 2026-04-30
fase: 3
input: nordisk-circularity-baseline-v0.3.json + batch 1-8
formaal: "Generere innsikter prosessen ikke ville sett uten strukturert teknikk-anvendelse. Kjernen i 'formen på prosjektet' Jan Thomas etterlyste."
---

# Innsiktsmotor T1-T5

Fem teknikker anvendt på baseline v0.3 + batch-notatene. Output mates direkte inn i Fase 4 syntese.

---

## T1 — Cross-tabulation matrise (5 land × 8 tema, score 1-5)

**Skåringsregel:** 1 = svakest/lavest/dårligst på dimensjonen i nordisk kontekst; 5 = sterkest/høyest/best. Skåringen er **relativ** (rangering innen Norden), ikke absolutt.

| Tema | NO | SE | DK | FI | IS |
|---|---:|---:|---:|---:|---:|
| **A. Importert fôr (lav importavhengighet)** | 1 | 3 | 2 | 4 | 3 |
| **B. Matsvinn (lav per capita + reell trend)** | 4 | 2 | 1 | 5 | n/a |
| **C. Biogass (kapasitet + ambisjon)** | 1 | 3 | 5 | 3 | 1 |
| **D. Økologisk (markedstrend, ikke UAA)** | 4 | 2 | 5 | 2 | 1 |
| **E. Fiskeutnyttelse (høyverdi, ikke utnyttelse)** | 3 | 1 | 4 | 1 | 5 |
| **F. Off. innkjøp + skolemåltid** | 1 | 3 | 5 | 4 | 1 |
| **G. Markedsmakt (lav konsentrasjon + sterk regulering)** | 3 | 2 | 4 | 5 | 2 |
| **H. Beredskap (institusjonell, ikke kalorisk)** | 2 | 2 | 5 | 5 | 1 |

### Mønstre fra T1

**Tomme kolonner / tema ingen mestrer:**
- *Ingen tema scorer <2 hos alle.* Hver land har minst én styrke.

**Ekstreme outliers:**
- **DK 5 på 4 tema (C, D, E, F, H)** — sterkeste land totalt, drevet av institusjonell modenhet (CO2-avgift, Trepartsaftale, Kalundborg, København).
- **NO 1 på 3 tema (A, C, F)** — svakest totalt, dominert av fôr-importavhengighet, lav biogass, ingen offentlig innkjøp-systematikk.
- **IS 1 på 4 tema (C, D, F, H)** — utenfor sentrale virkemiddel-paletter, men 5 på fiskeutnyttelse.

**Negative korrelasjoner (uventede):**
- **SE: høyest UAA-økologisk (16,7%) + 2 på markedstrend** = struktur uten marked.
- **NO: 4 på matsvinn-trend + 1 på offentlig innkjøp** = bransjeavtale virker, men ingen institusjonell kjøpermakt.
- **FI: 5 på matsvinn + 5 på markedsmakt-regulering + 5 på beredskap, men 2 på økologisk-marked** = systemet virker bortsett fra øko-marked som faller.
- **DK: 5 på biogass + 5 på økologisk + 1 på matsvinn-per-cap** = matprosessindustri-paradoks (eksport-orientert genererer matsvinn).

**Diagonalmønster:** Ingen land scorer 5 på alle 8 tema. Hver foregangs-status er **avhengig av spesifikk virkemiddel-design**, ikke generell "modenhet".

---

## T2 — AI-flagging av motsigelser

Strukturert lesning av baseline + batches for å finne påstander som motsier hverandre eller skaper spenning. **10 motsigelser identifisert:**

### M1: NO selvforsyning vs fôrimport
- **Påstand A:** "Norge har 47% kalorisk selvforsyning, mål 50% innen 2030."
- **Påstand B:** "92% av fiskefôr-ingredienser importert; 80% av kjøttproduksjon avhenger av importert soya/mais."
- **Spenning:** Selvforsyning er metodologisk fiksjon hvis fôret regnes som "norsk kjøtt".

### M2: NO øko-tilbud vs etterspørsel
- **Påstand A:** "Norsk øko-andel lav fordi etterspørselen er lav."
- **Påstand B:** Landbruksdirektoratet 2025: "ikke nok øko-melk for å møte etterspørselen" (80% utnyttelse, 88% øko-egg, +17,6% YoY grocery sales).
- **Spenning:** Direkte motsi av populært narrativ.

### M3: NO matsvinn-suksess vs husholdning
- **Påstand A:** "Norge ligger an til 50%-mål 2030 (-24% siden 2015)."
- **Påstand B:** Husholdning -5 til -18%; primærleddet ekskludert; bransjeavtale dekker bare 3 av 6 ledd.
- **Spenning:** Aggregert success-narrativ skjuler ledd-asymmetri.

### M4: SE øko-leder vs fallende marked
- **Påstand A:** "Sverige er nordisk øko-leder (16,7% UAA)."
- **Påstand B:** Øko-melk -39% siden 2021, øko-egg laveste siden 2010, total -1,5% 2024, offentlig sektor 37→34,2%.
- **Spenning:** Lagging-indikator (UAA) versus leading-indikator (marked).

### M5: DK selvforsyning vs sporbarhet
- **Påstand A:** "Danmark er Europas matkjøkken, 300% kalorisk selvforsyning."
- **Påstand B:** 1,2-1,7 mill t soyamel importert, 6% fysisk sporbar.
- **Spenning:** Eksport-suksess hviler på import-blackbox.

### M6: DK CO2-avgift radikal vs effektiv kost
- **Påstand A:** "Verdens første nasjonale CO2-avgift på jordbruk: 300 DKK/t (2030) → 750 (2035)."
- **Påstand B:** 60% basisfradrag → effektiv kost 120 DKK/t (2030) → 300 (2035).
- **Spenning:** Headline-radikal, effektiv-moderat.

### M7: NO konkurransehåndheving vs konsentrasjon
- **Påstand A:** "NOK 4,9 mrd bot på de 3 store + ny markedsetterforskningstjeneste = sterkeste håndheving i Norden."
- **Påstand B:** HHI 3327 (korr. fra 3445; FI ~3662 kan være høyere — DRO-R4-25). Strukturen uendret etter sanksjon.
- **Spenning:** Reaktiv straff endrer ikke struktur.

### M8: IS matsikkerhet vs Kornax-tap
- **Påstand A:** "Island er blant verdens mest matsikre land (per ICS-rangering)."
- **Påstand B:** Eneste innenlandske kornmølle demontert april 2025 pga havne-leieavtale.
- **Spenning:** Korttidsdrift trumfer strategisk infrastruktur.

### M9: FI matsvinn lavt vs målusikkerhet
- **Påstand A:** "FI husholdning 22 kg/cap — lavest i Norden."
- **Påstand B:** Total-estimater varierer 400-641 kt avhengig av metode (60% usikkerhet).
- **Spenning:** Sammenligning villedende uten harmonisert metode.

### M10: NO fiskeutnyttelse 89% vs høyverdi 7%
- **Påstand A:** "NO utnytter 89% av marint restråstoff (1,094 mill t)."
- **Påstand B:** Kun ~70 kt går til humant konsum (7%); 312 kt fôr; 94 kt biogass/energi; 123,8 kt K2/dødfisk.
- **Spenning:** Utnyttelse ≠ høyverdi; kaskade-prinsipp brytes.

### M11: DK biogass 17x NO vs industristruktur
- **Påstand A:** "Danmark har 175 anlegg, 8 100 GWh biogass — 41% av nasjonalt gassforbruk."
- **Påstand B:** Hovedinput er husdyrgjødsel (40% meieri + 30% svin). Mens DK politisk vil REDUSERE husdyrproduksjon (CO2-avgift).
- **Spenning:** Klimapolitikk vs biogass-input. Reduserer DK husdyr → reduserer biogass-input → reduserer grønn gass-mål.

### M12: SE skolemåltid 1948 vs øko-fall
- **Påstand A:** "SE har universelt skolemåltidsystem siden 1948 — 78 års tradisjon."
- **Påstand B:** Offentlig sektor øko-andel falt fra 37% (2022) til 34,2% (2023).
- **Spenning:** Lang tradisjon ≠ kontinuerlig progresjon. Politisk vilje kan flippe.

### Motsigelses-tetthet per land:
- **NO: 5** (M1, M2, M3, M7, M10) — flest motsigelser; "selvforsyning" og "offentlig sektor" som svake regulatoriske ankerpunkter.
- **DK: 4** (M5, M6, M11, og som del av M9) — eksport-orientering driver paradokser.
- **SE: 2** (M4, M12) — tilbake fra peak.
- **FI: 1** (M9) — internt konsistent system, men lider av målemetode.
- **IS: 1** (M8) — strukturell sårbarhet ikke politisk debatt.

---

## T3 — Ekstern-vs-intern diff

**Status: ikke utført i denne kjøringen.** Krever Jan Thomas' eksterne ChatGPT/Perplexity-uttak side-om-side. **Forberedt som åpen handlingen før Fase 5 (rapport-skriving):** be Jan Thomas dele de fem prompt-uttakene fra møtet 29.04, så kjøre hver påstand mot baseline v0.3 og produsere en diskrepans-tabell.

**Forventet utbytte:** 5-15 påstander vi enten kan replisere (validerer både plattform og ekstern), ikke kan replisere (datagap eller ekstern feil), eller har som ekstern ikke har (vår merverdi).

---

## T4 — Auto-genererte spørsmål fra datakontraster

For hver kombinasjon der to land har >2x avstand på en metrikk, genererte vi spørsmål. **Topp 15 spørsmål etter relevans:**

| # | Spørsmål | Datagrunnlag | Hva svaret kan endre |
|---|---|---|---|
| 1 | Hvorfor er DK biogass 17x NO når begge har stort husdyrhold? | DK 8 100 GWh / NO 470 GWh; DK 20-år FiT, NO Bionova fra 2023 | Politisk virkemiddel-design, ikke biomasse |
| 2 | Hvorfor faller SE øko-melk -39% siden 2021 mens DK foodservice øker +13%? | SE 295 200 t (-18% YoY); DK DKK 3,7 mrd (+13%) | Statlig støtte vs privat sektor-pull |
| 3 | Hvorfor må NO importere 92% fiskefôr mens FI bygger Solar Foods/Enifer? | NO Nofima 2020; FI 3 aktører, USD 390M VC | Industripolitikk og risikovillig kapital |
| 4 | Hvorfor har FI 6x lavere husholdningsmatsvinn enn DK? | FI 22 kg/cap; DK 41 kg/cap | Måling, kultur, eller industristruktur? |
| 5 | Hvorfor er NO HHI 96,6% mens DK CR3 er 87% — på lignende geografi/befolkning? | NO Dagligvaretilsynet; DK KFST | Reguleringshistorie og eierstruktur |
| 6 | Hvorfor har FI ~46% S-Group dominans mens 30%-regelen utløser presumpsjon ved 30%? | Konkurranseloven §4a; KKV | Hvor effektiv er regelen i praksis? |
| 7 | Hvorfor utnytter IS 90% av cod mens NO bare 7% av restråstoff til humant konsum? | Icelandic Ocean Cluster; SINTEF/FHF 2024 | 100% Fish-program-modell vs ad hoc-utnyttelse |
| 8 | Hvorfor har DK soya 6% fysisk sporbarhet når sertifikat-systemet finnes? | IFRO/KU 2025 | Massebalanse vs fysisk separasjon-økonomi |
| 9 | Hvorfor unntok NO regjeringen soya fra delvis EØS-EUDR i 2026-01-09-høring? | Regjeringen.no høring; Landbruksdirektoratet FAQ | Politisk kalkulasjon vs handelspolitisk realisme |
| 10 | Hvorfor er København 84% øko mens NO ikke har universell skolemåltid? | verdikjede.ts DK; ingen NO-data | Sosialpolitisk historikk + landbruks-eksportposisjon |
| 11 | Hvorfor er SE 13% øko-egg laveste siden 2010 når UAA-andel fortsatt er nordisk-høyest? | Jordbruksverket | Forbrukerprisseffekt eller endret regulering? |
| 12 | Hvorfor demonteres Kornax-mølla i IS midt i geopolitisk usikkerhet? | Iceland Review; Faxaflóahafnir | Korttidsdrift + areal-konkurranse |
| 13 | Hvorfor er FI Solar Foods bare 160 t/yr kapasitet etter 5 års drift? | Solar Foods | Skalering-kompleksitet, EFSA-godkjenning, marked |
| 14 | Hvorfor er NO matsvinn -42% i detaljhandel men kun -5% i husholdning? | NORSUS, Matvett 2024 | Ledd-spesifikk virkemiddel-design |
| 15 | Hvorfor har NO 96,6% CR3 og samtidig OECD PSE 59%? | Konkurransetilsynet, OECD 2025 | Politisk ekvilibrium: høy støtte + høy konsentrasjon = stabilt system |

**Spørsmålene matet inn i rapport-strukturen:** Hvert spørsmål kan bli én underseksjon i §2 (Foregangsområder per land) eller §4 (Tverr-nordisk læring). Ikke alle skal besvares — noen skal stå som **"åpne spørsmål for transition-gruppa"**.

---

## T5 — Negativ-rom-analyse mot Nordic Vision 2030

Sammenligning av Vision 2030-indicator-map (45 indikatorer) mot baseline v0.3 + batch-notatene.

### Vi har sterk dekning på (5 indikatorer):
1. **1.4.2 Organic agricultural land share** — DB-integrert via CountryMetric
2. **2.5.2 Imports from Nordic countries** — DB-integrert
3. **1.1.1 Territorial GHG emissions** — partial
4. **1.3.2 Municipal waste recycling rate** — partial
5. **3.1.2 Self-rated health (kosthold-proxy)** — NORMO/NNR i DB

### Vi supplementer Vision 2030 med (7 indikatorer Vision ikke har):
1. **HICP matpris per land** (mattilgang)
2. **Matvaregruppeimport** (importavhengighet per kategori)
3. **Selvforsyning per land** (resilient matsystem)
4. **HHI og retailer share** (markedsstruktur — IKKE direkte i NMR)
5. **Matsvinn per capita per ledd** (finere granularitet)
6. **Private label / EMV** (makt, sortiment)
7. **Verdikjede-flaskehalser** (forklarer hvorfor brede mål stopper)

### Vi har gap mot Vision 2030 på (7 indikatorer):
1. **1.1.2 Consumption-based GHG emissions** — KRITISK
2. **1.3.1 Material footprint per inhabitant** — medium
3. **1.5.2 Baltic Sea eutrophication load** — KRITISK for marin sirkularitet
4. **1.5.3 Arctic and Barents fish stock status** — KRITISK
5. **1.4.3 Agricultural landscape bird index** — biodiversitet
6. **2.2.2 Circular/bioeconomy employment share** — sysselsetting
7. **3.3.2 Risk of poverty / food affordability** — sosial bærekraft

### Innsikt fra T5: hvor bidrar vi mest?

**Dimensjoner Vision 2030 ikke fanger godt:**
- **Markedsstruktur** (HHI, EMV, eierkonsentrasjon) — vår største merverdi
- **Verdikjede-asymmetrier** (per ledd, per aktør) — vår analytiske dybde
- **Politisk-ekonomisk paradoks** (NO PSE 59% + HHI 96,6% sammen)

**Vision 2030-fokus vi bør overlate til NMR:**
- Klima-aggregat (1.1.x)
- Bred biodiversitet (1.4.3)
- Generell helse (3.1.x)

**Konklusjon for rapportens §6:** Avgrensning ikke nødvendigvis svakhet. Vi skal eksplisitt si: "Vi komplementerer Vision 2030 ved å gi LANDsspesifikk + VERDIKJEDESPESIFIKK + AKTØRNÆR forklaring på hvorfor brede Vision-mål lykkes eller stopper. Vi erstatter ikke aggregat-monitorering."

---

## Syntese: hva har T1-T5 generert som vi ikke ville sett ellers?

**5 unike innsikter direkte fra prosessen:**

1. **NO scorer 1 på 3 av 8 tema (T1)** — strukturell svakhet ikke synlig fra enkeltindikatorer.
2. **DK biogass-suksess + DK CO2-avgift på husdyr = motsetning (T2 M11)** — internt klimapolitisk paradoks ingen rapport vi har funnet adresserer.
3. **Spørsmål 15 fra T4** — NO HHI 96,6% + PSE 59% = stabilt politisk ekvilibrium. Hvorfor endrer vi ikke matsystemet? Fordi det fungerer for de aktørene som har makt.
4. **5 motsigelser konsentrert hos NO (T2)** — flest selvforsyning/regulering-paradokser. NO har dypest gap mellom retorikk og data i Norden.
5. **Vision 2030 og vår plattform er **strukturelt komplementære** (T5)** — vi gjør LANDsspesifikt og verdikjedespesifikt, NMR gjør aggregat. Begge nødvendige.

**Til Fase 4 syntese:**
- T1 cross-tab er anker for §2 (Foregangsområder per land).
- T2 motsigelser er primær input til §3 (Cognitive dissonance).
- T4 spørsmål er kandidater til §4 (Tverr-nordisk læring).
- T5 er direkte input til §6 (Avgrensning mot Nordic Vision 2030).
- T3 (ekstern-diff) gjøres når Jan Thomas deler eksterne uttak.
