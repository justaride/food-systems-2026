# MCP Connector Analysis — Food Systems 2026

> Studie av hvilke MCP-koblinger som gir høyest verdi for prosjektet.
> Dato: 2026-06-14 · Forfatter: agent-analyse · Status: forslag til vurdering

## Sammendrag (Executive Summary)

Food Systems 2026 er tre ting samtidig — en **kunnskapsbase** (dokumenter, aktører, selskaper, innsikt), en **analyseapp** (søk, grafer, dashboards) og en **investigativ kartlegging** av eierskap, styreverv, økonomi og maktstrukturer i norsk/nordisk matsektor. MCP-koblinger bør derfor måles mot én ting: *gjør de det raskere og mer etterprøvbart å fylle og verifisere databasen* (`Company`, `CompanyOwnership`, `BoardMember`, `PersonProfile`, `Subsidy`, `BusinessRelationship`), og å drifte/levere appen.

Konklusjonen er at de mest verdifulle koblingene **ikke** er de store kommersielle selskapsdatabasene (D&B, S&P, PitchBook). De er dårlig dekket på norske privateide selskaper og koster mye. Den klart høyeste verdien ligger i:

1. **Brønnøysundregistrene (brreg) MCP** — direkte, gratis tilgang til Enhetsregisteret: selskaper, roller, styremedlemmer, datterselskaper. Treffer kjernen av datamodellen og er allerede prosjektets foretrukne kilde (`offentligdata`). **Topp-prioritet.**
2. **GitHub MCP** — repoet `justaride/food-systems-2026` er kilde til sannhet og auto-deployer til Coolify/Hetzner. Offisiell remote-server finnes. **Topp-prioritet for drift.**
3. **Postgres MCP (self-hosted)** — direkte spørringer mot prod-/dev-databasen for audit, dataverifisering og `db:audit`-type sjekker uten å skrive engangsskript. **Høy verdi, men krever egen konfig (ikke ett-klikks i registeret).**

Allerede tilkoblet og relevant: **Notion, Google Drive, PubMed, Exa, Figma, Gmail**. Disse dekker dokumenthåndtering, akademiske kilder og web-søk. Hovedgapet er **strukturerte norske offentlige data** (foretaks-, regnskaps-, tilskudds- og innkjøpsregistre), som i dag hentes manuelt.

---

## Metode

Analysen kobler prosjektets faktiske flater mot tilgjengelige MCP-er:

- Lest `.claude/`-guidene: `project-context.md`, `database.md`, `data-imports.md`, `company-registry.md`, `research-workflows.md`.
- Identifisert datamodellene som driver verdien: `Company`/`orgNr`, `CompanyFinancial`, `Shareholder`, `BoardMember`, `CompanyOwnership`, `BusinessRelationship`, `PersonProfile`, `Subsidy`, `CompanyProperty`.
- Søkt i MCP-registeret på syv kategorier: database, GitHub/kode, selskap/eierskap, nyheter/media, akademisk, web-scraping, fillagring.
- Kryssjekket mot web for å bekrefte at relevante servere finnes (brreg open API + community-MCP-er; offisiell GitHub remote-server).
- Sett funnene opp mot prosjektets egne kildepreferanser (`offentligdata`, PubMed, Notion, Figma, Google Drive) og kildeattribusjonspolicyen.

---

## 1. Allerede tilkoblet — inventar

| MCP | Status | Hva det dekker i dette prosjektet |
|---|---|---|
| **Notion** | Tilkoblet | Arbeidsnotater, redaksjonell flyt, deling av research |
| **Google Drive** | Tilkoblet | Kilde-PDF-er, regneark, deling — kobler mot `SourceDoc`/`Document`-intake |
| **PubMed** | Tilkoblet | Akademisk litteratur (matsvinn, sirkulærøkonomi, helse) → `Thesis`/`Report` |
| **Exa** | Tilkoblet | Web-søk + kildeoppdaging for download-backlog |
| **Figma** | Tilkoblet | Design/diagram for dashboards og grafvisninger |
| **Gmail** | Tilkoblet | Korrespondanse, kildeinnhenting, varsler |

