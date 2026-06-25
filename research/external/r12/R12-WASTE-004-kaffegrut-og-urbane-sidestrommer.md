# R12-WASTE-004 - Kaffegrut og urbane sidestrommer

**Dato:** 2026-06-24
**Status:** Intern R12-output, ikke claim-lock.
**Gate:** source-shortlist
**Bruksregel:** Kaffegrut-massestrom er estimat, ikke malt norsk avfallsfraksjon. Energiutnytting skal aldri plasseres hoyere enn R9 recover.

## Kort dom

Norsk kaffeimport kan kildeankres i SSB 08801, og kaffegrut kan estimeres fra kaffevolum med publiserte spent-coffee-ground-faktorer. Men norsk avfallsstatistikk skiller ikke ut kaffegrut som egen fraksjon; den ligger i praksis under matavfall/vatorganisk avfall eller restavfall avhengig av sortering. Resultatet bor brukes som source-shortlist og datagap-notat, ikke som ferdig norsk massestrOmclaim.

## Sterkeste kilde

- SSB 08801 download hub/API, aksessert 2026-06-24: `https://www.ssb.no/en/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- SSB Avfallsregnskapet, aksessert 2026-06-24: `https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallsregnskapet`
- Miljodirektoratet, krav til utsortering av matavfall, aksessert 2026-06-24: `https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-myndigheter/utsortering-og-materialgjenvinning-av-avfall/avfallstyper-og-krav-til-utsortering/`
- Landbruksdirektoratet/Mattilsynet/Miljodirektoratet/SSB, rapport om matavfall og matsvinn-statistikk, aksessert 2026-06-24: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Rapport%20Matavfall%20og%20matsvinn%20forslag%20til%20ny%20definisjon%20og%20videre%20statistikkutvikling.pdf`
- Review om coffee-processing waste og SCG-faktorer, aksessert 2026-06-24: `https://pmc.ncbi.nlm.nih.gov/articles/PMC8814275/`

## Svakeste punkt

Det finnes ingen apen norsk kilde i denne batchen som maler "kaffegrut generert" eller "kaffegrut disponert" separat. Importvolum er heller ikke identisk med konsumert kaffe samme ar, og grutfaktor varierer mellom gronn kaffe, brent kaffe, bryggemetode, torr/vat vekt og ekstraksjonsgrad.

## Massestromtabell

| Strom / indikator | Verdi | Enhet | Ar | Geo | Metode | Kildeklasse | Caveat |
|---|---:|---|---:|---|---|---|---|
| HS0901 kaffeimport, sum varekoder 090111, 090112, 090121, 090122, 090190 | 35 668 | tonn Q1 | 2024 | NO | SSB 08801 API, import, alle land, kg summert | A | Importert mengde, ikke konsumert mengde eller rAkaffeekvivalent. |
| NKI netto rAkaffeomtale | 42 587 150 | oppgitt som "tonn" pa siden | 2024 | NO | NKI omtale basert pa SSB + medlemsrapportering | B | Enheten pa siden framstar som skrive-/formatfeil; ma ikke brukes som hard tonnclaim uten kontroll. |
| Estimert torr kaffegrut, lavt anker | ca. 23 200 | tonn torr SCG | 2024 | NO | 35 668 tonn kaffeimport * 0,65 tonn SCG per tonn gronn kaffe | B/estimert | Grov metodebro; importmix inkluderer brent/decaf. |
| Estimert torr kaffegrut, hoyt anker | ca. 32 500 | tonn torr SCG | 2024 | NO | 35 668 tonn kaffeimport * 0,91 kg torr SCG per kg malt/brent kaffe | B/estimert | Ikke norsk maling; faktor for brygget/malt kaffe, ikke all import. |
| Kaffegrut som avfallsfraksjon | Ikke separat | - | 2024/2026 | NO | SSB avfallsregnskap + matavfall-statistikkutvikling | C | Kaffegrut skjules i matavfall/restavfall; egen fraksjon ikke funnet. |

## Disponeringstabell

| Strom | Dagens kildegrunnlag | R-niva | Kildeklasse | Caveat |
|---|---|---|---|---|
| Kildesortert kaffegrut fra husholdning | Kommunale/sorteringsveiledere klassifiserer kaffegrut som matavfall; Miljodirektoratet krever separat innsamling av matavfall fra husholdninger | R3/R9 avhengig av behandling | B/C | Nasjonal andel kaffegrut til biogass/kompost er ikke malt separat. |
| Kaffegrut i restavfall | Ikke direkte malt; folger av manglende utsortering eller lokale ordninger | R9 ved energiutnytting/forbrenning | C | Ingen egen norsk serie for kaffegrut i restavfall. |
| HORECA/storkjokken-kaffegrut | Ikke separat i kildene | C | C | Krever virksomhets-/avfallsaktor-data; ikke hent Gruten eller enkeltaktor-throughput i denne batchen. |
| Urbane sidestrommer bredere enn kaffe | Matavfall er statistikkfelt; kaffegrut er ikke egen underfraksjon | PCQ-kandidat | A/C | Egnet for datagapfigur, ikke volumfordeling per sidestrom. |

## Tomme celler

- Ingen norsk offentlig kaffegrut-serie i tonn/Ar.
- Ingen apen nasjonal fordeling mellom husholdning, HORECA og arbeidsplasskaffe.
- Ingen apen nasjonal andel kaffegrut til biogass, kompost, forbrenning eller annet.
- Ingen trygg per-aktor throughput for Gruten eller andre urbane kaffegrutaktorer uten actor-gate.

## Ikke si

- Ikke si at Norge genererer et eksakt antall tonn kaffegrut per Ar.
- Ikke si at kaffegrut i Norge hovedsakelig gar til biogass uten kildesorterings-/behandlingsdata.
- Ikke bruk NKI-sidens "42 587 150 tonn" bokstavelig som tonnclaim uten enhetskontroll.
- Ikke gjore internasjonale SCG-faktorer til norsk malt statistikk.
- Ikke plassere energiutnytting over R9 recover.
- Ikke gjenopplive norsk kaffegrut-til-biogass-pilotclaim uten ny primarkilde.

## Anbefalt gate

`source-shortlist`. Kaffegrut er nyttig som type-C datagap og estimert massestrom, men ma gjennom PCQ/metodebro for eventuell figur. Neste steg er en liten metodefil som skiller `import`, `konsum`, `torr SCG`, `vat SCG`, `husholdning`, `HORECA` og `behandling`.
