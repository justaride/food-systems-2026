# Aktivitetssignal-analyse — åpne registre

**Dato:** 2026-08-05
**Formål:** Verifisere om de 351 registrerte selskapene i databasen faktisk er aktive, ved hjelp av åpne registerdata — uten å skrive til databasen.
**Kilder (alle åpne, uten autentisering):**

| Kilde | Endepunkt / fil | Hva den gir |
|---|---|---|
| Brønnøysundregistrene, Enhetsregisteret | `data.brreg.no/enhetsregisteret/api/enheter` | Registerstatus (aktiv/slettet), org.form, ansatte, MVA-registrering |
| Brønnøysundregistrene, Regnskapsregisteret | `data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` | Om regnskap er levert, siste regnskapsperiode |
| Mattilsynet, godkjente virksomheter | CSV-nedlastinger på mattilsynet.no (fiskerivarer, fôrvarer) | Godkjente mat-/fôrvirksomheter med orgnr (BEDRIFTSNUMMER) |
| Mattilsynet, smilefjes | `data.mattilsynet.no/smilefjes-tilsyn.csv` (via data.norge.no) | 48 699 tilsyn 2015–2026 med orgnr, oppdatert til 04.08.2026 |

## Viktig forbehold: radnivå-dekning for regnskap

`data/vault-export/` inneholder **ikke** `CompanyFinancial`-rader, og `data/konsern-coverage.json` oppgir kun aggregerte tall per konsern (`childrenWithoutFinancial`). Hvilke 98 selskaper som mangler regnskap i DB kan derfor **ikke** identifiseres på radnivå fra eksportene. Analysen er derfor kjørt på **hele orgnr-listen (351)** — noe som samtidig verifiserer de 253 som antas å ha regnskap.

## Dekning oppnådd

| Kategori | Antall | Kommentar |
|---|---|---|
| Norske selskaper funnet i Enhetsregisteret, **aktive** | 247 | Alle uten slettedato, ingen konkurs/avvikling |
| Norske selskaper **avregistrert** (funnet via direkteoppslag) | 5 | Se egen tabell under |
| Utenlandske selskaper / pseudo-ID-er (`DK-`, `SE-`, `FI-`, `NO-XXX` o.l.) | 97 | Kan ikke sjekkes i Brreg; forventet |
| Ugyldig orgnr (mod-11-feil = datafeil i DB) | 2 | Se under |
| **Totalt** | **351** | |

**Oppgradert fra «finnes» til «verifisert aktiv»: 235 av 351 selskaper.**
Kriterium: aktiv i Enhetsregisteret **og** minst ett uavhengig aktivitetssignal (ferskt regnskap 2024/2025, ansatte i hoved- eller underenhet, Mattilsynet-godkjenning, eller smilefjes-tilsyn).

Av de 247 aktive har:
- **234 levert regnskap** i Regnskapsregisteret — alle med siste periode **2024 eller 2025** (ferskt)
- **152 registrerte ansatte** (hoved- + underenheter; 3 718 underenheter kartlagt)
- **52 treff i Mattilsynets godkjenningslister** (fiskerivarer og/eller fôrvarer)
- **12 selskaper med smilefjes-tilsyn** (til sammen 220 tilsynsbesøk; siste tilsyn per selskap spenner 09.07.2024–01.07.2026)

12 aktive norske enheter har ingen av disse signalene — 9 av dem er utenlandske foretak (NUF: Cargill Inc, ICA Sverige AB, Martin & Servera AB m.fl.) som ikke er regnskapspliktige i Norge, pluss `0000 NORGE AS`, `NTF KLUBBEN...` og 2 NorgesGruppen-finans-selskaper der Regnskapsregisteret svarte HTTP 500 (se under).

## Funn 1: Fem avregistrerte («døde») selskaper i DB

Disse står i DB, men er slettet fra Enhetsregisteret (fusjon/avvikling):

