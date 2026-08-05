# RAPPORT AP-6 — hygiene og opprydding

**Status:** DELVIS GJENNOMFØRT

**Utført:** 2026-08-04, nattøkt

**Utførende:** Codex

**Arbeidsrekkefølge:** F5 → F4 → F1/F2-inventering → F3

## Avgrensning

Arbeidet startet fra den rene kanoniske worktree-en `nordic-knowledge-canonical-v1`. AP-6 ble utført i eget worktree:

- gren: `codex/nattsesjon-ap6-hygiene`
- worktree: `.worktrees/nattsesjon-ap6-hygiene`
- dokumentasjonscommit: `c1b165b` — `docs(corpus): document the macOS filesystem assumption in the verification suite`

Hovedworktree-en på `codex/visual-system-atlas-v1` ble ikke endret, committet, stash-et, byttet eller ryddet. Ingen register, kø, database eller `research/evidence-pack/` ble endret.

## F5 — kontrollert sletting av QA-transfer

Forhåndskontroll i den kanoniske worktree-en viste:

- `tmp/_TIL-SLETTING-qa-transfer/` var 420 MB.
- Katalogen inneholdt seks filer: tre arkivdeler, `hashcheck-state.json`, `research-light.tgz` og `tar.log`.
- Katalogen var ignorert av `.gitignore` og ikke Git-sporet.
- Naboen `tmp/pdfs/` eksisterte og ble uttrykkelig beholdt.

Den autoriserte katalogen `tmp/_TIL-SLETTING-qa-transfer/` ble deretter slettet. Etterkontrollen viste at slettemålet var borte og `tmp/pdfs/` fortsatt var intakt. Målt diskstatistikk viste ingen synlig endring i rapportert ledig plass; det er ikke tolket som bevis på at slettingen ikke skjedde, siden filsystem-/cache-regnskap kan forsinke eller skjule endringen.

Ingen annen `tmp/`-katalog ble slettet.

## F4 — worktree-prune

Stoppbetingelsen ble utløst: den eksisterende midlertidige
`food-systems-corpus-phase1`-worktree-en lever fortsatt og inneholder en
checkout. Derfor ble faktisk `git worktree prune` ikke kjørt.

Det ble bare kjørt en tørrkjøring, uten prune-kandidater. De låste kontrollpostene `validate-ftg` og `validate-ftg1` hadde fortsatt `locked`-markeringen `initializing`; de ble ikke låst opp, fjernet eller endret.

Dette er et eksplisitt stopp, ikke en manglende kontroll. Gabriel må selv avgjøre når den levende midlertidige worktree-en og de låste kontrollpostene kan ryddes.

## F1/F2 — read-only inventering

Hovedworktree-en ble kun inspisert. Den hadde 345 endrede stier: 132 modifiserte og 213 unsporede, uten slettede stier i statusuttrekket. Inventaret spente over blant annet workflows, Docker-/runtimefiler, Obsidian-kart, innhold, Prisma/schema, research, scripts, `src` og tester. Unsporede områder omfattet blant annet `.private-archive/`, nattøktmateriale, status-/migrasjonsfiler og nye kilde-/evidensrelaterte filer.

Det ble også registrert to eksisterende stash-poster. Ingen av dem ble brukt. Ingen endring ble forsøkt parkert eller normalisert.

## F3 — dokumentasjon av plattformbinding

I AP-6-worktree-en ble `knowledge/corpus/README.md` utvidet med en eksplisitt macOS-forutsetning for verifikasjonssuiten:

- testen av eksterne og symlinkede røtter forventer macOS-layouten `/var/db -> /private/var/db`;
- på Linux stopper testen tidligere med `ENOENT`;
- “portable verification suite” betyr derfor per nå portabel på macOS, ikke på Linux;
- en fremtidig hardening bør gi en eksplisitt layoutfeil før testen eksponerer rå `ENOENT`;
- Unicode-normalisering er fortsatt en separat kjent plattformbinding.

Etter `npm install` ble den eneste utilsiktede package-lock-differansen gjenopprettet. Prisma-klienten ble generert lokalt med `npm run db:generate`; dette var en lokal testforutsetning og ikke en databasemutasjon.

Processing-contracts-suiten ble kjørt på nytt med resultat:

```text
tests 282
suites 5
pass 282
fail 0
```

Committen inneholder kun README-endringen.

## Gjenstående beslutninger

1. Prune av den eksisterende midlertidige corpus-worktree-en må vente til
   worktree-eieren er avklart og katalogen faktisk er død.
2. `validate-ftg` og `validate-ftg1` må behandles som låste inntil deres eier/tilstand er avklart.
3. Hovedworktree-ens 345 endrede stier trenger en separat scope-/eierskapsgjennomgang. Det er ikke trygt å stash-e eller committe dette samlet som del av AP-6.
4. Linux/CI-portabilitet bør få en egen, eksplisitt layoutkontroll før denne verifikasjonssuiten omtales som plattformuavhengig.

## Kontrollgrense

AP-6 gjorde ingen DB-kommandoer, ingen `--apply`, ingen register- eller køoppdatering, ingen deploy/merge og ingen kildeinnlasting. Den levende worktree-en og låste worktrees ble bevart fordi stoppreglene krevde det.
