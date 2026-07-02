---
tittel: Obsidian kunnskapskart - VK-5 review-protokoll
status: klar-for-gjennomgang-ikke-utfort
dato: 2026-07-02
arbeidsflate: Food Systems Obsidian/
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md
completion_audit: docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md
---

# Obsidian kunnskapskart - VK-5 review-protokoll

Denne protokollen er arbeidsarket for Gabriel/Cathrine-reviewen. Den skal fylles ut under faktisk Obsidian-gjennomgang. Ikke bruk dette dokumentet som bevis pa at VK-5 er ferdig for alle punktene under har status `godkjent`, `godkjent med endring` eller `parkert med beslutning`.

## For review starter

| Gate | Kommando eller handling | Forventet resultat | Status | Notat |
|---|---|---|---|---|
| Repo-integritet | `npm run vault:sync && npm run vault:check` | Andre sync-runde er idempotent og `vault:check ok` | ikke sjekket i review |  |
| Review-preflight | `npm run vault:review-preflight` | Alle repo-/vault-stier, masterplanens obligatoriske frontmatter, `relaterte_filer`-mål, kontraktseksjoner, akseptanse-/invarianttekst, `.claude/source-attribution-policy.md`-målet, VK-5-protokollfrontmatter-mål, VK-5-frontmatter-koblinger og -mål, I27+-frontmatter-mål, I27+-stopptekst, anti-overclaim-statusverdier og maskinelt sjekkbare VK-5-stikkprøver finnes | ikke sjekket i review |  |
| Review-closeout | `npm run vault:review-closeout` | Skal feile før human review er dokumentert; skal være grønn først når protokollen er lukket og alle review-rader er løst | ikke sjekket i review |  |
| Diff-forstaelse | `git status --short --branch` og diff i Git | Kun forventede vault-/sync-/planartefakter | ikke sjekket i review |  |
| Obsidian apner vault | Apne `Food Systems Obsidian/` som vault | Ingen prompt om korrupt vault; graph/canvas apner | ikke sjekket i review |  |
| Plugins | Les `0 Kart/Oppsett.md` | Dataview, Breadcrumbs, Minimal Theme Settings og Juggl/3D Graph-presentasjonsoppsett er forstatt | ikke sjekket i review |  |

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

## 1. Diff-gjennomgang og kilde-JSON

| Stikkprove | Hva skal sjekkes | Kilde | Status | Notat |
|---|---|---|---|---|
| `11 Maktkart/Selskaper/NorgesGruppen ASA.md` | Orgnr, konserntre, eier-/styre-/relasjonsblokker | `data/vault-export/companies.json`, `ownership-forest.json`, `board-members.json` | ikke sjekket |  |
| `11 Maktkart/Eierskapsregisteret.md` | Eierkanter og prosenter stemmer med eksport | `data/vault-export/ownership-edges.json` | ikke sjekket |  |
| `11 Maktkart/Personregister.md` | Kun interlockere og AP-1-bruksregel | `data/vault-export/board-members.json` | ikke sjekket |  |
| `11 Maktkart/Selskapsregister.md` | Alle DB-eksporterte selskaper er indeksert | `data/vault-export/manifest.json` | ikke sjekket |  |
| `11 Maktkart/Selskaper/Selskapsmappe-register.md` | Eldre AP-1-noder og DB-noder er oppdagbare | Vault-mappen `11 Maktkart/Selskaper/` | ikke sjekket |  |
| `12 Kilder/Møte- og transkriptregister.md` | Metadata-only, ingen fulltekstkopi | `docs/meetings/`, `research/landbrukarena_transcripts/` | ikke sjekket |  |

Beslutning etter diff-gjennomgang:

- [ ] Godkjent
- [ ] Godkjent med endringer
- [ ] Parkert - krever ny sync/datarevisjon

## 2. Graf-visning i Obsidian

| Sjekk | Handling i Obsidian | Godkjenningskriterium | Status | Notat |
|---|---|---|---|---|
| Standardgraf | Apne Graph view | Grafen er leselig ved 500+ noder etter standardoppsett | ikke sjekket |  |
| Farger | Kontroller `.obsidian/graph.json` i grafinnstillinger | Ledd, aktorer, stakeholders, innsikter, looper, gaps, Norden, selskaper, personer og kilder skiller seg tydelig | ikke sjekket |  |
| Hull | Filtrer pa `path:"10 Innsiktskart/Gaps"` | Gap-noder er synlige og koblet til `Gap-register`/missions | ikke sjekket |  |
| Stoy | Skjul/vis `path:"10 Innsiktskart/Looper"` og `path:"11 Maktkart/Personer"` | Standardvisning kan brukes uten at looper/personer overdøver hovedstrukturen | ikke sjekket |  |
| Maktlag | Start fra `Maktkartet` og `NorgesGruppen ASA` | Eier-/styrenettverk er navigerbart | ikke sjekket |  |

Beslutning etter graf-review:

- [ ] Godkjent
- [ ] Juster colorGroups/filtre
- [ ] Parkert - krever ny grafstrategi

## 3. Canvas-kvalitet

