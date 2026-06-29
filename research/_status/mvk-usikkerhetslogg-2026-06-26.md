# MVK usikkerhetslogg 2026-06-26

## matsvinn-sirkulaer / matredistribusjon

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 8 lokale matsentral-noder mangler eget org.nr. i kandidatdata. De er likevel `machine_verified` som nettverksnoder fordi Matsentralen Norges egen kontaktside oppgir dem med adresse og kontaktinfo.
- Brreg-validert: Matsentralen Norge (`919702974`) og Matvett AS (`997898397`) er aktive enheter per Enhetsregisteret API hentet 2026-06-26.
- Cross-session dedup-audit fant ingen dupliserte orgNr i Actor-metadata. En eldre SLU-navneduplisering finnes i Actor-tabellen, men er ikke introdusert av denne MVK-cellen.

## matsvinn-sirkulaer / biogass-bioraffinering

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 2 (`renevo-as`, `vireo-as`) fordi rollebelegg i denne passeringen er bransje-/leverandorkilde selv om org.nr er Brreg-validert.
- Til menneskelig etterkontroll: 4 (`greve-biogass` fordi eksisterende Company-rad bruker syntetisk orgNr, `renevo-as`, `bir-ressurs-as` for konsern/operatorpresisering, `vireo-as`).
- Brreg-validert: 19 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26.
- Dedup-forventning: eksisterende Actor berikes for `biogass-norge`, `st1-biokraft`, `greve-biogass`, `ivar-iks`; `ST1 BIOKRAFT AS` lenkes via eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 19 datasett-taggede noder, ingen dupliserte Actor metadata-orgNr, ingen dupliserte `companyId`, og ingen normaliserte navneduplikater for de taggede nodene.

