---
type: hub
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# HUB – Kunnskapsdatabasen

HUB-en er arkiv- og navigasjonslaget i arbeidskartet. Bruk den når du trenger å finne riktig del av kunnskapsbasen, ikke når du skal lese en ferdig fortelling. For analysearbeid starter du ofte raskere i [[Innsiktskartet]] eller [[Maktkartet]].

Visuelt kart: [[Oversiktskart.canvas|Oversiktskart]] · Arkiv: [[Kunnskapskart.canvas|Kunnskapskart]] · Innsikt: [[Innsiktskartet]] · Makt: [[Maktkartet]]

## Nøkkeltall

- **8** tematiske klynger · **35** seksjoner
- **13** konsern med full eierskaps-/styredekning
- **3 849** butikker · **1 782** havbrukslokaliteter · **357** kommuner
- Markedskonsentrasjon dagligvare: NorgesGruppen **48,4 %** · Coop **27,1 %** · Reitan **18,0 %** · Bunnpris **6,6 %** (HHI 3 445)
- **~1 229** forskningsdokumenter · **23** strukturerte datasett

## Når bruker du hva?

- **Orientering:** start i [[Oversiktskart.canvas|Oversiktskart]]; bruk denne HUB-en og [[Kunnskapskart.canvas|Kunnskapskart]] når du skal finne arkivlaget.
- **Analyse:** bruk [[Innsiktskartet]], [[Maktkartet]], [[Eierskapsregisteret]] og [[Gap-register]].
- **Arbeidskø:** bruk [[Gap-register]] og `docs/project/plans/obsidian-next-backlog-2026-07-04.md` for neste små PR-er.
- **Ekstern bruk:** gå alltid via [[Kilder]] og claim-lock før tall eller aktørclaims løftes ut.

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

[[Innsiktskartet]] viser *innsikten*, ikke arkivet: verdikjeden som ryggrad, bevis-kjeden I01-I26, selektiv V2-kuratering I27+, sirkulære looper og gaps. Visuelt: [[Verdikjedekart.canvas|Verdikjedekart]].

## Maktkartet — hvem som sitter i posisjonene

[[Maktkartet]] viser selskaper, eierskap, konserntrær og styrenettverk. Les det som strukturelle posisjoner og kontrollbaner, ikke som intensjon eller skyld. Visuelt: [[Maktkart.canvas|Maktkart]].

## Slik brukes kartet

- **Graph view:** bruk mapper og farger til å se mønster; grafen er et kuratert utsnitt, ikke fasit.
- **Canvas:** bruk `Kunnskapskart`, `Verdikjedekart` og `Maktkart` som samtaleflater, ikke som publiserbart bevis.
- **Noder:** les hver node som arbeidsobjekt eller kobling til kilde, ikke som ferdig claim.
- **Notater:** menneskelig tekst skal legges under `## Notater`; `vault:sync` skal bevare den.
- **Kildekontroll:** kildelag og siterbarhet avgjør hva som kan brukes utenfor intern arbeidsflate.
- **Videre utbygging:** `docs/project/plans/obsidian-next-backlog-2026-07-04.md`.

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
