# Food TG Insight Pack v0.1 — Implementasjonsplan

> **For eksekverende:** Bruk `superpowers:executing-plans` eller `superpowers:subagent-driven-development` til å gjennomføre planen oppgave for oppgave. Steg er merket med checkbox (`- [ ]`) for sporing.

**Dato:** 2026-04-27
**Status:** Operativ implementasjonsplan v1.0
**Kilde:** `docs/project/FOOD-TG-INNSIKTSPROSESS-ARBEIDSPLAN-2026-04-27.md`
**Styringsnotat:** `docs/project/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md`

**Mål:** Produsere Food TG Insight Pack v0.1 — et beslutningsklart innsiktsgrunnlag bestående av 9 markdown-leveranser i `docs/project/mandates/` — innen 08.05.2026.

**Arkitektur:** Sekvensiell pipeline: kilder → evidens → påstander → spor-briefer → aktørpakke → syntese. Hver fase produserer én eller flere markdown-filer som senere faser bygger videre på via kryssreferanser (EV-IDer, CL-IDer, fil-stier). Standard frontmatter på alle filer sikrer at status og eierskap er sporbart.

**Tech stack:** Markdown, repoets eksisterende `npm`-skript (`compute-ki-priority`, `inventory-urls`, `check-pdf-quality`), `rg` for kildesøk, `git` for versjonering. Ingen kode skal endres.

---

## Skope og avgrensning

**Inkludert (denne planen):**
- P0 — Oppsett og styring (governance-filer)
- P1 — Kildeinventar
- P2 — Evidens- og kvalitetsvurdering
- P3 — Claim og hypoteser
- P4 — Tre sporbriefs (A, B, C)
- P5 — Aktørdialogforberedelse
- Syntese — Insight Pack v0.1 hoveddokument + decision memo (utkast)

**Ikke inkludert (krever separate planer):**
- P6 — Intern scopebeslutning (krever Jan Thomas/Cathrine/Einar i møte 05.05)
- P7 — Ekstern validering (krever aktørrespons fra outreach 08.05+)
- P8 — Roadmap-konvertering (krever output fra P6 + P7)
- Sprint 2-7 (mai-juli, beskrevet i FOOD-TG-STATUS-ARBEIDSPLAN seksjon 10)

Decision memo lages som **utkast** i denne planen (Phase 7) — selve beslutningen tas av interne stakeholders senere.

---

## Statussnapshot 27.04.2026

Allerede på plass i `docs/project/mandates/`:

| Fil | Status |
|---|---|
| `README.md` | Oversikt eksisterer; må oppdateres når nye filer kommer til |
| `food-transition-group-mandate-2026-04-21.md` | Mandatdetaljoversikt eksisterer |
| `mandate-for-transition-group-food-2026-04-21.pdf` | Kilde-PDF importert |
| `transition-group-overview-working-doc-2026.pdf` | Kilde-PDF importert |

Alle andre Insight Pack-filer er **uoprettede** og lages i denne planen.

---

## Standard konvensjoner

### Frontmatter (obligatorisk på alle nye filer)

```markdown
---
tittel: <fulltittel>
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-XX
neste_handling: <konkret handling og hvem>
relaterte_filer:
  - docs/project/mandates/<fil>.md
---
```

### Statusverdier (eksakt formulering)

- `Utført internt` — analyse/utkast finnes i repoet
- `Besluttet internt` — NCH/Natural State har tatt beslutning
- `Validert eksternt` — ekstern aktør har respondert konkret
- `Forpliktet eksternt` — aktør har sagt ja til rolle/data/pilot/finansiering
- `Publisert/levert` — sendt eller publisert

### ID-konvensjoner

- Evidens: `EV-A-001`, `EV-B-001`, `EV-C-001`, `EV-BASE-001`, `EV-ACT-001`, `EV-FIN-001`, `EV-POL-001`
- Claim: `CL-A-001`, `CL-B-001`, `CL-C-001`
- Aktør: `ACT-001` (i actor pack)

### Commit-mønster

```
docs(mandates): <kort beskrivelse av leveransen>
```

Etter hver Task lukkes med commit. Ikke samle flere Tasks i én commit — brittfrekvens er én commit per ferdigstilt fil eller logisk delmengde.

---

## Filkart

```
docs/project/mandates/
├── README.md                             [oppdateres i T0.1]
├── food-transition-group-mandate-2026-04-21.md  [eksisterer]
├── decision-log-food-tg.md               [opprettes i T0.2]
├── tg-charter-food-2026.md               [opprettes i T0.3]
├── source-shortlist-food-tg.md           [opprettes i Phase 1]
├── evidence-matrix-food-tg.md            [opprettes i Phase 2]
├── claim-register-food-tg.md             [opprettes i Phase 3]
├── track-brief-a-feed-import.md          [opprettes i Phase 4]
├── track-brief-b-sidestreams-nutrients.md [opprettes i Phase 4]
├── track-brief-c-adoption.md             [opprettes i Phase 5]
├── actor-validation-pack-food-tg.md      [opprettes i Phase 6]
├── decision-memo-food-tg-scope.md        [opprettes i Phase 7 (utkast)]
└── food-tg-insight-pack-v0.1.md          [opprettes i Phase 7 (syntese)]
```

---

## Dag-mapping

| Dag | Dato | Phase | Hovedoutput |
|---|---|---|---|
| 1 | 27.04 | (denne planen) | Implementasjonsplan |
| 2 | 28.04 | P0 + Phase 1 | Governance-filer + source shortlist |
| 3 | 29.04 | Phase 2 | Evidence matrix v0.1 |
| 4 | 30.04 | Phase 3 | Claim register v0.1 |
| 5 | 01.05 | Phase 4 | Sporbrief A + B |
| 6 | 04.05 | Phase 5 | Sporbrief C + decision memo (utkast) |
| 7 | 05.05 | (intern beslutning) | _Ikke Codex-oppgave_ |
| 8 | 06.05 | Phase 6 | Actor validation pack |
| 9 | 07.05 | (Phase 6 forts.) | Intervjuguide + first outreach-shortlist |
| 10 | 08.05 | Phase 7 | Insight Pack v0.1 syntese + commit |

---

## Phase 0: Setup og governance

### Task 0.1: Oppdater mandates/README.md med nye filer

**Filer:**
- Endre: `docs/project/mandates/README.md`

- [ ] **Steg 1: Les eksisterende README**

```bash
cat docs/project/mandates/README.md
```

- [ ] **Steg 2: Utvid tabellen med nye filer (placeholder for filer som kommer)**

Legg til disse radene i den eksisterende tabellen:

```markdown
| `decision-log-food-tg.md` | Beslutningslogg | Aktiv | Formelle beslutninger fra interne møter, dato, eier, begrunnelse. |
| `tg-charter-food-2026.md` | 1-sides charter | Utkast | North Star, scope, suksesskriterier — ferdigstilles i sprint 0. |
| `source-shortlist-food-tg.md` | Kildeoversikt | Utkast | 30-50 prioriterte kilder for spor A/B/C, baseline, actor, finance, policy. |
| `evidence-matrix-food-tg.md` | Evidence matrix | Utkast | Kildevurdering med ID, spor, kvalitet, siterbarhet og neste handling. |
| `claim-register-food-tg.md` | Claim register | Utkast | Påstander, hypoteser, evidens og valideringsbehov per spor. |
| `track-brief-a-feed-import.md` | Sporbrief A | Utkast | Sirkulært fôr og importavhengighet — beslutningsklar brief. |
| `track-brief-b-sidestreams-nutrients.md` | Sporbrief B | Utkast | Sidestrømmer, matsvinnkvalitet og næringsstoffløkker. |
| `track-brief-c-adoption.md` | Sporbrief C | Utkast | Adoption mechanisms for circular food. |
| `actor-validation-pack-food-tg.md` | Aktørpakke | Utkast | Aktørliste, ask, intervjuguide, outreach-logg. |
| `decision-memo-food-tg-scope.md` | Decision memo | Utkast | Anbefaling om scope, første aktører og neste sprint. |
| `food-tg-insight-pack-v0.1.md` | Insight Pack v0.1 syntese | Utkast | 5-8 sider hovedfunn, usikkerheter og anbefalt scope. |
```

- [ ] **Steg 3: Verifiser at alle radene har samme kolonner som eksisterende rader**

- [ ] **Steg 4: Commit**

```bash
git add docs/project/mandates/README.md
git commit -m "docs(mandates): index new Insight Pack v0.1 deliverables in README"
```

---

### Task 0.2: Opprett decision-log-food-tg.md

**Filer:**
- Opprett: `docs/project/mandates/decision-log-food-tg.md`

- [ ] **Steg 1: Skriv fil med standard frontmatter og tabellstruktur**

