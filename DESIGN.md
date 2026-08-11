---
name: "Food Systems 2026"
description: "A calm internal evidence field for Nordic food-system orientation and governed decisions."
colors:
  stone-canvas: "#fafaf9"
  stone-surface: "#ffffff"
  stone-muted-surface: "#f5f5f4"
  stone-border: "#e7e5e4"
  stone-subtle: "#a8a29e"
  stone-muted: "#78716c"
  stone-body: "#57534e"
  stone-strong: "#292524"
  stone-ink: "#0c0a09"
  emerald-soft: "#ecfdf5"
  emerald-border: "#a7f3d0"
  emerald-signal: "#059669"
  emerald-link: "#047857"
  sky-soft: "#f0f9ff"
  sky-border: "#bae6fd"
  sky-evidence: "#0284c7"
  amber-soft: "#fffbeb"
  amber-border: "#fde68a"
  amber-gate: "#b45309"
  rose-soft: "#fff1f2"
  rose-gap: "#be123c"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
  mono:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  compact: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.stone-strong}"
    textColor: "{colors.stone-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  button-secondary:
    backgroundColor: "{colors.stone-surface}"
    textColor: "{colors.stone-body}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.stone-surface}"
    textColor: "{colors.stone-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.stone-surface}"
    textColor: "{colors.stone-body}"
    rounded: "{rounded.xl}"
    padding: "20px"
  chip-neutral:
    backgroundColor: "{colors.stone-muted-surface}"
    textColor: "{colors.stone-body}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  coverage-strong:
    backgroundColor: "{colors.emerald-soft}"
    textColor: "{colors.stone-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "12px"
  internal-gate:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.stone-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

# Design System: Food Systems 2026

## Overview

**Creative North Star: "The Evidence Field"**

The Evidence Field treats the interface as a calm operational landscape: stone surfaces establish the working ground, while restrained emerald, sky, amber, and rose signals reveal strategic relevance, evidence strength, gates, and gaps. It is dense enough for research work but never theatrical; hierarchy comes from typography, tonal grouping, and compact evidence structures.

The interface stays visibly internal and provenance-aware. Coverage leads, ranking never masquerades as certainty, and every summary should move the reader toward a source, the canonical completion register, or an explicit next gate rather than toward an unsupported verdict.

**Key Characteristics:**

- Calm, light stone workspace with white working surfaces.
- Compact, highly legible tables, chips, and status rails.
- Emerald strategic signal kept separate from sky evidence signal.
- Amber human, rights, and publication gates; rose for explicit gaps or negative states.
- Read-only navigation that makes uncertainty and provenance actionable.

## Colors

The palette is a stone-neutral field with four restrained semantic signals; color clarifies state but never supplies proof on its own.

### Primary

- **Strategic Emerald** (`emerald-signal` and `emerald-link`): progress, strategic relevance, active controls, links, and focus treatment.

### Secondary

- **Evidence Sky** (`sky-evidence`): evidence strength, independent-source counts, and evidentiary distributions.

### Tertiary

- **Gate Amber** (`amber-gate`): human review, rights limits, provisional status, internal-use notices, and thin coverage.
- **Gap Rose** (`rose-gap`): explicit absence, failed or negative status, and zero independently evaluated findings; use sparingly.

### Neutral

- **Field Stone** (`stone-canvas`): the application canvas.
- **Paper White** (`stone-surface`): cards, tables, controls, and navigation surfaces.
- **Quiet Stone** (`stone-muted-surface` and `stone-border`): selected navigation, table headers, dividers, and low-emphasis grouping.
- **Operational Ink** (`stone-body`, `stone-strong`, and `stone-ink`): body copy, controls, titles, and high-emphasis values.
- **Subtle Stone** (`stone-subtle` and `stone-muted`): helper copy, inactive navigation, ranks, and metadata.

### Named Rules

**The Signal Separation Rule.** Emerald expresses strategic priority or action, sky expresses evidence, amber expresses a gate, and rose expresses an explicit gap; never collapse those meanings into one score or color.

**The Color Never Proves Rule.** Every color-coded state must retain a text or numeric label, because evidence status cannot depend on hue recognition.

## Typography

**Display Font:** Outfit (with system sans-serif fallback)

