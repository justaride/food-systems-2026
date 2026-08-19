# Semantisk attestasjon for autonome KI-kandidatskribenter

- **Dato:** 2026-08-19
- **Status:** Arkitektur godkjent av Gabriel 2026-08-19; skriftlig spesifikasjon venter eksplisitt review
- **Overordnet design:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`
- **Forrige hardening:** `docs/superpowers/specs/2026-08-19-autonomous-ai-candidate-recovery-quiescence-design.md`
- **Beslutning:** TypeScript og PostgreSQL skal dele én eksplisitt kandidat-JSON-kontrakt, og recovery skal attestere den eksakte databasekoden som får skrive kandidatdata og håndheve append-only historikk.
- **Autoritetsgrense:** Endringen beskytter bare teknisk kandidatproduksjon. Den gir ingen maskinell rett til human review, promotering, kanonisering, coverage, ekstern bruk eller publisering.

## 1. Bakgrunn

Det autonome kandidatlaget er nå avgrenset av to databaseeide writer-funksjoner:

- `public.candidate_worker_append(text, jsonb)`,
- `public.candidate_reconciler_append(jsonb)`.

Kandidatrollene har ikke direkte `INSERT` på tabeller. De får bare `EXECUTE` på sin respektive writer-funksjon, og writer-funksjonene håndhever kandidatkontrakt, hashbindinger, append-only historikk og terminalmanifest i samme transaksjon.

Recovery-løpet attesterer samtidig 27 navngitte, egne PostgreSQL-triggere og krever at de står som `ENABLE ALWAYS`.

Siste avgrensede review fant to gjenværende sikkerhetsfeil. Begge er load-bearing og gjør grenen uegnet for merge eller rolleaktivering før en ny syklus er gjennomført.

### 1.1 JSON-kontrakten er ikke identisk i TypeScript og PostgreSQL

Den offentlige TypeScript-kontrakten tillater JSON `null` både som run-konfigurasjon og reconciliation-scope. PostgreSQL-funksjonene fyller derimot payloaden inn i en typed record med `jsonb_populate_record`. JSON `null` blir da SQL `NULL`.

Den strikte SQL-hashfunksjonen returnerer SQL `NULL` for dette inputet. Resultatet er at kontraktgyldige kall blir avvist, og at JSON `null` ikke kan lagres som den JSONB-verdien kontrakten lover.

Objektnøkler sorteres også forskjellig:

- TypeScript bruker i dag standard JavaScript-sortering etter UTF-16 code units.
- PostgreSQL bruker `COLLATE "C"`, som for UTF-8-databasen gir byteorientert orden.

Nøklene `😀` og `U+E000` er et konkret moteksempel: JavaScript legger `😀` først, mens UTF-8-byteorden legger `U+E000` først. Samme semantiske input kan derfor få forskjellig hash i de to lagene.

JavaScript-strenger kan i tillegg inneholde NUL eller uparede UTF-16-surrogater som PostgreSQL JSONB ikke kan representere. Uten en eksplisitt felles verdi-domene kan ett lag akseptere data som det andre laget aldri kan lagre eller hashe identisk.

### 1.2 Recovery attesterer navn, ikke den eksakte sikkerhetskoden

Dagens triggerkontroll binder bare:

- tabellnavn,
- triggernavn,
- `tgenabled = 'A'`,
- fravær av uventede custom triggere på de aktuelle tabellene.

Den binder ikke:

- `tgfoid`,
- `tgtype`,
- normalisert triggerdefinisjon,
- eier eller body for funksjonen triggeren peker på.

En trigger med riktig navn og `ENABLE ALWAYS` kan derfor peke på en no-op-funksjon og fortsatt passere. `CREATE OR REPLACE FUNCTION` kan også endre en referert funksjons body uten at funksjons-OID eller triggernavn endres.

Writer-rutinene attesteres bare med signatur, `SECURITY DEFINER`, `search_path` og effektiv `EXECUTE`. Samme signatur kan erstattes med annen kode eller annen eier uten at pre-login-kontrollen nødvendigvis oppdager det.

## 2. Mål

Denne skiven skal:

- gjøre kandidat-JSON og alle kandidat-hasher identiske i TypeScript og PostgreSQL,
- bevare JSON `null` som JSONB `null` gjennom begge audited writer-rutinene,
- avvise JavaScript-strenger og objektnøkler som PostgreSQL JSONB ikke kan representere eksakt,
- definere én eksplisitt og versjonert nøkkelorden for objektkanonisering,
- attestere eksakt ABI, eier, sikkerhetsattributter og body for de to writer-rutinene,
- attestere alle transitive, sikkerhetskritiske hjelpefunksjoner,
- attestere eksakt semantisk identitet for alle 27 egne kandidattriggere,
- gjøre bootstrap, enable og verify fail-closed ved enhver manifestdrift,
- bevare alle kandidatrader og kandidatmyndighetsgrenser eksakt,
- bevise grensene med faktiske worker-/reconciler-roller i disponibel PostgreSQL 16.

## 3. Ikke-mål

Skiven skal ikke:

- gi KI-prosesser human-review-, promotion-, canonical-, coverage- eller publication-myndighet,
- gi kandidatrollene direkte tabell-`INSERT`,
- reparere driftet databasekode automatisk i rolle-skriptene,
- oppdatere, slette, truncate eller backfille kandidatdata,
- legge til en kompenserende produksjonsmigrasjon for det ureleasete kandidatfundamentet,
- rotere eller transportere credentials,
- aktivere en levende autonom worker,
- bruke produksjonsdatabase,
- endre beskyttede corpus-hasher eller runtime-attestation-forventninger for å skjule kjent full-suite-baseline,
- behandle lokal test som bevis for CI, deploy, produksjonsmigrasjon eller faktisk runtime.

## 4. Valgt arkitektur

Løsningen består av to uavhengige, men sammenkoblede kontrakter:

1. **Candidate Canonical JSON v1** definerer hvilke JSON-verdier kandidatlaget kan motta, hvordan de kanoniseres og hvordan de hashes.
2. **Candidate Security Graph v1** beskriver den eksakte PostgreSQL-koden og triggergrafen som har kandidat-skrivemyndighet eller beskytter kandidathistorikken.

Begge kontrakter er forankret utenfor den databasen de attesterer:

- JSON-kontrakten ligger i TypeScript-kode, SQL-kode og krysslagstester.
- Sikkerhetsgrafens forventede SHA-256 ligger i et tracket, ikke-hemmelig repo-manifest som rolle-skriptene leser før databasemutasjon.

Databasens egen kontrollfunksjon kan derfor ikke alene erklære sin nåværende tilstand som gyldig. Rolle-skriptene skal først attestere kontrollfunksjonen mot et separat repo-forankret fingeravtrykk og deretter bruke den til å attestere resten av grafen.

## 5. Candidate Canonical JSON v1

### 5.1 Verdidomene

En kandidat-JSON-verdi kan være:

- JSON `null`,
- boolsk verdi,
- et endelig JavaScript-tall,
- en gyldig Unicode-scalarstreng,
- en array av kandidat-JSON-verdier,
- et objekt med gyldige Unicode-scalarnøkler og kandidat-JSON-verdier.

Strenger og nøkler skal avvises dersom de inneholder:

- `U+0000`, som PostgreSQL `text`/JSONB ikke kan lagre,
- en uparret UTF-16 high eller low surrogate.

Kontrakten normaliserer ikke Unicode. To forskjellige sekvenser som ser like ut, for eksempel prekomponert og dekomponert tekst, forblir forskjellige byteverdier og får forskjellige hasher.

### 5.2 Tall

TypeScript beholder kravet om endelige `number`-verdier. SQL beholder kontrollen som krever at JSON-tallet kan roundtrippe eksakt gjennom PostgreSQL `double precision` til samme JavaScript-verdi.

Kanonisk talltekst skal fortsatt følge JavaScripts `JSON.stringify`-semantikk, inkludert:

- `-0` som `0`,
- fast desimalform i JavaScripts faste intervall,
- normalisert eksponentform uten overflødige nuller,
- avvisning av overflow, underflow eller presisjonstap.

### 5.3 Objektorden

Objektnøkler sorteres stigende etter deres eksakte UTF-8-bytes.

TypeScript skal bruke en eksplisitt bytekomparator, ikke `Array.prototype.sort()` uten comparator og ikke locale-sortering. PostgreSQL skal bruke den tilsvarende byteordenen i UTF-8-databasen.

Denne regelen velges fordi den er:

- eksplisitt på tvers av runtime,
- uavhengig av locale,
- enkel å reprodusere i Node.js og PostgreSQL,
- entydig etter at ugyldige surrogate-sekvenser er avvist.

### 5.4 Scalars, arrays og escaping

- JSON `null` kanoniseres til `null`.
- Boolsk verdi kanoniseres til `true` eller `false`.
- Strenger og objektnøkler bruker den samme JSON-escapingsemantikken som `JSON.stringify` for representerbare Unicode-scalarstrenger.
- Arrays beholder elementrekkefølgen.
- Objekter serialiseres uten whitespace etter UTF-8-nøkkelorden.

### 5.5 SQL-null og JSON-null

Writer-funksjonene skal aldri lese kontraktens JSON-nullable `config` eller `scope` fra et typed record-felt når forskjellen mellom SQL `NULL` og JSONB `null` er relevant.

I stedet skal de:

- validere at nøkkelen finnes i den eksakte payload-formen,
- hashe `write_payload -> 'config'` eller `write_payload -> 'scope'` direkte,
- lagre den samme JSONB-verdien direkte,
- bruke typed record bare for felter der SQL-nullsemantikken samsvarer med kontrakten.

Dette bevarer JSONB `null` gjennom validering, hashing og INSERT.

### 5.6 Hashversjon og eksisterende data

Eksisterende hashdomener beholder `/v1` fordi kandidatfundamentet er ureleaset og denne skiven korrigerer v1-definisjonen før release.

Det innebærer:

- ingen automatisk omskriving eller backfill av eksisterende kandidatposter,
- ingen bruk av denne in-place-migrasjonen på en database som allerede behandles som produksjonsautoritativ uten en separat, senere migrasjonsbeslutning,
- disponibel testdatabase bygges alltid fra den korrigerte fundamentmigrasjonen,
- eventuelle ikke-produksjonelle, eldre kandidatfixtures regenereres fra kontrakten, ikke håndredigeres for å matche en ønsket hash.

Kostnaden er at hasher for objekter med den dokumenterte UTF-16/UTF-8-ordensforskjellen endres før release. Alternativet ville vært å bevare en implisitt, runtime-spesifikk feil i den offentlige kontrakten.

## 6. Candidate Security Graph v1

### 6.1 Ekstern manifestforankring

Repoet skal inneholde ett strengt formatert, ikke-hemmelig manifest med minst:

- manifestversjon,
- støttet PostgreSQL-majorversjon (`16`),
- forventet descriptor-hash for databasekontrollfunksjonen,
- forventet hash for hele sikkerhetsgrafen.

Rolle-skriptene skal:

1. lese manifestet eksakt én gang før databaseendring,
2. avvise manglende, ekstra eller ugyldige felt,
3. avvise ugyldig hashformat eller feil PostgreSQL-majorversjon,
4. sende bare de validerte, ikke-hemmelige verdiene til SQL,
5. attestere kontrollfunksjonens descriptor før kontrollfunksjonens resultat stoles på.

Manifestet er en kildekodeartefakt. Endring av databasekoden krever derfor en synlig manifestendring, mutation-test og review i samme commit.

### 6.2 Eieranker

Den portable, men eksakte eieridentiteten er eieren av den attesterte måldatabasen (`pg_database.datdba` for `current_database()`). Manifestet binder policyen `database_owner`; det hardkoder ikke et miljøspesifikt rollenavn.

Kontrollen skal kreve at:

- alle 11 kandidattabeller eies av den aktuelle databaseeieren,
- alle sikkerhetskritiske kandidatfunksjoner eies av den samme databaseeieren,
- ankeret ikke er worker eller reconciler,
- ingen kandidatrolle har ownership dependency på kandidatobjektene.

Fundamentmigrasjonen skal derfor kjøres av databaseeieren eller eksplisitt ende med samme eier på alle disse objektene. En samlet flytting av tabell og funksjoner til en annen rolle passerer ikke så lenge databaseeieren er uendret. Dette binder eksakt eierrelasjon uten å hardkode et miljøspesifikt superuser-navn.

### 6.3 Sikkerhetskritiske rutiner

Grafen skal minst omfatte:

- `candidate_json_number_to_javascript(jsonb)`,
- `candidate_canonical_json(jsonb)`,
- `candidate_writer_hash(text, jsonb)`,
- `candidate_json_keys_equal(jsonb, text[])`,
- `candidate_json_integer(jsonb)`,
- `candidate_json_nonempty_text_array(jsonb)`,
- `candidate_writer_assert_open(text)`,
- `candidate_stored_output_manifest(text)`,
- `candidate_worker_append(text, jsonb)`,
- `candidate_reconciler_append(jsonb)`,
- `reject_candidate_history_change()`,
- `reject_invalid_candidate_run_scope()`,
- `reject_invalid_candidate_machine_payload()`,
- other-database-isolasjonskontrollen,
- sikkerhetsgrafens egen kontrollfunksjon, som attesteres separat fra grafhashen.

Hvis implementeringen avdekker en annen funksjon som kan påvirke writer-, hash-, scope-, payload-, append-only- eller recovery-semantikk, skal den inn i grafen. Listen skal ikke begrenses for å få en eksisterende test grønn.

### 6.4 Rutinedescriptor

Hver rutinedescriptor skal binde minst:

- schema og funksjonsnavn,
- identity arguments og argumentmodus,
- returtype og set-returning-status,
- `prokind`, språk og binary/source-identitet,
- body (`prosrc` og relevante SQL-body-felt),
- eierrelasjon til eierankeret,
- `SECURITY DEFINER`/`SECURITY INVOKER`,
- `STRICT`, leakproof, volatilitet og parallel safety,
- sortert `proconfig`, inkludert eksakt `search_path`,
- null effektiv `PUBLIC EXECUTE`.

De to top-level writer-rutinene skal i tillegg ha eksakt state-avhengig ACL:

- worker kan bare kjøre worker-rutinen,
- reconciler kan bare kjøre reconciler-rutinen,
- kandidatrollene kan ikke kjøre andre rutiner i grafen,
- disabled-state har ingen effektiv kandidat-`EXECUTE`,
- enabled-state har bare den ene tillatte funksjonen per rolle.

Body- og attributtdata bygges til en entydig descriptor og hashes med SHA-256 uten å kalle kandidatens egen canonical-JSON-funksjon. Attestasjonen skal dermed fortsatt oppdage drift dersom nettopp canonical-funksjonen er endret.

### 6.5 Triggerdescriptor

Hver av de 27 forventede custom-triggerne skal binde:

- eksakt schema og tabell,
- eksakt triggernavn,
- `tgisinternal = false`,
- `tgenabled = 'A'`,
- eksakt `tgtype`,
- funksjonsidentiteten som `tgfoid` peker på,
- deferrable-/initially-deferred-attributter,
- argumenter, kolonnebinding og eventuell `WHEN`-kvalifikasjon,
- normalisert `pg_get_triggerdef` for PostgreSQL 16.

PostgreSQL-genererte foreign-key-triggere forblir utenfor 27-listen og skal ikke omskrives. Parameter-ACL- og `session_replication_role=origin`-grensen forblir derfor nødvendig.

Alle uventede custom triggere på kandidat-tabellene skal fortsatt gi driftfeil.

### 6.6 Kontrollfunksjonens tillitsgrense

Databasekontrollfunksjonen skal returnere en stabil, maskinlesbar driftkode eller `NULL` ved eksakt samsvar.

Før den kalles skal bootstrap, enable og verify beregne dens faktiske rutinedescriptor og sammenligne den med manifestets eksterne checker-hash. Hvis checker-hashen avviker, skal operasjonen stoppe uten å stole på funksjonens body eller returverdi.

Kontrollfunksjonen sammenligner deretter faktisk sikkerhetsgraf med manifestets forventede graph-hash og utfører strukturelle checks som gir en presis feilklasse, for eksempel:

- `candidate_security_checker_drift`,
- `candidate_security_owner_drift`,
- `candidate_writer_abi_drift`,
- `candidate_trigger_identity_drift`,
- `candidate_trigger_function_drift`,
- `candidate_security_graph_hash_mismatch`.

Ingen av disse feilene gir automatisk DDL-reparasjon.

## 7. Recovery- og aktiveringsflyt

### 7.1 Bootstrap

Bootstrap beholder disable→bootstrap- og database-drain-kontrakten.

Den skal:

- validere repo-manifestet før `psql`,
- attestere checker og sikkerhetsgraf i read-only preflight,
- gjenta samme attestasjon i den autoritative transaksjonen,
- holde `pg_proc` og `pg_trigger` sammen med dagens kataloglåser gjennom grant-reparasjonen,
- stoppe fail-closed uten kode- eller datareparasjon ved drift,
- ende med begge kandidatroller som `NOLOGIN`.

### 7.2 Enable

Enable skal attestere checker, graf, rutine-ACL-er og triggersemantikk inne i den eksisterende kataloglåste transaksjonen før begge roller settes `LOGIN` atomisk.

Enhver mismatch før LOGIN gir rollback. En mismatch etter LOGIN i den dedikerte verifikasjonen går gjennom den eksisterende target-bound, bounded fail-safe disable.

### 7.3 Verify

Worker- og reconciler-verifikasjonene skal:

- binde seg til eksisterende cluster/database/endpoint-identitet,
- attestere checker og graph-hash,
- attestere eksakt writer-ABI, eier og `PUBLIC`-grense,
- attestere alle 27 triggerdescriptorene og refererte funksjoner,
- beholde dagens negative table-, routine-, setting- og identity-prober.

Verify utfører ingen reparasjon.

## 8. Feilsemantikk

Følgende gjelder ved drift:

1. **Før bootstrap-drain:** Ingen backend, grant, rolle eller kandidatrad er endret.
2. **Etter drain, før grant-reparasjon:** Drenerte forbindelser kan ikke gjenopprettes, men kandidatrollene forblir `NOLOGIN` uten writer-`EXECUTE`.
3. **Under enable:** Katalogtransaksjonen rulles tilbake og rollene forblir `NOLOGIN`.
4. **Under dedikert verify:** Fail-safe disable skal forsøke target-bound NOLOGIN, EXECUTE-revoke og session termination etter dagens bounded kontrakt.

Feilmeldingen skal skille sikkerhetsdrift fra vanlig credential-, target- eller role-contract-feil. Operatørinstruksen er:

1. hold rollene disabled,
2. inspiser manifest- og katalogdifferansen,
3. reparer gjennom en eksplisitt migrasjon eller kontrollert schemaoperasjon,
4. kjør disable → bootstrap → enable på nytt.

## 9. Teststrategi

Implementeringen skal følge witnessed RED → minimal GREEN → fokusert regresjon mot Node.js 24 og disponibel PostgreSQL 16.

### 9.1 JSON-paritet

En felles testmatrise skal minst inneholde:

- JSON `null` som run `config`,
- JSON `null` som reconciliation `scope`,
- tomt objekt og tom array,
- nested objects/arrays med nullverdier,
- kontrolltegn som er representerbare,
- sitat og backslash,
- BMP-nøkkelen `U+E000` sammen med astralnøkkelen `😀`,
- andre Unicode-nøkler rundt surrogate- og byteordensgrenser,
- JavaScript-tall ved faste/exponentielle terskler,
- avvisning av NUL og uparede surrogater i nøkler og verdier.

Testene skal bevise:

- identisk canonical tekst og SHA-256 i TypeScript og PostgreSQL,
- at faktisk worker kan opprette en run med `config: null`,
- at faktisk reconciler kan appendere `scope: null`,
- at lagret JSONB er JSON `null`, ikke SQL `NULL`,
- at alle 11 kandidat-tabellsnapshots er uendret ved negative kall.

### 9.2 Writer-rutinedrift

Separate mutation-prober skal endre én egenskap om gangen:

- samme signatur, endret body,
- feil eier,
- `SECURITY INVOKER` i stedet for `SECURITY DEFINER`,
- endret `search_path`,
- `PUBLIC EXECUTE`,
- feil argument- eller returtype,
- drift i en transitiv hash- eller writer-hjelpefunksjon.

Bootstrap og enable skal avvise hver mutasjon før LOGIN. Dedikert verify skal oppdage drift som introduseres etter aktivering og utløse fail-safe disable.

### 9.3 Triggerdrift

Minst disse faktiske PostgreSQL-mutasjonene skal få egen regresjon:

- dropp og gjenopprett forventet trigger med samme navn og `ALWAYS`, men pek den til en no-op-funksjon,
- gjenopprett samme trigger med feil event/timing slik at `tgtype` avviker,
- `CREATE OR REPLACE` den forventede triggerfunksjonen til no-op slik at OID forblir den samme,
- endre triggerfunksjonens eier,
- opprett en ekstra custom trigger på en kandidat-tabell.

Kontrolltesten skal bevise eksakt 27 forventede custom triggere, riktige funksjoner, riktige descriptors og urørte PostgreSQL-genererte FK-triggere.

### 9.4 Manifestintegritet

Mutation pressure skal bevise at:

- endret checker-body med uendret graph-hash avvises,
- endret graph-hashformat eller manifestversjon avvises før `psql`,
- manglende eller ekstra manifestfelt avvises,
- faktisk migrasjon og repo-manifest er synkronisert,
- testene ikke genererer eller godkjenner en ny forventet hash fra den driftede databasen i samme kontrollbane.

### 9.5 Regresjonsmatrise

Minst disse portene skal fortsatt kjøres:

- kandidatkontrakt og writer-suite,
- schema/migrasjon mot disponibel PostgreSQL,
- full role/recovery-suite,
- snapshot- og legacy-kompatibilitet,
- processing-kontraktene,
- durable autonomous-analysis-kontrakt,
- Prisma generate og validate,
- shell- og Node-syntaks,
- berørt ESLint,
- `tsc --noEmit`,
- production build,
- `git diff --check`.

Full `npm test` skal kjøres høyst én ny gang i implementeringssyklusen, omdirigert til hashbundet logg. Resultatet rapporteres ærlig mot den kjente beskyttede 19-feilsfamilien. Ingen protected hash eller attestation-forventning endres for å produsere grønt resultat.

## 10. Varig kontrakt og operatørtekst

`knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` skal oppdateres slik at den eksplisitt sier:

- candidate writer-funksjonene er den eneste runtime-skrivegrensen,
- JSON- og hashkontrakten er identisk i TypeScript og SQL,
- recovery attesterer kode og triggersemantikk, ikke bare navn,
- manifestdrift krever schema-/migrasjonsreparasjon mens rollene holdes disabled,
- bootstrap eller enable reparerer aldri driftet funksjonsbody eller triggerdefinisjon automatisk,
- teknisk grønn kandidatproduksjon gir fortsatt ingen menneskelig eller ekstern autoritet.

Kontraktstesten skal ha mutation pressure som gjør hver setning load-bearing uten å være avhengig av skjør linjeformattering.

## 11. Filkart

Forventet implementeringsflate er:

- `src/lib/knowledge/candidate-analysis-contract.ts` — felles JSON-domene og UTF-8-kanonisering,
- `src/lib/knowledge/candidate-analysis-writer.ts` — bare dersom public typing eller kallgrense må presiseres; ingen ny write authority,
- `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` — nullbevaring, SQL-kanonisering, graph/checker-descriptor og semantisk driftkontroll,
- nytt, ikke-hemmelig sikkerhetsmanifest under `scripts/`,
- `scripts/bootstrap-candidate-analysis-roles.sh`,
- `scripts/enable-candidate-analysis-logins.sh`,
- `scripts/verify-candidate-analysis-roles.sh`,
- relevante candidate contract/schema/writer/role-tester,
- `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md`,
- `tests/lib/autonomous-analysis-contract.test.ts`.

Detaljert implementeringsplan skal redusere denne flaten dersom undersøkelsen viser at en fil ikke trenger endring. Den skal ikke utvide flaten uten en ny, eksplisitt begrunnelse.

## 12. Evidens og rapportering

Rapporten skal skille mellom:

- lokal type- og hashparitet,
- disponibel PostgreSQL-adferd,
- faktisk rolle-/ACL-adferd i den disponible databasen,
- CI,
- produksjonsmigrasjon,
- deploy,
- runtime-identitet,
- faktisk autonom analysekjøring,
- human review og ekstern readiness.

Den nye rapporten skal også inneholde eksplisitte errata for to tidligere formuleringer:

- target-rebinding-testen beviste en stabil unresolved-active-security-incident, ikke at det opprinnelige targetet nødvendigvis allerede var disabled,
- mixed-case schema-dekning var en statisk quoting-kontroll, ikke en full behavioral databasekjøring.

Errata skal appendes og forklares; historisk evidens skal ikke omskrives i stillhet.

## 13. Alternativer som ikke velges

### 13.1 Beholde JavaScript UTF-16-sortering

PostgreSQL kunne implementert en egen UTF-16-code-unit-sorteringsnøkkel. Det ville redusert hashendring for eksisterende JavaScript-objekter, men gjort SQL-kanonisering mer kompleks og mer utsatt for surrogate- og encodingfeil. Fundamentet er ureleaset, så kostnaden kan ikke forsvare permanent kompleksitet.

### 13.2 Begrense alle objektnøkler til ASCII

En ASCII-grammatikk ville gjort nøkkelorden enkel, men unødvendig innsnevret legitime modellkonfigurasjoner og scopes. Den ville også etterlatt verdi-strengenes representabilitetsproblem separat.

### 13.3 Bare attestere `pg_get_functiondef`

Et teksthash av `pg_get_functiondef` alene binder ikke nødvendigvis alle ACL-, owner-, config- og katalogattributter som påvirker sikkerhetssemantikken. Derfor brukes en eksplisitt catalog descriptor med body og attributter.

### 13.4 Lagre forventet graph-hash bare i databasen

Hvis både faktisk kode og forventet hash ligger bak samme databaseautoritet, kan en feilaktig eller driftet database erklære seg selv gyldig. Derfor ligger forventningsankeret i repoet, og kontrollfunksjonen har et separat eksternt fingeravtrykk.

### 13.5 Automatisk DDL-reparasjon i bootstrap

Automatisk `CREATE OR REPLACE FUNCTION` eller trigger-reparasjon under rolle-recovery blander schema deployment med credential-/grant-livssyklus. En feil kan da overskrive databasekode samtidig som writer authority åpnes. Denne skiven velger eksplisitt fail-closed og separat migrasjonsreparasjon.

## 14. Akseptanse og stopplinje

Skiven kan kalles lokalt ferdig først når:

- alle positive og negative paritetstester er grønne,
- alle writer-, checker-, trigger- og funksjonsmutasjoner gir forventet RED før fix og GREEN etter fix,
- faktiske kandidatroller bare kan skrive gjennom sine eksakte, attesterte writer-funksjoner,
- alle 11 kandidat-tabeller er eksakt bevart på negative og recovery-relaterte feilbaner,
- hele den fokuserte regresjonsmatrisen er grønn,
- en uavhengig whole-range review finner null Critical og null Important i denne skiven,
- tracked worktree er ren og endringsscope er dokumentert.

Selv da betyr resultatet bare lokal implementerings- og sikkerhetsevidens. Følgende forblir separate, ikke-autoriserte porter:

- push og PR,
- hosted CI,
- merge,
- produksjonsmigrasjon,
- deploy,
- rolleaktivering i produksjon,
- faktisk autonom analysekjøring,
- menneskelig review,
- promotering, kanonisering eller publisering.

## 15. Referanser

- `src/lib/knowledge/candidate-analysis-contract.ts` — dagens TypeScript-verdidomene og canonical JSON.
- `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` — dagens SQL-hash, writer-rutiner og 27 custom triggere.
- `.superpowers/sdd/2026-08-19-autonomous-ai-candidate-recovery-quiescence/progress.md` — bindende reviewrulings for I1 og I4.
- [PostgreSQL 16: `pg_proc`](https://www.postgresql.org/docs/16/catalog-pg-proc.html) — rutineattributter og body-felter.
- [PostgreSQL 16: `pg_trigger`](https://www.postgresql.org/docs/16/catalog-pg-trigger.html) — triggeridentitet, type, funksjons-OID og enable-state.
- [PostgreSQL 16: System Catalog Information Functions](https://www.postgresql.org/docs/16/functions-info.html) — `pg_get_function_identity_arguments`, `pg_get_functiondef` og `pg_get_triggerdef`.
- [PostgreSQL 16: JSON Types](https://www.postgresql.org/docs/16/datatype-json.html) — JSONB-representasjon og Unicode-begrensninger.
