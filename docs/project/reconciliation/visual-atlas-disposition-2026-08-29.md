# Visual-atlas reconciliation disposition

Source branch: `codex/visual-system-atlas-v1` at `d35b2065a3b67785aa53c1bed954649e70baacde`<br>
Target baseline: `origin/main` at `3f4726854fd10240093d4cd67285c033894a0df3`

## Commit ledger

| Commit | Title | Classification | Reason | Intended task | Final disposition | Candidate commit | Verification |
|---|---|---|---|---|---|---|---|
| `33b48cc` | chore: gitignore dekk privat arkiv og slettemappe med tarballs | `reconstruct` | Only still-meaningful ignore rules should be recreated on current main. | Task 5 — retain local and reproducible bulk exclusions. | Reconstruct selected rules; do not replay the historical commit. | Task 5 commit | Pending Task 5 checks. |
| `2ef226d` | docs: nattsesjon 2026-08-04 og sesjon 2-4 — rapporter, triage og etterkontroll | `archive_only` | Night-session and triage material is historical and not current authority. | Task 1 — preserve as recoverable source history. | Park on source branch. | None | Source branch remains recovery source. |
| `0b60f52` | docs: autonomipolicy for KI-agenter og QA-validering av canonical-pausepunkt | `selective_salvage` | Dated governance and QA artifacts can be retained when not superseded. | Task 2 — salvage dated governed documents. | Salvage applicable dated files under project history. | Task 2 commit | Pending Task 2 artifact and provenance checks. |
| `ec1c0d5` | docs: rapport totalgjennomgang 2026-08-05 — prosjektstatus, DB, kunnskapsgrunnlag | `selective_salvage` | Dated total-review report is historical evidence, not a replacement for current status. | Task 2 — salvage dated governed documents. | Salvage the dated report under project history. | Task 2 commit | Pending Task 2 artifact and provenance checks. |
| `6d64394` | vault: stroekne tall merket, Dagrofa/REMA-duplikater flettet, styregraf-seksjoner | `semantic_port` | Wholesale replay mixes useful claim corrections with obsolete navigation and generated state. | Task 3 — port independently justified vault corrections. | Claim corrections integrated; Dagrofa/REMA deletion blocked on canonical source identity reconciliation; SPCR downgrade parked because newer current evidence supersedes the old caveat. | Task 3 commit | Pending focused and full vault tests. |
| `5b12d82` | feat(citations): reparasjons-, proveniens- og evidensvurderingsverktoey med kvitteringer | `already_on_main` | Citation tooling and evidence surfaces are already represented on current main. | Task 1 — record no replay required. | Already integrated; no copy or cherry-pick. | None | Compare against current main history/tree. |
| `eecaa6a` | feat(db): migrasjoner, release-kontroller, backup/restore-drill og MCP-herding | `already_on_main` | Database and release surfaces are already represented on current main; replay risks retired behavior. | Task 1 — record no replay required. | Already integrated; do not replay or mutate production. | None | Compare against current main history/tree. |
| `6a75fa9` | feat(library): biblioteksanalyse-reparasjoner, ekstern review og soekeforbedringer | `already_on_main` | Library-analysis implementation is already represented on current main. | Task 1 — record no replay required. | Already integrated; no copy or cherry-pick. | None | Compare against current main history/tree. |
| `b132dd5` | docs(research): kildebibliotek, evidensnotater og vault-eksport synket med kanonisk linje | `already_on_main` | The large research-sync surface is substantially byte-identical or newer on current main. | Task 1 — record no replay required. | Already integrated; do not copy stale versions. | None | Compare changed paths with current main. |
| `d9f94cf` | docs: grenstrategi-anbefaling for canonical vs visual-atlas | `archive_only` | Branch-strategy advice predates the later canonical merge into main. | Task 1 — preserve historical rationale only. | Park on source branch. | None | Source branch remains recovery source. |
| `349b1db` | chore: gitignore reproduserbar bulk-data fra åpne registre | `reconstruct` | Only exclusions with a retained package and documented regeneration path remain meaningful. | Task 5 — retain reproducible bulk exclusions. | Reconstruct the narrow current rule only. | Task 5 commit | Pending ignore-rule and negative-pattern checks. |
| `41aa2d7` | docs: status 2026-08-05 og fase-2-utkast (innsynsbrev, mission 1-klargjøring) | `selective_salvage` | Dated status and drafts are useful history but remain explicitly non-authoritative and unsent. | Task 2 — salvage dated governed documents. | Salvage under project history with draft boundaries. | Task 2 commit | Pending artifact, link, and unsent-draft checks. |
| `5e4285b` | data: fiskeridirektoratet åpne data + aktivitetsmatch 194/270 sjømataktører | `archive_only` | Large historical snapshots and derived files are not part of the current governed landscape model. | Task 1 — preserve recoverability without replay. | Park on source branch. | None | Source branch remains recovery source. |
| `e8a3237` | data: aktivitetssignaler brreg/mattilsynet — 235/351 verifisert aktive, 5 døde selskaper funnet | `archive_only` | Large historical snapshots and derived files are not current canonical evidence. | Task 1 — preserve recoverability without replay. | Park on source branch. | None | Source branch remains recovery source. |
| `4c89ea5` | docs(research): primærkildematrise for strøkne tall — 12 klynger verifisert mot primærdok | `selective_salvage` | Primary-source matrix and captured public pages can be retained with locators and rights boundaries. | Task 2 — salvage dated research artifacts. | Salvage reviewed matrix and governed captures only. | Task 2 commit | Pending research-artifact and provenance checks. |
| `d35b206` | docs(research): orphanRoots-eieranalyse, aksjonærregister-utkast og nordisk registerplan | `selective_salvage` | Ownership analysis, unsent draft, and registry plan are useful but remain bounded research artifacts. | Task 2 — salvage dated research artifacts. | Salvage with explicit unsent, non-authoritative, and source-status labels. | Task 2 commit | Pending research-artifact and provenance checks. |

