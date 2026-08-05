# AP-5 — Pålitelig startmekanisme for `source_registration_apply`

**Type:** Kode, stor. Dette er punkt 1 i den anbefalte fortsettelsesrekkefølgen.
**Estimat:** 4–8 timer
**Avhenger av:** AP-2 fullført
**Gren:** `codex/nattsesjon-ap5-trusted-launcher` i eget worktree

> **Les `knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md` i sin helhet før du skriver en eneste linje.** Den er den styrende spesifikasjonen. Denne arbeidspakken forklarer og avgrenser; den erstatter ikke kontrakten.

---

## Hvorfor denne pakken finnes

Registreringsporten — den første skarpe databaseoperasjonen, 10 `Document` + 10 `LibraryAnalysisRecord` + 1 `ControlledMutationAudit` — er bevisst satt i karantene. `--apply` stopper med `APPLY_TRUSTED_ENTRYPOINT_REQUIRED` **før** den leser databaselegitimasjon eller private innganger.

Karantenen ligger der fordi den eksisterende offentlige starteren ikke kan bevise sitt eget kjøremiljø. Kontrakten er utvetydig om hva som mangler: en *formålsbundet* startmekanisme etter FD3/FD4/FD5-modellen.

Den modellen finnes allerede og er i bruk — for logical-restore-kompanjongen. Jobben er å **generalisere den til formålet `source_registration_apply`**, ikke å finne opp noe nytt.

### Hva FD3/FD4/FD5 faktisk er

Tre filbeskrivere som overleveres til en prosess, i en bestemt rekkefølge av tillit:

| FD | Innhold | Poeng |
|---|---|---|
| **FD3** | Den kjørende launcher-kopiens egen inode | Prosessen kan bevise *hvilken* fil den selv kjører fra — ikke bare hva den heter |
| **FD4** | Kanoniske, avlenkede offentlige pins: formål, kjøremiljø, database-rolle, godkjenningshash, erklært DDL-ro | Alt som kan være offentlig, verifiseres først |
| **FD5** | Kanonisk, avlenket, formålsbundet hemmelig input: databaseforbindelse, private røtter, evidensstier | **Leses sist.** Ikke før alt over er verifisert. |

Filene er *avlenket* (unlinked) — de finnes som åpne beskrivere uten navn i filsystemet, slik at ingen kan bytte dem ut mellom kontroll og bruk. De er mode `0400`, og launcher-kopien ligger mode `0400` i en mode `0700`-katalog i `/tmp`.

Rekkefølgen er hele poenget: **en prosess som ikke kan bevise hva den er, får aldri se hemmeligheten.**

### Hva du skal bygge, og hva du absolutt ikke skal

**Du skal bygge:** startmekanismen, dens tester, og dokumentasjonen av den.

**Du skal ikke:**

- fjerne eller myke opp `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`
- kjøre `--apply` i noen form, mot noen database
- røre `REHEARSAL_TRUSTED_ENTRYPOINT_REQUIRED`
- lage, signere eller bruke en Ed25519-autorisasjon
- koble til noen database i det hele tatt

Når du er ferdig, skal `--apply` fortsatt feile med samme kode. Åpningen av porten er en separat, gjennomgått commit som krever punkt 2 i rekkefølgen — uavhengig, skrivebeskyttet gjennomgang — og som Gabriel bestiller når han er våken.

Sagt annerledes: **du bygger nøkkelen. Du låser ikke opp.**

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md i sin helhet, deretter
knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md i sin helhet.

Sett opp ditt eget worktree:
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git worktree add ../nattsesjon-ap5-launcher -b codex/nattsesjon-ap5-trusted-launcher
cd ../nattsesjon-ap5-launcher
npm install

Oppgaven din er AP-5: implementere en formålsbundet, pålitelig startmekanisme
for source_registration_apply etter FD3/FD4/FD5-modellen, med tester.

ABSOLUTT FORBUDT:
- å fjerne eller myke opp APPLY_TRUSTED_ENTRYPOINT_REQUIRED
- å kjøre --apply mot noen database
- å koble til en database overhodet
- å lage eller bruke en Ed25519-autorisasjon
- å skrive DATABASE_URL, private stier eller nøkler i noen fil

Modellen du skal generalisere finnes i
scripts/knowledge/run-trusted-logical-restore-companion.mjs.
Alle testene dine skal være databasefrie.

