# Sesjon 3 — START HER

**Bakgrunn:** Sesjon 2 satte målet til blokkert. Etter gjennomgang er den vurderingen **for streng på tre punkter og ett kritisk punkt er oversett.** Fire spor gjenstår som ikke krever noe av eier.

---

## 0. Først: det haster

**Tre commits ligger upushet.** Den kanoniske grenen har flyttet seg fra `733ad96` til `4f38830` — S2-B og S2-C er integrert — men backupen på GitHub står fortsatt på nattsesjonens `733ad96`.

Det betyr at hele sesjon 2 sitt arbeid finnes **kun på én disk**. Det er funn F2 gjenåpnet, og du autoriserte allerede backup-push av arbeidsgrenen i nattsesjonen.

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git status --short --branch
git log --oneline 733ad96..HEAD
git ls-files | grep -iE '\.env$|\.env\.local|\.pem$|\.key$|id_rsa' || echo "ingen hemmeligheter sporet"
git push origin codex/nordic-knowledge-canonical-v1
git ls-remote --heads origin codex/nordic-knowledge-canonical-v1   # skal matche HEAD
```

Push er replikering. Ingen merge, ingen deploy, ingen databaseendring. Fem minutter.

---

## 1. Hva sesjon 2 faktisk oppnådde

Verifisert mot filene, ikke mot rapportene:

| | Status |
|---|---|
| S2-A diagnostikk | Fullført. F8 er dokumentert FTS-drift, F9 grønn etter runtime-korreksjon |
| S2-B kvitteringsmekanisme | Bygget: skjema, validator, kontrakt, 7/7 tester. Integrert i canonical |
| S2-C pålitelig startmekanisme | Bygget: FD3/FD4/FD5, 9/9 tester, ekte probe-barn, uavhengig review. `--apply` fortsatt karantenert |
| S2-E kalibrering | Kjørt uavhengig. **Resultatet stengte bulk-porten** |
| Private røtter | Konfigurert, alle tre private read-only-kontroller exit 0 |
| Nord-omfang | To uavhengige paneler, begge 3/3 enstemmige |
| Kontrollpakken | 282/282 |

**Kalibreringen er sesjonens viktigste resultat, og den er verdt å dvele ved.**

| Måling | `high`-konfidens `proposedRole` |
|---|---|
| Blindtest i samme agentsesjon | 9/9 = **100 %** |
| Genuint uavhengig agent (v2) | 6/9 = **66,7 %** |

Uten kalibreringsporten ville 268 kvitteringer blitt skrevet på en terskel som i praksis treffer to av tre. Porten gjorde nøyaktig jobben sin.

Og et metodefunn på kjøpet: **blindtester i samme sesjon er verdiløse.** Avstanden mellom 100 % og 66,7 % er hele forskjellen mellom en agent som tror den leser blindt og en som faktisk gjør det. Godt at begge ble beholdt og merket.

Asymmetrien holdt: 9/25 gikk til strengere rolle, **0/25 gikk inn i `primary_evidence`.** Sikkerhetsegenskapen overlevde selv med lavt samsvar.

---

## 2. Hvorfor «blokkert» er for strengt

Fire spor krever ingenting av deg.

### S3-A — Panelkjøring på rolleklassifiseringen

Dette er det største gjenstående arbeidet, og sesjon 2 leverte selv instruksen:

> «Krev `ai_panel` for alle rolleendringer i bulk inntil et større uavhengig utvalg viser høyere rolletreff.»

Det er ikke en blokkering — det er en **rutingbeskjed**. Policyens §3.2 gir panelet myndighet, S2-B bygget `ai_panel`-støtte med tre bevarte stemmer og enstemmighetskrav, og mekanismen har 7/7 grønne tester. Alt som mangler er å kjøre den.

### S3-B — Større kalibrering

Kalibreringsrapporten sier det selv: «n=9 er lite». Ni observasjoner kan ikke skille 66 % fra 85 %. 75–100 uavhengige lesinger er ren agentjobb og avgjør om panelkravet er permanent eller midlertidig.

### S3-C — Kandidatplan for AP-7

Sesjon 2 kaller dette «eierbestilt». Det er delvis riktig — men bare den siste halvdelen.

Å *generere* en plan og kjøre `--plan-only` mot den er read-only, og policyens §3.1 gir agenter myndighet til alle read-only databasekontroller. Det du må gjøre er å **akseptere** kandidaten som den planen som skal signeres. Agenten lager den; du sier ja.

Det gjør punkt 1 på lista di om fra «blokkert» til «én godkjenning».

**En viktig nyanse om manifest-avviket:** planen forventer `897f3599…`, canonical har `631ad900…` etter commit `006986f`. Den committen er fra 3. august — samme identifikator går igjen i health-snapshotnavnet `health.snapshot_set.2026-08-03.006986f7`. Avviket er altså **eldre enn nattsesjonen**. Ingenting brakk i natt; en pre-eksisterende skjevhet ble endelig synlig fordi noen for første gang faktisk kjørte kontrollen. Verdt å ha skrevet ned før noen leter etter en syndebukk.

### S3-D — Bornholm og `src-78`

Sesjon 2 søkte AAU-flater, biblioteksøk og danske studentarkiv uten treff. Det er reelt arbeid. Men én søkerunde er ikke det samme som uttømt: nasjonale repositorier, veilederpublikasjonslister, Google Scholar-siteringer bakover, og direkte forespørsel til institusjonen gjenstår.

Bare det siste krever deg — og først når de andre er prøvd.

---

## 3. Det som faktisk krever deg

Kortere enn lista di:

| # | Beslutning | Merknad |
|---|---|---|
| 1 | **Rettighetsvalg for de to Nord-kildene** | Ekte eierbeslutning, policy §3.3. Omfanget er avgjort — to paneler, begge 3/3 |
| 2 | **Godkjenne kandidatplanen** fra S3-C | Fem minutter når agenten har levert |
| 3 | **De to låste worktreene** | Holdes åpne av en kjørende Apple Virtualization-VM (PID 64562). Avslutt VM-en, så avgjør du |
| 4 | **Ed25519-signaturen** når alt over er lukket | Uendret |

Punkt 3 er ikke engang en beslutning før VM-en er avsluttet — sesjon 2 hadde rett i å ikke røre den.

---

## 4. Prompter

Alle sesjoner startes her:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
```

