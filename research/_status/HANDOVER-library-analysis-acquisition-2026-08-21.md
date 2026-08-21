# Handover: automated-only library-analysis acquisition

**Dato:** 2026-08-21  
**Branch:** `codex/autonomous-ai-candidate-design`  
**Status:** Full privat acquisition-resolution er forseglet og auditert. KI-
analyse, kandidatdatabase og ekstern claim-godkjenning er ikke kjørt.

## 1. Faktisk resultat

Hele den forseglede populasjonen er nå ført gjennom denne kjeden:

```text
population -> full plan -> 22 bounded batches -> controlled extraction
           -> per-batch resolution -> verified full merge
           -> content-unit manifest -> cost envelope
```

| Disposition | Antall |
|---|---:|
| `content_units_ready` | 1,569 |
| `blocked_input` | 30 |
| `failed_retryable` | 11 |
| `superseded` | 17 |
| **Totalt** | **1,627** |

De `1,569` klare kildene ga `8,393` deterministiske content units. Resultatet
forblir intern-only:

```text
automatedOnly=true
externalReady=false
billingTruth=false
candidateDatabaseWritten=false
productionDataMutated=false
modelExecutionStarted=false
```

Sanitert kvittering:
`research/_status/library-analysis-full-acquisition-2026-08-21.md`.

## 2. Verifiserte bindingshasher

- Full population:
  `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- Full plan:
  `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`
- Batch-sett:
  `dd78a71668f46a18dc2678506f353ebe0bd66134a1835b7e96641013cc5caf8f`
- Full resolution:
  `1bc3d95b4629547c6b4372698adb816c8791a861f8efe379c1121125929ada91`
- Content-unit manifest:
  `694a3bfeb66d666891998d05afc6fd7bf393f57e4e8be6d7dcf0d1a0b6576397`
- Cost envelope:
  `6869492cb0f99789ac986c324ebae1e91ea846e4085a70b496f1ad1ab1560638`
- Merged privat inventory:
  `b2a79f57cd9e225121e77028a5f78bf00c3a46941da4eeac2c3ee05d63b54079`

Private paths, sourceidentifikatorer, URL-er og tekst finnes bare i mode-
`0700/0400` run-artifakter og er ikke gjengitt her.

## 3. Routeutfall

| Route | Klar | Blokkert/retry | Superseded | Totalt |
|---|---:|---:|---:|---:|
| `database_document` | 1,534 | 0 | 0 | 1,534 |
| `controlled_https` | 30 | 40 | 0 | 70 |
| `repository_csv` | 2 | 0 | 0 | 2 |
| `repository_pptx` | 1 | 0 | 0 | 1 |
| `database_derived_record` | 2 | 0 | 0 | 2 |
| `superseded` | 0 | 0 | 17 | 17 |
| `unresolvable` | 0 | 1 | 0 | 1 |
| **Totalt** | **1,569** | **41** | **17** | **1,627** |

De 41 aktive blokkeringene består av `11 http_forbidden`,
`17 identity_ambiguous`, `11 transport_exhausted`, `1 corrupt_payload` og
`1 missing_locator`. De er eksplisitte kø-/stopptilstander, ikke godkjente
kilder.

## 4. Batch, resume og reproduksjon

Fullkjøringen brukte `200` rader per lokal batch og `5` kilder per HTTPS-batch.
Batchsettet besto av `8` lokale og `14` eksterne batcher. Ferdige batcher ble
gjenbrukt etter full privat audit; ufullstendige forsøk ble beholdt og aldri
overskrevet.

Bruk operatøreide absolutte private stier. Ikke legg secrets på kommandolinjen:

```bash
LIBRARY_FULL_SNAPSHOT='<private absolute snapshot path>'
LIBRARY_FULL_PLAN='<private absolute full-plan path>'
LIBRARY_BATCH_ROOT='<new private absolute batch-set root>'
LIBRARY_EXECUTION_ROOT='<new private absolute execution root>'
LIBRARY_ENV_FILE='<absolute path to operator-owned dotenv file>'
```

Forbered deterministiske batcher:

```bash
node --import=tsx \
  scripts/knowledge/prepare-library-analysis-acquisition-batches.ts \
  --snapshot="$LIBRARY_FULL_SNAPSHOT" \
  --plan="$LIBRARY_FULL_PLAN" \
  --output-root="$LIBRARY_BATCH_ROOT" \
  --local-batch-size=200 \
  --external-batch-size=5
```

Kjør eller fortsett, og forsegl full merge:

```bash
node --env-file="$LIBRARY_ENV_FILE" --import=tsx \
  scripts/knowledge/run-library-analysis-acquisition-batches.ts \
  --execute-network \
  --snapshot="$LIBRARY_FULL_SNAPSHOT" \
  --plan="$LIBRARY_FULL_PLAN" \
  --batch-set-root="$LIBRARY_BATCH_ROOT" \
  --execution-root="$LIBRARY_EXECUTION_ROOT"
```

Kommandoen gjenbruker bare forsøk som har en parsebar, hash-verifisert bundle.
Hvis et forsøk er ufullstendig, opprettes neste `attempt-NNN`; tidligere
artifakter endres ikke.

## 5. Kostnad før KI-analyse

- Ready payload: `55,509,993` Unicode code points / `56,262,522` bytes
- One-pass input: `13,216,665–18,503,331` tokens
- Analyse + separat validering: `26,433,330–37,006,662` tokens
- Estimator: `codepoints-interval/1.0.0`
- `billingTruth=false`

Dette er den operative inputkonvolutten, ikke et pristilbud. Ingen modell eller
provider er valgt, og ingen betalt inference er startet.

## 6. Stopplinjer som fortsatt gjelder

- `externalReady=false` skal bestå gjennom automatisert analyse og validering.
- Kandidatintak krever fortsatt separat database, migrasjon, backup/restore,
  rolle og writer-attestasjon.
- Generator og validator skal være separate pass med forseglede modell-,
  prompt- og regelversjoner.
- F1–F5 og kritiske/high-risk funn skal avvise automatisk, ikke narreres bort.
- Rettigheter, aktørsamtykke, faktisk kildeautoritet og ekstern publiserbarhet
  kan ikke oppgraderes av KI alene.
- Ikke push, åpne PR, merge, migrer, aktiver rolle, deploy eller kjør modell
  uten den relevante eksplisitte godkjenningen.

## 7. Neste arbeid

Acquisition er ikke lenger hovedblokkeren. Neste tekniske beslutning er hvordan
de `1,569` klare kildene skal analyseres innenfor `26.43–37.01M` estimerte
input-tokens:

1. Velg provider/modell og maksimal kostnadsramme.
2. Forsegl analyseprompt, validatorprompt, schemas og F1–F5-regler.
3. Legg inn per-batch token-/kostnadsbudsjett, checkpoint og hard stop.
4. Kjør helst en representativ analysetrinn-pilot før full corpus inference.
5. Valider separat og behold bare poster som passerer deterministic gates.
6. Vurder deretter kandidatdatabase-intak som en ny, eksplisitt gate.
