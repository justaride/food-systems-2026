# Danmark/CVR source research - Coop Danmark A/S and Salling Group A/S

Access date: 2026-05-18

Scope: official CVR/Erhvervsstyrelsen/Virk sources for company metadata, owners, management and annual-report/document references for:

- Coop Danmark A/S, CVR 26259495
- Salling Group A/S, CVR 35954716

Evidence root:

`research/evidence-pack/registry-sources/dk-cvr-2026-05-18/`

## Official source map

Erhvervsstyrelsen identifies CVR as the authoritative register for current and historical Danish company data and states that CVR contains company identifiers, name/address, start/end dates, company form, industries, production units, responsible participants, founders, owners and management members. The same official page also says annual reports, articles, general-meeting minutes and other documents can be downloaded or ordered when viewing a company in CVR.dk.

Archived local source page:

- URL: `https://erhvervsstyrelsen.dk/cvr-samler-og-udstiller-data`
- Local: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/raw/erhvervsstyrelsen-cvr-source-page.html`
- Headers: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/headers/erhvervsstyrelsen-cvr-source-page.headers`
- Status: 200

Tested official/company-specific entry points:

- `http://distribution.virk.dk/offentliggoerelser/_search`
  - Result: 200 without login.
  - Use: public annual-report/document metadata and document URLs.
- `http://distribution.virk.dk/cvr-permanent/virksomhed/_search`
  - Result: 401, `WWW-Authenticate: Basic realm="Beskyttet adgang"`.
  - Stop-rule: requires valid `distribution.virk.dk` credentials / system-to-system access before fetching official structured company metadata, owners, roles and management.
- `http://distribution.virk.dk/registreringstekster/registreringstekst/_search`
  - Result: 401, `WWW-Authenticate: Basic realm="Beskyttet adgang"`.
  - Stop-rule: requires valid `distribution.virk.dk` credentials / system-to-system access before fetching official registration-text history.
- `https://datacvr.virk.dk/data/visenhed?...` and frontend JSON paths discovered from the public app bundle:
  - Relevant app paths found: `virksomhed/hentVirksomhed?cvrnummer=`, `virksomhed/hentAktiveEjerforhold?cvrnummer=`, `virksomhed/hentOphoerteEjerforhold?cvrnummer=`.
  - Result for direct JSON calls: 403 Cloudflare challenge.
  - Stop-rule: requires a normal/manual browser session that passes Cloudflare, or an approved automation route. Do not treat curl-only failure as absence of data.

## Acquired

All acquired artifacts are listed with URL, local archive path, headers path, HTTP status, SHA-256 and notes in:

- `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/manifest.csv`
- `research/dk-cvr-company-source-research-2026-05-18.csv`

Acquisition totals:

- Manifest rows: 118
- HTTP 200 artifacts: 104
- HTTP 401 stop artifacts: 4
- HTTP 403 stop artifacts: 10

Company-specific official document acquisition:

- Coop Danmark A/S / CVR 26259495
  - `offentliggoerelser` hits archived: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/raw/coop-danmark-as-offentliggoerelser.json`
  - Document reference JSON: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/metadata/coop-danmark-as-document-references.json`
  - Public official annual-report document metadata/hashes archived: 39 raw downloads kept in local evidence storage, not tracked in Git.
  - Latest period acquired: 2025-01-01 to 2025-12-31, published 2026-04-27, XML and XHTML.

- Salling Group A/S / CVR 35954716
  - `offentliggoerelser` hits archived: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/raw/salling-group-as-offentliggoerelser.json`
  - Document reference JSON: `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/metadata/salling-group-as-document-references.json`
  - Public official annual-report/ESEF document metadata/hashes archived: 58 raw downloads kept in local evidence storage, not tracked in Git.
  - Latest period acquired: 2025-01-01 to 2025-12-31, published 2026-04-29, XML, XHTML, ESEF XML and ESEF ZIP.

## Not acquired / blocked

Structured official company metadata, active/historical owners and management/role records were not acquired for either company.

Reason:

- The official `cvr-permanent` and `registreringstekster` Elasticsearch endpoints returned HTTP 401 with Basic authentication.
- The public CVR.dk/Virk frontend and its JSON endpoints were Cloudflare/JS-gated in this environment and returned HTTP 403 for direct non-interactive retrieval.

Next valid routes:

- Use approved `distribution.virk.dk` credentials/system-to-system access and rerun the same `cvr-permanent` and `registreringstekster` queries.
- Or open CVR.dk manually in a normal browser, pass the Cloudflare challenge, and export/archive the company view and owner/management panes.
- Do not substitute third-party paid APIs for official CVR/Erhvervsstyrelsen evidence unless explicitly marked as derivative/non-official.

## Changed files

- `research/evidence-pack/registry-sources/dk-cvr-2026-05-18/`
- `research/dk-cvr-company-source-research-2026-05-18.md`
- `research/dk-cvr-company-source-research-2026-05-18.csv`
