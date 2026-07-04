# Food Systems Knowledge MCP

## Hva dette er

`foodsystems-kb` er prosjektets kuraterte, read-only MCP-server for Food Systems 2026. Den lar Codex og andre MCP-klienter hente strukturert kunnskap fra databasen, dokumentbiblioteket, kilde-/siterbarhetslaget og den valgfrie Obsidian-vaulten uten å gi modellen fri SQL eller skriveadgang.

V1 er lokal og `stdio`-basert: hver person kjører serveren fra sin egen klon av repoet.

Kort prosess- og tilkoblingspresentasjon: [`foodsystems-kb-mcp-presentasjon.html`](foodsystems-kb-mcp-presentasjon.html).

## Hva serveren eksponerer

Tools:

- `kb_status` — sjekker DB-tilkobling, semantisk søk, radtelling og om Obsidian-vaulten finnes.
- `kb_search` — søker på tvers av dokumenter, innsikter, kilder, selskaper, aktører, personer og relasjoner.
- `kb_get_document` — henter dokumentmetadata, capped excerpt/content, lenker og citation readiness.
- `kb_get_entity` — henter selskap, aktør eller person med relasjoner og kildeindikatorer.
- `kb_trace_claim` — finner field/source citations og returnerer claim, lokatorer, readiness og confidence.
- `kb_list_gaps` — viser blokkerte, needs-review eller locator-manglende kildeposter.

Resources:

- `foodsystems://schema`
- `foodsystems://document/{slug}`
- `foodsystems://entity/{type}/{id}`
- `foodsystems://obsidian/{path}`

Prompts:

- `answer_with_citations`
- `claim_check`
- `knowledge_gap_review`

## Krav

På hver maskin:

1. Klon repoet.
2. Kjør `npm install`.
3. Kjør `npm run db:generate`.
4. Sett `DATABASE_URL` til en database brukeren har tilgang til. Bruk helst read-only DB-bruker for kollegaer.
5. Sett `OPENAI_API_KEY` bare hvis semantisk søk skal brukes. Nøkkel er ikke nødvendig for vanlig nøkkelordsøk.

Serveren skriver ikke til databasen. Den eksponerer heller ikke raw SQL.

## Lokal test

Fra repo-roten:

```bash
npm run mcp:kb:test
```

Dette verifiserer at servermodulen kan lastes og at tool/resource/prompt-listen er som forventet.

For interaktiv MCP-debugging:

```bash
npm run mcp:kb:inspect
```

Inspector åpner en lokal testflate der du kan se tools, resources og prompts før du kobler serveren inn i Codex.

## Koble til Codex

Bruk enten Codex CLI eller configfil. Serveren er lokal `stdio`, så Codex starter prosessen selv.

CLI:

```bash
codex mcp add foodsystems-kb \
  --env DATABASE_URL="$DATABASE_URL" \
  --env OPENAI_API_KEY="$OPENAI_API_KEY" \
  -- npx tsx mcp/foodsystems-kb/server.ts
```

Alternativt i `~/.codex/config.toml` eller prosjektets `.codex/config.toml`:

```toml
[mcp_servers.foodsystems-kb]
command = "npx"
args = ["tsx", "mcp/foodsystems-kb/server.ts"]
cwd = "/ABSOLUTE/PATH/TO/Food Systems 2026"
env_vars = ["DATABASE_URL", "OPENAI_API_KEY"]
enabled = true
startup_timeout_sec = 20
tool_timeout_sec = 60
```

Etter endring:

```bash
codex mcp list
```

Restart Codex. I TUI kan du bruke `/mcp` for å se at serveren er aktiv.

## Gode prompts

- `Use foodsystems-kb to search for citable sources about matsvinn and summarize only externally citable claims.`
- `Use foodsystems-kb to trace the claim "NorgesGruppen has X ownership relation" and show citation readiness.`
- `Use foodsystems-kb to inspect company REMA 1000 Norge AS and list relationships with source status.`
- `Use foodsystems-kb to list blocked source gaps relevant to actors or companies.`

## Sikkerhetsregler

- V1 er read-only.
- Ikke bruk serveren som erstatning for migrasjoner eller importskript.
- Ikke lim inn hemmeligheter i prompts.
- Ikke presenter `internal_context` eller `blocked_unsourced` som eksternt siterbare funn.
- For rå DB-diagnostikk kan `docs/project/reference/POSTGRES-MCP-SETUP.md` brukes separat, men det er ikke standard arbeidsflate for kollegaer.

## Neste fase

Streamable HTTP kan vurderes senere hvis teamet trenger én delt endpoint. Da må auth, tokenhåndtering, hosting, read-only DB-rolle og logging besluttes først.
