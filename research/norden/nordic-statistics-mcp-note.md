# Nordic Statistics MCP - parkeringsnotat

**Opprettet:** 11. mars 2026  
**Status:** Parkert for senere vurdering  
**Formål:** Kort teknisk notat om en mulig MCP-server over nordiske statistikk-API-er

## Hva dette er

Dette notatet oppsummerer en mulig framtidig `Nordic statistics MCP` for prosjektet.

Tanken er ikke en generell "sporr hva som helst"-server, men en kuratert MCP som kan gi agentvennlig tilgang til de viktigste nordiske statistikkskildene som prosjektet allerede bruker.

## Hvorfor vi ikke prioriterer dette na

Prosjektets naevaerende flaskehals er ikke mangel pa et MCP-lag. Den praktiske jobben na er a hente ut, lagre, dokumentere og sammenstille data fra identifiserte API-er.

Med andre ord:

- kildene er i stor grad identifisert
- flere endepunkter er allerede verifisert
- neste verdi ligger i faktiske uttrekk, ikke i et nytt grensesnittlag

## Grunnlag som allerede finnes

Prosjektet har allerede et tydelig fundament for dette arbeidet:

- `research/norden/nordic-source-registry.csv`
- `research/data/fetch_price_series.py`
- `research/data/fetch_nordic_registry_metadata.py`
- `research/data/nordic/registry-metadata/`

Dette betyr at et framtidig MCP-spor ikke vil starte fra blanke ark. Det kan bygges direkte pa eksisterende kilderegister, tabell-ID-er, metadatafiler og uttrekkslogikk.

Per 11. mars 2026 viser `run-summary.json` i `research/data/nordic/registry-metadata/` at:

- 54 API-kilder med `HIGH` prioritet ble vurdert
- 45 kunne hentes direkte som metadata
- 6 krevde query-design
- 3 krevde autentisering
- 0 feilet

## Hva en framtidig MCP bor vaere

Hvis dette tas opp igjen senere, bor `v1` vaere smal og prosjektspesifikk.

### Anbefalt avgrensing

- pris
- handel
- selvforsyning / matbalanse
- jordbruk
- avfall

Ikke bland inn foretaksregistre, regulatoriske dokumenter eller geodata i samme forste versjon.

### Anbefalte adaptere

- `Eurostat adapter`
- `SSB adapter`
- `StatBank Denmark adapter`
- `PxWeb adapter` for SCB, StatFin, Statistics Iceland og Luke

### Anbefalte tools

- `list_food_datasets(country, theme)`
- `describe_dataset(source_id)`
- `get_time_series(source_id, filters, start, end)`
- `compare_food_prices(countries, metric, start, end)`
- `get_trade_dependency(country, commodity_group, years)`
- `get_self_sufficiency(country, commodity, years)`

## Nar vi bor ta dette opp igjen

Dette er verdt a gjenoppta hvis en eller flere av disse situasjonene oppstar:

- de samme sporringene gjentas pa tvers av land og tema
- manuelle adaptere begynner a bli vanskelige a vedlikeholde
- prosjektet trenger mer agentdrevet analyse direkte mot live statistikk
- det oppstar behov for en standardisert mal for provenance, query-payload og uttrekksdato

## Det operative fokuset na

Det som gir mest verdi akkurat na er:

1. hente ut data fra de identifiserte API-kildene
2. lagre rafiler og/eller normaliserte filer i en tydelig struktur
3. dokumentere filtervalg, payloads og siste vellykkede uttrekk
4. prioritere `HIGH` + `api`-radene i kilderegisteret

## Relaterte filer

- `research/norden/nordic-source-registry.csv`
- `research/norden/nordic-source-registry-notes.md`
- `research/norden/nordisk-offentlig-kildemappe.md`
- `research/data/fetch_price_series.py`
- `research/data/fetch_nordic_registry_metadata.py`
- `research/data/nordic/registry-metadata/run-summary.json`