```markdown
---
tittel: Food TG Decision Log
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Logg første formelle beslutning etter scope-møte 05.05
relaterte_filer:
  - docs/project/mandates/food-transition-group-mandate-2026-04-21.md
  - docs/project/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md
---

# Food TG Decision Log

Formell logg over beslutninger som påvirker Food Transition Group-mandatet, scope, organisering og leveranser. Brukes av Jan Thomas, Cathrine, Einar, Martin og Gabriel.

## Hvordan loggføres beslutninger

1. Beslutning gjøres i internt møte eller skriftlig avklaring.
2. Loggfør samme dag i tabellen under.
3. Fyll alltid alle kolonner. Ingen tomme felter.
4. Kobler til møtenotat i `docs/meetings/` der relevant.

## Beslutningslogg

| Dato | Beslutning | Eier | Begrunnelse | Lukker | Møtereferanse |
|---|---|---|---|---|---|
| (ingen ennå) | | | | | |

## Åpne mandatfelt som krever beslutning

Disse er kjent åpne fra `food-transition-group-mandate-2026-04-21.md`:

| Felt | Status | Frist | Eier |
|---|---|---|---|
| Godkjenningsdato | Åpen | 01.05 | Jan Thomas/Einar |
| Reviewdato | Åpen | 01.05 | Jan Thomas/Einar |
| Antall nordiske land for representasjon | Åpen | 05.05 | Jan Thomas/Einar |
| Chair/co-chair | Åpen | 05.05 | Jan Thomas/Einar |
| Hovedscope (A/B/C kombinasjon) | Åpen | 05.05 | Jan Thomas/Cathrine/Einar |
| Workshopformat for M15 | Åpen | 12.05 | Cathrine/Jan Thomas |

## Kvalitetsregler

- Ingen beslutning kalles "tatt" uten dato, eier og begrunnelse.
- Beslutninger fra muntlige møter må loggføres skriftlig samme dag.
- Endringer/reverseringer skal logges som ny rad, ikke som overskriving.
```

- [ ] **Steg 2: Verifiser akseptkriterier**

- Fil eksisterer på korrekt sti
- Frontmatter er komplett
- Alle åpne mandatfelt fra status-notatet seksjon 2 er listet

- [ ] **Steg 3: Commit**

```bash
git add docs/project/mandates/decision-log-food-tg.md
git commit -m "docs(mandates): add Food TG decision log with open mandate fields"
```

---

### Task 0.3: Opprett tg-charter-food-2026.md (1-sides charter-utkast)

**Filer:**
- Opprett: `docs/project/mandates/tg-charter-food-2026.md`
- Kilde: `docs/project/mandates/food-transition-group-mandate-2026-04-21.md` (mandatdetaljer)

- [ ] **Steg 1: Skriv 1-sides charter-utkast**

```markdown
---
tittel: Food TG Charter v0.1 (utkast)
status: Utført internt
eier: Gabriel + Cathrine
sist_oppdatert: 2026-04-28
neste_handling: Cathrine reviewer 30.04, Jan Thomas/Einar godkjenner 05.05
relaterte_filer:
  - docs/project/mandates/food-transition-group-mandate-2026-04-21.md
  - docs/project/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md
---

# Food Transition Group Charter v0.1 (utkast)

## North Star

Akselerere overgangen til sirkulære nordiske matsystemer ved å lukke næringsstoff- og ressursløkker, redusere importavhengighet, og gjøre regenerative praksiser finansierbare og skalerbare innen 2029.

## Mandat (forenklet)

Food TG samler nordiske aktører fra produksjon, foredling, retail/HORECA, offentlig sektor, akademia og finansiering for å:

1. Etablere felles forståelse av Circular Food-status i Norden.
2. Identifisere prioriterte intervensjonspunkter og lovende piloter.
3. Levere policyanbefalinger, et 1-3 års roadmap og finansieringsspor for minst to prosjekter.

## Scope (foreløpig — endelig låses 05.05)

Hovedspor: 2 av A/B/C som hovedspor, det tredje som støtte- eller adoption-lag.

- **Spor A:** Sirkulært fôr og importavhengighet
- **Spor B:** Sidestrømmer, matsvinnkvalitet og næringsstoffløkker
- **Spor C:** Adoption mechanisms for circular food

## Hva er innenfor og hva er utenfor

**Innenfor:**
- Nordiske ressurs- og næringsstoffløkker
- Regulatoriske og markedsmessige barrierer for sirkulær skalering
- Pilot- og finansierbarhetsspor for 2026-2029
- Aktørmobilisering i minst 3 nordiske land

**Utenfor (denne fasen):**
- Generell matberedskap som hovedtema
- Hele dagligvarekonkurransen som selvstendig tema
- Bredt sweep over alle alternative proteiner
- Generelt nordisk matsystem uten avgrensing

## Suksesskriterier

| Kriterium | Mål |
|---|---|
| Forpliktede medlemmer | ≥1 partner per nordisk land i kjernekoalisjonen |
| Ekstern validering | ≥3 aktørresponser per hovedspor før workshop 1 |
| Pilotspor | ≥2 pilotbriefer med eier eller eierbehov identifisert |
| Funding-spor | ≥2 reelle finansieringsspor med prosjektidé |
| Roadmap | 1-3 års plan med eierskap, milepæler og KPI-er innen 08.06 |
| Publikasjon | Roadmap publisert og presentert i offentlig event innen juli |

## Governance (foreløpig)

- **Host:** Nordic Circular Hotspot
- **Sekretariat:** Natural State (Norge)
- **Chair/Co-chair:** Skal avklares av Jan Thomas/Einar innen 05.05
- **Beslutningsforum:** Ukentlig tirsdagsmøte
- **Beslutningslogg:** `decision-log-food-tg.md`

## Arbeidsrytme

| Dag | Fokus |
|---|---|
| Mandag | Kilde- og claim-arbeid (Gabriel + Codex) |
| Tirsdag | Internt beslutningsmøte |
| Onsdag | Brief/actor pack-oppdatering |
| Torsdag | Aktørdialog og validering |
| Fredag | Status, gap og planlegging neste uke |

## Kvalitetsregler

1. Intern syntese kan ikke være eneste kilde for sterke faktapåstander.
2. "Validert eksternt" krever notat fra ekstern respons.
3. Hver pilotretning må ha problem, evidens, aktører, pilotlogikk og funding-logikk.
4. Hver aktørkontakt må ha et konkret `ask`.
5. Roadmap-påstander skal kunne spores til claim register eller ekstern validering.

## Åpne punkter (skal lukkes 05.05)

- Endelig hovedscope (2 av A/B/C)
- Antall nordiske land for representasjon
- Chair/co-chair
- Workshopformat for M15
```

- [ ] **Steg 2: Verifiser at charter er ≤1 A4-side ved utskrift (≈300 ord)**

- [ ] **Steg 3: Commit**

```bash
git add docs/project/mandates/tg-charter-food-2026.md
git commit -m "docs(mandates): add Food TG Charter v0.1 draft for 05.05 sign-off"
```

**Akseptkriterier Phase 0:**
- README oppdatert med alle nye filer
- decision-log inneholder åpne mandatfelt med frist
- charter har North Star, scope, suksesskriterier og governance på maks 1 side

---

## Phase 1: Kildeinventar (P1)

### Task 1.1: Refresh repo-metrikk og kildeoversikt

- [ ] **Steg 1: Oppdater KI-prioritering**

```bash
npm run compute-ki-priority
```

Forventet: Oppdatert `research/KI-PRIORITY.md` med rangerte rapporter.

- [ ] **Steg 2: Oppdater URL-status og kildeoversikt**

```bash
npm run inventory-urls
```

Forventet: Oppdatert URL-inventar uten errors.

- [ ] **Steg 3: Sjekk PDF-kvalitet for kilder som vurderes**

```bash
npm run check-pdf-quality
```

Forventet: Liste over PDF-er som ikke kan leses pålitelig — disse kan ikke siteres direkte.

- [ ] **Steg 4: Bygg remediation-backlog hvis ikke gjort nylig**

```bash
npm run build-remediation-backlog
```

- [ ] **Steg 5: Filcoverage-sjekk**

```bash
npm run compute-file-coverage
```

Resultatene fra steg 1-5 brukes som filterunderlag i Task 1.2-1.5. Ikke commit ennå (output-filene oppdateres uansett ved neste npm-kjøring).

---

### Task 1.2: Opprett source-shortlist-food-tg.md med struktur

**Filer:**
- Opprett: `docs/project/mandates/source-shortlist-food-tg.md`

- [ ] **Steg 1: Skriv frontmatter og hoveddokument**

```markdown
---
tittel: Food TG Source Shortlist v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Brukes som inntak til evidence-matrix-food-tg.md (Phase 2)
relaterte_filer:
  - research/KI-PRIORITY.md
  - research/PLATTFORM-KOBLING.md
  - research/DATA-READINESS-SLUTTRAPPORT.md
---

# Food TG Source Shortlist v0.1

Kortliste over 30-50 kilder som skal bære Insight Pack v0.1. Filtrert ned fra forskningskorpuset (≈1 630 filer) til de som faktisk kan siteres eller brukes som beslutningsgrunnlag.

## Sportagger

- `A-feed` — sirkulært fôr, importavhengighet, alternative proteiner
- `B-sidestream` — sidestrømmer, matsvinn, næringsstoffløkker, svartvann
- `C-adoption` — policy, innkjøp, marked, standarder, datakrav
- `baseline` — verdikjede, systemkart, importtall, beredskap
- `actor` — aktørkartlegging og selskapsdossiers
- `finance` — funding, finansieringsordninger
- `policy` — regulatorikk, EU/nordisk lovverk

## Kvalitetstagger

- `primær` — primærkilde (rapport, datasett, fagpublikasjon)
- `sekundær` — solid sekundærkilde (review, fagartikkel, OECD-rapport)
- `intern syntese` — egen analyse i repoet
- `uvalidert` — researchnotat eller indikasjon, må ikke siteres

## Kilder per spor

### Spor A — Sirkulært fôr og importavhengighet

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| (fyll ut i Task 1.3) | | | | |

### Spor B — Sidestrømmer, matsvinnkvalitet og næringsstoffløkker

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| (fyll ut i Task 1.4) | | | | |

### Spor C — Adoption mechanisms

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| (fyll ut i Task 1.5) | | | | |

### Baseline / actor / finance / policy

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| (fyll ut i Task 1.6) | | | | |

## Kilder som krever manuell sjekk før ekstern bruk

(5-10 kilder som er sterke men trenger verifikasjon — fylles ut etter Task 1.3-1.6)

| ID | Hvorfor manuell sjekk | Eier | Frist |
|---|---|---|---|

## Notert kildegap

Tematiske områder hvor vi ikke har tilstrekkelig kilde og må erkjenne det:

| Tema | Hva mangler | Konsekvens for Insight Pack |
|---|---|---|
```

