# AP-7 — Live databaseverifisering (read-only)

**Type:** Verifisering. **Ingen skriving. Punktum.**
**Estimat:** 1–2 timer
**Avhenger av:** AP-1 fullført
**Gren:** ingen — ren lesing. Utdata går til `NATTSESJON-2026-08-04/`.

---

## Hvorfor denne pakken finnes

QA-rapporten 3. august kunne ikke verifisere noen databasepåstand, fordi kjøringen skjedde i en sandkasse uten tilgang til Postgres. Den lista over uverifiserte påstander er kort, men tung:

- at databasen ikke har flyttet seg siden den låste planen ble laget
- tellingene 1 539 `Document` / 1 572 `LibraryAnalysisRecord` / 0 `ControlledMutationAudit`
- korpushelse mot live tilstand
- schema-drift mot migrasjonene

Alt dette er **lesbart**. `DATABASE_URL` ligger i `.env` og peker på `localhost:5432/foodsystems`. Den sealede måldefinisjonen i apply-kontrakten er database `foodsystems`, systemidentifikator `7620055716543368057`, adresse `127.0.0.1/32`, port `5432`, serverversjon `160013`.

Dette er **punkt 3 i den anbefalte fortsettelsesrekkefølgen**: «Med eksplisitte database- og private rotverdier: kjør den låste registreringsplanen på nytt i read-only-modus og bekreft at databasen ikke har flyttet seg.» Den kan lukkes i natt.

### Hvorfor det betyr noe at den lukkes

Den låste planen er bundet til en *øyeblikkstilstand* av databasen. Signaturen Gabriel til slutt lager, binder blant annet `before-snapshot`-hashen `77ac2b8fb968b573f53448522d1bf121012d9b19f3ab8f131b23e599e53d44b5` og en logisk innholdstilstand på 555 189 rader over 56 relasjoner. Har databasen beveget seg siden 3. august — om så med én rad — må planen lages på nytt før noe kan signeres.

Å oppdage det i natt koster ingenting. Å oppdage det midt i en signeringsseremoni koster en kveld.

---

## Absolutte regler

1. **Ingen skriving.** Ingen `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, ingen Prisma-mutasjon, ingen migrasjon. Heller ikke «bare en midlertidig tabell».
2. **Ingen `--apply`.** Ikke i noen form, ikke med noen flaggkombinasjon.
3. **Ingen `--rehearse-logical-clone`.** Den er karantenert på samme måte.
4. **Ingen `prisma migrate deploy`, `db push` eller `db seed`.** `db:check-drift` er lesende og tillatt; de andre er ikke.
5. **Ikke skriv `DATABASE_URL`-verdien noe sted.** Ikke i rapporten, ikke i en logg, ikke i en commit-melding. Skriv «`localhost:5432/foodsystems`» hvis du må referere til målet.
6. **Ikke skriv de private stiene noe sted.** De oppgis av Gabriel ved oppstart og skal aldri havne i en fil. Apply-kontrakten er eksplisitt: *«No private absolute path is stored in tracked artifacts, output or the audit.»*

Bruk read-only-transaksjon der du selv konstruerer spørringer:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
-- ...
COMMIT;
```

---

## Det Gabriel må oppgi

To absolutte stier, gitt **direkte til agenten ved oppstart** — ikke lagret i en fil, ikke sendt gjennom en tredjepart:

- `--primary-corpus-root=<absolutt sti til primær privat korpusrot>`
- `--replica-corpus-root=<absolutt sti til replika>`

Uten dem kan steg 4 (den låste planen) ikke kjøres. **Steg 1 til 3 kan kjøres uansett** — hopp over steg 4 og noter det i rapporten hvis stiene ikke er tilgjengelige.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md i sin helhet, spesielt §3.

Arbeidskatalog (KUN LESING):
/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1

