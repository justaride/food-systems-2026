---
tittel: Food TG R13 — Batchrapport 10
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 10
prompter: R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 10 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003 |
| park | 0 | — |
| aktørspørsmål | 0 | — |
| importer (PCQ) | 1 | R13-OKO-001 |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-INNO-007 | Offentlig innovasjonsetterspørsel: mat og kommunale piloter | enrich | source-shortlist | A (DFØ-veiledning, PLATON, Meld.St.28, NOU 2026:6) + B (Oslo kommune, LUP-nettsted) + C (Doffin, Forsvaret) | DFØ veiledning for lokalprodusert mat i offentlige anskaffelser, 2025 | Ingen verifisert LUP-case i mat; Doffin ikke systematisk søkt | vent |
| R13-OKO-001 | Økologisk areal og produksjon i Norge | enrich | PCQ | A (Debio, SSB, Landbruksdirektoratet, LMD, nasjonal strategi) + B (Økologisk Norge) | Debio Statistikkhefte 2025, mars 2026 | Import-vs-norsk produksjon i øko-omsetning ikke kvantifisert | **importer** |
| R13-OKO-002 | Agroøkologisk og regenerativ metrikk i Norge | enrich | forstaelse | A (NIBIO/NorSøk prosjektsider) + B (Regenerativt Norge) + C (nasjonal SOC-baseline, pollinatorindeks, EOV-antall) | NorSøk C-arouNd prosjektbeskrivelse, 2023 | NIBIO 3Q ikke verifisert fra primærkilde; nasjonal SOC-baseline eksisterer ikke | vent |
| R13-OKO-003 | Jordhelse og karbon i jord: måleprogrammer og baseline | enrich | PCQ | A (NID 2025/UNFCCC, NIBIO programbeskrivelser, 3Q) + B (CAPTURE, KARBONMAT, NSCM) + C (Klimakalkulator SOC-tall) | NIBIO JordVAAK programbeskrivelse, 2024–2026 | Ingen publisert nasjonal SOC-baseline; JordVAAK-resultat tidligst ~2036 | vent |

## Per-target outcome

### R13-INNO-007 — Offentlig innovasjonsetterspørsel: mat og kommunale piloter

**Beslutning:** enrich → source-shortlist (vent)

**Nøkkelfunn:**
- **LUP/Innovative anskaffelser:** Leverandørutviklingsprogrammet (NHO/KS/IN) har ingen mat-spesifikke cases i aktiv portefølje per juni 2026 (B-klasse, LUP-nettsted). DFØ (Direktoratet for forvaltning og økonomistyring) har publisert veiledning for lokalprodusert mat i offentlige anskaffelser (A-klasse, 2025) — dette er imidlertid veiledning, ikke et anskaffelsescase.
- **Oslo kommune — FUSILLI (2021–2024):** EU Horizon-finansiert prosjekt (H2020 nr. 101000622) for matbystrategier. Oslo var deltaker. Prosjektet er avsluttet. Handlingsplan for "bærekraftig, sunn og mer plantebasert mat" (2023, 46 tiltak) ble vedtatt, men politisk skifte okt. 2023 gjør implementeringsstatus uklar (C).
- **DFØ-veiledning (2025):** Klar A-kilde: DFØ har en kategorispesifikk veiledning for lokalprodusert mat og kortreist mat i offentlige innkjøp. Gir verktøy til innkjøpere, men er ikke et anskaffelsescase i seg selv.
- **Sykehusinnkjøp HF:** Ingen mat-innovasjon-cases verifisert fra primærkilde. Sykehusinnkjøp nevner samfunnsansvar/bærekraft generelt (B).
- **NOU 2026:6** ("Verdikjeden for frukt og grønt"): Anbefaler bruk av offentlige anskaffelser for å øke norsk frukt/grønt. Primærkilde, men er utredning, ikke implementert case.
- **Forsvaret, Doffin, Bærum/Lier-pilot:** Ikke verifisert fra primærkilder (C).

**Ikke si:** LUP har mat som aktiv satsingssektor; Oslos handlingsplan er fullt operativ; FUSILLI er pågående; EØS-regelverk tillater krav om lokalprodusert mat.

---

### R13-OKO-001 — Økologisk areal og produksjon i Norge

**Beslutning:** enrich → PCQ (**importer**)

**Nøkkelfunn:**
- **Øko-areal 2024:** 4,3 % av totalt jordbruksareal (kun godkjent, ekskl. karens) / 4,5 % (inkl. karens). Antall godkjente enheter (produsenter): 2 165 i 2024, ned fra 2 217 i 2023, ned fra topp ~2 700+ i 2011–2012 (A-klasse, Debio statistikk 2025).
- **Trend:** Vedvarende nedgang i produsentantall siden 2011–2012. Arealet har falt fra ~560 000 daa (2011, inkl. karens) til ~470 000 daa (2024). Negativ trendlinje.
- **15 %-mål (2020):** Ikke nådd, ikke nærmet. Målet ble stille skrinlagt.
- **10 %-mål (2032):** Vedtatt i Nasjonal strategi for økologisk jordbruk 2025–2032 (Stortingsflertall). Krever mer enn dobling av areal.
- **Øko-salg 2025:** +17,6 % vekst i dagligvare — men norsk produksjon henger etter. Øko-melkeleveranser gikk ned i 2025 mens øko-meieri-salg økte (Debio, Økologisk Norge). Importen øker.
- **Import-vs-norsk:** Ingen samlet offentlig statistikk skiller norskproduserte fra importerte øko-varer i markedsandel-tall. Systematisk C-celle.
- **Sterke A-kilder:** Debio statistikk, SSB tabell, Landbruksdirektoratets produksjonsrapport, nasjonal strategi. Egnet for PCQ-import med synlige tomme celler.

