---
tittel: Nordisk dekningsgap-analyse — Documents per land × Food TG-tema
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-05-11
neste_handling: Prioriter kilde-akkvisisjon per identifisert kritisk gap. Mål: tett Food TG-kjernetemaer i SE/DK før Q4 2026 Oslo Summit.
relaterte_filer:
  - docs/project/mandates/food-transition-group-mandate-2026-04-21.md
  - docs/project/mandates/plan-for-tg-food-2026-05-11.md
  - research/norden/nordic-source-registry.csv
  - research/norden/nordic-vision-2030-source-status-2026-04-29.csv
---

# Nordisk dekningsgap-analyse — 2026-05-11

**Bakgrunn:** Datakatalogen er NO-tung. For at plattformen skal være troverdig som *nordisk* underlag (Q4 2026 Oslo Summit, M5 White Paper 2027) må SE/DK/FI/IS-dekningen tette de viktigste hullene først.

**Metode:** FTS-baserte tema-spørringer (Postgres `search_vector @@ tsquery`) mot `Document` per land for de seks operative Food TG-temaene.

---

## 1. Coverage-matrise

| Tema | NO | SE | DK | FI | IS | Nordic-tagg |
|---|---:|---:|---:|---:|---:|---:|
| **A: Sirkulært fôr / importavhengighet** | 9 | **0** 🔴 | **0** 🔴 | 2 | **0** 🔴 | 34 |
| **B: Sidestrømmer / matsvinn** | 10 | 1 🟡 | 4 | 2 | **0** 🔴 | 63 |
| **C: Adopsjon / policy / regulering** | 47 | 4 🟡 | **0** 🔴 | 3 🟡 | 2 | 83 |
| **D: Markedsmakt / dagligvare** | 19 | 5 | 9 | 1 🟡 | 2 | 63 |
| **E: Selvforsyning / beredskap** | 10 | 2 🟡 | 1 🟡 | **0** 🔴 | **0** 🔴 | 33 |
| **F: Sirkulær økonomi / R-ladder** | 7 | **0** 🔴 | **0** 🔴 | 2 | **0** 🔴 | 38 |

**Documents totalt per land:** NO 115 · SE 22 · DK 18 · FI 14 · IS 5 · Nordic 153.

**Aktør-dekning (Actor-tabellen):** NO 81 · SE 31 · DK 31 · FI 23 · IS 7. SE har bredest forskningsbase (8 research + 8 corporate), IS minst.

> **Bunnlinje:** Dagens "Nordisk" status er **3 svake gap-områder × 4 land = 12 røde celler**. Det er ikke holdbart for ekstern lansering.

### Progresjon 2026-05-18 — 6 kilder registrert (gap-tetting runde 1)

Følgende kilder er **registrert** i `src/lib/data/sources.ts` (src-171 til src-176) men ikke ennå Document-ingested. Tetter de mest kritiske gapene i §2:

| Gap (§2) | Kilde | src-ID | Status |
|---|---|---|---|
| 🔴 #1 DK adopsjon | KFST Salling-Coop afgørelse 2025-03-26 | src-171 | registered |
| 🔴 #1 DK adopsjon | KFST OK-Coop afgørelse 2024-06-26 | src-172 | registered |
| 🔴 #3 FI selvforsyning | Luke Food Balance Sheet 2024 | src-173 | registered (datasett) |
| 🔴 #3 FI selvforsyning + beredskap | NESA Food and Water 2030 | src-174 | registered |
| 🔴 #2 SE sirkulært fôr | SLU Karimi et al. (2019) vinasse-fungi | src-175 | registered |
| 🟡 SE adopsjon/policy | Jordbruksverket Livsmedelsstrategi Rapport 2024:3 | src-176 | registered |

**Gjenstår per gap-celle:**
- DK adopsjon: 0 → 2 registrert (gap fra "0 docs" til "2 url-only"). Mål: 10+.
- FI selvforsyning: 0 → 2 registrert. Mål: 5+. 
- SE sirkulært fôr: 0 → 1 registrert. Mål: 3+. SEGES, RISE, Jordbruksverket "Cirkulär foderråvaror"-rapport står igjen.
- DK sirkulært fôr: 0. Mål: 3+. SEGES Innovation, DTU Aqua, GUDP står igjen.
- IS sirkulært fôr: 0. Mål: 2+. MAST, Háskóli Íslands, 100% Fish står igjen.