- [ ] **Steg 2: Commit skjelett**

```bash
git add docs/project/mandates/source-shortlist-food-tg.md
git commit -m "docs(mandates): scaffold source shortlist with track and quality tags"
```

---

### Task 1.3: Populér Spor A (sirkulært fôr og importavhengighet)

**Mål:** Minst 10 sterke kilder for Spor A.

**Primære kandidater (fra arbeidsplan seksjon 9):**

- `research/perplexity-20-04-26/alt-for-ingredienser-bsf-encelleprotein.md`
- `research/perplexity-20-04-26/alt-for-kommersialisert-norden-2025.md`
- `research/perplexity-20-04-26/alt-protein-for-barrierer-systematisk.md`
- `research/perplexity-20-04-26/for-tap-oppdrett-70pst-faktasjekk.md`
- `research/perplexity-20-04-26/konkursanatomi-alt-protein-10-case.md`
- `research/perplexity-20-04-26/rolaere-finland-sirkulaer-for.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p07-alt-fiskefor-aktorkart-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p09-soyaimport-norden-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p12-fiskemel-verdikjede-global-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p13-ax-framtidens-foder-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p18-insektindustri-norden-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p19-bsf-substrat-sidestrommer-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p25-matavfall-til-for-regulering-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p30-oppdrett-massebalanse-2024-2026-04-20.md`
- `research/norden/verdikjede/04-innsatsvarer.md`
- `research/norden/verdikjede/07b-sjomatfor-saarbarhet.md`

- [ ] **Steg 1: Åpne hver kandidatfil og les sammendrag/innledning (rg på "## Sammendrag" eller første 50 linjer)**

```bash
rg -l "fiskefor|alt-protein|soya|volare|insekt" research/ | head -30
```

- [ ] **Steg 2: Velg minst 10 og fyll i tabellen i Spor A**

For hver kilde, ID-format `SRC-A-001` til `SRC-A-NNN`. Fyll alle kolonner.

Eksempel:

```markdown
| SRC-A-001 | research/bibliotek/forskningsrunde-2026-04-20-r2/p07-alt-fiskefor-aktorkart-2026-04-20.md | sekundær | A-feed, actor | Aktørkart for alternative fiskeforproteiner i Norden |
| SRC-A-002 | research/perplexity-20-04-26/for-tap-oppdrett-70pst-faktasjekk.md | uvalidert | A-feed, baseline | Faktasjekk på 70%-claim for fôrtap; trenger primærkildebekreftelse |
```

- [ ] **Steg 3: Verifiser akseptkriterier for Spor A**

- ≥10 kilder
- Ingen kilde har tomme felter
- Minst 5 har kvalitetstag `primær` eller `sekundær`
- Kilder med `uvalidert` er flagget for manuell sjekk

- [ ] **Steg 4: Commit (kombineres med Task 1.4-1.5 i én commit etter Task 1.5)**

---

### Task 1.4: Populér Spor B (sidestrømmer, matsvinn, næringsstoffer)

**Primære kandidater:**

- `research/norden/verdikjede/06-matsvinn-sirkulaer.md`
- `research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md`
- `research/perplexity-20-04-26/sidestroemmer-plantebasert-norden.md`
- `research/perplexity-20-04-26/npk-tap-svartvann-norden.md`
- `research/perplexity-20-04-26/mikroplast-biorest-norske-anlegg.md`
- `research/perplexity-20-04-26/biorest-innovatoerer-nordisk-smaa-aktoerer.md`
- `research/perplexity-20-04-26/matstroemmer-norden-kvantitativ.md`
- `research/perplexity-20-04-26/matsvinn-tallmatrise-nordisk-estimat.md`
- `research/perplexity-20-04-26/naeringstap-oppdrett-figur-intervaller.md`
- `research/perplexity-20-04-26/npk-gjenvinnbar-fra-ekskreta-nordisk-tabell.md`
- `research/perplexity-20-04-26/naeringsloop-oppdrett-jordbruk-kvantitativ.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p20-havremelk-okara-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p22-sidestrom-til-mat-prosjekter-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p23-gronn-pose-matavfall-innsamling-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p24-biorest-som-gjodsel-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p27-norske-avlopsanlegg-naeringsgjenvinning-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p28-kildeseparering-globalt-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p29-gjodselkrise-importavhengighet-2026-04-20.md`

- [ ] **Steg 1: Velg minst 10 og fyll i tabellen i Spor B**

ID-format `SRC-B-001` til `SRC-B-NNN`.

- [ ] **Steg 2: Verifiser akseptkriterier (samme som 1.3)**

---

### Task 1.5: Populér Spor C (adoption mechanisms)

**Primære kandidater:**

- `research/norden/regulatory-policy-landscape-nordic.md`
- `research/analyse/offentlig-innkjop-nordisk.md` (sjekk eksistens)
- `research/norden/nordisk-markedsstruktur-data-2026.md`
- `research/whitepaper/executive-brief.md`
- `research/whitepaper/food-systems-2026-draft-v1-reviewed.md`
- `research/regulatory/` (filer i denne mappen)
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p06-ubesvarte-policy-sporsmaal-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p10-eu-tse-novel-food-regulering-2026-04-20.md`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p25-matavfall-til-for-regulering-2026-04-20.md`
- `research/perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md`
- `research/perplexity-20-04-26/kpi-sirkularitet-r9-rammeverk.md`
- `src/lib/data/kpis.ts` (referanse, ikke siterbar)

- [ ] **Steg 1: Verifiser hvilke filer som faktisk eksisterer**

```bash
rg --files research/ | rg "regulatory|policy|innkjop|whitepaper|kpi" | head -40
```

- [ ] **Steg 2: Velg minst 10 og fyll i tabellen i Spor C**

ID-format `SRC-C-001` til `SRC-C-NNN`.

- [ ] **Steg 3: Verifiser akseptkriterier**

---

### Task 1.6: Populér baseline / actor / finance / policy + commit

**Hensikt:** Disse er ikke spor, men støtte-kilder som brukes på tvers.

**Primære kandidater:**

- `research/DATA-READINESS-SLUTTRAPPORT.md` — `baseline`
- `research/PLATTFORM-KOBLING.md` — `baseline`
- `research/RESEARCH-MISSIONS.md` — `baseline`
- `research/VERDIKJEDE-KARTLEGGING-PLAN.md` — `baseline`
- `research/norden/verdikjede/01-primaerproduksjon.md` til `10-kryss-analyse.md` — `baseline`
- `src/lib/data/actors.ts` — `actor`
- `research/interviews/aktorkart-systematisk-2026.md` — `actor`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p16-nordiske-do-tanks-stiftelser-2026-04-20.md` — `actor`
- `research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md` — `actor`
- `research/whitepaper/executive-brief.md` — `policy`

- [ ] **Steg 1: Fyll inn baseline-/actor-/finance-/policy-kilder**

ID-format `SRC-BASE-001`, `SRC-ACT-001`, `SRC-FIN-001`, `SRC-POL-001`.

- [ ] **Steg 2: Identifiser 5-10 kilder som krever manuell sjekk**

Fyll i seksjonen "Kilder som krever manuell sjekk før ekstern bruk".

- [ ] **Steg 3: Skriv "Notert kildegap" basert på inntrykk fra Task 1.3-1.6**

Eksempler på sannsynlige gap (lagt til kun hvis ingen sterk kilde dekker dem):

- Detaljert finance/funding-data per nordisk program
- Sviktede pilotcase med dokumentert konkursanatomi (utover de 10-15 vi har)
- Live aktørrespons (per definisjon — denne pakka er pre-validering)

- [ ] **Steg 4: Verifiser totale akseptkriterier (Phase 1)**

- ≥30 kilder totalt
- ≥10 sterke kilder per hovedspor (A, B, C)
- Alle kilder har kvalitetstag og minst én sportag
- Manuell sjekk-liste har 5-10 oppføringer
- Kildegap-tabellen er ikke tom (hvis full dekning, sett "Ingen kjente gap" eksplisitt)

- [ ] **Steg 5: Commit**

```bash
git add docs/project/mandates/source-shortlist-food-tg.md
git commit -m "docs(mandates): populate source shortlist with 30+ tracked sources for A/B/C"
```

**Akseptkriterier Phase 1:**
- Minst 30 (ideelt 40-50) kilder kategorisert
- Hver påstand i Insight Pack v0.1 vil kunne kobles til ≥1 SRC-ID
- Kildevolum styres aktivt — vi bruker IKKE hele korpuset, kun shortlisten

---

## Phase 2: Evidens- og kvalitetsvurdering (P2)

### Task 2.1: Opprett evidence-matrix-food-tg.md med struktur og kvalitetsskala

**Filer:**
- Opprett: `docs/project/mandates/evidence-matrix-food-tg.md`

- [ ] **Steg 1: Skriv skjelett**

```markdown
---
tittel: Food TG Evidence Matrix v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-29
neste_handling: Brukes som evidens-grunnlag i claim-register-food-tg.md (Phase 3)
relaterte_filer:
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
---

# Food TG Evidence Matrix v0.1

Kvalitetsvurdering av kildene i source shortlist. Hver rad er én evidensoppføring som senere knyttes til claims i claim register.

## Kvalitetsskala

| Score | Betydning |
|---|---|
| 5 | Primærkilde, fersk, direkte relevant, kan siteres |
| 4 | Solid sekundærkilde eller fagrapport, relevant |
| 3 | Nyttig, men indirekte eller delvis utdatert |
| 2 | Intern syntese eller ufullstendig kilde |
| 1 | Hypotese/indikasjon, må ikke brukes uten validering |

