# RAPPORT — B4_aktorer_beredskap (Innhentingssesjon 2026-08-05)

## Sammendrag
- Manifest-rader: **15** (16 URL-oppføringer, én uten URL).
- Hentet (fetched_full/partial): **11 URL-er** → **10 ekstraksjonsposter med findings + 1 nullfunn-post** (Mathem).
- Paywall/blokkert: **1** (FinSMEs, HTTP 403 — dekket av øvrige Volare-kilder).
- Død/ikke tilgjengelig som forventet: **3** (SIFO gammel DSpace-URL død → metadata gjenopprettet; Mathem 2024-melding ikke på siden; Partiprogrammer uten URL).
- Findings totalt: **22**.

## Per rad
| Kilde | Status | retrieval | findings |
|---|---|---|---|
| Matvett/NORSUS matsvinn (OR.28.24, 2024) | downloaded | fetched_full | 6 |
| Circularity Gap — Norway | downloaded | fetched_partial | 3 |
| Circularity Gap — Sweden | downloaded | fetched_partial | 3 |
| Volare €26M (New Food + Feed Business MEA + IBC; konsolidert) | downloaded | fetched_full | 3 |
| Stockmann Herkku-salg til S Group (2017) | downloaded | fetched_full | 2 |
| SIFO trygghetsbarometer 2024 | dead_link (URL) | metadata_only | 1 |
| NHH handle 3051794 (mismatch) | downloaded | metadata_only | 1 |
| Holdbart.no (Matkasse-omtale) | downloaded | fetched_full | 1 |
| Green Business — CBWM Norway-besøk | downloaded | fetched_full | 1 |
| NLI — Den Magiske Fabrikken/Greve Biogas | downloaded | fetched_full | 1 |
| Mathem rekonstruksjon 2024 | dead_link | metadata_only | 0 |
| FinSMEs (Volare) | paywalled (403) | — | — |
| Partiprogrammer (9 partier) | no_url | — | — |

## Viktige avvik og forbehold
- **NHH-rad-mismatch:** handle `11250/3051794` var merket "Coop.dk MAD case analysis" i manifest, men løser til en HELT ANNEN NHH-masteroppgave: "Norway – the Black Sheep in the Scandinavian Grocery Industry" (2022, skandinavisk dagligvarelønnsomhet). Registrert som faktisk hentet dokument med mismatch-flagg.
- **Circularity Gap Norway:** manifest-tittel sa "2.4 percent circular"; live-siden oppgir **2 %** (2022). Registrert det siden faktisk sier.
- **SIFO:** gammel OsloMet oda-xmlui-URL er død (301→handle→nva.sikt.no, JS-app). Metadata + fullt abstrakt gjenopprettet via `api.nva.unit.no`. Full PDF er "OpenFile" men NVA-download krever presignert/autentisert kall som ikke lot seg gjøre non-interaktivt → metadata_only. Samme gjelder NHH-PDF-en.
- **Mathem:** Cision-pressrommet viser kun 2010-meldinger; ingen 2024-rekonstruksjonsmelding på landingssiden. Ikke gjettet — bør søkes via svensk konkurs-/tingsrätt-kilde senere.

## systemBoundary — beredskap/volum-tall (kritisk)
- **Matvett:** alle matsvinn-tall = *målt* (plukkanalyser + selvrapport), grense = spiselig mat, husholdningsledd. 35 kg/innbygger (2023), 193 200 tonn husholdning (2023), 451 600 tonn hele Norge (2023).
- **Volare:** 5 000 t/år = *kapasitet* (capable of processing) ved eksisterende Hyvinkää-anlegg (aktøropplysning); "18 % av Finlands fangst"-ekvivalent = *planlagt/target* output for anlegg under bygging — IKKE faktisk produksjon.
- **Circularity Gap:** 2 % / 3.4 % sirkulær + t/capita-tall = *modellerte*, økonomi-omfattende MFA-estimater, ikke matspesifikke.
- **Biogass (NLI/Green Business):** ingen kapasitets-/volumtall oppgitt på kildene.

## Felt dekket (fillsGap)
materialstrommer (Matvett, Circularity Gap), alternativt_protein (Volare), makt_eierskap/aktordybde/nordisk_dybde (Stockmann, NHH), lokale_verdikjeder (Holdbart, biogass), beredskap_import/kvalitativt_lag (SIFO).

## Utdata
- Ekstrakt: `ekstrakt/innhenting-B4_aktorer_beredskap.jsonl` (11 poster)
- CSV-status: `ekstrakt/csv-status-B4_aktorer_beredskap.jsonl` (15 rader)
- Staging: matvett-matsvinn-2025.pdf/.txt, circularity-gap-{norway,sweden}-2024.md, volare-funding-2025.md, stockmann-delicatessen-2017.md (+stockmann.html), sifo-dyrtiden-2024.md, nhh-handle-3051794-2022.md, misc-b4-landing-pages.md
