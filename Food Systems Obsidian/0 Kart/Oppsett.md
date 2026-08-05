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

- [[Matsystemets kunnskapsatlas.canvas|Matsystemets kunnskapsatlas]]
- [[Sirkularitet.canvas|Sirkularitet]]
- [[Norden.canvas|Norden]]

## Presentasjonsvisninger

- Beviskjeden — åpne [[Oversiktskart.canvas|Oversiktskart]], gå videre til [[Innsiktskartet]] og filtrer på `10 Innsiktskart/Innsikter`. Bruk Juggl/3D Graph kun etter at default-grafen er satt til kjernefilteret.
- Styrenettverket (kjerne) — start fra [[Maktkartet]] og [[Personregister]], vis kun personnoter utenfor `Personer/Register/` og selskaper utenfor `Selskaper/Register/`. Dette er kjernevisningen for AP-1-broer; person- og aktørformuleringer er fortsatt interne.
- Sirkularitetsloopene per R-nivå — bruk [[Sirkularitet.canvas|Sirkularitet]] som første visning, og gå derfra til [[Loop-register]] for detaljer. Hold gaps og missions synlige som egne arbeidsnoder, ikke som ferdige funn.

## Eksport til leveranser

- Hvitbok-figur: eksporter valgt canvas-utsnitt som PNG fra Obsidian, legg figuren i relevant hvitbok-arbeidsmappe, og bevar kildehenvisningen til vault-noten som forklarer utsnittet.
- Miro: bruk `docs/miro-kart-kunnskapsgrunnlag-blueprint.md` som mottaker-spec. Ikke oppdater Miro manuelt med nye tall uten å sjekke at samme tall finnes i vault- eller app-kilden.
- App/graf: hvis et utsnitt skal inn i `/graf`, bruk repo-data eller delt JSON som kilde. Skjermbilde er bare presentasjon, ikke nytt datagrunnlag.
- QA-gate: skjermbildegjennomgang med Gabriel og eventuelt Cathrine må godkjenne at visningen tåler møtebruk før M3 regnes som lukket.

## Visnings-QA

- Åpne `0 Kart/Matsystemets kunnskapsatlas.canvas`, `0 Kart/Oversiktskart.canvas`, `0 Kart/Kunnskapskart.canvas`, `0 Kart/Verdikjedekart.canvas`, `0 Kart/Maktkart.canvas`, `0 Kart/Temakart/Sirkularitet.canvas` og `0 Kart/Temakart/Norden.canvas` i Obsidian før møtebruk.
- Sjekk projektorlesbarhet: tekststørrelse, overlapp, kantkryss og om første blikk forklarer kartets historie uten muntlig omvei.
- Stresstest konsernvisningen med `0 Kart/Konsern/NorgesGruppen ASA.canvas`.
- Noter godkjent, justert eller parkert visning i VK-5-protokollen; Codex kan ikke lukke M3 uten denne skjermbildegjennomgangen.

## Lokal Obsidian-konfig

- Delte, repo-trackede presentasjonsfiler: `.obsidian/graph.json` og `.obsidian/snippets/kunnskapskart.css`.
- Lokal bruker-/sesjonsstate holdes utracket: `workspace*.json`, `app.json`, `appearance.json`, `community-plugins.json`, `core-plugins.json`, `types.json` og `.obsidian/plugins/`.
- Installer Dataview, Breadcrumbs, Minimal Theme Settings og Juggl eller 3D Graph lokalt; plugin-bundles skal ikke committes.
- Beslutningen ligger i `docs/project/reference/obsidian-local-config-policy-2026-07-04.md`.
## Notater

_Utvikles gjennom prosjektet._
