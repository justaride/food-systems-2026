---
tittel: Obsidian lokal config-policy
dato: 2026-07-04
arbeidsflate: Food Systems Obsidian/
status: aktiv
---

# Obsidian lokal config-policy

Denne policyen skiller delt presentasjonskonfig fra lokal Obsidian-støy.

## Trackes i repoet

- `Food Systems Obsidian/.obsidian/graph.json` - delt standardgraf, filtre og fargegrupper.
- `Food Systems Obsidian/.obsidian/snippets/kunnskapskart.css` - delt CSS-snippet for badges og canvas-lesbarhet.

## Holdes lokalt

- `Food Systems Obsidian/.obsidian/workspace*.json`
- `Food Systems Obsidian/.obsidian/app.json`
- `Food Systems Obsidian/.obsidian/appearance.json`
- `Food Systems Obsidian/.obsidian/community-plugins.json`
- `Food Systems Obsidian/.obsidian/core-plugins.json`
- `Food Systems Obsidian/.obsidian/types.json`
- `Food Systems Obsidian/.obsidian/plugins/`

## Arbeidsregel

Installer Dataview, Breadcrumbs, Minimal Theme Settings og Juggl eller 3D Graph lokalt i Obsidian. Ikke commit plugin-bundles, workspace-state eller personlige UI-valg. Hvis en ny `.obsidian`-fil trengs for alle, dokumenter hvorfor i PR-en og legg den eksplisitt inn i policyen.
