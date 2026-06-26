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
