# Researchprosesser for datakvalitet

Dato: 2026-05-15  
Status: operativ plan  
Bygger på: `docs/project/DATAKVALITET-FAGLIG-ANALYSE-2026-05-15.md`

## Kort beslutning

Researcharbeidet skal organiseres som en gated analysefabrikk, ikke som bred ny kildejakt.

Prosjektet har nok eksisterende koer, reviewfiler og datalag til aa starte med aktivering, kvalitetssikring og promotering av kjent materiale. Ny research skal bare startes naar et definert gap ikke kan lukkes gjennom eksisterende backlog, source registry, PCQ eller lokale datafiler.

Hovedregelen er:

1. Ingen datapunkt promoteres uten eksplisitt kvalitetsskjema.
2. Ingen nordisk sammenligning brukes uten sammenlignbarhetsflagg.
3. Ingen KI-/rapportclaim brukes uten source-to-claim-kjede.
4. Ingen proxy eller intern syntese vises som observert fakta.

## Styrende filer

| Rolle | Fil |
|---|---|
| Faglig analyse | `docs/project/DATAKVALITET-FAGLIG-ANALYSE-2026-05-15.md` |
| Datagap og innhenting | `docs/project/DATAGAP-DATAINNHENTINGSPLAN-2026-04-29.md` |
| Nordisk forsyningskjede-plan | `docs/project/RESEARCH-PLAN-FORSYNINGSKJEDE-NORDISK-LIKEDEKNING-2026-04-29.md` |
| Analysefabrikk-metode | `docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md` |
| Gap-master | `research/_plans/gap-master-2026-04-29.csv` |
| Gap-routing | `research/_plans/gap-master-routing-2026-04-29.csv` |
| Source registry | `research/norden/nordic-source-registry.csv` |
| Source import queue | `research/norden/notat-analyser-source-import-queue-2026-04-29.csv` |
| Forsyningskjede PCQ | `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv` |
| Coverage ledger | `docs/project/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv` |

## Nye artefakter som boer opprettes foerst

| Prioritet | Artefakt | Formaal |
|---|---|---|
| P0 | `docs/project/DATAKVALITET-SKJEMA-CSV-JSON-DB-2026-05-15.md` | Kanonisk feltstandard og enum-verdier for CSV, JSON og DB-promotering. |
| P0 | `research/_plans/research-dispatch-ledger-2026-05-15.csv` | Hovedko for subagents/workers: scope, inputfiler, output, gate, status og eier. |
| P0 | `research/_plans/source-to-claim-ledger-2026-05-15.csv` | Kobler `source_id -> document/report -> locator/chunk -> evidence_id -> claim_id`. |
| P1 | `research/_plans/data-quality-baseline-2026-05-15.csv` | Foer/etter-status for DB-counts, gapstatus, country coverage og importbatcher. |
| P1 | `research/_plans/research-activation-queue-2026-05-15.csv` | Samler kilder fra registry/backlog/importkoer inn i ett promoteringsloep. |
| P1 | `research/_plans/model-spec-ledger-2026-05-15.csv` | Modellspesifikasjon for Scope 3, MFA/nutrients, sidestreams, matsvinn, konkurranse og beredskap. |

## Minimum datakvalitetsskjema

Alle nye eller promoterte datapunkter skal ha disse feltene, enten direkte i datafilen eller via registrert metadata:

```text
record_id
source_id
source_ref
source_owner
source_type
source_url
source_file
source_locator
persistent_id_type
persistent_id
persistent_id_exception_reason
retrieved_at
last_verified
country
theme
metric
value
unit
year_or_period
method_status
evidence_status
quality_flag
comparability_flag
comparison_scope
provenance_type
supporting_sources
claim_id
claim_scope
claim_strength
risk_if_wrong
validation_need
promotion_status
allowed_surfaces
ki_usage_rule
notes
```

Anbefalte enum-verdier:

```text
evidence_status:
validated | primary_snapshot | proxy_model | local_research_needs_primary_check | missing

method_status:
direct_observation | official_statistical_extract | calculated | normalized | proxy_model | internal_synthesis | actor_reported | benchmark_only

quality_flag:
ok | partial | proxy | weak | request_needed | blocked

comparability_flag:
directly_comparable | comparable_with_flags | definition_diff | country_only | not_comparable | not_started

promotion_status:
backlog_candidate | fetched_not_reviewed | review_ready | staged_analysis | promoted_analysis | promoted_ui | promoted_ki | rejected | archived

ki_usage_rule:
cite_directly | cite_with_underlying_sources | background_only | exclude | warn_user
```

## Promoteringsgater

### Gate 0: Backlog til reviewklar

Kilden maa ha:

- `source_id`
- tittel
- eier/publisher
- URL eller lokal fil
- land og tema
- prioritert analysebruk
- foreslaatt `promotion_status`

