# Citation blocker decision log - 2026-05-18

Scope: source-check and citation-readiness pass for Nordic grocery-company financials, shareholders and registry acquisition paths. This is a decision log, not a master-data import.

DB context: the active worktree has only `.env.example`; read-only DB resolution was run by loading `../../.env` from the main repo. The local `foodsystems` database resolved target `CompanyFinancial`, `Shareholder` and annual-report `Document` IDs. No existing `FieldCitation` rows were found for the checked target records.

## Safe next actions

1. All original conditional ownership rows have now been decided and applied locally.
2. BAMA shareholder normalization was applied locally 2026-05-18 with `cit_8405dd61353d9199934d3d991f8cdc7a`.
3. NorgesGruppen 2024 financial exact MNOK values were applied locally 2026-05-18 with `cit_226c07fa4f5bde7106072a7f0cc22ec4`.
4. NorgesGruppen shareholder legal-name normalization and Brødrene Lorentzen AS creation were applied locally 2026-05-18 with `cit_70a7abe772d5171cb2f33cdfb0291738`.
5. Kesko K-Retailers ownership was applied locally 2026-05-18 as share-only `ownershipPct=7.54`, with vote share retained in citation notes and `cit_36311bd2ae9a79c1cc2b9e188cf4fbb2`.
6. Reitan Retail ownership was applied locally 2026-05-18 as direct owner `REITAN AS` 100%, with family-control layer retained in citation notes and `cit_3f21a3d2b982d2189042f90c11b2a215`.
7. Axfood shareholder rows were applied locally 2026-05-18 with `cit_dd907b371d04cbe89f8ac3bfea4c9900`.
8. Coop Danmark ownership split was applied locally 2026-05-18 with `cit_d60fd6e73463dc6d40165b49c2a9504c`.
9. ICA Gruppen ownership was applied locally 2026-05-18 as share-only rows, with vote shares retained in notes and `cit_023404b51df4840169b5c7377feffd02`.
10. Axfood 2024 financials were applied locally 2026-05-18 using Norges Bank 2024 SEK/NOK annual average with `cit_48006a1e323eab5536935d228f642ecb`.
11. ICA Gruppen 2024 financials were applied locally 2026-05-18 using Norges Bank 2024 SEK/NOK annual average with `cit_9c8ce0807bacc543be076c37e9a773f0`.
12. Salling Group 2024 financials were applied locally 2026-05-18 using Norges Bank 2024 DKK/NOK annual average with `cit_cdaf90b3da1524e40644488ba91d7fd2`.
13. Coop Norge 2024 financials were applied locally 2026-05-18 as exact MNOK values from the annual report with `cit_53fdccea02ac0d24c99945e32e40940f`.
14. Kesko 2024 financials were applied locally 2026-05-18 using actual operating profit and Norges Bank 2024 EUR/NOK annual average with `cit_bfda38b4fc99b2316515f75d7e033901`.
15. Coop Danmark 2024 financials were applied locally 2026-05-18 using actual EBIT after special items and Norges Bank 2024 DKK/NOK annual average with `cit_34787e6bb425563982ca269ae020347e`.
16. Reitan Retail 2024 financials were applied locally 2026-05-18 using IFRS revenue and operating profit with `cit_cb8936ce99f102d0e49e51bf3f0ed9a8`; systemwide/distribution sales are retained in citation notes, not stored as `revenueNok`.
17. ASKO Norge AS 2024 financials were applied locally 2026-05-18 using statutory Brønnøysund Regnskapsregisteret company accounts with `cit_a1df08842b7d7d395c553f81fcb9804b`.
18. Hagar hf 2024/25 financials were applied locally 2026-05-18 to `CompanyFinancial` row `cmp8xytgl00fhxrvmenzl3e5i` with fiscal metadata, Norges Bank fiscal-period ISK/NOK average and `cit_d713d87714009e3cb7641990e8ce2610`; 9 FieldCitation rows were created.
19. Hagar hf current weekly top-20 shareholders were applied locally 2026-05-18 with `sourceBasis=current_weekly_top20`, observed 2026-05-18, source updated 2026-05-14 and `cit_58701d5fd53f86d630a0cccbee48954a`; 20 shareholder rows and 140 Hagar shareholder FieldCitation rows now exist.
20. Hagar hf historical fiscal financials for 2020/21, 2021/22, 2022/23 and 2023/24 were source-found, FX-reconciled with Norges Bank daily ISK/NOK averages and applied locally 2026-05-18 with 4 SourceCitation rows and 36 FieldCitation rows.
21. Nordic registry source-acquisition front doors and country/company-specific traces were archived/verified in `research/nordic-registry-source-acquisition-queue-2026-05-18.csv` plus the SE/DK/FI/IS research files; these remain acquisition-path artifacts except where company-specific basic-register/document artifacts are explicitly marked acquired.

