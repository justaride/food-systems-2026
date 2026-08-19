# Sikker recovery-epoke for autonome KI-kandidatroller

- **Dato:** 2026-08-19
- **Status:** Arkitekturvalg godkjent av Gabriel 2026-08-19; skriftlig spesifikasjon venter på eksplisitt godkjenning før implementeringsplan
- **Overordnet design:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`
- **Beslutning:** Bootstrap skal etablere en bevisbar, databaseavgrenset recovery-epoke ved å drenere andre klientforbindelser før kandidatgrants gjenopprettes. Konfigurasjonsparameterrettigheter skal være en eksplisitt del av rollekontrakten, og egne kandidattriggere skal være aktive i alle replication modes.
- **Autoritetsgrense:** Endringen beskytter bare teknisk kandidatproduksjon. Den gir ingen maskinell rett til human review, promotering, kanonisering, coverage eller publisering.

## 1. Bakgrunn

Det autonome kandidatlaget er implementert med to smale PostgreSQL-roller:

- `foodsystems_candidate_worker`, som kan lese godkjente analyseinputs og skrive et begrenset sett append-only kandidatposter,
- `foodsystems_candidate_reconciler`, som kan lese kandidatlaget og skrive append-only reconciliation snapshots.

Normal livssyklus er:

1. disable,
2. bootstrap av eksakte grants mens rollene er `NOLOGIN`,
3. eksplisitt enable med eksisterende dedikerte credentials,
4. separat worker- og reconciler-verifikasjon.

Tidligere hardening lukket feil målcluster, feil database, ufullstendig ACL-preflight, LOGIN-vinduer og flere katalogkappløp. To restfeil gjør likevel recovery-grensen ufullstendig.

### 1.1 En allerede antatt rolle er ikke synlig som effektiv rolle

`pg_stat_activity.usename` viser den autentiserte sesjonsbrukeren. `SET ROLE` kan samtidig gjøre en kandidatrolle til effektiv `current_user`. Hvis et gateway-login allerede har kjørt `SET ROLE foodsystems_candidate_worker`, kan disable:

- sette kandidatrollen `NOLOGIN`,
- tilbakekalle medlemskapet,
- tilbakekalle kandidatens `INSERT`,
- men ikke identifisere og terminere gateway-sesjonen som kandidat gjennom `pg_stat_activity`.

Det tilbakekalte medlemskapet gjelder for nye rolleantakelser, men nullstiller ikke en rolle som allerede er antatt i en eksisterende backend. Når bootstrap senere gjenoppretter kandidatgrants, får den skjulte sesjonen kandidatmyndighet tilbake.

### 1.2 Konfigurasjonsparameterrettigheter ligger utenfor dagens rollekontrakt

PostgreSQL lagrer eksplisitte `SET`- og `ALTER SYSTEM`-rettigheter i den cluster-felles katalogen `pg_parameter_acl`. En kandidatrolle med `SET` på `session_replication_role` kan velge `replica`. Da blir vanlige triggere og internt genererte foreign-key-triggere normalt ikke kjørt.

Det kan omgå:

- maskinpayload-validering,
- run-scope-validering,
- append-only historikktriggere,
- foreign keys og komposittbindinger.

Prisma-, Zod- og writer-validering er ikke tilstrekkelig mot direkte SQL dersom databasegrensen kan settes i replica mode.

## 2. Mål

Denne skiven skal:

- etablere et bevisbart tidspunkt der ingen eldre klientbackend kan beholde en allerede antatt kandidatrolle,
- gjøre grant-reparasjon trygg før kandidatrollene åpnes igjen,
- avvise uavklarte prepared transactions som kan overleve uten en aktiv backend,
- fjerne direkte parameter-ACL-er fra kandidatrollene,
- avvise globale parametergrants som kandidatrollene arver gjennom `PUBLIC`, uten å mutere andre applikasjoners globale rettigheter,
- tvinge kandidattilkoblinger til `session_replication_role = origin`,
- gjøre egne kandidatintegritetstriggere aktive i alle replication modes,
- bevare alle eksisterende kandidatposter eksakt,
- beholde KI-analyse åpen og autonom etter den eksplisitte recovery- og enable-kjeden,
- beholde human review, promotering og ekstern bruk som separate, senere porter.

## 3. Ikke-mål

Skiven skal ikke:

- introdusere automatisk human review eller promotering,
- gi worker eller reconciler nye tabellrettigheter,
- slette, oppdatere eller backfille eksisterende kandidatdata,
- rotere eller transportere credentials,
- forsøke å identifisere effektiv `current_role` utenfor den aktuelle backend-en,
- globalt tilbakekalle `PUBLIC`-rettigheter som kan tilhøre andre applikasjoner,
- flytte kandidatlaget til en separat database eller cluster,
- gjøre lokal test til bevis for CI, deploy, produksjonsmigrasjon eller runtime,
- gjennomføre en produksjonsmessig forbindelsesdrenering i denne implementeringsskiven.

## 4. Valgt arkitektur

Bootstrap blir en eksplisitt vedlikeholdsoperasjon som alltid etablerer en ny recovery-epoke før grants repareres.

Den bindende kommandoformen er:

```text
bootstrap-candidate-analysis-roles.sh --apply --confirm-database-session-drain
```

Bekreftelsen skal ikke være skjult eller forhåndsgodkjent i et generisk package-script. Operatøren skal kunne se at handlingen kobler fra andre klienter på måldatabasen.

Bootstrap gjennomfører fem faser:

1. lokal argument-, miljø- og URL-validering,
2. read-only databasepreflight,
3. autoritativ transaksjon, kataloglåser og gjentatt preflight,
4. databaseavgrenset klientdrenering og grant-/rolle-reparasjon mens rollene forblir `NOLOGIN`,
5. commit og eksplisitt rapport om at enable fortsatt gjenstår.

Ingen fase skal aktivere kandidatlogin.

## 5. Fase 1: lokal preflight

Før første databasekall skal bootstrap:

- kreve nøyaktig `--apply --confirm-database-session-drain`,
- avvise alle andre argumentkombinasjoner,
- kreve `DATABASE_ADMIN_URL`,
- bruke den eksisterende ambient-`PG*`-vakten,
- normalisere URL til privat `pgpass` uten å logge hemmeligheter,
- validere eksakte rolle-, schema- og application-navn,
- forklare i usage-teksten at alle andre client backends på måldatabasen termineres,
- forklare at operasjonen krever et planlagt vedlikeholdsvindu.

Manglende eksplisitt drain-bekreftelse skal feile før `psql` startes.

## 6. Fase 2: read-only databasepreflight

Databasepreflight skal fullføres før en sesjon termineres eller en katalog endres.

Den skal kreve:

- `session_user = current_user`,
- eksakt SUPERUSER-administrator,
- forventet måldatabase, schema og alle påkrevde relasjoner,
- kompatibel PUBLIC- og default-ACL-overflate,
- at eventuelle eksisterende kandidatroller er `NOLOGIN` og har eksakte, sikre attributter,
- at ingen medlemskap finnes inn i eller ut av kandidatrollene,
- at kandidatrollene ikke har effektiv `INSERT` på noen kandidat-, human-review-, promotion-, canonical- eller uvedkommende relasjon,
- at måldatabasen ikke har noen rad i `pg_prepared_xacts`.

Hvis disabled-state-precondition ikke holder, skal bootstrap feile uten drenering og instruere operatøren om å kjøre disable først. Hvis prepared transactions finnes, skal bootstrap feile med en egen melding og kreve separat operatøravklaring; den skal aldri committe eller rulle tilbake en prepared transaction på egen hånd.

Direkte parametergrants til kandidatrollene er reparerbar drift og kan derfor eksistere ved inngang. Effektive parametergrants gjennom `PUBLIC` er derimot en global inkompatibilitet og skal gi read-only fail før drenering.

## 7. Fase 3: autoritativ transaksjon og kataloglåser

Etter godkjent read-only preflight skal bootstrap starte én autoritativ transaksjon og holde `SHARE ROW EXCLUSIVE` på alle kataloger som kan endre kandidatkontrakten. Den eksisterende lock-listen utvides minst med:

- `pg_authid`,
- `pg_auth_members`,
- `pg_database`,
- `pg_namespace`,
- `pg_class`,
- `pg_attribute`,
- `pg_proc`,
- `pg_type`,
- `pg_default_acl`,
- `pg_db_role_setting`,
- `pg_shdepend`,
- `pg_parameter_acl`.

Den eksakte fullstendige preflighten skal kjøres på nytt under låsene før første terminering. Hvis LOGIN, medlemskap, prepared transactions, global parameter-ACL eller annen disabled-state-invariant har endret seg siden første preflight, skal transaksjonen avbrytes. Bootstrap skal ikke forsøke å reparere slik mellomliggende drift og fortsette i samme forsøk; operatøren må etablere disabled state og starte en ny drain-operasjon.

Låsene holdes gjennom drenering, grant-reparasjon og commit. Dermed kan ingen samtidig `ALTER ROLE`, `GRANT ROLE` eller `GRANT ... ON PARAMETER` etablere en ny kandidatrute mellom recovery-nullpunktet og grant-restaureringen.

## 8. Fase 4: databaseavgrenset klientdrenering og reparasjon

Under den kataloglåste transaksjonen skal bootstrap etablere recovery-epoken:

1. finn alle andre rader i `pg_stat_activity` for `current_database()` med `backend_type = 'client backend'`,
2. ekskluder bootstrapens egen admin-backend,
3. terminer hver backend med et eksplisitt, avgrenset timeout-kall,
4. kall `pg_stat_clear_snapshot()` etter termineringskallene,
5. avvis operasjonen dersom en tidligere valgt backend overlever,
6. avvis operasjonen dersom en prepared transaction nå finnes for måldatabasen.

Dreneringen er med vilje bredere enn kandidatens innloggingsnavn. Det er den eneste generelle måten å fjerne en gateway-backend som allerede har antatt kandidatrollen når PostgreSQLs aktivitetsvisning bare eksponerer session identity.

Nye ordinære forbindelser etter nullpunktet kan ikke etablere ny kandidatmyndighet fordi:

- kandidatrollene allerede er `NOLOGIN`,
- medlemskap inn i kandidatrollene allerede må være fraværende i committed state,
- grant-/membership-katalogene låses og revalideres før grants repareres,
- en ny `SET ROLE candidate` er derfor ikke tilgjengelig for et gateway-login.

En superuser kan alltid omgå vanlige rollegrenser og er eksplisitt en betrodd databaseadministrator, ikke en trussel denne kandidatrollen skal forsøke å kontrollere.

### 8.1 Driftskostnad

Alle andre klienter på samme database blir koblet fra. Applikasjoner med reconnect vil normalt koble seg opp igjen, men operasjonen kan gi kortvarige feil og må behandles som vedlikehold. Den påvirker ikke klienter som er koblet til andre databaser på samme cluster. Låsen på den delte `pg_parameter_acl`-katalogen kan likevel kort blokkere samtidige parameter-`GRANT`/`REVOKE`-operasjoner på clusternivå.

Hvis denne kostnaden senere blir uakseptabel, er den langsiktige løsningen en dedikert kandidatdatabase eller generasjonsroterte rolleidentiteter. Denne skiven skal ikke implementere en svakere, selektiv gateway-heuristikk.

### 8.2 Grant- og rollereparasjon

Etter at recovery-epoken er bevist, og fortsatt under de samme kataloglåsene, kan bootstrap:

- opprette manglende roller som `NOLOGIN`,
- normalisere sikre rolleattributter,
- gjenta idempotent fjerning av alle medlemskap i begge retninger uten å akseptere medlemskap som oppstod etter den låste preflighten,
- fjerne direkte database-, schema-, table-, column-, sequence-, routine-, type- og parametergrants,
- gjenopprette bare de eksisterende worker-/reconciler-allowlistene,
- skrive den eksakte rolleinnstillingslisten,
- bevare begge roller `NOLOGIN` ved commit.

Bootstrap skal aldri opprette, endre eller logge passord.

## 9. Parameter-ACL-kontrakt

### 9.1 Direkte grants

For hver rad i `pg_parameter_acl` skal bootstrap tilbakekalle både `SET` og `ALTER SYSTEM` direkte fra worker og reconciler. Etter reparasjon skal kandidatrollene ikke være navngitte grantees i noen parameter-ACL.

### 9.2 PUBLIC og andre effektive stier

`PUBLIC` omfatter alle roller. Et eksplisitt `PUBLIC`-grant på en konfigurasjonsparameter skal derfor gjøre kandidatkontrakten inkompatibel.

Bootstrap, enable og verify skal:

- oppdage `PUBLIC` `SET` eller `ALTER SYSTEM` i `pg_parameter_acl`,
- feile før LOGIN,
- ikke tilbakekalle den globale retten automatisk,
- gi en tydelig beskjed om at separat, autorisert cluster-hardening kreves.

Medlemskap er ikke en tillatt parameterrettighetssti fordi kandidatrollene skal ha null medlemskap i begge retninger.

### 9.3 Eksakt runtime-verdi

Bootstrap skal sette den globale rolleinnstillingen:

```text
session_replication_role=origin
```

på begge kandidatroller. Database-spesifikke rolleinnstillinger forblir forbudt. Enable skal kreve innstillingen i den kataloglåste expected-settings-kontrakten, og dedikert verify skal kreve at den aktive sesjonen faktisk rapporterer `origin`.

Dette gir to uavhengige lag:

1. kandidaten mangler rett til å endre den beskyttede parameteren,
2. kandidatens innloggingsdefault er eksplisitt `origin`.

## 10. Triggerforsvar

Alle egne integritetstriggere i kandidatmigrasjonen skal endres til `ENABLE ALWAYS` etter opprettelse. Det gjelder minst triggere som utfører:

- invalid machine payload-avvisning,
- run-scope-avvisning,
- update/delete-avvisning,
- truncate-avvisning.

Akseptansetesten skal lese `pg_trigger.tgenabled` og kreve `A` for hele den navngitte kandidattriggerlisten.

Dette er defense in depth, ikke erstatning for parameter-ACL-kontrakten. PostgreSQLs internt genererte foreign-key-triggere skal ikke omskrives eller globalt settes `ALWAYS` i denne skiven. Derfor må kandidatrollen fortsatt være ute av stand til å velge replica mode.

## 11. Enable og verify

Den eksisterende målbindings- og no-window-designen beholdes.

Enable skal i tillegg:

- låse `pg_parameter_acl` sammen med de øvrige autoritetskatalogene,
- kreve null direkte eller effektiv parameter-ACL for begge kandidatroller,
- kreve eksakt `session_replication_role=origin` i rolleinnstillingene,
- revalidere hele kontrakten før begge LOGIN-attributtene settes atomisk,
- beholde fail-safe disable ved enhver senere verifier-feil.

Verify skal i den dedikerte worker-/reconciler-sesjonen:

- bekrefte `session_user = current_user = expected exact role`,
- bekrefte `current_setting('session_replication_role') = 'origin'`,
- bekrefte at rollen ikke har effektiv `SET` eller `ALTER SYSTEM` via eksplisitte rader i `pg_parameter_acl`,
- beholde alle eksisterende tabell-, routine-, setting-, identity- og målbindingskontroller.

## 12. Feilsemantikk

Operasjonen skal være fail-closed og skille mellom tre feilklasser:

1. **Før drenering:** Ingen backend eller databaseobjekt er endret.
2. **Under drenering:** Noen klienter kan allerede være terminert, men kandidatgrants skal ikke være gjenopprettet og rollene skal forbli `NOLOGIN`.
3. **Under katalogreparasjon:** Transaksjonen rulles tilbake; termineringene kan ikke rulles tilbake, men kandidatdata skal være uendret og kandidatrollene skal fortsatt være i den tidligere committed disabled-state.

Scriptet skal aldri påstå full rollback av terminerte klientforbindelser. Sluttrapporten skal si eksplisitt om recovery-epoken ble etablert, om grants ble reparert, og at enable fortsatt gjenstår.

## 13. Datainvarianter

Følgende skal holde før og etter bootstrap, enable, verify og alle feilbaner:

- eksisterende rader og eksakt JSON-innhold i alle 11 kandidattabeller er uendret,
- ingen update, delete, truncate eller backfill er utført,
- worker har bare de eksisterende syv append-only INSERT-flater,
- reconciler har bare `CandidateReconciliationSnapshot` INSERT,
- ingen kandidatrolle har INSERT på `CandidateHumanReviewDecision` eller `CandidatePromotionDecision`,
- ingen kandidatrolle får canonical-, coverage- eller publication-myndighet,
- ingen credentialverdi logges eller legges i SQL-tekst,
- kandidatresultater forblir maskinelle kandidater uansett teknisk driftsstatus.

## 14. Teststrategi

Implementeringen skal følge RED-GREEN-refaktorering mot disponibel PostgreSQL 16.

### 14.1 Recovery-epoke

En regresjon skal:

1. opprette et gateway-login med kandidatmedlemskap,
2. koble gatewayen til måldatabasen,
3. kjøre `SET ROLE` til worker,
4. kjøre disable slik at membership og INSERT forsvinner mens gateway-backenden fortsatt lever,
5. holde en kandidattransaksjon åpen,
6. kjøre bootstrap med eksplisitt drain-bekreftelse,
7. bevise at gateway-backenden termineres,
8. bevise at den åpne transaksjonen ikke committes,
9. bevise eksakte rows og counts for alle 11 kandidattabeller,
10. bevise at bootstrap ender `NOLOGIN` med reparerte grants,
11. bevise at clean enable og begge dedikerte verifikasjoner fortsatt lykkes.

Separate tester skal bevise:

- manglende drain-bekreftelse stopper før `psql`,
- en unrelated klient på samme database blir terminert,
- en klient på en annen database i samme cluster ikke termineres,
- en survivor/timeout gir feil uten grant-restaurering,
- en prepared transaction på måldatabasen gir read-only avvisning,
- clean first bootstrap fungerer gjennom samme eksplisitte vedlikeholdsgrense.

### 14.2 Parameterrettigheter

En RED-regresjon skal gi worker `SET ON PARAMETER session_replication_role`, koble til som worker, velge `replica` og demonstrere at minst én ordinary kandidattrigger eller FK ellers kan omgås i en transaksjon som rulles tilbake.

GREEN skal bevise:

- bootstrap fjerner direkte grant,
- worker ikke kan sette replica mode,
- enable og verify avviser gjeninnført drift,
- `PUBLIC`-grant gir fail-closed uten global tilbakekalling,
- concurrent `GRANT SET ON PARAMETER` ikke kan passere den kataloglåste enable-grensen,
- kandidattriggerne er `ENABLE ALWAYS` og avviser egne integritetsbrudd selv under en kontrollert admin-probe i replica mode,
- foreign-key-beskyttelsen fortsatt behandles som avhengig av parametergrensen.

### 14.3 Regresjonsmatrise

Minst disse eksisterende bevisene skal fortsatt være grønne:

- hele role-contract-suiten mot disponibel PostgreSQL,
- kandidatkontraktmatrisen,
- schema-/migrasjonstestene,
- writer- og scope/hash-testene,
- processing-kontraktene,
- Prisma generate og validate,
- shell- og Node-syntaks,
- ESLint og TypeScript,
- production build,
- `git diff --check`.

Full `npm test` skal kjøres én gang og rapporteres ærlig mot den kjente beskyttede baselinen. Denne skiven skal ikke endre beskyttede corpus-hasher eller runtime-attestation-forventninger for å gjøre baselinen grønn.

## 15. Operasjonell rapportering

Rapporten skal skille mellom:

- lokal disponibel databaseverifikasjon,
- CI,
- migrasjon,
- deploy,
- runtime-identitet,
- faktisk autonom analysekjøring,
- human review,
- promotering og ekstern readiness.

En grønn recovery-test betyr bare at den tekniske kandidatrollen kan gjenopprettes sikkert. Den betyr ikke at en produksjonsdatabase er drenert, at migrasjonen er kjørt, at workers er startet, at mennesker har reviewet materialet, eller at noe er publiseringsklart.

## 16. Alternativer som ikke velges nå

### 16.1 Selektiv gateway-terminering

Å terminere sessions for nåværende eller tidligere medlemsroller er ikke tilstrekkelig. Hvis medlemskapet allerede er tilbakekalt, finnes ikke lenger katalogproveniens som peker fra gatewayen til den allerede antatte kandidaten. En heuristikk ville bevare den opprinnelige feilen.

### 16.2 Triggeridentitetsvakt alene

En `session_user = current_user`-vakt på INSERT kunne stoppet den demonstrerte skriveruten, men ikke kandidatens SELECT-myndighet og ikke alle fremtidige myndighetsflater. Den er derfor ikke en full erstatning for å fjerne den skjulte backend-en.

### 16.3 Roterte roller og credentials

En ny rolleidentitet for hver recovery kan gjøre gamle backends maktesløse uten databaseomfattende drain. Det krever samtidig credentialrotasjon, URL-distribusjon, secret lifecycle og mer omfattende operasjonell koordinering. Det er ikke valgt for denne skiven.

### 16.4 Dedikert kandidatdatabase

En separat database eller cluster gir den reneste langsiktige isolasjonen og gjør en full drain mindre forstyrrende. Den krever samtidig en ny input-/replikeringsgrense fordi kandidaten i dag leser eksisterende `Document`, `SourceDoc` og `LibraryAnalysisRecord`. Dette behandles som en mulig senere arkitekturskive.

## 17. Implementeringsgrense

Etter at denne skriftlige spesifikasjonen er godkjent, skal en egen implementeringsplan dele arbeidet i små, testdrevne oppgaver med review mellom autoritetsbærende endringer.

Implementering lokalt autoriserer ikke:

- produksjonsdatabasebruk,
- faktisk forbindelsesdrenering utenfor disponibel testdatabase,
- credentialendring,
- push, merge eller deploy,
- oppstart av en levende autonom worker,
- human review, promotering eller publisering.

## 18. Referanser

- [PostgreSQL 16: System Information Functions and Operators](https://www.postgresql.org/docs/16/functions-info.html) — forskjellen mellom `session_user`, `current_user` og effektive roller.
- [PostgreSQL 16: The Cumulative Statistics System](https://www.postgresql.org/docs/16/monitoring-stats.html) — feltene som faktisk eksponeres i `pg_stat_activity`.
- [PostgreSQL 16: Client Connection Defaults](https://www.postgresql.org/docs/16/runtime-config-client.html) — `session_replication_role`, triggeroppførsel og foreign-key-konsekvens.
- [PostgreSQL 16: `pg_parameter_acl`](https://www.postgresql.org/docs/16/catalog-pg-parameter-acl.html) — parameter-ACL-katalogen og dens cluster-felles omfang.
- [PostgreSQL 16: Privileges](https://www.postgresql.org/docs/16/ddl-priv.html) — `SET` og `ALTER SYSTEM` på konfigurasjonsparametere.
- [PostgreSQL 16: ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html) — `ENABLE ALWAYS TRIGGER` og replication-role-semantikk.
- `.superpowers/sdd/2026-08-18-autonomous-ai-candidate-residual-hardening/progress.md` — lokal reviewhistorikk, siste NO-GO og de to åpne Important-funnene som denne designen lukker.
