# Reviewed Sandanger content/hash reconciliation receipt — 2026-07-20

## Result

**PASS — canonical Markdown and database mirrors are all-after and
idempotence-verified.** Exactly one stale Handle URL line was replaced in the
canonical Sandanger summary. The linked `Document.content` and direct
`LibraryAnalysisRecord.contentHash` were then synchronized through a separate
guarded database transaction.

The open Thesis-versus-Report entity review, title projections, findings,
claims, citation state and appraisal state were protected and unchanged.

## Two-phase proof boundary

Repository files and PostgreSQL cannot share one transaction. The contract
therefore pins exact before/after bytes and permits database apply only from
the recoverable state `files_after_db_before`. The runner never writes the
repository file; it re-reads the exact file inside the locked Serializable
database transaction before and after mutation.

- manifest SHA-256: `3affb4f4da68a30770235049c198b4e241fad2c14ebfd6b1e0eb55ce7e0bc9aa`
- contract SHA-256: `a8ab363ab959ff5b8721c27f049c46d68a9c1d7aed4ad50aacfb2e1e06730b50`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed transition plan SHA-256: `00d3a901781c9b9c33c732483fc9ff40bd0a04d022e217f0259cc0f839ced2c5`
- all-before DB dependency SHA-256: `46bb36d0943d3aeef08061f5e960e63e2166d1e3efa793354d993bfdb920e5e3`
- all-after plan SHA-256: `a3755f27afef3f36c946d45ed5800ceffc544db10a94028c1064c78238496967`
- all-after DB dependency SHA-256: `b415bc2318ec90cf91d64097dc118e1b9b219487458878c044d75d6334a2c29a`
- preserved dependency SHA-256 before and after: `e42c361411bfc43942ac234b5fb754c26bb06819a7b27423d21922e9731d3750`

## Exact result

| Target | Before | After |
|---|---|---|
| Canonical file | 1,159 bytes; SHA-256 `9ba03e12bce5bcdbeddd635a67e4f404960b26913212700cc8b7a09d8ccf297b` | 1,139 bytes; SHA-256 `3fe17396a9a65bf93f74bb81ac9c247b200bee011810f608103f42426b55908e` |
| URL line | `https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778` | `https://hdl.handle.net/11250/169513` |
| LAR composite hash | `a5b991d9f9fa80985469a3011f6a82e771edb28b68222e87d01cf7b5848e2a20` | `9d9deb46134812babfa5b7fdd18d38af50fdc4adda44f7752697589ffae0838d` |

The database transaction committed exactly one `Document.content` update and
one `LibraryAnalysisRecord.contentHash` update. Immediate dry-run returned file
state `all_after`, database state `all_after` and transition `all_after`; the
protected dependency hash remained identical.

Focused tests passed `10/10`; targeted ESLint and `git diff --check` passed.
This is locator and content/hash parity repair only. It does not resolve the
entity-type review or upgrade appraisal, claim support, verification status or
external citation eligibility.
