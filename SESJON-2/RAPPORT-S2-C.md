# S2-C — Trusted launcher for `source_registration_apply`

**Dato:** 2026-08-04  
**Status:** FULLFØRT FOR DEN DATABASEFRIE, IMPLEMENTERBARE DELEN; REVIEW GODKJENT FOR DENNE GRENSELAGTE REVISJONEN  
**Worktree:** `.worktrees/sesjon2-launcher`  
**Gren:** `codex/sesjon2-trusted-launcher`  
**Kanonisk base:** `733ad965c99022825efbf63e746df57d4663383c`
**Implementasjonscommits:** `232d411`, `e219c3e` (review-funn lukket)  
**Canonical integrasjon:** `e8ad258`, `4f38830` på `codex/nordic-knowledge-canonical-v1`

## Resultat

S2-C har en separat, innebygd-modul-only trust boundary i
`run-trusted-source-registration-apply.mjs`. Den er formålsbundet til den
eksakte strengen `source_registration_apply` og implementerer FD3/FD4/FD5-
rekkefølgen uten database-, private corpus- eller Ed25519-operasjon. En
databasefri probe-child kjøres faktisk gjennom samme håndtrykk og
post-child-reattestasjon.

Den eksisterende karantenen er ikke åpnet. Med et rent kontrollert miljø gir:

```text
[locked-source-registration-launcher] ERROR APPLY_TRUSTED_ENTRYPOINT_REQUIRED
```

Den nye søskeninngangen nekter også `--apply` og `--trusted-apply` i denne
revisjonen med `SOURCE_REGISTRATION_TRUSTED_ENTRYPOINT_REQUIRED`. Dette er
bevisst: nøkkelen er bygget, men første databaseoperasjon er ikke låst opp.

## Svar på AP-5-spørsmålene

1. Før FD5 verifiseres ren bootstrap, alle forbudte miljøvariabler og Node-
   flagg, fravær av arvet `DATABASE_URL`/private røtter, FD-mapping,
   bootstrap-PID og purpose. Deretter verifiseres FD3 sin inode, mode `0400`,
   eier, ett lenketall, private `/tmp`-forelder og eksakte bytes. FD4 leses så
   som avlenket canonical JSON med exact format/version/purpose, launcher-hash,
   database-, approval-, DDL- og runtime-pins. Runtime-pins inkluderer aktiv
   Node-binær/version, node-runtime closure, `node_modules`, Prisma-klienttre,
   lokal importlukning og PostgreSQL toolset/extension closure. Først etter
   runtime-self-hash og offentlig pin-sammenligning leses FD5.
2. Bootstrap skal opprette mode-`0400`-filer i minnet/temporary storage,
   `fsync`-e dem, åpne descriptoren og avlenke navnet før overlevering. Koden
   krever FD4 og FD5 som regular files med mode `0400`, `nlink === 0`, samme
   device/inode/owner/size før og etter lesing og byte-stabil canonical JSON.
   FD3 er den kjørende mode-`0400`-kopien med `nlink === 1` i en mode-`0700`
   katalog direkte under `/tmp`, og FD3 må ha samme inode og bytes som filen
   prosessen kjører.
3. Purpose står som en eksportert konstant, i begge konvolutter og i den
   domain-separerte runtime-self-hashen. En envelope med f.eks.
   `logical_restore_companion` avvises før FD5, og samme FD kan derfor ikke
   gjenbrukes på tvers av formål.
4. Forelderen skal holde barnets stdout tilbake, kontrollere status/signal,
   full-reattestere etter avslutning også ved feil, og først frigjøre stdout
   hvis attestasjonen er byte-identisk. Dette er implementert som den
   databasefrie `releaseTrustedChildOutput`-grensen. Den faktiske
   `--trusted-child-probe`-strømmen kjører og testes; produksjonsbarnet er ikke
   koblet inn fordi det ville åpne den karantenen som S2-C uttrykkelig skal
   bevare.
5. Enhver arvet `NODE_*`, `OPENSSL_*`, `PRISMA_*`, `TSX_*`,
   `DOTENV_CONFIG_*`, `DYLD_*` eller `LD_*`-variabel avvises. I tillegg
   avvises Node execution flags, arvet database/private input og
   descriptor-argumenter som ikke er eksakt FD3/FD4/FD5. Parent-proben bruker
   bare prosesslokale descriptorer før `spawnSync` mapper dem til barnets faste
   slots. Dette hindrer at runtime,
   preload, dotenv, Prisma, dynamic loader eller caller-supplied secrets
   endrer det som ble attestert før barnet starter.

## Filer

- `knowledge/corpus/SOURCE-REGISTRATION-TRUSTED-ENTRYPOINT.md` — kontrakt og
  eksplisitte sikkerhetsgrenser.
- `scripts/knowledge/run-trusted-source-registration-apply.mjs` —
  builtins-only descriptor-, purpose-, runtime- og reattestasjonslogikk.
- `tests/lib/source-registration-trusted-entrypoint.test.ts` — 9 databasefrie
  tester, inkludert fast FD3/FD4/FD5-binding, singleton-sjekk før og etter
  lesing, og eksplisitt bevis på at FD5 ikke leses når bindingen feiler.

Ingen test ble lagt til `knowledge:processing-contracts:check`; den
hashbundne listen er dermed uberørt.

## Verifikasjon

- Trusted-entrypoint angrepstester og faktisk probe-child:
  `node --import=tsx --test tests/lib/source-registration-trusted-entrypoint.test.ts`
  — **9/9 pass** etter uavhengig review-revisjon.
- Runtime `--attest-only` med rent kontrollert miljø: **pass**.
- `knowledge:processing-contracts:check`: **282/282 pass** etter lokal,
  databasefri `prisma generate` og lokal versjonsfilgenerering.
- `npx tsc --noEmit`: **0 feil**.
- Locked public `--apply`: **forblir karantenert** med
  `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`.

## Ikke utført

Ingen `--apply`, ingen databaseforbindelse, ingen private røtter eller
legitimasjon, ingen kø/register/evidence-pack-skriving, ingen Ed25519-nøkkel,
ingen rehearsal og ingen endring i den kanoniske worktree-en.

Uavhengig review fant først to konkrete hull: parent-singleton ble kontrollert
for sent, og helperen håndhevet ikke at innsendte descriptorer var FD3/FD4/FD5.
Begge er rettet og kontrollert på nytt; reviewstatus er PASS for disse kodestiene.
Produksjonsmutasjon er likevel fortsatt stengt: reviewen godkjenner ikke at
den eksakte apply-runneren kobles inn, og en separat owner-bestilt endring må
fortsatt vurdere eventuell åpning uten å endre `codeBindings`, operasjonsnøkkel
eller transaksjonsgrense.
