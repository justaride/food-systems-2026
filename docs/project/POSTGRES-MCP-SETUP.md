# Postgres MCP for Food Systems 2026

## Hva dette er

Postgres MCP gir Codex direkte, kontrollert tilgang til PostgreSQL-databasen som prosjektet bruker.

I dette prosjektet betyr det at Codex kan:

- lese ekte tabeller og rader i stedet for bare Prisma-modellene
- verifisere imports, søk, relasjoner og datakvalitet
- skrive og forklare SQL mot den faktiske databasen
- hjelpe med feilsøking når kode og database ikke stemmer overens

Databasetilkoblingen i appen kommer allerede fra `DATABASE_URL` i [src/lib/db.ts](/Users/gabrielboen/Documents/Food Systems 2026/src/lib/db.ts:1), og datastrukturen er definert i [prisma/schema.prisma](/Users/gabrielboen/Documents/Food Systems 2026/prisma/schema.prisma:1). MCP endrer ikke appen. Det gjør bare at Codex også kan snakke med databasen når du ber om det.

## Når vi bør bruke det

Postgres MCP er nyttig når vi vil:

- kartlegge schema og forstå hovedtabellene
- telle rader og bekrefte at importjobber faktisk skrev data
- finne duplikater, null-felter og ødelagte relasjoner
- sjekke dokumenter, selskaper, aktører og koblinger mellom dem
- verifisere om `pgvector`-felter og semantisk søk ser riktige ut
- sammenligne live database med Prisma når noe virker feil

Det er mindre nyttig når oppgaven bare handler om frontend, styling eller ren kode uten behov for sanntidsdata.

## Standardoppsett for teamet

Anbefalt standard er:

1. Bruk et felles MCP-servernavn: `foodsystems-postgres`
2. Bruk helst en egen read-only databasebruker for Codex
3. Pek mot lokal utviklingsdatabase eller staging, ikke produksjon som skrivebruker
4. Be alltid eksplisitt om `read-only` eller `SELECT only` i prompts når du ikke vil endre data

Viktig: MCP-oppsettet er per bruker, ikke per repo. Hver utvikler må derfor legge inn sin egen Codex-konfigurasjon lokalt.

## Aktivering på din maskin

1. Sørg for at databasen du vil bruke faktisk er tilgjengelig fra maskinen din.
2. Legg til MCP-serveren i Codex med din egen connection string:

```bash
codex mcp add foodsystems-postgres -- \
  npx -y @modelcontextprotocol/server-postgres \
  'postgresql://USERNAME:PASSWORD@HOST:5432/foodsystems?schema=public'
```

3. Verifiser at Codex kjenner til serveren:

```bash
codex mcp list
```

4. Restart Codex.
5. Åpne prosjektet igjen og bruk prompts som eksplisitt nevner `foodsystems-postgres`.

Hvis du allerede har satt opp en generisk server som heter `postgres`, fungerer det også. For teambruk er `foodsystems-postgres` lettere å forstå og mindre forvirrende på tvers av prosjekter.

## Hvordan kollegaer bruker det

En kollega får ikke dette automatisk ved å klone repoet. De må ha:

- Codex installert
- tilgang til databasen
- en egen MCP-entry i sin egen `~/.codex/config.toml`
- restartet Codex etter at entryen er lagt til

Det betyr i praksis:

- hvis de bruker lokal database, peker de på sin egen `localhost`
- hvis teamet bruker staging, peker alle på samme staging-URL
- hvis teamet bruker ulike databaser, kan Codex se ulike data selv om repoet er likt

`localhost` er alltid utviklerens egen maskin. Det peker ikke til databasen på en annen persons maskin.

## Anbefalt sikkerhetsoppsett

Hvis dere vil gjøre dette ordentlig for teamet, opprett en egen read-only bruker for Codex.

Eksempel:

```sql
CREATE ROLE foodsystems_codex_ro LOGIN PASSWORD 'replace-me';
GRANT CONNECT ON DATABASE foodsystems TO foodsystems_codex_ro;
GRANT USAGE ON SCHEMA public TO foodsystems_codex_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO foodsystems_codex_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO foodsystems_codex_ro;
```

Da kan teamet bruke en connection string som denne:

```text
postgresql://foodsystems_codex_ro:REPLACE_ME@HOST:5432/foodsystems?schema=public
```

Dette reduserer risikoen for at Codex ved et uhell kjører skrivende SQL.

## Gode standardprompts

Bruk disse som maler etter restart:

- `Use foodsystems-postgres in read-only mode to summarize the main tables in this project.`
- `Use foodsystems-postgres in read-only mode to count rows in the core tables.`
- `Use foodsystems-postgres in read-only mode to inspect Company, Actor and Document tables and explain how they connect.`
- `Use foodsystems-postgres in read-only mode to check whether vector/embedding fields are present and populated.`
- `Use foodsystems-postgres in read-only mode to find duplicate companies or suspicious missing values.`
- `Use foodsystems-postgres in read-only mode to compare the live schema to Prisma and flag mismatches.`

Hvis du vil være ekstra tydelig, legg til:

- `Do not modify data`
- `SELECT only`
- `Return the SQL you used`

## Konkrete use cases i dette prosjektet

For Food Systems 2026 er de mest praktiske use casene:

- verifisere at importerte selskaper, aktører, dokumenter og relasjoner faktisk finnes
- kontrollere at søk og semantisk søk bygger på data som virkelig er i databasen
- finne hull i datamodellen før vi bygger nye dashboards eller analyser
- forstå hvilke tabeller som er modne nok til grafer, kart eller innsiktsflater
- lage presise SQL-spørringer for analysearbeid uten å gjette på schema

## Feilsøking

Hvis det ikke fungerer:

1. Kjør `codex mcp list` og bekreft at `foodsystems-postgres` finnes.
2. Restart Codex helt.
3. Bekreft at databasen svarer fra maskinen din.
4. Bekreft at connection stringen peker til riktig host, database og schema.
5. Hvis Codex sier at MCP-serveren er ukjent, er det ofte fordi appen ikke er restartet etter konfigendringen.

## Praktisk anbefaling

Bruk Postgres MCP som et analyse- og verifikasjonsverktøy, ikke som en erstatning for migrasjoner eller vanlig applikasjonslogikk. Den beste hverdagsrutinen er:

1. Be Codex inspisere databasen i `read-only` modus
2. Bruk funnene til å skrive eller rette kode
3. Verifiser deretter på nytt mot databasen