Oppgaven din er AP-7: verifisere databasetilstanden read-only, inkludert punkt 3
i den anbefalte fortsettelsesrekkefølgen.

ABSOLUTT FORBUDT:
- enhver skriveoperasjon mot databasen, uansett hvor liten
- --apply og --rehearse-logical-clone i enhver form
- å skrive DATABASE_URL-verdien eller private absolutte stier i noen fil,
  logg, rapport eller commit

Følg NATTSESJON-2026-08-04/AP-7-live-databaseverifisering.md.
Skriv til NATTSESJON-2026-08-04/RAPPORT-AP-7.md.
```

---

## Steg for steg

### Steg 1 — Bekreft at du snakker med riktig database

Før noe annet: verifiser at målet er det sealede.

```sql
SELECT current_database(), current_user, version();
SELECT system_identifier FROM pg_control_system();
SHOW server_version_num;
SELECT inet_server_addr(), inet_server_port();
```

| Felt | Forventet |
|---|---|
| `current_database()` | `foodsystems` |
| `system_identifier` | `7620055716543368057` |
| `server_version_num` | `160013` |
| adresse / port | `127.0.0.1` / `5432` |

**Avvik her er et stort funn.** Da snakker du med en annen database enn planen er bundet til. Stopp, rapporter, ikke kjør resten.

Noter også `current_user`. Apply-kontrakten krever rollen `foodsystems` for mutasjon, og at rollen ikke har MCP- eller read-only-navnesemantikk. For lesing spiller det mindre rolle, men avviket er verdt å notere.

### Steg 2 — De fire skriptbaserte kontrollene

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'

npm run knowledge:health:check
npm run knowledge:library-history:check
npm run knowledge:corpus:check:live
npm run db:check-drift
```

Disse fire har aldri vært kjørt i verifikasjonssammenheng — QA-en måtte hoppe over alle sammen. Du er den første som ser resultatet.

For hver: gjengi kommando og fullt resultat i rapporten. Er noen rød, er det et **nytt funn** som ikke står i noen tidligere rapport. Behandle det som viktig.

`db:check-drift` fortjener særlig oppmerksomhet: den sammenligner `prisma/schema.prisma` mot faktisk databaseschema. Drift her ville bety at schemaet har beveget seg utenfor migrasjonene, og det ville påvirke katalog-v2-hashen `7d8bdb71153177983fbe5d191b06a1cb3d8635e5b0f91a1d0eff0a0e942f8e10` som apply-kontrakten er bundet til.

### Steg 3 — Bekreft kjernetellingene

Den låste planen observerte disse verdiene 3. august:

| Relasjon | Forventet nå |
|---|---|
| `Document` | 1 539 |
| `LibraryAnalysisRecord` | 1 572 |
| `ControlledMutationAudit` | **0** |

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT 'Document' AS relasjon, count(*) FROM "Document"
UNION ALL SELECT 'LibraryAnalysisRecord', count(*) FROM "LibraryAnalysisRecord"
UNION ALL SELECT 'ControlledMutationAudit', count(*) FROM "ControlledMutationAudit";
COMMIT;
```

Bekreft også omfanget av den gjennomgåtte grunnlinjen — 56 offentlige datarelasjoner:

```sql
SELECT count(*) FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p','m');
```

**`ControlledMutationAudit` må være 0.** Er den ikke det, har en mutasjon skjedd. Det er den alvorligste tenkelige oppdagelsen i denne pakken — stopp alt og rapporter umiddelbart.

### Steg 4 — Punkt 3: den låste planen, read-only

Kun hvis de private stiene er oppgitt.

```bash
node --import=tsx scripts/knowledge/apply-source-registration-plan.ts \
  --plan-only \
  --primary-corpus-root=<oppgitt av Gabriel> \
  --replica-corpus-root=<oppgitt av Gabriel>