## Siterbarhet

- `Høy` — kan brukes i ekstern publikasjon med direkte sitering
- `Medium` — kan brukes som referanse, men må kontekstualiseres
- `Lav` — kan vises internt, må valideres før ekstern bruk

## Evidens (Spor A — Sirkulært fôr og importavhengighet)

| ID | Spor | Kilde (SRC-ID + filsti) | Kildetype | Hovedfunn | Støtter claim | Svekkelse/usikkerhet | Siterbarhet | Kvalitet | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| EV-A-001 | A | (fyll ut i Task 2.2) | | | | | | | |

## Evidens (Spor B — Sidestrømmer, matsvinnkvalitet, næringsstoffløkker)

| ID | Spor | Kilde (SRC-ID + filsti) | Kildetype | Hovedfunn | Støtter claim | Svekkelse/usikkerhet | Siterbarhet | Kvalitet | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| EV-B-001 | B | (fyll ut i Task 2.3) | | | | | | | |

## Evidens (Spor C — Adoption mechanisms)

| ID | Spor | Kilde (SRC-ID + filsti) | Kildetype | Hovedfunn | Støtter claim | Svekkelse/usikkerhet | Siterbarhet | Kvalitet | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| EV-C-001 | C | (fyll ut i Task 2.4) | | | | | | | |

## Evidens (baseline / actor / finance / policy)

| ID | Spor | Kilde | Kildetype | Hovedfunn | Støtter claim | Svekkelse/usikkerhet | Siterbarhet | Kvalitet | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| EV-BASE-001 | baseline | (fyll ut i Task 2.5) | | | | | | | |
```

- [ ] **Steg 2: Commit skjelett**

```bash
git add docs/project/mandates/evidence-matrix-food-tg.md
git commit -m "docs(mandates): scaffold evidence matrix with quality scale"
```

---

### Task 2.2: Skriv EV-A-oppføringer (≥10 entries)

- [ ] **Steg 1: For hver SRC-A-XXX i source shortlist, opprett tilhørende EV-A-XXX**

Gå gjennom kildene én etter én. For hver kilde:

1. Les fil/sammendrag.
2. Hent ut 1-3 setningers hovedfunn.
3. Identifiser hva kilden IKKE beviser (svekkelse).
4. Sett siterbarhet (Høy/Medium/Lav).
5. Sett kvalitet 1-5.
6. Identifiser neste handling: `bruk`, `sjekk`, `erstatt`, `valider med aktør`.

Eksempel-rad:

```markdown
| EV-A-001 | A | SRC-A-001 / research/bibliotek/forskningsrunde-2026-04-20-r2/p07-alt-fiskefor-aktorkart-2026-04-20.md | Sekundær fagrapport | Identifiserer 12+ nordiske aktører på alt-fôr inkludert insekt, encelleprotein, BSF og fermentering | CL-A-001, CL-A-003 | Mangler oppdaterte volum/markedsandeler per aktør | Medium | 4 | Bruk som aktørkart; valider med Volare/AX |
```

- [ ] **Steg 2: Verifiser ≥10 EV-A-oppføringer**

- [ ] **Steg 3: Sjekk at "Støtter claim"-feltet inneholder placeholders (CL-A-XXX) som vil opprettes i Phase 3**

---

### Task 2.3: Skriv EV-B-oppføringer (≥10 entries)

- [ ] **Steg 1: Som Task 2.2, men for SRC-B-XXX**
- [ ] **Steg 2: Verifiser ≥10 EV-B-oppføringer**

---

### Task 2.4: Skriv EV-C-oppføringer (≥10 entries)

- [ ] **Steg 1: Som Task 2.2, men for SRC-C-XXX**
- [ ] **Steg 2: Verifiser ≥10 EV-C-oppføringer**

---

### Task 2.5: Skriv støtte-evidens og commit

- [ ] **Steg 1: Skriv EV-BASE/EV-ACT/EV-FIN/EV-POL-oppføringer (samlet ~10-15)**

- [ ] **Steg 2: Verifiser totale akseptkriterier (Phase 2)**

- Hver påstand-orientert kilde har EV-ID
- Alle tall/sterke faktapåstander har siterbarhet `Høy` eller `Medium` (eller er flagget som hypotese)
- Usikre antakelser er synlige med kvalitet 1-2
- Ingen tomme rader

- [ ] **Steg 3: Commit hele evidence matrix**

```bash
git add docs/project/mandates/evidence-matrix-food-tg.md
git commit -m "docs(mandates): populate evidence matrix with 30+ cited entries across A/B/C"
```

**Akseptkriterier Phase 2:**
- ≥30 evidensoppføringer fordelt på spor
- Alle med kvalitet, siterbarhet og neste handling
- Krysslenker til source shortlist via SRC-ID
- Forwards-referanser til claims (CL-IDs som lages i Phase 3)

---

## Phase 3: Claim og hypoteser (P3)

### Task 3.1: Opprett claim-register-food-tg.md med struktur

**Filer:**
- Opprett: `docs/project/mandates/claim-register-food-tg.md`

- [ ] **Steg 1: Skriv skjelett**

```markdown
---
tittel: Food TG Claim Register v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-30
neste_handling: Brukes som hypotesegrunnlag i sporbriefer (Phase 4-5)
relaterte_filer:
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
---

# Food TG Claim Register v0.1

Strukturert oversikt over påstander, hypoteser og beslutningsforslag som Insight Pack v0.1 hviler på. Skiller eksplisitt mellom hva vi vet (fakta), hva vi tror (hypoteser) og hva som må valideres eksternt.

## Felter

| Felt | Beskrivelse |
|---|---|
| Claim-ID | `CL-A-001`, `CL-B-001`, `CL-C-001` |
| Påstand/hypotese | Kort formulering (≤2 setninger) |
| Type | Fakta, analyse, hypotese, beslutningsforslag |
| Spor | A, B eller C |
| Evidens | EV-IDer fra evidence matrix |
| Konfidens | Høy, medium, lav |
| Risiko hvis feil | Hva en beslutning kan bomme på |
| Valideringsbehov | Hvem eller hva må bekrefte/avkrefte |
| Status | Utført internt, validert eksternt osv. |
| Neste handling | Konkret neste steg |

## Claim-kategorier per spor (mål: ≥5 claims, ≥2 hypoteser per spor)

| Kategori | Eksempel |
|---|---|
| Problemclaim | Importavhengighet i fôr skaper sårbarhet og sirkularitetsmulighet |
| Ressursclaim | Sidestrømmer finnes, men kvalitet/logistikk begrenser høyverdig bruk |
| Barrierclaim | Regulering, innkjøp og markedsmakt hindrer skalering |
| Aktørclaim | Bestemte aktører kan validere eller bære et pilotspor |
| Pilotclaim | Et konkret case kan bli finansierbart innen roadmap-perioden |
| Adoptionclaim | En mekanisme kan endre praksis raskere enn ny teknologi alene |

## Spor A — Claims

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-A-001 | (fyll ut i Task 3.2) | | A | | | | | Utført internt | |

## Spor B — Claims

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-B-001 | (fyll ut i Task 3.3) | | B | | | | | Utført internt | |

