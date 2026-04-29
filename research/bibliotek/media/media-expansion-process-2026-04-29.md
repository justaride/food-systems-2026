# Media source expansion process

Dato: 2026-04-29  
Omfang: `/media` i Food Systems 2026, med 2016-2025 som historisk analysevindu og 2026 som separat watchlist.

## Naa-status

Lokal audit av mediaflaten passerer:

- `MediaCountryProfile`: 5 land
- `MediaTheme`: 6 temaer
- `MediaTimelineEntry`: 10 aar, 2016-2025
- `MediaOutlet`: 8 outlets
- `MediaEntry`: 10 kodede entries
- `MediaEntryCoding`: 10 kodingsrader

Det betyr at problemet ikke er brutt dataflyt. Problemet er dekning. Dagens side gir en nyttig narrativ oversikt, men corpuslaget er fortsatt et startsett og maa ikke leses som en full mediedatabase.

## Hovedfunn fra sideanalysen

1. Norge er eneste land med minst tre kodede entries. Sverige, Danmark, Finland og Island har for tynn corpusdekning for et robust oversiktsbilde.
2. Korpuset er sterkt myndighets- og rapportdrevet. Det gir etterproevbarhet, men underdekker faktisk redaksjonell diskusjon, kronikker, bransjesvar og konfliktlinjer.
3. Danmark, Finland og Island mangler nok uavhengige sekundærkilder til at landprofilene kan skilles godt mellom myndighetsfunn, bransjefortelling og mediereaksjon.
4. Sirkularitet, matsvinn og innovasjon finnes i prosjektets backlog, men er i liten grad koblet inn i `/media`-korpuset.
5. 2026 har allerede relevante nye signaler, men skal holdes som watchlist til vi definerer et lukket delaar eller oppdaterer historikklogikken.

## Ny arbeidsflate

Kildekoen ligger her:

`research/bibliotek/media/media-source-candidates-2026-04-29.csv`

Den skiller mellom:

- `already_in_corpus`: finnes allerede i `src/lib/data/media-corpus.ts`
- `candidate_fetch`: kan hentes/snapshotes maskinelt
- `candidate_manual`: skal ikke fullskrapes, typisk paywall eller nyhetsarkiv
- `existing_backlog`: finnes i eldre backlog og maa samordnes for a unngaa dublettarbeid
- `watch_2026`: relevant na, men holdes utenfor historisk 2016-2025-tidsserie

Etter round 2 finnes ogsaa:

- `research/bibliotek/media/media-source-review-queue-2026-04-29.csv`
- `research/bibliotek/media/media-source-review-round-1-2026-04-29.md`
- `research/bibliotek/media/media-source-review-round-2-2026-04-29.md`
- `research/bibliotek/media/snapshots/` med 39 korte snapshots

Review-køen er importporten. `media-corpus.ts` skal ikke oppdateres direkte fra scrape-resultater.

## Web-scraping-protokoll

Prosessen bruker en forsiktig cascade:

1. Sjekk URL og robots-policy foer henting.
2. Hent bare lett HTML-snapshot for `candidate_fetch` og `existing_backlog`.
3. Ikke fullskrap paywallkilder. For `candidate_manual` lagres bare metadata, tilgjengelig ingress/snippet og manuell vurdering.
4. PDF-er skal katalogfoeres og helst kobles mot eksisterende `SourceDoc`/PDF-katalog foer eventuell nedlasting.
5. Hver kilde skal kodes med land, tema, outlet, trigger, tone, frame, verifikasjonsnivaa og confidence foer import til `media-corpus.ts`.
6. Import til appen skal skje foerst etter review, ikke direkte fra scraping-output.

## Dekningsmaal foer neste import

Minimum foer vi utvider `media-corpus.ts`:

- Minst 8 kvalifiserte entries per land for Norge, Sverige, Danmark, Finland og Island.
- Minst 2 primaer-/myndighetskilder per land.
- Minst 2 uavhengige media-/bransjereaksjoner per land.
- Minst 1 sirkularitet/matsvinn/innovasjon-entry per land eller eksplisitt gapmarkering.
- Minst 1 beredskap/regulering-entry per land.
- Alle `high_paywall`-kilder maa behandles som metadata-only med kort begrunnelse.

## Prioritert ko

Foerste operasjonelle runde:

1. Kjor `npm run media:audit-candidates`.
2. Snapshot P1 `candidate_fetch`-rader med `npm run media:scrape-candidates -- --priority=P1 --status=candidate_fetch --limit=12 --write`.
3. Les scrape-rapporten og marker kilder som `ready_for_review`, `blocked`, `manual_only` eller `duplicate`.
4. Lag en reviewfil for de beste 25-35 kildene med foreslaatt media-entry-koding.
5. Importer kun review-godkjente entries til `src/lib/data/media-corpus.ts`.
6. Kjor `node --import=tsx scripts/audit-media-landscape.ts` etter import.

## Analytisk retning

Korpuset skal ikke bare bli flere lenker. Det skal bedre oversiktsbildet ved a skille:

- myndighetsfunn mot mediereaksjon
- prispress mot markedsmakt
- beredskap mot kommersiell robusthet
- sirkularitet som dokumentert omstilling mot sirkularitet som profilering
- bransjens egen forklaring mot ekstern kritikk
- historiske hendelser mot levende 2026-signaler

Neste gode output er derfor ikke en lang artikkelliste, men en reviewpakke der hver kandidat har en foreslaatt koding og en klar beslutning: importer, vent, metadata-only eller forkast.
