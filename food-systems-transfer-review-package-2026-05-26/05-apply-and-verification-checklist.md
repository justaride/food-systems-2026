# Apply and verification checklist

Date: 2026-05-26

Use this only in a session where `/Users/gabrielfreeman/Documents/Food Systems 2026` is writable.

## 1. Preflight

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git status --short --branch
cat package.json
rg -n "Moerman|Moermans|Wageningen|R9|10R|cascad|Food TG|mandat" docs src research PROJECT-OVERVIEW.md
```

Stop if target files have unrelated edits that must be preserved manually.

## 2. Add Food-local documents

Add:

- `docs/meetings/JT-GABRIEL - Metodeoverforing Cities Food mai 2026.md`
- `docs/project/mandates/food-tg-wageningen-moerman-method-transfer-2026-05-26.md`

The meeting/intake note must include:

> Food-relevant material from the Cities/JT audit is ready for transfer as an internal evidence package, but it is not yet Food Systems source-registered or externally validated.

## 3. Update Food indexes and app data

Update:

- `docs/meetings/MØTEOVERSIKT.md`
- `docs/meetings/STATUS-2026-05-26.md`
- `docs/project/mandates/README.md`
- `src/lib/data/meetings.ts`
- `src/lib/data/food-tg-control-layer.ts`
- `src/lib/data/evidence-pack.ts`
- `src/lib/data/r-ladder.ts`

Required visible status:

- meeting/intake 9 is cross-project intake, not formal Food TG meeting
- method transfer is `klar-med-forbehold`
- external validation remains open
- Wageningen source is candidate-present, but locator and claim closure remain open

## 4. Source-registration tasks

Create or update Food source/citation records for:

| Item | Required Food status |
|---|---|
| Wageningen direct method source | source-candidate-present; locator-open until page/table/figure links exist |
| Moermans ladder | method-decision-needed |
| R9 connection | already-present, needs Food cascade mapping |
| Ghana household waste example | benchmark-only |
| Food cascade table | internal-method-candidate |
| 16-field case-evaluation template | internal-scoring-template; explicitly Food-adapted, not verbatim Wageningen Table 1 |

## 5. Run verification

At minimum:

```bash
npm run lint
npm test
npm run db:audit:strict-sources
```

Then:

```bash
npm run build
```

If build is not run, record the reason and run a targeted TypeScript/import check instead.

## 6. Physical QA

Open and check:

- `/moter`
- `/mandat`
- `/metodikk`
- `/sirkularitet`

Expected result:

- meeting/intake appears without implying formal Food TG decision
- `/mandat` shows source-gated method transfer
- R9 still works as current ladder
- Food cascade language does not imply external validation
- no UI text says pilotklar, validert, source-closed or externally ready

## 7. Return status to Circular

Only after Food-local registration, return to Circular and update:

- `research/synthesis/food-project-transfer-note-from-cities-jt-audit-2026-05-22.md`

Use this wording:

> Food transfer status: copied into Food Systems 2026 on [date]; Food source-registration remains open until the Food repo marks each transferred claim with citation-readiness.

## Stop rules

- Do not mark external-ready until direct Wageningen/Cathrine source package, locators and claim links are registered.
- Do not call Ghana a Nordic comparable case.
- Do not turn cascade placement into pilot readiness.
- Do not hide the fact that this came from a Circular/JT cross-project intake.
- Do not treat a meeting note as an external source.
