# Miro-kart: Struktur i kunnskapsgrunnlaget — Blueprint

Board-spesifikasjon for et Miro-kart som gir oversikt over **hele kunnskapsgrunnlaget** i Food Systems 2026. Bygges direkte i Miro så snart Miro-connectoren er autorisert. Kilde: `src/lib/data/nav.ts` + `messages/no.json` (autoritative seksjonsnavn/beskrivelser) og datasett i `public/data/food-systems/` + `data/konsern-coverage.json`.

## Konsept

Hub-and-spoke «sitemap»: én sentral hub → 8 tematiske klynger (hver blir en **Miro frame**) → seksjonskort inne i hver frame. Under klyngene ligger et **datafundament-band** med de tre lagene som mater kunnskapen (database, datasett, forskningsarkiv). Klyngene og seksjonene speiler nøyaktig navigasjonen i appen, slik at kartet og plattformen alltid stemmer overens.

## Layout (Miro-koordinater, board ~2600×1700)

```
                 [ HUB: Food Systems 2026 – Kunnskapsgrunnlag ]
 ┌──────────┬──────────┬──────────┬──────────┐
 │ Oversikt │ Intern   │ Selskap  │ Matsystem│   ← frame-rad 1
 ├──────────┼──────────┼──────────┼──────────┤
 │Produsent.│ Nordisk  │ Kunnskap │ Bibliotek│   ← frame-rad 2
 └──────────┴──────────┴──────────┴──────────┘
       [ DATAFUNDAMENT: Database · Datasett · Forskningsarkiv ]  ← band nederst
```

4 kolonner × 2 rader med frames, hub over, fundament-band under. Piler fra hub til hver frame; piler fra fundament-bandet opp til klyngene det mater.

## Fargekoding (én farge per klynge, brukes på frame-header + seksjonskort-kant)

| Klynge | Farge (hex) | Rolle |
|---|---|---|
| Oversikt & navigasjon | `#0F766E` (teal) | Inngang |
| Intern | `#64748B` (skifer) | Prosjektstyring |
| Selskap & eierskap | `#1D4ED8` (blå) | Makt/struktur |
| Matsystem | `#15803D` (grønn) | Verdikjede |
| Produsenter & støtte | `#B45309` (rav) | Primærledd |
| Nordisk | `#7C3AED` (lilla) | Komparativt |
| Kunnskap | `#DB2777` (rosa) | Analyse/innsikt |
| Bibliotek | `#334155` (mørk skifer) | Kilder/leveranse |
| Datafundament | `#0891B2` (cyan) | Rådatalag |

## Node-innhold per frame

Hver seksjon = ett kort: **fet tittel** + kort beskrivelse (fra `messages/no.json`). URL-en er ruten i appen (kan legges som lenke på kortet).

### Frame 1 — Oversikt & navigasjon (`teal`)
- **Oversikt** `/` — Fase, fremdrift, neste steg
- **Brukerveiledning** `/veiledning` — Slik bruker du plattformen — start her
- **Søk** `/sok` — Søk på tvers av alt

### Frame 2 — Intern (`skifer`)
- **Team** `/team` — Medlemmer og roller
- **Casestatus** `/casestatus` — Modenhet per caseanker
- **Møter** `/moter` — Møtesammendrag og referater
- **Kommunikasjon** `/kommunikasjon` — E-post og korrespondanse
- **Mandat** `/mandat` — Food TG scope, claims og validering
- **Metodikk** `/metodikk` — Ten Step, KPIs og deep research-prompter
- **Tidslinje** `/tidslinje` — Faser og søknader

### Frame 3 — Selskap & eierskap (`blå`)
- **Selskaper** `/selskap` — Selskapsdata og regnskap
- **Eierskap** `/eierskap` — Konserndossier og datakvalitet
- **Styremedlemmer** `/styremedlemmer` — Krysstyrer og nettverk
- **Personer** `/personer` — Nøkkelpersoner og roller
- **Eiendommer** `/eiendommer` — Selskapseiendommer og lokaler