## Spor C — Claims

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-C-001 | (fyll ut i Task 3.4) | | C | | | | | Utført internt | |
```

- [ ] **Steg 2: Commit skjelett**

```bash
git add docs/project/mandates/claim-register-food-tg.md
git commit -m "docs(mandates): scaffold claim register with type and validation fields"
```

---

### Task 3.2: Skriv ≥5 CL-A-claims (med ≥2 hypoteser)

- [ ] **Steg 1: Sett opp claims for Spor A basert på evidence matrix**

Hver claim må:
- Ha minst én EV-A-ID i Evidens-feltet
- Ha tydelig type (Fakta/Analyse/Hypotese/Beslutningsforslag)
- Ha eksplisitt valideringsbehov hvis hypotese

Eksempel-claims (skal tilpasses faktisk evidens i matrisen):

```markdown
| CL-A-001 | Norske oppdrettsanlegg har importavhengighet på >60% av proteinråvarene, primært soya og fiskemel | Fakta | A | EV-A-005, EV-A-008 | Høy | Vil overdrive sirkularitetsbehovet hvis tallet er feil | (allerede dokumentert) | Utført internt | Bruk som baseline-figur |
| CL-A-002 | Insekt- og encelleprotein-aktører som Volare og Foods of Norway kan industrialisere innen 2028 hvis regulatoriske barrierer løses | Hypotese | A | EV-A-001, EV-A-003 | Medium | Pilotvalg kan bli urealistisk | Volare, AX Foundation, Foods of Norway | Utført internt | Valider med aktørintervju |
| CL-A-003 | Sidestrømsbasert BSF-substrat kan redusere fiskefôr-importbehov med 5-10% innen 2030 i Norden | Hypotese | A | EV-A-007, EV-B-004 | Lav | Roadmap kan bygge på urealistisk skala-antakelse | EU-regulator + nordiske BSF-aktører | Utført internt | Sjekk EU TSE-regulering først |
```

- [ ] **Steg 2: Verifiser akseptkriterier for Spor A**

- ≥5 claims
- ≥2 hypoteser flagget for ekstern validering
- Hver claim har EV-ID

---

### Task 3.3: Skriv ≥5 CL-B-claims (med ≥2 hypoteser)

- [ ] **Steg 1: Sett opp claims for Spor B**

Eksempler på områder å dekke (basert på arbeidsplan seksjon 9.B):

- Hvor oppstår viktigste sidestrømmene?
- Hva hindrer høyverdig bruk?
- Hvilke standarder/logistikk mangler?
- Hvordan kobles matsvinn/svartvann/biorest?
- Hvilke nordiske case er bevist (Recolab/Helsingborg)?

- [ ] **Steg 2: Verifiser akseptkriterier**

---

### Task 3.4: Skriv ≥5 CL-C-claims + krysslink + commit

- [ ] **Steg 1: Sett opp claims for Spor C**

Eksempler:

- Hvilke mekanismer flytter praksis raskest (innkjøp, standard, regulering, data)?
- Hvor hindrer markedsstruktur sirkulær skalering?
- Hva kan offentlige innkjøp/HORECA/dagligvare faktisk gjøre?
- Hvilke adoption metrics bør inn i roadmap?

- [ ] **Steg 2: Oppdater "Støtter claim"-feltet i evidence matrix**

For hver EV-XXX i evidence matrix, fyll inn de CL-IDene fra denne fasen som kilden støtter.

- [ ] **Steg 3: Verifiser totale akseptkriterier (Phase 3)**

- Minst 5 claims per spor (15+ totalt)
- Minst 2 hypoteser per spor merket for aktørvalidering
- Ingen claim er kvalifisert som "validert eksternt"
- Forwards-link til briefs (de lages i Phase 4-5)

- [ ] **Steg 4: Commit**

```bash
git add docs/project/mandates/claim-register-food-tg.md docs/project/mandates/evidence-matrix-food-tg.md
git commit -m "docs(mandates): populate claim register and back-link evidence matrix"
```

**Akseptkriterier Phase 3:**
- ≥15 claims totalt
- ≥6 hypoteser flagget for ekstern validering
- Tydelig krysslink mellom EV-IDer og CL-IDer

---

## Phase 4: Sporbriefs A og B

### Task 4.1: Opprett track-brief-a-feed-import.md

**Filer:**
- Opprett: `docs/project/mandates/track-brief-a-feed-import.md`

**Brief-mal (felles for A, B, C):**

| Seksjon | Innhold | Kilde |
|---|---|---|
| Problem | Hva er systemproblemet? | EV/CL-IDer fra Spor A |
| Hvorfor nå | Hvorfor er dette relevant for TG og 2026-2029? | Mandatet + arbeidsplanen |
| Hva vi vet | 5-8 kildeunderbygde funn | EV-IDer |
| Hva vi tror | 2-4 hypoteser som må valideres | CL-IDer (Hypotese) |
| Barrierer | Regulering, marked, teknologi, data, logistikk | EV/CL fra Spor C |
| Aktører | Hvem må med, hvem må høres, hvem kan eie tiltak? | actor-shortlist (Phase 6) |
| Pilotmuligheter | 1-3 mulige piloter | CL-IDer (Pilotclaim) |
| Adoption/funding | Hva kan skape gjennomføring? | Spor C + finance |
| Decision ask | Hva må internt team beslutte? | Egen seksjon |

- [ ] **Steg 1: Skriv frontmatter og brief**

```markdown
---
tittel: "Track Brief A: Sirkulært fôr og importavhengighet"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-05-01
neste_handling: Cathrine reviewer 02.05; brukes som input til decision memo 04.05
relaterte_filer:
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/decision-memo-food-tg-scope.md
anbefaling: "(Sett etter at briefen er ferdig: gå videre / hold som støttespor / parkér)"
---

# Track Brief A: Sirkulært fôr og importavhengighet

## Problem

(2-3 setninger om systemproblemet. Bruk CL-A-001 og relaterte fakta-claims.)

## Hvorfor nå

(2-3 setninger som binder til mandat, M13-M18 og 2026-2029. Hvorfor må TG-en velge dette nå?)

## Hva vi vet

(5-8 punkter med EV-A-XX referanser i parentes. Bruk kun fakta- eller analyse-claims, ikke hypoteser.)

1. ... (EV-A-001)
2. ... (EV-A-002)
...

## Hva vi tror

(2-4 hypoteser med CL-A-XX referanser. Hver må ha "valideringsbehov: <aktør>".)

1. ... (CL-A-002, valideringsbehov: Volare)
2. ...

## Barrierer

| Type | Barriere | Evidens |
|---|---|---|
| Regulering | EU TSE-regelverk for animalske biprodukter i fôr | EV-A-XX, EV-POL-XX |
| Marked | Volum-konsentrasjon hos store fôrprodusenter | EV-A-XX |
| Teknologi | Skalerbarhet av encelleprotein per nordisk land | EV-A-XX |
| Data | Mangler proveniens-data for sidestrømmer brukt som fôringredienser | EV-A-XX, EV-B-XX |
| Logistikk | Kjølekjede og volum-stabilitet for BSF-substrat | EV-A-XX |

## Aktører

(Sett tabell etter Phase 6 actor pack. For nå, bruk plassholder med navn fra status-notatets arbeidsstrøm C.)

| Aktør | Type | Land | Mulig rolle | Ask |
|---|---|---|---|---|
| Volare | Fôraktør | NO/SE | Pilot/datainput | Validering av CL-A-002 |
| AX Foundation | Stiftelse | SE | Strategisk partner | Sondering for samarbeid |
| Foods of Norway | Forskning | NO | Faglig partner | Råd om regulatoriske barrierer |
| Royal Greenland | Sjømat | DK/GL | Demand-side | Sondering om sidestrømsverdi |
| EcoFish/Gas2Feed | Pilot | DK/NO | Pilotaktør | Test av CL-A-003 |

## Pilotmuligheter

(1-3 muligheter, hver med en setning om scope, eier og tidslinje.)

1. **Pilot A1:** Nordisk BSF-substrat fra ølbryggeri-sidestrøm til oppdrettsfôr. Mulig eier: Volare. Tidslinje: 2027.
2. ...

## Adoption / funding

| Mekanisme | Hva må skje |
|---|---|
| Regulering | EU TSE-justering eller nasjonalt unntak for spesifikke biprodukter |
| Innkjøp | Offentlig oppdrett (Havbruksinstituttet, kommunal lakseproduksjon) som demand-side |
| Funding | Nordic Innovation, Horizon Europe Bioeconomy, Interreg ÖKS |
| Standardisering | Nordisk fôrkvalitet-merking (samarbeid med EFSA) |

## Decision ask

Hva internt team må beslutte (5.5):

1. Skal Spor A være hovedspor, støttespor eller parkeres?
2. Hvilken pilot prioriteres for ekstern dialog?
3. Hvilken aktør kontaktes først?

## Anbefaling

`<gå videre / hold som støttespor / parkér>` — fyll inn etter at briefen er ferdig basert på styrken i evidens og hypoteser.

## Aktørspørsmål for første samtale

(Minst ett konkret spørsmål per aktør i pilotmulighet 1.)

- Volare: "Kan dere validere at sidestrømsbasert BSF-substrat kan dekke 5-10% av nordisk fiskefôr innen 2030 (CL-A-003)?"
```

- [ ] **Steg 2: Fyll inn alle seksjoner ved å plukke riktige EV-/CL-IDer fra matrisene**

- [ ] **Steg 3: Verifiser akseptkriterier (Brief A)**

- Briefen kan leses på <10 minutter (≤3 sider når printet)
- Anbefaling er satt eksplisitt
- Minst ett konkret aktørspørsmål
- Alle EV-/CL-referanser eksisterer

- [ ] **Steg 4: Commit**

```bash
git add docs/project/mandates/track-brief-a-feed-import.md
git commit -m "docs(mandates): add track brief A on circular feed and import dependence"
```

---

### Task 4.2: Opprett track-brief-b-sidestreams-nutrients.md

**Filer:**
- Opprett: `docs/project/mandates/track-brief-b-sidestreams-nutrients.md`

- [ ] **Steg 1: Bruk samme mal som Task 4.1 men med Spor B-innhold**

Spørsmålene briefen skal besvare (fra arbeidsplan 9.B):

1. Hvor oppstår de viktigste sidestrømmene og kvalitetstapene?
2. Hva hindrer høyverdig bruk før biogass/kompost?
3. Hvilke data, standarder eller logistikkløsninger mangler?
4. Hvordan kobles matsvinn, svartvann, biorest og næringsstoffløkker?
5. Hvilke case kan brukes som nordiske referanser?

Aktør-plassholder:
- Recolab/Helsingborg, Volare, Too Good To Go, NMBU, norske avløpsanlegg, Matvett, Foodstudio

- [ ] **Steg 2: Verifiser akseptkriterier**

- [ ] **Steg 3: Commit**

```bash
git add docs/project/mandates/track-brief-b-sidestreams-nutrients.md
git commit -m "docs(mandates): add track brief B on sidestreams and nutrient loops"
```

**Akseptkriterier Phase 4:**
- Brief A og B begge ≤10 min lesetid
- Begge har eksplisitt anbefaling
- Begge har minst ett konkret aktørspørsmål

---

## Phase 5: Sporbrief C + decision memo (utkast)

### Task 5.1: Opprett track-brief-c-adoption.md

**Filer:**
- Opprett: `docs/project/mandates/track-brief-c-adoption.md`

- [ ] **Steg 1: Bruk samme mal med Spor C-innhold**

Spørsmål (fra arbeidsplan 9.C):

1. Hvilke mekanismer kan flytte praksis raskt (innkjøp, standarder, data, regulering, tilgang)?
2. Hvor hindrer markedsstruktur og logistikk sirkulær skalering?
3. Hva kan offentlige innkjøp, dagligvare, HORECA eller sjømataktører gjøre?
4. Hva må være policyanbefaling, og hva må være pilot?
5. Hvilke adoption metrics skal inn i roadmap?

Aktør-plassholder:
- Helsedirektoratet, Anskaffelser.no, NorgesGruppen/Coop/Reitan, NHO Mat og Drikke, NMBU, Foodstudio, AX Foundation, Nordic Innovation

- [ ] **Steg 2: Verifiser akseptkriterier**

- [ ] **Steg 3: Commit**

```bash
git add docs/project/mandates/track-brief-c-adoption.md
git commit -m "docs(mandates): add track brief C on adoption mechanisms"
```

---

### Task 5.2: Opprett decision-memo-food-tg-scope.md (utkast)

**Filer:**
- Opprett: `docs/project/mandates/decision-memo-food-tg-scope.md`

**Hensikt:** Forberede beslutningsmøtet 05.05 ved å presentere alternativer + anbefaling med begrunnelse. Selve beslutningen tas av Jan Thomas/Cathrine/Einar.

- [ ] **Steg 1: Skriv decision memo**

```markdown
---
tittel: "Decision Memo: Food TG scope for sprint 1-7"
status: Utført internt
eier: Gabriel (utkast); beslutter: Jan Thomas/Einar/Cathrine
sist_oppdatert: 2026-05-04
neste_handling: Diskuteres og beslutning logges 05.05; oppdaterer tg-charter etter beslutning
relaterte_filer:
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - docs/project/mandates/decision-log-food-tg.md
---

