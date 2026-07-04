# Vault Masterplan Map

Export date: 2026-07-04
Packet type: map/index
Status label: internal context
Allowed use: Use for navigation, retrieval and orientation; do not cite as standalone external evidence.

## What This Source Is For

Navigation and index packet for vault masterplan map.

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

- docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md
- docs/miro-kart-kunnskapsgrunnlag-blueprint.md

## Source Excerpts

### docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md

````markdown
# Masterplan: Det fullstendige kunnskapskartet

> Arkivstatus: V2-planen er historisk baseline for PR #228. Arkivkopi ligger i `docs/project/plans/archive/obsidian-kunnskapskart-masterplan-2026-07-02.md`, og aktiv videreføring ligger i `docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md`.

## 0. Goal-prompt (lim inn i Codex)

> Bygg ut Obsidian-vaulten `Food Systems Obsidian/` til det fullstendige kunnskapskartet for Food Systems 2026, etter `docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md`. Arbeid fasevis (VK-0 → VK-5), én PR/commit-serie per fase, med akseptansekriteriene i planen som definition-of-done. Startpunktet er de tre generatorene i `scripts/obsidian-vault/` og en vault med 213 verifiserte noter i tre lag. Regler: (1) aldri overskriv menneskeskrevet innhold under `## Notater`-seksjoner — sync skal være idempotent med merge; (2) DB-avhengige steg skal produsere committede JSON-eksporter (bygget er DB-fritt); (3) følg CLAUDE.md-disiplinen: små sporbare endringer, verifikasjon før fullført; (4) vaulten er internt arbeidskart — behold bruksregel-/siterbarhetsmarkeringene på alle genererte noter.

## 1. Nåsituasjon (per 2026-07-02)

Vaulten har **213 noter, 0 brutte lenker**, i tre lag + tre canvas:

| Lag | Innhold | Kilde |
|---|---|---|
| `0 Kart` + `1–9` | Arkivkartet: hub, 8 klynger, 35 seksjoner (speiler `src/lib/data/nav.ts`), datafundament- og repo-lag | Miro-blueprintet |
| `10 Innsiktskart` | Verdikjede-ryggrad (8 ledd), 24 aktørnoter, **bevis-kjeden I01–I26** (fra `research/rammeverk/narrativ-struktur.md`), 25 looper, 12 NO-gaps, 4 Norden-noder | narrativ-struktur, circularity-loops.json, konsern-coverage.json |
| `11 Maktkart` | 20 interlocker-personer, 38 selskapsnoter, Eierskapsregisteret (9 kanter m/ M&A), AP-1-funn | ap1-styreoverlapp-active-only.json, import-company-ownership.ts |
| `0 Kart/*.canvas` | Kunnskapskart, Verdikjedekart, Maktkart | generert |
| `.obsidian/graph.json` | colorGroups per type/tag (grønn=ledd, rosa=innsikt, blå=aktør, cyan=loop, oransje=gap, lilla=norden, gul=person) | generert |

Generatorene (`scripts/obsidian-vault/*.py`) er engangs-skript: de skriver noter uforbeholdent og har ingen merge-logikk. Det er første tekniske gjeld å løse.

## 2. Målbilde: «det fullstendige kartet»

Ett sammenhengende Obsidian-nettverk der:

1. **Alt i kunnskapsbasen har en node** — hvert selskap i DB-universet (275), hver kilde av betydning, hvert møte, hver innsikt, hver loop — med konsistent frontmatter (`type`, `status`, `kilde`, `siterbarhet`).
2. **Grafen er analysen** — typede farger, lenkevekt = relevans, hull synlige som løse noder.
3. **Synkronisering er en repo-kommando** — `npm run vault:sync` regenererer datalagene fra committede artefakter uten å røre menneskelig innhold; `npm run vault:check` verifiserer integritet.
4. **Grafisk gjennomført** — CSS-snippets, plugin-oppsett og genererte canvas per konsern/tema, så kartet tåler å vises frem.

## 3. Arbeidspakker

### VK-0 — Sync-infrastruktur (teknisk fundament, gjør først)

- Konsolider de tre Python-generatorene til én TS-modul `scripts/obsidian-vault/sync.ts` (repo-konvensjon er TS; behold py-filene som referanse til paritet er verifisert).
- **Merge-strategi:** hver generert note deles av markøren `## Notater`. Alt over regenereres; alt under bevares byte-for-byte. Nye noter får `_Utvikles gjennom prosjektet._` som placeholder.
- Frontmatter-standard (alle noter): `type` (seksjon|klynge|ledd|aktor|innsikt|loop|gap|norden|person|kilde|mote|datafundament), `status` (generert|kuratert|utkast), `kilde` (filsti eller dokument-ID), `siterbarhet` (intern|gate-klar|sitert).
- npm-scripts: `vault:sync` (regenerer), `vault:check` (brutte wikilenker, canvas-JSON-validitet, frontmatter-skjema, foreldreløse noter). `vault:check` skal exite ≠0 ved feil.
- Tester: unit-test på merge-logikken (bevarer Notater-innhold, håndterer æøå og `/` i navn — jf. `Dagrofa A-S`-aliaset).

