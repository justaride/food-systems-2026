# Infra-økosystem: Hetzner · Coolify · Cloudflare · GitHub

Sist oppdatert: 2026-08-06. Eier-repo: `justaride/food-systems-2026`.

> **Endret 2026-08-06:** Coolify er flyttet fra `http://77.42.43.227:8000` til
> `https://coolify.gabistudio.dev`, bak Cloudflare. Avsnitt 1–5 er oppdatert.
> Ny hendelse i §13. Alt fra 2026-06-10 står urørt som historikk.

Formål: ett kart over hvordan prod faktisk henger sammen, hvilke tilgangsveier
som finnes, og en feilsøkingsstige når noe i kjeden ryker. Skrevet så det også
kan gjenbrukes som mal for andre Coolify/Cloudflare/Hetzner-prosjekter i
økosystemet vårt.

> Notasjon: **[V]** = verifisert 2026-06-10 i denne økten. **[A]** = antatt/ikke
> verifisert (sjekk før du stoler på det). Hemmeligheter står aldri her — kun
> hvor de bor.

## 1. Topologi

```
  Utvikler (Mac)                         GitHub Actions
   │  ssh cloudbrain                       │  (secrets: se §4)
   │  (= 77.42.43.227) [V]                 │
   │                                       ├── coolify-deploy-verify       ─┐ Coolify API
   │                                       │     (push main → verifiser)     │ coolify.gabistudio.dev [V 08-06]
   │                                       ├── coolify-db-watcher (5 min)    │  bak CF Access — kall MÅ
   │                                       ├── coolify-resource-snapshot     │  sende CF-Access-headere
   │                                       ├── citation-verification (cron)  │
   │                                       └── prod-data-import (manuell)    │
   │                                             │  begge via CF Access-tunnel│
   ▼                                             ▼                           ▼
 ┌──────────────────────── Hetzner 77.42.43.227 (Coolify-host) [V] ──────────────────┐
 │  Coolify  (dashboard nå https://coolify.gabistudio.dev, bak CF Access [V 08-06])   │
 │   ├── app-container   uuid so8ko44goccc8gcgswwscgco   [V]                          │
 │   │     Next.js; build = prisma generate + compute-metrics + next build (IKKE data)│
 │   └── DB-container    uuid l0s8o8oo00c8gossw0gksswk                                 │
 │         navn food-systems-pgvector-db, Postgres :5432  [V]                         │
 │   └── cloudflared DB-connector (systemd-service ELLER docker «cloudflared-db») [A] │
 └───────────────┬───────────────────────────────────────────┬───────────────────────┘
                 │ app-vei (offentlig, 200)                   │ DB-vei (CF Access, privat)
                 ▼                                             ▼
   Cloudflare zone naturalstateproject.com [V]
   ├── food-systems.naturalstateproject.com → 104.21.38.60 / 172.67.219.141  [V]
   │     /api/version = HTTP 200 [V]  → app + server + CF-konto er FRISKE
   └── fs-db.naturalstateproject.com → samme CF-edge [V]
         CF Access-app «food-systems-db», TCP → food-systems-pgvector-db:5432
         🔴 NEDE 2026-06-10: «websocket: bad handshake» (se §6)
```

## 2. De to Cloudflare-veiene (viktig skille)

| Vei | Hostname | Gating | Status 2026-06-10 | Status 2026-08-06 |
|---|---|---|---|---|
| **App** | `food-systems.naturalstateproject.com` | Offentlig (200 uten auth) [V] | 🟢 frisk | 🟢 frisk [V] |
| **DB-tunnel** | `fs-db.naturalstateproject.com` | CF Access **service-token** | 🔴 nede («bad handshake») | — |
| **Kontrollplan** | `coolify.gabistudio.dev` | CF Access **service-token** | fantes ikke | 🟢 frisk [V] |

Konsekvens: at appen er oppe sier **ingenting** om DB-tunnelen. De er separate
Cloudflare-objekter. Server, Coolify og CF-konto kan være friske mens *kun*
DB-connectoren/tokenet er nede — som 2026-06-10.

Etter 2026-08-06 gjelder det samme for **kontrollplanet**: Coolify-API-et er nå
en tredje, uavhengig vei. Appen kan være helt frisk mens API-et er utilgjengelig
— da er du blind, ikke nede. `coolify-db-watcher` skiller nå eksplisitt mellom
de to (`reach=ok|blocked|unreachable`), nettopp fordi sammenblandingen kostet
110+ falske alarmer i august.