# Decision Memo: Food TG scope for sprint 1-7

## Bakgrunn

Mandatet (`food-transition-group-mandate-2026-04-21.md`) krever 1-3 års roadmap, ekstern koalisjon i flere nordiske land, og minst to finansierbare prosjektspor. Med dato 04.05 er det 35 dager til M16 (08.06) og 60+ dager til M17. Et bredt scope gjør tidsfristen urealistisk.

Insight Pack v0.1 (denne pakka, ferdig 08.05) viser hva som faktisk er evidensgrunnlag i hvert spor og hva som må valideres eksternt.

## Beslutninger som trengs

| # | Beslutning | Alternativer | Anbefalt valg | Begrunnelse |
|---|---|---|---|---|
| 1 | Hovedscope | A alene; B alene; C som støtte; A+B; A+B+C | **A+B med C som adoption-lag** | A og B har sterkest evidens og direkte kobling til mandatets ressurs/næringsstoffløkker. C som adoption-lag fanger opp policy/marked uten å bli eget hovedspor. |
| 2 | Antall nordiske land | 3, 4 eller 5 | **4 (NO, SE, DK, FI)** | 4 gir reell nordisk legitimitet uten å overstrekke kapasitet. Island kan inkluderes i Sprint 6+. |
| 3 | Første aktører | Relasjonelle; strategiske; begge | **Relasjonelt + 2 strategiske sonderinger** | Relasjonelle aktører gir høy responssannsynlighet. To strategiske gir validitetstest mot demand-side. |
| 4 | Workshopformat (M15) | Stor workshop; liten scoping; intervjuserie | **Liten scoping session (≤15 personer) + intervjurunde** | Lavere logistikkrisiko, høyere kvalitet på respons. Stor workshop kan flyttes til M17. |
| 5 | Roadmapformat | Whitepaper; roadmap; slide deck; nettside | **Roadmap som hovedleveranse, whitepaper som backing** | Mandatet krever roadmap. Whitepaper finnes allerede som draft og kan brukes som vedlegg. |
| 6 | Chair/co-chair | Jan Thomas; Cathrine; ekstern co-chair; delt | **Avgjøres separat innen 12.05** | Krever bredere strategisk diskusjon enn dette memo dekker. |

## Konsekvenser av anbefalingen

**Hvis A+B med C som adoption-lag velges:**

- **Pilot briefs (Sprint 4):** 1 pilot fra A (sannsynligvis BSF-substrat eller insektprotein), 1 pilot fra B (sannsynligvis sidestrøm-til-mat eller næringsstoffløkke), totalt 2 piloter.
- **Aktørprioritet:** Volare og AX (A); Recolab/Helsingborg og NMBU (B); Anskaffelser.no og en demand-side aktør (C).
- **Funding-spor:** Nordic Innovation Bioeconomy og Horizon Europe Cluster 6 som primær; Interreg ÖKS som sekundær.
- **Roadmap-fokus:** 2026-2029 med pilot-launch i 2027 og scale i 2028-2029.

**Hvis bredere scope velges (alle tre som hovedspor):**

- Risiko for tynne pilotbriefs.
- Krever doblet aktørkapasitet for outreach.
- Roadmap M16-frist (08.06) kan bli urealistisk.

## Hva som ikke prioriteres nå

Eksplisitt parkert (kan re-aktiveres etter M18):

- Generell matberedskap utenfor sirkulær kontekst
- Hele dagligvarekonkurransen som selvstendig tema
- Bredt sweep over alle alternative proteiner
- Sjømatfôr utover det som krysser Spor A

## Beslutningsprosess

1. Memo deles internt 04.05.
2. Diskuteres i tirsdagsmøte 05.05.
3. Beslutning logges i `decision-log-food-tg.md` samme dag.
4. `tg-charter-food-2026.md` oppdateres med endelig scope innen 06.05.
5. Actor validation pack (Phase 6) bygges på beslutningen.

## Krysslenker

- Track Brief A: `docs/project/mandates/track-brief-a-feed-import.md`
- Track Brief B: `docs/project/mandates/track-brief-b-sidestreams-nutrients.md`
- Track Brief C: `docs/project/mandates/track-brief-c-adoption.md`
- Claim register: `docs/project/mandates/claim-register-food-tg.md`
- Evidence matrix: `docs/project/mandates/evidence-matrix-food-tg.md`
```

- [ ] **Steg 2: Verifiser akseptkriterier**

- Memo presenterer alternativer og anbefaling per beslutningspunkt
- Konsekvenser av anbefaling er tydelig beskrevet
- Sti for beslutningsprosess er klar

- [ ] **Steg 3: Commit**

```bash
git add docs/project/mandates/decision-memo-food-tg-scope.md
git commit -m "docs(mandates): add decision memo draft for 05.05 scope decision"
```

**Akseptkriterier Phase 5:**
- Brief C er ferdig med samme kvalitet som A og B
- Decision memo er klart for ekstern (intern) gjennomgang
- Alle krysslenker fungerer (åpne hver fil og bekreft at lenkemål eksisterer)

---

## Phase 6: Aktørdialogforberedelse (P5)

> **Note:** Phase 6 starter dag 8 (06.05) — etter beslutningsmøtet 05.05. Aktørliste og asks må kalibreres mot vedtatt scope. Hvis scope ikke er besluttet 05.05, lag aktørliste basert på anbefalingen i decision memo og merk som "scope-avhengig".

### Task 6.1: Opprett actor-validation-pack-food-tg.md skjelett

**Filer:**
- Opprett: `docs/project/mandates/actor-validation-pack-food-tg.md`

- [ ] **Steg 1: Skriv frontmatter og struktur**

```markdown
---
tittel: Food TG Actor Validation Pack v0.1
status: Utført internt
eier: Cathrine + Thea + Gabriel
sist_oppdatert: 2026-05-06
neste_handling: Outreach 08.05 (Jan Thomas/Cathrine/Thea)
relaterte_filer:
  - docs/project/mandates/decision-memo-food-tg-scope.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - src/lib/data/actors.ts
---

# Food TG Actor Validation Pack v0.1

Aktørprioritering, ask, intervjuguide og outreach-logg for ekstern validering av Insight Pack v0.1.

Forutsetning: Scope-beslutning fra 05.05 er logget i `decision-log-food-tg.md`. Hvis ikke, dokumenter "scope-avhengig" på relevante actor-rader.

## Aktørkategorier

| Kategori | Eksempler |
|---|---|
| Do-tanks/stiftelser | AX Foundation, Rethink Food, Foodstudio |
| Verdikjedeaktører | Volare, Tine, Nortura, Royal Greenland, Nordic Choice |
| Offentlig/kommunal | Anskaffelser.no, Helsedirektoratet, kommunale avfallsanlegg |
| Akademia/forskning | NMBU, RISE, AAU, LUKE, NTNU |
| Finansiering | Nordic Innovation, Interreg ÖKS, Horizon Cluster 6, EU LIFE |
| Case-eiere | Recolab/Helsingborg, 100% Fish, Too Good To Go, Volare |

## Prioritert aktørliste

(Mål: ≥10 aktører med tydelig ask. Fyll ut i Task 6.2.)

| ID | Aktør | Organisasjon | Land | Kategori | Spor (A/B/C) | Relasjon (varm/kald) | Prioritet | Ask | Hypotese å validere | Kontaktvei | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Intervjuguide

(Fyll ut i Task 6.3 — 6-8 spørsmål for 30-min samtale.)

## First-conversation shortlist

(3-5 navn, valgt fra prioritert aktørliste. Fyll ut i Task 6.5.)

| Aktør | Hvorfor først | Hvem leder samtalen | Frist for outreach | Frist for samtale |
|---|---|---|---|---|

## Outreach-logg

| Dato | Aktør | Initiert av | Kanal | Status | Neste handling |
|---|---|---|---|---|---|

## Consent / notatstandard

- Pre-read sendes ≥48 timer før samtale.
- Samtale er 30 min med to roller: én leder, én noterer.
- Notater oppdateres samme dag i outreach-logg.
- "Validert eksternt" krever at aktør eksplisitt kan siteres ELLER at vi kan referere til samtalen anonymt med datostempel.
- "Forpliktet eksternt" krever skriftlig ja på rolle, data, pilot eller finansiering.

## Aktørstatus-merking

