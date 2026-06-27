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

### Delokt 4: kompost-jordprodukt

- Celle bearbeidet: `matsvinn-sirkulaer / kompost-jordprodukt`.
- Kandidater: 8 aktorer/ordninger med lokator; alle org.nr validert mot Brreg API 2026-06-26.
- Nye noder: 6 (`gronn-vekst-as`, `oslo-kommune-oslokompost`, `reve-kompost-as`, `bokashi-norge-as`, `follo-ren-iks`, `norbark-as`).
- Eksisterende beriket/lenket: 2 (`lindum-as`, `mjosanlegget-as`); `bokashi-norge-as` lenket til eksisterende `Company.companyId`.
- Relasjoner: 3 (`mjosanlegget-as -> gronn-vekst-as`, `follo-ren-iks -> gronn-vekst-as`, `norbark-as -> lindum-as`).
- Dekningsdelta: 0 -> 8 kartlagt; gap 20 -> 12.
- Usikkerhet: `oslo-kommune-oslokompost` flagget fordi dette er kommunal produkt-/etatrolle; `follo-ren-iks` flagget fordi rollen er bestilling/distribusjon av jord produsert av Gronn Vekst; `norbark-as` flagget for nyere org-/eierskapsstruktur.
- Cross-session dedup-audit: ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-kompost-jordprodukt-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter kompakt, kildebelagt kjerne for aa kjoere verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 4

1. `matsvinn-sirkulaer / kompost-jordprodukt` er ikke mettet: neste passering bor lete etter flere norske avfalls-/jordproduktaktorer med primarkilder, men ikke fylle med rene forhandlere uten dokumentert restressursrolle.
2. Neste v2-vektede sirkulaere celler med fullt gap: `matsvinn-sirkulaer / reststrom-sidestrom` og `matsvinn-sirkulaer / emballasje-retur`.
3. Kryss til `innsatsfaktorer / froe-genressurser` eller `innsatsfaktorer / gjodsel-jordforbedring` er nyttig for aa balansere spinen og unngaa at startfasen blir ensidig sirkulaer.

### Delokt 5: froe-genressurser

- Celle bearbeidet: `innsatsfaktorer / froe-genressurser`.
- Kandidater: 14 aktorer/ordninger med lokator; 12 org.nr validert mot Brreg API 2026-06-26. `NordGen` og `Svalbard Global Seed Vault` er inkludert som froberedskaps-/genressursinfrastruktur uten norsk org.nr. i kandidatdata.
- Nye noder: 9 (`svalbard-global-seed-vault`, `graminor-as`, `sagaplant-as`, `norsk-froavlerlag`, `norgro-as`, `strand-unikorn-as`, `midt-norsk-blomsterengfro-ans`, `log-as`, `la-humla-suse`).
- Eksisterende beriket/lenket: 5 (`kvann`, `nibio`, `nordgen`, `solhatt`, `felleskjopet-agri`); `graminor-as`, `strand-unikorn-as` og `felleskjopet-agri` lenket til eksisterende `Company.companyId`.
- Relasjoner: 4 (`svalbard-global-seed-vault -> nordgen`, `kvann -> nibio`, `la-humla-suse -> nibio`, `norgro-as -> felleskjopet-agri`).
- Dekningsdelta: 0 -> 13 kartlagt for NO; gap 20 -> 7. Telleavviket mot 14 importerte/berikede skyldes at eksisterende `NordGen`-actor har `country=Nordic` og dermed teller utenfor NO-raden i dekningsboka.
- Usikkerhet: `kvann` og `nibio` flagget fordi eldre eksisterende Actor-metadata manglet direkte orgNr etter additiv beriking; `nordgen` flagget for Nordic-telling; `svalbard-global-seed-vault` flagget fordi det er infrastruktur/ordning uten eget org.nr.; `log-as` og `la-humla-suse` flagget fordi rollen er distribusjon/formidling heller enn foredling/genbank.
- Cross-session dedup-audit: ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-froe-genressurser-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter balanserende inputfaktor-kjerne for aa kjoere verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 5

