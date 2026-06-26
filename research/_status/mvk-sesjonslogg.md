# MVK sesjonslogg

## 2026-06-26

- Worktree/branch: `.worktrees/matverdikjede-full-kartlegging-2026-06-26` / `codex/matverdikjede-full-kartlegging-2026-06-26`.
- Preflight: `npm ci --ignore-scripts`, `npm run db:generate`, `npx tsx scripts/write-version.ts`, lokal `DATABASE_URL=postgresql://localhost:5432/foodsystems?schema=public`.
- Importkapabilitet: `scripts/import-domain-actors.ts` utvidet til `org_nr -> Company -> Actor.companyId`, med testdekning for eksisterende Actor via `companyId`.
- Taksonomi: `domene-dekningsbok.csv` utvidet fra 21 til 70 celler etter v2-runbookens verdikjede-spine.
- Celle bearbeidet: `matsvinn-sirkulaer / matredistribusjon`.
- Nye noder: 8 regionale matsentraler.
- Eksisterende beriket/lenket: 2 (`matsentralen-norge`, `matvett`) via eksisterende `Company.companyId`.
- Relasjoner: 8 `member_of` fra regionale matsentraler til Matsentralen Norge.
- Dekningsdelta: 0 -> 10 kartlagt; gap 20 -> 10.
- Review-koe: `research/_status/mvk-review-koe-2026-06-26.csv`.
- Usikkerhet: 8 lokale matsentral-noder flagget for menneske fordi kandidatdata mangler egne org.nr.; ingen kildelose eller disputed noder importert.
- Cross-session dedup-audit: ingen dupliserte Actor metadata-orgNr; MVK-importen viser 10 taggede noder uten ny companyId-duplikat. Eldre normalisert navneduplisering `SLU (Sveriges lantbruksuniversitet)` / `SLU Sveriges lantbruksuniversitet` observert utenfor denne cellen.
- Gate-prep: `db:audit:strict-sources` avdekket to stale lokale Document-duplikater med `... 2.md`-filePath for NHH FOOD. Begge manglet refs/citations og ble slettet fra lokal DB for aa gjenopprette strict-gate; kanoniske dokumentrader og repo-filer uten `-2` finnes fortsatt.
- Stopp-arsak denne delokten: forlater videre celle-gather til neste iterasjon etter forste import/reconcile og infrastrukturfixer.

### Completeness-critic / neste arbeidsliste

1. `lokale-verdikjeder / reko` og `lokale-verdikjeder / andelslandbruk` har store numeriske gap, men er allerede delvis behandlet i v1-sporet; velg dem bare hvis formaalet er volumdekning.
2. For v2-vektet videre arbeid bor neste celle komme fra tynt sirkulaert/SME-lag: `matsvinn-sirkulaer / biogass-bioraffinering`, `matsvinn-sirkulaer / reststrom-sidestrom`, `innsatsfaktorer / froe-genressurser`, eller `foredling-industri / frukt-groent-foredling`.
3. Coverage-scriptet ble korrigert til aa telle aktorer i flere subdomener naar de har flere `subdomene:`-tags; dette maa beholdes for additiv beriking av eksisterende aktorer.

### Delokt 2: biogass-bioraffinering

- Celle bearbeidet: `matsvinn-sirkulaer / biogass-bioraffinering`.
- Kandidater: 19 aktorer, alle med lokator; alle org.nr validert mot Brreg API 2026-06-26.
- Nye noder: 15 (`den-magiske-fabrikken`, `ecopro-as`, `lindum-as`, `renevo-as`, `veas-as`, `veas-marked-as`, `romerike-biogassanlegg`, `cambi-asa`, `antec-biogas`, `norsk-biogass-as`, `mjosanlegget-as`, `frevar-kf`, `bir-ressurs-as`, `bio-jaeren-as`, `vireo-as`).
- Eksisterende beriket/lenket: 4 (`biogass-norge`, `st1-biokraft`, `greve-biogass`, `ivar-iks`); `st1-biokraft` beholdt eksisterende `Company.companyId`.
- Relasjoner: 3 (`den-magiske-fabrikken -> greve-biogass`, `den-magiske-fabrikken -> lindum-as`, `veas-marked-as -> veas-as`).
- Dekningsdelta: 0 -> 19 kartlagt; gap 20 -> 1.
- Usikkerhet: `renevo-as` og `vireo-as` importert som `unverified`; `greve-biogass` flagget fordi lokal Company-rad har syntetisk orgNr; `bir-ressurs-as` flagget for operator/konsernpresisering.
- Cross-session dedup-audit: ingen dupliserte Actor metadata-orgNr, ingen dupliserte `companyId`, og ingen normaliserte navneduplikater for de 19 datasett-taggede nodene.
- Prod-wiring: `db:import:mvk-biogass-bioraffinering-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter andre celle for aa kjoere dedup-audit/verifikasjon og PR-oppdatering med god margin.

### Completeness-critic / neste arbeidsliste etter delokt 2

1. `matsvinn-sirkulaer / biogass-bioraffinering` mangler bare 1 node etter arbeidsanslaget; neste runde bor enten lukke siste gap med egenkilde for Renevo/Vireo eller markere loop-til-torr etter en ny passering.
2. Neste v2-vektede sirkulaere celler: `matsvinn-sirkulaer / reststrom-sidestrom`, `matsvinn-sirkulaer / kompost-jordprodukt`, `matsvinn-sirkulaer / insekt-alternativ-protein`.
3. Alternativt kryss over til `innsatsfaktorer / froe-genressurser` for aa unngaa at hele runbooken blir for sirkulaer-tung i startfasen.

### Delokt 3: insekt-alternativ-protein

- Celle bearbeidet: `matsvinn-sirkulaer / insekt-alternativ-protein`.
- Kandidater: 6 aktorer med lokator; 5 org.nr validert mot Brreg API 2026-06-26.
- Nye noder: 0.
- Eksisterende beriket/lenket: 6 (`invertapro`, `norinsect`, `pronofa`, `ecoprot`, `bio3-norway`, `nibio`); `invertapro`, `norinsect`, `pronofa` og `bio3-norway` lenket til eksisterende `Company.companyId`.
- Relasjoner: 5 (`ecoprot -> pronofa`, samt MultiFuelLarve-partnerrelasjoner fra `invertapro`, `norinsect`, `pronofa` og `ecoprot` til `nibio`).
- Dekningsdelta: 0 -> 6 kartlagt; gap 20 -> 14.
- Usikkerhet: `ecoprot` importert som `unverified` fordi Brreg-sok ikke gav trygt aktivt org.nr-treff; `pronofa` flagget for AS/ASA-navnepresisering; `nibio` flagget fordi cellerollen er FoU-infrastruktur, ikke proteinprodusent.
- Cross-session dedup-audit: ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-insekt-alternativ-protein-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter kompakt, kildebelagt kjerne for aa kjoere dedup-audit/verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 3

1. `matsvinn-sirkulaer / insekt-alternativ-protein` er ikke mettet: neste passering bor lete etter aktive norske produsenter/leverandorer utover MultiFuelLarve-kjernen, men ikke fylle med petfood/importcase uten norsk verdikjederolle.
2. Neste v2-vektede sirkulaere celler med fullt gap: `matsvinn-sirkulaer / reststrom-sidestrom`, `matsvinn-sirkulaer / kompost-jordprodukt`, `matsvinn-sirkulaer / emballasje-retur`.
3. Kryss til `innsatsfaktorer / froe-genressurser` er fortsatt nyttig for aa balansere spinen hvis neste okt ikke skal bli for sirkulaer-tung.
