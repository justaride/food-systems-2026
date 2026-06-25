# Food TG Research OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repo-local Food TG Research OS with a masterplan, promptpack, machine-readable backlog, and mottaksprotokoll that can run new research without depending on JT dataunderlag.

**Architecture:** This is a documentation-and-control artifact slice. The masterplan defines themes and sequencing, the backlog CSV is the machine-readable source of prompt IDs, the promptpack carries the human-executable prompts, and the mottaksprotokoll defines how outputs enter the existing source-shortlist / PCQ / claim-lock flow.

**Tech Stack:** Markdown control documents, CSV backlog, existing Food TG research conventions (`research/external/r*`, DRO/R5-style mottakslogger, source-shortlist, PCQ, claim-lock, overclaim gates).

---

## File Structure

- Create: `docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md`
  - Purpose: one readable strategy document for the independent research round.
- Create: `docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md`
  - Purpose: executable prompt library grouped by ten theme areas.
- Create: `research/_status/food-tg-research-backlog-2026-06-24.csv`
  - Purpose: machine-readable list of the same prompts with priority, gate, expected output, and target artifact.
- Create: `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md`
  - Purpose: receiving and control protocol for prompt outputs.
- Reference only: `docs/superpowers/specs/2026-06-24-food-tg-research-os-design.md`
  - Purpose: approved design; do not edit unless scope changes.

## Canonical Prompt ID Set

The promptpack and CSV must contain exactly these 50 IDs:

```text
R12-VALUE-001
R12-VALUE-002
R12-VALUE-003
R12-VALUE-004
R12-VALUE-005
R12-RES-001
R12-RES-002
R12-RES-003
R12-RES-004
R12-RES-005
R12-FEED-001
R12-FEED-002
R12-FEED-003
R12-FEED-004
R12-FEED-005
R12-WASTE-001
R12-WASTE-002
R12-WASTE-003
R12-WASTE-004
R12-WASTE-005
R12-ACTOR-001
R12-ACTOR-002
R12-ACTOR-003
R12-ACTOR-004
R12-ACTOR-005
R12-DIST-001
R12-DIST-002
R12-DIST-003
R12-DIST-004
R12-DIST-005
R12-FARM-001
R12-FARM-002
R12-FARM-003
R12-FARM-004
R12-FARM-005
R12-TRUE-001
R12-TRUE-002
R12-TRUE-003
R12-TRUE-004
R12-TRUE-005
R12-GOV-001
R12-GOV-002
R12-GOV-003
R12-GOV-004
R12-GOV-005
R12-VIZ-001
R12-VIZ-002
R12-VIZ-003
R12-VIZ-004
R12-VIZ-005
```

---

### Task 1: Create The Masterplan

**Files:**
- Create: `docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md`
- Reference: `docs/superpowers/specs/2026-06-24-food-tg-research-os-design.md`

- [ ] **Step 1: Write the masterplan file**

Use `apply_patch` to create the file. Include exactly these sections:

```markdown
---
tittel: Food TG — Research OS / Runde 12 masterplan
status: Intern arbeidsplan — åpner ingen claims
eier: Gabriel
dato: 2026-06-24
scope: Uavhengig researchprosess for underlag, kartlegginger, lister og oversikter uten avhengighet til JT-dataunderlag.
bruksregel: Ingen output fra denne planen blir ekstern faktastemme uten mottak, source-shortlist, PCQ, claim-lock og overclaim-vurdering.
relaterte_filer:
  - docs/superpowers/specs/2026-06-24-food-tg-research-os-design.md
  - docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md
  - research/_status/food-tg-research-backlog-2026-06-24.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
---

# Food TG — Research OS / Runde 12 masterplan

## 1. Hvorfor denne runden finnes

## 2. Prinsipper

## 3. Temaunivers

## 4. Prioriteringslogikk

## 5. Rundeformat

## 6. Output-typer

## 7. Tema-for-tema arbeidskart

## 8. Første kjørerekkefølge

## 9. Stop-regler

## 10. Ferdigkriterier
```

