# Source-acquisition receipt contract v1

Status: strict internal contract

Schema version: `source-acquisition-receipt-v1`

Implementation version: `1.0.0`

A source-acquisition receipt records how one exact byte stream was obtained from one controlled locator. It is a separate prerequisite for source-identity verification. An identity artifact that merely names a receipt has not proved acquisition provenance until the receipt file, its byte hash, its domain-separated internal seal and all cross-bindings have passed the combined validator.

## Controlled HTTPS fetch

The HTTPS variant records the requested and final HTTPS locators, every redirect hop in order, the final HTTP status, normalized content type, optional `Content-Length`, observed body size and SHA-256, fetch tool and workflow versions, and an ordered observation window. Redirects are followed manually, credentials are omitted, non-HTTPS redirect targets are forbidden, and the final body must be non-empty.

The receipt does not claim that a URL is authoritative merely because it is reachable. Source-identity matching still evaluates whether the requested and observed locators belong to the provisional corpus identity.

## Controlled private access

The private variant binds the requested and final `private://` locator to an exact recovery-manifest ID, version, portable path, file hash and internal manifest seal. Its manifest entry binds the portable content path, content hash and size. Exactly two ordered copy attestations are required: primary and replica. They must name distinct storage roots and locators and reproduce the same content hash and size with file mode `0400`.

This is an attestation contract, not a substitute for the private verifier that creates the receipt. The receipt contains no absolute private path or source text.

## Integrity and use

`receiptSha256` is SHA-256 over a fixed domain prefix plus canonical JSON of the complete receipt body without the seal. This prevents a hash from another artifact class being reused as an acquisition receipt. A referencing identity artifact also records the receipt ID, version, type, portable repository path, exact receipt-file byte hash and internal seal.

The standalone identity validator checks only the identity artifact and its exact receipt reference. Provenance is established only by `validateSourceIdentityVerificationWithAcquisitionReceipt`, which parses the referenced receipt bytes, verifies both hashes, and cross-binds source ID, requested and final locator, raw-content hash and raw-content size.

No acquisition receipt approves source role, interpretation, owner review, rights, publication or coverage.

The normative implementation is `src/lib/knowledge/source-acquisition-receipt.ts`; the portable schema is `knowledge/schema/source-acquisition-receipt.schema.v1.json`.
