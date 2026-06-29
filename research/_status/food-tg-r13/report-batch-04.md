---
tittel: Food TG R13 — Batchrapport 04
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 04
prompter: R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 04 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007 |
| park | 0 | — |
| actor-gate | 0 | — |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-WASTE-006 | Kaffegrut og urbane sidestrømmer | enrich | source-shortlist | A for SSB-total; B/C for kaffegrut-spesifikk | SSB Avfallsregnskapet 2024 (primær) | Konversjonsfaktor brent kaffe → SCG er internasjonal litteratur; NKI-ankertall har formatfeil; ingen HORECA-data | vent |
| R13-WASTE-008 | Prevention-tiltak med baseline | enrich | source-shortlist | A med gaps | NORSUS/Matvett OR.30.25 + OR.27.25 (primær) | Ingen isolert prevention (R1) effekt dokumentert per tiltak; ingen RCT; prevention/redistribusjon ikke separert i statistikk | vent |
| R13-PROT-006 | Soya/SPC-erstatning i fôr | enrich | PCQ | A for 2020; B for 2022–2025; C for nye ingredienser post-2020 | Nofima/FHF Ressursregnskap 2020 (Aas m.fl. 2022) | Ingen offentlig disaggregert ressursregnskap etter 2020; post-2020 tall er fragmentarisk aktørrapportert | vent |
| R13-PROT-007 | Proteinselvforsyning Norge | enrich | PCQ | A med C-hull | NIBIO/Helsedirektoratet 'Utviklingen i norsk kosthold 2025' | Ingen offisiell protein-spesifikk selvforsyningsserie (gram); fôrkorrigert ekskluderer fiskefôr | vent |

## Per-target outcome

### R13-WASTE-006 — Kaffegrut og urbane sidestrømmer

**Beslutning:** enrich → source-shortlist (vent)

**Kilder verifisert:**
- SSB Avfallsregnskapet 2024 (primær): 607 000 tonn total våtorganisk avfall — kaffegrut ikke skilt ut som fraksjon.
- Kaffeimport ~42 587 tonn brent kaffe-ekvivalent (2024) — NKI-tall, B. SSB 08801 API ikke kjørt i denne batchen.
- Estimert tørr SCG: 23 000–28 000 tonn/år (dobbelt avledet, høy usikkerhet, B).
- Estimert vått SCG: 70 000–84 000 tonn/år (avledet fra import × litteraturfaktor, B).
- Gruten AS: ~12 tonn kaffegrut/år til soppdyrking (R5) — marginalt volum.
- Miljødirektoratet: påbud om utsortering av matavfall fra næring gjelder fra jan 2025, inkl. HORECA; etterlevelse ikke dokumentert.

**Utfall:** Norsk SCG-volum kan estimeres som B, men ingen separat nasjonal fraksjon finnes. Mesteparten behandles som del av matavfall (biogass/kompost, R3/R9). HORECA-data er C. Gate: source-shortlist; hold til SSB 08801 API verifiseres og HORECA-etterlevelse kartlegges.

**Ikke si:** NKI-tallet "42 587 150 tonn" bokstavelig, at Oslo genererer 10 tonn/dag (journalistisk 2017-kilde), at Gruten håndterer stor skala, at HORECA kildesorterer kaffegrut (udokumentert).

---

### R13-WASTE-008 — Prevention-tiltak med baseline

**Beslutning:** enrich → source-shortlist (vent)

**Kilder verifisert:**
- NORSUS/Matvett OR.27.25 + OR.30.25 (primær, A): gir pre-post sektorbaseline (2015/2017 → 2024). Dagligvare –47 %, servering –30,6 % (deltakerrapportert, B-element).
- KuttMatsvinn2020/Servering (Matvett): norsk programanker med måling og rapportering, men effekt er blandingsintervensjon uten kontrollgruppe.
- Nordic Council of Ministers Nord 2024:034 (primær, A): bred nordisk tiltaks- og barrierestruktur; ingen harmonisert per-tiltak effektmåling.
- EU JRC Behavioural factors (JRC133003, primær, A): metodeanker for baseline-krav og evalueringskvalitet.
- Matsvinnloven (Lovdata 2025-06-20, primær, A): vedtatt juni 2025; strukturelt tiltak (due diligence, rapporteringsplikt, kortdatert mat); ingen effektdata ennå.
- WRAP Courtauld 2025 (primær, A): UK-referanse med dokumentert baseline og 18 % per capita food waste reduksjon 2015–2025.
- EEA Norway Waste Prevention Factsheet 2025 (primær, A): norsk profil, men effektmål ikke disaggregert per tiltak.

**Utfall:** Sterkeste nordiske kildegrunnlag for prevention-struktur, men ingen isolert R1-effekt dokumentert per tiltak med kontrollgruppe. Effektpåstand krever baseline + metode + kontroll. Gate: source-shortlist — importer som tiltak- og metodekø, med PCQ per tallfestet effektutsagn.

