# Kontrakt for korpusrolle-kvitteringer v1

## Formål og status

Denne mekanismen registrerer en etterprøvbar beslutning om en rad i `corpus-role-classification-queue.v1.jsonl`. Den er databasefri og endrer ikke kø, register eller korpus. Den kan forberede maler og validere kvitteringer, men den skriver ikke de 268 faktiske beslutningene fra nattsesjonen.

Mekanismen implementerer `AUTONOMIPOLICY-2026-08-04` som maskinlesbar kontroll. Policyen er styrende ved konflikt.

## Kvitteringsskjema

Hver kvittering bærer:

- identitet, tidligere rolle og foreslått rolle;
- fast køsti og `queueRowSha256`, beregnet fra hele køraden med canonical JSON;
- hele beslutningsblokken: `decidedBy`, `decidedByDetail`, `decidedAt`, `confidence`, `reasoning` og `policyVersion`;
- canonical `contentHash` over alle andre kvitteringsfelt.

Endres en kørad, avvises kvitteringen med `QUEUE_ROW_DRIFT`. Ukjent identitet, ukjent rolle, duplikat, manglende begrunnelse eller ugyldig hash avvises fail-closed.

## Asymmetri og beslutningsnivå

`decidedBy: "ai"` krever `high`-konfidens og kan bare flytte en identitet ut av `primary_evidence`. En KI-kvittering som flytter noe inn i `primary_evidence` avvises med `ROLE_ASYMMETRY_VIOLATION`.

`decidedBy: "ai_panel"` krever nøyaktig tre bevarte stemmer, tre ulike agent-ID-er, substantive begrunnelser og identisk foreslått rolle. Uenighet avvises med `PANEL_DISAGREEMENT`.

`decidedBy: "owner"` bærer navngitt eier i `decidedByDetail` og brukes for ansvar som policyen holder hos eier.

Ingen av nivåene omgår `owner_review_required`, `decisionReceiptRequired`, rettighetsporten eller første databasemutasjon.

## Kommandoer og grenser

- `--write-templates` skriver hashbundne, beslutningsfrie maler for alle kølinjer.
- `--validate-receipts` validerer en JSONL-kjede uten databasekontakt.
- `--check-status` viser antall kølinjer, kvitteringer og uavklarte linjer uten å skrive.

Køen er kun input. Den kan ikke endres av denne mekanismen. Bulkvalidering støtter én JSONL-operasjon med 268 eller flere kvitteringer, men ingen kvittering genereres automatisk og ingen faktisk bulk-kjøring utføres før S2-E-porten og policyens øvrige porter er lukket.