1. `innsatsfaktorer / froe-genressurser` er ikke mettet: gapet er 7 etter forste passering, og neste passering bor prioritere flere norske produsent-/foredlings-/genressursroller med primarkilder.
2. For aa balansere input-siden videre er beste neste celler `innsatsfaktorer / for-protein` eller `innsatsfaktorer / gjodsel-jordforbedring`.
3. Hvis neste okt skal tilbake til sirkulaer-sporet, er de stoerste helt apne hullene `matsvinn-sirkulaer / reststrom-sidestrom` og `matsvinn-sirkulaer / emballasje-retur`.

### Delokt 6: for-protein

- Celle bearbeidet: `innsatsfaktorer / for-protein`.
- Kandidater: 22 aktorer/prosjekt med lokator; 21 org.nr validert mot Brreg API 2026-06-26. `Foods of Norway` er NMBU-prosjekt/center uten eget org.nr. i kandidatdata.
- Nye noder: 12 (`felleskjopet-rogaland-agder`, `norgesfor-as`, `fiskaa-molle-as`, `biomar-as`, `aller-aqua-norway-as`, `vestkorn-milling-as`, `pelagia-as`, `calanus-as`, `the-qrill-company-as`, `norilia-as`, `foods-of-norway`, `arctic-feed-ingredients-as`).
- Eksisterende beriket/lenket: 10 (`felleskjopet-agri`, `strand-unikorn-as`, `denofa`, `skretting`, `mowi-feed`, `cargill-aqua-nutrition`, `invertapro`, `pronofa`, `bio3-norway`, `nofima`); 15 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner: 0 i denne passeringen; ingen primarkildebelagte supplier/member-relasjoner utover `companyId`-lenker ble importert.
- Dekningsdelta: 0 -> 21 kartlagt for NO; gap 20 -> 0. `for-protein` er mettet etter arbeidsanslaget. Telleavviket mot 22 importerte/berikede skyldes at eksisterende `Cargill Aqua Nutrition / EWOS` har `country=US` og dermed teller utenfor NO-raden i dekningsboka.
- Usikkerhet: `cargill-aqua-nutrition`, `aller-aqua-norway-as`, `norilia-as`, `pronofa`, `bio3-norway`, `nofima`, `foods-of-norway` og `arctic-feed-ingredients-as` flagget for menneskelig etterkontroll av landtelling, salgs-/importrolle, FoU-/prosjektrolle eller modenhet i feed-markedet.
- Cross-session dedup-audit: ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-for-protein-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter mettet inputfaktor-celle for aa kjoere verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 6

1. `innsatsfaktorer / for-protein` er mettet i audit-ledgeren; ikke start ny for-protein-passering for volum for Cargill-telleavviket alene.
2. Resterende inputfaktor-hull er `innsatsfaktorer / gjodsel-jordforbedring` og `innsatsfaktorer / biostimulanter-jordliv`, begge 20/20.
3. Hvis neste okt skal tilbake til sirkulaer-sporet, er de stoerste helt apne hullene fortsatt `matsvinn-sirkulaer / reststrom-sidestrom` og `matsvinn-sirkulaer / emballasje-retur`.

### Delokt 7: gjodsel-jordforbedring

- Celle bearbeidet: `innsatsfaktorer / gjodsel-jordforbedring`.
- Kandidater: 22 aktorer med lokator; alle 22 org.nr validert mot Brreg API 2026-06-26.
- Nye noder: 3 (`yara-norge-as`, `gronn-gjodsel-as`, `minorga-vekst-as`).
- Eksisterende beriket/lenket: 19 (`felleskjopet-agri`, `felleskjopet-rogaland-agder`, `norgesfor-as`, `fiskaa-molle-as`, `strand-unikorn-as`, `log-as`, `norgro-as`, `gronn-vekst-as`, `lindum-as`, `mjosanlegget-as`, `reve-kompost-as`, `bokashi-norge-as`, `norbark-as`, `den-magiske-fabrikken`, `greve-biogass`, `ivar-iks`, `ecopro-as`, `veas-as`, `veas-marked-as`); 6 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner: 5 (`greve-biogass -> den-magiske-fabrikken`, `lindum-as -> den-magiske-fabrikken`, `yara-norge-as -> gronn-gjodsel-as`, `veas-marked-as -> veas-as`, `ivar-iks -> minorga-vekst-as`).
- Dekningsdelta: 0 -> 22 kartlagt for NO; gap 20 -> 0. `gjodsel-jordforbedring` er mettet etter arbeidsanslaget.
- Usikkerhet: `bokashi-norge-as`, `norbark-as`, `greve-biogass` og `minorga-vekst-as` flagget for menneskelig etterkontroll av landbruksinput-presisjon, org-/eierskapspresisering, Company-lag eller nyere primarkilde.
- Cross-session dedup-audit: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-gjodsel-jordforbedring-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter mettet inputfaktor-celle for aa kjoere dedup-audit/verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 7