### Frame 4 — Matsystem (`grønn`)
- **Verdikjede** `/verdikjede` — Nordisk verdikjedeanalyse (jord til bord)
- **Forsyningskjede** `/forsyningskjede` — Leverandørrelasjoner, primærleveranser og selvhandel
- **Havbruk** `/havbruk` — Lokaliteter og søknader (Fiskeridir)
- **Sirkularitet** `/sirkularitet` — R-stige, 10 spørsmål, looper og caser
- **Økonomi** `/okonomi` — Finansielle trender og sammenligning

### Frame 5 — Produsenter & støtte (`rav`)
- **Produsentregister** `/produsenter` — Jordbruksforetak fra register (rådata)
- **Subsidier** `/subsidier` — Tilskudd per kommune, ordning og mottaker

### Frame 6 — Nordisk (`lilla`)
- **Sammenligning** `/sammenligning` — Nordisk sammenligning
- **Politikk** `/politikk` — Nordisk matpolitikk-sammenligning
- **Kart** `/kart` — Butikker og kommunegrenser
- **Media** `/media` — Medieomtale og narrativer

### Frame 7 — Kunnskap (`rosa`)
- **Innsikt** `/innsikt` — Forskning, kartlegging, analyse
- **Forskningsrunder** `/forskningsrunder` — Food Research Process 20. april 2026
- **Akademia** `/masteroppgaver` — Master- og PhD-avhandlinger
- **Graf** `/graf` — Kunnskapsgraf og koblinger
- **Aktører** `/aktorer` — Prioritering, asks og relasjoner

### Frame 8 — Bibliotek (`mørk skifer`)
- **Rapporter** `/rapporter` — Offentlige og bransjeanalyser
- **Hvitbok** `/hvitbok` — Leveransedokument i kapitler
- **Bibliotek** `/bibliotek` — Fulltekst forskningsdokumenter
- **Kilder** `/kilder` — Dokumenter og referanser

## Datafundament-band (`cyan`) — de tre lagene som mater kunnskapen

- **Prisma-database** — Selskaper, eierskap, styreverv, relasjoner, eiendommer. **13 kartlagte konsern**: NorgesGruppen, Austevoll, Lerøy, Reitan Retail, Coop, ASKO, SalMar, Nortura, Orkla, Felleskjøpet, BAMA, TINE, Mowi. Kvalitet spores i `data/konsern-coverage.json` og `public/data/coverage/profiles.json`.
- **Strukturerte datasett (23 filer i `public/data/food-systems/`)** — SSB (landbruk, handel, selvforsyning), årsrapporter/Konkurransetilsynet (finans), Fiskeridir (1 782 havbrukslokaliteter), OSM/Overpass (3 849 butikker), Geonorge (357 kommuner), Eurostat (økologisk, nordisk kjerneserie), material-/næringsstrømmer, R9-sirkularitetsmatrise, politikk-tidslinje.
- **Forskningsarkiv (`research/`)** — ~1 229 markdown-dokumenter og ~234 CSV-er: analyser, PDF-gjennomganger, kildehåndtering/validering (claim-lock, siterbarhets-gate), URL-helse, evidence-packs.

## Nøkkeltall å vise på kartet (badges)

- 8 tematiske klynger · 35 seksjoner
- 13 konsern med full eierskaps-/styredekning
- 3 849 butikker · 1 782 havbrukslokaliteter · 357 kommuner
- Markedskonsentrasjon dagligvare: NorgesGruppen 48,4 % · Coop 27,1 % · Reitan 18,0 % · Bunnpris 6,6 % (HHI 3 445)
- ~1 229 forskningsdokumenter · 23 strukturerte datasett

## Byggeprosedyre i Miro (når connector er autorisert)

1. Opprett board «Food Systems 2026 — Kunnskapsgrunnlag».
2. Legg hub-node øverst (sentrert).
3. Opprett 8 frames i 4×2-rutenett med klyngefargene over; sett frame-tittel = klyngenavn.
4. Fyll hver frame med seksjonskort (sticky/shape) etter listene over; legg app-ruten som lenke.
5. Legg fundament-bandet (3 store kort) nederst.
6. Koble hub → hver frame, og fundament → relevante klynger.
7. Legg nøkkeltall-badges i hub eller egen legende.
