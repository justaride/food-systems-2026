# PostgreSQL-drift og MCP-tilgang

## Beslutning

Standard MCP-flate er den kuraterte [`foodsystems-kb`](FOODSYSTEMS-KB-MCP.md), ikke et generisk PostgreSQL-MCP med fri SQL. Den kuraterte serveren skal bruke en egen database-login som er teknisk håndhevet read-only.

En prompt som sier «SELECT only» er ikke en sikkerhetsgrense. Read-only må bevises i PostgreSQL gjennom rolleattributter, ACL-er, timeouts og faktiske avviste skriveforsøk.

Produksjon eller delt MCP er **NO-GO** til alle portene nedenfor er grønne. Lokal `stdio`-pilot kan startes etter at samme porter er grønne mot den valgte lokale eller staging-databasen.

## Driftsporter før MCP

Kjør i denne rekkefølgen:

1. Ta verifisert backup.
2. Gjennomfør restore-drill mot en ny, disponibel database.
3. Avstem Prisma-migrasjonsledgeren.
4. Kjør schema-drift-porten.
5. Opprett og verifiser MCP-rollen.
6. Koble den kuraterte MCP-serveren til rollen.

Ikke bruk én grønn port som bevis for en annen. En gyldig dump sier ikke at migrasjonsledgeren er riktig, og en grønn Prisma-status sier ikke at backup kan gjenopprettes.

## 1. Migrasjoner: ledger, ikke SQL-replay

Produksjonsimaget starter med:

```bash
scripts/apply-prod-migrations.sh
```

Runneren krever en egen `MIGRATION_DATABASE_URL` og kjører i fast rekkefølge
før `node server.js` kan starte:

```bash
prisma migrate deploy
prisma migrate status
scripts/verify-database-schema-drift.sh
```

Dermed bruker starten `_prisma_migrations`, Prisma sin advisory lock og Prisma
sin feilstatus. Runneren:

- stopper hvis `MIGRATION_DATABASE_URL`, schema, migrasjoner eller låst lokal
  Prisma CLI mangler
- nekter manglende/empty ledger og krever at den historiske baselinen til og
  med `20260618_library_analysis_record` allerede er fullført
- laster ikke ned en CLI med `npx` under deploy
- spiller aldri hele `prisma/migrations/**/migration.sql` om igjen
- skjuler ikke migrasjonsfeil eller returnerer suksess etter feil
- hindrer appstart hvis ledgeren eller schema-/FTS-kontrakten ikke er grønn

Runtime-imaget kopierer dependency-treet fra repoets `npm ci`/lockfile og har
en databasebasert `HEALTHCHECK`. `MIGRATION_DATABASE_URL` fjernes før den
langlivede app-prosessen starter. En Coolify `post_deployment_command` er ikke
en autoritativ feilgrense; aktuell upstream kan markere deployen `finished` før
post-kommandoen og bare logge dens feil. Fjern den dupliserte post-hooken etter
at installert Coolify-versjon og entrypointkonfigurasjon er kontrollert.

### Eksisterende databaser og baseline

En database som tidligere ble bygget med `db push` eller rå SQL kan ha objekter uten korrekt ledger. Ikke «reparer» dette ved å kjøre alle SQL-filene eller redigere `_prisma_migrations` manuelt.

Repoets migrasjonshistorikk er en **catch-up-historikk for en eksisterende
database**, ikke en komplett initialkjede. Første migrasjon forutsetter allerede
`SourceDoc`, og samme-dato-historikk har avhengigheter som ikke kan replayes
leksikalsk mot en tom database. Fresh-database bootstrap er derfor NO-GO til en
kontrollert baseline/squash er bevist mot disponibel PostgreSQL. Runnerens
baselinepreflight forhindrer delvis DDL på en tom eller uavstemt database.

Sikker avstemming:

```bash
npx prisma migrate status --schema prisma/schema.prisma
```

For hver pending migrasjon:

1. Les migrasjonen.
2. Verifiser objekt for objekt om endringen allerede finnes og matcher.
3. Ta og restore-test backup.
4. Hvis migrasjonen allerede er fullstendig representert, bruk Primas eksplisitte baselinekommando:

```bash
npx prisma migrate resolve --applied MIGRATION_NAME --schema prisma/schema.prisma
```

5. Hvis objektet mangler, la `migrate deploy` anvende migrasjonen.

