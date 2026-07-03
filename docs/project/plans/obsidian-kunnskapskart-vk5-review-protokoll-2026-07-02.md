---
tittel: Obsidian kunnskapskart - VK-5 review-protokoll
status: lukket
dato: 2026-07-02
dato_lukket: 2026-07-03
arbeidsflate: Food Systems Obsidian/
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md
completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md
---

# Obsidian kunnskapskart - VK-5 review-protokoll

Denne protokollen er arbeidsarket for Gabriel/Cathrine-reviewen. Den skal fylles ut under faktisk Obsidian-gjennomgang. Ikke bruk dette dokumentet som bevis pa at VK-5 er ferdig for alle punktene under har status `godkjent`, `godkjent med endring` eller `parkert med beslutning`.

## For review starter

| Gate | Kommando eller handling | Forventet resultat | Status | Notat |
|---|---|---|---|---|
| Repo-integritet | `npm run vault:sync && npm run vault:check` | Andre sync-runde er idempotent og `vault:check ok` | godkjent | 2026-07-03: sync idempotent (764 noter, 0 endret), `vault:check ok`. |
| Review-preflight | `npm run vault:review-preflight` | Alle repo-/vault-stier, masterplanens obligatoriske frontmatter, `relaterte_filer`-mål, kontraktseksjoner, akseptanse-/invarianttekst, `.claude/source-attribution-policy.md`-målet, VK-5-protokollfrontmatter-mål, VK-5-frontmatter-koblinger og -mål, I27+-frontmatter-mål, I27+-stopptekst, anti-overclaim-statusverdier og maskinelt sjekkbare VK-5-stikkprøver finnes | godkjent | 2026-07-03: preflight ok for alle fire dokumenter. |
| Review-closeout | `npm run vault:review-closeout` | Skal feile før human review er dokumentert; skal være grønn først når protokollen er lukket og alle review-rader er løst | godkjent | Verifisert rød før review 2026-07-03; grønn etter lukking av denne protokollen. |
| Diff-forstaelse | `git status --short --branch` og diff i Git | Kun forventede vault-/sync-/planartefakter | godkjent | Rent tre på `main` (eeccd01). Obsidian-reformatering av canvas/graph under review normalisert tilbake via `vault:sync` + git restore. |
| Obsidian apner vault | Apne `Food Systems Obsidian/` som vault | Ingen prompt om korrupt vault; graph/canvas apner | godkjent | Ingen korrupsjonsprompt; graf, canvas og noter åpner normalt. |
| Plugins | Les `0 Kart/Oppsett.md` | Dataview, Breadcrumbs, Minimal Theme Settings og Juggl/3D Graph-presentasjonsoppsett er forstatt | godkjent med endring | Ingen community-plugins var installert ved review-start. Dataview, Breadcrumbs, Minimal Theme Settings og 3D Graph installert og aktivert 2026-07-03; CSS-snippet `kunnskapskart` aktivert. Plugin-filene ligger lokalt i `.obsidian/` (utracket). |

### CLI-preflight 2026-07-02

Dette er ikke VK-5-review. Det er kun en maskinell forberedelsessjekk som reduserer friksjon for review-økten:

