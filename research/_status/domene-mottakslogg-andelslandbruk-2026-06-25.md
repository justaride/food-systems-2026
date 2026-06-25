# Mottakslogg: lokale-verdikjeder / andelslandbruk / NO

Dato: 2026-06-25

## Kilder og metode

- Registreringspass: Oekoguiden API `/Umbraco/Api/EcoGuideApi/Search/8074` med `categoryId=8467` (Andelslandbruk).
- API-resultatet ga 71 rader. Denne runden valgte 13 ikke-dupliserte noder for aa naa cellegulvet sammen med eksisterende 7 kartlagte noder.
- Agent-fanout: ikke brukt for denne cellen i denne runden, fordi den strukturerte registerkilden var nok til aa naa gulvet.

## Import

- Kandidatfil: `research/_status/domene-andelslandbruk-node-kandidater-2026-06-25.csv`
- Dataset: `domene-andelslandbruk-2026-06-25`
- Nye noder: 13
- Berikede eksisterende noder: 0
- Droppet: 0
- VerificationStatus: 13 `machine_verified`, 0 `unverified`
- Flagget for menneske: 0

## Dekningsdelta

- Foer import: 7 / 93 kartlagt, hull 86
- Etter import: 20 / 93 kartlagt, hull 73
- Status: mettet for denne kjoeringen, fordi `mapped_count >= min(20, estimated_universe)`.

## Neste kontroll

Oekoguiden-radene er register-/guideverifiserte for eksistens, men org.nr og juridisk enhet er ikke kontrollert i denne cellerunden.