Dette er et solid fundament for **tekst og dokumenter**. Det som mangler er **strukturerte registerdata** og **drift av selve appen**.

---

## 2. Tier 1 — høyest verdi (anbefales)

### 2.1 Brønnøysundregistrene (brreg) MCP — *kritisk*

**Hvorfor:** Datamodellen er bygget rundt norske `orgNr` fra Brønnøysund. Hver eneste `import-*-tree.ts` (NorgesGruppen, Coop, Reitan, Orkla, Nortura, Tine, Mowi, SalMar, Lerøy, Bama, Kavli, Asko, Felleskjøpet …) handler om å bygge `Company` + `CompanyOwnership` + `BoardMember` + `PersonProfile`. Det er nøyaktig det Enhetsregisteret leverer gratis og uten API-nøkkel.

**Hva det gir:**

- Oppslag på selskap (navn, `orgNr`, NACE/næringskode, adresse, status, ansatte).
- **Roller og styremedlemmer** → mater `BoardMember` og `PersonProfile` (inkl. interlocking directors via `personKey`).
- **Datterselskap/konsernstruktur** → mater `CompanyOwnership` (parent→child).
- **Regnskapstall** (Regnskapsregisteret, nøkkeltall fra 2018+) → mater `CompanyFinancial`.

**Tilgjengelighet:** Enhetsregisteret er åpne data, gratis, ingen nøkkel. Flere community-MCP-servere finnes allerede:
- `hellosverre/brreg-mcp` — Enhetsregisteret, selskap/roller/underenheter, ingen API-nøkkel.
- `reidar80/BRREG-MCP` — selskap, datterselskap, styremedlemmer, frivillige organisasjoner.
- `daveHylde/brreg-mcp-server` — selskapssøk + detaljert selskapsinfo.

**Forbehold:** Roller koblet til *fødselsnummer* krever JWT-autorisert API (signert grant mot `…/autorisert-api`). Det meste prosjektet trenger (styreverv på navn, eierstruktur via underenheter) ligger i det åpne laget. Regnskaps-API-et er merket som midlertidig FoU og kan trekkes — bygg en cache/idempotent upsert (som dere allerede gjør) så dere ikke blir avhengige av live-kall.

**Passer policyen:** `research-workflows.md` lister allerede `offentligdata` som foretrukket kilde for norsk selskaps- og personregisterarbeid. Dette formaliserer den preferansen som et verktøy.

### 2.2 GitHub MCP — *kritisk for drift*

**Hvorfor:** `project-context.md` slår fast at kilde til sannhet er `justaride/food-systems-2026`, at auto-deploy fra GitHub forventes, og at Vercel aldri skal brukes. En GitHub-kobling lar agenten lese issues/PR-er, inspisere CI/deploy-status, åpne PR-er for importskript og databasemigrasjoner, og spore build-feil — uten manuell kontekstflytting.

**Tilgjengelighet:** Offisiell remote GitHub MCP-server (`github/github-mcp-server`) i public preview siden juni 2025; autentiseres med OAuth eller personal access token. Ingen lokal installasjon nødvendig for remote-varianten.

**Verdi her spesifikt:** issues/PR-triage på importskriptene, oppfølging av Coolify-deploy fra commits, og kobling mellom researchrunder (backlog-CSV-endringer) og faktiske commits.

### 2.3 Postgres MCP (self-hosted) — *høy verdi, krever konfig*

**Hvorfor:** Prosjektet kjører Prisma 7 + PostgreSQL + `pgvector`. I dag krever enhver integritetssjekk eller telling et engangs-`tsx`-skript eller `npm run db:audit`. En Postgres-MCP gir read-only (eller avgrenset) direkte spørring: «hvor mange `CompanyOwnership`-kanter mangler `source`?», «hvilke `Company` har `orgNr` men ingen `CompanyFinancial`?», «finn self-leasing-flagg i `CompanyProperty`». Det akselererer både `data-imports`-audit og `CITABLE-KNOWLEDGE-BASE-STATUS`-verifisering.