## 3. Tilgangsveier

| Mål | Hvordan | Krever |
|---|---|---|
| Hetzner-shell | `ssh cloudbrain` (HostName 77.42.43.227) [V] | SSH-nøkkel i `~/.ssh/config` |
| Coolify API | `curl $COOLIFY_BASE_URL/api/v1/...` (`https://coolify.gabistudio.dev`) [V 08-06] | `COOLIFY_API_TOKEN` **+** `CF-Access-Client-Id/Secret`-headere |
| Coolify dashboard | nettleser → `https://coolify.gabistudio.dev` [V 08-06] | CF Access (nettleser-innlogging) |
| Prod-Postgres | `cloudflared access tcp --hostname fs-db… --url localhost:5432` → psql/Prisma på localhost:5432 | `CF_ACCESS_CLIENT_ID/SECRET` + prod `DATABASE_URL` |
| Prod-DB-creds | Coolify API `GET /api/v1/databases/l0s8o8oo00c8gossw0gksswk` | `COOLIFY_API_TOKEN` |

Lokalt checkout har **ingen** prod-creds (`.env` = localhost). De lever i
GitHub Actions-secrets og i Coolify.

## 4. GitHub Actions-secrets/variabler (navn, ikke verdier)

`COOLIFY_API_TOKEN` (rotert 2026-08-06; trenger scope **read + write + deploy**
— `write` for env-oppdatering og DB-restart, `deploy` for redeploy-trigger),
`COOLIFY_BASE_URL` (`https://coolify.gabistudio.dev` fra 2026-08-06),
`COOLIFY_APP_UUID` (`so8ko44goccc8gcgswwscgco`), `DATABASE_URL` (prod, host
localhost:5432 — tunnelen proxyer), `CF_ACCESS_CLIENT_ID`,
`CF_ACCESS_CLIENT_SECRET`. Variabel: `CITATION_VERIFY_ENABLED=true` [V].

Workflowene mapper GitHub-secretene `CF_ACCESS_CLIENT_ID/SECRET` til
`cloudflared`-variablene `TUNNEL_SERVICE_TOKEN_ID/SECRET`. Klienten leser ikke
`CF_ACCESS_CLIENT_*` direkte.

## 5. Workflow-inventar

| Workflow | Trigger | Rolle | Tunnel? |
|---|---|---|---|
| `coolify-deploy-verify.yml` | push til `main`, manuell | Verifiserer deployen Coolify allerede har gjort: venter på en ferdig deploy for commiten, sjekker eksakt runtime-SHA + data-/bibliotekhelse. Skriver ingen env og trigger ingen build | nei |
| `prod-drift-watch.yml` | cron hvert 15. min, manuell | Sammenligner runtime-SHA mot `main` HEAD med slingringsmonn for deploys underveis; rødt = prod og main er ikke i takt | nei |
| `citation-verification.yml` | cron søn 03:00 UTC, manuell | `db:verify:filehash` + url-health mot prod | **ja** |
| `prod-data-import.yml` | manuell (`confirm=IMPORT`) | Sanksjonert prod-data-operasjon via eksplisitte targetvalg: `verify-only`, `seed`, `nordic-pdf`, `ownership`, `registers`, `knowledge`, `full` | **ja** |
| `coolify-db-watcher.yml` | (sjekk fila) | DB-overvåking | [A] |
| `coolify-resource-snapshot.yml` | (sjekk fila) | Ressurs-snapshot | [A] |
| `schema-migration-guard.yml` | PR | Schema-drift-gate | nei [A] |
| `pr-quality-gates.yml` | PR | Test/lint/build-gates | nei |

**Deploy-modell:** push til `main` → Coolifys `Auto Deploy` bygger via
GitHub-appens webhook. Det er den ENESTE deploy-triggeren; fram til 2026-08-25
trigget `coolify-deploy-verify.yml` (den gang `coolify-sync-source-commit.yml`)
i tillegg en API-deploy, slik at hver
merge ga to samtidige bygg uten rekkefølgegaranti. Deployens egen commit kommer
fra Coolify-innstillingen `Include Source Commit in Build` — ikke fra en
env-variabel satt utenfra; se workflow-headeren for hvorfor det skillet ga en
kvittering som løy. Buildet kjører *ikke* data-importer. Data må synkes separat mot prod-DB — se
[DEPLOYMENT-AND-DATA-OPERATIONS.md](./DEPLOYMENT-AND-DATA-OPERATIONS.md).