Fuzzy match mot eksisterende DB er ikke nok.

### Gate 1: Reviewklar til research artefakt

Kilden maa vaere hentet eller lokalt resolvbar og ha:

- `source_owner`
- `source_type`
- `retrieved_at`
- `access_status`
- vurdering av primaerkilde, sekundaerkilde, intern syntese eller kandidat
- persistent ID eller dokumentert unntak

### Gate 2: Research til analyse

Datapunktet maa ha:

- `metric`, `value`, `unit`, `year_or_period`, `country`
- `method_status`
- `evidence_status`
- `quality_flag`
- `comparability_flag`
- `source_ref`
- `last_verified`

Proxyer kan gaa videre til analyse bare med `proxy_model` og eksplisitt metodeforbehold.

### Gate 3: Analyse til UI

UI-data maa vise kvalitetsstatus. Ingen nordisk sammenligning skal vises uten `comparability_flag` og `comparison_scope`.

Alle flater som viser nordiske data skal skille:

- Norge observert register-/verdikjededata
- nordisk primary snapshot
- nordisk proxy/kontekst
- missing

### Gate 4: Analyse/UI til KI-svar

KI-svar krever source-to-claim-kjede:

```text
source_id -> document_id/report_id -> locator/chunk_id -> evidence_id -> claim_id
```

`internal_synthesis` og `internal_register` kan brukes som bakgrunn, men skal ikke siters som primaerbevis. `blocked_source` skal ekskluderes eller gi advarsel.

### Gate 5: Claim promotion

Et claim kan ikke loeftes fra intern hypotese til siterbar paastand foer det har:

- minst en reviewet primaerkilde
- `claim_scope`
- `claim_strength`
- `risk_if_wrong`
- `validation_need`
- absolutt `last_verified` dato for ferske tall, juridisk status og aktorclaims

## Arbeidsprogram

### Fase 0: Kvalitetsgrunnmur

Varighet: 0-2 uker  
Maal: etablere felles skjema, ko og baseline foer mer import.

Arbeid:

1. Opprett `DATAKVALITET-SKJEMA-CSV-JSON-DB-2026-05-15.md`.
2. Opprett `research-dispatch-ledger-2026-05-15.csv`.
3. Opprett `source-to-claim-ledger-2026-05-15.csv`.
4. Kjoer baseline paa eksisterende gap, PCQ, source registry, coverage ledger og DB-counts.
5. Merk eksisterende proxyer, interne synteser og blocked sources tydelig.

Gate:

- Ingen nye brede researchoppdrag foer dispatch-ledger og datakvalitetsskjema finnes.
- Ingen ny UI-promotering uten synlig kvalitetsstatus.

### Fase 1: Aktiver eksisterende koer

Varighet: 1-2 uker  
Maal: hente verdi fra eksisterende backlog foer ny leting.

Inputkoer:

1. `research/norden/nordic-source-registry.csv`
2. `research/norden/okologisk-source-queue-2026-04-29.csv`
3. `research/norden/notat-analyser-source-import-queue-2026-04-29.csv`
4. `research/norden/nordic-vision-2030-source-status-2026-04-29.csv`
5. `research/_plans/data-source-targets-2026-04-29.csv`
6. `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`

Output:

- samlet activation queue
- oppdatert PCQ
- liste over importklare kilder
- liste over request-needed kilder
- liste over reject/archive

Gate:

- En kilde kan ikke omtales som dekning foer den er minst `review_ready`.
- En datarad kan ikke omtales som analyseklar foer den er `staged_analysis`.

### Fase 2: Parallelle subagent-spor

Varighet: 2-6 uker  
Maal: lukke prioriterte gap og heve datamodenhet per tema.

| Worker | Scope | Input | Output | Gate |
|---|---|---|---|---|
| A | Nordisk harmonisering og landdekning | coverage ledger, country packs, core-series, trade panels | land/tema-matrise + comparability flags | L3 foer graf, L4/L5 foer beslutningsklar sammenligning |
| B | Scope 3 og aktordata | A1-gapkort, aktorrapporter, CDP/arsrapporter | Scope 3-komparabilitetsmatrise + requestpakke | basisaar, scope og kategoriavgrensning eksplisitt |
| C | Matsvinn, sidestroemmer og atferd | A2/A3/C10-C13, NORSUS/Matvett/SINTEF/Nofima | driverkort + sidestream opportunity register | skille maalt, modellert og intervjuvalidert |
| D | Naeringsstoff/MFA | C5/C6/G1/G2, nutrient data, oppdrett/fôr | minimum MFA + nutrient budget-notat | formel, proxy og usikkerhet per rad |
| E | Markedsmakt, konkurranse og robusthet | B10/B11, HHI, market-share, retail data | konkurranse-/robusthetsmodell | butikkantall-proxy ikke lik omsetnings-HHI |
| F | Beredskap og selvforsyning | G3, FI/NESA, NIBIO/FAO/statistikk | sjomatjustert scenario + beredskapspakke | scenarioer og avgrensninger eksplisitt |
| QA | Metode- og overclaim-kontroll | alle worker-handoffs | verification note + oppdatert PCQ | funn kan svekkes, stoppes eller sendes til actor validation |

