# Nordic registry source snapshot - 2026-05-18

Scope: source-acquisition evidence for the registry queue. This snapshot does not create `SourceCitation`/`FieldCitation` rows and does not mutate company master data.

## Result

| Queue | Status | Evidence |
|---|---|---|
| `REG-SE-ANNUAL-REPORTS` | Front door archived, manual retrieval still required | Bolagsverket front door archived at `raw/bolagsverket-frontdoor-2026-05-18.html`; extracted text says `Sök företagsinformation` contains latest company/person information and lets users buy documents/certificates, lines 104-116. |
| `REG-SE-LEGACY-PRICE` | Live automated fetch blocked | `https://snr.bolagsverket.se/snrgate/priser.do` returned HTTP/1.0 503 from BigIP in `headers/bolagsverket-naringslivsregistret-priser-2026-05-18.headers`; treat this as a manual browser task before citing price/product details. |
| `REG-DK-CVR` | Browser verified, curl blocked | Official Erhvervsstyrelsen page was verified in browser on 2026-05-18: it states CVR contains current/historical Danish company information, public data, owners/management members, and annual-report/document retrieval/ordering. Raw `curl` received Cloudflare 403, archived as `raw/erhvervsstyrelsen-cvr-2026-05-18.challenge.html`. |
| `REG-FI-VIRRE` | Archived | PRH Virre raw/text archived. Extracted lines 11-23 verify official register data, free basic details/electronic trade-register extracts and paid financial statements/products. |
| `REG-IS-SKATTURINN` | Archived | Skatturinn Fyrirtækjaskrá raw/text archived. Extracted lines 20-28 verify beneficial-owner registration context and search across company register, annual accounts register and VAT register. |

## Stop rules

- Registry queue rows remain source-acquisition rows only. Do not treat them as field-level proof until the company-specific register document or company lookup has been acquired and archived.
- `REG-DK-CVR` must use a browser/API path, not plain `curl`, because the raw HTTP fetch receives a Cloudflare challenge.
- `REG-SE-LEGACY-PRICE` cannot be cited from the local archive yet; the only local live evidence is the 503 header.
- Swedish annual-report/representative evidence remains manual or paid acquisition unless an approved Bolagsverket API/access route is configured.

## Local evidence index

The machine-readable manifest is `registry-source-manifest-2026-05-18.csv`.

Large registry document downloads are intentionally kept out of Git. Commit the manifest, headers, metadata, extracted text and SHA-256 values; keep raw document payloads in the local evidence archive path recorded by the manifest.
