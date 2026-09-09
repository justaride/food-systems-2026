# Bibliotekstatus — avstemming av historiske merker

Dato: 2026-09-09
Omfang: presentasjon og reproducerbar opptelling; ingen databaseendring, menneskelig review eller kanonisk promotion

## Konklusjon

Produksjonsuttrekket i `runtime-final.json` viser 1 770 library-analysis-rader:

- 1 354 har den historiske kombinasjonen `approved_internal` og `safe_for_ai_context`;
- 399 krever kildekontroll;
- 392 har risikoflagget `missing_text` eller `low_text_quality`;
- 0 har navngitt og datert menneskelig review;
- 0 er kvalifisert for eksterne claims.

De historiske merkene beskrev en intern policyklassifisering. De beviser ikke at
originalkilden er kontrollert, at teksten er komplett eller at innholdet er
menneskelig godkjent. UI-tekstene «AI godkjent internt» og «trygg AI-kontekst»
var derfor sterkere enn det underliggende grunnlaget.

## Reproducerbar opptelling

`src/lib/queries/library-analysis.ts` beregner `approvedForAi` fra rader med
status `approved_internal` eller `validated` og bruksregel
`safe_for_ai_context`. `src/lib/library-analysis.ts` beregner `missingText` fra
risikoflaggene `missing_text` eller `low_text_quality`. Sistnevnte er dermed et
flagg for manglende **eller for svakt tekstgrunnlag**, ikke nødvendigvis 392
helt tomme dokumenter.

`pendingReview` beregnes separat. Gruppene kan overlappe, så 392 skal ikke
summeres med 399 til en ny køstørrelse. Produksjonsuttrekket rapporterer også
`humanReviewed=0`, `externalClaimEligible=0`, `reviewComplete=false` og
`externalReady=false`.

## Presentasjonsretting

Biblioteket og søket omtaler nå feltene som «Historisk intern policy» og
«historisk KI-kontekstregel». AI-kunnskapsflaten forklarer autoritetsgrensen,
viser de 392 lavtekstflaggene eksplisitt og opplyser at tallet kan overlappe
review-køen. Ingen statusverdier, bruksregler, køposter eller kildeposter er
endret.

## Postnivåavstemming mot produksjon

Et nytt uttrekk ble lest direkte fra produksjonscontaineren
`so8ko44goccc8gcgswwscgco-005525915188` 9. september 2026 kl. 01:30 UTC.
Transaksjonen brukte `BEGIN READ ONLY`, og `SHOW transaction_read_only` svarte
`on`. Uttrekket inneholder bare identitets-, koblings- og klassifiseringsfelt;
ingen fulltekst eller credentials. Reproducerbart script og resultat ligger i
den private restlist-mappen. `readback-v1.*` bevarer første uttrekk.
`readback-v2.{mjs,json}` gjør SourceDoc-valget deterministisk med `ORDER BY id`,
teller alle backlink-kandidater og merker valg som `direct_library_binding`
eller `document_backlink_candidate`. En backlink er bare en mulig kjede, ikke
bekreftet kildeidentitet. `missing-text-worklist.json` er den avledede
metadata-worklisten for alle 392 poster.

Uttrekket avstemmer til API-totalen på 1 770. Råtabellen har 1 355
`approved_internal`, 399 `review_required`, 15 `ai_draft` og 1 `blocked`.
API-et viser 1 354 interne policymerker og 2 blokkerte fordi den kjente
syntetiske Matsvinnloven-identiteten tvangskarantenes i leselaget. Det er en
tilsiktet fail-closed projeksjon, ikke en omskriving av historikken.

### Hva «392 mangler tekst» faktisk betyr

Alle de 392 postene har `low_text_quality`; ingen har `missing_text`. Alle har
noe registrert tekst: 97 har 1–49 ord og 295 har 50–149 ord. Null og 0 er
kontrollert separat; begge teller 0. Tallet betyr derfor
«tekstgrunnlag under 150-ordsgrensen», ikke «392 tomme dokumenter».

Alle 392 står i `review_required`, `internal_background` og review-kø. Ingen av
dem har et samtidig legacy-merke for `safe_for_ai_context`. Reparasjonsmatrisen
er uttømmende og summerer til 392:

| Gruppe | Antall | Faktisk kjede | Neste tekniske handling |
| --- | ---: | --- | --- |
| Dokument med SourceDoc | 70 | SourceDoc → Document → `review_required` | Kontroller identitet og locator, hent fulltekst, bygg ny hashbundet analyse. |
| Dokument uten SourceDoc | 172 | Fil/URL → Document → `review_required` | Kontroller dokumentets egen locator og erstatt korttekst med verifisert fulltekst. |
| SourceDoc uten Document | 56 | SourceDoc → manglende Document → `review_required` | Hent og identitetskontroller originalen før en egen, senere bind-/importjobb. |
| Rapport uten SourceDoc/Document | 83 | Report → brutt dokumentkjede → `review_required` | Finn autoritativ rapportidentitet og locator; ikke blindmatch på tittel. |
| Avhandling uten SourceDoc/Document | 11 | Thesis → brutt dokumentkjede → `review_required` | Finn institusjonsoppføring/original og bind først etter identitetskontroll. |

