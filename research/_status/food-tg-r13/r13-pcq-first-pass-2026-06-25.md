# Food TG R13 PCQ first pass

**Dato:** 2026-06-25
**Scope:** Første pass på topp 8 fra `r13-pcq-queue-2026-06-25.md`.
**Regel:** Dette er primary-check queue-kontroll, ikke claim-lock. Ingen claims åpnes.

## Kort dom

Første PCQ-pass reduserer risikoen fra "sterke, men ukontrollerte PCQ-kandidater" til konkrete kontrollkort. Alle toppkandidatene har live primær-/ankerlokatorer per 2026-06-25, med ett viktig unntak: Brreg-lenken i `R13-LAND-002` er en mal (`{orgnr}`) og kan ikke brukes som kilde før den erstattes med orgnummer-spesifikke kall.

Ingen av radene er klare for claim-lock. De er klare for neste kontrollerte arbeidspakke: radvis uttrekk med metodekolonner, tomme celler og presis stoppliste.

## Live locator-sjekk

| ID | Primær-/ankerlokatorer sjekket | Status | Merknad |
|---|---|---|---|
| R13-GAP-001 | SSB 08801 / import og eksport alle land og varenummer | 200 | SSB-lokator live; bulkuttak må dokumentere kode, år, kg, verdi og opprinnelsesland. |
| R13-OKO-001 | SSB 12661, SSB artikkel, Debio statistikk | 200 | SSB/Debio-live; tall må avstemmes før kanonisk formulering. |
| R13-WASTE-001 | SINTEF publikasjon, FHF prosjekt 901844 | 200 | Kildene er live; R-stige er fortsatt vår omkoding. |
| R13-LAND-001 | Konkurransetilsynet Dagligvarerapport 2025, ASKO, Coop årsrapporter | 200 | Regulatorrapport live; aktørsider er støtte, ikke nøytral andelskilde. |
| R13-OKO-007 | Regjeringen/LMD strategi, Landbruksdirektoratet rapport, EU Farm to Fork | 200 | Nasjonalt mål live; EU-mål må ikke gjøres norsk. |
| R13-WASTE-004 | Matvett/NORSUS faktaark, SSB notat 2025/37, SSB husholdningsavfall | 200 | Kildene er live; SSB avfallskategori er ikke spiselig matsvinn. |
| R13-LAND-002 | KT Dagligvarerapport 2024/25, Menon/NFD rapport | 200 | Brreg-mal `{orgnr}` feiler som forventet; erstatt med orgnummer-spesifikke kall før bruk. |
| R13-OKO-003 | NIBIO JordVAAK, JordVAAK implementation, LSK-jord | 200 | Programkilder live; baseline/trend er ikke publisert som ferdig nasjonal målt serie. |

## PCQ-kontrollkort

| Pri | ID | PCQ-status etter første pass | Tillatt intern formulering | Må fortsatt kontrolleres før claim-lock/figur |
|---:|---|---|---|---|
| 1 | R13-GAP-001 | Locator live og kontrollspørsmål er smalt nok. | SSB kan støtte importserier per HS/proxy for utvalgte noder. | Sluttbruk, art/fiskeri, rent fosfat og samlet fôrprotein er ikke lukket. |
| 2 | R13-OKO-001 | Locator live, men kanonisk tallvalg er ikke låst. | Økoareal kan omtales med SSB/Debio som kilde og eksplisitt karens-/sertifisert-splitt. | Velg SSB eller Debio som kanonisk rad; ikke si 4,5 % sertifisert. |
| 3 | R13-WASTE-001 | Locator live og A-anker sterkt. | SINTEF/FHF kan støtte 2024-restråstoffstatus og hovedanvendelser. | R-stige må ha metode, enhet og råstoff-/produktvekt-splitt. |
| 4 | R13-LAND-001 | Regulatorlocator live. | Dagligvarekonsentrasjon kan beskrives som regulatorstøttet strukturindikator. | Grossist/fôr/tverrsegment HHI, beneficial ownership og intensjonsclaims er ikke lukket. |
| 5 | R13-OKO-007 | Nasjonal strategi og støtteindikatorer live. | Norge har et nasjonalt 10 %-mål for økologisk jordbruksareal innen 2032. | EU 25 %-mål, pesticider/næringsstoffer, matsvinn og klimaavtale må holdes i egne målserier. |
| 6 | R13-WASTE-004 | Baseline-/metodelokatorer live. | Matvett/NORSUS kan støtte kartlagt matsvinn med sektor-/metodecaveat. | Direkte 2024-husholdningsmåling, harmonisert sektormetode og SSB-avfallsbegrep må ikke blandes. |
| 7 | R13-LAND-002 | Regulator-/rapportlokatorer live, Brreg ikke kildeklar før orgnr-kall. | Vertikale koblinger kan føres som datert struktur-/ownership-edge ledger. | Franchise-/kontrollvilkår, private avtaler og Brreg-orgnummer per rad. |
| 8 | R13-OKO-003 | Programlokatorer live. | Norge har etablerte overvåkingsprogrammer for jordhelse/jordkarbon. | Ferdig målt nasjonal baseline, trend, usikkerhet og LULUCF-vs-målt karbon-splitt. |

## Beslutning

Disse åtte radene går ikke til claim-lock. De går til smale neste artefakter med radvis uttrekk:

1. `R13-GAP-001`: importnode extraction sheet.
2. `R13-OKO-001`: økoareal-/mål-kort.
3. `R13-WASTE-001`: R-stige-metodetabell.
4. `R13-LAND-001`: strukturkart-ledger.
5. `R13-OKO-007`: policy target matrix.
6. `R13-WASTE-004`: matsvinn-baseline-tabell.
7. `R13-LAND-002`: datert ownership-edge ledger.
8. `R13-OKO-003`: soil-monitoring gap card.

## Ikke si

- Ikke si at noen av disse er claim-locket.
- Ikke bruk live URL-status som bevis for tallinnhold; den beviser bare at locator er tilgjengelig.
- Ikke bruk Brreg-mal-URL som kilde.
- Ikke lag figur uten metodekolonner og tomme celler.