## 6. Kjent feiltilstand 2026-06-10: DB-tunnel nede

**Symptom:** alt som leser/skriver prod-DB feiler. `cloudflared access tcp` mot
`fs-db.naturalstateproject.com` gir gjentatt
`ERR failed to connect to origin error="websocket: bad handshake"`.

**Verifiserte signaler denne økten:**
- App `/api/version` = 200 → server/Coolify/CF-konto friske. [V]
- DNS `fs-db…` resolver til CF-edge (samme som appen). [V] → DNS er ikke problemet.
- `citation-verification.yml`-cronen har kun 2 kjøringer (2026-05-31, 2026-06-07),
  **begge feilet** på DB-steget, med `CITATION_VERIFY_ENABLED=true` [V]
  → tunnelen har vært nede i **≥10 dager**; «ukentlig auto-verify» har aldri virket.
- De gamle workflowene brukte `nc -z localhost 5432` som ready-sjekk — **falsk
  positiv** (passerer på den lokale cloudflared-lytteren selv når origin-handshake
  feiler). Fikset til psql-probe 2026-06-10 så feilen treffer riktig lag raskt.

**Bekreftet root cause (CF API + SSH-diagnose 2026-06-10): workflow-env-var-bug.**
`cloudflared access tcp` leser Access-service-tokenet fra `--service-token-id` /
`--service-token-secret` (env `TUNNEL_SERVICE_TOKEN_ID` / `TUNNEL_SERVICE_TOKEN_SECRET`)
— **ikke** fra `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` (det er
HTTP-header-navn). Workflowene satte kun `CF_ACCESS_CLIENT_*`, som klienten
ignorerer → cloudflared presenterte **aldri** noe service-token → CF Access
avviste den uautentiserte forespørselen → «websocket: bad handshake». Bug siden
oppsettet; derfor har tunnelen aldri fungert fra CI.

Alt rundt er friskt — verifisert via CF API:
- Tunnel `food-systems-db` (`5540a019…`) = **healthy, 4 connections**.
- Ingress riktig: `fs-db.naturalstateproject.com → tcp://l0s8o8oo…:5432`.
- Access-app `food-systems-db` finnes, policy = **`any_valid_service_token`**
  (et hvilket som helst gyldig service-token slipper inn — så et korrekt
  *presentert* token ville virket).

> **Blindgate (ikke rør):** Coolify-servicen `cloudflared-db-tunnel`
> (`t0wwow4wco00ww8cowswo4kg`) crash-looper med tomt `TUNNEL_TOKEN`, men den er et
> **forlatt duplikat** — den ekte, friske connectoren kjører i containeren
> `vskowwk…` (tunnel `5540a019`). Den delte `cloudflared`-containeren (4 mnd)
> server **alle** prosjektenes app-ingress via `coolify-proxy` — rør den aldri.

Fiks = map tokenet til klientens riktige env-navn i workflowen (se §8). Ingen
server- eller CF-dashboard-endring er nødvendig hvis de eksisterende
`CF_ACCESS_*`-secretene er gyldige.

## 7. Diagnose-stige (når DB-tunnel feiler)

Jobb fra utsiden og inn. Stopp ved første røde.

1. **App oppe?** `curl -s -o /dev/null -w '%{http_code}' https://food-systems.naturalstateproject.com/api/version`
   - 200 → server+CF friske, hopp til steg 3. Ikke-200/timeout → server/Coolify-problem (steg 2).
2. **Server/Coolify:** `ssh cloudbrain 'uptime; docker ps --format "{{.Names}} {{.Status}}"'`
   — er app- og DB-containeren oppe?
3. **DB-connector på Hetzner:** `ssh cloudbrain` →
   - systemd: `systemctl status cloudflared --no-pager`
   - eller docker: `docker ps -a --format '{{.Names}}\t{{.Status}}' | grep -i cloudflar`
   - tunnel-info: `cloudflared tunnel info food-systems-db`
   - **Nede/exited → restart (se §8).**
