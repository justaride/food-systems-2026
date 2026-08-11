# Product

<!-- impeccable:product-schema 1 -->

> Product facts below are inferred from the repository, the deployed platform, and the user's approval on 2026-08-10 to expose the governed project landscape as an internal product surface.

## Platform

web

## Users

The primary users are members of the Food Systems Transition Group and close project collaborators. They use the platform to orient themselves in a large Nordic knowledge base, compare evidence, choose research priorities, and understand which findings can support internal decisions.

## Product Purpose

Food Systems 2026 is an internal knowledge and decision system for understanding Nordic food-system actors, value chains, evidence, gaps, and possible interventions. Success means that a reader can move from overview to source or documented gate without confusing internal synthesis, project reporting, independent evidence, candidates, or externally usable claims.

## Positioning

The platform combines system mapping with explicit claim, source, rights, and human-gate status. Its distinctive mechanism is not simply collecting food-system information, but preserving how strongly each item is supported and what review action is required next.

## Operating Context

The product is used as an authenticated internal web platform alongside versioned research artifacts, JSONL registers, validators, source manifests, the completion register, and Git-based review. Research files remain the reproducible evidence surface; the web application is a governed reading and navigation layer.

## Capabilities and Constraints

- Existing stack: Next.js, React, TypeScript, Tailwind-style utility classes, Prisma-backed and file-backed server surfaces.
- The project landscape is file-backed and read-only in this integration.
- Main profiles, longlist candidates, sources, and search logs retain their existing status and provenance boundaries.
- No candidate promotion, database import, external contact, or external publication is implied by showing the landscape in the application.
- The completion register remains canonical for source, human, and publication gates.
- Norwegian is the primary language; existing internationalization behavior must remain intact.

## Brand Commitments

Preserve the incumbent Food Systems 2026 interface: calm operational typography, stone neutrals, restrained emerald/amber/sky status colors, compact evidence chips, clear tables, and explicit internal-use messaging. Do not introduce a separate visual identity for the landscape.

## Evidence on Hand

- `research/landscape/projects-2026-08-10.jsonl`: 40 verified, scoreable profiles.
- `research/landscape/longlist-2026-08-10.jsonl`: candidate and disposition queue.
- `research/landscape/sources-2026-08-10.jsonl`: field- and claim-linked source register.
- `research/landscape/search-log-2026-08-10.jsonl`: documented search and stop-rule record.
- `research/landscape/report-2026-08-10.md`: reproducible Norwegian decision report.
- `docs/project/status/food-systems-completion-register-2026-07-15.md`: canonical completion and gate surface.

There are no independently evaluated qualitative outcomes in the current landscape. The interface must not imply otherwise.

## Product Principles

1. Show evidence strength separately from strategic relevance.
2. Keep verified main profiles visibly separate from candidates and dispositions.
3. Make gaps and uncertainty navigable instead of hiding them behind completeness language.
4. Let every summary lead toward a source, register, or explicit next gate.
5. Prefer reproducible file-derived views over duplicate manually maintained facts.

## Accessibility & Inclusion

Use semantic headings, tables, links, visible focus states, non-color status labels, sufficient contrast, and responsive layouts. Sámi knowledge and other rights-sensitive material must retain explicit human and rights gates.