`migrate resolve --applied` er en operatørbeslutning, ikke en automatisk deployhandling. Den skal ikke brukes for å omgå en feilende migrasjon.

Historiske migrasjoner er checksum-låst i `tests/lib/db-ops-hardening.test.ts`. Replay-problemer rettes med en ny forward-migrasjon, ikke ved å omskrive anvendt historikk.

## 2. Schema-drift

Kjør mot den databasen MCP faktisk skal lese:

```bash
scripts/verify-database-schema-drift.sh
```

Porten sammenligner Prisma-modellerte objekter med `prisma/schema.prisma` og
feiler på ukjent modellert drift. Prisma-diffen modellerer ikke vilkårlige
rutiner, triggers, grants eller RLS; FTS-rutinene/indeksene har derfor egne
katalogkontroller, mens ACL/RLS/rutiner dekkes av separate sikkerhetsporter.

De eneste tillatte Prisma-avvikene er `DROP DEFAULT` for `search_vector` på:

- `Document`
- `Insight`
- `Report`
- `Thesis`

Dette er tilsiktet fordi kolonnene er PostgreSQL `GENERATED ALWAYS ... STORED`, som Prisma ikke uttrykker fullt. Prisma 7.7 har i dette miljøet vist både en firelinjers form og en åttelinjers form som også inneholder én matchende `DROP INDEX` per tabell. Porten godtar nøyaktig én av disse to komplette formene og ingen andre. Tillatelsen er ikke bare tekstfiltrering: katalogkontrollen krever uansett at alle fire kolonnene faktisk er genererte `tsvector`-kolonner, at hvert normaliserte genereringsuttrykk inneholder nøyaktig de dokumenterte feltene og vektene, at de fire indeksene er enkle, gyldige `GIN (search_vector)`-indekser med `tsvector_ops`, og at wrapperfunksjonene er `IMMUTABLE`.

FTS-objektene er nå kodifisert forward-only i `prisma/migrations/20260719_fts_generated_columns_contract/migration.sql`.

## 3. Dedikert read-only MCP-rolle

Bootstrap krever en admin-URL og eksplisitt `--apply`. Last passordet fra godkjent secret manager eller sikker lokal prompt; ikke skriv det i repo, dokument eller terminalhistorikk.

> **Databasevid endring:** Før `--apply` må operatøren inventere alle roller og
> applikasjoner som baserer seg på `PUBLIC`-privilegier. Bootstrapen revokerer
> `PUBLIC`-grants på relasjoner og sequences i **alle** ikke-systemskjemaer, og
> slike avhengigheter mister tilgang til de får egne eksplisitte grants.

```bash
export DATABASE_ADMIN_URL='postgresql://ADMIN@HOST:5432/foodsystems'
export MCP_DB_ROLE='foodsystems_mcp_ro'
export MCP_DB_PASSWORD='FROM_SECRET_MANAGER'

scripts/bootstrap-mcp-readonly-role.sh --apply
```

Bootstrapen setter:

- `LOGIN`, `NOINHERIT`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, `NOBYPASSRLS`
- ingen medlemskap i andre roller
- bare `CONNECT`, schema `USAGE` og `SELECT` på den eksplisitte MCP-listen:
  `Actor`, `ActorDocumentRef`, `ActorRelationship`, `BoardMember`,
  `BusinessRelationship`, `Company`, `CompanyDocumentRef`, `CompanyOwnership`,
  `CompanyProperty`, `Document`, `EvidenceAppraisal`, `FieldCitation`, `Insight`,
  `LibraryAnalysisRecord`, `PersonProfile`, `Report`, `Shareholder`,
  `SourceCitation`, `SourceDoc` og `Thesis`
- ingen `SELECT` på blant annet `ActorContact`, communication-tabeller eller
  andre nåværende/fremtidige relasjoner i noe ikke-systemskjema; nye behov må
  allowlistes eksplisitt
- ingen sequence-tilgang eller skriveprivilegier i noe ikke-systemskjema
- ingen direkte function/procedure-grants til MCP-rollen
- `default_transaction_read_only=on`
- `statement_timeout=15s`
- `lock_timeout=2s`
- `idle_in_transaction_session_timeout=15s`
- `search_path=pg_catalog, public`
- `application_name=foodsystems-mcp-ro`

