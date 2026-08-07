# Orphan `Document` FieldCitation repair receipt — 2026-07-20

## Decision

Read-only preflight against the local PostgreSQL target from the canonical `.env` found exactly 32 `FieldCitation` rows with `entityType=Document` whose historical `entityId` no longer exists in `Document`.

- 27 rows have a unique current `Document` identity supported by a direct `SourceCitation.documentId` binding, an exact unique `filePath` plus title, or the mechanical historical `text/*.txt` to current `downloads/*.md` path transition plus exact title.
- 5 rows do not have enough identity evidence for retargeting and remain quarantined.
- After the read-only review and focused gates passed, the 27 safe retargets were applied to the local PostgreSQL target in one guarded `Serializable` transaction. The five quarantined rows were not changed.

The full before-state of every `FieldCitation` and `SourceCitation`, the missing old `Document` ID, the 27 target identities, and the candidate evidence for the five quarantined rows are pinned in:

- `research/_status/orphan-document-field-citation-repair-manifest-2026-07-20.json`
- canonical manifest SHA-256: `ae8740e68d2cd2c9c88483af01b8e3c9407c956b7bd6dc94e7eed90c88dabd49`

## Safe retarget plan

The seed-independent runner is `scripts/repair-orphan-document-field-citations.ts` (`npm run repair:orphan-document-field-citations`). It:

- defaults to dry-run;
- requires an exact ACK and the current reviewed plan SHA-256 for apply;
- takes a transaction-scoped advisory lock;
- locks the complete pinned `FieldCitation` inventory `FOR UPDATE` and all pinned `SourceCitation`/target `Document` dependencies `FOR SHARE`;
- verifies full `FieldCitation` and full `SourceCitation` before-snapshots, missing old IDs, exact target identities, the global orphan inventory, and unique-tuple collision absence;
- uses a full-row compare-and-swap and updates only `FieldCitation.entityId`;
- re-inspects the complete target and quarantine after mutation inside one `Serializable` transaction;
- is idempotent for the exact after-state.

Reviewed pre-apply dry-run:

- plan SHA-256: `ecc4078280961b251077a9600efc796fab00fb3423d5c9cea80cd067a8effd9f`
- pending: 27
- already applied: 0
- quarantined: 5
- conflicts: 0
- apply result: 27 exact `entityId` retargets committed; no other `FieldCitation` field changed

Post-apply idempotency dry-run:

- plan SHA-256: `0d7fe4bf61dcd5a3f3ce55fe5b746be1bed2f8fb5feb7ae1fbae10a3d365e570`
- pending: 0
- already applied: 27
- quarantined: 5
- conflicts: 0

Proof distribution:

| Proof | Rows |
|---|---:|
| exact local path and title | 4 |
| direct `SourceCitation.documentId` plus path/title/URL identity | 1 |
| derived download path and exact title | 22 |

### Exact safe targets

