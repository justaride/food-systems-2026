# S2-D — eierstyrte beslutninger og rester

**Status:** SCOPE- OG KILDEKONTROLL FULLFØRT; RIGHTS/RESTORE IKKE AVGJORT AV AGENTEN  
**Dato:** 2026-08-04

S2-D inneholder irreversible eller ansvarsbærende valg. De er derfor
kartlagt, men ikke utført.

## Nord-publikasjonene

### Nord 2024:023 — UNESCO Biosphere Reserves

- Identity: `document:cmppajyvb0012njvmnphhze07`
- Faktisk publikasjon: *UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability*
- DOI/PDF: `https://pub.norden.org/nord2024-023/nord2024-023.pdf`
- Panelanbefaling: `indirect_context`; rights og eventuell restore er fortsatt
  `pending_not_cleared` hos eier.
- Ingen rights clearance, role promotion, repository restore eller queue/register-endring er gjort.

### Nord 2025:010 — Beyond Zero

- Identity: `document:cmppajyve0013njvmw7zok4yr`
- Faktisk publikasjon: *Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices*
- DOI/PDF: `https://pub.norden.org/nord2025-010/nord2025-010.pdf`
- Panelanbefaling: `out_of_scope`; rights og eventuell restore er fortsatt
  `pending_not_cleared` hos eier.
- Ingen sletting, restore, rights clearance, role promotion eller queue/register-endring er gjort.

Den separate `research/bibliotek/nordisk/karlstad-deklarasjonen-matberedskap-2024.md`
er beholdt som egen identitet og er ikke koblet til UNESCO-kilden.

## Kontrollert privat verifikasjon — read-only

Den innebygde root-discoveryen fant nøyaktig ett separat primary/replica-par.
Begge captures ble kontrollert mot de to identitetene uten å skrive output til
korpus eller rapportere absolutte private stier. Nord 2024:023 har `23/23`
forventede/ekstraherte sider; Nord 2025:010 har `24/24`. Begge har komplett
siderekkefølge, men `textIncludedInTrackedArtifact: false` og
`identityAssociation.state: blocked_legacy_alias_scope_mismatch`.

Det bekrefter de tekniske aliasavvikene, men er ikke en rights clearance eller
en owner scope-beslutning. Ingen rolle-, register-, kø- eller promotion-endring
er gjort.

## Offentlig kilde- og rights-kontroll — read-only

De offisielle Nord-URL-ene ble kontrollert separat mot publiserte PDF-er:

- Nord 2024:023: `23` sider, tittel og publikasjonstekst samsvarer med UNESCO
  Biosphere Reserves-identiteten.
- Nord 2025:010: `24` sider, tittel og publikasjonstekst samsvarer med Beyond
  Zero-identiteten.

Den offentlige kontrollen styrker identitets- og scope-underlaget, men binder
ikke de private capture-bytene til de offentlige PDF-ene og endrer ikke
`identityAssociation` i korpussporet. Den første kilden handler om MAB LAB,
biodiversitet, lokal bærekraft og bærekraftig ressursforvaltning; den andre om
nordisk arkitektur, byggemiljø og regenerative praksiser. Dette støtter
henholdsvis `indirect_context` og `out_of_scope`, uten å gi grunnlag for en
Food Systems-claim fra den andre kilden.

Nordisk ministerråds egen publiseringsveiledning oppgir at Open Access ikke
endrer copyright, og at publikasjoner i serien `Nord` publiseres med `© All
rights reserved`: <https://www.norden.org/en/information/due-release-publication>.
Dette er rights-underlag, ikke rights clearance for lokal lagring, sitering
eller repository-restore. Rights-status forblir `pending_not_cleared`, og ingen
PDF er kopiert inn i repoet.

## Uavhengig scope-panel

