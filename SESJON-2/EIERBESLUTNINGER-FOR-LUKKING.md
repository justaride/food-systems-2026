# Eierbeslutninger for lukking

Dette er et beslutnings- og statusunderlag. Factuale integrasjons-,
bevarings- og panelpunkter er krysset av; rights- og restore-valg er ikke tatt
av agenten.

## Lokal miljøkonfigurasjon

- [x] Legg inn `FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT` i lokal, gitignorert
  `.env.local`.
- [x] Legg inn `FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT` i samme fil.
- [x] Bekreft at `.env.local` fortsatt er ignorert; ingen av verdiene skal inn
  i sporede artefakter eller rapporter.

Verdiene ble funnet av prosjektets innebygde, read-only root-discovery og er
kun skrevet til gitignorerte lokale env-filer; de er ikke materialisert i
rapporter, commits eller testoutput.

## Nord 2024:023 — UNESCO Biosphere Reserves

Identity: `document:cmppajyvb0012njvmnphhze07`  
Rights: `pending_not_cleared`

- [x] Enstemmig KI-panel: `indirect_context`; ingen aktiv evidens-promotering.
- [x] Separat offentlig-kildepanel gjentok `indirect_context` enstemmig med høy
  konfidens.
- [x] Offisiell offentlig PDF kontrollert med 23 sider og samsvarende tittel;
  dette styrker identitets-/scope-underlaget, men er ikke rights clearance.

- [ ] Behold som indirekte kontekst / intern bakgrunn.
- [ ] Hold utenfor aktiv Food Systems-evidens.
- [ ] Avklar separat om privat capture skal restaureres.
- [x] Bekreft at den ikke skal kobles til Karlstad-deklarasjonen; kontrollert
  capture viser `blocked_legacy_alias_scope_mismatch` mot den observerte
  UNESCO-tittelen.

## Nord 2025:010 — Beyond Zero

Identity: `document:cmppajyve0013njvmw7zok4yr`  
Rights: `pending_not_cleared`

- [x] Enstemmig KI-panel: `out_of_scope`; ingen aktiv evidens-promotering.
- [x] Separat offentlig-kildepanel gjentok `out_of_scope` enstemmig med høy
  konfidens.
- [x] Offisiell offentlig PDF kontrollert med 24 sider og samsvarende tittel;
  dette styrker identitets-/scope-underlaget, men er ikke rights clearance.

- [ ] Ta ut av aktivt Food Systems-omfang.
- [x] Behold mismatch-recorden som datakvalitetsmarkør; ingen promotion eller
  aliasreparasjon er utført.
- [ ] Avklar separat om privat capture skal beholdes/restaureres.
- [x] Bekreft at den ikke skal brukes som `Nordic Food Alert`; kontrollert
  capture viser `blocked_legacy_alias_scope_mismatch` mot Beyond Zero-tittelen.

## Worktrees og stale locks

- [x] Behold den eksisterende midlertidige corpus-worktree-en — briefen forbyr sletting.
- [x] Behold `.worktrees/nattsesjon-ap6-hygiene` — briefen forbyr sletting.
- [x] Behold `.worktrees/nattsesjon-ap10-locator` med uprøvde filer — briefen forbyr sletting.
- [x] Behold `.worktrees/nordic-knowledge-foundation-v1` — briefen forbyr sletting.
- [x] S2-B/S2-C er reviewet og integrert i canonical (`462bb2f`, `e8ad258`,
  `4f38830`).
- [x] Behold side-worktrees etter at integrasjonen er kontrollert; briefen forbyr sletting.
- [ ] Ikke fjern `.git/worktrees/validate-ftg` eller `validate-ftg1` mens
  Apples Virtualization VM holder låsfilene åpne (read-only observert PID
  64562); revurder først etter at VM-en er avsluttet og eieren har bekreftet
  at arbeidet ikke kan gjenopprettes.

## Release-review

- [x] Uavhengig skrivebeskyttet review av den databasefrie S2-C-grensen er gjennomført.
- [ ] Ikke åpne `source_registration_apply` før fremtidig apply-adapter-review,
  eierautorisasjon og alle apply-gates er separat dokumentert.

## AP-7 — stale plan-pin

- [x] Live databaseidentitet, kjernetellinger, health og FTS-aware schema-verifier
  er kontrollert read-only.
- [x] Feilen er avgrenset til at den låste planen forventer manifest-hash
  `897f3599585ed8cb1fb73749df28e944b38d283805ee981499ef440d89f06803`, mens
  canonical manifest har `631ad900849a9951a3e5471b35e28f8905b8c8607f9a0491deacb59f316c455d`.
- [ ] Eierbestilt, separat planprosess oppretter en ny versjonert batch/plan som
  binder dagens verifiserte manifest og alle øvrige input-hasher.
- [ ] Ny plan passerer `--plan-only` read-only mot samme private primary/replica-
  røtter og databaseidentitet.
- [ ] Ingen signering eller apply før den nye planen er gjennomgått og separat
  autorisert.
