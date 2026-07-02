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

## M0 baselinegjennomgang

Dette er den menneskelige porten før M1-M4 vurderes for merge. Den skal ikke brukes som VK-5-closeout.

1. Åpne `Food Systems Obsidian/` som vault i Obsidian fra repo-roten på `main`.
2. Aktiver Dataview, Breadcrumbs, Minimal Theme Settings og Juggl eller 3D Graph.
3. Aktiver CSS-snippeten `kunnskapskart.css`.
4. Åpne [[Welcome]], [[Kunnskapskart.canvas|Kunnskapskart]], [[Innsiktskartet]] og [[Maktkartet]].
5. Bruk 20 minutter med VK-5-protokollens blikk: får du oversikt, eller drukner signalet?
6. Skriv førsteinntrykket under `## Notater` i [[Welcome]]. Behold status som menneskelig review, ikke repo-closeout.
7. Bekreft beslutningen utenfor vaulten før #229/M1 tas ut av draft.

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