Populate the sections with the following non-negotiable points:

- State that the work explicitly does not wait for JT dataunderlag.
- State that the correct unit of work is one narrow prompt at a time.
- Define the ten themes from the spec.
- Define priority levels:
  - `P0`: known overclaim/freshness risk, decided blind spot, or claim-lock candidate.
  - `P1`: important whitepaper/deck underlag or high-value type-C finding.
  - `P2`: breadth, atlas, or later model enrichment.
- Define output types:
  - `datasok`
  - `forstaelse`
  - `kartlegging`
  - `datagap`
  - `visualiseringsunderlag`
- Define the first recommended run order:
  1. P0 freshness/overclaim cleanup prompts.
  2. N11 / bondeøkonomi follow-ups.
  3. ledd-profile prompts for import and sidestrøm.
  4. actor/practitioner mapping prompts.
  5. true-cost and visualization prompts.

- [ ] **Step 2: Verify masterplan content**

Run:

```bash
rg -n "JT-dataunderlag|Temaunivers|P0|datasok|Stop-regler" docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md
```

Expected: every searched phrase appears at least once.

---

### Task 2: Create The Backlog CSV

**Files:**
- Create: `research/_status/food-tg-research-backlog-2026-06-24.csv`

- [ ] **Step 1: Create the CSV with canonical header**

Use `apply_patch` to create the CSV. The header must be exactly:

```csv
id,theme,priority,question,geo,source_target,expected_output,primary_source_hint,known_caveat,gate,next_artifact,status
```

- [ ] **Step 2: Add 50 rows matching the canonical IDs**

Use these row definitions. Keep quotes around fields with commas.