**Body Font:** Outfit (with system sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (with Fira Code and monospace fallback)

**Character:** Outfit keeps the product contemporary, calm, and operational across Norwegian and English content. Weight, density, and tabular numerals establish hierarchy; the mono face is reserved for paths, commands, and reproducible technical references.

### Hierarchy

- **Display** (700, 30px, 1.2): one page title per surface, with restrained tight tracking.
- **Headline** (700, 20px, 1.4): major evidence and register sections.
- **Title** (600, 14px, 1.25): cards, table-linked entities, and subsection labels.
- **Body** (400, 14px, 1.625): explanations and evidence context, normally constrained to about 72 characters per line.
- **Label** (600, 10px, 0.05em tracking): short metadata and internal-status labels; uppercase only when the component already uses it.
- **Mono** (400, 12px, 1.5): file paths, commands, and machine-verifiable references.

### Named Rules

**The Quiet Hierarchy Rule.** Use weight, spacing, and compact numerals before increasing type size; this is a research cockpit, not a marketing page.

## Layout

The application is an asymmetric desktop shell: a fixed 224px sidebar beside a fluid content column, with a compact sticky header replacing it below 1024px. Main content is capped at 1152px and uses 16px, 24px, then 32px horizontal padding across the small, medium, and large breakpoints. Vertical section rhythm is 24px on small screens and 32px from the small breakpoint upward.

Information begins as summary, then comparison, then action. Dense content belongs in bordered tables, disclosure rows, or split panels; horizontal overflow is acceptable for a compact comparison table when it preserves column meaning. Responsive layouts stack before they compress labels into ambiguity.

For the project-landscape surface, the first viewport places the title and internal status rail above a nine-cell Nordic and Sápmi geographic field, with thematic depth alongside on large screens. The page story is coverage first, strategic-versus-evidence comparison second, then action on filtered profiles, candidates, and gaps. This is the accepted grounded, coverage-matrix-first direction (candidate 3, seed `b72388ae`) and a page-level expression of the system, not a universal dashboard template.

## Elevation & Depth

The system is flat by default. Depth comes primarily from white-on-stone tonal layering, fine borders, inset grouping, and occasional dark evidence panels; canonical cards use only a very soft low shadow (`0 1px 2px 0 rgb(28 25 23 / 0.03)`).

### Shadow Vocabulary

- **Ambient Low** (`0 1px 2px 0 rgb(28 25 23 / 0.03)`): quiet separation for reusable white cards only.

### Named Rules

**The Flat-by-Default Rule.** Do not stack decorative shadows; use borders and tonal surfaces first, and reserve the soft shadow for a reusable card that needs gentle separation.

## Shapes

The form language is gently rounded and practical. Small evidence bars use a 2px radius; labels and internal notices use 6px; buttons, inputs, and navigation items use 8px; standard cards use 12px; large data fields and tables use 16px. Status badges and progress tracks are fully pill-shaped. Borders are one pixel and low contrast, while table rows prefer dividers over individually boxed cells.

## Components

Components feel restrained and explicit: the action, state, and evidence meaning should be readable before decorative treatment is noticed.

### Buttons

- **Shape:** gently rounded controls (8px) with compact 8px × 12px padding.
- **Primary:** dark operational ink with white text, reserved for the main source or canonical-register action.
- **Secondary:** white with a stone border and stone text for supporting report or navigation actions.
- **Hover / Focus:** a small tonal shift on hover and a visible 2px emerald focus ring with offset; no lift animation.

### Chips

- **Style:** compact neutral or semantic labels with text preserved alongside color; pills are used for reusable status badges, while square-ended 6px tags support dense metadata.
- **State:** selected filters invert to dark stone; evidence uses sky, strategic progress uses emerald, gates use amber, and gaps use rose.

### Cards / Containers

- **Corner Style:** 12px for reusable cards and 16px for major data fields.
- **Background:** paper white on the stone canvas; stone tint may group expanded or secondary content.
- **Shadow Strategy:** flat for data containers; ambient-low only for canonical cards.
- **Border:** one-pixel quiet stone border.
- **Internal Padding:** 16px for compact data containers and 20px for canonical cards.

### Inputs / Fields

- **Style:** white field, 8px corners, one-pixel stone border, 8px × 12px padding, and 14px text.
- **Focus:** border shifts to strategic emerald with a soft 2px emerald halo.
- **Error / Disabled:** preserve an explicit text label; do not rely on a red or muted field alone.

### Navigation

Desktop navigation is a white, fixed-width rail with 14px labels and 12px descriptions; active items sit on quiet stone and use operational ink. Mobile navigation uses a 56px sticky header and a full-width stacked menu with the same active and hover language. The emerald dot is the small persistent product signal, not a decorative logo substitute.

### Coverage Matrix and Compact Tables

The coverage matrix is the project landscape's signature control: a three-by-three field of selectable cells whose count, label, and semantic state all remain visible. Strategic scores use emerald bars; evidence scores use separate sky segments and a numeric `/5` label. Tables keep 12px text, tabular numerals, quiet dividers, and horizontal scrolling when necessary.

**The Two-Axis Verdict Rule.** Strategic priority and evidence strength must remain separate visual variables; ranking may order attention, but it must never imply independent verification.

## Do's and Don'ts

### Do:

- **Do** lead with Nordic and thematic coverage before showing rank.
- **Do** keep source counts, evidence strength, ownership affiliation, rights limits, and next gates visible and separately labelled.
- **Do** use the completion register as the canonical destination for completion, human, rights, source, and publication gates.
- **Do** preserve compact tables, tabular numerals, semantic headings, visible focus, and responsive stacking.
- **Do** finish a new surface with review, a clear verdict, and updated design documentation.

### Don't:

- **Don't** use emerald strategic priority as a proxy for sky evidence strength.
- **Don't** present candidates, owner-affiliated claims, or project reporting as independently verified findings.
- **Don't** imply that a read-only projection promotes a candidate, imports data, publishes externally, or closes a gate.
- **Don't** hide unknown, thin, or blocked coverage behind completeness language or a zero without context.
- **Don't** introduce a separate visual identity, ornamental gradients, oversized marketing type, or decorative card stacks into the incumbent stone system.
