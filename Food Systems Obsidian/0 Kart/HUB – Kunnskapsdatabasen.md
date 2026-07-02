---
tags: ""
type: hub
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# HUB – Kunnskapsdatabasen

Totaloversikt over kunnskapsbasen i **Food Systems 2026** — Nordic Circular Food Systems (WP3, Nordic Circular Hotspot, kontrakt 201-2503-P25013). Kartet speiler navigasjonen i appen, slik at kart og plattform alltid stemmer overens. Visuelt kart: [[Kunnskapskart.canvas|Kunnskapskart]].

## Nøkkeltall

- **8** tematiske klynger · **35** seksjoner
- **13** konsern med full eierskaps-/styredekning
- **3 849** butikker · **1 782** havbrukslokaliteter · **357** kommuner
- Markedskonsentrasjon dagligvare: NorgesGruppen **48,4 %** · Coop **27,1 %** · Reitan **18,0 %** · Bunnpris **6,6 %** (HHI 3 445)
- **~1 229** forskningsdokumenter · **23** strukturerte datasett

## Klynger

### [[Klynge – Oversikt og navigasjon]] — Inngang

[[Oversikt]] · [[Brukerveiledning]] · [[Søk]]

### [[Klynge – Intern]] — Prosjektstyring

[[Team]] · [[Casestatus]] · [[Møter]] · [[Kommunikasjon]] · [[Mandat]] · [[Metodikk]] · [[Tidslinje]]

### [[Klynge – Selskap og eierskap]] — Makt og struktur

[[Selskaper]] · [[Eierskap]] · [[Styremedlemmer]] · [[Personer]] · [[Eiendommer]]

### [[Klynge – Matsystem]] — Verdikjede

[[Verdikjede]] · [[Forsyningskjede]] · [[Havbruk]] · [[Sirkularitet]] · [[Økonomi]]

### [[Klynge – Produsenter og støtte]] — Primærledd

[[Produsentregister]] · [[Subsidier]]

### [[Klynge – Nordisk]] — Komparativt

[[Sammenligning]] · [[Politikk]] · [[Kart]] · [[Media]]

### [[Klynge – Kunnskap]] — Analyse og innsikt

[[Innsikt]] · [[Forskningsrunder]] · [[Akademia]] · [[Graf]] · [[Aktører]]

### [[Klynge – Bibliotek]] — Kilder og leveranse

[[Rapporter]] · [[Hvitbok]] · [[Bibliotek]] · [[Kilder]]

## Datafundament — lagene som mater kunnskapen

- [[Prisma-database]] — Kjernedatabasen (Postgres via Prisma): selskaper, eierskap, styreverv, relasjoner, eiendommer.
- [[Strukturerte datasett]] — 23+ strukturerte datasett i `public/data/food-systems/` som mater kart og analyser.
- [[Forskningsarkiv]] — `research/` — ~1 229 markdown-dokumenter og ~234 CSV-er (2 459 filer totalt): analyser, PDF-gjennomganger, kildehåndtering og validering.

## Repo-lag

- [[Applikasjon og kode]] — Next.js-appen som presenterer kunnskapsbasen — navigasjonen i appen speiler klyngene i dette kartet.
- [[Dokumentasjon og styring]] — Styringsdokumenter, driftsrutiner og retningslinjer for arbeidet.
- [[Leveranser og rapporter]] — Genererte leveranser og statusrapporter ut av prosjektet.

## Innsiktskartet — hva vi vet

Søsterkartet [[Innsiktskartet]] viser *innsikten*, ikke arkivet: verdikjeden som ryggrad, aktørene plassert på leddene sine, bevis-kjeden med 26 innsikter, sirkulære looper og gaps. Visuelt: [[Verdikjedekart.canvas|Verdikjedekart]].

## Maktkartet — hvem som sitter i posisjonene

[[Maktkartet]] viser eierfamilier → konserntrær → styrenettverket (AP-1: 32 interlockere, 11 sektorbroer). Visuelt: [[Maktkart.canvas|Maktkart]].

## Slik brukes kartet

- **Graf-visning**: åpne Obsidian-grafen — klyngene er fargekodet per mappe.
- **Canvas**: [[Kunnskapskart.canvas|Kunnskapskart]] gir blueprint-layouten (hub → 8 klynger → datafundament).
- **Utvikling**: hver seksjonsnote har en «Notater»-seksjon — bygg ut med funn, lenker og delkart etter hvert som prosjektet skrider frem.
- Kilde-blueprint: `docs/miro-kart-kunnskapsgrunnlag-blueprint.md`.
- Videre utbygging: `docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md` (Codex-handover, VK-0–VK-5).

## Dynamiske oversikter

### Klynger

```dataview
TABLE rolle, farge, status
FROM ""
WHERE type = "klynge"
SORT file.name ASC
```

### Utkast og interne gates

```dataview
TABLE type, status, siterbarhet, kilde
FROM ""
WHERE status = "utkast" OR siterbarhet = "intern"
SORT file.folder ASC, file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
