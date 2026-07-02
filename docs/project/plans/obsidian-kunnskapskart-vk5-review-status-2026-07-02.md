---
tittel: Obsidian kunnskapskart - VK-5 review-status
status: klar-for-menneskelig-review
dato: 2026-07-02
arbeidsflate: Food Systems Obsidian/
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md
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