| Orgnr | Navn | Slettet | Merknad |
|---|---|---|---|
| 882722422 | COOP NORGE KAFFE AS | 2025-11-29 | Sannsynlig fusjonert inn i Coop-strukturen |
| 920126839 | COOP EIENDOM SØRVEST AS | 2026-06-24 | Slettet for under 2 mnd siden |
| 928211398 | UNO-X E-MOBILITY NORGE AS | 2025-05-14 | |
| 952662813 | SALMONOR AS | 2021-12-27 | Død i over 4 år — burde vært fanget opp |
| 999320600 | ASKO TRANSPORT AS | 2025-11-08 | Leverte 2024-regnskap før sletting |

Merk: disse dukket **ikke** opp i søke-API-et (som filtrerer bort enkelte slettede enheter), bare ved direkteoppslag på orgnr — en felle for fremtidige oppslag.

## Funn 2: De tre «tappede» selskapene fra import-reconciliation

| Orgnr | Mod-11-sjekk | I Enhetsregisteret | Konklusjon |
|---|---|---|---|
| 987565922 | **Ugyldig** | 0 treff | Orgnr kan ikke eksistere — datafeil i importskript |
| 948202063 | **Ugyldig** | 0 treff | Orgnr kan ikke eksistere — datafeil i importskript |
| 949556207 | **Ugyldig** | 0 treff | Orgnr kan ikke eksistere — datafeil i importskript |

De tre «tappede» selskapene var aldri reelle organisasjonsnumre (kontrollsifferet stemmer ikke). De finnes ikke i Brreg fordi de ikke *kan* finnes. Riktig tiltak er å finne korrekt orgnr i kilden (`import-research-20260420.ts`) og rette, ikke å feilsøke importen.

## Funn 3: To ugyldige orgnr i selskapstabellen

| Orgnr i DB | Navn i DB | Problem |
|---|---|---|
| 914353561 | Hallvard Leroey AS | Mod-11-feil. Navnesøk i Brreg ga ingen eksakt match — krever manuelt oppslag |
| 952587687 | NTS ASA | Mod-11-feil. NTS ASA ble fusjonert inn i Frøy-gruppen (2022); korrekt orgnr må slås opp manuelt |

## Funn 4: De 98 som mangler regnskap i DB kan i stor grad fylles fra åpne data

234 av 247 aktive norske selskaper (95 %) har regnskap liggende fritt tilgjengelig i Regnskapsregisteret, inkludert resultat- og balansetall. Siden DB bare har regnskap på 253 av 351, og stort sett alle norske aktive selskaper har levert, kan mesteparten av gapet lukkes med en importjobb mot `data.brreg.no/regnskapsregisteret` — helt gratis og uten autentisering.

## Tekniske hendelser underveis

- Regnskapsregisteret svarte **HTTP 500** (serverfeil hos Brreg, vedvarte ved retry) for 920341659 (NorgesGruppen Finans Holding AS) og 920428959 (NorgesGruppen Finans AS).
- Søke-API-et i Enhetsregisteret utelater enkelte slettede enheter; direkteoppslag `/enheter/{orgnr}` kreves for sikker status.
- Rate limits respektert: bulk-søk (50 orgnr/kall), 0,5–1,5 s pause mellom kall, ingen 429-feil.

## Mattilsynet — hva som er åpent tilgjengelig

1. **Godkjenningslister som CSV** (lenket «Last ned (CSV)» på hver kategorieside): fiskerivarer (821 virksomheter m/orgnr), fôrvarer (2 365 rader m/orgnr), animaliebiprodukter seksjon I–XII (uten orgnr i CSV). Lokale kopier lagret i denne mappen.
2. **Smilefjes som åpne data**: `https://data.mattilsynet.no/smilefjes-tilsyn.csv` + `smilefjes-kravpunkter.csv` (via datasett på data.norge.no). Oppdatert til 04.08.2026.
3. **Smilefjes-søk** (smilefjes.mattilsynet.no) er serverrendret HTML uten dokumentert JSON-API; CSV-en over er den riktige veien.
4. **Godkjenningsportalen** (godkjenning.mattilsynet.no) svarte ikke (tilkoblingsfeil) — ikke brukbar.
5. Mattilsynet-treff matches mot **underenheter** (3 718 hentet fra Brreg): godkjenninger ligger på driftsenheten, ikke morselskapet. Direkte match på hovedenhet-orgnr ga null treff; via underenheter ga det 52 treff.