| Status | Betydning |
|---|---|
| Identifisert | I prioritert liste, ikke kontaktet |
| Kontaktet | Outreach sendt |
| Respons | Aktør har svart (positivt eller negativt) |
| Møte booket | Tid avtalt |
| Møte gjennomført | Notater finnes |
| Validert | Konkret respons på en CL-ID |
| Forpliktet | Skriftlig ja på rolle/data/pilot/funding |
```

- [ ] **Steg 2: Commit skjelett**

```bash
git add docs/project/mandates/actor-validation-pack-food-tg.md
git commit -m "docs(mandates): scaffold actor validation pack with consent standard"
```

---

### Task 6.2: Fyll inn aktørliste (≥10 prioriterte)

- [ ] **Steg 1: Hent aktører fra eksisterende kilder**

```bash
rg -l "AX|Volare|Recolab|NMBU|Foodstudio" research/interviews/ src/lib/data/
cat src/lib/data/actors.ts | head -100
```

- [ ] **Steg 2: Fyll i prioritert aktørliste**

Rekkefølge for prioritering:

1. Aktører med varm relasjon (Jan Thomas/Cathrine/Einar/Martin har kontakt)
2. Aktører med høy strategisk verdi (kan validere flere CL-IDer)
3. Aktører med pilotpotensial (Volare, Recolab, 100% Fish)
4. Aktører som dekker geografisk spredning (minst 3 nordiske land)

For hver aktør, eksplisitt:

- **Ask:** Hva ber vi om? "30-min samtale", "validering av CL-A-002", "delta i workshop 1", "vurdere pilotrolle"
- **Hypotese:** Hvilken claim skal aktøren faktisk vurdere?
- **Kontaktvei:** "Jan Thomas direkte", "via NCH", "kald e-post", "via Cathrines nettverk"

- [ ] **Steg 3: Verifiser akseptkriterier**

- ≥10 aktører
- Alle har eksplisitt ask
- Minst 4 nordiske land dekket
- Hver aktør er knyttet til minst én CL-ID

---

### Task 6.3: Skriv intervjuguide (6-8 spørsmål for 30 min)

- [ ] **Steg 1: Tilpass standard-guide fra arbeidsplan seksjon 10**

Foreslått guide (kopier fra arbeidsplan, juster basert på besluttet scope):

```markdown
## Intervjuguide

**Format:** 30 minutter video/telefon. To roller: leder + noterer. Pre-read sendt ≥48 timer før samtale.

**Innledning (3 min):** Forklar Food TG, mandatet, og at vi forbereder roadmap til juni.

**Hovedspørsmål:**

1. Hvilket sirkulært matsystemproblem mener du er mest modent for nordisk samarbeid nå?
2. Hvilke av sporene A (sirkulært fôr/import), B (sidestrømmer/næringsstoffer) eller C (adoption mechanisms) virker mest relevante fra ditt ståsted?
3. Hvilke claims i briefen er riktige, feil eller mangler nyanser? (Vise kort liste over CL-IDer)
4. Hvilke barrierer stopper skalering: regulering, marked, data, logistikk, finansiering eller tillit?
5. Hvilke aktører må være med for at dette ikke bare blir analyse?
6. Hvilken pilot eller demonstrator ville du prioritert?
7. Hva må et roadmap inneholde for at det skal være nyttig for dere?
8. Er det aktuelt å delta i workshop, gi innspill eller bidra i et videre prosjekt? Hva ville være en konkret forpliktelse?

**Avslutning (2 min):** Avklar oppfølging, samtykke til notater, neste steg.

**Spørsmålspakker per aktørtype:**

- Do-tanks: Vekt på 5, 6, 7
- Verdikjedeaktører: Vekt på 4, 5, 6
- Offentlig: Vekt på 1, 4, 7
- Akademia: Vekt på 3, 6, 7
- Finansiering: Vekt på 6, 7, 8
- Case-eiere: Vekt på 2, 3, 6
```

- [ ] **Steg 2: Verifiser at hvert spørsmål kobler til en CL-ID eller brief-seksjon**

---

### Task 6.4: Fyll outreach-logg-template og first-conversation shortlist

- [ ] **Steg 1: Identifiser 3-5 første samtaler**

Kriterier:
- Varm relasjon (sannsynlig respons innen 7 dager)
- Spredning på minst 2 spor og 2 land
- Minst 1 case-eier (kan informere pilotbriefer i Sprint 4)

- [ ] **Steg 2: Fyll inn first-conversation shortlist**

Eksempel:

```markdown
| Volare (Stein Sture-Tvete) | Pilot-validering for CL-A-002 og CL-A-003 | Cathrine | 09.05 | 14.05 |
| AX Foundation | Strategisk sondering for Spor A og Spor B | Jan Thomas | 09.05 | 15.05 |
| Recolab/Helsingborg | Case-validering for Spor B | Gabriel | 09.05 | 15.05 |
| NMBU (kontakt fra møte 21.04) | Faglig review av CL-IDer | Cathrine | 09.05 | 14.05 |
```

- [ ] **Steg 3: Outreach-loggen har én rad per planlagt samtale med "Status: Identifisert"**

---

### Task 6.5: Verifiser Phase 6 og commit

- [ ] **Steg 1: Verifiser akseptkriterier**

- ≥10 prioriterte aktører
- 3-5 første samtaler valgt
- Hver samtale knyttet til konkrete CL-IDer
- Intervjuguide ferdig
- Consent-standard dokumentert

- [ ] **Steg 2: Commit**

```bash
git add docs/project/mandates/actor-validation-pack-food-tg.md
git commit -m "docs(mandates): populate actor validation pack with first 5 conversations"
```

**Akseptkriterier Phase 6:**
- Pakka er klar til at outreach kan startes 08.05 av Jan Thomas/Cathrine/Thea
- Hvert ask er knyttet til en CL-ID
- Outreach-loggen er en levende fil — oppdateres etter hvert som svar kommer inn

---

## Phase 7: Insight Pack v0.1 syntese

### Task 7.1: Opprett food-tg-insight-pack-v0.1.md som hoveddokument

**Filer:**
- Opprett: `docs/project/mandates/food-tg-insight-pack-v0.1.md`

**Hensikt:** 5-8 sider som binder alt sammen for både internt team og første aktørsamtaler.

- [ ] **Steg 1: Skriv hoveddokument**

```markdown
---
tittel: Food TG Insight Pack v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-05-08
neste_handling: Brukes som pre-read for actor outreach (08.05+) og intern beslutning
relaterte_filer:
  - docs/project/mandates/tg-charter-food-2026.md
  - docs/project/mandates/decision-memo-food-tg-scope.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - docs/project/mandates/actor-validation-pack-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/decision-log-food-tg.md
---

# Food TG Insight Pack v0.1

**Formål:** Beslutningsklar syntese av Food Transition Groups innsiktsgrunnlag før ekstern validering. Brukes som internt beslutningsgrunnlag for scope (05.05) og som pre-read for første aktørsamtaler (08.05+).

**Statusmerking:** Hele pakka er `Utført internt`. Ingen del er `Validert eksternt` ved dato 2026-05-08.

## 1. Sammendrag (1 side)

(Skriv i denne rekkefølgen — bruk decision memo + briefer som kilde:)

- Hva er Food TGs nordiske circular food-utfordring?
- Hva er anbefalt hovedscope (A+B med C som adoption-lag, eller justert basert på beslutning)?
- Hvilke 2-3 piloter peker innsikten mot?
- Hvilke aktører prioriteres?
- Hva er beslutningen vi ber internt team og første aktører om?

## 2. Hva pakka består av

| Komponent | Fil | Hovedinnhold |
|---|---|---|
| Charter | `tg-charter-food-2026.md` | 1-side mandat, North Star, scope |
| Decision memo | `decision-memo-food-tg-scope.md` | Anbefaling om scope, første aktører, neste sprint |
| Track Brief A | `track-brief-a-feed-import.md` | Sirkulært fôr og importavhengighet |
| Track Brief B | `track-brief-b-sidestreams-nutrients.md` | Sidestrømmer og næringsstoffløkker |
| Track Brief C | `track-brief-c-adoption.md` | Adoption mechanisms |
| Actor validation pack | `actor-validation-pack-food-tg.md` | Aktørliste, ask, intervjuguide |
| Claim register | `claim-register-food-tg.md` | Påstander, hypoteser, evidens og valideringsbehov |
| Evidence matrix | `evidence-matrix-food-tg.md` | Kildekvalitet og siterbarhet |
| Source shortlist | `source-shortlist-food-tg.md` | 30-50 prioriterte kilder |
| Decision log | `decision-log-food-tg.md` | Formelle beslutninger |

## 3. Hovedfunn per spor (≤1 side per spor)

### Spor A

