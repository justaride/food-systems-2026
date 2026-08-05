# RAPPORT — skive B1_sirk_konk_b (sirkulære konkurser)

Innhentingssesjon 2026-08-05. 15 manifestrader. Tema: sirkulær-konkurser (RAS-akvakultur, insektprotein, vertical farming, sirkulær servering) i NO/DK + EU/INT-benchmarks.

## Resultat
- **fetched_full: 11** · **paywalled: 1** · **metadata_only: 3** · dead: 0
- **48 findings** totalt, alle med `basis` + `locator`; volumtall har `systemBoundary`.
- Ekstrakt: `ekstrakt/innhenting-B1_sirk_konk_b.jsonl` (15 poster)
- CSV-status: `ekstrakt/csv-status-B1_sirk_konk_b.jsonl`

## Hentet (primærbelegg)
- **Infarm Denmark ApS årsrapport 2022** (PDF, regnskaber.cvrapi.dk) — tap DKK -43,95 mill, negativ EK DKK -94,78 mill; revisorforbehold om DKK 10 mill tilgodehavende; realisasjonsprinsipp (avvikling). Vertical-farming-kollaps. Morselskap infarm B.V. (NL), 5 % mark-up service-avtale. `maalt`.
- **Enorm Biofactory A/S årsrapport 2023** (PDF, regnskaber.virk.dk via CVR distribution-API) — insekt/fluelarve-protein; tap DKK -31,3 mill, EK DKK 130,3 mill, 26 ansatte. FY2024 aldri innlevert (konkurs 30.10.2025). `maalt`.
- **Billund Aquaculture A/S årsrapport** (PDF) — merk: filen på manifest-URLen er **FY2022** (ikke 2023 som manifest sa; FY2023 aldri publisert). RAS-spesialist, tap TDKK -88 031, EK TDKK 61 546, 154 ansatte, RoE -105,7 %; vannforbruk <1 % av konvensjonelt. `maalt`.
- **3 × CVR-registeroppslag** (cvrapi.dk, JSON) for Enorm (konkurs 30.10.2025), Infarm (opphørt 21.05.2025), Billund (konkurs 25.07.2024). Autoritativ registerbekreftelse av konkursdatoer.
- **NRK** (HTML) — 74 Oslo-serveringssteder nedlagt/konkurs på to år; konkurstopp høyeste siden 2008; Dun & Bradstreet spår rekordår 2024.
- **SeafoodSource** (via Exa; curl/WebFetch 403) — Billund konsern-tall (2022-tap DKK 97,3 mill, omsetning DKK 268,7 mill), 250 ansatte, eierskifte Broodstock→Sørensen-familien.
- **PetfoodIndustry** (via Exa) — Ÿnsect judicial liquidation des 2025; >USD 500 mill reist; EU insektprotein-benchmark.
- **CEA inSight / Ljusgårda** (via Exa; curl TLS-feil) — svensk vertical farm: 520 t salat (2022), 50 % lavere CO2eq via LCA. Faktisk publ. 2023 (ikke 2024).
- **GFI Europe Nordic ecosystem** (HTML) — Danmark EUR 176 mill alt-protein R&I; nordisk-fordeling per pilar. Faktisk publ. 2025 (ikke 2024).

## Paywalled (1)
- **Finansavisen** (mat-og-drikke) — betalingsmur; ikke gjettet.

## Metadata_only (3)
- **Rest Restaurant AS årsrapport 2023** — identifisert rettssubjekt: RESTAURANT REST AS, org **920156665**, Kirkegata 1-3 Oslo, sirkulær "zero waste" fine dining (Jimmy Øien). Enhet slettet etter konkurs (brreg-API 404); årsregnskap ikke i åpent register. Konkurs (oppbud sept 2024, ~2 mill NOK gjeld, 14 ansatte) bekreftet via Avisa Oslo-overskrift.
- **Enorm konkursdekret (domstol.dk)** + **Billund konkursbehandling (domstol.dk)** — begge URLer er generiske rettslandingssider, Cloudflare-blokkert (403); dekret publiseres ikke der. Konkursdatoer bekreftet via CVR-register i stedet.

## Avvik notert (proveniens)
- Billund direct_pdf = FY2022, ikke 2023. Enorm "årsrapport 2024" finnes ikke — siste er FY2023. Ljusgårda-artikkel 2023 (ikke 2024). GFI-rapport 2025 (ikke 2024).
- Billund morselskaps-årsrapport (EK 61 546 TDKK, tap 88 031 TDKK) divergerer fra SeafoodSource sine konserntall (EK 39,1 mill, tap 97,3 mill) — begge registrert med respektive `basis`.

## Sluttsjekk
- Ingen skriving til knowledge/corpus, register, køer, DB. Kun research/innhenting-2026-08-05/.
- Hvert tall har basis + locator; volumtall har systemBoundary. sourceKind/retrieval satt per post. Paywall/blokkering ærlig flagget, ikke gjettet.
