# Datavisualisering prod-data-status 2026-04-29

## Formål

Dette notatet lukker Fase -1a og dokumenterer Fase -1b-status i `docs/project/plans/DATAVISUALISERING-MASTERPLAN-2026-04-29.md`: rask avklaring av hvilke datadomener som kan bygges mot prod, hvilke som bare finnes lokalt, hvilke importer som er kjørt mot prod, og hvilke faser som fortsatt må holdes tilbake til row-count-paritet er avklart.

## Kort konklusjon

Fase 0a og Fase 4a kan starte nå fordi de kan bygges fra typed/static data og en liten felles visualiseringskontrakt.

Fase -1b har nå gjort prod-endepunktet grønt: `/api/data-status` returnerer HTTP 200 og `ok:true` etter import av Landbruksregisteret, produksjonstilskudd, sjømatkonserntrær, akvakulturregister, akvakultursøknader og leveransedata.

Gate C er delvis bestått. Prod er ikke tom lenger, og prod matcher nå dagens kilde-/importgrunnlag for `aquacultureSites`, `deliveryVolumes` og kjørbar `BusinessRelationship`-importpakke. Lokal DB-audit er refreshet og nøkkeldiff er gjennomført: lokal har `aquacultureSites=286`, `deliveryVolumes=60275` og `businessRelationships=121`, mens prod/kildegrunnlaget står på `285`, `60310` og `105`. Avvikene er nå forklart som stale/local-only rader eller kildeår-drift, ikke som tom prod. Fiskehelse er fortsatt ikke klart datalag.

## Verifikasjon gjennomført

| Sjekk | Resultat |
| --- | --- |
| `git status --short --branch` | `main`; dirty worktree med datavisualiseringsdokumenter, nye visualiseringsfiler og enkelte urelaterte untracked filer |
| `git branch -a` | relevante remote-brancher finnes |
| `git show --stat 0ac373d --` | `/api/data-status` lagt til i commit `0ac373d` |
| `/api/data-status` i aktiv branch | finnes i `src/app/api/data-status/route.ts` |
| `npm run db:audit` lokalt | passerte referanseintegritet; 240 856 strukturerte rader |
| prod `/api/data-status` før Fase -1b | HTTP 503, `ok:false`, deploy `ad19ddc`, branch `main`, built `2026-04-29T12:37:20.958Z` |
| prod backup før import | DB-dump i prod DB-container: `/tmp/foodsystems-pre-datavis-sync-20260429T131835Z.dump` |
| prod backup før relasjonsimport | DB-dump i prod DB-container: `/tmp/foodsystems-pre-relations-sync-20260429T133744Z.dump` |
| prod-importer kjørt | `db:import:landbruksregister`, `db:import:produksjonstilskudd`, `db:import:mowi-tree`, `db:import:salmar-tree`, `db:import:leroy-tree`, `db:import:seafood-holdings`, `db:import:akvakulturregister`, `db:import:akvakultursoknader`, `db:import:leveransedata` |
| prod relasjonsimporter kjørt | `db:import:session5`, `db:import:session10`, `db:import:asko`, `db:import:horeca`, `db:import:research-20260420`, `db:import:nordic-deep`, `db:import:ownership`, deretter rerun av `db:import:session10` |
| prod `/api/data-status` etter Fase -1b | HTTP 200, `ok:true`, checked `2026-04-29T13:40:32.475Z`, deploy `ad19ddc`, branch `main` |
| akvakultur kildekontroll | live dry-run mot Fiskeridirektoratet: 289 summary-rader, 285 unike lokalitetsnummer |
| leveransedata kildekontroll | oppdatert dry-run: korn skriver 15 986 rader; samlet forventet import er 60 310 rader |
| lokal audit-refresh etter prod-sync | `npm run db:audit` OK; `npm run db:verify` OK; lokal direkte count: `aquacultureSites=286`, `deliveryVolumes=60275`, `businessRelationships=121` |
| lokal/prod nøkkeldiff | `scripts/print-visualization-drift-keys.ts` lokalt og direkte `psql` i prod: havbruk 1 local-only, leveranser 15 951 local-only/15 986 prod-only, relasjoner 18 local-only/2 prod-only |
| prod `db:verify` | OK: alle baseline-tabeller over terskel; `BusinessRelationship=105` mot baseline 40 |

## Branch-status

| Branch | Status 2026-04-29 | Konklusjon |
| --- | --- | --- |
| `origin/chore/api-data-status-2026-04-29` | `0ac373d` er inkludert i `main`; ingen diff mot `main` | Lukket |
| `origin/chore/prod-data-sync-fixes-2026-04-29` | remote finnes; branch har 0 commits foran `main`, og `main` har 9 commits foran branchen | Ikke lenger ventende merge; behold kun som historisk branch |
| `origin/fix/subsidier-data-2026-04-29` | remote finnes; branch har 0 commits foran `main`, og `main` har 7 commits foran branchen | Ikke lenger ventende merge; batch-import og empty-state er allerede i `main` |
| `origin/chore/prod-sync-registers-2026-04-29` | remote finnes | Relevant for Fase -1b/importarbeid, men ikke avklart som løst av Fase -1a |

