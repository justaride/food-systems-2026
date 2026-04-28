---
tittel: "Food TG underlagsgjennomgang - plan og orkestrering"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Kjør fase 1A på toppkilder og fase 1B som bred arkivtriage med subagenter.
relaterte_filer:
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - docs/project/mandates/decision-memo-food-tg-scope.md
  - docs/project/mandates/academic-theses-integration-audit-food-tg-2026-04-28.md
  - docs/project/FOOD-TG-INNSIKTSPROSESS-ARBEIDSPLAN-2026-04-27.md
  - research/DATA-READINESS-SLUTTRAPPORT.md
  - research/KI-PRIORITY.md
  - research/PDF-KATALOG.md
  - research/FILE-COVERAGE.md
---

# Food TG underlagsgjennomgang - plan og orkestrering

## 1. Formål

Denne planen beskriver hvordan hele underlagsarkivet skal gjennomgås for Food Transition Group uten at arbeidet drukner i materialmengden. Målet er å hente mest mulig relevant innsikt ut av arkivet, men styre arbeidet mot mandatets behov: scopevalg, aktørdialog, pilotspor, funding og roadmap.

Planen bygger på to parallelle arbeidsmåter:

1. **Dybdebane:** 20-30 viktigste kilder gjennomgås først med full source-card, ScholarEval-inspirert kvalitetsvurdering og kobling til claims.
2. **Breddebane:** resten av arkivet triageres raskere med tags, relevansscore, siterbarhet, risikoflagg og anbefalt neste handling.

Hovedprinsipp: Arkivet skal ikke bare oppsummeres. Det skal konverteres til beslutningsklare artefakter: source cards, EV-rader, CL-rader, valideringsspørsmål, aktørspørsmål og uttak.

## 2. Arbeidsspørsmål

Gjennomgangen skal svare på disse spørsmålene:

| ID | Spørsmål | Bruk |
|---|---|---|
| Q1 | Hvilke kilder er sterke nok til å bære eksterne påstander? | Insight Pack, roadmap, whitepaper |
| Q2 | Hvilke kilder er nyttige internt, men må ikke siteres eksternt? | Hypoteser, intervjuguide, research backlog |
| Q3 | Hvilke claims styrkes, svekkes eller må omskrives? | Claim register |
| Q4 | Hvilke tall, case, aktører, reguleringer og KPI-er kan trekkes ut? | Evidence matrix, actor pack, roadmap |
| Q5 | Hvilke hypoteser krever Jan Thomas/Cathrine eller ekstern validering? | Scope-møte og aktørdialog |
| Q6 | Hvor i arkivet finnes ubrukte, men relevante funn for A/B/C-sporene? | Bred arkivtriage |
| Q7 | Hvilke temaer er overdekket, underdekket eller for uvaliderte? | Gap-liste og neste research |

## 3. Scope mot mandatet

Underlaget skal vurderes mot tre operative spor:

| Spor | Hva vi leter etter | Typiske kilder |
|---|---|---|
| A - Sirkulært fôr og importavhengighet | fôrproteiner, soya/fiskemel, alternative råvarer, oppdrett, regelverk, demand-side | NMBU, Foods of Norway, HI, EUDR, TSE/ABP, fôraktører, Axfoundation, Volare |
| B - Sidestrømmer og næringsstoffløkker | matsvinn, okara, sjømat-sidestrømmer, svartvann, biorest, kaskadebruk, R9 | matsvinnrapporter, LCA/PhD, RecoLab, biogass, waste-to-nutrition, kommunale case |
| C - Adoption/governance | innkjøp, regulering, håndheving, datakrav, markedsmakt, KPI-er, standarder | Farm to Fork, UTP, PPWR, EUDR, offentlige innkjøp, policykart, governance-artikler |

I tillegg skal disse støtteområdene vurderes:

