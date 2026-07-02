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

Snapshot per 2026-07-02. Refresh alltid med `gh pr view <nr> --json isDraft,mergeStateStatus,statusCheckRollup,baseRefName,headRefName` før merge.

1. Baseline: PR #228 `codex/obsidian-kunnskapskart-2026-07-02` -> `main`.
2. M1: PR #229 `codex/obsidian-kunnskapskart-m1-2026-07-02` -> `codex/obsidian-kunnskapskart-2026-07-02`.
3. Etter M1 kan M2, M3 og M4 vurderes som parallelle fase-PR-er på M1-basen:
   - PR #231 M2 innholdsløft.
   - PR #232 M3 visningsflate/runbook.
   - PR #230 M4 prosessopprydding.
4. PR #233 er et draftet integrasjonsbevis for M2+M3+M4 oppå M1. Bruk den som konflikt-/checkout-proof, ikke som erstatning for fase-PR-ene uten eksplisitt menneskelig merge-valg.
5. Ikke kall M0 oppfylt før PR #228 er merget, gammel untracked lokal vault-kopi er fjernet/flyttet, Obsidian-pluginoppsettet i `0 Kart/Oppsett.md` er aktivert, og Gabriel har notert førsteinntrykk i Welcome.
6. Ikke kall M5 oppfylt før VK-5-protokollen er fylt ut etter faktisk Obsidian-gjennomgang og `npm run vault:review-closeout` er grønn.