## matsvinn-sirkulaer / insekt-alternativ-protein

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 1 (`ecoprot`) fordi NIBIO/Pronofa dokumenterer rolle, men Brreg-sok ikke gav trygt aktivt org.nr-treff 2026-06-26.
- Til menneskelig etterkontroll: 3 (`pronofa` for AS/ASA-navnepresisering mellom Actor og Company, `ecoprot` for org.nr/status, `nibio` fordi dette er FoU-infrastruktur og ikke proteinprodusent).
- Brreg-validert: 5 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`917809755`, `916325010`, `926501836`, `915334504`, `988983837`).
- Dedup-forventning: eksisterende Actor berikes for alle 6 kandidater; `invertapro`, `norinsect`, `pronofa` og `bio3-norway` lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 6 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## matsvinn-sirkulaer / kompost-jordprodukt

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 3 (`oslo-kommune-oslokompost` fordi dette er kommunal produkt-/etatrolle, `follo-ren-iks` fordi rollen er bestilling/distribusjon av jord produsert av Gronn Vekst, `norbark-as` fordi nyere org-/eierskapsstruktur bor etterkontrolleres).
- Brreg-validert: 8 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`981711033`, `979618840`, `987916346`, `958935420`, `987739924`, `923456570`, `975804569`, `936074189`).
- Dedup-forventning: eksisterende Actor berikes for `lindum-as` og `mjosanlegget-as`; `bokashi-norge-as` lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 8 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## innsatsfaktorer / froe-genressurser

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 6 (`kvann` og `nibio` fordi eldre eksisterende Actor-metadata manglet direkte orgNr etter additiv beriking, `nordgen` fordi eksisterende Actor har `country=Nordic` og telles utenfor NO-raden, `svalbard-global-seed-vault` fordi dette er froberedskapsinfrastruktur uten eget org.nr. i kandidatdata, `log-as` og `la-humla-suse` fordi rollen er distribusjon/formidling heller enn foredling/genbank).
- Brreg-validert: 12 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`917965137`, `988983837`, `967247359`, `993061158`, `913997832`, `984027761`, `960117883`, `916329717`, `911608103`, `971169486`, `983473997`, `912047652`).
- Dedup-forventning/resultat: eksisterende Actor berikes for `kvann`, `nibio`, `nordgen`, `solhatt` og `felleskjopet-agri`; `graminor-as`, `strand-unikorn-as` og `felleskjopet-agri` lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 14 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## innsatsfaktorer / for-protein

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 8 (`cargill-aqua-nutrition` fordi eksisterende Actor har `country=US` selv om norsk NUF/org.nr og aktivitet er validert, `aller-aqua-norway-as` fordi norsk rolle er salgs-/importledd, `norilia-as` fordi proteinrollen har mat/petfood-tyngde, `pronofa` og `bio3-norway` fordi feed-rollen er framvoksende/alternativ protein, `nofima` og `foods-of-norway` fordi de er FoU-/prosjektroller, og `arctic-feed-ingredients-as` fordi kilden er investor/prospektpreget).
- Brreg-validert: 21 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`911608103`, `915442552`, `975871096`, `975856844`, `916329717`, `987643935`, `988044113`, `911610744`, `916635001`, `937843860`, `994046055`, `994423592`, `989094823`, `984468970`, `988354139`, `995643316`, `917809755`, `926501836`, `915334504`, `989278835`, `913170539`).
- Dedup-forventning/resultat: eksisterende Actor berikes for 10 kandidater (`felleskjopet-agri`, `strand-unikorn-as`, `denofa`, `skretting`, `mowi-feed`, `cargill-aqua-nutrition`, `invertapro`, `pronofa`, `bio3-norway`, `nofima`); 15 kandidater lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 22 datasett-taggede noder, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## innsatsfaktorer / gjodsel-jordforbedring

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 4 (`bokashi-norge-as` fordi rollen er smaskala/husholdningsnær og bor vurderes mot landbruksinput-presisjon, `norbark-as` fordi nyere org-/eierskapsstruktur bor etterkontrolleres, `greve-biogass` fordi eksisterende Company-lag tidligere har syntetisk Greve-orgNr, og `minorga-vekst-as` fordi rollen bygger paa eldre IVAR-styresak og bor verifiseres mot nyere primarkilde).
- Brreg-validert: 22 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`984015666`, `911608103`, `915442552`, `975871096`, `975856844`, `916329717`, `983473997`, `960117883`, `995194252`, `981711033`, `979618840`, `987916346`, `987739924`, `923456570`, `936074189`, `926389998`, `912716635`, `871035032`, `984853998`, `920171400`, `920652336`, `997863623`).
- Dedup-forventning/resultat: eksisterende Actor berikes for 19 kandidater (`felleskjopet-agri`, `felleskjopet-rogaland-agder`, `norgesfor-as`, `fiskaa-molle-as`, `strand-unikorn-as`, `log-as`, `norgro-as`, `gronn-vekst-as`, `lindum-as`, `mjosanlegget-as`, `reve-kompost-as`, `bokashi-norge-as`, `norbark-as`, `den-magiske-fabrikken`, `greve-biogass`, `ivar-iks`, `ecopro-as`, `veas-as`, `veas-marked-as`); 6 kandidater lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## innsatsfaktorer / biostimulanter-jordliv

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 2 (`vitalanalyse`, `norsk-jordforening`) fordi rollebelegg/juridisk kobling er svakere enn for produktleverandorene.
- Til menneskelig etterkontroll: 12 (`agrinos-norway-as` for nyere primarkilde, `norsk-naturgjodsel-as`, `bokashi-norge-as` og `gronn-gjodsel-as` for adjacent gjodsel/jordliv-presisjon, `norsok`, `nibio`, `okologisk-norge` og `stiftelsen-norsk-mat` fordi de er FoU-/kompetanse-/interesse-/kunnskapsroller, `vitalanalyse` for juridisk/nyere Sunn Jord-kobling, `sunn-jord-as` for egenkilde, `jordplan-as` for verktøy/service-rolle og `norsk-jordforening` for sparsom webrolle).
- Brreg-validert/identifisert: 22 org.nr i kandidatfilen er norske enheter per Enhetsregisteret/Brreg-oppslag hentet 2026-06-26 (`960117883`, `983473997`, `984015666`, `911608103`, `995300575`, `929242688`, `933576418`, `983725902`, `977303311`, `923456570`, `995194252`, `969840383`, `988983837`, `931892126`, `983494463`, `828079042`, `913547853`, `996063631`, `982512069`, `997460944`, `990675627`, `965208739`).
- Dedup-forventning/resultat: eksisterende Actor berikes for 10 kandidater (`norgro-as`, `log-as`, `yara-norge-as`, `felleskjopet-agri`, `bokashi-norge-as`, `gronn-gjodsel-as`, `norsok`, `nibio`, `okologisk-norge`, `stiftelsen-norsk-mat`); 2 kandidater lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## matsvinn-sirkulaer / reststrom-sidestrom

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 9 (`nortura-sa` og `tine-sa` fordi de er store konsernnoder tatt inn for lenking/side-stream-kontekst, `animalia-as`, `nofima` og `sintef-ocean` fordi de er kunnskaps-/FoU-infrastruktur, `seagarden-as` og `orkla-health-ocean-as` fordi restrastoffkobling bor etterkontrolleres mot mer presis primarkilde, `hitramat-as` fordi rollen er generator av krabbeskall for NutriShell, og `ydra-as` fordi dette er teknologileverandor og ikke raavareforedler).
- Brreg-validert: 22 org.nr i kandidatfilen er aktive enheter per Enhetsregisteret API hentet 2026-06-26 (`995643316`, `993406198`, `921042434`, `956982715`, `938752648`, `919117060`, `989094823`, `916768257`, `990080372`, `982951879`, `994464663`, `977049490`, `977249368`, `996920933`, `961138973`, `995073307`, `926407163`, `914843316`, `921770359`, `989278835`, `937357370`, `947942638`).
- Dedup-forventning/resultat: eksisterende Actor berikes for 6 kandidater (`norilia-as`, `nortura-sa` som traff eksisterende `actor-nortura`, `pelagia-as`, `biomega-norway`, `nofima`, `sintef-ocean`); 6 kandidater lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 22 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.