| Område | Formål |
|---|---|
| Baseline | systemkart, verdikjede, beredskap, importavhengighet, nordisk sammenligning |
| Actor | hvem kan validere, eie, utfordre eller finansiere sporene |
| Finance | hvilke finansieringsløp passer til A/B/C |
| Communication | hvilke funn tåler ekstern formidling og hvilke må holdes internt |

## 4. Arkivlag

Arkivet deles i lag med ulike regler for bruk:

| Lag | Innhold | Bruksregel |
|---|---|---|
| L0 Styring | mandat, charter, decision memo, møte- og arbeidsplaner | styrer prioritering, ikke faglig evidens alene |
| L1 Primærkilder | offentlige rapporter, direktiver, fagartikler, datasett, PhD-er | kan brukes eksternt hvis kilde og kontekst er kontrollert |
| L2 Sterke sekundærkilder | reviewartikler, nordiske rapporter, konsulentrapporter | kan brukes med kontekst og forbehold |
| L3 Interne synteser | verdikjedeanalyser, whitepaper, research audit, KI-priority | brukes som navigasjon og hypoteser, ikke som primærbevis |
| L4 Uvalidert research | Perplexity-notater, dossiers, foreløpige casekart | brukes til spørsmål og shortlisting, ikke eksterne fakta |
| L5 Råarkiv/OCR/PDF | originale PDF-er, OCR, arkiv-sortert, pdf-downloads | brukes for kontroll, sitat, sidetall og primærverifikasjon |
| L6 Data/app | src/lib/data, Prisma, scripts, JSON/CSV | brukes til struktur, aktører, visualisering og datadrevet triage |

## 4.1 Eksisterende byggesteiner

Subagent-gjennomgangen 2026-04-28 bekreftet at prosjektet allerede har mye av infrastrukturen som trengs for en skalerbar gjennomgang.

| Byggestein | Filer/kommandoer | Bruk i gjennomgangen |
|---|---|---|
| Import og DB | `npm run db:import`, `npm run db:import:docs`, `npm run db:audit`, `prisma/schema.prisma` | kobler dokumenter, kilder, rapporter, avhandlinger og innsikt |
| Kilde- og rapportdata | `src/lib/data/sources.ts`, `reports.ts`, `theses.ts`, `evidence-pack.ts` | gir strukturert inngang til eksisterende arkiv |
| Arkiv/katalog | `scripts/build-archive-index.ts`, `scripts/build-pdf-catalog.ts`, `research/PDF-KATALOG.md` | finner PDF-er, SHA-duplikater og råarkiv |
| Readiness | `npm run compute-file-coverage`, `npm run inventory-urls`, `npm run check-pdf-quality` | avdekker manglende filer, URL-status, low-text/OCR og siterbarhetsrisiko |
| Prioritering | `npm run compute-ki-priority`, `research/KI-PRIORITY.md` | gir første KI-/kildescore for Reports og Theses |
| Søking | `src/lib/queries/search.ts`, `semantic-search.ts`, `scripts/generate-embeddings.ts` | mulig senere RAG/chunk-søk, men krever chunk-level provenance for sitatbruk |
| Dokumentkobling | `scripts/create-document-refs.ts`, `link-insights-to-docs.ts`, `link-companies-to-docs.ts` | kan koble source cards/claims til appens innsikt og aktører |

## 5. Faseplan

### Fase 0 - Rigging

**Mål:** Sikre at gjennomgangen har fast metode, ID-er og output-format.

Output:

- Denne planen.
- Source-card-mal.
- Corpus manifest-felt.
- Subagent-briefs.
- Arbeidslogg for gjennomførte pass.

Akseptkriterier:

- Alle kilder får status: `bruk`, `sjekk`, `valider`, `erstatt`, `arkiver`.
- Alle claims beholder status `Utført internt` til ekstern respons er dokumentert.
- Alle eksterne fakta må spores til L1/L2-kilde før de brukes i Insight Pack.

### Fase 1A - Dypgjennomgang av topp 20-30

**Mål:** Gjøre de viktigste kildene beslutningsklare raskt.