```csv
R12-VALUE-001,value-chain,P0,"Lag ledd-profil for importleddet i Norge: viktigste mat-/fôr-/innsatsvarestrømmer, sårbarhet og datagap",NO,"official trade/statistics","ledd-profil table with A/B/C evidence","SSB 08801, Landbruksdirektoratet, NIBIO","registrer kilde per celle; ikke bland verdi/volum","PCQ","research/external/r12/","planned"
R12-VALUE-002,value-chain,P1,"Lag ledd-profil for primærproduksjon i Norge med produksjon, selvforsyning, innsatsvarer og sårbarhet",NO,"official agriculture statistics","ledd-profil table","NIBIO, Helsedirektoratet, Landbruksdirektoratet","skille rå selvforsyning og fôrkorrigert metode","PCQ","research/external/r12/","planned"
R12-VALUE-003,value-chain,P1,"Lag ledd-profil for prosessering/foredling: kapasitet, konsentrasjon, importerte råvarer og waste",NO,"industry and official sources","processing profile","Konkurransetilsynet, årsrapporter, Landbruksdirektoratet","konsentrasjon er struktur, ikke intensjon","PCQ","research/external/r12/","planned"
R12-VALUE-004,value-chain,P1,"Lag ledd-profil for distribusjon og grossistledd med aktører, flaskehalser og alternative kanaler",NO,"public procurement and market reports","distribution profile","KT, Doffin, Menon, company annual reports","ASKO/HORECA-andeler må merkes aktørrapportert hvis ikke uavhengig","PCQ","research/external/r12/","planned"
R12-VALUE-005,value-chain,P2,"Lag nordisk sammenligning av ledd-profiler: hvilke land kan lære hva av hverandre",Nordic,"official national statistics","comparative matrix","Nordic statistical agencies","metoder ikke harmonisert; noter hvert avvik","source-shortlist","research/external/r12/","planned"
R12-RES-001,resilience,P0,"Kartlegg fôrkorrigert selvforsyning og metodeforskjeller i Norden",Nordic,"official food security statistics","method comparison table","NIBIO/Helsedirektoratet, Nordic agencies","offisiell fôrkorrigert metode finnes trolig bare NO","PCQ","research/external/r12/","planned"
R12-RES-002,resilience,P0,"Kartlegg beredskapslager for korn, fôr og gjødsel i nordiske land: mål vs realisert",Nordic,"government preparedness docs","stockpile matrix","LMD, Totalberedskapsmeldingen, nordiske beredskapsmyndigheter","klassifisert tonnasje skal stå som C","PCQ","research/external/r12/","planned"
R12-RES-003,resilience,P1,"Kartlegg kritiske importnoder for norsk matsystem: fosfat, fôrprotein, fiskeolje, soya, kaffe og kakao",NO,"trade/statistics","critical import node table","SSB 08801, Comtrade as secondary, EU sources","sekundær speilkilde skal ikke bli primær","PCQ","research/external/r12/","planned"
R12-RES-004,resilience,P1,"Finn hvilke lokale/korte verdikjeder faktisk øker forsyningssikkerhet, ikke bare lokal identitet",NO,"research + case evidence","evidence memo","NIBIO, Ruralis, Økologisk Norge, local food reports","ikke bruk lokal = resilient uten mekanisme","source-shortlist","research/external/r12/","planned"
R12-RES-005,resilience,P2,"Kartlegg transport-, havn-, lager- og kaldkjede-sårbarheter for mat i Norden",Nordic,"infrastructure/beredskap docs","risk inventory","DSB, NFD, nordiske transportmyndigheter","kan bli for bred; noter kun matrelevante noder","source-shortlist","research/external/r12/","planned"
R12-FEED-001,feed-inputs,P0,"Finn primærkilde for norsk fiskeoljeimport fra Mauritania 2020-2025",NO,"SSB 08801/PxWeb","time series with HS codes and caveat","SSB tabell 08801","Senegal/Gambia/sardinella forblir type C hvis ikke primærserie finnes","PCQ","research/external/r12/","planned"
R12-FEED-002,feed-inputs,P0,"Kartlegg norsk fôrimportavhengighet per kjøttslag og akvakultur med metode- og kildeetikett",NO,"official agriculture and aquaculture stats","species/feed dependency table","Animalia, NIBIO, Landbruksdirektoratet, Nofima/FHF","ikke bland kraftfôr, proteinfraksjon og total fôrkurv","PCQ","research/external/r12/","planned"
R12-FEED-003,feed-inputs,P1,"Lag aktørledger for alternative nordiske fôrproteiner: realisert volum, kapasitet, plan og tomme celler",Nordic,"company/project primary docs","actor ledger","company releases, funding databases, public project pages","kapasitet er ikke realisert produksjon","source-shortlist","research/external/r12/","planned"
R12-FEED-004,feed-inputs,P1,"Kartlegg soya/SPC-koder, sluttbruk og åpne type-C-hull for norsk fôr",NO,"customs nomenclature and trade stats","code and gap memo","TARIC, SSB, Landbruksdirektoratet","SPC er ikke HS 2304; sluttbrukssplitt kan være C","PCQ","research/external/r12/","planned"
R12-FEED-005,feed-inputs,P2,"Kartlegg musling, tang og tare som nordisk protein-/fôrråvare: realisert vs pilot vs hypotese",Nordic,"research and project docs","technology readiness table","FHF, Nofima, Nordic project databases","ikke volumclaim uten primærkilde","source-shortlist","research/external/r12/","planned"
R12-WASTE-001,waste-r9,P0,"Kartlegg marint restråstoff etter R-stige: humant konsum, fôr, energi, eksport og datagap",NO,"SINTEF/FHF/Nofima","R-ladder table","SINTEF/FHF, Nofima 33/2025","utnyttet er ikke høyverdi","PCQ","research/external/r12/","planned"
R12-WASTE-002,waste-r9,P0,"Kartlegg oppdrettsslam: modellerte utslipp, faktisk innsamlet volum, behandling og type-C-hull",NO,"official permits/research","mass balance memo","FHF, Statsforvalter permits, Mattilsynet","modellert utslipp er ikke innsamlet volum","PCQ","research/external/r12/","planned"
R12-WASTE-003,waste-r9,P1,"Kartlegg nasjonal digestat-næringsretur i Norden: N/P/K realisert eller ikke målt",Nordic,"biogas certification/statistics","NPK return matrix","Avfall Sverige SPCR 120, national biogas sources","kun SE kan være A; andre kan være C","PCQ","research/external/r12/","planned"
R12-WASTE-004,waste-r9,P1,"Kartlegg kaffegrut og andre urbane matavfallstrømmer: massestrøm, dagens bruk og realistisk R-nivå",NO,"waste and consumption stats","waste stream memo","SSB, municipal waste sources, actor docs","avledet estimat må merkes som avledet","source-shortlist","research/external/r12/","planned"
R12-WASTE-005,waste-r9,P2,"Lag katalog over nordiske prevention-tiltak mot matsvinn før waste oppstår",Nordic,"policy and intervention studies","prevention catalogue","Matvett, EU, Nordic councils","prevention-effekt krever målt baseline","source-shortlist","research/external/r12/","planned"
R12-ACTOR-001,actor-map,P0,"Utvid regenerativ/lokalmat/permakultur-kartleggingen med norske markedshager og småskala grøntprodusenter",NO,"registries and web lists","candidate actor CSV","Markedshager Norge, Småskala Grønt Norge, NLR","stub default unverified unless primary locator","actor-gate","research/_status/","planned"
R12-ACTOR-002,actor-map,P1,"Kartlegg REKO Norge 2025/2026: ringer, produsenter, kunder og organisering",NO,"REKO annual docs/primary pages","actor/status memo","REKO Norge årsmøte/årsmelding if available","2022-tall er siste sikre hvis nyere ikke finnes","source-shortlist","research/external/r12/","planned"
R12-ACTOR-003,actor-map,P1,"Kartlegg andelslandbruk i drift etter 2023 med status per gård og kilde",NO,"CSA maps and org pages","actor list","Økologisk Norge, andelslandbruk.no","80-90 er anslag hvis ikke primær telling","actor-gate","research/_status/","planned"
R12-ACTOR-004,actor-map,P1,"Kartlegg KVANN, skogshage, flerårige vekster og frøbevaringsnettverk videre fra 19.06-notatet",NO,"org pages and project pages","network map memo","KVANN, NIBIO genressurssenter, Solhatt","Multistrata EU-status disputed til GA/prosjekt-ID finnes","actor-gate","research/external/r12/","planned"
R12-ACTOR-005,actor-map,P2,"Lag nordisk kontekstkart for regenerativt/permakultur/lokalmat som kun tar med noder med norsk kobling",Nordic,"org/project pages","Nordic context list","NordGen, SESAM, Frøsamlerne, Nordic networks","ikke voks til globalt atlas","actor-gate","research/_status/","planned"
R12-DIST-001,distribution,P0,"Verifiser ASKO/HORECA-andeler mot uavhengige kilder eller nedgrader til aktørrapportert",NO,"competition and procurement sources","verification memo","KT, Menon, Doffin, ASKO primary","ikke presenter 70 prosent som uavhengig fakta","PCQ","research/external/r12/","planned"
R12-DIST-002,distribution,P0,"Kartlegg offentlige matkontrakter som alternativ kanal: hvem vinner rammeavtaler regionalt",NO,"Doffin/anskaffelser","regional procurement table","Doffin, RIIK, fylkeskommuner, kommuner","nasjonal andel kan være B hvis ikke beregnet","PCQ","research/external/r12/","planned"
R12-DIST-003,distribution,P1,"Kartlegg EMV-andel og leverandørmakt i Norden med primærkilder per land",Nordic,"market/competition authorities","EMV comparison table","SCB, KKV, SØA, USDA as secondary","DK kan være sekundær-estimat","source-shortlist","research/external/r12/","planned"
R12-DIST-004,distribution,P1,"Kartlegg grossistgate for frukt/grønt og CEA-aktører: hvilke nye produsenter når hvilke kjeder",NO,"actor pages and procurement docs","gate evidence ledger","company pages, press releases, procurement docs","gate er struktur, ikke bevist nekt","source-shortlist","research/external/r12/","planned"
R12-DIST-005,distribution,P2,"Kartlegg leaseback/eiendom som etableringsbarriere i dagligvare med regnskap og selskapsstruktur",NO,"annual accounts and registry","property mechanism memo","Brreg/regnskap, annual reports","interne leiestrømmer kan være delvis estimert","source-shortlist","research/external/r12/","planned"
R12-FARM-001,farm-economy,P0,"Fullfør N11 bondemargin med per-produksjonstype skvis og BFJ/NIBIO-tabeller",NO,"BFJ/NIBIO primary","margin pressure table","Totalkalkylen UT-1-2026, NIBIO","normalisert kalkyle er ikke faktisk driftsregnskap","PCQ","research/external/r12/","planned"
R12-FARM-002,farm-economy,P0,"Spesifiser aktørgate for per-kg-margin etter kjøperprisavtale i kjøtt og meieri",NO,"actor data requirement","AASK brief","TINE, Nortura, KLF, producer orgs","ikke desk-research hvis data er aktørgate","actor-gate","docs/project/mandates/","planned"
R12-FARM-003,farm-economy,P1,"Kartlegg gjødselsjokk 2022-2023 og ettervirkning på produksjoner og regioner",NO,"BFJ/NIBIO/market sources","shock response memo","BFJ, NIBIO, Landbruksdirektoratet","årsresultat/vederlag-begrep må harmoniseres","PCQ","research/external/r12/","planned"
R12-FARM-004,farm-economy,P1,"Kartlegg samvirkemakt sett fra bondens margin: hva kan sies strukturelt uten intensjonspåstander",NO,"governance and economics","cooperative margin memo","TINE/Nortura reports, BFJ, academic sources","samvirke er ikke samme som private oligopol","source-shortlist","research/external/r12/","planned"
R12-FARM-005,farm-economy,P2,"Kartlegg unge bønder, rekruttering og distriktsøkonomi som output av matsystemet",NO,"rural and farm statistics","district output memo","NIBIO, Ruralis, SSB","hold dette som output/blindsone hvis datagrunnlag svakt","source-shortlist","research/external/r12/","planned"
R12-TRUE-001,true-cost,P0,"Identifiser Edinburgh/NMBU-forskeren og publikasjonene om manglende indikatorer og eksternaliteter",International,"academic literature","source identity memo","Google Scholar/Crossref/university pages","ASR-navn er usikkert; ikke gjett person","source-shortlist","research/external/r12/","planned"
R12-TRUE-002,true-cost,P1,"Kartlegg TEEBAgriFood og true-cost accounting som metode for mat, men uten kronefestet modell",International,"method literature","method shortlist","TEEBAgriFood, FAO, academic reviews","skyggepris er metoderisiko","source-shortlist","research/external/r12/","planned"
R12-TRUE-003,true-cost,P1,"Kartlegg sufficiency og prevention i matsystemer: tiltak, evidens, og indikatorer",International,"academic and policy sources","concept memo","IPCC/EEA/academic sufficiency literature","ikke gjør normativt krav til aktørintensjon","source-shortlist","research/forstaelse/","planned"
R12-TRUE-004,true-cost,P1,"Verifiser Nexus-rapporten, anbefalingstall og SOIL-score fra møtet",International,"primary report","Nexus source card","IPBES Nexus Assessment or correct source","70 anbefalinger og SOIL-score er ASR-hypotese","PCQ","research/external/r12/","planned"
R12-TRUE-005,true-cost,P2,"Kartlegg folkehelse-output for norsk matsystem: kosthold, sykdom, tilgjengelighet og datagrunnlag",NO,"public health statistics","health output gap memo","FHI, Helsedirektoratet, SSB","helse er fase 2; ikke tallfest true-cost ennå","source-shortlist","research/external/r12/","planned"
R12-GOV-001,governance,P0,"Test governance-impotens-sløyfen: hvilke virkemidler finnes, og hvorfor endrer de ikke struktur",NO,"law/policy/enforcement","governance loop memo","Totalberedskapsmeldingen, KT, DSB, LMD/NFD","kausalpil er hypotese; skill virkemiddel og effekt","forstaelse","research/forstaelse/","planned"
R12-GOV-002,governance,P1,"Lag ansvarsmatrise for matberedskap stat, fylke og kommune med hjemmel og hull",NO,"law and guidance","responsibility matrix","DSB, Lovdata, ministry docs","fylkeskommunalt hull må hjemles som fravær","PCQ","research/external/r12/","planned"
R12-GOV-003,governance,P1,"Kartlegg nordiske regulatoriske terskler mot dagligvarekonsentrasjon og EMV-preferanse",Nordic,"competition law","policy comparison table","KKV, KT, KFST, Swedish authority","ikke bland forslag og vedtatt lov","source-shortlist","research/external/r12/","planned"
R12-GOV-004,governance,P1,"Kartlegg implementeringsbarrierer for sirkulære mattiltak: forskning som ikke konverterer",International,"case literature","conversion failure ledger","Infarm, Mycorena, Rest, Plantagon, academic sources","konkurs er ikke bevis mot teknologi alene","source-shortlist","research/external/r12/","planned"
R12-GOV-005,governance,P2,"Kartlegg finansieringsmuligheter som støtter Food TG-tilnærmingen uten å endre analyseformålet",Nordic,"funding programmes","funding fit matrix","Innovation Norway, Nordic Innovation, EU programmes","ikke funding for fundingens skyld","internal","docs/project/mandates/","planned"
R12-VIZ-001,visualization,P0,"Definer datakrav for ledd-profil-visualisering per land og verdikjedeledd",Nordic,"existing + required data","visual data contract","R4/R5 outputs, official stats","visualisering skal vise tomme celler","internal","docs/project/mandates/","planned"
R12-VIZ-002,visualization,P1,"Lag spesifikasjon for spider/radarmodell med økonomi, miljø, beredskap og implementeringstid",Internal,"method design","model spec","R12 source outputs","score uten kilde skal være null/tomt","internal","docs/project/mandates/","planned"
R12-VIZ-003,visualization,P1,"Lag underlag for kausalkart L1-L5 med evidensstyrke per pil",Internal,"synthesis evidence","causal loop evidence table","systemmodell, R4/R5/R6","piler er hypoteser, ikke målt kausalitet","forstaelse","research/forstaelse/","planned"
R12-VIZ-004,visualization,P1,"Lag datagap-figur-underlag: hva måles ikke, av hvem, og hva skal til",Nordic,"type-C findings","datagap table","R4/R5/R6 + new prompts","type-C er funn, ikke feil","internal","docs/project/mandates/","planned"
R12-VIZ-005,visualization,P2,"Lag whitepaper/deck uttaksoversikt: hvilke funn kan bli figur, tabell eller casekort",Internal,"curated evidence","figure candidate inventory","claim-lock and PCQ outputs","ingen figur uten gate/status","internal","docs/project/mandates/","planned"
```

