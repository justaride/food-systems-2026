---
tittel: Kalibreringsplan — utvalgsbasert feilratemåling for library-analysis
dato: 2026-08-20
status: plan, human-gated utførelse
gate: internal
scope: IG-006 nivå 2 (kalibrering) i tillitsmodellen
tillitsmodell: ../../docs/project/status/food-systems-tillitsmodell-2026-08-20.md
kanonisk_status: ../../docs/project/status/food-systems-completion-register-2026-07-15.md
---

# Kalibreringsplan — utvalgsbasert feilratemåling

Denne planen operasjonaliserer nivå 2 i
[tillitsmodellen](../../docs/project/status/food-systems-tillitsmodell-2026-08-20.md):
KI-pipelinens feilrate måles mot fulltekst i et stratifisert utvalg og
publiseres som tillitsmetadata. Planen autoriserer ikke selv noen kjøring:
utførelsen er human-gated og krever navngitt reviewer (`IG-006`).

## 1. Populasjon og strata

Populasjonen er alle `LibraryAnalysisRecord`-rader (1 770 i siste
produksjonsreadback 2026-08-11; faktisk antall leses ved uttrekk).
Stratifiseringen følger dataklassene systemet allerede bruker:

| Stratum | Definisjon | Kalibrering |
|---|---|---|
| S1 | `usageRule=safe_for_ai_context` (approved_internal/validated) | Hovedstratum — bærer intern AI-kontekst |
| S2 | `usageRule=internal_background` | Standardutvalg |
| S3 | `usageRule=type_c_gap` og `do_not_use_for_claims` | Kontrollutvalg — verifiser at blokkerte rader faktisk skal være blokkert |
| S4 | `usageRule=claim_candidate_review`, `requires_actor_gate`, `safe_for_external_claims`, eller `riskFlags` inneholder `type_b_actor_gate`, eller claim-kandidater > 0 | **Inngår ikke i utvalget** — hele klassen er nivå 3 og går til per-element-review |

Sekundær stratifisering innen S1–S3: `sourceKind` (document/report) og
tekstgrunnlag (med/uten fulltekst), slik at feilraten kan brytes ned per
kildetype.

## 2. Feiltaksonomi

Hver utvalgt rad vurderes mot fulltekst og klassifiseres:

- **F1 fabrikasjon:** påstand/funn i AI-kortet uten dekning i kilden.
- **F2 feilkobling:** riktig påstand, feil kilde eller locator.
- **F3 feilekstraksjon:** tall, enhet, periode eller geografi avviker fra kilden.
- **F4 feilklassifisering:** `usageRule`/`status` er satt høyere enn kilden bærer.
- **F5 utelatelse:** vesentlig forbehold eller kontekst i kilden mangler i kortet.

F1 og F2 er kritiske feil (hallusinasjonsklassen). F3–F5 er kvalitetsfeil.

## 3. Utvalgsstørrelse

- Store strata (N > 300): n = 150 per stratum (95 % konfidens, ±5
  prosentpoeng ved konservativ p = 0,5, endelighetskorrigert).
- Mellomstrata (30 < N ≤ 300): n = 60.
- Små strata (N ≤ 30): alle rader.
- Trekkes med seedet, dokumentert tilfeldig utvalg fra et datert uttrekk;
  uttrekksfil og seed arkiveres sammen med disposisjonene.

Første runde anslås til ~300–400 rader totalt.

## 4. Reviewprosess og inter-reviewer-regler

1. Navngitt reviewer vurderer hver utvalgt rad mot fulltekst og fører én
   disposisjon per rad (feilklasser, fritekst, dato, navn).
2. 10 % av utvalget dobbeltvurderes uavhengig; uenighet avgjøres av en
   tredje vurdering, og uenighetsraten rapporteres sammen med feilraten.
3. Pilotene fra `IG-006` (tre fulltekster) kjøres først og kan justere
   taksonomien før hovedrunden; justeringer dateres i denne planen.

## 5. Stoppregler og utfall

- **Kritisk feilrate (F1+F2) > 5 %** i et stratum: klassen fryses for ny
  AI-kontekstbruk til årsaken er funnet og rettet; berørte rader går til
  review-kø. Ny kalibreringsrunde kreves etter retting.
- **Kritisk feilrate ≤ 2 %:** klassen merkes kalibrert med målt rate.
- **Mellom 2 og 5 %:** klassen merkes kalibrert med forbehold; retting
  prioriteres, men bruken fryses ikke.
- Alle rater publiseres uansett utfall — også dårlige. En målt svak rate er
  tillitsmetadata; en skjult rate er ikke.

## 6. Output og publisering

Resultatene skrives til den styrte statusfilen
`knowledge/calibration/library-analysis-calibration.v1.json` (rounds[] med
dato, reviewer, strata, n, rater per feilklasse) og eksponeres i
`/api/library-analysis/status` under `calibration`. Frem til første runde er
gjennomført står filen ærlig i tilstanden `not_yet_run`.

## 7. Re-kalibrering

Ny runde kreves ved: bytte av modell eller ekstraksjonslogikk, ny kildetype i
korpuset, eller 12 måneder siden forrige runde — det som inntreffer først.

## 8. Verifikasjon

- Planendringer: `git diff --check` og datert oppføring i completion-registeret.
- Utførelse: disposisjoner + oppdatert kalibreringsfil + readback i
  `/api/library-analysis/status`; `IG-006`-exitkriteriene styrer lukking.