| FieldCitation | Missing old Document | Current target Document | Proof |
|---|---|---|---|
| `cmpdafm93025jsxvmditf4exu` | `cmp8xyjpt006avvvm5qsfuy1g` | `cmp8xyjpv006bvvvm83sagtbu` | `exact_local_path_and_title` |
| `cmpdafm93025ysxvmeu1obexb` | `cmp8xyjsv006ovvvm1o03ok49` | `cmp8xyjtd006pvvvm7lqoh2cv` | `exact_local_path_and_title` |
| `cmpdafmb202tjsxvm55xvhlkb` | `cmp8xyoej00k6vvvm63gli4a8` | `cmppajyyi001xnjvm9v3f2zzf` | `source_citation_document_binding` |
| `cmpdafmb202ulsxvmne8ck0lt` | `cmp8xyozb00l1vvvmhqvo6e84` | `cmqgiod4m00mm4nvmmhjlsda8` | `derived_download_path_and_title` |
| `cmpdafmb202umsxvm8sj2e9s0` | `cmp8xyp2500l6vvvmkrq7whbq` | `cmqgiod7v00mv4nvmtnfs7q5i` | `derived_download_path_and_title` |
| `cmpdafmb202unsxvmor0osmsh` | `cmp8xyp3j00l9vvvmdvbn87m0` | `cmqgiodae00n24nvmfn9vih7l` | `derived_download_path_and_title` |
| `cmpdafmb202w4sxvm775f1ubg` | `cmp8xyjqq006fvvvm50557glx` | `cmp8xyjqz006gvvvmv27a72yh` | `exact_local_path_and_title` |
| `cmpdafmb202ymsxvm3m9gvt73` | `cmp8xyp0j00l3vvvmzq55vujh` | `cmqgiod5s00mp4nvmilwq530r` | `derived_download_path_and_title` |
| `cmpdafmb202ynsxvmob2s0sub` | `cmp8xyp1100l4vvvmazz869vp` | `cmqgiod6800mq4nvmwa9yhgy` | `derived_download_path_and_title` |
| `cmpdafmb202yqsxvmn5o43oxf` | `cmp8xyp3200l8vvvmtug9ph22` | `cmqgiod8q00mx4nvm8l4am69u` | `derived_download_path_and_title` |
| `cmpdafmb202yrsxvmmxctsjom` | `cmp8xyp5j00lcvvvms0hschtd` | `cmqgiodbq00n54nvmzcfhddix` | `derived_download_path_and_title` |
| `cmpdafmb202yssxvmuameowo0` | `cmp8xyp5z00ldvvvmy9hivy3z` | `cmqgiodc700n64nvm0kdmtt83` | `derived_download_path_and_title` |
| `cmpdafmb202ytsxvmmoh9ubyx` | `cmp8xyp6e00levvvmzh8jgy4q` | `cmqgiodcl00n74nvmb7fre2pw` | `derived_download_path_and_title` |
| `cmpdafmb3031lsxvmtyw2faon` | `cmp8xyowk00kwvvvmuzbvthyz` | `cmqgioczo00m74nvm9fd3ugsf` | `derived_download_path_and_title` |
| `cmpdafmb3031msxvmz3axhoqs` | `cmp8xyoxv00kyvvvmxrj9qt0x` | `cmqgiod2200md4nvm2uon16pj` | `derived_download_path_and_title` |
| `cmpdafmb3031nsxvmxx5qdmpv` | `cmp8xyoyw00l0vvvmlbn67vts` | `cmqgiod3100mf4nvm68s6rl18` | `derived_download_path_and_title` |
| `cmpdafmb3031osxvmll9z6580` | `cmp8xyp2n00l7vvvmugbdd8qp` | `cmqgiod8c00mw4nvm64mtv6md` | `derived_download_path_and_title` |
| `cmpdafmb3031psxvmb4gd6oft` | `cmp8xyp4m00lavvvmw58zp9v5` | `cmqgiodat00n34nvm7lo61mke` | `derived_download_path_and_title` |
| `cmpdafmb3031qsxvm5mcsswfl` | `cmp8xyp7a00lgvvvmn3p8lrmg` | `cmqgioddf00n94nvm0nkjl7qt` | `derived_download_path_and_title` |
| `cmpdafmb3033esxvmns92dx8v` | `cmp8xyp5200lbvvvmg5k51l6m` | `cmqgiodb900n44nvmbbpc17eh` | `derived_download_path_and_title` |
| `cmpdafmb30360sxvmmh5nltml` | `cmp8xyjus006vvvvm8aoiz9bm` | `cmp8xyjvn006wvvvm9lchxebw` | `exact_local_path_and_title` |
| `cmpdafmb30370sxvmhghtqc5h` | `cmp8xyovu00kvvvvm5l7hlj6d` | `cmqgiocz300m64nvmw39wu96r` | `derived_download_path_and_title` |
| `cmpdafmb30371sxvm5pbcbshy` | `cmp8xyoye00kzvvvmo72m5kg6` | `cmqgiod2k00me4nvmqhu59zdo` | `derived_download_path_and_title` |
| `cmpdafmb3037psxvmfh29yhnp` | `cmp8xyovd00kuvvvm8ucczc0g` | `cmqgiocyo00m54nvmwd8z22ih` | `derived_download_path_and_title` |
| `cmpdafmb3037qsxvmoj6lpaib` | `cmp8xyozs00l2vvvm3ruec3js` | `cmqgiod5900mo4nvm196zby1n` | `derived_download_path_and_title` |
| `cmpdafmb3037rsxvm80a01q59` | `cmp8xyp1k00l5vvvmlyjnzqn1` | `cmqgiod6v00ms4nvmiva4mh6l` | `derived_download_path_and_title` |
| `cmpdafmb3037ssxvmla2fnbdd` | `cmp8xyp6v00lfvvvm0wh12fii` | `cmqgiodd000n84nvm8a5fvbo8` | `derived_download_path_and_title` |

## Five-row quarantine and reviewed disposition

All five quarantined rows are machine-created `backfill-existing-locators` bindings. Each has `claimText=null`, `confidence=null`, and only a locator field (`filePath` or `url`). None of their five `SourceCitation` rows is used as an Insight primary citation, Producer primary citation, or EvidenceAppraisal review-basis citation.

The reviewed disposition is deliberately separate from the 27-row retarget:

- `research/_status/orphan-document-field-citation-disposition-plan-2026-07-20.json`
- canonical disposition SHA-256: `73f16cd2f67e76e4a4b5996953dcd21c9e51d5ed2ac98f49cbb51cc9e252cb4a`
- runner: `scripts/plan-quarantined-orphan-field-citation-disposition.ts`
- package dry-run command: `npm run plan:orphan-document-field-citation-disposition`
- package guarded-repair command: `npm run repair:orphan-document-field-citation-disposition`
- reviewed operation: delete only the five exact corrupt `FieldCitation` rows; preserve all five full `SourceCitation` rows and every other dependency
- apply status: enabled only behind the separate exact ACK and the current reviewed plan SHA-256
- mixed-state rule: any 1–4 already-missing target rows is a hard `mixed_partial_disposition` conflict; the only valid states are all five present or all five disposed

