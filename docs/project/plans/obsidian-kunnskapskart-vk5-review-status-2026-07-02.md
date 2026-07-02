---
tittel: Obsidian kunnskapskart - VK-5 review-status
status: klar-for-menneskelig-review
dato: 2026-07-02
arbeidsflate: Food Systems Obsidian/
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md
completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md
vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md
---

# Obsidian kunnskapskart - VK-5 review-status

## Status

Repo-lokalt arbeid er klart for menneskelig VK-5-review, men kartet er ikke ferdig lukket. Den kanoniske review-sjekklisten og alle menneskelige beslutningsrader ligger i `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.

Denne statusfilen skal bare peke til kontrollflatene:

- Faseplan: `docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md`.
- Kanonisk VK-5-kravliste: `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.
- Repo-lokal audit: `docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md`.
- Historisk V2-plan: `docs/project/plans/archive/obsidian-kunnskapskart-masterplan-2026-07-02.md`.
- Historisk full completion-audit: `docs/project/plans/archive/obsidian-kunnskapskart-completion-audit-2026-07-02.md`.

## Kanoniske tallkilder

- Notetall kilde: `npm run vault:sync` og `npm run vault:check`.
- DB-univers kilde: `data/vault-export/manifest.json`.
- Review-stikkprøver: les `npm run vault:review-samples` output.

## Gjenstående porter

- I27+ etterarbeid for parkerte kandidater må gjennom egen claim-lock/datareview før nye innsiktsnoter genereres.
- VK-5 må fylles ut i Obsidian med graf-, canvas-, Dataview-, diff- og siterbarhetsreview.
- `npm run vault:review-closeout` skal feile frem til VK-5-protokollen er lukket med løste review-rader etter menneskelig review.

## PR-stack og human gate-rekkefølge

Snapshot per 2026-07-02. Refresh alltid med `gh pr view <nr> --json isDraft,mergeStateStatus,statusCheckRollup,baseRefName,headRefName` før nye merges.

1. Baseline: PR #228 `codex/obsidian-kunnskapskart-2026-07-02` -> `main` er merget (`720de60`).
2. M1: PR #229 `codex/obsidian-kunnskapskart-m1-2026-07-02` -> `main` er merget (`fc48e6a`).
3. M2/M3/M4 er valgt inn som separate fase-PR-er til `main`:
   - PR #231 M2 innholdsløft er merget (`84a3e08`).
   - PR #232 M3 visningsflate/runbook er merget (`1f5154d`).
   - PR #230 M4 prosessopprydding er merget (`17e3af4`).
4. PR #233 er et superseded integrasjonsbevis for M2+M3+M4 oppå M1. Behold kun som historisk konflikt-/checkout-proof, eller lukk den når #234 er behandlet.
5. PR #234 er M6-driftbeviset på valgt V3-stack. Det kobler `compute-metrics:full` til `vault:export-db` + `vault:sync`, krever godkjenningsrad for fremtidige I39+ innsikter og validerer gap-noters mission-ID mot `research/RESEARCH-MISSIONS.md`, men lukker ikke VK-5 og skal ikke behandles som erstatning for menneskelig review.
6. Ikke kall M0 oppfylt før gammel untracked lokal vault-kopi er fjernet/flyttet, Obsidian-pluginoppsettet i `0 Kart/Oppsett.md` er aktivert, og Gabriel har notert førsteinntrykk i Welcome.
7. Ikke kall M5 oppfylt før VK-5-protokollen er fylt ut etter faktisk Obsidian-gjennomgang og `npm run vault:review-closeout` er grønn.