- [ ] **Step 3: Verify CSV row count and IDs**

Run:

```bash
python3 - <<'PY'
import csv
from pathlib import Path
p = Path("research/_status/food-tg-research-backlog-2026-06-24.csv")
rows = list(csv.DictReader(p.open()))
ids = [r["id"] for r in rows]
print(len(rows))
print(len(set(ids)))
print(ids[0], ids[-1])
PY
```

Expected output:

```text
50
50
R12-VALUE-001 R12-VIZ-005
```

---

### Task 3: Create The Promptpack

**Files:**
- Create: `docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md`
- Reference: `research/_status/food-tg-research-backlog-2026-06-24.csv`

- [ ] **Step 1: Create the promptpack file**

Use `apply_patch` to create the file. Include this header:

```markdown
---
tittel: Food TG — Research Runde 12 promptpack
status: Intern promptpakke — ingen claims åpnes
eier: Gabriel
dato: 2026-06-24
scope: 50 smale prompts for underlag, kartlegginger, datagap, modeller og visualiseringsgrunnlag.
bruksregel: Kjør én prompt om gangen. Lagre output i avtalt `next_artifact`, mottaksfør funnet, og send bare modne funn videre til source-shortlist/PCQ/claim-lock.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md
  - research/_status/food-tg-research-backlog-2026-06-24.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
---

# Food TG — Research Runde 12 promptpack
```