PostgreSQL har ikke en rolle-spesifikk `DENY`. For å bevise at MCP-rollen
mangler `TEMP`, schema-`CREATE` og relasjons-/sequence-tilgang utenfor den
eksplisitte listen, revokerer bootstrapen derfor følgende effektive
`PUBLIC`-veier:

```sql
REVOKE CREATE, TEMPORARY ON DATABASE ... FROM PUBLIC;
REVOKE ALL PRIVILEGES ON SCHEMA <hvert ikke-systemskjema> FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA <hvert ikke-systemskjema> FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA <hvert ikke-systemskjema> FROM PUBLIC;
```

Bootstrapen fjerner også direkte MCP-grants og relevante standardprivilegier i
alle ikke-systemskjemaer, før den gjenoppretter bare den eksakte 20-tabellers
allowlisten i målskjemaet. Dette er en databasevid sikkerhetsendring. Kartlegg
og gi eksplisitte grants til andre ikke-eier-roller som legitimt trenger
`PUBLIC`-privilegiene før bootstrap kjøres. Database-, schema- og
objekteiere beholder eierrettighetene sine.

PostgreSQL gir normalt `EXECUTE` på nye funksjoner til `PUBLIC`. En
rolle-spesifikk `REVOKE` kan ikke oppheve dette. Bootstrap revokerer derfor
`PUBLIC EXECUTE` på gjeldende `SECURITY DEFINER`-rutiner og fjerner standard
`PUBLIC EXECUTE` for migreringsoperatøren og alle gjeldende objekteiere i
brukerskjemaer. Eiere kan fortsatt kjøre egne rutiner; andre legitime approller
må få eksplisitt `EXECUTE`. Verifikatoren feiler både på enhver effektiv
`SECURITY DEFINER`-rutine og på objekteiere som fortsatt vil gi framtidige
rutiner offentlig kjørerett, inkludert schema-spesifikke
`ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ... TO PUBLIC`-overstyringer. Kjør
bootstrap og verifikator etter hver schemaendring eller når en ny migrerings-/
objekteier introduseres. Eksisterende `SECURITY INVOKER`-funksjoner kan fortsatt
ha `PUBLIC EXECUTE`, men kjører bare med MCP-rollens allowlistede rettigheter;
nye rutiner under den herdede owner-defaulten krever eksplisitt grant.

### Obligatorisk verifikasjon

Koble deretter med den dedikerte login-URL-en:

```bash
export MCP_DATABASE_URL='postgresql://foodsystems_mcp_ro:PASSWORD@HOST:5432/foodsystems?schema=public&application_name=foodsystems-mcp-ro'
scripts/verify-mcp-readonly-role.sh
```

Før en database erklæres releaseklar som akademisk MCP-underlag, må den strenge
databasedrevne porten også kjøres. Den krever en tilgjengelig database, eksakt
klassifisert seed/runtime-paritet og de pinnede minimumene for reviewet
provenance og tilgangsmetadata:

```bash
npm run audit:academic-source-quality:release
```

Dette er en integritetsport, ikke en ekstern akademisk godkjenning. Den separate
`--require-external-ready`-porten forblir rød til hver evidensrad enten består
den konservative eksterne appraisal-/citation-porten eller har en komplett,
gjeldende eksplisitt eksklusjon. Den eksternt kvalifiserte delmengden må være
ikke-tom, og hver kvalifisert rad må ha minst ett syntaktisk claim-anker.
Eksklusjoner lukker reviewdisposisjonen, men autoriserer aldri ekstern bruk;
hvert faktisk claim kontrolleres fortsatt separat.

Verifikatoren kontrollerer rolleattributter, alle medlemskapsveier, eierskap,
eksakt relasjonsallowlist og effektive ACL-er i alle ikke-systemskjemaer. Den
feiler på `SELECT` utenfor listen, skrive- og sequence-tilgang, schema-`CREATE`,
direkte routine-grants, kjørbare `SECURITY DEFINER`-rutiner og farlige
standardprivilegier via både rollen og `PUBLIC`. Den kontrollerer også timeouts
og rolleinnstillinger. Deretter slår den av den brukerendrbare read-only-
defaulten i testsesjonen og beviser at `UPDATE`, `DELETE`, `CREATE TABLE` og
`CREATE TEMP TABLE` fortsatt avvises. Databasepassord sendes via en privat,
midlertidig `PGPASSFILE`, ikke i `psql`-argv.