1. `innsatsfaktorer / gjodsel-jordforbedring` er mettet i audit-ledgeren; ikke start ny gjodsel-passering for volum alene.
2. Resterende inputfaktor-hull er `innsatsfaktorer / biostimulanter-jordliv` med 20/20.
3. Hvis neste okt skal tilbake til sirkulaer-sporet, er de stoerste helt apne hullene fortsatt `matsvinn-sirkulaer / reststrom-sidestrom` og `matsvinn-sirkulaer / emballasje-retur`.

### Delokt 8: biostimulanter-jordliv

- Celle bearbeidet: `innsatsfaktorer / biostimulanter-jordliv`.
- Kandidater: 22 aktorer med lokator; 22 org.nr identifisert/validert mot norske registeroppslag 2026-06-26.
- Nye noder: 12 (`agrinos-norway-as`, `kelpinor-as`, `seafertil-as`, `nordquist-ferment-as`, `norsk-naturgjodsel-as`, `norsk-landbruksradgiving-sa`, `vitalanalyse`, `sunn-jord-as`, `eurofins-agro-testing-norway-as`, `jordplan-as`, `norsk-jordforening`, `norges-vel`).
- Eksisterende beriket/lenket: 10 (`norgro-as`, `log-as`, `yara-norge-as`, `felleskjopet-agri`, `bokashi-norge-as`, `gronn-gjodsel-as`, `norsok`, `nibio`, `okologisk-norge`, `stiftelsen-norsk-mat`); 2 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner: 6 (`norsok -> nibio`, `norsok -> norsk-landbruksradgiving-sa`, `norges-vel -> sunn-jord-as`, `norges-vel -> vitalanalyse`, `nordquist-ferment-as -> norsok`, `nordquist-ferment-as -> sunn-jord-as`).
- Dekningsdelta: 0 -> 22 kartlagt for NO; gap 20 -> 0. `biostimulanter-jordliv` er mettet etter arbeidsanslaget.
- Usikkerhet: `vitalanalyse` og `norsk-jordforening` importert som `unverified`; `agrinos-norway-as`, `norsk-naturgjodsel-as`, `bokashi-norge-as`, `gronn-gjodsel-as`, `norsok`, `nibio`, `okologisk-norge`, `stiftelsen-norsk-mat`, `sunn-jord-as` og `jordplan-as` flagget for menneskelig etterkontroll av primarkilde, adjacent rolle, FoU-/kunnskapsrolle, egenkilde eller juridisk presisering.
- Cross-session dedup-audit: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-biostimulanter-jordliv-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter mettet inputfaktor-celle for aa kjoere dedup-audit/verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 8

1. `innsatsfaktorer / biostimulanter-jordliv` er mettet i audit-ledgeren; inputfaktor-stadiet er naa 78/80 med 3/4 celler mettet.
2. Resterende inputfaktor-hull er `innsatsfaktorer / froe-genressurser` med gap 7; det bor ha en liten andre passering senere, men ikke foran de store null-cellene hvis neste okt skal dekke v2-spinen bredere.
3. Neste v2-vektede toppliste etter volum er fortsatt `matsvinn-sirkulaer / reststrom-sidestrom`, `matsvinn-sirkulaer / emballasje-retur`, `regenerativ-praksis / jordhelse-karbon`, `permakultur-fleraarige / skogshage-agroforestry` og de helt apne primaerproduksjons-/foredlingscellene. Hvis en praktiker-/SME-vekt prioriteres over volum, start med `matsvinn-sirkulaer / reststrom-sidestrom` eller `regenerativ-praksis / jordhelse-karbon`.

### Delokt 9: reststrom-sidestrom