| Canvas | Hva skal sjekkes | Status | Notat |
|---|---|---|---|
| `0 Kart/Kunnskapskart.canvas` | Overordnet kart: ingen kritisk overlapp; hub og lag er lesbare | ikke sjekket |  |
| `0 Kart/Verdikjedekart.canvas` | Verdikjedeledd og innsiktskoblinger er lesbare | ikke sjekket |  |
| `0 Kart/Maktkart.canvas` | Maktlag fungerer som inngang til eier-/styrenettverk | ikke sjekket |  |
| `0 Kart/Temakart/Sirkularitet.canvas` | Looper/gaps per tema er visuelt begripelige | ikke sjekket |  |
| `0 Kart/Temakart/Norden.canvas` | Land/konsentrasjon/looper er begripelige | ikke sjekket |  |
| `0 Kart/Konsern/NorgesGruppen ASA.canvas` | Store konserntre er lesbart og prosentkanter gir mening | ikke sjekket |  |
| `0 Kart/Konsern/Coop Norge SA.canvas` | Samvirke-/konsernstruktur er lesbar | ikke sjekket |  |
| `0 Kart/Konsern/Orkla ASA.canvas` | Foredlings-/konsernstruktur er lesbar | ikke sjekket |  |
| `0 Kart/Konsern/Mowi ASA.canvas` | Havbrukslaget er lesbart | ikke sjekket |  |
| `0 Kart/Konsern/Kesko Oyj.canvas` | Nordisk detaljhandel er lesbar | ikke sjekket |  |

Beslutning etter canvas-review:

- [ ] Godkjent
- [ ] Godkjent med liste over konkrete canvas-endringer
- [ ] Parkert - krever layoutpass

## 4. Dataview og dynamiske MOC-er

| Note | Sjekk | Forventet | Status | Notat |
|---|---|---|---|---|
| `0 Kart/HUB – Kunnskapsdatabasen.md` | Dynamiske oversikter | Klynge- og gate-tabeller returnerer rader uten feil | ikke sjekket |  |
| `10 Innsiktskart/Innsiktskartet.md` | Innsikter og gap-mission-tabell | Innsikter vises; gaps har mission der det kreves | ikke sjekket |  |
| `11 Maktkart/Maktkartet.md` | DB-selskaper og interlockere | Tabellene returnerer selskaper/personer uten Dataview-feil | ikke sjekket |  |
| Klyngenoter `1` til `8` | Seksjonstabeller | Seksjoner listes med status og siterbarhet | ikke sjekket |  |

Beslutning etter Dataview-review:

- [ ] Godkjent
- [ ] Juster Dataview-sporringer
- [ ] Parkert - plugin/oppsett mangler

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

## 6. Siterbarhetsstikkprover

| Stikkprove | Sjekk | Status | Notat |
|---|---|---|---|
| `10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md` | Minst en kildenote-lenke og riktig `siterbarhet` | ikke sjekket |  |
| `10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md` | Intern/menneskelig gate er tydelig | ikke sjekket |  |
| `10 Innsiktskart/Gaps/Gap-register.md` | Alle 12 gaps har mission/data | ikke sjekket |  |
| `12 Kilder/Kilde – narrativ-struktur.md` | Kildelaget gir trygg inngang til source-attribution | ikke sjekket |  |
| `11 Maktkart/Personregister.md` | AP-1-bruksregelen beskytter persontolkning | ikke sjekket |  |

Beslutning etter siterbarhetsreview:

- [ ] Godkjent for intern bruk
- [ ] Krever claim-lock for valgte noter
- [ ] Parkert for ny kilde-/siterbarhetsrunde

## 7. Beslutninger for app/whitepaper

| Visning | Beslutning | Begrunnelse |
|---|---|---|
| Vault-graf til `/graf` | ikke besluttet |  |
| Temacanvas Sirkularitet som figur | ikke besluttet |  |
| Temacanvas Norden som figur | ikke besluttet |  |
| Konsern-canvas som intern analysefigur | ikke besluttet |  |
| Gap-register som research-backlog | ikke besluttet |  |

## 8. Neste datainnsamlingsrunde

| Kandidat | Beslutning | Begrunnelse |
|---|---|---|
| Styredata-dekning for 13 konserntrær | ikke besluttet | VK-4 prioritet 1; vurder etter maktkart-/konserncanvas-review |
| Brreg-refresh for aldri-refreshede konsern | ikke besluttet | VK-4 prioritet 2; vurder mot datakvalitet i selskapsnoter |
| M&A-events for NG-treet | ikke besluttet | VK-4 prioritet 3; vurder hvis konsernreview viser hull |
| Stakeholder-utfylling fra skeletons | ikke besluttet | VK-4 prioritet 4; vurder etter I26-/stakeholder-review |
| Norske sirkularitets-gaps | ikke besluttet | VK-4 prioritet 5; vurder etter gap-/mission-review |

## Sluttstatus for VK-5

VK-5 kan bare lukkes nar:

1. Alle seksjonene over har beslutning.
2. Eventuelle endringer fra reviewen er gjort i repo/vault.
3. `npm run vault:sync && npm run vault:check` er gronn etter endringene.
4. Denne protokollen oppdateres med endelig status.