Inntak:

- `docs/project/mandates/source-shortlist-food-tg.md`
- `docs/project/mandates/evidence-matrix-food-tg.md`
- `research/KI-PRIORITY.md`
- track briefs A/B/C

Arbeidssteg:

1. Velg 8-10 kilder for A, 8-10 for B, 6-8 for C, 3-5 baseline/actor/finance.
2. Lag source card for hver kilde.
3. Marker claims som styrkes/svekkes/endres.
4. Trekk ut tall, case, aktører, regulering, KPI-er og sitatbare formuleringer.
5. Oppdater eller foreslå EV-/CL-endringer.
6. Lag 1 side "hva dette betyr for scope".

Akseptkriterier:

- Minst 20 source cards.
- Minst 5 robuste claims per spor.
- Alle pilotclaims har valideringsspørsmål.
- Alle sterke fakta har siterbarhet `Høy` eller `Medium`.

### Fase 1B - Bred arkivtriage

**Mål:** Fange relevant materiale uten full lesing av alt.

Inntak:

- `research/bibliotek/`
- `research/evidence-pack/`
- `research/norden/`
- `research/regulatory/`
- `research/perplexity-20-04-26/`
- `research/arkiv-sortert/`
- `research/external/`
- `docs/meetings/`

Arbeidssteg:

1. Kjør readiness-gate: `compute-file-coverage`, `inventory-urls`, `check-pdf-quality` og PDF-katalog hvis status er utdatert.
2. Lag corpus manifest med alle relevante `.md`, `.pdf`, `.csv`, `.json` der de kan ha Food TG-verdi.
3. Tagg hver kilde med spor, lag, relevans, kildekvalitet og neste handling.
4. Bruk søkeord for A/B/C og JT-temaene.
5. Flagge kilder som overlapper, er uvalidert, mangler filkobling eller har dårlig PDF/OCR.
6. Løft kandidater fra breddebane til dybdebane ved scoreterskel.

Akseptkriterier:

- Alle sentrale mapper er triagert.
- Minst 100 kilder er lettscoret.
- Minst 30 nye kandidater er enten løftet til dypgjennomgang eller parkert med begrunnelse.
- Duplicates/råarkiv/OCR-risikoer er synlige.

### Fase 2 - Evidence/claim-konsolidering

**Mål:** Gjøre funnene strukturerte nok til beslutninger.

Output:

- Oppdatert eller utvidet evidence matrix.
- Oppdatert claim register.
- Gap-liste per spor.
- Valideringslogg per claim.

Arbeidssteg:

1. For hver source card: koble til eksisterende EV-ID eller foreslå ny EV-ID.
2. For hver claim: vurder `styrker`, `svekker`, `nyanserer`, `krever omskriving`.
3. Samle "må ikke sies eksternt ennå"-liste.
4. Lag "valider med aktør"-liste.

Akseptkriterier:

- Ingen claim har bare L4-kilder som eneste evidens uten advarsel.
- Alle claims som brukes i decision memo har minst 2-3 relevante EV-koblinger eller er eksplisitt merket som hypotese.
- Usikkerhet er synlig, ikke skjult i brødtekst.

### Fase 3 - Uttak

**Mål:** Lage målrettede outputs for neste arbeidsrom.

Uttak:

| Uttak | Målgruppe | Innhold |
|---|---|---|
| Insight Pack v0.1 | internt team/NCH | hovedfunn, scope, usikkerheter, anbefaling |
| Decision memo v0.2 | Jan Thomas/Cathrine/Einar | valg, forbehold, valideringsgate |
| Actor validation pack | Jan Thomas/Cathrine/Thea | aktører, ask, spørsmål, prioritet |
| Workshop map | TG-workshop | R9 x verdikjede x A/B/C-spor |
| Roadmap skeleton | NCH/finansiering | 2026-2029, eierskap, KPI, funding |
| External-safe source pack | kommunikasjon | bare siterbare kilder og kontrollerte claims |

