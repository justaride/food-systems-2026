# Reviewed Report access-date repair receipt — 2026-07-20

## Outcome

The 66 `Report` rows in `academic-source-quality-repair-queue.json` were reviewed at work level against authoritative publisher, agency, repository, DOI-registry, or first-party PDF surfaces.

| Classification                   |  Count | Mutation eligibility                                |
| -------------------------------- | -----: | --------------------------------------------------- |
| `exact_verified`                 |     52 | `accessedAt = 2026-07-20`                           |
| `locator_repair_verified`        |      3 | exact locator repair plus `accessedAt = 2026-07-20` |
| `generic_or_misbound_unresolved` |     11 | excluded; no seed or database mutation              |
| `bot_only_unverified`            |      0 | excluded                                            |
| `dead_unresolved`                |      0 | excluded                                            |
| **Total**                        | **66** | **55 eligible Report rows**                         |

This is bibliographic/work-identity verification, not a claim-level evidence appraisal. Findings, recommendations, interpretation, and downstream citation anchors were not revalidated by this batch.

## Verified locator repairs

| Report                                 | Reviewed before locator      | Exact work-level locator                             |
| -------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| `kesko-annual-report-2024`             | Kesko annual-report index    | Kesko-hosted `kesko_annual_report_2024.pdf`          |
| `norgesgruppen-halvarsrapport-h1-2025` | NorgesGruppen report archive | NorgesGruppen-hosted `halvarsrapport_ngasa_2025.pdf` |
| `salling-group-2024`                   | Salling publications index   | Salling Group Annual Report 2024 asset               |

The NorgesGruppen Report has one linked `Document` whose URL exactly mirrored the old generic archive locator and whose file path/content represent the H1 2025 PDF. The plan atomically updates that one `Document.url` and `Document.accessedAt` with full-row CAS. The linked Kesko and Salling Documents already have independent exact PDF locators; their full snapshots are plan-bound and explicitly preserved unchanged.

Representative PDF receipts include:

- Kesko Annual Report 2024: SHA-256 `2979731d3dc6aa1d21d1a70484c2f5c1e38052b31c828e35971e3414381bcc7d`, 277 pages.
- NorgesGruppen H1 2025: SHA-256 `01f997a6017c0cffc0ad2f31495788dd4e7c5993654b451ccd00d8a2d01b54db`, 27 pages.
- Salling Group Annual Report 2024: SHA-256 `7bda968b6db61b798a9aaaf817b1c398efd8f780c7cbc35c87dc09cecf37d3d8`, 117 pages.
- ASKO 2024: SHA-256 `94b68068c89e9713e968f3c5ef17ed0f4e74fa57206ea5dd383aac6b44529108`, 48 pages.
- Dagligvaretilsynet 2025: SHA-256 `82be185d01c81edb1cd2bf34bd5eaa3dba7a9b22fbebf51dfc4c2153eba27630`, 60 pages.
- Konkurransetilsynet price-hunter decision: SHA-256 `30ffb8293a0c58441c6a943c0c3605eaa2ed65f67a843123596af6bbc1eb6f43`, 492 pages.

Representative first pages were rendered and visually inspected in addition to metadata/text extraction. The full row-by-row evidence locator, optional PDF digest, title caveat, and classification are pinned in the JSON manifest.

## Unresolved — excluded from mutation

| Report                                 | Blocking reason                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arla-farmahead-check-2024`            | Generic sustainability hub and corporate reporting support FarmAhead data, but no separately published work with the synthetic stored title was identified. |
| `beredskap-finsk-modell-hvk`           | Generic HVK security-of-supply overview; no named 2024 work matching the row.                                                                               |
| `beredskap-nibio-selvforsyning-2026`   | Official NIBIO Rapport 12(46) has a different formal work title; locator-only repair would preserve an unresolved bibliographic mismatch.                   |
| `beredskap-nibio-selvforsyning-metode` | Handle resolves to a different 2023 NIBIO work, not the stored 2024 method title.                                                                           |
| `is-markedsstruktur-2024`              | Report index with no uniquely identified work matching the synthetic title.                                                                                 |
| `kbh-food-strategy-madhus`             | Strategy/status hub with a 2021 status publication; the stored 2025 row is a composite.                                                                     |
| `kt-markedsundersokelser-2026`         | Government press release dated 2025-07-01, not a named 2026 report.                                                                                         |
| `meld-st-4-dagligvare`                 | Locator is Meld. St. 4 (2024–2025), with a different formal title and subject.                                                                              |
| `plantefonden-projects-2023-2025`      | Homepage/composite across projects and years; no single named work.                                                                                         |
| `reitan-2024-25`                       | Archive has separate annual reports; the stored composite period and figures do not identify one work.                                                      |
| `sodertaelje-diet-green-planet`        | DiVA record is a different 2024 bachelor thesis; the stored 2023 title is misbound.                                                                         |

## Guarded mutation contract

- Manifest SHA-256: `a6a0959188fc24e5dba10f9c94e111ce4e05df2c75d3342f643d7bdc6a603e20`.
- Reviewed post-seed identity SHA-256 across all 55 Report rows: `8fe292b6684975de6d9e6290404d4ece27cb9ae518f2863e7f3b138619944420`.
- Reviewed pre-apply database plan SHA-256: `be63f733c7b06d812586c38661f2f50e9a4d466b0b1773093eb07ae9df50d1fc`.
- Pre-apply dry-run state: 55 Report updates pending, 0 already applied, 0 conflicts; 1 linked Document mirror update pending; 2 linked Documents protected unchanged.
- Applied state: all 55 Report updates and the 1 linked NorgesGruppen Document mirror update committed atomically; the 2 protected linked Documents remained unchanged.
- Post-apply dry-run state: 0 pending, 55 Reports already applied, the linked Document already applied, 2 linked Documents protected unchanged, and 0 conflicts.
- Reviewed post-apply plan SHA-256: `111eab5fc6ee1a66323509f56f6ddcada4594eb5b22cdb62119f6c541b55a07f`.
- Full-row CAS includes every portable Report field plus `documentId`. The linked Document update and protected Documents include their complete selected snapshots, including content, JSON metadata, timestamps, and relationship identity.
- Apply requires the exact plan SHA, explicit acknowledgement, advisory lock, row locks, and one Serializable transaction.
- Ordinary TypeScript bulk imports preserve existing locator/access metadata for every dated Report seed row and never write Report provenance on update; fresh creates may materialize the reviewed seed values.
- After the academic audit was regenerated, the Report access-gap queue contained exactly the 11 pinned unresolved IDs, none of the 55 applied targets, and no new Report gap IDs. The guarded runner accepts only the original pinned 66-row pre-apply scope or this exact post-apply residual; partial, extra, unknown, or target-leaking queue states fail closed.

## Database boundary

The guarded apply was executed once against the exact reviewed pre-apply plan. The subsequent dry-run and regenerated audit queue independently matched the complete post-apply state described above. No further database writes were performed during importer cleanup, queue-state hardening, or final static verification.
