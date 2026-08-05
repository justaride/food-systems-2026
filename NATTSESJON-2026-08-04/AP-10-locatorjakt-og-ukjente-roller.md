# AP-10 — Locatorjakt og ukjente roller

**Type:** Research
**Estimat:** 2–3 timer
**Avhenger av:** AP-1 fullført
**Gren:** `codex/nattsesjon-ap10-locator` i eget worktree (kun for eventuelle notatfiler — ingen endring i køer)

---

## Hvorfor denne pakken finnes

To små, konkrete restposter som ingen har tatt fordi de har vært overskygget av den store portoperasjonen. Begge er ren research, begge kan lukkes i natt, og begge fjerner reelle sperrer.

**De 29 utilgjengelige.** `corpus-missing-files-queue.v1.jsonl` har 29 rader: 11 mangler fil i repoet, 18 mangler locator helt. De 18 er de vanskeligste — systemet vet at kilden finnes, men ikke hvor den er. De står som `priority: "blocked_on_source_bytes"` i fulltekstkøen og kan aldri behandles før noen finner dem.

**De 123 ukjente rollene.** Maskinen klarte ikke å klassifisere dem på filnavn. De henger derfor i rollekøen uten engang et forslag å bekrefte eller korrigere — verre stilt enn de 1 431 som i det minste har en gjetning.

Til sammen 152 poster. Ingen av dem krever en port. Alle krever at noen faktisk ser etter.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md, spesielt §3 og §5.

Sett opp ditt eget worktree:
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git worktree add ../nattsesjon-ap10-locator -b codex/nattsesjon-ap10-locator
cd ../nattsesjon-ap10-locator
npm install

Oppgaven din er AP-10: spore opp de 18 identitetene uten locator, avklare de 11
med manglende fil, og foreslå roller for de 123 uklassifiserte.

Du skal IKKE endre køfiler, ikke laste ned filer inn i repoet, ikke flette
identiteter og ikke ta beslutninger på Gabriels vegne.

Følg NATTSESJON-2026-08-04/AP-10-locatorjakt-og-ukjente-roller.md.
Skriv til NATTSESJON-2026-08-04/NOTAT-LOCATORER.md,
NATTSESJON-2026-08-04/NOTAT-UKJENTE-ROLLER.md
og NATTSESJON-2026-08-04/RAPPORT-AP-10.md.
```

---

## Del A — De 29 utilgjengelige

### Steg A1 — Kartlegg dem

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
python3 -c "
import json, collections
c = collections.Counter()
for l in open('knowledge/corpus/corpus-missing-files-queue.v1.jsonl'):
    d = json.loads(l)
    c[d['repositoryFileState']] += 1
    print(d['repositoryFileState'], '|', d['identityKey'], '|', (d.get('title') or '')[:60])
print(dict(c))
"
```

Radene har blant annet `candidateRepositoryPaths`, `canonicalPath`, `privateCaptureAvailable`, `privateCaptureRightsState`, `privateCaptureSha256` og `nextAction`. Les `nextAction` — systemet har allerede tenkt på hva som mangler for hver enkelt.

### Steg A2 — De 11 med privat kopi

For disse finnes filen i det private arkivet, men ikke i repoet. Typisk `nextAction`:

> «use the verified private capture in the controlled internal workflow and create a content-bound full-text receipt; decide repository restoration separately; rights remain pending/not cleared»

**Du skal ikke hente dem inn i repoet.** `privateCaptureRightsState: "pending_not_cleared"` betyr at rettighetene ikke er avklart — å kopiere fila inn i et git-repo ville vært å ta en rettighetsbeslutning på Gabriels vegne.

Det du skal: for hver av de 11, dokumenter tittel, hva den er, om den er verdt å restaurere, og hva rettighetsspørsmålet konkret består i. Er den fritt tilgjengelig fra utgiver? Er den bak betalingsmur? Er den en preprint med annen lisens enn den publiserte versjonen?

Det gjør de 11 rettighetsavklaringene mulige å ta som én bunke framfor elleve enkeltvurderinger.

### Steg A3 — De 18 uten locator

Dette er den egentlige jakten. For hver: finn ut hvor kilden faktisk finnes.

Bruk det du har: tittel, eventuell DOI, forfatter, utgiver, årstall fra køposten og fra registeret. Søk mot utgiverens nettsted, DOI-oppslag, nasjonale publikasjonsregistre, Nordisk ministerråds utgivelsesbase for `Nord`-serien.

For hver, dokumenter:

| Felt | Innhold |
|---|---|
| `identityKey` | |
| Tittel | slik den står i køen |
| Funnet? | ja / nei / usikker |
| Locator | URL eller DOI, hvis funnet |
| Kildetype | offentlig, akademisk, bransje, media |
| Tilgjengelighet | åpen / betalingsmur / kun på forespørsel / ikke funnet |
| Rettighetsvurdering | kan den lastes ned og lagres i repoet? |
| Konfidens | er dette *sikkert* samme publikasjon, eller bare et sannsynlig treff? |