- [ ] **Step 2: Add the universal prompt contract**

Add this section before individual prompts:

```markdown
## Universal instruks for alle prompts

Du arbeider for Food TG. Du skal hente underlag, ikke skrive whitepaper.

Regler:
1. Primærkilde først. Bruk sekundærkilder bare når primær ikke finnes, og merk dem `B`.
2. Ikke gjett. Tomme celler og dokumenterte fravær er gyldige funn.
3. Skill mellom:
   - `A`: primær/verifisert.
   - `B`: sekundær, aktørrapportert eller avledet estimat.
   - `C`: ikke offentlig tilgjengelig, ikke målt, klassifisert eller epistemisk hull.
4. Skill mellom realisert volum, kapasitet, plan, potensial og hypotese.
5. Lag alltid en `Ikke si`-liste for overclaim-risiko.
6. Avslutt med anbefalt gate: source-shortlist, PCQ, claim-lock, actor-gate, forstaelse eller parkering.

Output-format:

| Felt | Svar |
|---|---|
| Kort dom | 2-4 setninger |
| Sterkeste kilde | navn, år, lokator |
| Svakeste punkt | hva er usikkert |
| Funn-tabell | tabell med kilde/status/caveat |
| Tomme celler | liste |
| Ikke si | liste |
| Anbefalt gate | én eller flere gates |
```

