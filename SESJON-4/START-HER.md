# Sesjon 4 — START HER

**Dette er sesjonen som tar oss fra forberedelse til produksjon.** Eier har godkjent alle fire utestående punkter og låst fire designvalg. Se `SESJON-4/EIERBESLUTNING-2026-08-04.md` — det dokumentet er bindende for alle agenter i denne sesjonen.

Alle sesjoner startes her:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
```

Stoppreglene fra `NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md` §3 og `AUTONOMIPOLICY-2026-08-04.md` gjelder uendret.

---

## Rekkefølge

```
S4-A  de 42        ──┐
S4-B  apply-receipts ├──> S4-E  pilot (én kilde ende-til-ende, tidsmålt)
S4-D  påstandsdef.  ─┘
S4-C  signeringspakke  ──> eiers signatur ──> punkt 6–10
```

S4-A, S4-B, S4-C og S4-D kan kjøre parallelt. S4-E venter på B og D.

---

## S4-A — De 42 gjennom divergerende panel

Panelet i sesjon 3 bekreftet `primary_evidence` for 42 kilder, og 40 av dem overprøver en tidligere anbefaling om nedgradering. Enstemmighetsraten på 74 % stemmer dårlig med 52 % parvis enighet fra kalibreringen — redundante agenter kan være korrelerte.

> **Lim inn:**
>
> Les `AUTONOMIPOLICY-2026-08-04.md`, `SESJON-4/EIERBESLUTNING-2026-08-04.md` og `SESJON-3/ETTERKONTROLL.md` §2.
>
> Hent de 42 kvitteringene fra `knowledge/corpus/corpus-role-classification-receipts.v1.jsonl` der `previousRole == proposedRole == "primary_evidence"`.
>
> For hver: kjør et **divergerende panel** — ikke tre like lesere:
> - **Agent A** instrueres til å bygge den sterkeste saken for at kilden *ikke* er primærevidens
> - **Agent B** instrueres til å bygge den sterkeste saken for at den *er* det
> - **Agent C** dømmer, ser begge argumentene, og har ikke lest kilden på forhånd
>
> Ingen av de tre får se den eksisterende kvitteringen eller nattens triage.
>
> Utfall: bekreftes `primary_evidence`, står kvitteringen. Konkluderer dommeren annerledes, skriv **erstatningskvittering** med `decidedBy: "ai_panel"`, referanse til den den erstatter, og alle tre argumentene bevart. Er dommeren i tvil, eskaler til eier.
>
> Rapporter hvor mange av de 42 som endret utfall. **Det tallet er et mål på hvor mye redundante paneler skjulte** — det er like verdifullt som resultatet.
>
> Til `SESJON-4/RAPPORT-S4-A.md`.

---

## S4-B — `--apply-receipts`

De 214 kvitteringene finnes, men **0 av 214 er markert `resolved` i rollekøen.** Mekanismen skriver, men ingenting anvender.

> **Lim inn:**
>
> Les `knowledge/corpus/CORPUS-ROLE-CLASSIFICATION-RECEIPTS-CONTRACT.md` og `AUTONOMIPOLICY-2026-08-04.md` §5.
>
> Eget worktree:
> ```
> git worktree add ../sesjon4-apply-receipts -b codex/sesjon4-apply-receipts
> cd ../sesjon4-apply-receipts && npm install
> ```
>
> Bygg `--apply-receipts` i `scripts/knowledge/corpus-role-classification-receipts.ts`. Den skal, for hver gyldig kvittering, markere den tilsvarende køraden som løst og skrive den bekreftede rollen.
>
> **Fail-closed-krav:**
> - `queueRowSha256` må matche køraden slik den er nå. Avvik → avvis den kvitteringen, ikke hele kjøringen
> - En kvittering som er erstattet av en nyere (jf. S4-A) skal ikke anvendes
> - Asymmetriregelen håndheves fortsatt: `decidedBy: "ai"` kan ikke flytte noe inn i `primary_evidence`
> - Kjøringen skal være idempotent — to kjøringer gir samme resultat
> - `--dry-run` som standard; `--apply` krever eksplisitt flagg
>
> **Vent med å kjøre den skarpt til S4-A er ferdig** — 42 av de 214 kan bli erstattet.
>
> Tester i `tests/lib/`, databasefrie, som dekker hvert avvisningstilfelle. Kjør `knowledge:processing-contracts:check` (282/282) før og etter.
>
> Til `SESJON-4/RAPPORT-S4-B.md`.

---

## S4-C — Signeringspakken

Punkt 4 i fortsettelsesrekkefølgen, komplett forberedt slik policyens §7 foreskriver: eier kjører én kommando og signerer.

> **Lim inn:**
>
> Les `knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md` i sin helhet, `SESJON-2/GJENNOMGANGSUNDERLAG-S2-C.md` og `SESJON-3/KANDIDATPLAN-DIFF.md`.
>
> Eier har godkjent kandidatplanen. Din oppgave er å produsere alt som må finnes før den kan signeres:
>
> 1. **Fersk metadata-v2-backup** av `foodsystems`
> 2. **Strukturell restore-kvittering v1**
> 3. **Logical-restore companion-kvittering v1** med nestet clone-rehearsal — den fulle 10+10+audit-kjernen kjørt mot en disponibel logisk klone, med bevisst rollback og etterkontroll om at tellingene er tilbake til baseline og alle rader borte
> 4. **Bekreft at kandidatplanen fortsatt validerer** read-only mot samme private røtter og databaseidentitet
> 5. **En sjekkliste for eier** med den eksakte kommandoen han skal kjøre, hva han skal se etter i outputen, og hva som er avbruddskriteriet
>
> **Absolutt:** ingen `--apply`, ingen signering, ingen mutasjon av produksjonsmålet. Rehearsal kjøres kun mot den disponible klonen mens den ennå finnes, og klonen slettes med bevis etterpå.
>
> Kontrakten er utvetydig om at bevisene ikke må være eldre enn 24 timer ved signering. Noter tidsstempler tydelig, og si i rapporten hvor lenge pakken er gyldig.
>
> Til `SESJON-4/RAPPORT-S4-C.md` og `SESJON-4/SIGNERINGSPAKKE-SJEKKLISTE.md`.

---

## S4-D — Hva teller som en siterbar påstand

Eier har bestemt at panel kreves «kun på påstander som skal kunne siteres utad». Uten en presis definisjon er det en regel ingen kan håndheve.

> **Lim inn:**
>
> Les `knowledge/KNOWLEDGE-CONSTITUTION.md`, `knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md`, `.claude/source-attribution-policy.md` og `AUTONOMIPOLICY-2026-08-04.md`.
>
> **Oppgave:** definer, maskinlesbart, hva som utløser panelkravet.
>
> Skillet som skal fanges: «rapporten oppgir 43 % på side 12» er en **referanse** — den kan verifiseres mot kilden av hvem som helst. «43 % av norsk matavfall oppstår i husholdninger» er en **påstand** — den hevder noe om verden og kan siteres videre uten kilden.
>
> Lever:
> - En presis definisjon med grensetilfeller drøftet
> - Et felt i analyseskjemaet som markerer påstandsnivå
> - En validator som avviser en analyse der en påstand er merket siterbar uten panelkvittering
> - 15–20 eksempler fra faktiske triage-poster, klassifisert, som testdata
>
> Dette er den eneste nye designbiten i sesjonen. Gjør den godt — alt analysearbeid etterpå hviler på den.
>
> Til `SESJON-4/PAASTANDSDEFINISJON.md` og `RAPPORT-S4-D.md`.

---

## S4-E — Piloten: én kilde hele veien

Lakmustesten. Kan én kilde gå gjennom hele linjen uten at noe brekker?

> **Lim inn:**
>
> Les `NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md` §2 og §4, `SESJON-4/PAASTANDSDEFINISJON.md` og `knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md`.
>
> **Velg én kilde** fra topp 50 som treffer flere DATAGAP-felt og har god ferskhet. `document:cmp8xyof600k7vvvmc5plwxk6` — SOU 2024:8 Livsmedelsberedskap — er beste kilde i sju av elleve felt og et naturlig valg.
>
> Kjør den gjennom hele linjen: teknisk teksthendelse → identitetsverifisering → KI-analyse etter protokollen → kryssjekk → eierklar pakke. Full dybde, siden den er i topp 50.
>
> **Mål tiden på hvert steg.** Det er hovedleveransen. Alt vi har sagt om omfanget av det gjenstående er anslag til denne målingen finnes.
>
> Noter hvert punkt der linjen krevde manuell inngripen, uklar dokumentasjon eller en beslutning protokollen ikke dekket. **De friksjonspunktene er mer verdifulle enn selve analysen** — de gjentar seg 1 466 ganger hvis de ikke fikses nå.
>
> **Merk:** hendelseslinjen krever 1 565 aktive identiteter og et eksternt betrodd sjekkpunkt. Er ikke registreringen gjennomført ennå, kjør piloten så langt den kommer og dokumenter nøyaktig hvor den stoppes av gaten — det er også et resultat.
>
> Til `SESJON-4/PILOT-MAALING.md` og `RAPPORT-S4-E.md`.

---

## Etter sesjon 4: hvordan skalering blir styrt

Eier har valgt **DATAGAP-styrt omfang** og **lagdelt ambisjon**. Dekningsmatrisen fra nattsesjonen gir rekkefølgen direkte:

| Felt | Kilder | Vurdering fra §3 |
|---|---:|---|
| `kvalitativt_lag` | 75 | Tynnest dekning. Krever aktørkontakt — Type B, gated |
| `offentlig_innkjop` | 85 | Få ferske, sammenlignbare mål på tvers av land |
| `okologi_jordhelse` | 95 | Mange policytekster, få outcome-målinger |
| `alternativt_protein` | 96 | Aktørspor rikt, effekt svakt dokumentert |
| `materialstrommer` | 231 | **Høyt tall, men mest modellert.** Prosjektets største substanshull |

De fire første er tynne i volum. Det femte er tykt i volum og tynt i kvalitet — og er nettopp derfor prioritert i DATAGAP-analysen.

**Rekkefølgen for punkt 12 blir derfor:** materialstrømmer først (størst hull, mest materiale å jobbe med), deretter de fire tynne feltene, deretter resten i prioriteringsrekkefølge.

Lagdelingen etter eiers vedtak:

| Lag | Hvem | Behandling |
|---|---|---|
| 1 | Topp 50 | Full strukturert analyse med etterprøvbare påstander |
| 2 | `core`-poster i de fem feltene over | Nøkkeltall, metode, kildeliste |
| 3 | Resten | Strukturert sammendrag |

---

## Sluttsjekk

- [ ] Ingen databaseskriving, ingen `--apply`, ingen signering
- [ ] `knowledge:processing-contracts:check` fortsatt 282/282
- [ ] Ingen hemmeligheter eller private stier i noen fil
- [ ] Alle worktrees står igjen
- [ ] Kandidatplanen er ikke låst — den er godkjent, ikke signert
- [ ] Rapportene finnes etter malen i nattbriefens §8

**Og en ting til:** når sesjonen rapporterer, skill eksplisitt mellom *blokkert på eier* og *rutet til en annen mekanisme*. De ser like ut nedenfra, og bare den første er en ekte stopp.
