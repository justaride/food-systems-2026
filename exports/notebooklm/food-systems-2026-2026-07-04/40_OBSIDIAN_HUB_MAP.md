# Obsidian Hub Map

Export date: 2026-07-04
Packet type: map/index
Status label: internal context
Allowed use: Use for navigation, retrieval and orientation; do not cite as standalone external evidence.

## What This Source Is For

Navigation and index packet for obsidian hub map.

## Core Claims Or Working Propositions

- This packet helps NotebookLM find the right part of the knowledge base.
- Map notes point to evidence and status surfaces; they do not replace them.
- Use this packet to ask better follow-up questions across sources.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Vault/index notes | Improve retrieval and cross-source navigation. | Not a claim gate. |
| Source paths | Preserve repo provenance. | Verify current file before operational use. |
| Labels | Keep internal/citable distinction visible. | Do not upgrade map text to external evidence. |

## Known Caveats

- Some map notes are generated scaffolding.
- Canvas files are not included as NotebookLM Markdown sources.

## Deck Angles

- Use as an appendix map.
- Use to select the right evidence packet before drafting claims.

## Bad Generic Framing To Avoid

- Do not treat a map node as proof.
- Do not cite Obsidian scaffolding instead of the underlying source.

## Source Paths Included

- Food Systems Obsidian/0 Kart/HUB – Kunnskapsdatabasen.md
- Food Systems Obsidian/Welcome.md

## Source Excerpts

### Food Systems Obsidian/0 Kart/HUB – Kunnskapsdatabasen.md

````markdown
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
````

### Food Systems Obsidian/Welcome.md

````markdown
# Food Systems 2026 — Kunnskapskart

Dette er det interne arbeidskartet for Food Systems 2026. Start med [[Oversiktskart.canvas|Oversiktskartet]] for helikopterbildet, eller gå direkte til startstien under:

## Start her

Les kartet fra handling til detalj. Bruk grafen som navigasjon, ikke som bevis alene.

- **Orienter deg:** [[Oversiktskart.canvas|Oversiktskart]] gir helikopterbildet før du åpner enkeltmapper.
- **Finn arkivet:** [[HUB – Kunnskapsdatabasen]] peker til klynger, datafundament og prosjektstruktur.
- **Les analysen:** [[Innsiktskartet]] viser innsikter, sirkularitetslooper og claims som fortsatt er interne.
- **Velg neste arbeid:** [[Gap-register]] samler hull og research-missions som må lukkes.
- **Sjekk struktur:** [[Maktkartet]] viser selskaper, eierskap og styreoverlapp som strukturelle posisjoner.

## Visuelle flater

- [[Oversiktskart.canvas|Oversiktskart]] — lesbart helikopterbilde av arkiv-, innsikts- og maktlaget.
- [[Kunnskapskart.canvas|Kunnskapskart]] — hele kartet i ett overblikk.
- [[Verdikjedekart.canvas|Verdikjedekart]] — verdikjede, innsikter, looper og gaps.
- [[Maktkart.canvas|Maktkart]] — eierskap, konsern og styrenettverk.
- [[Oppsett]] — plugin-/snippet-oppsett og M0-sjekkliste før V3-fasene vurderes.

## Bruksregel

Kartet er et internt cockpit-lag. En node i kartet betyr ikke at claimet er eksternt publiserbart; tall, aktørpåstander og årsaksspråk må gjennom claim-lock og siterbarhetsgate før ekstern bruk.

## Slik leses noder

- En node betyr arbeidsobjekt, kilde, kobling eller intern hypotese; den betyr ikke automatisk ferdig ekstern claim.
- Farger og mapper viser type og arbeidslag: arkiv, innsikt, gap, aktør, kilde eller maktstruktur.
- Tall, aktørpåstander og årsaksspråk må fortsatt gjennom claim-lock og siterbarhetsgate før ekstern bruk.
## Notater

_Utvikles gjennom prosjektet._
````