## 4. Backup og restore-drill

En dump i `/tmp` eller i databasecontaineren er ikke en varig backup. Bruk en eksplisitt katalog utenfor repoet, med begrenset filtilgang:

```bash
export DATABASE_URL='postgresql://BACKUP_READER@HOST:5432/foodsystems?schema=public'
export DATABASE_BACKUP_DIR='/absolute/off-repo/path/foodsystems-db-backups'
scripts/create-database-backup.sh
```

Scriptet:

- lager PostgreSQL custom-format med `--no-owner --no-acl`
- bruker midlertidig fil og atomisk publisering
- krever et ikke-tomt archive catalog
- skriver metadataformat v2 som JSON uten connection string og binder metadata-
  bytesene med en egen `.metadata.sha256`-sidecar
- binder dumpens SHA-256 og byteantall til `DatabaseIdentity` sin ene
  `primary`-UUID, SHA-256 over alle fullførte Prisma-ledgerrader, eksakte
  tellinger for åtte kjernetabeller pluss `DatabaseIdentity` og
  `ControlledMutationAudit`, og en deterministisk `sorted-keys-v1`-
  fingerprint over UUID, ledgerdigest og tellingene
- tar samme avgrensede database-snapshot før og etter dumpen og feiler hvis
  identity, ledger eller tellinger endres i fangstvinduet
- feiler lukket hvis release-control-tabellene `DatabaseIdentity` eller
  `ControlledMutationAudit` mangler; de må være migrert før en ny v2-backup
- kjører `verify-database-backup.sh` før suksess
- sletter ufullstendige outputfiler hvis en kontroll feiler
- bruker `sha256sum` med `openssl`-fallback og privat `PGPASSFILE`; credential-
  URL-er sendes ikke i PostgreSQL-prosessenes argumentliste

En eksisterende dump kan kontrolleres igjen:

```bash
scripts/verify-database-backup.sh /absolute/path/foodsystems-TIMESTAMP.dump
```

Verifikatoren aksepterer med hensikt eldre key-value-metadata eller manglende
metadata for **historisk restore**, og skriver da en tydelig legacy-advarsel.
Dette er kompatibilitet, ikke releasebevis. Matsvinnloven-runnerens framtidige
apply-sti kaller den samme porten med `BACKUP_REQUIRE_METADATA_V2=1`, men en
egen tidlig stopplinje holder fortsatt `--apply` ubetinget deaktivert. Streng
manuell kontroll av et arkiv:

```bash
BACKUP_REQUIRE_METADATA_V2=1 \
  scripts/verify-database-backup.sh \
  /absolute/path/foodsystems-TIMESTAMP.dump
```

For v2 valideres både dumpchecksum, metadataens egen checksum, deklarert
byteantall/fingerprint og at archive catalog faktisk inneholder begge
release-control-tabellene. Korrupt eller delvis v2-metadata kan ikke nedgraderes
til legacy.

Den deaktiverte apply-stien er forberedt fail-closed: eksakt contract- og
plan-SHA, operatør-ID, autorisasjonsreferanse og forventet skrivende databaserolle
må oppgis. Inne i samme `Serializable`-transaksjon må `primary`
`DatabaseIdentity`-UUID, fullført ledger og target-fingerprint matche
metadata/receipt eksakt. MCP/read-only-roller avvises. Etter verifisert etterstate
appendes én `ControlledMutationAudit` som eksplisitt binder før-, etter- og
dependency-state, dump-, metadata- og receipt-hash samt deterministisk
`operationKey`. Conflict, no-op eller rollback skal ikke gi audit-rad.

`dependencyStateSha256` legges til i den separate oppfølgingsmigrasjonen
`20260720_matsvinnloven_audit_dependency_binding`. Migrasjonen er anvendt i den
verifiserte lokale hardening-ledgeren; andre målmiljøer må fortsatt bevise den
gjennom ordinær migrasjonsport. Den allerede anvendte grunnmigrasjonen skal ikke
omskrives. Etter enhver ledger-/skjemaendring må en
ny metadata-v2-backup og restore-receipt produseres; eldre fingerprint kan ikke
autorisere mutasjonen.