4. **CF Access-token:** Zero Trust → Access → Applications → `food-systems-db` →
   service-token utløpt? Roter, oppdater GH-secrets `CF_ACCESS_CLIENT_ID/SECRET`.
5. **Ingress:** Zero Trust → Networks → Tunnels → `food-systems-db` →
   Public Hostname `fs-db…` → TCP `food-systems-pgvector-db:5432`. Healthy?

## 8. Fiks — map service-tokenet til riktige klientvariabler

Root cause er at `cloudflared access tcp` aldri fikk service-tokenet. Fiks i
workflowen: behold GitHub-secret-navnene, men map dem til env-navnene som
`cloudflared` 2026.7.2 faktisk leser. Dette unngår også token-secret i
prosessens argumentliste.

```yaml
env:
  TUNNEL_SERVICE_TOKEN_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}
  TUNNEL_SERVICE_TOKEN_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}

nohup cloudflared access tcp \
  --hostname "$TUNNEL_HOSTNAME" \
  --url localhost:5432 \
  > tunnel.log 2>&1 &
```

`CF_ACCESS_CLIENT_ID/SECRET`-secretene gjenbrukes; feilen var at de tidligere
ble sendt via navn klienten ignorerte. Selve tunnelprosessen arver bare de
korrekte `TUNNEL_SERVICE_TOKEN_*`-navnene.

**Verifiser:** re-kjør `prod-data-import` med target `verify-only` (manuell,
`confirm=IMPORT`) — psql-proben og `db:verify` skal nå passere uten å skrive
data. Hvis den fortsatt feiler med «bad handshake», er *da* selve
service-tokenet utløpt/ugyldig → roter det i CF Zero Trust → Access → Service
Tokens og oppdater GH-secrets `CF_ACCESS_CLIENT_ID/SECRET` (policy er
`any_valid_service_token`, så et hvilket som helst gyldig token virker).

**Rydding (valgfritt):** den forlatte `cloudflared-db-tunnel`-servicen
(`t0wwow4wco00ww8cowswo4kg`) crash-looper uten effekt — kan slettes i Coolify for
å fjerne støy. Den friske connectoren (`vskowwk…`) berøres ikke.

Jf. oppsettet i [SETUP-CF-TUNNEL-FOR-DB.md](../../SETUP-CF-TUNNEL-FOR-DB.md).

## 9. Etter gjenoppretting — verifiseringskjede

1. `prod-data-import` (manuell, `confirm=IMPORT`, target `verify-only`) → `db:verify`.
2. Hvis prod mangler data etter verifikasjon: kjør eksplisitt target `registers`
   eller `full`, ikke fri tekst / dynamisk npm-script.
3. `citation-verification` (manuell dispatch) → skal passere DB-steget.
4. Bekreft pending data-fiks A (NorgesGruppen→BAMA `source`) er i prod.

## 10. Gjenbruk på tvers av prosjektene

Samme mønster gjelder de andre Coolify/CF/Hetzner-prosjektene våre. Sjekkliste
for et nytt prosjekt:
- Skill **app-vei** (offentlig) fra **privat-vei** (CF Access service-token) — ikke
  anta at den ene er frisk fordi den andre er det.
- Bruk **autentisert probe** (psql/HTTP med token), aldri bare `nc -z`, som
  readiness — ellers maskeres tunnel-feil som forvirrende app-feil nedstrøms.
- Hold ett slikt kart per prosjekt med verifiserte UUID-er/hostnames og hvor
  hver hemmelighet bor (ikke verdiene).
- Cron-helse er ikke selvbevisende: en grønn workflow-fil betyr ikke at den
  faktisk lykkes — sjekk run-historikken (her: 2/2 feilet ubemerket i ≥10 dager).
- **Overvåk disk + skru på Docker-cleanup** på den delte Hetzner-boksen — build-
  cache og ubrukte images vokser ubegrenset og kan fylle disken og ta ned *alle*
  prosjektenes databaser samtidig (se §11).

## 11. Hendelse 2026-06-10: full disk → postgres crash-loop

**Symptom:** etter at env-var-fiksen (§8) fjernet «bad handshake», var prod-DB
fortsatt bare *intermitterende* tilgjengelig — samme workflow lyktes 20:42, feilet
21:35. Ingen tunnel-/connector-feil.

