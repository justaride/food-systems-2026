# Hagar historical Norges Bank ISK/NOK FX reconciliation - 2026-05-18

Scope: Hagar hf fiscal periods 2020/21 through 2023/24. This file is the FX archive/reconciliation packet used by the later local DB apply; it does not itself contain the DB mutation script.

Method: official Norges Bank API series `EXR/B.ISK.NOK.SP`, frequency `B` (business day), tenor `SP`. Norges Bank raw observations are quoted as NOK per 100 ISK (`UNIT_MULT`/multiplikator `Hundre` in CSV), so the reconciliation divides the period average by 100 to get NOK per 1 ISK. Average is arithmetic mean over available daily observations in each fiscal period.

## FX averages

| Fiscal year | Period | Observations | Calendar days | Missing calendar days | Avg NOK/100 ISK | Avg NOK/1 ISK | JSON SHA-256 | CSV SHA-256 |
|---|---:|---:|---:|---:|---:|---:|---|---|
| 2020/21 | 2020-03-01..2021-02-28 | 251 | 365 | 114 (105 weekend, 9 weekday/holiday non-publication) | 6.840159 | 0.06840159 | `3f93272cd630c79c734edf5550204f4d01a40d59013a793279873fb0caac98ce` | `ab3d0413f8e58ee47efa40515c02eb864fb56e3ac937ea191eebf2f00715ecc9` |
| 2021/22 | 2021-03-01..2022-02-28 | 254 | 365 | 111 (104 weekend, 7 weekday/holiday non-publication) | 6.825984 | 0.06825984 | `557117d27b9f66120c402a19aafa389e2faede71a1cc2425bf9d4db1057550fb` | `4e5437f30966a444e0c2f2d273843a6f1bdb6c1fc068ad3e972ebec873b2058d` |
| 2022/23 | 2022-03-01..2023-02-28 | 254 | 365 | 111 (104 weekend, 7 weekday/holiday non-publication) | 7.118504 | 0.07118504 | `d4e090a7668a4ca727e45eaa14205313eb6c5d6b796d0f00283ccad3005f8e46` | `713bf29483eac16856d747783c71406140776600bcd0e96baba651e7d2f19496` |
| 2023/24 | 2023-03-01..2024-02-29 | 252 | 366 | 114 (104 weekend, 10 weekday/holiday non-publication) | 7.760317 | 0.07760317 | `e28d24f43062c1ded5e51feec196a3f179e7c1581458e1f30e7526b9d3e8cc37` | `c6e1a7be3d1d4e0d931bc48625ba297bed9cc3369cf59627d48424d15e5b24e3` |

## NOK conversions

Source values are from `research/hagar-historical-financial-sources-2026-05-18.csv` and are ISK million. NOK values below are MNOK, rounded to 1 decimal.

| Fiscal year | Sales ISK m | Sales MNOK | EBITDA ISK m | EBITDA MNOK | EBIT ISK m | EBIT MNOK |
|---|---:|---:|---:|---:|---:|---:|
| 2020/21 | 119582 | 8179.6 | 8805 | 602.3 | 4547 | 311.0 |
| 2021/22 | 135758 | 9266.8 | 10518 | 718.0 | 6277 | 428.5 |
| 2022/23 | 161992 | 11531.4 | 12041 | 857.1 | 7588 | 540.2 |
| 2023/24 | 173270 | 13446.3 | 13063 | 1013.7 | 8035 | 623.5 |

## Archived raw files

- 2020/21: `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2020-03-01_2021-02-28-2026-05-18.json` (`3f93272cd630c79c734edf5550204f4d01a40d59013a793279873fb0caac98ce`), `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2020-03-01_2021-02-28-2026-05-18.csv` (`ab3d0413f8e58ee47efa40515c02eb864fb56e3ac937ea191eebf2f00715ecc9`)
- 2021/22: `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2021-03-01_2022-02-28-2026-05-18.json` (`557117d27b9f66120c402a19aafa389e2faede71a1cc2425bf9d4db1057550fb`), `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2021-03-01_2022-02-28-2026-05-18.csv` (`4e5437f30966a444e0c2f2d273843a6f1bdb6c1fc068ad3e972ebec873b2058d`)
- 2022/23: `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2022-03-01_2023-02-28-2026-05-18.json` (`d4e090a7668a4ca727e45eaa14205313eb6c5d6b796d0f00283ccad3005f8e46`), `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2022-03-01_2023-02-28-2026-05-18.csv` (`713bf29483eac16856d747783c71406140776600bcd0e96baba651e7d2f19496`)
- 2023/24: `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2023-03-01_2024-02-29-2026-05-18.json` (`e28d24f43062c1ded5e51feec196a3f179e7c1581458e1f30e7526b9d3e8cc37`), `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/EXR-B-ISK-NOK-SP-2023-03-01_2024-02-29-2026-05-18.csv` (`c6e1a7be3d1d4e0d931bc48625ba297bed9cc3369cf59627d48424d15e5b24e3`)

## Notes

- Missing days are measured against calendar days in the fiscal period. The API series is business-day frequency, so weekends and public/non-publication days are absent by design.
- DB applicability was decided in the main session after this packet was produced. The four historical Hagar fiscal rows were applied locally on 2026-05-18 with the FX averages above.
