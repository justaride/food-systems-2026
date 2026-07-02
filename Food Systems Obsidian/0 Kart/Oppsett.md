---
type: datafundament
status: generert
kilde: docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md
siterbarhet: intern
---

# Oppsett

> Presentasjons- og arbeidsoppsett for [[HUB – Kunnskapsdatabasen]].

## Snippets

- `.obsidian/snippets/kunnskapskart.css` — fargede type-/status-/siterbarhetsbadges og strammere canvas-typografi.

## Plugin-oppsett

- Dataview — MOC-tabeller for utkast, gaps og siterbarhet.
- Breadcrumbs — hierarki familie → konsern → datter.
- Juggl eller 3D Graph — presentasjonsgraf.
- Minimal Theme Settings — roligere canvas-visning.

## Dataview-spørringer

### Innsikter i utkast

```dataview
TABLE status, siterbarhet, kilde
FROM "10 Innsiktskart/Innsikter"
WHERE status = "utkast"
SORT file.name ASC
```

### Gaps uten mission

```dataview
TABLE mission, kilde
FROM "10 Innsiktskart/Gaps"
WHERE !mission
SORT file.name ASC
```

### Interne kilder

```dataview
TABLE kilde, siterbarhet
FROM "12 Kilder"
WHERE type = "kilde"
SORT file.name ASC
```

## Temacanvas

- [[Sirkularitet.canvas|Sirkularitet]]
- [[Norden.canvas|Norden]]
## Notater

_Utvikles gjennom prosjektet._