- Celle bearbeidet: `matsvinn-sirkulaer / reststrom-sidestrom`.
- Kandidater: 22 aktorer med lokator; alle 22 org.nr validert mot Brreg API 2026-06-26.
- Nye noder: 16 (`bioco-as`, `biosirk-norge-as`, `fatland-ull-hud-skinn-as`, `animalia-as`, `karmsund-protein-as`, `nutrimar-as`, `hofseth-biocare-asa`, `marealis-as`, `seagarden-as`, `scanbio-marine-group-as`, `triplenine-vedde-as`, `orkla-health-ocean-as`, `nutrishell-as`, `hitramat-as`, `ydra-as`, `tine-sa`).
- Eksisterende beriket/lenket: 6 (`norilia-as`, `nortura-sa` som traff eksisterende `actor-nortura`, `pelagia-as`, `biomega-norway`, `nofima`, `sintef-ocean`); 6 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner: 5 (`norilia-as -> nortura-sa`, `fatland-ull-hud-skinn-as -> biosirk-norge-as`, `karmsund-protein-as -> pelagia-as`, `nutrishell-as -> hitramat-as`, `nofima -> sintef-ocean`).
- Dekningsdelta: 0 -> 22 kartlagt for NO; gap 20 -> 0. `reststrom-sidestrom` er mettet etter arbeidsanslaget.
- Usikkerhet: `nortura-sa`, `tine-sa`, `animalia-as`, `nofima`, `sintef-ocean`, `seagarden-as`, `orkla-health-ocean-as`, `hitramat-as` og `ydra-as` flagget for menneskelig etterkontroll av konsern-/kunnskaps-/FoU-/generator-/teknologileverandorrolle eller restrastoff-presisjon.
- Cross-session dedup-audit: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-reststrom-sidestrom-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter mettet sirkulaer side-stream-celle for aa kjoere dedup-audit/verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 9

1. `matsvinn-sirkulaer / reststrom-sidestrom` er mettet i audit-ledgeren; `matsvinn-sirkulaer` er naa 65/120 med 1/6 celler mettet.
2. Resterende sirkulaere hull er `emballasje-retur` med gap 20, `insekt-alternativ-protein` med gap 14, `kompost-jordprodukt` med gap 12, `matredistribusjon` med gap 10 og `biogass-bioraffinering` med gap 1.
3. Hvis neste okt skal holde sirkulaer/SME-vektingen, start med `matsvinn-sirkulaer / emballasje-retur`. Hvis bredere v2-spine skal prioriteres, ta en helt apen cellerunde i `regenerativ-praksis / jordhelse-karbon` eller `primaerproduksjon / jordbruk-groent`.

### Delokt 10: emballasje-retur

- Celle bearbeidet: `matsvinn-sirkulaer / emballasje-retur`.
- Kandidater: 23 aktorer/ordninger med lokator; 21 org.nr validert mot Brreg API 2026-06-26. `Sorteringsmerkene` er ordningsnode uten eget org.nr. og lenkes til LOOP som forvalter.
- Nye noder: 19 (`gront-punkt-norge-as`, `plastretur-as`, `norsk-returkartong-as`, `norsk-resy-as`, `norsk-metallgjenvinning-as`, `sirkel-glass-as`, `treretur-as`, `norsirk-as`, `loop-stiftelsen`, `sorteringsmerkene-loop`, `tomra-systems-asa`, `tomra-butikksystemer-as`, `den-norske-emballasjeforening`, `bewi-insulation-norge-as`, `bewi-circular-as`, `vartdal-plastindustri-as`, `packoorang-as`, `ragn-sells-as`, `roaf-iks`).
- Eksisterende beriket/lenket: 4 (`infinitum-as` -> eksisterende `actor-infinitum`, `norsk-gjenvinning-as` -> eksisterende `actor-norsk-gjenvinning`, `sirk-norge` -> eksisterende `actor-sirk-norge`, `norsus` -> eksisterende `actor-norsus`); 2 kandidater ble lenket til eksisterende `Company.companyId`.
- Relasjoner: 15, inkludert materialselskapene til Gront Punkt, `Sorteringsmerkene -> LOOP`, `TOMRA Butikksystemer -> TOMRA Systems`, BEWI/NORSIRK og Vartdal/Plastretur.
- Dekningsdelta: 0 -> 23 kartlagt for NO; gap 20 -> 0. `emballasje-retur` er mettet etter arbeidsanslaget.
- Usikkerhet: 9 noder flagget for menneskelig etterkontroll fordi de er ordnings-, bransje-, FoU-, adjacent ombruks-, generell gjenvinnings- eller interkommunal infrastrukturrolle heller enn rene emballasje-retur-operatorer.
- Cross-session dedup-audit: 23 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr etter lokal metadata-opprydding for `sorteringsmerkene-loop`, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
- Prod-wiring: `db:import:mvk-emballasje-retur-2026-06-26` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne delokten: stopper etter mettet emballasje-retur-celle for aa kjoere dedup-audit/verifikasjon og PR-oppdatering.