**Akseptanse:** `npm run vault:sync && npm run vault:check` er grønn og en diff-kjøring mot dagens vault viser kun forventede endringer (frontmatter-normalisering).

### VK-1 — Komplett selskaps- og eierskapslag (krever DB)

- Eksportskript (mønster: `compute-metrics:full`) som dumper committede JSON-er til `data/vault-export/`: selskaper (275, med `valueChainStage`, orgnr, klassifisering), alle eierskapskanter, alle BoardMember-rader (555 verv/487 personer), BusinessRelationships, eiendommer.
- Generer: selskapsnote per DB-selskap (kort, datagenerert), fulle konserntre-lister på konsernrot-notene (NG-treet er 49 selskaper — vis som innrykket liste, ikke 49 kanter på canvas), personregister-note + individuelle noter kun for interlockere (≥2 verv) for å unngå 487 støy-noder.
- Generert **canvas per konsern** (`0 Kart/Konsern/<slug>.canvas`): eiertre med prosenter på kantene.
- Forsyningskjede-kanter (supplier/buyer/distributor/self-dealing) inn på selskapsnotene som typede lenker.

**Akseptanse:** antall noter/kanter stemmer med eksport-JSON (skriv tallene i sync-loggen); `vault:check` grønn; stikkprøve mot `npm run db:audit`-tall.

### VK-2 — Innsikts- og kildelag komplett

- Utvid bevis-kjeden: høst innsikter fra `research/bibliotek/forskningsrunde-2026-04-20*/`, `content/hvitbok/*`, `docs/project/analysis/*` → nye I27+-noter etter samme mal (claim, tall, kilde, forrige/neste, «handler om»-lenker). Kuratert arbeid — Codex foreslår, menneske godkjenner listen før generering.
- Kildenoter for nøkkeldokumenter fra `research/PDF-KATALOG.md` + `research/bibliotek/KILDEREGISTER.md` (kun dokumenter som faktisk siteres av innsikter — ikke alle 2 459 filer).
- Møte-/transkriptnoter fra `docs/meetings/` og `research/landbrukarena_transcripts/` (metadata + sammendragslenke, ikke fulltekst).
- `siterbarhet`-feltet settes fra `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`-logikken der det er avgjørbart.

**Akseptanse:** hver innsiktsnote har minst én kildenote-lenke; ingen innsikt uten `siterbarhet`-felt.

### VK-3 — Grafisk løft

- **CSS-snippet** (`.obsidian/snippets/kunnskapskart.css`): fargede tag-pills per type, badges for R-nivå/kvalitetsscore/verv (via `cssclasses`), strammere canvas-kort-typografi.
- **Plugin-oppsett** (dokumenter i `0 Kart/Oppsett.md`, ikke auto-installer): **Dataview** (dynamiske MOC-tabeller: «alle innsikter med status utkast», «gaps uten mission»), **Breadcrumbs** (hierarki familie→konsern→datter), **Juggl** eller **3D Graph** for presentasjonsvisning, **Minimal Theme Settings** for canvas-estetikk.
- Erstatt statiske lister i hub-/klyngenoter med Dataview-spørringer der det gir selvvedlikeholdende oversikter.
- Generert **temacanvas**: «Sirkularitet» (looper per R-nivå × ledd) og «Norden» (land × konsentrasjon × looper).
- Vurder (lav prioritet): eksport av vault-grafen til appens `/graf`-side (delt JSON-format), så plattform og vault viser samme nettverk.

**Akseptanse:** skjermbilde-gjennomgang med Gabriel/Cathrine; Dataview-spørringer returnerer uten feil; CSS validerer i Obsidian 1.5+.

### VK-4 — Datainnsamling (mates av kartet, utføres som research-missions)

Prioritert fra gaps-feltene i `data/konsern-coverage.json` og AP-1:

1. Styredata-dekning 98/275 → utvid via `scripts/extend-board-coverage-brreg.ts` (eksisterer) — mål: alle selskaper i de 13 konserntrærne.
2. Brreg-refresh (flere konsern «aldri refreshet»).
3. M&A-events: NG-treet forventer aktivitet, 0 registrert.
4. Stakeholder-laget (I26-gapet): skjelettnoter med `ask`-, `prioritet`- og `relasjon`-felt for menneskelig utfylling — kobles til aktørnotene.
5. Norske sirkularitets-gaps (12 noter) → koble hver til en research-mission i `research/RESEARCH-MISSIONS.md`.

**Akseptanse:** hver gap-node i vaulten har enten data eller en lenket mission; konsern-coverage `qualityScore` uendret eller bedre etter re-import + `npm run db:audit` grønn.

### VK-5 — Gjennomgang (menneske + Claude, etter Codex-leveransen)

Sjekkliste for review-økten:

- [ ] Diff-gjennomgang av vault-endringer (git)

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### docs/miro-kart-kunnskapsgrunnlag-blueprint.md

````markdown
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
````