## Forslag til import (eier-styrt apply-løp — IKKE utført)

Alle forslag under er dokumentasjon for senere kontrollert import. Ingen DB-skriving er gjort.

### A. Company — registerverifisering (skjema: `prisma/schema.prisma`, model `Company`)

| Felt | Verdi |
|---|---|
| `registrySource` | `"brreg_enhetsregisteret+regnskapsregisteret+mattilsynet_2026-08-05"` |
| `registryVerifiedAt` | `2026-08-05` |
| `lastBrregRefreshAt` | `2026-08-05` |
| `employees` | `antallAnsatteTotalt` fra denne analysen (hoved+underenheter) der > 0 |
| `metadata.aktivitetssignal` | hele radobjektet fra `aktivitetssignaler-alle-351.json` (regnskapsperiode, mattilsyn-treff, smilefjes-antall) |

### B. Verifiseringsstatus

`VerificationStatus`-enumen har bl.a. `verified`, `machine_verified`, `unverified`, `needs_review`. Forslag:

- 235 selskaper med aktivitetssignal → `machine_verified` (maskinelt verifisert mot åpne registre; ikke menneske-verifisert)
- 5 avregistrerte → `failed` + notat i metadata om slettedato; vurder `isResearchConstruct`/historisk-flagg eller utmerking som «avviklet» i stedet for sletting
- 2 ugyldige orgnr + 3 tappede → `disputed` inntil orgnr er rettet manuelt
- 12 aktive uten signaler (NUF m.m.) → `needs_review` (aktive i Brreg, men ingen uavhengig aktivitet bekreftet)

### C. CompanyFinancial for de 98

Hent regnskap fra `data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` for selskaper uten `CompanyFinancial`-rader (må identifiseres med DB-spørring ved apply — finnes ikke i eksportene). Map: `year` ← `regnskapsperiode.tilDato`, `revenueNok` ← `resultatregnskapResultat.driftsresultat.driftsinntekter.sumDriftsinntekter`, `source` ← `"brreg_regnskapsregisteret"`, `fiscalPeriodStart/End` ← `regnskapsperiode`. Forventet utbytte: inntil ~95 % av norske aktive selskaper i gapet.

### D. BoardMember + Shareholder (1 800 + 82 uverifiserte)

**Ikke dekket av denne analysen.** Roller/aksjonærer krever Brreg fulltekst/aksjonærregisteret som ikke er åpent tilgjengelig (kunngjøringer/roller-API har begrensninger; aksjonærregisteret er skattetaterskjuldatatjeneste med autentisering). Anbefalt egen kartlegging før import.

## Filer i denne mappen

| Fil | Innhold |
|---|---|
| `aktivitetssignaler-alle-351.json` | **Hovedtabell**: per-selskap signal (orgnr, status, regnskap ja/nei, ansatte, mattilsyn-treff, smilefjes, verifisertAktiv) |
| `aktivitetssignaler-per-selskap.json` | Utvidet per-selskap-data inkl. underenhetsdetaljer (de 252 norske) |
| `brreg-enhetsregisteret.json` | Rådata Enhetsregisteret (247 funnet + liste over ikke-funnet) |
| `brreg-regnskapsregisteret.json` | Regnskapsstatus per orgnr (siste periode, type, antall) |
| `brreg-underenheter.json` | 3 718 underenheter for de 247 aktive hovedenhetene |
| `mattilsynet-parsa.json` | Alle orgnr i Mattilsynets lister (fisk 821, fôr 2 365) |
| `mattilsynet-*.csv/.html` | Rå kopier av Mattilsynet-kilder |
| `mattilsynet-smilefjes-tilsyn.csv` | 48 699 smilefjes-tilsyn (åpne data, 17 MB) |
| `smilefjes-direkte-treff.json` | Smilefjes-treff på hovedenheter (0 direkte — alle treff kom via underenheter) |
| `orgnr-liste.txt` | De 351 orgnr fra vault-export |