**Neste runde-prioritet:** DK SEGES + DTU Aqua, IS MAST + 100% Fish, klimarådet.dk + folketinget.dk (krever whitelist-utvidelse for fetch).

---

## 2. Topp 5 prioriterte gap (Q4 2026-relevans)

### 🔴 #1 — DK: Adopsjon/policy/regulering (0 docs)

**Hvorfor kritisk:** Salling-Coop-fusjonen er den største nordiske dagligvarehendelsen 2024-2025. Vi har kun annual reports og fusjonsanalyse, ingen klassifisert som `policy`/`regulatory`. KFST's avgjørelser, Folketinget-debatter og Klimarådet-anbefalinger må inn.

**Konkrete kilder å hente:**
- Konkurrence- og Forbrugerstyrelsen (KFST): https://www.kfst.dk/ — alle dagligvare-relaterte beslutninger 2022-2025
- Klimarådet: https://klimaraadet.dk/ — anbefalinger om matsystem 2023-2025
- Folketingets miljø- og fødevareudvalg — beretninger 2024-2025
- Konkurrencerådets afgørelse om Salling Group/Coop (sak 2024-X-Y)
- ML-rapport om CO2-avgift på landbruk (Danmark er ledende globalt)

### 🔴 #2 — SE/DK/IS: Sirkulært fôr (0 docs hver)

**Hvorfor kritisk:** Spor A i Food TG-planen. Uten SE/DK-evidens kan ikke "Nordisk" sirkulært fôr-analyse holde vann.

**Konkrete kilder å hente:**

- **SE:**
  - SLU (Sveriges lantbruksuniversitet) — Fôrråvarer forskningsrapporter
  - Jordbruksverket "Cirkulär foderråvaror" rapporter
  - RISE: BlueShift, Insectaria, akvakulturfôr-prosjekter
- **DK:**
  - SEGES Innovation — sirkulær fôrproduksjon
  - DTU Aqua — fiskeavfall til fôr
  - GUDP-finansierte fôr-prosjekter (Grønt Udviklings- og Demonstrationsprogram)
- **IS:**
  - Matvælastofnun (MAST) — fôrkrav-rapporter
  - Háskóli Íslands — masteroppgaver om akvakulturfôr

### 🔴 #3 — FI: Selvforsyning/beredskap (0 docs)

**Hvorfor kritisk:** **Finland er den nordiske lederen på matsikkerhet og beredskap** (NESA / Huoltovarmuuskeskus). Vi har 10 NO-docs men null FI — det er den motsatte sannheten av virkeligheten. Genuin pinlig.

**Konkrete kilder å hente:**
- Huoltovarmuuskeskus (NESA): National Emergency Supply Strategy: Food and Water 2030 — allerede nevnt i KILDEREGISTER, ikke importert
- Maa- ja metsätalousministeriö (MMM): Ruoka2030-strategi (vi har 2017-versjon, mangler 2024-oppdatering)
- Luke (Natural Resources Institute Finland): Food Balance Sheet 2023 + 2024
- VTT: Food security under crisis 2023-2024-rapporter

### 🔴 #4 — IS: Komplett dekning (5 docs totalt)

**Hvorfor kritisk:** Island er liten men relevant, særlig for sjømat/akvakultur og sirkulær økonomi (geotermisk drevet matproduksjon, 100% Fish-prosjektet).

**Konkrete kilder å hente:**
- Háskóli Íslands — landbruks- og matvitenskap masteroppgaver
- MATÍS — næringsmiddelforskning (matvarekvalitet, biotech)
- Samkeppniseftirlitið (konkurransemyndigheten) — beslutninger 2023-2025 (vi har én årsrapport)
- 100% Fish-prosjektet (Iceland Ocean Cluster) — output-rapporter
- Government Organic Action Plan 2024 (vi har den i `text/`-formatet i evidence-pack/okologisk-norden, men ikke i Document)

### 🟡 #5 — SE/DK/IS: Sirkulær økonomi/R-ladder (0 docs hver)

