# Food Systems Knowledge MCP

## Beslutning og status

`foodsystems-kb` er prosjektets kuraterte, read-only MCP-server. Den er
standardflaten for søk, kildearbeid, entitetsoppslag og claim tracing. Et
generisk PostgreSQL-MCP med fri SQL er ikke standardflaten.

Serverkoden og sikkerhetskontraktene er klare for lokal pilot. Tilkobling mot
en bestemt database er likevel bare **GO** når databasen har:

1. verifisert backup og restore-drill
2. grønn Prisma-ledger og schema-drift
3. en egen, verifisert `foodsystems_mcp_ro`-login
4. grønne kunnskaps- og datatellingsporter

Akademisk regresjonsstatus og operasjonell biblioteksstatus kan være grønne
samtidig som ekstern claim-readiness er rød. MCP-en skjuler derfor materiale
som ikke er eksplisitt godkjent for ekstern bruk; den tolker ikke «internt
brukbar» som «eksternt siterbar».

Kort prosesspresentasjon: [`foodsystems-kb-mcp-presentasjon.html`](foodsystems-kb-mcp-presentasjon.html).
Database-, backup- og rollekontrakten: [`POSTGRES-MCP-SETUP.md`](POSTGRES-MCP-SETUP.md).

## Eksponert flate

Tools:

- `kb_status` — databasekobling, radtelling for både dokument- og typed
  kunnskapslag, lagret/answer-time citationstatus og status for valgfrie flater
- `kb_search` — dokumenter, innsikter, kilderegister, rapporter, avhandlinger,
  selskaper, aktører, personer og relasjoner; typed rapport-/kildetreff er
  discovery-only, men kan returnere en policyvalidert offentlig kildelenke
- `kb_get_document` — dokumentmetadata, begrenset innhold og citation readiness
- `kb_get_entity` — selskap, aktør eller person med relasjoner og kildeindikatorer
- `kb_trace_claim` — field/source citations, lokatorer, readiness og confidence
- `kb_list_gaps` — én eksakt gapklasse per kall: readiness, needs-review eller manglende lokator

Resources:

- `foodsystems://schema`
- `foodsystems://document/{slug}`
- `foodsystems://entity/{type}/{id}`
- `foodsystems://obsidian/{path}` — deaktivert som standard

Prompts:

- `answer_with_citations`
- `claim_check`
- `knowledge_gap_review`

Serveren har ingen raw-SQL-tool og ingen skrivemetode.

## Fail-closed brukspolicy

Alle tools og ressurser som kan brukes i et svar, starter med
`audience=external`. `internal` må velges eksplisitt.

For ekstern bruk gjelder:

- søkeresultater og entitetsoppslag er kun discovery; eksterne søkesammendrag
  holdes tilbake fordi søkeresultatet ikke har en claim-spesifikk citation-trace
- en påstand må spores med `kb_trace_claim`
- bare en eksakt, whitespace-normalisert og case-insensitiv likhet med hele
  `FieldCitation.claimText` eller hele citationens `quote` regnes som
  claim-støtte
- delstrengtreff i claim/quote merkes `lexical_candidate` og krever menneskelig
  sammenligning; treff i feltsti, tittel, citationtekst eller interne notater
  er metadata-discovery. Begge ligger i `discoveryMatches`, aldri i `claims`
- bare citations med `usePolicy.externalCitable=true` kan støtte svaret
- ekstern citation krever en gyldig, offentlig HTTP(S)-URL i `url` eller
  `archivedUrl`; `localPath`, `documentId` og `sourceDocId` er fortsatt nyttige
  internt, men er ikke en etterprøvbar ekstern lokator
- URL-er med credentials, private/lokale adresser eller reserverte
  test-/eksempeldomener (`.test`, `.invalid`, `.example` og
  `example.com/.net/.org`) regnes ikke som offentlige lokatorer
- `citable_with_note`, `internal_context`, `blocked_unsourced`, failed,
  disputed og rejected blokkeres
- kildeklassene `internal_synthesis`, `synthesis`, `internal_construct`,
  `legacy_unsourced` og `unknown` kan ikke bli eksternt siterbare selv om en
  inkonsistent rad feilaktig er merket `citable_external`
- dokumenttekst krever både en kvalifisert ekstern citation og en komplett,
  menneskelig `safe_for_external_claims`-godkjenning i bibliotekanalysen