## Lokal kontra prod

Tallene under følger samme kontrakt som `/api/data-status`. Lokale tall er refreshet etter prod-sync med direkte Prisma-count og `npm run db:audit`.

| Domene/tabell | Lokal DB | Prod før | Prod etter | Klassifisering etter Fase -1b | Blokkerer |
| --- | ---: | ---: | ---: | --- | --- |
| `subsidiesAll` | 179 312 | 2 | 179 312 | `prod-ok` | Ikke lenger blokkert for `/subsidier` |
| `subsidiesProduksjon` | 179 310 | 0 | 179 310 | `prod-ok` | Ikke lenger blokkert for `/subsidier` |
| `aquacultureSites` | 286; dagens kildesjekk: 285 unike; local-only `30177` | 0 | 285 | `prod-ok`, men `local-stale-row` | Ikke bruk lokal 286-count som fasit |
| `aquacultureApplications` | 100 | 0 | 100 | `prod-ok` | Ikke lenger blokkert for søknadsanalyse |
| `fishHealthObservations` | 0 | 0 | 0 | `unknown` / ikke klart datalag | Ikke bygg fiskehelseanalyse som beslutningsdata |
| `deliveryVolumes` | 60 275; dagens import-dry-run: 60 310; lokal har 2023-korn | 0 | 60 310 | `prod-ok`, men `local-source-year-drift` | Ikke bruk lokal 60 275-count som fasit |
| `businessRelationships` | 121; 18 local-only og 2 prod-only nøkler | 50 | 105 | `prod-ok` mot kjørbar importpakke, men `relationship-review-needed` | Ikke bruk lokale ekstra/prod-only relasjoner som claims uten review |
| `landbruksregisterCompanies` | 53 808 | 0 | 53 808 | `prod-ok` | Ikke lenger blokkert for entity-koblinger |

## Fase -1b gjennomført

Prod-importene ble kjørt fra en midlertidig checkout på serveren mot samme Docker-nettverk som prod-databasen. App-containeren hadde kun runtimefiler, så importene ble kjørt i en midlertidig `node:22-bookworm-slim`-container med checkouten montert inn.

Viktige resultater:

- `produksjonstilskudd`: 36 739 gårder aggregert, 179 310 subsidie-rader skrevet.
- `landbruksregister`: 53 804 nye selskaper opprettet og 90 oppdatert.
- sjømatkonserntrær: prod gikk fra 9 til 23 norske `seafood`-selskaper.
- `akvakultursoknader`: 100 søknader skrevet, lokal paritet.
- `akvakulturregister`: først 208 lokaliteter skrevet; etter org-filtrert retry med delay/backoff er prod på 285 unike lokaliteter. Dagens live-kildekontroll gir samme unike antall, selv om gammel lokal audit hadde 286.
- `leveransedata`: først 44 324 rader skrevet; etter parserfix for kornkolonner og rerun av `leveransedata-korn` er prod på 60 310 rader. Oppdatert dry-run gir samme total.
- `businessRelationships`: relasjonspakken økte prod fra 50 til 105 relasjoner. Alle skript i repoet som skriver `BusinessRelationship` er kjørt eller rerunnet i riktig rekkefølge. `session10` måtte kjøres på nytt etter HORECA fordi `Servicegrossistene AS` først ble opprettet der.
- lokal DB-audit: direkte count og `npm run db:audit` bekrefter at lokal DB fortsatt har 286/60 275/121. Nøkkeldiff forklarer nå driftmønsteret.
- `fiskehelse`: ikke kjørt ferdig fordi prod-containeren ikke har `BARENTSWATCH_CLIENT_ID` eller `BARENTSWATCH_CLIENT_SECRET`. Lokal status er også 0 observasjoner, og domenet inngår ikke i dagens `/api/data-status`-page gate.

## Driftanalyse etter nøkkeldiff

Auditgrunnlag:

- Lokal DB: `scripts/print-visualization-drift-keys.ts` for `aquaculture`, `delivery` og `relationships`.
- Prod DB: direkte `psql` i prod DB-containeren med samme nøkkelkontrakt.
- Nøklene som ble sammenlignet: `localityNumber` for `AquacultureSite`, `supplierOrgNr|commodity|year` for `DeliveryVolume`, og `fromOrgNr|toOrgNr|relationshipType` for `BusinessRelationship`.

Resultat:

- `aquacultureSites`: lokal har én ekstra nøkkel: `30177` = `TORGERHAUGEN`, `Mowi Seawater Norway AS`, kilde `Fiskeridirektoratet pub-aqua`. Prod har ingen prod-only lokaliteter. Siden dagens prod-import og live-kildekontroll begge står på 285 unike lokalitetsnummer, behandles lokal `30177` som stale/local-only til lokal DB er reimportert eller ryddet.
- `deliveryVolumes`: avviket er ikke tilfeldig radtap. Lokal har 15 951 local-only kornnøkler for 2023, mens prod har 15 986 prod-only kornnøkler for 2024. Netto gir dette prod +35 rader. Dette peker på kildeår-/parserdrift i kornimporten: prod er oppdatert med dagens parser/kildestruktur, lokal DB er ikke rerunnet til samme kornår.
- `businessRelationships`: avviket er 18 local-only og 2 prod-only nøkler, netto 16 færre i prod. Prod skal brukes som operativ fasit for 105 kjørbare relasjoner; de 20 diffnøklene må inn i review/preflight før de kan brukes som beslutningsclaims.