Dette er arbeidsgrupper, ikke reviewvedtak. Fulltekstinnhenting endrer heller
ikke autoritet eller åpner ekstern bruk.

V2 fant 126 direkte LibraryAnalysisRecord→SourceDoc-bindinger i 392-utvalget
(70 med Document, 56 uten). De resterende 266 har ingen valgt SourceDoc. Ingen
rad brukte en dokument-backlink som kandidat, og ingen hadde flere backlink-
kandidater. Worklisten prioriterer 169 poster som P1 fordi de har under 50 ord
eller mangler Document; 223 er P2. Prioritet beskriver teknisk reparasjonsorden,
ikke faglig viktighet eller godkjenning.

### Representative kildekjeder

1. **Syntetisk Matsvinnloven-placeholder.** LibraryAnalysisRecord
   `cmsompb1300s1knkxph46adad` peker til Document
   `cmppas6oi00003evmux65v0s6` og `research/thesis-matsvinnloven-2025.md`.
   Råhistorikken sier `approved_internal` + `safe_for_ai_context` uten
   risikoflagg. `src/lib/source-quarantine.ts` identifiserer samme ID/path som
   syntetisk og projiserer den som `blocked` + `do_not_use_for_claims`; dette
   forklarer differansen 1 355→1 354 og 1→2 mellom råtabell og API. Neste
   handling er å beholde karantenen og bare erstatte posten med en identifisert
   primærkilde gjennom ordinært kandidat- og reviewløp.

2. **Rislakki 2024.** LibraryAnalysisRecord `cmsomp0p0007bknkx7wwbe5b6`
   peker til Document `cmnx3r93y003a3t0dhqrcdiax`, lokal sammendragsfil og
   JYX-URL. Den 213 ord lange sammendragsteksten har legacy-merkene
   `approved_internal` + `safe_for_ai_context`, men ingen SourceDoc-kobling.
   En ny, privat innhenting fikk HTTP 200 for original-PDF-en, SHA-256
   `5ac4298e…43c5fc0`, og `pdftotext -layout` ga 30 014 ord med SHA-256
   `b9ef48c9…f1fc8`. Sol/Terra-piloten på sammendraget ble `partial/quarantined`
   etter utelatelser og attribusjonsfeil. Neste handling er en ny forseglet
   populasjon fra originalteksten, med korrekt studieattribusjon og uavhengig
   validering; legacy-merket er ikke aktuell kvalitetsgodkjenning.

3. **Baltic Sea Food B2B-modell.** LibraryAnalysisRecord
   `cmsompkkc01b1knkxpb98z8r8` peker til SourceDoc
   `src-innh-2026-08-05-001`, som har en offentlig PDF-URL, men ingen Document.
   Klassifiseringen er `review_required` + `internal_background`, 14 ord og
   flaggene `missing_file_path`/`low_text_quality`. Neste handling er kontrollert
   innhenting og dokumentidentitet før en separat bind-/importjobb.

4. **Eriksson PhD 2015.** SourceDoc `src-88` er koblet til Document
   `cmmw354hm000dw50dsfcr7sn7` og LibraryAnalysisRecord
   `cmsomoxcy000dknkxwyklrfon`. SourceDoc har full avhandlingstittel, mens
   Document fortsatt heter `Untitled`; posten har 133 ord,
   `low_text_quality` og `review_required`. Neste handling er å avstemme
   identitet/tittel og autoritativ locator før fulltekstreparasjon og ny analyse.

5. **Bondens andel av forbrukerkronen 2025.** LibraryAnalysisRecord
   `cmsompjhx018tknkxgsqy4b6x` er en report-kilde uten Document, SourceDoc eller
   canonical path. Den har 78 ord, `missing_file_path`, `low_text_quality` og
   `review_required`. Importkoden omtaler den lokale filen som en stale
   HTML-placeholder. Neste handling er å finne en faktisk offisiell publikasjon
   eller beholde posten blokkert; tittel alene er ikke grunnlag for kobling.

6. **Langtekst-kontroll for legacy-semantikken.** LibraryAnalysisRecord
   `cmsomox6m0000knkxkkv3o3gq` peker til Document
   `cmmw353lp0000w50dyci4drp5` (`DESK-RESEARCH-PLAN.md`) med 4 154 ord og ingen
   lavtekstflagg. Den har likevel de samme historiske merkene
   `approved_internal` + `safe_for_ai_context` og ingen navngitt menneskelig
   review. Dette viser at legacy-merket er en policyklassifisering også når
   tekstgrunnlaget er langt; ordmengde gir ikke menneskelig autoritet.

Den lokale `.env`-databasen ble også kontrollert, men hadde bare 1 627 rader og
144 lavtekstposter. Den er dermed dokumentert som et eldre snapshot og brukes
ikke som bevis for aktuell produksjonsstatus.