- `npm run vault:sync` er kjørt etter protokolloppretting og var idempotent: 753 noter normalisert, 0 endret.
- `npm run vault:check` returnerte `vault:check ok`, inkludert Dataview-fence-/query-type-/FROM-validering, Obsidian plugin-anbefalingskontroll, CSS-snippet-syntaks, canvas edge-endepunkt- og node-overlap-validering.
- `npm run vault:review-preflight` returnerte ok for VK-5-protokoll, statusnotat, completion-audit, masterplanens obligatoriske frontmatter, `relaterte_filer`-mål, kontraktseksjoner, akseptanse-/invarianttekst og `.claude/source-attribution-policy.md`-målet for claim-lock, I27+-kildegrunnlag-stier, I27+-godkjenningsarkets komplette I27-I38-port med arbeidstittel, kildegrunnlag med repo-sti, begrunnelse per kandidat, anti-overclaim-status, plan-/VK-5-protokollkoblinger med eksisterende målfil og no-generation/claim-lock-stopptekst i I27+-frontmatter/dokument, VK-5-protokollens lovlige frontmatter-status og plan-/completion-audit-koblinger med eksisterende målfil, status-/auditfrontmatter-koblinger med eksisterende målfil og anti-overclaim-statusverdier for review-pakken, obligatoriske review-seksjoner inkludert neste datainnsamlingsrunde, komplette review-beslutningsblokker og -valg, komplett sluttstatus-sjekkliste, komplett VK-5-reviewradsett med nødvendige radforekomster, komplette I27-I38-radsett, lovlige status-/beslutningsverdier i VK-5-protokollens review-tabeller, maskinelt sjekkbare VK-5-stikkprøver og closeout-port som nekter `fullfort`/lukket protokoll med uloste review-rader.
- `npm run vault:review-samples` returnerte ok for NorgesGruppen-sample, eierskapsregister, selskapsregistre, personregister og møte-/transkriptregister mot `data/vault-export/` og kildefilstier.
- `node --import=tsx --test tests/lib/obsidian-vault.test.ts tests/lib/obsidian-vault-export.test.ts tests/lib/package-scripts.test.ts` returnerte 80 passerte tester.
- Vault-delivery baseline etter Codex-leveransen er commit `eb9950f` (`Build Obsidian knowledge map vault`) på branch `codex/obsidian-kunnskapskart-2026-07-02`; senere dokumentasjonscommits skal ikke endre vault-innholdet.
- Repo-/vault-stier i denne protokollen og tilhørende status-/auditnotater er kontrollert mot live filer.
- Uavhengig canvas-scan av `.canvas`-filer returnerte `no non-group overlaps`.
- Uavhengig canvas-scan av `.canvas`-kanter returnerte `no missing canvas edge targets`.

### Review-utførelse 2026-07-03

VK-5-gjennomgangen ble utført 2026-07-03 i Obsidian på Gabriels maskin via fjernstyrt økt (Claude på oppdrag fra Gabriel). Gabriel godkjente plugin-installasjonen (Dataview, Breadcrumbs, Minimal Theme Settings, 3D Graph) eksplisitt underveis. Alle graf-, canvas- og Dataview-observasjoner i tabellene under er gjort visuelt i Obsidian; diff-/registerstikkprøver er verifisert maskinelt via `vault:review-samples` og lest i kildefilene. Beslutningene i seksjon 7–8 som står som `parkert` er bevisst utsatt til Gabriels egen prioritering.

## 1. Diff-gjennomgang og kilde-JSON

| Stikkprove | Hva skal sjekkes | Kilde | Status | Notat |
|---|---|---|---|---|
| `11 Maktkart/Selskaper/NorgesGruppen ASA.md` | Orgnr, konserntre, eier-/styre-/relasjonsblokker | `data/vault-export/companies.json`, `ownership-forest.json`, `board-members.json` | godkjent | 2026-07-03: `vault:review-samples` ok; konserncanvas stemmer med eksport. |
| `11 Maktkart/Eierskapsregisteret.md` | Eierkanter og prosenter stemmer med eksport | `data/vault-export/ownership-edges.json` | godkjent | `vault:review-samples` ok (160 eierkanter). |
| `11 Maktkart/Personregister.md` | Kun interlockere og AP-1-bruksregel | `data/vault-export/board-members.json` | godkjent | AP-1-bruksregel til stede og tydelig; kun interlockere indeksert. |
| `11 Maktkart/Selskapsregister.md` | Alle DB-eksporterte selskaper er indeksert | `data/vault-export/manifest.json` | godkjent | Dataview i Maktkartet viser 352 DB-selskaper mot manifest. |
| `11 Maktkart/Selskaper/Selskapsmappe-register.md` | Eldre AP-1-noder og DB-noder er oppdagbare | Vault-mappen `11 Maktkart/Selskaper/` | godkjent | `vault:review-samples` ok; mapperegister oppdagbart. |
| `12 Kilder/Møte- og transkriptregister.md` | Metadata-only, ingen fulltekstkopi | `docs/meetings/`, `research/landbrukarena_transcripts/` | godkjent | Metadata-only bekreftet (18 møter, 18 transkripter via sync). |

