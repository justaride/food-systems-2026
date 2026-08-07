# Controlled source acquisition workflow v1

Workflow ID: `workflow.controlled_source_acquisition.v1`

Workflow version: `1.0.0`

Status: internal acquisition workflow

This workflow obtains one exact byte stream from a credential-free HTTPS URL. It requires an explicit network-execution gate, follows redirects manually, refuses non-HTTPS destinations, requests identity encoding, records the complete redirect and response chain, and emits a domain-separated source-acquisition receipt. The adapter may use Node HTTPS/1.1 or an explicitly selected curl HTTP/2 transport. The curl transport ignores user configuration, does not load cookies or credentials, and does not follow redirects itself; the receipt generator remains the only redirect controller.

For a source already held in the private corpus archive, the batch adapter must verify both existing `0400` content-addressed copies before fetching. The two roots and two files must be physically distinct, and the fresh body must match their exact hash and size. Absolute private paths are never written into the receipt.

A successful receipt proves only how these exact bytes were obtained. It does not establish source authority, identity, interpretation, rights, publication readiness or coverage.
