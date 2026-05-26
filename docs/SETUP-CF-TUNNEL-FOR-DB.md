# Setup: Cloudflare Tunnel for prod-DB (citation-verification cron)

Date: 2026-05-26
Mål: Eksponere prod-postgres via Cloudflare Tunnel slik at GitHub Actions cron-workflow kan kjøre `db:verify:filehash` + `db:verify:url-health` mot prod uten å åpne firewall eller eksponere DB-en offentlig.

Forutsetninger:
- Coolify-hostet PostgreSQL container `food-systems-pgvector-db` (UUID `l0s8o8oo00c8gossw0gksswk`)
- Hetzner-server `77.42.43.227` (Coolify-host)
- Cloudflare-konto med Zone for `naturalstateproject.com`
- Eksisterende CF Access for `food-systems.naturalstateproject.com` (app)

## Arkitektur

```
GitHub Actions runner
  → cloudflared access tcp (proxies localhost:5432)
    → Cloudflare edge (CF Access service token auth)
      → cloudflared tunnel on Hetzner
        → Coolify Docker network
          → food-systems-pgvector-db:5432
```

DB-en eksponeres aldri på Hetzner public IP. CF Access verifiserer service token før tunnel-data slipper inn.

## Del 1: Cloudflare-side (du gjør i dashboard)

### 1.1 Opprett Tunnel

1. Zero Trust dashboard: https://one.dash.cloudflare.com
2. **Networks** → **Tunnels** → **Create a tunnel**
3. Type: **Cloudflared**
4. Tunnel name: `food-systems-db`
5. Click **Save tunnel**
6. **Kopier tunnel token** (lang base64-streng) — du trenger den i del 2

### 1.2 Konfigurer ingress (etter at tunnel kjører)

Under **Public Hostname**:
- Subdomain: `db`
- Domain: `food-systems.naturalstateproject.com`
- Path: (tom)
- Service Type: **TCP**
- URL: `food-systems-pgvector-db:5432`  (Coolify-intern Docker hostname)

Eller bruk Postgres container IP hvis hostname ikke resolves (sjekk `docker network inspect`).

### 1.3 Opprett Access Application

1. **Access** → **Applications** → **Add application**
2. Type: **Self-hosted**
3. Application name: `food-systems-db`
4. Session duration: `24 hours`
5. Application domain: `db.food-systems.naturalstateproject.com`
6. **Identity providers**: leave default
7. **Service Auth** policy:
   - Action: **Service Auth**
   - Include: **Service Token** → opprett ny: `github-actions-citation-verify`
   - **Kopier Client ID + Client Secret** — disse går i GitHub Secrets (del 3)

## Del 2: Hetzner-side (SSH til serveren)

```bash
ssh root@77.42.43.227

# Installer cloudflared (Debian/Ubuntu)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
dpkg -i cloudflared.deb

# Kjør tunnel som systemd-service med token fra 1.1
sudo cloudflared service install <TUNNEL_TOKEN_FRA_1.1>

# Verifiser
systemctl status cloudflared
cloudflared tunnel info food-systems-db
```

Tunnel bør koble seg til CF og rapportere `Status: Connected`.

**Alternativ**: Hvis Coolify-Docker har egen network, kjør cloudflared som Docker-container i samme network:

```bash
docker run -d --restart=unless-stopped \
  --network coolify \
  --name cloudflared-db \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token <TUNNEL_TOKEN>
```

## Del 3: GitHub-side (du gjør i repo settings)

GitHub repo → **Settings** → **Secrets and variables** → **Actions**

### Secrets (3 stk):

| Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://<bruker>:<passord>@localhost:5432/foodsystems` (sti hentes fra Coolify) |
| `CF_ACCESS_CLIENT_ID` | Client ID fra 1.3 |
| `CF_ACCESS_CLIENT_SECRET` | Client Secret fra 1.3 |

DB-creds (bruker/passord) henter du via Coolify API:
```bash
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  "$COOLIFY_BASE_URL/api/v1/databases/l0s8o8oo00c8gossw0gksswk" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{d[\"postgres_user\"]}:{d[\"postgres_password\"]}@localhost:5432/{d[\"postgres_db\"]}')"
```

### Variables (1 stk):

| Name | Value |
|---|---|
| `CITATION_VERIFY_ENABLED` | `true` |

## Del 4: Test workflow

Etter alle stegene over:

1. GitHub repo → **Actions** → **Citation Verification**
2. Click **Run workflow** → **Run workflow** (manual dispatch)
3. Sjekk logg: bør si `Target host: localhost` (på CF-tunnel-side) og fullføre uten error

## Tilbakerullings-/feilsøk-sjekk

- **`Connection refused localhost:5432`** i GitHub Actions: `cloudflared access tcp` startet ikke. Sjekk install-step i workflow.
- **`401 Unauthorized` fra CF**: Service token ID/Secret feil eller Access-policy mangler service auth.
- **`pg: connection timeout`**: Tunnel er oppe men ingress peker feil sted. Sjekk service URL i 1.2.
- **DB-passord ble endret**: oppdater `DATABASE_URL`-secret i GitHub.

## Verifikasjons-checklist

- [ ] CF Tunnel `food-systems-db` eksisterer + status `HEALTHY`
- [ ] DNS-record `db.food-systems.naturalstateproject.com` → CNAME peker til tunnel
- [ ] CF Access app `food-systems-db` med service-token-policy aktiv
- [ ] `cloudflared service` kjører på Hetzner
- [ ] GitHub Secrets: DATABASE_URL, CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET
- [ ] GitHub Variable: CITATION_VERIFY_ENABLED=true
- [ ] Manual workflow_dispatch fullfører uten error