Dette er fortsatt ikke tilstrekkelig til å åpne Matsvinnloven-apply. Den
generelle v2-fingerprinten innholdshasher UUID og fullført ledger, men binder
kjernetabellene med eksakte radtellinger, ikke med den reviewede
Matsvinnloven-førtilstanden. Live-runneren kan bevise den aktuelle førtilstanden,
men det beviser ikke alene at det restore-testede dumpet inneholder de samme
radbytesene. En framtidig mutation-specific restore-attestasjon må derfor
rekonstruere og matche den pinnede før-snapshot-hashen fra den disponibelt
gjenopprettede databasen. Frem til dette finnes, er manglende content-binding en
hard blocker og `--apply` skal forbli deaktivert.

`DatabaseIdentity` er en restore-stabil lineage-identitet, ikke et bevis på én
bestemt fysisk serverinstans. En klone kan derfor ha samme UUID, ledger og
tellinger. Før enablement må release-authority også binde det godkjente
målmiljøet/instansen uten å legge credentials i audit eller receipt.

Testene dekker rene contract/audit-byggere og databasekontroller i disponibel
PostgreSQL, inkludert rollback uten audit. De kjører ennå ikke hele Prisma-
runnerens framtidige mutasjonstransaksjon ende-til-ende mot en disponibelt
gjenopprettet, innholdsmatchet fixture. Manglende full transaksjonstest er en
egen hard blocker; deltester eller statisk SQL-inspeksjon skal ikke omtales som
atomisitetsbevis for hele runneren. En observert `already_applied`-tilstand er
heller ikke automatisk idempotensbevis: framtidig apply må finne nøyaktig én
matchende `ControlledMutationAudit`, ellers klassifiseres den
`unreceipted_after_state` og ingen no-op-audit appendes.

Append-only-garantien gjelder innen den ordinære SQL-rollegrensen. Tabellowner
eller superuser kan deaktivere triggere, og en bred INSERT-rolle kan forsøke å
attestere falske data. Produksjonsoppsettet må derfor bruke separat owner, en
eksplisitt kontrollert INSERT-only writer og en etterkontroll av tabell-,
sekvens- og funksjons-ACL-er; MCP/runtime read-only-rollen skal fortsatt ha null
tilgang til begge release-control-tabellene.

Den separate oppfølgingsmigrasjonen
`20260720_release_control_field_citation_integrity_v2` lukker
case/whitespace-bypass for de fire kanoniske targettypene, bevarer andre
dokumenterte historiske `entityType`-verdier og blokkerer reverse delete,
ID-endring, truncate og overgang til sitert syntetisk Document-karantene.
`20260720_release_control_field_citation_integrity_v3` reparerer deretter
Document-låsen slik at citation-first og quarantine-first samtidighet begge
feiler lukket. Begge er anvendt og testet i den lokale 31/31-ledgeren. De skal
deployes som vanlige migrasjoner og verifiseres separat i hvert målmiljø; de skal
ikke kjøres direkte mot en live database fra denne runbooken.

Checksum og archive catalog beviser fortsatt ikke gjenoppretting. Kjør restore-drill mot et **nytt** disponibelt databasenavn:

```bash
export DATABASE_RESTORE_ADMIN_URL='postgresql://ADMIN@HOST:5432/postgres'
export RESTORE_DATABASE_NAME='foodsystems_restore_20260719'
export RESTORE_DRILL_ACK='I_HAVE_VERIFIED_THIS_TARGET_IS_DISPOSABLE'
mkdir -m 700 -p '/absolute/off-repo/path/foodsystems-restore-receipts'
export RESTORE_RECEIPT_PATH='/absolute/off-repo/path/foodsystems-restore-receipts/restore-20260719.json'
export RESTORE_EXPECTED_DOCUMENT_COUNT='1539'
export RESTORE_EXPECTED_SOURCE_CITATION_COUNT='2703'
export RESTORE_EXPECTED_FIELD_CITATION_COUNT='244516'
export RESTORE_EXPECTED_REPORT_COUNT='139'
export RESTORE_EXPECTED_THESIS_COUNT='79'
export RESTORE_EXPECTED_SOURCE_DOC_COUNT='199'
export RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT='1572'
export RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT='0'

scripts/restore-database-backup-drill.sh \
  /absolute/path/foodsystems-TIMESTAMP.dump
```

