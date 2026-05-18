# Sweden / Bolagsverket company-source research - 2026-05-18

Scope: official Swedish company-register and annual-report acquisition paths for Swedish companies in the food-systems dataset, with Axfood AB and ICA Gruppen AB as company-specific test targets. This is a source-acquisition artifact, not a field-level citation import.

Access date: 2026-05-18.

## Official source path found

Bolagsverket publishes an official API documentation page for annual-report information:

- Documentation URL: https://media.bolagsverket.se/diar/services/information/1.3/hamtaArsredovisningsinformation-1.3.html
- Local archive: `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/raw/bolagsverket-api-doc-v1-3.html`
- SHA-256: `7524184648e65f0e4330f4a133b4804e0c33c344bdb75cae26c1a57dbc9f15dd`

The archived page identifies the service as an API for retrieving basic information and case status. The documented endpoints are:

- `GET /arendestatus/{orgnr}`
- `GET /grunduppgifter/{orgnr}`

The documented examples use:

- `https://api.bolagsverket.se/hamta-arsredovisningsinformation/v1.3/arendestatus/{orgnr}`
- `https://api.bolagsverket.se/hamta-arsredovisningsinformation/v1.3/grunduppgifter/{orgnr}`

The documentation also lists a 403 response with the Swedish description `Obehorig anvandare av tjansten` in the local text representation, meaning an unauthorized user/service state.

## Company-specific test calls

Company-specific local calls were attempted for:

| Company | Tested organisation number | Endpoint |
| --- | --- | --- |
| Axfood AB | 5565420824 | `/grunduppgifter/5565420824`, `/arendestatus/5565420824` |
| ICA Gruppen AB | 5560482837 | `/grunduppgifter/5560482837`, `/arendestatus/5560482837` |

The Python/OpenSSL calls failed before a usable HTTP response with:

`SSLError: [SSL: SSLV3_ALERT_HANDSHAKE_FAILURE] ssl/tls alert handshake failure`

Local error artifacts:

- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/headers/axfood-grunduppgifter-5565420824.headers`
- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/headers/axfood-arendestatus-5565420824.headers`
- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/headers/ica-grunduppgifter-5560482837.headers`
- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/headers/ica-arendestatus-5560482837.headers`

A separate Node `fetch` attempt reached an established TLS connection to `prod-lb-api-ext.bolagsverket.se` but did not return within the local timeout window and was stopped manually. No response body was produced.

## Legacy/manual path check

The legacy SNR guide URL `https://snr.bolagsverket.se/snrgate/priser.do` was also tested as a possible document-ordering/acquisition reference. Automated fetch returned:

- `HTTP/1.0 503 Service Unavailable`
- `Server: BigIP`

Local artifacts:

- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/headers/bolagsverket-snr-guide-en.headers`
- `research/evidence-pack/registry-sources/se-bolagsverket-2026-05-18/raw/bolagsverket-snr-guide-en.html` (empty response body)

## Decision

Status: `registry_api_identified_company_fetch_blocked`.

The official Swedish API documentation is found and archived. It is useful evidence for the acquisition path, but it is not enough to create company-specific `SourceCitation` / `FieldCitation` rows for Axfood AB, ICA Gruppen AB or Swedish board/registry fields. Company-specific source data still requires one of:

1. approved Bolagsverket API access that returns company-specific data,
2. manual retrieval from Bolagsverket's current company-information service with archived output, or
3. another official company-specific source that contains the needed fields.

Until one of those routes is completed, Swedish registry/role citations should stay in the registry acquisition queue rather than being marked applied.