Følg NATTSESJON-2026-08-04/AP-5-paalitelig-startmekanisme.md.
Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-5.md.
```

---

## Steg for steg

### Steg 1 — Forstå den eksisterende modellen grundig

Bruk god tid her. Denne koden er tett, og feil forståelse gir en startmekanisme som *ser* riktig ut.

Les i denne rekkefølgen:

```
scripts/knowledge/run-trusted-logical-restore-companion.mjs      ← den betrodde forelderen
scripts/knowledge/run-controlled-logical-restore-companion.mjs   ← barnet
scripts/knowledge/run-logical-restore-extension-initializer.mjs
scripts/knowledge/verify-node-runtime-closure.mjs                ← runtime-attestasjon
scripts/knowledge/verify-psql-runtime-closure.mjs
scripts/knowledge/verify-postgresql-extension-runtime-closure.mjs
scripts/knowledge/launch-locked-source-registration-apply.mjs    ← den karantenerte, som skal få en betrodd søsken
```

Og testene som beviser at modellen holder:

```
tests/lib/corpus-repository-bundle-transaction.test.ts
tests/lib/corpus-pre-live-rebaseline.test.ts
```

Skriv ned — i rapporten — svaret på disse før du koder:

1. Nøyaktig hvilke pins verifiseres før FD5 leses?
2. Hvordan lages den avlenkede beskriveren, og hvordan verifiseres mode og lenketall rundt barnet?
3. Hvordan er formålsbindingen implementert — hvor står strengen, og hvordan hindres gjenbruk til annet formål?
4. Hva gjør forelderen *etter* at barnet er avsluttet, og hvorfor holdes barnets stdout tilbake til da?
5. Hvilke miljøvariabler fører til avvisning, og hvorfor akkurat de?

Klarer du ikke å svare presist på alle fem, ikke begynn å kode. Skriv i stedet ned hva du ikke forsto, og stopp. Det er et fullt akseptabelt nattresultat.

### Steg 2 — Skriv spesifikasjonen før koden

Lag `knowledge/corpus/SOURCE-REGISTRATION-TRUSTED-ENTRYPOINT.md` som beskriver, i kontraktenes egen stil:

- formålsstrengen — bruk `source_registration_apply`
- nøyaktig innhold i FD3-, FD4- og FD5-konvoluttene
- rekkefølgen av verifikasjoner, med eksplisitt markering av hvor FD5 først leses
- hvilke runtime-lukninger som må attesteres (Node, `node_modules`, Prisma-klienttre, lokal importlukning, PostgreSQL-verktøysettet)
- miljøavvisningsreglene: enhver arvet `NODE_*`, `OPENSSL_*`, `PRISMA_*`, `TSX_*`, `DOTENV_CONFIG_*`, `DYLD_*`, `LD_*` og enhver Node-kjøreflagg
- re-attestasjonen etter at barnet avsluttes, inkludert ved feil i barnet
- hva mekanismen **ikke** hevder å beskytte mot: en same-UID-angriper, preloadede moduler før JavaScript starter, maskinvarebakket isolasjon

Det siste punktet er ikke pliktløping. Kontraktens troverdighet hviler på at den er eksplisitt om sine egne grenser, og din tilføyelse må holde samme standard.

Merk at kjøremiljø-lukningene allerede er sealet for denne maskinen:

```
knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-03.v1.json
knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json
knowledge/corpus/source-registration/postgresql-extension-runtime-closure-darwin-arm64-2026-08-03.v1.json
```

Bruk dem som pins. Ikke generer nye.

### Steg 3 — Implementer

Foreslått plassering: `scripts/knowledge/run-trusted-source-registration-apply.mjs`, med samme byggemåte som logical-restore-kompanjongen.

Bindende krav:

- **Kun innebygde Node-moduler** i den kopierte forelderen. Ingen `node_modules`-import før runtime er attestert.
- **Formålsbinding** til `source_registration_apply`, domeneseparert i hashen. En konvolutt laget for ett formål skal ikke kunne brukes til et annet.
- **FD5 leses sist.** Etter launcher-inode, formål, runtime og offentlig kontroll. Denne rekkefølgen er ikke en optimalisering — den er sikkerhetsegenskapen.
- **Kontinuitetskontroll i barnet:** beskriverkontinuitet, forelder-PID, formål, indre attestasjons-selvhash, kallerens runtime-pins og aktiv Node-binær — alt før noen evidens leses eller noen databaseoperasjon konstrueres.
- **Full re-attestasjon etter barnet**, også når barnet feiler. Drift fører til avvisning.
- **Direkte kjøring av barnet skal avvises.**
- **Ingen hemmeligheter i argumenter, output eller kvitteringer.** Verken private absolutte stier eller legitimasjon.

### Steg 4 — Tester

Alle databasefrie. Speil angrepstestene som allerede finnes for kompanjongen — kontrakten lister dem eksplisitt:

| Test | Forventet |
|---|---|
| Godkjent konvolutt | Aksepteres |
| Manglende beskriver | Avvises |
| Feilidentifisert beskriver | Avvises |
| Feil filmodus | Avvises |
| Feil lenketall | Avvises |
| Beskriverdrift mellom kontroll og bruk | Avvises |
| Feil forelder-PID | Avvises |
| Feil formålsstreng | Avvises |
| Manipulert indre runtime-hash | Avvises |
| Arvet `NODE_OPTIONS` (og hver av de øvrige prefiksene) | Avvises |
| Direkte kjøring av barnet | Avvises |
| Drift i runtime etter at barnet avsluttet | Avvises |

**Den viktigste testen av alle:** en test som beviser at FD5 **ikke** er lest når en tidligere kontroll feiler. Instrumentér lesingen, kjør med en bevisst feilende pin, og verifiser at hemmeligheten aldri ble berørt. Dette er hele sikkerhetspåstanden — den fortjener sin egen eksplisitte test.

Legg testene i `tests/lib/`. Kjør dem enkeltvis:

```bash
node --import=tsx --test tests/lib/<din-testfil>.test.ts
```

**Ikke** legg dem inn i `knowledge:processing-contracts:check` ennå. Den listen er hashbundet i `codeBindings`-konvolutten; å utvide den er en kontraktsendring som krever ny gjennomgang. Foreslå det i rapporten i stedet.

### Steg 5 — Bevis at karantenen fortsatt holder

```bash
node scripts/knowledge/launch-locked-source-registration-apply.mjs --apply
```

**Forventet:** `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`, uendret.

Kjør også kontrollpakken og typekontrollen i ditt worktree — de skal være uberørt:

```bash
npm run knowledge:processing-contracts:check   # 282/282
npx tsc --noEmit                                # 0 feil
```

### Steg 6 — Skriv gjennomgangsunderlaget

Punkt 2 i fortsettelsesrekkefølgen er «uavhengig, skrivebeskyttet gjennomgang av startmekanismen og transaksjonsgrensen». Du kan ikke gjennomgå ditt eget arbeid uavhengig, men du kan gjøre gjennomgangen billig for den som skal.

Skriv `NATTSESJON-2026-08-04/GJENNOMGANGSUNDERLAG-AP-5.md` med:

- hva du implementerte, fil for fil
- hvor din implementasjon avviker fra kompanjongmodellen, og hvorfor
- hvert kontraktskrav i §"Pre-import runtime boundary" med henvisning til hvor det er innfridd
- hva du bevisst *ikke* implementerte
- de svakeste punktene i din egen løsning — vær selvkritisk; det er dette som gjør en gjennomgang effektiv
- en foreslått sjekkliste for gjennomgåeren

---

## Definisjon av ferdig

- [ ] De fem spørsmålene i steg 1 er besvart presist i rapporten
- [ ] Spesifikasjonsdokumentet finnes og dekker formål, konvolutter, rekkefølge, avvisningsregler og eksplisitte grenser
- [ ] Startmekanismen er implementert med innebygde moduler i den kopierte forelderen
- [ ] FD5 leses beviselig sist — med egen test
- [ ] Alle angrepstestene i tabellen finnes og passerer
- [ ] Testene er databasefrie
- [ ] `--apply` returnerer fortsatt `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`
- [ ] `knowledge:processing-contracts:check` er 282/282 og `tsc --noEmit` er 0
- [ ] Ingen hemmeligheter i kode, tester, output eller commits
- [ ] Gjennomgangsunderlaget finnes
- [ ] Alt er committet på egen gren; den kanoniske grenen er urørt

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Du forstår ikke kompanjongmodellen godt nok til å generalisere den | **Stopp.** Skriv ned hva du forsto og ikke forsto. Dette er et nyttig resultat. |
| En kontroll krever en database | Stopp den linjen. Alt skal være databasefritt. |
| Du fristes til å myke opp en kontroll for å få en test grønn | Nei. En rød test som beskriver virkeligheten er verdt mer enn en grønn som ikke gjør det. |
| Implementasjonen krever endring i `apply-source-registration-plan.ts` | Stopp. Det er innenfor `codeBindings`-konvolutten og endrer operasjonsnøkkelen. Beskriv behovet i rapporten. |
| Du er i ferd med å fjerne karantenen | Nei. Aldri i natt. |
| Du har brukt mer enn 8 timer | Stopp der du er. Commit arbeidet. Rapporter hva som gjenstår. Halvferdig og dokumentert slår gjettet og fullført. |
