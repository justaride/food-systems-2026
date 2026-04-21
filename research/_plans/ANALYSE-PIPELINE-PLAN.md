# Analyse- og Import-Pipeline: Gjennomføringsplan

> Formål: Ferdigstille hele PDF-korpuset fra nedlasting → analyse → database-import.
> Arkitektur: Subagent-drevet — parallelliserte arbeidsstrømmer per fase.
> Status ved planlegging: 2026-04-20.

---

## Nåsituasjon

| Metrikk | Verdi |
|---------|-------|
| PDF-er i evidence-pack | 205 |
| MD-sammendrag | 17 |
| Innholdsanalysert (Master-indeks) | 96 |
| Nye, uanalyserte | ~109 |
| Intake-filer godkjent for import | 191 |
| Promotert til DB (SourceDoc/Report/Thesis) | 0 |
| Kilder gjenstår nedlasting | 112 (52 + 60 url_only) |

---

## Faseoversikt

```
Fase 0: Nedlasting (112 url_only)
    ↓
Fase 1: PDF-katalog metadata-enrichment (alle 205+)
    ↓
Fase 2: Innholdsanalyse (~109 nye PDF-er)
    ↓
Fase 3: Database-import (191 filer → Document-records)
    ↓
Fase 4: Promotion til typed layers (→ SourceDoc / Report / Thesis)
    ↓
Fase 5: Syntese og dashboard-kobling
```

**Parallelliserbare:** Fase 0 + Fase 1 kan kjøres samtidig. Fase 2 kan starte delvis parallelt med Fase 0 (for allerede nedlastede filer). Fase 3 og 4 er sekvensielle.

---

## Fase 0: Nedlasting av gjenstående kilder

### Mål
Laste ned 112 url_only-kilder fra to backlogs:
- `download-backlog-2026-04-20.csv` — 52 stk (dybderapport-kilder)
- `download-backlog-sirkular-konkurser-2026-04-20.csv` — 60 stk (sirkulær-konkurser)

### Subagent-arkitektur

**3 parallelle agenter**, delt etter backlog og tematikk:

| Agent | Scope | Estimat |
|-------|-------|---------|
| `download-agent-A` | backlog-2026-04-20: url_only, prioritet P1 (ca 20 stk) | Offentlige rapporter, PDF-direct |
| `download-agent-B` | backlog-2026-04-20: url_only, prioritet P2+ (ca 32 stk) | Akademia, bransje — noen krever manuell |
| `download-agent-C` | backlog-sirkular-konkurser: url_only (60 stk) | Startup-case, nyhetsartikler, rapporter |

### Per agent — arbeidsflyt

1. Les CSV, filtrer `status=url_only`
2. For hver URL:
   - Bestem url_type (pdf_direct vs html_page)
   - Hvis pdf_direct: `curl -L -o {target_path} "{url}"`
   - Hvis html_page: `WebFetch` → vurder om det er nedlastbar PDF-lenke, ellers lagre som MD-sammendrag
3. Valider nedlastede filer (filstørrelse > 10 KB, er faktisk PDF)
4. Oppdater CSV: `status` → `downloaded`, `current_local_status` → `local_pdf_available`
5. Rapporter liste over feilede/manuelt-krevende URL-er

### Output
- Oppdaterte backlog-CSVer
- Nye PDF-er/MD-filer i evidence-pack/
- Feilliste for kilder som krever manuell nedlasting

### Avhengigheter
Ingen — kan starte umiddelbart.

### Forventet resultat
Realistisk: ~70-80% av url_only kan lastes automatisk. Rest krever manuell (paywall, dynamisk innhold).

---

## Fase 1: PDF-katalog metadata-enrichment

### Mål
Oppdatere `pdf-katalog.json` og `PDF-KATALOG.md` med riktig metadata for alle PDF-er (nå 172 entries med status "unknown").

### Subagent-arkitektur

**1 agent** — dette er primært en script-kjøring:

```bash
npm run build-pdf-catalog   # eller: npx tsx scripts/build-pdf-catalog.ts
```

### Tilleggsarbeid (hvis metadata er dårlig)

Mange PDF-er har ødelagt/kryptert tittel-metadata (synlig i PDF-KATALOG.md som binærsøppel). En sekundær agent kan:

1. Lese `pdf-katalog.json`
2. Identifisere entries der `title` er binærsøppel eller tom
3. For disse: lese første side av PDF, ekstrahere reell tittel via tekstinnhold
4. Skrive korreksjoner til `research/seed-pdf-map.overrides.json`

