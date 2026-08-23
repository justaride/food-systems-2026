# Library-analysis acquisition pilot — 2026-08-21

## Result

**PASS for the bounded private acquisition and emit pilot.** The pilot selected
exactly eight sources into a separately hashed population and plan. Six sources
produced verified content units; two remained explicit blockers. No model or
candidate-database write was invoked.

This receipt does not prove full-corpus acquisition, candidate persistence,
human review, external claim readiness, migration, deployment, production
parity or publication authority.

## Code and immutable bindings

- Acquisition/emit implementation commit: `ce4421658ce7b5e006e1e5481a4bcc5cb6fd3e62`
- Recursive private-readback verifier commit: `b37cd8489e0f9de8f0155630eca2f81dcfec9b01`
- Full population snapshot file SHA-256: `63b345286d0bc1be5ed54d2b6f976fc634a7efa8852670086c4b05123c1098d6`
- Full population hash: `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- Full acquisition plan hash: `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`
- Pilot selection hash: `280638c78891c3238089d6b50f0ccb2f78d808154eeb8fb7997e4a984b8d7a46`
- Pilot population hash: `82ab2f637658b5cf037e5b1febabdb3e45ea040ec043b45556b70b57650d5d6e`
- Pilot acquisition plan hash: `01e46e0d3879c981cf562ca3eb3dac13401ddf7db5dfeaf633f7ded800de1165`
- Resolution hash: `5214062db288754e6f68457eb185ff503c34fd166a10221965fa32c9b3f53054`
- Content-unit manifest hash: `6bf62dc02ebff6b232bd209549e895d735a47ef60f574e7364847ee0720ac6e9`
- Cost-envelope hash: `20bff045c769f19eeccfee6427bf1a9933f52313fe8b87d78c70c60dd1610907`
- Private inventory hash after recursive readback: `ba2aa3c379be47fde6e92f431e58bf8cf3fb98279d7388a88b74c9b872d7edc2`

No URL, private absolute path, raw text, extracted text, secret or unhashed
source identifier is retained in this tracked receipt.

## Pilot scope and dispositions

| Route | Count |
|---|---:|
| `database_document` | 2 |
| `controlled_https` | 2 |
| `repository_csv` | 1 |
| `repository_pptx` | 1 |
| `database_derived_record` | 1 |
| `unresolvable` | 1 |
| **Total** | **8** |

| Disposition | Count |
|---|---:|
| `content_units_ready` | 6 |
| `blocked_input:http_forbidden` | 1 |
| `blocked_input:missing_locator` | 1 |
| **Total** | **8** |

The ready sources produced `440` deterministic, non-overlapping content units.
The high unit count is expected because the selector intentionally included
the largest current database document.

## Private readback and cost envelope

- Private files read and mode/hash checked: `468`
- Private directories checked as mode `0700`: `9`
- Private bytes read: `31,886,220`
- Ready-source normalized payload: `3,960,608` Unicode code points and
  `3,991,211` UTF-8 bytes
- One-pass input estimate: `943,002–1,320,203` tokens
- Analysis plus separate validation estimate: `1,886,004–2,640,406` tokens
- Estimator: `codepoints-interval/1.0.0`; this is not billing truth

Resolution-aware intake validation re-read all `440` unit payloads by expected
path, size, mode and SHA-256 before simulating append. The append callback was
non-persistent and returned replay state only.

## Controls and stop lines

```text
automatedOnly=true
externalReady=false
candidateDatabaseWritten=false
productionDataMutated=false
networkScope=bounded_pilot
```

- Source-database operations were `REPEATABLE READ` and explicitly read-only.
- Repository files were read without mutation and bound to observed SHA-256.
- Network execution was constrained by the separately hashed eight-source plan;
  only its two `controlled_https` rows were eligible for external requests.
- HTTP deterministic blockers were not retried or narrated away.
- Candidate intake still requires its separate database URL, resolution chain,
  attested writer and authorization gate.
- No candidate role, migration, model provider, paid inference, deployment or
  production action was activated.

## Verification

- Witnessed RED then GREEN covered execution gates, retries, alternate locator,
  local routes, private emit, resolution-aware intake, pilot selection and
  recursive private-store audit.
- Full library-analysis plus private-store gate: `260` tests passed, `0` failed.
- `npx tsc --noEmit`: exit `0`.
- Targeted ESLint: exit `0`.
- Research-artifact audit against `origin/main`: `5,796` tracked files checked,
  `0` violations.
- `git diff --check`: exit `0`.

The next authorized technical phase is full acquisition-resolution in bounded
batches. Candidate-database intake and KI analysis remain separate gates and
must not start from this receipt alone.