Akseptkriterier:

- Hvert uttak bruker samme claim-/EV-ID-er.
- Interne hypoteser er ikke formulert som eksterne fakta.
- Uttakene viser både "hva vi vet" og "hva vi må spørre aktører om".

## 6. Source-card-mal

Hver prioritert kilde skal vurderes med denne malen:

```markdown
## SRC-XXX - <tittel>

| Felt | Verdi |
|---|---|
| Filsti |  |
| DB/ref | Report/Thesis/SourceDoc/Document hvis kjent |
| URL/SHA |  |
| Arkivlag | L1/L2/L3/L4/L5/L6 |
| Spor | A/B/C/baseline/actor/finance/policy |
| Kildetype | primær/sekundær/intern syntese/uvalidert/datasett/møte |
| Proveniens | external_report/external_article/composite_source/internal_synthesis/internal_register/blocked_source |
| Relevansscore | 1-5 |
| Evidensscore | 1-5 |
| Siterbarhet | Høy/Medium/Lav |
| Readiness | file_ok/url_ok/text_ok/duplicate? |
| Neste handling | bruk/sjekk/valider/erstatt/arkiver |

### Kort sammendrag

3-5 setninger om hva kilden faktisk bidrar med.

### Beslutningsrelevante funn

1. ...
2. ...
3. ...

### Claims

| Claim | Effekt | Notat |
|---|---|---|
| CL-X-000 | styrker/svekker/nyanserer/ny |  |

### Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Tall |  |  |
| Case |  |  |
| Aktør |  |  |
| Regulering |  |  |
| KPI |  |  |
| Sitat/side |  |  |
| Motstridende funn |  |  |

### Usikkerhet og begrensning

- ...

### Valideringsspørsmål

- Hvem bør validere?
- Hva må bekreftes før ekstern bruk?
```

## 7. Scoring

### Relevansscore

| Score | Betydning |
|---|---|
| 5 | Direkte påvirker scope, pilot, roadmap eller aktørdialog |
| 4 | Sterkt relevant for A/B/C eller baseline |
| 3 | Nyttig bakgrunn eller støtte |
| 2 | Indirekte relevant |
| 1 | Arkiveres, lav verdi for Food TG nå |

### Evidensscore

| Score | Betydning |
|---|---|
| 5 | Primærkilde/fagfellevurdert/offentlig kilde, fersk, direkte relevant |
| 4 | Solid sekundærkilde eller fagrapport |
| 3 | Nyttig, men indirekte, eldre eller delvis sammenstilt |
| 2 | Intern syntese eller ufullstendig underlag |
| 1 | Uvalidert notat/hypotese, ikke siterbar uten kontroll |

### Beslutningsscore

Beslutningsscore beregnes kvalitativt:

| Nivå | Bruk |
|---|---|
| Høy | påvirker anbefaling, pilotvalg, aktørprioritet eller finansiering |
| Medium | støtter argumentasjon, men avgjør ikke valg alene |
| Lav | bakgrunn, kontekst eller arkivverdi |

## 8. Corpus manifest

Et bredt corpus manifest bør ha disse feltene:

