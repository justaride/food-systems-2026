# AP-2 — Push arbeidsgrenen som backup (funn F2)

**Type:** Drift
**Estimat:** 5 min
**Avhenger av:** AP-1 fullført
**Blokkerer:** AP-3, AP-5, AP-6
**Gren:** `codex/nordic-knowledge-canonical-v1`

---

## Hvorfor denne pakken finnes

Hele arbeidslinjen — 38 commits etter AP-1, alle kvitteringer, alle registre, all kontraktsdokumentasjon — finnes **kun på én disk.** Går den disken, er alt borte. Ikke «vanskelig å gjenskape»: borte.

Det er verdt å være presis om hva som er og ikke er en risiko her, fordi grenen er bevisst ikke pushet:

- **Push er replikering.** Bytes kopieres til GitHub. Ingenting kjøres, ingenting merges, ingen database røres, ingen deploy utløses.
- **Prosessregelen «ingenting pushet»** i overleveringsrapporten handler om at ingenting skal *slippes videre* — ikke merges til `main`, ikke deployes. Backup-push bryter ingen av garantiene rapporten gir.
- **Coolify-deploy er koblet til `main`**, ikke til vilkårlige grener. En feature-gren utløser ingen bygg.

QA-en klassifiserte F2 som **middels alvorlighet** — det høyeste av de sju funnene. Det er den eneste risikoen i hele pausepunktet som er både sannsynlig nok og alvorlig nok til å fortjene handling før noe annet.

Gabriel har gitt eksplisitt mandat til dette.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026 på grenen codex/nordic-knowledge-canonical-v1.
Les først NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md, spesielt §2.

Arbeidskatalog:
/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1

Oppgaven din er AP-2: push arbeidsgrenen til origin som ren backup.
Følg NATTSESJON-2026-08-04/AP-2-backup-push.md.

Absolutt: kun push av denne ene grenen. Ingen merge. Ingen force. Ingen andre grener.
Ingen pull request. Kjør ikke pakken før AP-1 er rapportert fullført.

Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-2.md etter malen i briefens §7.
```

---

## Steg for steg

### Steg 1 — Forkontroll

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git status --short --branch
git log -3 --oneline
git remote -v
```

**Forventet:**

- rent arbeidstre
- HEAD er lock-fix-committen fra AP-1
- `origin` → `https://github.com/justaride/food-systems-2026.git`

Bekreft også at fjerngrenen ikke allerede finnes:

```bash
git ls-remote --heads origin codex/nordic-knowledge-canonical-v1
```

**Forventet:** tom output. Kommer det en linje her, finnes grenen allerede på GitHub — stopp og rapporter. Da har noen pushet den, og du må ikke overskrive noe.

### Steg 2 — Sjekk hva som faktisk sendes

Dette er den viktigste kontrollen i pakken. Push sender historikken din, og du bør vite hva den inneholder før den forlater maskinen.

```bash
# Hvor mange commits sendes?
git rev-list --count origin/main..HEAD

# Hvilke filer berøres totalt?
git diff --stat origin/main...HEAD | tail -5

# Finnes det sporede filer som ikke burde være der?
git ls-files | grep -iE '\.env$|\.env\.local|\.pem$|\.key$|id_rsa|secret' || echo "ingen treff — bra"

# Er evidence-pack sporet? (det skal det være, hashbundet — men sjekk størrelsen)
git ls-files research/evidence-pack | wc -l
```

**Forventet:** 38 commits. Ingen treff på hemmelighetsmønsteret. `.env` og `.env.local` finnes i prosjektroten, men skal **ikke** være sporet — de er gitignorert.

**Hvis grep gir treff:** stopp. Ikke push. Rapporter nøyaktig hvilke filer, uten å gjengi innholdet.

### Steg 3 — Push

```bash
git push -u origin codex/nordic-knowledge-canonical-v1
```

Merk: `-u` setter upstream, som gjør at framtidige `git status` viser avstanden til backupen. Det er ønsket.

Om repoet er stort kan dette ta noen minutter (`http.postBuffer` er allerede satt til ~1 GB i konfigurasjonen, så store pushes er forventet og håndtert).

### Steg 4 — Verifiser at backupen faktisk finnes

Push som «så ut til å gå bra» er ikke en backup. Bekreft:

```bash
git ls-remote --heads origin codex/nordic-knowledge-canonical-v1
git rev-parse HEAD
```

**Forventet:** samme SHA begge steder.

```bash
git status --short --branch
```

**Forventet:** `## codex/nordic-knowledge-canonical-v1...origin/codex/nordic-knowledge-canonical-v1` uten ahead/behind.

### Steg 5 — Bekreft at ingenting ble utløst

```bash
git log origin/main -1 --oneline
```

**Forventet:** uendret. `main` skal ikke ha flyttet seg. Du har ikke merget noe.

Noter i rapporten at ingen pull request er opprettet og ingen deploy er utløst.

---

## Definisjon av ferdig

- [ ] Fjerngrenen fantes ikke fra før — verifisert, ikke antatt
- [ ] Innholdet som sendes er inspisert: antall commits, filomfang, ingen hemmeligheter
- [ ] Push gjennomført uten `--force` i noen form
- [ ] Fjern-SHA er identisk med lokal HEAD
- [ ] `main` er uendret
- [ ] Ingen pull request opprettet
- [ ] Rapporten finnes og følger malen

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Fjerngrenen finnes allerede | Stopp. Ikke push. Rapporter fjern-SHA og lokal SHA. |
| Grep finner mulige hemmeligheter blant sporede filer | Stopp. Ikke push. Rapporter filnavn, ikke innhold. |
| Push avvises (`rejected`, `non-fast-forward`) | Stopp. **Ikke** bruk force. Rapporter hele feilmeldingen. |
| Push krever autentisering du ikke har | Stopp. Rapporter. Dette er Gabriels oppgave om morgenen. |
| SHA-ene stemmer ikke etter push | Stopp. Rapporter begge verdier. |

---

## Merknad til Gabriel

Hvis push blokkeres av manglende autentisering, er alternativet i QA-rapporten fortsatt gyldig: **verifiser at Time Machine eller annen backup faktisk dekker både repoet og de to private arkivrøttene.** Poenget er ikke push som sådan — det er at 38 commits ikke skal ha ett eneste eksemplar.