### Output
- Oppdatert `pdf-katalog.json` med page count, author, creation date
- Oppdatert `PDF-KATALOG.md`
- Eventuelle title-overrides i seed-pdf-map.overrides.json

### Avhengigheter
Ingen — kan kjøres parallelt med Fase 0.

---

## Fase 2: Innholdsanalyse av nye PDF-er

### Mål
Lese og syntetisere ~109 nye PDF-er som ikke er dekket av den eksisterende Master-Analyse-Indeksen (generert 2026-04-13, dekker 96 filer).

### Nye filer å analysere (gruppert)

| Mappe | Antall | Innhold |
|-------|--------|---------|
| `akademia/perplexity-runde/` | 18 | Akvakultur, fôr, insekt, sirkulær, REKO |
| `forskningsinstitutt/` | 11 | HI, SINTEF, NIBIO, NORSUS, Ruralis, Forskningsrådet |
| `forskningsrunde-2026-04-20/` | 39 | EAT, matsvinn, policy, bedriftsrapporter |
| `offentlig/` (nye) | ~19 | Meld.St., NOU, Prop.L, Riksrevisjonen, Lovdata |
| `nordisk/` (nye) | 11 | KFST, Konkurrensverket, OECD, EU, Norden |
| `tilsyn/` (nye) | 4 | KT dagligvarerapporter, Dagligvaretilsynet |
| Andre spredte | ~7 | Diverse |

### Subagent-arkitektur

**5 parallelle analyse-agenter**, én per tematisk klynge:

| Agent | Filer | Output-fil |
|-------|-------|------------|
| `analyse-agent-forskningsinstitutt` | 11 PDF (HI, SINTEF, NIBIO, NORSUS, Ruralis) | `research/analyse/pdf-gjennomgang-forskningsinstitutt.md` |
| `analyse-agent-akvakultur-sirkulaer` | 18 PDF (perplexity-runde) | `research/analyse/pdf-gjennomgang-perplexity-runde.md` |
| `analyse-agent-offentlig-tilsyn` | ~23 PDF (offentlig + tilsyn nye) | `research/analyse/pdf-gjennomgang-offentlig-2.md` |
| `analyse-agent-nordisk-intl` | 11 PDF (nordisk nye) | `research/analyse/pdf-gjennomgang-nordisk-2.md` |
| `analyse-agent-forskningsrunde` | 39 PDF (forskningsrunde-2026-04-20) | `research/analyse/pdf-gjennomgang-forskningsrunde-april.md` |

### Per agent — arbeidsflyt

1. Les fil-listen (basert på tildelt mappe/glob)
2. For hver PDF:
   - Les dokumentet (Read tool på PDF)
   - Ekstraher: tittel, forfatter(e), år, institusjon, hovedfunn (3-5 punkter), metodikk, datapunkter, relevans for prosjektet
3. Skriv analyse-fil i eksisterende format:

```markdown
# PDF-gjennomgang: {kategori}

> Dato: {dato}
> Kilde: {mappesti}
> Antall dokumenter: {n}

## {nr}. {tittel}

| Felt | Verdi |
|------|-------|
| Fil | `{relativ sti}` |
| Tittel | {tittel} |
| Forfatter(e) | {forfattere} |
| Institusjon | {inst} |
| År | {år} |
| Sider | {sider} |
| Sammendrag | {2-3 setninger} |

**Hovedfunn:**
1. ...
2. ...
3. ...

**Relevans:** {tags}
**Nøkkeltall:** {kvantitative datapunkter}
**Metodikk:** {kort}
```

4. Oppdater `MASTER-ANALYSE-INDEX.md` med ny fil og tematisk dekning

### Output
- 5 nye analyse-filer i `research/analyse/`
- Oppdatert `MASTER-ANALYSE-INDEX.md` (totalt ~205 dokumenter analysert)
- Tematisk syntese på tvers av hele korpuset

### Avhengigheter
- Fase 0 bør være delvis ferdig (for nye nedlastede filer)
- Fase 1 er nyttig men ikke blokkerende (metadata-enrichment gir bedre titler)

### Estimat
~109 PDF-er × gjennomsnitt 30-60 sider = stort arbeid. Parallellisering via 5 agenter reduserer til ~20 filer per agent.

---

## Fase 3: Database-import (Document-records)

### Mål
Kjøre `scripts/import-food-research-process-intake.ts` for å opprette Document-records i databasen for de 191 godkjente filene fra intake-prosessen.

### Subagent-arkitektur

**1 agent** — dette er en script-kjøring med for-/etterkontroll:

