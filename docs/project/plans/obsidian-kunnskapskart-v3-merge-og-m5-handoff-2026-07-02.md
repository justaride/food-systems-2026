---
status: main-integrert-klar-for-menneskelig-m5-review
dato: 2026-07-02
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md
eier: Gabriel
---

# Obsidian V3 main- og M5-handoff

Dette er operatornotatet for å ta V3 fra integrert `main` til menneskelig VK-5-closeout. Notatet er ikke et ferdig-stempel: `vault:review-closeout` skal fortsatt være rød frem til Obsidian-review er gjennomført og VK-5-protokollen er lukket.

## Nåværende PR-stack

| Rekkefølge | PR | Base | Head | Status per 2026-07-02 |
|---|---|---|---|---|
| 1 | #228 — V2 baseline | `main` | `codex/obsidian-kunnskapskart-2026-07-02` | Merget til `main` (`720de60`) |
| 2 | #229 — M1 oversiktslag | `main` | `codex/obsidian-kunnskapskart-m1-2026-07-02` | Merget til `main` (`fc48e6a`) |
| 3 | #231 — M2 innholdsløft | `main` | `codex/obsidian-kunnskapskart-m2-2026-07-02` | Merget til `main` (`84a3e08`) |
| 4 | #232 — M3 visningsflate | `main` | `codex/obsidian-kunnskapskart-m3-2026-07-02` | Merget til `main` (`1f5154d`) |
| 5 | #230 — M4 prosessopprydding | `main` | `codex/obsidian-kunnskapskart-m4-2026-07-02` | Merget til `main` (`17e3af4`) |
| Proof | #233 — V3 integration proof | `codex/obsidian-kunnskapskart-m1-2026-07-02` | `codex/obsidian-kunnskapskart-v3-integration-2026-07-02` | Superseded av separate fase-PR-merges; behold kun som historisk konfliktbevis |
| Drift | #234 — M6 drift automation og guardrails | `main` | `codex/obsidian-kunnskapskart-m6-drift-2026-07-02` | Merget til `main` (`eeccd01`); drift-guardrails integrert, men M5 er fortsatt åpen |

M2, M3 og M4 ble valgt inn som separate fase-PR-er etter M1. PR #233 er dermed ikke lenger en merge-kandidat; den kan lukkes når historisk konfliktbevis ikke trengs. PR #234 er merget som M6-driftoppfølging på den valgte V3-stacken: den kobler `compute-metrics:full` til `vault:export-db` + `vault:sync`, krever godkjenningsrad for fremtidige I39+ innsikter og validerer at gap-noters mission-ID finnes i `research/RESEARCH-MISSIONS.md`; den lukker ikke M5.

## Hva som er Codex-klart

- M1 gjør kartet lesbart: kjerne/periferi, graf-filter, slash-migrering, Oversiktskart og støyvern.
- M2 legger inn selvbærende utkast i I27, I31, I34, I36, I37 og I38, og posisjonstekst-utkast på kjerneaktører.
- M3 dokumenterer presentasjonsvisninger og eksportløype i `Food Systems Obsidian/0 Kart/Oppsett.md`.
- M4 slanker review-prosaen og beholder `vault:review-closeout` som menneskeport.
- M6-driftoppfølgingen i #234 gjør DB-refresh-rutinen til en vault-refresh-rutine og legger inn drift-guardrails for nye I39+ innsikter og gap→mission-koblinger, men krever fortsatt live DB/tunnel når `vault:export-db` faktisk kjøres.

## Merge- og review-rutine

1. #228, #229, #231, #232 og #230 er merget til `main`.
2. Åpne `Food Systems Obsidian/` i Obsidian med Dataview, Breadcrumbs, Minimal Theme Settings og Juggl/3D Graph eller 3D Graph aktivert.
3. Gå gjennom M0/M1 førsteinntrykk: Welcome, Oversiktskart, global graf med kjernefilter, og `0 Kart/Oppsett.md`.
4. M6-driftoppfølgingen fra #234 er allerede integrert. Den er ikke nødvendig for VK-5-review, men gjør senere DB-refresh, fremtidige I39+ innsikter og gap→mission-drift mer robuste.
5. Lukk #233 som superseded proof-PR når du ikke lenger trenger den som historisk konfliktbevis.
6. Utfør VK-5 i `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.
7. Når reviewen er faktisk lukket, oppdater protokollens frontmatter-status til en tillatt lukket verdi (`fullfort`, `fullført`, `ferdig` eller `lukket`) og fyll beslutningsradene.
8. Kjør `npm run vault:review-closeout`. Først når den er grønn kan V3 kalles ferdig internt arbeidskart og godkjent visningsflate.

## Kommandoer på oppdatert main

```bash
DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:generate
npm run vault:sync
npm run vault:check
npm test
npm run lint
npm run build
npm run vault:review-preflight
npm run vault:review-samples
npm run vault:review-closeout
```

Forventet før M5 er lukket: alle kommandoer er grønne unntatt `npm run vault:review-closeout`, som skal feile på åpen VK-5-protokoll.

## M5-sjekk i Obsidian

- 10-sekunderstesten: Åpne vaulten kaldt. Welcome + Oversiktskart skal gi riktig helikopterbilde uten å forklare mappestrukturen muntlig.
- Graf-test: Global graf skal åpne med kjernefilter og uten register-/kildehårball som førsteinntrykk.
- Canvas-test: Sjekk `Oversiktskart.canvas`, `Kunnskapskart.canvas`, `Verdikjedekart.canvas`, `Maktkart.canvas`, `Temakart/Sirkularitet.canvas` og `Temakart/Norden.canvas`.
- Stress-test: Åpne `0 Kart/Konsern/NorgesGruppen ASA.canvas` og se om treet er lesbart nok som intern analysefigur.
- M2-teksttest: Les I27/I31/I34/I36/I37/I38 uten å klikke videre. Hver note skal ha claim, tallgrunnlag, kilde og forbehold, men tekstene er fortsatt utkast til menneskelig godkjenning.
- Claim-gate: Ingen tekst fra M2 eller M3 brukes eksternt uten claim-lock/siterbarhets-gate.

## Ikke kall dette ferdig før

- VK-5-protokollen er lukket med konkrete beslutninger, ikke bare grønn CI.
- `npm run vault:review-closeout` er grønn etter review.
- Minst én graf-/canvas-visning er brukt i faktisk møte eller leveranse, eller eksplisitt parkert som ikke nødvendig for denne runden.