**Ikke si:** at enkelt-tiltak gir X % reduksjon, at dagligvares 47 % skyldes prevention (redistribusjon inkludert), at Matsvinnutvalgets 75 %-potensial er empirisk dokumentert.

---

### R13-PROT-006 — Soya/SPC-erstatning i fôr

**Beslutning:** enrich → PCQ (vent)

**Kilder verifisert:**
- Nofima/FHF Ressursregnskap 2020 (Aas m.fl. 2022, primær, A): siste offentlige disaggregerte fôr-ingrediensregnskap. SPC ~21 %, fiskemjøl ~12 %, hvetegluten ~13 %, rapsolje ~14 % av fôr (vektbasis 2020).
- Fiskemjøl redusert fra ~65 % (1990) til ~12 % (2020). SPC som primær soya-erstatning siden 2000-tallet.
- Denofa (Fredrikstad): eneste norske SPC-produsent; all SPC ProTerra/RTRS-sertifisert, non-GMO (aktørkilde, B).
- Landbruksdirektoratet kraftfôrstatistikk (A): soyamel til husdyr nær halvert 2013–2022 (>200 000 t → 113 283 t), erstattet med rapspellets. 95 % av proteinråvarer i husdyrkraftfôr er importert (2025).
- Nye ingredienser (insekt, SCP, kyllingbiprodukter): kommersielt i oppstart; 0,4 % av laksefôrvolum i 2020. Ingen offentlig ressursregnskap etter 2020.

**Utfall:** A-kildegrunnlag finnes kun for 2020 (Nofima/FHF). Post-2020 er fragmentarisk. Sertifisert ≠ avskogingsfri. Gate: PCQ — vent til nyere ressursregnskap foreligger eller aktørdata kan verifiseres.

**Ikke si:** at soya er erstattet i norsk fiskefôr, at sertifisert soya er avskogingsfri, at insekt/SCP erstatter soya, at eksakte prosenttall for 2023/2024 fôrsammensetning er offentlig.

---

### R13-PROT-007 — Proteinselvforsyning Norge

**Beslutning:** enrich → PCQ (vent)

**Kilder verifisert:**
- NIBIO/Helsedirektoratet 'Utviklingen i norsk kosthold 2025' (primær, A): rå selvforsyningsgrad 41,3 % (2024, foreløpig), fôrkorrigert 34,9 % (2024). Energibasis.
- Landbruksdirektoratets kraftfôrstatistikk (primær, A): 95 % av proteinråvarer i husdyrkraftfôr importert (2025). Soyamel halvert 2013–2022, erstattet av rapspellets (fortsatt import).
- Metodehull bekreftet: fôrkorrigert selvforsyning korrigerer kun for husdyrkraftfôr — fiskefôr (SPC, fiskemel, rapsolje til laks) er IKKE inkludert. Underestimerer reell importavhengighet.
- Protein-spesifikk selvforsyning (gram/capita): ingen offisiell norsk serie — C-hull.
- FAO FAOSTAT norsk protein supply: ikke kjørt i denne batchen.
- Matsystemutvalget (NOU-rapport ventes 2026): to delrapporter overlevert mars 2026; full NOU ikke tilgjengelig.

**Utfall:** Metodeskillet rå/fôrkorrigert er godt dokumentert (A). Proteinselvforsyning som gram-serie mangler offisiell beregning (C). Fiskefôr-hulllet er strukturelt. Gate: PCQ — aktørspørsmål til NIBIO om protein-gram-serie, og til Landbruksdirektoratet om akvakulturfôr-korreksjon.

**Ikke si:** at Norge er X % selvforsynt med protein (uten metodeetikett), at fôrkorrigert er 35 % for alle matvarer inkl. fisk, at Matsystemutvalget har konkludert.

---

## Oppfølgingspunkter

- **WASTE-006**: Kjør SSB 08801 API for kaffeimport 2024 (HS0901) for å erstatte NKI B-ankertall med A. Kartlegg HORECA-etterlevelse av utsorteringskrav (jan 2025) via Miljødirektoratets tilsynsdata.
- **WASTE-008**: Klar for PCQ av hvert tallfestet effektutsagn i prevention-katalogen (særlig servering 30,6 % og WRAP-tallene). Nordic Council Nord 2024:034 fulltekst bør hentes.
- **PROT-006**: Vent på nyere Nofima/FHF ressursregnskap (2022/2023 ventes). Akvakulturselskapers bærekraftrapporter (Mowi, SalMar, Lerøy) kan gi B-klasse ingrediensmix.
- **PROT-007**: Aktørspørsmål til NIBIO om protein-gram-serie eksisterer uoffisielt. Sjekk FAO FAOSTAT Norway protein supply (kg/capita/day). Vent på Matsystemutvalgets NOU (2026).
- Ingen av batch-04-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