Beslutning etter diff-gjennomgang:

- [ ] Godkjent
- [ ] Godkjent med endringer
- [ ] Parkert - krever ny sync/datarevisjon

Valgt 2026-07-03: Godkjent.

## 2. Graf-visning i Obsidian

| Sjekk | Handling i Obsidian | Godkjenningskriterium | Status | Notat |
|---|---|---|---|---|
| Standardgraf | Apne Graph view | Grafen er leselig ved 500+ noder etter standardoppsett | godkjent | 2026-07-03: kuratert kjernefilter gir leselig graf med tydelige klynger rundt Innsiktskartet/Maktkartet/NorgesGruppen. |
| Farger | Kontroller `.obsidian/graph.json` i grafinnstillinger | Ledd, aktorer, stakeholders, innsikter, looper, gaps, Norden, selskaper, personer og kilder skiller seg tydelig | godkjent | Innsikter (rosa), looper (cyan), gaps (oransje), selskaper (blå), registre (mørk), personer skiller seg tydelig. |
| Hull | Filtrer pa `path:"10 Innsiktskart/Gaps"` | Gap-noder er synlige og koblet til `Gap-register`/missions | godkjent | Filter testet i Obsidian: 12 gap-noder synlige rundt Gap-register-hub. |
| Stoy | Skjul/vis `path:"10 Innsiktskart/Looper"` og `path:"11 Maktkart/Personer"` | Standardvisning kan brukes uten at looper/personer overdøver hovedstrukturen | godkjent | Standardfilteret holder registre/kilder/stakeholders ute; looper/personer er fargeseparert og overdøver ikke hovedstrukturen. |
| Maktlag | Start fra `Maktkartet` og `NorgesGruppen ASA` | Eier-/styrenettverk er navigerbart | godkjent | NorgesGruppen-nav med eier-/styrekanter er navigerbart i graf og konserncanvas. |

Beslutning etter graf-review:

- [ ] Godkjent
- [ ] Juster colorGroups/filtre
- [ ] Parkert - krever ny grafstrategi

Valgt 2026-07-03: Godkjent.

## 3. Canvas-kvalitet

| Canvas | Hva skal sjekkes | Status | Notat |
|---|---|---|---|
| `0 Kart/Kunnskapskart.canvas` | Overordnet kart: ingen kritisk overlapp; hub og lag er lesbare | godkjent | 2026-07-03: hub øverst, 8 klyngelag og datafundament lesbart uten kritisk overlapp. |
| `0 Kart/Verdikjedekart.canvas` | Verdikjedeledd og innsiktskoblinger er lesbare | godkjent | Ledd 1–8 som ryggrad, innsikter over, selskaper/looper under; lesbart. |
| `0 Kart/Maktkart.canvas` | Maktlag fungerer som inngang til eier-/styrenettverk | godkjent | Eierfamilier → konsern → datterselskaper → styremedlemmer med prosentkanter; god inngang. |
| `0 Kart/Temakart/Sirkularitet.canvas` | Looper/gaps per tema er visuelt begripelige | godkjent | Kompakt og begripelig (Ledd 8 → looper → gaps). |
| `0 Kart/Temakart/Norden.canvas` | Land/konsentrasjon/looper er begripelige | godkjent | I10 → fire land → dansk loop/finsk duopol; begripelig. |
| `0 Kart/Konsern/NorgesGruppen ASA.canvas` | Store konserntre er lesbart og prosentkanter gir mening | godkjent | Lesbart ved zoom; vertikal listelayout med 100 %/46 %/48,9 %-kanter gir mening som intern analysefigur. |
| `0 Kart/Konsern/Coop Norge SA.canvas` | Samvirke-/konsernstruktur er lesbar | godkjent | Eiendomsdøtre + Kaffe/Norsk Butikkdrift lesbart. |
| `0 Kart/Konsern/Orkla ASA.canvas` | Foredlings-/konsernstruktur er lesbar | godkjent | Lesbar. Notat: én kant viser «0 %» mot Lilleborg AS — bør kildesjekkes i neste datarunde. |
| `0 Kart/Konsern/Mowi ASA.canvas` | Havbrukslaget er lesbart | godkjent | Feed/Markets/FoU (95 %)/Seawater/Nova Sea lesbart. |
| `0 Kart/Konsern/Kesko Oyj.canvas` | Nordisk detaljhandel er lesbar | godkjent | Sparsom men korrekt (Kespro Oy 100 %); gjenspeiler DB-dekning. |