- [ ] **Step 3: Add ten theme sections with five prompts each**

For each canonical ID, add a prompt block shaped exactly like this:

```markdown
### R12-VALUE-001 — Ledd-profil import Norge

**Prioritet:** P0
**Tema:** Verdikjede per ledd og land
**Geo:** NO
**Forventet output:** ledd-profil table with A/B/C evidence
**Lagre output:** `research/external/r12/R12-VALUE-001-leddprofil-import-no.md`

**Prompt:**
Lag ledd-profil for importleddet i Norge: viktigste mat-, fôr- og innsatsvarestrømmer, sårbarhet og datagap. Bruk offisiell statistikk først. For hver rad skal du oppgi vare/strøm, år, verdi/volum hvis tilgjengelig, primærkilde, kildeklasse A/B/C, og caveat. Ikke bland verdi og volum i samme indikator uten merking. Avslutt med tomme celler og forslag til PCQ/claim-lock.
```

Use the CSV `question`, `geo`, `expected_output`, `known_caveat`, `gate`, and `next_artifact` fields to fill each prompt. Keep prompts concise: 80-140 words each. Use all 50 IDs and the same ordering as the CSV.

- [ ] **Step 4: Verify promptpack IDs match CSV IDs**

Run:

```bash
python3 - <<'PY'
import csv, re
from pathlib import Path
csv_ids = [r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-24.csv"))]
text = Path("docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md").read_text()
md_ids = re.findall(r"^### (R12-[A-Z]+-\d{3})", text, flags=re.M)
print(len(csv_ids), len(md_ids))
missing = sorted(set(csv_ids) - set(md_ids))
extra = sorted(set(md_ids) - set(csv_ids))
print("missing", missing)
print("extra", extra)
PY
```