**Tilgjengelighet:** Registeret tilbyr **vertsbaserte** Postgres-er (PlanetScale, Supabase, MotherDuck, BigQuery) — men dere kjører **self-hosted på Hetzner**, så ingen av disse passer ett-klikks. Bruk i stedet en generisk Postgres-MCP (f.eks. `modelcontextprotocol`-referanseserveren eller `crystaldba/postgres-mcp`) pekt mot en **read-only**-rolle på dev/replika.

**Sikkerhetsforbehold:** Koble mot en read-only DB-bruker og helst en replika, ikke prod-primær. Bygg-containeren når uansett ikke prod-Postgres (jf. `CLAUDE.md`), så dette er et utviklings-/analyseverktøy, ikke en del av deploy-kjeden.

---

## 3. Tier 2 — sterk verdi (vurder etter Tier 1)

### 3.1 Web-ekstraksjon: Tavily eller Nimble

**Hvorfor:** Download-backlog-systemet (`research/evidence-pack/*.csv`) lever av å finne, hente og strukturere kilde-URL-er (status `url_only` → `downloaded`). Exa dekker *søk*; Tavily/Nimble legger til robust **extract/crawl/map** — hente ren tekst fra årsrapporter, regulatoriske PDF-er og nyhetssaker i bulk, og kartlegge nettsteder for nye kilder. Treffer `INCOMING-SOURCES`, `URL-HEALTH` og intake-pipelinen direkte.

- **Tavily:** `search`, `extract`, `crawl`, `map`, `research` — enkelt, agent-vennlig.
- **Nimble:** `search` + `extract`/`crawl` med async-jobber — bedre for store volum og vanskelige sider.

**Merk:** Noe overlapp med Exa og Chrome-verktøyene som allerede finnes. Lavere prioritet hvis dagens søk/henting holder.

### 3.2 Norske offentlige data uten ferdig MCP — *bygg egen connector*

Disse har **åpne API-er** men ingen ferdig registreringsbar MCP. De matcher prosjektets datamodell så godt at en liten egenbygget MCP (eller importskript via eksisterende mønster) gir høy avkastning. Aligner med `offentligdata`-preferansen og `create-cowork-plugin`/`skill-creator`-verktøyene dere allerede har.

| Kilde | API | Mater modell | Verdi |
|---|---|---|---|
| **SSB / Statistisk sentralbyrå** | PxWebApi (`data.ssb.com`) | kontekst/innsikt, benchmarks | Markedskonsentrasjon, matpriser, jordbruksstatistikk — tallgrunnlag for analyser |
| **Landbruksdirektoratet** | Åpne tilskuddsdata | `Subsidy` | Direkte kilde til jordbruks-/produksjonstilskudd — i dag svakt dekket |
| **Doffin / TED** | Offentlige anskaffelser | `BusinessRelationship`, offentlig etterspørsel | Innkjøp/kontrakter i offentlig matsektor (kantiner, helseforetak) |
| **Mattilsynet** | Smilefjes/virksomhetsregister | `CompanyProperty`, anlegg | Fysiske matanlegg, tilsyn — kobler eierskap til lokasjon |
| **Konkurransetilsynet** | Vedtak/avgjørelser | `Insight`, `Report` | Konkurransesaker i dagligvare — kjernetema i korpuset |

**Anbefaling:** Start med **Landbruksdirektoratet (tilskudd)** og **SSB** — de fyller de tynneste delene av modellen (`Subsidy`, tallgrunnlag) og er rent åpne data.

### 3.3 Box / NetDocuments (kun hvis kilde-PDF-er bor der)

Google Drive er allerede tilkoblet og dekker fillagring. Box/Egnyte/NetDocuments er bare relevant hvis deler av kildearkivet faktisk ligger i et av disse systemene. Ellers: hopp over (unngå overlappende fillager-MCP-er).

---

## 4. Tier 3 — situasjonsbestemt / sannsynligvis ikke verdt det