Reviewed pre-apply disposition dry-run:

- plan SHA-256: `ba512fc97cfee68ca5aaa497414eae7afebb2e8cd4f521f5c5c30cf2fa770b94`
- pending deletion candidates: 5
- already disposed: 0
- preserved SourceCitations: 5
- SourceCitations left with no FieldCitation after the proposed deletion: 3
- valid parallel FieldCitations preserved after the proposed deletion: 2
- conflicts: 0
- local apply result: exactly five corrupt `FieldCitation` rows deleted; all five `SourceCitation` rows and both valid parallel bindings preserved

Post-apply disposition dry-run:

- plan SHA-256: `1f8de350bb5b775df06478403260de7696a8e4a1ac0b6348e1a2ea8d33f2463e`
- pending deletion candidates: 0
- already disposed: 5
- preserved SourceCitations: 5
- preserved valid parallel FieldCitations: 2
- global dangling `Document` FieldCitations: 0
- conflicts: 0

| Quarantined FieldCitation | SourceCitation preserved | Current FieldCitations | Remaining after proposed deletion | Reason |
|---|---|---:|---:|---|
| `cmpdafmb102s1sxvmj1p65d1r` | `cmpdaflwc00t1sxvmb76zbsf8` | 1 | 0 | `path_title_disagree` |
| `cmpdafmb202tesxvm6b0oc1ma` | `cmpdaflws00udsxvmc1wcmy86` | 1 | 0 | `duplicate_path_title_identity` |
| `cmpdafmb202w3sxvm3jxu67ss` | `cmpdaflrw00hosxvmlpp6f56j` | 2 | 1 | `url_duplicate_without_path` |
| `cmpdafmb202ygsxvmoqiuw0rk` | `cmpdafly300zdsxvmoq9wb6hm` | 1 | 0 | `derived_path_title_disagree` |
| `cmpdafmb3035zsxvmwp3x2g3o` | `cmpdaflrx00hqsxvmd3be1ra7` | 2 | 1 | `url_duplicate_without_path` |

The two preserved parallel bindings are:

- `cmpdafm9402gesxvmm27r9e8m` to existing Document `cmp8xyjqz006gvvvmv27a72yh` for the NHH FOOD URL citation.
- `cmpdafm9402ggsxvmo4l21fpl` to existing Document `cmp8xyjvn006wvvvm9lchxebw` for the *Mot bedre vitende* URL citation.

## Verification

- Safe retarget pre-apply dry-run against the local DB: PASS, 27 pending / 5 quarantined / 0 conflicts.
- Safe retarget apply against the local DB: PASS, exactly 27 rows committed in the reviewed transaction.
- Safe retarget post-apply dry-run: PASS, 0 pending / 27 already applied / 5 quarantined / 0 conflicts.
- Reviewed disposition dry-run against the local DB: PASS, 5 candidates / 5 SourceCitations preserved / 0 conflicts.
- Reviewed disposition apply against the local DB: PASS, exactly 5 corrupt links deleted; 5/5 SourceCitations and 2/2 parallel bindings preserved.
- Reviewed disposition post-apply dry-run: PASS, 0 pending / 5 already disposed / 0 conflicts; global dangling `Document` target count is 0.
- Disposable exact apply: PASS, 5 target FieldCitations deleted, 5/5 SourceCitations preserved, both valid parallel FieldCitations preserved, and zero target rows remained.
- Disposable all-disposed re-apply: PASS, 0 rows deleted and 5 rows classified already disposed.
- Disposable mixed-state gate: PASS, a controlled 1-of-5 deletion was rejected with `mixed_partial_disposition` and no runner mutation followed.
- Focused tests: PASS, 11/11.
- Package-script regression tests: PASS, 36/36.
- Focused ESLint: PASS.
- TypeScript (`tsc --noEmit`): PASS.
- Scoped `git diff --check`: PASS.
- Negative CLI gate: safe retarget `--apply` without ACK fails before DB work.
- Negative disposition gates in disposable DB: missing ACK and wrong plan SHA-256 both fail before mutation.
- Canonical database write count for the reviewed disposition: 5 `FieldCitation` deletions and zero `SourceCitation` mutations.
- Pre-disposition rollback dump: `/Users/gabrielfreeman/.local/share/foodsystems/backups/foodsystems-pre-fieldcitation-disposition-20260719-20260719T223746Z.dump`, SHA-256 `335ae87f224ff4ede5893929f752df220371bd7500303951995c2e6d07299cf0`.
- The dump checksum/archive verification and a full disposable PostgreSQL restore drill both passed; the disposable database was confirmed removed. The first attempt used the non-superuser application role, failed closed on the `vector` extension, and also removed its disposable target before the successful superuser-admin drill.

## Remaining blockers

1. Apply and verify the now-unblocked controlled-mutation integrity migration.
2. Rerun schema migration verification, the full test/type/lint/build gates, and create/verify a fresh metadata-v2 backup plus restore receipt after the release-control tables exist.
