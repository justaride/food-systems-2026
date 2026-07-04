# Mottakslogg: lokale-verdikjeder / reko / NO deepening

Dato: 2026-07-01

## Kilder og metode

- Prioritet: valgt fra live `domene-dekning-hull-2026-07-01.md` fordi `lokale-verdikjeder / reko` var største gjenværende gap (20/140, gap 120).
- Primærkilde: REKO Norge sin side `https://www.rekonorge.no/finn-din-rekoring`, som sier at kartet viser ringnavn og lenke til Facebook-gruppen.
- Ekstraksjon: offisiell Google My Maps KML-eksport fra kartet på REKO Norge-siden (`mid=1xvx6CIa6i406wG7z2u01wupMVp3avF7J`) hentet 2026-07-01.
- Dedupe: kandidatene ble filtrert mot eksisterende DB-aktører med `subdomene:reko` og mot eksisterende locator-URL-er før første 20 nye ring-lokatorer ble tatt inn.
- Kontroll mot R13: `R13-AKTOR-003-reko-ringer-tall.md` brukes som caveat: åpne kilder har ikke et datert 2025/2026 nasjonalt ringtall, produsenttall, kundetall eller omsetningstall.

## Import

- Kandidatfil: `research/_status/mvk-reko-deepening-2026-07-01-node-kandidater.csv`
- Dataset: `mvk-reko-deepening-2026-07-01`
- Kandidater: 20 lokale REKO-ringnoder.
- VerificationStatus: 20 `unverified`.
- SourceClass: 20 `primary`.
- Flagget for menneske: 20.

## Avgrensing

- Importen dokumenterer at en ring-lokator finnes i REKO Norge sitt offisielle kart per hentetidspunktet.
- Importen dokumenterer ikke at Facebook-gruppen er åpen uten innlogging, at utlevering er aktiv i 2026, at produsent-/kundetall er oppdatert, eller at nasjonalt antall ringer er fullstendig telt.
- Bruk batchen som actor-gate/kandidatkart. Ikke bruk den som claim-lock for aktiv drift, volum, omsetning eller komplett nasjonal liste.

## Neste kontroll

Alle 20 nye noder må etterkontrolleres manuelt mot Facebook-gruppe, eventuell lokal arrangørinformasjon og REKO Norge før hard claim-lock.