**Root cause:** Hetzner-disken var **100% full** (`/dev/sda1 291G/301G, 0 ledig`).
Postgres paniket i recovery-checkpointen:
`PANIC: could not write to file "pg_logical/replorigin_checkpoint.tmp": No space left on device`
→ crash-loop *internt* i containeren (Coolify så den som «running»,
`RestartCount=0`, `OOMKilled=false`), så DB-en var nesten aldri oppe. Dette rammet
hele boksen, ikke bare food-systems.

**Diskforbruk:** Docker **build-cache 163,6 GB (100% gjenvinnbart)** + 32 GB
ubrukte images. Stoppede containere var bare 766 MB — *å stenge idle Coolify-
prosjekter frigjør nesten ingen disk* (men hjelper RAM/last).

**Fiks:** `docker builder prune -af` → frigjorde **174 GB** (disk 100%→44%);
postgres fullførte recovery umiddelbart og kom opp (`active_conns=6`).
Helt trygt — build-cache rører aldri kjørende containere, volumes eller data.

**Forhindre gjentakelse:**
- ✅ **Ukentlig prune-cron satt opp 2026-06-11** på `cloudbrain`:
  `30 5 * * 0 /root/weekly-docker-cleanup.sh` (root crontab). Scriptet prune'r
  build-cache hver søndag, prune'r ubrukte images kun hvis disk ≥80%, og logger
  til `/var/log/weekly-docker-cleanup.log`. Gjelder hele boksen.
- Vurder i tillegg Coolify **Settings → Advanced → Docker Cleanup** (native).
- Log-rotasjon i `/etc/docker/daemon.json` (`max-size`/`max-file`).
- Diskvarsel < 15% ledig (uptime-kuma/grafana finnes allerede på boksen).
- NB: build-cache vokser raskt (~9 GB på 30 min med aktive builds) — derfor er
  ukentlig + ≥80%-sikkerhetsnett valgt.

**Diagnose-tillegg til §7:** når DB-stien er intermitterende selv om tunnelen er
frisk → SSH inn og sjekk `df -h /` + `docker exec <pg> psql -c 'select 1'`
(ser etter «in recovery mode»/«No space left on device») før du mistenker
tunnel/Access.

## 12. Hendelse 2026-06-10: prod udeploybar i ~3 uker (5-lags kaskade)

**Historisk hendelse:** `/api/version` viste `f2e2d20` (bygget 2026-05-25) selv om `main` var
mange merger foran. **En grønn Coolify-redeploy-trigger betyr ikke at buildet
lyktes** — workflowen trigget den gang redeploy, men Coolify-*buildet* feilet
hver gang. Sjekk faktisk build-status, ikke bare at trigger gikk. (Workflowen
trigger ikke lenger deploy i det hele tatt; `Auto Deploy` gjør det, og
`coolify-deploy-verify.yml` kontrollerer utfallet.)

**Hvor build-loggen ligger** (GitHub-workflowen ser bare «Deploy failed» fra
Coolify-API): i Coolify-DB-en på serveren —
`docker exec coolify-db psql -U coolify -d coolify -tAc "select logs from
application_deployment_queues where resourceable_id=<app-row-id> order by
created_at desc limit 1"` (app 66 = food-systems; logs er JSON-array med
`output`-felt per linje).

**Fem lag, hvert skjulte det neste** (alle reelle, ingen var «the» feil alene):