**Hvorfor viktig:** Spor B+C krever rammeverk. NO har R9, andre land har egne ekvivalenter som vi mangler.

**Konkrete kilder å hente:**
- **SE:** Naturvårdsverket "Cirkulär ekonomi i livsmedelssystemet" + Delegationen för cirkulär ekonomi
- **DK:** Miljøstyrelsen "Cirkulær økonomi i fødevarer", IDA Cirkulær
- **IS:** Stjórnarráð Íslands — sirkulær økonomi-strategi

---

## 3. Hva som ER der allerede (eksisterende backlog å aktivere)

Vi har **~189 kilder i strukturerte backlog-CSVer** som ikke er i Document-DB ennå:

| Backlog | Rader | Status |
|---|---:|---|
| `nordic-source-registry.csv` | 100 | Eurostat/SSB-style stat-kilder, mest "ready" |
| `okologisk-source-queue-2026-04-29.csv` | 31 | Økologisk landbruk per land |
| `notat-analyser-source-import-queue-2026-04-29.csv` | 33 | Akademiske notater/analyser |
| `nordic-vision-2030-source-status-2026-04-29.csv` | 12 | Nordic Council vision-dokumenter |
| `_plans/data-source-targets-2026-04-29.csv` | 19 | Statistisk data-targets |
| **TOTALT** | **195** | Klar for aktivering, ikke importert |

**Quickest gap-tetting:** Kjør faktisk import av disse backlog-CSVene før ny akkvisisjon — vi har sannsynligvis 50+ relevante SE/DK/FI/IS-dokumenter klare som bare ikke har blitt importert til Documents.

---

## 4. Anbefalt rekkefølge for de neste 4 ukene

### Uke 1 (denne uka)
- **Aktiver eksisterende backlog:** Importér Vision-2030 (12 kilder) + Okologisk-norden (allerede laster ned i evidence-pack, må kobles til Document)
- **Kvantifiser:** Lag teller-script som rapporterer SE/DK/FI/IS-coverage før/etter hver import-batch

### Uke 2 — DK adopsjon-tetting
- KFST decisions-import (sannsynligvis 5-10 docs)
- Klimarådet 2023-2025-rapporter (3-5 docs)
- Folketinget-relaterte (2-3 docs)
- **Mål:** DK adopsjon/policy 0 → 10+

### Uke 3 — FI selvforsyning + adopsjon
- NESA strategy 2030 + Luke Food Balance 2023/2024
- Ruoka2030 oppdatert versjon
- KKV-decisions
- **Mål:** FI selvforsyning 0 → 5, adopsjon 3 → 8

### Uke 4 — SE/DK/IS sirkulært fôr (Spor A-prioritet)
- SLU + Jordbruksverket
- SEGES + DTU Aqua + GUDP
- MAST + 100% Fish
- **Mål:** SE/DK/IS sirkulært fôr 0 → 3+ hver

---

## 5. Suksesskriterier

Etter 4 uker bør matrisen se slik ut:

| Tema | NO | SE | DK | FI | IS | Mål-status |
|---|---:|---:|---:|---:|---:|---|
| A: Sirkulært fôr | 9 | **3+** | **3+** | **4+** | **2+** | Spor A bærer |
| B: Sidestrømmer | 10 | **3+** | 4 | **3+** | **2+** | Spor B bærer |
| C: Adopsjon | 47 | **8+** | **10+** | **8+** | **5+** | Policy holder |
| D: Markedsmakt | 19 | 5 | 9 | **3+** | 2 | OK som er |
| E: Selvforsyning | 10 | **3+** | **3+** | **5+** | **2+** | FI = leder, ikke null |
| F: Sirkulær økonomi | 7 | **3+** | **3+** | **3+** | **2+** | Rammeverk-bånd |

**Konkret testbart kriterium:** Ingen tema-celle bør være < 2 docs for nordiske land. Nordic-tag bør være > land-spesifikk dekning (regional perspektiv vinner).

---

*Generert via Postgres FTS-spørringer mot Documents 2026-05-11. Kjør samme query (se appendiks i `research/_status/nordic-coverage-matrix-queries.sql`) etter hver import-batch for å spore progresjon.*