- bibliotekstatus og dokumentbadges revurderer gjeldende `SourceCitation` med
  samme answer-time-policy; fjerning eller degradering av den siste offentlige
  lokatoren lukker derfor `externalClaimEligible` uten å stole på en eldre
  godkjenningsmarkør
- den menneskelige godkjenningen lagrer et SHA-256-fingeravtrykk av det eksakte
  settet citations som besto answer-time-policyen ved review. Gjeldende sett må
  fortsatt gi samme fingeravtrykk; en ny eller erstattet lokator krever derfor
  nytt menneskelig review og kan ikke reaktivere en eldre godkjenning
- godkjenningen må ha `status=validated`, `reviewStatus=approved`, navngitt
  reviewer, gyldig reviewtid, `citationReadiness=citable_external`, null
  risikoflagg, null claim-kandidater og gyldig SHA-256 content hash
- godkjenningen bindes til eksakt `sourceKind=document`,
  `sourceKey=document:<id>` og `documentId`, og til SHA-256 av gjeldende
  `summary + "\n\n" + content`; endring i denne teksten lukker ekstern tekst
  til nytt review
- AI-kort kan aldri tildele `safe_for_external_claims`
- lokal filsti, filename, verifier/notes og sensitive person-/aktørfelt
  redigeres bort
- URL-er med brukernavn/passord, localhost, private/loopback-adresser eller
  andre ikke-offentlige vertsnavn redigeres bort og kan ikke åpne citationporten
- gap-output er metadata-only; full claim-tekst og lokale lokatorer krever
  eksplisitt `audience=internal`

Intern modus kan brukes til analyse og reparasjonsarbeid, men interne funn skal
beholde advarsler og må ikke omtales som eksternt siterbare.

## Menneskelig ekstern godkjenning

AI-prosessering kan ikke godkjenne ekstern bruk. Start alltid med dry-run mot
én eksakt dokumentrad:

```bash
export DATABASE_URL='FROM_SECRET_MANAGER'

npm run research:library:review-external:dry-run -- \
  --decision=approve \
  --source-key=document:DOCUMENT_ID \
  --reviewer='FULLT NAVN'
```

Dry-run feiler dersom kildebindingen eller teksthashen ikke kan beregnes,
risikoflagg/claim-kandidater finnes, `citationReadiness` ikke er
`citable_external`, eller dokumentet mangler en citation som består hele den
eksterne citationporten. Behold `contentHash` fra dry-run sammen med det
faktiske reviewgrunnlaget; den er versjonslåsen for apply.

Etter faktisk faglig gjennomgang brukes den sterke bekreftelsen:

```bash
npm run research:library:review-external:apply -- \
  --decision=approve \
  --source-key=document:DOCUMENT_ID \
  --reviewer='FULLT NAVN' \
  --expected-content-hash=SHA256_FROM_DRY_RUN \
  --ack=I_HAVE_REVIEWED_THE_CURRENT_DOCUMENT
```

Apply stopper dersom dokumentets gjeldende SHA-256 ikke er identisk med både
`--expected-content-hash` og analysepostens egen `contentHash`. Stale analyse
må behandles på nytt før review. Record, dokument og citations låses i én
`Serializable` transaksjon, slik at tekst eller citationbinding ikke kan endres
mellom kontroll og godkjenning. Endret tekst krever ny prosessering, dry-run og
faglig gjennomgang. Apply lagrer samtidig citation-policy-fingeravtrykket og
ID-ene som inngikk i reviewgrunnlaget i analysepostens `aiCard`.

Kontrollert tilbakekalling bruker `--decision=revoke` og
`--ack=I_AM_REVOKING_EXTERNAL_APPROVAL`. Begge beslutninger skriver intent og
resultat append-only til
`research/_status/library-analysis-human-review-log.jsonl`. Ordinær
`research:library:process:apply` bevarer en gyldig godkjenning når eksakt
teksthash og det godkjente citation-policy-fingeravtrykket er uendret. Ved
bortfall, degradering eller utskifting tilbakekalles godkjenningen,
review-proveniens nullstilles og forrige tilstand med årsak logges i
`library-analysis-approval-revocation-backup.jsonl`.

Etter enhver beslutning:

```bash
npm run research:library:ledger
npm run audit:library-analysis
```

Ledger-exporten sammenligner både lagret review-hash og lagret citation-policy-
fingeravtrykk med gjeldende dokument og citations. Status/API og MCP kan derfor
ikke rapportere ekstern readiness på et gammelt reviewgrunnlag.