**Ikke si:** norsk øko-areal er på vei opp; Norge nærmer seg 10%-målet; 4,5% av matproduksjonen er økologisk; antall produsenter øker; norsk øko-salg tilsvarer norsk øko-produksjon.

---

### R13-OKO-002 — Agroøkologisk og regenerativ metrikk i Norge

**Beslutning:** enrich → forstaelse (vent)

**Nøkkelfunn:**
- **Ingen samlet nasjonal overvåking** av agroøkologiske eller regenerative metrikker eksisterer i Norge per 2026. Dette er et strukturelt gap, ikke en datainnhentingsfeil.
- **Jordhelse:** NorSøk driver C-arouNd (karbonlagring/SOC, 2023–2026) og K-BEP (karboninnhold eng/potet, 2021–2024). Begge prosjekter måler på forsøksareal — ingen nasjonal dekning. NIBIO JordVAAK (se OKO-003) adresserer dette, men resultater tidligst ~2036.
- **Biodiversitet:** NIBIO 3Q-programmet overvåker jordbrukslandskapet hvert 5. år (arealbruk, kanter, vann). 3Q inkluderer IKKE systematisk biodiversitetsinventar (floraer, pollinatorer, fugl). Ingen norsk nasjonal farmland bird index.
- **Jordkarbon:** Se OKO-003. Nasjonal SOC-baseline mangler for jordbruksjord.
- **Regenerativ metrikk:** Regenerativt Norge tilbyr EOV (Ecological Outcome Verification, Savory Institute-metode). Ingen offisiell norsk EOV-registrering eksisterer. Antall EOV-sertifiserte gårder i Norge: C.
- **REKORN** (NIBIO, løper til des. 2026): Forsker på regenerative dyrkingsmetoder i korn vs. soppsjukdommer — har ikke publisert SOC/jordhelsresultater per juni 2026.

**Ikke si:** det finnes et nasjonalt jordovervåkingsprogram for SOC på norsk landbruksjord; norske regenerative gårder er EOV-verifisert; REKORN konkluderer med noe; C-arouNd er representativt nasjonalt.

---

### R13-OKO-003 — Jordhelse og karbon i jord: måleprogrammer og baseline i Norge

**Beslutning:** enrich → PCQ (vent)

**Nøkkelfunn:**
- **JordVAAK** (NIBIO, 2024–2026): Nytt nasjonalt jordovervåkingsprogram for jordbruksjord. Første prøvetaking i gang. Første tilstandsanalyse tidligst ~2036 (etter 10 år med 5-årig intervall). Ingen baseline publisert per juni 2026.
- **NSCM** (National Soil Carbon Monitoring, NIBIO, 2023–): Overvåker SOC i skog og eng. Data samles inn, men ingen resultater publisert.
- **UNFCCC/NID 2025:** Norges nasjonale klimainventar rapporterer karbonendringer i jordbruksjord via Tier 1 (standard IPCC-faktorer) / Tier 2 (nasjonale emisjonsfaktorer via ICBM-modell). Alt er modellert, ikke direktemålt. ICBM-modell krever jordsmonnskart — 39 % av norsk jordbruksareal mangler fullverdig jordsmonnskart.
- **NIBIO jordsmonnskart:** 61 % dekning av norsk jordbruksareal per 2024. Organisk materiale-kartlegging tilgjengelig for dette arealet (A-klasse).
- **Klimasmart landbruk / Klimakalkulatoren:** Verktøy for gårdsnivå karbonregnskap. Basert på ICBM-modell, ikke felt-SOC-måling. Brukes av ~700 norske gårdsbruk (B-klasse).
- **CAPTURE-prosjektet** (NIBIO-ledert, 2020–2024): Forsøksbaserte SOC-målinger, men ikke representativt for nasjonalt nivå.
- **KARBONMAT** (Ruralis): Analyser av markedsbasert karbonfinansiering for norsk landbruk — konseptdokument, ikke implementert.

**Ikke si:** Norge har en nasjonal SOC-baseline; Klimakalkulatoren måler jordkarbon; modellerte NID-karbontall er målt karbon; Bionova finansierer SOC-kredittering; EU CRCF gjelder norsk jordbruk per 2026.

---

## Oppfølgingspunkter

- **INNO-007**: Sjekk LUP/Innovative anskaffelser direkte for mat-IPP-cases (søk i arkiv). Søk systematisk i Doffin for "mat" + "innovativ anskaffelse". Kontakt Oslo Bymiljøetatens mat-koordinator for FUSILLI-implementeringsstatus.
- **OKO-001**: Importer med synlige tomme celler — i særlig grad skillet godkjent/karens og import-vs-norsk i salgsstatistikk. Hent Landbruksdirektoratets produksjonsrapport 2026 (PDF) for volume per kategori.
- **OKO-002**: Bruk som arbeidskart/forstaelse-dokument; ikke siterbar. Kontakt NIBIO 3Q-team for biodiversitetsdetaljer. Kontakt Regenerativt Norge for EOV-antall i Norge.
- **OKO-003**: Vent til JordVAAK publiserer første tilstandsdata (tidligst 2029). Bruk NIBIO jordsmonnskart for organisk materiale-dekning som midlertidig proxy. Kontakt NIBIO for NSCM-tidslinje.
- **OKO-001 er første prompt i hele R13 med importDecision: importer** — primærkilder sterke nok for PCQ-import med caveats.
- Ingen av batch-10-outputene åpner ekstern claim eller whitepaper-stemme.