**Konfidensfeltet er ikke pynt.** Et sannsynlig treff som viser seg å være feil publikasjon er verre enn ingen locator — det ville bundet en identitet til feil kilde. Er du usikker, skriv `usikker` og forklar hva som ville avgjort det.

**Ikke last ned noe inn i repoet.** Du leverer locatoren; nedlasting er en gatet anskaffelsesoperasjon med egen kvitteringskontrakt (`SOURCE-ACQUISITION-RECEIPT-CONTRACT.md`).

---

## Del B — De 123 ukjente rollene

### Steg B1 — Hent dem ut

```bash
python3 -c "
import json
for l in open('knowledge/corpus/corpus-role-classification-queue.v1.jsonl'):
    d = json.loads(l)
    if d.get('provisionalRole') in (None, 'unknown'):
        print(json.dumps({k: d.get(k) for k in
              ('identityKey','canonicalPath','title','ruleId','reasons','sourceKind')},
              ensure_ascii=False))
"
```

### Steg B2 — Klassifiser dem ved å lese

Samme disiplin som AP-8: åpne fila, les den, klassifiser på innhold.

De fem rollene:

| Rolle | Hva det er |
|---|---|
| `primary_evidence` | Ekstern kilde med eget bevisverd — rapport, artikkel, dataset, dom |
| `internal_synthesis` | Prosjektets eget arbeid — notater, sammendrag, Obsidian-sider |
| `operational_control` | Indeks, register, arbeidsliste, administrativt |
| `generated_projection` | Maskinelt avledet fra andre kilder |
| `unknown` | Fortsatt uklart etter lesing — en gyldig konklusjon |

At de havnet i `unknown` betyr at filnavnet ikke var informativt. Noen vil være åpenbare så snart de åpnes. Andre er reelt tvetydige — et notat som refererer eksterne tall er ikke opplagt `internal_synthesis` hvis tallene er primærdata.

For hver, lever: foreslått rolle, konfidens (`high`/`medium`/`low`), begrunnelse basert på innhold, og — der det er tvil — hva som ville avgjort saken.

Vær villig til å beholde `unknown`. En ærlig `unknown` med begrunnelse er bedre enn en gjetning som blir stående i registeret.

### Steg B3 — Se etter mønster

Har flere av de 123 samme form? En hel katalog eksportfiler, en serie møtereferater, et sett genererte tabeller?

Finner du et mønster som dekker mange, foreslå en regel — det ville forbedret `generate-corpus-processing-register.ts` for framtidige kjøringer. **Ikke implementer den.** Beskriv den; koden er innenfor `codeBindings` og krever egen gjennomgang.

---

## Leveranser

**`NOTAT-LOCATORER.md`** — sammendrag, de 11 med privat kopi og deres rettighetsspørsmål, de 18 med locatorjakt-tabellen, hvilke som fortsatt er hjemløse og hva som skal til.

**`NOTAT-UKJENTE-ROLLER.md`** — sammendrag, tabell over alle 123 med foreslått rolle og konfidens, de tvilsomme skilt ut for enkeltvurdering, eventuelle mønstre med regelforslag.

Sorter begge tabellene på konfidens, høyest først. Da kan Gabriel godkjenne de sikre i bulk og bruke tiden sin på resten.

---

## Definisjon av ferdig

- [ ] Alle 29 poster i missing-files-køen er gjennomgått og dokumentert
- [ ] De 18 uten locator er søkt opp; hver har en konfidensvurdering
- [ ] De 11 med privat kopi har hver sin rettighetsvurdering
- [ ] Alle 123 uklassifiserte har et rolleforslag med begrunnelse fra innhold — eller en begrunnet `unknown`
- [ ] Eventuelle mønstre er beskrevet med regelforslag, ikke implementert
- [ ] Begge notater finnes, sortert på konfidens
- [ ] **Ingen** endring i køfiler, registeret eller databasen
- [ ] **Ingen** filer lastet ned inn i repoet

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Du finner en kilde, men er usikker på om det er samme publikasjon | Skriv `usikker` og forklar. Ikke bind en identitet på et sannsynlig treff. |
| Du fristes til å laste ned en funnet kilde inn i repoet | Nei. Anskaffelse er gatet med egen kvitteringskontrakt. |
| En kilde ser ut til å være permanent borte | Det er et gyldig og nyttig funn. Dokumenter hva du prøvde. |
| Du fristes til å oppdatere rollekøen | Nei. `decisionReceiptRequired: true`. Du foreslår. |
| Et rettighetsspørsmål er uklart | Beskriv det. Ikke avgjør det. |