Leveransediff per commodity:

| Diff-retning | År | `korn-bygg` | `korn-erter` | `korn-havre` | `korn-hvete` | `korn-rug` | `oljefro` | Sum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local-only | 2023 | 6 831 | 346 | 4 364 | 3 218 | 691 | 501 | 15 951 |
| Prod-only | 2024 | 6 906 | 395 | 4 490 | 3 157 | 450 | 588 | 15 986 |

Relasjonsnøkler som avviker:

| Retning | Nøkler |
| --- | --- |
| Local-only | `874560552|819731322|supplier`, `874560552|982254604|supplier`, `910747711|982254604|supplier`, `919998919|947942638|supplier`, `929094636|819731322|distributor`, `929094636|911856655|distributor`, `937070632|982254604|supplier`, `937843860|956866266|supplier`, `937843860|975320637|supplier`, `938752648|982254604|supplier`, `947942638|938752648|supplier`, `956866266|988597627|joint-venture`, `975320637|988597627|joint-venture`, `980358088|956866266|supplier`, `980358088|961922976|supplier`, `980358088|964118191|supplier`, `980358088|975320637|supplier`, `980411133|982254604|supplier` |
| Prod-only | `SE-MATSE|SE-MATHEM|self-dealing`, `SE-ODA|SE-MATHEM|self-dealing` |

## Domene-routing

| Flate | Status | Beslutning |
| --- | --- | --- |
| `/mandat` | `prod-ok` for minimumsboard basert på typed/static data | Kan bygges i Fase 4a uten å vente på prod-sync |
| Felles visualiseringskomponenter | `prod-ok` | Kan bygges i Fase 0a nå |
| `/subsidier` | `prod-ok` | Kan videreføres som prodklar datatung flate etter vanlig UI/test-gate |
| `/havbruk` | `prod-ok` mot dagens kildegrunnlag; `local-drift` | Kan bygges på prod-data; ikke bruk lokal 286-count som fasit før 1-lokalitet-avviket er forklart |
| `/forsyningskjede` | `prod-ok` for leveransevolumer og kjørbar relasjonspakke; første Fase 1-slice implementert; `local-drift` dokumentert | Kan designes videre på primærflyt og relasjonsanalyse, men marker lokal/prod-drift for leveranser og relasjoner |
| `/graf` | `unknown` for prod-paritet i denne endpointen | Ikke bruk global graf som bevis for prod-dataparitet før egen grafstatus er verifisert |
| `/media` | `unknown` for prod-paritet i denne endpointen | Kan videreutvikles forsiktig, men review-gate og egen audit gjelder |
| `/sammenligning` | ikke blokkert av denne endpointen | Kan fortsette, men datastatus må merkes per indikator |

## Gate 0a

Gate 0a er bestått for oppstart av Fase 0a og Fase 4a:

- Vi vet hvilke domener som var `needs-import` i Fase -1a, og hvilke som nå er `prod-ok` eller `parity-gap` etter Fase -1b.
- 08.05-pakken kan holdes fri for tomme prod-tabeller ved å bygge `/mandat` på typed/static data.
- Prod-gap er eksplisitt dokumentert.

Gate C er delvis bestått etter Fase -1b:

- `/api/data-status` er grønn i prod.
- `/subsidier` har lokal/prod-paritet.
- Lokal audit-refresh og nøkkeldiff er utført. Driften er forklart som én stale/local-only akvakulturlokalitet, 2023/2024-kornår-drift, og 18 local-only/2 prod-only relasjonsnøkler.
- `/havbruk` og `/forsyningskjede` matcher dagens prod/kilde-/importkontroll for henholdsvis akvakulturlokaliteter, leveransevolumer og kjørbare relasjonsimporter.
- Fiskehelse er fortsatt ikke lukket som full datatungt grunnlag.

## Neste handling

1. Hold Fase 0a og Fase 4a som implementert og verifisert spor.
2. For `/havbruk`: bruk prod/kildegrunnlag 285 som operativ fasit; lokal `30177` må reimporteres/ryddes før lokal 286-count kan brukes.
3. For `/forsyningskjede`: presenter relasjonsanalyse med datastatus `prod-ok` for 105 importerte relasjoner, og flytt 18 local-only/2 prod-only relasjonsnøkler til review/preflight før claim-bruk.
4. For fiskehelse: ikke bygg beslutningsvisualisering før Barentswatch-credentials og datalag er avklart.
5. Ikke marker full Gate C som bestått før fiskehelseavviket er eksplisitt lukket eller akseptert som avvik, og lokal DB enten er reimportert til prodparitet eller tydelig merket som local-only snapshot.