| MCP | Vurdering |
|---|---|
| **D&B Risk Analytics, S&P Global, Moody's** | Sterke på *global* selskapsrisiko og UBO, men dyre enterprise-avtaler og svak granularitet på norske *privateide* selskap. Brønnøysund dekker det samme gratis for norsk scope. **Skip** med mindre dere trenger internasjonal UBO-sporing utenfor Norden. |
| **PitchBook, CB Insights, Harmonic, Aura, Quartr, FMP** | Bygget for venture/PE/børs-analyse. Treffer dårlig på kooperativer (Tine, Nortura, Felleskjøpet, Coop) og familieeide konsern (Reitan) som dominerer norsk matsektor. **Skip.** |
| **MT Newswires / finansnyheter** | Engelskspråklig finanspresse — dårlig dekning av norsk matpolitikk/dagligvare. Norsk medie­overvåking løses bedre med Exa/Tavily + spesifikke domener (e24, NRK, Nationen, Dagligvarehandelen). **Skip dedikert MCP.** |
| **Lusha / G2 / Ahrefs / PostHog / Datadog** | Salgs-, SEO- og produktanalyse — ikke relevant for et research-/kunnskapsbaseprosjekt. **Skip.** |
| **Lucid / Miro** | Diagram/whiteboard. Figma er allerede tilkoblet og dekker visuelt behov. **Skip** med mindre teamet aktivt bruker Lucid/Miro. |

---

## 5. Anbefalt rekkefølge

1. **Brønnøysund-MCP** (community-server, ingen nøkkel) — pilot mot ett konsern (f.eks. NorgesGruppen-treet) og sammenlign mot eksisterende importerte data for å validere dekning.
2. **GitHub-MCP** (offisiell remote) — koble for issue-/PR-/deploy-innsyn på `justaride/food-systems-2026`.
3. **Postgres-MCP** (read-only rolle mot dev/replika) — for audit- og verifiseringsspørringer.
4. **Tavily eller Nimble** — kun hvis download-backlog-henting trenger mer enn Exa/Chrome i dag.
5. **Egenbygget MCP for Landbruksdirektoratet + SSB** — bruk `create-cowork-plugin`/`skill-creator` og importskript-mønsteret; fyller `Subsidy` og tallgrunnlag.

## 6. Risiko og forbehold

- **Personvern:** Roller koblet til fødselsnummer i Enhetsregisteret krever autorisert (JWT-signert) API og har juridiske vilkår. Hold dere til styreverv-på-navn og åpne underenhetsdata med mindre dere har grunnlag for det autoriserte laget. Følg prosjektets `source-attribution-policy.md`.
- **Live-API vs. snapshot:** Regnskaps-API-et er merket midlertidig FoU. Behold idempotente upserts og lokal cache så korpuset er reproduserbart og citerbart (jf. claim-lock / validation-gate).
- **DB-sikkerhet:** Postgres-MCP kun mot read-only rolle, aldri prod-primær; bygg-kjeden skal forbli DB-fri.
- **Overlapp:** Unngå å koble flere MCP-er som gjør det samme (fillager, web-søk). Det øker bare verktøystøy og kontekstbruk.
- **Kildeintegritet:** Alt som hentes via MCP og brukes i eksterne påstander må fortsatt gjennom claim-lock, source-locator og validation-gate før det regnes som citerbart.

---

### Kildehenvisninger

- [Brønnøysund — Datasets and API](https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/)
- [Brønnøysund — Open data](https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/open-data/)
- [Enhetsregisteret API-dokumentasjon](https://data.brreg.no/enhetsregisteret/api/dokumentasjon/en/index.html)
- [hellosverre/brreg-mcp (GitHub)](https://github.com/hellosverre/brreg-mcp)
- [reidar80/BRREG-MCP (GitHub)](https://github.com/reidar80/BRREG-MCP)
- [daveHylde/brreg-mcp-server (GitHub)](https://github.com/daveHylde/brreg-mcp-server)
- [Remote GitHub MCP Server — public preview (GitHub Changelog)](https://github.blog/changelog/2025-06-12-remote-github-mcp-server-is-now-available-in-public-preview/)
- [github/github-mcp-server (offisiell)](https://github.com/github/github-mcp-server)