### S3-A — Panelkjøring på rollene

> **Lim inn:**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/AUTONOMIPOLICY-2026-08-04.md` i sin helhet, `SESJON-2/KALIBRERING-2026-08-04.md` og kontrakten `knowledge/corpus/CORPUS-ROLE-CLASSIFICATION-RECEIPTS-CONTRACT.md`.
>
> **Oppgave:** kjør `ai_panel` på rolleklassifiseringen, slik kalibreringen foreskriver.
>
> For hver identitet i korreksjonssettet fra `NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md` §6: start **tre uavhengige agenter**, hver med kun filstien og skjemaet — ingen av dem får se den opprinnelige triage-posten, prioriteringsrapporten eller hverandres svar. Hver leser kilden fra bunnen.
>
> - Enstemmighet → skriv kvittering med `decidedBy: "ai_panel"` og alle tre stemmene bevart
> - Uenighet → ingen kvittering. Legg identiteten i en eskaleringsliste med alle tre stemmene og hva de er uenige om
> - En kvittering som flytter noe **inn i** `primary_evidence` krever fortsatt enstemmig panel; validatoren skal avvise `decidedBy: "ai"` der
>
> Start med et pilotparti på 25 identiteter, verifiser at kvitteringene validerer, og rapporter enstemmighetsraten før du fortsetter. Er den under 60 %, stopp og rapporter — da er panelkravet ikke nok og terskelen må tenkes om.
>
> Kjør `knowledge:processing-contracts:check` (282/282) før og etter.
>
> **Forbudt:** å skrive til `corpus-role-classification-queue.v1.jsonl` eller noen annen kø, å røre databasen, å flette identiteter.
>
> Rapport til `SESJON-3/RAPPORT-S3-A.md` med enstemmighetsrate, antall kvitteringer skrevet, eskaleringsliste og retningsfordeling etter policyens §2.

### S3-B — Større kalibrering

> **Lim inn:**
>
> Les `AUTONOMIPOLICY-2026-08-04.md` §6 og `SESJON-2/KALIBRERING-2026-08-04.md`.
>
> **Oppgave:** utvid kalibreringen fra n=25 til n=100, med samme metode som den uavhengige v2-kjøringen — som er den eneste gyldige. Blindtesten i samme agentsesjon ga 100 % mot v2-ens 66,7 %; den forskjellen er selve grunnen til at metoden må være genuint uavhengig.
>
> Fast frø, stratifisert på konfidensnivå, hver agent får kun sti og skjema. Ekskluder de 25 fra v2-utvalget så du måler nytt.
>
> Rapporter samsvar per felt og konfidensnivå, konfidensintervall for `high`-`proposedRole`, retningsfordelingen etter policyens §2, og en begrunnet anbefaling: kan `high` brukes autonomt, eller er panel permanent?
>
> Rapport til `SESJON-3/KALIBRERING-N100.md` og `RAPPORT-S3-B.md`. Ingen kø-, register- eller databaseendring.

### S3-C — Kandidatplan for AP-7

> **Lim inn:**
>
> Les `AUTONOMIPOLICY-2026-08-04.md` §3.1, `knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md` i sin helhet, og `SESJON-2/EIERBESLUTNINGER-FOR-LUKKING.md` seksjonen om stale plan-pin.
>
> **Oppgave:** produser en **kandidat** til ny registreringsplan som binder dagens verifiserte manifest, og kjør `--plan-only` mot den. Dette er read-only forberedelse, ikke en beslutning.
>
> 1. Dokumenter først *hvorfor* manifestet endret seg: planen forventer `897f3599…`, canonical har `631ad900…` etter commit `006986f`. Den committen ser ut til å være fra 3. august — bekreft det, og fastslå om avviket er eldre enn nattsesjonen.
> 2. Generer en ny versjonert plan med `scripts/knowledge/generate-source-registration-plan.ts`. **Ikke overskriv** `source-registration-dry-run-plan-2026-08-03.v1.json` — den låste planen skal stå urørt. Ny fil, ny dato.
> 3. Kjør `--plan-only` mot kandidaten med de private røttene fra `.env.local`. Masker stiene som `<privat-rot>` i alt du skriver.
> 4. Diff kandidaten mot den låste planen: hvilke pins endret seg, og hvorfor? Bekreft at målsettet fortsatt er nøyaktig 10 ventende, 0 konflikter, 0 allerede registrerte.
>
> **Forbudt:** `--apply`, signering, databaseskriving, og å overskrive den låste planen.
>
> Leveransen er en kandidat Gabriel godkjenner eller forkaster — ikke en ny låst plan. Si det eksplisitt i rapporten.
>
> Rapport til `SESJON-3/RAPPORT-S3-C.md` og `KANDIDATPLAN-DIFF.md`.

### S3-D — Bornholm og `src-78`

> **Lim inn:**
>
> Les `NATTSESJON-2026-08-04/NOTAT-LOCATORER.md` og `SESJON-2/COMPLETION-AUDIT-2026-08-04.md` for hva som allerede er prøvd.
>
> **Oppgave:** ny søkerunde for de to ubundne identitetene, med andre innfallsvinkler enn sist. Sesjon 2 dekket AAU-flater, biblioteksøk og danske studentarkiv uten treff.
>
> Prøv: nasjonale forskningsrepositorier utenfor institusjonen, veilederes publikasjonslister, siteringssøk bakover fra arbeider som refererer oppgaven, ISBN-/ISSN-registre, og for `src-78` en presis tittelbinding mot Konkurrensverkets publikasjonsserie.
>
> For hvert treff: konfidensvurdering. **Et sannsynlig treff som viser seg feil er verre enn ingen locator** — det ville bundet en identitet til feil kilde. Er du usikker, skriv `usikker` og forklar hva som ville avgjort det.
>
> Finner du ingenting: dokumenter hva som er prøvd, slik at en direkte henvendelse til institusjonen blir siste steg og ikke første. Det er et fullgodt resultat.
>
> Rapport til `SESJON-3/RAPPORT-S3-D.md`. Ingen nedlasting til repoet — anskaffelse er gatet.

---

## 5. Hva som gjenstår etter sesjon 3

| Etter | Status |
|---|---|
| Push | Sesjon 2 sitt arbeid er sikret |
| S3-A | Rollene avgjort av panel, eierkontrollkøen løsnet |
| S3-B | Terskelen målt med et tall som tåler å bli sitert |
| S3-C + din godkjenning | Punkt 3 av 12 lukket |
| S3-D | Locatorene enten funnet eller uttømmende dokumentert |
| Dine rettighetsvalg | 2 av 12 PDF-blokkeringer fjernet |

Da står punkt 4 til 12 igjen — backup-v2, restore-kvittering, clone-rehearsal, autorisasjon, den ene transaksjonen. Etter policyen forberedes de komplett av agenter, og din del er én kommando og én signatur.

---

## 6. En merknad om «blokkert»

Sesjon 2 gjorde riktig i å stoppe der den stoppet. Kalibreringsresultatet *skulle* stenge bulk-porten, og rettighetsvalgene *er* dine.

Men «ingen flere trygge autonome steg» og «ingen flere trygge autonome steg **av denne typen**» er ikke det samme. Et fail-closed-resultat er en rutingbeskjed, ikke en stoppknapp: kalibreringen sa ikke «gi opp», den sa «bruk panel i stedet». Panelet finnes, er testet og er autorisert av policyen.

Verdt å ta med i neste avlevering: be agentene skille eksplisitt mellom *blokkert på eier* og *rutet til en annen mekanisme*. De ser like ut nedenfra, og bare den første er en ekte stopp.
