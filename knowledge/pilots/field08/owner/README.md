# Field 08 owner review

Dette laget er en separat, intern eiergjennomgang. Det endrer ikke Gate 2C-pakken,
den historiske human-review-loggen, coverage-ledger, rettighetsstatus eller ekstern
claim-status.

Kjør `npm run knowledge:field08:owner:write` for deterministisk regenerering og
`npm run knowledge:field08:owner:check` for validering. Før hver beslutning skal
`npm run knowledge:field08:owner:private:check` og
`npm run knowledge:field08:owner:replay-api` være grønne.
`npm run knowledge:field08:owner:review-links` viser de hashverifiserte lokale
PDF-lenkene bare i terminalen under gjennomgangen; de skrives ikke til artefakter.

AI kan forberede pakkene, men kan ikke signere. En kvittering kan bare appendes
etter at Gabriel personlig har åpnet kilden, valgt beslutning og bekreftet den
kanoniske attestasjonsformuleringen. Kvitteringsloggen er append-only per kilde.

Ingen artefakt i `src/data/` inneholder private filstier eller PDF-bytes. Ekstern
bruk og coverage promotion er alltid blokkert i denne piloten.