| Felt | Forklaring |
|---|---|
| `source_id` | Stabil ID, f.eks. `SRC-A-001` eller `CORP-0001` |
| `canonical_path` | Foretrukket filsti i repo |
| `original_path` | Opprinnelig/importert filsti hvis annen enn canonical |
| `title` | Kildetittel eller filbasert tittel |
| `author_or_institution` | Forfatter, institusjon eller utgiver |
| `archive_layer` | L0-L6 |
| `track_tags` | A, B, C, baseline, actor, finance, policy |
| `topic_tags` | feed, soya, fiskemel, okara, matsvinn, svartvann, EUDR osv. |
| `source_type` | primær, sekundær, intern syntese, uvalidert, data, møte |
| `provenance_type` | external_report, external_article, composite_source, internal_synthesis, internal_register, blocked_source |
| `year` | år hvis kjent |
| `country_scope` | NO, SE, DK, FI, IS, Norden, EU, global |
| `source_status` | canonical, duplicate, mirror, orphan, intake, deprecated |
| `validation_status` | unreviewed, reviewed_internal, citation_ready, needs_primary_check, validated_external |
| `relevance_score` | 1-5 |
| `evidence_score` | 1-5 |
| `decision_score` | høy/medium/lav |
| `citation_readiness` | høy/medium/lav |
| `known_risks` | OCR, duplicate, stale path, missing source, uvalidert, old |
| `has_pdf` | ja/nei |
| `has_md` | ja/nei |
| `ocr_status` | ok/low-text/scanned/unknown |
| `sha256` | hash hvis kjent |
| `source_url` | ekstern URL hvis kjent |
| `claim_links` | CL-ID-er |
| `evidence_links` | EV-ID-er |
| `next_action` | bruk/sjekk/valider/erstatt/arkiver |
| `review_owner` | Gabriel/subagent/navn |
| `review_status` | ikke startet/triagert/source-card/konsolidert |

## 9. Søke- og fangststrategi

Søk skal kjøres tematisk, ikke bare på filnavn.

| Tema | Søketermer |
|---|---|
| R9/kaskade | `R9`, `cascade`, `kaskade`, `avfallshierarki`, `recover`, `recycle`, `redistribusjon` |
| Fôr | `fôr`, `feed`, `soy`, `soya`, `fishmeal`, `fiskemel`, `insect`, `BSF`, `single cell`, `gjærprotein`, `mykoprotein` |
| Sidestrøm | `sidestream`, `sidestrøm`, `by-product`, `biprodukt`, `okara`, `bryggerimask`, `potetskall`, `seafood side` |
| Næringsstoff | `svartvann`, `blackwater`, `nitrogen`, `phosphorus`, `fosfor`, `kalium`, `struvite`, `digestat`, `biorest` |
| Matsvinn | `matsvinn`, `food waste`, `redistribution`, `donation`, `HORECA`, `Too Good To Go`, `Matvett` |
| Adoption | `adoption`, `governance`, `procurement`, `innkjøp`, `UTP`, `EUDR`, `PPWR`, `Farm to Fork`, `standard` |
| Case/fiasko | `Axfoundation`, `Volare`, `Mycorena`, `ENORM`, `DUG`, `Hooked`, `Infarm`, `RecoLab`, `Helsingborg` |

Eksempelkommandoer:

```bash
rg -n -i "fôr|feed|soy|soya|fishmeal|fiskemel|insect|BSF|single cell|gjærprotein" research docs
rg -n -i "sidestream|sidestrøm|okara|biprodukt|by-product|potetskall|bryggerimask" research docs
rg -n -i "svartvann|blackwater|nitrogen|fosfor|phosphorus|struvite|digestat|biorest" research docs
rg -n -i "EUDR|PPWR|UTP|Farm to Fork|procurement|innkjøp|governance|adoption" research docs
```

## 10. Subagent-orkestrering

Subagenter brukes til lesende, avgrensede oppdrag. De skal ikke skrive over styringsfiler uten eksplisitt oppgave.

### Gjennomførte subagent-pass 2026-04-28

| Agentpass | Scope | Viktigste funn |
|---|---|---|
| Arkivstruktur | kartlegge mapper, arkivlag, rekkefølge og risiko | `docs/project/mandates/`, `research/evidence-pack/`, `research/bibliotek/`, `research/norden/verdikjede/` og readiness-filene er første inngang; `perplexity`, `forskningsrunde-r2`, `intake`, `arkiv-sortert` og `ocr-output` brukes senere/med forsiktighet |
| Faglig prioritering | foreslå topp 20-30 og neste 50-100 kilder per spor | start med kilder som bærer claims, lukker regulatoriske go/no-go-spørsmål eller erstatter lavt validerte volum-/aktørpåstander |
| Pipeline/automatisering | se på scripts, KI-priority, file coverage, PDF-kvalitet og dataflyt | arkiv -> readiness -> shortlist -> source cards -> evidence matrix -> claim register -> insight pack er riktig pipeline; automatisering er nyttig for inventar og triage, men ikke for endelig claim/siterbarhet |