Expected output:

```text
50 50
missing []
extra []
```

---

### Task 4: Create The Mottaksprotokoll

**Files:**
- Create: `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md`

- [ ] **Step 1: Write the mottaksprotokoll**

Use `apply_patch` to create the file. Include exactly these sections:

```markdown
---
tittel: Food TG — Research mottaksprotokoll
status: Intern kontrollprotokoll
eier: Gabriel
dato: 2026-06-24
scope: Hvordan output fra Runde 12-prompts tas imot, valideres, klassifiseres og eventuelt løftes videre.
bruksregel: Ingen prompt-output blir ekstern faktastemme uten denne mottaksflyten.
---

# Food TG — Research mottaksprotokoll

## 1. Formål

## 2. Hvor output lagres

## 3. Mottaksrad

## 4. A/B/C kildeklasse

## 5. Type A/B/C hull

## 6. Gate-beslutning

## 7. Ikke-si-liste

## 8. Minimum verifikasjon

## 9. Når funn kan løftes

## 10. Når funn skal parkeres
```

Populate these rules:

- Raw output goes to `research/external/r12/` unless it is explicitly a `forstaelse` output, which goes to `research/forstaelse/`.
- Every completed prompt gets one mottaksrad with:

```markdown
| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
```

- Define source classes:
  - `A`: primary/verbatim, official dataset, law text, annual report, registry, or directly downloadable primary report.
  - `B`: secondary, actor-reported, journalistic, mirrored, derived estimate, or methodologically partial.
  - `C`: not publicly measured, not available, classified, not attributable, or structurally unknowable from open sources.
