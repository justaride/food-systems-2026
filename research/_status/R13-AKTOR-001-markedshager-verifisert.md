---
tittel: R13-AKTOR-001 — Markedshager fra kandidat til verifisert
dato: 2026-06-25
status: Intern R13-output — actor-gate
gate: actor-gate
---

# R13-AKTOR-001 — Markedshager fra kandidat til verifisert

| Felt | Svar |
|---|---|
| Kort dom | Markedshager Norge gir et godt primæranker for en aktørdrevet kart-/nettverksliste, og Økoguiden API gir enkelte markeds-/økologiske aktørlokatorer. Dette er likevel ikke en komplett verifisert produsent-CVS: kartet er selvinnmeldt, og aktiv drift per produsent må kontrolleres mot egen nettside, register, sesonginformasjon eller direkte aktør før ekstern bruk. |
| Sterkeste kilde | Markedshager Norge `Finn markedshager`, 2026; Økoguiden kategori/API for `Markedshage`; Småskala Grønt Norge innmelding 2026. |
| Svakeste punkt | Primærlocator finnes for nettverk og noen aktører, men ikke full aktiv-status, produksjonsomfang eller oppdatert produsentliste per gård. |
| Anbefalt gate | actor-gate |

## Funn-tabell

| Produsent/kilde | Region | Locator | Status | Kildeklasse | Caveat |
|---|---|---|---|---|---|
| Markedshager Norge kart | Norge | https://www.markedshage.no/markedshager-i-fylkene/ | Verifisert som aktør-/kartlocator, ikke produsentstatus per gård. | A/B | Siden sier registrerte bedrifter driver aktiv markedshage, men opplysninger legges inn av produsentene selv og må kontrolleres per aktør. |
| Småskala Grønt Norge | Norge | https://www.markedshage.no/nb/nyheter/2026/06/smaskala-gront-norge-har-apnet-for-innmelding/ | Verifisert ny nasjonal organisasjon/medlemskanal. | A/B | Medlemskap/organisasjon er ikke produsentregister eller aktiv drift per gård. |
| Økoguiden `Markedshage` kategori | Norge | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074 med `categoryId=9952` | 10 treff via API ved tilgang 2026-06-25. | A/B | Økoguiden er aktør-/økoguide, ikke totalregister over markedshager. |
| Bøtun Gårdsbutikk | Luster, Vestland | https://okologisknorge.no/oekoguiden/boetun-gaardsbutikk/ | Verifisert locator i Økoguiden `Markedshage`. | B | Trenger egen aktørside/register for aktiv 2026-produksjon. |
| Undeland gård | Ulvik, Vestland | https://okologisknorge.no/oekoguiden/undeland-gaard/ | Verifisert locator i Økoguiden `Markedshage`. | B | Økoguiden-treff er ikke nok til produksjonsomfang. |
| Korsviken gård | Ringsaker, Innlandet | https://okologisknorge.no/oekoguiden/korsviken-gaard/ | Verifisert locator i Økoguiden `Markedshage`. | B | Trenger sesong-/salgsstatus før "aktiv produsent". |
| Ål Markedshage | Ål | https://okologisknorge.no/oekoguiden/aal-markedshage/ | API-søk på `markedshage` gir locator, men kategori var ikke alltid eksplisitt. | B/C | Krever egen primærside eller register før verifisert. |
| Markedshagen på Dokka | Innlandet | https://okologisknorge.no/oekoguiden/markedshagen-paa-dokka/ | API-søk på `markedshage` gir locator. | B/C | Kategori/aktiv-status må valideres separat. |

## Tomme celler

- Full CSV over alle markedshager fra Google-kartet med navn, region og lenke.
- Aktiv drift 2025/2026 per produsent.
- Produksjonsareal, omsetning eller volum per produsent.
- Debio-/økologisk status per produsent der relevant.
- Dedupe mellom Markedshager Norge, Økoguiden, Småskala Grønt Norge, NLR og regionale prosjektlister.

## Ikke si

- Ikke si at Økoguiden/Markedshager Norge er et komplett nasjonalt produsentregister.
- Ikke si at alle karttreff er aktiv drift i 2026 uten per-aktør locator.
- Ikke gjøre selvinnmeldt kartstatus til verifisert volum, areal eller økonomi.
- Ikke slå sammen markedshage, andelslandbruk og småskala grønt uten tydelig driftsform.
- Ikke lage kart/figur som later som dekningen er komplett.

## Kilder hentet

| Kilde | URL | Tilgangsdato | Klasse | Bruk |
|---|---|---:|---|---|
| Markedshager Norge | https://www.markedshage.no/ | 2026-06-25 | actor-primary/network | Nettverks- og faganker. |
| Markedshager Norge, Finn markedshager | https://www.markedshage.no/markedshager-i-fylkene/ | 2026-06-25 | actor-primary/network | Kart-/aktørlocator og caveat om egeninnmelding. |
| Småskala Grønt Norge innmelding | https://www.markedshage.no/nb/nyheter/2026/06/smaskala-gront-norge-har-apnet-for-innmelding/ | 2026-06-25 | actor-primary/network | Ny nasjonal organisasjon for småskala grønt. |
| Økoguiden API kategori `Markedshage` | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074 | 2026-06-25 | actor-primary/API | Kategori- og lokatorsøk. |
| NIBIO, Markedshager - en økende trend | https://www.nibio.no/nyheter/markedshager--en-okende-trend | 2026-06-25 | research | Definisjon og forskningskontekst. |