### Foreslåtte neste subagent-pass

| Pass | Eier | Input | Output | Avgrensning |
|---|---|---|---|---|
| A-feed dypkort | subagent | SRC-A-001 til SRC-A-012 | 8-12 source cards + claim-effekt | bare spor A |
| B-sidestream dypkort | subagent | SRC-B-001 til SRC-B-013 | 8-12 source cards + pilotspørsmål | bare spor B |
| C-adoption dypkort | subagent | SRC-C-001 til SRC-C-012 | 6-10 source cards + valideringsgate | bare spor C |
| Arkivskann bredde | subagent | research/bibliotek + evidence-pack | 100 lettscorede kandidater | ingen full sammendrag |
| Actor/funding pass | subagent | actors, finance-note, funding-map, dossiers | prioritert aktør/funding-liste | ingen outreach |
| Sitatbarhet/pass | subagent | L1/L2-kilder | liste over eksternt trygge claims | kontrollerer siterbarhet |

### Agent-prompt-mal

```markdown
Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026.

Du skal gjøre en lesende gjennomgang. Ikke rediger filer.

Scope: <filer/mapper>.
Mål: <hva du skal finne>.
Vurder hver kilde etter:
- spor: A/B/C/baseline/actor/finance/policy
- relevansscore 1-5
- evidensscore 1-5
- siterbarhet høy/medium/lav
- hvilke CL-ID-er den styrker/svekker
- hva som må valideres før ekstern bruk

Returner:
1. prioriterte kilder
2. viktigste funn
3. claims som påvirkes
4. gap/usikkerheter
5. anbefalt neste handling
```

## 11. Arbeidsrytme

| Dag | Fokus | Output |
|---|---|---|
| Dag 1 | Rigging + toppkilder | plan, agentpass, første source-card-kø |
| Dag 2 | A/B/C dypgjennomgang | 20-30 source cards |
| Dag 3 | bred arkivtriage | manifest med 100+ lettscorede kilder |
| Dag 4 | evidence/claim-konsolidering | oppdatert EV/CL-endringsliste |
| Dag 5 | valideringspakke | actor validation pack og spørsmål |
| Dag 6 | uttak | Insight Pack v0.1, decision memo v0.2 |

## 12. Manuell vs. automatisert

| Arbeid | Metode |
|---|---|
| Filinventar, søk, tagging, duplikat-/PDF-flagg | automatisk eller semi-automatisk |
| Første relevansscore | semi-automatisk med manuell kontroll |
| Source-card for toppkilder | manuelt/subagent |
| Siterbarhet og juridiske/regulatoriske claims | manuelt |
| Claim-oppdatering | manuelt |
| Ekstern validering | menneskelig aktørdialog |
| Roadmap-anbefaling | manuelt etter EV/CL-konsolidering |

## 13. Risikoer og styringsregler

| Risiko | Regel |
|---|---|
| Uvalidert Perplexity-notat blir brukt som fakta | L4 kan bare brukes som hypotese eller peker |
| Interne synteser siteres som primærkilde | L3 må tilbakeføres til L1/L2 før ekstern bruk |
| PDF/OCR-feil gir feil sitat | L5 må kontrolleres før sidetall/sitat |
| Arkivet har duplikater og stale paths | bruk file coverage/PDF-katalog før dyplesing |
| Subagentene gir overlappende funn | alle outputs mappes til source_id/CL/EV før integrering |
| Scope blir for bredt | bare funn som påvirker A/B/C, actor, finance eller roadmap løftes |
| Claims får for høy status | `Validert eksternt` brukes bare etter faktisk aktørrespons |