## Valgfrie databehandlingsflater

Nøkkelordsøk er standard og sender ikke søketekst til en ekstern embedding-
tjeneste. Semantisk/hybrid søk aktiveres bare etter eksplisitt godkjenning:

```bash
export FOODSYSTEMS_MCP_ENABLE_SEMANTIC=true
export OPENAI_API_KEY='FROM_SECRET_MANAGER'
```

Uten opt-in faller semantic/hybrid tilbake til keyword og returnerer en
advarsel. `OPENAI_API_KEY` skal ikke gis til MCP-prosessen når semantisk søk er
av.

Obsidian-ressursen er også av som standard:

```bash
export FOODSYSTEMS_MCP_ENABLE_OBSIDIAN=true
```

Når den er på, tillates bare vanlige Markdown-filer under vault-roten. Absolutte
stier, traversal, skjulte segmenter, symlinker, andre filtyper og filer over
størrelsesgrensen avvises.

## Forutsetninger på klientmaskinen

Fra den kanoniske repo-klonen:

```bash
npm ci
npm run db:generate
npm run mcp:kb:test
```

`DATABASE_URL` må være URL-en til den dedikerte MCP-login-en, aldri admin- eller
applikasjonens skriverolle. URL-en skal inkludere:

```text
?schema=public&application_name=foodsystems-mcp-ro
```

Før registrering:

```bash
export MCP_DATABASE_URL='FROM_SECRET_MANAGER'
scripts/verify-mcp-readonly-role.sh
```

Verifikatoren beviser både lesetilgang og at UPDATE, DELETE, permanent CREATE
og TEMP CREATE avvises av ACL-ene. Det er ikke nok at serverkoden hevder å være
read-only.

## Koble til Codex

Bruk en lokal wrapper med absolutte kjørbare/script-stier. Wrapperen leser
database-URL-en fra macOS Keychain først når MCP-prosessen starter. Dermed
havner ikke den ekspanderte hemmeligheten i `codex mcp add`-argv, shellhistorikk
eller Codex-konfigurasjonen.

Lagre URL-en i Keychain Access med tjenestenavn `foodsystems-kb-mcp-local` og
konto `foodsystems_mcp_ro`. Dette er navnene den verifiserte lokale wrapperen
bruker. Lag deretter en lokal, ikke-versjonert fil som
`$HOME/.local/bin/foodsystems-kb-mcp` med dette innholdet:

```sh
#!/bin/sh
set -eu

REPO_ROOT='/absolute/path/to/Food Systems 2026'
PATH='/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'
export PATH

# Keyword-only and no Obsidian exposure are the safe local defaults. Also
# prevent inherited proxy settings from silently rerouting future HTTP calls.
unset OPENAI_API_KEY \
  FOODSYSTEMS_MCP_ENABLE_SEMANTIC \
  FOODSYSTEMS_MCP_ENABLE_OBSIDIAN \
  HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY \
  http_proxy https_proxy all_proxy no_proxy

NODE_BIN=$(command -v node)
case "$NODE_BIN" in
  /*) ;;
  *) echo 'node was not found on the controlled PATH' >&2; exit 1 ;;
esac
TSX_CLI="$REPO_ROOT/node_modules/tsx/dist/cli.mjs"
[ -r "$TSX_CLI" ] || { echo 'tsx CLI is missing; run npm ci in the repository' >&2; exit 1; }

DATABASE_URL=$(/usr/bin/security find-generic-password \
  -s foodsystems-kb-mcp-local \
  -a foodsystems_mcp_ro \
  -w)
export DATABASE_URL

exec "$NODE_BIN" "$TSX_CLI" \
  "$REPO_ROOT/mcp/foodsystems-kb/server.ts"
```

Begrens filtilgangen og registrer bare wrapper-stien:

```bash
chmod 700 "$HOME/.local/bin/foodsystems-kb-mcp"
codex mcp add foodsystems-kb -- "$HOME/.local/bin/foodsystems-kb-mcp"
```

Serveren utleder i tillegg repo-root fra sin egen `import.meta.url`, ikke fra
`process.cwd()`. Stdio-testen starter derfor prosessen fra en mappe utenfor
repoet og leser schemaressursen derfra.

