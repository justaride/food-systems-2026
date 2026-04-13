# Company Registry

Use this guide when a task adds, audits, or extends company entities.

## ID Rules

- Norwegian companies use numeric `orgNr` values from Bronnoysund
- Non-Norwegian Nordic companies use country-prefixed identifiers such as `SE-`, `DK-`, `FI-`, and `IS-`
- Reuse an existing company ID whenever the registry appendix already covers that entity

## Workflow

- Check the appendix before creating a new `Company` record so you do not fork an existing entity
- Preserve the existing `country`, `ownershipType`, and `valueChainStage` conventions when updating a known company
- Use [Data Imports](data-imports.md) for the import-script pattern and follow-on relationship records
- Use [Database Schema](database.md) when you need the exact related models for ownership, board, financial, or property data

## Registry Appendix

- [Reference company list](reference/company-registry.md)
