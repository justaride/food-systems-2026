# Conditional citation decision queue - 2026-05-18

Scope: the rows in `research/citation-application-packet-2026-05-18.csv` that started with `apply_allowed=conditional`. These were not safe for blind import; all original conditional rows now have an explicit decision and the applied rows are recorded below.

Run the fail-closed gate before working this queue:

```bash
npm run audit:citation-application-packet
```

## Decisions

| Action | Entity | Current DB state | Source state | Required decision | Recommended next move |
|---|---|---|---|---|---|
| `CF-NG-2024` | NorgesGruppen ASA financials | `revenueNok=118000`, `operatingResult=4800` | Annual report: MNOK 118,006 revenue, MNOK 4,842 EBIT | Exact MNOK versus rounded MNOK storage | Applied locally 2026-05-18: exact MNOK storage selected, `revenueNok=118006`, `operatingResult=4842`, `verificationStatus=human_verified`, and `FieldCitation` coverage created with `cit_226c07fa4f5bde7106072a7f0cc22ec4`. |
| `SH-NG-2024` | NorgesGruppen ASA shareholders | `Joh. Johannson-familien` 74.4 | Annual report: `Joh. Johannson Handel AS` 74.40 and `Brødrene Lorentzen AS` 9.00 | Legal-entity rows versus family shorthand | Applied locally 2026-05-18: replaced family shorthand with `Joh. Johannson Handel AS`, created `Brødrene Lorentzen AS`, set `verificationStatus=human_verified`, and created `FieldCitation` coverage with `cit_70a7abe772d5171cb2f33cdfb0291738`. |
| `SH-BAMA-2024` | BAMA Gruppen AS shareholders | `NorgesGruppen`, `Bama-familien`, `REMA 1000` | Annual report: `NorgesGruppen ASA` 46, `AS Banan` 34, `REMA Industrier AS` 20 | Legal-name normalization | Applied locally 2026-05-18: renamed the three holder rows, kept percentages unchanged, set `verificationStatus=human_verified`, and created `FieldCitation` coverage for `name` and `ownershipPct` using `cit_8405dd61353d9199934d3d991f8cdc7a`. |
| `SH-KESKO-2024` | Kesko Oyj shareholder | `K-kauppiasliitto ry` 7.5 | Annual report: K-Retailers Association and related parties 7.54% shares / 19.56% votes | Whether `Shareholder.ownershipPct` means share-only or whether vote share must be modeled separately | Applied locally 2026-05-18: share-only semantics selected for `Shareholder.ownershipPct`, row normalized to `K-Retailers' Association and related parties` 7.54%, vote share retained in SourceCitation notes, and FieldCitation coverage created with `cit_36311bd2ae9a79c1cc2b9e188cf4fbb2`. |
| `SH-REITAN-2024` | Reitan Retail AS shareholder | `Reitan-familien (Odd Reitan)` 100 | Annual report: Reitan Retail is wholly owned by `REITAN AS`; REITAN AS is family-owned through three holding-company branches | Direct owner versus family-control layer | Applied locally 2026-05-18: direct-owner layer selected for `Shareholder`, row normalized to `REITAN AS` 100%, family-control layer retained in SourceCitation notes, and FieldCitation coverage created with `cit_3f21a3d2b982d2189042f90c11b2a215`. |

## Stop rule

No original conditional rows remain pending. For future rows, do not run a DB-writing citation import until the corresponding value/name/model decision has been applied to the target record. A citation may document a rounded or simplified value only if the citation note names the source value and the approximation rule.