## 14. Første konkrete arbeidskø

### Kilder til full source-card først

| Prioritet | Kilde | Hvorfor |
|---|---|---|
| 1 | `research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md` | teknisk A-feed-anker |
| 2 | `research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md` | mattrygghetsramme for A/B |
| 3 | `research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md` | kunnskapshull og risikomodell |
| 4 | `research/evidence-pack/forskningsinstitutt/hi-risikorapport-fiskeoppdrett-2025.md` | oppdrettsrisiko og kontekst |
| 5 | `research/bibliotek/akademia/internasjonalt/nordic-protein-shift-research-2024.md` | økosystem og finansiering for alternative proteiner |
| 6 | `research/regulatory/eu-eudr-avskogingsforordningen-2025.md` | soya/import som compliance-driver |
| 7 | `research/norden/verdikjede/04-innsatsvarer.md` | importavhengighet, fôr, gjødsel og kritiske innsatsvarer |
| 8 | `research/norden/verdikjede/06-matsvinn-sirkulaer.md` | B-baseline og kaskade |
| 9 | `research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md` | nordisk matsvinn-policy |
| 10 | `research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf` | norsk primærkilde for matsvinn, tiltak og virkemidler |
| 11 | `research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md` | sektorfordeling og tidsserie for matsvinn |
| 12 | `research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md` | LCA/kaskadeprioritering |
| 13 | `research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md` | butikkmatsvinn og redistribusjon |
| 14 | `research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md` | waste-to-nutrition-teknologikart |
| 15 | `research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md` | food-to-waste-to-food-case |
| 16 | `research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md` | sjømat-sidestrømmer |
| 17 | `research/regulatory/eu-farm-to-fork-strategy-2020.md` | policybakgrunn |
| 18 | `research/regulatory/eu-utp-directive-2019-633.md` | markedsmakt/adoption |
| 19 | `research/regulatory/eu-utp-evaluering-desember-2025.md` | håndheving og rapporteringsvern |
| 20 | `research/regulatory/eu-ppwr-emballasjeforordningen-2025.md` | emballasje/logistikk/adoption |
| 21 | `research/bibliotek/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.md` | governance for matsvinn |
| 22 | `research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md` | praksis/adoption i hverdagsinfrastruktur |
| 23 | `research/norden/regulatory-policy-landscape-nordic.md` | samlet policykart som må spores til primærkilder |
| 24 | `research/norden/verdikjede/10-kryss-analyse.md` | system- og gap-syntese |
| 25 | `research/bibliotek/forskningsrunde-2026-04-20-r2/p13-ax-framtidens-foder-2026-04-20.md` | benchmarkcase for sirkulært fôr, må aktørvalideres |
| 26 | `research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md` | nøkkelaktør for insektprotein/skalering, må aktørvalideres |
| 27 | `research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md` | næringsgjenvinning/svartvann benchmark, må primærkildesjekkes |
| 28 | `research/interviews/aktorkart-systematisk-2026.md` | validerings- og intervjuliste |
| 29 | `research/evidence-pack/finance-note.md` | funding-kobling |
| 30 | `research/bibliotek/forskningsrunde-2026-04-20-r2/p16-nordiske-do-tanks-stiftelser-2026-04-20.md` | funding- og alliansebruttoliste |

### Kilder som bør triageres, men ikke siteres før sjekk