## Blocked rows

| Action | Former blocker | Decision applied |
|---|---|---|
| `CF-HAGAR-2024` | Source is fiscal year 2024/25, while DB rows were older calendar-like NOK rows. | Applied to DB `year=2024` with explicit `fiscalYearLabel=2024/25`, `fiscalPeriodStart=2024-03-01`, `fiscalPeriodEnd=2025-02-28`, `reportingCurrency=ISK`, `fxRateNokPerUnit=0.0785668`, `fxRateSource='Norges Bank daily ISK/NOK average, 2024-03-01 to 2025-02-28'`, `revenueNok=14168.9`, `operatingResult=819.4` and `ebitda=1157.9`. |
| `SH-HAGAR-2026` | Current DB rows were stale/wrong against the official weekly shareholder page observed 2026-05-18. | Applied current weekly top-20 ownership with explicit `sourceBasis=current_weekly_top20`, `sourceObservedAt=2026-05-18` and `sourceUpdatedAt=2026-05-14`. |

No packet rows are currently blocked. Hagar is now a resolved/applied source-model decision for fiscal 2020/21 through 2024/25, not a missing-source or unresolved blocker. The 2020-2023 historical rows are no longer `proposal_requires_human_value_check`; they were applied from their own official annual reports plus separate Norges Bank fiscal-period FX snapshots.

## Hagar historical financial rows applied

| DB year | Fiscal year | Row ID | SourceCitation | Revenue MNOK | EBIT MNOK | EBITDA MNOK | FX |
|---:|---|---|---|---:|---:|---:|---:|
| 2020 | 2020/21 | `cmp8xytg300fdxrvmk2650vrf` | `cit_76c23f6da256eb945d346ad3d627208c` | 8,179.6 | 311.0 | 602.3 | 0.06840159 |
| 2021 | 2021/22 | `cmp8xytgi00fexrvmff1vspqq` | `cit_7215a2b35d2177866068980684189c0a` | 9,266.8 | 428.5 | 718.0 | 0.06825984 |
| 2022 | 2022/23 | `cmp8xytgj00ffxrvmbt3dkcst` | `cit_6423c8607e8a537792fdc44bc27aef2a` | 11,531.4 | 540.2 | 857.1 | 0.07118504 |
| 2023 | 2023/24 | `cmp8xytgk00fgxrvmu6u9esj4` | `cit_a4b49e450d81ac1fa4bc03d9c2ff510e` | 13,446.3 | 623.5 | 1,013.7 | 0.07760317 |

## Hagar shareholder rows applied

