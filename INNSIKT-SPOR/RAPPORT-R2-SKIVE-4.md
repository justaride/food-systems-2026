# Rapport R2 — Skive 4 av 8 (kjernelesing)

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Produsert:** innsikt-runde-2
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-4.jsonl` (15 poster, gyldig JSONL)

## Sammendrag i tall

- **Kilder tildelt:** 15
- **Lest fullt:** 6
- **Lest delvis:** 9 (store PDF-er lest via målrettet sidevis/grep av metode-, resultat- og sammendragsseksjoner — ikke referanselister/navigasjon)
- **Ulest:** 0
- **Findings totalt:** 67
- **contradicts:** 6 | **notMeasured-punkter:** 33
- **basis-fordeling:** aktoropplysning 28, modellert 27, maalt 9, ikke_oppgitt 3

## Feltdekning (findings per DATAGAP-felt)

| Felt | Findings |
|---|---:|
| materialstrommer | 28 |
| makt_eierskap | 23 |
| okologi_jordhelse | 14 |
| offentlig_innkjop | 13 |
| aktordybde | 11 |
| beredskap_import | 7 |
| alternativt_protein | 6 |
| nordisk_dybde | 6 |
| lokale_verdikjeder | 4 |
| kausalitet | 3 |
| kvalitativt_lag | 2 |

## Kildene (readState + hovedbidrag)

**Lest fullt (6):**
1. `document:cmq8rsnia0013ekvmknxpw8un` — Frontiers: multiskala fosforanalyse norsk akvakultur 2023 (materialstrømmer/økologi). Tett tallmateriale, alt **modellert**.
2. `document:cmqgiocwp00m04nvm05eoow86` — src-160, Eriksson/Pano/Ghosh 2016, svensk matkjede-bærekraft (makt/import/materialstrømmer).
3. `document:cmqgiocxg00m24nvm7qghmxgn` — src-162, Nord 2025:007, avfallsforebygging (materialstrømmer/offentlig innkjøp).
4. `document:cmp8xyphl00mdvvvmug19j01u` — MycoStories, Mycorena-konkurs (alternativt protein).
5. `document:cmp8xypj300mhvvvm4u3jzxyn` — vegconomist, Mycorena-konkurs (alternativt protein).
6. `document:cmqgiocrw00lo4nvm9tlpvt3v` — motiva food procurement (offentlig innkjøp) — **se merknad under**.

**Lest delvis (9):**
7. `document:cmp8xyn7400h4vvvmajzp1m4p` — Lindström PhD 2021, GPP/økologisk mat Sverige (offentlig innkjøp/økologi).
8. `document:cmp8xynmd00igvvvm9bj66hjp` — Sturén 2023, svensk brødforsyning/take-back (materialstrømmer).
9. `document:cmp8xypoj00mwvvvmy3f00fhm` — Konkurransetilsynets marginstudie 2024 del 1 (makt/eierskap).
10. `document:cmp8xypmg00msvvvm65crp6ti` — Stockholm Resilience 2019, nordisk matsystem-baseline (nordisk dybde/materialstrømmer/import).
11. `document:cmp8xyn4500gtvvvmy5hykkya` — Jacobsen & Jansson 2022 (NHH), skandinavisk dagligvarelønnsomhet (makt/eierskap).
12. `document:cmp8xyna000hdvvvmbq6hwpwb` — Nguyen & Hartmann 2024 (NHH), restriktive servitutter norsk dagligvare (makt/kausalitet).
13. `document:cmp8xynl600icvvvmlzxiqlb1` — Sørensen PhD 2016 (DTU), økologisk omlegging danske offentlige kjøkken (offentlig innkjøp).
14. `document:cmp8xynxw00ixvvvmik4fvcdl` — NorgesGruppen årsrapport 2024 (aktør/makt).
15. `document:cmq8rsnhy000vekvmzikj43kz` — Nordic Council 2022, lavkarbon sirkulær omstilling (materialstrømmer/matsvinn).

## Datakvalitet og advarsler

- **`basis` er streng.** Frontiers-fosforstudien er kraftig sitert utad, men **alle utslipps- og PUE-tall er modellerte** (Monte Carlo på Fiskeridirektoratets lokalitetsdata), ikke målt. Merket `modellert` gjennomgående. Sturén- og Nordic Council-matsvinntallene er også modellerte/anslag.
- **`systemBoundary` er avgjørende for to tall:**
  - NorgesGruppens markedsandel: selskapet oppgir **~28 %** av «totalt matmarked» (~380 mrd, bredt inkl. storhusholdning), mens Jacobsen&Jansson og Konkurransetilsynet opererer med **~44 %** av dagligvaremarkedet (snevrere). Registrert som `contradicts` mellom de to kildene — ikke reell motstrid, men ulik systemgrense.
  - Mycorena «500 tonn» er anleggets **oppgitte kapasitet**, ikke realisert gjennomstrømning.
- **contradicts fanget:** Frontiers vs. litteratur (DIP-utslipp fra laks: negative vs. +5,1 kg/tonn); Jacobsen&Jansson og Konkurransetilsynet vs. offentlig oppfatning om «unormal profitering» (begge avviser); Sturén vs. TBA-som-sirkulær-idealbilde; NorgesGruppen vs. Jacobsen&Jansson (markedsandel-definisjon); Lindström vs. teoretisk GPP-litteratur.

## Kilder som ikke lot seg lese fullt / forbehold

- **motiva-food-procurement-2026** (`document:cmqgiocrw00lo4nvm9tlpvt3v`): `.md`-fila er et **metadata-snapshot** som kun inneholder navigasjons-HTML fra Motivas nettside — ikke veilederens faktiske innhold. Fulltekst-PDF (108 s., 2023) finnes **ikke** lokalt i `research/evidence-pack/offentlig/`. Posten bærer derfor bare den ene aktoropplysningen om at veilederen eksisterer; **kan ikke bære substanstall**. Markert `read_partially`.
- **De 9 «read_partially»** er store PDF-er (norgesgruppen 75k ord, sørensen 50k, nordic 47k, nguyen/jacobsen/marginstudie/stockholm/sturen). Disse er lest via metode-/resultat-/sammendragsseksjoner + målrettet grep på tall, ikke ord for ord gjennom vedlegg og referanselister. Alle hovedfunn med lokator er hentet fra faktisk lest tekst, ikke triage-sammendrag.
- PDF-uttrekk av NorgesGruppen-rapporten hadde to-kolonne-interleaving og «Invalid Font Weight»-advarsler; nøkkeltall er verifisert i kildeteksten, men enkelte sidetall er omtrentlige (oppgitt som seksjon i `locator`).
