# Infra-økosystem: Hetzner · Coolify · Cloudflare · GitHub

Sist oppdatert: 2026-06-10. Eier-repo: `justaride/food-systems-2026`.

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
   │                                       ├── coolify-sync-source-commit  ─┐ Coolify API
   │                                       │     (push main → redeploy)      │ 77.42.43.227:8000 [V]
   │                                       ├── citation-verification (cron)  │
   │                                       └── prod-data-import (manuell)    │
   │                                             │  begge via CF Access-tunnel│
   ▼                                             ▼                           ▼
 ┌──────────────────────── Hetzner 77.42.43.227 (Coolify-host) [V] ──────────────────┐
 │  Coolify  (dashboard :8000, ikke offentlig — timeout utenfra [V])                  │
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

| Vei | Hostname | Gating | Status 2026-06-10 |
|---|---|---|---|
| **App** | `food-systems.naturalstateproject.com` | Offentlig (200 uten auth) [V] | 🟢 frisk |
| **DB-tunnel** | `fs-db.naturalstateproject.com` | CF Access **service-token** | 🔴 nede («bad handshake») |

Konsekvens: at appen er oppe sier **ingenting** om DB-tunnelen. De er separate
Cloudflare-objekter. Server, Coolify og CF-konto kan være friske mens *kun*
DB-connectoren/tokenet er nede — som nå.

## 3. Tilgangsveier

| Mål | Hvordan | Krever |
|---|---|---|
| Hetzner-shell | `ssh cloudbrain` (HostName 77.42.43.227) [V] | SSH-nøkkel i `~/.ssh/config` |
| Coolify API | `curl $COOLIFY_BASE_URL/api/v1/...` (`http://77.42.43.227:8000`) | `COOLIFY_API_TOKEN` (GH-secret) |
| Coolify dashboard | nettleser → :8000 | ikke offentlig; via server/VPN |
| Prod-Postgres | `cloudflared access tcp --hostname fs-db… --url localhost:5432` → psql/Prisma på localhost:5432 | `CF_ACCESS_CLIENT_ID/SECRET` + prod `DATABASE_URL` |
| Prod-DB-creds | Coolify API `GET /api/v1/databases/l0s8o8oo00c8gossw0gksswk` | `COOLIFY_API_TOKEN` |

Lokalt checkout har **ingen** prod-creds (`.env` = localhost). De lever i
GitHub Actions-secrets og i Coolify.

## 4. GitHub Actions-secrets/variabler (navn, ikke verdier)

`COOLIFY_API_TOKEN`, `COOLIFY_BASE_URL` (`http://77.42.43.227:8000`),
`COOLIFY_APP_UUID` (`so8ko44goccc8gcgswwscgco`), `DATABASE_URL` (prod, host
localhost:5432 — tunnelen proxyer), `CF_ACCESS_CLIENT_ID`,
`CF_ACCESS_CLIENT_SECRET`. Variabel: `CITATION_VERIFY_ENABLED=true` [V].

`cloudflared access tcp` leser `CF_ACCESS_CLIENT_ID/SECRET` automatisk fra env.

## 5. Workflow-inventar

| Workflow | Trigger | Rolle | Tunnel? |
|---|---|---|---|
| `coolify-sync-source-commit.yml` | push `main`, manuell | Setter `SOURCE_COMMIT`-env + trigger redeploy via Coolify API | nei |
| `citation-verification.yml` | cron søn 03:00 UTC, manuell | `db:verify:filehash` + url-health mot prod | **ja** |
| `prod-data-import.yml` | manuell (`confirm=IMPORT`) | Sanksjonert prod-import (start: `db:import:ownership`) + `db:verify` | **ja** |
| `coolify-db-watcher.yml` | (sjekk fila) | DB-overvåking | [A] |
| `coolify-resource-snapshot.yml` | (sjekk fila) | Ressurs-snapshot | [A] |
| `schema-migration-guard.yml` | PR | Schema-drift-gate | nei [A] |
| `pr-quality-gates.yml` | PR | Test/lint/build-gates | nei |

**Deploy-modell:** push til `main` → Coolify redeployer (kode). Buildet kjører
*ikke* data-importer. Data må synkes separat mot prod-DB — se
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

**Mest sannsynlig årsak (i rekkefølge):**
1. cloudflared DB-connectoren på Hetzner er **nede/disconnected**.
2. CF Access **service-token rotert/utløpt** (`CF_ACCESS_CLIENT_ID/SECRET`).
3. CF Tunnel `food-systems-db` unhealthy / ingress peker feil.

(DNS og CF-konto er utelukket av signalene over.)

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

## 8. Gjenoppretting av DB-connector (på Hetzner)

> Krever eksplisitt go-ahead; muterer prod-infra.

```bash
ssh cloudbrain
# Variant A — systemd:
systemctl status cloudflared --no-pager
systemctl restart cloudflared && cloudflared tunnel info food-systems-db
# Variant B — docker (hvis connector kjører som container i coolify-nettet):
docker ps -a | grep cloudflared
docker restart cloudflared-db && docker logs --tail 30 cloudflared-db
```
Forventet: connector rapporterer `Connected`/healthy. Verifiser så ende-til-ende
ved å re-kjøre `prod-data-import` (eller `citation-verification`) — psql-proben
skal nå passere i stedet for «bad handshake».

Hvis connector er borte helt: re-installer med tunnel-token fra CF-dashboardet
(`cloudflared service install <TUNNEL_TOKEN>`), jf.
[SETUP-CF-TUNNEL-FOR-DB.md](../../SETUP-CF-TUNNEL-FOR-DB.md).

## 9. Etter gjenoppretting — verifiseringskjede

1. `prod-data-import` (manuell, `confirm=IMPORT`, target `ownership`) → `db:verify`.
2. `citation-verification` (manuell dispatch) → skal passere DB-steget.
3. Bekreft pending data-fiks A (NorgesGruppen→BAMA `source`) er i prod.

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
```