Worker-status skal bruke:

```text
triagert
source-card
citation-ready
needs-primary-check
needs-actor-validation
reject/archive
```

### Fase 3: Boelge 1-gap

Varighet: start umiddelbart etter Fase 0  
Maal: lukke hurtige datahull uten aa vente paa full nordisk modell.

Prioritet:

1. A4 biogass/anlegg/virkemidler
2. G3 selvforsyning sjomatjustert
3. B12 PPP/prisnivaa Norden
4. A7 Klimakur-/matsystemtiltak
5. A6 plastemballasje/gjenvinning
6. B11 omsetningsandeler 2017-2019

Output:

- oppdaterte gapkort
- maskinlesbar CSV der mulig
- metodekort for hver serie
- oppdatert gap-master status

Gate:

- gap lukkes bare med dataartefakt, evidence card, modellnotat, kildepakke eller validert svar.
- relevante kilder alene lukker ikke gapet.

### Fase 4: Modellspor

Varighet: 6-12 uker  
Maal: bygge forskningsmodeller med eksplisitt usikkerhet.

Modeller:

1. Scope 3-komparabilitet
2. Naeringsstoff-/MFA-modell
3. Sidestream opportunity register
4. Matsvinn-driveranalyse
5. Lokal konkurranse-/robusthetsmodell
6. Sjomatjustert selvforsyning og beredskap

Hver modell maa ha:

- input-tabeller
- beregningsformel eller metodebeskrivelse
- usikkerhetsspenn
- kildegrad
- beslutningsbruk
- `allowed_surfaces`
- `ki_usage_rule`

## Source-to-claim prosess

Dette er egen kritisk prosess fordi rapporter, UI og KI-svar har hoyest overclaim-risiko.

Arbeid:

1. Identifiser claims som faktisk brukes i rapport/UI/KI.
2. Koble hvert claim til `source_id`, lokalt dokument, locator/chunk og evidence ID.
3. Merk claim med `claim_strength`, `claim_scope`, `risk_if_wrong` og `validation_need`.
4. Ekskluder claims som bare bygger paa intern syntese fra direkte sitering.
5. Lag `allowed for answer`-liste for KI.

Bruksregel:

| Status | Rapport | UI | KI-svar |
|---|---|---|---|
| `validated` | ja | ja | cite_directly |
| `primary_snapshot` | ja, med forbehold | ja, med status | cite_with_underlying_sources |
| `proxy_model` | analytisk, tydelig merket | ja, tydelig proxy | warn_user |
| `local_research_needs_primary_check` | nei, kun internt | bare som gap/status | background_only eller exclude |
| `missing` | nei | vis som gap | svar at data mangler |

## Subagent-handoff format

Alle subagents skal levere dette minimumsformatet:

```markdown
# Worker handoff - <scope>

## Scope
- Tildelt batch:
- Filer/mapper lest:
- Filer ikke funnet:
- Arbeidstype:

## Kort konklusjon
- 3-6 punkter

## Funn
| Funn | Kilde | Status | Claim-effekt | Neste handling |
|---|---|---|---|---|

## Datapunkter
| record_id | country | metric | value | unit | year_or_period | evidence_status | method_status | quality_flag | comparability_flag | source_ref |
|---|---|---:|---:|---|---|---|---|---|---|---|

## Usikkerhet
- ...

## Valideringsspoersmaal
- ...

## Anbefalt promoteringsstatus
- backlog_candidate / review_ready / staged_analysis / promoted_analysis / promoted_ui / promoted_ki / reject/archive
```

## Neste sikre blokk

1. Opprett `DATAKVALITET-SKJEMA-CSV-JSON-DB-2026-05-15.md`.
2. Opprett `research-dispatch-ledger-2026-05-15.csv` med seks worker-spor og QA-spor.
3. Opprett `source-to-claim-ledger-2026-05-15.csv` med tomt skjema og 10-20 foerste claims fra eksisterende rapport/UI.
4. Kjoer lokal baseline paa eksisterende gap-/source-/PCQ-filer.
5. Start Boelge 1 med A4, G3 og B12 foerst.

## Stop-regler

- Ikke start ny bred kildejakt uten gap-ID og akseptansegate.
- Ikke oppdater canonical claim-/evidence-dokumenter direkte fra worker-output.
- Ikke marker noe `Validert eksternt` uten faktisk ekstern respons.
- Ikke bruk Perplexity-/arbeidsnotater som siterbar evidens.
- Ikke presenter `nordisk` som harmonisert naar status er proxy, kontekst eller missing.