## Historical capture provenance ledger

The seven HTML captures remain on the recovery branch and are not copied into the target worktree. These entries preserve their source locators and require a human rights decision before any further use.

| Branch path | Source URL | Source commit | Git blob id | rightsStatus |
|---|---|---|---|---|
| `research/bibliotek/primaerkilder-2026-08-05/landbruksdirektoratet-82500-tonn-matkorn-2029.html` | https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/82-500-tonn-matkorn-pa-lager-innen-2029--i-mal-med-kontrakter | `4c89ea5` | `0a3ea3a0cefc7552f77df1e6aa96b4267b14e2a7` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/landbruksdirektoratet-matkorn-kontrakter-2026-2027.html` | https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/inngar-kontrakter-for-lagring-av-matkorn-med-oppstart-i-2026-og-2027 | `4c89ea5` | `e68dbeec72ae7e39fbf05cd218c7402575270328` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/leroy-kelp-mussel-meal.html` | https://www.leroyseafood.com/en/tasty-seafood/environment-and-society/increasing-production-of-kelp-and-mussel-meal/ | `4c89ea5` | `306edd668193064650de99f26b4d8c758d97deaf` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/miljodirektoratet-landbasert-oppdrett-utslippskontroll-2025.html` | https://www.miljodirektoratet.no/aktuelt/nyheter/2025/mai-2025/landbasert-oppdrett-har-for-darlig-utslippskontroll/ | `4c89ea5` | `276362ce2e5a181d637126e33d3560fba3cd6029` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/nesa-finland-emergency-grain-stockpiles-2022.html` | https://www.huoltovarmuuskeskus.fi/en/a/national-emergency-supply-agency-boosting-finlands-emergency-grain-stockpiles | `4c89ea5` | `6d6c03df6fa6ff1f8f1001692f0368b61c757a93` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/ragnsells-insect-breakthrough.html` | https://newsroom.ragnsells.com/posts/pressreleases/new-technology-leads-to-breakthrough-in-insec | `4c89ea5` | `9f7250d1d0e54419a02f87dd85b124079fdea638` | `human_gate` |
| `research/bibliotek/primaerkilder-2026-08-05/riksdagen-prop-2025-26-205-beredskapslager.html` | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/beredskapslager-i-livsmedelskedjan_hd03205/ | `4c89ea5` | `4a34f10cdda13d14e02aaa079bf2b682efd7aefe` | `human_gate` |

## Dirty-tree ledger

| Dirty material | Final disposition | Candidate commit | Verification |
|---|---|---|---|
| 7 tracked paths | Review path by path; preserve current main versions where superseded. | Tasks 2–5 as applicable | Pending final diff audit. |
| 201 untracked files identical to main | Already integrated; do not copy or stage. | None | Byte comparison against main recorded in approved census. |
| 8 differing untracked files | Reconcile individually; retain only approved current-worthy content. | Tasks 2–5 as applicable | Pending path-level review. |
| 19 main-absent untracked files | Park unless explicitly selected by a later task. | None unless later task selects | Pending final parked-artifact audit. |
| five newline-only chart metrics | Generated/noise; do not integrate. | None | Pending diff check. |
| citation-readiness preview | Preserve as generated review candidate; do not promote to canonical evidence. | None | Pending provenance/status check. |
| FSD bundle | Refit through the current landscape model and offline gzip/hash contract. | Task 4 commit | Pending FSD test and deterministic rebuild. |
| six extra raw captures | Separate evidence-intake review with rights, locator, hash, and manifest checks. | None pending review | Pending evidence-intake review. |
| local QA screenshot | Local QA artifact; do not integrate. | None | Pending final parked-artifact audit. |

This ledger proves only local reconciliation against the recorded Git objects. It does not prove push, pull request, merge, deployment, runtime SHA, authenticated UI, publication authority, or external-source rights.

Recovery source: `codex/visual-system-atlas-v1` at `d35b2065a3b67785aa53c1bed954649e70baacde`. Do not delete or rewrite that branch until every parked artifact has an owner-approved retention decision.