```

`--plan-only` er standardmodus og eksplisitt read-only: den bruker `RepeatableRead` pluss `SET TRANSACTION READ ONLY`. Den verifiserer den låste planen og selvhashen, sporede innganger og indre segl, begge private kopier, rekonstruerte innholdshasher, det eksakte databasemålet og identiteten, den gjennomgåtte katalogen, begge migrasjonsledger-representasjoner, eksakte pre-plan-tellinger, fravær av målkollisjoner, null målavhengigheter og null matchende kvitteringer.

Planen den skal binde seg til:

| Pin | Verdi |
|---|---|
| Plansti | `knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json` |
| Semantisk plan-SHA-256 | `631fef2595bf8f9e897485c1f064654716a3bdb2591bbfb20227370d496a4e2f` |
| Planfil-SHA-256 | `7a8de0151ad9d0c77bb7bb47a01c3bd08922805e933a5b379aea3dd59b84def9` |
| Before-snapshot-SHA-256 | `77ac2b8fb968b573f53448522d1bf121012d9b19f3ab8f131b23e599e53d44b5` |
| Database-identitet (UUID) | `90e3e24d-230f-42f7-b178-5bcd5b861e84` |
| Ventende mål | 10, med 0 konflikter og 0 allerede registrerte |

**Gjengi hele utdata i rapporten**, med unntak av eventuelle private stier — masker dem som `<privat-rot>`.

Feiler planen: dokumenter nøyaktig hvilken kontroll som feilet og hvorfor. En feilende `--plan-only` er ikke en katastrofe — det er nøyaktig det den er der for å oppdage. Men det betyr at planen må lages på nytt før signering, og det er en beskjed Gabriel trenger tidlig.

### Steg 5 — Skriv sammenligningen

Lag `NATTSESJON-2026-08-04/DB-VERIFIKASJON-2026-08-04.md` med en tabell som stiller påstand mot observasjon:

| Påstand (fra plan/kontrakt/QA) | Forventet | Observert | Dom |
|---|---|---|---|
| ... | ... | ... | ✅ / ⚠️ / ❌ |

Dekk minst: databaseidentitet, systemidentifikator, serverversjon, de tre kjernetellingene, antall offentlige datarelasjoner, resultatet av de fire skriptkontrollene, og — hvis kjørt — hver enkelt gate i `--plan-only`.

Avslutt med en klar setning: **har databasen flyttet seg siden 3. august, ja eller nei?** Det er det Gabriel skal kunne lese på ti sekunder.

---

## Definisjon av ferdig

- [ ] Databaseidentitet, systemidentifikator, versjon og adresse er verifisert mot de sealede verdiene
- [ ] Alle fire skriptkontroller er kjørt, med fullt resultat gjengitt
- [ ] De tre kjernetellingene er bekreftet; `ControlledMutationAudit` er 0
- [ ] Antall offentlige datarelasjoner er sjekket mot 56
- [ ] `--plan-only` er kjørt — eller fraværet av private stier er notert som årsak
- [ ] Sammenligningsdokumentet finnes med én klar konklusjon
- [ ] **Null** skriveoperasjoner utført — bekreft eksplisitt i rapporten
- [ ] Ingen hemmeligheter eller private stier i noen fil

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| `ControlledMutationAudit` > 0 | **Stopp alt.** En mutasjon har skjedd. Rapporter umiddelbart og tydelig. |
| Databaseidentitet eller systemidentifikator avviker | Stopp. Du snakker med feil database. |
| Tellingene avviker fra 1 539 / 1 572 / 0 | Ikke stopp, men flagg tydelig: planen må sannsynligvis lages på nytt. |
| `db:check-drift` viser drift | Flagg tydelig. Påvirker katalog-v2-bindingen i apply-kontrakten. |
| Noe frister deg til å skrive «bare for å teste» | Nei. Aldri. |
| De private stiene mangler | Kjør steg 1–3, hopp over steg 4, noter årsaken. Det er et gyldig resultat. |
