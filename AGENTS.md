# Food Systems 2026 agent rules

## Authority boundary

- KI may append candidate-only analysis to the candidate subsystem.
- KI may not record human review, promote canonical data, publish, or change coverage readiness.
- Confidence is not authority. Model agreement does not satisfy a human gate.
- Human review and every promotion are bound to exact candidate, evidence, source-content, policy, and target-profile hashes.

## Write paths

- Candidate history is append-only. Use `src/lib/knowledge/candidate-analysis-writer.ts`.
- Never use generic upsert, update, delete, or raw SQL against candidate history.
- Generated snapshots are regenerated through their named scripts; never hand-edit them.

## Verification

- Distinguish local tests, CI, migration, deployment, runtime SHA, authenticated UI, and external human authority.
- Never report a later gate as complete from evidence for an earlier gate.
