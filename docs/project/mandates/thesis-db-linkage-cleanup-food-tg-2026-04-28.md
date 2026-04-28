---
tittel: "Thesis DB/linkage cleanup - Food TG"
status: Utført internt
eier: Gabriel / Codex
dato: 2026-04-28
neste_handling: "Kjør kontrollert dokumentimport for nye supplemental matches og lukk reelle PDF-hull."
relaterte_filer:
  - docs/project/mandates/academic-theses-integration-audit-food-tg-2026-04-28.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - research/seed-pdf-map.overrides.json
  - research/seed-pdf-map.json
  - research/PLATTFORM-KOBLING.md
  - research/DOWNLOAD-QUEUE.md
  - scripts/import-research-docs.ts
---

# Thesis DB/linkage cleanup - Food TG

## 1. Hva som er gjort

Etter at avhandlingene ble promotert til Food TG source cards, EV-rader og claim-koblinger, ble dokumentkoblingen kontrollert mot live Prisma og lokale filer.

Følgende reproduserbare mapping-fikser er lagt inn:

| Fil | Endring |
|---|---|
| `research/seed-pdf-map.overrides.json` | Lagt inn manuell PDF-kobling for `albizzati-phd-2021`, `hebrok-phd-2020` og `sundin-phd-2024`. |
| `scripts/import-research-docs.ts` | Lagt inn supplemental matches for Albizzati, Hebrok, Nguyen & Hartmann, Sundin og Sundqvist, slik at dokumentimport kan koble PDF-er til Thesis-rader eller lage `DocumentRef`. |
| `research/seed-pdf-map.json` | Regenerert etter overrides. Thesis PDF-dekning økte fra 42/78 til 44/78. |
| `research/PLATTFORM-KOBLING.md` | Regenerert etter ny seed-PDF-map. |
| `research/DOWNLOAD-QUEUE.md` og `research/download-queue.csv` | Regenerert etter ny plattformkobling. |

Teknisk sjekk:

- `npx tsc --noEmit --pretty false` passerte.
- `npm run db:generate` ble kjørt fordi Prisma Client manglet lokalt.
- DB-sletting utført etter eksplisitt godkjenning 2026-04-28: 7 `thesis-food-*` duplicate rows ble slettet etter guard-sjekk.

## 2. Live DB-observasjoner

Live Prisma viste at de prioriterte Food TG-avhandlingene har tre ulike koblingstilstander:

| Tilstand | Eksempler | Vurdering |
|---|---|---|
| Har `documentId` til MD-sammendrag og PDF finnes via lokal fil/DocumentRef eller mapping | `brancoli-phd-2021`, `sorensen-phd-2016`, `martens-norum-2020`, `nguyen-hartmann-2024` | Akseptabelt for appstruktur, men PDF bør være tydelig koblet med `DocumentRef`. |
| Har `documentId` til PDF | `lindstrom-phd-2021`, `ulsaker-phd-2016` | Best status. |
| Mangler `documentId`, men lokal PDF finnes | `albizzati-phd-2021`, `skjervheim-flo-2016` | Bør kobles ved kontrollert import/linking. |
| Mangler lokal PDF eller har bare usikker/svak lokal fulltekst | `slu-house-crickets-2025`, `halseth-phd-2024` | Krever nedlasting/primærsjekk før full dokumentstatus kan lukkes. |

Viktig: flere `Document.filePath`-verdier i DB er relative til `research/` uten prefiks. Det gjør at en naiv `existsSync(process.cwd(), filePath)` feiler, mens `research/<filePath>` finnes. Dette er en generell filsti-/audit-konvensjon, ikke nødvendigvis manglende fil.

## 3. Duplikatrader slettet 2026-04-28

Disse `thesis-food-*` radene hadde ingen `documentId`, ingen `keyFindings`, ingen `takeaways` og ingen `method`. De overlapper canonical Thesis-rader som har strukturert innhold. De ble slettet fra Prisma 2026-04-28.

| Duplicate ID | Canonical ID | Begrunnelse |
|---|---|---|
| `thesis-food-67557def0cdf` | `simonsen-2017` | Duplicate har bare import-tags; canonical har `documentId`, funn, takeaways og metode. |
| `thesis-food-bef4051e02de` | `morken-2015` | Duplicate har bare import-tags; canonical har `documentId`, funn, takeaways og metode. |
| `thesis-food-5c1b2fbf7c82` | `sedwall-2025` | Duplicate har bare import-tags; canonical har funn, takeaways og metode. |
| `thesis-food-3a4005a27bf6` | `esposito-2022` | Duplicate har bare import-tags; canonical har `documentId`, funn, takeaways og metode. |
| `thesis-food-7a19be6dbec1` | `sorensen-phd-2016` | Duplicate er feilgradert som master; canonical er PhD og har `documentId`, funn, takeaways og metode. |
| `thesis-food-49a5e899db68` | `brancoli-phd-2021` | Duplicate er feilgradert som master; canonical er PhD og har `documentId`, funn, takeaways og metode. |
| `thesis-food-28bf4892a6a2` | `jorgensen-ahmadi-2024` | Duplicate har bare import-tags; canonical har `documentId`, funn, takeaways og metode. |

Etter sletting:

| Metrikk | Status |
|---|---:|
| Slettede duplicate rows | 7 |
| Gjenværende `thesis-food-*` rows | 0 |
| Thesis-rader totalt | 79 |
| Master | 64 |
| PhD | 15 |
| Thesis med `documentId` | 64 |
| Thesis med `keyFindings`, `takeaways` og `method` | 79 |

## 4. Konkrete neste operasjoner

| Operasjon | Risiko | Anbefaling |
|---|---|---|
| Kjør kontrollert dokumentimport/linking etter ny `scripts/import-research-docs.ts` mapping | Lav/moderat | Gjør dette først. Importen bør koble Albizzati og lage/oppdatere PDF-relasjoner for Hebrok, Sundin, Sundqvist og Nguyen. |
| Slett 7 `thesis-food-*` duplicate rows | Utført | Ferdig 2026-04-28 etter guard-sjekk; canonical IDs beholdt. |
| Last ned/lukk PDF-gap for `halseth-phd-2024` og `slu-house-crickets-2025` | Lav, men krever nett/manuell kilde | Kjør som egen kildeinnhenting; disse er fortsatt reelle hull i lokal PDF-dekning. |
| Re-kjør `research/PLATTFORM-KOBLING.md` og `research/DOWNLOAD-QUEUE.md` etter DB/linking | Lav | Brukes som sluttkontroll. |

## 5. Beslutningsstatus

Food TG kan nå bruke avhandlingene som strukturert intern evidens. Ryddingen som gjenstår handler ikke om innholdet i claimene, men om datalaget:

1. gjøre PDF-/MD-koblinger reproduserbare,
2. lukke de få reelle PDF-hullene,
3. holde ekstern bruk av claimene på `Utført internt` til aktør-/primærvalidering er gjort.

Ingen av disse bør endre substansen i `source-shortlist`, `evidence-matrix` eller `claim-register`; de gjør bare strukturen mer robust.