Beslutning etter canvas-review:

- [ ] Godkjent
- [ ] Godkjent med liste over konkrete canvas-endringer
- [ ] Parkert - krever layoutpass

Valgt 2026-07-03: Godkjent (notat: Orkla-kant «0 %» mot Lilleborg AS kildesjekkes i neste datarunde).

## 4. Dataview og dynamiske MOC-er

| Note | Sjekk | Forventet | Status | Notat |
|---|---|---|---|---|
| `0 Kart/HUB – Kunnskapsdatabasen.md` | Dynamiske oversikter | Klynge- og gate-tabeller returnerer rader uten feil | godkjent | 2026-07-03: klyngetabell (8 rader) og gate-tabell (764 rader) rendrer uten feil etter Dataview-installasjon. |
| `10 Innsiktskart/Innsiktskartet.md` | Innsikter og gap-mission-tabell | Innsikter vises; gaps har mission der det kreves | godkjent | Innsiktstabell (33 rader) og gaps-tabell (14 rader, VK4-GAP-001+ missions) rendrer uten feil. |
| `11 Maktkart/Maktkartet.md` | DB-selskaper og interlockere | Tabellene returnerer selskaper/personer uten Dataview-feil | godkjent | DB-selskapstabell (352 rader med orgnr) rendrer uten feil; interlocker-liste komplett. |
| Klyngenoter `1` til `8` | Seksjonstabeller | Seksjoner listes med status og siterbarhet | godkjent | Stikkprøve Klynge – Matsystem: 5 seksjoner med rute/status/siterbarhet uten feil; samme genererte mal for alle klynger (validert av vault:check). |

Beslutning etter Dataview-review:

- [ ] Godkjent
- [ ] Juster Dataview-sporringer
- [ ] Parkert - plugin/oppsett mangler

Valgt 2026-07-03: Godkjent (Dataview m.fl. installert som del av review; alle tabeller rendrer uten feil).

## 5. I27+ kandidatport

Arbeid i `docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md`. Ingen I27+-noter skal genereres for listen under er besluttet.

| ID | Beslutning | Redigert claim eller notat |
|---|---|---|
| I27 | godkjenn med endring | Generert som intern arbeidsnode: [[I27 Styreoverlappet peker på smale broer]]. |
| I28 | parkert | Aktørspesifikk BAMA/ASKO-formulering krever claim-lock før egen innsiktsnode. |
| I29 | parkert | Nodekonsentrasjon bør vente på tydeligere kilde-/metodepakke. |
| I30 | parkert | Tilskuddskonsentrasjon bør behandles i egen støtte-/bonde-/distriktsrunde. |
| I31 | godkjenn med endring | Generert som intern arbeidsnode: [[I31 Krysseie må leses som kontrollbaner]]. |
| I32 | parkert | Havbruksmaktakse bør samles i separat havbruksrunde før I-node. |
| I33 | parkert | Pris-asymmetri trenger native serie/sterkere caveat før egen innsiktsnode. |
| I34 | godkjenn med endring | Generert som intern arbeidsnode: [[I34 Fem fokusområder gjør kartet handlingsrettet]]. |
| I35 | parkert | Soya/EUDR-sporet er relevant, men bør kobles til eget fôr/import-kildegrunnlag først. |
| I36 | godkjenn med endring | Generert som intern arbeidsnode: [[I36 Næringsgjenvinning er et prioritert gap]]. |
| I37 | godkjenn med endring | Generert som intern arbeidsnode: [[I37 Maktkartet må leses gjennom fire linser]]. |
| I38 | godkjenn med endring | Generert som intern arbeidsnode: [[I38 Objective-function skiller beslutning fra publisering]]. |

Tillatte beslutningsverdier: `godkjenn`, `godkjenn med endring`, `dropp`, `parkert`.