Tre separate, blinde agentlesinger vurderte scope etter policy §3.2. Panelet var
enstemmig: `3/3 indirect_context` for Nord 2024:023 og `3/3 out_of_scope` for
Nord 2025:010. Alle seks stemmene er bevart i
`SESJON-2/NORD-SCOPE-PANEL-2026-08-04.jsonl`. Panelet tok ikke stilling til
rights eller repository-restore; begge står fortsatt `pending_not_cleared`.
Ingen automatisk role-, kø- eller registerendring følger av panelunderlaget.

Et nytt, separat panel leste de to offentlige PDF-ene direkte. Det var også
enstemmig med `3/3 indirect_context` og `3/3 out_of_scope`, alle med høy
konfidens. Stemmene er bevart i
`SESJON-2/NORD-SCOPE-PUBLIC-PANEL-2026-08-04.jsonl`. Dette panelet tok heller
ikke stilling til rights eller repository-restore.

## Worktree-rester

Ingen worktree er slettet eller ryddet. Det samsvarer med nattbriefens
eksplisitte instruks om å la worktrees stå til eierens gjennomgang.

| Sti | Gren | Status | Eiervalg |
|---|---|---|---|
| midlertidig corpus-worktree | `local/nordic-corpus-phase1-2026-08-02` | ren | beholdt — briefen forbyr sletting |
| `.worktrees/nattsesjon-ap6-hygiene` | `codex/nattsesjon-ap6-hygiene` | ren | beholdt — briefen forbyr sletting |
| `.worktrees/nattsesjon-ap10-locator` | `codex/nattsesjon-ap10-locator` | har uprøvde `NATTSESJON-2026-08-04/`-filer | beholdt — briefen forbyr sletting |
| `.worktrees/nordic-knowledge-foundation-v1` | `codex/nordic-knowledge-foundation-v1` | ren | beholdt — briefen forbyr sletting |
| `.worktrees/sesjon2-rollekvittering` | `codex/sesjon2-role-classification-receipts` | S2-B-leveranse, commit `bd9d0c7`, ren; integrert canonical som `462bb2f` | beholdt — briefen forbyr sletting |
| `.worktrees/sesjon2-launcher` | `codex/sesjon2-trusted-launcher` | S2-C-leveranse, commits `232d411` + `e219c3e`, ren; integrert canonical som `e8ad258` + `4f38830` | beholdt — briefen forbyr sletting |

I tillegg finnes `.git/worktrees/validate-ftg` og
`.git/worktrees/validate-ftg1`, begge med `locked`-markeringen
`initializing`, men uten en registrert worktree i `git worktree list`. De er
ikke rørt. Read-only kontroll viste at `git worktree prune --dry-run` ikke
rapporterer dem som prunable, og begge låsfilene holdes åpne av Apples
Virtualization VM (`com.apple.Virtualization.VirtualMachine`, PID 64562).
De skal derfor behandles som aktive eksterne handles, ikke som foreldreløse
låser; ingen opprydding er autorisert eller utført.

## Hovedutsjekk

Eksisterende brukerarbeid i `codex/visual-system-atlas-v1` er ikke endret,
byttet eller ryddet. De eksplisitt bestilte sesjonsrapportene er skrevet under
`SESJON-2/` og skal ikke blandes med det øvrige brukerarbeidet.

Read-only branch-sammenligning viste at S2-B (`bd9d0c7`) og S2-C (`e219c3e`
over `232d411`) var rene, bygget på canonical `733ad96` og hadde ingen
overlappende endrede stier. De er nå integrert i canonical som henholdsvis
`462bb2f`, `e8ad258` og `4f38830`; side-worktrees er ikke slettet.

## Eiers neste handling

1. Bruk panelresultatet som scope-underlag, og avgjør fortsatt rights,
   eventuell repository-restore og eventuell formell source-role-kvittering
   separat.
2. De bevarte worktrees og aktive VM-låser skal stå urørt; ingen cleanup er
   utført eller nødvendig for denne sesjonen.
3. Dersom produksjons-`apply` noen gang skal vurderes, bestill en separat
   eierstyrt gjennomgang av apply-adapteren. Den databasefrie S2-C-grensen er
   allerede uavhengig reviewet, men produksjonsmutasjon er fortsatt låst.