1. **Disk full** (§11) — drepte buildet før det startet. → prune.
2. **`npm ci` lockfile-drift** — `next-intl@4.13.0` drar `@swc/core` som krever
   `@swc/helpers >=0.5.17`, men lockfila hadde kun `0.5.15` (fra next). **npm 11
   (lokal) tolererer det som «invalid»; buildets npm 10.8.2 sin strenge `npm ci`
   nekter.** `npm run build` lokalt skjulte det (bruker eksisterende
   `node_modules`, ikke `npm ci`). → regenerer lock med `npm@10` (PR #137).
3. **Build koblet til prod-DB** — `609b257` (eierskap) la `audit:konsern` +
   `compute-coverage` i `compute-metrics`, som Prisma-spør DB-en ved build-tid.
   Build-en (`--network host`) når ikke `localhost:5432` (kun DB-container-IP-en)
   → `ECONNREFUSED`. → gjør `compute-metrics` DB-fritt; DB-stegene til
   `compute-metrics:full` (PR #138). **Build skal aldri avhenge av en levende DB.**
4. **`next build` (Turbopack)** — `src/i18n/request.ts` dynamisk-importerer
   `../../messages/<locale>.json`, men Dockerfilen `COPY`-et aldri `messages/`
   inn i builder-stagen. → `COPY messages ./messages` (PR #139).
5. Deploy grønn; `/api/version` = ny SHA. ✅

**Lærdom på tvers av prosjektene:**
- **Verifiser deploy *utfall*, ikke trigger.** Den nåværende manuelle
  **Coolify Deploy Verify** matcher `/api/version` mot valgt full SHA og krever
  grønne data-/bibliotekendepunkter uten å endre Coolify-state.
- **`npm ci` i Docker bruker en pinnet npm-versjon** (node:20-alpine → npm 10).
  Generer/oppdater `package-lock.json` med *samme* npm som buildet, ellers kan en
  nyere lokal npm produsere en lock buildets `npm ci` avviser. `npm run build`
  lokalt beviser ikke at `npm ci` passerer.
- **Builds skal være DB-frie og selvstendige.** DB-avledede artefakter committes
  og bakes inn; refresh kjøres separat der DB finnes (`compute-metrics:full`).
- **Hver fil en dynamisk import trenger må `COPY`-es eksplisitt** i en multi-stage
  Dockerfile med selektive COPY-er — Turbopack/Next feiler buildet ellers.
- **Kaskadefeil:** når flere ting er ødelagt samtidig, fikser man ett lag og får
  neste feil. Les hele build-loggen for hvert forsøk; ikke anta at én fiks løste alt.

## 13. Hendelse 2026-08-03 → 08-06: ett ugyldig API-token, tre stille utfall

**Symptom:** `coolify-db-watcher` feilet hvert 5. minutt fra 2026-08-03 14:45 UTC
— 110+ røde kjøringer over 2,5 døgn. Meldingen var `DB status: unknown`.

**Rotårsak:** ett enkelt ting. `COOLIFY_API_TOKEN`-secreten (sist skrevet
2026-05-12) pekte på et token som ble byttet ut i Coolify 3. august. API-et
svarte `{"message":"Unauthenticated."}` — gyldig JSON *uten* `status`-felt, så
`d.get('status','unknown')` ga `unknown`. Feilen så ut som en DB-tilstand.

**Tre utfall som alle så ut som separate problemer:**

| Symptom | Egentlig årsak |
|---|---|
| Watcher rød hvert 5. min | token ugyldig |
| `/api/version` frosset på en 6 uker gammel SHA | `coolify-sync` kunne ikke skrive `SOURCE_COMMIT` |
| Ingen Coolify-snapshots | samme |

Prod var **frisk hele tiden**. Appen går ikke via API-et.

**Hvorfor det tok tid å se:** watcheren avbrøt på curl-feil i *første* steg og
rakk aldri app-sjekken, så den kunne ikke si «DB-en er nede» kontra «jeg ser
ikke DB-en». Etter host-flyttingen skiftet symptomet til `parse-error` (Cloudflare
svarte HTML), og etter Access-oppsettet til `401` — tre forskjellige meldinger
for samme underliggende feil.

**Fikset (PR #338):** rekkevidde rapporteres nå separat fra helse
(`reach=ok|blocked|unreachable`), app-sjekken kjører alltid, alle Coolify-kall
sender CF-Access-headere, og `coolify-sync` har en preflight som feiler på
sekunder i stedet for å polle 12 minutter på `deploy status: ?`.

**Lærdom:**
- **En helsesjekk som ikke skiller «nede» fra «blind» er verre enn ingen.** Den
  lærer deg å ignorere den.
- **`.get(felt, 'default')` på et feilrespons-JSON skjuler auth-feil.** Sjekk
  HTTP-koden før du parser.
- **Når et symptom endrer seg etter en infra-endring, betyr det ikke at årsaken
  er ny.** Timeout → parse-error → 401 var samme døde token hele veien.
- **Token-rotasjon uten å oppdatere konsumentene er en tidsinnstilt bombe.**
  Sjekk `updated_at` på GH-secretene mot opprettelsesdato på tokens i Coolify.