Restore-scriptet nekter å berøre et navn som allerede finnes. Det oppretter bare
et validert `foodsystems_restore_*`-navn, gjenoppretter dumpen og kontrollerer
kjernetabeller, innhold (inkludert en ikke-tom `LibraryAnalysisRecord`),
constraints og indekser. For metadata v2 beregner det UUID, fullført ledgerhash,
alle ti tellinger og target-fingerprint på nytt i den gjenopprettede databasen;
alt må matche metadata eksakt.

`RESTORE_RECEIPT_PATH` er valgfri for en vanlig historisk drill, men streng når
den settes: banen må være absolutt, parent-katalogen må finnes og ikke være
gruppe-/verdensskrivbar, filen må ikke finnes, og backupen må være metadata v2.
Først etter vellykket restore og alle kontroller dropper scriptet den eksakte
disposable databasen, spør admin-databasen om navnet faktisk er borte, fjerner
privat connection-materiale og publiserer deretter en atomisk JSON-kvittering
med mode `0600`. Kvittering v1 inneholder dump-/metadatahash, primary UUID,
ledgerhash, fingerprint, tellinger, kontrollresultater og eksplisitt cleanup-
PASS, men ingen credentials. Feil, signal, fingerprint-avvik eller mislykket
drop/absence-kontroll etterlater ingen sluttkvittering.

De valgfrie `RESTORE_EXPECTED_*_COUNT`-verdiene beholdes som en ekstra operatør-
kontrakt og registreres i kvitteringen når de er satt. Metadata v2 er likevel
den autoritative eksakte tellebindingen. Hver manuelle verdi må være et ikke-
negativt heltall. `0` er gyldig, blant annet for `EvidenceAppraisal`; de
uavhengige ikke-tom-portene for `Document`, `SourceCitation` og
`LibraryAnalysisRecord` gjelder fortsatt.

### Hva som fortsatt er eksternt driftsansvar

Repoverktøyene konfigurerer ikke Coolify, objektlagring eller retention automatisk. Før produksjons-GO må eier dokumentere:

- automatisk backupfrekvens og retention
- kryptert, tilgangsstyrt off-node kopi
- overvåket alder på siste vellykkede backup
- kvartalsvis eller strengere restore-drill
- ansvarlig operatør og hendelsesløp
- RPO og RTO

En lokal verifisert dump er bare ett bevislag; den er ikke off-node backupstatus.

## 5. Koble MCP

Når migrasjon, drift, restore og rolle er grønne, sett den dedikerte URL-en som `DATABASE_URL` for `foodsystems-kb` og følg [`FOODSYSTEMS-KB-MCP.md`](FOODSYSTEMS-KB-MCP.md).

For lokal `stdio` skal hver utvikler bruke sin egen secret-konfigurasjon. Ikke commit connection string eller passord. Bekreft etterpå:

```bash
codex mcp list
npm run mcp:kb:test
```

Kjør også en funksjonell akseptansetest med `kb_status`, `kb_search` og `kb_trace_claim`; registrering/listing alene beviser ikke databasekoblingen.

Et generisk PostgreSQL-MCP kan brukes av en databaseoperatør til avgrenset diagnostikk, men skal bruke samme verifiserte read-only rolle og er ikke standardflaten for teamet.

## GO-sjekkliste

- [ ] Siste backup har metadata v2, gyldig dump-/metadata-SHA-256 og archive catalog.
- [ ] Restore-drill har en privat v1-kvittering med fingerprint- og cleanup-PASS.
- [ ] `prisma migrate status` er grønn.
- [ ] `apply-prod-migrations.sh` har tilgang til låst lokal Prisma CLI.
- [ ] Den historiske catch-up-baselinen er avstemt; fresh bootstrap brukes ikke.
- [ ] Image-entrypointens migrasjon og schema-/FTS-drift er grønn før appstart.
- [ ] Containerens `/api/data-status`-healthcheck er grønn.
- [ ] Schema-drift-porten er grønn; bare dokumentert FTS-avvik er tillatt.
- [ ] `verify-mcp-readonly-role.sh` er grønn mot MCP-login.
- [ ] MCP bruker ikke admin- eller applikasjonens skriverolle.
- [ ] Kunnskaps-MCPs egne kilde-/siterbarhetsporter er grønne.
- [ ] Off-node backup, retention, RPO/RTO og operatør er besluttet for produksjon.
