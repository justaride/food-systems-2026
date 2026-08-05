# START HER

Fire prompter å lime inn. Ingen dokumenter å sende — hver agent leser sine egne fra disk.

**Du trenger:** en terminal, og de to private korpusstiene tilgjengelig (til runde 2, vindu A).

Alle sesjoner startes i samme katalog:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
```

---

## Runde 1 — én sesjon, vent til den er ferdig

Dette er den eneste delen som må gå først. Den tar 25–45 minutter og bekrefter at grunnlaget er intakt før noen andre rører noe.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` i sin helhet, spesielt §3 med stoppreglene.
>
> Utfør deretter AP-1 og AP-2, i den rekkefølgen, etter arbeidspakkene `NATTSESJON-2026-08-04/AP-1-startkontroll-og-lockfix.md` og `NATTSESJON-2026-08-04/AP-2-backup-push.md`.
>
> Kritisk: hvis kontrollpakken er rød i AP-1 steg 2, stopper du hele nattsesjonen, skriver rapport og gjør ingenting mer. Ikke feilsøk, ikke gå videre til AP-2.
>
> Skriv rapporter til `NATTSESJON-2026-08-04/RAPPORT-AP-1.md` og `RAPPORT-AP-2.md` etter malen i briefens §8. Si tydelig fra når begge er ferdige.

**Gå ikke videre før den sier at AP-1 og AP-2 er fullført.**

---

## Runde 2 — tre vinduer, start dem samtidig

Åpne tre terminalvinduer, `cd` til samme katalog i alle tre, og lim inn én prompt i hvert.

### Vindu A — databaseverifisering

Bytt ut de to plassholderne med de faktiske stiene **før** du limer inn.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` i sin helhet, spesielt §3.
>
> Utfør AP-7 etter `NATTSESJON-2026-08-04/AP-7-live-databaseverifisering.md`.
>
> Private røtter for steg 4:
> `--primary-corpus-root=<LIM INN PRIMÆR STI>`
> `--replica-corpus-root=<LIM INN REPLIKA STI>`
>
> Absolutt forbudt: enhver skriveoperasjon mot databasen, `--apply` i noen form, og å skrive `DATABASE_URL`-verdien eller de private stiene i noen fil, logg, rapport eller commit. Masker dem som `<privat-rot>` hvis de må nevnes.
>
> Skriv til `NATTSESJON-2026-08-04/RAPPORT-AP-7.md` og `DB-VERIFIKASJON-2026-08-04.md`.

### Vindu B — kildelesing, den store jobben

Denne sesjonen sprer arbeidet på 20 underagenter selv. Du gjør ingenting mer enn å lime inn.

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` i sin helhet — spesielt §3 (stoppregler), §5 (regelen som gjør fart trygg) og Vedlegg A (DATAGAP-taksonomien). Les deretter `NATTSESJON-2026-08-04/AP-8-kildelesing-fanout.md` i sin helhet.
>
> Start så **20 parallelle underagenter**, én per skive 00–19. Gi hver av dem agentprompten fra AP-8 med riktig skivenummer satt inn. Hver underagent henter sine enheter fra `NATTSESJON-2026-08-04/triage-manifest.jsonl` der `slice` er lik dens eget nummer, leser hver kilde faktisk, og skriver én triage-post per enhet til `NATTSESJON-2026-08-04/triage/triage-skive-<NN>.jsonl` etter skjemaet i arbeidspakken.
>
> Når alle 20 er ferdige: valider at det finnes 511 gyldige poster totalt, og utfør deretter AP-9 etter `NATTSESJON-2026-08-04/AP-9-datagap-prioritering.md`.
>
> Ingenting skrives til `knowledge/corpus/`, registeret, køene eller `research/evidence-pack/`. Ingen identitetsfletting. Hver post skal ha `provisional: true`.

### Vindu C — hygiene og restposter

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` i sin helhet, spesielt §3.
>
> Utfør AP-6 og deretter AP-10, etter `NATTSESJON-2026-08-04/AP-6-hygiene-og-opprydding.md` og `NATTSESJON-2026-08-04/AP-10-locatorjakt-og-ukjente-roller.md`.
>
> AP-6 krever et eget worktree for dokumentasjonscommiten, AP-10 et eget for sine notater — kommandoene står i pakkene. Ikke commit, stash eller forkast noe på grenen `codex/visual-system-atlas-v1` i prosjektroten.
>
> Skriv til `NATTSESJON-2026-08-04/RAPPORT-AP-6.md` og `RAPPORT-AP-10.md`.

---

## Om morgenen

Les i denne rekkefølgen:

1. **`PRIORITERING-2026-08-04.md`** — hovedresultatet. Dekker materialet hullene, og hvor bør du begynne?
2. **`DB-VERIFIKASJON-2026-08-04.md`** — har databasen flyttet seg siden 3. august? Siste linje svarer på det.
3. **`NOTAT-NORD-BESLUTNINGER.md`** — to avgjørelser som fjerner 2 av 12 blokkeringer.
4. **`NOTAT-UKJENTE-ROLLER.md`** og **`NOTAT-LOCATORER.md`** — bulk-godkjenning, sortert med de sikreste først.
5. Rapportene, hvis du vil se detaljene.

Sjekk til slutt at natten holdt seg innenfor:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git status --short --branch
git log --oneline -5
node scripts/knowledge/launch-locked-source-registration-apply.mjs --apply   # skal si APPLY_TRUSTED_ENTRYPOINT_REQUIRED
```

---

## Hvis noe stopper

| Situasjon | Hva du gjør |
|---|---|
| AP-1 melder rød kontrollpakke | Da har grunnlaget flyttet seg. Ikke start runde 2 — se på det selv. |
| Vindu A mangler de private stiene | Den kjører steg 1–3 og hopper over punkt 3. Fortsatt nyttig. |
| Vindu B er ikke ferdig om morgenen | Delvise skiver er brukbare. AP-9 rapporterer dekningsgraden øverst. |
| En agent spør om å omgå en sperre | Nei. Svaret er alltid nei. |
| Push i AP-2 feiler på autentisering | Sjekk i stedet at Time Machine dekker repoet. Poenget er at 38 commits ikke skal ha ett eksemplar. |

---

## Hva som ikke skal skje i natt

Sier en agent at den vil gjøre noe av dette, er svaret nei:

- skrive til databasen — lesing er hele mandatet
- kjøre `--apply` eller myke opp karantenen
- merge til `main`, deploye, eller force-pushe
- kjøre `knowledge:corpus:generate` (kun `:check`)
- endre registeret, køene eller `research/evidence-pack/`
- flette to kildeidentiteter
- skrive `DATABASE_URL` eller en privat sti i en fil