Wrapperen nullstiller eksplisitt arvet `OPENAI_API_KEY`, semantisk-/Obsidian-
opt-in og vanlige proxyvariabler, og finner Node bare på den kontrollerte
systemstien. Det hindrer at en bred Codex-shell utilsiktet endrer MCP-ens
nettverks- eller eksponeringsflate. Hvis semantisk søk eller Obsidian senere
godkjennes, skal det få en separat, eksplisitt konfigurert wrapper og ny
sikkerhetsverifikasjon; ikke fjern nullstillingen ad hoc.

På plattformer uten Keychain kan en lokal, ikke-versjonert Codex-konfig arve en
allerede godkjent `DATABASE_URL`. `env_vars` inneholder bare variabelnavnet;
Codex-prosessen må selv startes fra et miljø som har hemmeligheten:

```toml
[mcp_servers.foodsystems-kb]
command = "/absolute/path/to/Food Systems 2026/node_modules/.bin/tsx"
args = ["/absolute/path/to/Food Systems 2026/mcp/foodsystems-kb/server.ts"]
env_vars = ["DATABASE_URL"]
enabled = true
startup_timeout_sec = 20
tool_timeout_sec = 60
```

Ikke bruk `codex mcp add --env DATABASE_URL=...`: verdien kan bli synlig i
prosessargumenter og lagret lokal konfigurasjon.

Etter endring:

```bash
codex mcp list
```

Restart Codex før funksjonell akseptanse. `codex mcp list` beviser bare at
konfigurasjonen finnes, ikke at databasen kan leses.

## Funksjonell akseptanse

Kjør disse gjennom den registrerte MCP-serveren:

1. `kb_status` — database skal være tilgjengelig; forventede radtall skal være
   til stede for blant annet `Document`, `Report`, `Thesis` og `SourceDoc`, og
   `citationPolicy` skal skille lagret `citable_external` fra citationene som
   består hele den offentlige answer-time-porten.
2. `kb_search` med standard audience — resultatet skal si at det er discovery,
   semantic-request skal falle tilbake når opt-in er av, og et report-only søk
   med `limit=1` skal finne en strukturert rapport uavhengig av Document-kobling.
3. `kb_trace_claim` — ekstern `claims` skal bare inneholde eksakte normaliserte
   claim-/quote-treff med `externalCitable=true`; delstrengtreff skal være
   `lexical_candidate`, og metadata-/lexical-treff skal ligge i
   `discoveryMatches` og aldri presenteres som støtte.
4. `kb_get_document` på en intern/AI-draft post — ekstern tekst skal holdes
   tilbake.
5. `kb_list_gaps` — ekstern respons skal være metadata-only; intern respons
   skal returnere reparasjonskontekst.
6. `kb_get_entity` for person og aktør — eksternt payload skal rapportere
   hvilke felter som ble redigert bort.

Lokal kodeakseptanse kjøres separat:

```bash
npm run mcp:kb:test
```

Den dekker protokollforhandling, tool/resource/prompt-flaten, fail-closed
audience-regler, provenance, gap-filtre, feilredigering og Obsidian-pathvern.

For en faktisk registrert `stdio`-prosess kan den repeterbare live-testen peke
på den lokale wrapperen eller en annen godkjent kommando:

```bash
export FOODSYSTEMS_MCP_COMMAND='/absolute/path/to/foodsystems-kb-mcp-wrapper'
npm run mcp:kb:acceptance
```

Live-testen skriver bare tellings- og policyresultater; den skriver ikke
connection string, passord, kildetekst eller persondata.

Direkte kodeakseptanse og registrert wrapperakseptanse er to separate porter.
Wrapperen må løse til den samme, tilsiktede checkouten/committen som ble testet;
en grønn direkte test kan ikke brukes som bevis dersom wrapperen peker på en
annen arbeidskopi. Etter integrasjon skal wrappertesten kjøres på nytt, Codex
restartes, og tool-flaten verifiseres i en ny sesjon.

## Drift og neste fase

V1 er lokal `stdio`: hver godkjent bruker starter serveren fra sin egen klon og
bruker sin egen secret-konfigurasjon. Produksjons- eller delt tilkobling er ikke
GO før sjekklisten i `POSTGRES-MCP-SETUP.md` er fullført for akkurat den
databasen.

Streamable HTTP kan vurderes senere. Da kreves HTTPS, MCP-autorisasjon,
Origin-validering, secret-rotasjon, logging uten sensitivt payload, rate limits
og en eksplisitt beslutning om hvem som får ekstern versus intern audience.