### Arbeidsflyt

1. **Pre-flight sjekk:**
   - Bekreft at `review.csv` har 191 rader med `action=import`
   - Bekreft at alle `import_file_path`-verdier peker til eksisterende filer
   - Kjør `npm run db:import` (eller tilsvarende) for å sikre at skjemaet er oppdatert
   - Sjekk at Prisma-klienten er generert (`npx prisma generate`)

2. **Kjør import:**
   ```bash
   npx tsx scripts/import-food-research-process-intake.ts
   ```

3. **Validering:**
   - Les `import-summary.json` — bekreft antall imported vs skipped
   - Spot-sjekk 5-10 Document-records i DB (via Prisma query eller app-UI)
   - Verifiser at slugs, tags og metadata er korrekte

4. **Feilhåndtering:**
   - Hvis filer mangler: oppdater `review.csv` med `action=hold` for manglende
   - Hvis import feiler: fiks data og kjør på nytt (idempotent via upsert)

### Output
- `import-summary.json` med fullstendig status
- ~191 Document-records i databasen
- Verifiseringsrapport

### Avhengigheter
- **Krever:** At kildefilene eksisterer lokalt (Fase 0 bør være ferdig)
- **Krever:** Fungerende database-tilkobling (`npm run dev` eller prod-DB)

---

## Fase 4: Promotion til typed layers

### Mål
Promotere de 225 kandidatene fra `promotion-candidates.csv` til SourceDoc, Report, eller Thesis-records i databasen.

### Subagent-arkitektur

**2 agenter sekvensielt:**

#### Agent 4A: Metadata-berikelse og klassifisering

Mange candidates har `confidence=low` eller mangler påkrevde felter. Denne agenten:

1. Les `promotion-candidates.csv` (225 rader)
2. For hver rad med `confidence=low` eller manglende felter:
   - Les den tilhørende filen (via `import_file_path` eller `source_path`)
   - Ekstraher manglende metadata: author, institution, year, url, keyFindings
   - Vurder korrekt `recommended_target` basert på innhold:
     - **Thesis**: har forfatter + institusjon + akademisk struktur
     - **Report**: har institusjon + årstall + rapportnummer/serie
     - **SourceDoc**: alt annet (nyhetsartikler, presentasjoner, datasett)
3. Oppdater `promotion-candidates.csv` med berikede felter
4. Generer `title-remediation.csv` for titler som trenger fiksing (binærsøppel-titler)

**Parallelliserbar delstrategi:** Kan splitte i 3 sub-agenter etter `recommended_target`:
- Agent 4A-src: SourceDoc-kandidater (108 stk)
- Agent 4A-rep: Report-kandidater (102 stk)  
- Agent 4A-thesis: Thesis-kandidater (15 stk)

#### Agent 4B: Kjør promotion-script

1. **Pre-flight:**
   - Verifiser at `import-summary.json` eksisterer (Fase 3 ferdig)
   - Verifiser at `promotion-candidates.csv` er oppdatert (Agent 4A ferdig)
   - Kjør i dry-run/preview-modus først:
     ```bash
     npx tsx scripts/promote-food-process-typed-records.ts --preview
     ```
   - Sjekk output: `promotion-preview-{sourcedoc,report,thesis}.md`
   - Verifiser at promotable/blocked-ratio er rimelig

2. **Kjør promotion:**
   ```bash
   npx tsx scripts/promote-food-process-typed-records.ts
   ```

3. **Validering:**
   - Tell nye records per typed layer
   - Spot-sjekk at `documentId`-lenker fungerer
   - Verifiser at dashboard-sider (`/kilder`, `/forskning`) viser nye data

### Output
- Nye SourceDoc-records (~108)
- Nye Report-records (~102)
- Nye Thesis-records (~15)
- Preview-rapporter med beslutningsgrunnlag
- Oppdatert `promotion-candidates.csv` med endelig status

### Avhengigheter
- **Krever:** Fase 3 fullført (Document-records må eksistere)
- **Krever:** Fungerende database-tilkobling

---

## Fase 5: Syntese og dashboard-kobling

### Mål
Koble analysefunn til eksisterende dashboard-metrikkjer og regenerere nødvendige datafiler.

### Subagent-arkitektur

**3 parallelle agenter:**

#### Agent 5A: HI-rapporter → Akvakultur-metrikker

Koble funn fra HI Risikorapport 2024/2025 og Ressursoversikt 2026 til:
- `public/data/food-systems/no/chart-metrics.json` (norske metrikker)
- Relevante felt: dødelighetsrate, luseutslipp, fôrressursandeler, klimaprojeksjoner

