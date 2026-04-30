# Forsyningskjede country packs

Opprettet: 2026-04-29  
Formål: operativ landvis arbeidsmappe for nordisk like-dekning på `/forsyningskjede`.

Disse filene følger samme skjema:

- `no.md`
- `se.md`
- `dk.md`
- `fi.md`
- `is.md`

Hver landpakke skal være arbeidssted for kilder, gap, claim cards og importkandidater før data flyttes inn i DB eller app. Coverage-status føres i:

- `docs/project/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`

Review-kø for nye relasjoner føres i:

- `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv`

Primærkildesjekk føres i:

- `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`
- `research/review/forsyningskjede-local-primary-snapshot-2026-04-29.md`

Import-sårbarhetskort føres i:

- `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`
- `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.md`

Produksjonsserie-paritet føres i:

- `research/review/forsyningskjede-production-series-parity-2026-04-29.csv`
- `research/review/forsyningskjede-production-series-parity-2026-04-29.md`
- `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`
- `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.md`
- `research/review/forsyningskjede-production-primary-snapshot-2026-04-29.md`

Statusregel:

- `observed`: direkte observert/offentlig/statistisk data
- `estimated`: beregnet estimat med metode
- `proxy`: indirekte indikator eller erstatningsmål
- `illustrative`: visuell/skjematisk modell, ikke beslutningsdata

Ingen nye `BusinessRelationship`-rader skal importeres direkte uten review-status.
