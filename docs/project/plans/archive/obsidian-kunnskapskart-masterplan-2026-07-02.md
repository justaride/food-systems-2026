---
tittel: Masterplan — Det fullstendige kunnskapskartet (Obsidian-vault)
status: Handover-klar for Codex
eier: Gabriel
dato: 2026-07-02
arbeidsflate: Food Systems Obsidian/ (vault i repo-roten)
bruksregel: Internt arbeidskart. Alle tall/claims i vaulten er gjengitt fra research-syntesen; ekstern bruk krever claim-lock/siterbarhets-gate (.claude/source-attribution-policy.md).
relaterte_filer:
  - scripts/obsidian-vault/build_vault.py
  - scripts/obsidian-vault/build_innsiktskart.py
  - scripts/obsidian-vault/build_maktkart.py
  - docs/miro-kart-kunnskapsgrunnlag-blueprint.md
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
---

> Arkivert av V3/M4 2026-07-02. Aktiv styring ligger i `docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md`; kanonisk VK-5-kravliste ligger i `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`.

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

- [ ] Diff-gjennomgang av vault-endringer (git) — stikkprøver mot kilde-JSON
- [ ] Graf-visning: leselighet ved 500+ noder (juster colorGroups/filtre; vurder `-path`-filtre for looper/gaps i standardvisning)
- [ ] Canvas-kvalitet: overlapp, kant-kryssing, konsern-canvasene
- [ ] Innsiktskjeden I27+: godkjenn/rediger claims (menneskelig godkjenning er porten)
- [ ] Siterbarhetsmerking: stikkprøve mot `audit:citable`
- [ ] Beslutning: hvilke visninger løftes inn i appen/whitepaper-figurer
- [ ] Neste datainnsamlingsrunde prioriteres fra det kartet da viser

## 4. Rekkefølge og avhengigheter

VK-0 → VK-1 → (VK-2 ∥ VK-3) → VK-4 → VK-5. VK-1 krever DB-tilgang (kjøres lokalt med tunnel, jf. `docs/SETUP-CF-TUNNEL-FOR-DB.md`); alt annet er repo-lokalt. Bygget skal aldri avhenge av vaulten.

## 5. Vernede invarianter (gjelder alle faser)

1. Menneskelig innhold under `## Notater` overlever alltid sync.
2. Vault-endringer rører aldri app-kode, DB eller committede dataartefakter (enveis: repo → vault; unntak: `data/vault-export/` som er sync-input).
3. Alle datagenererte noter bærer kilde-referanse og siterbarhets-markering.
4. `vault:check` grønn før hver fase merges.
5. Personnoter beholder AP-1-bruksregelen ordrett.