### Completeness-critic / neste arbeidsliste etter delokt 10

1. `matsvinn-sirkulaer / emballasje-retur` er mettet i audit-ledgeren; `matsvinn-sirkulaer` er naa 88/120 med 2/6 celler mettet.
2. Resterende sirkulaere hull er `insekt-alternativ-protein` med gap 14, `kompost-jordprodukt` med gap 12, `matredistribusjon` med gap 10 og `biogass-bioraffinering` med gap 1.
3. Hvis neste okt skal holde sirkulaer/SME-vektingen, ta andrepassering paa `matsvinn-sirkulaer / insekt-alternativ-protein` eller `kompost-jordprodukt`. Hvis bredere v2-spine skal prioriteres, start en helt apen cellerunde i `regenerativ-praksis / jordhelse-karbon` eller `primaerproduksjon / jordbruk-groent`.

## 2026-06-27 - primaerproduksjon / havbruk-akvakultur

- Worktree/branch: `.worktrees/matverdikjede-0pct-import-2026-06-27` / `codex/matverdikjede-0pct-import-2026-06-27`.
- Celle bearbeidet: `primaerproduksjon / havbruk-akvakultur` (0%-celle).
- Kandidater: 20 Brreg-registerrader med lokator og validert org.nr.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: 0 -> 20; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-06-27.csv`.
- Usikkerhet: 3 noder flagget for menneskelig etterkontroll; 0 kildelose importert.
- Prod-wiring: `db:import:mvk-havbruk-akvakultur-2026-06-27` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne cellen: fortsetter til neste prioriterte 0%-celle.

## 2026-06-27 - primaerproduksjon / villfisk-fiskeri

- Celle bearbeidet: `primaerproduksjon / villfisk-fiskeri` (0%-celle).
- Kandidater: 20 Brreg-registerrader med lokator og validert org.nr.
- Nye noder: 20.
- Eksisterende beriket/lenket: 0.
- CompanyId-lenker: 0.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: 0 -> 20; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-06-27.csv`.
- Usikkerhet: 1 node flagget for menneskelig etterkontroll; 0 kildelose importert.
- Prod-wiring: `db:import:mvk-villfisk-fiskeri-2026-06-27` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne cellen: fortsetter til neste prioriterte 0%-celle.

## 2026-06-27 - distribusjon-grossist / grossist-distributor

- Celle bearbeidet: `distribusjon-grossist / grossist-distributor` (0%-celle).
- Kandidater: 20 Brreg-registerrader med lokator og validert org.nr.
- Nye noder fra ren DB: 19.
- Eksisterende beriket/lenket: 1 (`BAMA Gruppen` via eksisterende Actor/Company).
- CompanyId-lenker: 3.
- Relasjoner: 0; ingen kildebelagte actor-to-actor-relasjoner i registerpasset.
- Dekningsdelta: 0 -> 20; gap 20 -> 0.
- Review-koe: `research/_status/mvk-review-koe-2026-06-27.csv`.
- Usikkerhet: 18 noder flagget for menneskelig etterkontroll; 0 kildelose importert.
- Cross-session dedup: `bama-gruppen-as`-duplikatet ble fjernet lokalt og kandidat-CSV peker naa paa eksisterende BAMA-actor.
- Prod-wiring: `db:import:mvk-grossist-distributor-2026-06-27` lagt til og innlemmet i `db:prod-sync`.
- Stopp-arsak denne cellen: tre prioriterte 0%-celler er importert; gaar videre til cross-session dedup og obligatorisk verifikasjon.