Beslutning etter I27+-review:

- [ ] Kandidatlisten er godkjent/redigert og kan genereres
- [ ] Kandidatlisten er parkert; ingen I27+-noter genereres

Valgt 2026-07-03: Kandidatlisten står som besluttet i tabellen — de seks «godkjenn med endring» er generert som interne arbeidsnoder; de seks parkerte genereres ikke uten egen claim-lock-/datarunde.

## 6. Siterbarhetsstikkprover

| Stikkprove | Sjekk | Status | Notat |
|---|---|---|---|
| `10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md` | Minst en kildenote-lenke og riktig `siterbarhet` | godkjent | Kildenote-lenke ([[Kilde – narrativ-struktur]]) og `siterbarhet: intern` + gate-advarsel til stede. |
| `10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md` | Intern/menneskelig gate er tydelig | godkjent | Intern/menneskelig gate tydelig markert. |
| `10 Innsiktskart/Gaps/Gap-register.md` | Alle 12 gaps har mission/data | godkjent | Alle 12 gaps har mission-ID (VK4-GAP-001–012); Dataview-tabellen bekrefter. |
| `12 Kilder/Kilde – narrativ-struktur.md` | Kildelaget gir trygg inngang til source-attribution | godkjent | Peker til `research/rammeverk/narrativ-struktur.md` med intern-markering. |
| `11 Maktkart/Personregister.md` | AP-1-bruksregelen beskytter persontolkning | godkjent | AP-1-bruksregel eksplisitt: strukturell posisjon, ikke intensjon; claim-lock/PCQ før ekstern bruk. |

Beslutning etter siterbarhetsreview:

- [ ] Godkjent for intern bruk
- [ ] Krever claim-lock for valgte noter
- [ ] Parkert for ny kilde-/siterbarhetsrunde

Valgt 2026-07-03: Godkjent for intern bruk; all ekstern bruk går fortsatt gjennom claim-lock/siterbarhets-gaten.

## 7. Beslutninger for app/whitepaper

| Visning | Beslutning | Begrunnelse |
|---|---|---|
| Vault-graf til `/graf` | parkert | Utsatt til konkret app-/leveransebehov; ikke nødvendig for intern arbeidskart-closeout. Gabriel beslutter ved neste app-runde. |
| Temacanvas Sirkularitet som figur | parkert | Canvas godkjent internt; ekstern figurbruk krever claim-lock-runde først. |
| Temacanvas Norden som figur | parkert | Canvas godkjent internt; ekstern figurbruk krever claim-lock-runde først. |
| Konsern-canvas som intern analysefigur | godkjent | Godkjent for intern analysebruk (stress-testet på NorgesGruppen ASA 2026-07-03); ekstern bruk krever claim-lock. |
| Gap-register som research-backlog | godkjent | Gap-registeret med VK4-GAP-missions fungerer som intern research-backlog. |

## 8. Neste datainnsamlingsrunde

| Kandidat | Beslutning | Begrunnelse |
|---|---|---|
| Styredata-dekning for 13 konserntrær | parkert | VK-4 prioritet 1 står som anbefalt neste runde (styredata dekker 98 av 275 selskaper); endelig prioritering er Gabriels beslutning. |
| Brreg-refresh for aldri-refreshede konsern | parkert | VK-4 prioritet 2; Orkla «0 %»-kanten (Lilleborg) er konkret kandidat for refresh-sjekk. |
| M&A-events for NG-treet | parkert | VK-4 prioritet 3; konsernreview viste ikke akutte hull. |
| Stakeholder-utfylling fra skeletons | parkert | VK-4 prioritet 4; vurderes etter I26-/stakeholder-runde. |
| Norske sirkularitets-gaps | parkert | VK-4 prioritet 5; gap-/mission-koblingen er komplett, ny datainnsamling ikke besluttet ennå. |

## Sluttstatus for VK-5

VK-5 kan bare lukkes nar:

1. Alle seksjonene over har beslutning.
2. Eventuelle endringer fra reviewen er gjort i repo/vault.
3. `npm run vault:sync && npm run vault:check` er gronn etter endringene.
4. Denne protokollen oppdateres med endelig status.