(Hent topp 5 funn fra Track Brief A's "Hva vi vet"-seksjon. Inkluder EV-IDer.)

### Spor B

(Som over, fra Track Brief B.)

### Spor C

(Som over, fra Track Brief C.)

## 4. Usikkerheter og hypoteser som krever validering

(Tabellform — hent topp-hypoteser fra hver brief. Sortert etter hvilket spor og hvilken aktør som skal validere.)

| CL-ID | Spor | Hypotese (kort) | Aktør som skal validere | Konsekvens hvis feil |
|---|---|---|---|---|

## 5. Anbefalt scope og første aktørprioritet

(Hent fra decision memo seksjon "Beslutninger som trengs" og "Konsekvenser av anbefalingen".)

## 6. Hva som ikke er dekket

- Eksterne aktørresponser (kommer i P7)
- Ferdig pilotbriefer med eier (kommer i Sprint 4)
- Finance note med konkrete funding-spor (kommer i Sprint 4)
- Roadmap (kommer i Sprint 5)

## 7. Begrensninger og kvalitetsnotater

- Insight Pack v0.1 er intern syntese, ikke ekstern publikasjon.
- Sterke faktapåstander har EV-IDer med kvalitet 4-5 og siterbarhet høy/medium.
- Hypoteser er eksplisitt merket og knyttet til valideringsbehov.
- Markedsstruktur og makt er brukt som barriere-/forklaringslag, ikke som hovedtema.

## 8. Neste handlinger

(Sett i prioritert rekkefølge.)

1. Internt scope-møte 05.05 → beslutning loggføres i `decision-log-food-tg.md`.
2. Outreach til 3-5 første aktører fra 08.05 → outreach-logg oppdateres samme dag.
3. Workshop 1 (M15) planlegges innen 12.05.
4. Sprint 2-7 jamfør status-arbeidsplanen.
```

- [ ] **Steg 2: Fyll inn alle seksjoner ved å hente fra eksisterende filer**

Ikke skriv ny analyse her — pakk sammen det som allerede står i briefene og decision memo. Insight Pack v0.1 er en _navigasjonslag_ over de andre filene.

- [ ] **Steg 3: Verifiser kvalitetsregler (fra arbeidsplan seksjon 18)**

1. Ingen sterke faktapåstander uten EV-ID med kvalitet ≥4
2. Ingen "validert eksternt" uten ekstern respons-notat
3. Markedsstruktur brukes som barrierelag, ikke hovedtema
4. Hver retning har problem, evidens, aktører, pilotlogikk og funding-logikk
5. Hver aktørkontakt har konkret ask
6. Roadmap-påstander spores til claim register

- [ ] **Steg 4: Lengdesjekk**

```bash
wc -w docs/project/mandates/food-tg-insight-pack-v0.1.md
```

Forventet: ~2000-3000 ord (5-8 sider). Hvis over 4000 ord, kutt ned — Insight Pack er navigasjonslag, ikke fullbreddes-rapport.

- [ ] **Steg 5: Commit**

```bash
git add docs/project/mandates/food-tg-insight-pack-v0.1.md
git commit -m "docs(mandates): add Food TG Insight Pack v0.1 synthesis document"
```

---

### Task 7.2: Final cross-check og pakkesjekk

- [ ] **Steg 1: Verifiser at alle filer i `docs/project/mandates/` har riktig frontmatter**

```bash
for f in docs/project/mandates/*.md; do
  echo "=== $f ==="
  head -15 "$f"
  echo
done
```

Sjekk at hver fil har: tittel, status, eier, sist_oppdatert, neste_handling.

- [ ] **Steg 2: Verifiser at alle krysslenker fungerer**

For hver krysslenke i frontmatter (relaterte_filer) og i hovedteksten, bekreft at filen eksisterer:

```bash
# Eksempel - kjør per fil
rg -o "docs/project/mandates/[a-z0-9-]+\.md" docs/project/mandates/*.md | sort -u
```

For hver returnert sti, sjekk at filen eksisterer.

- [ ] **Steg 3: Verifiser at ingen "(fyll ut i ...)"-plassholdere ble glemt**

```bash
rg "fyll ut|TBD|TODO|placeholder|\(må fylles" docs/project/mandates/
```

Forventet: Ingen treff i ferdige filer. (Outreach-loggen kan ha tomme rader, men ikke plassholder-tekst.)

- [ ] **Steg 4: Sjekk at status-feltet i hver fil er konsistent**

Alle filer skal ha `status: Utført internt`. Decision memo kan også markere "(beslutter: ...)".

- [ ] **Steg 5: Oppdater `docs/project/mandates/README.md` så den reflekterer faktisk status**

Endre statuskolonnen i README-tabellen fra "Utkast" til "Utført internt" for hver ferdigstilt fil.

- [ ] **Steg 6: Final commit**

```bash
git add docs/project/mandates/README.md
git commit -m "docs(mandates): mark Insight Pack v0.1 deliverables as completed (Utført internt)"
```

**Akseptkriterier Phase 7:**
- Alle 11 filer i `docs/project/mandates/` har komplett frontmatter
- Insight Pack v0.1 er ≤8 sider og navigerer alle delene
- README reflekterer endelig status
- Ingen plassholdere eller TODO-er i ferdige filer

---

## Phase 8: Handoff til menneskebeslutninger og ekstern dialog (referanse)

> **Denne fasen er IKKE del av denne planen.** Den krever beslutninger og responser som ligger utenfor Gabriel + Codex-arbeidsrommet. Tre separate planer må lages når forutsetninger er på plass:

### Plan: P6 — Intern scopebeslutning

**Forutsetning:** Insight Pack v0.1 er publisert internt 08.05.
**Hvem:** Jan Thomas, Cathrine, Einar.
**Output:** Logget beslutning i `decision-log-food-tg.md` + oppdatert `tg-charter-food-2026.md`.
**Neste plan:** Lages kun hvis beslutningen ikke følger anbefalingen i decision memo (i så fall trenger briefer og pakker oppdatering).

### Plan: P7 — Ekstern validering

**Forutsetning:** Outreach er sendt 08.05+ og minst én aktør har respondert.
**Hvem:** Cathrine, Jan Thomas, Thea, Gabriel (notater).
**Output:** Oppdatert claim register med "Validert eksternt"-status på relevante CL-IDer + intervjunotater i `docs/project/mandates/interviews/`.
**Neste plan:** Lages når første 3 samtaler er gjennomført.

### Plan: P8 — Roadmap-konvertering

**Forutsetning:** P6 + P7 er gjennomført; minst én ekstern respons per hovedspor.
**Hvem:** Gabriel + Codex skriver utkast; Cathrine reviewer.
**Output:** `docs/project/mandates/roadmap-food-tg-2026-2029.md`, `pilot-briefs-food-tg.md`, `finance-note-food-tg.md`, `adoption-track-note-food-tg.md`.
**Neste plan:** Lages senest 25.05 før Sprint 4 begynner.

---

## Verifikasjonscheckliste (kjør etter Phase 7)

- [ ] Alle 11 markdownfiler eksisterer i `docs/project/mandates/`
- [ ] Hver fil har frontmatter med tittel, status, eier, sist_oppdatert, neste_handling
- [ ] Hver fil har riktig status (`Utført internt`)
- [ ] Source shortlist har ≥30 kilder med tag og kvalitetsmerking
- [ ] Evidence matrix har ≥30 oppføringer med EV-IDer
- [ ] Claim register har ≥15 claims med ≥6 hypoteser flagget for ekstern validering
- [ ] Tre track briefs har Problem, Hva vi vet, Hva vi tror, Barrierer, Aktører, Pilot, Adoption, Decision ask
- [ ] Hver brief har eksplisitt anbefaling (gå videre / hold som støttespor / parkér)
- [ ] Decision memo har 6 beslutningspunkter med alternativer og anbefaling
- [ ] Actor validation pack har ≥10 aktører, intervjuguide og 3-5 first-conversation shortlist
- [ ] Insight Pack v0.1 er ≤8 sider og navigerer alle delene
- [ ] Decision log har åpne mandatfelt med frist
- [ ] Charter har ≤1 side med North Star, scope, governance og kvalitetsregler
- [ ] Alle krysslenker fungerer (filer eksisterer)
- [ ] README.md i mandates/ reflekterer endelig status

---

## Risikohåndtering (fra arbeidsplan seksjon 19)

| Risiko | Tegn på problem | Håndtering |
|---|---|---|
| For bredt scope | Track briefs blir overflatisk; >5 piloter | Velg kun 2 spor + C som adoption-lag (anbefaling i decision memo) |
| Kildevolum tar over | >50 kilder i shortlist; rapporten balloner | Stram inn shortlist før Phase 2 starter |
| Aktørdialog uten ask | Outreach-melding er generisk | Hver row i actor pack har eksplisitt ask som lenker til CL-ID |
| Decision memo er for skjør | Anbefalingen er ikke begrunnet | Hver beslutningsrad har "Begrunnelse"-kolonne med EV/CL-referanser |
| Insight Pack blir whitepaper-erstatning | >8 sider; ny analyse istedenfor syntese | Lengdesjekk i Task 7.1 Steg 4; pakk er navigasjonslag |
| Ferdige filer mangler frontmatter | Verifikasjons-steg avdekker | Task 7.2 Steg 1 verifiserer før final commit |

---

## Eksekvering

**Anbefalt format:**

1. **Inline execution** med checkpoints — kjør Phase 0-1 i én sesjon (dag 2), commit hver fase. Phase 2-3 i én sesjon (dag 3-4). Phase 4-5 i én sesjon (dag 5-6). Phase 6 etter beslutningsmøte (dag 8-9). Phase 7 til slutt (dag 10).
2. **Subagent-driven** kun hvis filene blir for store til main-context. Hver Phase kan kjøres som dedikert subagent med pakka som input.

**Etter Phase 7 ferdig:**
- Marker Insight Pack v0.1 som `Utført internt` (ikke `Validert eksternt`)
- Send pakka til Jan Thomas/Cathrine for intern review
- Trigger første outreach-runde (Phase 8 start)
- Lagring i memory: oppdater `project_data_readiness_arbeidsplan.md` eller opprett ny memory `project_food_tg_insight_pack_v01.md` med status og neste handling

---

## Referanser

- Innsiktsprosess-arbeidsplan: `docs/project/FOOD-TG-INNSIKTSPROSESS-ARBEIDSPLAN-2026-04-27.md`
- Status-arbeidsplan: `docs/project/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md`
- Mandat: `docs/project/mandates/food-transition-group-mandate-2026-04-21.md`
- Møteoversikt: `docs/meetings/MØTEOVERSIKT.md`
- Prosjektoversikt: `docs/project/PROJECT-OVERVIEW.md`
