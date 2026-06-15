# Karpathy guidelines port — design

**Date:** 2026-06-08
**Status:** Approved (brainstorming), pending implementation plan
**Branch:** `codex/karpathy-guidelines-port`

## Goal

Port the four behavioral guidelines from
[`multica-ai/andrej-karpathy-skills`](https://github.com/multica-ai/andrej-karpathy-skills)
(originally `forrestchang/andrej-karpathy-skills`, MIT) into this repo, adapted to our
stack and conventions. The guidelines reduce common LLM coding mistakes: silent wrong
assumptions, overcomplication, drive-by edits, and vague execution loops.

This is a **docs/config change** — no application code. It shapes how the coding agent
behaves in this repo.

## Decisions (locked during brainstorming)

1. **Scope: full port** — all four principles, not just the net-new parts.
2. **Mechanism: hybrid** — an always-on summary in root `CLAUDE.md` plus a detailed
   on-demand guide. Behavioral rules must load every turn; depth and examples load when
   needed. This reconciles the source's always-on `CLAUDE.md` model with our existing
   task-gated "read only the guide that matches" dispatch.
3. **Examples: rewrite in our stack** — TypeScript / Next.js / Prisma, obeying
   `.claude/code-conventions.md` (single quotes, `type` over `interface`, sparse comments).
4. **Reconciliation: cross-reference** — where a principle overlaps an existing skill or
   convention, point to it rather than restating. Single source of truth, no drift.
5. **Surfaces: Claude Code only** — no `.cursor/` rule, no `.claude-plugin/` packaging, no
   `marketplace.json`. This repo is a consuming project, not a distributable plugin.

## The four principles (source content)

1. **Think before coding** — Don't assume; don't hide confusion; surface tradeoffs. State
   assumptions, present interpretations when ambiguous, push back when a simpler approach
   exists, stop and ask when unclear.
2. **Simplicity first** — Minimum code that solves the stated problem. No speculative
   abstraction, unrequested config, or error handling for impossible scenarios.
3. **Surgical changes** — Touch only what you must; clean up only your own mess. Every
   changed line traces to the request; match existing style; don't refactor or delete code
   you weren't asked to touch.
4. **Goal-driven execution** — Define verifiable success criteria, then loop until green.
   Transform imperative tasks ("fix X") into declarative goals ("write a test that
   reproduces X, then make it pass").

## File inventory

| File | Change | Notes |
|------|--------|-------|
| `CLAUDE.md` (root) | **Add** one always-on `## Behavioral guidelines` section (~12–15 lines) | Placed after `## Essentials`, before `## Task-Specific Guides` |
| `.claude/karpathy-guidelines.md` | **New** detailed guide: full 4 principles + 8 TS examples + anti-pattern table + provenance/MIT credit | Linked *from* the behavioral section; **not** added to the task-gated guide list |
| `.claude/code-conventions.md` | **Untouched** | Cross-referenced, not edited |

Adding the new guide is consistent with `code-conventions.md` ("don't add docs unless
asked") because it was explicitly requested.

## Component 1 — always-on section in `CLAUDE.md`

Draft (final wording tuned during implementation):

```markdown
## Behavioral guidelines

Apply to every task — the "why"; linked skills/guides are the "how". Full text + worked
TS examples: [.claude/karpathy-guidelines.md](.claude/karpathy-guidelines.md). Bias toward
caution on non-trivial work; use judgment on trivial fixes.

1. **Think before coding** — State assumptions; if a request is ambiguous, surface
   interpretations and ask rather than guess. → brainstorming skill
2. **Simplicity first** — Minimum code that solves the stated problem; no speculative
   abstraction or unrequested config. → code-conventions.md
3. **Surgical changes** — Every changed line traces to the request; match surrounding
   style; don't refactor or delete code you weren't asked to touch. → code-conventions.md
4. **Goal-driven execution** — Turn tasks into verifiable success criteria, then loop to
   green. → test-driven-development + verification-before-completion skills
```

Rationale: deliberately **not** added to the "Read only the guide that matches" list —
that list means "skip unless relevant," which is wrong for rules that apply to every task.
The deep-dive guide is pulled when worked examples are needed (e.g. a judgment call).

## Component 2 — `.claude/karpathy-guidelines.md`

Structure:

1. Title + 2-line provenance (Karpathy tweet; adapted from
   `forrestchang/andrej-karpathy-skills`, MIT) + caution-vs-speed tradeoff note.
2. The four principles, expanded (source's full text), each closing with its in-repo
   cross-reference pointer.
3. **Worked examples** — 8 ❌→✅ pairs in TS/Next/Prisma (see below).
4. Anti-patterns summary table.
5. "How to know it's working" closing (fewer drive-by diffs; clarifying questions before
   mistakes, not after).

## Worked examples (8 pairs, rewritten to our stack/domain)

Each is illustrative — not a claim about a real file. Each principle appears twice.

| # | Principle | Source scenario | Our version |
|---|-----------|-----------------|-------------|
| 1 | Think | Export user data | Export company/producer data — scope/format/fields ambiguity |
| 2 | Think | "Make search faster" | "Make `/selskap` faster" — latency vs throughput vs perceived |
| 3 | Simplicity | Discount `Strategy` hierarchy | Single ownership-share calc over-abstracted vs one function |
| 4 | Simplicity | `PreferenceManager` w/ cache/validate/notify | Save a setting via plain Prisma `upsert` vs bloated manager |
| 5 | Surgical | Fix empty-email bug + drive-by refactor | Fix a validator/import bug without reformatting neighbors |
| 6 | Surgical | Style drift adding logging | Add logging to an import script, keep single quotes / no type churn |
| 7 | Goal | "Fix auth" vague vs verifiable | "Fix the citation system" → reproduce-test-first |
| 8 | Goal | Sorting breaks on duplicate scores | Producer sort with metric ties → deterministic stable sort + test |

Two of the source's nine examples are dropped (rate-limiting multi-step and one redundant
Goal example) to keep a tight set covering each principle twice.

## Verification

This is prose/config — no TDD applies. Success criteria:

- Both files exist and are valid markdown.
- Every cross-reference resolves: `CLAUDE.md` → guide link works; pointers name real skills
  (`brainstorming`, `test-driven-development`, `verification-before-completion`) and real
  files (`.claude/code-conventions.md`).
- The always-on section is ≤ 15 lines.
- `npm run lint` passes; `npm run build` still succeeds (sanity gate — docs don't affect
  the build).
- All example code is valid TypeScript and obeys `.claude/code-conventions.md`.

## Out of scope

- `.cursor/` rules and `.claude-plugin/` / `marketplace.json` packaging.
- README or LICENSE changes (a one-line MIT attribution lives inside the new guide).
- Editing `.claude/code-conventions.md` or any application code.
- Distributing these guidelines as a reusable plugin.

## Attribution

Content adapted from `forrestchang/andrej-karpathy-skills` (MIT), derived from Andrej
Karpathy's observations on LLM coding pitfalls. Attribution noted inline in the new guide.
