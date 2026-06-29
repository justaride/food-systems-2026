# R12-ACTOR-004 - KVANN, skogshage og fronettverk

**Dato:** 2026-06-24
**Status:** Intern R12-output, ikke claim eller ferdig import.
**Gate:** actor-gate
**Bruksregel:** Nettverk, prosjekt og organisasjonsnoder kan berike aktorkartet; enkeltgarder og EU-prosjektstatus ma ha egen primarlokator for import.

## Kort dom

KVANN er et sterkt norsk nettverksanker for nytteplantemangfold, flerArige vekster og skoghage-/agroforestry-sporet, men batchen lukker ikke et komplett aktorregister. NIBIO/Norsk genressurssenter gir A-anker for offentlig genressursforvaltning, Solhatt gir en aktorprimar kilde for norskprodusert okologisk fro, og Agroecology Partnership-siden bekrefter KVANN/Norwegian Seed Savers som norsk partner i `Root2Fork` fra 2026.

Outputen bor berike domene- og nettverkskartet, men Multistrata/Root2Fork, gardenoder og lokale fro-/skogshageaktorer ma radverifiseres for import.

## Sterkeste kilde

- KVANN hjemmeside/skoghagepost, aksessert 2026-06-24: `https://kvann.no/` og `https://kvann.no/2026/06/11/er-du-interessert-i-skoghage-eller-skogslandbruk-agroforestry/`
- NIBIO Norsk genressurssenter, aksessert 2026-06-24: `https://www.nibio.no/om-nibio/vare-fagdivisjoner/divisjon-for-kart-og-statistikk/norsk-genressurssenter`
- NIBIO Plantegenetiske ressurser, aksessert 2026-06-24: `https://www.nibio.no/tema/mat/plantegenetiske-ressurser`
- Solhatt, aksessert 2026-06-24: `https://solhatt.no/`
- Agroecology Partnership Root2Fork partners, aksessert 2026-06-24: `https://www.agroecologypartnership.eu/en/projects/root2fork/partners`

## Svakeste punkt

Feltet er nettverks- og prosjektpreget. Det finnes gode ankre for organisasjoner og noen prosjekter, men ikke en komplett apen liste over norske skoghager, frobevarere, flerArige-vekstprodusenter eller KVANN-tilknyttede garder. Root2Fork bekrefter partnerstatus, men sier ikke i seg selv hvilke norske garder som er deltakere eller hvilket importklart prosjekt-ID-oppsett repoet bor bruke.

## Funn-tabell

| Aktor / indikator | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---:|---|---|---|---|
| KVANN / Norwegian Seed Savers | 2026 | `https://kvann.no/` | A/B | Nasjonal organisasjonsnode | Organisasjonssiden er primar for egen aktivitet; medlems-/gardliste ikke apen lukket. |
| Skoghage / skogslandbruk-interessekartlegging | 2026 | KVANN skoghagepost 2026-06-11 | A/B | Aktivt nettverksspor | Invitasjon/kartlegging, ikke bevis for komplett aktorliste eller aktiv drift per gard. |
| Norsk genressurssenter | lopende | NIBIO senter-side | A | Offentlig institusjonsanker | Dokumenterer mandat/rolle, ikke praktikerliste. |
| Plantegenetiske ressurser | lopende | NIBIO temaside | A | Metode-/forstaelsesanker | Brukes for genressursramme, ikke som aktorregister. |
| Solhatt okologiske fro | 2026 | `https://solhatt.no/` | B/aktorprimar | Selskaps-/fronettverksanker | Aktorens egen markeds- og sortsinformasjon; produksjonsvolum og leverandornettverk ma aktorverifiseres. |
| Root2Fork / multi-strata agroforestry | 2026- | Agroecology Partnership project page | A | KVANN/Norwegian Seed Savers er norsk partner via Judit Feher | Prosjektnode kan importeres som kandidat; norske gardenoder ma ha egen lokator eller prosjektbekreftelse. |
| Gjoeding Gard / Hurdal-spor | 2025/2026 | Huldravisa omtale | B | Mulig norsk case/kandidat | Lokalmedia er ikke nok til import som prosjekt-/gardfakta uten KVANN/prosjekt-/aktorbekreftelse. |

## Nettverkskart - kandidatstruktur

| Node | Type | Foreslatt domene/subdomene | Importstatus |
|---|---|---|---|
| KVANN / Norwegian Seed Savers | organisasjon/nettverk | `permakultur-fleraarige` / `frobevaring` | berik eksisterende eller ny nettverksnode etter dedup |
| Norsk genressurssenter | offentlig institusjon | `institusjon-finansiering` / `genressurser` | A-anker for rolle/mandat |
| Solhatt okologiske fro | selskap/aktor | `permakultur-fleraarige` / `fro` | source-shortlist, ikke volumclaim |
| Root2Fork | prosjekt | `permakultur-fleraarige` / `agroforestry` | kandidat prosjektnode |
| KVANN skoghage-/skogslandbrukskartlegging | nettverk/arbeidsspor | `permakultur-fleraarige` / `skogshage` | actor-gate for deltakerliste |

## Tomme celler

- Komplett liste over norske skoghager, skogslandbruk og regenerativ frukthageprosjekter ble ikke funnet som apen, verifisert register.
- KVANN-medlemsliste, lokale frOsentre og gardenoder er ikke apent lukket.
- Root2Fork/Multistrata bekrefter norsk KVANN-partner, men ikke ferdig norsk deltakerledger per gard.
- Produksjonsvolum, areal, frovolum og faktisk matsystemeffekt mangler for alle praktiker-/gardnoder.

## Ikke si

- Ikke si at KVANN-listen er et komplett nasjonalt skoghage- eller frobevaringsregister.
- Ikke si at Root2Fork beviser at bestemte norske garder deltar uten prosjekt- eller aktorprimar lokator.
- Ikke si at Solhatt-volum eller norsk froandel er dokumentert utover aktorens egen tekst i denne batchen.
- Ikke bland offentlig genressursmandat med praktikerfeltets faktiske produksjonskapasitet.
- Ikke gjenta `Maad seeds` som egen node; forloperspesifikasjonen peker pa KVANN som korreksjon.

## Anbefalt gate

`actor-gate` med `source-shortlist` for Root2Fork, KVANN, NIBIO og Solhatt. Neste pass bor lage review-CSV med `node_id`, `name`, `node_type`, `domain`, `subdomain`, `locator_url`, `sourceClass`, `verificationStatus`, `confidence`, `accessedAt` og eksplisitt `notes` per node.
