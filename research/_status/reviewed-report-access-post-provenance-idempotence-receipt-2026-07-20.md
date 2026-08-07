# Reviewed Report access post-provenance idempotence receipt — 2026-07-20

## Result

**PASS — no database mutation.** The historical 55-row Report access-date
batch remains fully applied after the later seven-row provenance correction
and ETMV 2024 title repair. Its guarded runner now recognizes only the exact
historical 66-row pre-apply queue or the exact current 9-row post-provenance
residual; the superseded 11-row residual and every partial/extra/reordered
variant fail closed.

This receipt supplements, but does not rewrite, the historical access receipt
that correctly recorded 11 unresolved rows at its own generation time.

## Bound overlays

- original access manifest SHA-256: `a6a0959188fc24e5dba10f9c94e111ce4e05df2c75d3342f643d7bdc6a603e20`
- seven-row provenance manifest SHA-256: `50439ce9a76fbcbd842abd7a8d101c509ad5eb1fc9a20b8ac12075b8f7326d8d`
- exact residual ID-order SHA-256: `eb8ee51bae174d8f5a3b01fe20c0046a18d6b3e512c8f980175192aadcb9a963`
- exact complete residual rows SHA-256: `ff3f038fb03735ba35fb21f28b85317f5f43d1a5d64fe9fbdd4f5583cf9a1701`
- current idempotent database plan SHA-256: `111eab5fc6ee1a66323509f56f6ddcada4594eb5b22cdb62119f6c541b55a07f`

The provenance overlay binds five retained historical unresolved rows, six
rows removed from the external-access denominator as composite or blocked,
and four newer external access gaps. The title overlay binds both exact ETMV
2024 title states without authorizing this access runner to change the title.

## Exact current residual

| Report id | Complete queue-row SHA-256 |
|---|---|
| `akademia-sifo-kundeprogram-2026` | `f63abb1ef579382eec29f1984c538c91e01396f8c50054553595469f1b3e65cc` |
| `arla-farmahead-check-2024` | `02750be88f25baf31cc0035f7031068075e93281398a9949200429642d3753ac` |
| `beredskap-nibio-selvforsyning-2026` | `56d3a0fe99d024aaa152fd87e67da4a71173947de9e6fe09bcdca421dff764e6` |
| `beredskap-nibio-selvforsyning-metode` | `80e282862d2acd1ffd6a2d876a82599aca74091c1dcc3b69c2ffbab6d0cdb8f3` |
| `coop-2024` | `ff25c26973799fb068ebfac0f8a661d4c76f36b26dce2cf171aa08f514655685` |
| `dk-salling-coop-decision-2025` | `92a147c8eaaaa2eb6a97c8ca1b65d5b7667c7f0c77a49a921826982d770b1333` |
| `emv-kartlegging-2023` | `0a3b65bc48283d09611b1dfc3a764f754ff57a78da9413f6ba738b043f94a6cb` |
| `kt-markedsundersokelser-2026` | `47f481b1ae8e57670bf333f140b2b173e12aaac06614302c543e25819a123a68` |
| `meld-st-4-dagligvare` | `7c53796ec6c1e7206a1d04b0672806a4a7283d0475c485933c12c79620351931` |

## Verification

The live runner returned 55 already applied, 0 pending and 0 conflicts;
linked Documents were 1 already applied plus 2 explicitly protected. Focused
tests passed `11/11`; TypeScript, targeted ESLint and `git diff --check`
passed. No database row was written.
