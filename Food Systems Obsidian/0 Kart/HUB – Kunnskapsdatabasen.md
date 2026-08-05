---
type: hub
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# HUB – Kunnskapsdatabasen

HUB-en er arkiv- og navigasjonslaget i arbeidskartet. Bruk den når du trenger å finne riktig del av kunnskapsbasen, ikke når du skal lese en ferdig fortelling. For analysearbeid starter du ofte raskere i [[Innsiktskartet]] eller [[Maktkartet]].

Faglig atlas: [[Matsystemets kunnskapsatlas.canvas|Matsystemets kunnskapsatlas]] · Felt: [[Feltkart – kunnskapsbasen]] · Arkiv: [[Kunnskapskart.canvas|Kunnskapskart]] · Innsikt: [[Innsiktskartet]] · Makt: [[Maktkartet]] · Evidens: [[Kildekartet]]

## Nøkkeltall

- **8** tematiske klynger · **35** seksjoner
- **13** konsern med full eierskaps-/styredekning
- **3 849** butikker · **1 782** havbrukslokaliteter · **357** kommuner
- Dagligvarekonsentrasjon: kontrollert omsetnings-HHI **3 327** og CR3 **96,6 %** (Konkurransetilsynet, 2024). Butikkandeler og omsetningsandeler er ulike serier og skal ikke blandes.
- **~1 229** forskningsdokumenter · **23** strukturerte datasett

## Når bruker du hva?

- **Faglig orientering:** start i [[Matsystemets kunnskapsatlas.canvas|Matsystemets kunnskapsatlas]] og velg felt i [[Feltkart – kunnskapsbasen]].
- **Arkivtopologi:** bruk denne HUB-en, [[Oversiktskart.canvas|Oversiktskart]] og [[Kunnskapskart.canvas|Kunnskapskart]] når du skal finne repo- og applikasjonslag.
- **Analyse:** bruk [[Innsiktskartet]], [[Innsiktsregister]], [[Maktkartet]] og [[Eierskapsregisteret]].
- **Evidens:** gå via [[Kildekartet]] og originalkilden; kart og registre er ikke bevis i seg selv.
- **Arbeidskø:** bruk [[Arbeidskø – ferdigstilling]], [[Gap-register]] og det kanoniske completion-registeret.
- **Ekstern bruk:** sjekk alltid siterbarhet, ferskhet og riktig claim-gate før formuleringer løftes ut.

## Fra spørsmål til kunnskap

1. Velg fagfelt i [[Feltkart – kunnskapsbasen]].
2. Les feltets syntese, avgrensninger og sterkeste artefakter.
3. Gå til [[Innsiktsregister]], [[Aktørregister]] eller det relevante temaregisteret.
4. Følg [[Kildekartet]] til original fil, datasett eller primærkilde.
5. Sjekk [[Kunnskapsstatus]] og riktig gate før materialet brukes videre.

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
- **Canvas:** bruk `Matsystemets kunnskapsatlas`, `Kunnskapskart`, `Verdikjedekart` og `Maktkart` som samtaleflater, ikke som publiserbart bevis.
- **Noder:** les hver node som arbeidsobjekt eller kobling til kilde, ikke som ferdig claim.
- **Notater:** menneskelig tekst skal legges under `## Notater`; `vault:sync` skal bevare den.
- **Kildekontroll:** kildelag og siterbarhet avgjør hva som kan brukes utenfor intern arbeidsflate.
- **Videre arbeid:** [[Arbeidskø – ferdigstilling]] og `docs/project/status/food-systems-completion-register-2026-07-15.md`.

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