| Kilde | Grunn |
|---|---|
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p09-soyaimport-norden-2026-04-20.md` | tall må primærkildesjekkes |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p12-fiskemel-verdikjede-global-2026-04-20.md` | handels-/IFFO/FAO-kontroll trengs |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p10-eu-tse-novel-food-regulering-2026-04-20.md` | juridisk kontroll trengs |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p13-ax-framtidens-foder-2026-04-20.md` | aktørstatus må bekreftes |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md` | kapasitet/kundestatus må bekreftes |
| `research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md` | volum og destinasjon må bekreftes |
| `research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md` | N/P/K, tilkobling og regelverk må kontrolleres |
| `research/perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md` | KPI-er må sjekkes mot faktiske rapporteringskrav |

### Mapper/kilder til lett scoring etter første dypgjennomgang

| Område | Hvorfor |
|---|---|
| `research/bibliotek/forskningsrunde-2026-04-20-r2/` | 40+ hypotesenotater for A/B/C, lav siterbarhet men høy triageverdi |
| `research/perplexity-20-04-26/` | kildejakt for fôr, svartvann, R9, matstrømmer, alt-protein og KPI |
| `research/evidence-pack/akademia/pubmed/` | mulig fulltekstgrunnlag for B- og C-claims |
| `research/evidence-pack/offentlig/` | norske/nordiske primærkilder om matsvinn, selvforsyning, beredskap og dagligvare |
| `research/evidence-pack/tilsyn/` og `research/bibliotek/konkurransetilsynet/` | C-spor: markedsmakt, marginer, håndheving og adoption |
| `research/bibliotek/sirkularitet/` | B-spor: matsvinn, biogass, LCA og sirkulære selskaper |
| `research/norden/verdikjede/` | intern syntese som peker til primærkilder, særlig `01`, `04`, `06`, `07b`, `10` |
| `research/regulatory/` | regulatorisk primærlag for C og A/B-valideringsgate |
| `research/evidence-pack/sirkular-konkurser/` | adoption-/finance-risiko: hvorfor alt-protein, vertical farming og sirkulær foodtech feiler |
| `research/bibliotek/nordisk/` og `research/bibliotek/nordisk-konkurranse/` | nordisk sammenligning og overførbarhet |

## 14.1 Kunnskapsgap som må styre valideringen

| Gap | Konsekvens |
|---|---|
| Lovlig substrat/sluttbruk for insektfôr, tidligere matvarer, kategori 3-materiale, swill og avløpsbaserte ressurser er ikke låst | Mattilsynet/EU-EØS-kompetanse må tidlig inn før pilotvalg |
| Soya-, fiskemel- og alternative proteinvolum mangler robust primærkildesporing per nordisk land og sluttbruk | Spor A kan ikke love volum eller effekt før handels-/bransjedata er låst |
| Konkrete sidestrømvolum for okara, plantebasert industri, sjømat, bryggerimask, biorest og svartvann er fortsatt estimatpreget | Spor B må starte med datakrav og aktørvalidering, ikke volumclaim |
| Demand-side er svakt dokumentert | fôr-, sjømat-, HORECA-, dagligvare- og offentlige innkjøpsaktører må validere kjøps-/bruksinteresse |
| Finansiering mangler aktive utlysninger, eligibility, beløp, frister og match mot A/B-pilot | finance-pass må oppdateres før roadmap lover finansierbarhet |
| KPI-laget er ikke validert mot faktisk datatilgang hos aktører | KPI-er kan brukes internt, men ikke som eksterne effektmål før datatilgang er bekreftet |
| Actor claims er interne | ingen actor-/pilotclaim skal markeres `Validert eksternt` før dokumentert respons |
| C-sporet har policybredde, men trenger kobling til faktisk adoption og håndheving | adoption-gate må kreve driftseier, dataleverandør, kjøper og regulatorisk reviewer |

## 15. Done-kriterier for første gjennomgang

Første gjennomgang er ferdig når:

- 20+ source cards er skrevet eller strukturert i arbeidsnotat.
- 100+ kilder er bredt triagert.
- Decision memo kan si hvilke claims som er robuste, svake og aktøravhengige.
- Actor validation pack kan stille presise spørsmål til Mattilsynet, NMBU, Volare/Finnprotein, Axfoundation, Matvett/Too Good To Go, RecoLab/Helsingborg og fôr-/sjømataktører.
- Insight Pack kan skille tydelig mellom `vi vet`, `vi tror`, `vi må validere`, og `vi bør ikke si eksternt ennå`.