Arbeidsflyt:
1. Les HI-rapportsammendragene (allerede i `forskningsinstitutt/hi-nettrapporter/`)
2. Les eksisterende `chart-metrics.json`
3. Identifiser metrikker som kan oppdateres/tilføyes
4. Foreslå endringer (ikke skriv direkte — presenter for review)

#### Agent 5B: Konkurransetilsyn → Markedsstruktur-metrikker

Koble KT/KFST/Konkurrensverket-rapporter til:
- Nordiske CR3/HHI-tall
- Dagligvaretilsynets effektivitetsmetrikker
- Markedsandelstrender

#### Agent 5C: KILDEREGISTER + URL-MANIFEST oppdatering

1. Oppdater KILDEREGISTER.md med eventuelle nye funn fra Fase 2-analysen
2. Regenerer URL-MANIFEST.csv (`python3 scripts/build-url-manifest.py`)
3. Kjør `npm run compute-metrics` for å regenerere chart-metrics

### Output
- Oppdaterte chart-metrics.json (alle 5 land)
- Oppdatert KILDEREGISTER.md
- Regenerert URL-MANIFEST.csv
- Forslag til nye dashboard-visualiseringer

### Avhengigheter
- **Krever:** Fase 2 fullført (analyseresultater)
- **Anbefalt:** Fase 4 fullført (for dashboard-datakobling)

---

## Kjøreplan og tidsestimat

```
Session 1 (Fase 0 + 1):
├── download-agent-A (P1 offentlige)     ─── 15 min
├── download-agent-B (P2+ akademia)      ─── 20 min
├── download-agent-C (sirkulær-konkurser) ─── 25 min
└── metadata-enrichment (script)         ─── 5 min
    → Resultat: ~80 nye PDF-er, oppdatert katalog
    → Manuell handling: Brukeren laster ned paywall-kilder

Session 2 (Fase 2):
├── analyse-agent-forskningsinstitutt    ─── 20 min
├── analyse-agent-akvakultur-sirkulaer   ─── 25 min
├── analyse-agent-offentlig-tilsyn       ─── 25 min
├── analyse-agent-nordisk-intl           ─── 15 min
└── analyse-agent-forskningsrunde        ─── 30 min
    → Resultat: 5 nye analysefiler, oppdatert Master-indeks

Session 3 (Fase 3 + 4):
├── import-agent (script-kjøring)        ─── 10 min
├── metadata-berikelse 4A (3 sub-agenter) ─── 20 min
└── promotion 4B (script + validering)   ─── 15 min
    → Resultat: ~225 typed records i databasen

Session 4 (Fase 5):
├── HI → akvakultur-metrikker           ─── 15 min
├── KT → markedsstruktur                ─── 15 min
└── KILDEREGISTER + metrics             ─── 10 min
    → Resultat: Dashboard oppdatert med nye datakilder
```

**Total:** 4 sessions, ~3.5 timer effektiv arbeidstid.

---

## Kommandoer for oppstart

Hver session startes med:

```
Les research/ANALYSE-PIPELINE-PLAN.md og gjennomfør Fase {N} med subagent-arkitekturen beskrevet der.
```

---

## Risikofaktorer

| Risiko | Mitigering |
|--------|-----------|
| Paywall-kilder (Wiley, Elsevier, Emerald) | Bruker laster ned manuelt; hold-status i CSV |
| Store PDF-er som ikke kan leses av Read-tool | Bruk pdf-to-text eller les kun metadata + abstract |
| Database-migrasjon kreves | Kjør `npx prisma migrate dev` før Fase 3 |
| Duplikater mellom gamle og nye records | Promotion-scriptet har conflict detection innebygget |
| Context-overflow i analyse-agenter | Begrens til maks ~25 PDF-er per agent; splitt ytterligere om nødvendig |

---

## Verifiseringskriterier per fase

| Fase | Suksesskriterium |
|------|------------------|
| 0 | Backlog-CSVer: ≥80% converted til `downloaded` |
| 1 | `pdf-katalog.json`: 0 entries med status "unknown" |
| 2 | `MASTER-ANALYSE-INDEX.md`: dekker ≥200 dokumenter |
| 3 | `import-summary.json`: ≥180 imported, ≤10 skipped |
| 4 | DB query: ≥200 nye typed records (SourceDoc+Report+Thesis) |
| 5 | `chart-metrics.json`: nye datapunkter fra HI/KT-rapporter synlige |
