# Source Coverage Gap Closure Attempts - 2026-05-18

Status: control note for the remaining source-coverage queue after `research/source-coverage-gaps-2026-05-18.csv` was generated.

This note records what was attempted after the gap export, what changed, and which work remains manual/source-acquisition work. It is not itself a `SourceCitation` or `FieldCitation`.

## Current gap export

Command:

```bash
DOTENV_CONFIG_PATH=../../.env npm run audit:source-coverage-gaps -- --output=research/source-coverage-gaps-2026-05-18.csv
```

Result:

| Entity | Remaining gap rows |
|---|---:|
| BoardMember | 150 |
| PersonProfileRole | 78 |
| Shareholder | 48 |
| Total | 276 |

## Remaining gaps by entity and country

| Bucket | Gap rows |
|---|---:|
| BoardMember:NO | 44 |
| BoardMember:SE | 34 |
| BoardMember:DK | 31 |
| BoardMember:FI | 22 |
| BoardMember:IS | 19 |
| PersonProfileRole:unknown | 46 |
| PersonProfileRole:NO | 29 |
| PersonProfileRole:DK | 3 |
| Shareholder:NO | 33 |
| Shareholder:DK | 5 |
| Shareholder:FI | 4 |
| Shareholder:IS | 3 |
| Shareholder:SE | 3 |

## Remaining gaps by recommended acquisition path

| Recommended path | Gap rows |
|---|---:|
| bronnoysund_role_or_entity_snapshot | 106 |
| manual_source_review | 46 |
| cvr_credentials_or_browser | 39 |
| bolagsverket_manual_or_api | 37 |
| prh_virre_interactive_or_paid | 26 |
| skatturinn_interactive_download | 22 |

## Attempt 1: Norwegian BoardMember gaps via Bronnoysund roles API

Command:

```bash
DOTENV_CONFIG_PATH=../../.env npm run db:backfill:bronnoysund-role-citations -- --dry-run --orgnr=894759372,932256134,910629085,913344162,917203261,937070632,937843860,945958405,961922976,980411133,988597627,885316522,815664582,910747711,914224314,929975200,938752648,947942638,982254604 --limit=30 --accessed-at=2026-05-18
```

Result:

| Result | Count |
|---|---:|
| Companies processed | 19 |
| BoardMember rows matched by current Bronnoysund snapshot | 56 |
| BoardMember rows not matched by current Bronnoysund snapshot | 44 |
| Failed fetches | 0 |

Interpretation:

The 44 remaining Norwegian BoardMember gaps are the no-match rows in the current Bronnoysund roles snapshots. Applying the role backfill would not close these 44 rows; it would mainly re-confirm rows that already have `FieldCitation` coverage. These rows need one of:

- improved historical-name/entity matcher where the local record is intentionally historical,
- manual review against an annual report or company governance page,
- or correction/removal if the local role row is stale.

Examples of current no-match rows include Stein Erik Hagen as Orkla styreleder, Rune Dalsaune as BAMA styremedlem, Erlend Ronning as Nortura styremedlem, Anne Berit Loset as TINE styremedlem, and Trond Bentestuen as REMA 1000 CEO.

## Attempt 2: PersonProfile roles from cited BoardMember rows

Command:

```bash
DOTENV_CONFIG_PATH=../../.env npm run db:backfill:person-profile-role-citations -- --dry-run
```

Result:

| Result | Count |
|---|---:|
| Profiles read | 35 |
| Cited BoardMember rows available | 178 |
| PersonProfile role FieldCitation plans | 19 |
| Skipped roles | 78 |
| skipped: no_match | 44 |
| skipped: unsupported_role | 34 |

Interpretation:

The 19 planned role citations are the already-covered role-level `PersonProfile` links. The 78 remaining gaps are split between:

- 44 profile roles that lack a unique cited BoardMember match,
- 34 roles that are not supported by the strict role normalizer, such as broad leadership, sector, or affiliation entries.

These should not be machine-attached without a stronger role-specific source.

## Attempt 3: Existing conditional Shareholder citation decisions

Commands:

```bash
for action in SH-BAMA-2024 SH-NG-2024 SH-KESKO-2024 SH-REITAN-2024 SH-AXFOOD-2024 SH-COOP-DK-2024 SH-ICA-2024 SH-HAGAR-2026; do
  DOTENV_CONFIG_PATH=../../.env npm run db:apply:conditional-shareholder-citations -- --dry-run --action=$action
done

for action in SH-BAMA-2024 SH-NG-2024 SH-KESKO-2024 SH-REITAN-2024 SH-AXFOOD-2024 SH-COOP-DK-2024 SH-ICA-2024 SH-HAGAR-2026; do
  DOTENV_CONFIG_PATH=../../.env npm run db:apply:conditional-shareholder-citations -- --apply --action=$action
done
```

Result:

| Action set | Result |
|---|---|
| Existing shareholder decisions | Applied idempotently |
| Net `Shareholder` coverage change | 0 |
| Remaining Shareholder gaps | 48 |

Interpretation:

The existing modelled shareholder decisions were already represented in the current coverage baseline. The remaining 48 shareholder gaps are outside those decisions and need new primary-source decisions or manual source acquisition.

## Verification after attempts

Command:

```bash
DOTENV_CONFIG_PATH=../../.env npm run db:audit
```

Result:

| Check | Result |
|---|---|
| Referential integrity | Passed |
| CompanyFinancial coverage | 151/151 (100.0%) |
| BoardMember coverage | 178/328 (54.3%) |
| PersonProfile role coverage | 19/97 (19.6%) |
| Shareholder coverage | 35/83 (42.2%) |

## Next work queue

1. Create new source decisions for the 48 remaining shareholder rows. Start with existing local annual-report text where available: Coop Norge, Salling Group, Reitan Retail, ASKO/NorgesGruppen-related rows and Hagar/Festi/Samkaup where official shareholder pages or annual reports exist.
2. For the 44 Norwegian BoardMember no-match rows, decide whether the row is historical/stale or whether another official source verifies it.
3. For SE/DK/FI/IS BoardMember gaps, use `research/nordic-registry-source-acquisition-queue-2026-05-18.csv` and the country-specific registry research files before creating `FieldCitation` rows.
4. For PersonProfile roles, only attach citations when the role can be uniquely tied to a sourced BoardMember row or a direct person/company source. Unsupported broad roles should remain uncited or be converted to less assertive profile metadata.
