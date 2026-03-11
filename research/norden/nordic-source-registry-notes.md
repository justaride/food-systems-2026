# Nordic Source Registry Notes

**File:** `research/norden/nordic-source-registry.csv`  
**Created:** 11. mars 2026  
**Scope:** Norge, Danmark, Sverige, Finland, Island + tverrnasjonale kilder

## Hva dette er

Dette er en operativ kildebase for `Food Systems 2026`.

Den er laget for tre konkrete formål:

1. prioritere hvilke kilder som skal hentes først  
2. gjøre datainnhenting reproducerbar med stabile URL-er og API-endepunkter  
3. skille mellom kilder som er klare for skriptet uthenting og kilder som fortsatt krever manuell eller halvmanuell behandling

## Kolonner

| Kolonne | Betydning |
|---|---|
| `country` | Landkode eller `Nordic` for felles kilder |
| `theme` | Analytisk spor som pris, trade, agriculture, waste eller competition |
| `source_name` | Kort navn på kilde eller tabell |
| `owner` | Offentlig eier eller ansvarlig institusjon |
| `url` | Primær lenke som bør brukes i prosjektet |
| `access_method` | `api`, `portal`, `download` eller `pdf` |
| `api_base_or_endpoint` | Konkret API-endepunkt når det finnes |
| `dataset_or_table_id` | Tabellkode eller datasettnavn når det finnes |
| `update_frequency` | Oppgitt eller utledet frekvens |
| `geography_level` | Hvilket geografisk nivå data ligger på |
| `analysis_use` | Hva kilden skal brukes til i analysen |
| `priority` | Praktisk prioritet for prosjektet |
| `status` | Foreløpig status for innhenting |
| `verified_date` | Dato lenke eller API ble kontrollert |
| `notes` | Viktige filterhint eller begrensninger |

## Statusverdier

- `ready`: kan brukes direkte i uttrekk eller manuell nedlasting nå

Hvis dere senere bygger dette ut kan flere statusverdier legges til:

- `queued`
- `in_progress`
- `downloaded`
- `cleaned`
- `documented`
- `blocked`

## Viktige metodiske valg

### 1. Offentlige og primære kilder først

Registeret prioriterer offisielle statistikkinstitusjoner, direktorater, geodataportar og konkurransemyndigheter. Børsrapporter og kjedenes egne kilder er ikke hovedmateriale her selv om de fortsatt er viktige som validering.

### 2. Tabellnivå der det faktisk er mulig

For SSB, SCB, StatFin, Statistics Iceland og store deler av StatBank Denmark er det lagt inn konkrete tabell- eller datasettnøkler.

For register- og policykilder er det ofte bare portal- eller dokumentsnivå som er realistisk.

### 3. Ikke alle kilder er like maskinvennlige

Tre hovedtyper finnes i registeret:

- rene API-kilder  
- portalbaserte kilder med manuell nedlasting eller tabellvalg  
- dokumentkilder som brukes til metode, regulering eller kontrollkontekst

## Det som fortsatt mangler

Dette registeret dekker ikke alt som prosjektet kan trenge senere. Særlig mangler fortsatt:

- komplette butikkregistre per land  
- full dekning av geokodede matbutikker og grossistknutepunkter  
- kommunale eller regionale åpne data-lag per land  
- fullstendig regulatorisk saksliste per konkurransemyndighet  
- systematisk mappet matsvinndata per ledd i verdikjeden

## Anbefalt neste bruk

### Kort sikt

1. sorter CSV-en på `priority=HIGH`  
2. bygg ett uttrekksskript per land for de rene API-radene  
3. lagre råfiler i en egen `research/data/nordic/` struktur

### Middels sikt

1. legg til en kolonne for lokal filsti når data er lastet ned  
2. legg til en kolonne for ansvarlig person  
3. legg til en kolonne for siste vellykkede uttrekk

## Relaterte filer

- `research/norden/nordisk-offentlig-kildemappe.md`
- `research/source-scouting-2026-03-10.md`
- `research/norden/nordisk-komparativ-analyse.md`
- `research/data/fetch_nordic_registry_metadata.py`
- `research/norden/nordic-statistics-mcp-note.md`