| Rank | Row ID | Name | Ownership % |
|---:|---|---|---:|
| 1 | `cmp8xytgm00fixrvmby3ocp8v` | Gildi - lífeyrissjóður | 16.26 |
| 2 | `cmp8xytgm00fjxrvm3qghrxmo` | Lífeyrissjóður verzlunarmanna | 12.37 |
| 3 | `cmpbf8m6x000espvmc74uh472` | Lífeyrissj.starfsm.rík. A-deild | 11.33 |
| 4 | `cmpbf8m76000mspvmqx23lhvy` | Brú Lífeyrissjóður starfs sveit | 8.37 |
| 5 | `cmpbf8m7e000uspvmhwl98hl4` | Kaldbakur ehf. | 8.13 |
| 6 | `cmpbf8m7l0012spvmqvmabgra` | Birta lífeyrissjóður | 6.49 |
| 7 | `cmpbf8m7v001aspvmpb8krj2x` | Festa - lífeyrissjóður | 4.17 |
| 8 | `cmpbf8m82001ispvmx1vfc2kv` | Stapi lífeyrissjóður | 2.96 |
| 9 | `cmpbf8m8d001qspvm9hoy4ng3` | Söfnunarsjóður lífeyrisréttinda | 2.38 |
| 10 | `cmpbf8m8m001yspvm85d5e3jw` | Almenni-Lífsverk lífeyrissjóður | 2.37 |
| 11 | `cmpbf8m8w0026spvm1ur6kmf1` | Lífeyrissj.starfsm.rík. B-deild | 1.79 |
| 12 | `cmpbf8m93002espvmqeogvuer` | Hagar hf. | 1.61 |
| 13 | `cmpbf8m9b002mspvmyabsjkia` | Brú R deild | 1.44 |
| 14 | `cmpbf8m9i002uspvmjwddpusd` | Vanguard Total International S | 1.27 |
| 15 | `cmpbf8m9p0032spvm1zdxmvbz` | Vanguard Emerging Markets Stock | 1.20 |
| 16 | `cmpbf8m9v003aspvmi3io95l3` | Folketrygdfondet | 1.03 |
| 17 | `cmpbf8ma1003ispvmkkll1hud` | Stefnir - Innlend hlutabréf hs. | 0.94 |
| 18 | `cmpbf8ma8003qspvmx8aw8zyi` | Sp/F NM Holding | 0.83 |
| 19 | `cmpbf8maf003yspvmyvys67v9` | Frjálsi lífeyrissjóðurinn | 0.78 |
| 20 | `cmpbf8man0046spvmptbok8aq` | Vanguard Fiduciary Trust Compa | 0.65 |

## FX policy queue

No standalone FX-policy rows remain. Axfood, ICA, Kesko, Coop Danmark, Salling and Hagar have been moved out of this queue because the FX method and metric mapping are now attached to their SourceCitation notes. Norges Bank snapshots are archived under `research/evidence-pack/fx-rates/norges-bank/`; Hagar historical daily snapshots and reconciliation are archived under `research/evidence-pack/fx-rates/norges-bank/hagar-historical-2026-05-18/` and `research/hagar-historical-fx-reconciliation-2026-05-18.csv`.

## Registry acquisition queue

Sweden, Denmark, Finland and Iceland are now tracked separately in `research/nordic-registry-source-acquisition-queue-2026-05-18.csv`, with detailed SE/DK/FI/IS research artifacts in the adjacent country-specific files. Denmark has official public annual-report artifacts acquired for Coop Danmark and Salling, Finland has Kesko PRH open-data basic-register JSON, and Iceland has Hagar Skatturinn lookup HTML. Swedish company-specific Bolagsverket data, Danish owners/management metadata, Finnish Virre extracts/financial-statement documents and Icelandic final PDFs/beneficial-owner artifacts still need approved API/manual/interactive acquisition before field citation.

## Import packet

The row-level application packet with DB IDs is `research/citation-application-packet-2026-05-18.csv`. Treat `apply_allowed=no` as a stop rule. No rows currently remain `apply_allowed=conditional`; future conditional rows require the listed value/model/name decision before any master-data mutation.

Fail-closed preflight is available as:

```bash
npm run audit:citation-application-packet
```

Current packet summary after BAMA, NorgesGruppen, Kesko, Reitan, Axfood, Coop Danmark, ICA, Salling, Coop Norge, ASKO and Hagar applies: 26 rows total, 0 blocked rows, 0 conditional rows, 22 applied rows and 4 registry queue rows.