- Define hull types:
  - `Type A`: desk-researchable.
  - `Type B`: actor/decision/access gate.
  - `Type C`: epistemic or structural absence.
- Define gate outcomes:
  - `source-shortlist`
  - `PCQ`
  - `claim-lock`
  - `actor-gate`
  - `forstaelse`
  - `parkert`
- Require a `Ikke si` list before any output can become deck- or whitepaper-near.

- [ ] **Step 2: Verify protocol control words**

Run:

```bash
rg -n "A/B/C|Type A|actor-gate|Ikke-si|research/external/r12|research/forstaelse" docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
```

Expected: every phrase appears.

---

### Task 5: Cross-Validate And Commit

**Files:**
- Verify all files created in Tasks 1-4.

- [ ] **Step 1: Run consistency checks**

Run:

```bash
python3 - <<'PY'
import csv, re
from pathlib import Path
csv_path = Path("research/_status/food-tg-research-backlog-2026-06-24.csv")
prompt_path = Path("docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md")
rows = list(csv.DictReader(csv_path.open()))
ids = [r["id"] for r in rows]
text = prompt_path.read_text()
md_ids = re.findall(r"^### (R12-[A-Z]+-\d{3})", text, flags=re.M)
assert len(rows) == 50, len(rows)
assert len(set(ids)) == 50, "duplicate CSV ids"
assert ids == md_ids, "CSV and promptpack order/IDs diverge"
for path in [
  "docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md",
  "docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md",
  "research/_status/food-tg-research-backlog-2026-06-24.csv",
  "docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md",
]:
    p = Path(path)
    assert p.exists(), path
    assert "PLACEHOLDER" not in p.read_text(errors="ignore"), path
print("research-os validation ok")
PY
```

Expected:

```text
research-os validation ok
```

- [ ] **Step 2: Check formatting**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 3: Review staged scope before commit**

Run:

```bash
git status --short
git diff -- docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md research/_status/food-tg-research-backlog-2026-06-24.csv docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
```

Expected: only the four Research OS artifact files are part of this slice. Existing unrelated dirty worktree files remain untouched and unstaged.

- [ ] **Step 4: Stage only the four artifact files**

Run:

```bash
git add \
  docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md \
  docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md \
  research/_status/food-tg-research-backlog-2026-06-24.csv \
  docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
git diff --cached --check
```

Expected: no output from `git diff --cached --check`.

- [ ] **Step 5: Commit**

Run:

```bash
git commit -m "docs(food-tg): add research os prompt pack"
```

Expected: one commit containing only the four artifact files.

## Self-Review Checklist

- [ ] All ten themes from the spec are represented.
- [ ] The backlog and promptpack both contain exactly 50 prompts.
- [ ] Every prompt has an explicit gate.
- [ ] Every prompt asks for caveats / empty cells / do-not-say.
- [ ] Mottaksprotokoll prevents raw output from becoming whitepaper text directly.
- [ ] No file says the work depends on JT dataunderlag.
- [ ] No new app, DB schema, or import behavior is included.