## matsvinn-sirkulaer / emballasje-retur

- Droppet kildelost: 0.
- Disputed: 0.
- Unverified importert: 0.
- Til menneskelig etterkontroll: 9 (`sorteringsmerkene-loop` fordi dette er en ordningsnode uten eget org.nr., `tomra-butikksystemer-as` for presis norsk service-/butikkrolle, `den-norske-emballasjeforening`, `sirk-norge` og `norsus` fordi de er bransje-/FoU-/kunnskapsroller og ikke operatorer, `bewi-circular-as` for norsk selskapsrolle, `packoorang-as` fordi ombruksemballasje er adjacent til matverdikjeden, `ragn-sells-as` fordi rollen er generisk plastemballasjeoperator og `roaf-iks` fordi den er interkommunal ettersorteringsinfrastruktur).
- Brreg-validert: 21 org.nr i kandidatfilen er aktive norske enheter per Enhetsregisteret API hentet 2026-06-26. `Sorteringsmerkene` er uten eget org.nr. og lenkes til LOOP som forvalter.
- Dedup-forventning/resultat: eksisterende Actor berikes for 4 kandidater (`infinitum-as`, `norsk-gjenvinning-as`, `sirk-norge`, `norsus`); `Infinitum AS` og `Norsk Gjenvinning AS` lenkes til eksisterende `Company.companyId`.
- Cross-session dedup-audit etter import: 23 datasett-taggede noder, alle `NO`, ingen dupliserte kandidat-orgNr etter lokal metadata-opprydding for `sorteringsmerkene-loop`, ingen dupliserte `companyId`, ingen normaliserte navneduplikater og ingen eksterne Actor-kollisjoner paa datasettenes `companyId`.
